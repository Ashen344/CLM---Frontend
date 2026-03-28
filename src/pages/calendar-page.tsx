import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Loader2,
  ExternalLink,
  Unplug,
} from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import { dashboardApi, calendarApi, contractsApi } from "@/services/api";
import type { DashboardStats, Contract, CalendarEvent } from "@/types";

// ── Helpers ──
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysUntil(dateStr: string) {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function riskBadge(days: number) {
  if (days <= 7) return { color: "text-red-600", bg: "bg-red-50", label: "Urgent" };
  if (days <= 14) return { color: "text-amber-600", bg: "bg-amber-50", label: "Soon" };
  return { color: "text-emerald-600", bg: "bg-emerald-50", label: "On Track" };
}

// ── Google Icon ──
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ── Main Component ──
export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);

  // Google Calendar state
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [syncedContractIds, setSyncedContractIds] = useState<Set<string>>(new Set());
  const [addingReminder, setAddingReminder] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch dashboard stats + contracts
  useEffect(() => {
    dashboardApi.getStats().then((r) => setStats(r.data)).catch(() => {});
    contractsApi
      .list({ per_page: 100 })
      .then((res) => {
        const data = res.data;
        setContracts(data.data || data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingContracts(false));
  }, []);

  // Check Google Calendar connection status
  useEffect(() => {
    calendarApi
      .getStatus()
      .then((res) => {
        setIsGoogleConnected(res.data.connected);
        if (res.data.connected) {
          fetchCalendarEvents();
        }
      })
      .catch(() => {});
  }, []);

  const fetchCalendarEvents = () => {
    calendarApi
      .listEvents({ max_results: 50 })
      .then((res) => {
        const events = Array.isArray(res.data) ? res.data : [];
        setCalendarEvents(events);
        // Track which contract IDs have synced events
        const synced = new Set<string>();
        events.forEach((ev) => {
          if (ev.description?.includes("contract_id:")) {
            const match = ev.description.match(/contract_id:(\w+)/);
            if (match) synced.add(match[1]);
          }
        });
        setSyncedContractIds(synced);
      })
      .catch(() => {});
  };

  // ── Google Calendar connect ──
  const handleConnectGoogle = async () => {
    setConnectingGoogle(true);
    try {
      const res = await calendarApi.getConnectUrl();
      window.location.href = res.data.auth_url;
    } catch {
      showToast("Failed to connect Google Calendar", "error");
      setConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await calendarApi.disconnect();
      setIsGoogleConnected(false);
      setCalendarEvents([]);
      setSyncedContractIds(new Set());
      showToast("Google Calendar disconnected", "info");
    } catch {
      showToast("Failed to disconnect", "error");
    }
  };

  // ── Add/Remove reminder ──
  const handleToggleReminder = async (contract: Contract) => {
    if (!isGoogleConnected) {
      showToast("Please connect Google Calendar first", "error");
      return;
    }

    setAddingReminder(contract._id);
    const isSynced = syncedContractIds.has(contract._id);

    try {
      if (isSynced) {
        // Find and delete the calendar event
        const event = calendarEvents.find(
          (ev) => ev.description?.includes(`contract_id:${contract._id}`)
        );
        if (event) {
          await calendarApi.deleteEvent(event.id);
        }
        setSyncedContractIds((prev) => {
          const next = new Set(prev);
          next.delete(contract._id);
          return next;
        });
        showToast("Reminder removed from Google Calendar");
      } else {
        // Create a calendar event for the contract expiry
        await calendarApi.createEvent({
          summary: `Contract Expiry: ${contract.title}`,
          description: `Contract "${contract.title}" is expiring.\n\nParties: ${contract.parties?.map((p) => p.name).join(", ") || "N/A"}\nType: ${contract.contract_type.replace(/_/g, " ")}\n\ncontract_id:${contract._id}`,
          start: { date: contract.end_date },
          end: { date: contract.end_date },
          contract_id: contract._id,
        });
        setSyncedContractIds((prev) => new Set(prev).add(contract._id));
        showToast("Reminder added to Google Calendar!");
      }
      fetchCalendarEvents();
    } catch {
      showToast("Failed to update reminder", "error");
    } finally {
      setAddingReminder(null);
    }
  };

  // ── Calendar grid logic ──
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(today.getDate());
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  // Get contracts that expire on a given day
  const getContractsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return contracts.filter((c) => c.end_date?.startsWith(dateStr));
  };

  // Upcoming contracts sorted by end date
  const upcomingContracts = [...contracts]
    .filter((c) => daysUntil(c.end_date) > 0 && daysUntil(c.end_date) <= 90)
    .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());

  const selectedContracts = selectedDay ? getContractsForDay(selectedDay) : [];

  return (
    <AppLayout title="Calendar & Reminders">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-[20px] font-bold text-[#0d503c]">
            <Calendar size={22} className="text-[#17a369]" />
            Calendar & Reminders
          </h2>
          <p className="mt-1 text-[13px] text-[#64748b]">
            Manage contract deadlines and sync reminders with Google Calendar
          </p>
        </div>

        <button
          onClick={isGoogleConnected ? handleDisconnectGoogle : handleConnectGoogle}
          disabled={connectingGoogle}
          className={`flex items-center gap-2.5 rounded-[10px] border-[1.5px] px-5 py-2.5 text-[13px] font-semibold transition shadow-sm hover:shadow-md ${
            isGoogleConnected
              ? "border-[#17a369] bg-[#e6f7ef] text-[#0d503c]"
              : "border-[#dadce0] bg-white text-[#1e293b] hover:border-[#bbb]"
          } disabled:opacity-50`}
        >
          {isGoogleConnected ? (
            <>
              <CheckCircle2 size={16} className="text-[#17a369]" />
              Google Calendar Connected
            </>
          ) : (
            <>
              <GoogleIcon />
              {connectingGoogle ? "Connecting..." : "Connect Google Calendar"}
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-[1fr_380px] gap-6 items-start">
        {/* Calendar Card */}
        <div className="soft-card overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-6 py-5">
            <span className="text-[17px] font-bold text-[#1e293b]">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={goToToday}
                className="mr-2 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#64748b] hover:bg-[#f1f5f9] transition"
              >
                Today
              </button>
              <button
                onClick={prevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f1f5f9] transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f1f5f9] transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-4">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-px bg-[#e2e8f0] px-4 pb-4">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className="aspect-square bg-[#f8fafc]" />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayContracts = getContractsForDay(day);
              const hasContracts = dayContracts.length > 0;
              const isTodayCell = isToday(day);
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] text-[14px] font-medium transition-all ${
                    isSelected
                      ? "bg-[#0d503c] text-white"
                      : isTodayCell
                      ? "bg-[#e6f7ef] text-[#0d503c] ring-2 ring-[#17a369]"
                      : "bg-white text-[#1e293b] hover:bg-[#f1f5f9]"
                  } ${hasContracts ? "font-bold" : ""}`}
                >
                  {day}
                  {hasContracts && (
                    <div className="flex gap-0.5">
                      {dayContracts.slice(0, 3).map((c) => {
                        const days = daysUntil(c.end_date);
                        const dotColor =
                          days <= 7
                            ? isSelected ? "bg-white" : "bg-red-500"
                            : days <= 14
                            ? isSelected ? "bg-white" : "bg-amber-500"
                            : isSelected ? "bg-white" : "bg-emerald-500";
                        return (
                          <div key={c._id} className={`h-[5px] w-[5px] rounded-full ${dotColor}`} />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 border-t border-[#f1f5f9] px-6 py-3 text-[12px] text-[#64748b]">
            <span className="flex items-center gap-1.5">
              <div className="h-[6px] w-[6px] rounded-full bg-red-500" /> Expiring &lt;7 days
            </span>
            <span className="flex items-center gap-1.5">
              <div className="h-[6px] w-[6px] rounded-full bg-amber-500" /> Expiring &lt;14 days
            </span>
            <span className="flex items-center gap-1.5">
              <div className="h-[6px] w-[6px] rounded-full bg-emerald-500" /> On Track
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Selected day detail */}
          {selectedDay && (
            <div className="soft-card overflow-hidden animate-in fade-in duration-200">
              <div className="px-5 pt-5 text-[14px] font-bold text-[#1e293b]">
                {MONTHS[currentMonth]} {selectedDay}, {currentYear}
              </div>
              {selectedContracts.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-[#64748b]">
                  No contracts expiring on this date
                </div>
              ) : (
                <div>
                  {selectedContracts.map((c) => (
                    <ContractRow
                      key={c._id}
                      contract={c}
                      isSynced={syncedContractIds.has(c._id)}
                      isGoogleConnected={isGoogleConnected}
                      addingReminder={addingReminder}
                      onToggleReminder={handleToggleReminder}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming deadlines */}
          <div className="soft-card overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5">
              <span className="text-[14px] font-bold text-[#1e293b]">
                Upcoming Deadlines
              </span>
              <span className="rounded-md bg-[#0d503c] px-2 py-0.5 text-[11px] font-semibold text-white">
                {upcomingContracts.length}
              </span>
            </div>

            {loadingContracts ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin text-[#64748b]" />
              </div>
            ) : upcomingContracts.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[#64748b]">
                No upcoming deadlines
              </div>
            ) : (
              <div>
                {upcomingContracts.slice(0, 8).map((c) => (
                  <ContractRow
                    key={c._id}
                    contract={c}
                    isSynced={syncedContractIds.has(c._id)}
                    isGoogleConnected={isGoogleConnected}
                    addingReminder={addingReminder}
                    onToggleReminder={handleToggleReminder}
                    showDaysLeft
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="soft-card p-3 text-center">
              <div className="text-[18px] font-bold text-red-600">{stats?.expiring_soon ?? 0}</div>
              <div className="text-[10px] font-medium text-red-600">Expiring Soon</div>
            </div>
            <div className="soft-card p-3 text-center">
              <div className="text-[18px] font-bold text-amber-600">{stats?.pending_approvals ?? 0}</div>
              <div className="text-[10px] font-medium text-amber-600">Pending Approval</div>
            </div>
            <div className="soft-card p-3 text-center">
              <div className="text-[18px] font-bold text-blue-600">{stats?.active_contracts ?? 0}</div>
              <div className="text-[10px] font-medium text-blue-600">Active</div>
            </div>
            <div className="soft-card p-3 text-center">
              <div className="text-[18px] font-bold text-emerald-600">{stats?.total_contracts ?? 0}</div>
              <div className="text-[10px] font-medium text-emerald-600">Total</div>
            </div>
          </div>

          {/* Google Calendar not connected prompt */}
          {!isGoogleConnected && (
            <div className="soft-card overflow-hidden bg-gradient-to-br from-blue-50 to-white p-5">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-blue-500" />
                <span className="text-[13px] font-bold text-[#1e293b]">
                  Calendar Not Connected
                </span>
              </div>
              <p className="text-[12px] leading-5 text-[#64748b]">
                Connect your Google Calendar to receive automatic reminders before
                contracts expire. You'll get notifications before each deadline.
              </p>
              <button
                onClick={handleConnectGoogle}
                disabled={connectingGoogle}
                className="mt-3 flex items-center gap-2 rounded-lg bg-[#0d503c] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#0a4030] transition disabled:opacity-50"
              >
                <GoogleIcon />
                Connect Now
              </button>
            </div>
          )}

          {/* Disconnect option */}
          {isGoogleConnected && (
            <button
              onClick={handleDisconnectGoogle}
              className="flex items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] py-2.5 text-[12px] text-[#64748b] hover:bg-[#f1f5f9] hover:text-red-500 transition"
            >
              <Unplug size={14} />
              Disconnect Google Calendar
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-5 py-3 text-[13px] font-semibold text-white shadow-lg animate-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "error"
              ? "bg-red-500"
              : toast.type === "info"
              ? "bg-blue-500"
              : "bg-[#0d503c]"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 size={16} />}
          {toast.type === "error" && <AlertTriangle size={16} />}
          {toast.message}
        </div>
      )}
    </AppLayout>
  );
}

// ── Contract Row Component ──
function ContractRow({
  contract,
  isSynced,
  isGoogleConnected,
  addingReminder,
  onToggleReminder,
  showDaysLeft = false,
}: {
  contract: Contract;
  isSynced: boolean;
  isGoogleConnected: boolean;
  addingReminder: string | null;
  onToggleReminder: (contract: Contract) => void;
  showDaysLeft?: boolean;
}) {
  const days = daysUntil(contract.end_date);
  const isAdding = addingReminder === contract._id;
  const badge = riskBadge(days);

  return (
    <div className="flex items-start gap-3 border-b border-[#f1f5f9] px-5 py-3.5 transition hover:bg-[#f8fafc]">
      {/* Risk dot */}
      <div
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          days <= 7 ? "bg-red-500" : days <= 14 ? "bg-amber-500" : "bg-emerald-500"
        }`}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[#1e293b] truncate">
          {contract.title}
        </div>
        <div className="mt-0.5 text-[11px] text-[#64748b]">
          {contract.parties?.[0]?.name || contract.contract_type.replace(/_/g, " ")} &middot;{" "}
          {formatDate(contract.end_date)}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {showDaysLeft && days <= 30 && (
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.color}`}>
              {days <= 0 ? "Expired" : `${days}d left`}
            </span>
          )}
          {isSynced && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#e6f7ef] px-2 py-0.5 text-[10px] font-semibold text-[#0d503c]">
              <Bell size={10} /> Synced
            </span>
          )}
        </div>
      </div>

      {/* Reminder button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleReminder(contract);
        }}
        disabled={isAdding}
        title={
          !isGoogleConnected
            ? "Connect Google Calendar first"
            : isSynced
            ? "Remove from Google Calendar"
            : "Add to Google Calendar"
        }
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
          isSynced
            ? "bg-[#e6f7ef] text-[#0d503c] hover:bg-[#d1f0e0]"
            : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
        } ${!isGoogleConnected ? "opacity-40 cursor-not-allowed" : ""} disabled:opacity-50`}
      >
        {isAdding ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isSynced ? (
          <Bell size={14} />
        ) : (
          <BellOff size={14} />
        )}
      </button>
    </div>
  );
}

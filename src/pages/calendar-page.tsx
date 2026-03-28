import { useState, useEffect, useCallback, type CSSProperties } from "react";
import AppLayout from "@/components/layout/app-layout";
import { dashboardApi, calendarApi, contractsApi } from "@/services/api";
import type { DashboardStats, Contract, CalendarEvent } from "@/types";

// ─── Palette & Tokens ────────────────────────────────────────────────
const BRAND = {
  forest: "#0d503c",
  emerald: "#17a369",
  mint: "#e6f7ef",
  slate: "#1e293b",
  muted: "#64748b",
  faint: "#f1f5f9",
  white: "#ffffff",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
};

// ─── Helpers ──────────────────────────────────────────────────────────
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function daysUntil(dateStr: string) {
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function riskColor(level: string) {
  if (level === "high") return BRAND.red;
  if (level === "medium") return BRAND.amber;
  return BRAND.emerald;
}

function riskLevel(days: number): string {
  if (days <= 7) return "high";
  if (days <= 14) return "medium";
  return "low";
}

// ─── Icons (inline SVG) ──────────────────────────────────────────────
function CalendarIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BellIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CheckCircle({ size = 18, color = BRAND.emerald }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AlertTriangleIcon({ size = 16, color = BRAND.amber }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100%",
    background: `linear-gradient(135deg, ${BRAND.faint} 0%, ${BRAND.white} 50%, ${BRAND.mint}22 100%)`,
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    color: BRAND.slate,
    padding: "0",
  } as CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    flexWrap: "wrap" as const,
    gap: 16,
  } as CSSProperties,
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: BRAND.forest,
    margin: 0,
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  } as CSSProperties,
  subtitle: {
    fontSize: 14,
    color: BRAND.muted,
    marginTop: 4,
  } as CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: 24,
    alignItems: "start",
  } as CSSProperties,
  card: {
    background: BRAND.white,
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    overflow: "hidden",
  } as CSSProperties,
  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 16px",
  } as CSSProperties,
  monthTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: BRAND.slate,
  } as CSSProperties,
  navBtns: {
    display: "flex",
    gap: 4,
    alignItems: "center",
  } as CSSProperties,
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: BRAND.white,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: BRAND.muted,
    transition: "all 0.15s",
  } as CSSProperties,
  todayBtn: {
    padding: "5px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: BRAND.white,
    fontSize: 12,
    fontWeight: 600,
    color: BRAND.muted,
    cursor: "pointer",
    marginRight: 8,
  } as CSSProperties,
  dayHeader: {
    fontSize: 11,
    fontWeight: 700,
    color: BRAND.muted,
    textAlign: "center" as const,
    padding: "8px 0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  } as CSSProperties,
  dayCell: {
    aspectRatio: "1",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: 10,
    transition: "all 0.15s",
    position: "relative" as const,
    fontSize: 14,
    fontWeight: 500,
    gap: 3,
  } as CSSProperties,
  sidebar: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 20,
  } as CSSProperties,
  sidebarTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: BRAND.slate,
    padding: "18px 20px 0",
  } as CSSProperties,
  contractItem: {
    padding: "14px 20px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    transition: "background 0.15s",
    cursor: "default",
  } as CSSProperties,
  dot: (color: string) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    marginTop: 6,
    flexShrink: 0,
  }) as CSSProperties,
  contractTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: BRAND.slate,
    lineHeight: 1.3,
  } as CSSProperties,
  contractMeta: {
    fontSize: 12,
    color: BRAND.muted,
    marginTop: 2,
  } as CSSProperties,
  reminderBtn: {
    marginLeft: "auto",
    flexShrink: 0,
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  } as CSSProperties,
  badge: (bg: string, color: string) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 6,
    background: bg,
    color: color,
    marginTop: 4,
  }) as CSSProperties,
  toast: (type: string) => ({
    position: "fixed" as const,
    bottom: 24,
    right: 24,
    padding: "12px 20px",
    borderRadius: 12,
    background: type === "error" ? BRAND.red : type === "info" ? BRAND.blue : BRAND.forest,
    color: BRAND.white,
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    zIndex: 999,
    animation: "slideUp 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 8,
  }) as CSSProperties,
  emptyState: {
    padding: "32px 20px",
    textAlign: "center" as const,
    color: BRAND.muted,
    fontSize: 13,
  } as CSSProperties,
  dotIndicator: {
    display: "flex",
    gap: 2,
    marginTop: 1,
  } as CSSProperties,
  miniDot: (color: string) => ({
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: color,
  }) as CSSProperties,
};

// ─── Main Component ──────────────────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  // Google Calendar state
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [syncedContractIds, setSyncedContractIds] = useState<Set<string>>(new Set());
  const [addingReminder, setAddingReminder] = useState<string | null>(null);

  const showToast = useCallback((message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch contracts
  useEffect(() => {
    contractsApi
      .list({ per_page: 100 })
      .then((res) => {
        const data = res.data;
        setContracts(data.data || data || []);
      })
      .catch(() => {});
  }, []);

  // Check Google Calendar connection
  useEffect(() => {
    calendarApi
      .getStatus()
      .then((res) => {
        setIsGoogleConnected(res.data.connected);
        if (res.data.connected) fetchCalendarEvents();
      })
      .catch(() => {});
  }, []);

  const fetchCalendarEvents = () => {
    calendarApi
      .listEvents({ max_results: 50 })
      .then((res) => {
        const events = Array.isArray(res.data) ? res.data : [];
        setCalendarEvents(events);
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
        const event = calendarEvents.find(
          (ev) => ev.description?.includes(`contract_id:${contract._id}`)
        );
        if (event) await calendarApi.deleteEvent(event.id);
        setSyncedContractIds((prev) => {
          const next = new Set(prev);
          next.delete(contract._id);
          return next;
        });
        showToast("Reminder removed from Google Calendar");
      } else {
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
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

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

  // Get contracts that expire on a given day
  const getContractsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return contracts.filter((c) => c.end_date?.startsWith(dateStr));
  };

  const selectedContracts = selectedDay ? getContractsForDay(selectedDay) : [];

  const upcomingContracts = [...contracts]
    .filter((c) => daysUntil(c.end_date) > 0)
    .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());

  const isTodayCell = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  // Google button style
  const googleBtnStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 20px",
    borderRadius: 10,
    border: `1.5px solid ${isGoogleConnected ? BRAND.emerald : "#dadce0"}`,
    background: isGoogleConnected ? BRAND.mint : BRAND.white,
    color: isGoogleConnected ? BRAND.forest : BRAND.slate,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };

  return (
    <AppLayout title="Calendar & Reminders">
      <div style={s.page}>
        {/* Global animation styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700&display=swap');
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>
              <CalendarIcon size={26} color={BRAND.emerald} />
              Calendar & Reminders
            </h1>
            <p style={s.subtitle}>
              Manage contract deadlines and sync reminders with Google Calendar
            </p>
          </div>

          {/* Google Calendar Connection Button */}
          <button
            style={googleBtnStyle}
            onClick={isGoogleConnected ? handleDisconnectGoogle : handleConnectGoogle}
            disabled={connectingGoogle}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 3px 12px rgba(0,0,0,0.1)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {isGoogleConnected ? (
              <>
                <CheckCircle size={18} />
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
        <div style={s.grid}>
          {/* Calendar Card */}
          <div style={s.card}>
            <div style={s.calendarHeader}>
              <span style={s.monthTitle}>
                {MONTHS[currentMonth]} {currentYear}
              </span>
              <div style={s.navBtns}>
                <button style={s.todayBtn} onClick={goToToday}>
                  Today
                </button>
                <button style={s.navBtn} onClick={prevMonth}>
                  <ChevronLeftIcon />
                </button>
                <button style={s.navBtn} onClick={nextMonth}>
                  <ChevronRightIcon />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                padding: "0 16px",
              }}
            >
              {DAYS.map((d) => (
                <div key={d} style={s.dayHeader}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                padding: "4px 16px 16px",
                gap: 2,
              }}
            >
              {/* Empty cells for offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} style={s.dayCell} />
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayContracts = getContractsForDay(day);
                const hasContracts = dayContracts.length > 0;
                const isToday = isTodayCell(day);
                const isSelected = selectedDay === day;

                return (
                  <div
                    key={day}
                    style={{
                      ...s.dayCell,
                      background: isSelected
                        ? BRAND.forest
                        : isToday
                        ? BRAND.mint
                        : "transparent",
                      color: isSelected
                        ? BRAND.white
                        : isToday
                        ? BRAND.forest
                        : BRAND.slate,
                      fontWeight: isToday || hasContracts ? 700 : 500,
                      border: isToday && !isSelected
                        ? `2px solid ${BRAND.emerald}`
                        : "2px solid transparent",
                    }}
                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.background = BRAND.faint;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.background = isSelected
                          ? BRAND.forest
                          : isToday
                          ? BRAND.mint
                          : "transparent";
                      }
                    }}
                  >
                    {day}
                    {hasContracts && (
                      <div style={s.dotIndicator}>
                        {dayContracts.slice(0, 3).map((c) => (
                          <div
                            key={c._id}
                            style={s.miniDot(
                              isSelected ? BRAND.white : riskColor(riskLevel(daysUntil(c.end_date)))
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: 20,
                padding: "12px 24px 18px",
                borderTop: "1px solid #f1f5f9",
                fontSize: 12,
                color: BRAND.muted,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={s.miniDot(BRAND.red)} /> High Risk
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={s.miniDot(BRAND.amber)} /> Medium Risk
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={s.miniDot(BRAND.emerald)} /> Low Risk
              </span>
            </div>
          </div>

          {/* Sidebar */}
          <div style={s.sidebar}>
            {/* Selected day detail */}
            {selectedDay && (
              <div style={{ ...s.card, animation: "fadeIn 0.2s ease" }}>
                <div style={s.sidebarTitle}>
                  {MONTHS[currentMonth]} {selectedDay}, {currentYear}
                </div>
                {selectedContracts.length === 0 ? (
                  <div style={s.emptyState}>
                    No contracts expiring on this date
                  </div>
                ) : (
                  selectedContracts.map((c) => (
                    <ContractRow
                      key={c._id}
                      contract={c}
                      isSynced={syncedContractIds.has(c._id)}
                      isGoogleConnected={isGoogleConnected}
                      addingReminder={addingReminder}
                      onToggleReminder={handleToggleReminder}
                    />
                  ))
                )}
              </div>
            )}

            {/* Upcoming contracts */}
            <div style={s.card}>
              <div
                style={{
                  ...s.sidebarTitle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Upcoming Deadlines</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: BRAND.white,
                    background: BRAND.forest,
                    borderRadius: 6,
                    padding: "2px 8px",
                  }}
                >
                  {upcomingContracts.length}
                </span>
              </div>
              {upcomingContracts.length === 0 ? (
                <div style={s.emptyState}>No upcoming deadlines</div>
              ) : (
                upcomingContracts.slice(0, 8).map((c) => (
                  <ContractRow
                    key={c._id}
                    contract={c}
                    isSynced={syncedContractIds.has(c._id)}
                    isGoogleConnected={isGoogleConnected}
                    addingReminder={addingReminder}
                    onToggleReminder={handleToggleReminder}
                    showDaysLeft
                  />
                ))
              )}
            </div>

            {/* Google Calendar status card */}
            {!isGoogleConnected && (
              <div
                style={{
                  ...s.card,
                  background: `linear-gradient(135deg, #eff6ff 0%, ${BRAND.white} 100%)`,
                  padding: 20,
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <AlertTriangleIcon size={18} color={BRAND.blue} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.slate }}>
                    Calendar Not Connected
                  </span>
                </div>
                <p style={{ fontSize: 13, color: BRAND.muted, margin: 0, lineHeight: 1.5 }}>
                  Connect your Google Calendar to receive automatic reminders
                  before contracts expire. You'll get notifications 7 days and 2
                  days before each deadline.
                </p>
                <button
                  onClick={handleConnectGoogle}
                  style={{
                    marginTop: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: BRAND.forest,
                    color: BRAND.white,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <GoogleIcon /> Connect Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toast notification */}
        {toast && (
          <div style={s.toast(toast.type)}>
            {toast.type === "success" && <CheckCircle size={16} color={BRAND.white} />}
            {toast.message}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ─── Contract Row Sub-component ──────────────────────────────────────
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
  const level = riskLevel(days);
  const isAdding = addingReminder === contract._id;

  return (
    <div
      style={s.contractItem}
      onMouseOver={(e) => ((e.currentTarget as HTMLDivElement).style.background = BRAND.faint)}
      onMouseOut={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
    >
      <div style={s.dot(riskColor(level))} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={s.contractTitle}>{contract.title}</div>
        <div style={s.contractMeta}>
          {contract.parties?.[0]?.name || contract.contract_type.replace(/_/g, " ")} ·{" "}
          {formatDate(contract.end_date)}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
          {showDaysLeft && days <= 14 && (
            <span style={s.badge("#fef2f2", BRAND.red)}>
              {days <= 0 ? "Expired" : `${days}d left`}
            </span>
          )}
          {isSynced && (
            <span style={s.badge(BRAND.mint, BRAND.forest)}>
              <BellIcon size={11} color={BRAND.forest} /> Synced
            </span>
          )}
        </div>
      </div>

      {/* Reminder toggle button */}
      <button
        style={{
          ...s.reminderBtn,
          background: isSynced ? BRAND.mint : BRAND.faint,
          color: isSynced ? BRAND.forest : BRAND.muted,
          opacity: !isGoogleConnected ? 0.4 : 1,
        }}
        title={
          !isGoogleConnected
            ? "Connect Google Calendar first"
            : isSynced
            ? "Remove from Google Calendar"
            : "Add to Google Calendar"
        }
        onClick={() => onToggleReminder(contract)}
        disabled={isAdding}
      >
        {isAdding ? (
          <span style={{ fontSize: 12 }}>...</span>
        ) : (
          <BellIcon size={16} color={isSynced ? BRAND.forest : BRAND.muted} />
        )}
      </button>
    </div>
  );
}

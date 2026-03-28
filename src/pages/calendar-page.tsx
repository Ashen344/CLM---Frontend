import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Filter,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/app-layout";
import { dashboardApi } from "@/services/api";
import type { DashboardStats } from "@/types";

type EventType = "expiration" | "renewal" | "approval" | "milestone" | "review";

interface ContractEvent {
  id: string;
  title: string;
  contractName: string;
  type: EventType;
  time?: string;
  priority?: "high" | "medium" | "low";
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: ContractEvent[];
}

interface EventConfig {
  color: string;
  bgColor: string;
  icon: React.ElementType;
  label: string;
}

const eventTypeConfig: Record<EventType, EventConfig> = {
  expiration: {
    color: "text-red-600",
    bgColor: "bg-red-50 border-l-red-500",
    icon: AlertTriangle,
    label: "Expiration",
  },
  renewal: {
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-l-blue-500",
    icon: RefreshCw,
    label: "Renewal",
  },
  approval: {
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-l-amber-500",
    icon: Clock,
    label: "Approval Due",
  },
  milestone: {
    color: "text-green-600",
    bgColor: "bg-green-50 border-l-green-500",
    icon: CheckCircle2,
    label: "Milestone",
  },
  review: {
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-l-purple-500",
    icon: FileText,
    label: "Review",
  },
};

const contractEvents: Record<string, ContractEvent[]> = {
  "2026-03-21": [
    {
      id: "1",
      title: "Contract Expiring",
      contractName: "Vendor Agreement - Acme Corp",
      type: "expiration",
      priority: "high",
    },
    {
      id: "2",
      title: "Approval Required",
      contractName: "NDA - TechStart Inc",
      type: "approval",
      time: "2:00 PM",
      priority: "medium",
    },
  ],
  "2026-03-24": [
    {
      id: "3",
      title: "Renewal Due",
      contractName: "SaaS License - CloudPro",
      type: "renewal",
      priority: "high",
    },
  ],
  "2026-03-25": [
    {
      id: "4",
      title: "Quarterly Review",
      contractName: "Service Agreement - DataFlow",
      type: "review",
      time: "10:00 AM",
    },
  ],
  "2026-03-27": [
    {
      id: "5",
      title: "Payment Milestone",
      contractName: "Construction Contract - BuildRight",
      type: "milestone",
    },
  ],
  "2026-03-28": [
    {
      id: "6",
      title: "Contract Expiring",
      contractName: "Lease Agreement - Office Space",
      type: "expiration",
      priority: "high",
    },
    {
      id: "7",
      title: "Final Approval",
      contractName: "Partnership Agreement - GlobalTech",
      type: "approval",
      time: "4:00 PM",
      priority: "high",
    },
  ],
  "2026-04-01": [
    {
      id: "8",
      title: "Auto-Renewal",
      contractName: "Software License - DevTools",
      type: "renewal",
    },
  ],
  "2026-04-05": [
    {
      id: "9",
      title: "Compliance Review",
      contractName: "GDPR Data Agreement",
      type: "review",
      time: "9:00 AM",
      priority: "high",
    },
  ],
  "2026-04-10": [
    {
      id: "10",
      title: "Delivery Milestone",
      contractName: "Product Supply Agreement",
      type: "milestone",
    },
  ],
  "2026-04-15": [
    {
      id: "11",
      title: "Contract Expiring",
      contractName: "Maintenance Contract - IT Support",
      type: "expiration",
      priority: "medium",
    },
  ],
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function generateCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const today = new Date();
  const days: CalendarDay[] = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false,
      events: [],
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isToday =
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year;

    days.push({
      day,
      isCurrentMonth: true,
      isToday,
      events: contractEvents[dateStr] || [],
    });
  }

  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      events: [],
    });
  }

  return days;
}

function getUpcomingEvents(year: number, month: number): ContractEvent[] {
  const events: ContractEvent[] = [];
  Object.entries(contractEvents).forEach(([date, dayEvents]) => {
    const eventDate = new Date(date);
    if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
      events.push(...dayEvents);
    }
  });
  return events.slice(0, 6);
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<EventType | "all">("all");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardApi.getStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = generateCalendarDays(year, month);
  const upcomingEvents = getUpcomingEvents(year, month);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const filteredDays = days.map((day) => ({
    ...day,
    events:
      selectedFilter === "all"
        ? day.events
        : day.events.filter((e) => e.type === selectedFilter),
  }));

  return (
    <AppLayout title="Contract Calendar">
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-[#1a1a2e]">
                {months[month]} {year}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="rounded-lg p-2 hover:bg-[#f0f0f5] transition-colors"
                >
                  <ChevronLeft size={18} className="text-[#6b6b80]" />
                </button>
                <button
                  onClick={() => navigateMonth("next")}
                  className="rounded-lg p-2 hover:bg-[#f0f0f5] transition-colors"
                >
                  <ChevronRight size={18} className="text-[#6b6b80]" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="ml-2 rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#6b6b80] hover:bg-[#f0f0f5] transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#8b8b97]" />
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                    selectedFilter === "all"
                      ? "bg-[#1a1a2e] text-white"
                      : "bg-[#f0f0f5] text-[#6b6b80] hover:bg-[#e5e5eb]"
                  }`}
                >
                  All
                </button>
                {Object.entries(eventTypeConfig).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedFilter(type as EventType)}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                      selectedFilter === type
                        ? "bg-[#1a1a2e] text-white"
                        : "bg-[#f0f0f5] text-[#6b6b80] hover:bg-[#e5e5eb]"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="soft-card overflow-hidden">
            <div className="grid grid-cols-7 border-b border-[#e8e8ed]">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-[12px] font-medium text-[#8b8b97]"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {filteredDays.map((cell, index) => {
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] border-b border-r border-[#e8e8ed] p-2 cursor-pointer transition-colors hover:bg-[#fafafa] ${
                      !cell.isCurrentMonth ? "bg-[#fafafa]" : "bg-white"
                    } ${cell.isToday ? "ring-2 ring-inset ring-blue-500" : ""}`}
                  >
                    <div
                      className={`mb-1 text-[12px] font-medium ${
                        cell.isToday
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white"
                          : cell.isCurrentMonth
                          ? "text-[#1a1a2e]"
                          : "text-[#c0c0c8]"
                      }`}
                    >
                      {cell.day}
                    </div>

                    <div className="space-y-1">
                      {cell.events.slice(0, 2).map((event) => {
                        const config = eventTypeConfig[event.type];
                        const Icon = config.icon;
                        return (
                          <div
                            key={event.id}
                            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] border-l-2 ${config.bgColor}`}
                          >
                            <Icon size={10} className={config.color} />
                            <span className="truncate font-medium text-[#3a3a4a]">
                              {event.contractName.split(" - ")[1] || event.contractName}
                            </span>
                          </div>
                        );
                      })}
                      {cell.events.length > 2 && (
                        <div className="text-[9px] text-[#8b8b97] pl-1">
                          +{cell.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6">
            {Object.entries(eventTypeConfig).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <Icon size={12} className={config.color} />
                  <span className="text-[11px] text-[#6b6b80]">{config.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-[300px]">
          <div className="soft-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#1a1a2e]">
                Upcoming Events
              </h3>
              <button className="flex items-center gap-1 rounded-lg bg-[#1a1a2e] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#2a2a3e] transition-colors">
                <Plus size={12} />
                Add Event
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const config = eventTypeConfig[event.type];
                const Icon = config.icon;
                return (
                  <div
                    key={event.id}
                    className={`rounded-lg border-l-[3px] p-3 ${config.bgColor} cursor-pointer hover:shadow-sm transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={config.color} />
                        <span className={`text-[11px] font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      {event.priority === "high" && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-medium text-red-600">
                          High Priority
                        </span>
                      )}
                    </div>
                    <h4 className="mt-2 text-[12px] font-medium text-[#1a1a2e]">
                      {event.contractName}
                    </h4>
                    <p className="mt-0.5 text-[11px] text-[#6b6b80]">{event.title}</p>
                    {event.time && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-[#8b8b97]">
                        <Clock size={10} />
                        {event.time}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <div className="text-[18px] font-bold text-red-600">{stats?.expiring_soon ?? 0}</div>
                <div className="text-[10px] text-red-600">Expiring Soon</div>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center">
                <div className="text-[18px] font-bold text-amber-600">{stats?.pending_approvals ?? 0}</div>
                <div className="text-[10px] text-amber-600">Pending Approval</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <div className="text-[18px] font-bold text-blue-600">{stats?.active_contracts ?? 0}</div>
                <div className="text-[10px] text-blue-600">Active</div>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <div className="text-[18px] font-bold text-green-600">{stats?.total_contracts ?? 0}</div>
                <div className="text-[10px] text-green-600">Total</div>
              </div>
            </div>
          </div>

          <div className="soft-card mt-4 p-4">
            <h3 className="mb-3 text-[14px] font-semibold text-[#1a1a2e]">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button onClick={() => navigate("/contracts?status=expired")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#3a3a4a] hover:bg-[#f5f5f8] transition-colors">
                <AlertTriangle size={16} className="text-red-500" />
                View Expiring Contracts
              </button>
              <button onClick={() => navigate("/contracts?status=active")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#3a3a4a] hover:bg-[#f5f5f8] transition-colors">
                <Clock size={16} className="text-amber-500" />
                Pending Approvals
              </button>
              <button onClick={() => navigate("/contracts?status=renewed")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#3a3a4a] hover:bg-[#f5f5f8] transition-colors">
                <RefreshCw size={16} className="text-blue-500" />
                Upcoming Renewals
              </button>
              <button onClick={() => navigate("/contracts/new")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] text-[#3a3a4a] hover:bg-[#f5f5f8] transition-colors">
                <FileText size={16} className="text-purple-500" />
                Create New Contract
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
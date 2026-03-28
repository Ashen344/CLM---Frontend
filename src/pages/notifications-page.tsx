import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/app-layout";
import { notificationsApi } from "@/services/api";
import type { Notification } from "@/types";
import {
  Bell,
  CheckCheck,
  FileText,
  AlertTriangle,
  Clock,
  RefreshCw,
  Info,
  Loader2,
} from "lucide-react";

const typeIcons: Record<string, typeof Bell> = {
  approval_required: Clock,
  approval_decision: CheckCheck,
  contract_expiring: AlertTriangle,
  obligation_due: FileText,
  workflow_update: RefreshCw,
  status_change: Info,
  escalation: AlertTriangle,
  system: Bell,
};

const typeColors: Record<string, string> = {
  approval_required: "text-amber-500 bg-amber-50",
  approval_decision: "text-green-500 bg-green-50",
  contract_expiring: "text-red-500 bg-red-50",
  obligation_due: "text-blue-500 bg-blue-50",
  workflow_update: "text-purple-500 bg-purple-50",
  status_change: "text-sky-500 bg-sky-50",
  escalation: "text-red-500 bg-red-50",
  system: "text-gray-500 bg-gray-50",
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = () => {
    setLoading(true);
    notificationsApi
      .list({ unread: filter === "unread" ? true : undefined, per_page: 50 })
      .then((res) => {
        const data = res.data;
        setNotifications(data.data || data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {});
    fetchNotifications();
  };

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
    <AppLayout title="Notifications">
      <div className="soft-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
                filter === "all"
                  ? "bg-[#1b1840] text-white"
                  : "text-[#7e7e8d] hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
                filter === "unread"
                  ? "bg-[#1b1840] text-white"
                  : "text-[#7e7e8d] hover:bg-gray-100"
              }`}
            >
              Unread
            </button>
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[12px] text-[#1b1840] hover:underline"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[#9999a4]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-[#9999a4]">
              No notifications
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const Icon = typeIcons[n.notification_type] || Bell;
                const colors =
                  typeColors[n.notification_type] || typeColors.system;

                return (
                  <button
                    key={n._id}
                    onClick={() => {
                      markRead(n._id);
                      if (n.contract_id) {
                        navigate(`/contracts/${n.contract_id}`);
                      }
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl p-4 text-left transition ${
                      n.is_read
                        ? "bg-white hover:bg-gray-50"
                        : "bg-blue-50/30 hover:bg-blue-50/50"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors}`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-[13px] ${
                            n.is_read
                              ? "text-[#4d4d58]"
                              : "font-medium text-[#1b1840]"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="ml-2 shrink-0 text-[10px] text-[#9999a4]">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#7e7e8d] truncate">
                        {n.message}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

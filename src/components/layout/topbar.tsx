import { Bell, ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { notificationsApi } from "@/services/api";

type TopbarProps = {
  title: string;
};

export default function Topbar({ title }: TopbarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    notificationsApi
      .getUnreadCount()
      .then((res) => setUnreadCount(res.data?.count ?? 0))
      .catch(() => {});
  }, []);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "U";

  return (
    <div className="flex items-start justify-between px-6 py-5">
      <h2 className="text-[22px] font-medium text-[#5f5f66]">{title}</h2>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/notifications")}
          className="relative rounded-lg p-2 hover:bg-gray-100 transition"
        >
          <Bell size={18} className="text-[#7b7b86]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3"
          >
            <div className="text-right leading-tight">
              <p className="text-[12px] font-medium text-[#2b2b38]">
                {user?.fullName || "User"}
              </p>
              <p className="text-[11px] text-[#8a8a96]">
                {user?.primaryEmailAddress?.emailAddress || ""}
              </p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <ChevronDown size={16} className="text-[#7b7b86]" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border border-[#e9e9ee] bg-white p-2 shadow-lg">
              <button
                onClick={() => {
                  signOut();
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

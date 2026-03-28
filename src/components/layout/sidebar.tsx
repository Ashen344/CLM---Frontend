import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  ListTodo,
  PlusSquare,
  Bell,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { contractsApi } from "@/services/api";
import type { Contract } from "@/types";

const mainLinks = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Contracts", to: "/contracts", icon: ListTodo },
  { label: "Templates", to: "/templates", icon: FileText },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Members", to: "/dashboard", icon: Users },
  { label: "Settings", to: "/dashboard", icon: Settings },
];

const contractColors = [
  "bg-lime-400",
  "bg-yellow-400",
  "bg-violet-300",
  "bg-blue-400",
  "bg-pink-400",
  "bg-orange-400",
];

export default function Sidebar() {
  const [recentContracts, setRecentContracts] = useState<Contract[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    contractsApi
      .list({ per_page: 5, page: 1 })
      .then((res) => {
        const contracts = res.data?.data || res.data || [];
        setRecentContracts(Array.isArray(contracts) ? contracts : []);
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="w-[220px] shrink-0 border-r border-[#e9e9ee] bg-[#f7f7f8] px-4 py-5 flex flex-col">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1b1840]">Clause</h1>

        <nav className="mt-6 space-y-2">
          {mainLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition ${
                    isActive
                      ? "sidebar-link-active bg-white"
                      : "sidebar-link hover:bg-white/70"
                  }`
                }
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[#8d8d9b]">
            <span>My Contracts</span>
            <button onClick={() => navigate("/contracts/new")}>
              <PlusSquare size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {recentContracts.length > 0
              ? recentContracts.map((c, i) => (
                  <button
                    key={c._id}
                    onClick={() => navigate(`/contracts/${c._id}`)}
                    className="flex w-full items-center gap-3 text-[12px] text-[#6b6b79] hover:text-[#1b1840] transition"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        contractColors[i % contractColors.length]
                      }`}
                    />
                    <span className="truncate">{c.title}</span>
                  </button>
                ))
              : [
                  { name: "No contracts yet", color: "bg-gray-300" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 text-[12px] text-[#6b6b79]"
                  >
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span>{item.name}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl bg-[#f2f2f3] p-4 text-center">
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#f5d84b] text-white">
            <span className="text-lg leading-none">•</span>
          </div>
          <h3 className="text-[13px] font-semibold text-[#26233f]">
            Thoughts Time
          </h3>
          <p className="mt-2 text-[10px] leading-4 text-[#8a8a96]">
            We don't have any notice for you, till then you can share your
            thoughts with your peers.
          </p>
          <button className="mt-3 text-[12px] font-semibold text-[#1b1840]">
            Write a message
          </button>
        </div>
      </div>
    </aside>
  );
}

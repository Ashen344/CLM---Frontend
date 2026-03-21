import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  ListTodo,
  PlusSquare,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const mainLinks = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Tasks", to: "/contracts", icon: ListTodo },
  { label: "Templates", to: "/templates", icon: FileText },
  { label: "Members", to: "/dashboard", icon: Users },
  { label: "Settings", to: "/dashboard", icon: Settings },
];

const contracts = [
  { name: "Website Redesign", color: "bg-lime-400" },
  { name: "Website Redesign", color: "bg-yellow-400" },
  { name: "Design System", color: "bg-violet-300" },
  { name: "Wireframes", color: "bg-blue-400" },
];

export default function Sidebar() {
  return (
    <aside className="w-[220px] border-r border-[#e9e9ee] bg-[#f7f7f8] px-4 py-5 flex flex-col">
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
                    isActive ? "sidebar-link-active bg-white" : "sidebar-link hover:bg-white/70"
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
            <PlusSquare size={12} />
          </div>

          <div className="space-y-3">
            {contracts.map((item) => (
              <div key={item.name + item.color} className="flex items-center gap-3 text-[12px] text-[#6b6b79]">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-[#f2f2f3] p-4 text-center">
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#f5d84b] text-white">
          <span className="text-lg leading-none">•</span>
        </div>
        <h3 className="text-[13px] font-semibold text-[#26233f]">Thoughts Time</h3>
        <p className="mt-2 text-[10px] leading-4 text-[#8a8a96]">
          We don't have any notice for you, till then you can share your thoughts with your peers.
        </p>
        <button className="mt-3 text-[12px] font-semibold text-[#1b1840]">Write a message</button>
      </div>
    </aside>
  );
}
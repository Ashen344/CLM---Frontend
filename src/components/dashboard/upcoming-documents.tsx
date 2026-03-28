import type { Contract } from "@/types";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  draft: "bg-gray-400",
  active: "bg-green-400",
  expired: "bg-red-400",
  terminated: "bg-orange-400",
  renewed: "bg-blue-400",
};

type Props = {
  contracts?: Contract[];
  recentActivity?: Contract[];
};

export default function UpcomingDocuments({ contracts = [], recentActivity = [] }: Props) {
  const navigate = useNavigate();
  const expiring = contracts.slice(0, 5);
  const recent = recentActivity.slice(0, 5);

  return (
    <div className="soft-card p-4">
      <h3 className="text-[13px] font-semibold text-[#2a2a35]">
        Expiring Soon & Recent Activity
      </h3>

      {expiring.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#8d8d9b]">
            Expiring Soon
          </p>
          <div className="rounded-2xl bg-[#f7f7f8] p-3 space-y-2">
            {expiring.map((c) => (
              <button
                key={c._id}
                onClick={() => navigate(`/contracts/${c._id}`)}
                className="flex w-full items-center gap-3 text-[11px] text-[#70707e] hover:text-[#1b1840] transition"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full bg-red-400`} />
                <span className="truncate">{c.title}</span>
                <span className="ml-auto text-[10px] text-[#9999a4]">
                  {new Date(c.end_date).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#8d8d9b]">
          Recent Activity
        </p>
        <div className="rounded-2xl bg-[#f7f7f8] p-3 space-y-2">
          {recent.length > 0 ? (
            recent.map((c) => (
              <button
                key={c._id}
                onClick={() => navigate(`/contracts/${c._id}`)}
                className="flex w-full items-center gap-3 text-[11px] text-[#70707e] hover:text-[#1b1840] transition"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    statusColors[c.status] || "bg-gray-400"
                  }`}
                />
                <span className="truncate">{c.title}</span>
                <span className="ml-auto text-[10px] text-[#9999a4] capitalize">
                  {c.status}
                </span>
              </button>
            ))
          ) : (
            <p className="text-[11px] text-[#9999a4]">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

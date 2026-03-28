import type { ChartDataItem } from "@/types";

type Props = {
  monthlyStats?: ChartDataItem[];
};

const barColors = [
  "bg-[#8d8df1]",
  "bg-[#8ad9cc]",
  "bg-[#1b1840]",
  "bg-[#7faef5]",
  "bg-[#afc8ef]",
  "bg-[#86d6a2]",
  "bg-[#8d8df1]",
  "bg-[#8ad9cc]",
  "bg-[#1b1840]",
  "bg-[#7faef5]",
  "bg-[#afc8ef]",
  "bg-[#86d6a2]",
];

const monthLabels = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function ApprovalsChart({ monthlyStats = [] }: Props) {
  const maxVal = Math.max(...monthlyStats.map((m) => m.count), 1);

  // Build month data - fill in all 12 months
  const months = monthLabels.map((label, i) => {
    const monthNum = String(i + 1);
    const stat = monthlyStats.find((m) => m._id === monthNum || m._id === label);
    return {
      month: label,
      count: stat?.count ?? 0,
      color: barColors[i],
    };
  });

  return (
    <div className="soft-card p-4">
      <h3 className="text-[13px] font-semibold text-[#2a2a35]">
        Monthly Contract Activity
      </h3>

      <div className="mt-5">
        <div className="mb-4 flex justify-between text-[10px] text-[#9a9aa6]">
          <span>{maxVal}</span>
          <span></span>
        </div>

        <div className="flex items-end justify-between gap-3">
          {months.map((item) => {
            const heightPct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
            const minH = item.count > 0 ? 8 : 4;
            return (
              <div
                key={item.month}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`w-4 rounded-md ${item.color} transition-all`}
                  style={{ height: `${Math.max(heightPct * 0.8, minH)}px` }}
                  title={`${item.count} contracts`}
                />
                <span className="text-[10px] text-[#8a8a96]">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

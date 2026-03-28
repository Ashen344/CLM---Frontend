import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { ChartDataItem } from "@/types";

type Props = {
  riskSummary?: { high: number; medium: number; low: number };
  byStatus?: ChartDataItem[];
};

const statusColors: Record<string, string> = {
  draft: "#9999a4",
  active: "#31c46c",
  expired: "#ff5b5b",
  terminated: "#f4a13d",
  renewed: "#1d6fff",
};

const riskColors = {
  high: "#ff5b5b",
  medium: "#f4d13d",
  low: "#31c46c",
};

export default function AiAnalysisCard({ riskSummary, byStatus = [] }: Props) {
  const hasRisk =
    riskSummary && (riskSummary.high + riskSummary.medium + riskSummary.low > 0);

  const riskData = hasRisk
    ? [
        { name: "High Risk", value: riskSummary.high, color: riskColors.high },
        { name: "Medium Risk", value: riskSummary.medium, color: riskColors.medium },
        { name: "Low Risk", value: riskSummary.low, color: riskColors.low },
      ].filter((d) => d.value > 0)
    : [];

  const statusData = byStatus.map((item) => ({
    name: item._id,
    value: item.count,
    color: statusColors[item._id] || "#9999a4",
  }));

  const chartData = riskData.length > 0 ? riskData : statusData;
  const chartTitle = riskData.length > 0 ? "Risk Overview" : "Contracts by Status";

  if (chartData.length === 0) {
    return (
      <div className="soft-card p-4">
        <h3 className="text-[13px] font-semibold text-[#2a2a35]">
          Contract Analytics
        </h3>
        <p className="mt-4 text-[12px] text-[#9999a4]">
          No data available yet. Create contracts to see analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="soft-card p-4">
      <h3 className="text-[13px] font-semibold text-[#2a2a35]">{chartTitle}</h3>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-[150px] w-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={28}
                outerRadius={52}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 text-[11px] text-[#52525f]">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="capitalize">{item.name}</span>
              </div>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

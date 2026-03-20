import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const data = [
  { name: "Contract Faults", value: 52.1, color: "#ff5b5b" },
  { name: "Typos", value: 22.8, color: "#1d6fff" },
  { name: "Contract Conflicts", value: 13.9, color: "#31c46c" },
  { name: "Other", value: 11.2, color: "#f4d13d" },
];

export default function AiAnalysisCard() {
  return (
    <div className="soft-card p-4">
      <h3 className="text-[13px] font-semibold text-[#2a2a35]">
        AI Analysis - SLA Document_233232
      </h3>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-[150px] w-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={28}
                outerRadius={52}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 text-[11px] text-[#52525f]">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
              <span>{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const months = [
  { month: "Jan", height: "h-10", color: "bg-[#8d8df1]" },
  { month: "Feb", height: "h-16", color: "bg-[#8ad9cc]" },
  { month: "Mar", height: "h-12", color: "bg-black" },
  { month: "Apr", height: "h-16", color: "bg-[#7faef5]" },
  { month: "May", height: "h-8", color: "bg-[#afc8ef]" },
  { month: "Jun", height: "h-14", color: "bg-[#86d6a2]" },
  { month: "Jul", height: "h-10", color: "bg-[#8d8df1]" },
  { month: "Aug", height: "h-16", color: "bg-[#8ad9cc]" },
  { month: "Sep", height: "h-12", color: "bg-black" },
  { month: "Oct", height: "h-18", color: "bg-[#7faef5]" },
  { month: "Nov", height: "h-8", color: "bg-[#afc8ef]" },
  { month: "Dec", height: "h-14", color: "bg-[#86d6a2]" },
];

export default function ApprovalsChart() {
  return (
    <div className="soft-card p-4">
      <h3 className="text-[13px] font-semibold text-[#2a2a35]">Monthly Contract Approvals</h3>

      <div className="mt-5">
        <div className="mb-4 flex justify-between text-[10px] text-[#9a9aa6]">
          <span>30K</span>
          <span></span>
        </div>

        <div className="flex items-end justify-between gap-3">
          {months.map((item) => (
            <div key={item.month} className="flex flex-col items-center gap-2">
              <div className={`w-4 rounded-md ${item.height} ${item.color}`} />
              <span className="text-[10px] text-[#8a8a96]">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
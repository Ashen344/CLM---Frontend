type StatCardProps = {
  title: string;
  value: string;
  change?: string;
  bgClass?: string;
};

export default function StatCard({
  title,
  value,
  change,
  bgClass = "stat-soft",
}: StatCardProps) {
  return (
    <div className={`rounded-2xl px-5 py-4 ${bgClass}`}>
      <p className="text-[11px] text-[#626270]">{title}</p>
      <div className="mt-3 flex items-center gap-3">
        <h3 className="text-[31px] font-semibold leading-none text-[#232042]">
          {value}
        </h3>
        {change && (
          <span className="text-[10px] text-[#4b4b57]">{change} ↗</span>
        )}
      </div>
    </div>
  );
}

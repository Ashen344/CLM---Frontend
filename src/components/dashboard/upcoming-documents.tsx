const items = [
  { text: "Make online reservation and have the gift ready", color: "bg-yellow-400" },
  { text: "Make an appointment with my doctor", color: "bg-green-400" },
  { text: "Paper due this Friday", color: "bg-orange-400" },
  { text: "Presentation due this Thursday", color: "bg-pink-400" },
  { text: "Project due next Monday", color: "bg-violet-400" },
];

export default function UpcomingDocuments() {
  return (
    <div className="soft-card p-4">
      <h3 className="text-[13px] font-semibold text-[#2a2a35]">Upcoming and Due Documents</h3>

      <div className="mt-4 rounded-2xl bg-[#f7f7f8] p-3">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-[11px] text-[#70707e]">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
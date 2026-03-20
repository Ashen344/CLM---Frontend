import AppLayout from "@/components/layout/app-layout";

const weekDays = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

const cells = [
  { day: 1, note: "Adjust yearly holiday", bg: "bg-[#dff2ea]" },
  { day: 2, note: "Orthodox Easter", bg: "bg-[#dff2ea]" },
  { day: 3, note: "", bg: "" },
  { day: 4, note: "", bg: "" },
  { day: 5, note: "Cinco de Mayo", bg: "bg-[#dff2ea]" },
  { day: 6, note: "", bg: "" },
  { day: 7, note: "", bg: "" },
  { day: 8, note: "", bg: "" },
  { day: 9, note: "Mother's Day", bg: "bg-[#dff2ea]" },
  { day: 10, note: "", bg: "" },
  { day: 11, note: "", bg: "" },
  { day: 12, note: "Eid al-Fitr", bg: "bg-[#dff2ea]" },
  { day: 13, note: "", bg: "" },
  { day: 14, note: "", bg: "" },
  { day: 15, note: "", bg: "" },
  { day: 16, note: "", bg: "" },
  { day: 17, note: "Tax Day", bg: "bg-[#f7dddd]" },
  { day: 18, note: "", bg: "" },
  { day: 19, note: "", bg: "" },
  { day: 20, note: "", bg: "" },
  { day: 21, note: "", bg: "" },
  { day: 22, note: "", bg: "" },
  { day: 23, note: "", bg: "" },
  { day: 24, note: "", bg: "" },
  { day: 25, note: "", bg: "" },
  { day: 26, note: "", bg: "" },
  { day: 27, note: "", bg: "bg-[#dcecfb]" },
  { day: 28, note: "", bg: "bg-[#dcecfb]" },
  { day: 29, note: "", bg: "bg-[#dcecfb]" },
  { day: 30, note: "Beach day 🏖️🌊☀️", bg: "bg-[#dcecfb]" },
  { day: 31, note: "Memorial Day", bg: "bg-[#dff2ea]" },
];

export default function CalendarPage() {
  return (
    <AppLayout title="Calendar">
      <div className="rounded-2xl bg-[#f7f7f8]">
        <div className="grid grid-cols-7 border-b border-[#e3e3e8]">
          {weekDays.map((day) => (
            <div key={day} className="py-3 text-center text-[12px] text-[#8b8b97]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-l border-t border-[#e3e3e8]">
          {cells.map((cell) => (
            <div
              key={cell.day}
              className={`calendar-cell border-b border-r border-[#e3e3e8] p-2 text-[11px] ${cell.bg}`}
            >
              <div className="text-[#696977]">{cell.day}</div>
              {cell.note && <div className="mt-3 text-[9px] text-[#8a8a96]">{cell.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
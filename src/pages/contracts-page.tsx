import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "@/components/layout/app-layout";

const rows = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  title: "Bold text column",
  col2: "Regular text column",
  col3: "Regular text column",
  col4: "Regular text column",
  status: i > 6 ? "Inactive" : "Active",
  checked: i < 6,
}));

export default function ContractsPage() {
  return (
    <AppLayout title="all current contracts">
      <div className="soft-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[#252535]">Headline</h3>
            <p className="mt-1 text-[11px] text-[#8a8a96]">
              Label text for value
            </p>
            <p className="mt-1 text-[11px] text-[#9b9ba6]">
              A descriptive body text comes here
            </p>
          </div>

          <div className="flex items-center gap-3 text-[12px]">
            <button className="text-[#4d4d58]">Delete</button>
            <button className="text-[#4d4d58]">Filters</button>
            <button className="rounded-lg border border-[#dfe2e8] px-4 py-2 text-[#4d4d58]">
              Export
            </button>
            <button className="rounded-lg bg-[#1877f2] px-4 py-2 font-medium text-white">
              Add new CTA
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="text-[11px] text-[#9999a4]">
                <th className="px-2 py-2"><Checkbox /></th>
                <th className="px-2 py-2">Column heading</th>
                <th className="px-2 py-2">Column heading</th>
                <th className="px-2 py-2">Column heading</th>
                <th className="px-2 py-2">Column heading</th>
                <th className="px-2 py-2">Column heading</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="bg-white text-[12px] text-[#3d3d48]">
                  <td className="rounded-l-xl px-2 py-3">
                    <Checkbox checked={row.checked} />
                  </td>
                  <td className="px-2 py-3 font-semibold">{row.title}</td>
                  <td className="px-2 py-3 text-[#7e7e8d]">{row.col2}</td>
                  <td className="px-2 py-3 text-[#7e7e8d]">{row.col3}</td>
                  <td className="px-2 py-3">
                    <Badge
                      className={
                        row.status === "Active"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-200"
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="rounded-r-xl px-2 py-3 text-[#7e7e8d]">{row.col4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
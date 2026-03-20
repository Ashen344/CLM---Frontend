import { Menu, Search } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import TemplateCard from "@/components/templates/template-card";

const labels = ["Label", "Label", "Label", "Label", "Label"];

export default function TemplatesPage() {
  return (
    <AppLayout title="Contract template">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-11 w-[320px] items-center gap-3 rounded-full bg-[#f0eaf7] px-4">
          <Menu size={16} className="text-[#6d6d79]" />
          <input
            placeholder="Hinted search text"
            className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#8d8d9b]"
          />
          <Search size={15} className="text-[#6d6d79]" />
        </div>

        <div className="flex items-center gap-2">
          {labels.map((label, index) => (
            <button
              key={`${label}-${index}`}
              className="rounded-full border border-[#d8d8de] bg-white px-3 py-1 text-[10px] text-[#737381]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-y-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <TemplateCard key={i} />
        ))}
      </div>
    </AppLayout>
  );
}
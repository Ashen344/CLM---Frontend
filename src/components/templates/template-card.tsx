import { FileText, Trash2 } from "lucide-react";
import type { Template } from "@/types";
import { templatesApi } from "@/services/api";
import { Badge } from "@/components/ui/badge";

type Props = {
  template: Template;
  onDelete?: () => void;
};

export default function TemplateCard({ template, onDelete }: Props) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete template "${template.name}"?`)) return;
    await templatesApi.delete(template._id).catch(() => {});
    onDelete?.();
  };

  return (
    <div className="soft-card overflow-hidden transition hover:shadow-md">
      <div className="flex h-[120px] items-center justify-center bg-[#f0eaf7]">
        <FileText size={32} className="text-[#9b9cb0]" strokeWidth={1.5} />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-[13px] font-semibold text-[#2a2a35]">
              {template.name}
            </h4>
            {template.description && (
              <p className="mt-1 truncate text-[11px] text-[#7e7e8d]">
                {template.description}
              </p>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="ml-2 shrink-0 rounded p-1 text-[#9999a4] hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge className="bg-[#f0eaf7] text-[#6d6d79] hover:bg-[#f0eaf7] text-[10px]">
            {template.contract_type.replace(/_/g, " ")}
          </Badge>
          <span className="text-[10px] text-[#9999a4]">v{template.version}</span>
        </div>

        {template.tags && template.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] text-[#7e7e8d]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

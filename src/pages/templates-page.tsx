import { useEffect, useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import TemplateCard from "@/components/templates/template-card";
import CreateTemplateModal from "@/components/templates/create-template-modal";
import { templatesApi } from "@/services/api";
import type { Template, ContractType } from "@/types";

const typeFilters: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "service_agreement", label: "Service Agreement" },
  { value: "nda", label: "NDA" },
  { value: "employment", label: "Employment" },
  { value: "vendor", label: "Vendor" },
  { value: "licensing", label: "Licensing" },
  { value: "partnership", label: "Partnership" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchTemplates = () => {
    setLoading(true);
    templatesApi
      .list({
        search: search || undefined,
        contract_type: typeFilter || undefined,
      })
      .then((res) => {
        const data = res.data;
        setTemplates(data.data || data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
  }, [typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  return (
    <AppLayout title="Contract Templates">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <form
            onSubmit={handleSearch}
            className="flex h-11 w-[320px] items-center gap-3 rounded-full bg-[#f0eaf7] px-4"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#8d8d9b]"
            />
            <button type="submit">
              <Search size={15} className="text-[#6d6d79]" />
            </button>
          </form>

          <div className="flex items-center gap-2">
            {typeFilters.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`rounded-full border px-3 py-1 text-[10px] transition ${
                  typeFilter === t.value
                    ? "border-[#1b1840] bg-[#1b1840] text-white"
                    : "border-[#d8d8de] bg-white text-[#737381] hover:border-[#9999a4]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 rounded-lg bg-[#1b1840] px-4 py-2 text-[12px] font-medium text-white"
        >
          <Plus size={14} />
          New Template
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#9999a4]" />
        </div>
      ) : templates.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[13px] text-[#9999a4]">No templates found</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 text-[13px] font-medium text-[#1b1840] hover:underline"
          >
            Create your first template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {templates.map((t) => (
            <TemplateCard key={t._id} template={t} onDelete={fetchTemplates} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTemplateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchTemplates();
          }}
        />
      )}
    </AppLayout>
  );
}

import { useState } from "react";
import { X } from "lucide-react";
import { templatesApi } from "@/services/api";
import type { ContractType } from "@/types";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

const contractTypes: { value: ContractType; label: string }[] = [
  { value: "service_agreement", label: "Service Agreement" },
  { value: "nda", label: "NDA" },
  { value: "employment", label: "Employment" },
  { value: "vendor", label: "Vendor" },
  { value: "licensing", label: "Licensing" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

export default function CreateTemplateModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contractType, setContractType] =
    useState<ContractType>("service_agreement");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setError("Name and content are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await templatesApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        contract_type: contractType,
        content: content.trim(),
        tags: tags
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
      });
      onCreated();
    } catch {
      setError("Failed to create template.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#1b1840]">
            Create Template
          </h3>
          <button onClick={onClose} className="text-[#9999a4] hover:text-[#4d4d58]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-[12px] text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
                Template Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none"
                placeholder="e.g. Standard NDA"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
                Contract Type *
              </label>
              <select
                value={contractType}
                onChange={(e) =>
                  setContractType(e.target.value as ContractType)
                }
                className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none"
              >
                {contractTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none"
              placeholder="Brief description..."
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
              Template Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none resize-none font-mono"
              placeholder="Enter contract template content (HTML or Markdown)..."
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
              Tags (comma separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none"
              placeholder="e.g. standard, legal"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#dfe2e8] px-5 py-2 text-[13px] text-[#4d4d58]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#1b1840] px-5 py-2 text-[13px] font-medium text-white disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

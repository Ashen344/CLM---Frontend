import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/app-layout";
import { contractsApi, workflowsApi } from "@/services/api";
import type { ContractType, ApprovalType, ContractParty } from "@/types";
import { Plus, Trash2 } from "lucide-react";

const contractTypes: { value: ContractType; label: string }[] = [
  { value: "service_agreement", label: "Service Agreement" },
  { value: "nda", label: "NDA" },
  { value: "employment", label: "Employment" },
  { value: "vendor", label: "Vendor" },
  { value: "licensing", label: "Licensing" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

const approvalTypes: { value: ApprovalType; label: string }[] = [
  { value: "majority", label: "Majority Vote" },
  { value: "first_person", label: "First Person Decides" },
  { value: "all_required", label: "All Must Approve" },
];

const emptyParty: ContractParty = { name: "", role: "", email: "", organization: "" };

export default function CreateContractPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [contractType, setContractType] = useState<ContractType>("service_agreement");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [value, setValue] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [approvalType, setApprovalType] = useState<ApprovalType>("majority");
  const [parties, setParties] = useState<ContractParty[]>([{ ...emptyParty }]);
  const [tags, setTags] = useState("");

  const addParty = () => setParties([...parties, { ...emptyParty }]);
  const removeParty = (i: number) =>
    setParties(parties.filter((_, idx) => idx !== i));
  const updateParty = (i: number, field: keyof ContractParty, val: string) => {
    const updated = [...parties];
    updated[i] = { ...updated[i], [field]: val };
    setParties(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      setError("Title, start date, and end date are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await contractsApi.create({
        title: title.trim(),
        contract_type: contractType,
        description: description.trim() || undefined,
        parties: parties.filter((p) => p.name.trim()),
        start_date: startDate,
        end_date: endDate,
        value: value ? Number(value) : undefined,
        payment_terms: paymentTerms.trim() || undefined,
        approval_type: approvalType,
        tags: tags
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
      });
      const contract = res.data;
      // Auto-create workflow
      await workflowsApi.create(contract._id).catch(() => {});
      navigate(`/contracts/${contract._id}`);
    } catch {
      setError("Failed to create contract. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Create New Contract">
      <div className="soft-card mx-auto max-w-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
                Contract Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none focus:border-[#1b1840]"
                placeholder="e.g. Design Services Agreement"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
                Type *
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none"
              >
                {contractTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
                Approval Type
              </label>
              <select
                value={approvalType}
                onChange={(e) => setApprovalType(e.target.value as ApprovalType)}
                className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none"
              >
                {approvalTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
                Contract Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none"
                placeholder="0.00"
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
                placeholder="e.g. legal, urgent"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none resize-none"
                placeholder="Brief description of the contract..."
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-[12px] font-medium text-[#4d4d58]">
                Payment Terms
              </label>
              <input
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[13px] outline-none"
                placeholder="e.g. Net 30"
              />
            </div>
          </div>

          {/* Parties */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-[12px] font-medium text-[#4d4d58]">
                Contract Parties
              </label>
              <button
                type="button"
                onClick={addParty}
                className="flex items-center gap-1 text-[12px] text-[#1b1840] hover:underline"
              >
                <Plus size={12} /> Add Party
              </button>
            </div>

            <div className="space-y-3">
              {parties.map((party, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border border-[#eee] p-3"
                >
                  <input
                    value={party.name}
                    onChange={(e) => updateParty(i, "name", e.target.value)}
                    placeholder="Name"
                    className="flex-1 rounded border border-[#dfe2e8] px-2 py-1.5 text-[12px] outline-none"
                  />
                  <input
                    value={party.role}
                    onChange={(e) => updateParty(i, "role", e.target.value)}
                    placeholder="Role"
                    className="w-28 rounded border border-[#dfe2e8] px-2 py-1.5 text-[12px] outline-none"
                  />
                  <input
                    value={party.email}
                    onChange={(e) => updateParty(i, "email", e.target.value)}
                    placeholder="Email"
                    className="flex-1 rounded border border-[#dfe2e8] px-2 py-1.5 text-[12px] outline-none"
                  />
                  <input
                    value={party.organization || ""}
                    onChange={(e) =>
                      updateParty(i, "organization", e.target.value)
                    }
                    placeholder="Organization"
                    className="w-32 rounded border border-[#dfe2e8] px-2 py-1.5 text-[12px] outline-none"
                  />
                  {parties.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParty(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/contracts")}
              className="rounded-lg border border-[#dfe2e8] px-5 py-2 text-[13px] text-[#4d4d58]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#1b1840] px-5 py-2 text-[13px] font-medium text-white disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Contract"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

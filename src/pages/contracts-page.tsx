import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "@/components/layout/app-layout";
import { contractsApi } from "@/services/api";
import type { Contract, ContractStatus, ContractType } from "@/types";
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

const statusBadge: Record<ContractStatus, string> = {
  active: "bg-green-100 text-green-700 hover:bg-green-100",
  draft: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  expired: "bg-red-100 text-red-700 hover:bg-red-100",
  terminated: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  renewed: "bg-blue-100 text-blue-700 hover:bg-blue-100",
};

const typeLabels: Record<ContractType, string> = {
  service_agreement: "Service Agreement",
  nda: "NDA",
  employment: "Employment",
  vendor: "Vendor",
  licensing: "Licensing",
  partnership: "Partnership",
  other: "Other",
};

export default function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchContracts = () => {
    setLoading(true);
    contractsApi
      .list({
        search: search || undefined,
        status: statusFilter || undefined,
        contract_type: typeFilter || undefined,
        page,
        per_page: 15,
      })
      .then((res) => {
        const data = res.data;
        setContracts(data.data || data || []);
        setTotalPages(data.total_pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContracts();
  }, [page, statusFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContracts();
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} contract(s)?`)) return;
    for (const id of selected) {
      await contractsApi.delete(id).catch(() => {});
    }
    setSelected(new Set());
    fetchContracts();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AppLayout title="All Contracts">
      <div className="soft-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[#252535]">
              Contracts
            </h3>
            <p className="mt-1 text-[11px] text-[#8a8a96]">
              Manage and track all your contracts
            </p>
          </div>

          <div className="flex items-center gap-3 text-[12px]">
            {selected.size > 0 && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
                Delete ({selected.size})
              </button>
            )}

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-[#dfe2e8] bg-white px-3 py-2 text-[12px] text-[#4d4d58]"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
                <option value="renewed">Renewed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-[#dfe2e8] bg-white px-3 py-2 text-[12px] text-[#4d4d58]"
              >
                <option value="">All Types</option>
                {Object.entries(typeLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <button className="flex items-center gap-1 rounded-lg border border-[#dfe2e8] px-4 py-2 text-[#4d4d58]">
              <Download size={14} />
              Export
            </button>
            <button
              onClick={() => navigate("/contracts/new")}
              className="flex items-center gap-1 rounded-lg bg-[#1b1840] px-4 py-2 font-medium text-white"
            >
              <Plus size={14} />
              New Contract
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-4">
          <div className="flex h-10 w-full max-w-md items-center gap-2 rounded-lg border border-[#dfe2e8] bg-white px-3">
            <Search size={14} className="text-[#9999a4]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contracts..."
              className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#9999a4]"
            />
          </div>
        </form>

        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-[13px] text-[#9999a4]">
              Loading contracts...
            </div>
          ) : contracts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13px] text-[#9999a4]">No contracts found</p>
              <button
                onClick={() => navigate("/contracts/new")}
                className="mt-3 text-[13px] font-medium text-[#1b1840] hover:underline"
              >
                Create your first contract
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-[11px] text-[#9999a4]">
                  <th className="px-2 py-2 w-8">
                    <Checkbox />
                  </th>
                  <th className="px-2 py-2">Title</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Parties</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Stage</th>
                  <th className="px-2 py-2">End Date</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr
                    key={c._id}
                    className="cursor-pointer bg-white text-[12px] text-[#3d3d48] hover:bg-gray-50 transition"
                    onClick={() => navigate(`/contracts/${c._id}`)}
                  >
                    <td
                      className="rounded-l-xl px-2 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selected.has(c._id)}
                        onCheckedChange={() => toggleSelect(c._id)}
                      />
                    </td>
                    <td className="px-2 py-3 font-semibold">{c.title}</td>
                    <td className="px-2 py-3 text-[#7e7e8d] capitalize">
                      {typeLabels[c.contract_type] || c.contract_type}
                    </td>
                    <td className="px-2 py-3 text-[#7e7e8d]">
                      {c.parties?.map((p) => p.name).join(", ") || "—"}
                    </td>
                    <td className="px-2 py-3">
                      <Badge className={statusBadge[c.status] || statusBadge.draft}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-2 py-3 text-[#7e7e8d] capitalize">
                      {c.workflow_stage?.replace(/_/g, " ") || "—"}
                    </td>
                    <td className="rounded-r-xl px-2 py-3 text-[#7e7e8d]">
                      {c.end_date
                        ? new Date(c.end_date).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-[#dfe2e8] p-2 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[12px] text-[#7e7e8d]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-[#dfe2e8] p-2 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

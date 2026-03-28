import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/app-layout";
import WorkflowTimeline from "@/components/workflow/workflow-timeline";
import AiAnalysisPanel from "@/components/ai/ai-analysis-panel";
import { contractsApi, workflowsApi, approvalsApi, aiApi } from "@/services/api";
import type { Contract, Workflow, Approval } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Brain,
  MessageSquare,
  Loader2,
} from "lucide-react";

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-gray-100 text-gray-600",
  expired: "bg-red-100 text-red-700",
  terminated: "bg-orange-100 text-orange-700",
  renewed: "bg-blue-100 text-blue-700",
};

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [tab, setTab] = useState<"details" | "workflow" | "ai">("details");

  const fetchData = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      contractsApi.get(id),
      workflowsApi.getByContract(id).catch(() => ({ data: [] })),
      approvalsApi.getByContract(id).catch(() => ({ data: [] })),
    ])
      .then(([cRes, wRes, aRes]) => {
        setContract(cRes.data);
        const wData = wRes.data;
        setWorkflows(Array.isArray(wData) ? wData : []);
        const aData = aRes.data;
        setApprovals(Array.isArray(aData) ? aData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const runAiAnalysis = async () => {
    if (!id) return;
    setAnalyzing(true);
    try {
      await aiApi.analyzeContract(id);
      // Refresh contract to get analysis results
      const res = await contractsApi.get(id);
      setContract(res.data);
      setTab("ai");
    } catch {
      alert("AI analysis failed. Make sure the contract has content.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Contract Details">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#9999a4]" />
        </div>
      </AppLayout>
    );
  }

  if (!contract) {
    return (
      <AppLayout title="Contract Details">
        <div className="py-20 text-center text-[#9999a4]">
          Contract not found.
        </div>
      </AppLayout>
    );
  }

  const workflow = workflows[0];

  return (
    <AppLayout title="Contract Details">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/contracts")}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-[18px] font-semibold text-[#1b1840]">
              {contract.title}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                className={
                  statusBadge[contract.status] || statusBadge.draft
                }
              >
                {contract.status}
              </Badge>
              <span className="text-[11px] text-[#9999a4] capitalize">
                {contract.workflow_stage?.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runAiAnalysis}
            disabled={analyzing}
            className="flex items-center gap-1 rounded-lg border border-[#dfe2e8] px-4 py-2 text-[12px] text-[#4d4d58] hover:bg-gray-50 disabled:opacity-50"
          >
            {analyzing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Brain size={14} />
            )}
            {analyzing ? "Analyzing..." : "Run AI Analysis"}
          </button>
          <button
            onClick={() => navigate(`/editor/${contract._id}`)}
            className="flex items-center gap-1 rounded-lg bg-[#1b1840] px-4 py-2 text-[12px] font-medium text-white"
          >
            <FileText size={14} />
            Open Editor
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-[#f0f0f2] p-1">
        {(["details", "workflow", "ai"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-[12px] font-medium transition ${
              tab === t
                ? "bg-white text-[#1b1840] shadow-sm"
                : "text-[#7e7e8d] hover:text-[#4d4d58]"
            }`}
          >
            {t === "details" && "Details"}
            {t === "workflow" && "Workflow"}
            {t === "ai" && "AI Analysis"}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {tab === "details" && (
        <div className="grid grid-cols-[1fr_0.8fr] gap-5">
          <div className="space-y-4">
            {/* Info Card */}
            <div className="soft-card p-5">
              <h3 className="mb-4 text-[13px] font-semibold text-[#2a2a35]">
                Contract Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-[12px]">
                <div>
                  <p className="text-[#9999a4]">Type</p>
                  <p className="mt-0.5 font-medium capitalize text-[#3d3d48]">
                    {contract.contract_type.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-[#9999a4]">Approval Type</p>
                  <p className="mt-0.5 font-medium capitalize text-[#3d3d48]">
                    {contract.approval_type.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar size={13} className="mt-0.5 text-[#9999a4]" />
                  <div>
                    <p className="text-[#9999a4]">Start Date</p>
                    <p className="mt-0.5 font-medium text-[#3d3d48]">
                      {new Date(contract.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar size={13} className="mt-0.5 text-[#9999a4]" />
                  <div>
                    <p className="text-[#9999a4]">End Date</p>
                    <p className="mt-0.5 font-medium text-[#3d3d48]">
                      {new Date(contract.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {contract.value != null && (
                  <div className="flex items-start gap-2">
                    <DollarSign size={13} className="mt-0.5 text-[#9999a4]" />
                    <div>
                      <p className="text-[#9999a4]">Value</p>
                      <p className="mt-0.5 font-medium text-[#3d3d48]">
                        ${contract.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {contract.payment_terms && (
                  <div>
                    <p className="text-[#9999a4]">Payment Terms</p>
                    <p className="mt-0.5 font-medium text-[#3d3d48]">
                      {contract.payment_terms}
                    </p>
                  </div>
                )}
              </div>

              {contract.description && (
                <div className="mt-4 border-t border-[#f0f0f2] pt-4">
                  <p className="text-[11px] text-[#9999a4]">Description</p>
                  <p className="mt-1 text-[12px] text-[#3d3d48]">
                    {contract.description}
                  </p>
                </div>
              )}

              {contract.tags && contract.tags.length > 0 && (
                <div className="mt-4 flex gap-2">
                  {contract.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#f0eaf7] px-2.5 py-0.5 text-[10px] font-medium text-[#6d6d79]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Parties & Approvals */}
          <div className="space-y-4">
            <div className="soft-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-[#2a2a35]">
                <Users size={14} />
                Parties
              </h3>
              {contract.parties?.length > 0 ? (
                <div className="space-y-3">
                  {contract.parties.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-[#f7f7f8] p-3 text-[12px]"
                    >
                      <p className="font-medium text-[#3d3d48]">{p.name}</p>
                      <p className="text-[#9999a4]">
                        {p.role}
                        {p.organization && ` - ${p.organization}`}
                      </p>
                      <p className="text-[#7e7e8d]">{p.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#9999a4]">No parties added</p>
              )}
            </div>

            {approvals.length > 0 && (
              <div className="soft-card p-5">
                <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-[#2a2a35]">
                  <MessageSquare size={14} />
                  Approvals
                </h3>
                <div className="space-y-3">
                  {approvals.map((a) => (
                    <div
                      key={a._id}
                      className="rounded-lg bg-[#f7f7f8] p-3 text-[12px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize text-[#3d3d48]">
                          {a.approval_type.replace(/_/g, " ")}
                        </span>
                        <Badge
                          className={
                            a.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : a.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {a.status}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        {a.approvers.map((v, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[11px]"
                          >
                            <span className="text-[#7e7e8d]">
                              {v.user_email}
                            </span>
                            <span
                              className={`capitalize ${
                                v.decision === "approved"
                                  ? "text-green-600"
                                  : v.decision === "rejected"
                                  ? "text-red-600"
                                  : "text-[#9999a4]"
                              }`}
                            >
                              {v.decision || "pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workflow Tab */}
      {tab === "workflow" && (
        <WorkflowTimeline
          workflow={workflow}
          contractId={contract._id}
          onUpdate={fetchData}
        />
      )}

      {/* AI Tab */}
      {tab === "ai" && (
        <AiAnalysisPanel
          analysis={contract.ai_analysis}
          contractId={contract._id}
        />
      )}
    </AppLayout>
  );
}

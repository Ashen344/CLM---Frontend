import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Loader2, Save } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import { contractsApi, aiApi } from "@/services/api";
import type { Contract, AIAnalysisResult } from "@/types";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const riskColors = { high: "#ff5b5b", medium: "#f4d13d", low: "#31c46c" };

export default function EditorPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!contractId) return;
    contractsApi
      .get(contractId)
      .then((res) => setContract(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contractId]);

  const runAnalysis = async () => {
    if (!contractId) return;
    setAnalyzing(true);
    try {
      await aiApi.analyzeContract(contractId);
      const res = await contractsApi.get(contractId);
      setContract(res.data);
    } catch {
      alert("Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Contract Editor">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#9999a4]" />
        </div>
      </AppLayout>
    );
  }

  if (!contract) {
    return (
      <AppLayout title="Contract Editor">
        <div className="py-20 text-center text-[#9999a4]">
          Contract not found.
        </div>
      </AppLayout>
    );
  }

  const analysis = contract.ai_analysis;

  return (
    <AppLayout title="Contract Editor">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/contracts/${contractId}`)}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-[16px] font-semibold text-[#1b1840]">
            {contract.title}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="flex items-center gap-1 rounded-lg border border-[#dfe2e8] px-4 py-2 text-[12px] text-[#4d4d58] hover:bg-gray-50 disabled:opacity-50"
          >
            {analyzing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Brain size={14} />
            )}
            {analyzing ? "Analyzing..." : "AI Analysis"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1.2fr_0.7fr] gap-8">
        {/* Document View */}
        <div className="doc-sheet min-h-[700px] p-10">
          <div className="mx-auto max-w-[520px] text-[10px] leading-5 text-[#1e1e1f]">
            <h2 className="mb-5 text-center text-[14px] font-bold">
              {contract.title}
            </h2>

            {contract.description && (
              <p className="mb-4 text-[11px] text-[#4d4d58] italic">
                {contract.description}
              </p>
            )}

            <div className="mb-4 rounded-lg bg-[#f7f7f8] p-3 text-[10px]">
              <p>
                <strong>Type:</strong>{" "}
                {contract.contract_type.replace(/_/g, " ")}
              </p>
              <p>
                <strong>Start:</strong>{" "}
                {new Date(contract.start_date).toLocaleDateString()}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {new Date(contract.end_date).toLocaleDateString()}
              </p>
              {contract.value && (
                <p>
                  <strong>Value:</strong> ${contract.value.toLocaleString()}
                </p>
              )}
              {contract.payment_terms && (
                <p>
                  <strong>Payment Terms:</strong> {contract.payment_terms}
                </p>
              )}
            </div>

            {contract.parties?.length > 0 && (
              <>
                <h3 className="mt-5 font-bold">Parties</h3>
                {contract.parties.map((p, i) => (
                  <p key={i} className="mt-1">
                    <strong>{p.role}:</strong> {p.name}
                    {p.organization && ` (${p.organization})`} — {p.email}
                  </p>
                ))}
              </>
            )}

            {analysis && (
              <>
                <h3 className="mt-6 font-bold">AI-Extracted Clauses</h3>
                {analysis.extracted_clauses?.map((clause, i) => (
                  <p key={i} className="mt-2">
                    {i + 1}. {clause}
                  </p>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Analysis Sidebar */}
        <div className="pt-2">
          {analysis ? (
            <AnalysisSidebar analysis={analysis} />
          ) : (
            <div className="soft-card p-4">
              <h3 className="text-[13px] font-semibold text-[#2a2a35]">
                AI Analysis
              </h3>
              <p className="mt-4 text-[12px] text-[#9999a4]">
                Run AI analysis to see risk assessment, extracted clauses, and
                recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function AnalysisSidebar({ analysis }: { analysis: AIAnalysisResult }) {
  const riskData = [
    {
      name: "Risk",
      value: analysis.risk_score,
      color: riskColors[analysis.risk_level],
    },
    { name: "Safe", value: 100 - analysis.risk_score, color: "#f0f0f2" },
  ];

  return (
    <div className="space-y-4">
      <div className="soft-card p-4">
        <h3 className="text-[13px] font-semibold text-[#2a2a35]">
          Risk Score
        </h3>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-[120px] w-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="value"
                  innerRadius={28}
                  outerRadius={48}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {riskData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-[24px] font-bold text-[#1b1840]">
              {analysis.risk_score}
            </p>
            <p
              className="text-[11px] font-medium capitalize"
              style={{ color: riskColors[analysis.risk_level] }}
            >
              {analysis.risk_level} Risk
            </p>
          </div>
        </div>
      </div>

      <div className="soft-card p-4">
        <h3 className="text-[13px] font-semibold text-[#2a2a35]">Summary</h3>
        <p className="mt-2 text-[11px] leading-4 text-[#4d4d58]">
          {analysis.summary}
        </p>
      </div>

      {analysis.risk_factors?.length > 0 && (
        <div className="soft-card p-4">
          <h3 className="text-[13px] font-semibold text-[#2a2a35]">
            Risk Factors
          </h3>
          <div className="mt-2 space-y-1.5">
            {analysis.risk_factors.map((f, i) => (
              <p
                key={i}
                className="rounded bg-amber-50 px-2 py-1.5 text-[10px] text-amber-800"
              >
                {f}
              </p>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations?.length > 0 && (
        <div className="soft-card p-4">
          <h3 className="text-[13px] font-semibold text-[#2a2a35]">
            Recommendations
          </h3>
          <div className="mt-2 space-y-1.5">
            {analysis.recommendations.map((r, i) => (
              <p
                key={i}
                className="rounded bg-green-50 px-2 py-1.5 text-[10px] text-green-800"
              >
                {r}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

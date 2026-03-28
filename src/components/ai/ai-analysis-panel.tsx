import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { AIAnalysisResult } from "@/types";
import { aiApi } from "@/services/api";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";

type Props = {
  analysis?: AIAnalysisResult;
  contractId: string;
};

const riskColors = { high: "#ff5b5b", medium: "#f4d13d", low: "#31c46c" };

export default function AiAnalysisPanel({ analysis, contractId }: Props) {
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const question = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: question }]);
    setChatLoading(true);
    try {
      const res = await aiApi.chat({ question, contract_id: contractId });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!analysis) {
    return (
      <div className="soft-card p-6">
        <p className="text-[13px] text-[#9999a4]">
          No AI analysis has been run yet. Click "Run AI Analysis" to analyze
          this contract.
        </p>

        {/* Chat section even without analysis */}
        <div className="mt-6 border-t border-[#f0f0f2] pt-4">
          <h4 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#2a2a35]">
            <MessageSquare size={14} />
            Ask AI about this contract
          </h4>
          <ChatSection
            messages={chatMessages}
            input={chatInput}
            loading={chatLoading}
            onInputChange={setChatInput}
            onSend={sendChat}
          />
        </div>
      </div>
    );
  }

  const riskData = [
    {
      name: "Risk Score",
      value: analysis.risk_score,
      color: riskColors[analysis.risk_level],
    },
    {
      name: "Remaining",
      value: 100 - analysis.risk_score,
      color: "#f0f0f2",
    },
  ];

  return (
    <div className="grid grid-cols-[1fr_0.9fr] gap-5">
      {/* Analysis Results */}
      <div className="space-y-4">
        {/* Risk Score */}
        <div className="soft-card p-5">
          <h3 className="mb-4 text-[13px] font-semibold text-[#2a2a35]">
            Risk Assessment
          </h3>
          <div className="flex items-center gap-4">
            <div className="h-[120px] w-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    innerRadius={30}
                    outerRadius={50}
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
              <p className="text-[28px] font-bold text-[#1b1840]">
                {analysis.risk_score}
              </p>
              <p
                className="text-[12px] font-medium capitalize"
                style={{ color: riskColors[analysis.risk_level] }}
              >
                {analysis.risk_level} Risk
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="soft-card p-5">
          <h3 className="mb-3 text-[13px] font-semibold text-[#2a2a35]">
            Summary
          </h3>
          <p className="text-[12px] leading-5 text-[#4d4d58]">
            {analysis.summary}
          </p>
        </div>

        {/* Key Information */}
        <div className="soft-card p-5">
          <h3 className="mb-3 text-[13px] font-semibold text-[#2a2a35]">
            Key Information
          </h3>
          <div className="space-y-2 text-[12px]">
            {Object.entries(analysis.key_information).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="w-36 shrink-0 capitalize text-[#9999a4]">
                  {key.replace(/_/g, " ")}:
                </span>
                <span className="text-[#4d4d58]">
                  {Array.isArray(value) ? value.join(", ") : value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Risk Factors */}
        {analysis.risk_factors?.length > 0 && (
          <div className="soft-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#2a2a35]">
              <AlertTriangle size={14} className="text-amber-500" />
              Risk Factors
            </h3>
            <div className="space-y-2">
              {analysis.risk_factors.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800"
                >
                  <Info size={12} className="mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations?.length > 0 && (
          <div className="soft-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#2a2a35]">
              <CheckCircle2 size={14} className="text-green-500" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {analysis.recommendations.map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-green-50 p-2.5 text-[11px] text-green-800"
                >
                  <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Clauses */}
        {analysis.extracted_clauses?.length > 0 && (
          <div className="soft-card p-5">
            <h3 className="mb-3 text-[13px] font-semibold text-[#2a2a35]">
              Extracted Clauses
            </h3>
            <div className="space-y-1.5">
              {analysis.extracted_clauses.map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-[#f7f7f8] p-2.5 text-[11px] text-[#4d4d58]"
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="soft-card p-5">
          <h4 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#2a2a35]">
            <MessageSquare size={14} />
            Ask AI
          </h4>
          <ChatSection
            messages={chatMessages}
            input={chatInput}
            loading={chatLoading}
            onInputChange={setChatInput}
            onSend={sendChat}
          />
        </div>
      </div>
    </div>
  );
}

function ChatSection({
  messages,
  input,
  loading,
  onInputChange,
  onSend,
}: {
  messages: { role: string; content: string }[];
  input: string;
  loading: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div>
      {messages.length > 0 && (
        <div className="mb-3 max-h-60 space-y-2 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg p-2.5 text-[11px] ${
                m.role === "user"
                  ? "ml-8 bg-[#1b1840] text-white"
                  : "mr-8 bg-[#f7f7f8] text-[#4d4d58]"
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="mr-8 flex items-center gap-2 rounded-lg bg-[#f7f7f8] p-2.5 text-[11px] text-[#9999a4]">
              <Loader2 size={12} className="animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
          placeholder="Ask a question about this contract..."
          className="flex-1 rounded-lg border border-[#dfe2e8] px-3 py-2 text-[12px] outline-none"
          disabled={loading}
        />
        <button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="rounded-lg bg-[#1b1840] px-3 py-2 text-white disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

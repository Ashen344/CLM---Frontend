import { useState } from "react";
import { workflowsApi } from "@/services/api";
import type { Workflow } from "@/types";
import {
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  SkipForward,
  ChevronRight,
  Loader2,
} from "lucide-react";

type Props = {
  workflow?: Workflow;
  contractId: string;
  onUpdate: () => void;
};

const stepIcons: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  in_progress: Clock,
  rejected: XCircle,
  skipped: SkipForward,
  pending: Circle,
};

const stepColors: Record<string, string> = {
  completed: "text-green-500",
  in_progress: "text-blue-500",
  rejected: "text-red-500",
  skipped: "text-gray-400",
  pending: "text-gray-300",
};

export default function WorkflowTimeline({
  workflow,
  contractId,
  onUpdate,
}: Props) {
  const [acting, setActing] = useState(false);
  const [comment, setComment] = useState("");

  if (!workflow) {
    return (
      <div className="soft-card p-6">
        <p className="text-[13px] text-[#9999a4]">
          No workflow has been created for this contract yet.
        </p>
        <button
          onClick={async () => {
            setActing(true);
            try {
              await workflowsApi.create(contractId);
              onUpdate();
            } catch {
              alert("Failed to create workflow");
            } finally {
              setActing(false);
            }
          }}
          disabled={acting}
          className="mt-3 rounded-lg bg-[#1b1840] px-4 py-2 text-[12px] font-medium text-white disabled:opacity-50"
        >
          {acting ? "Creating..." : "Start Workflow"}
        </button>
      </div>
    );
  }

  const handleAdvance = async () => {
    setActing(true);
    try {
      await workflowsApi.advance(workflow._id, comment || undefined);
      setComment("");
      onUpdate();
    } catch {
      alert("Failed to advance workflow");
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert("Please add a comment explaining the rejection.");
      return;
    }
    setActing(true);
    try {
      await workflowsApi.reject(workflow._id, comment);
      setComment("");
      onUpdate();
    } catch {
      alert("Failed to reject workflow step");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="soft-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-[#2a2a35]">
            {workflow.name}
          </h3>
          <p className="mt-1 text-[11px] capitalize text-[#9999a4]">
            Status: {workflow.status} &middot; Step {workflow.current_step} of{" "}
            {workflow.steps.length}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {workflow.steps.map((step, i) => {
          const Icon = stepIcons[step.status] || Circle;
          const color = stepColors[step.status] || "text-gray-300";
          const isLast = i === workflow.steps.length - 1;
          const isCurrent = step.step_number === workflow.current_step;

          return (
            <div key={step.step_number} className="flex gap-4">
              {/* Timeline line + icon */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isCurrent
                      ? "bg-blue-50 ring-2 ring-blue-200"
                      : "bg-white"
                  }`}
                >
                  <Icon size={18} className={color} />
                </div>
                {!isLast && (
                  <div className="h-10 w-px bg-gray-200" />
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 ${isCurrent ? "pt-0.5" : "pt-1"}`}>
                <p
                  className={`text-[13px] ${
                    isCurrent
                      ? "font-semibold text-[#1b1840]"
                      : "text-[#4d4d58]"
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-[11px] capitalize text-[#9999a4]">
                  {step.step_type.replace(/_/g, " ")}
                  {step.completed_at &&
                    ` - ${new Date(step.completed_at).toLocaleDateString()}`}
                </p>
                {step.comments && (
                  <p className="mt-1 text-[11px] italic text-[#7e7e8d]">
                    "{step.comments}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action area for current step */}
      {workflow.status === "active" && (
        <div className="mt-4 rounded-lg border border-[#eee] p-4">
          <p className="mb-3 text-[12px] font-medium text-[#3d3d48]">
            Current Step: {workflow.steps[workflow.current_step - 1]?.name}
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional for advance, required for reject)..."
            className="mb-3 w-full rounded-lg border border-[#dfe2e8] px-3 py-2 text-[12px] outline-none resize-none"
            rows={2}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdvance}
              disabled={acting}
              className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-[12px] font-medium text-white disabled:opacity-50"
            >
              {acting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ChevronRight size={14} />
              )}
              Complete & Advance
            </button>
            <button
              onClick={handleReject}
              disabled={acting}
              className="flex items-center gap-1 rounded-lg bg-red-500 px-4 py-2 text-[12px] font-medium text-white disabled:opacity-50"
            >
              <XCircle size={14} />
              Reject
            </button>
          </div>
        </div>
      )}

      {workflow.status === "completed" && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-center text-[13px] text-green-700">
          Workflow completed
          {workflow.completed_at &&
            ` on ${new Date(workflow.completed_at).toLocaleDateString()}`}
        </div>
      )}
    </div>
  );
}

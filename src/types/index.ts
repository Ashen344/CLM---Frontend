// ── User ──
export type UserRole = "admin" | "manager" | "user" | "viewer";
export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  _id: string;
  clerk_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// ── Contract ──
export type ContractType =
  | "service_agreement"
  | "nda"
  | "employment"
  | "vendor"
  | "licensing"
  | "partnership"
  | "other";

export type ContractStatus = "draft" | "active" | "expired" | "terminated" | "renewed";

export type WorkflowStage =
  | "request"
  | "authoring"
  | "review"
  | "approval"
  | "execution"
  | "storage"
  | "monitoring"
  | "renewal"
  | "expired";

export type ApprovalType = "majority" | "first_person" | "all_required";
export type RiskLevel = "low" | "medium" | "high";

export interface ContractParty {
  name: string;
  role: string;
  email: string;
  organization?: string;
}

export interface ContractVersion {
  version_number: number;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
  change_notes?: string;
}

export interface AIAnalysisResult {
  summary: string;
  extracted_clauses: string[];
  key_information: {
    parties: string[];
    duration: string;
    payment_terms: string;
    termination_conditions: string;
    governing_law: string;
  };
  risk_score: number;
  risk_level: RiskLevel;
  risk_factors: string[];
  recommendations: string[];
  analyzed_at: string;
}

export interface Contract {
  _id: string;
  title: string;
  contract_type: ContractType;
  description?: string;
  parties: ContractParty[];
  start_date: string;
  end_date: string;
  value?: number;
  payment_terms?: string;
  status: ContractStatus;
  workflow_stage: WorkflowStage;
  approval_type: ApprovalType;
  file_url?: string;
  versions: ContractVersion[];
  ai_analysis?: AIAnalysisResult;
  tags?: string[];
  created_by: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractCreate {
  title: string;
  contract_type: ContractType;
  description?: string;
  parties: ContractParty[];
  start_date: string;
  end_date: string;
  value?: number;
  payment_terms?: string;
  approval_type?: ApprovalType;
  tags?: string[];
}

// ── Workflow ──
export type WorkflowStatus = "active" | "completed" | "cancelled" | "paused";
export type StepType = "review" | "approval" | "signing" | "notification" | "ai_analysis";
export type StepStatus = "pending" | "in_progress" | "completed" | "rejected" | "skipped";

export interface WorkflowStep {
  step_number: number;
  name: string;
  step_type: StepType;
  status: StepStatus;
  assigned_to?: string;
  completed_by?: string;
  completed_at?: string;
  comments?: string;
  due_date?: string;
}

export interface Workflow {
  _id: string;
  contract_id: string;
  name: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  current_step: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// ── Approval ──
export type ApprovalStatus = "pending" | "approved" | "rejected" | "changes_requested";

export interface ApproverVote {
  user_id: string;
  user_email: string;
  decision?: "approved" | "rejected" | "changes_requested";
  comments?: string;
  decided_at?: string;
}

export interface Approval {
  _id: string;
  contract_id: string;
  workflow_id?: string;
  approval_type: ApprovalType;
  status: ApprovalStatus;
  approvers: ApproverVote[];
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  decided_at?: string;
}

// ── Template ──
export interface TemplateField {
  field_name: string;
  field_type: string;
  required: boolean;
  default_value?: string;
  options?: string[];
}

export interface Template {
  _id: string;
  name: string;
  description?: string;
  contract_type: ContractType;
  content: string;
  fields: TemplateField[];
  tags?: string[];
  version: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ── Notification ──
export type NotificationType =
  | "approval_required"
  | "approval_decision"
  | "contract_expiring"
  | "obligation_due"
  | "workflow_update"
  | "status_change"
  | "escalation"
  | "system";

export interface Notification {
  _id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  contract_id?: string;
  workflow_id?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// ── Audit Log ──
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "approval_vote"
  | "workflow_start"
  | "workflow_complete"
  | "file_upload"
  | "file_download"
  | "ai_analysis"
  | "login"
  | "export";

export interface AuditLog {
  _id: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  user_id: string;
  user_email: string;
  details?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ip_address?: string;
  created_at: string;
}

// ── Dashboard ──
export interface DashboardStats {
  total_contracts: number;
  active_contracts: number;
  draft_contracts: number;
  expired_contracts: number;
  expiring_soon: number;
  pending_approvals: number;
  risk_summary: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface ChartDataItem {
  _id: string;
  count: number;
}

// ── Pagination ──
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ── AI ──
export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIChatRequest {
  question: string;
  contract_id?: string;
  contract_text?: string;
}

export interface AIGenerateDraftRequest {
  contract_type: ContractType;
  parties: ContractParty[];
  key_terms: string;
  additional_instructions?: string;
}

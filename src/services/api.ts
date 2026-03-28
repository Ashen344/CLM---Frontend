import axios from "axios";
import type {
  Contract,
  ContractCreate,
  Workflow,
  Approval,
  Template,
  Notification,
  AuditLog,
  DashboardStats,
  ChartDataItem,
  AIAnalysisResult,
  AIChatRequest,
  AIGenerateDraftRequest,
} from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Inject Clerk token into every request
export function setAuthToken(getToken: () => Promise<string | null>) {
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// ── Auth ──
export const authApi = {
  syncUser: () => api.post("/api/auth/sync"),
  getMe: () => api.get("/api/auth/me"),
  updateMe: (data: { full_name?: string; organization?: string }) =>
    api.put("/api/auth/me", data),
  listUsers: (page = 1, perPage = 20) =>
    api.get("/api/auth/users", { params: { page, per_page: perPage } }),
  changeRole: (userId: string, role: string) =>
    api.patch(`/api/auth/users/${userId}/role`, { role }),
  deactivateUser: (userId: string) =>
    api.patch(`/api/auth/users/${userId}/deactivate`),
};

// ── Contracts ──
export const contractsApi = {
  create: (data: ContractCreate) =>
    api.post<Contract>("/api/contracts/", data),
  list: (params?: {
    search?: string;
    contract_type?: string;
    status?: string;
    workflow_stage?: string;
    risk_level?: string;
    page?: number;
    per_page?: number;
  }) => api.get("/api/contracts/", { params }),
  get: (id: string) => api.get<Contract>(`/api/contracts/${id}`),
  update: (id: string, data: Partial<ContractCreate>) =>
    api.put<Contract>(`/api/contracts/${id}`, data),
  delete: (id: string) => api.delete(`/api/contracts/${id}`),
  updateWorkflowStage: (id: string, stage: string) =>
    api.patch(`/api/contracts/${id}/workflow`, { workflow_stage: stage }),
  getDashboard: () => api.get("/api/contracts/dashboard"),
};

// ── Workflows ──
export const workflowsApi = {
  create: (contractId: string) =>
    api.post<Workflow>("/api/workflows/", { contract_id: contractId }),
  get: (id: string) => api.get<Workflow>(`/api/workflows/${id}`),
  getByContract: (contractId: string) =>
    api.get<Workflow[]>(`/api/workflows/contract/${contractId}`),
  advance: (id: string, comments?: string) =>
    api.post(`/api/workflows/${id}/advance`, { comments }),
  reject: (id: string, comments?: string) =>
    api.post(`/api/workflows/${id}/reject`, { comments }),
};

// ── Approvals ──
export const approvalsApi = {
  create: (data: {
    contract_id: string;
    workflow_id?: string;
    approval_type: string;
    approver_emails: string[];
    due_date?: string;
  }) => api.post<Approval>("/api/approvals/", data),
  get: (id: string) => api.get<Approval>(`/api/approvals/${id}`),
  vote: (id: string, decision: string, comments?: string) =>
    api.post(`/api/approvals/${id}/vote`, { decision, comments }),
  getPending: (userId: string) =>
    api.get<Approval[]>(`/api/approvals/pending/${userId}`),
  getByContract: (contractId: string) =>
    api.get<Approval[]>(`/api/approvals/contract/${contractId}`),
};

// ── Templates ──
export const templatesApi = {
  create: (data: {
    name: string;
    description?: string;
    contract_type: string;
    content: string;
    fields?: { field_name: string; field_type: string; required: boolean }[];
    tags?: string[];
  }) => api.post<Template>("/api/templates/", data),
  list: (params?: {
    search?: string;
    contract_type?: string;
    page?: number;
    per_page?: number;
  }) => api.get("/api/templates/", { params }),
  get: (id: string) => api.get<Template>(`/api/templates/${id}`),
  update: (id: string, data: Partial<Template>) =>
    api.put<Template>(`/api/templates/${id}`, data),
  delete: (id: string) => api.delete(`/api/templates/${id}`),
};

// ── AI ──
export const aiApi = {
  analyzeText: (text: string) =>
    api.post<AIAnalysisResult>("/api/ai/analyze/text", { text }),
  analyzeContract: (contractId: string) =>
    api.post<AIAnalysisResult>(`/api/ai/analyze/${contractId}`),
  generateDraft: (data: AIGenerateDraftRequest) =>
    api.post<{ draft: string }>("/api/ai/generate-draft", data),
  chat: (data: AIChatRequest) =>
    api.post<{ response: string }>("/api/ai/chat", data),
};

// ── Notifications ──
export const notificationsApi = {
  list: (params?: { unread?: boolean; page?: number; per_page?: number }) =>
    api.get("/api/notifications/", { params }),
  getUnreadCount: () =>
    api.get<{ count: number }>("/api/notifications/unread-count"),
  markRead: (id: string) =>
    api.patch(`/api/notifications/${id}/read`),
  markAllRead: () => api.patch("/api/notifications/read-all"),
};

// ── Audit Logs ──
export const auditApi = {
  list: (params?: {
    resource_type?: string;
    resource_id?: string;
    user_id?: string;
    action?: string;
    page?: number;
    per_page?: number;
  }) => api.get<AuditLog[]>("/api/audit/", { params }),
};

// ── Dashboard ──
export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/api/dashboard/stats"),
  getContractsByType: () =>
    api.get<ChartDataItem[]>("/api/dashboard/contracts-by-type"),
  getContractsByStatus: () =>
    api.get<ChartDataItem[]>("/api/dashboard/contracts-by-status"),
  getExpiringSoon: () =>
    api.get<Contract[]>("/api/dashboard/expiring-soon"),
  getRecentActivity: () =>
    api.get<Contract[]>("/api/dashboard/recent-activity"),
  getMonthlyStats: () =>
    api.get<ChartDataItem[]>("/api/dashboard/monthly-stats"),
};

export default api;

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import StatCard from "@/components/dashboard/stat-card";
import UpcomingDocuments from "@/components/dashboard/upcoming-documents";
import AiAnalysisCard from "@/components/dashboard/ai-analysis-card";
import ApprovalsChart from "@/components/dashboard/approvals-chart";
import { dashboardApi } from "@/services/api";
import type { DashboardStats, ChartDataItem, Contract } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [byStatus, setByStatus] = useState<ChartDataItem[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<ChartDataItem[]>([]);
  const [expiring, setExpiring] = useState<Contract[]>([]);
  const [recentActivity, setRecentActivity] = useState<Contract[]>([]);

  useEffect(() => {
    dashboardApi.getStats().then((r) => setStats(r.data)).catch(() => {});
    dashboardApi.getContractsByStatus().then((r) => setByStatus(r.data)).catch(() => {});
    dashboardApi.getMonthlyStats().then((r) => setMonthlyStats(r.data)).catch(() => {});
    dashboardApi.getExpiringSoon().then((r) => setExpiring(r.data)).catch(() => {});
    dashboardApi.getRecentActivity().then((r) => setRecentActivity(r.data)).catch(() => {});
  }, []);

  return (
    <AppLayout title="Dashboard">
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Contracts"
          value={stats?.total_contracts?.toString() ?? "—"}
          change=""
          bgClass="stat-soft"
        />
        <StatCard
          title="Active Contracts"
          value={stats?.active_contracts?.toString() ?? "—"}
          change=""
          bgClass="stat-blue"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pending_approvals?.toString() ?? "—"}
          change=""
          bgClass="stat-soft"
        />
        <StatCard
          title="Expiring Soon"
          value={stats?.expiring_soon?.toString() ?? "—"}
          change=""
          bgClass="stat-lilac"
        />
      </div>

      <div className="mt-5 grid grid-cols-[1.1fr_1fr] gap-5">
        <UpcomingDocuments contracts={expiring} recentActivity={recentActivity} />
        <AiAnalysisCard riskSummary={stats?.risk_summary} byStatus={byStatus} />
      </div>

      <div className="mt-5">
        <ApprovalsChart monthlyStats={monthlyStats} />
      </div>
    </AppLayout>
  );
}

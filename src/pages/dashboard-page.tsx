import AppLayout from "@/components/layout/app-layout";
import StatCard from "@/components/dashboard/stat-card";
import UpcomingDocuments from "@/components/dashboard/upcoming-documents";
import AiAnalysisCard from "@/components/dashboard/ai-analysis-card";
import ApprovalsChart from "@/components/dashboard/approvals-chart";

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Views" value="7,265" change="+11.01%" bgClass="stat-soft" />
        <StatCard title="Visits" value="3,671" change="-0.03%" bgClass="stat-blue" />
        <StatCard title="New Users" value="156" change="+15.03%" bgClass="stat-soft" />
        <StatCard title="Active Users" value="2,318" change="-6.08%" bgClass="stat-blue" />
      </div>

      <div className="mt-5 grid grid-cols-[1.1fr_1fr] gap-5">
        <UpcomingDocuments />
        <AiAnalysisCard />
      </div>

      <div className="mt-5">
        <ApprovalsChart />
      </div>
    </AppLayout>
  );
}
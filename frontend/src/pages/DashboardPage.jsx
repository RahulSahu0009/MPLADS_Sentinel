// DATA SOURCE: [FIXTURE] SYNTHETIC_DEMO
// Replace with dashboardService.getStats() once backend API is confirmed.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import RiskDistributionChart from '../charts/RiskDistributionChart';
import ProjectStatusChart from '../charts/ProjectStatusChart';
import { FIXTURE_DASHBOARD_STATS, formatCurrency } from '../utils/fixtures';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setStats(FIXTURE_DASHBOARD_STATS);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingState message="Loading dashboard…" />;
  if (error) return <ErrorState message={error} />;

  const utilizationPct = stats.utilizationRate.toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Portfolio overview — MPLADS Sentinel</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Projects" value={stats.totalProjects.toLocaleString()} subtitle="Across all constituencies" accent="blue" />
        <KpiCard title="Sanctioned Amount" value={formatCurrency(stats.totalSanctionedAmount)} subtitle="Total portfolio value" accent="green" />
        <KpiCard title="Expenditure" value={formatCurrency(stats.totalExpenditure)} subtitle={`${utilizationPct}% utilization`} accent="yellow" />
        <KpiCard title="Open Alerts" value={stats.openAlerts} subtitle="Require attention" accent="red" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Risk Distribution" subtitle="Projects by risk level">
          <RiskDistributionChart data={stats.projectsByRisk} loading={false} error={null} />
        </SectionCard>
        <SectionCard title="Project Status" subtitle="Projects by current status">
          <ProjectStatusChart data={stats.projectsByStatus} loading={false} error={null} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(stats.projectsByRisk).map(([level, count]) => (
          <div key={level} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-center shadow-sm">
            <RiskBadge level={level} />
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">projects</p>
          </div>
        ))}
      </div>

      <SectionCard title="High-Priority Projects" subtitle="Projects with highest risk scores requiring review">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <th className="pb-2 pr-4">Project</th>
                <th className="pb-2 pr-4">State</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Risk</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {stats.recentHighRiskProjects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2.5 pr-4 font-medium text-gray-800 dark:text-gray-200">{p.name}</td>
                  <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{p.state}</td>
                  <td className="py-2.5 pr-4"><StatusBadge status={p.status} /></td>
                  <td className="py-2.5 pr-4"><RiskBadge level={p.riskLevel} score={p.riskScore} /></td>
                  <td className="py-2.5">
                    <button onClick={() => navigate(`/projects/${p.id}`)} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

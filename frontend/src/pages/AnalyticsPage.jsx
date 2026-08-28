// DATA SOURCE: [FIXTURE] SYNTHETIC_DEMO
// Replace with dashboardService.getStats(), analyticsService.getStateAnalytics(),
// analyticsService.getDistrictAnalytics() once backend API contracts are confirmed.

import { useState, useEffect } from 'react';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import RiskDistributionChart from '../charts/RiskDistributionChart';
import StateComparisonChart from '../charts/StateComparisonChart';
import { FIXTURE_DASHBOARD_STATS, FIXTURE_STATE_ANALYTICS, formatCurrency } from '../utils/fixtures';

const METRIC_OPTIONS = [
  { value: 'avgRiskScore', label: 'Avg Risk Score' },
  { value: 'highRiskCount', label: 'High Risk Projects' },
  { value: 'totalProjects', label: 'Total Projects' },
  { value: 'completedCount', label: 'Completed Projects' },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [stateData, setStateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartMetric, setChartMetric] = useState('avgRiskScore');

  useEffect(() => {
    // TODO: replace with real API calls when backend is ready
    const timer = setTimeout(() => {
      try {
        setStats(FIXTURE_DASHBOARD_STATS);
        setStateData(FIXTURE_STATE_ANALYTICS);
      } catch {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingState message="Loading analytics…" />;
  if (error) return <ErrorState message={error} />;

  const totalHighRisk = (stats.projectsByRisk.HIGH || 0) + (stats.projectsByRisk.CRITICAL || 0);
  const highRiskPct = ((totalHighRisk / stats.totalProjects) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-0.5 text-sm text-gray-500">Portfolio-level risk and financial analytics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Total Projects" value={stats.totalProjects.toLocaleString()} accent="blue" />
        <KpiCard title="Total Sanctioned" value={formatCurrency(stats.totalSanctionedAmount)} accent="green" />
        <KpiCard title="Total Expenditure" value={formatCurrency(stats.totalExpenditure)} subtitle={`${stats.utilizationRate}% utilized`} accent="yellow" />
        <KpiCard title="High / Critical Risk" value={totalHighRisk} subtitle={`${highRiskPct}% of portfolio`} accent="red" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Risk Distribution" subtitle="Portfolio breakdown by risk level">
          <RiskDistributionChart data={stats.projectsByRisk} loading={false} error={null} />
        </SectionCard>

        <SectionCard title="Project Status Breakdown">
          <dl className="space-y-3">
            {Object.entries(stats.projectsByStatus).map(([status, count]) => {
              const pct = ((count / stats.totalProjects) * 100).toFixed(1);
              const barColors = { COMPLETED: 'bg-green-500', IN_PROGRESS: 'bg-blue-500', NOT_STARTED: 'bg-gray-400', STALLED: 'bg-red-500' };
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{status.replace('_', ' ')}</span>
                    <span className="font-medium text-gray-800">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className={`h-2 rounded-full ${barColors[status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </dl>
        </SectionCard>
      </div>

      {/* State comparison */}
      <SectionCard
        title="State Comparison"
        subtitle="Compare states by selected metric"
      >
        <div className="mb-4">
          <select
            value={chartMetric}
            onChange={(e) => setChartMetric(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            aria-label="Select comparison metric"
          >
            {METRIC_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <StateComparisonChart data={stateData} loading={false} error={null} metric={chartMetric} />
      </SectionCard>

      {/* State summary table */}
      <SectionCard title="State Summary Table">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="pb-2 pr-4">State</th>
                <th className="pb-2 pr-4">Projects</th>
                <th className="pb-2 pr-4 hidden sm:table-cell">Sanctioned</th>
                <th className="pb-2 pr-4 hidden sm:table-cell">Expenditure</th>
                <th className="pb-2 pr-4">Avg Risk</th>
                <th className="pb-2">High Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stateData.map((s) => (
                <tr key={s.state} className="hover:bg-gray-50">
                  <td className="py-2.5 pr-4 font-medium text-gray-800">{s.state}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{s.totalProjects}</td>
                  <td className="py-2.5 pr-4 hidden sm:table-cell text-gray-600">{formatCurrency(s.sanctionedAmount)}</td>
                  <td className="py-2.5 pr-4 hidden sm:table-cell text-gray-600">{formatCurrency(s.expenditure)}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`font-semibold ${s.avgRiskScore >= 60 ? 'text-red-600' : s.avgRiskScore >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {s.avgRiskScore}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-600">{s.highRiskCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

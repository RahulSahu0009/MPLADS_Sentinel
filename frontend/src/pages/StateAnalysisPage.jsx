// DATA SOURCE: [FIXTURE] SYNTHETIC_DEMO
// Replace with analyticsService.getStateAnalytics() once backend API is confirmed.

import { useState, useEffect, useMemo } from 'react';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import StateComparisonChart from '../charts/StateComparisonChart';
import { FIXTURE_STATE_ANALYTICS, FIXTURE_DISTRICT_ANALYTICS, formatCurrency } from '../utils/fixtures';

export default function StateAnalysisPage() {
  const [stateData, setStateData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState('ALL');
  const [sortBy, setSortBy] = useState('avgRiskScore');

  useEffect(() => {
    // TODO: replace with analyticsService.getStateAnalytics() when backend is ready
    const timer = setTimeout(() => {
      try {
        setStateData(FIXTURE_STATE_ANALYTICS);
        setDistrictData(FIXTURE_DISTRICT_ANALYTICS);
      } catch {
        setError('Failed to load state analytics.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const stateNames = useMemo(() => ['ALL', ...stateData.map((s) => s.state)], [stateData]);

  const selectedStateInfo = useMemo(
    () => (selectedState !== 'ALL' ? stateData.find((s) => s.state === selectedState) : null),
    [stateData, selectedState]
  );

  const filteredDistricts = useMemo(() => {
    const base = selectedState === 'ALL' ? districtData : districtData.filter((d) => d.state === selectedState);
    return [...base].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [districtData, selectedState, sortBy]);

  const chartData = useMemo(() => {
    if (selectedState === 'ALL') return stateData;
    return stateData.filter((s) => s.state === selectedState);
  }, [stateData, selectedState]);

  if (loading) return <LoadingState message="Loading state analytics…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">State Analysis</h1>
          <p className="mt-0.5 text-sm text-gray-500">State-level project health and risk overview</p>
        </div>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          aria-label="Select state"
        >
          {stateNames.map((s) => (
            <option key={s} value={s}>{s === 'ALL' ? 'All States' : s}</option>
          ))}
        </select>
      </div>

      {/* KPIs for selected state */}
      {selectedStateInfo && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard title="Total Projects" value={selectedStateInfo.totalProjects} accent="blue" />
          <KpiCard title="Sanctioned" value={formatCurrency(selectedStateInfo.sanctionedAmount)} accent="green" />
          <KpiCard title="Expenditure" value={formatCurrency(selectedStateInfo.expenditure)} accent="yellow" />
          <KpiCard title="Avg Risk Score" value={selectedStateInfo.avgRiskScore} subtitle={`${selectedStateInfo.highRiskCount} high-risk projects`} accent="red" />
        </div>
      )}

      {/* Chart */}
      <SectionCard title="State Risk Comparison" subtitle="Average risk score by state">
        <StateComparisonChart data={chartData} loading={false} error={null} metric="avgRiskScore" />
      </SectionCard>

      {/* District breakdown */}
      <SectionCard
        title="District Breakdown"
        subtitle={selectedState === 'ALL' ? 'All districts' : `Districts in ${selectedState}`}
      >
        <div className="mb-3 flex items-center gap-3">
          <label className="text-sm text-gray-500" htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="avgRiskScore">Avg Risk Score</option>
            <option value="highRiskCount">High Risk Count</option>
            <option value="totalProjects">Total Projects</option>
          </select>
        </div>

        {filteredDistricts.length === 0 ? (
          <EmptyState title="No district data" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4">District</th>
                  <th className="pb-2 pr-4 hidden md:table-cell">State</th>
                  <th className="pb-2 pr-4">Projects</th>
                  <th className="pb-2 pr-4 hidden sm:table-cell">Sanctioned</th>
                  <th className="pb-2 pr-4 hidden sm:table-cell">Expenditure</th>
                  <th className="pb-2 pr-4">Avg Risk</th>
                  <th className="pb-2">High Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDistricts.map((d) => (
                  <tr key={`${d.district}-${d.state}`} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-gray-800">{d.district}</td>
                    <td className="py-2.5 pr-4 hidden md:table-cell text-gray-500">{d.state}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{d.totalProjects}</td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell text-gray-600">{formatCurrency(d.sanctionedAmount)}</td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell text-gray-600">{formatCurrency(d.expenditure)}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`font-semibold ${d.avgRiskScore >= 60 ? 'text-red-600' : d.avgRiskScore >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {d.avgRiskScore}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-600">{d.highRiskCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// DATA SOURCE: [FIXTURE] SYNTHETIC_DEMO
// Replace with analyticsService.getDistrictAnalytics() once backend API is confirmed.
// API contract: GET /api/analytics/district

import { useState, useEffect, useMemo } from 'react';
import KpiCard from '../components/KpiCard';
import SectionCard from '../components/SectionCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { FIXTURE_DISTRICT_ANALYTICS, FIXTURE_PROJECTS, formatCurrency } from '../utils/fixtures';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const SORT_OPTIONS = [
  { value: 'avgRiskScore', label: 'Avg Risk Score' },
  { value: 'highRiskCount', label: 'High Risk Count' },
  { value: 'totalProjects', label: 'Total Projects' },
  { value: 'expenditure', label: 'Expenditure' },
];

// Derive unique state list from district fixture data
const ALL_STATES = ['ALL', ...Array.from(new Set(FIXTURE_DISTRICT_ANALYTICS.map((d) => d.state))).sort()];

export default function DistrictAnalysisPage() {
  const [districtData, setDistrictData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [sortBy, setSortBy] = useState('avgRiskScore');

  useEffect(() => {
    // TODO: replace with analyticsService.getDistrictAnalytics() when backend is ready
    const timer = setTimeout(() => {
      try {
        setDistrictData(FIXTURE_DISTRICT_ANALYTICS);
        setProjects(FIXTURE_PROJECTS);
      } catch {
        setError('Failed to load district analytics.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Districts filtered by selected state
  const visibleDistricts = useMemo(() => {
    const base =
      selectedState === 'ALL'
        ? districtData
        : districtData.filter((d) => d.state === selectedState);
    return [...base].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [districtData, selectedState, sortBy]);

  // District names for the district selector (scoped to selected state)
  const districtNames = useMemo(
    () => ['ALL', ...visibleDistricts.map((d) => d.district)],
    [visibleDistricts]
  );

  // KPI data for the selected district
  const selectedDistrictInfo = useMemo(() => {
    if (selectedDistrict === 'ALL') return null;
    return districtData.find((d) => d.district === selectedDistrict) || null;
  }, [districtData, selectedDistrict]);

  // Projects scoped to selected district (or all if none selected)
  const scopedProjects = useMemo(() => {
    if (selectedDistrict === 'ALL' && selectedState === 'ALL') return projects;
    if (selectedDistrict !== 'ALL')
      return projects.filter((p) => p.district === selectedDistrict);
    return projects.filter((p) => p.state === selectedState);
  }, [projects, selectedDistrict, selectedState]);

  // Chart data: top 8 districts by selected metric
  const chartData = useMemo(
    () => visibleDistricts.slice(0, 8),
    [visibleDistricts]
  );

  // Reset district selection when state changes
  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('ALL');
  };

  if (loading) return <LoadingState message="Loading district analytics…" />;
  if (error) return <ErrorState message={error} />;

  const utilizationPct =
    selectedDistrictInfo && selectedDistrictInfo.sanctionedAmount > 0
      ? ((selectedDistrictInfo.expenditure / selectedDistrictInfo.sanctionedAmount) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Page header + filters */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">District Analysis</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            District-level project health, risk concentration, and financial overview
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            aria-label="Filter by state"
          >
            {ALL_STATES.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All States' : s}
              </option>
            ))}
          </select>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            aria-label="Select district"
          >
            {districtNames.map((d) => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Districts' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI cards — only shown when a specific district is selected */}
      {selectedDistrictInfo ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            title="Total Projects"
            value={selectedDistrictInfo.totalProjects}
            subtitle={`in ${selectedDistrictInfo.district}`}
            accent="blue"
          />
          <KpiCard
            title="Sanctioned"
            value={formatCurrency(selectedDistrictInfo.sanctionedAmount)}
            accent="green"
          />
          <KpiCard
            title="Expenditure"
            value={formatCurrency(selectedDistrictInfo.expenditure)}
            subtitle={utilizationPct ? `${utilizationPct}% utilized` : undefined}
            accent="yellow"
          />
          <KpiCard
            title="Avg Risk Score"
            value={selectedDistrictInfo.avgRiskScore}
            subtitle={`${selectedDistrictInfo.highRiskCount} high-risk project(s)`}
            accent="red"
          />
        </div>
      ) : (
        /* Summary KPIs across all visible districts */
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            title="Districts Shown"
            value={visibleDistricts.length}
            subtitle={selectedState === 'ALL' ? 'All states' : selectedState}
            accent="blue"
          />
          <KpiCard
            title="Total Projects"
            value={visibleDistricts.reduce((s, d) => s + d.totalProjects, 0)}
            accent="green"
          />
          <KpiCard
            title="Total Sanctioned"
            value={formatCurrency(visibleDistricts.reduce((s, d) => s + d.sanctionedAmount, 0))}
            accent="yellow"
          />
          <KpiCard
            title="High Risk Projects"
            value={visibleDistricts.reduce((s, d) => s + d.highRiskCount, 0)}
            accent="red"
          />
        </div>
      )}

      {/* Comparison chart */}
      <SectionCard
        title="District Comparison"
        subtitle={`Top districts by ${SORT_OPTIONS.find((o) => o.value === sortBy)?.label}`}
      >
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm text-gray-500" htmlFor="district-sort-select">
            Compare by:
          </label>
          <select
            id="district-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {chartData.length === 0 ? (
          <EmptyState title="No district data" message="No districts match the current filter." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="district"
                tick={{ fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey={sortBy} name={SORT_OPTIONS.find((o) => o.value === sortBy)?.label} radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.district}
                    fill={
                      entry.avgRiskScore >= 60
                        ? '#ef4444'
                        : entry.avgRiskScore >= 40
                        ? '#f97316'
                        : '#22c55e'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* District summary table */}
      <SectionCard
        title="District Summary"
        subtitle={
          selectedState === 'ALL'
            ? 'All districts'
            : selectedDistrict !== 'ALL'
            ? `${selectedDistrict}, ${selectedState}`
            : `Districts in ${selectedState}`
        }
      >
        {visibleDistricts.length === 0 ? (
          <EmptyState title="No districts found" message="Try adjusting the state or district filter." />
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
                  <th className="pb-2 pr-4">High Risk</th>
                  <th className="pb-2">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleDistricts.map((d) => (
                  <tr
                    key={`${d.district}-${d.state}`}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedDistrict === d.district ? 'bg-blue-50' : ''
                    }`}
                    onClick={() =>
                      setSelectedDistrict(
                        selectedDistrict === d.district ? 'ALL' : d.district
                      )
                    }
                  >
                    <td className="py-2.5 pr-4 font-medium text-gray-800">{d.district}</td>
                    <td className="py-2.5 pr-4 hidden md:table-cell text-gray-500">{d.state}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{d.totalProjects}</td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell text-gray-600">
                      {formatCurrency(d.sanctionedAmount)}
                    </td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell text-gray-600">
                      {formatCurrency(d.expenditure)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`font-semibold ${
                          d.avgRiskScore >= 60
                            ? 'text-red-600'
                            : d.avgRiskScore >= 40
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {d.avgRiskScore}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600">{d.highRiskCount}</td>
                    <td className="py-2.5 text-gray-600">{d.completedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Projects in scope */}
      {scopedProjects.length > 0 && (
        <SectionCard
          title="Projects in Scope"
          subtitle={
            selectedDistrict !== 'ALL'
              ? `Projects in ${selectedDistrict}`
              : selectedState !== 'ALL'
              ? `Projects in ${selectedState}`
              : 'All projects (select a district or state to narrow)'
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4">Project</th>
                  <th className="pb-2 pr-4 hidden sm:table-cell">Type</th>
                  <th className="pb-2 pr-4 hidden md:table-cell">Sanctioned</th>
                  <th className="pb-2 pr-4 hidden md:table-cell">Expenditure</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {scopedProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-gray-800">{p.name}</td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell text-gray-500">{p.type}</td>
                    <td className="py-2.5 pr-4 hidden md:table-cell text-gray-600">
                      {formatCurrency(p.sanctionedAmount)}
                    </td>
                    <td className="py-2.5 pr-4 hidden md:table-cell text-gray-600">
                      {formatCurrency(p.expenditure)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : p.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-700'
                            : p.status === 'STALLED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`font-semibold text-xs ${
                          p.riskLevel === 'CRITICAL'
                            ? 'text-red-600'
                            : p.riskLevel === 'HIGH'
                            ? 'text-orange-600'
                            : p.riskLevel === 'MEDIUM'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {p.riskLevel} ({p.riskScore})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

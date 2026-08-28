// DATA SOURCE: [FIXTURE] SYNTHETIC_DEMO
// Replace with projectService.listProjects() once backend API is confirmed.

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import DataSourceBadge from '../components/DataSourceBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { FIXTURE_PROJECTS, formatCurrency } from '../utils/fixtures';

const PAGE_SIZE = 8;

const RISK_LEVELS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['ALL', 'COMPLETED', 'IN_PROGRESS', 'NOT_STARTED', 'STALLED'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: replace with projectService.listProjects() when backend is ready
    const timer = setTimeout(() => {
      try {
        setProjects(FIXTURE_PROJECTS);
      } catch {
        setError('Failed to load projects.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.state.toLowerCase().includes(search.toLowerCase()) ||
        p.district.toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === 'ALL' || p.riskLevel === riskFilter;
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchRisk && matchStatus;
    });
  }, [projects, search, riskFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  if (loading) return <LoadingState message="Loading projects…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Projects</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name, state, district…"
          value={search}
          onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-72"
          aria-label="Search projects"
        />
        <select
          value={riskFilter}
          onChange={(e) => handleFilterChange(setRiskFilter)(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          aria-label="Filter by risk level"
        >
          {RISK_LEVELS.map((r) => (
            <option key={r} value={r}>{r === 'ALL' ? 'All Risk Levels' : r}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {paginated.length === 0 ? (
          <EmptyState title="No projects match your filters" message="Try adjusting your search or filter criteria." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3 hidden md:table-cell">State / District</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Sanctioned</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Expenditure</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Source</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.type}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                      {p.state}
                      <br />
                      <span className="text-xs text-gray-400">{p.district}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-700">{formatCurrency(p.sanctionedAmount)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-700">{formatCurrency(p.expenditure)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={p.riskLevel} score={p.riskScore} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <DataSourceBadge source={p.dataSource} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {paginated.length > 0 && (
          <div className="px-4 pb-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

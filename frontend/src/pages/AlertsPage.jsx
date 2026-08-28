// DATA SOURCE: [FIXTURE] SYNTHETIC_DEMO
// Replace with alertService.listAlerts() and alertService.updateAlertStatus()
// once backend API contracts are confirmed.
// PATCH /api/alerts/:id/status is defined in backend routes — wire up when backend is ready.

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { FIXTURE_ALERTS, ALERT_SEVERITY_CONFIG, ALERT_STATUS_CONFIG } from '../utils/fixtures';

const SEVERITY_OPTIONS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUS_OPTIONS = ['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'FALSE_POSITIVE'];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: replace with alertService.listAlerts() when backend is ready
    const timer = setTimeout(() => {
      try {
        setAlerts(FIXTURE_ALERTS);
      } catch {
        setError('Failed to load alerts.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchSeverity && matchStatus;
    });
  }, [alerts, severityFilter, statusFilter]);

  // NOTE: Status update is wired to fixture state only.
  // TODO: call PATCH /api/alerts/:id/status when backend is ready.
  const handleStatusChange = (alertId, newStatus) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: newStatus, resolvedAt: ['RESOLVED', 'FALSE_POSITIVE'].includes(newStatus) ? new Date().toISOString() : null }
          : a
      )
    );
  };

  const NEXT_STATUS = {
    OPEN: ['UNDER_REVIEW'],
    UNDER_REVIEW: ['RESOLVED', 'FALSE_POSITIVE'],
    RESOLVED: [],
    FALSE_POSITIVE: [],
  };

  if (loading) return <LoadingState message="Loading alerts…" />;
  if (error) return <ErrorState message={error} />;

  const openCount = alerts.filter((a) => a.status === 'OPEN').length;
  const underReviewCount = alerts.filter((a) => a.status === 'UNDER_REVIEW').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Alerts</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {openCount} open · {underReviewCount} under review
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          aria-label="Filter by severity"
        >
          {SEVERITY_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Severities' : s}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <EmptyState title="No alerts match your filters" message="Try adjusting the severity or status filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const sevCfg = ALERT_SEVERITY_CONFIG[alert.severity] || ALERT_SEVERITY_CONFIG.LOW;
            const staCfg = ALERT_STATUS_CONFIG[alert.status] || ALERT_STATUS_CONFIG.OPEN;
            const nextStatuses = NEXT_STATUS[alert.status] || [];

            return (
              <div
                key={alert.id}
                className={`rounded-lg border ${sevCfg.border} bg-white p-4 shadow-sm`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Severity + type */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${sevCfg.bg} ${sevCfg.color}`}>
                        {sevCfg.label}
                      </span>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {alert.anomalyType.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-xs font-medium ${staCfg.color}`}>
                        {staCfg.label}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-sm font-medium text-gray-800">{alert.message}</p>

                    {/* Project link */}
                    <button
                      onClick={() => navigate(`/projects/${alert.projectId}`)}
                      className="mt-1 text-xs text-blue-600 hover:underline"
                    >
                      {alert.projectName} →
                    </button>

                    {/* Timestamps */}
                    <p className="mt-1 text-xs text-gray-400">
                      Raised: {new Date(alert.createdAt).toLocaleDateString('en-IN')}
                      {alert.resolvedAt && ` · Resolved: ${new Date(alert.resolvedAt).toLocaleDateString('en-IN')}`}
                    </p>
                  </div>

                  {/* Risk score */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">Risk Score</p>
                    <p className="text-lg font-bold text-gray-800">{alert.riskScore}</p>
                  </div>
                </div>

                {/* Status actions */}
                {nextStatuses.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                    {nextStatuses.map((ns) => (
                      <button
                        key={ns}
                        onClick={() => handleStatusChange(alert.id, ns)}
                        className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Mark as {ns.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

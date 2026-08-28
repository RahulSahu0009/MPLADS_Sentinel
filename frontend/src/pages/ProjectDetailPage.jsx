// DATA SOURCE: [FIXTURE] SYNTHETIC_DEMO
// Replace with projectService.getProjectById(), getProjectRisk(), getProjectAnomalies()
// once backend API contracts are confirmed.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import DataSourceBadge from '../components/DataSourceBadge';
import SectionCard from '../components/SectionCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import FinancialTrendChart from '../charts/FinancialTrendChart';
import { FIXTURE_PROJECT_DETAIL, FIXTURE_PROJECTS, formatCurrency } from '../utils/fixtures';

const ANOMALY_SEVERITY_COLORS = {
  HIGH: 'border-l-orange-500 bg-orange-50',
  MEDIUM: 'border-l-yellow-500 bg-yellow-50',
  LOW: 'border-l-blue-500 bg-blue-50',
  CRITICAL: 'border-l-red-500 bg-red-50',
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: replace with projectService.getProjectById(id) + risk + anomalies when backend is ready
    const timer = setTimeout(() => {
      try {
        // Use detail fixture for p1, otherwise build from list fixture
        if (id === 'p1') {
          setProject(FIXTURE_PROJECT_DETAIL);
        } else {
          const found = FIXTURE_PROJECTS.find((p) => p.id === id);
          if (!found) {
            setError('Project not found.');
          } else {
            setProject({
              ...found,
              description: `${found.type} project in ${found.district}, ${found.state}.`,
              mp: 'Demo MP Name',
              agency: 'District Implementation Agency',
              startDate: found.createdAt,
              expectedCompletionDate: null,
              actualCompletionDate: found.status === 'COMPLETED' ? found.createdAt : null,
              progressPercent: found.status === 'COMPLETED' ? 100 : found.status === 'NOT_STARTED' ? 0 : 55,
              riskReasons: found.riskLevel !== 'LOW' ? ['Risk indicators detected. Detailed analysis pending backend integration.'] : [],
              anomalies: [],
              financialRecords: [
                { period: 'Initial', sanctioned: found.sanctionedAmount, released: found.expenditure, expenditure: found.expenditure },
              ],
              progressRecords: [],
            });
          }
        }
      } catch {
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) return <LoadingState message="Loading project details…" />;
  if (error) return <ErrorState message={error} />;
  if (!project) return <ErrorState message="Project not found." />;

  const utilizationPct = project.sanctionedAmount > 0
    ? ((project.expenditure / project.sanctionedAmount) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        ← Back to Projects
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{project.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={project.status} />
            <RiskBadge level={project.riskLevel} score={project.riskScore} />
            <DataSourceBadge source={project.dataSource} />
          </div>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SectionCard title="Project Information">
          <dl className="space-y-2 text-sm">
            {[
              ['State', project.state],
              ['District', project.district],
              ['Constituency', project.constituency],
              ['MP', project.mp],
              ['Implementing Agency', project.agency],
              ['Project Type', project.type],
              ['Start Date', project.startDate || '—'],
              ['Expected Completion', project.expectedCompletionDate || '—'],
              ['Actual Completion', project.actualCompletionDate || 'Pending'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-800 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Financial Summary">
          <dl className="space-y-2 text-sm">
            {[
              ['Sanctioned Amount', formatCurrency(project.sanctionedAmount)],
              ['Total Expenditure', formatCurrency(project.expenditure)],
              ['Utilization Rate', `${utilizationPct}%`],
              ['Physical Progress', `${project.progressPercent}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>Physical Progress</span>
              <span>{project.progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${project.progressPercent}%` }}
                role="progressbar"
                aria-valuenow={project.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Financial trend */}
      {project.financialRecords?.length > 0 && (
        <SectionCard title="Financial Trend" subtitle="Released vs Expenditure over reporting periods">
          <FinancialTrendChart data={project.financialRecords} loading={false} error={null} />
        </SectionCard>
      )}

      {/* Risk evidence */}
      {project.riskReasons?.length > 0 && (
        <SectionCard
          title="Risk Indicators"
          subtitle="Evidence-based signals contributing to the risk score. This does not constitute a fraud determination."
        >
          <ul className="space-y-2">
            {project.riskReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-800 border border-orange-200">
                {reason}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Anomalies */}
      <SectionCard
        title="Detected Anomalies"
        subtitle={`${project.anomalies?.length || 0} anomaly signal(s) detected by the rule engine`}
      >
        {!project.anomalies?.length ? (
          <p className="text-sm text-gray-500">No anomalies detected for this project.</p>
        ) : (
          <div className="space-y-3">
            {project.anomalies.map((a) => (
              <div
                key={a.id}
                className={`rounded-md border-l-4 p-4 ${ANOMALY_SEVERITY_COLORS[a.severity] || 'border-l-gray-400 bg-gray-50'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-sm text-gray-800">{a.type.replace(/_/g, ' ')}</p>
                  <span className="text-xs font-medium text-gray-500">Rule: {a.ruleId}</span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{a.message}</p>
                {a.evidence && (
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-medium">Evidence:</span> {a.evidence}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Progress records */}
      {project.progressRecords?.length > 0 && (
        <SectionCard title="Progress History">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-6">Date</th>
                  <th className="pb-2 pr-6">Progress</th>
                  <th className="pb-2">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {project.progressRecords.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-6 text-gray-600">{r.date}</td>
                    <td className="py-2 pr-6 font-medium text-gray-800">{r.progressPercent}%</td>
                    <td className="py-2 text-gray-600">{r.remarks}</td>
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

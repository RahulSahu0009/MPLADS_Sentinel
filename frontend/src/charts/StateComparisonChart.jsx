import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

export default function StateComparisonChart({ data, loading, error, metric = 'avgRiskScore' }) {
  if (loading) return <LoadingState />;
  if (error) return <EmptyState title="Chart unavailable" message={error} />;
  if (!data || !data.length) return <EmptyState title="No state data" />;

  const METRIC_CONFIG = {
    avgRiskScore: { label: 'Avg Risk Score', color: '#f97316' },
    highRiskCount: { label: 'High Risk Projects', color: '#ef4444' },
    totalProjects: { label: 'Total Projects', color: '#3b82f6' },
    completedCount: { label: 'Completed', color: '#22c55e' },
  };
  const cfg = METRIC_CONFIG[metric] || METRIC_CONFIG.avgRiskScore;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="state"
          tick={{ fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          interval={0}
          height={90}
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend verticalAlign="top" height={36} />
        <Bar dataKey={metric} name={cfg.label} fill={cfg.color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

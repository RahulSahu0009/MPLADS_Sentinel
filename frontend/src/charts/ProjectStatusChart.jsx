import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const STATUS_COLORS = { COMPLETED: '#22c55e', IN_PROGRESS: '#3b82f6', NOT_STARTED: '#94a3b8', STALLED: '#ef4444' };

export default function ProjectStatusChart({ data, loading, error }) {
  if (loading) return <LoadingState />;
  if (error) return <EmptyState title="Chart unavailable" message={error} />;

  const chartData = data
    ? Object.entries(data).map(([name, value]) => ({ name: name.replace('_', ' '), value, key: name }))
    : [];

  if (!chartData.length) return <EmptyState title="No status data" />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="value" name="Projects" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || '#94a3b8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

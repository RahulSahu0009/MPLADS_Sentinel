import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';

const COLORS = { LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444' };

export default function RiskDistributionChart({ data, loading, error }) {
  if (loading) return <LoadingState />;
  if (error) return <EmptyState title="Chart unavailable" message={error} />;

  const chartData = data
    ? Object.entries(data).map(([name, value]) => ({ name, value }))
    : [];

  if (!chartData.length || chartData.every((d) => d.value === 0)) {
    return <EmptyState title="No risk data" message="Risk distribution data is not available." />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, 'Projects']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

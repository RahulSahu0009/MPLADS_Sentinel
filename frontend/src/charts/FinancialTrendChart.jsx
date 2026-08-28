import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/fixtures';

export default function FinancialTrendChart({ data, loading, error }) {
  if (loading) return <LoadingState />;
  if (error) return <EmptyState title="Chart unavailable" message={error} />;
  if (!data || !data.length) return <EmptyState title="No financial records" />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} width={80} />
        <Tooltip formatter={(v) => formatCurrency(v)} />
        <Legend />
        <Line type="monotone" dataKey="released" name="Released" stroke="#3b82f6" strokeWidth={2} dot />
        <Line type="monotone" dataKey="expenditure" name="Expenditure" stroke="#f97316" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}

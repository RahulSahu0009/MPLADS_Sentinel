export default function KpiCard({ title, value, subtitle, accent = 'blue' }) {
  const accents = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    yellow: 'border-yellow-500 bg-yellow-50',
    red: 'border-red-500 bg-red-50',
    orange: 'border-orange-500 bg-orange-50',
  };
  return (
    <div className={`rounded-lg border-l-4 bg-white p-5 shadow-sm ${accents[accent] || accents.blue}`}>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

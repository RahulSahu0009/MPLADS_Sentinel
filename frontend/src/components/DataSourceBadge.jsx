export default function DataSourceBadge({ source }) {
  if (source === 'OFFICIAL_MPLADS') {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
        Official MoSPI Data
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
      Synthetic Demo Data
    </span>
  );
}

export default function EmptyState({ title = 'No data found', message = 'There is nothing to display here yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
      <svg className="mb-3 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2M9 17H5a2 2 0 01-2-2v-1a7 7 0 017-7h4a7 7 0 017 7v1a2 2 0 01-2 2h-4" />
      </svg>
      <p className="font-medium text-gray-600">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}

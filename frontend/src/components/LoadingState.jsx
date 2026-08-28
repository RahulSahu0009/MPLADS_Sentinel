export default function LoadingState({ message = 'Loading data…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg className="mb-3 h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-gray-100 px-5 py-4">
          {title && <h2 className="text-base font-semibold text-gray-800">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

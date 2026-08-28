import { RISK_LEVEL_CONFIG } from '../utils/fixtures';

export default function RiskBadge({ level, score }) {
  const cfg = RISK_LEVEL_CONFIG[level] || RISK_LEVEL_CONFIG.LOW;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}{score !== undefined ? ` (${score})` : ''}
    </span>
  );
}

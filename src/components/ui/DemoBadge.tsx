import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DemoBadgeProps {
  /** Optionally show a longer descriptive label */
  verbose?: boolean;
  className?: string;
}

/**
 * DemoBadge — amber pill badge indicating simulated/demo data.
 * Renders: ⚠ DEMO DATA — Simulated dataset
 */
const DemoBadge: React.FC<DemoBadgeProps> = ({ verbose = true, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        bg-amber-500/10 border border-amber-500/30
        text-amber-400 text-xs font-semibold tracking-wide
        select-none whitespace-nowrap ${className}`}
      title="This application uses simulated demo data only."
    >
      <AlertTriangle className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
      <span>DEMO DATA</span>
      {verbose && (
        <span className="text-amber-500/70 font-normal">— Simulated dataset</span>
      )}
    </span>
  );
};

export default DemoBadge;

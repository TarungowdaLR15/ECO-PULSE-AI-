import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import DemoBadge from './DemoBadge';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'emerald' | 'warning' | 'danger' | 'blue';
  isDemo?: boolean;
  className?: string;
}

/** Map color tokens to Tailwind classes */
const colorMap: Record<NonNullable<StatCardProps['color']>, {
  icon: string;
  glow: string;
  trendPos: string;
  trendNeg: string;
  border: string;
}> = {
  emerald: {
    icon:     'bg-emerald-500/15 text-emerald-400',
    glow:     'shadow-emerald-500/10',
    trendPos: 'text-emerald-400',
    trendNeg: 'text-red-400',
    border:   'border-emerald-500/20',
  },
  warning: {
    icon:     'bg-amber-500/15 text-amber-400',
    glow:     'shadow-amber-500/10',
    trendPos: 'text-emerald-400',
    trendNeg: 'text-red-400',
    border:   'border-amber-500/20',
  },
  danger: {
    icon:     'bg-red-500/15 text-red-400',
    glow:     'shadow-red-500/10',
    trendPos: 'text-emerald-400',
    trendNeg: 'text-red-400',
    border:   'border-red-500/20',
  },
  blue: {
    icon:     'bg-blue-500/15 text-blue-400',
    glow:     'shadow-blue-500/10',
    trendPos: 'text-emerald-400',
    trendNeg: 'text-red-400',
    border:   'border-blue-500/20',
  },
};

/**
 * Animates a numeric value from 0 to `target` over `duration` ms
 * using requestAnimationFrame for a smooth count-up effect.
 */
function useCountUp(target: number, duration = 1200): number {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset and start animation
    startTimeRef.current = null;
    setDisplayed(0);

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return displayed;
}

/**
 * StatCard — glass card displaying a key metric with optional trend and
 * count-up animation for numeric values.
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'emerald',
  isDemo = false,
  className = '',
}) => {
  const colors = colorMap[color];
  const isNumeric = typeof value === 'number';
  const animatedValue = useCountUp(isNumeric ? (value as number) : 0);

  const displayValue = isNumeric ? animatedValue : value;

  const TrendIcon =
    !trend ? null
    : trend.value > 0 ? TrendingUp
    : trend.value < 0 ? TrendingDown
    : Minus;

  const trendClass =
    !trend ? ''
    : trend.value > 0 ? colors.trendPos
    : trend.value < 0 ? colors.trendNeg
    : 'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`
        relative group
        bg-[#0D1F14]/80 backdrop-blur-md
        border ${colors.border}
        rounded-2xl p-5
        shadow-lg ${colors.glow}
        hover:border-opacity-40
        transition-all duration-300
        ${className}
      `}
    >
      {/* Top row: icon + demo badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colors.icon}`}>
          {icon}
        </div>
        {isDemo && <DemoBadge verbose={false} />}
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className="text-3xl font-bold text-white tracking-tight tabular-nums">
          {displayValue}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm text-slate-400 font-medium mb-2">{title}</p>

      {/* Subtitle + Trend row */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>
        )}
        {trend && TrendIcon && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendClass}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-slate-500 font-normal ml-0.5">{trend.label}</span>
            )}
          </div>
        )}
      </div>

      {/* Subtle hover glow overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
          transition-opacity duration-300 pointer-events-none
          bg-gradient-to-br from-white/[0.02] to-transparent"
      />
    </motion.div>
  );
};

export default StatCard;

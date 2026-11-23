import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  caption: string;
  icon: LucideIcon;
  accentColor: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  caption,
  icon: Icon,
  accentColor,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
          {label}
        </span>
        <Icon className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums">{value}</span>
        {unit && <span className="font-mono text-xs text-[#94A3B8]">{unit}</span>}
      </div>
      <p className="mt-1.5 text-xs text-[#94A3B8]">{caption}</p>
    </div>
  );
};

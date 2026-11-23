import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentFrom: string;
  accentTo: string;
  onClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  accentFrom,
  accentTo,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`group relative flex flex-col rounded-2xl border border-slate-800/90 bg-[#141C31]/75 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8B5CF6]/50 hover:bg-[#141C31] ${
        onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]' : ''
      }`}
    >
      <div
        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10"
        style={{
          background: `linear-gradient(135deg, ${accentFrom}28, ${accentTo}20)`,
        }}
      >
        <Icon className="h-5 w-5" style={{ color: accentFrom }} />
      </div>

      <h3 className="font-display text-lg font-semibold text-[#F8FAFC] group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-[#94A3B8]">{description}</p>
    </div>
  );
};

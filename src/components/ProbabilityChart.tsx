import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ClassProbabilities, TumorCategory } from '../types/mri';
import { CATEGORY_META, TUMOR_CATEGORIES } from '../data/mockResearchData';

interface ProbabilityChartProps {
  probabilities: ClassProbabilities;
  predictedClass: TumorCategory;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  probabilities,
  predictedClass,
}) => {
  const [hovered, setHovered] = useState<TumorCategory | null>(null);

  const sortedCategories = [...TUMOR_CATEGORIES].sort(
    (a, b) => probabilities[b] - probabilities[a]
  );

  const totalSum = TUMOR_CATEGORIES.reduce((acc, c) => acc + probabilities[c], 0);

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/85 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
            Class Probability Distribution
          </h3>
          <p className="mt-0.5 text-xs text-[#94A3B8]">
            Normalized softmax distribution across all 4 MRI classes (Demo Mode)
          </p>
        </div>
        <span className="font-mono text-xs text-[#94A3B8] tabular-nums">
          Sum: {totalSum.toFixed(1)}%
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {sortedCategories.map((category) => {
          const pct = probabilities[category];
          const meta = CATEGORY_META[category];
          const isTop = category === predictedClass;
          const isHovered = hovered === category;

          return (
            <div
              key={category}
              onMouseEnter={() => setHovered(category)}
              onMouseLeave={() => setHovered(null)}
              className={`rounded-xl border p-3 transition-colors ${
                isHovered
                  ? 'border-slate-700 bg-[#101629]'
                  : 'border-transparent bg-[#080B16]/55'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: meta.color }}
                    aria-hidden="true"
                  />
                  <span
                    className={`font-medium ${
                      isTop ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {category}
                  </span>
                  {isTop && (
                    <span
                      className="font-mono text-[11px] font-medium"
                      style={{ color: meta.color }}
                    >
                      Top Prediction
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm font-semibold text-[#F8FAFC] tabular-nums">
                  {pct.toFixed(1)}%
                </span>
              </div>

              <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[#101629]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(1.2, pct)}%` }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
                />
              </div>

              {isHovered && (
                <p className="mt-2 text-xs text-[#94A3B8]">{meta.shortDesc}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

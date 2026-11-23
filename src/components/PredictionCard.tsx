import React from 'react';
import { motion } from 'motion/react';
import { Eye, GitCompare, Info } from 'lucide-react';
import { AnalysisCase } from '../types/mri';
import { CATEGORY_META } from '../data/mockResearchData';

interface PredictionCardProps {
  analysis: AnalysisCase;
  onInspectGradCAM: () => void;
  onCompareModels: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  analysis,
  onInspectGradCAM,
  onCompareModels,
}) => {
  const meta = CATEGORY_META[analysis.predictedClass];
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analysis.confidence / 100) * circumference;

  const confidenceTier =
    analysis.confidence >= 94
      ? 'High Simulated Consensus'
      : analysis.confidence >= 85
      ? 'Moderate Simulated Consensus'
      : 'Review Recommended (Simulated)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-[#141C31] p-6"
      style={{
        boxShadow: `0 0 36px ${meta.color}18`,
      }}
    >
      {/* Top Disclosure Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <p className="font-mono text-xs font-semibold tracking-wide text-[#22D3EE]">
            DEMO MODE · SIMULATED ENSEMBLE OUTPUT
          </p>
          <p className="mt-0.5 text-xs text-[#94A3B8]">
            Case {analysis.id} · {analysis.plane} · {analysis.ensembleProcessingTimeMs} ms
          </p>
        </div>
        <span className="font-mono text-xs font-medium text-[#F8FAFC]">
          {analysis.status}
        </span>
      </div>

      {/* Main Predicted Class + Circular Confidence Ring */}
      <div className="mt-6 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-2.5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
            Predicted Classification
          </p>
          <div className="flex items-baseline gap-3">
            <h2
              className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
              style={{ color: meta.color }}
            >
              {analysis.predictedClass}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#94A3B8]">{meta.shortDesc}</p>

          {/* Confidence Bar */}
          <div className="pt-2 max-w-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">{confidenceTier}</span>
              <span className="font-mono font-semibold text-[#F8FAFC] tabular-nums">
                {analysis.confidence.toFixed(1)}%
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#080B16]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${analysis.confidence}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
              />
            </div>
          </div>
        </div>

        {/* Circular Progress SVG Visualization */}
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center self-center sm:self-auto">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 124 124" aria-hidden="true">
            <circle
              cx="62"
              cy="62"
              r={radius}
              stroke="#080B16"
              strokeWidth="10"
              fill="none"
            />
            <motion.circle
              cx="62"
              cy="62"
              r={radius}
              stroke={meta.color}
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums">
              {analysis.confidence.toFixed(1)}%
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
              Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Explicit Demo Safety Disclaimer */}
      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-slate-800 bg-[#080B16]/75 p-3 text-xs text-[#94A3B8]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
        <span>
          Simulated result generated in browser DEMO MODE. Not connected to a clinical diagnostic
          model and must not be used for medical decision-making.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onInspectGradCAM}
          className="nv-gradient-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all whitespace-nowrap cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          Open Grad-CAM Visualization
        </button>
        <button
          type="button"
          onClick={onCompareModels}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#101629] px-4 py-2.5 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6]/60 transition-colors whitespace-nowrap cursor-pointer"
        >
          <GitCompare className="h-4 w-4 text-[#A855F7]" />
          Compare 3 Backbones
        </button>
      </div>
    </motion.div>
  );
};

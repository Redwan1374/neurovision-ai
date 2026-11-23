import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export const ANALYSIS_STAGES = [
  {
    id: 0,
    title: 'Preparing image',
    subtitle: 'Validating image buffer, dimensions, and cranial ROI bounds',
  },
  {
    id: 1,
    title: 'Processing MRI',
    subtitle: 'Applying radiological intensity normalization and tensor resizing',
  },
  {
    id: 2,
    title: 'Running model analysis',
    subtitle: 'Evaluating EfficientNetV2-M, DenseNet201, ConvNeXt-Base & Ensemble',
  },
  {
    id: 3,
    title: 'Generating insights',
    subtitle: 'Normalizing 4-class probabilities and computing illustrative Grad-CAM map',
  },
];

interface AnalysisLoadingOverlayProps {
  currentStage: number;
  fileName: string;
}

export const AnalysisLoadingOverlay: React.FC<AnalysisLoadingOverlayProps> = ({
  currentStage,
  fileName,
}) => {
  const progressPct = Math.min(100, Math.round(((currentStage + 0.65) / ANALYSIS_STAGES.length) * 100));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-2xl border border-[#8B5CF6]/45 bg-[#141C31]/95 p-6 sm:p-8 shadow-[0_0_40px_rgba(139,92,246,0.18)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold text-[#22D3EE]">
            DEMO SIMULATION PIPELINE IN PROGRESS
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-[#F8FAFC]">
            Analyzing {fileName}
          </h3>
        </div>
        <span className="font-mono text-sm font-bold text-[#A855F7] tabular-nums">
          {progressPct}%
        </span>
      </div>

      {/* Smooth progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#080B16]">
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE]"
        />
      </div>

      {/* Stage checklist */}
      <div className="mt-6 space-y-3">
        {ANALYSIS_STAGES.map((stage) => {
          const isDone = stage.id < currentStage;
          const isCurrent = stage.id === currentStage;
          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                isCurrent
                  ? 'border-[#8B5CF6]/55 bg-[#8B5CF6]/12'
                  : isDone
                  ? 'border-slate-800/80 bg-[#080B16]/55'
                  : 'border-transparent bg-[#080B16]/30 opacity-55'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#22D3EE]" />
                ) : (
                  <span className="inline-block h-4 w-4 rounded-full border border-slate-700" />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent || isDone ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'
                  }`}
                >
                  {stage.title}
                </p>
                <p className="mt-0.5 text-[11px] text-[#94A3B8]">{stage.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

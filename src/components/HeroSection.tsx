import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { HeroBrainVisual } from './HeroBrainVisual';

interface HeroSectionProps {
  onStartAnalysis: () => void;
  onExploreResearch: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartAnalysis,
  onExploreResearch,
}) => {
  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-slate-800/60 pb-20 pt-14 sm:pt-20 lg:pb-28 lg:pt-24"
    >
      {/* Subtle ambient background gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-[#8B5CF6]/12 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/6 top-24 h-[360px] w-[360px] rounded-full bg-[#22D3EE]/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Narrative Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <p className="text-sm font-medium text-[#22D3EE]">
              See Beyond the Scan. Understand the Brain.
            </p>

            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-5xl lg:text-[54px] lg:leading-[1.08]">
              Advanced Brain{' '}
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] bg-clip-text text-transparent">
                MRI Intelligence
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
              Explore brain MRI scans through intelligent AI classification, transparent
              predictions, and explainable visual insights. Built for neuroimaging researchers to
              compare multi-backbone ensembles and inspect Grad-CAM spatial attribution.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartAnalysis}
                className="nv-gradient-btn inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                Analyze MRI
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onExploreResearch}
                className="inline-flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-[#141C31]/80 px-6 py-3.5 text-sm font-semibold text-[#F8FAFC] transition-colors hover:border-[#8B5CF6]/60 hover:bg-[#141C31] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-[#22D3EE]" />
                Explore Research
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-800/80 pt-6 text-xs text-[#94A3B8]">
              <span>4 Classification Categories</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span>3 Deep Vision Backbones</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span>Interactive Grad-CAM Demo</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-[#A855F7]">Research Demonstration Platform</span>
            </div>
          </motion.div>

          {/* Right Visual Composition Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 lg:pb-6"
          >
            <HeroBrainVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

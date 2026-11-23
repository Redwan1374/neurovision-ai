import React from 'react';
import {
  Brain,
  Layers,
  Eye,
  BarChart3,
  GitCompare,
  ShieldCheck,
  Database,
  Cpu,
  CheckSquare,
  ScanLine,
  ArrowRight,
  Microscope,
} from 'lucide-react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeatureCard } from './FeatureCard';
import { Footer } from './Footer';
import { DashboardTab, ResearcherProfile } from '../types/mri';

interface LandingPageProps {
  onNavigateDashboard: (tab: DashboardTab) => void;
  onOpenSignIn: () => void;
  researcher: ResearcherProfile;
  onNotify: (title: string, message?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateDashboard,
  onOpenSignIn,
  researcher,
  onNotify,
}) => {
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'Intelligent MRI Classification',
      description:
        'Structured four-class brain MRI classification across Glioma, Meningioma, Pituitary, and No Tumor categories with calibrated confidence outputs.',
      accentFrom: '#8B5CF6',
      accentTo: '#3B82F6',
      tab: 'analyze' as DashboardTab,
    },
    {
      icon: Layers,
      title: 'Multi-Model AI Analysis',
      description:
        'Parallel evaluation across EfficientNetV2-M, DenseNet201, and ConvNeXt-Base backbones aggregated via a transparent soft-voting ensemble.',
      accentFrom: '#22D3EE',
      accentTo: '#3B82F6',
      tab: 'models' as DashboardTab,
    },
    {
      icon: Eye,
      title: 'Explainable AI Visualization',
      description:
        'Interactive Grad-CAM spatial attention overlays with opacity scrubbing, side-by-side views, and split comparison sliders for visual interpretability.',
      accentFrom: '#A855F7',
      accentTo: '#EC4899',
      tab: 'explainability' as DashboardTab,
    },
    {
      icon: BarChart3,
      title: 'Confidence & Probability Insights',
      description:
        'Normalized class-wise probability distributions summing to 100% with per-backbone variance inspection to surface prediction uncertainty.',
      accentFrom: '#3B82F6',
      accentTo: '#22D3EE',
      tab: 'analyze' as DashboardTab,
    },
    {
      icon: GitCompare,
      title: 'Model Performance Comparison',
      description:
        'Interactive research analytics comparing Accuracy, Precision, Recall, F1-Score, and AUC across individual architectures and ensemble models.',
      accentFrom: '#10B981',
      accentTo: '#22D3EE',
      tab: 'models' as DashboardTab,
    },
    {
      icon: ShieldCheck,
      title: 'Research Transparency',
      description:
        'Clear separation between simulated demonstration outputs and clinical evidence, with full preprocessing and validation pipeline documentation.',
      accentFrom: '#F59E0B',
      accentTo: '#A855F7',
      tab: 'research' as DashboardTab,
    },
  ];

  const researchPillars = [
    {
      icon: Microscope,
      step: '01',
      title: 'Research Methodology',
      summary:
        'Standardized multi-architecture transfer learning framework designed to evaluate structural brain MRI slices under consistent preprocessing and cross-validation protocols.',
    },
    {
      icon: Database,
      step: '02',
      title: 'Dataset Overview',
      summary:
        'Structured around four balanced neuroimaging cohorts (Glioma, Meningioma, Pituitary, No Tumor) spanning axial, coronal, and sagittal T1/FLAIR MRI planes.',
    },
    {
      icon: Cpu,
      step: '03',
      title: 'Model Architecture',
      summary:
        'Combines complementary inductive biases: compound-scaled EfficientNetV2-M, feature-reusing DenseNet201, and large-kernel ConvNeXt-Base fused via weighted ensemble.',
    },
    {
      icon: ScanLine,
      step: '04',
      title: 'Explainability Methods',
      summary:
        'Gradient-weighted Class Activation Mapping (Grad-CAM) projects final convolutional gradients back to spatial coordinates to inspect model attention regions.',
    },
    {
      icon: CheckSquare,
      step: '05',
      title: 'Validation Strategy',
      summary:
        'Stratified subject-level cross-validation preventing slice leakage, tracked across macro F1, per-class sensitivity, ROC-AUC, and calibration error.',
    },
  ];

  const stats = [
    {
      value: '4',
      unit: 'Classes',
      label: 'MRI Classification Categories',
      detail: 'Glioma, Meningioma, Pituitary, and No Tumor control cohort',
      accent: 'text-[#8B5CF6]',
    },
    {
      value: '3',
      unit: 'Backbones',
      label: 'AI Model Architectures',
      detail: 'EfficientNetV2-M, DenseNet201, and ConvNeXt-Base',
      accent: 'text-[#22D3EE]',
    },
    {
      value: 'Ensemble',
      unit: 'Soft-Vote',
      label: 'Multi-Model Analysis',
      detail: 'Independent model predictions fused into a distinct ensemble output',
      accent: 'text-[#3B82F6]',
    },
    {
      value: 'Grad-CAM',
      unit: 'XAI Layer',
      label: 'Explainability Support',
      detail: 'Interactive spatial activation heatmaps with opacity and split controls',
      accent: 'text-[#A855F7]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080B16] text-[#F8FAFC]">
      <Navbar
        onNavigateDashboard={onNavigateDashboard}
        onScrollToSection={scrollToSection}
        onOpenSignIn={onOpenSignIn}
        researcher={researcher}
      />

      <main>
        <HeroSection
          onStartAnalysis={() => onNavigateDashboard('analyze')}
          onExploreResearch={() => scrollToSection('research-overview')}
        />

        {/* Platform Capabilities / Features Section */}
        <section className="py-20 lg:py-24 border-b border-slate-800/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-widest text-[#22D3EE]">
                Platform Capabilities
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl">
                Built for transparent neuroimaging AI exploration
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#94A3B8]">
                Every module in NeuroVision AI connects scan visualization, multi-model inference
                comparison, and spatial interpretability inside one unified research workspace.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feat) => (
                <FeatureCard
                  key={feat.title}
                  icon={feat.icon}
                  title={feat.title}
                  description={feat.description}
                  accentFrom={feat.accentFrom}
                  accentTo={feat.accentTo}
                  onClick={() => onNavigateDashboard(feat.tab)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Research Overview Section */}
        <section
          id="research-overview"
          className="relative py-20 lg:py-24 bg-[#101629]/55 border-b border-slate-800/60"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-widest text-[#A855F7]">
                  Research Architecture
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl">
                  Structured methodology from MRI slice to explainable output
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#94A3B8]">
                  Inspired by peer-reviewed deep learning pipelines for brain tumor classification,
                  the architecture emphasizes preprocessing rigor, multi-backbone diversity, and
                  post-hoc visual verification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateDashboard('research')}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-700/80 bg-[#141C31] px-5 py-2.5 text-sm font-medium text-[#F8FAFC] hover:border-[#8B5CF6]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open Full Research Insights
                <ArrowRight className="h-4 w-4 text-[#22D3EE]" />
              </button>
            </div>

            {/* 5-Pillar Research Grid */}
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
              {researchPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex flex-col rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-5 transition-colors hover:border-[#8B5CF6]/45"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#22D3EE]">
                        {pillar.step}
                      </span>
                      <Icon className="h-4 w-4 text-[#8B5CF6]" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-[#F8FAFC]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-[#94A3B8]">
                      {pillar.summary}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Compact End-to-End Pipeline Ribbon */}
            <div className="mt-8 rounded-2xl border border-slate-800/80 bg-[#080B16]/80 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
                {[
                  'MRI Input',
                  'ROI & Normalization',
                  '3-Backbone Feature Extraction',
                  'Ensemble Soft-Voting',
                  'Grad-CAM Attribution',
                ].map((stage, idx, arr) => (
                  <React.Fragment key={stage}>
                    <div className="flex items-center gap-2 text-[#F8FAFC]">
                      <span className="font-mono text-[#8B5CF6]">{idx + 1}.</span>
                      <span>{stage}</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <ArrowRight
                        className="hidden h-3.5 w-3.5 text-slate-600 md:block"
                        aria-hidden="true"
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Architecture & Demo Statistics Section */}
        <section className="py-20 lg:py-24 border-b border-slate-800/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-[#22D3EE]">
                  System Specifications
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F8FAFC]">
                  Multi-architecture analysis framework
                </h2>
              </div>
              <p className="font-mono text-xs text-[#94A3B8]">
                Demo Mode Platform Specs · Illustrative Metrics Clearly Labeled
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-800/90 bg-[#141C31]/75 p-6"
                >
                  <div className="flex items-baseline gap-2">
                    <span className={`font-mono text-3xl font-bold tabular-nums ${stat.accent}`}>
                      {stat.value}
                    </span>
                    <span className="font-mono text-xs text-[#94A3B8]">{stat.unit}</span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-[#F8FAFC]">
                    {stat.label}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#94A3B8]">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About & CTA Section */}
        <section id="about" className="py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#141C31] via-[#101629] to-[#080B16] p-8 sm:p-12">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <p className="text-xs font-medium uppercase tracking-widest text-[#8B5CF6]">
                    About NeuroVision AI
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
                    Advancing interpretable medical imaging interfaces with scientific integrity
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#94A3B8] sm:text-base">
                    NeuroVision AI demonstrates how modern neuroimaging software can pair high-precision
                    radiological viewers with multi-model transparency and explainable attention maps.
                    Because no live diagnostic model backend is attached in this browser preview, every
                    prediction and benchmark figure operates in clearly disclosed DEMO MODE.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:items-end">
                  <button
                    type="button"
                    onClick={() => onNavigateDashboard('analyze')}
                    className="nv-gradient-btn inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all whitespace-nowrap shrink-0 cursor-pointer lg:w-64"
                  >
                    Launch Analysis Workspace
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateDashboard('explainability')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-[#080B16]/80 px-6 py-3 text-sm font-medium text-[#F8FAFC] hover:border-[#22D3EE]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer lg:w-64"
                  >
                    Inspect Grad-CAM Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer
        onNavigateDashboard={onNavigateDashboard}
        onScrollToSection={scrollToSection}
        onNotify={onNotify}
      />
    </div>
  );
};

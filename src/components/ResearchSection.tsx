import React, { useState } from 'react';
import {
  ArrowRight,
  Cpu,
  Eye,
  BarChart3,
  GitCompare,
  Sparkles,
  Upload,
  Crop,
  Sliders,
  Binary,
  Layers,
} from 'lucide-react';
import { CATEGORY_META, TUMOR_CATEGORIES } from '../data/mockResearchData';
import { getIllustrativeSampleMRI } from '../utils/mriRenderer';

interface ArchitectureStage {
  id: string;
  label: string;
  shortSpec: string;
  description: string;
  tensorShape: string;
  details: string;
}

const ARCHITECTURE_STAGES: ArchitectureStage[] = [
  {
    id: 'input',
    label: 'MRI Input',
    shortSpec: 'Raw 2D Slice',
    description: 'Structural brain MRI scan acquired in axial, coronal, or sagittal orientation.',
    tensorShape: 'H × W × 3 (RGB / Grayscale)',
    details:
      'Supports standard T1-weighted contrast-enhanced, T2, and FLAIR slices exported as lossless PNG or high-quality JPEG.',
  },
  {
    id: 'preprocess',
    label: 'Image Preprocessing',
    shortSpec: 'ROI & Norm',
    description: 'Cranial region-of-interest cropping, contrast normalization, and tensor resizing.',
    tensorShape: '384 × 384 × 3 (Float32)',
    details:
      'Removes extraneous black scanner margins, applies intensity standardization, and normalizes pixel distributions to ImageNet/MRI channel statistics.',
  },
  {
    id: 'features',
    label: 'Feature Extraction',
    shortSpec: '3 Backbones',
    description:
      'Parallel convolutional feature pyramids via EfficientNetV2-M, DenseNet201, and ConvNeXt-Base.',
    tensorShape: '12 × 12 × C Feature Maps',
    details:
      'Each backbone captures complementary representations: fine edge transitions (DenseNet), compound multi-scale textures (EfficientNetV2), and wide-context morphology (ConvNeXt).',
  },
  {
    id: 'predictions',
    label: 'Model Predictions',
    shortSpec: 'Per-Model Softmax',
    description: 'Global average pooling followed by regularized classification heads for 4 classes.',
    tensorShape: '3 × [4] Probabilities',
    details:
      'Each architecture emits independent calibrated class probabilities alongside diagnostic latency metrics so researchers can inspect inter-model agreement.',
  },
  {
    id: 'ensemble',
    label: 'Ensemble Analysis',
    shortSpec: 'Soft Voting',
    description: 'Weighted probability aggregation reducing single-model variance on borderline scans.',
    tensorShape: '[4] Aggregated Vector',
    details:
      'Combines backbone probability vectors using configurable validation-derived weights (default 35% EfficientNetV2-M, 25% DenseNet201, 40% ConvNeXt-Base).',
  },
  {
    id: 'classification',
    label: 'Final Classification',
    shortSpec: 'Top Class + CI',
    description: 'Argmax prediction accompanied by full 4-class probability distribution transparency.',
    tensorShape: 'Class ∈ {0, 1, 2, 3}',
    details:
      'Reports top predicted category (Glioma, Meningioma, Pituitary, or No Tumor) along with full class probabilities summing to 100%.',
  },
  {
    id: 'explainability',
    label: 'Explainability Visualization',
    shortSpec: 'Grad-CAM Map',
    description: 'Spatial class-activation heatmap projected back to original MRI coordinates.',
    tensorShape: '512 × 512 Attention Overlay',
    details:
      'Computes gradient weights on the final convolutional stage and upsamples ReLU-filtered attention maps for qualitative verification.',
  },
];

const PREPROCESSING_STEPS = [
  {
    step: '01',
    icon: Upload,
    title: 'Image Upload',
    detail: 'Ingest JPG/PNG brain MRI slice with format validation and client-side buffer decoding.',
  },
  {
    step: '02',
    icon: Crop,
    title: 'ROI Extraction',
    detail: 'Tightly bound the cranial contour to eliminate empty scanner padding and focus model receptive fields.',
  },
  {
    step: '03',
    icon: Sliders,
    title: 'Image Enhancement',
    detail: 'Apply gentle intensity windowing and CLAHE-style local contrast balancing across gray/white matter.',
  },
  {
    step: '04',
    icon: Binary,
    title: 'Normalization',
    detail: 'Scale pixel intensities to zero-mean unit-variance float tensors matching backbone training distributions.',
  },
  {
    step: '05',
    icon: Layers,
    title: 'Model Input',
    detail: 'Resize to architecture-specific grids (224×224 or 384×384) and batch for parallel inference.',
  },
];

export const ResearchSection: React.FC = () => {
  const [selectedStageId, setSelectedStageId] = useState<string>('features');
  const activeStage =
    ARCHITECTURE_STAGES.find((s) => s.id === selectedStageId) ?? ARCHITECTURE_STAGES[0];

  return (
    <div className="space-y-10">
      {/* Header & Research Overview */}
      <section className="rounded-2xl border border-slate-800/90 bg-gradient-to-br from-[#141C31] via-[#101629] to-[#080B16] p-6 sm:p-8">
        <p className="font-mono text-xs font-medium text-[#22D3EE]">
          RESEARCH INSIGHTS &amp; METHODOLOGY
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
          AI-Assisted Brain Tumor Classification from Structural MRI
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#94A3B8]">
          Deep convolutional neural networks can extract subtle morphological and textural
          signatures from structural magnetic resonance imaging (MRI) slices across four primary
          research classes: Glioma, Meningioma, Pituitary tumors, and No Tumor controls. Combining
          complementary network families in an ensemble reduces prediction variance while Grad-CAM
          attribution helps researchers audit whether spatial focus aligns with relevant anatomy
          rather than scanner artifacts.
        </p>
      </section>

      {/* Classification Categories (4 Cards with Illustrative Procedural Diagrams) */}
      <section>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="font-display text-xl font-bold text-[#F8FAFC]">
              Classification Categories
            </h3>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Educational overview of the four target neuroimaging classes. Visuals below are
              procedural illustrative diagrams, not clinical MRI evidence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {TUMOR_CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const diagramUrl = getIllustrativeSampleMRI(category);
            return (
              <div
                key={category}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-800/90 bg-[#141C31]/80 transition-colors hover:border-[#8B5CF6]/50"
              >
                <div className="relative aspect-square w-full bg-black p-3">
                  {diagramUrl && (
                    <img
                      src={diagramUrl}
                      alt={`Illustrative educational MRI schematic for ${category}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full rounded-lg object-contain"
                    />
                  )}
                  <span className="absolute bottom-3 left-3 rounded-md bg-[#080B16]/85 px-2 py-0.5 font-mono text-[10px] text-[#94A3B8]">
                    Illustrative Visual · {meta.samplePlane}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-lg font-bold" style={{ color: meta.color }}>
                      {category}
                    </h4>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
                    {meta.educationalOverview}
                  </p>
                  <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3 text-[11px]">
                    <p className="text-[#94A3B8]">
                      <span className="font-semibold text-[#F8FAFC]">Region: </span>
                      {meta.anatomicalOrigin}
                    </p>
                    <p className="text-[#94A3B8]">
                      <span className="font-semibold text-[#F8FAFC]">Typical Feature: </span>
                      {meta.typicalImaging}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive AI Model Architecture Flow Diagram */}
      <section className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="font-display text-xl font-bold text-[#F8FAFC]">
              Interactive AI Model Architecture Pipeline
            </h3>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Select any stage in the inference flow to inspect tensor transformations and design
              details.
            </p>
          </div>
          <span className="font-mono text-xs text-[#A855F7]">7-Stage Inference Flow</span>
        </div>

        {/* Horizontal Interactive Node Flow */}
        <div className="mt-6 flex flex-wrap items-center gap-2 lg:flex-nowrap lg:overflow-x-auto pb-2">
          {ARCHITECTURE_STAGES.map((stage, index) => {
            const isSelected = stage.id === selectedStageId;
            return (
              <React.Fragment key={stage.id}>
                <button
                  type="button"
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`flex min-w-[140px] flex-1 flex-col rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/18 shadow-[0_0_24px_rgba(139,92,246,0.25)]'
                      : 'border-slate-800 bg-[#080B16]/80 hover:border-slate-600'
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#22D3EE]">
                    0{index + 1}
                  </span>
                  <span className="mt-1 font-display text-xs font-semibold text-[#F8FAFC]">
                    {stage.label}
                  </span>
                  <span className="mt-0.5 text-[11px] text-[#94A3B8]">{stage.shortSpec}</span>
                </button>
                {index < ARCHITECTURE_STAGES.length - 1 && (
                  <ArrowRight
                    className="hidden h-4 w-4 shrink-0 text-[#8B5CF6]/70 lg:block"
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Active Stage Inspector Box */}
        <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-[#080B16]/85 p-5 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#8B5CF6]" />
              <h4 className="font-display text-base font-semibold text-[#F8FAFC]">
                {activeStage.label}
              </h4>
            </div>
            <p className="mt-2 text-sm text-[#F8FAFC]/90">{activeStage.description}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">{activeStage.details}</p>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-slate-800/80 bg-[#101629] p-4 md:col-span-4">
            <span className="text-[11px] uppercase tracking-wider text-[#94A3B8]">
              Stage Tensor Representation
            </span>
            <span className="mt-1.5 font-mono text-sm font-semibold text-[#22D3EE]">
              {activeStage.tensorShape}
            </span>
          </div>
        </div>
      </section>

      {/* Preprocessing Pipeline */}
      <section>
        <div className="mb-5">
          <h3 className="font-display text-xl font-bold text-[#F8FAFC]">
            MRI Preprocessing Pipeline
          </h3>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Standardized five-step transformation applied prior to deep feature extraction.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {PREPROCESSING_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex flex-col rounded-2xl border border-slate-800/90 bg-[#141C31]/75 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#8B5CF6]">
                    Step {item.step}
                  </span>
                  <Icon className="h-4 w-4 text-[#22D3EE]" />
                </div>
                <h4 className="mt-3 font-display text-sm font-semibold text-[#F8FAFC]">
                  {item.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Explainability Methodology */}
      <section>
        <div className="mb-5">
          <h3 className="font-display text-xl font-bold text-[#F8FAFC]">
            Explainability &amp; Verification Methods
          </h3>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Four complementary pillars used to make model outputs auditable and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[
            {
              icon: Eye,
              title: 'Grad-CAM (Gradient-Weighted Class Activation Mapping)',
              body: 'Computes gradients of the target class logit with respect to final convolutional feature maps, producing a coarse localization heatmap showing which image regions contributed most strongly to the score.',
              accent: '#22D3EE',
            },
            {
              icon: BarChart3,
              title: 'Calibrated Model Probability Distributions',
              body: 'Rather than showing only a hard class label, reporting the complete 4-class softmax distribution reveals borderline ambiguity, secondary hypotheses, and model entropy.',
              accent: '#8B5CF6',
            },
            {
              icon: GitCompare,
              title: 'Multi-Model Consensus Comparison',
              body: 'Evaluating EfficientNetV2-M, DenseNet201, and ConvNeXt-Base side by side highlights whether architecturally distinct networks agree or diverge on complex slices.',
              accent: '#3B82F6',
            },
            {
              icon: Sparkles,
              title: 'Attention & Feature Map Visualization',
              body: 'Inspecting receptive-field focus across architectures verifies that predictions rely on relevant intracranial structures rather than skull framing or image orientation cues.',
              accent: '#A855F7',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${card.accent}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: card.accent }} />
                  </div>
                  <h4 className="font-display text-sm font-semibold text-[#F8FAFC]">
                    {card.title}
                  </h4>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#94A3B8]">{card.body}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

import {
  AnalysisCase,
  ClassProbabilities,
  GradCAMHotspot,
  IndividualModelResult,
  ModelBenchmark,
  TumorCategory,
  WorkspaceSettings,
} from '../types/mri';
import { getIllustrativeSampleMRI } from '../utils/mriRenderer';

export const TUMOR_CATEGORIES: TumorCategory[] = [
  'Glioma',
  'Meningioma',
  'Pituitary',
  'No Tumor',
];

export const CATEGORY_META: Record<
  TumorCategory,
  {
    color: string;
    softBg: string;
    border: string;
    gradient: string;
    shortDesc: string;
    educationalOverview: string;
    typicalImaging: string;
    anatomicalOrigin: string;
    defaultHotspot: GradCAMHotspot;
    samplePlane: 'Axial T1-CE' | 'Sagittal T1' | 'Axial FLAIR';
  }
> = {
  Glioma: {
    color: '#F43F5E',
    softBg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.35)',
    gradient: 'from-[#F43F5E] to-[#FB7185]',
    shortDesc: 'Glial-origin intra-axial neoplasms exhibiting heterogeneous signal patterns.',
    educationalOverview:
      'Gliomas originate from glial support cells within the brain parenchyma. In neuroimaging research, they are studied for infiltrative margins, heterogeneous T1-contrast enhancement, and surrounding perilesional signal changes.',
    typicalImaging: 'Heterogeneous intra-axial signal with irregular contrast rim and perilesional edema',
    anatomicalOrigin: 'Cerebral white matter & glial support tissue',
    defaultHotspot: {
      x: 0.375,
      y: 0.425,
      radius: 0.115,
      secondaryX: 0.43,
      secondaryY: 0.46,
      secondaryRadius: 0.085,
      spread: 1.0,
    },
    samplePlane: 'Axial T1-CE',
  },
  Meningioma: {
    color: '#A855F7',
    softBg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.35)',
    gradient: 'from-[#A855F7] to-[#8B5CF6]',
    shortDesc: 'Extra-axial dural-based lesions with well-circumscribed margins.',
    educationalOverview:
      'Meningiomas arise from arachnoid cap cells of the meninges surrounding the brain. Deep learning classifiers typically learn their sharply demarcated contours, homogeneous contrast uptake, and dural attachment geometry.',
    typicalImaging: 'Well-circumscribed peripheral extra-axial contour with dural tail morphology',
    anatomicalOrigin: 'Arachnoid mater / dural convexity margins',
    defaultHotspot: {
      x: 0.68,
      y: 0.405,
      radius: 0.105,
      secondaryX: 0.72,
      secondaryY: 0.47,
      secondaryRadius: 0.07,
      spread: 0.9,
    },
    samplePlane: 'Axial T1-CE',
  },
  Pituitary: {
    color: '#22D3EE',
    softBg: 'rgba(34, 211, 238, 0.12)',
    border: 'rgba(34, 211, 238, 0.35)',
    gradient: 'from-[#22D3EE] to-[#3B82F6]',
    shortDesc: 'Sellar and suprasellar midline lesions centered at the pituitary gland.',
    educationalOverview:
      'Pituitary adenomas develop within the sella turcica at the skull base. Sagittal and coronal MRI views provide clear anatomical reference landmarks around the optic chiasm and sphenoid sinus for model localization.',
    typicalImaging: 'Rounded focal midline signal within the sellar / pituitary fossa region',
    anatomicalOrigin: 'Anterior pituitary / sella turcica midline',
    defaultHotspot: {
      x: 0.438,
      y: 0.57,
      radius: 0.095,
      secondaryX: 0.465,
      secondaryY: 0.52,
      secondaryRadius: 0.07,
      spread: 0.85,
    },
    samplePlane: 'Sagittal T1',
  },
  'No Tumor': {
    color: '#10B981',
    softBg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    gradient: 'from-[#10B981] to-[#22D3EE]',
    shortDesc: 'Symmetric cerebral hemispheres with normal structural anatomy.',
    educationalOverview:
      'Normal reference brain MRI scans serve as the control baseline class, training models to recognize symmetrical hemispheric architecture, undistorted ventricles, and uniform cortical differentiation without focal anomalies.',
    typicalImaging: 'Symmetrical bilateral hemispheres, midline ventricles, no focal mass effect',
    anatomicalOrigin: 'Healthy structural baseline across parenchyma',
    defaultHotspot: {
      x: 0.5,
      y: 0.49,
      radius: 0.19,
      secondaryX: 0.42,
      secondaryY: 0.46,
      secondaryRadius: 0.14,
      spread: 0.45,
    },
    samplePlane: 'Axial FLAIR',
  },
};

export const MODEL_METADATA = {
  efficientnet: {
    key: 'efficientnet' as const,
    name: 'EfficientNetV2-M',
    shortName: 'EffNetV2-M',
    architecture: 'Compound-Scaled Fused-MBConv CNN',
    parameters: '54.1M',
    inputResolution: '384 × 384 px',
    description:
      'Balances depth, width, and progressive resolution scaling with Fused-MBConv early stages for high parameter efficiency on medical textures.',
  },
  densenet: {
    key: 'densenet' as const,
    name: 'DenseNet201',
    shortName: 'DenseNet201',
    architecture: 'Dense Feature-Reuse Connectivity CNN',
    parameters: '20.0M',
    inputResolution: '224 × 224 px',
    description:
      'Concatenates feature maps across all preceding layers within dense blocks, preserving fine low-level radiological edges alongside semantic features.',
  },
  convnext: {
    key: 'convnext' as const,
    name: 'ConvNeXt-Base',
    shortName: 'ConvNeXt-B',
    architecture: 'Modernized 7×7 Depthwise ConvNet',
    parameters: '88.6M',
    inputResolution: '384 × 384 px',
    description:
      'Applies large-kernel depthwise convolutions, inverted bottlenecks, and LayerNorm to capture broad spatial context across cranial anatomy.',
  },
};

/**
 * ILLUSTRATIVE DEMO BENCHMARKS ONLY.
 * Explicitly labeled throughout the UI as illustrative demo values, not real experimental findings.
 */
export const DEMO_MODEL_BENCHMARKS: ModelBenchmark[] = [
  {
    key: 'efficientnet',
    name: 'EfficientNetV2-M',
    shortName: 'EffNetV2-M',
    family: 'Compound CNN',
    params: '54.1M',
    latencyMs: 142,
    accuracy: 96.2,
    precision: 96.0,
    recall: 95.8,
    f1Score: 95.9,
    auc: 99.1,
    perClassF1: { Glioma: 94.8, Meningioma: 95.1, Pituitary: 96.9, 'No Tumor': 97.4 },
    perClassRecall: { Glioma: 94.5, Meningioma: 94.9, Pituitary: 97.1, 'No Tumor': 97.2 },
  },
  {
    key: 'densenet',
    name: 'DenseNet201',
    shortName: 'DenseNet201',
    family: 'Dense CNN',
    params: '20.0M',
    latencyMs: 118,
    accuracy: 95.4,
    precision: 95.3,
    recall: 95.1,
    f1Score: 95.2,
    auc: 98.8,
    perClassF1: { Glioma: 93.9, Meningioma: 94.4, Pituitary: 96.1, 'No Tumor': 96.8 },
    perClassRecall: { Glioma: 93.6, Meningioma: 94.1, Pituitary: 96.3, 'No Tumor': 96.9 },
  },
  {
    key: 'convnext',
    name: 'ConvNeXt-Base',
    shortName: 'ConvNeXt-B',
    family: 'Modern ConvNet',
    params: '88.6M',
    latencyMs: 168,
    accuracy: 96.8,
    precision: 96.7,
    recall: 96.5,
    f1Score: 96.6,
    auc: 99.3,
    perClassF1: { Glioma: 95.6, Meningioma: 96.0, Pituitary: 97.4, 'No Tumor': 97.8 },
    perClassRecall: { Glioma: 95.4, Meningioma: 95.8, Pituitary: 97.5, 'No Tumor': 97.9 },
  },
  {
    key: 'ensemble',
    name: 'Ensemble (Soft-Vote)',
    shortName: 'Ensemble',
    family: 'Multi-Model',
    params: '162.7M',
    latencyMs: 245,
    accuracy: 98.1,
    precision: 98.0,
    recall: 97.9,
    f1Score: 98.0,
    auc: 99.7,
    perClassF1: { Glioma: 97.4, Meningioma: 97.6, Pituitary: 98.5, 'No Tumor': 98.7 },
    perClassRecall: { Glioma: 97.1, Meningioma: 97.5, Pituitary: 98.6, 'No Tumor': 98.8 },
  },
];

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  defaultGradCamOpacity: 62,
  defaultViewMode: 'overlay',
  simulationSpeed: 'realistic',
  showRadiologicalGrid: true,
  ensembleWeights: {
    efficientnet: 35,
    densenet: 25,
    convnext: 40,
  },
};

/** Normalizes 4 raw numbers so they sum cleanly to 100.0 with 1 decimal precision */
export function normalizeProbabilities(raw: ClassProbabilities): ClassProbabilities {
  const keys = TUMOR_CATEGORIES;
  const total = keys.reduce((acc, k) => acc + Math.max(0.1, raw[k]), 0);
  const rounded = keys.map((k) => Math.round((Math.max(0.1, raw[k]) / total) * 1000) / 10);
  const sumRounded = Math.round(rounded.reduce((a, b) => a + b, 0) * 10) / 10;
  const diff = Math.round((100 - sumRounded) * 10) / 10;

  // Apply tiny rounding correction to the highest probability class
  let maxIdx = 0;
  for (let i = 1; i < rounded.length; i++) {
    if (rounded[i] > rounded[maxIdx]) maxIdx = i;
  }
  rounded[maxIdx] = Math.round((rounded[maxIdx] + diff) * 10) / 10;

  return {
    Glioma: rounded[0],
    Meningioma: rounded[1],
    Pituitary: rounded[2],
    'No Tumor': rounded[3],
  };
}

/** Generates a complete simulated multi-model analysis case (explicitly DEMO MODE) */
export function buildSimulatedAnalysisCase(params: {
  id?: string;
  fileName: string;
  imageUrl: string;
  category: TumorCategory;
  isDemoSample: boolean;
  seed?: number;
  customHotspot?: GradCAMHotspot;
  date?: string;
  timestamp?: number;
  weights?: { efficientnet: number; densenet: number; convnext: number };
}): AnalysisCase {
  const {
    category,
    fileName,
    imageUrl,
    isDemoSample,
    seed = 77,
    customHotspot,
    weights = DEFAULT_WORKSPACE_SETTINGS.ensembleWeights,
  } = params;

  const jitter = (offset: number) => (((seed * 31 + offset * 17) % 100) / 100 - 0.5);

  const makeModelProbs = (primaryBase: number, salt: number): ClassProbabilities => {
    const raw: ClassProbabilities = {
      Glioma: 1.2 + Math.abs(jitter(salt + 1)) * 2.6,
      Meningioma: 1.1 + Math.abs(jitter(salt + 2)) * 2.4,
      Pituitary: 0.9 + Math.abs(jitter(salt + 3)) * 1.9,
      'No Tumor': 0.8 + Math.abs(jitter(salt + 4)) * 1.6,
    };
    raw[category] = primaryBase + jitter(salt) * 2.2;
    return normalizeProbabilities(raw);
  };

  const effProbs = makeModelProbs(94.8, 11);
  const denseProbs = makeModelProbs(92.9, 23);
  const convProbs = makeModelProbs(95.9, 37);

  const wSum = weights.efficientnet + weights.densenet + weights.convnext || 100;
  const wE = weights.efficientnet / wSum;
  const wD = weights.densenet / wSum;
  const wC = weights.convnext / wSum;

  const combinedRaw: ClassProbabilities = {
    Glioma: effProbs.Glioma * wE + denseProbs.Glioma * wD + convProbs.Glioma * wC,
    Meningioma:
      effProbs.Meningioma * wE + denseProbs.Meningioma * wD + convProbs.Meningioma * wC,
    Pituitary:
      effProbs.Pituitary * wE + denseProbs.Pituitary * wD + convProbs.Pituitary * wC,
    'No Tumor':
      effProbs['No Tumor'] * wE + denseProbs['No Tumor'] * wD + convProbs['No Tumor'] * wC,
  };
  // Slightly sharpen ensemble confidence in simulation to mirror multi-model variance reduction
  combinedRaw[category] = Math.min(98.9, combinedRaw[category] + 1.4);
  const ensembleProbs = normalizeProbabilities(combinedRaw);

  const topClass = (Object.keys(ensembleProbs) as TumorCategory[]).reduce((best, curr) =>
    ensembleProbs[curr] > ensembleProbs[best] ? curr : best
  );

  const models: IndividualModelResult[] = [
    {
      ...MODEL_METADATA.efficientnet,
      predictedClass: category,
      confidence: effProbs[category],
      processingTimeMs: Math.round(136 + Math.abs(jitter(5)) * 24),
      probabilities: effProbs,
    },
    {
      ...MODEL_METADATA.densenet,
      predictedClass: category,
      confidence: denseProbs[category],
      processingTimeMs: Math.round(112 + Math.abs(jitter(9)) * 20),
      probabilities: denseProbs,
    },
    {
      ...MODEL_METADATA.convnext,
      predictedClass: category,
      confidence: convProbs[category],
      processingTimeMs: Math.round(162 + Math.abs(jitter(13)) * 26),
      probabilities: convProbs,
    },
  ];

  const now = params.timestamp ?? Date.now();
  const formattedDate =
    params.date ??
    new Date(now).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return {
    id: params.id ?? `NV-${String(Math.floor(1000 + (now % 9000)))}`,
    fileName,
    imageUrl,
    date: formattedDate,
    timestamp: now,
    isDemoSample,
    plane: isDemoSample ? CATEGORY_META[category].samplePlane : 'Uploaded Scan',
    predictedClass: topClass,
    confidence: ensembleProbs[topClass],
    status: 'Completed (Demo)',
    probabilities: ensembleProbs,
    models,
    ensembleProcessingTimeMs: Math.round(
      Math.max(...models.map((m) => m.processingTimeMs)) + 48
    ),
    hotspot: customHotspot ?? CATEGORY_META[category].defaultHotspot,
    notes: isDemoSample
      ? `Illustrative ${category.toLowerCase()} demo scan evaluated in simulated multi-model mode.`
      : 'User-uploaded MRI image evaluated locally in client-side DEMO simulation mode.',
  };
}

export function createInitialDemoHistory(): AnalysisCase[] {
  const baseTime = new Date('2026-11-20T14:20:00Z').getTime();
  return [
    buildSimulatedAnalysisCase({
      id: 'NV-2048',
      fileName: 'demo_axial_t1ce_glioma_01.png',
      imageUrl: getIllustrativeSampleMRI('Glioma'),
      category: 'Glioma',
      isDemoSample: true,
      seed: 108,
      date: 'Nov 22, 2026',
      timestamp: baseTime + 86400000 * 2,
    }),
    buildSimulatedAnalysisCase({
      id: 'NV-2047',
      fileName: 'demo_axial_t1ce_meningioma_04.png',
      imageUrl: getIllustrativeSampleMRI('Meningioma'),
      category: 'Meningioma',
      isDemoSample: true,
      seed: 214,
      date: 'Nov 21, 2026',
      timestamp: baseTime + 86400000,
    }),
    buildSimulatedAnalysisCase({
      id: 'NV-2046',
      fileName: 'demo_sagittal_t1_pituitary_02.png',
      imageUrl: getIllustrativeSampleMRI('Pituitary'),
      category: 'Pituitary',
      isDemoSample: true,
      seed: 319,
      date: 'Nov 20, 2026',
      timestamp: baseTime,
    }),
    buildSimulatedAnalysisCase({
      id: 'NV-2045',
      fileName: 'demo_axial_flair_control_09.png',
      imageUrl: getIllustrativeSampleMRI('No Tumor'),
      category: 'No Tumor',
      isDemoSample: true,
      seed: 421,
      date: 'Nov 19, 2026',
      timestamp: baseTime - 86400000,
    }),
  ];
}

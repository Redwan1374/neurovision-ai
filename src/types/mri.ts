export type TumorCategory = 'Glioma' | 'Meningioma' | 'Pituitary' | 'No Tumor';

export type ModelKey = 'efficientnet' | 'densenet' | 'convnext' | 'ensemble';

export type AppView = 'landing' | 'dashboard';

export type DashboardTab =
  | 'overview'
  | 'analyze'
  | 'history'
  | 'models'
  | 'explainability'
  | 'research'
  | 'settings';

export interface ClassProbabilities {
  Glioma: number;
  Meningioma: number;
  Pituitary: number;
  'No Tumor': number;
}

export interface IndividualModelResult {
  key: Exclude<ModelKey, 'ensemble'>;
  name: string;
  architecture: string;
  parameters: string;
  inputResolution: string;
  predictedClass: TumorCategory;
  confidence: number;
  processingTimeMs: number;
  probabilities: ClassProbabilities;
}

export interface GradCAMHotspot {
  /** Normalized 0..1 coordinates for illustrative attention center */
  x: number;
  y: number;
  radius: number;
  secondaryX?: number;
  secondaryY?: number;
  secondaryRadius?: number;
  spread: number;
}

export interface AnalysisCase {
  id: string;
  fileName: string;
  imageUrl: string;
  date: string;
  timestamp: number;
  isDemoSample: boolean;
  plane: 'Axial T1-CE' | 'Sagittal T1' | 'Axial FLAIR' | 'Uploaded Scan';
  predictedClass: TumorCategory;
  confidence: number;
  status: 'Completed (Demo)' | 'Reviewed (Demo)';
  probabilities: ClassProbabilities;
  models: IndividualModelResult[];
  ensembleProcessingTimeMs: number;
  hotspot: GradCAMHotspot;
  notes: string;
}

export interface ModelBenchmark {
  key: ModelKey;
  name: string;
  shortName: string;
  family: string;
  params: string;
  latencyMs: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  perClassF1: Record<TumorCategory, number>;
  perClassRecall: Record<TumorCategory, number>;
}

export interface WorkspaceSettings {
  defaultGradCamOpacity: number;
  defaultViewMode: 'overlay' | 'side-by-side' | 'slider';
  simulationSpeed: 'realistic' | 'fast';
  showRadiologicalGrid: boolean;
  ensembleWeights: {
    efficientnet: number;
    densenet: number;
    convnext: number;
  };
}

export interface ResearcherProfile {
  name: string;
  email: string;
  institution: string;
  role: string;
  isSignedIn: boolean;
}

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  tone: 'info' | 'success' | 'warning';
}

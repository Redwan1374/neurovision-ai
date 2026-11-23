/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Menu, ScanSearch, User } from 'lucide-react';
import {
  AnalysisCase,
  AppView,
  DashboardTab,
  ModelKey,
  ResearcherProfile,
  ToastNotification,
  TumorCategory,
  WorkspaceSettings,
} from './types/mri';
import {
  buildSimulatedAnalysisCase,
  createInitialDemoHistory,
  DEFAULT_WORKSPACE_SETTINGS,
  TUMOR_CATEGORIES,
} from './data/mockResearchData';
import { analyzeUploadedImageFeatures } from './utils/mriRenderer';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { MRIUpload } from './components/MRIUpload';
import { MRIViewer } from './components/MRIViewer';
import { PredictionCard } from './components/PredictionCard';
import { ProbabilityChart } from './components/ProbabilityChart';
import { ModelComparison } from './components/ModelComparison';
import { GradCAMViewer } from './components/GradCAMViewer';
import { ResearchSection } from './components/ResearchSection';
import { AnalysisHistory } from './components/AnalysisHistory';
import { SettingsView } from './components/SettingsView';
import { AnalysisLoadingOverlay } from './components/AnalysisLoadingOverlay';
import { SignInModal } from './components/SignInModal';
import { ToastContainer } from './components/ToastContainer';

const STORAGE_HISTORY_KEY = 'neurovision_demo_history_v1';
const STORAGE_SETTINGS_KEY = 'neurovision_settings_v1';

const TAB_TITLES: Record<DashboardTab, string> = {
  overview: 'Overview',
  analyze: 'New MRI Analysis',
  history: 'Analysis History',
  models: 'Model Comparison & Performance',
  explainability: 'Explainable AI (Grad-CAM)',
  research: 'Research Insights',
  settings: 'Settings',
};

interface PendingScan {
  imageUrl: string;
  fileName: string;
  isDemoSample: boolean;
  sampleCategory?: TumorCategory;
}

export default function App() {
  const [appView, setAppView] = useState<AppView>('landing');
  const [activeTab, setActiveTab] = useState<DashboardTab>('analyze');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [history, setHistory] = useState<AnalysisCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AnalysisCase[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to freshly generated demo cases
    }
    return createInitialDemoHistory();
  });

  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_WORKSPACE_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_WORKSPACE_SETTINGS;
  });

  const [activeCase, setActiveCase] = useState<AnalysisCase>(() => history[0] ?? createInitialDemoHistory()[0]);
  const [pendingScan, setPendingScan] = useState<PendingScan | null>(null);
  const [currentAnalysisResult, setCurrentAnalysisResult] = useState<AnalysisCase | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [gradCamModel, setGradCamModel] = useState<ModelKey>('ensemble');

  const [signInOpen, setSignInOpen] = useState(false);
  const [researcher, setResearcher] = useState<ResearcherProfile>({
    name: 'Dr. Elena Vance',
    email: 'e.vance@neurovision-ai.org',
    institution: 'Computational Neuroimaging Lab',
    role: 'Principal Investigator',
    isSignedIn: false,
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const pushToast = useCallback(
    (title: string, message?: string, tone: ToastNotification['tone'] = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, message, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Persist history & settings locally (keeping storage resilient if large uploaded data URLs exceed quota)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history.slice(0, 14)));
    } catch {
      // Ignore quota exceeded for very large uploaded images
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  const openDashboard = (tab: DashboardTab) => {
    setActiveTab(tab);
    setAppView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageLoaded = (payload: PendingScan) => {
    setPendingScan(payload);
    setCurrentAnalysisResult(null);
    pushToast(
      'MRI scan ready in viewer',
      `${payload.fileName} loaded locally. Click "Analyze MRI" to run DEMO simulation.`,
      'info'
    );
  };

  const handleReplaceFile = (file: File) => {
    const valid = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type.toLowerCase());
    if (!valid) {
      pushToast('Unsupported format', 'Please select a JPG, JPEG, or PNG image.', 'warning');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      pushToast('File too large', 'Maximum allowed image size is 10 MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleImageLoaded({
          imageUrl: reader.result,
          fileName: file.name,
          isDemoSample: false,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPendingScan(null);
    setCurrentAnalysisResult(null);
    pushToast('Scan cleared', 'Upload a new brain MRI or select a demo sample.', 'info');
  };

  const handleRunAnalysis = async () => {
    if (!pendingScan) {
      pushToast('No MRI image selected', 'Please upload an MRI scan before running analysis.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setCurrentAnalysisResult(null);
    setAnalysisStage(0);

    const stepMs = settings.simulationSpeed === 'fast' ? 320 : 640;

    // Extract deterministic saliency features from uploaded scan during Stage 0-1
    const extracted = pendingScan.isDemoSample
      ? null
      : await analyzeUploadedImageFeatures(pendingScan.imageUrl);

    for (let s = 1; s <= 3; s++) {
      await new Promise((res) => setTimeout(res, stepMs));
      setAnalysisStage(s);
    }
    await new Promise((res) => setTimeout(res, stepMs));

    const inferredCategory: TumorCategory = pendingScan.sampleCategory
      ? pendingScan.sampleCategory
      : TUMOR_CATEGORIES[(extracted?.hash ?? Date.now()) % TUMOR_CATEGORIES.length];

    const customHotspot = extracted
      ? {
          x: extracted.focalX,
          y: extracted.focalY,
          radius: 0.115,
          secondaryX: Math.min(0.76, extracted.focalX + 0.06),
          secondaryY: Math.min(0.76, extracted.focalY + 0.05),
          secondaryRadius: 0.075,
          spread: inferredCategory === 'No Tumor' ? 0.5 : 1.0,
        }
      : undefined;

    const newCase = buildSimulatedAnalysisCase({
      fileName: pendingScan.fileName,
      imageUrl: pendingScan.imageUrl,
      category: inferredCategory,
      isDemoSample: pendingScan.isDemoSample,
      seed: extracted?.hash ?? Math.floor(Math.random() * 10000),
      customHotspot,
      weights: settings.ensembleWeights,
    });

    setIsAnalyzing(false);
    setCurrentAnalysisResult(newCase);
    setActiveCase(newCase);
    setHistory((prev) => [newCase, ...prev]);
    pushToast(
      'Demo MRI analysis complete',
      `Simulated ensemble output: ${newCase.predictedClass} (${newCase.confidence.toFixed(1)}%).`,
      'success'
    );
  };

  const handleDeleteCase = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeCase.id === id && next.length > 0) {
        setActiveCase(next[0]);
      }
      return next;
    });
    pushToast('Case removed', `${id} was deleted from local demo history.`, 'info');
  };

  const handleResetDemoHistory = () => {
    const fresh = createInitialDemoHistory();
    setHistory(fresh);
    setActiveCase(fresh[0]);
    pushToast('Demo history restored', '4 illustrative neuroimaging cases loaded.', 'success');
  };

  const handleLoadCaseIntoAnalyzer = (item: AnalysisCase) => {
    setActiveCase(item);
    setPendingScan({
      imageUrl: item.imageUrl,
      fileName: item.fileName,
      isDemoSample: item.isDemoSample,
      sampleCategory: item.isDemoSample ? item.predictedClass : undefined,
    });
    setCurrentAnalysisResult(item);
    setActiveTab('analyze');
    pushToast('Case loaded', `Viewing ${item.id} in MRI Analysis Workspace.`, 'info');
  };

  const handleInspectCaseGradCAM = (item: AnalysisCase) => {
    setActiveCase(item);
    setActiveTab('explainability');
  };

  const fallbackCase = activeCase ?? history[0] ?? createInitialDemoHistory()[0];

  return (
    <>
      {appView === 'landing' ? (
        <LandingPage
          onNavigateDashboard={openDashboard}
          onOpenSignIn={() => setSignInOpen(true)}
          researcher={researcher}
          onNotify={(title, message) => pushToast(title, message, 'success')}
        />
      ) : (
        <div className="flex min-h-screen bg-[#080B16] text-[#F8FAFC]">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onReturnLanding={() => setAppView('landing')}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            historyCount={history.length}
          />

          {/* Main Dashboard Area */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Sticky Top Workspace Navigation Bar */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-800/80 bg-[#080B16]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#101629] text-[#F8FAFC]"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                    <span className="hidden sm:inline">NeuroVision AI</span>
                    <span className="hidden sm:inline text-slate-700">/</span>
                    <span className="font-display text-sm font-semibold text-[#F8FAFC] truncate">
                      {TAB_TITLES[activeTab]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden md:inline font-mono text-[11px] font-medium text-[#22D3EE] whitespace-nowrap">
                  DEMO MODE · SIMULATED ENGINE
                </span>

                {activeTab !== 'analyze' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('analyze')}
                    className="nv-gradient-btn inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
                  >
                    <ScanSearch className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Analyze MRI</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-[#101629] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6]/60 transition-colors cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-[#8B5CF6]" />
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {researcher.isSignedIn ? researcher.name : 'Sign In'}
                  </span>
                </button>
              </div>
            </header>

            {/* Main Viewport Content */}
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <div className="mx-auto max-w-[1400px]">
                {activeTab === 'overview' && (
                  <DashboardOverview
                    activeCase={fallbackCase}
                    history={history}
                    onNavigateTab={setActiveTab}
                    onSelectCase={handleLoadCaseIntoAnalyzer}
                  />
                )}

                {activeTab === 'analyze' && (
                  <div className="space-y-6">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                      <div>
                        <p className="font-mono text-xs font-medium text-[#22D3EE]">
                          INTERACTIVE MRI WORKSPACE · DEMO MODE
                        </p>
                        <h2 className="mt-1 font-display text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
                          Brain MRI Analysis
                        </h2>
                        <p className="mt-1 text-sm text-[#94A3B8]">
                          Upload a structural brain MRI scan or load an illustrative sample to run
                          the multi-model simulation pipeline.
                        </p>
                      </div>
                    </div>

                    {!pendingScan ? (
                      <MRIUpload onImageLoaded={handleImageLoaded} />
                    ) : (
                      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                        {/* Left Column: Radiological MRI Viewer */}
                        <div className="xl:col-span-6">
                          <MRIViewer
                            imageUrl={pendingScan.imageUrl}
                            fileName={pendingScan.fileName}
                            isDemoSample={pendingScan.isDemoSample}
                            isAnalyzing={isAnalyzing}
                            showGrid={settings.showRadiologicalGrid}
                            onAnalyze={handleRunAnalysis}
                            onRemove={handleRemoveImage}
                            onReplaceFile={handleReplaceFile}
                          />
                        </div>

                        {/* Right Column: Loading Progress OR Results & Probability Distribution */}
                        <div className="space-y-6 xl:col-span-6">
                          {isAnalyzing ? (
                            <AnalysisLoadingOverlay
                              currentStage={analysisStage}
                              fileName={pendingScan.fileName}
                            />
                          ) : currentAnalysisResult ? (
                            <>
                              <PredictionCard
                                analysis={currentAnalysisResult}
                                onInspectGradCAM={() => {
                                  setActiveCase(currentAnalysisResult);
                                  setActiveTab('explainability');
                                }}
                                onCompareModels={() => {
                                  setActiveCase(currentAnalysisResult);
                                  setActiveTab('models');
                                }}
                              />
                              <ProbabilityChart
                                probabilities={currentAnalysisResult.probabilities}
                                predictedClass={currentAnalysisResult.predictedClass}
                              />
                            </>
                          ) : (
                            <div className="flex h-full min-h-[340px] flex-col items-center justify-center rounded-2xl border border-slate-800/90 bg-[#141C31]/65 p-8 text-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/15">
                                <ScanSearch className="h-6 w-6 text-[#A855F7]" />
                              </div>
                              <h3 className="mt-4 font-display text-lg font-semibold text-[#F8FAFC]">
                                Ready for Multi-Model Analysis
                              </h3>
                              <p className="mt-2 max-w-sm text-sm text-[#94A3B8]">
                                Inspect the scan using zoom, fit, or radiological windowing controls,
                                then click <strong className="text-[#F8FAFC]">Analyze MRI</strong> to
                                generate simulated ensemble classification, probabilities, and
                                Grad-CAM maps.
                              </p>
                              <button
                                type="button"
                                onClick={handleRunAnalysis}
                                className="nv-gradient-btn mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-white cursor-pointer"
                              >
                                Run Demo MRI Analysis
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'models' && (
                  <ModelComparison
                    activeCase={fallbackCase}
                    onSelectGradCamModel={(model) => {
                      setGradCamModel(model);
                      setActiveTab('explainability');
                    }}
                  />
                )}

                {activeTab === 'explainability' && (
                  <GradCAMViewer
                    activeCase={fallbackCase}
                    history={history.length > 0 ? history : [fallbackCase]}
                    selectedModel={gradCamModel}
                    defaultOpacity={settings.defaultGradCamOpacity}
                    defaultViewMode={settings.defaultViewMode}
                    onSelectCase={(item) => setActiveCase(item)}
                    onSelectModel={setGradCamModel}
                  />
                )}

                {activeTab === 'research' && <ResearchSection />}

                {activeTab === 'history' && (
                  <AnalysisHistory
                    history={history}
                    onLoadCase={handleLoadCaseIntoAnalyzer}
                    onInspectGradCAM={handleInspectCaseGradCAM}
                    onDeleteCase={handleDeleteCase}
                    onResetDemoHistory={handleResetDemoHistory}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsView
                    settings={settings}
                    researcher={researcher}
                    onUpdateSettings={setSettings}
                    onResetSettings={() =>
                      pushToast('Preferences reset', 'Default workspace settings restored.', 'info')
                    }
                    onClearHistory={() => {
                      setHistory([]);
                      pushToast(
                        'History cleared',
                        'Local demo session archive emptied.',
                        'warning'
                      );
                    }}
                    onOpenSignIn={() => setSignInOpen(true)}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      <SignInModal
        isOpen={signInOpen}
        researcher={researcher}
        onClose={() => setSignInOpen(false)}
        onSaveProfile={(profile) => {
          setResearcher(profile);
          pushToast(
            'Researcher profile active',
            `Signed in as ${profile.name} (Demo Session).`,
            'success'
          );
        }}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

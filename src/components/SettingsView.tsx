import React from 'react';
import { Sliders, Trash2, RotateCcw, Check } from 'lucide-react';
import { ResearcherProfile, WorkspaceSettings } from '../types/mri';
import { DEFAULT_WORKSPACE_SETTINGS } from '../data/mockResearchData';

interface SettingsViewProps {
  settings: WorkspaceSettings;
  researcher: ResearcherProfile;
  onUpdateSettings: (next: WorkspaceSettings) => void;
  onResetSettings: () => void;
  onClearHistory: () => void;
  onOpenSignIn: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  researcher,
  onUpdateSettings,
  onResetSettings,
  onClearHistory,
  onOpenSignIn,
}) => {
  const updateWeight = (key: 'efficientnet' | 'densenet' | 'convnext', val: number) => {
    const clamped = Math.max(10, Math.min(80, val));
    const others = (['efficientnet', 'densenet', 'convnext'] as const).filter((k) => k !== key);
    const remaining = 100 - clamped;
    const otherSum = settings.ensembleWeights[others[0]] + settings.ensembleWeights[others[1]] || 1;
    const w1 = Math.max(5, Math.round((settings.ensembleWeights[others[0]] / otherSum) * remaining));
    const w2 = Math.max(5, remaining - w1);
    onUpdateSettings({
      ...settings,
      ensembleWeights: {
        ...settings.ensembleWeights,
        [key]: clamped,
        [others[0]]: w1,
        [others[1]]: w2,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="font-mono text-xs font-medium text-[#22D3EE]">
          WORKSPACE PREFERENCES · LOCAL SESSION
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
          Platform Settings
        </h2>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Configure MRI viewer behavior, Grad-CAM visualization defaults, and simulated ensemble
          weighting.
        </p>
      </div>

      {/* Researcher Profile Card */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
            Researcher Session Profile
          </p>
          <p className="mt-1 font-display text-lg font-bold text-[#F8FAFC]">{researcher.name}</p>
          <p className="text-xs text-[#94A3B8]">
            {researcher.role} · {researcher.institution} · {researcher.email}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSignIn}
          className="rounded-xl border border-slate-700/80 bg-[#101629] px-4 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6] transition-colors whitespace-nowrap cursor-pointer"
        >
          {researcher.isSignedIn ? 'Update Profile' : 'Sign In (Demo)'}
        </button>
      </div>

      {/* Viewer & Simulation Controls */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4">
          <Sliders className="h-4 w-4 text-[#8B5CF6]" />
          <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
            Viewer &amp; Explainability Defaults
          </h3>
        </div>

        {/* Default Opacity */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#F8FAFC]">Default Grad-CAM Heatmap Opacity</span>
            <span className="font-mono text-[#22D3EE] tabular-nums">
              {settings.defaultGradCamOpacity}%
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={95}
            value={settings.defaultGradCamOpacity}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                defaultGradCamOpacity: Number(e.target.value),
              })
            }
            className="nv-slider mt-2 w-full"
          />
        </div>

        {/* Default View Mode */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium text-[#F8FAFC]">Default Explainability Layout</p>
            <p className="text-xs text-[#94A3B8]">Initial viewport mode when opening Grad-CAM</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#080B16] p-1">
            {(['overlay', 'side-by-side', 'slider'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onUpdateSettings({ ...settings, defaultViewMode: mode })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer ${
                  settings.defaultViewMode === mode
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Speed */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium text-[#F8FAFC]">Demo Inference Pacing</p>
            <p className="text-xs text-[#94A3B8]">
              Controls the multi-stage analysis progress duration
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#080B16] p-1">
            {(['realistic', 'fast'] as const).map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => onUpdateSettings({ ...settings, simulationSpeed: speed })}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer ${
                  settings.simulationSpeed === speed
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>

        {/* Radiological Grid Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#F8FAFC]">Radiological Reference Grid</p>
            <p className="text-xs text-[#94A3B8]">
              Display subtle spatial calibration grid over loaded MRI scans
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                showRadiologicalGrid: !settings.showRadiologicalGrid,
              })
            }
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              settings.showRadiologicalGrid
                ? 'border-[#10B981]/60 bg-[#10B981]/15 text-[#10B981]'
                : 'border-slate-700 bg-[#080B16] text-[#94A3B8]'
            }`}
          >
            {settings.showRadiologicalGrid && <Check className="h-3.5 w-3.5" />}
            <span>{settings.showRadiologicalGrid ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>
      </div>

      {/* Ensemble Weighting Preview */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
              Simulated Ensemble Soft-Voting Weights
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Adjust relative backbone weighting used during future DEMO MODE runs (auto-normalized
              to 100%).
            </p>
          </div>
          <span className="font-mono text-xs text-[#22D3EE] tabular-nums">
            Total:{' '}
            {settings.ensembleWeights.efficientnet +
              settings.ensembleWeights.densenet +
              settings.ensembleWeights.convnext}
            %
          </span>
        </div>

        {(
          [
            { key: 'efficientnet', label: 'EfficientNetV2-M', color: '#8B5CF6' },
            { key: 'densenet', label: 'DenseNet201', color: '#3B82F6' },
            { key: 'convnext', label: 'ConvNeXt-Base', color: '#22D3EE' },
          ] as const
        ).map((item) => (
          <div key={item.key}>
            <div className="flex justify-between text-xs">
              <span className="text-[#F8FAFC]">{item.label}</span>
              <span className="font-mono font-semibold tabular-nums" style={{ color: item.color }}>
                {settings.ensembleWeights[item.key]}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={settings.ensembleWeights[item.key]}
              onChange={(e) => updateWeight(item.key, Number(e.target.value))}
              className="nv-slider mt-1.5 w-full"
            />
          </div>
        ))}
      </div>

      {/* Reset / Storage Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/90 bg-[#101629]/80 p-5">
        <button
          type="button"
          onClick={() => {
            onUpdateSettings(DEFAULT_WORKSPACE_SETTINGS);
            onResetSettings();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#141C31] px-4 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6] cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Preferences to Defaults
        </button>

        <button
          type="button"
          onClick={onClearHistory}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Local Demo History
        </button>
      </div>
    </div>
  );
};

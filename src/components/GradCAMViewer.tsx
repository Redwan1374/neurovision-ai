import React, { useEffect, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Columns2,
  Layers,
  SlidersHorizontal,
  Info,
  Crosshair,
} from 'lucide-react';
import { AnalysisCase, ModelKey } from '../types/mri';
import { CATEGORY_META } from '../data/mockResearchData';
import {
  renderGradCAMToCanvas,
  sampleActivationIntensity,
} from '../utils/mriRenderer';

interface GradCAMViewerProps {
  activeCase: AnalysisCase;
  history: AnalysisCase[];
  selectedModel: ModelKey;
  defaultOpacity: number;
  defaultViewMode: 'overlay' | 'side-by-side' | 'slider';
  onSelectCase: (caseItem: AnalysisCase) => void;
  onSelectModel: (model: ModelKey) => void;
}

const MODEL_OPTIONS: { key: ModelKey; label: string; layerName: string }[] = [
  { key: 'ensemble', label: 'Ensemble Attention', layerName: 'Weighted Spatial Fusion Map' },
  { key: 'efficientnet', label: 'EfficientNetV2-M', layerName: 'conv_head / block7b_project' },
  { key: 'densenet', label: 'DenseNet201', layerName: 'denseblock4 / norm5' },
  { key: 'convnext', label: 'ConvNeXt-Base', layerName: 'stages.3.blocks.2.dwconv' },
];

export const GradCAMViewer: React.FC<GradCAMViewerProps> = ({
  activeCase,
  history,
  selectedModel,
  defaultOpacity,
  defaultViewMode,
  onSelectCase,
  onSelectModel,
}) => {
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const standaloneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sliderCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [viewMode, setViewMode] = useState<'overlay' | 'side-by-side' | 'slider'>(defaultViewMode);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [opacity, setOpacity] = useState(defaultOpacity);
  const [zoom, setZoom] = useState(1);
  const [splitPercent, setSplitPercent] = useState(50);
  const [probe, setProbe] = useState<{ x: number; y: number; intensity: number } | null>(null);

  useEffect(() => {
    const targets = [
      overlayCanvasRef.current,
      standaloneCanvasRef.current,
      sliderCanvasRef.current,
    ];
    for (const canvas of targets) {
      if (canvas) {
        renderGradCAMToCanvas(canvas, activeCase.hotspot, selectedModel);
      }
    }
  }, [activeCase, selectedModel, viewMode]);

  const handleProbeMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const intensity = sampleActivationIntensity(nx, ny, activeCase.hotspot, selectedModel);
    setProbe({
      x: Math.round(nx * 512),
      y: Math.round(ny * 512),
      intensity,
    });
  };

  const catMeta = CATEGORY_META[activeCase.predictedClass];
  const activeModelMeta = MODEL_OPTIONS.find((m) => m.key === selectedModel) ?? MODEL_OPTIONS[0];

  const activationLabel = (val: number) => {
    if (val >= 0.78) return { text: 'Strongest Activation', color: '#EF4444' };
    if (val >= 0.52) return { text: 'Higher Activation', color: '#FACC15' };
    if (val >= 0.26) return { text: 'Moderate Activation', color: '#22C55E' };
    return { text: 'Lower Activation', color: '#3B82F6' };
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs font-medium text-[#22D3EE]">
            EXPLAINABLE AI · ILLUSTRATIVE GRAD-CAM VISUALIZATION (DEMO MODE)
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
            Grad-CAM Spatial Attribution Inspector
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-[#94A3B8]">
            Inspect simulated class activation heatmaps overlaid onto the MRI slice with real-time
            opacity control, split-screen comparison, and coordinate probing.
          </p>
        </div>

        {/* Case Switcher */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="gradcam-case-select" className="text-xs text-[#94A3B8] whitespace-nowrap">
            Active Case:
          </label>
          <select
            id="gradcam-case-select"
            value={activeCase.id}
            onChange={(e) => {
              const found = history.find((c) => c.id === e.target.value);
              if (found) onSelectCase(found);
            }}
            className="rounded-xl border border-slate-700/80 bg-[#141C31] px-3 py-2 font-mono text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
          >
            {history.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.predictedClass} ({c.confidence.toFixed(1)}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Workspace: Controls Column + Visualization Stage */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Controls & Legend Panel */}
        <div className="space-y-5 xl:col-span-4">
          {/* View Mode & Visibility Card */}
          <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/85 p-5 space-y-5">
            <div>
              <p className="text-xs font-medium text-[#94A3B8] mb-2.5">Visualization Layout</p>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#080B16] p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('overlay')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'overlay'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Overlay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('side-by-side')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'side-by-side'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  <Columns2 className="h-3.5 w-3.5" />
                  <span>Side-by-Side</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('slider')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'slider'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Split</span>
                </button>
              </div>
            </div>

            {/* Model Backbone Selector */}
            <div>
              <p className="text-xs font-medium text-[#94A3B8] mb-2">Target Architecture Layer</p>
              <div className="space-y-1.5">
                {MODEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onSelectModel(opt.key)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                      selectedModel === opt.key
                        ? 'border-[#8B5CF6]/70 bg-[#8B5CF6]/15 text-[#F8FAFC]'
                        : 'border-slate-800 bg-[#080B16]/70 text-[#94A3B8] hover:border-slate-700 hover:text-[#F8FAFC]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="font-mono text-[10px] text-slate-400">{opt.layerName}</p>
                    </div>
                    {selectedModel === opt.key && (
                      <span className="font-mono text-[10px] text-[#22D3EE]">Active</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Heatmap Toggle & Opacity Slider */}
            <div className="space-y-4 border-t border-slate-800/80 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#F8FAFC]">Heatmap Overlay</span>
                <button
                  type="button"
                  onClick={() => setShowHeatmap((s) => !s)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    showHeatmap
                      ? 'border-[#22D3EE]/50 bg-[#22D3EE]/12 text-[#22D3EE]'
                      : 'border-slate-700 bg-[#080B16] text-[#94A3B8]'
                  }`}
                >
                  {showHeatmap ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{showHeatmap ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Heatmap Opacity</span>
                  <span className="font-mono font-semibold text-[#F8FAFC] tabular-nums">
                    {opacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  disabled={!showHeatmap}
                  className="nv-slider mt-2 w-full disabled:opacity-40"
                />
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Zoom ({Math.round(zoom * 100)}%)</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.75, Math.round((z - 0.25) * 100) / 100))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-[#080B16] text-[#F8FAFC] hover:border-[#8B5CF6] cursor-pointer"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-[#080B16] text-[#F8FAFC] hover:border-[#8B5CF6] cursor-pointer"
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setSplitPercent(50);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-[#080B16] text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                    aria-label="Reset Zoom"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Attention Intensity Color Scale Legend */}
          <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/85 p-5">
            <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">
              Attention Intensity Scale
            </h3>
            <div
              className="mt-3 h-3 w-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #1D4ED8 0%, #22D3EE 28%, #22C55E 52%, #FACC15 76%, #EF4444 100%)',
              }}
            />
            <div className="mt-2 flex justify-between font-mono text-[11px] text-[#94A3B8] tabular-nums">
              <span>0.00</span>
              <span>0.33</span>
              <span>0.66</span>
              <span>1.00</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#2563EB] shrink-0" />
                <span>Blue: Lower activation</span>
              </div>
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#22C55E] shrink-0" />
                <span>Green: Moderate</span>
              </div>
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#FACC15] shrink-0" />
                <span>Yellow: Higher</span>
              </div>
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#EF4444] shrink-0" />
                <span>Red: Strongest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visualization Stage */}
        <div className="space-y-4 xl:col-span-8">
          <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/85 p-5">
            {/* Top Context Strip */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono font-semibold text-[#F8FAFC]">{activeCase.id}</span>
                <span className="text-slate-600">·</span>
                <span className="font-semibold" style={{ color: catMeta.color }}>
                  {activeCase.predictedClass} ({activeCase.confidence.toFixed(1)}%)
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[#94A3B8]">{activeModelMeta.label}</span>
              </div>
              <span className="font-mono text-[11px] text-[#22D3EE]">
                ILLUSTRATIVE DEMO HEATMAP
              </span>
            </div>

            {/* Viewport Content by Mode */}
            {viewMode === 'overlay' && (
              <div
                onMouseMove={handleProbeMove}
                onMouseLeave={() => setProbe(null)}
                className="relative mx-auto flex aspect-square max-h-[500px] w-full max-w-[500px] items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-black cursor-crosshair"
              >
                <div
                  className="relative h-full w-full transition-transform duration-150"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <img
                    src={activeCase.imageUrl}
                    alt={`Original MRI scan for ${activeCase.id}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                  />
                  <canvas
                    ref={overlayCanvasRef}
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-150"
                    style={{
                      opacity: showHeatmap ? opacity / 100 : 0,
                      mixBlendMode: 'screen',
                    }}
                  />
                </div>
              </div>
            )}

            {viewMode === 'side-by-side' && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Original MRI */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#94A3B8]">Original MRI Input</p>
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-800 bg-black">
                    <img
                      src={activeCase.imageUrl}
                      alt="Original Brain MRI"
                      referrerPolicy="no-referrer"
                      style={{ transform: `scale(${zoom})` }}
                      className="h-full w-full object-contain transition-transform duration-150"
                    />
                  </div>
                </div>

                {/* Grad-CAM Heatmap Overlay */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#22D3EE]">
                    Grad-CAM Attention Overlay (Demo)
                  </p>
                  <div
                    onMouseMove={handleProbeMove}
                    onMouseLeave={() => setProbe(null)}
                    className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-800 bg-black cursor-crosshair"
                  >
                    <div
                      className="relative h-full w-full transition-transform duration-150"
                      style={{ transform: `scale(${zoom})` }}
                    >
                      <img
                        src={activeCase.imageUrl}
                        alt="MRI with Grad-CAM Overlay"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain"
                      />
                      <canvas
                        ref={standaloneCanvasRef}
                        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                        style={{
                          opacity: showHeatmap ? opacity / 100 : 0,
                          mixBlendMode: 'screen',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'slider' && (
              <div className="space-y-4">
                <div
                  onMouseMove={handleProbeMove}
                  onMouseLeave={() => setProbe(null)}
                  className="relative mx-auto aspect-square max-h-[500px] w-full max-w-[500px] overflow-hidden rounded-xl border border-slate-800 bg-black cursor-crosshair select-none"
                >
                  <div
                    className="relative h-full w-full transition-transform duration-150"
                    style={{ transform: `scale(${zoom})` }}
                  >
                    {/* Base Original Image */}
                    <img
                      src={activeCase.imageUrl}
                      alt="Original MRI baseline"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain"
                    />

                    {/* Clipped Grad-CAM Layer on the right side of the split */}
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        clipPath: `inset(0 0 0 ${splitPercent}%)`,
                      }}
                    >
                      <canvas
                        ref={sliderCanvasRef}
                        className="h-full w-full object-contain"
                        style={{
                          opacity: showHeatmap ? opacity / 100 : 0,
                          mixBlendMode: 'screen',
                        }}
                      />
                    </div>
                  </div>

                  {/* Vertical Split Line Indicator */}
                  <div
                    className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-[#22D3EE] shadow-[0_0_12px_#22D3EE]"
                    style={{ left: `${splitPercent}%` }}
                  />

                  <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-[#080B16]/85 px-2 py-1 font-mono text-[10px] text-[#F8FAFC]">
                    ORIGINAL
                  </div>
                  <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-[#080B16]/85 px-2 py-1 font-mono text-[10px] text-[#22D3EE]">
                    GRAD-CAM
                  </div>
                </div>

                {/* Accessible Split Comparison Scrubber */}
                <div className="mx-auto max-w-[500px]">
                  <div className="flex justify-between text-xs text-[#94A3B8]">
                    <span>Comparison Split Position</span>
                    <span className="font-mono text-[#F8FAFC] tabular-nums">{splitPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={splitPercent}
                    onChange={(e) => setSplitPercent(Number(e.target.value))}
                    className="nv-slider mt-2 w-full"
                    aria-label="Original versus Grad-CAM split slider"
                  />
                </div>
              </div>
            )}

            {/* Live Activation Coordinate Readout */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#080B16]/80 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <Crosshair className="h-3.5 w-3.5 text-[#22D3EE]" />
                <span>
                  {probe
                    ? `Probe (${probe.x}, ${probe.y}) px`
                    : 'Hover over the MRI viewport to inspect simulated activation intensity'}
                </span>
              </div>
              {probe && (
                <div className="flex items-center gap-3 font-mono tabular-nums">
                  <span className="text-[#F8FAFC]">
                    Intensity: {probe.intensity.toFixed(2)}
                  </span>
                  <span style={{ color: activationLabel(probe.intensity).color }}>
                    {activationLabel(probe.intensity).text}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Required Scientific Interpretability Disclaimer */}
          <div className="flex items-start gap-3 rounded-2xl border border-slate-800/90 bg-[#101629]/85 p-4 text-xs leading-relaxed text-[#94A3B8]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8B5CF6]" />
            <div>
              <p className="text-[#F8FAFC] font-medium">
                Grad-CAM visualization highlights image regions that influence a model&apos;s
                prediction. It does not represent a definitive tumor boundary or clinical
                segmentation.
              </p>
              <p className="mt-1">
                In this browser preview, heatmaps are procedurally generated illustrative
                visualizations demonstrating explainable AI workflows rather than live gradients
                from a trained neural network backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

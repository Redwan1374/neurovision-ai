import React, { useRef, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Scan,
  Trash2,
  RefreshCw,
  Play,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface MRIViewerProps {
  imageUrl: string;
  fileName: string;
  isDemoSample: boolean;
  isAnalyzing: boolean;
  showGrid: boolean;
  onAnalyze: () => void;
  onRemove: () => void;
  onReplaceFile: (file: File) => void;
}

export const MRIViewer: React.FC<MRIViewerProps> = ({
  imageUrl,
  fileName,
  isDemoSample,
  isAnalyzing,
  showGrid,
  onAnalyze,
  onRemove,
  onReplaceFile,
}) => {
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(105);
  const [showWindowing, setShowWindowing] = useState(false);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100));
  const handleReset = () => {
    setZoom(1);
    setFitMode('contain');
    setBrightness(100);
    setContrast(105);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 512);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 512);
    setCursorCoords({ x: Math.max(0, Math.min(512, x)), y: Math.max(0, Math.min(512, y)) });
  };

  const viewerCanvas = (fullscreenMode: boolean) => (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCursorCoords(null)}
      className={`relative flex items-center justify-center overflow-hidden bg-[#04060D] cursor-crosshair select-none ${
        fullscreenMode ? 'h-[78vh] w-full rounded-xl' : 'h-[360px] sm:h-[420px] w-full rounded-xl'
      }`}
    >
      <img
        src={imageUrl}
        alt={`Loaded Brain MRI scan ${fileName}`}
        referrerPolicy="no-referrer"
        style={{
          transform: `scale(${zoom})`,
          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
        }}
        className={`transition-transform duration-150 ${
          fitMode === 'contain' ? 'max-h-full max-w-full object-contain' : 'h-full w-full object-cover'
        }`}
      />

      {/* Optional subtle radiological crosshair grid */}
      {showGrid && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(34,211,238,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.18) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      )}

      {/* Corner Radiological Orientation & Coordinate HUD */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-[#080B16]/80 px-2.5 py-1 font-mono text-[11px] text-[#94A3B8] backdrop-blur-sm border border-slate-800/80">
        {isDemoSample ? 'ILLUSTRATIVE DEMO SCAN' : 'UPLOADED MRI SCAN'}
      </div>

      <div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-[#080B16]/80 px-2.5 py-1 font-mono text-[11px] text-[#22D3EE] tabular-nums backdrop-blur-sm border border-slate-800/80">
        {Math.round(zoom * 100)}%
      </div>

      {cursorCoords && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-[#080B16]/85 px-2.5 py-1 font-mono text-[11px] text-[#F8FAFC] tabular-nums border border-slate-800/80">
          X: {cursorCoords.x} · Y: {cursorCoords.y} px
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-4 sm:p-5">
        {/* Top Viewer Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold text-[#F8FAFC] truncate">
              {fileName}
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Radiological MRI Inspection Viewer · Local Browser Preview
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-[#101629] text-[#F8FAFC] hover:border-[#8B5CF6]/60 transition-colors cursor-pointer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-[#101629] text-[#F8FAFC] hover:border-[#8B5CF6]/60 transition-colors cursor-pointer"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setFitMode((m) => (m === 'contain' ? 'cover' : 'contain'))}
              title="Fit to Screen"
              aria-label="Fit to Screen"
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors cursor-pointer ${
                fitMode === 'cover'
                  ? 'border-[#22D3EE]/60 bg-[#22D3EE]/15 text-[#22D3EE]'
                  : 'border-slate-700/80 bg-[#101629] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Scan className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fit</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset Zoom"
              aria-label="Reset Zoom"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-[#101629] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowWindowing((w) => !w)}
              title="Window / Level Adjustments"
              aria-label="Toggle Brightness and Contrast"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                showWindowing
                  ? 'border-[#8B5CF6]/70 bg-[#8B5CF6]/20 text-[#F8FAFC]'
                  : 'border-slate-700/80 bg-[#101629] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="Fullscreen"
              aria-label="Fullscreen Viewer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-[#101629] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Optional Windowing Controls */}
        {showWindowing && (
          <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-[#080B16]/80 p-3.5 sm:grid-cols-2">
            <div>
              <div className="flex justify-between text-xs text-[#94A3B8]">
                <span>Brightness (Level)</span>
                <span className="font-mono tabular-nums text-[#F8FAFC]">{brightness}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={150}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="nv-slider mt-2 w-full"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[#94A3B8]">
                <span>Contrast (Window)</span>
                <span className="font-mono tabular-nums text-[#F8FAFC]">{contrast}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={175}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="nv-slider mt-2 w-full"
              />
            </div>
          </div>
        )}

        {/* Viewport */}
        {viewerCanvas(false)}

        {/* Action Row: Replace, Remove, and Primary Analyze MRI button */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-2">
            <input
              ref={replaceInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onReplaceFile(file);
                e.target.value = '';
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => replaceInputRef.current?.click()}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#101629] px-3 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6]/50 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Replace Image
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#101629] px-3 py-2 text-xs font-medium text-rose-300 hover:border-rose-500/50 hover:bg-rose-500/10 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="nv-gradient-btn inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            {isAnalyzing ? 'Analyzing MRI...' : 'Analyze MRI'}
          </button>
        </div>
      </div>

      {/* Fullscreen Inspection Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-800 bg-[#080B16] p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold text-[#F8FAFC]">{fileName}</p>
                <p className="text-xs text-[#94A3B8]">
                  Fullscreen Inspection · Zoom {Math.round(zoom * 100)}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#101629] text-[#F8FAFC] cursor-pointer"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#101629] text-[#F8FAFC] cursor-pointer"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#101629] text-[#F8FAFC] cursor-pointer"
                  aria-label="Reset View"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-700 bg-[#141C31] px-3 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6] cursor-pointer"
                >
                  <Minimize2 className="h-4 w-4" />
                  Exit
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-[#101629] text-[#94A3B8] hover:text-white cursor-pointer"
                  aria-label="Close Fullscreen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {viewerCanvas(true)}
          </div>
        </div>
      )}
    </>
  );
};

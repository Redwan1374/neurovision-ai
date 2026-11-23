import React from 'react';
import {
  Brain,
  Layers,
  Eye,
  ScanSearch,
  History,
  ArrowRight,
  GitCompare,
} from 'lucide-react';
import { AnalysisCase, DashboardTab } from '../types/mri';
import { CATEGORY_META, TUMOR_CATEGORIES } from '../data/mockResearchData';
import { MetricCard } from './MetricCard';

interface DashboardOverviewProps {
  activeCase: AnalysisCase;
  history: AnalysisCase[];
  onNavigateTab: (tab: DashboardTab) => void;
  onSelectCase: (item: AnalysisCase) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  activeCase,
  history,
  onNavigateTab,
  onSelectCase,
}) => {
  const categoryCounts = TUMOR_CATEGORIES.map((cat) => ({
    category: cat,
    count: history.filter((h) => h.predictedClass === cat).length,
    color: CATEGORY_META[cat].color,
  }));

  const avgConfidence =
    history.length > 0
      ? history.reduce((sum, item) => sum + item.confidence, 0) / history.length
      : activeCase.confidence;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/90 bg-gradient-to-r from-[#141C31] via-[#101629] to-[#141C31] p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-xs font-medium text-[#22D3EE]">
            RESEARCH WORKSPACE OVERVIEW · DEMO MODE
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-[#F8FAFC]">
            NeuroVision AI Control Center
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[#94A3B8]">
            Upload new brain MRI scans, compare multi-backbone ensemble confidence, and inspect
            illustrative Grad-CAM attribution maps.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('analyze')}
          className="nv-gradient-btn inline-flex items-center gap-2 self-start rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all whitespace-nowrap shrink-0 cursor-pointer sm:self-auto"
        >
          <ScanSearch className="h-4 w-4" />
          New MRI Analysis
        </button>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Analyzed Cases"
          value={String(history.length)}
          unit="scans"
          caption="Local browser demo session archive"
          icon={History}
          accentColor="#8B5CF6"
        />
        <MetricCard
          label="Mean Confidence"
          value={avgConfidence.toFixed(1)}
          unit="%"
          caption="Illustrative simulated ensemble average"
          icon={Brain}
          accentColor="#22D3EE"
        />
        <MetricCard
          label="Active Backbones"
          value="3"
          unit="+ Ensemble"
          caption="EfficientNetV2-M · DenseNet201 · ConvNeXt-B"
          icon={Layers}
          accentColor="#3B82F6"
        />
        <MetricCard
          label="Explainability"
          value="Grad-CAM"
          caption="Interactive overlay, side-by-side & split views"
          icon={Eye}
          accentColor="#A855F7"
        />
      </div>

      {/* Main Split: Active Case Spotlight + Recent History & Cohort Distribution */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Active Case Spotlight */}
        <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-6 xl:col-span-7">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
                Active MRI Case Spotlight
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {activeCase.id} · {activeCase.fileName}
              </p>
            </div>
            <span className="font-mono text-xs text-[#22D3EE]">DEMO MODE</span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-black p-2">
                <img
                  src={activeCase.imageUrl}
                  alt={`Active case ${activeCase.id}`}
                  referrerPolicy="no-referrer"
                  className="aspect-square w-full rounded-lg object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between sm:col-span-7">
              <div>
                <p className="text-xs text-[#94A3B8]">Simulated Ensemble Classification</p>
                <p
                  className="mt-1 font-display text-2xl font-bold"
                  style={{ color: CATEGORY_META[activeCase.predictedClass].color }}
                >
                  {activeCase.predictedClass}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#F8FAFC] tabular-nums">
                  Confidence: {activeCase.confidence.toFixed(1)}% · {activeCase.plane}
                </p>

                <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
                  {activeCase.models.map((m) => (
                    <div key={m.key} className="flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">{m.name}</span>
                      <span className="font-mono text-[#F8FAFC] tabular-nums">
                        {m.confidence.toFixed(1)}% · {m.processingTimeMs} ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigateTab('explainability')}
                  className="nv-gradient-btn inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Open Grad-CAM
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('models')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-[#101629] px-4 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6] cursor-pointer"
                >
                  <GitCompare className="h-3.5 w-3.5 text-[#A855F7]" />
                  Model Benchmarks
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cohort Breakdown & Recent Cases */}
        <div className="space-y-6 xl:col-span-5">
          {/* Category Breakdown */}
          <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-5">
            <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
              Session Cohort Distribution
            </h3>
            <p className="mt-0.5 text-xs text-[#94A3B8]">
              Predicted categories across current local demo history
            </p>
            <div className="mt-4 space-y-3">
              {categoryCounts.map((row) => {
                const pct = history.length ? (row.count / history.length) * 100 : 0;
                return (
                  <div key={row.category}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#F8FAFC]">{row.category}</span>
                      <span className="font-mono text-[#94A3B8] tabular-nums">
                        {row.count} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#080B16]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(pct, row.count > 0 ? 6 : 0)}%`,
                          backgroundColor: row.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Cases Quick List */}
          <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
                Recent Demo Cases
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('history')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#22D3EE] hover:underline cursor-pointer"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-800/70">
              {history.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectCase(item)}
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-[#101629]/70 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.id}
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded-lg border border-slate-800 bg-black object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-[#F8FAFC]">{item.id}</p>
                      <p
                        className="text-xs font-medium truncate"
                        style={{ color: CATEGORY_META[item.predictedClass].color }}
                      >
                        {item.predictedClass}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-semibold text-[#F8FAFC] tabular-nums">
                      {item.confidence.toFixed(1)}%
                    </p>
                    <p className="font-mono text-[10px] text-[#94A3B8]">{item.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

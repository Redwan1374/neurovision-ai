import React, { useMemo, useState } from 'react';
import {
  Search,
  Trash2,
  Eye,
  FileSearch,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Info,
  X,
} from 'lucide-react';
import { AnalysisCase, TumorCategory } from '../types/mri';
import { CATEGORY_META, TUMOR_CATEGORIES } from '../data/mockResearchData';

interface AnalysisHistoryProps {
  history: AnalysisCase[];
  onLoadCase: (item: AnalysisCase) => void;
  onInspectGradCAM: (item: AnalysisCase) => void;
  onDeleteCase: (id: string) => void;
  onResetDemoHistory: () => void;
}

type SortOrder = 'newest' | 'oldest' | 'conf-desc' | 'conf-asc';

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  history,
  onLoadCase,
  onInspectGradCAM,
  onDeleteCase,
  onResetDemoHistory,
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | TumorCategory>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [layoutMode, setLayoutMode] = useState<'table' | 'cards'>('table');
  const [detailCase, setDetailCase] = useState<AnalysisCase | null>(null);

  const filteredHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...history]
      .filter((item) => {
        if (categoryFilter !== 'All' && item.predictedClass !== categoryFilter) {
          return false;
        }
        if (!q) return true;
        return (
          item.id.toLowerCase().includes(q) ||
          item.fileName.toLowerCase().includes(q) ||
          item.predictedClass.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') return b.timestamp - a.timestamp;
        if (sortOrder === 'oldest') return a.timestamp - b.timestamp;
        if (sortOrder === 'conf-desc') return b.confidence - a.confidence;
        return a.confidence - b.confidence;
      });
  }, [history, query, categoryFilter, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-medium text-[#22D3EE]">
            LOCAL SESSION ARCHIVE · DEMO MODE
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
            Analysis History
          </h2>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Browse, filter, inspect, or remove simulated MRI analysis records stored locally in
            your browser.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetDemoHistory}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-700/80 bg-[#141C31] px-4 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6]/60 transition-colors whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-[#22D3EE]" />
          Restore Demo Cases
        </button>
      </div>

      {/* Local Storage Limitation Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-[#101629]/85 px-4 py-3 text-xs text-[#94A3B8]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8B5CF6]" />
        <span>
          No external medical database is connected. Sample cases and any scans you analyze are
          stored strictly in local browser state for demonstration purposes only.
        </span>
      </div>

      {/* Controls Bar: Search, Category Filter, Sort, Layout Switch */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-[#141C31]/75 p-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Case ID, filename, or class..."
            className="w-full rounded-xl border border-slate-700/80 bg-[#080B16] py-2 pl-9 pr-3 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-800 bg-[#080B16] p-1">
          {(['All', ...TUMOR_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort + View Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            aria-label="Sort analysis history"
            className="rounded-xl border border-slate-700/80 bg-[#080B16] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="conf-desc">Sort: Highest Confidence</option>
            <option value="conf-asc">Sort: Lowest Confidence</option>
          </select>

          <div className="flex items-center rounded-xl border border-slate-800 bg-[#080B16] p-1">
            <button
              type="button"
              onClick={() => setLayoutMode('table')}
              aria-label="Table view"
              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg cursor-pointer ${
                layoutMode === 'table'
                  ? 'bg-[#141C31] text-[#F8FAFC]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('cards')}
              aria-label="Card grid view"
              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg cursor-pointer ${
                layoutMode === 'cards'
                  ? 'bg-[#141C31] text-[#F8FAFC]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-[#141C31]/65 p-12 text-center">
          <p className="font-display text-base font-semibold text-[#F8FAFC]">
            No matching analysis cases found
          </p>
          <p className="mt-1.5 text-xs text-[#94A3B8]">
            Try clearing your search filter or restore the illustrative demo cases.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategoryFilter('All');
              if (history.length === 0) onResetDemoHistory();
            }}
            className="mt-4 rounded-xl bg-[#8B5CF6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7C3AED] transition-colors cursor-pointer"
          >
            {history.length === 0 ? 'Restore Demo Cases' : 'Clear Filters'}
          </button>
        </div>
      ) : layoutMode === 'table' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-[#141C31]/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#101629]/90 text-xs font-medium text-[#94A3B8]">
                  <th className="px-5 py-3.5">Case ID</th>
                  <th className="px-4 py-3.5">Scan</th>
                  <th className="px-4 py-3.5">Predicted Category</th>
                  <th className="px-4 py-3.5 text-right">Confidence</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHistory.map((item) => {
                  const meta = CATEGORY_META[item.predictedClass];
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[#101629]/75"
                    >
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-[#F8FAFC]">
                        {item.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={`Thumbnail for ${item.id}`}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-lg border border-slate-800 bg-black object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="max-w-[190px] truncate text-xs font-medium text-[#F8FAFC]">
                              {item.fileName}
                            </p>
                            <p className="text-[11px] text-[#94A3B8]">{item.plane}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: meta.color }}
                        >
                          {item.predictedClass}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-[#F8FAFC] tabular-nums">
                        {item.confidence.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#94A3B8] whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#94A3B8] whitespace-nowrap">
                        {item.status}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailCase(item)}
                            title="View Details"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700/80 bg-[#080B16] px-2.5 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6]/60 cursor-pointer whitespace-nowrap"
                          >
                            <FileSearch className="h-3.5 w-3.5 text-[#8B5CF6]" />
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => onInspectGradCAM(item)}
                            title="Inspect Grad-CAM"
                            aria-label={`Inspect Grad-CAM for ${item.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-[#080B16] text-[#22D3EE] hover:border-[#22D3EE]/60 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCase(item.id)}
                            title="Delete Case"
                            aria-label={`Delete ${item.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-[#080B16] text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredHistory.map((item) => {
            const meta = CATEGORY_META[item.predictedClass];
            return (
              <div
                key={item.id}
                className="flex flex-col rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={item.imageUrl}
                    alt={`Scan ${item.id}`}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-xl border border-slate-800 bg-black object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-[#F8FAFC]">
                        {item.id}
                      </span>
                      <span className="font-mono text-xs text-[#94A3B8]">{item.date}</span>
                    </div>
                    <p
                      className="mt-1 font-display text-base font-bold"
                      style={{ color: meta.color }}
                    >
                      {item.predictedClass}
                    </p>
                    <p className="font-mono text-xs text-[#F8FAFC] tabular-nums">
                      Confidence: {item.confidence.toFixed(1)}% · {item.status}
                    </p>
                  </div>
                </div>

                <p className="mt-3 truncate text-xs text-[#94A3B8]">{item.fileName}</p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailCase(item)}
                      className="rounded-lg border border-slate-700/80 bg-[#080B16] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6] cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onInspectGradCAM(item)}
                      className="rounded-lg border border-slate-700/80 bg-[#080B16] px-3 py-1.5 text-xs font-medium text-[#22D3EE] hover:border-[#22D3EE] cursor-pointer"
                    >
                      Grad-CAM
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteCase(item.id)}
                    aria-label={`Delete ${item.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-[#080B16] text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Case Details Modal Dialog */}
      {detailCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-[#101629] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="font-mono text-xs text-[#22D3EE]">
                  DEMO MODE CASE REPORT · {detailCase.id}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-[#F8FAFC]">
                  {detailCase.fileName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailCase(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-[#141C31] text-[#94A3B8] hover:text-white cursor-pointer"
                aria-label="Close case details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-12">
              <div className="sm:col-span-5">
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-black p-2">
                  <img
                    src={detailCase.imageUrl}
                    alt={`Case ${detailCase.id}`}
                    referrerPolicy="no-referrer"
                    className="aspect-square w-full rounded-lg object-contain"
                  />
                </div>
                <p className="mt-2 text-center font-mono text-[11px] text-[#94A3B8]">
                  {detailCase.plane} · {detailCase.date}
                </p>
              </div>

              <div className="space-y-4 sm:col-span-7">
                <div>
                  <p className="text-xs text-[#94A3B8]">Simulated Ensemble Prediction</p>
                  <p
                    className="mt-0.5 font-display text-2xl font-bold"
                    style={{ color: CATEGORY_META[detailCase.predictedClass].color }}
                  >
                    {detailCase.predictedClass}{' '}
                    <span className="font-mono text-lg text-[#F8FAFC] tabular-nums">
                      ({detailCase.confidence.toFixed(1)}%)
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#94A3B8]">Class Probabilities</p>
                  {TUMOR_CATEGORIES.map((cat) => (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">{cat}</span>
                      <span className="font-mono text-[#F8FAFC] tabular-nums">
                        {detailCase.probabilities[cat].toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 border-t border-slate-800 pt-3">
                  <p className="text-xs font-medium text-[#94A3B8]">Individual Backbones</p>
                  {detailCase.models.map((m) => (
                    <div key={m.key} className="flex items-center justify-between text-xs">
                      <span className="text-[#F8FAFC]">{m.name}</span>
                      <span className="font-mono text-[#94A3B8] tabular-nums">
                        {m.predictedClass} · {m.confidence.toFixed(1)}% ({m.processingTimeMs} ms)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => {
                  onLoadCase(detailCase);
                  setDetailCase(null);
                }}
                className="rounded-xl border border-slate-700 bg-[#141C31] px-4 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#8B5CF6] cursor-pointer"
              >
                Load in Analysis Workspace
              </button>
              <button
                type="button"
                onClick={() => {
                  onInspectGradCAM(detailCase);
                  setDetailCase(null);
                }}
                className="nv-gradient-btn rounded-xl px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Inspect Grad-CAM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

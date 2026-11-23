import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { Cpu, Layers, Clock, Info, ArrowUpDown } from 'lucide-react';
import { AnalysisCase, ModelKey, TumorCategory } from '../types/mri';
import {
  CATEGORY_META,
  DEMO_MODEL_BENCHMARKS,
  TUMOR_CATEGORIES,
} from '../data/mockResearchData';

interface ModelComparisonProps {
  activeCase: AnalysisCase;
  onSelectGradCamModel?: (model: ModelKey) => void;
}

type MetricKey = 'accuracy' | 'precision' | 'recall' | 'f1Score' | 'auc';

const METRIC_LABELS: Record<MetricKey, string> = {
  accuracy: 'Accuracy',
  precision: 'Precision',
  recall: 'Recall',
  f1Score: 'F1-Score',
  auc: 'ROC-AUC',
};

const MODEL_COLORS: Record<ModelKey, string> = {
  efficientnet: '#8B5CF6',
  densenet: '#3B82F6',
  convnext: '#22D3EE',
  ensemble: '#10B981',
};

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  activeCase,
  onSelectGradCamModel,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('accuracy');
  const [modelFilter, setModelFilter] = useState<'all' | 'individual' | 'ensemble'>('all');
  const [classMetric, setClassMetric] = useState<'f1' | 'recall'>('f1');
  const [sortCol, setSortCol] = useState<MetricKey>('f1Score');
  const [sortDesc, setSortDesc] = useState(true);

  const filteredBenchmarks = useMemo(() => {
    const base = DEMO_MODEL_BENCHMARKS.filter((m) => {
      if (modelFilter === 'individual') return m.key !== 'ensemble';
      if (modelFilter === 'ensemble') return m.key === 'ensemble';
      return true;
    });
    return [...base].sort((a, b) =>
      sortDesc ? b[sortCol] - a[sortCol] : a[sortCol] - b[sortCol]
    );
  }, [modelFilter, sortCol, sortDesc]);

  const metricBarData = useMemo(
    () =>
      filteredBenchmarks.map((m) => ({
        name: m.shortName,
        fullName: m.name,
        Accuracy: m.accuracy,
        Precision: m.precision,
        Recall: m.recall,
        'F1-Score': m.f1Score,
        'ROC-AUC': m.auc,
        selectedValue: m[selectedMetric],
        key: m.key,
      })),
    [filteredBenchmarks, selectedMetric]
  );

  const radarData = useMemo(() => {
    const metrics: { subject: string; field: MetricKey }[] = [
      { subject: 'Accuracy', field: 'accuracy' },
      { subject: 'Precision', field: 'precision' },
      { subject: 'Recall', field: 'recall' },
      { subject: 'F1-Score', field: 'f1Score' },
      { subject: 'ROC-AUC', field: 'auc' },
    ];
    return metrics.map((item) => {
      const row: Record<string, string | number> = { metric: item.subject };
      for (const b of DEMO_MODEL_BENCHMARKS) {
        row[b.shortName] = b[item.field];
      }
      return row;
    });
  }, []);

  const classWiseData = useMemo(() => {
    return TUMOR_CATEGORIES.map((category: TumorCategory) => {
      const row: Record<string, string | number> = { category };
      for (const b of filteredBenchmarks) {
        row[b.shortName] =
          classMetric === 'f1' ? b.perClassF1[category] : b.perClassRecall[category];
      }
      return row;
    });
  }, [filteredBenchmarks, classMetric]);

  const handleSort = (col: MetricKey) => {
    if (sortCol === col) {
      setSortDesc((d) => !d);
    } else {
      setSortCol(col);
      setSortDesc(true);
    }
  };

  const ensembleColor = CATEGORY_META[activeCase.predictedClass].color;

  return (
    <div className="space-y-8">
      {/* Header & Active Case Context */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs font-medium text-[#22D3EE]">
            MULTI-MODEL INFERENCE &amp; BENCHMARK ANALYTICS · DEMO MODE
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
            Model Comparison &amp; Performance
          </h2>
          <p className="mt-1.5 text-sm text-[#94A3B8]">
            Comparing individual backbone outputs for active case{' '}
            <span className="font-mono text-[#F8FAFC]">{activeCase.id}</span> ({activeCase.fileName}
            ) alongside illustrative multi-metric benchmark profiles.
          </p>
        </div>
      </div>

      {/* Section 1: Active Case Per-Model Cards (3 Backbones + Highlighted Separate Ensemble Card) */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
            Active Scan Inference Comparison (Simulated)
          </h3>
          <span className="font-mono text-xs text-[#94A3B8]">
            3 Individual Architectures + 1 Separate Ensemble Output
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {activeCase.models.map((model) => {
            const catMeta = CATEGORY_META[model.predictedClass];
            const accent = MODEL_COLORS[model.key];
            return (
              <div
                key={model.key}
                className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#141C31]/85 p-5 transition-colors hover:border-[#8B5CF6]/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 shrink-0" style={{ color: accent }} />
                      <h4 className="font-display text-base font-semibold text-[#F8FAFC]">
                        {model.name}
                      </h4>
                    </div>
                    <span className="font-mono text-[11px] text-[#94A3B8]">{model.parameters}</span>
                  </div>

                  <p className="mt-2 text-xs text-[#94A3B8]">{model.architecture}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                    Input: {model.inputResolution}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-slate-800/80 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">Predicted Class</span>
                      <span className="font-semibold" style={{ color: catMeta.color }}>
                        {model.predictedClass}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">Confidence (Demo)</span>
                      <span className="font-mono font-semibold text-[#F8FAFC] tabular-nums">
                        {model.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#080B16]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${model.confidence}%`,
                          backgroundColor: accent,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-[#94A3B8]">
                        <Clock className="h-3.5 w-3.5" />
                        Processing Time
                      </span>
                      <span className="font-mono text-[#F8FAFC] tabular-nums">
                        {model.processingTimeMs} ms
                      </span>
                    </div>
                  </div>
                </div>

                {onSelectGradCamModel && (
                  <button
                    type="button"
                    onClick={() => onSelectGradCamModel(model.key)}
                    className="mt-4 w-full rounded-lg border border-slate-700/80 bg-[#101629] py-2 text-xs font-medium text-[#94A3B8] hover:border-[#8B5CF6]/60 hover:text-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    Inspect Backbone Grad-CAM
                  </button>
                )}
              </div>
            );
          })}

          {/* 4th Highlighted Card: Separate Ensemble Prediction */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#8B5CF6]/60 bg-gradient-to-b from-[#1A2240] via-[#141C31] to-[#101629] p-5 shadow-[0_0_32px_rgba(139,92,246,0.18)]">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#22D3EE]" />
                  <h4 className="font-display text-base font-bold text-[#F8FAFC]">
                    Ensemble Prediction
                  </h4>
                </div>
                <span className="font-mono text-[10px] font-semibold text-[#22D3EE]">
                  SEPARATE OUTPUT
                </span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
                Weighted soft-voting output combining calibrated logits from EfficientNetV2-M,
                DenseNet201, and ConvNeXt-Base independently.
              </p>

              <div className="mt-5 space-y-3 border-t border-[#8B5CF6]/25 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Combined Class</span>
                  <span className="font-display text-sm font-bold" style={{ color: ensembleColor }}>
                    {activeCase.predictedClass}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Ensemble Confidence</span>
                  <span className="font-mono text-base font-bold text-[#F8FAFC] tabular-nums">
                    {activeCase.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#080B16]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE]"
                    style={{ width: `${activeCase.confidence}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-[#94A3B8]">
                    <Clock className="h-3.5 w-3.5" />
                    Aggregated Latency
                  </span>
                  <span className="font-mono text-[#F8FAFC] tabular-nums">
                    {activeCase.ensembleProcessingTimeMs} ms
                  </span>
                </div>
              </div>
            </div>

            {onSelectGradCamModel && (
              <button
                type="button"
                onClick={() => onSelectGradCamModel('ensemble')}
                className="nv-gradient-btn mt-4 w-full rounded-lg py-2 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Inspect Ensemble Grad-CAM
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Benchmark Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-xs text-amber-200/90">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <span>
          <strong className="font-semibold text-amber-200">Demo Mode Research Notice: </strong>
          Metrics shown in demo mode are illustrative and must not be interpreted as experimental
          findings.
        </span>
      </div>

      {/* Interactive Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#101629]/80 p-4">
        {/* Metric Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(METRIC_LABELS) as MetricKey[]).map((mKey) => (
            <button
              key={mKey}
              type="button"
              onClick={() => setSelectedMetric(mKey)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedMetric === mKey
                  ? 'bg-[#8B5CF6] text-white'
                  : 'bg-[#141C31] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {METRIC_LABELS[mKey]}
            </button>
          ))}
        </div>

        {/* Architecture Scope Filter */}
        <div className="flex items-center gap-1 rounded-lg bg-[#080B16] p-1 border border-slate-800">
          {(
            [
              { id: 'all', label: 'All Models' },
              { id: 'individual', label: 'Backbones Only' },
              { id: 'ensemble', label: 'Ensemble' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setModelFilter(f.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                modelFilter === f.id
                  ? 'bg-[#141C31] text-[#F8FAFC]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid: Metric Comparison Bar + 5-Axis Radar Profile */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Selected Metric & Multi-Metric Bar Chart */}
        <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-5 xl:col-span-7">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
                {METRIC_LABELS[selectedMetric]} &amp; Overall Comparison (Illustrative Demo)
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Percentage scores across architectures (Y-axis zoomed 90%–100% for precision)
              </p>
            </div>
            <span className="font-mono text-xs text-[#22D3EE]">
              Active: {METRIC_LABELS[selectedMetric]}
            </span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metricBarData}
                margin={{ top: 10, right: 16, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis
                  domain={[90, 100]}
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080B16',
                    borderColor: 'rgba(139,92,246,0.4)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                  formatter={(value) => [
                    `${Number(Array.isArray(value) ? value[0] : value ?? 0).toFixed(1)}%`,
                    '',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey={METRIC_LABELS[selectedMetric]}
                  fill="#8B5CF6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                {selectedMetric !== 'f1Score' && (
                  <Bar
                    dataKey="F1-Score"
                    fill="#22D3EE"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                )}
                {selectedMetric !== 'auc' && (
                  <Bar
                    dataKey="ROC-AUC"
                    fill="#3B82F6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5-Metric Radar Chart */}
        <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-5 xl:col-span-5">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
              5-Metric Architecture Profile
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Accuracy, Precision, Recall, F1-Score, and ROC-AUC (Demo Data)
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="rgba(148,163,184,0.2)" />
                <PolarAngleAxis dataKey="metric" stroke="#94A3B8" fontSize={11} />
                <PolarRadiusAxis
                  angle={90}
                  domain={[92, 100]}
                  tick={{ fill: '#64748B', fontSize: 10 }}
                />
                <Radar
                  name="EffNetV2-M"
                  dataKey="EffNetV2-M"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.14}
                  strokeWidth={2}
                />
                <Radar
                  name="DenseNet201"
                  dataKey="DenseNet201"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="ConvNeXt-B"
                  dataKey="ConvNeXt-B"
                  stroke="#22D3EE"
                  fill="#22D3EE"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Radar
                  name="Ensemble"
                  dataKey="Ensemble"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.2}
                  strokeWidth={2.2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080B16',
                    borderColor: 'rgba(139,92,246,0.4)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Class-Wise Performance Visualization */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#141C31]/80 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
              Class-Wise Performance Breakdown (Illustrative Demo)
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Per-class {classMetric === 'f1' ? 'F1-Score' : 'Recall (Sensitivity)'} across Glioma,
              Meningioma, Pituitary, and No Tumor
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#080B16] p-1">
            <button
              type="button"
              onClick={() => setClassMetric('f1')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                classMetric === 'f1'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Class F1-Score
            </button>
            <button
              type="button"
              onClick={() => setClassMetric('recall')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                classMetric === 'recall'
                  ? 'bg-[#8B5CF6] text-white'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Class Recall
            </button>
          </div>
        </div>

        <div className="h-[290px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classWiseData} margin={{ top: 8, right: 16, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
              <XAxis dataKey="category" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis
                domain={[90, 100]}
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#080B16',
                  borderColor: 'rgba(139,92,246,0.4)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(val) => [
                  `${Number(Array.isArray(val) ? val[0] : val ?? 0).toFixed(1)}%`,
                  '',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {filteredBenchmarks.map((b) => (
                <Bar
                  key={b.key}
                  dataKey={b.shortName}
                  fill={MODEL_COLORS[b.key]}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Quantitative Model Comparison Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-[#141C31]/80">
        <div className="border-b border-slate-800/80 px-5 py-4">
          <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
            Model Comparison Table (Illustrative Demo Metrics)
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Click metric column headers to sort architectures. Values represent simulated demo
            benchmarks.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800/80 bg-[#101629]/90 text-xs font-medium text-[#94A3B8]">
                <th className="px-5 py-3.5">Architecture</th>
                <th className="px-4 py-3.5">Params</th>
                {(Object.keys(METRIC_LABELS) as MetricKey[]).map((mKey) => (
                  <th key={mKey} className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort(mKey)}
                      className="inline-flex items-center gap-1 hover:text-[#F8FAFC] cursor-pointer"
                    >
                      <span>{METRIC_LABELS[mKey]}</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBenchmarks.map((row) => (
                <tr
                  key={row.key}
                  className={`transition-colors hover:bg-[#101629]/70 ${
                    row.key === 'ensemble' ? 'bg-[#8B5CF6]/8' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: MODEL_COLORS[row.key] }}
                      />
                      <div>
                        <p className="font-medium text-[#F8FAFC]">{row.name}</p>
                        <p className="text-xs text-[#94A3B8]">{row.family}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#94A3B8] tabular-nums">
                    {row.params}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs text-[#F8FAFC] tabular-nums">
                    {row.accuracy.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs text-[#F8FAFC] tabular-nums">
                    {row.precision.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs text-[#F8FAFC] tabular-nums">
                    {row.recall.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-[#22D3EE] tabular-nums">
                    {row.f1Score.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs text-[#F8FAFC] tabular-nums">
                    {row.auc.toFixed(1)}%
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-xs text-[#94A3B8] tabular-nums">
                    {row.latencyMs} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

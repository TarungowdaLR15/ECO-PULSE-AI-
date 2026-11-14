// ReportsPage.tsx — ECO-PULSE AI
// Professional reporting page with CSV export and report preview.
// All data is simulated for demonstration purposes.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Brain,
  Wallet,
  Download,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Printer,
  X,
} from 'lucide-react';
import { NEIGHBOURHOODS, INTERVENTIONS, SCENARIOS, SUMMARY_STATS } from '../data/mockData';
import DemoBadge from '../components/ui/DemoBadge';
import { useApp } from '../context/AppContext';

// ─── Types ───────────────────────────────────────────────────────────────────

type ReportType = 'neighbourhood' | 'intervention' | 'budget';

interface ReportMeta {
  id: ReportType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  description: string;
  includes: string[];
  color: string;
  glowColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = new Date().toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const TODAY_ISO = new Date().toISOString().split('T')[0];

const REPORT_METAS: ReportMeta[] = [
  {
    id: 'neighbourhood',
    title: 'Neighbourhood Assessment Report',
    subtitle: 'Zone-level risk & vulnerability analysis',
    icon: FileText,
    description: 'Comprehensive risk analysis for all 10 assessed zones with heat scores, flood scores, and population exposure metrics.',
    includes: ['Heat risk index per zone', 'Flood risk index per zone', 'Vegetation coverage data', 'Population exposure estimates'],
    color: 'from-sky-500/20 to-sky-600/10',
    glowColor: 'shadow-sky-500/20',
  },
  {
    id: 'intervention',
    title: 'Intervention Recommendation Report',
    subtitle: 'AI-scored greening strategy analysis',
    icon: Brain,
    description: 'AI-scored intervention recommendations with justifications, cost estimates, and projected environmental benefits.',
    includes: ['Recommendation scores per zone', 'Intervention type breakdown', 'Cost per intervention type', 'Projected heat & flood reduction'],
    color: 'from-emerald-500/20 to-emerald-600/10',
    glowColor: 'shadow-emerald-500/20',
  },
  {
    id: 'budget',
    title: 'Budget Allocation Summary',
    subtitle: 'Financial planning & cost-benefit analysis',
    icon: Wallet,
    description: 'Current budget plan with scenario cost breakdowns, projected environmental benefits, and CO₂ reduction estimates.',
    includes: ['Scenario cost comparison', 'CO₂ reduction projections', 'Green coverage gain estimates', 'Heat & flood reduction forecasts'],
    color: 'from-violet-500/20 to-violet-600/10',
    glowColor: 'shadow-violet-500/20',
  },
];

const RECENT_REPORTS = [
  { id: 1, type: 'Neighbourhood Assessment', date: '2026-11-13', size: '248 KB', status: 'Completed' },
  { id: 2, type: 'Intervention Recommendations', date: '2026-11-12', size: '184 KB', status: 'Completed' },
  { id: 3, type: 'Budget Allocation Summary', date: '2026-11-11', size: '112 KB', status: 'Completed' },
  { id: 4, type: 'Neighbourhood Assessment', date: '2026-11-10', size: '251 KB', status: 'Completed' },
  { id: 5, type: 'Intervention Recommendations', date: '2026-11-09', size: '179 KB', status: 'Completed' },
];

// ─── Helper: Risk badge ───────────────────────────────────────────────────────

const riskBadge = (level: 'low' | 'medium' | 'high') => {
  const cfg = {
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  }[level];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg} uppercase tracking-wide`}>
      {level}
    </span>
  );
};

// ─── Helper: generate CSV blob download ──────────────────────────────────────

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const buildNeighbourhoodCSV = () =>
  'Zone,Heat Score,Flood Score,Heat Risk,Flood Risk,Population Exposure,Vegetation Coverage (%),Available Land (ha),Recommendation,Recommendation Score\n' +
  NEIGHBOURHOODS.map(
    n =>
      `${n.name},${n.heatScore},${n.floodScore},${n.heatRisk},${n.floodRisk},${n.populationExposure},${n.vegetationCoverage},${n.availableLand},${n.recommendation},${n.recommendationScore}`,
  ).join('\n');

const buildInterventionCSV = () =>
  'Zone,Recommended Intervention,Recommendation Score,Heat Score,Flood Score,Population Exposure\n' +
  NEIGHBOURHOODS.map(n => {
    const intv = INTERVENTIONS.find(i => i.id === n.recommendation);
    return `${n.name},${intv?.name ?? n.recommendation},${n.recommendationScore},${n.heatScore},${n.floodScore},${n.populationExposure}`;
  }).join('\n');

const buildBudgetCSV = () =>
  'Scenario,Cost (Crores INR),Heat Change (%),Flood Change (%),Coverage Change (% pts),CO2 Reduction (t/yr)\n' +
  SCENARIOS.map(
    s =>
      `${s.name},${s.cost},${s.heatChange},${s.floodChange},${s.coverageChange},${s.co2Reduction}`,
  ).join('\n');

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 24, scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    className="fixed bottom-6 right-6 z-50 flex items-start gap-3 max-w-sm
      bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl"
  >
    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
    <p className="text-sm text-slate-200 leading-snug flex-1">{message}</p>
    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// ─── Report Preview ───────────────────────────────────────────────────────────

interface ReportPreviewProps {
  reportType: ReportType;
  meta: ReportMeta;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ reportType, meta }) => {
  const assumptionsByType: Record<ReportType, string[]> = {
    neighbourhood: [
      'Heat scores are modelled from land surface temperature proxies and are not direct measurements.',
      'Flood scores represent modelled inundation risk under a 1-in-25-year rainfall event (illustrative).',
      'Population exposure figures are illustrative estimates based on ward-level census interpolation.',
      'Vegetation coverage derived from simulated NDVI imagery and not verified by ground survey.',
    ],
    intervention: [
      'Recommendation scores calculated by an illustrative weighted model (heat 40%, flood 40%, land availability 20%).',
      'Cost estimates are indicative ranges from published urban greening literature and are not procurement prices.',
      'Projected heat/flood reductions are model outputs and may differ significantly from observed outcomes.',
      'All interventions are subject to site-level feasibility assessment before implementation.',
    ],
    budget: [
      'All cost figures are illustrative and expressed in Indian Rupees (Crores) for demonstration only.',
      'CO₂ reduction estimates are annualised projections over a 20-year lifecycle, discounted at 5%.',
      'Scenario comparisons do not account for phasing, land acquisition, or regulatory approval costs.',
      'Benefits are projected estimates and are sensitive to implementation quality and local conditions.',
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35 }}
      className="mt-6 rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-md overflow-hidden"
    >
      {/* Report Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 border-b border-slate-700/60 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 font-black text-sm">EP</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">ECO-PULSE AI</p>
              <h3 className="text-white font-bold text-base leading-tight">{meta.title}</h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-amber-400 text-xs font-bold tracking-widest uppercase">
              DEMONSTRATION DATA
            </span>
            <span className="text-xs text-slate-500">{TODAY}</span>
          </div>
        </div>

        {/* Metadata row */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
          <span>
            <span className="text-slate-500">Data source: </span>
            Simulated dataset — Bengaluru, Karnataka, India
          </span>
          <span>
            <span className="text-slate-500">Generated: </span>
            {TODAY_ISO}
          </span>
          <span>
            <span className="text-slate-500">Last updated: </span>
            {SUMMARY_STATS.lastUpdated}
          </span>
        </div>
      </div>

      {/* Assumptions */}
      <div className="px-6 py-4 border-b border-slate-700/60 bg-amber-500/5">
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Assumptions & Methodology
        </p>
        <ul className="space-y-1">
          {assumptionsByType[reportType].map((a, i) => (
            <li key={i} className="text-xs text-slate-400 flex gap-2">
              <span className="text-slate-600 mt-0.5">•</span>
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* Data Table */}
      <div className="px-6 py-4 overflow-x-auto">
        {reportType === 'neighbourhood' && (
          <>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Zone Risk Summary — 10 Assessed Neighbourhoods
            </p>
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-700/60">
                  {['Zone', 'Heat Score', 'Flood Score', 'Heat Risk', 'Flood Risk', 'Pop. Exposure', 'Veg. Cover', 'Recommendation'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-2 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NEIGHBOURHOODS.map((n, i) => (
                  <tr key={n.id} className={`border-b border-slate-800/60 ${i % 2 === 0 ? '' : 'bg-slate-800/20'}`}>
                    <td className="py-2 pr-4 text-white font-medium text-xs whitespace-nowrap">{n.name}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs font-bold ${n.heatScore >= 75 ? 'text-red-400' : n.heatScore >= 55 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {n.heatScore}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs font-bold ${n.floodScore >= 75 ? 'text-red-400' : n.floodScore >= 55 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {n.floodScore}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{riskBadge(n.heatRisk)}</td>
                    <td className="py-2 pr-4">{riskBadge(n.floodRisk)}</td>
                    <td className="py-2 pr-4 text-xs text-slate-300">{n.populationExposure}%</td>
                    <td className="py-2 pr-4 text-xs text-slate-300">{n.vegetationCoverage}%</td>
                    <td className="py-2 pr-4 text-xs text-slate-300 whitespace-nowrap">{n.recommendation.replace('-', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {reportType === 'intervention' && (
          <>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Intervention Recommendations by Zone
            </p>
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-700/60">
                  {['Zone', 'Recommendation', 'Score', 'Heat Reduction', 'Flood Reduction', 'Coverage Gain', 'Cost Est.'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-2 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NEIGHBOURHOODS.map((n, i) => {
                  const intv = INTERVENTIONS.find(iv => iv.id === n.recommendation)!;
                  return (
                    <tr key={n.id} className={`border-b border-slate-800/60 ${i % 2 === 0 ? '' : 'bg-slate-800/20'}`}>
                      <td className="py-2 pr-4 text-white font-medium text-xs whitespace-nowrap">{n.name}</td>
                      <td className="py-2 pr-4 text-xs text-slate-300 whitespace-nowrap">
                        {intv.emoji} {intv.name}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="text-xs font-bold text-emerald-400">{n.recommendationScore}</span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-slate-300">−{intv.heatReduction}%</td>
                      <td className="py-2 pr-4 text-xs text-slate-300">−{intv.floodReduction}%</td>
                      <td className="py-2 pr-4 text-xs text-slate-300">+{intv.greenCoverageGain}%</td>
                      <td className="py-2 pr-4 text-xs text-slate-300 whitespace-nowrap">
                        ₹{intv.costPerUnit} L/{intv.unit.split(' ')[1] ?? 'unit'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {reportType === 'budget' && (
          <>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Scenario Budget & Impact Summary
            </p>
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-700/60">
                  {['Scenario', 'Cost (₹ Cr)', 'Heat Change', 'Flood Change', 'Coverage Δ', 'CO₂ Reduction'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-2 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCENARIOS.map((s, i) => (
                  <tr key={s.id} className={`border-b border-slate-800/60 ${i % 2 === 0 ? '' : 'bg-slate-800/20'}`}>
                    <td className="py-2 pr-4 text-white font-medium text-xs whitespace-nowrap">{s.name}</td>
                    <td className="py-2 pr-4 text-xs font-bold text-sky-400">
                      {s.cost === 0 ? '—' : `₹${s.cost}`}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-300">
                      {s.heatChange === 0 ? '—' : `${s.heatChange}%`}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-300">
                      {s.floodChange === 0 ? '—' : `${s.floodChange}%`}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-300">
                      {s.coverageChange === 0 ? '—' : `+${s.coverageChange} pp`}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-300">
                      {s.co2Reduction === 0 ? '—' : `${s.co2Reduction.toLocaleString()} t/yr`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-slate-800/40 border-t border-slate-700/60">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="text-amber-500 font-semibold">⚠ Disclaimer:</span>{' '}
          {SUMMARY_STATS.disclaimer} This report was generated by ECO-PULSE AI Demo v1.0.0 and must not be used for
          actual urban planning, procurement, or policy decisions.
        </p>
      </div>
    </motion.div>
  );
};

// ─── Report Card ─────────────────────────────────────────────────────────────

interface ReportCardProps {
  meta: ReportMeta;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToast: (msg: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ meta, isExpanded, onToggleExpand, onToast }) => {
  const Icon = meta.icon;

  const handlePDFExport = () => {
    onToast('PDF export would use jsPDF in production. Demo download initiated.');
  };

  const handleCSVExport = () => {
    if (meta.id === 'neighbourhood') {
      downloadCSV(buildNeighbourhoodCSV(), 'eco-pulse-neighbourhood-assessment.csv');
      onToast('Neighbourhood assessment CSV downloaded successfully.');
    } else if (meta.id === 'intervention') {
      downloadCSV(buildInterventionCSV(), 'eco-pulse-intervention-recommendations.csv');
      onToast('Intervention recommendations CSV downloaded successfully.');
    } else {
      downloadCSV(buildBudgetCSV(), 'eco-pulse-budget-summary.csv');
      onToast('Budget summary CSV downloaded successfully.');
    }
  };

  return (
    <motion.div
      layout
      className={`rounded-2xl border border-slate-700/60 bg-gradient-to-br ${meta.color}
        backdrop-blur-md overflow-hidden shadow-xl ${meta.glowColor}`}
    >
      <div className="p-6">
        {/* Icon + Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base leading-tight">{meta.title}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{meta.subtitle}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm leading-relaxed mb-4">{meta.description}</p>

        {/* Includes list */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Includes</p>
          <ul className="space-y-1">
            {meta.includes.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30
              border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-all duration-200
              hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            Generate Report
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handlePDFExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700
              border border-slate-600/60 text-slate-300 text-xs font-semibold transition-all duration-200
              hover:text-white active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            Export PDF
          </button>

          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700
              border border-slate-600/60 text-slate-300 text-xs font-semibold transition-all duration-200
              hover:text-white active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => window.open('http://127.0.0.1:8000/api/export/geojson', '_blank')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald/15 hover:bg-emerald/25
              border border-emerald/30 text-emerald-bright text-xs font-semibold transition-all duration-200
              active:scale-95"
            title="Download RFC 7946 GeoJSON FeatureCollection for QGIS and ArcGIS"
          >
            <Download className="w-3.5 h-3.5 text-emerald" />
            QGIS GeoJSON
          </button>
        </div>
      </div>

      {/* Report Preview (expandable) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-slate-700/60 overflow-hidden"
          >
            <div className="px-6 pb-6">
              <ReportPreview reportType={meta.id} meta={meta} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ReportsPage: React.FC = () => {
  const { addNotification } = useApp();
  const [expandedReport, setExpandedReport] = useState<ReportType | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    addNotification({ type: 'info', title: 'Reports', message: msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleExpand = (id: ReportType) => {
    setExpandedReport(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Page Header ── */}
      <div className="px-6 py-8 md:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tight text-white">Reports &amp; Export</h1>
              <DemoBadge />
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Generate, preview, and export structured reports from your ECO-PULSE analysis. All exports
              contain clearly labelled demonstration data.
            </p>
          </div>
        </div>

        {/* Disclaimer card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 flex items-start gap-3 px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200 leading-relaxed">
            <span className="font-bold text-amber-400">Report Disclaimer: </span>
            All reports contain simulated demonstration data. Data source, assumptions, and methodology are
            clearly documented in each report header. These reports must not be used for actual planning,
            procurement, or policy decisions.
          </p>
        </motion.div>
      </div>

      {/* ── Report Cards ── */}
      <div className="px-6 md:px-10 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
          {REPORT_METAS.map((meta, i) => (
            <motion.div
              key={meta.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <ReportCard
                meta={meta}
                isExpanded={expandedReport === meta.id}
                onToggleExpand={() => handleToggleExpand(meta.id)}
                onToast={showToast}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Recent Reports ── */}
      <div className="px-6 md:px-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-slate-700/60 bg-slate-900/50 backdrop-blur-md overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-700/60 flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-bold text-white">Recent Reports</h2>
            <span className="ml-auto text-xs text-slate-500">Demo history — not persisted</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {RECENT_REPORTS.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{r.type}</p>
                  <p className="text-xs text-slate-500">
                    {r.date} · {r.size}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {r.status}
                </span>
                <button
                  onClick={() => showToast(`Demo download initiated for "${r.type}" report.`)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slateald-300 hover:bg-slate-700/60
                    transition-all opacity-0 group-hover:opacity-100"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;

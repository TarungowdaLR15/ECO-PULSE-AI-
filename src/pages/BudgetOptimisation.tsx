import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Sliders,
  Zap,
  Droplets,
  TreePine,
  Building2,
  CheckSquare,
  Square,
  TrendingDown,
  MapPin,
  Flame,
  IndianRupee,
  Sparkles,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INTERVENTIONS, BUDGET_PRESETS, NEIGHBOURHOODS, type InterventionType } from '../data/mockData';
import DemoBadge from '../components/ui/DemoBadge';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AllocationItem {
  id: InterventionType;
  name: string;
  emoji: string;
  color: string;
  quantity: number;
  unitCost: number;   // lakhs
  totalCost: number;  // crores
  heatBenefit: number;
  floodBenefit: number;
}

interface AllocationResult {
  items: AllocationItem[];
  totalAllocated: number;
  locationsCovered: number;
  heatReduction: number;
  floodReduction: number;
}

interface ScenarioCard {
  label: string;
  budgetFraction: number;
  description: string;
  highlight: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVENTION_CHECKBOXES: { id: InterventionType; label: string; emoji: string }[] = [
  { id: 'urban-trees',         label: 'Urban Trees',         emoji: '🌳' },
  { id: 'rain-garden',         label: 'Rain Gardens',         emoji: '🌿' },
  { id: 'permeable-pavement',  label: 'Permeable Pavement',  emoji: '🏗️' },
  { id: 'green-roof',          label: 'Green Roofs',          emoji: '🏠' },
  { id: 'urban-pond',          label: 'Urban Ponds',          emoji: '💧' },
];

const PRIORITY_OPTIONS: { id: 'heat' | 'balanced' | 'flood'; label: string; icon: React.ReactNode }[] = [
  { id: 'heat',     label: 'Heat Mitigation',  icon: <Flame size={14} /> },
  { id: 'balanced', label: 'Balanced',          icon: <Sliders size={14} /> },
  { id: 'flood',    label: 'Flood Mitigation',  icon: <Droplets size={14} /> },
];

const SCENARIO_CARDS: ScenarioCard[] = [
  { label: 'Conservative', budgetFraction: 0.6, description: 'Lower-cost interventions, minimal disruption, strong ROI per rupee.', highlight: false },
  { label: 'Recommended',  budgetFraction: 0.8, description: 'Optimal balance of coverage, impact, and investment efficiency.', highlight: true  },
  { label: 'Aggressive',   budgetFraction: 1.0, description: 'Full-budget deployment for maximum ecological benefit.', highlight: false },
];

// ─── Greedy allocation algorithm ─────────────────────────────────────────────

function computeAllocation(
  budgetCrores: number,
  priority: 'heat' | 'balanced' | 'flood',
  selected: Set<InterventionType>,
): AllocationResult {
  if (selected.size === 0) {
    return { items: [], totalAllocated: 0, locationsCovered: 0, heatReduction: 0, floodReduction: 0 };
  }

  // Filter interventions to selected ones
  const pool = INTERVENTIONS.filter(i => selected.has(i.id));

  // Priority weights — determine how to rank interventions per slot
  const priorityScore = (iv: typeof INTERVENTIONS[0]): number => {
    if (priority === 'heat')     return iv.heatReduction * 2    + iv.floodReduction;
    if (priority === 'flood')    return iv.floodReduction * 2   + iv.heatReduction;
    return iv.heatReduction + iv.floodReduction;
  };

  // Sort by score descending
  const sorted = [...pool].sort((a, b) => priorityScore(b) - priorityScore(a));

  let remainingCrores = budgetCrores;
  const items: AllocationItem[] = [];

  // For heat priority: allocate more to trees + green roofs (top 2)
  // For flood priority: allocate more to rain gardens + ponds (top 2)
  // Balanced: even split
  const topCount = Math.min(sorted.length, 3);
  const weights: number[] = sorted.map((_, i) => {
    if (i === 0) return 0.40;
    if (i === 1) return 0.30;
    if (i === 2) return 0.20;
    return 0.10;
  });

  // Normalise weights for the actual pool size
  const totalWeight = weights.slice(0, sorted.length).reduce((a, b) => a + b, 0);
  const normWeights = weights.slice(0, sorted.length).map(w => w / totalWeight);

  for (let i = 0; i < sorted.length; i++) {
    const iv = sorted[i];
    const allocated = remainingCrores * normWeights[i]; // crores
    const unitCostCrores = iv.costPerUnit / 100;        // lakhs → crores
    const quantity = Math.max(1, Math.floor(allocated / unitCostCrores));
    const totalCost = +(quantity * unitCostCrores).toFixed(2);

    items.push({
      id: iv.id,
      name: iv.name,
      emoji: iv.emoji,
      color: iv.color,
      quantity,
      unitCost: iv.costPerUnit,
      totalCost,
      heatBenefit: iv.heatReduction,
      floodBenefit: iv.floodReduction,
    });
  }

  const totalAllocated = +items.reduce((s, it) => s + it.totalCost, 0).toFixed(2);

  // Locations covered: simple heuristic based on budget vs neighbourhood sizes
  const locationsCovered = Math.min(NEIGHBOURHOODS.length, Math.ceil(budgetCrores / 10));

  // Aggregate benefit (capped at sensible illustrative levels)
  const heatReduction = Math.min(45, items.reduce((s, it) => s + it.heatBenefit * (topCount > 0 ? 1 / topCount : 1), 0));
  const floodReduction = Math.min(55, items.reduce((s, it) => s + it.floodBenefit * (topCount > 0 ? 1 / topCount : 1), 0));

  return { items, totalAllocated, locationsCovered, heatReduction: Math.round(heatReduction), floodReduction: Math.round(floodReduction) };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl p-6 ${className}`}
    style={{
      background: 'rgba(13,31,20,0.80)',
      border: '1px solid rgba(16,185,129,0.18)',
      backdropFilter: 'blur(16px)',
    }}
  >
    {children}
  </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(52,211,153,0.7)' }}>
    {children}
  </p>
);

interface ResultStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  borderColor: string;
}

const ResultStatCard: React.FC<ResultStatCardProps> = ({ icon, label, value, sub, color, borderColor }) => (
  <div
    className="rounded-xl p-4 flex flex-col gap-2"
    style={{ background: 'rgba(8,15,12,0.6)', border: `1px solid ${borderColor}` }}
  >
    <div className="flex items-center gap-2">
      <span style={{ color }}>{icon}</span>
      <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'rgba(240,253,244,0.5)' }}>{label}</span>
    </div>
    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
    {sub && <div className="text-xs" style={{ color: 'rgba(240,253,244,0.4)' }}>{sub}</div>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BudgetOptimisation: React.FC = () => {
  const { budget, setBudget, priorityMode, setPriorityMode } = useApp();

  const [selectedInterventions, setSelectedInterventions] = useState<Set<InterventionType>>(
    new Set(['urban-trees', 'rain-garden', 'permeable-pavement'])
  );
  const [result, setResult] = useState<AllocationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleIntervention = useCallback((id: InterventionType) => {
    setSelectedInterventions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setResult(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setResult(null);
    // Brief artificial delay for effect
    await new Promise(r => setTimeout(r, 800));
    const r = computeAllocation(budget, priorityMode, selectedInterventions);
    setResult(r);
    setIsGenerating(false);
  }, [budget, priorityMode, selectedInterventions]);

  // Chart data for stacked bar
  const chartData = result
    ? [{ name: 'Allocation', ...Object.fromEntries(result.items.map(i => [i.name, i.totalCost])) }]
    : [];

  // Scenario rows
  const scenarioData = SCENARIO_CARDS.map(sc => {
    const r = computeAllocation(budget * sc.budgetFraction, priorityMode, selectedInterventions);
    return { ...sc, result: r };
  });

  return (
    <div
      className="min-h-screen p-6 lg:p-8"
      style={{ background: 'linear-gradient(160deg, #060E09 0%, #0A1A10 60%, #060E09 100%)', color: '#F0FDF4' }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 44, height: 44, background: 'rgba(16,185,129,0.12)', border: '1.5px solid rgba(16,185,129,0.35)' }}
          >
            <IndianRupee size={22} color="#34D399" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#F0FDF4' }}>
              Budget Optimisation
            </h1>
            <p className="text-sm" style={{ color: 'rgba(240,253,244,0.5)' }}>
              Allocate resources across green infrastructure interventions
            </p>
          </div>
          <div className="ml-auto">
            <DemoBadge verbose />
          </div>
        </div>
      </motion.div>

      {/* ── Controls Panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Budget Slider */}
            <div className="lg:col-span-1">
              <SectionLabel>Total Budget</SectionLabel>
              <div className="text-center mb-4">
                <span className="text-4xl font-black" style={{ color: '#34D399' }}>₹{budget}</span>
                <span className="text-lg font-semibold ml-2" style={{ color: 'rgba(52,211,153,0.7)' }}>Crores</span>
              </div>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={budget}
                onChange={e => { setBudget(Number(e.target.value)); setResult(null); }}
                className="w-full"
                style={{ accentColor: '#10B981' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(240,253,244,0.4)' }}>
                <span>₹5 Cr</span>
                <span>₹200 Cr</span>
              </div>
              {/* Quick presets */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {BUDGET_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => { setBudget(p.value); setResult(null); }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                    style={{
                      background: budget === p.value ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.08)',
                      border: budget === p.value ? '1px solid rgba(16,185,129,0.6)' : '1px solid rgba(16,185,129,0.2)',
                      color: budget === p.value ? '#34D399' : 'rgba(52,211,153,0.6)',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Toggle */}
            <div>
              <SectionLabel>Priority Mode</SectionLabel>
              <div className="flex flex-col gap-2">
                {PRIORITY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setPriorityMode(opt.id); setResult(null); }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: priorityMode === opt.id ? 'rgba(16,185,129,0.2)' : 'rgba(8,15,12,0.5)',
                      border: priorityMode === opt.id ? '1.5px solid rgba(16,185,129,0.6)' : '1px solid rgba(16,185,129,0.15)',
                      color: priorityMode === opt.id ? '#34D399' : 'rgba(240,253,244,0.5)',
                    }}
                  >
                    <span style={{ color: priorityMode === opt.id ? '#34D399' : 'rgba(240,253,244,0.35)' }}>{opt.icon}</span>
                    {opt.label}
                    {priorityMode === opt.id && <span className="ml-auto text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Intervention Checkboxes */}
            <div>
              <SectionLabel>Intervention Types</SectionLabel>
              <div className="flex flex-col gap-2">
                {INTERVENTION_CHECKBOXES.map(item => {
                  const checked = selectedInterventions.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleIntervention(item.id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left"
                      style={{
                        background: checked ? 'rgba(16,185,129,0.1)' : 'rgba(8,15,12,0.4)',
                        border: checked ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(16,185,129,0.1)',
                        color: checked ? '#F0FDF4' : 'rgba(240,253,244,0.4)',
                      }}
                    >
                      {checked
                        ? <CheckSquare size={16} color="#34D399" />
                        : <Square size={16} color="rgba(52,211,153,0.3)" />
                      }
                      <span>{item.emoji}</span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || selectedInterventions.size === 0}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#F0FDF4',
                boxShadow: '0 4px 24px rgba(16,185,129,0.35)',
              }}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Calculating…
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Optimal Allocation
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Results ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <ResultStatCard
                icon={<IndianRupee size={18} />}
                label="Budget Allocated"
                value={`₹${result.totalAllocated} Cr`}
                sub={`of ₹${budget} Crores total`}
                color="#34D399"
                borderColor="rgba(16,185,129,0.25)"
              />
              <ResultStatCard
                icon={<MapPin size={18} />}
                label="Locations Covered"
                value={`${result.locationsCovered} zones`}
                sub="(illustrative estimate)"
                color="#38BDF8"
                borderColor="rgba(56,189,248,0.25)"
              />
              <ResultStatCard
                icon={<Flame size={18} />}
                label="Est. Heat Reduction"
                value={`${result.heatReduction}%`}
                sub="illustrative estimate"
                color="#F87171"
                borderColor="rgba(248,113,113,0.25)"
              />
              <ResultStatCard
                icon={<Droplets size={18} />}
                label="Est. Flood Reduction"
                value={`${result.floodReduction}%`}
                sub="illustrative estimate"
                color="#60A5FA"
                borderColor="rgba(96,165,250,0.25)"
              />
            </div>

            {/* Allocation Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Stacked Bar Chart */}
              <GlassCard>
                <SectionLabel>Budget Split by Intervention</SectionLabel>
                <p className="text-xs mb-4" style={{ color: 'rgba(240,253,244,0.35)' }}>
                  Values in ₹ Crores (illustrative estimate)
                </p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(240,253,244,0.4)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'rgba(240,253,244,0.4)', fontSize: 11 }} tickFormatter={(v: number) => `₹${v}`} />
                    <Tooltip
                      contentStyle={{ background: '#0D1F14', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, color: '#F0FDF4' }}
                      formatter={(value: any) => [`₹${value} Cr`, '']}
                    />
                    <Legend wrapperStyle={{ color: 'rgba(240,253,244,0.6)', fontSize: 12 }} />
                    {result.items.map(item => (
                      <Bar key={item.id} dataKey={item.name} stackId="a" fill={item.color} radius={item.id === result.items[result.items.length - 1].id ? [4, 4, 0, 0] : [0, 0, 0, 0]}>
                        {chartData.map((_, idx) => (
                          <Cell key={idx} fill={item.color} />
                        ))}
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>

              {/* Allocation Table */}
              <GlassCard>
                <SectionLabel>Allocation Detail</SectionLabel>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ color: 'rgba(52,211,153,0.7)' }}>
                        {['Intervention', 'Qty', 'Unit Cost', 'Total', 'Heat', 'Flood'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold tracking-wider uppercase pb-3 pr-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.items.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="border-t"
                          style={{ borderColor: 'rgba(16,185,129,0.1)' }}
                        >
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ background: item.color }}
                              />
                              <span style={{ color: '#F0FDF4' }}>{item.emoji} {item.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 tabular-nums" style={{ color: '#34D399' }}>{item.quantity.toLocaleString()}</td>
                          <td className="py-2.5 pr-3 text-xs" style={{ color: 'rgba(240,253,244,0.5)' }}>
                            ₹{item.unitCost}L
                          </td>
                          <td className="py-2.5 pr-3 font-semibold" style={{ color: '#F0FDF4' }}>
                            ₹{item.totalCost} Cr
                          </td>
                          <td className="py-2.5 pr-3 text-xs" style={{ color: '#F87171' }}>
                            -{item.heatBenefit}%
                          </td>
                          <td className="py-2.5 text-xs" style={{ color: '#60A5FA' }}>
                            -{item.floodBenefit}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t" style={{ borderColor: 'rgba(16,185,129,0.25)' }}>
                        <td className="pt-3 font-bold text-xs tracking-wider uppercase" style={{ color: 'rgba(52,211,153,0.7)' }} colSpan={3}>
                          Total
                        </td>
                        <td className="pt-3 font-bold" style={{ color: '#34D399' }}>
                          ₹{result.totalAllocated} Cr
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="text-xs mt-4 flex items-center gap-1.5" style={{ color: 'rgba(240,253,244,0.35)' }}>
                  <AlertTriangle size={11} />
                  All figures are illustrative estimates for demonstration purposes.
                </p>
              </GlassCard>
            </div>

            {/* Scenario Comparison */}
            <GlassCard>
              <SectionLabel>Scenario Comparison</SectionLabel>
              <p className="text-sm mb-5" style={{ color: 'rgba(240,253,244,0.5)' }}>
                How different budget levels perform with the current configuration (illustrative estimates).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarioData.map(sc => (
                  <motion.div
                    key={sc.label}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-xl p-5"
                    style={{
                      background: sc.highlight ? 'rgba(16,185,129,0.1)' : 'rgba(8,15,12,0.5)',
                      border: sc.highlight ? '2px solid rgba(16,185,129,0.6)' : '1px solid rgba(16,185,129,0.15)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-sm font-bold"
                        style={{ color: sc.highlight ? '#34D399' : '#F0FDF4' }}
                      >
                        {sc.label}
                      </span>
                      {sc.highlight && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(16,185,129,0.25)', color: '#34D399' }}
                        >
                          ★ Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs mb-4" style={{ color: 'rgba(240,253,244,0.45)' }}>{sc.description}</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'rgba(240,253,244,0.5)' }}>Budget Used</span>
                        <span className="font-semibold" style={{ color: '#34D399' }}>
                          ₹{(budget * sc.budgetFraction).toFixed(0)} Cr
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'rgba(240,253,244,0.5)' }}>Allocated</span>
                        <span className="font-semibold" style={{ color: '#F0FDF4' }}>
                          ₹{sc.result.totalAllocated} Cr
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'rgba(240,253,244,0.5)' }}>Interventions</span>
                        <span className="font-semibold" style={{ color: '#F0FDF4' }}>
                          {sc.result.items.length} types
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'rgba(240,253,244,0.5)' }}>Heat Reduction</span>
                        <span className="font-semibold" style={{ color: '#F87171' }}>
                          ~{sc.result.heatReduction}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'rgba(240,253,244,0.5)' }}>Flood Reduction</span>
                        <span className="font-semibold" style={{ color: '#60A5FA' }}>
                          ~{sc.result.floodReduction}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'rgba(240,253,244,0.5)' }}>Zones Covered</span>
                        <span className="font-semibold" style={{ color: '#F0FDF4' }}>
                          {sc.result.locationsCovered}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs mt-4 flex items-center gap-1.5" style={{ color: 'rgba(240,253,244,0.3)' }}>
                <AlertTriangle size={11} />
                All scenario outputs are illustrative estimates and do not represent validated planning advice.
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div
            className="flex items-center justify-center rounded-full mb-4"
            style={{ width: 72, height: 72, background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.25)' }}
          >
            <Zap size={30} color="rgba(52,211,153,0.6)" />
          </div>
          <p className="font-semibold mb-1" style={{ color: 'rgba(240,253,244,0.6)' }}>
            Configure & Generate
          </p>
          <p className="text-sm text-center max-w-xs" style={{ color: 'rgba(240,253,244,0.35)' }}>
            Adjust the budget, priority, and interventions above, then click "Generate Optimal Allocation" to see results.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BudgetOptimisation;

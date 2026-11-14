// ClimateIntelligence.tsx
// ECO-PULSE AI — Climate Intelligence page
// All data displayed is simulated for demonstration purposes.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Thermometer,
  Droplets,
  Users,
  TreePine,
  AlertTriangle,
  TrendingUp,
  MapPin,
  ArrowRight,
  Info,
} from 'lucide-react';
import { NEIGHBOURHOODS, type Neighbourhood } from '../data/mockData';
import DemoBadge from '../components/ui/DemoBadge';

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRiskColor(score: number): string {
  if (score >= 70) return '#EF4444';
  if (score >= 50) return '#F59E0B';
  return '#10B981';
}

function getRiskLabel(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

function getRiskBadgeClass(label: 'High' | 'Medium' | 'Low'): string {
  switch (label) {
    case 'High':
      return 'bg-red-500/15 text-red-400 border border-red-500/30';
    case 'Medium':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'Low':
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
  }
}

function getMainFactor(zone: Neighbourhood): string {
  if (zone.vegetationCoverage < 12) return 'Low Vegetation';
  if (zone.impervious > 80) return 'High Impervious Surface';
  if (zone.population > 110000) return 'High Population Density';
  if (zone.heatScore > 75) return 'Urban Heat Island';
  return 'Mixed Urban Factors';
}

function getHeatPriority(zone: Neighbourhood): string {
  if (zone.heatScore >= 80) return 'Critical';
  if (zone.heatScore >= 65) return 'High';
  if (zone.heatScore >= 50) return 'Medium';
  return 'Low';
}

function getPriorityClass(p: string): string {
  switch (p) {
    case 'Critical':
      return 'bg-red-600/20 text-red-300 border border-red-600/30';
    case 'High':
      return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
    case 'Medium':
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    default:
      return 'bg-slate-700/40 text-slate-400 border border-slate-600/30';
  }
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  unit?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A1A10] border border-emerald-500/20 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="text-white">{p.value}{unit}</span>
        </p>
      ))}
      <p className="text-xs text-amber-400/70 mt-2 italic">Illustrative estimate</p>
    </div>
  );
};

// ─── Risk Assessment Card ─────────────────────────────────────────────────────

interface RiskCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  level?: string;
  levelClass?: string;
  borderColor: string;
  iconBg: string;
  subtitle?: string;
}

const RiskCard: React.FC<RiskCardProps> = ({
  icon, title, value, level, levelClass, borderColor, iconBg, subtitle,
}) => (
  <motion.div
    variants={itemVariants}
    className={`relative bg-[#0D1F14]/80 backdrop-blur-md border ${borderColor} rounded-2xl p-5 shadow-lg`}
  >
    <div className={`inline-flex p-2.5 rounded-xl mb-3 ${iconBg}`}>
      {icon}
    </div>
    <p className="text-xs text-slate-400 font-medium mb-1">{title}</p>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    {level && levelClass && (
      <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${levelClass}`}>
        {level}
      </span>
    )}
  </motion.div>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <motion.div variants={itemVariants} className="mb-6">
    <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
    <p className="text-sm text-slate-400">{subtitle}</p>
  </motion.div>
);

// ─── Glass Panel ─────────────────────────────────────────────────────────────

const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children, className = '',
}) => (
  <div className={`bg-[#0D1F14]/60 backdrop-blur-md border border-emerald-900/40 rounded-2xl p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

// ─── Radar Chart Data Builder ─────────────────────────────────────────────────

function buildRadarData() {
  const top5 = [...NEIGHBOURHOODS].sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 5);
  const axes = ['Heat Score', 'Flood Score', 'Population Exposure', 'Vegetation', 'Land Available', 'Impervious'];

  return axes.map((axis) => {
    const entry: Record<string, number | string> = { axis };
    top5.forEach((z) => {
      switch (axis) {
        case 'Heat Score':
          entry[z.name] = z.heatScore;
          break;
        case 'Flood Score':
          entry[z.name] = z.floodScore;
          break;
        case 'Population Exposure':
          entry[z.name] = z.populationExposure;
          break;
        case 'Vegetation':
          entry[z.name] = z.vegetationCoverage;
          break;
        case 'Land Available':
          entry[z.name] = Math.min(z.availableLand * 2, 100);
          break;
        case 'Impervious':
          entry[z.name] = z.impervious;
          break;
      }
    });
    return entry;
  });
}

const RADAR_COLORS = ['#EF4444', '#F59E0B', '#38BDF8', '#10B981', '#A78BFA'];

// ─── Main Component ───────────────────────────────────────────────────────────

const ClimateIntelligence: React.FC = () => {
  const [heatTableSort, setHeatTableSort] = useState<'score' | 'name'>('score');

  const sortedByHeat = [...NEIGHBOURHOODS].sort((a, b) =>
    heatTableSort === 'score' ? b.heatScore - a.heatScore : a.name.localeCompare(b.name),
  );

  const sortedByFlood = [...NEIGHBOURHOODS].sort((a, b) => b.floodScore - a.floodScore);

  const radarData = buildRadarData();
  const top5Radar = [...NEIGHBOURHOODS].sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 5);

  // Best / worst for comparison
  const worst = NEIGHBOURHOODS.find((z) => z.name === 'Marathahalli')!;
  const best = NEIGHBOURHOODS.find((z) => z.name === 'Yelahanka')!;

  const comparisonMetrics = [
    { label: 'Heat Score', worst: worst.heatScore, best: best.heatScore, maxVal: 100, unit: '/100', higherIsBetter: false },
    { label: 'Flood Score', worst: worst.floodScore, best: best.floodScore, maxVal: 100, unit: '/100', higherIsBetter: false },
    { label: 'Vegetation Coverage', worst: worst.vegetationCoverage, best: best.vegetationCoverage, maxVal: 100, unit: '%', higherIsBetter: true },
    { label: 'Impervious Surface', worst: worst.impervious, best: best.impervious, maxVal: 100, unit: '%', higherIsBetter: false },
    { label: 'Population Exposure', worst: worst.populationExposure, best: best.populationExposure, maxVal: 100, unit: '/100', higherIsBetter: false },
    { label: 'Available Land (ha)', worst: worst.availableLand, best: best.availableLand, maxVal: 50, unit: 'ha', higherIsBetter: true },
  ];

  const heatChartData = [...NEIGHBOURHOODS]
    .sort((a, b) => b.heatScore - a.heatScore)
    .map((z) => ({ name: z.name.length > 10 ? z.name.substring(0, 10) + '…' : z.name, fullName: z.name, heatScore: z.heatScore }));

  const floodChartData = [...NEIGHBOURHOODS]
    .sort((a, b) => b.floodScore - a.floodScore)
    .map((z) => ({ name: z.name.length > 10 ? z.name.substring(0, 10) + '…' : z.name, fullName: z.name, floodScore: z.floodScore }));

  const vegChartData = [...NEIGHBOURHOODS]
    .sort((a, b) => a.vegetationCoverage - b.vegetationCoverage)
    .map((z) => ({ name: z.name.length > 10 ? z.name.substring(0, 10) + '…' : z.name, fullName: z.name, coverage: z.vegetationCoverage }));

  return (
    <div className="min-h-screen bg-[#060F09] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── PAGE HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-500/15 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Climate Intelligence
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Multi-dimensional risk analysis across Bengaluru urban zones — simulated demonstration data
              </p>
            </div>
            <DemoBadge className="ml-auto sm:ml-0" />
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>All scores, percentages, and risk classifications are <strong>illustrative estimates</strong> generated from a simulated dataset. Not verified municipal data.</span>
          </div>
        </motion.div>

        {/* ── SECTION 1 — RISK ASSESSMENT CARDS ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
        >
          <RiskCard
            icon={<Thermometer className="w-5 h-5 text-red-400" />}
            title="Urban Heat Island Index"
            value="68 / 100"
            level="HIGH RISK"
            levelClass="bg-red-500/15 text-red-400 border border-red-500/30"
            borderColor="border-red-500/20"
            iconBg="bg-red-500/15"
            subtitle="Average across all zones (illustrative)"
          />
          <RiskCard
            icon={<Droplets className="w-5 h-5 text-blue-400" />}
            title="Flood Vulnerability Index"
            value="72 / 100"
            level="HIGH RISK"
            levelClass="bg-red-500/15 text-red-400 border border-red-500/30"
            borderColor="border-blue-500/20"
            iconBg="bg-blue-500/15"
            subtitle="Composite runoff & imperviousness score"
          />
          <RiskCard
            icon={<Users className="w-5 h-5 text-amber-400" />}
            title="Population Exposure"
            value="984,000"
            borderColor="border-amber-500/20"
            iconBg="bg-amber-500/15"
            subtitle="Residents in analysed zones (illustrative)"
          />
          <RiskCard
            icon={<TreePine className="w-5 h-5 text-emerald-400" />}
            title="Vegetation Deficit"
            value="18% coverage"
            borderColor="border-emerald-500/20"
            iconBg="bg-emerald-500/15"
            subtitle="vs 30% urban target — 12 pp gap (illustrative)"
          />
        </motion.div>

        {/* ── SECTION 2 — HEAT RISK ANALYSIS ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12"
        >
          <SectionHeader
            title="🌡️ Heat Risk Analysis"
            subtitle="Urban Heat Island score per neighbourhood. Scores ≥ 70 indicate high risk zones."
          />
          <GlassPanel className="mb-6">
            <p className="text-xs text-slate-500 mb-4 italic">Chart values are illustrative estimates only</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={heatChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a3a22" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e3a2a' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e3a2a' }} tickLine={false} />
                <Tooltip content={<CustomTooltip unit="/100" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="heatScore" name="Heat Score" radius={[6, 6, 0, 0]}>
                  {heatChartData.map((entry, index) => (
                    <Cell key={`heat-${index}`} fill={getRiskColor(entry.heatScore)} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassPanel>

          {/* Heat Table */}
          <GlassPanel>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">Zone Heat Risk Details</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setHeatTableSort('score')}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all ${heatTableSort === 'score' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:border-slate-600'}`}
                >
                  Sort by Score
                </button>
                <button
                  onClick={() => setHeatTableSort('name')}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all ${heatTableSort === 'name' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:border-slate-600'}`}
                >
                  Sort by Name
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    <th className="text-left pb-3 pr-4">Zone</th>
                    <th className="text-center pb-3 pr-4">Heat Score</th>
                    <th className="text-center pb-3 pr-4">Risk Level</th>
                    <th className="text-left pb-3 pr-4">Main Factor</th>
                    <th className="text-center pb-3">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByHeat.map((zone, i) => {
                    const riskLabel = getRiskLabel(zone.heatScore);
                    const priority = getHeatPriority(zone);
                    return (
                      <motion.tr
                        key={zone.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span className="font-medium text-white">{zone.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${zone.heatScore}%`, backgroundColor: getRiskColor(zone.heatScore) }}
                              />
                            </div>
                            <span className="text-white font-semibold tabular-nums w-6">{zone.heatScore}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRiskBadgeClass(riskLabel)}`}>
                            {riskLabel}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-400 text-xs">{getMainFactor(zone)}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${getPriorityClass(priority)}`}>
                            {priority}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-600 italic mt-3">* All values are simulated estimates for demonstration.</p>
          </GlassPanel>
        </motion.div>

        {/* ── SECTION 3 — FLOOD RISK ANALYSIS ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12"
        >
          <SectionHeader
            title="💧 Flood Risk Analysis"
            subtitle="Flood vulnerability score per neighbourhood based on impervious surface, drainage, and runoff patterns."
          />
          <GlassPanel className="mb-6">
            <p className="text-xs text-slate-500 mb-4 italic">Chart values are illustrative estimates only</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={floodChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f2a3a" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#0f2a3a' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#0f2a3a' }} tickLine={false} />
                <Tooltip content={<CustomTooltip unit="/100" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="floodScore" name="Flood Score" radius={[6, 6, 0, 0]}>
                  {floodChartData.map((entry, index) => (
                    <Cell key={`flood-${index}`} fill={entry.floodScore >= 70 ? '#1d4ed8' : entry.floodScore >= 50 ? '#3b82f6' : '#38BDF8'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassPanel>

          {/* Flood Table */}
          <GlassPanel>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Zone Flood Risk Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    <th className="text-left pb-3 pr-4">Zone</th>
                    <th className="text-center pb-3 pr-4">Flood Score</th>
                    <th className="text-center pb-3 pr-4">Impervious %</th>
                    <th className="text-center pb-3">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByFlood.map((zone, i) => {
                    const riskLabel = getRiskLabel(zone.floodScore);
                    return (
                      <motion.tr
                        key={zone.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span className="font-medium text-white">{zone.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${zone.floodScore}%`, backgroundColor: '#3b82f6' }}
                              />
                            </div>
                            <span className="text-white font-semibold tabular-nums w-6">{zone.floodScore}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-slate-500"
                                style={{ width: `${zone.impervious}%` }}
                              />
                            </div>
                            <span className="text-slate-300 font-medium tabular-nums w-7">{zone.impervious}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRiskBadgeClass(riskLabel)}`}>
                            {riskLabel}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-600 italic mt-3">* All values are simulated estimates for demonstration.</p>
          </GlassPanel>
        </motion.div>

        {/* ── SECTION 4 — VEGETATION ANALYSIS ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12"
        >
          <SectionHeader
            title="🌿 Vegetation & Multi-Metric Analysis"
            subtitle="Green coverage per zone vs 30% target. Radar chart shows composite risk profile for top-5 priority zones."
          />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Radar Chart */}
            <GlassPanel>
              <h3 className="text-sm font-semibold text-slate-300 mb-1">Multi-Metric Risk Radar (Top 5 Priority Zones)</h3>
              <p className="text-xs text-slate-600 italic mb-4">Illustrative estimates</p>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} outerRadius={110}>
                  <PolarGrid stroke="#1e3a2a" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                  {top5Radar.map((zone, i) => (
                    <Radar
                      key={zone.id}
                      name={zone.name}
                      dataKey={zone.name}
                      stroke={RADAR_COLORS[i]}
                      fill={RADAR_COLORS[i]}
                      fillOpacity={0.08}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend
                    iconType="line"
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </GlassPanel>

            {/* Vegetation Bar Chart */}
            <GlassPanel>
              <h3 className="text-sm font-semibold text-slate-300 mb-1">Vegetation Coverage per Zone</h3>
              <p className="text-xs text-slate-600 italic mb-4">Dashed line = 30% urban target</p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={vegChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a3a22" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#1e3a2a' }} tickLine={false} />
                  <YAxis domain={[0, 55]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e3a2a' }} tickLine={false} />
                  <Tooltip content={<CustomTooltip unit="%" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <ReferenceLine y={30} stroke="#F59E0B" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: '30% Target', position: 'right', fill: '#F59E0B', fontSize: 10 }} />
                  <Bar dataKey="coverage" name="Vegetation %" radius={[5, 5, 0, 0]}>
                    {vegChartData.map((entry, index) => (
                      <Cell key={`veg-${index}`} fill={entry.coverage >= 30 ? '#10B981' : entry.coverage >= 20 ? '#F59E0B' : '#EF4444'} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlassPanel>
          </div>
        </motion.div>

        {/* ── SECTION 5 — LOCATION COMPARISON ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12"
        >
          <SectionHeader
            title="📍 Zone Comparison: Best vs Worst"
            subtitle="Side-by-side comparison of Marathahalli (highest combined risk) vs Yelahanka (lowest combined risk)."
          />
          <GlassPanel>
            {/* Zone headers */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div /> {/* spacer */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/25 rounded-xl mb-1">
                  <span className="text-red-400 text-sm font-bold">⚠</span>
                  <span className="text-red-400 font-semibold text-sm">{worst.name}</span>
                </div>
                <p className="text-xs text-slate-500">Highest combined risk</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl mb-1">
                  <span className="text-emerald-400 text-sm font-bold">✓</span>
                  <span className="text-emerald-400 font-semibold text-sm">{best.name}</span>
                </div>
                <p className="text-xs text-slate-500">Lowest combined risk</p>
              </div>
            </div>

            {/* Comparison metrics */}
            <div className="space-y-4">
              {comparisonMetrics.map((m) => {
                const worstBar = Math.min((m.worst / m.maxVal) * 100, 100);
                const bestBar = Math.min((m.best / m.maxVal) * 100, 100);
                const worstGood = m.higherIsBetter ? m.worst > m.best : m.worst < m.best;
                return (
                  <div key={m.label} className="grid grid-cols-3 gap-4 items-center">
                    <p className="text-xs text-slate-400 font-medium text-right pr-2">{m.label}</p>
                    {/* Worst zone bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${worstGood ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.worst}{m.unit}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${worstBar}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${worstGood ? 'bg-emerald-500' : 'bg-red-500'}`}
                        />
                      </div>
                    </div>
                    {/* Best zone bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${!worstGood ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.best}{m.unit}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${bestBar}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                          className={`h-full rounded-full ${!worstGood ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-600 italic mt-5">* All comparative values are illustrative estimates for demonstration purposes.</p>
          </GlassPanel>
        </motion.div>

        {/* ── SECTION 6 — KEY INSIGHTS ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-8"
        >
          <SectionHeader
            title="💡 Key Insights"
            subtitle="Automated pattern detection from simulated climate risk data."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                insight: '5 zones show dangerously low vegetation coverage (< 15%)',
                detail: 'Whitefield, Koramangala, Rajajinagar, Marathahalli, and BTM Layout are critically under-vegetated, amplifying UHI effect.',
                icon: TreePine,
                color: 'emerald',
              },
              {
                insight: 'Bellandur faces critical flood risk — highest runoff score',
                detail: 'With a flood score of 88/100 and 55% impervious surface, Bellandur\'s drainage is severely overloaded during monsoon events.',
                icon: Droplets,
                color: 'blue',
              },
              {
                insight: 'Whitefield UHI intensity is highest — urgent tree cover needed',
                detail: 'Whitefield\'s heat score of 82/100, combined with only 12% vegetation coverage, makes it the top priority for urban tree planting.',
                icon: Thermometer,
                color: 'red',
              },
            ].map(({ insight, detail, icon: Icon, color }, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-[#0D1F14]/60 backdrop-blur-md border border-amber-500/20 rounded-2xl p-5 shadow-lg hover:border-amber-500/40 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-xl flex-shrink-0 ${
                    color === 'emerald' ? 'bg-emerald-500/15' :
                    color === 'blue' ? 'bg-blue-500/15' : 'bg-red-500/15'
                  }`}>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug">{insight}</p>
                </div>
                <div className={`p-2.5 rounded-lg mb-4 ${
                  color === 'emerald' ? 'bg-emerald-500/5 border border-emerald-500/15' :
                  color === 'blue' ? 'bg-blue-500/5 border border-blue-500/15' : 'bg-red-500/5 border border-red-500/15'
                }`}>
                  <p className="text-xs text-slate-400 leading-relaxed">{detail}</p>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-xl text-xs font-semibold text-amber-400 transition-all duration-200 group-hover:border-amber-500/50">
                  Explore Solutions
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-slate-800 pt-6 text-center"
        >
          <p className="text-xs text-slate-600 max-w-2xl mx-auto">
            All data displayed on this page is part of a simulated demonstration dataset for Bengaluru, Karnataka.
            Scores, risk levels, and projections are illustrative estimates and do not represent verified measurements.
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default ClimateIntelligence;

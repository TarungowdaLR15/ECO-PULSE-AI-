// ECO-PULSE AI — Overview Dashboard Page
// All data is simulated/illustrative for demonstration purposes.

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Map,
  Thermometer,
  Droplets,
  TreePine,
  Wallet,
  ArrowRight,
  Clock,
  Zap,
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
} from 'lucide-react';

import {
  NEIGHBOURHOODS,
  SUMMARY_STATS,
  RISK_DISTRIBUTION,
  INTERVENTION_DISTRIBUTION,
  MONTHLY_HEAT_DATA,
  INTERVENTIONS,
} from '../data/mockData';
import { useApp } from '../context/AppContext';
import StatCard from '../components/ui/StatCard';

// ─── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

// ─── Tooltip components ───────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string }>;
  label?: string;
}

const GlassTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a1a0f]/95 backdrop-blur-md border border-emerald-500/20 rounded-xl p-3 shadow-xl shadow-black/40">
      {label && <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color ?? entry.fill ?? '#10B981' }}
          />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="text-white font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-[#0a1a0f]/95 backdrop-blur-md border border-emerald-500/20 rounded-xl p-3 shadow-xl shadow-black/40">
      <div className="flex items-center gap-2 text-sm">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: entry.fill ?? '#10B981' }}
        />
        <span className="text-slate-300">{entry.name}</span>
        <span className="text-white font-semibold">{entry.value} zones</span>
      </div>
    </div>
  );
};

// ─── Risk badge helper ────────────────────────────────────────────────────────

type Risk = 'low' | 'medium' | 'high';

const RiskBadge: React.FC<{ level: Risk; type: 'heat' | 'flood' }> = ({ level, type }) => {
  const colorMap: Record<Risk, string> = {
    high: type === 'heat' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${colorMap[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
};

// ─── Intervention icon helper ─────────────────────────────────────────────────

const INTERVENTION_ICONS: Record<string, string> = {
  'urban-trees': '🌳',
  'rain-garden': '🌿',
  'permeable-pavement': '🛣️',
  'green-roof': '🏡',
  'urban-pond': '💧',
};

// ─── Recent activity data ─────────────────────────────────────────────────────

const RECENT_ACTIVITY = [
  {
    id: 1,
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    title: 'Heat risk model updated',
    detail: 'Zone A (Whitefield) reclassified to High',
    time: '2 hours ago',
    type: 'alert',
  },
  {
    id: 2,
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    title: 'Scenario "Urban Trees" approved',
    detail: '₹8.5 Cr allocation confirmed by PMC',
    time: '5 hours ago',
    type: 'success',
  },
  {
    id: 3,
    icon: <Layers className="w-4 h-4 text-blue-400" />,
    title: 'Flood simulation run complete',
    detail: 'Koramangala shows 81% runoff risk index',
    time: '1 day ago',
    type: 'info',
  },
  {
    id: 4,
    icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    title: 'Green coverage target reached',
    detail: 'Jayanagar hits 22% vegetation cover milestone',
    time: '2 days ago',
    type: 'success',
  },
  {
    id: 5,
    icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
    title: 'High population exposure warning',
    detail: 'Koramangala: 92k residents in risk corridor',
    time: '3 days ago',
    type: 'alert',
  },
];

// ─── Chart card wrapper ───────────────────────────────────────────────────────

const ChartCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({
  title,
  subtitle,
  children,
  className = '',
}) => (
  <motion.div
    variants={itemVariants}
    className={`bg-[#0D1F14]/80 backdrop-blur-md border border-emerald-900/30 rounded-2xl p-5 shadow-lg ${className}`}
  >
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const OverviewPage: React.FC = () => {
  const { budget, setCurrentPage } = useApp();

  // Top 5 priority neighbourhoods by max(heatScore, floodScore)
  const priorityNeighbourhoods = useMemo(() => {
    return [...NEIGHBOURHOODS]
      .sort((a, b) => Math.max(b.heatScore, b.floodScore) - Math.max(a.heatScore, a.floodScore))
      .slice(0, 5);
  }, []);

  // BarChart data: heat vs flood per neighbourhood
  const barData = useMemo(
    () =>
      NEIGHBOURHOODS.map((n) => ({
        name: n.name.length > 10 ? n.name.slice(0, 10) + '…' : n.name,
        Heat: n.heatScore,
        Flood: n.floodScore,
      })),
    [],
  );

  return (
    <div className="min-h-screen bg-[#060E09] text-white">
      {/* ── Page header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-emerald-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Bengaluru Urban Climate Analytics · Last updated {SUMMARY_STATS.lastUpdated}
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('map')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors duration-200 shadow-lg shadow-emerald-900/40"
          >
            <Map className="w-4 h-4" />
            View Map
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* ── Stat cards row ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          <StatCard
            title="Areas Analysed"
            value={SUMMARY_STATS.areasAnalysed}
            subtitle="Urban zones"
            icon={<Map className="w-5 h-5" />}
            color="emerald"
            isDemo
          />
          <StatCard
            title="Heat Risk Zones"
            value={SUMMARY_STATS.highHeatRisk}
            subtitle="High severity"
            icon={<Thermometer className="w-5 h-5" />}
            color="danger"
            isDemo
          />
          <StatCard
            title="Flood Risk Zones"
            value={SUMMARY_STATS.highFloodRisk}
            subtitle="High severity"
            icon={<Droplets className="w-5 h-5" />}
            color="blue"
            isDemo
          />
          <StatCard
            title="Green Coverage"
            value={`${SUMMARY_STATS.avgGreenCoverage}%`}
            subtitle="Average across zones"
            icon={<TreePine className="w-5 h-5" />}
            color="emerald"
            isDemo
          />
          <StatCard
            title="Budget Available"
            value={`₹${budget} Cr`}
            subtitle="For interventions"
            icon={<Wallet className="w-5 h-5" />}
            color="warning"
            isDemo
          />
        </motion.div>

        {/* ── Charts row ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* 1. Risk Distribution Pie */}
          <ChartCard title="Risk Distribution" subtitle="Zones by combined risk category">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={RISK_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {RISK_DISTRIBUTION.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-slate-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2. Heat vs Flood BarChart */}
          <ChartCard title="Heat vs Flood Risk" subtitle="Score comparison per neighbourhood (0–100)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barCategoryGap="30%" barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a3020" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<GlassTooltip />} cursor={{ fill: '#10b98112' }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-slate-400">{value}</span>
                  )}
                />
                <Bar dataKey="Heat" fill="#EF4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Flood" fill="#38BDF8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3. Monthly Temperature Line */}
          <ChartCard title="Monthly Heat Index" subtitle="Avg temperature & heat index — Bengaluru (illustrative)">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MONTHLY_HEAT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a3020" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<GlassTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-slate-400">{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="avgTemp"
                  name="Avg Temp (°C)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#F59E0B' }}
                />
                <Line
                  type="monotone"
                  dataKey="heatIndex"
                  name="Heat Index (°C)"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        {/* ── Lower row ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Priority Neighbourhoods table */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1 bg-[#0D1F14]/80 backdrop-blur-md border border-emerald-900/30 rounded-2xl p-5 shadow-lg"
          >
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Priority Neighbourhoods</h3>
              <p className="text-xs text-slate-500 mt-0.5">Top 5 by combined risk score</p>
            </div>
            <div className="space-y-3">
              {priorityNeighbourhoods.map((n, idx) => {
                const intervention = INTERVENTIONS.find((i) => i.id === n.recommendation);
                const priorityScore = Math.max(n.heatScore, n.floodScore);
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#0a1a0f]/60 border border-emerald-900/20 hover:border-emerald-700/40 transition-colors duration-200"
                  >
                    {/* Rank */}
                    <div className="w-6 h-6 rounded-full bg-emerald-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-400">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-white truncate">{n.name}</span>
                        <span className="text-xs font-bold text-amber-400 flex-shrink-0">
                          {priorityScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <RiskBadge level={n.heatRisk} type="heat" />
                        <RiskBadge level={n.floodRisk} type="flood" />
                      </div>
                      {intervention && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <span>{INTERVENTION_ICONS[n.recommendation]}</span>
                          <span>{intervention.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Intervention Distribution Pie */}
          <ChartCard title="Intervention Distribution" subtitle="Recommended GI types across zones">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={INTERVENTION_DISTRIBUTION}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {INTERVENTION_DISTRIBUTION.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-slate-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Recent Planning Activity */}
          <motion.div
            variants={itemVariants}
            className="bg-[#0D1F14]/80 backdrop-blur-md border border-emerald-900/30 rounded-2xl p-5 shadow-lg"
          >
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Recent Planning Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Demo — simulated event log</p>
            </div>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#0a1a0f]/60 border border-emerald-900/20"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-800/70 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{activity.detail}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Disclaimer ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs italic text-amber-500/70 text-center pb-4"
        >
          <Activity className="w-3 h-3 inline mr-1 mb-0.5" />
          {SUMMARY_STATS.disclaimer}
        </motion.p>
      </div>
    </div>
  );
};

export default OverviewPage;

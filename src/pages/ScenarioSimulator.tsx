import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TreePine,
  Droplets,
  Thermometer,
  CloudRain,
  DollarSign,
  PieChart as PieChartIcon,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { SCENARIOS, ScenarioData, INTERVENTIONS } from '../data/mockData';
import DemoBadge from '../components/ui/DemoBadge';

interface ScenarioSimulatorProps {
  onNavigate?: (page: string) => void;
}

export default function ScenarioSimulator({ onNavigate }: ScenarioSimulatorProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('combined');

  const selectedScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[4];
  const baselineScenario = SCENARIOS[0];

  // Radar comparative data
  const radarData = [
    {
      metric: 'Thermal Attenuation',
      Baseline: 20,
      Selected: 20 + Math.abs(selectedScenario.heatChange) * 2.5,
      fullMark: 100,
    },
    {
      metric: 'Runoff Reduction',
      Baseline: 25,
      Selected: 25 + Math.abs(selectedScenario.floodChange) * 1.6,
      fullMark: 100,
    },
    {
      metric: 'Canopy Coverage',
      Baseline: 18,
      Selected: 18 + selectedScenario.coverageChange * 3.5,
      fullMark: 100,
    },
    {
      metric: 'CO2 Sequestration',
      Baseline: 15,
      Selected: 15 + (selectedScenario.co2Reduction / 35),
      fullMark: 100,
    },
    {
      metric: 'CapEx Efficiency',
      Baseline: 80,
      Selected: Math.max(25, 90 - (selectedScenario.cost * 0.8)),
      fullMark: 100,
    },
  ];

  // Interventions budget share in selected scenario
  const pieData = selectedScenario.interventions.map((intId) => {
    const inter = INTERVENTIONS.find((i) => i.id === intId);
    return {
      name: inter ? inter.name : intId,
      value: inter ? inter.costPerUnit * 10 : 20,
      color: inter ? inter.color : '#10B981',
    };
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title & Disclaimer */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald">
              <GitCompare className="w-6 h-6 text-emerald-bright" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
                  Scenario Simulator
                </h1>
                <DemoBadge verbose={true} />
              </div>
              <p className="text-text-secondary text-sm mt-0.5">
                Dynamic before-and-after environmental impact simulations across nature-based intervention portfolios.
              </p>
            </div>
          </div>
        </div>

        {/* Prominent Disclaimer */}
        <div className="mt-4 p-3.5 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3 text-xs text-warning leading-relaxed">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning" />
          <span>
            <strong>Modelled Scenario Disclaimer:</strong> Projected microclimate indices, runoff retention ratios, and capital expenditure figures are synthetic simulation outputs designed for planning exercises. Comprehensive in-situ hydrological surveys and localized environmental assessments are required prior to engineering tenders.
          </span>
        </div>
      </div>

      {/* Scenario Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SCENARIOS.map((sc) => {
          const isSelected = sc.id === selectedScenarioId;
          const isBase = sc.id === 'baseline';

          return (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald/10 border-emerald shadow-emerald-glow'
                  : 'bg-bg-secondary border-emerald/10 hover:border-emerald/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                    isBase ? 'bg-white/10 text-text-secondary' : 'bg-emerald/20 text-emerald-bright'
                  }`}>
                    {isBase ? 'Control' : 'Portfolio'}
                  </span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-emerald" />}
                </div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  {sc.name}
                </h3>
                <p className="text-[11px] text-text-secondary line-clamp-2 mb-3">
                  {sc.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-text-secondary">Estimated Capex:</span>
                <span className="font-mono font-bold text-text-primary">
                  {sc.cost === 0 ? '₹0' : `₹${sc.cost} Cr`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Before vs After Impact Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heat Impact */}
        <div className="glass-card p-5 border-emerald/15 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Heat Island Mitigation</span>
            <div className="p-2 rounded-lg bg-danger/10 text-danger">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold font-mono text-danger">
                {selectedScenario.heatChange === 0 ? '0%' : `${selectedScenario.heatChange}%`}
              </span>
              <span className="text-xs text-text-secondary">Land Surface Temp</span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Baseline: <span className="text-text-primary">0% reduction</span> → Modelled:{' '}
              <span className="text-emerald font-semibold">{Math.abs(selectedScenario.heatChange)}% drop</span>
            </p>
          </div>
        </div>

        {/* Runoff Impact */}
        <div className="glass-card p-5 border-emerald/15 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Runoff Retention Surge</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold font-mono text-blue-400">
                {selectedScenario.floodChange === 0 ? '0%' : `${selectedScenario.floodChange}%`}
              </span>
              <span className="text-xs text-text-secondary">Peak Hydrograph Peak</span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Baseline: <span className="text-text-primary">78% impervious</span> → Modelled:{' '}
              <span className="text-blue-400 font-semibold">{Math.abs(selectedScenario.floodChange)}% storm capture</span>
            </p>
          </div>
        </div>

        {/* Green Coverage Impact */}
        <div className="glass-card p-5 border-emerald/15 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Vegetation Canopy Expansion</span>
            <div className="p-2 rounded-lg bg-emerald/10 text-emerald">
              <TreePine className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold font-mono text-emerald">
                +{selectedScenario.coverageChange}%
              </span>
              <span className="text-xs text-text-secondary">Canopy Net Delta</span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Baseline: <span className="text-text-primary">18% urban canopy</span> → Target:{' '}
              <span className="text-emerald font-semibold">{18 + selectedScenario.coverageChange}% canopy</span>
            </p>
          </div>
        </div>

        {/* CO2 Impact */}
        <div className="glass-card p-5 border-emerald/15 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Annual GHG Sequestration</span>
            <div className="p-2 rounded-lg bg-emerald-bright/10 text-emerald-bright">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold font-mono text-emerald-bright">
                {selectedScenario.co2Reduction.toLocaleString()}
              </span>
              <span className="text-xs text-text-secondary">tCO2e / annum</span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Calculated at full 7-year canopy maturity with native drought-tolerant species.
            </p>
          </div>
        </div>
      </div>

      {/* Deep-Dive Comparative Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Comparison Chart */}
        <div className="glass-card p-6 border-emerald/15">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">Multi-Dimensional Performance Radar</h3>
              <p className="section-subtitle">
                Baseline (Grey) vs {selectedScenario.name} (Emerald)
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald/10 text-emerald">
              Normalised Scale 0-100
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#1F3528" />
                <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <PolarRadiusAxis stroke="#1F3528" angle={30} domain={[0, 100]} />
                <Radar
                  name="Baseline Current"
                  dataKey="Baseline"
                  stroke="#4B5563"
                  fill="#4B5563"
                  fillOpacity={0.25}
                />
                <Radar
                  name={selectedScenario.name}
                  dataKey="Selected"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.45}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#F0FDF4', paddingTop: '10px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101B15',
                    borderColor: 'rgba(16,185,129,0.3)',
                    color: '#F0FDF4',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Intervention Breakdown */}
        <div className="glass-card p-6 border-emerald/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title">Capital Deployment Allocation</h3>
                <p className="section-subtitle">
                  Relative capital intensity across intervention types
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-text-primary">
                Total: ₹{selectedScenario.cost} Cr
              </span>
            </div>

            {selectedScenario.interventions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#101B15',
                          borderColor: 'rgba(16,185,129,0.3)',
                          color: '#F0FDF4',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5">
                  {selectedScenario.interventions.map((intId) => {
                    const inter = INTERVENTIONS.find((i) => i.id === intId);
                    if (!inter) return null;
                    return (
                      <div key={intId} className="flex items-center justify-between p-2 rounded-lg bg-bg-primary/60 border border-white/5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{inter.emoji}</span>
                          <span className="text-text-primary font-medium">{inter.name}</span>
                        </div>
                        <span className="font-mono text-emerald-bright">
                          {inter.costPerUnit} L / unit
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-emerald/20 rounded-xl">
                <span className="text-3xl mb-2">🏛️</span>
                <p className="text-sm font-semibold text-text-primary">Baseline Operating Condition</p>
                <p className="text-xs text-text-secondary mt-1 max-w-xs">
                  Zero green infrastructure capital committed. City remains exposed to unmitigated heat waves and monsoon drainage overflows.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-emerald/10 flex items-center justify-between text-xs">
            <span className="text-text-secondary">Expected Payback Period:</span>
            <span className="text-emerald font-semibold">4.8 Years (via flood loss avoidance & cooling)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

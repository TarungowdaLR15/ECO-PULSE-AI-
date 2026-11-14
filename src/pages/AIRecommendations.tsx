import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sliders,
  Sparkles,
  TreePine,
  Droplets,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Building,
  Filter,
  Check
} from 'lucide-react';
import { NEIGHBOURHOODS, INTERVENTIONS, InterventionType } from '../data/mockData';
import { useApp } from '../context/AppContext';
import DemoBadge from '../components/ui/DemoBadge';
import { api } from '../services/api';

interface AIRecommendationsProps {
  onNavigate?: (page: string) => void;
}

export default function AIRecommendations({ onNavigate }: AIRecommendationsProps) {
  const { setSelectedZone, addNotification } = useApp();

  const [riskFilter, setRiskFilter] = useState<'all' | 'heat' | 'flood'>('all');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'cost' | 'benefit'>('score');
  const [showWeightsModal, setShowWeightsModal] = useState(false);
  const [selectedInterventionDetail, setSelectedInterventionDetail] = useState<string | null>(null);

  // Dynamic stateful weights
  const [weights, setWeights] = useState({
    heat: 25,
    flood: 25,
    pop: 20,
    land: 15,
    cost: 15,
  });
  const [backendScores, setBackendScores] = useState<Record<string, number> | null>(null);
  const [computingMCDA, setComputingMCDA] = useState(false);

  const handleComputeBackendMCDA = async () => {
    setComputingMCDA(true);
    try {
      const res = await api.computeMCDAScores({
        heatWeight: weights.heat / 100,
        floodWeight: weights.flood / 100,
        populationWeight: weights.pop / 100,
        landWeight: weights.land / 100,
        costWeight: weights.cost / 100,
      });
      const scoreMap: Record<string, number> = {};
      res.rankedZones.forEach((z: any) => {
        scoreMap[z.id] = z.computedScore;
      });
      setBackendScores(scoreMap);
      addNotification({
        type: 'success',
        title: 'MCDA Optimization Solved',
        message: 'FastAPI backend recalculated composite scores and dynamic rankings.',
      });
    } catch (e) {
      addNotification({
        type: 'warning',
        title: 'Solver Notice',
        message: 'Recalculating using local client heuristic.',
      });
    } finally {
      setComputingMCDA(false);
    }
  };

  // Model weight breakdown
  const criteriaWeights = [
    { key: 'heat' as const, label: 'Heat Island Vulnerability', weight: weights.heat, color: '#EF4444', desc: 'Prioritises zones with land surface temperature anomalies >3°C' },
    { key: 'flood' as const, label: 'Surface Runoff / Flood Risk', weight: weights.flood, color: '#38BDF8', desc: 'Analyses drainage basin slope, depression volume & peak monsoon surcharge' },
    { key: 'pop' as const, label: 'Vulnerable Population Density', weight: weights.pop, color: '#F59E0B', desc: 'Weights low-canopy wards with high elderly, child & transit density' },
    { key: 'land' as const, label: 'Physical Land Suitability', weight: weights.land, color: '#10B981', desc: 'Checks right-of-way width, public setback availability & soil permeability' },
    { key: 'cost' as const, label: 'Cost-Effectiveness Index', weight: weights.cost, color: '#A78BFA', desc: 'Unit Capex/Opex vs lifetime modelled thermal & hydrological attenuation' },
  ];

  // Helper to retrieve intervention meta
  const getIntervention = (type: InterventionType) => {
    return INTERVENTIONS.find((i) => i.id === type) || INTERVENTIONS[0];
  };

  // Rule-based reason generator
  const getReasons = (n: typeof NEIGHBOURHOODS[0]) => {
    const list: string[] = [];
    if (n.heatScore >= 75) {
      list.push(`High surface thermal index (${n.heatScore}/100) requires intensive canopy shade.`);
    } else if (n.floodScore >= 75) {
      list.push(`Critical runoff vulnerability (${n.floodScore}/100) demands accelerated bio-retention.`);
    } else {
      list.push(`Balanced climate hazard exposure (Heat: ${n.heatScore}, Flood: ${n.floodScore}).`);
    }

    if (n.availableLand >= 15) {
      list.push(`Generous open land reserves (${n.availableLand} ha) permit decentralised bioretention systems.`);
    } else if (n.availableLand >= 8) {
      list.push(`Moderate setback footprint (${n.availableLand} ha) ideal for linear street arboriculture & pervious pavers.`);
    } else {
      list.push(`Dense impervious urban fabric (${n.impervious}%) requires modular vertical/rooftop retrofits.`);
    }

    list.push(`Protecting ${n.population.toLocaleString()} exposed urban residents in high-activity transit corridors.`);
    return list;
  };

  // Filtered and sorted recommendations
  const filteredZones = useMemo(() => {
    return NEIGHBOURHOODS.filter((n) => {
      // Risk filter
      if (riskFilter === 'heat' && n.heatRisk !== 'high') return false;
      if (riskFilter === 'flood' && n.floodRisk !== 'high') return false;

      // Budget filter (estimated project cost in lakhs based on available land * unit cost)
      const inter = getIntervention(n.recommendation);
      const estCost = inter.costPerUnit * (n.availableLand * 3); // illustrative calc
      if (budgetFilter === 'low' && estCost > 20) return false;
      if (budgetFilter === 'mid' && (estCost <= 20 || estCost > 60)) return false;
      if (budgetFilter === 'high' && estCost <= 60) return false;

      return true;
    }).sort((a, b) => {
      const scoreA = backendScores ? (backendScores[a.id] ?? a.recommendationScore) : a.recommendationScore;
      const scoreB = backendScores ? (backendScores[b.id] ?? b.recommendationScore) : b.recommendationScore;
      if (sortBy === 'score') return scoreB - scoreA;
      const costA = getIntervention(a.recommendation).costPerUnit * a.availableLand;
      const costB = getIntervention(b.recommendation).costPerUnit * b.availableLand;
      if (sortBy === 'cost') return costA - costB;
      // benefit
      const benefitA = getIntervention(a.recommendation).heatReduction + getIntervention(a.recommendation).floodReduction;
      const benefitB = getIntervention(b.recommendation).heatReduction + getIntervention(b.recommendation).floodReduction;
      return benefitB - benefitA;
    });
  }, [riskFilter, budgetFilter, sortBy, backendScores]);

  const handleAddToPlan = (zoneName: string, interventionName: string) => {
    addNotification({
      type: 'success',
      title: 'Added to Municipal Plan',
      message: `${interventionName} in ${zoneName} staged for capital expenditure synthesis.`,
    });
  };

  const handleViewOnMap = (zoneId: string) => {
    setSelectedZone(zoneId);
    if (onNavigate) {
      onNavigate('map');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald">
                <Brain className="w-6 h-6 text-emerald-bright" />
              </span>
              AI Recommendation Engine
            </h1>
            <DemoBadge verbose={true} />
          </div>
          <p className="text-text-secondary text-sm mt-1 max-w-3xl">
            Multi-criteria heuristic ranking engine generating explainable, location-optimised nature-based infrastructure blueprints for municipal execution.
          </p>
        </div>

        <button
          onClick={() => setShowWeightsModal(!showWeightsModal)}
          className="btn-secondary flex items-center gap-2 self-start md:self-auto text-xs py-2 px-3"
        >
          <Sliders className="w-4 h-4 text-emerald" />
          <span>{showWeightsModal ? 'Hide Weighting Matrix' : 'Inspect Algorithmic Weights'}</span>
        </button>
      </div>

      {/* Transparent Model Weights Banner */}
      <AnimatePresence>
        {showWeightsModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 border-emerald/30 bg-bg-secondary/90 relative">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-bright" />
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                    Transparent Multi-Criteria Decision Analysis (MCDA) Scoring Protocol
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20">
                  v2.4 Rule Engine
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed mb-5">
                Recommendations are calculated using an explainable weighted linear combination. All values are normalised across regional demographic and land surface indicators. <strong className="text-text-primary">No proprietary black-box ML model is simulated.</strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                {criteriaWeights.map((c) => (
                  <div key={c.label} className="p-3 rounded-lg bg-bg-primary/80 border border-emerald/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-text-primary">{c.label}</span>
                        <span className="text-xs font-mono font-bold" style={{ color: c.color }}>
                          {c.weight}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={c.weight}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setWeights((prev) => ({ ...prev, [c.key]: val }));
                        }}
                        className="w-full accent-emerald cursor-pointer h-1.5 bg-bg-secondary rounded-lg my-2"
                      />
                      <p className="text-[10px] text-text-secondary line-clamp-2">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-emerald/10">
                <span className="text-xs text-text-secondary">
                  Adjust weights above to stress-test municipal capital allocations.
                </span>
                <button
                  onClick={handleComputeBackendMCDA}
                  disabled={computingMCDA}
                  className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {computingMCDA ? 'Solving via FastAPI...' : 'Solve Weights via FastAPI Backend'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Control Toolbar */}
      <div className="glass-card p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Risk Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-secondary font-medium mr-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald" /> Hazard:
          </span>
          {(['all', 'heat', 'flood'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                riskFilter === r
                  ? 'bg-emerald text-bg-primary font-semibold shadow-emerald-glow'
                  : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-emerald/10'
              }`}
            >
              {r === 'all' ? 'All Hazard Zones' : r === 'heat' ? 'High Heat Risk' : 'High Flood Risk'}
            </button>
          ))}
        </div>

        {/* Budget Filter & Sorter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Project Size:</span>
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value as any)}
              className="bg-bg-primary border border-emerald/20 text-xs text-text-primary rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald"
            >
              <option value="all">Any Capital Band</option>
              <option value="low">&lt; ₹20 Lakhs (Fast Track)</option>
              <option value="mid">₹20L – ₹60L (Medium Scale)</option>
              <option value="high">&gt; ₹60L (Strategic Infrastructure)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-bg-primary border border-emerald/20 text-xs text-text-primary rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald"
            >
              <option value="score">Priority MCDA Score (High → Low)</option>
              <option value="benefit">Combined Benefit %</option>
              <option value="cost">Estimated Outlay (Low → High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-text-secondary px-1">
        <span>Showing <strong className="text-text-primary">{filteredZones.length}</strong> location-specific intervention packages</span>
        <span className="text-[11px] text-warning/80 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> All costs and benefits are illustrative modelled estimates
        </span>
      </div>

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredZones.map((zone, idx) => {
          const intervention = getIntervention(zone.recommendation);
          const reasons = getReasons(zone);
          const estCapex = (intervention.costPerUnit * (zone.availableLand * 2.8)).toFixed(1);

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card-hover p-6 flex flex-col justify-between border-emerald/15 hover:border-emerald/40 relative overflow-hidden group"
            >
              {/* Subtle accent bar on top */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: intervention.color }}
              />

              <div>
                {/* Card Top Row: Rank, Zone Name & MCDA score */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-emerald/10 border border-emerald/20 text-emerald font-mono text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-text-primary group-hover:text-emerald-bright transition-colors">
                        {zone.name}
                      </h3>
                      <p className="text-xs text-text-secondary flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald" /> Ward ID: {zone.id.toUpperCase()} · Area: {zone.area} km²
                      </p>
                    </div>
                  </div>

                  {/* Priority Score Gauge */}
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-xl font-bold font-mono text-emerald-bright">
                        {backendScores?.[zone.id] ?? zone.recommendationScore}
                      </span>
                      <span className="text-[10px] text-text-secondary">/100</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald uppercase tracking-wider block">
                      {backendScores?.[zone.id] ? 'FastAPI Score' : 'MCDA Match'}
                    </span>
                  </div>
                </div>

                {/* Recommended Intervention Banner */}
                <div className="p-3 rounded-xl bg-bg-primary/90 border border-emerald/20 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 rounded-lg bg-bg-secondary border border-emerald/15">
                      {intervention.emoji}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider block">
                        Recommended Intervention
                      </span>
                      <span className="text-sm font-bold text-text-primary">
                        {intervention.name}
                      </span>
                    </div>
                  </div>

                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold border"
                    style={{
                      backgroundColor: `${intervention.color}15`,
                      color: intervention.color,
                      borderColor: `${intervention.color}35`,
                    }}
                  >
                    Tier-1 Priority
                  </span>
                </div>

                {/* Justification Reasons */}
                <div className="space-y-2 mb-5">
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald" /> Algorithmic Justification
                  </span>
                  <div className="bg-bg-primary/40 rounded-lg p-3 border border-emerald/10 space-y-1.5">
                    {reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-bg-secondary/80 border border-white/5 text-center mb-5">
                  <div>
                    <span className="text-[10px] text-text-secondary block">Est. Capex</span>
                    <span className="text-xs font-bold text-text-primary font-mono">
                      ₹{estCapex} L
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary block">Heat Atten.</span>
                    <span className="text-xs font-bold text-danger font-mono">
                      -{intervention.heatReduction}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary block">Runoff Drop</span>
                    <span className="text-xs font-bold text-blue-400 font-mono">
                      -{intervention.floodReduction}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary block">Canopy +</span>
                    <span className="text-xs font-bold text-emerald font-mono">
                      +{intervention.greenCoverageGain}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-emerald/10 mt-2">
                <button
                  onClick={() => handleViewOnMap(zone.id)}
                  className="text-xs text-emerald hover:text-emerald-bright flex items-center gap-1 font-medium transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" /> Spatial Context
                </button>

                <button
                  onClick={() => handleAddToPlan(zone.name, intervention.name)}
                  className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Stage to Plan
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

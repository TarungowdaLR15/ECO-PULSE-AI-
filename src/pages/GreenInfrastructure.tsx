import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TreePine,
  Droplets,
  Layers,
  Building,
  CheckCircle2,
  AlertCircle,
  Wrench,
  DollarSign,
  Maximize2,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { INTERVENTIONS, Intervention, InterventionType } from '../data/mockData';
import { useApp } from '../context/AppContext';
import DemoBadge from '../components/ui/DemoBadge';

interface GreenInfrastructureProps {
  onNavigate?: (page: string) => void;
}

export default function GreenInfrastructure({ onNavigate }: GreenInfrastructureProps) {
  const { addNotification } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'trees' | 'water' | 'surface' | 'roof'>('all');
  const [activeModalIntervention, setActiveModalIntervention] = useState<Intervention | null>(null);

  const categories = [
    { id: 'all', label: 'All Interventions' },
    { id: 'trees', label: 'Arboriculture', icon: TreePine },
    { id: 'water', label: 'Bioretention & Wetlands', icon: Droplets },
    { id: 'surface', label: 'Permeable Pavements', icon: Layers },
    { id: 'roof', label: 'Green Roofs', icon: Building },
  ];

  const filteredInterventions = INTERVENTIONS.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'trees') return item.id === 'urban-trees';
    if (selectedCategory === 'water') return item.id === 'rain-garden' || item.id === 'urban-pond';
    if (selectedCategory === 'surface') return item.id === 'permeable-pavement';
    if (selectedCategory === 'roof') return item.id === 'green-roof';
    return true;
  });

  const handleAddToPlan = (intervention: Intervention) => {
    addNotification({
      type: 'success',
      title: 'Added to Municipal Blueprint',
      message: `${intervention.name} specifications added to municipal green planning schedule.`,
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald">
            <TreePine className="w-6 h-6 text-emerald-bright" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
                Green Infrastructure Library
              </h1>
              <DemoBadge verbose={true} />
            </div>
            <p className="text-text-secondary text-sm mt-0.5">
              Standardized engineering profiles, hydraulic specifications, and maintenance frameworks for urban ecological assets.
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-emerald/10 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-emerald text-bg-primary shadow-emerald-glow'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-emerald/10 border border-emerald/10'
            }`}
          >
            {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Interventions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInterventions.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-hover p-6 border-emerald/15 hover:border-emerald/40 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 rounded-xl bg-bg-primary border border-emerald/20 shadow-inner">
                    {item.emoji}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{item.name}</h3>
                    <p className="text-xs text-emerald font-medium">{item.purpose}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalIntervention(item)}
                  className="p-1.5 rounded-lg bg-bg-primary border border-emerald/20 text-text-secondary hover:text-emerald transition-colors"
                  title="View Deep Specifications"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Suitable For */}
              <div className="mb-4 p-2.5 rounded-lg bg-bg-primary/50 border border-emerald/10 text-xs">
                <span className="text-text-secondary font-medium block text-[10px] uppercase tracking-wider mb-0.5">
                  Optimal Spatial Application
                </span>
                <span className="text-text-primary">{item.suitableFor}</span>
              </div>

              {/* Performance Gauges */}
              <div className="space-y-2 mb-5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
                  Microclimate & Runoff Efficacy
                </span>
                <div className="space-y-1.5">
                  {/* Heat */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-text-secondary">Thermal Attenuation</span>
                      <span className="text-danger font-mono font-bold">-{item.heatReduction}%</span>
                    </div>
                    <div className="w-full bg-bg-primary h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-danger h-full rounded-full"
                        style={{ width: `${item.heatReduction * 3.5}%` }}
                      />
                    </div>
                  </div>

                  {/* Flood */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-text-secondary">Stormwater Retention</span>
                      <span className="text-blue-400 font-mono font-bold">-{item.floodReduction}%</span>
                    </div>
                    <div className="w-full bg-bg-primary h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-400 h-full rounded-full"
                        style={{ width: `${item.floodReduction * 2}%` }}
                      />
                    </div>
                  </div>

                  {/* Coverage */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-text-secondary">Biomass / Canopy Gain</span>
                      <span className="text-emerald font-mono font-bold">+{item.greenCoverageGain}%</span>
                    </div>
                    <div className="w-full bg-bg-primary h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald h-full rounded-full"
                        style={{ width: `${item.greenCoverageGain * 4}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Environmental Benefits */}
              <div className="space-y-1.5 mb-5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
                  Verified Co-Benefits
                </span>
                <ul className="space-y-1">
                  {item.benefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions and Cost */}
            <div className="pt-4 border-t border-emerald/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-text-secondary block">Benchmark Unit Cost</span>
                <span className="text-sm font-bold font-mono text-text-primary">
                  ₹{item.costPerUnit} Lakhs{' '}
                  <span className="text-[10px] font-normal text-text-secondary">{item.unit}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalIntervention(item)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Tech Specs
                </button>
                <button
                  onClick={() => handleAddToPlan(item)}
                  className="btn-primary text-xs py-2 px-3"
                >
                  Add to Plan
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tech Specs Modal */}
      <AnimatePresence>
        {activeModalIntervention && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card bg-bg-secondary p-6 md:p-8 max-w-2xl w-full border-emerald/30 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setActiveModalIntervention(null)}
                className="absolute top-5 right-5 p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl p-2 rounded-xl bg-bg-primary border border-emerald/20">
                  {activeModalIntervention.emoji}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    {activeModalIntervention.name}
                  </h2>
                  <p className="text-xs text-emerald">
                    Engineering Specification & Operational Guidelines
                  </p>
                </div>
              </div>

              <div className="space-y-5 text-xs text-text-secondary leading-relaxed">
                <div>
                  <h4 className="text-text-primary font-semibold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald" /> Primary Environmental Objective
                  </h4>
                  <p className="bg-bg-primary/60 p-3 rounded-lg border border-emerald/10">
                    {activeModalIntervention.purpose}
                  </p>
                </div>

                <div>
                  <h4 className="text-text-primary font-semibold mb-1 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-emerald" /> Installation & Civil Prerequisites
                  </h4>
                  <p className="bg-bg-primary/60 p-3 rounded-lg border border-emerald/10">
                    {activeModalIntervention.installation}
                  </p>
                </div>

                <div>
                  <h4 className="text-text-primary font-semibold mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-emerald" /> Long-Term Maintenance & Monitoring Schedule
                  </h4>
                  <p className="bg-bg-primary/60 p-3 rounded-lg border border-emerald/10">
                    {activeModalIntervention.maintenance}
                  </p>
                </div>

                <div>
                  <h4 className="text-text-primary font-semibold mb-1.5">Full Ecological Co-Benefits</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeModalIntervention.benefits.map((b, idx) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-bg-primary/40 border border-white/5 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald/10 flex justify-end gap-3">
                <button
                  onClick={() => setActiveModalIntervention(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Close Specification
                </button>
                <button
                  onClick={() => {
                    handleAddToPlan(activeModalIntervention);
                    setActiveModalIntervention(null);
                  }}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Incorporate in Municipal Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

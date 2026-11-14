// ECO-PULSE AI — Digital Twin Map Page
// Map data and zone boundaries are simulated for demonstration purposes.

import React, { useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Layers,
  Thermometer,
  Droplets,
  TreePine,
  Users,
  MapPin,
  Leaf,
  LayoutGrid,
  Info,
  PlusCircle,
  Eye,
  ChevronRight,
} from 'lucide-react';

import {
  NEIGHBOURHOODS,
  INTERVENTIONS,
  type Neighbourhood,
  type InterventionType,
} from '../data/mockData';
import { useApp } from '../context/AppContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type LayerKey = 'heat' | 'flood' | 'vegetation' | 'population' | 'gi';

interface LayerConfig {
  id: LayerKey;
  label: string;
  icon: React.ReactNode;
  legendItems: { color: string; label: string }[];
}

// ─── Layer definitions ────────────────────────────────────────────────────────

const LAYERS: LayerConfig[] = [
  {
    id: 'heat',
    label: 'Urban Heat Risk',
    icon: <Thermometer className="w-4 h-4" />,
    legendItems: [
      { color: '#EF4444', label: 'High heat risk' },
      { color: '#F59E0B', label: 'Medium heat risk' },
      { color: '#10B981', label: 'Low heat risk' },
    ],
  },
  {
    id: 'flood',
    label: 'Flood / Runoff Risk',
    icon: <Droplets className="w-4 h-4" />,
    legendItems: [
      { color: '#1D4ED8', label: 'High flood risk' },
      { color: '#38BDF8', label: 'Medium flood risk' },
      { color: '#6EE7B7', label: 'Low flood risk' },
    ],
  },
  {
    id: 'vegetation',
    label: 'Vegetation Coverage',
    icon: <TreePine className="w-4 h-4" />,
    legendItems: [
      { color: '#166534', label: 'High coverage (>25%)' },
      { color: '#16A34A', label: 'Medium (10–25%)' },
      { color: '#86EFAC', label: 'Low (<10%)' },
    ],
  },
  {
    id: 'population',
    label: 'Population Exposure',
    icon: <Users className="w-4 h-4" />,
    legendItems: [
      { color: '#7C3AED', label: 'High exposure (>80%)' },
      { color: '#A78BFA', label: 'Medium (50–80%)' },
      { color: '#DDD6FE', label: 'Low (<50%)' },
    ],
  },
  {
    id: 'gi',
    label: 'Recommended GI',
    icon: <Leaf className="w-4 h-4" />,
    legendItems: [
      { color: '#10B981', label: 'Urban Trees' },
      { color: '#34D399', label: 'Rain Gardens' },
      { color: '#F59E0B', label: 'Permeable Pavement' },
      { color: '#6EE7B7', label: 'Green Roofs' },
      { color: '#38BDF8', label: 'Urban Ponds' },
    ],
  },
];

// ─── Colour helpers ───────────────────────────────────────────────────────────

const GI_COLORS: Record<InterventionType, string> = {
  'urban-trees': '#10B981',
  'rain-garden': '#34D399',
  'permeable-pavement': '#F59E0B',
  'green-roof': '#6EE7B7',
  'urban-pond': '#38BDF8',
};

function getMarkerColor(zone: Neighbourhood, activeLayer: LayerKey): string {
  switch (activeLayer) {
    case 'heat':
      return zone.heatRisk === 'high' ? '#EF4444' : zone.heatRisk === 'medium' ? '#F59E0B' : '#10B981';
    case 'flood':
      return zone.floodRisk === 'high' ? '#1D4ED8' : zone.floodRisk === 'medium' ? '#38BDF8' : '#6EE7B7';
    case 'vegetation':
      return zone.vegetationCoverage > 25 ? '#166534' : zone.vegetationCoverage >= 10 ? '#16A34A' : '#86EFAC';
    case 'population':
      return zone.populationExposure > 80 ? '#7C3AED' : zone.populationExposure >= 50 ? '#A78BFA' : '#DDD6FE';
    case 'gi':
    default:
      return GI_COLORS[zone.recommendation] ?? '#10B981';
  }
}

// ─── Intervention icons ───────────────────────────────────────────────────────

const INTERVENTION_ICONS: Record<InterventionType, string> = {
  'urban-trees': '🌳',
  'rain-garden': '🌿',
  'permeable-pavement': '🛣️',
  'green-roof': '🏡',
  'urban-pond': '💧',
};

const INTERVENTION_EXPLANATIONS: Record<InterventionType, string> = {
  'urban-trees':
    'Strategic tree planting reduces the urban heat island effect by providing canopy shade and evapotranspiration cooling. This zone has low vegetation coverage and high heat scores, making tree corridors the most cost-effective immediate intervention. Trees also improve air quality and provide long-term carbon sequestration benefits.',
  'rain-garden':
    'Rain gardens capture and filter stormwater runoff before it enters drainage systems. This zone shows elevated flood risk and high impervious surface cover, making decentralised bio-retention the optimal solution. Strategically placed rain gardens can reduce peak runoff by 60–80% (illustrative estimate).',
  'permeable-pavement':
    'Replacing conventional pavement with permeable surfaces allows rainfall to infiltrate directly into the ground. This zone has significant parking and low-traffic road area that can be retrofitted at scale. Permeable pavement also reduces the heat island effect through evaporative cooling of retained moisture.',
  'green-roof':
    'Green roofs on flat commercial and residential buildings retain stormwater and reduce building cooling loads. This high-density zone has limited ground-level space, making vertical greening the most viable route to increasing vegetation coverage and managing runoff simultaneously.',
  'urban-pond':
    'Urban ponds and constructed wetlands provide large-scale flood attenuation by storing peak storm flows and slowly releasing water into the drainage network. This low-lying zone is subject to recurring inundation and has sufficient open land area to accommodate a retention basin system.',
};

// ─── Risk badge ───────────────────────────────────────────────────────────────

type Risk = 'low' | 'medium' | 'high';

const RiskBadge: React.FC<{ level: Risk; type: 'heat' | 'flood' }> = ({ level, type }) => {
  const colorMap: Record<Risk, string> = {
    high:
      type === 'heat'
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  const label =
    type === 'heat'
      ? `🌡️ Heat: ${level}`
      : `💧 Flood: ${level}`;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${colorMap[level]}`}
    >
      {label}
    </span>
  );
};

// ─── Map fly-to helper ────────────────────────────────────────────────────────

interface FlyToProps {
  lat: number;
  lng: number;
}

const FlyToZone: React.FC<FlyToProps> = ({ lat, lng }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
};

// ─── Left panel ───────────────────────────────────────────────────────────────

interface LeftPanelProps {
  activeLayers: Set<LayerKey>;
  primaryLayer: LayerKey;
  onLayerToggle: (id: LayerKey) => void;
  search: string;
  onSearch: (v: string) => void;
  zones: Neighbourhood[];
  onZoneClick: (zone: Neighbourhood) => void;
  selectedZoneId: string | null;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  activeLayers,
  primaryLayer,
  onLayerToggle,
  search,
  onSearch,
  zones,
  onZoneClick,
  selectedZoneId,
}) => {
  const filtered = useMemo(
    () =>
      zones.filter((z) => z.name.toLowerCase().includes(search.toLowerCase())),
    [zones, search],
  );

  return (
    <div className="w-72 flex-shrink-0 h-full overflow-y-auto bg-[#0a1a0f]/90 backdrop-blur-xl border-r border-emerald-900/30 flex flex-col z-10">
      {/* Header */}
      <div className="p-4 border-b border-emerald-900/20">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Map Layers</h2>
        </div>
        <p className="text-xs text-slate-500">Toggle risk overlays</p>
      </div>

      {/* Layer toggles */}
      <div className="p-4 space-y-2 border-b border-emerald-900/20">
        {LAYERS.map((layer) => {
          const isActive = activeLayers.has(layer.id);
          const isPrimary = primaryLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => onLayerToggle(layer.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                transition-all duration-200
                ${isActive
                  ? 'bg-emerald-700/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/30 border border-slate-700/30 text-slate-500 hover:border-slate-600/50 hover:text-slate-400'
                }
              `}
            >
              <div
                className={`
                  w-8 h-5 rounded-full flex-shrink-0 relative transition-colors duration-200
                  ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                    ${isActive ? 'translate-x-3' : 'translate-x-0.5'}
                  `}
                />
              </div>
              <span className="flex-shrink-0">{layer.icon}</span>
              <span className="text-xs font-medium truncate">{layer.label}</span>
              {isPrimary && isActive && (
                <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md flex-shrink-0">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Zone search */}
      <div className="p-4 border-b border-emerald-900/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search zones…"
            className="
              w-full pl-9 pr-3 py-2.5 text-xs
              bg-slate-800/50 border border-slate-700/40
              text-white placeholder:text-slate-600
              rounded-xl outline-none
              focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20
              transition-all duration-200
            "
          />
        </div>
      </div>

      {/* Zone list */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        <p className="text-xs text-slate-600 px-1 mb-2">{filtered.length} zones</p>
        {filtered.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => onZoneClick(zone)}
              className={`
                w-full text-left p-3 rounded-xl border transition-all duration-200
                ${isSelected
                  ? 'bg-emerald-700/20 border-emerald-500/50'
                  : 'bg-slate-800/30 border-slate-700/20 hover:border-slate-600/40 hover:bg-slate-800/50'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white truncate">{zone.name}</span>
                <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <RiskBadge level={zone.heatRisk} type="heat" />
                <RiskBadge level={zone.floodRisk} type="flood" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Right detail panel ───────────────────────────────────────────────────────

interface RightPanelProps {
  zone: Neighbourhood;
  onClose: () => void;
  onViewAnalysis: () => void;
  onAddToPlan: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ zone, onClose, onViewAnalysis, onAddToPlan }) => {
  const intervention = INTERVENTIONS.find((i) => i.id === zone.recommendation);
  const explanation = INTERVENTION_EXPLANATIONS[zone.recommendation];

  return (
    <motion.div
      key={zone.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-80 flex-shrink-0 h-full overflow-y-auto bg-[#0a1a0f]/90 backdrop-blur-xl border-l border-emerald-900/30 flex flex-col z-10"
    >
      {/* Header */}
      <div className="p-4 border-b border-emerald-900/20">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <h2 className="text-base font-bold text-white leading-tight">{zone.name}</h2>
            </div>
            <p className="text-xs text-slate-500">Zone ID: {zone.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Risk badges */}
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium">Risk Assessment</p>
          <div className="flex flex-wrap gap-2">
            <RiskBadge level={zone.heatRisk} type="heat" />
            <RiskBadge level={zone.floodRisk} type="flood" />
          </div>
        </div>

        {/* Stats grid */}
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium">Zone Statistics</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Users className="w-3.5 h-3.5" />, label: 'Population', value: zone.population.toLocaleString() },
              { icon: <LayoutGrid className="w-3.5 h-3.5" />, label: 'Area', value: `${zone.area} km²` },
              { icon: <TreePine className="w-3.5 h-3.5" />, label: 'Vegetation', value: `${zone.vegetationCoverage}%` },
              { icon: <Leaf className="w-3.5 h-3.5" />, label: 'Available Land', value: `${zone.availableLand} ha` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3"
              >
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  {stat.icon}
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="text-sm font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Score bars */}
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium">Risk Scores</p>
          <div className="space-y-2.5">
            {[
              { label: 'Heat Score', value: zone.heatScore, color: '#EF4444' },
              { label: 'Flood Score', value: zone.floodScore, color: '#38BDF8' },
              { label: 'Pop. Exposure', value: zone.populationExposure, color: '#A78BFA' },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400">{bar.label}</span>
                  <span className="text-xs font-semibold" style={{ color: bar.color }}>
                    {bar.value}/100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: bar.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended intervention */}
        {intervention && (
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">Recommended Intervention</p>
            <div
              className="p-3 rounded-xl border"
              style={{
                backgroundColor: `${intervention.color}10`,
                borderColor: `${intervention.color}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{INTERVENTION_ICONS[zone.recommendation]}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{intervention.name}</p>
                  <p className="text-xs text-slate-400">{intervention.purpose}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { label: 'Heat ↓', value: `${intervention.heatReduction}%` },
                  { label: 'Flood ↓', value: `${intervention.floodReduction}%` },
                  { label: 'Green +', value: `${intervention.greenCoverageGain}%` },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-sm font-bold text-emerald-400">{m.value}</p>
                    <p className="text-xs text-slate-500">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Explanation */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <p className="text-xs text-slate-500 font-medium">Why this intervention?</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{explanation}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-emerald-900/20 space-y-2">
        <button
          onClick={onViewAnalysis}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors duration-200"
        >
          <Eye className="w-4 h-4" />
          View Full Analysis
        </button>
        <button
          onClick={onAddToPlan}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-600/40 hover:border-slate-500/60 transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          Add to Plan
        </button>
      </div>
    </motion.div>
  );
};

// ─── Legend overlay ───────────────────────────────────────────────────────────

interface LegendProps {
  primaryLayer: LayerKey;
}

const MapLegend: React.FC<LegendProps> = ({ primaryLayer }) => {
  const layer = LAYERS.find((l) => l.id === primaryLayer);
  if (!layer) return null;
  return (
    <div className="absolute bottom-6 left-4 z-[500] bg-[#0a1a0f]/90 backdrop-blur-md border border-emerald-900/30 rounded-xl p-3 shadow-xl">
      <div className="flex items-center gap-1.5 mb-2">
        {layer.icon}
        <p className="text-xs font-semibold text-slate-200">{layer.label}</p>
      </div>
      <div className="space-y-1.5">
        {layer.legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Popup content helper ─────────────────────────────────────────────────────

const PopupContent: React.FC<{ zone: Neighbourhood }> = ({ zone }) => {
  const intervention = INTERVENTIONS.find((i) => i.id === zone.recommendation);
  const riskColor = (level: 'low' | 'medium' | 'high', type: 'heat' | 'flood') =>
    level === 'high'
      ? type === 'heat' ? '#EF4444' : '#38BDF8'
      : level === 'medium' ? '#F59E0B' : '#10B981';

  return (
    <div
      style={{
        background: '#0a1a0f',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '12px',
        padding: '12px',
        minWidth: '200px',
        fontFamily: 'system-ui, sans-serif',
        color: '#f1f5f9',
      }}
    >
      <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>{zone.name}</p>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span style={{
          background: `${riskColor(zone.heatRisk, 'heat')}22`,
          color: riskColor(zone.heatRisk, 'heat'),
          border: `1px solid ${riskColor(zone.heatRisk, 'heat')}44`,
          borderRadius: '6px', padding: '2px 7px', fontSize: '11px', fontWeight: 600,
        }}>
          🌡️ Heat: {zone.heatRisk}
        </span>
        <span style={{
          background: `${riskColor(zone.floodRisk, 'flood')}22`,
          color: riskColor(zone.floodRisk, 'flood'),
          border: `1px solid ${riskColor(zone.floodRisk, 'flood')}44`,
          borderRadius: '6px', padding: '2px 7px', fontSize: '11px', fontWeight: 600,
        }}>
          💧 Flood: {zone.floodRisk}
        </span>
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.6 }}>
        <div>👥 Population: <strong style={{ color: '#e2e8f0' }}>{zone.population.toLocaleString()}</strong></div>
        <div>🌿 Vegetation: <strong style={{ color: '#e2e8f0' }}>{zone.vegetationCoverage}%</strong></div>
        {intervention && (
          <div>🏗️ Recommended: <strong style={{ color: '#10B981' }}>{INTERVENTION_ICONS[zone.recommendation]} {intervention.name}</strong></div>
        )}
        <div>📊 Pop. Exposure: <strong style={{ color: '#e2e8f0' }}>{zone.populationExposure}/100</strong></div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const DigitalTwinMap: React.FC = () => {
  const { selectedZone: selectedZoneId, setSelectedZone, setCurrentPage, addNotification } = useApp();

  const [activeLayers, setActiveLayers] = useState<Set<LayerKey>>(new Set(['heat']));
  const [primaryLayer, setPrimaryLayer] = useState<LayerKey>('heat');
  const [search, setSearch] = useState('');
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);

  const selectedZone = useMemo(
    () => NEIGHBOURHOODS.find((n) => n.id === selectedZoneId) ?? null,
    [selectedZoneId],
  );

  const handleLayerToggle = useCallback((id: LayerKey) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // If we're deactivating the primary layer, choose another or fallback to 'gi'
        if (primaryLayer === id) {
          const remaining = [...next];
          setPrimaryLayer(remaining[0] ?? 'gi');
        }
      } else {
        next.add(id);
        setPrimaryLayer(id);
      }
      return next;
    });
  }, [primaryLayer]);

  const handleZoneClick = useCallback((zone: Neighbourhood) => {
    setSelectedZone(zone.id);
    setFlyTarget({ lat: zone.lat, lng: zone.lng });
  }, [setSelectedZone]);

  const handleClose = useCallback(() => {
    setSelectedZone(null);
    setFlyTarget(null);
  }, [setSelectedZone]);

  const handleViewAnalysis = useCallback(() => {
    addNotification({
      type: 'info',
      title: 'Full Analysis',
      message: `Navigating to full analysis for ${selectedZone?.name ?? 'selected zone'}.`,
    });
    setCurrentPage('analysis');
  }, [addNotification, selectedZone, setCurrentPage]);

  const handleAddToPlan = useCallback(() => {
    if (!selectedZone) return;
    const intervention = INTERVENTIONS.find((i) => i.id === selectedZone.recommendation);
    addNotification({
      type: 'success',
      title: 'Added to Plan',
      message: `${selectedZone.name} — ${intervention?.name ?? 'intervention'} added to planning queue.`,
    });
  }, [addNotification, selectedZone]);

  return (
    <div className="flex h-screen bg-[#060E09] overflow-hidden relative">
      {/* Disclaimer overlay */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-[600] pointer-events-none"
        style={{ width: 'max-content', maxWidth: '90vw' }}
      >
        <div className="bg-amber-900/60 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-1.5">
          <p className="text-xs text-amber-400 font-medium text-center">
            ⚠️ Simulated zone boundaries — not verified geospatial data
          </p>
        </div>
      </div>

      {/* Left panel */}
      <LeftPanel
        activeLayers={activeLayers}
        primaryLayer={primaryLayer}
        onLayerToggle={handleLayerToggle}
        search={search}
        onSearch={setSearch}
        zones={NEIGHBOURHOODS}
        onZoneClick={handleZoneClick}
        selectedZoneId={selectedZoneId}
      />

      {/* Map container */}
      <div className="flex-1 relative">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={11}
          style={{ height: '100%', width: '100%', background: '#060E09' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          {/* Fly to zone on click */}
          {flyTarget && <FlyToZone lat={flyTarget.lat} lng={flyTarget.lng} />}

          {/* Zone markers */}
          {NEIGHBOURHOODS.map((zone) => {
            const color = getMarkerColor(zone, primaryLayer);
            const isSelected = selectedZoneId === zone.id;
            return (
              <CircleMarker
                key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={isSelected ? 24 : 20}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: isSelected ? 0.85 : 0.65,
                  color: isSelected ? '#ffffff' : color,
                  weight: isSelected ? 2.5 : 1.5,
                  opacity: 0.9,
                }}
                eventHandlers={{
                  click: () => handleZoneClick(zone),
                }}
              >
                <Popup
                  className="eco-popup"
                  closeButton={false}
                  offset={[0, -10]}
                >
                  <PopupContent zone={zone} />
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Map legend overlay */}
        <MapLegend primaryLayer={primaryLayer} />
      </div>

      {/* Right detail panel */}
      <AnimatePresence mode="wait">
        {selectedZone && (
          <RightPanel
            key={selectedZone.id}
            zone={selectedZone}
            onClose={handleClose}
            onViewAnalysis={handleViewAnalysis}
            onAddToPlan={handleAddToPlan}
          />
        )}
      </AnimatePresence>

      {/* Leaflet popup style overrides */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 12px !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-container {
          font-family: system-ui, sans-serif;
        }
        .leaflet-control-attribution {
          background: rgba(6, 14, 9, 0.85) !important;
          color: #64748b !important;
          border-radius: 6px 0 0 0 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #10b981 !important;
        }
      `}</style>
    </div>
  );
};

export default DigitalTwinMap;

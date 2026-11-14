import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Bell,
  Database,
  Download,
  RotateCcw,
  LogOut,
  Moon,
  Laptop,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NEIGHBOURHOODS, BUDGET_PRESETS, SUMMARY_STATS } from '../data/mockData';
import DemoBadge from '../components/ui/DemoBadge';

interface SettingsPageProps {
  onNavigate?: (page: string) => void;
}

export default function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { user, logout, budget, setBudget, addNotification } = useApp();

  // Notification toggles
  const [alerts, setAlerts] = useState({
    planning: true,
    hazards: true,
    budget: true,
    reports: false,
  });

  const [density, setDensity] = useState<'comfortable' | 'compact' | 'spacious'>('comfortable');
  const [showResetModal, setShowResetModal] = useState(false);

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
    addNotification({
      type: 'info',
      title: 'Preferences Updated',
      message: `Notification preferences saved to local profile cache.`,
    });
  };

  const handleDownloadDataset = () => {
    const headers = 'Zone_ID,Name,Heat_Risk,Flood_Risk,Heat_Score,Flood_Score,Population_Exposure,Vegetation_Coverage_Pct,Available_Land_Ha,Recommended_Intervention\n';
    const rows = NEIGHBOURHOODS.map(
      (n) =>
        `${n.id},"${n.name}",${n.heatRisk},${n.floodRisk},${n.heatScore},${n.floodScore},${n.populationExposure},${n.vegetationCoverage},${n.availableLand},${n.recommendation}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ECO-PULSE_AI_Bengaluru_Demo_Dataset.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      type: 'success',
      title: 'Dataset Exported',
      message: 'Downloaded complete 10-ward simulated geospatial dataset in CSV format.',
    });
  };

  const handleResetData = () => {
    setBudget(25);
    setShowResetModal(false);
    addNotification({
      type: 'success',
      title: 'Parameters Reset',
      message: 'All planning thresholds and baseline simulations reset to initial demonstration state.',
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald">
            <Settings className="w-6 h-6 text-emerald-bright" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
                System Settings & Platform Profile
              </h1>
              <DemoBadge verbose={true} />
            </div>
            <p className="text-text-secondary text-sm mt-0.5">
              Manage operator credentials, notification dispatch rules, dataset connections, and simulation controls.
            </p>
          </div>
        </div>
      </div>

      {/* Operator Profile Card */}
      <div className="glass-card p-6 border-emerald/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald to-forest flex items-center justify-center text-xl font-bold text-bg-primary shadow-emerald-glow border border-emerald/30">
              {user?.avatar || 'AS'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-text-primary">{user?.name || 'Arjun Sharma'}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-emerald">
                  {user?.role || 'Senior Urban Planner'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">{user?.email || 'demo@ecopulse.ai'}</p>
              <p className="text-[11px] text-emerald-bright mt-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald" /> Authenticated Municipal Planner Session
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              addNotification({
                type: 'info',
                title: 'Demo Constraint',
                message: 'Profile editing is locked in this hackathon demonstration instance.',
              })
            }
            className="btn-secondary text-xs py-2 px-4 self-start sm:self-auto"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Interface & Display Configuration */}
      <div className="glass-card p-6 border-emerald/15 space-y-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary flex items-center gap-2">
          <Moon className="w-4 h-4 text-emerald" /> Display & UI Density
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Theme */}
          <div className="p-4 rounded-xl bg-bg-primary/50 border border-emerald/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-text-primary block">Color Scheme</span>
              <span className="text-[11px] text-text-secondary">Climate-Tech Obsidian Dark (High Contrast)</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald/10 border border-emerald/20 text-emerald font-mono">
              Enforced Dark
            </span>
          </div>

          {/* Density */}
          <div className="p-4 rounded-xl bg-bg-primary/50 border border-emerald/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-text-primary block">Display Grid Density</span>
              <span className="text-[11px] text-text-secondary">Adjust UI spacing across cards</span>
            </div>
            <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-lg border border-white/5">
              {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`text-[11px] px-2 py-1 rounded capitalize font-medium transition-colors ${
                    density === d
                      ? 'bg-emerald text-bg-primary font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Automated Notifications Dispatch */}
      <div className="glass-card p-6 border-emerald/15 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald" /> Platform Alert Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'planning', label: 'Municipal Planning Workflow Alerts', desc: 'Notify on intervention additions & blueprint updates' },
            { key: 'hazards', label: 'Severe Climate Hazard Anomaly Triggers', desc: 'Broadcast simulated UHI spikes and flash-flood thresholds' },
            { key: 'budget', label: 'Budget Outlay Ceiling Warnings', desc: 'Alert when staged capex exceeds 90% of allocated reserves' },
            { key: 'reports', label: 'Automated Bi-Weekly Synthesis Reports', desc: 'Generate downloadable PDF digests for municipal council' },
          ].map((item) => {
            const isChecked = alerts[item.key as keyof typeof alerts];
            return (
              <div
                key={item.key}
                onClick={() => toggleAlert(item.key as keyof typeof alerts)}
                className="p-3 rounded-xl bg-bg-primary/50 border border-emerald/10 flex items-start justify-between gap-3 cursor-pointer hover:border-emerald/30 transition-all"
              >
                <div>
                  <span className="text-xs font-semibold text-text-primary block">{item.label}</span>
                  <span className="text-[11px] text-text-secondary mt-0.5 block">{item.desc}</span>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 mt-1 ${
                    isChecked ? 'bg-emerald' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      isChecked ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Source & Integrity Governance */}
      <div className="glass-card p-6 border-emerald/15 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald" /> Data Governance & Geospatial Lineage
          </h3>
          <span className="text-[11px] text-warning flex items-center gap-1 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" /> Synthetic Demo Environment
          </span>
        </div>

        <div className="p-4 rounded-xl bg-bg-primary/70 border border-emerald/15 space-y-3 text-xs leading-relaxed text-text-secondary">
          <p>
            <strong className="text-text-primary">Geographic Scope:</strong> Greater Bengaluru Metropolitan Region (BBMP), Karnataka, India. 10 strategic pilot wards mapped for heat island vulnerability and hydrological runoff retention.
          </p>
          <p>
            <strong className="text-text-primary">Sensor Lineage Notice:</strong> In this Level 2 hackathon demonstration, all sensor layers, land surface temperature anomalies, runoff coefficients, and population exposure densities are synthetic illustrative estimates. No live IoT telemetry or municipal API is connected.
          </p>
          <p>
            <strong className="text-text-primary">Last Benchmark Refresh:</strong> {SUMMARY_STATS.lastUpdated} · Projection Coordinate System: EPSG:4326 (WGS 84).
          </p>
        </div>

        {/* Demo Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadDataset}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-emerald" /> Download WGS84 CSV Dataset
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 rounded-lg bg-bg-primary border border-danger/30 text-danger text-xs font-semibold hover:bg-danger/10 flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Parameters
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-secondary">Global Budget Ceiling:</span>
            <span className="font-mono font-bold text-emerald-bright">₹{budget} Crores</span>
          </div>
        </div>
      </div>

      {/* About & Disclaimer */}
      <div className="p-6 rounded-xl bg-bg-secondary border border-white/5 space-y-2 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-text-primary">ECO-PULSE AI · v1.0.0-PROD</h4>
            <p className="text-xs text-text-secondary">
              PLAN SMARTER. INVEST BETTER. BUILD GREENER.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald px-2.5 py-1 rounded bg-emerald/10 border border-emerald/20 self-center sm:self-auto">
            Sustainability Hackathon Level 2
          </span>
        </div>
      </div>

      {/* Sign Out Banner */}
      <div className="pt-4 border-t border-emerald/10 flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          Terminating active session will return to the cinematic intro screen.
        </span>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg bg-danger/10 border border-danger/30 text-danger font-semibold text-xs hover:bg-danger/20 flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" /> End Planner Session
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card bg-bg-secondary p-6 max-w-md w-full border-danger/30 relative"
            >
              <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-danger" /> Confirm Simulation Parameter Reset
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Are you sure you wish to reset all customized budget thresholds, staged intervention blueprints, and filtering states back to default benchmark values?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetData}
                  className="px-4 py-2 rounded-lg bg-danger text-white font-semibold text-xs hover:bg-red-600 transition-colors"
                >
                  Reset Everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  AlertTriangle,
  Flame,
  Droplets,
  TreePine,
  ThumbsUp,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  Send,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { api, CitizenReport } from '../services/api';
import { useApp } from '../context/AppContext';
import DemoBadge from '../components/ui/DemoBadge';

interface CitizenReportsPageProps {
  onNavigate?: (page: string) => void;
}

export default function CitizenReportsPage({ onNavigate }: CitizenReportsPageProps) {
  const { addNotification, setSelectedZone } = useApp();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    zoneName: 'Whitefield',
    lat: 12.9698,
    lng: 77.7500,
    type: 'waterlogging',
    title: '',
    description: '',
    urgency: 'high',
    recommendedFix: '',
  });

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getCitizenReports();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpvote = async (reportId: string) => {
    try {
      const newVotes = await api.upvoteReport(reportId);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, upvotes: newVotes } : r))
      );
      addNotification({
        type: 'success',
        title: 'Priority Endorsement Registered',
        message: 'Your field verification upvote was added to municipal queue.',
      });
    } catch (e) {
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to backend server.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    setSubmitting(true);
    try {
      const created = await api.submitCitizenReport(formData);
      setReports((prev) => [created, ...prev]);
      setShowSubmitModal(false);
      setFormData({
        zoneName: 'Whitefield',
        lat: 12.9698,
        lng: 77.7500,
        type: 'waterlogging',
        title: '',
        description: '',
        urgency: 'high',
        recommendedFix: '',
      });
      addNotification({
        type: 'success',
        title: 'Field Observation Logged',
        message: 'Report logged with WGS84 coordinates and queued for GIS review.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to record report on backend API.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterUrgency !== 'all' && r.urgency !== filterUrgency) return false;
    return true;
  });

  const getHazardBadge = (type: string) => {
    switch (type) {
      case 'waterlogging':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Droplets className="w-3 h-3" /> Waterlogging & Ponding
          </span>
        );
      case 'heat_island':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-danger/10 text-danger border border-danger/20">
            <Flame className="w-3 h-3" /> Microclimate Thermal Hotspot
          </span>
        );
      case 'barren_setback':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning/10 text-warning border border-warning/20">
            <TreePine className="w-3 h-3" /> Barren Pervious Opportunity
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald/10 text-emerald border border-emerald/20">
            <AlertTriangle className="w-3 h-3" /> Climate Observation
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === 'critical') {
      return (
        <span className="text-[10px] font-mono uppercase font-bold text-danger px-2 py-0.5 rounded bg-danger/10 border border-danger/20">
          Critical
        </span>
      );
    }
    if (urgency === 'high') {
      return (
        <span className="text-[10px] font-mono uppercase font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
          High
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono uppercase font-bold text-emerald px-2 py-0.5 rounded bg-emerald/10 border border-emerald/20">
        Medium
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald">
            <MapPin className="w-6 h-6 text-emerald-bright" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
                Ground-Truth Field Intelligence
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                Crowdsourced & Field Officer Telemetry
              </span>
            </div>
            <p className="text-text-secondary text-sm mt-0.5">
              Community and municipal field observations validating localized thermal distress, street waterlogging, and canopy planting opportunities.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="btn-primary flex items-center gap-2 self-start md:self-auto text-xs py-2.5 px-4"
        >
          <Plus className="w-4 h-4" /> Log Field Observation
        </button>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-secondary font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald" /> Hazard:
          </span>
          {[
            { id: 'all', label: 'All Hazards' },
            { id: 'waterlogging', label: 'Waterlogging' },
            { id: 'heat_island', label: 'Thermal Hotspots' },
            { id: 'barren_setback', label: 'Barren Medians' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === cat.id
                  ? 'bg-emerald text-bg-primary font-semibold shadow-emerald-glow'
                  : 'bg-bg-primary text-text-secondary hover:text-text-primary border border-emerald/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Severity:</span>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="bg-bg-primary border border-emerald/20 text-xs text-text-primary rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Urgency</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Priority</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Loader2 className="w-8 h-8 text-emerald animate-spin mb-3" />
          <p className="text-xs text-text-secondary">Retrieving field telemetry from backend server...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="glass-card p-12 text-center text-text-secondary">
          <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-sm font-semibold text-text-primary">No reports match the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-hover p-6 border-emerald/15 hover:border-emerald/40 flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {getHazardBadge(report.type)}
                      {getUrgencyBadge(report.urgency)}
                    </div>
                    <h3 className="text-base font-bold text-text-primary leading-tight">
                      {report.title}
                    </h3>
                  </div>

                  {/* Status */}
                  <span className="text-[10px] font-mono text-emerald flex items-center gap-1 bg-emerald/10 px-2 py-0.5 rounded border border-emerald/20 flex-shrink-0">
                    <ShieldCheck className="w-3 h-3" /> {report.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Ward & GPS Location */}
                <div className="flex items-center gap-3 text-xs text-text-secondary mb-3 pb-3 border-b border-white/5">
                  <span className="flex items-center gap-1 text-emerald font-medium">
                    <MapPin className="w-3.5 h-3.5" /> {report.zoneName}
                  </span>
                  <span className="font-mono text-[11px] text-text-secondary/70">
                    GPS: {report.lat.toFixed(4)}°N, {report.lng.toFixed(4)}°E
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {report.description}
                </p>

                {/* Recommended Fix */}
                {report.recommendedFix && (
                  <div className="p-2.5 rounded-lg bg-bg-primary/60 border border-emerald/15 text-xs mb-4">
                    <span className="text-[10px] uppercase font-semibold text-emerald tracking-wider block mb-0.5">
                      Field Inspector Recommended Intervention
                    </span>
                    <span className="text-text-primary font-medium">{report.recommendedFix}</span>
                  </div>
                )}
              </div>

              {/* Bottom bar with Upvotes and View on Map */}
              <div className="pt-3 border-t border-emerald/10 flex items-center justify-between">
                <button
                  onClick={() => handleUpvote(report.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-bg-primary border border-emerald/20 text-emerald-bright hover:bg-emerald/10 hover:border-emerald/40 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald" />
                  <span className="font-bold font-mono">{report.upvotes}</span>
                  <span className="text-text-secondary">Community Endorsements</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('map');
                  }}
                  className="text-xs text-emerald hover:text-emerald-bright font-medium flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View on Digital Twin
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Submit Observation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card bg-bg-secondary p-6 md:p-8 max-w-lg w-full border-emerald/30 relative"
            >
              <button
                onClick={() => setShowSubmitModal(false)}
                className="absolute top-5 right-5 p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald" /> Log Field Ground Observation
              </h2>
              <p className="text-xs text-text-secondary mb-5">
                Record geotagged climate hazards or open setback opportunities into municipal database.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-text-secondary font-medium block mb-1">
                    Neighbourhood / Ward
                  </label>
                  <select
                    value={formData.zoneName}
                    onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                    className="w-full bg-bg-primary border border-emerald/20 text-xs text-text-primary rounded-lg px-3 py-2 focus:outline-none focus:border-emerald"
                  >
                    <option value="Whitefield">Whitefield (Zone A)</option>
                    <option value="Koramangala">Koramangala (Zone B)</option>
                    <option value="Jayanagar">Jayanagar (Zone C)</option>
                    <option value="Indiranagar">Indiranagar (Zone D)</option>
                    <option value="Bellandur">Bellandur (Zone E)</option>
                    <option value="Rajajinagar">Rajajinagar (Zone F)</option>
                    <option value="Hebbal">Hebbal (Zone G)</option>
                    <option value="Marathahalli">Marathahalli (Zone H)</option>
                    <option value="BTM Layout">BTM Layout (Zone I)</option>
                    <option value="Yelahanka">Yelahanka (Zone J)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-secondary font-medium block mb-1">
                      Hazard Category
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-bg-primary border border-emerald/20 text-xs text-text-primary rounded-lg px-3 py-2 focus:outline-none focus:border-emerald"
                    >
                      <option value="waterlogging">Waterlogging & Runoff</option>
                      <option value="heat_island">Thermal Hotspot (Heat)</option>
                      <option value="barren_setback">Barren Setback Opportunity</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-text-secondary font-medium block mb-1">
                      Severity Urgency
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="w-full bg-bg-primary border border-emerald/20 text-xs text-text-primary rounded-lg px-3 py-2 focus:outline-none focus:border-emerald"
                    >
                      <option value="critical">Critical (Immediate Hazard)</option>
                      <option value="high">High Severity</option>
                      <option value="medium">Medium Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-secondary font-medium block mb-1">
                    Observation Headline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Severe waterlogging at junction with 1.5ft standing water"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-bg-primary border border-emerald/20 text-xs text-text-primary rounded-lg px-3 py-2 focus:outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="text-xs text-text-secondary font-medium block mb-1">
                    Detailed Field Notes
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe surface conditions, pavement type, catchment area, and time of peak distress..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-bg-primary border border-emerald/20 text-xs text-text-primary rounded-lg px-3 py-2 focus:outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="text-xs text-text-secondary font-medium block mb-1">
                    Proposed Green Infrastructure Fix (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Bioswale + Permeable Pavers"
                    value={formData.recommendedFix}
                    onChange={(e) => setFormData({ ...formData, recommendedFix: e.target.value })}
                    className="w-full bg-bg-primary border border-emerald/20 text-xs text-text-primary rounded-lg px-3 py-2 focus:outline-none focus:border-emerald"
                  />
                </div>

                <div className="pt-3 border-t border-emerald/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Submit for GIS Verification
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

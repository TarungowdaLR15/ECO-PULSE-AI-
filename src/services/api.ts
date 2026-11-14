// ECO-PULSE AI - Backend API Client Service

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  zonesCount: number;
  dataset: string;
  mcdaModel: string;
}

export interface CitizenReport {
  id: string;
  zoneId: string;
  zoneName: string;
  lat: number;
  lng: number;
  type: 'waterlogging' | 'heat_island' | 'barren_setback' | string;
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  upvotes: number;
  status: string;
  timestamp: string;
  recommendedFix?: string;
}

export interface CopilotResponse {
  success: boolean;
  query: string;
  response: string;
  suggestedChips: string[];
}

export const api = {
  // Check health and ping latency
  async checkHealth(): Promise<{ healthy: boolean; latencyMs: number; data?: HealthStatus }> {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        return { healthy: true, latencyMs, data };
      }
      return { healthy: false, latencyMs: 0 };
    } catch (e) {
      return { healthy: false, latencyMs: 0 };
    }
  },

  // Query AI Copilot
  async queryCopilot(query: string, zoneId?: string, budgetCrores?: number): Promise<CopilotResponse> {
    const res = await fetch(`${API_BASE_URL}/api/ai/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, zoneId, budgetCrores }),
    });
    if (!res.ok) {
      throw new Error(`Copilot request failed: ${res.statusText}`);
    }
    return res.json();
  },

  // Get crowdsourced citizen hazard reports
  async getCitizenReports(): Promise<CitizenReport[]> {
    const res = await fetch(`${API_BASE_URL}/api/citizen-reports`);
    if (!res.ok) throw new Error('Failed to load citizen reports');
    const json = await res.json();
    return json.reports;
  },

  // Submit a new citizen observation
  async submitCitizenReport(report: {
    zoneName: string;
    lat: number;
    lng: number;
    type: string;
    title: string;
    description: string;
    urgency: string;
    recommendedFix?: string;
  }): Promise<CitizenReport> {
    const res = await fetch(`${API_BASE_URL}/api/citizen-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (!res.ok) throw new Error('Submission failed');
    const json = await res.json();
    return json.report;
  },

  // Upvote report
  async upvoteReport(reportId: string): Promise<number> {
    const res = await fetch(`${API_BASE_URL}/api/citizen-reports/${reportId}/upvote`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Upvote failed');
    const json = await res.json();
    return json.upvotes;
  },

  // Recompute MCDA scores dynamically
  async computeMCDAScores(weights: {
    heatWeight: number;
    floodWeight: number;
    populationWeight: number;
    landWeight: number;
    costWeight: number;
  }) {
    const res = await fetch(`${API_BASE_URL}/api/recommendations/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
    });
    if (!res.ok) throw new Error('MCDA score calculation failed');
    return res.json();
  },

  // Optimize budget
  async optimizeBudget(totalBudgetCrores: number, priorityMode: string, allowedInterventions?: string[]) {
    const res = await fetch(`${API_BASE_URL}/api/budget/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalBudgetCrores,
        priorityMode,
        allowedInterventions,
      }),
    });
    if (!res.ok) throw new Error('Optimization solver failed');
    return res.json();
  },

  // Download RFC 7946 GeoJSON FeatureCollection
  downloadGeoJSON() {
    window.open(`${API_BASE_URL}/api/export/geojson`, '_blank');
  },
};

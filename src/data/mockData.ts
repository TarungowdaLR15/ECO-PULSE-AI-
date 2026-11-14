// ECO-PULSE AI — Mock Data Layer
// All data is simulated for demonstration purposes.
// Labels indicate demo/illustrative nature throughout.

export interface Neighbourhood {
  id: string;
  name: string;
  lat: number;
  lng: number;
  heatRisk: 'low' | 'medium' | 'high';
  floodRisk: 'low' | 'medium' | 'high';
  heatScore: number; // 0-100
  floodScore: number; // 0-100
  populationExposure: number; // 0-100
  vegetationCoverage: number; // % 0-100
  availableLand: number; // hectares (illustrative)
  recommendation: InterventionType;
  recommendationScore: number; // 0-100
  area: number; // sq km (illustrative)
  population: number; // illustrative
  impervious: number; // % impervious surface (illustrative)
}

export type InterventionType =
  | 'urban-trees'
  | 'rain-garden'
  | 'permeable-pavement'
  | 'green-roof'
  | 'urban-pond';

export interface Intervention {
  id: InterventionType;
  name: string;
  emoji: string;
  purpose: string;
  suitableFor: string;
  benefits: string[];
  installation: string;
  maintenance: string;
  costPerUnit: number; // INR lakhs (illustrative)
  unit: string;
  heatReduction: number; // % estimated
  floodReduction: number; // % estimated
  greenCoverageGain: number; // % estimated
  color: string;
}

export interface ScenarioData {
  id: string;
  name: string;
  description: string;
  heatChange: number; // % change
  floodChange: number; // % change
  coverageChange: number; // % points change
  cost: number; // INR crores (illustrative)
  co2Reduction: number; // tonnes/year (illustrative)
  interventions: InterventionType[];
}

// ---- NEIGHBOURHOOD DATA (Bengaluru zones — SIMULATED, NOT real measurements) ----
export const NEIGHBOURHOODS: Neighbourhood[] = [
  {
    id: 'zone-a',
    name: 'Whitefield',
    lat: 12.9698,
    lng: 77.7500,
    heatRisk: 'high',
    floodRisk: 'medium',
    heatScore: 82,
    floodScore: 55,
    populationExposure: 88,
    vegetationCoverage: 12,
    availableLand: 18.4,
    recommendation: 'urban-trees',
    recommendationScore: 91,
    area: 25.3,
    population: 142000,
    impervious: 74,
  },
  {
    id: 'zone-b',
    name: 'Koramangala',
    lat: 12.9352,
    lng: 77.6245,
    heatRisk: 'high',
    floodRisk: 'high',
    heatScore: 78,
    floodScore: 81,
    populationExposure: 92,
    vegetationCoverage: 8,
    availableLand: 6.2,
    recommendation: 'rain-garden',
    recommendationScore: 87,
    area: 12.1,
    population: 98000,
    impervious: 82,
  },
  {
    id: 'zone-c',
    name: 'Jayanagar',
    lat: 12.9250,
    lng: 77.5938,
    heatRisk: 'medium',
    floodRisk: 'high',
    heatScore: 61,
    floodScore: 77,
    populationExposure: 75,
    vegetationCoverage: 22,
    availableLand: 9.8,
    recommendation: 'permeable-pavement',
    recommendationScore: 83,
    area: 15.7,
    population: 112000,
    impervious: 68,
  },
  {
    id: 'zone-d',
    name: 'Indiranagar',
    lat: 12.9784,
    lng: 77.6408,
    heatRisk: 'high',
    floodRisk: 'medium',
    heatScore: 75,
    floodScore: 58,
    populationExposure: 85,
    vegetationCoverage: 15,
    availableLand: 7.5,
    recommendation: 'green-roof',
    recommendationScore: 79,
    area: 10.2,
    population: 78000,
    impervious: 79,
  },
  {
    id: 'zone-e',
    name: 'Bellandur',
    lat: 12.9257,
    lng: 77.6761,
    heatRisk: 'medium',
    floodRisk: 'high',
    heatScore: 59,
    floodScore: 88,
    populationExposure: 68,
    vegetationCoverage: 18,
    availableLand: 24.1,
    recommendation: 'urban-pond',
    recommendationScore: 92,
    area: 32.4,
    population: 65000,
    impervious: 55,
  },
  {
    id: 'zone-f',
    name: 'Rajajinagar',
    lat: 12.9908,
    lng: 77.5553,
    heatRisk: 'high',
    floodRisk: 'medium',
    heatScore: 80,
    floodScore: 52,
    populationExposure: 90,
    vegetationCoverage: 10,
    availableLand: 8.3,
    recommendation: 'urban-trees',
    recommendationScore: 85,
    area: 11.5,
    population: 125000,
    impervious: 77,
  },
  {
    id: 'zone-g',
    name: 'Hebbal',
    lat: 13.0358,
    lng: 77.5970,
    heatRisk: 'medium',
    floodRisk: 'medium',
    heatScore: 65,
    floodScore: 60,
    populationExposure: 72,
    vegetationCoverage: 28,
    availableLand: 15.6,
    recommendation: 'urban-trees',
    recommendationScore: 74,
    area: 18.9,
    population: 89000,
    impervious: 60,
  },
  {
    id: 'zone-h',
    name: 'Marathahalli',
    lat: 12.9591,
    lng: 77.6974,
    heatRisk: 'high',
    floodRisk: 'high',
    heatScore: 84,
    floodScore: 79,
    populationExposure: 86,
    vegetationCoverage: 9,
    availableLand: 11.2,
    recommendation: 'rain-garden',
    recommendationScore: 89,
    area: 16.3,
    population: 108000,
    impervious: 81,
  },
  {
    id: 'zone-i',
    name: 'BTM Layout',
    lat: 12.9166,
    lng: 77.6101,
    heatRisk: 'medium',
    floodRisk: 'high',
    heatScore: 63,
    floodScore: 83,
    populationExposure: 79,
    vegetationCoverage: 14,
    availableLand: 5.4,
    recommendation: 'permeable-pavement',
    recommendationScore: 81,
    area: 8.7,
    population: 95000,
    impervious: 72,
  },
  {
    id: 'zone-j',
    name: 'Yelahanka',
    lat: 13.1004,
    lng: 77.5963,
    heatRisk: 'low',
    floodRisk: 'low',
    heatScore: 38,
    floodScore: 35,
    populationExposure: 55,
    vegetationCoverage: 42,
    availableLand: 32.7,
    recommendation: 'urban-trees',
    recommendationScore: 62,
    area: 45.2,
    population: 72000,
    impervious: 38,
  },
];

// ---- INTERVENTIONS ----
export const INTERVENTIONS: Intervention[] = [
  {
    id: 'urban-trees',
    name: 'Urban Trees',
    emoji: '🌳',
    purpose: 'Heat island mitigation and air quality improvement',
    suitableFor: 'Streets, parks, open areas with available soil depth',
    benefits: [
      'Reduces local temperature by 2–5°C (illustrative estimate)',
      'Improves air quality and captures particulates',
      'Provides shade for pedestrians and buildings',
      'Supports urban biodiversity',
      'Carbon sequestration over lifecycle',
    ],
    installation: 'Requires adequate soil volume, irrigation during establishment, and species selection appropriate to urban conditions.',
    maintenance: 'Pruning, monitoring for pests/disease, watering during dry seasons. Medium ongoing requirement.',
    costPerUnit: 0.08,
    unit: 'per tree (illustrative)',
    heatReduction: 18,
    floodReduction: 8,
    greenCoverageGain: 15,
    color: '#10B981',
  },
  {
    id: 'rain-garden',
    name: 'Rain Gardens',
    emoji: '🌿',
    purpose: 'Stormwater management and runoff reduction',
    suitableFor: 'Low-lying areas, roadsides, parking lots with moderate slopes',
    benefits: [
      'Absorbs and filters stormwater runoff (illustrative estimate: 60–80% reduction)',
      'Recharges groundwater',
      'Reduces combined sewer overflows',
      'Provides habitat for pollinators',
      'Improves local aesthetics',
    ],
    installation: 'Requires grading, amended soil mix, native plantings, and overflow provisions. Skilled installation needed.',
    maintenance: 'Weeding, mulching, plant establishment care. Lower ongoing cost once established.',
    costPerUnit: 1.2,
    unit: 'per 100 sq m (illustrative)',
    heatReduction: 8,
    floodReduction: 32,
    greenCoverageGain: 10,
    color: '#34D399',
  },
  {
    id: 'permeable-pavement',
    name: 'Permeable Pavement',
    emoji: '🏗️',
    purpose: 'Runoff reduction in high-impervious areas',
    suitableFor: 'Parking areas, low-traffic roads, footpaths',
    benefits: [
      'Allows stormwater infiltration (illustrative estimate: 50–90%)',
      'Reduces urban heat island through evaporative cooling',
      'Improves groundwater recharge',
      'Durable with low visible maintenance',
    ],
    installation: 'Requires sub-base preparation, appropriate pavement material selection, and drainage design. Higher initial cost.',
    maintenance: 'Periodic vacuuming to prevent clogging. Generally low maintenance once installed.',
    costPerUnit: 3.5,
    unit: 'per 100 sq m (illustrative)',
    heatReduction: 12,
    floodReduction: 28,
    greenCoverageGain: 3,
    color: '#F59E0B',
  },
  {
    id: 'green-roof',
    name: 'Green Roofs',
    emoji: '🏠',
    purpose: 'Building energy reduction and stormwater retention',
    suitableFor: 'Flat or low-slope rooftops with adequate structural capacity',
    benefits: [
      'Reduces building cooling load (illustrative estimate: 15–25%)',
      'Retains stormwater on site',
      'Extends roof lifespan',
      'Creates urban habitat',
      'Improves air quality locally',
    ],
    installation: 'Requires structural assessment, waterproofing membrane, growing medium, and plant selection. High initial cost.',
    maintenance: 'Irrigation, fertilisation, plant replacement. Moderate ongoing requirement.',
    costPerUnit: 8.5,
    unit: 'per 100 sq m (illustrative)',
    heatReduction: 15,
    floodReduction: 20,
    greenCoverageGain: 8,
    color: '#6EE7B7',
  },
  {
    id: 'urban-pond',
    name: 'Urban Ponds / Wetlands',
    emoji: '💧',
    purpose: 'Large-scale flood attenuation and biodiversity',
    suitableFor: 'Open spaces, former quarries, low-lying land with catchment area',
    benefits: [
      'Significant flood attenuation capacity',
      'Groundwater recharge',
      'High biodiversity value',
      'Community amenity and recreation',
      'Cooling effect on surrounding areas',
    ],
    installation: 'Requires extensive earthworks, liner or clay base, aquatic planting, and inlet/outlet structures. Highest cost.',
    maintenance: 'Sediment management, aquatic weed control, water quality monitoring. Moderate to high ongoing cost.',
    costPerUnit: 45.0,
    unit: 'per pond system (illustrative)',
    heatReduction: 10,
    floodReduction: 45,
    greenCoverageGain: 20,
    color: '#38BDF8',
  },
];

// ---- SCENARIOS ----
export const SCENARIOS: ScenarioData[] = [
  {
    id: 'baseline',
    name: 'Current Baseline',
    description: 'Existing conditions with no additional green infrastructure investment.',
    heatChange: 0,
    floodChange: 0,
    coverageChange: 0,
    cost: 0,
    co2Reduction: 0,
    interventions: [],
  },
  {
    id: 'trees',
    name: 'Urban Tree Plantation',
    description: 'Strategic planting of 10,000 trees across high-heat zones.',
    heatChange: -15,
    floodChange: -5,
    coverageChange: 8,
    cost: 8.5,
    co2Reduction: 1200,
    interventions: ['urban-trees'],
  },
  {
    id: 'rain-gardens',
    name: 'Rain Garden Network',
    description: 'Installation of rain gardens at 25 stormwater hotspots.',
    heatChange: -6,
    floodChange: -28,
    coverageChange: 5,
    cost: 12.0,
    co2Reduction: 450,
    interventions: ['rain-garden'],
  },
  {
    id: 'permeable',
    name: 'Permeable Surface Retrofit',
    description: 'Replacement of 30% of parking and low-traffic roads with permeable pavement.',
    heatChange: -10,
    floodChange: -22,
    coverageChange: 2,
    cost: 35.0,
    co2Reduction: 300,
    interventions: ['permeable-pavement'],
  },
  {
    id: 'combined',
    name: 'Combined Green Infrastructure',
    description: 'Multi-intervention strategy: trees + rain gardens + permeable surfaces + green roofs.',
    heatChange: -28,
    floodChange: -45,
    coverageChange: 18,
    cost: 68.5,
    co2Reduction: 3200,
    interventions: ['urban-trees', 'rain-garden', 'permeable-pavement', 'green-roof'],
  },
];

// ---- SUMMARY STATS ----
export const SUMMARY_STATS = {
  areasAnalysed: 10,
  highHeatRisk: 5,
  highFloodRisk: 4,
  avgGreenCoverage: 18, // % (illustrative)
  totalPopulationExposed: 984000, // illustrative
  dataSource: 'Simulated demonstration dataset — Bengaluru, Karnataka',
  lastUpdated: '2026-11-14',
  disclaimer: 'All values are illustrative estimates generated for demonstration purposes and do not represent verified municipal measurements.',
};

// ---- CLIMATE CHART DATA ----
export const MONTHLY_HEAT_DATA = [
  { month: 'Jan', avgTemp: 23, heatIndex: 28 },
  { month: 'Feb', avgTemp: 25, heatIndex: 32 },
  { month: 'Mar', avgTemp: 29, heatIndex: 38 },
  { month: 'Apr', avgTemp: 31, heatIndex: 42 },
  { month: 'May', avgTemp: 30, heatIndex: 40 },
  { month: 'Jun', avgTemp: 26, heatIndex: 33 },
  { month: 'Jul', avgTemp: 24, heatIndex: 29 },
  { month: 'Aug', avgTemp: 24, heatIndex: 29 },
  { month: 'Sep', avgTemp: 25, heatIndex: 31 },
  { month: 'Oct', avgTemp: 25, heatIndex: 30 },
  { month: 'Nov', avgTemp: 23, heatIndex: 27 },
  { month: 'Dec', avgTemp: 22, heatIndex: 26 },
];

export const RISK_DISTRIBUTION = [
  { name: 'High Heat & Flood', value: 3, color: '#EF4444' },
  { name: 'High Heat Only', value: 2, color: '#F59E0B' },
  { name: 'High Flood Only', value: 2, color: '#38BDF8' },
  { name: 'Moderate Risk', value: 2, color: '#10B981' },
  { name: 'Low Risk', value: 1, color: '#34D399' },
];

export const INTERVENTION_DISTRIBUTION = [
  { name: 'Urban Trees', value: 3, color: '#10B981' },
  { name: 'Rain Gardens', value: 2, color: '#34D399' },
  { name: 'Permeable Pavement', value: 2, color: '#F59E0B' },
  { name: 'Green Roofs', value: 1, color: '#6EE7B7' },
  { name: 'Urban Ponds', value: 1, color: '#38BDF8' },
];

export const BUDGET_PRESETS = [
  { label: '₹10 Crores', value: 10 },
  { label: '₹25 Crores', value: 25 },
  { label: '₹50 Crores', value: 50 },
  { label: '₹100 Crores', value: 100 },
];

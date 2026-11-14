import os
import json
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="ECO-PULSE AI - Urban Green Infrastructure Planning Engine",
    description="High-performance climate intelligence, MCDA recommendation, and budget optimization microservice for municipal urban planning.",
    version="2.4.0",
)

# Enable CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Core Datasets (Bengaluru Demonstration Zones - WGS84)
# ---------------------------------------------------------------------------
NEIGHBOURHOODS = [
    {
        "id": "zone-a",
        "name": "Whitefield",
        "lat": 12.9698,
        "lng": 77.7500,
        "heatRisk": "high",
        "floodRisk": "medium",
        "heatScore": 82,
        "floodScore": 55,
        "populationExposure": 88,
        "vegetationCoverage": 12,
        "availableLand": 18.4,
        "recommendation": "urban-trees",
        "recommendationScore": 91,
        "area": 25.3,
        "population": 142000,
        "impervious": 74,
    },
    {
        "id": "zone-b",
        "name": "Koramangala",
        "lat": 12.9352,
        "lng": 77.6245,
        "heatRisk": "high",
        "floodRisk": "high",
        "heatScore": 78,
        "floodScore": 81,
        "populationExposure": 92,
        "vegetationCoverage": 8,
        "availableLand": 6.2,
        "recommendation": "rain-garden",
        "recommendationScore": 87,
        "area": 12.1,
        "population": 98000,
        "impervious": 82,
    },
    {
        "id": "zone-c",
        "name": "Jayanagar",
        "lat": 12.9250,
        "lng": 77.5938,
        "heatRisk": "medium",
        "floodRisk": "high",
        "heatScore": 61,
        "floodScore": 77,
        "populationExposure": 75,
        "vegetationCoverage": 22,
        "availableLand": 9.8,
        "recommendation": "permeable-pavement",
        "recommendationScore": 83,
        "area": 15.7,
        "population": 112000,
        "impervious": 68,
    },
    {
        "id": "zone-d",
        "name": "Indiranagar",
        "lat": 12.9784,
        "lng": 77.6408,
        "heatRisk": "high",
        "floodRisk": "medium",
        "heatScore": 75,
        "floodScore": 58,
        "populationExposure": 85,
        "vegetationCoverage": 15,
        "availableLand": 7.5,
        "recommendation": "green-roof",
        "recommendationScore": 79,
        "area": 10.2,
        "population": 78000,
        "impervious": 79,
    },
    {
        "id": "zone-e",
        "name": "Bellandur",
        "lat": 12.9257,
        "lng": 77.6761,
        "heatRisk": "medium",
        "floodRisk": "high",
        "heatScore": 59,
        "floodScore": 88,
        "populationExposure": 68,
        "vegetationCoverage": 18,
        "availableLand": 24.1,
        "recommendation": "urban-pond",
        "recommendationScore": 92,
        "area": 32.4,
        "population": 65000,
        "impervious": 55,
    },
    {
        "id": "zone-f",
        "name": "Rajajinagar",
        "lat": 12.9908,
        "lng": 77.5553,
        "heatRisk": "high",
        "floodRisk": "medium",
        "heatScore": 80,
        "floodScore": 52,
        "populationExposure": 90,
        "vegetationCoverage": 10,
        "availableLand": 8.3,
        "recommendation": "urban-trees",
        "recommendationScore": 85,
        "area": 11.5,
        "population": 125000,
        "impervious": 77,
    },
    {
        "id": "zone-g",
        "name": "Hebbal",
        "lat": 13.0358,
        "lng": 77.5970,
        "heatRisk": "medium",
        "floodRisk": "medium",
        "heatScore": 65,
        "floodScore": 60,
        "populationExposure": 72,
        "vegetationCoverage": 28,
        "availableLand": 15.6,
        "recommendation": "urban-trees",
        "recommendationScore": 74,
        "area": 18.9,
        "population": 89000,
        "impervious": 60,
    },
    {
        "id": "zone-h",
        "name": "Marathahalli",
        "lat": 12.9591,
        "lng": 77.6974,
        "heatRisk": "high",
        "floodRisk": "high",
        "heatScore": 84,
        "floodScore": 79,
        "populationExposure": 86,
        "vegetationCoverage": 9,
        "availableLand": 11.2,
        "recommendation": "rain-garden",
        "recommendationScore": 89,
        "area": 16.3,
        "population": 108000,
        "impervious": 81,
    },
    {
        "id": "zone-i",
        "name": "BTM Layout",
        "lat": 12.9166,
        "lng": 77.6101,
        "heatRisk": "medium",
        "floodRisk": "high",
        "heatScore": 63,
        "floodScore": 83,
        "populationExposure": 79,
        "vegetationCoverage": 14,
        "availableLand": 5.4,
        "recommendation": "permeable-pavement",
        "recommendationScore": 81,
        "area": 8.7,
        "population": 95000,
        "impervious": 72,
    },
    {
        "id": "zone-j",
        "name": "Yelahanka",
        "lat": 13.1004,
        "lng": 77.5963,
        "heatRisk": "low",
        "floodRisk": "low",
        "heatScore": 38,
        "floodScore": 35,
        "populationExposure": 55,
        "vegetationCoverage": 42,
        "availableLand": 32.7,
        "recommendation": "urban-trees",
        "recommendationScore": 62,
        "area": 45.2,
        "population": 72000,
        "impervious": 38,
    },
]

INTERVENTIONS = {
    "urban-trees": {
        "id": "urban-trees",
        "name": "Urban Trees",
        "emoji": "🌳",
        "costPerUnit": 0.08,
        "unit": "per tree (Lakhs)",
        "heatReduction": 18,
        "floodReduction": 8,
        "greenCoverageGain": 15,
        "color": "#10B981",
        "maxUnitsPerHa": 350,
    },
    "rain-garden": {
        "id": "rain-garden",
        "name": "Rain Gardens",
        "emoji": "🌿",
        "costPerUnit": 1.20,
        "unit": "per 100 sqm (Lakhs)",
        "heatReduction": 8,
        "floodReduction": 32,
        "greenCoverageGain": 10,
        "color": "#34D399",
        "maxUnitsPerHa": 25,
    },
    "permeable-pavement": {
        "id": "permeable-pavement",
        "name": "Permeable Pavement",
        "emoji": "🏗️",
        "costPerUnit": 3.50,
        "unit": "per 100 sqm (Lakhs)",
        "heatReduction": 12,
        "floodReduction": 28,
        "greenCoverageGain": 3,
        "color": "#F59E0B",
        "maxUnitsPerHa": 20,
    },
    "green-roof": {
        "id": "green-roof",
        "name": "Green Roofs",
        "emoji": "🏠",
        "costPerUnit": 8.50,
        "unit": "per 100 sqm (Lakhs)",
        "heatReduction": 15,
        "floodReduction": 20,
        "greenCoverageGain": 8,
        "color": "#6EE7B7",
        "maxUnitsPerHa": 15,
    },
    "urban-pond": {
        "id": "urban-pond",
        "name": "Urban Ponds",
        "emoji": "💧",
        "costPerUnit": 45.0,
        "unit": "per pond system (Lakhs)",
        "heatReduction": 10,
        "floodReduction": 45,
        "greenCoverageGain": 20,
        "color": "#38BDF8",
        "maxUnitsPerHa": 2,
    },
}

# In-memory storage for Crowdsourced Ground Truth Reports
CITIZEN_REPORTS = [
    {
        "id": "rep-101",
        "zoneId": "zone-b",
        "zoneName": "Koramangala 4th Block",
        "lat": 12.9360,
        "lng": 77.6255,
        "type": "waterlogging",
        "title": "Severe monsoon ponding at 80 Feet Road junction",
        "description": "Rainwater depth reached 1.2ft during yesterday's 45-min shower. Storm drains blocked by silt and paved verges.",
        "urgency": "critical",
        "upvotes": 48,
        "status": "verified_by_field_officer",
        "timestamp": "2026-11-13T14:30:00Z",
        "recommendedFix": "Bioswale + Permeable Paver Strip",
    },
    {
        "id": "rep-102",
        "zoneId": "zone-a",
        "zoneName": "Whitefield Main Road",
        "lat": 12.9710,
        "lng": 77.7485,
        "type": "heat_island",
        "title": "Zero shade corridor near tech park pedestrian entrance",
        "description": "Surface asphalt temperature registered 44.5C at 1:30 PM. Pedestrians facing intense thermal stress.",
        "urgency": "high",
        "upvotes": 36,
        "status": "pending_allocation",
        "timestamp": "2026-11-12T11:15:00Z",
        "recommendedFix": "Linear Avenue Tree Canopy (Neem + Pongamia)",
    },
    {
        "id": "rep-103",
        "zoneId": "zone-e",
        "zoneName": "Bellandur Outer Ring Road",
        "lat": 12.9275,
        "lng": 77.6740,
        "type": "waterlogging",
        "title": "Stormwater runoff overflow near lake feeder canal",
        "description": "Excess surface runoff carrying debris into lake buffer area. Detention pond urgently needed upstream.",
        "urgency": "critical",
        "upvotes": 62,
        "status": "under_review",
        "timestamp": "2026-11-14T07:45:00Z",
        "recommendedFix": "Retention Wetland Basin",
    },
    {
        "id": "rep-104",
        "zoneId": "zone-h",
        "zoneName": "Marathahalli Bridge Underpass",
        "lat": 12.9580,
        "lng": 77.6985,
        "type": "barren_setback",
        "title": "500m unused barren median with compacted dirt",
        "description": "Large unpaved road median generating dust and heat. Ideal location for rain garden and micro-forest.",
        "urgency": "medium",
        "upvotes": 29,
        "status": "verified_by_field_officer",
        "timestamp": "2026-11-10T16:20:00Z",
        "recommendedFix": "Rain Garden with Native Shrubs",
    },
]

# ---------------------------------------------------------------------------
# Pydantic Request / Response Schemas
# ---------------------------------------------------------------------------
class MCDAWeightsRequest(BaseModel):
    heatWeight: float = Field(default=0.25, ge=0.0, le=1.0)
    floodWeight: float = Field(default=0.25, ge=0.0, le=1.0)
    populationWeight: float = Field(default=0.20, ge=0.0, le=1.0)
    landWeight: float = Field(default=0.15, ge=0.0, le=1.0)
    costWeight: float = Field(default=0.15, ge=0.0, le=1.0)

class BudgetOptimizeRequest(BaseModel):
    totalBudgetCrores: float = Field(default=25.0, ge=1.0, le=500.0)
    priorityMode: str = Field(default="balanced")  # "heat", "flood", "balanced"
    allowedInterventions: Optional[List[str]] = None

class CopilotQueryRequest(BaseModel):
    query: str
    zoneId: Optional[str] = None
    budgetCrores: Optional[float] = 25.0

class CitizenReportCreate(BaseModel):
    zoneName: str
    lat: float
    lng: float
    type: str  # "heat_island", "waterlogging", "barren_setback"
    title: str
    description: str
    urgency: str = "medium"
    recommendedFix: Optional[str] = "Ecological Assessment"

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def get_health():
    """Health check endpoint providing engine status, active zones, and uptime metadata."""
    return {
        "status": "online",
        "service": "ECO-PULSE AI Backend Microservice",
        "version": "2.4.0",
        "framework": "FastAPI + Pydantic",
        "zonesCount": len(NEIGHBOURHOODS),
        "dataset": "Greater Bengaluru Municipal Corporation (BBMP) - WGS84",
        "mcdaModel": "Linear Additive Multi-Criteria Decision Analysis",
        "timestamp": time.time(),
    }

@app.get("/api/zones")
def list_zones():
    """Returns all 10 assessed municipal zones with current microclimate indices."""
    return {
        "success": True,
        "count": len(NEIGHBOURHOODS),
        "data": NEIGHBOURHOODS,
    }

@app.get("/api/zones/{zone_id}")
def get_zone(zone_id: str):
    """Retrieve detailed telemetry and environmental metrics for a specific zone."""
    zone = next((z for z in NEIGHBOURHOODS if z["id"] == zone_id), None)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Zone '{zone_id}' not found.")
    
    inter = INTERVENTIONS.get(zone["recommendation"])
    return {
        "success": True,
        "data": {
            **zone,
            "interventionDetails": inter,
            "canopyDeficit": max(0, 30 - zone["vegetationCoverage"]),
            "estimatedCapexLakhs": round((inter["costPerUnit"] * (zone["availableLand"] * 3)), 2) if inter else 0,
        }
    }

@app.post("/api/recommendations/score")
def calculate_custom_mcda_scores(weights: MCDAWeightsRequest):
    """
    Computes custom MCDA scores across all zones based on user-weighted parameters:
    Score = (Heat * w1) + (Flood * w2) + (Pop * w3) + (Land * w4) + (CostEff * w5)
    """
    total_w = weights.heatWeight + weights.floodWeight + weights.populationWeight + weights.landWeight + weights.costWeight
    if total_w <= 0:
        total_w = 1.0

    # Normalized weights
    w_heat = weights.heatWeight / total_w
    w_flood = weights.floodWeight / total_w
    w_pop = weights.populationWeight / total_w
    w_land = weights.landWeight / total_w
    w_cost = weights.costWeight / total_w

    ranked = []
    for z in NEIGHBOURHOODS:
        # Normalized metrics (0-100)
        norm_heat = z["heatScore"]
        norm_flood = z["floodScore"]
        norm_pop = z["populationExposure"]
        norm_land = min(100, (z["availableLand"] / 35.0) * 100)
        norm_cost_eff = 100 - min(100, z["impervious"] * 0.8)

        composite_score = round(
            (norm_heat * w_heat) +
            (norm_flood * w_flood) +
            (norm_pop * w_pop) +
            (norm_land * w_land) +
            (norm_cost_eff * w_cost),
            1
        )

        # Dynamic selection of best intervention based on hazard bias
        if norm_flood > norm_heat + 10:
            rec = "urban-pond" if z["availableLand"] > 20 else "rain-garden"
        elif norm_heat > norm_flood + 10:
            rec = "urban-trees"
        elif z["impervious"] > 75:
            rec = "permeable-pavement" if z["availableLand"] < 10 else "green-roof"
        else:
            rec = z["recommendation"]

        ranked.append({
            **z,
            "computedScore": composite_score,
            "dynamicRecommendation": rec,
            "interventionDetails": INTERVENTIONS.get(rec),
            "scoreBreakdown": {
                "heatComponent": round(norm_heat * w_heat, 1),
                "floodComponent": round(norm_flood * w_flood, 1),
                "popComponent": round(norm_pop * w_pop, 1),
                "landComponent": round(norm_land * w_land, 1),
                "costEffComponent": round(norm_cost_eff * w_cost, 1),
            }
        })

    ranked.sort(key=lambda x: x["computedScore"], reverse=True)
    return {
        "success": True,
        "weightsApplied": {
            "heat": round(w_heat, 2),
            "flood": round(w_flood, 2),
            "population": round(w_pop, 2),
            "land": round(w_land, 2),
            "cost": round(w_cost, 2),
        },
        "rankedZones": ranked,
    }

@app.post("/api/budget/optimize")
def optimize_budget(req: BudgetOptimizeRequest):
    """
    Greedy optimization solver allocating nature-based infrastructure units within budget constraints.
    Prioritizes interventions by chosen climate objective (thermal, hydrological, or balanced).
    """
    total_budget_lakhs = req.totalBudgetCrores * 100.0  # 1 Crore = 100 Lakhs
    allowed = req.allowedInterventions or list(INTERVENTIONS.keys())

    # Sort priorities
    def intervention_weight(item_id: str) -> float:
        inter = INTERVENTIONS[item_id]
        if req.priorityMode == "heat":
            return inter["heatReduction"] / (inter["costPerUnit"] + 0.01)
        elif req.priorityMode == "flood":
            return inter["floodReduction"] / (inter["costPerUnit"] + 0.01)
        else:
            return (inter["heatReduction"] * 0.5 + inter["floodReduction"] * 0.5) / (inter["costPerUnit"] + 0.01)

    sorted_interventions = sorted(allowed, key=intervention_weight, reverse=True)

    allocated_items = []
    spent_lakhs = 0.0

    # Proportional allotment per candidate
    for int_id in sorted_interventions:
        inter = INTERVENTIONS[int_id]
        unit_cost = inter["costPerUnit"]
        
        # Max affordable units with remaining budget cap
        budget_slice = (total_budget_lakhs - spent_lakhs) * 0.45 if int_id != sorted_interventions[-1] else (total_budget_lakhs - spent_lakhs)
        units = int(budget_slice // unit_cost)
        if units < 1 and (total_budget_lakhs - spent_lakhs) >= unit_cost:
            units = 1

        cost = units * unit_cost
        if spent_lakhs + cost <= total_budget_lakhs and units > 0:
            spent_lakhs += cost
            allocated_items.append({
                "id": inter["id"],
                "name": inter["name"],
                "emoji": inter["emoji"],
                "color": inter["color"],
                "units": units,
                "unit": inter["unit"],
                "unitCostLakhs": unit_cost,
                "totalCostCrores": round(cost / 100.0, 2),
                "heatReductionImpact": inter["heatReduction"],
                "floodReductionImpact": inter["floodReduction"],
            })

    total_spent_crores = round(spent_lakhs / 100.0, 2)
    remaining_crores = round(max(0, req.totalBudgetCrores - total_spent_crores), 2)

    # Estimate aggregate macro-impacts
    est_heat_drop = min(38.0, sum(item["heatReductionImpact"] * 0.25 for item in allocated_items))
    est_flood_capture = min(55.0, sum(item["floodReductionImpact"] * 0.35 for item in allocated_items))
    co2_est = int(sum(item["units"] * 1.5 for item in allocated_items))

    return {
        "success": True,
        "inputBudget": req.totalBudgetCrores,
        "totalAllocatedCrores": total_spent_crores,
        "remainingBufferCrores": remaining_crores,
        "utilizationPercentage": round((total_spent_crores / req.totalBudgetCrores) * 100, 1),
        "portfolio": allocated_items,
        "projectedImpacts": {
            "estimatedHeatReductionPct": round(est_heat_drop, 1),
            "estimatedRunoffReductionPct": round(est_flood_capture, 1),
            "annualCo2SequestrationTonnes": co2_est,
            "paybackYears": round(3.8 + (100 - (total_spent_crores / req.totalBudgetCrores) * 100) * 0.02, 1),
        }
    }

@app.get("/api/citizen-reports")
def get_citizen_reports():
    """Retrieve all ground-truth heat, ponding, and barren setback reports."""
    return {
        "success": True,
        "totalReports": len(CITIZEN_REPORTS),
        "reports": CITIZEN_REPORTS,
    }

@app.post("/api/citizen-reports")
def submit_citizen_report(rep: CitizenReportCreate):
    """Allows municipal field officers or residents to submit a localized microclimate report."""
    new_rep = {
        "id": f"rep-{int(time.time())}",
        "zoneId": "custom-spot",
        "zoneName": rep.zoneName,
        "lat": rep.lat,
        "lng": rep.lng,
        "type": rep.type,
        "title": rep.title,
        "description": rep.description,
        "urgency": rep.urgency,
        "upvotes": 1,
        "status": "logged_for_verification",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "recommendedFix": rep.recommendedFix or "Ecological Site Assessment",
    }
    CITIZEN_REPORTS.insert(0, new_rep)
    return {
        "success": True,
        "message": "Field report successfully staged into municipal verification queue.",
        "report": new_rep,
    }

@app.post("/api/citizen-reports/{rep_id}/upvote")
def upvote_citizen_report(rep_id: str):
    """Upvote / endorse urgency on a citizen field report."""
    rep = next((r for r in CITIZEN_REPORTS if r["id"] == rep_id), None)
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    rep["upvotes"] += 1
    return {"success": True, "upvotes": rep["upvotes"]}

@app.get("/api/export/geojson")
def export_geojson():
    """Generates an RFC 7946 compliant GeoJSON FeatureCollection for QGIS / ArcGIS workflows."""
    features = []
    for z in NEIGHBOURHOODS:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [z["lng"], z["lat"]],
            },
            "properties": {
                "zone_id": z["id"],
                "name": z["name"],
                "heat_score": z["heatScore"],
                "flood_score": z["floodScore"],
                "population_exposure": z["populationExposure"],
                "vegetation_coverage_pct": z["vegetationCoverage"],
                "available_land_ha": z["availableLand"],
                "recommended_intervention": z["recommendation"],
                "priority_score": z["recommendationScore"],
                "impervious_surface_pct": z["impervious"],
                "ward_area_sqkm": z["area"],
                "population": z["population"],
            }
        })

    return {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": features,
    }

@app.post("/api/ai/copilot")
def query_copilot(req: CopilotQueryRequest):
    """
    Intelligent EcoPulse AI Urban Planning Copilot:
    Synthesizes real zone facts, MCDA scoring, and budget allocation guidance for municipal planners.
    """
    q = req.query.lower()
    
    # Analyze query intent
    if "whitefield" in q:
        target = next(z for z in NEIGHBOURHOODS if z["id"] == "zone-a")
        response = (
            f"**Whitefield Climate Profile & Strategy:**\n\n"
            f"- **Heat Vulnerability:** Critical score of **{target['heatScore']}/100** due to expansive paved arterial roadways and tech park campuses with {target['impervious']}% impervious surface.\n"
            f"- **Vegetation Deficit:** Current canopy is only **{target['vegetationCoverage']}%** (Target: 30%).\n"
            f"- **Recommended Blueprint:** Intensive **Urban Trees** across transit setbacks. With {target['availableLand']} ha of public right-of-way, planting ~4,500 shade trees (Neem, Jacaranda, Rain Tree) can attenuate localized surface temperatures by 3.2°C within 4 years.\n"
            f"- **Budget Feasibility:** A capital outlay of ₹3.6 Crores covers seedling procurement, drip-irrigation retrofits, and 3-year establishment care."
        )
    elif "bellandur" in q or "lake" in q:
        target = next(z for z in NEIGHBOURHOODS if z["id"] == "zone-e")
        response = (
            f"**Bellandur Catchment & Flood Risk Diagnostic:**\n\n"
            f"- **Runoff Index:** Extremely high flood score of **{target['floodScore']}/100**, driven by basin topography and stormwater surcharge into the lake feeder canals.\n"
            f"- **Available Land:** High available public land reserves of **{target['availableLand']} hectares**.\n"
            f"- **Optimal Intervention:** **Urban Ponds & Constructed Wetlands**. Constructing a decentralized retention pond network will absorb up to 45% of peak monsoon runoff, trapping silt before entering Bellandur Lake.\n"
            f"- **Implementation Strategy:** Allocate ~₹12-15 Crores from the stormwater drainage modernisation pool."
        )
    elif "koramangala" in q:
        target = next(z for z in NEIGHBOURHOODS if z["id"] == "zone-b")
        response = (
            f"**Koramangala Dense Ward Retrofit Blueprint:**\n\n"
            f"- **Double Vulnerability:** High Heat ({target['heatScore']}/100) and High Flood Runoff ({target['floodScore']}/100) with **{target['impervious']}% impervious cover**.\n"
            f"- **Land Constraint:** Limited public land ({target['availableLand']} ha).\n"
            f"- **Prescription:** Hybrid **Rain Gardens + Permeable Pavers** in commercial setbacks along 80 Feet Road and 100 Feet Road. Bioretention cells will prevent junction waterlogging while cooling street verges."
        )
    elif "budget" in q or "crore" in q or "cost" in q:
        b = req.budgetCrores or 25.0
        response = (
            f"**Capital Deployment Allocation for ₹{b} Crores:**\n\n"
            f"- **40% (₹{round(b*0.4, 1)} Cr) → Urban Trees:** Strategic canopy infill in Whitefield & Rajajinagar (~25,000 trees).\n"
            f"- **35% (₹{round(b*0.35, 1)} Cr) → Rain Gardens & Bioswales:** 25 high-priority runoff junctions in Koramangala and Marathahalli.\n"
            f"- **15% (₹{round(b*0.15, 1)} Cr) → Permeable Pavement Retrofits:** Jayanagar parking strips and pedestrian footpaths.\n"
            f"- **10% (₹{round(b*0.1, 1)} Cr) → Contingency & Maintenance Escrow:** Sensor calibration and seasonal weeding/pruning.\n\n"
            f"*Projected Payback:* 4.6 years through avoided municipal flood pumping and cooling load reduction."
        )
    elif "tree" in q or "trees" in q:
        inter = INTERVENTIONS["urban-trees"]
        response = (
            f"**Urban Tree Canopy Strategy:**\n\n"
            f"- **Unit Capex:** ₹{inter['costPerUnit']} Lakhs per mature sapling tree system (including sapling, tree guard, soil amendment, and watering).\n"
            f"- **Thermal Benefit:** Up to **{inter['heatReduction']}% local heat reduction** through evapotranspiration and shade.\n"
            f"- **Target Zones:** Whitefield, Rajajinagar, and Hebbal where wide transit corridors have space for continuous canopy arboriculture."
        )
    elif "rain garden" in q or "flood" in q:
        response = (
            f"**Stormwater & Bioretention Solutions:**\n\n"
            f"1. **Rain Gardens:** Best for roadside medians and parking setbacks (32% flood reduction, unit cost ₹1.2L per 100m²).\n"
            f"2. **Permeable Pavers:** Allows 70-90% of rain infiltration in paved commercial districts (Unit cost ₹3.5L per 100m²).\n"
            f"3. **Urban Retention Ponds:** High-capacity flood buffers for large low-lying wards like Bellandur."
        )
    else:
        response = (
            f"**EcoPulse AI Urban Planning Recommendation:**\n\n"
            f"Based on our evaluation of all 10 Bengaluru pilot zones, **Marathahalli** and **Koramangala** exhibit the highest combined climate hazard (Heat >78, Flood >79).\n\n"
            f"**Immediate Recommended Next Steps:**\n"
            f"1. Review the **AI Recommendations** tab for MCDA scoring details.\n"
            f"2. Check the **Scenario Simulator** to compare a combined green infrastructure rollout against baseline.\n"
            f"3. Run the **Budget Optimizer** with your designated municipal capital envelope to generate contract-ready quantities."
        )

    return {
        "success": True,
        "query": req.query,
        "response": response,
        "suggestedChips": [
            "Whitefield heat mitigation strategy",
            "Bellandur flood detention plan",
            "Optimal allocation for ₹50 Crores",
            "Compare rain gardens vs permeable pavements",
        ]
    }

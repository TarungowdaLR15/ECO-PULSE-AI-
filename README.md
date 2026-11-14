<div align="center">
  
# 🌿 ECO-PULSE AI
  
**Plan Smarter. Invest Better. Build Greener.**

An AI-assisted urban green infrastructure planning platform designed to combat urban heat islands, manage flood risks, and optimize climate resilience budgets across city neighbourhoods.

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)](https://leafletjs.com/)
[![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=react&logoColor=white)](https://recharts.org/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)

</div>

---

## 📖 Overview

**ECO-PULSE AI** is a comprehensive dashboard built for urban planners, city officials, and environmental analysts. By aggregating climate data, field reports, and spatial mapping, the platform uses algorithmic recommendations to suggest the most effective green infrastructure interventions (like Urban Trees, Rain Gardens, and Permeable Pavements) for specific neighbourhoods.

> ⚠️ **Note:** This prototype currently operates on a **simulated dataset**. All scores, financial estimates, and interventions are illustrative models designed for demonstration purposes.

---

## ✨ Key Features & Modules

### 1. 📊 Overview Dashboard
Get a high-level snapshot of the city's health. Includes Risk Distribution (Heat vs. Flood), Monthly Heat Index trends, Priority Neighbourhood rankings, and a live feed of recent planning activity.

### 2. 🌡️ Climate Intelligence
Deep dive into Urban Heat Island scores per neighbourhood. Features interactive bar charts highlighting high-risk zones (scores ≥ 70) and provides sortable tables of zone-specific heat risk details and main contributing factors.

### 3. 🗺️ Digital Twin Map
A fully interactive map (powered by Leaflet) visualizing spatial risks. Users can toggle layers for:
*   Urban Heat Risk (High/Medium/Low)
*   Flood / Runoff Risk
*   Vegetation Coverage
*   Population Exposure
*   Recommended Green Infrastructure

### 4. 📍 Ground Truth Reports
Community and field-officer driven intelligence. Browse real-time reports (e.g., "Severe monsoon ponding", "Zero shade corridor") complete with GPS coordinates, severity badges, and field-inspector recommended interventions. Features community endorsements.

### 5. 🧠 AI Recommendations
The core intelligence engine. This module generates location-specific intervention packages (e.g., "Urban Ponds", "Urban Trees") ranked by an algorithmic MCDA (Multi-Criteria Decision Analysis) match score. Provides clear, data-backed justifications for each recommendation (e.g., "Critical runoff vulnerability demands accelerated bio-retention").

### 6. 💰 Budget Optimization
An interactive allocation tool. Users can set a total budget (e.g., ₹25 Crores), select a priority mode (Heat Mitigation, Flood Mitigation, or Balanced), and filter available intervention types. The AI calculates the optimal distribution of funds.

---

## 🛠️ Tech Stack

*   **Framework:** React 18 + TypeScript + Vite
*   **Styling:** Tailwind CSS (Custom dark-mode "Eco-Pulse" theme)
*   **Routing:** React Router DOM
*   **Data Visualization:** Recharts (Area, Bar, Pie/Donut charts)
*   **Mapping:** Leaflet & React-Leaflet
*   **Icons:** Lucide React
*   **Animation:** Framer Motion

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/eco-pulse-ai.git
   cd eco-pulse-ai

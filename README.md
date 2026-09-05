# Policy Impact Agent

> **Simulate Before You Decide.**

An AI-powered decision-impact simulator designed for government and municipal administrators. The system takes a proposed **blocked or damaged infrastructure asset in natural language**, analyzes how nearby people and public services may be affected across four key dimensions, identifies **cascading impact chains**, generates alternative strategies, compares those alternatives in a What-If matrix, and provides an explainable AI recommendation.

---

## 1. Problem Statement & Vision

Urban infrastructure decisions (such as closing a primary river bridge for maintenance) are rarely isolated to a single department. A transport closure directly impacts emergency medical response, school bus operations, disaster evacuation readiness, and vulnerable community access.

**Policy Impact Agent** acts as an administrative simulation layer that visualizes these cross-department consequences *before* implementation.

---

## 2. Core Workflow Architecture

```
DECISION (Natural Language Input)
    ↓
UNDERSTAND (Policy Extraction Agent)
    ↓
CROSS-DEPARTMENT IMPACT (Transport, Essential Services, Population, Disaster Risk)
    ↓
CASCADING CONSEQUENCES (Cause → Effect Dependency Graph)
    ↓
ALTERNATIVE DECISIONS (Full, Partial, Night-Only Closures)
    ↓
WHAT-IF COMPARISON (Multi-Dimensional Score Matrix)
    ↓
RECOMMENDATION & REPORT (Explainable AI Rationale & Printable Report)
```

---

## 3. Specialized AI Domain Agents

1. **Policy Understanding Agent**: Converts raw text into structured policy parameters (Action, Asset, Location, Duration, Reason).
2. **Transport Impact Agent**: Evaluates road network capacity, detour congestion, and travel time increases.
3. **Essential Services Agent**: Analyzes ambulance turnaround times, hospital connectivity, and school route delays.
4. **Population & Equity Agent**: Assesses vulnerable demographic zones and public transit equity burden.
5. **Disaster Risk Agent**: Evaluates emergency evacuation routes and secondary flood/hazard risks.
6. **Cascading Consequence Analyzer**: Constructs directional dependency graphs showing how one decision propagates across departments.
7. **Alternative Strategy Agent**: Models 3 distinct operational strategies (Full Closure, Partial Closure with Emergency Lane, Night-Only Closure).
8. **Decision Recommendation Agent**: Recommends the optimal strategy with clear rationale, mitigations, and explicit system assumptions.

---

## 4. Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, `@xyflow/react` (React Flow), Leaflet, Lucide React.
- **Backend**: Node.js, Express, TypeScript, `@google/genai` SDK, `dotenv`, `cors`.
- **AI Model**: Google Gemini API (`gemini-2.5-flash`).

---

## 5. Quick Start Setup

### Step 1: Install Dependencies
From the project root directory:

```bash
npm run setup
```
*(This automatically runs `npm install` in the root, `server/`, and `client/` directories.)*

### Step 2: Environment Variables
Create a `.env` file in the `server` directory:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Security Note**: `GEMINI_API_KEY` is loaded exclusively by the backend Express server. It is never exposed to or bundled in the frontend.

### Step 3: Run the Application
To launch both the backend API server and Vite frontend concurrently:

```bash
# Terminal 1: Run Backend
npm run dev:server

# Terminal 2: Run Frontend
npm run dev:client
```

Access the application in your browser at `http://localhost:3000`.

---

## 6. Live Gemini vs. Demo Simulation Mode

The system features automatic fallback detection:
- **Live Gemini Analysis**: Active when a valid `GEMINI_API_KEY` is present in `server/.env`.
- **Demo Simulation Mode**: Automatically activated if no API key is provided, if Gemini fails, or if offline. Uses rich, deterministic synthetic demonstration data for Namakkal, Tamil Nadu.

---

## 7. Responsible AI & Synthetic Data Notice

All city data in this prototype uses **Demo Simulation Data — Namakkal**. Infrastructure, population, traffic, impact scores, facilities, and all other figures are synthetic simulation estimates, not official Namakkal government data. They are intended exclusively for administrative decision support and do not replace official government assessments or human decision-making.

## 8. Tamil Nadu Location & Map Controls

The scenario form supports searchable selection across all 38 listed Tamil Nadu districts, an area or location description, and an optional infrastructure asset. Namakkal remains the default reliable demo location. District centroids are approximate navigation points only; they are not verified infrastructure data.

The map separates the basemap from infrastructure context. Street imagery uses CARTO tiles. Satellite mode uses Esri World Imagery plus transparent Esri World Transportation and World Boundaries and Places reference layers for roads, place names, district boundaries, and other labels. Provider attribution is shown in the map. No satellite API key is required in the current configuration. Synthetic Namakkal assets and overlays are hidden when another district is selected, so they are not presented as real facilities or government infrastructure.

Structured simulation requests include `location`, `district`, `area`, and `selectedAsset`. Gemini receives only the selected location context; the Namakkal synthetic dataset is included only for Namakkal demo scenarios. Other locations are clearly instructed not to infer official infrastructure data.

Infrastructure choices are loaded from the backend through the OpenStreetMap Overpass API around the selected area point (1.5 km), including nearby named roads, bridges, amenities, public transport, railway features, tourism places, buildings, and shops. The backend tries multiple public Overpass instances when one is unavailable. OpenStreetMap attribution and source status are shown in the selection UI. If all geographic lookups are unavailable, Namakkal uses the existing synthetic assets and other locations retain a custom `Other` option instead of fabricated infrastructure.

The Create Simulation page also includes the interactive map. Selecting a place or clicking a map point updates the selected marker, area context, coordinates, nearby infrastructure lookup, and submitted scenario context. Basemap labels come from CARTO or Esri reference layers; asset names come from available OpenStreetMap data. Google Maps tiles and data are not used.

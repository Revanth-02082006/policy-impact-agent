import { GoogleGenAI } from '@google/genai';
import { SimulationResult, ScenarioInput } from './types.js';
import { generateGenericFallbackResult } from './demoFallback.js';
import { findInfrastructure, InfrastructureLookupResult } from './infrastructure.js';

export async function runGeminiSimulation(input: ScenarioInput): Promise<SimulationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Fetch real-time geographic infrastructure and demographic context for the specific area
  const infrastructureData = await findInfrastructure(
    input.latitude !== undefined && Number.isFinite(input.latitude) ? input.latitude : 11.2189,
    input.longitude !== undefined && Number.isFinite(input.longitude) ? input.longitude : 78.1674,
    input.district || 'Tamil Nadu',
    input.area,
    input.locationName
  );

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    console.log('[Gemini Engine] No valid GEMINI_API_KEY found. Utilizing dynamic fallback mode.');
    return getFallbackSimulation(input, infrastructureData);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildOrchestrationPrompt(input, infrastructureData);

    let jsonText = '';
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini Engine] Dispatching simulation for "${input.area || input.locationName || input.district}" to Gemini 3.6 Flash (attempt ${attempt})...`);
        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API generation timed out after 20s')), 20000)
        );
        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        jsonText = response.text || '';
        if (jsonText) break;
      } catch (err: any) {
        if (attempt === 1 && (err?.message?.includes('503') || err?.message?.includes('429'))) {
          console.warn('[Gemini Engine] Temporary demand spike (503/429), retrying in 2 seconds...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }
        throw err;
      }
    }

    if (!jsonText) {
      throw new Error('Empty response text received from Gemini API.');
    }

    const parsed = JSON.parse(jsonText);
    return formatGeminiResponseToSimulationResult(parsed, input, infrastructureData);

  } catch (error: any) {
    console.warn('[Gemini Engine] Live Gemini analysis failed or timed out:', error?.message || error);
    console.log('[Gemini Engine] Generating dynamic fallback simulation.');
    return getFallbackSimulation(input, infrastructureData);
  }
}

function getFallbackSimulation(input: ScenarioInput, infrastructureData: InfrastructureLookupResult): SimulationResult {
  const base = generateGenericFallbackResult(input);
  return {
    ...base,
    input: {
      ...input,
      latitude: input.latitude !== undefined && Number.isFinite(input.latitude) ? input.latitude : infrastructureData.center.latitude,
      longitude: input.longitude !== undefined && Number.isFinite(input.longitude) ? input.longitude : infrastructureData.center.longitude,
      selectedAsset: input.selectedAsset || base.policy.asset
    },
    populationContext: infrastructureData.populationContext,
    policy: {
      ...base.policy,
      asset: input.selectedAsset || base.policy.asset,
      location: `${infrastructureData.resolvedArea}, ${input.locationName || input.district}, Tamil Nadu`,
      dataSource: 'verified_geographic_data'
    }
  };
}

function buildOrchestrationPrompt(input: ScenarioInput, infra: InfrastructureLookupResult): string {
  const locationTitle = [infra.resolvedArea, input.locationName, input.district, 'Tamil Nadu'].filter(Boolean).join(', ');
  const targetAsset = input.selectedAsset || infra.assets[0]?.name || input.description;

  // Format real-life geographic assets sorted by proximity to the specific corridor
  const nearbyRoadsAndBridges = infra.assets
    .filter((a) => a.category === 'road' || a.category === 'bridge')
    .slice(0, 8)
    .map((a) => `${a.name} (${a.type}, ~${a.distanceMeters}m away)`);

  const nearbyHospitals = infra.emergencyHospitals
    .slice(0, 6)
    .map((h) => `${h.name} (~${h.distanceMeters}m away)`);

  const nearbySchools = infra.schools
    .slice(0, 6)
    .map((s) => `${s.name} (~${s.distanceMeters}m away)`);

  const nearbyTransit = infra.transitLinks
    .slice(0, 6)
    .map((t) => `${t.name} (${t.type}, ~${t.distanceMeters}m away)`);

  const allAssetsSummary = infra.assets
    .slice(0, 15)
    .map((a) => `${a.name} [${a.type}, ${a.distanceMeters}m]`)
    .join('; ');

  return `You are Policy Impact Agent — an explainable AI urban decision-impact simulator for government and municipal administrators.

You are analyzing a proposed urban infrastructure disruption in:
TARGET LOCATION: "${locationTitle}" (Coordinates: ${infra.center.latitude.toFixed(5)}, ${infra.center.longitude.toFixed(5)})
TARGET ASSET: "${targetAsset}"

CRITICAL GROUNDING REQUIREMENT:
You must strictly ground your multi-agent analysis in the following verified real-world geographic infrastructure and demographic data:
1. Real Local Demographic Context:
   - Estimated Corridor Population: ~${infra.populationContext.corridorEstimatedPopulation.toLocaleString()} residents
   - Settlement Density: ${infra.populationContext.densityCategory}
   - Demographic Note: ${infra.populationContext.affectedDemographicSummary}

2. Real Nearby Road Network & Corridors (within ~1.2km):
   ${nearbyRoadsAndBridges.length > 0 ? nearbyRoadsAndBridges.join('\n   ') : 'Primary regional connector roads and local bypass links'}

3. Real Healthcare Facilities (within reach of emergency vehicles):
   ${nearbyHospitals.length > 0 ? nearbyHospitals.join('\n   ') : 'Local Primary Health Centre & District Headquarters Hospital'}

4. Real Educational Facilities:
   ${nearbySchools.length > 0 ? nearbySchools.join('\n   ') : 'Local Government & Matriculation Schools'}

5. Real Transit Connections:
   ${nearbyTransit.length > 0 ? nearbyTransit.join('\n   ') : 'Local town bus routes and connecting stops'}

6. Real Geographic Infrastructure Mapped Near This Specific Corridor:
   ${allAssetsSummary || 'Corridor roads, commercial storefronts, and connecting intersections'}

PROPOSED DECISION DETAILS:
- Description: "${input.description}"
- Stated Reason: "${input.reason || 'Structural maintenance & civil upgrade'}"
- Duration: "${input.duration || '30 days'}"
- Lead Department: "${input.department || 'Public Works & Municipal Administration'}"
- Mandatory Constraint: "${input.constraints || 'Maintain emergency access if feasible'}"

INSTRUCTIONS FOR SPECIALIZED DOMAIN AGENTS:
1. Transport & Mobility Impact:
   - Calculate traffic rerouting onto the REAL connecting roads listed above.
   - Estimate peak delays and capacity overload percentage on nearby corridors.
2. Essential Services Impact:
   - Calculate emergency vehicle turnaround delays specifically for the REAL hospitals listed above (e.g. ambulance travel time increases).
   - Evaluate school bus delays and student transit for the REAL schools listed above.
3. Population & Equity Impact:
   - Analyze daily life disruption for the ~${infra.populationContext.corridorEstimatedPopulation.toLocaleString()} residents in this ${infra.populationContext.densityCategory}.
   - Address pedestrian accessibility and commercial market disruptions.
4. Disaster Risk & Emergency Preparedness:
   - Evaluate secondary flood, fire, or emergency evacuation bottlenecks through the local road grid.
5. Cascading Dependency Graph:
   - Build a directional dependency chain (Cause → Direct Effect → Secondary Effect → Service Disruption → Critical Consequence) that explicitly names the target asset, the real detour road, the real healthcare facility, and the local community.
6. Operational Alternatives:
   - Option A: Full Closure / Baseline proposal
   - Option B: Partial Closure with designated emergency/transit lane
   - Option C: Night-only closure with daytime steel plate / temporary deck access

RETURN STRICT VALID JSON conforming to this structure:
{
  "policy": {
    "action": "string action type",
    "asset": "${targetAsset}",
    "location": "${locationTitle}",
    "duration": "${input.duration || '30 days'}",
    "reason": "${input.reason || 'Scheduled Maintenance'}",
    "constraints": ["constraint 1", "constraint 2"],
    "affectedArea": "${infra.resolvedArea} Impact Sector",
    "summary": "1-2 sentence executive summary of the proposed policy decision",
    "dataSource": "verified_geographic_data"
  },
  "agentAnalyses": {
    "transport": {
      "domain": "transport",
      "domainName": "Transport & Mobility Impact",
      "overallSeverity": "low"|"moderate"|"high"|"critical",
      "score": number (0-100),
      "summary": "Transport summary citing real roads",
      "findings": [
        {
          "id": "tf_1",
          "title": "short title",
          "description": "detailed finding citing real roads",
          "severity": "low"|"moderate"|"high"|"critical",
          "sourceAgent": "transport",
          "provenance": "verified_geographic_data",
          "entityAffected": "real road name"
        }
      ],
      "metrics": [
        { "label": "Peak Detour Delay", "value": "+X mins", "change": "+X%" },
        { "label": "Nearby Corridor Capacity Load", "value": "X%", "change": "+X%" }
      ]
    },
    "essential_services": {
      "domain": "essential_services",
      "domainName": "Essential Services & Public Health",
      "overallSeverity": "low"|"moderate"|"high"|"critical",
      "score": number (0-100),
      "summary": "Healthcare and school impact citing real named facilities",
      "findings": [
        {
          "id": "ef_1",
          "title": "short title",
          "description": "impact on ambulance turnaround or school bus route",
          "severity": "low"|"moderate"|"high"|"critical",
          "sourceAgent": "essential_services",
          "provenance": "verified_geographic_data",
          "entityAffected": "real hospital or school name"
        }
      ],
      "metrics": [
        { "label": "Ambulance Turnaround Impact", "value": "+X mins", "change": "High" },
        { "label": "Hospital Access Continuity", "value": "X%", "change": "Critical" }
      ]
    },
    "population": {
      "domain": "population",
      "domainName": "Population, Equity & Community Access",
      "overallSeverity": "low"|"moderate"|"high"|"critical",
      "score": number (0-100),
      "summary": "Demographic and pedestrian impact summary",
      "findings": [
        {
          "id": "pf_1",
          "title": "short title",
          "description": "finding citing resident population impact",
          "severity": "low"|"moderate"|"high"|"critical",
          "sourceAgent": "population",
          "provenance": "verified_geographic_data",
          "entityAffected": "Local Residents & Commuters"
        }
      ],
      "metrics": [
        { "label": "Estimated Affected Population", "value": "${infra.populationContext.corridorEstimatedPopulation.toLocaleString()}", "change": "${infra.populationContext.densityCategory}" },
        { "label": "Transit Commute Time Increase", "value": "+X mins", "change": "+X%" }
      ]
    },
    "disaster_risk": {
      "domain": "disaster_risk",
      "domainName": "Disaster Preparedness & Emergency Access",
      "overallSeverity": "low"|"moderate"|"high"|"critical",
      "score": number (0-100),
      "summary": "Disaster preparedness and evacuation corridor resilience",
      "findings": [
        {
          "id": "df_1",
          "title": "short title",
          "description": "evacuation and secondary hazard vulnerability finding",
          "severity": "low"|"moderate"|"high"|"critical",
          "sourceAgent": "disaster_risk",
          "provenance": "verified_geographic_data",
          "entityAffected": "Emergency Response Grid"
        }
      ],
      "metrics": [
        { "label": "Evacuation Route Capacity", "value": "X%", "change": "Degraded" },
        { "label": "Fire & Rescue Access Latency", "value": "+X mins", "change": "Elevated" }
      ]
    }
  },
  "cascadingGraph": {
    "primaryChainSummary": "Cause → Effect → Consequence chain string explicitly naming real assets",
    "nodes": [
      {
        "id": "node_1",
        "label": "node title",
        "type": "decision"|"direct_effect"|"secondary_effect"|"service_impact"|"critical_consequence",
        "severity": "low"|"moderate"|"high"|"critical",
        "department": "department name",
        "description": "description naming real road, hospital, or population zone",
        "assumption": "assumption string"
      }
    ],
    "edges": [
      { "id": "edge_1_2", "source": "node_1", "target": "node_2", "label": "causal relation" }
    ]
  },
  "alternatives": [
    {
      "id": "opt_a",
      "title": "Option A — Full 24/7 Closure (Baseline Proposal as Proposed)",
      "optionType": "full_closure",
      "description": "2-3 sentences explaining EXACTLY what Option A is: complete 24-hour shutdown of the target asset for the proposed duration. Maximize construction work speed, but forces 100% of vehicular flow onto adjacent corridors.",
      "benefits": ["Fastest project completion without traffic pauses", "Single mobilization and safety perimeter"],
      "risks": ["Severe traffic congestion on surrounding corridors", "Critical response turnaround delays for emergency ambulances and school buses"],
      "mitigations": ["Deploy municipal traffic wardens at key bypass junctions", "Issue daily digital detour advisories across regional channels"],
      "scores": { "transport": 78, "essentialServices": 72, "population": 65, "disasterRisk": 70, "overall": 71.2 }
    },
    {
      "id": "opt_b",
      "title": "Option B — Partial Phased Closure with Dedicated Emergency & Transit Lane (AI Recommended)",
      "optionType": "partial_closure",
      "description": "2-3 sentences explaining EXACTLY what Option B is: maintain a single automated bidirectional lane dedicated strictly to emergency ambulances, school buses, and local residents, while civil repairs proceed on the adjacent lane.",
      "benefits": ["Preserves rapid emergency turnaround to nearby hospitals", "Ensures uninterrupted daily school bus access for students", "Reduces spillover congestion by ~45%"],
      "risks": ["Extends total construction timeline by 25-35%", "Requires active signal timing and checkpoint enforcement"],
      "mitigations": ["Install automated barrier gates with priority emergency vehicle detection", "Confine heavy excavation to off-peak daytime hours"],
      "scores": { "transport": 42, "essentialServices": 34, "population": 38, "disasterRisk": 36, "overall": 37.5 }
    },
    {
      "id": "opt_c",
      "title": "Option C — Night-Only Work Window (10:00 PM – 5:00 AM) with Full Daytime Opening",
      "optionType": "night_closure",
      "description": "2-3 sentences explaining EXACTLY what Option C is: target road is 100% open during all daytime and peak commuter hours (5:00 AM – 10:00 PM) with steel trench plating. All heavy machinery work is restricted strictly between 10:00 PM and 5:00 AM.",
      "benefits": ["Zero traffic disruption during morning and evening rush hours", "Normal daytime access for schools, hospitals, and local commercial businesses", "No diversion spillover onto residential streets"],
      "risks": ["Higher contractor labor and artificial floodlighting expenses", "Noise restrictions near residential settlements"],
      "mitigations": ["Install acoustic noise baffles around generators near residential areas", "Daily 5:00 AM mandatory structural safety inspections before reopening"],
      "scores": { "transport": 24, "essentialServices": 20, "population": 26, "disasterRisk": 22, "overall": 23.0 }
    }
  ],
  "recommendation": {
    "title": "AI Decision Support Recommendation: Implement Option B (Partial Phased Closure)",
    "recommendedOptionId": "opt_b",
    "recommendedOptionTitle": "Option B — Partial Phased Closure with Dedicated Emergency & Transit Lane",
    "summary": "1 paragraph clear rationale based on real local hospitals and transit preservation",
    "rationalePoints": ["point 1", "point 2"],
    "keyRisks": ["risk 1", "risk 2"],
    "mitigationMeasures": ["measure 1", "measure 2"],
    "assumptions": ["assumption 1", "assumption 2"],
    "dataLimitations": ["limitation 1"]
  },
  "overallScore": number (0-100)
}

Do not wrap in markdown quotes; output raw JSON only.`;
}

function formatGeminiResponseToSimulationResult(
  parsed: any,
  input: ScenarioInput,
  infra: InfrastructureLookupResult
): SimulationResult {
  const locationTitle = [infra.resolvedArea, input.locationName, input.district, 'Tamil Nadu'].filter(Boolean).join(', ');
  const targetAsset = input.selectedAsset || infra.assets[0]?.name || input.description;

  return {
    simulationId: `sim_gemini_${Date.now()}`,
    timestamp: new Date().toISOString(),
    isLiveGemini: true,
    input: {
      ...input,
      location: locationTitle,
      latitude: input.latitude !== undefined && Number.isFinite(input.latitude) ? input.latitude : infra.center.latitude,
      longitude: input.longitude !== undefined && Number.isFinite(input.longitude) ? input.longitude : infra.center.longitude,
      selectedAsset: targetAsset
    },
    policy: {
      action: parsed.policy?.action || "Proposed Infrastructure Action",
      asset: parsed.policy?.asset || targetAsset,
      location: locationTitle,
      duration: parsed.policy?.duration || input.duration || "30 days",
      reason: parsed.policy?.reason || input.reason || "Civil Maintenance",
      constraints: parsed.policy?.constraints || [],
      affectedArea: parsed.policy?.affectedArea || `${infra.resolvedArea} Impact Corridor`,
      summary: parsed.policy?.summary || input.description,
      dataSource: 'verified_geographic_data'
    },
    populationContext: infra.populationContext,
    agentAnalyses: parsed.agentAnalyses,
    cascadingGraph: parsed.cascadingGraph,
    alternatives: parsed.alternatives,
    comparison: {
      options: parsed.alternatives || [],
      recommendedOptionId: parsed.recommendation?.recommendedOptionId || "opt_b",
      rationale: parsed.recommendation?.summary || "Recommended option minimizes overall cross-department service disruption."
    },
    recommendation: parsed.recommendation,
    overallScore: parsed.overallScore || 65
  };
}

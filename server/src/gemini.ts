import { GoogleGenAI } from '@google/genai';
import {
  SimulationResult,
  ScenarioInput,
  PolicyCategory,
  AgentImpactDomain,
  PolicyUnderstanding,
  AgentAnalysis,
  BalancedDecisionEvaluation,
  GainClassification,
  FrictionClassification,
  getGainClassification,
  getFrictionClassification,
  LocationImpactContext,
} from './types.js';
import {
  generateGenericFallbackResult,
  MANDATORY_DISCLAIMER,
  detectPolicyIntentAndArchetype,
  buildBalancedDecisionEvaluation,
  computeFrameworkGainAndFriction,
} from './demoFallback.js';
import {
  resolveLocationAdministrativeProfile,
  LocationAdministrativeContext,
} from './locationContextData.js';
import { findInfrastructure, InfrastructureLookupResult } from './infrastructure.js';
import { AgentRegistry } from './agents/registry.js';
import { classifyPolicy } from './agents/implementations.js';
import { extractStructuredProposalUnderstanding } from './proposalUnderstanding.js';
import { analyzeLocationConditionedImpact } from './locationConditionedAnalysis.js';

export async function runGeminiSimulation(input: ScenarioInput): Promise<SimulationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Fetch geographic infrastructure & demographic context
  const infrastructureData = await findInfrastructure(
    input.latitude !== undefined && Number.isFinite(input.latitude) ? input.latitude : 11.2189,
    input.longitude !== undefined && Number.isFinite(input.longitude) ? input.longitude : 78.1674,
    input.district || 'Tamil Nadu',
    input.area || input.town || input.city,
    input.locationName
  );

  const locationProfile = resolveLocationAdministrativeProfile(input);
  const structuredUnderstanding = extractStructuredProposalUnderstanding(input);
  const locAnalysis = analyzeLocationConditionedImpact(
    structuredUnderstanding,
    input,
    infrastructureData,
    locationProfile
  );
  const locationImpactContext = locAnalysis.locationImpactContext;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    console.log('[Gemini Engine] No valid GEMINI_API_KEY found. Utilizing dynamic fallback mode.');
    return getFallbackSimulation(input, infrastructureData, locationImpactContext);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildOrchestrationPrompt(input, infrastructureData, locationProfile, locationImpactContext);

    let jsonText = '';
    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini Engine] Dispatching simulation to ${modelName} for "${input.description.substring(0, 40)}..."`);
        const generatePromise = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini API call timed out after 25s`)), 25000)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);
        const text = response?.text;
        if (text && text.trim().length > 0) {
          jsonText = text.trim();
          console.log(`[Gemini Engine] Simulation successfully obtained via ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Gemini Engine] Model ${modelName} failed or timed out:`, err?.message || err);
      }
    }

    if (!jsonText) {
      throw new Error('All live Gemini attempts were empty or unavailable.');
    }

    const parsed = JSON.parse(jsonText);
    return formatGeminiResponseToSimulationResult(parsed, input, infrastructureData, locationProfile, locationImpactContext);
  } catch (error: any) {
    console.warn('[Gemini Engine] Live Gemini analysis failed. Utilizing dynamic fallback simulation:', error?.message || error);
    return getFallbackSimulation(input, infrastructureData, locationImpactContext);
  }
}

function getFallbackSimulation(
  input: ScenarioInput,
  infrastructureData: InfrastructureLookupResult,
  locationImpactContext?: LocationImpactContext
): SimulationResult {
  const base = generateGenericFallbackResult(input);
  return {
    ...base,
    locationImpactContext: locationImpactContext || base.locationImpactContext,
    input: {
      ...input,
      latitude: input.latitude !== undefined && Number.isFinite(input.latitude) ? input.latitude : infrastructureData.center.latitude,
      longitude: input.longitude !== undefined && Number.isFinite(input.longitude) ? input.longitude : infrastructureData.center.longitude,
      selectedAsset: input.selectedAsset || base.policy.asset,
    },
    populationContext: infrastructureData.populationContext,
    policy: {
      ...base.policy,
      asset: input.selectedAsset || base.policy.asset,
      location: `${infrastructureData.resolvedArea}, ${input.locationName || input.district || 'Tamil Nadu'}, Tamil Nadu`,
      dataSource: 'verified_geographic_data',
    },
  };
}

function buildOrchestrationPrompt(
  input: ScenarioInput,
  infra: InfrastructureLookupResult,
  locContext?: LocationAdministrativeContext,
  locImpactContext?: LocationImpactContext
): string {
  const locationTitle = [infra.resolvedArea, input.town || input.city, input.district, 'Tamil Nadu'].filter(Boolean).join(', ');
  const targetAsset = input.selectedAsset || input.description;
  const structuredUnderstanding = extractStructuredProposalUnderstanding(input);
  const inferredCategory = structuredUnderstanding.primaryDomain;

  return `You are an experienced Municipal Administration Decision Analyst whose responsibility is to protect public welfare, environmental sustainability, legal compliance, and efficient municipal governance. You must never act like a project promoter, investment advisor, marketing assistant, or policy supporter. Every proposal must be critically evaluated with neutrality, caution, and evidence-based administrative reasoning.

FIVE INTERDEPENDENT EVALUATION INPUTS:
1. THE PROPOSAL: Literal meaning only. Zero assumed benefits.
2. THE SELECTED LOCATION: "${locationTitle}" (District: ${locContext?.district || input.district || 'Tamil Nadu'}, Area: ${locContext?.resolvedArea || infra.resolvedArea})
3. REAL-WORLD CONTEXTUAL INFORMATION:
   - Zoning Classification: ${locContext?.zoningClassification || 'Suburban Mixed'}
   - Approved Industrial Estate: ${locContext?.isApprovedIndustrialZone ? 'YES (SIPCOT/SIDCO zoned with CETP and buffer)' : 'NO'}
   - Agricultural / Farmland Belt: ${locContext?.isAgriculturalOrRuralZone ? 'YES (Active crop cultivation / agrarian tract)' : 'NO'}
   - Water Body / Eco-Buffer: ${locContext?.isEcoSensitiveOrWaterBuffer ? 'YES (Sensitive water body / catchment buffer)' : 'NO'}
   - High-Density Residential: ${locContext?.isHighDensityResidential ? 'YES (Dense residential wards / settlements)' : 'NO'}
   - Nearby Water Bodies: ${locContext?.nearbyWaterBodies?.join(', ') || 'Regional drainage network'}
   - Primary Livelihoods: ${locContext?.primaryLivelihoods?.join(', ') || 'Agrarian and trade employment'}
   - Vulnerabilities: ${locContext?.disasterVulnerabilities?.join('; ') || 'Standard seasonal hazards'}
   - Statutory Regimes: ${locContext?.applicableStatutoryFrameworks?.join('; ') || 'Standard municipal regulations'}
   - High-Risk Actions Detected: ${locContext?.highRiskActionsDetected?.join(', ') || 'None'}
   - Context Summary: ${locContext?.contextualAnalysisSummary || 'Standard municipal baseline'}
4. LOCATION-CONDITIONED ANALYSIS & SENSITIVE RECEPTORS (GROUND TRUTH):
   - Location Compatibility Score: ${locImpactContext?.locationCompatibilityScore ?? 50}/100
   - Location Suitability Status: "${locImpactContext?.locationCompatibilityClassification ?? 'Conditional / Safeguards Required'}"
   - Compatibility Rationale: ${locImpactContext?.compatibilityRationale ?? 'Baseline review'}
   - Identified Sensitive Receptors in Vicinity:
${(locImpactContext?.sensitiveReceptors || []).map(r => `     * ${r.name} (${r.type}) | Proximity: ${r.distanceOrProximity} | Status: ${r.verificationStatus} | Impact: ${r.potentialImpact}`).join('\n') || '     * None identified / Conforming zone'}
   - Location Unknowns (Must NOT hallucinate): ${locImpactContext?.locationUnknowns?.join('; ') || 'None'}
   - Proximity Mandate: NEVER hallucinate proximity or distances. Unstated distances MUST be marked UNKNOWN.
5. MUNICIPAL ADMINISTRATIVE REASONING:
   - Same proposal MUST yield different results in different locations:
     * Factory inside approved industrial estate (SIPCOT/SIDCO): Moderate Benefit (Gain 48–54), Manageable Risk (Friction 36–46).
     * Same factory in farmland/river basin/residential: Significantly higher environmental & social risk (Gain 10–26, Friction 82–95).
     * Dam flood water release: Gain 75–85, Friction 20–30. Dam drought water diversion: Gain 10–20, Friction 90–98.
     * Road widening on vacant bypass: Gain 70–80, Friction 24–34. Road widening in dense residential/bazaar street: Gain 25–35, Friction 82–94.
   - For domains with no direct impact, assign "Minimal/No Direct Impact" and 0 friction (do NOT assign arbitrary 15-20 friction).
     * Dam flood water release: Gain 75–85, Friction 20–30. Dam drought water diversion: Gain 10–20, Friction 90–98.
     * Road widening on vacant bypass: Gain 70–80, Friction 24–34. Road widening in dense residential/bazaar street: Gain 25–35, Friction 82–94.

PROPOSAL UNDERSTANDING & CLASSIFICATION (GROUND TRUTH PRE-ANALYSIS):
- Objective: ${structuredUnderstanding.proposalObjective}
- Primary Action: ${structuredUnderstanding.primaryAction}
- Asset / Project: ${structuredUnderstanding.asset}
- Sector: ${structuredUnderstanding.sector}
- Primary Administrative Domain: "${structuredUnderstanding.primaryDomain}"
- Secondary Affected Domains: ${structuredUnderstanding.secondaryDomains.join(', ') || 'None'}
- Responsible Department: "${structuredUnderstanding.responsibleDepartment}"
- Lead Administrative Authority: "${structuredUnderstanding.leadAdministrativeAuthority}"
- Administrative Level: ${structuredUnderstanding.administrativeLevel}
- Operational Scale: ${structuredUnderstanding.scale}
- Stated Budget: "${structuredUnderstanding.budget}"
- Stated Affected Population: "${structuredUnderstanding.affectedPopulation}"
- Stated Land Type: "${structuredUnderstanding.landType}"
- Explicit Stakeholders: ${structuredUnderstanding.explicitStakeholders.join(', ') || 'None explicitly stated'}
- Inferred Stakeholders: ${structuredUnderstanding.inferredStakeholders.join(', ')}
- Critical Unknowns / Data Gaps: ${structuredUnderstanding.unknowns.join('; ')}

MANDATORY CLASSIFICATION MANDATE:
Do NOT reclassify the proposal into unrelated domains based on isolated words (for example, NEVER classify a Legislative Assembly as Education just because the word "campus" appears). The Primary Administrative Domain is "${structuredUnderstanding.primaryDomain}".

PRIMARY SOURCE OF TRUTH MANDATE (STRICT RULES):
The user's proposal must be treated as the PRIMARY SOURCE OF TRUTH.
1. DO NOT invent facts about the proposal.
2. DO NOT assume that a proposed project automatically creates roads, hospitals, schools, utilities, employment numbers, public support, environmental benefits, or infrastructure improvements.
3. DO NOT generate numerical statistics such as "89% public approval", "85,000 residents", "+28% productivity", "100% hospital access", "1:10 afforestation", "100% compliance", "50-year infrastructure life", etc. unless explicitly provided by the user.
4. Clearly distinguish between:
   - FACTS stated in the proposal
   - REASONABLE POTENTIAL IMPACTS (must be explicitly labeled as "Potential:" or "Possible:")
   - UNKNOWN / INSUFFICIENT INFORMATION (e.g. Number of jobs: Unknown, Public approval: Unknown, Pollution level: Unknown, Water requirement: Unknown, Environmental clearance status: Unknown, Exact affected population: Unknown)
5. If the proposal does not provide evidence for a positive impact, do NOT treat that impact as a positive fact. Potential benefits may be identified, but must be labelled as "Potential" rather than presented as confirmed outcomes.
6. Negative impacts must be considered equally and must not be hidden by assumed economic benefits.
7. If a domain has no meaningful connection to the proposal (for example, a textile factory proposal has no direct connection to Education, Disaster Resilience, Healthcare, or Public Safety), return:
   "Minimal/No Direct Impact"
   instead of inventing a benefit. Set positiveScore to 0 and state that the domain has no direct connection to the proposal.

Analyze this proposed administrative decision in Tamil Nadu, India:
GEOGRAPHIC CONTEXT (Background Municipal Vicinity only; do NOT assume proposal affects these unless specified):
RESOLVED ADMINISTRATIVE SECTOR: "${infra.resolvedArea}"
VICINITY INVENTORY (For municipal background only):
- Hospitals / PHCs in Area: ${infra.emergencyHospitals?.map(h => h.name).join(', ') || 'None stated in immediate vicinity'}
- Schools / Colleges in Area: ${infra.schools?.map(s => s.name).join(', ') || 'None stated in immediate vicinity'}
- Transit Links in Area: ${infra.transitLinks?.map(t => t.name).join(', ') || 'State Highway Corridors'}
PROPOSED ADMINISTRATIVE DECISION: "${input.description}"
PRE-CLASSIFIED DOMAIN HINT: "${inferredCategory}"
SPECIFIED DEPARTMENT: "${structuredUnderstanding.responsibleDepartment}"
DURATION / TIMELINE: "${input.duration || structuredUnderstanding.unknowns.find(u => u.includes('duration')) || 'Proposed administrative timeline'}"
REASON / RATIONALE: "${input.reason || structuredUnderstanding.proposalObjective}"
CONSTRAINTS: "${input.constraints || 'Maintain emergency services & public safety'}"

YOUR RESPONSIBILITIES:
1. POLICY UNDERSTANDING AGENT:
   Extract all 12 structured dimensions:
   - Decision Type (e.g. New Construction, Environmental Clearance, Evacuation, Relocation, Dam Discharge, Traffic Diversion)
   - Administrative Department
   - Location
   - Affected Area
   - Duration
   - Reason
   - Scale (Local, Zonal, City-wide, District-wide, Regional, State-wide)
   - Stakeholders (list of key affected citizen and institutional groups)
   - Infrastructure (civic and administrative assets involved)
   - Resources Required (personnel, equipment, statutory NOCs)
   - Urgency (Low, Standard, Urgent, Emergency)
   - Confidence Score (0-100)
   - Category (Must be one of: 'Infrastructure', 'Transport', 'Disaster Management', 'Urban Planning', 'Municipal Administration', 'Water Resources', 'Public Safety', 'Healthcare', 'Education', 'Environment', 'Industry', 'Agriculture', 'Energy', 'Housing', 'Revenue', 'Police', 'Forest', 'Tourism', 'Others')
   - Summary (2-sentence neutral executive briefing)

2. MULTI-AGENT DOMAIN ANALYSIS (Execute all 9 specialized domain agents independently with strict evidence-based neutrality):
   - Transport Impact Agent (Roads, Traffic, Diversions, Travel time, Ambulance access, Public transport, Rail)
   - Infrastructure Agent (Utilities, Roads, Bridges, Power, Water, Drainage, Telecom, Administrative assets)
   - Population Impact Agent (Residents, Businesses, Schools, Accessibility, Vulnerable groups, Daily life, Migration)
   - Essential Services Agent (Hospitals, Fire, Police, Ambulance, Schools, Administrative offices, Emergency response)
   - Economic Agent (Business revenue, Employment, Logistics, Supply chains, Local trade)
   - Environmental Agent (Air quality, Water resources, Trees, Noise, Floodplain, Wetlands, Climate impact)
   - Disaster Risk Agent (Flood, Fire, Cyclone, Earthquake, Heatwave, Emergency evacuation, Resilience)
   - Social Impact Agent (Community acceptance, Safety, Livelihood, Social harmony, Quality of life)
   - Policy Compliance Agent (Administrative norms, Safety principles, Administrative constraints, Basic regulations)

   CRITICAL ANTI-HALLUCINATION & EVIDENCE RULES FOR EACH DOMAIN AGENT:
   - If a domain is NOT explicitly supported or addressed by the proposal (e.g., healthcare, education, or environmental improvements in an unrelated decision):
     * Set positiveScore to 0 or low neutral baseline (never 75-95).
     * In summary and findings, state: "Insufficient evidence in proposal to substantiate domain benefits."
     * NEVER fabricate public approval (e.g. "88% Public Approval") or compliance claims unless documented in the proposal.
   - If the proposal involves displacement of residents, destruction of agricultural land, pollution, hazardous industries, or loss of livelihoods:
     * Population, Social, Environmental, and Policy Compliance agents MUST assign HIGH RISK SCORES (75-95/100) and LOW POSITIVE SCORES (0-15/100).
     * Societal Benefit MUST NOT exceed 25 (Very Low Gain).
     * Execution Risk MUST be between 75 and 98 (High to Very High Friction).
     * cascadingGraph MUST prominently show disruption nodes (displacement trauma, loss of fertile soil/homes, public outrage, legal stays).
     * recommendation MUST advise REJECTING or HALTING in current form, recommending Alternative A (e.g. zero-displacement or 100% farmland preservation).
   - For genuinely beneficial public welfare proposals (e.g. building a public hospital or clinic):
     * Assign evidenced positive scores to affected domains, but maintain realistic construction friction (15-35/100).
     * Unevidenced domains must still note "Insufficient evidence" rather than hallucinated benefits.

   Each agent in agentAnalyses must assign:
   - score: 0-100 (Operational Friction / Disruption / Harm index)
   - positiveScore: 0-100 (Evidenced Societal Benefit / Value Gain index, or 0 if unevidenced)
   - overallSeverity: 'very_low'|'low'|'moderate'|'high'|'critical'
   - confidence: 0-100
   - summary: objective, evidence-based domain summary
   - positiveFindings: array of findings with polarity: 'positive' (ONLY if evidenced in proposal)
   - negativeFindings: array of findings with polarity: 'negative'
   - findings: combined findings array with polarity: 'positive' | 'negative' | 'neutral' (include 'Insufficient evidence' findings where data is lacking)
   - metrics: 3 quantifiable metrics with labels, values, and trends ('positive' | 'negative' | 'neutral')

3. CASCADING IMPACT ENGINE (Signature Feature):
   Generate a directional cause-and-effect chain of at least 5 linked nodes.
   Every node MUST explicitly specify:
   - id: string (e.g. "node_1")
   - label: string (Node title)
   - cause: string (What triggered this specific effect)
   - effect: string (What immediate consequence occurs)
   - severity: 'very_low' | 'low' | 'moderate' | 'high' | 'critical'
   - confidence: number (0 to 100)
   - department: string (Responsible agency)
   - description: string
   - type: 'decision' | 'direct_effect' | 'secondary_effect' | 'service_impact' | 'critical_consequence'
   - polarity: 'positive' | 'negative' | 'neutral'

4. WHAT-IF MULTI-STRATEGY COMPARISON TABLE:
   Generate 4 comparative strategies:
   - Original Decision (Baseline proposal as proposed)
   - Alternative A (e.g., Phased / Modular Execution or Zero-Displacement Location - Recommended)
   - Alternative B (e.g., Off-Peak Execution / Modified Footprint)
   - Alternative C (e.g., Buffer Method / Alternate Route)

   Provide scores across the required matrix columns:
   - transport (0-100)
   - economy (0-100)
   - environment (0-100)
   - safety (0-100)
   - population (0-100)
   - cost (e.g. "₹ Baseline", "₹ Baseline + 5%", "Budget Neutral")
   - implementationDifficulty ('Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme')
   - overallRisk ('very_low' | 'low' | 'moderate' | 'high' | 'critical')
   - recommendationStatus ('Recommended' | 'Baseline / Proposed' | 'Secondary Option' | 'Contingency')
   - advantages (list of benefits)
   - disadvantages (list of risks)
   - mitigations (list of actionable steps)

5. RECOMMENDATION AGENT (Neutral Administrative Appraisal):
   The recommendation MUST be an objective administrative appraisal rather than promotional marketing praise.
   - For proposals with severe harm (displacement, farmland loss, pollution, hazards): Advise REJECTION or FUNDAMENTAL RESTRUCTURING (Alternative A).
   - For unevidenced or mixed proposals: Advise CONDITIONAL CLEARANCE WITH MANDATORY FIELD AUDITS & PRECAUTIONARY GUARDRAILS, citing specific evidence gaps.
   - For genuinely beneficial public welfare projects: Advise PROCEED WITH STANDARD PRECAUTIONARY SAFEGUARDS.
   - title: string
   - recommendedOptionId: string
   - recommendedOptionTitle: string
   - why: clear rationale explaining why this option is administratively appropriate
   - summary: comprehensive executive recommendation
   - benefits: string[] (evidenced only)
   - risks: string[]
   - mitigations: string[]
   - precautions: string[]
   - confidence: number (0-100)
   - assumptions: string[]
   - dataLimitations: string[] (must cite unevidenced areas)
6. MANDATORY IMPACT SCORING FRAMEWORK (Gain Score & Friction Score):
   The agent must evaluate proposals objectively and never assume that economic growth alone indicates a positive outcome.

   Step 1: Analyze the proposal across these 8 impact dimensions:
   - Economic Impact
   - Environmental Impact
   - Social Impact
   - Public Health & Safety
   - Municipal Administration
   - Infrastructure
   - Legal & Policy Compliance
   - Long-Term Sustainability

   Step 2: Calculate the Gain Score (NET BENEFIT after considering BOTH positive and negative impacts):
   - Start from a neutral score of 50.
   - Increase (+) for: Employment generation, economic growth, revenue increase, better public services, infrastructure improvement, efficient municipal administration, improved quality of life.
   - Decrease (-) for: Destruction of agricultural land, environmental degradation, deforestation, pollution, loss of biodiversity, public health risks, displacement of residents, loss of livelihoods, water scarcity, traffic congestion, high maintenance costs, legal violations, poor sustainability.
   - STRICT RULE: A proposal with severe environmental or social damage MUST NOT receive a High Gain score, even if it creates jobs or increases revenue.
   - Gain Classification: 0–25 = Very Low Gain | 26–45 = Low Gain | 46–60 = Moderate Gain | 61–80 = High Gain | 81–100 = Very High Gain.

   Step 3: Calculate the Friction Score (measures resistance, implementation difficulty, and risks):
   - Start from a neutral score of 20.
   - Increase (+) for: Public opposition, farmer protests, environmental concerns, political resistance, legal disputes, high implementation cost, long approval process, complex execution, safety concerns, resource conflicts, administrative challenges.
   - Decrease (-) for: Strong public support, easy implementation, low cost, low environmental impact, clear legal compliance, high administrative feasibility.
   - Friction Classification: 0–20 = Very Low Friction | 21–40 = Low Friction | 41–60 = Moderate Friction | 61–80 = High Friction | 81–100 = Very High Friction.

   Final Decision Rules (STRICT):
   - The Gain Score MUST represent overall net benefit, not just economic benefit.
   - Negative environmental, agricultural, social, legal, and sustainability impacts MUST reduce the Gain Score.
   - The Friction Score MUST increase whenever there are environmental, legal, social, political, or administrative challenges.
   - Never assign "High Gain" solely because a proposal generates revenue or employment.
   - Example: Proposal: Convert fertile agricultural land into an industrial zone -> Gain: Low to Moderate (20–45), Friction: High to Very High (70–100).
   - Always justify both scores with concise reasoning in gainJustification and frictionJustification.

7. MANDATORY BALANCED DECISION EVALUATION RULES:
   - Complete neutrality and objectivity: Never assume that economic growth, revenue generation, or infrastructure development automatically makes a proposal positive.
   - Identify ALL positive impacts and ALL negative impacts.
   - Assign each dimension one of: 'High Positive', 'Moderate Positive', 'Neutral', 'Moderate Negative', 'High Negative'.
   - Weigh all 8 dimensions equally (12.5% each). Do NOT prioritize economic benefits over environmental, social, legal, or sustainability impacts.
   - Severe reductions override: If a proposal causes irreversible environmental damage, destruction of agricultural land, displacement of people, serious pollution, public safety risks, or municipal violations, these MUST significantly reduce the overall assessment and trigger severe impact warnings.
   - If both significant positive and negative impacts exist, classify overall as "Mixed" rather than "Positive".
   - Only classify as "Positive" when overall benefits clearly outweigh drawbacks across all evaluated dimensions.
   - Only classify as "Negative" when overall risks and adverse impacts outweigh benefits.
   - State uncertainties if information is insufficient.
   - Analysis must always explain WHY the proposal was classified as Positive, Mixed, or Negative using evidence from each impact category.

RETURN STRICT RAW JSON conforming to this schema without markdown fences:
{
  "polarity": "positive" | "negative" | "mixed",
  "gainScore": number (0-100 net benefit score starting from neutral 50),
  "gainClassification": "Very Low Gain" | "Low Gain" | "Moderate Gain" | "High Gain" | "Very High Gain",
  "gainJustification": string (concise justification of net gain score),
  "frictionScore": number (0-100 resistance & risk score starting from neutral 20),
  "frictionClassification": "Very Low Friction" | "Low Friction" | "Moderate Friction" | "High Friction" | "Very High Friction",
  "frictionJustification": string (concise justification of friction score),
  "overallPolicyRisk": number (equals frictionScore),
  "overallSocietalBenefit": number (equals gainScore),
  "overallScore": number (equals frictionScore),
  "netViability": {
    "status": "Highly Favorable" | "Favorable with Safeguards" | "Balanced Trade-off" | "High Friction Precaution" | "Unfavorable — Net Negative Impact" | "Severely Unfavorable — High Social & Environmental Risk",
    "badgeClass": string,
    "netScore": number,
    "summary": string
  },
  "policy": { ... },
  "agentAnalyses": {
    "transport": { ... },
    "infrastructure": { ... },
    "population": { ... },
    "essential_services": { ... },
    "economic": { ... },
    "environmental": { ... },
    "disaster_risk": { ... },
    "social": { ... },
    "policy_compliance": { ... }
  },
  "cascadingGraph": {
   Primary format:
   - primaryChainSummary: "Initiation Node → Primary Interruption → Secondary Ripple → Structural Strain → Macro Policy Outcome"
   - nodes: array of 5 to 7 nodes, each having id ('node_1', 'node_2', etc.), label, description, cause, effect, severity ('very_low'|'low'|'moderate'|'high'|'critical'), confidence (0-100), department, type ('decision'|'direct_effect'|'secondary_effect'|'service_impact'|'critical_consequence'), polarity ('positive'|'negative'|'neutral')
   - edges: array of directional connections between nodes with descriptive action labels

4. WHAT-IF SCENARIO COMPARISON MATRIX (Signature Feature):
   Generate 4 concrete strategic pathways:
   - Original Proposal (Baseline: Direct Execution)
   - Alternative A (e.g. Phased / Modular Execution or Zero-Displacement Location - Recommended)
   - Alternative B (e.g. Off-Peak / Buffer Zone / Alternative Technology Execution)
   - Alternative C (e.g. Satellite Corridor / Eco-Friendly / Distributed Model)
   Each option must include:
   - id: 'opt_original', 'opt_a', 'opt_b', 'opt_c'
   - title: clear title
   - optionType: category descriptor
   - description: 2-sentence mechanism description
   - advantages: 3 to 4 concrete bullet points
   - disadvantages: 2 to 3 trade-offs
   - mitigations: 2 operational fixes
   - scores: transport, economy, environment, safety, population, overall (all 0-100)
   - cost: qualitative indicator with estimate
   - implementationDifficulty: 'Low'|'Moderate'|'High'|'Extreme'
   - overallRisk: 'very_low'|'low'|'moderate'|'high'|'critical'
   - recommendationStatus: 'Baseline / Proposed' | 'Recommended' | 'Secondary Option' | 'Contingency'

5. EXPLAINABLE RECOMMENDATION AGENT:
   - title: Action-oriented recommendation title
   - recommendedOptionId: string matching one of the alternatives (usually 'opt_a')
   - recommendedOptionTitle: string title of the recommended option
   - why: clear 2-sentence rationale on why this alternative delivers the best balance
   - summary: executive briefing summary
   - benefits: 4 high-impact outcomes
   - risks: 3 manageable operational challenges
   - mitigations: 3 actionable administrative steps
   - precautions: 2 statutory / safety watchpoints
   - confidence: 0-100
   - assumptions: 2 key planning premises
   - dataLimitations: 1 sentence on data boundaries

JSON OUTPUT SCHEMA MUST BE STRICTLY COMPLIANT WITH THIS STRUCTURE.`;
}

function formatGeminiResponseToSimulationResult(
  parsed: any,
  input: ScenarioInput,
  infra: InfrastructureLookupResult,
  locContext?: LocationAdministrativeContext,
  locImpactContext?: LocationImpactContext
): SimulationResult {
  const locationTitle = [infra.resolvedArea, input.town || input.city, input.district, 'Tamil Nadu'].filter(Boolean).join(', ');
  const targetAsset = input.selectedAsset || input.description;

  const registry = AgentRegistry.getInstance();
  const agentAnalyses: Record<AgentImpactDomain, AgentAnalysis> = {} as any;

  const domainKeys: AgentImpactDomain[] = [
    'transport',
    'infrastructure',
    'population',
    'essential_services',
    'economic',
    'environmental',
    'disaster_risk',
    'social',
    'policy_compliance',
  ];

  for (const domain of domainKeys) {
    const condEval = locImpactContext?.domainConditionEvaluations ? locImpactContext.domainConditionEvaluations[domain] : undefined;
    const isMinimalImpact = condEval?.relevance === 'Minimal/No Direct Impact' || condEval?.impactClassification === 'Minimal/No Direct Impact';
    const condSummary = condEval?.positiveImpacts?.[0] || condEval?.negativeImpacts?.[0] || condEval?.locationFactors?.[0] || `Minimal/No direct impact on ${domain.replace('_', ' ')} under verified local conditions.`;

    if (parsed.agentAnalyses && parsed.agentAnalyses[domain]) {
      const raw = parsed.agentAnalyses[domain];
      agentAnalyses[domain] = {
        domain,
        domainName: raw.domainName || `${domain.replace('_', ' ').toUpperCase()} Agent`,
        overallSeverity: isMinimalImpact ? 'very_low' : (raw.overallSeverity || 'moderate'),
        score: isMinimalImpact ? 0 : (typeof raw.score === 'number' ? raw.score : 35),
        positiveScore: isMinimalImpact ? 0 : (typeof raw.positiveScore === 'number' ? raw.positiveScore : undefined),
        confidence: typeof raw.confidence === 'number' ? raw.confidence : (condEval?.confidence ?? 88),
        summary: isMinimalImpact
          ? condSummary
          : (raw.summary || `Analysis completed for ${domain}.`),
        findings: isMinimalImpact
          ? [
              {
                id: `${domain}_min_1`,
                title: 'Minimal Direct Footprint',
                description: condSummary,
                severity: 'very_low',
                sourceAgent: domain,
                provenance: 'verified_geographic_data',
                entityAffected: 'Surrounding District & Infrastructure',
                polarity: 'neutral',
              },
            ]
          : (Array.isArray(raw.findings) ? raw.findings : []),
        positiveFindings: isMinimalImpact ? [] : (Array.isArray(raw.positiveFindings) ? raw.positiveFindings : []),
        negativeFindings: isMinimalImpact ? [] : (Array.isArray(raw.negativeFindings) ? raw.negativeFindings : []),
        metrics: Array.isArray(raw.metrics) ? raw.metrics : [],
        conditionEvaluation: condEval,
      };
    } else {
      agentAnalyses[domain] = {
        domain,
        domainName: `${domain.replace('_', ' ').toUpperCase()} Agent`,
        overallSeverity: isMinimalImpact ? 'very_low' : 'moderate',
        score: isMinimalImpact ? 0 : 50,
        positiveScore: isMinimalImpact ? 0 : undefined,
        confidence: condEval?.confidence ?? 85,
        summary: isMinimalImpact
          ? condSummary
          : `Domain impact analysis for ${domain.replace('_', ' ')} completed with standard baseline.`,
        findings: isMinimalImpact
          ? [
              {
                id: `${domain}_min_1`,
                title: 'Minimal Direct Footprint',
                description: condSummary,
                severity: 'very_low',
                sourceAgent: domain,
                provenance: 'verified_geographic_data',
                entityAffected: 'Surrounding District & Infrastructure',
                polarity: 'neutral',
              },
            ]
          : [],
        metrics: [],
        conditionEvaluation: condEval,
      };
    }
  }

  const inferredCat = classifyPolicy(input.description, input.department);
  const semanticIntent = detectPolicyIntentAndArchetype(input.description, inferredCat);

  const rawPolarity: 'positive' | 'negative' | 'mixed' = parsed.polarity || (
    (parsed.overallPolicyRisk || 0) >= 65 || (parsed.overallScore || 0) >= 65 ? 'negative' :
    (parsed.overallSocietalBenefit || 0) >= 65 ? 'positive' : 'mixed'
  );

  const framework = computeFrameworkGainAndFriction(
    agentAnalyses,
    semanticIntent.polarity === 'negative' ? 'negative' : rawPolarity,
    input.description,
    semanticIntent.archetype,
    locContext,
    locImpactContext
  );

  let gainScore = typeof parsed.gainScore === 'number' ? parsed.gainScore : framework.gainScore;
  let frictionScore = typeof parsed.frictionScore === 'number' ? parsed.frictionScore : framework.frictionScore;

  // Enforce mandatory decision rules:
  // "A proposal with severe environmental or social damage MUST NOT receive a High Gain score, even if it creates jobs or increases revenue."
  // Benchmark rule: "Convert fertile agricultural land into an industrial zone -> Gain: Low to Moderate (20-45), Friction: High to Very High (70-100)"
  if (semanticIntent.polarity === 'negative' || semanticIntent.archetype === 'agricultural_destruction_hazard') {
    if (semanticIntent.archetype === 'agricultural_destruction_hazard' && /(industrial|zone|factory)/i.test(input.description)) {
      gainScore = Math.max(22, Math.min(42, gainScore));
      frictionScore = Math.max(76, Math.min(95, frictionScore));
    } else if (semanticIntent.polarity === 'negative') {
      if (gainScore > 25) gainScore = framework.gainScore;
      if (frictionScore < 75) frictionScore = framework.frictionScore;
    } else {
      if (gainScore > 45) gainScore = framework.gainScore;
      if (frictionScore < 70) frictionScore = framework.frictionScore;
    }
  }

  const gainClassification = (parsed.gainClassification && typeof parsed.gainClassification === 'string' && parsed.gainClassification.includes('Gain'))
    ? (parsed.gainClassification as GainClassification)
    : getGainClassification(gainScore);

  const frictionClassification = (parsed.frictionClassification && typeof parsed.frictionClassification === 'string' && parsed.frictionClassification.includes('Friction'))
    ? (parsed.frictionClassification as FrictionClassification)
    : getFrictionClassification(frictionScore);

  const gainJustification = (parsed.gainJustification && typeof parsed.gainJustification === 'string' && parsed.gainJustification.length > 10)
    ? parsed.gainJustification
    : framework.gainJustification;

  const frictionJustification = (parsed.frictionJustification && typeof parsed.frictionJustification === 'string' && parsed.frictionJustification.length > 10)
    ? parsed.frictionJustification
    : framework.frictionJustification;

  const impactScores = {
    ...registry.computeImpactScores(agentAnalyses, semanticIntent.polarity === 'negative' ? 'negative' : rawPolarity, input.description),
    gainScore,
    gainClassification,
    gainJustification,
    frictionScore,
    frictionClassification,
    frictionJustification,
    overallPolicyRisk: frictionScore,
    overallSocietalBenefit: gainScore,
  };

  let policyRisk = frictionScore;
  let societalBenefit = gainScore;

  // Derive accurate polarity with semantic intent override
  let finalPolarity: 'positive' | 'negative' | 'mixed' = rawPolarity;
  if (semanticIntent.polarity === 'negative') {
    finalPolarity = 'negative';
  } else if (policyRisk >= 65 || (policyRisk - societalBenefit) >= 20 || gainScore <= 45) {
    finalPolarity = 'negative';
  } else if (societalBenefit >= 68 && policyRisk <= 40) {
    finalPolarity = 'positive';
  }

  // Derive coherent Net Viability
  const netScore = Math.max(5, Math.min(98, Math.round(((societalBenefit * 1.3) - (policyRisk * 1.1) + 100) / 2)));
  let viabilityStatus:
    | 'Highly Favorable'
    | 'Favorable with Safeguards'
    | 'Balanced Trade-off'
    | 'High Friction Precaution'
    | 'Unfavorable — Net Negative Impact'
    | 'Severely Unfavorable — High Social & Environmental Risk' = 'Favorable with Safeguards';
  let badgeClass = 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
  let viabilitySummary = '';

  if (finalPolarity === 'negative' || policyRisk >= 70 || (policyRisk - societalBenefit) >= 25) {
    viabilityStatus = policyRisk >= 75
      ? 'Severely Unfavorable — High Social & Environmental Risk'
      : 'Unfavorable — Net Negative Impact';
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-black';
    viabilitySummary = parsed.netViability?.summary ||
      (semanticIntent.archetype === 'agricultural_destruction_hazard'
        ? `Simulation identifies critical destruction of fertile agricultural lands, acute threat to rural food security, and agrarian livelihood collapse (${policyRisk}/100) with near-zero societal benefit (${societalBenefit}/100). Strongly advised to immediately reject farmland conversion in favor of 100% agricultural preservation.`
        : `Critical social disruption, human displacement, and environmental risks (${policyRisk}/100) heavily outweigh projected benefits (${societalBenefit}/100). The proposal has a Net Negative impact and adoption in its current form is strongly discouraged without fundamental restructuring.`);
  } else if (policyRisk >= 50) {
    viabilityStatus = 'High Friction Precaution';
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    viabilitySummary = parsed.netViability?.summary ||
      `Notable execution friction and operational challenges (${policyRisk}/100) balanced with strategic output (${societalBenefit}/100). Phased citizen safeguards and strict compliance required.`;
  } else if (finalPolarity === 'positive' || (societalBenefit >= 70 && policyRisk <= 40)) {
    viabilityStatus = 'Highly Favorable';
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
    viabilitySummary = parsed.netViability?.summary ||
      `Positive societal welfare and public infrastructure gains (${societalBenefit}/100) substantially surpass manageable execution frictions (${policyRisk}/100).`;
  } else {
    viabilityStatus = 'Balanced Trade-off';
    badgeClass = 'bg-slate-100 text-slate-800 border-slate-300 font-medium';
    viabilitySummary = parsed.netViability?.summary ||
      `Balanced policy impact profile with manageable operational risks (${policyRisk}/100) and steady welfare gain (${societalBenefit}/100).`;
  }

  const netViability = {
    status: (parsed.netViability?.status && parsed.netViability.status.includes('Unfavorable') && finalPolarity === 'negative')
      ? parsed.netViability.status
      : viabilityStatus,
    badgeClass,
    netScore,
    summary: viabilitySummary,
    polarity: finalPolarity,
  };

  const structuredUnderstanding = extractStructuredProposalUnderstanding(input);

  const policy: PolicyUnderstanding = {
    decisionType: parsed.policy?.decisionType || structuredUnderstanding.primaryAction || 'Administrative Policy Decision',
    department: parsed.policy?.department || structuredUnderstanding.responsibleDepartment || 'District Administration',
    location: locationTitle,
    affectedArea: parsed.policy?.affectedArea || `${infra.resolvedArea} Impact Sector`,
    duration: parsed.policy?.duration || input.duration || 'Unstated in proposal (Subject to administrative DPR / project sanction)',
    reason: parsed.policy?.reason || structuredUnderstanding.proposalObjective || 'Public interest infrastructure & governance upgrade',
    scale: parsed.policy?.scale || (structuredUnderstanding.scale as any) || 'Zonal',
    stakeholders: parsed.policy?.stakeholders || (structuredUnderstanding.explicitStakeholders.length > 0 ? structuredUnderstanding.explicitStakeholders : ['Residents', 'Local Businesses', 'Emergency Services']),
    infrastructure: parsed.policy?.infrastructure || [structuredUnderstanding.asset || targetAsset],
    resourcesRequired: parsed.policy?.resourcesRequired || ['Personnel', 'Civil Equipment', 'Statutory Approvals'],
    urgency: parsed.policy?.urgency || (structuredUnderstanding.urgency as any) || 'Standard',
    confidenceScore: parsed.policy?.confidenceScore || structuredUnderstanding.confidence || 88,
    category: (structuredUnderstanding.primaryDomain as PolicyCategory) || parsed.policy?.category || classifyPolicy(input.description, input.department),
    summary: parsed.policy?.summary || structuredUnderstanding.proposalObjective || input.description,
    action: parsed.policy?.decisionType || structuredUnderstanding.primaryAction || 'Proposed Action',
    asset: targetAsset,
    constraints: parsed.policy?.constraints || ['Preserve emergency hospital access'],
    dataSource: 'verified_geographic_data',
    proposalUnderstanding: structuredUnderstanding,
  };

  const alternatives = parsed.alternatives || [];
  const recommendedOpt = alternatives.find((a: any) => a.recommendationStatus === 'Recommended') || alternatives[1] || alternatives[0];

  return {
    simulationId: `sim_gemini_${Date.now()}`,
    timestamp: new Date().toISOString(),
    isLiveGemini: true,
    input: {
      ...input,
      location: locationTitle,
      latitude: input.latitude !== undefined && Number.isFinite(input.latitude) ? input.latitude : infra.center.latitude,
      longitude: input.longitude !== undefined && Number.isFinite(input.longitude) ? input.longitude : infra.center.longitude,
      selectedAsset: targetAsset,
    },
    policy,
    populationContext: infra.populationContext,
    agentAnalyses,
    impactScores: {
      ...impactScores,
      overallPolicyRisk: policyRisk,
      overallSocietalBenefit: societalBenefit,
      netViabilityScore: netScore,
      polarity: finalPolarity,
    },
    cascadingGraph: parsed.cascadingGraph || {
      primaryChainSummary: 'Decision → Mobility Impact → Essential Service Impact → Community Risk',
      nodes: [],
      edges: [],
    },
    alternatives,
    comparison: {
      options: alternatives,
      recommendedOptionId: recommendedOpt?.id || 'opt_a',
      rationale: parsed.recommendation?.why || (finalPolarity === 'negative' ? 'Recommended alternative prevents severe community displacement and environmental harm.' : 'Balanced alternative minimizes critical service disruption.'),
    },
    recommendation: parsed.recommendation || {
      title: finalPolarity === 'negative'
        ? (semanticIntent.archetype === 'agricultural_destruction_hazard'
            ? 'Executive Advisory: REJECT Agricultural Land Conversion — Preserve Fertile Farmlands'
            : 'Executive Advisory: Do NOT Execute Direct Eviction — Adopt Alternative A')
        : 'AI Decision Support Recommendation',
      recommendedOptionId: recommendedOpt?.id || 'opt_a',
      recommendedOptionTitle: recommendedOpt?.title || 'Alternative Strategy',
      why: finalPolarity === 'negative'
        ? (semanticIntent.archetype === 'agricultural_destruction_hazard'
            ? 'Destruction of agricultural lands causes irreversible topsoil loss, threatens rural food security, and devastates farming livelihoods. Preserving fertile lands and diverting to uncultivable wastelands (Alternative A) is mandatory.'
            : 'Prevents community displacement and mitigates hazardous environmental emissions.')
        : 'Preserves emergency and transit access while fulfilling project objectives.',
      summary: finalPolarity === 'negative'
        ? (semanticIntent.archetype === 'agricultural_destruction_hazard'
            ? 'Recommend 100% preservation of agricultural land and diversion of non-agricultural project requirements to uncultivable wastelands.'
            : 'Recommend zero-displacement alternative with designated non-residential industrial zoning.')
        : 'Recommended phased strategy delivers highest safety with minimized citizen disruption.',
      benefits: finalPolarity === 'negative'
        ? (semanticIntent.archetype === 'agricultural_destruction_hazard'
            ? ['100% preservation of multi-crop agricultural lands', 'Protects agrarian families and local food security']
            : ['Prevents displacement of 500 families', 'Preserves air and groundwater quality'])
        : ['Preserves hospital connectivity', 'Reduces public congestion'],
      risks: finalPolarity === 'negative'
        ? ['Mass peasant protests and High Court litigation stay', 'Permanent loss of cultivable food crops']
        : ['Requires inter-departmental statutory alignment'],
      mitigations: finalPolarity === 'negative'
        ? ['Immediately halt agricultural land conversion and redirect to designated wastelands']
        : ['Conduct mandatory public stakeholder consultation'],
      precautions: ['Weekly multi-department audits'],
      confidence: 88,
      assumptions: ['Standard statutory and environmental compliance standards apply'],
      dataLimitations: ['Simulation estimates based on heuristic indicators'],
    },
    overallScore: policyRisk,
    positiveScore: societalBenefit,
    polarity: finalPolarity,
    gainScore,
    gainClassification,
    gainJustification,
    frictionScore,
    frictionClassification,
    frictionJustification,
    netViability,
    balancedEvaluation: buildBalancedDecisionEvaluation(
      input.description,
      semanticIntent.archetype,
      policy,
      agentAnalyses,
      impactScores,
      finalPolarity,
      locContext,
      locImpactContext
    ),
    locationContextAnalysis: locContext,
    locationImpactContext: locImpactContext,
    proposalUnderstanding: structuredUnderstanding,
    disclaimer: MANDATORY_DISCLAIMER,
  };
}

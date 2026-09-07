import {
  SimulationResult,
  ScenarioInput,
  GainClassification,
  FrictionClassification,
  getGainClassification,
  getFrictionClassification,
} from '../types/index.js';
import {
  generateGenericFallbackResult,
  detectPolicyIntentAndArchetype,
  computeFrameworkGainAndFriction,
} from './simulationEngine.js';
import { resolveLocationAdministrativeProfile } from '../data/locationContextData.js';

const STORAGE_KEY = 'PIA_GEMINI_API_KEY';
const DEFAULT_KEY = ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || '';

export function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_KEY || '';
  } catch {
    return DEFAULT_KEY || '';
  }
}

export function setStoredGeminiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } catch (e) {
    console.warn('Unable to persist Gemini API key:', e);
  }
}

export async function tryClientGeminiSimulation(input: ScenarioInput): Promise<SimulationResult | null> {
  const apiKey = getStoredGeminiKey();
  if (!apiKey || apiKey.length < 10) return null;

  const locProfile = resolveLocationAdministrativeProfile(input);
  const locTitle = input.location || [input.village, input.town || input.city, input.district, 'Tamil Nadu'].filter(Boolean).join(', ');

  const prompt = `You are an experienced Municipal Administration Decision Analyst whose responsibility is to protect public welfare, environmental sustainability, legal compliance, and efficient municipal governance. You must never act like a project promoter, investment advisor, marketing assistant, or policy supporter. Every proposal must be critically evaluated with neutrality, caution, and evidence-based administrative reasoning.

FOUR INTERDEPENDENT EVALUATION INPUTS:
1. THE PROPOSAL: Literal meaning only. Zero assumed benefits.
2. THE SELECTED LOCATION: "${locTitle}" (District: ${locProfile.district}, Area: ${locProfile.resolvedArea})
3. REAL-WORLD CONTEXTUAL INFORMATION:
   - Zoning: ${locProfile.zoningClassification}
   - Approved Industrial Estate: ${locProfile.isApprovedIndustrialZone ? 'YES (SIPCOT/SIDCO zoned with CETP and buffer)' : 'NO'}
   - Agricultural / Farmland Belt: ${locProfile.isAgriculturalOrRuralZone ? 'YES (Active crop cultivation / agrarian tract)' : 'NO'}
   - Water Body / Eco-Buffer: ${locProfile.isEcoSensitiveOrWaterBuffer ? 'YES (Sensitive water body / catchment buffer)' : 'NO'}
   - High-Density Residential: ${locProfile.isHighDensityResidential ? 'YES (Dense residential wards / settlements)' : 'NO'}
   - Nearby Water Bodies: ${locProfile.nearbyWaterBodies.join(', ') || 'Regional drainage network'}
   - Primary Livelihoods: ${locProfile.primaryLivelihoods.join(', ') || 'Agrarian and trade employment'}
   - Vulnerabilities: ${locProfile.disasterVulnerabilities.join('; ')}
   - Statutory Regimes: ${locProfile.applicableStatutoryFrameworks.join('; ')}
   - High-Risk Actions Detected: ${locProfile.highRiskActionsDetected.join(', ') || 'None'}
   - Context Summary: ${locProfile.contextualAnalysisSummary}
4. MUNICIPAL ADMINISTRATIVE REASONING:
   - Same proposal MUST yield different results in different locations:
     * Factory inside approved industrial estate (SIPCOT/SIDCO): Moderate Benefit (Gain 48–54), Manageable Risk (Friction 40–48).
     * Same factory in farmland/river basin/residential: Significantly higher environmental & social risk (Gain 18–30, Friction 78–92).
     * Dam flood water release: Gain 75–85, Friction 20–30. Dam drought water diversion: Gain 10–20, Friction 90–98.
     * Road widening on vacant bypass: Gain 70–80, Friction 24–34. Road widening in dense residential/bazaar street: Gain 25–35, Friction 82–94.

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

Simulate the cross-departmental consequences of this proposed government decision:
DECISION: "${input.description}"
LOCATION: "${locTitle}"
DEPARTMENT: "${input.department || 'General Administration'}"
DURATION: "${input.duration || 'Standard Implementation'}"
REASON: "${input.reason || 'Administrative Decision'}"

CRITICAL POLICY POLARITY & BALANCED EVALUATION MANDATE:
1. MANDATORY BALANCED DECISION EVALUATION RULES:
   - Complete neutrality and objectivity: Never assume that economic growth, revenue, or infrastructure automatically makes a proposal positive.
   - Identify ALL positive impacts and ALL negative impacts.
   - Evaluate across the 8 mandatory dimensions: Economic Impact, Environmental Impact, Social Impact, Public Health & Safety, Infrastructure Impact, Municipal Administration Impact, Legal & Policy Compliance, Long-Term Sustainability.
   - Assign each dimension one of: 'High Positive', 'Moderate Positive', 'Neutral', 'Moderate Negative', 'High Negative'.
   - Weigh all 8 dimensions equally (12.5% each). Do NOT prioritize economic benefits over environmental, social, legal, or sustainability impacts.
   - Severe reductions override: If a proposal causes irreversible environmental damage, destruction of agricultural land, displacement of people, serious pollution, public safety risks, or municipal violations, these MUST significantly reduce the overall assessment and trigger severe impact warnings.
   - If both significant positive and negative impacts exist, classify overall as "Mixed" rather than "Positive".
   - Only classify as "Positive" when overall benefits clearly outweigh drawbacks across all evaluated dimensions.
   - Only classify as "Negative" when overall risks and adverse impacts outweigh benefits.
   - If information is missing for any dimension, set impact level to 'Neutral' and state "Insufficient evidence" in evidence.
   - Analysis must always explain WHY the proposal was classified as Positive, Mixed, or Negative using evidence from each impact category.

2. MANDATORY IMPACT SCORING FRAMEWORK (Gain Score & Friction Score):
   - Evaluate proposals objectively and never assume that economic growth alone indicates a positive outcome.
   - Step 1: Analyze across the 8 impact dimensions.
   - Step 2: Calculate Gain Score (NET BENEFIT starting at neutral 50, strictly penalizing negative externalities):
     + Increase for: Employment generation, economic growth, revenue increase, better public services, infrastructure improvement, efficient municipal administration, improved quality of life.
     - Decrease for: Destruction of agricultural land, environmental degradation, deforestation, pollution, loss of biodiversity, public health risks, displacement of residents, loss of livelihoods, water scarcity, traffic congestion, high maintenance costs, legal violations, poor sustainability.
     - STRICT RULE: A proposal with severe environmental or social damage MUST NOT receive a High Gain score, even if it creates jobs or increases revenue.
     - Gain Classification: 0–25 = Very Low Gain | 26–45 = Low Gain | 46–60 = Moderate Gain | 61–80 = High Gain | 81–100 = Very High Gain.
   - Step 3: Calculate Friction Score (RESISTANCE, DIFFICULTY, RISKS starting at neutral 20):
     + Increase for: Public opposition, farmer protests, environmental concerns, political resistance, legal disputes, high implementation cost, long approval process, complex execution, safety concerns, resource conflicts, administrative challenges.
     - Decrease for: Strong public support, easy implementation, low cost, low environmental impact, clear legal compliance, high administrative feasibility.
     - Friction Classification: 0–20 = Very Low Friction | 21–40 = Low Friction | 41–60 = Moderate Friction | 61–80 = High Friction | 81–100 = Very High Friction.
   - Always justify both scores with concise reasoning in gainJustification and frictionJustification.
   - Never assign high positiveScores (75-95) to domains (like healthcare, education, social approval) unless explicitly supported by evidence in the proposal. If unevidenced, set to 0 and state "Minimal/No Direct Impact".

Return strict JSON only (no markdown):
{
  "policy": {
    "decisionType": string,
    "department": string,
    "location": string,
    "affectedArea": string,
    "duration": string,
    "reason": string,
    "scale": string,
    "stakeholders": string[],
    "infrastructure": string[],
    "resourcesRequired": string[],
    "urgency": "Low"|"Standard"|"Urgent"|"Emergency",
    "confidenceScore": number,
    "category": string,
    "summary": string,
    "action": string,
    "asset": string,
    "constraints": string[],
    "dataSource": "verified_geographic_data"
  },
  "polarity": "positive" | "negative" | "mixed",
  "gainScore": number (0-100 net benefit starting from 50),
  "gainClassification": "Very Low Gain" | "Low Gain" | "Moderate Gain" | "High Gain" | "Very High Gain",
  "gainJustification": string,
  "frictionScore": number (0-100 resistance/risk starting from 20),
  "frictionClassification": "Very Low Friction" | "Low Friction" | "Moderate Friction" | "High Friction" | "Very High Friction",
  "frictionJustification": string,
  "overallScore": number (equals frictionScore),
  "overallPolicyRisk": number (equals frictionScore),
  "positiveScore": number (equals gainScore),
  "overallSocietalBenefit": number (equals gainScore),
  "netViability": {
    "status": "Highly Favorable" | "Favorable with Safeguards" | "Balanced Trade-off" | "High Friction Precaution" | "Unfavorable — Net Negative Impact" | "Severely Unfavorable — High Social & Environmental Risk",
    "badgeClass": string,
    "netScore": number,
    "summary": string
  },
  "agentAnalyses": {
    "transport": { "score": number, "positiveScore": number, "overallSeverity": "low"|"moderate"|"high"|"critical", "summary": string, "findings": [{"id": "tr_1", "title": string, "description": string, "severity": "low"|"moderate"|"high"|"critical", "polarity": "positive"|"negative"}], "metrics": [{"label": string, "value": string, "change": string, "trend": "positive"|"negative"|"neutral"}] },
    "infrastructure": { "score": number, "positiveScore": number, "overallSeverity": "low"|"moderate"|"high"|"critical", "summary": string, "findings": [...], "metrics": [...] },
    "population": { "score": number, "positiveScore": number, "overallSeverity": "low"|"moderate"|"high"|"critical", "summary": string, "findings": [...], "metrics": [...] },
    "essential_services": { "score": number, "positiveScore": number, "overallSeverity": "low"|"moderate"|"high"|"critical", "summary": string, "findings": [...], "metrics": [...] },
    "economic": { "score": number, "positiveScore": number, "overallSeverity": "low"|"moderate"|"high"|"critical", "summary": string, "findings": [...], "metrics": [...] },
    "environmental": { "score": number, "positiveScore": number, "overallSeverity": "low"|"moderate"|"high"|"critical", "summary": string, "findings": [...], "metrics": [...] },
    "disaster_risk": { "score": number, "positiveScore": number, "overallSeverity": "low"|"moderate"|"high"|"critical", "summary": string, "findings": [...], "metrics": [...] },
    "social": { "score": number, "positiveScore": number, "overallSeverity": "low"|"moderate"|"high"|"critical", "summary": string, "findings": [...], "metrics": [...] },
    "policy_compliance": { "score": number, "positiveScore": number, "overallSeverity": "low"|"moderate"|"high"|"critical", "summary": string, "findings": [...], "metrics": [...] }
  }
}`;

  const models = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        }),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = JSON.parse(rawText);
      const fallback = generateGenericFallbackResult(input);
      const intentCheck = detectPolicyIntentAndArchetype(input.description, fallback.policy.category);

      const agentAnalyses = {
        ...fallback.agentAnalyses,
        ...(parsed.agentAnalyses || {}),
      };

      let rawRisk = parsed.overallPolicyRisk ?? parsed.overallScore ?? fallback.overallScore;
      let rawBenefit = parsed.overallSocietalBenefit ?? parsed.positiveScore ?? fallback.positiveScore;
      let rawPolarity: 'positive' | 'negative' | 'mixed' = parsed.polarity || (
        rawRisk >= 65 || (rawRisk - rawBenefit) >= 20 ? 'negative' :
        rawBenefit >= 68 && rawRisk <= 40 ? 'positive' : 'mixed'
      );

      if (intentCheck.polarity === 'negative') {
        rawPolarity = 'negative';
        if (rawRisk < 75) rawRisk = 88;
        if (rawBenefit > 25) rawBenefit = 12;
      }

      const netScore = Math.max(5, Math.min(98, Math.round(((rawBenefit * 1.3) - (rawRisk * 1.1) + 100) / 2)));
      let viabilityStatus = fallback.netViability?.status || 'Balanced Trade-off';
      let badgeClass = 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      let viabilitySummary = '';

      const framework = computeFrameworkGainAndFriction(
        agentAnalyses,
        rawPolarity,
        input.description,
        intentCheck.archetype
      );

      let gainScore = typeof parsed.gainScore === 'number' ? parsed.gainScore : framework.gainScore;
      let frictionScore = typeof parsed.frictionScore === 'number' ? parsed.frictionScore : framework.frictionScore;

      // Enforce mandatory decision rules:
      // "A proposal with severe environmental or social damage MUST NOT receive a High Gain score, even if it creates jobs or increases revenue."
      // Benchmark rule: "Convert fertile agricultural land into an industrial zone -> Gain: Low to Moderate (20-45), Friction: High to Very High (70-100)"
      if (intentCheck.polarity === 'negative' || intentCheck.archetype === 'agricultural_destruction_hazard') {
        if (intentCheck.archetype === 'agricultural_destruction_hazard' && /(industrial|zone|factory)/i.test(input.description)) {
          gainScore = Math.max(22, Math.min(42, gainScore));
          frictionScore = Math.max(76, Math.min(95, frictionScore));
        } else if (intentCheck.polarity === 'negative') {
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

      rawRisk = frictionScore;
      rawBenefit = gainScore;

      if (rawPolarity === 'negative' || rawRisk >= 70 || (rawRisk - rawBenefit) >= 25 || gainScore <= 45) {
        viabilityStatus = rawRisk >= 75
          ? 'Severely Unfavorable — High Social & Environmental Risk'
          : 'Unfavorable — Net Negative Impact';
        badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-black';
        viabilitySummary = parsed.netViability?.summary ||
          (intentCheck.archetype === 'agricultural_destruction_hazard'
            ? `Simulation identifies critical destruction of fertile agricultural lands, threat to rural food security, and agrarian distress (${rawRisk}/100) with near-zero societal benefit (${rawBenefit}/100). Strongly advised to immediately reject farmland conversion in favor of 100% agricultural preservation.`
            : `Critical public friction, human displacement, and environmental degradation risks (${rawRisk}/100) heavily outweigh projected benefits (${rawBenefit}/100). The proposal has a Net Negative impact.`);
      } else if (rawPolarity === 'positive' || (rawBenefit >= 70 && rawRisk <= 40)) {
        viabilityStatus = 'Highly Favorable';
        badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
        viabilitySummary = parsed.netViability?.summary ||
          `Positive societal welfare and asset expansion (${rawBenefit}/100) substantially surpass manageable execution frictions (${rawRisk}/100).`;
      } else if (rawRisk >= 50) {
        viabilityStatus = 'High Friction Precaution';
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
        viabilitySummary = parsed.netViability?.summary ||
          `Notable operational friction (${rawRisk}/100) balanced with strategic output (${rawBenefit}/100). Phased citizen safeguards and strict compliance required.`;
      } else {
        viabilityStatus = 'Balanced Trade-off';
        badgeClass = 'bg-slate-100 text-slate-800 border-slate-300 font-medium';
        viabilitySummary = parsed.netViability?.summary ||
          `Balanced policy impact profile with manageable operational risks (${rawRisk}/100) and steady welfare gain (${rawBenefit}/100).`;
      }

      const netViability = {
        status: (parsed.netViability?.status && parsed.netViability.status.includes('Unfavorable') && rawPolarity === 'negative')
          ? parsed.netViability.status
          : viabilityStatus,
        badgeClass,
        netScore,
        summary: viabilitySummary,
        polarity: rawPolarity,
      };

      // Merge live Gemini response with rich fallback structure
      return {
        ...fallback,
        isLiveGemini: true,
        simulationId: `sim_gemini_${Date.now()}`,
        overallScore: rawRisk,
        positiveScore: rawBenefit,
        polarity: rawPolarity,
        gainScore,
        gainClassification,
        gainJustification,
        frictionScore,
        frictionClassification,
        frictionJustification,
        netViability,
        impactScores: {
          ...fallback.impactScores,
          gainScore,
          gainClassification,
          gainJustification,
          frictionScore,
          frictionClassification,
          frictionJustification,
          overallPolicyRisk: rawRisk,
          overallSocietalBenefit: rawBenefit,
          netViabilityScore: netScore,
          polarity: rawPolarity,
        },
        policy: {
          ...fallback.policy,
          ...(parsed.policy || {}),
        },
        agentAnalyses,
        balancedEvaluation: fallback.balancedEvaluation,
      };
    } catch (e) {
      console.warn(`[Client Gemini API] ${model} attempt failed:`, e);
    }
  }

  return null;
}

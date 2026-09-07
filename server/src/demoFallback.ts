import {
  AlternativeStrategy,
  CascadingGraph,
  DecisionRecommendation,
  ImpactScores,
  PolicyUnderstanding,
  ScenarioInput,
  SimulationResult,
  AgentImpactDomain,
  AgentAnalysis,
  PolicyCategory,
  ImpactFinding,
  CascadingNode,
  BalancedImpactLevel,
  BalancedEvaluationDimensionKey,
  BalancedDimensionAssessment,
  BalancedDecisionEvaluation,
  GainClassification,
  FrictionClassification,
  getGainClassification,
  getFrictionClassification,
  StructuredProposalUnderstanding,
} from './types.js';
import {
  resolveLocationAdministrativeProfile,
  LocationAdministrativeContext,
} from './locationContextData.js';

export const MANDATORY_DISCLAIMER =
  'This platform provides AI-assisted simulations for decision support only. Results are based on available information, assumptions, and heuristic reasoning. Final decisions should be made by qualified government authorities using official data and expert evaluation.';

export type PolicyArchetype =
  | 'healthcare_hospital'
  | 'education_hub'
  | 'transport_corridor'
  | 'clean_energy_environment'
  | 'industrial_zone'
  | 'water_dam'
  | 'urban_housing'
  | 'traffic_regulation'
  | 'displacement_relocation_industrial'
  | 'forced_eviction_resettlement'
  | 'polluting_industry_hazard'
  | 'agricultural_destruction_hazard'
  | 'environmental_destruction_loss'
  | 'general_destructive_harm'
  | 'general_administrative';
import {
  classifyProposalMeaning,
  extractStructuredProposalUnderstanding,
} from './proposalUnderstanding.js';

export function classifyPolicy(description: string, department?: string): PolicyCategory {
  return classifyProposalMeaning(description, department).primaryDomain;
}

export interface PolicyIntentEvaluation {
  polarity: 'positive' | 'negative' | 'mixed';
  archetype: PolicyArchetype;
  reason: string;
}

export function detectPolicyIntentAndArchetype(description: string, category: PolicyCategory): PolicyIntentEvaluation {
  const text = description.toLowerCase();

  // 1. Comprehensive Destructive / Harmful Action Triggers
  const hasDestructiveAction =
    text.includes('destruct') ||
    text.includes('destroy') ||
    text.includes('demolish') ||
    text.includes('demolition') ||
    text.includes('loss of') ||
    text.includes('cut down') ||
    text.includes('cutting down') ||
    text.includes('felling') ||
    text.includes('fell trees') ||
    text.includes('deforest') ||
    text.includes('pollut') ||
    text.includes('contaminat') ||
    text.includes('toxic') ||
    text.includes('dumping') ||
    text.includes('dump waste') ||
    text.includes('effluent') ||
    text.includes('evict') ||
    text.includes('eviction') ||
    text.includes('displace') ||
    text.includes('displacement') ||
    text.includes('relocate') ||
    text.includes('relocation') ||
    text.includes('forcibl') ||
    text.includes('bulldoze') ||
    text.includes('shut down') ||
    text.includes('closure of') ||
    text.includes('shutting down') ||
    text.includes('ruin') ||
    text.includes('encroach') ||
    text.includes('quarrying') ||
    text.includes('strip-mining') ||
    text.includes('degrad') ||
    text.includes('poison') ||
    text.includes('hazardous');

  // Domain checks
  const isAgriDomain =
    category === 'Agriculture' ||
    text.includes('agricultur') ||
    text.includes('agricultut') || // handles user typo "destruction of agricultutal lands"
    text.includes('agri') ||
    text.includes('farmland') ||
    text.includes('farm land') ||
    text.includes('fertile land') ||
    text.includes('cultivable') ||
    text.includes('crop') ||
    text.includes('paddy') ||
    text.includes('farmer') ||
    text.includes('agrarian');

  const isEnvironmentalDomain =
    category === 'Environment' ||
    category === 'Forest' ||
    text.includes('forest') ||
    text.includes('tree') ||
    text.includes('green cover') ||
    text.includes('wetland') ||
    text.includes('mangrove') ||
    text.includes('lake') ||
    text.includes('river') ||
    text.includes('water body') ||
    text.includes('aquifer') ||
    text.includes('groundwater') ||
    text.includes('sanctuary') ||
    text.includes('wildlife');

  const hasRelocation =
    text.includes('relocate') ||
    text.includes('relocation') ||
    text.includes('displace') ||
    text.includes('displacement') ||
    text.includes('evict') ||
    text.includes('eviction') ||
    text.includes('demolish') ||
    text.includes('demolition');

  const hasInhabitedOrFamily =
    text.includes('families') ||
    text.includes('family') ||
    text.includes('households') ||
    text.includes('household') ||
    text.includes('people') ||
    text.includes('residents') ||
    text.includes('slum') ||
    text.includes('settlement');

  const hasHeavyIndustry =
    text.includes('cement') ||
    text.includes('chemical') ||
    text.includes('tannery') ||
    text.includes('smelter') ||
    text.includes('thermal') ||
    text.includes('coal') ||
    text.includes('quarry') ||
    text.includes('mining') ||
    text.includes('refinery') ||
    text.includes('hazardous') ||
    text.includes('factory') ||
    text.includes('plant') ||
    text.includes('industrial');

  // Branch A: Negative / High-Risk / Harmful Proposals
  if (hasDestructiveAction) {
    if (isAgriDomain) {
      return {
        polarity: 'negative',
        archetype: 'agricultural_destruction_hazard',
        reason: 'Proposal triggers irreversible destruction of fertile agricultural lands and agrarian livelihoods.',
      };
    }
    if (hasRelocation && (hasInhabitedOrFamily || /\d+/.test(text)) && hasHeavyIndustry) {
      return {
        polarity: 'negative',
        archetype: 'displacement_relocation_industrial',
        reason: 'Proposal involves involuntary displacement of families for industrial manufacturing plant.',
      };
    }
    if (hasRelocation && (hasInhabitedOrFamily || text.includes('village') || text.includes('slum'))) {
      return {
        polarity: 'negative',
        archetype: 'forced_eviction_resettlement',
        reason: 'Proposal involves involuntary eviction or displacement of communities without consent.',
      };
    }
    if (isEnvironmentalDomain || text.includes('pollut') || text.includes('toxic') || text.includes('effluent') || text.includes('deforest')) {
      return {
        polarity: 'negative',
        archetype: 'environmental_destruction_loss',
        reason: 'Proposal causes severe environmental destruction, deforestation, or toxic contamination.',
      };
    }
    if (hasHeavyIndustry && (text.includes('near residential') || text.includes('hazardous') || text.includes('polluting'))) {
      return {
        polarity: 'negative',
        archetype: 'polluting_industry_hazard',
        reason: 'Proposal introduces hazardous polluting industry in proximity to residential settlements.',
      };
    }
    return {
      polarity: 'negative',
      archetype: 'general_destructive_harm',
      reason: 'Proposal contains explicitly destructive or high-harm administrative actions.',
    };
  }

  // Branch B: Constructive Public Welfare Proposals (when no destructive actions are present)
  if (category === 'Healthcare' || text.includes('hospital') || text.includes('medical') || text.includes('health') || text.includes('clinic') || text.includes('specialty') || text.includes('speciality') || text.includes('trauma')) {
    return {
      polarity: 'positive',
      archetype: 'healthcare_hospital',
      reason: 'Constructive public healthcare infrastructure expansion.',
    };
  }
  if (category === 'Education' || text.includes('school') || text.includes('college') || text.includes('university') || text.includes('institute') || text.includes('campus')) {
    return {
      polarity: 'positive',
      archetype: 'education_hub',
      reason: 'Constructive public educational infrastructure.',
    };
  }
  if (text.includes('dam') || text.includes('water release') || text.includes('reservoir') || text.includes('canal') || text.includes('irrigation')) {
    return {
      polarity: 'positive',
      archetype: 'water_dam',
      reason: 'Water storage and canal irrigation capacity upgrade.',
    };
  }
  if (text.includes('solar') || text.includes('waste') || text.includes('treatment plant') || text.includes('recycling') || text.includes('lake') || text.includes('park') || text.includes('tree') || text.includes('environment')) {
    return {
      polarity: 'positive',
      archetype: 'clean_energy_environment',
      reason: 'Clean renewable energy, environmental sanitation, and green public spaces.',
    };
  }
  if (category === 'Transport' || text.includes('flyover') || text.includes('highway') || text.includes('expressway') || text.includes('elevated') || text.includes('metro') || text.includes('bypass') || text.includes('bridge')) {
    return {
      polarity: 'positive',
      archetype: 'transport_corridor',
      reason: 'Regional connectivity and congestion alleviation corridor.',
    };
  }
  if (text.includes('affordable housing') || text.includes('tenement upgrade') || text.includes('housing colony')) {
    return {
      polarity: 'positive',
      archetype: 'urban_housing',
      reason: 'Public housing upgrade with secure civic amenities.',
    };
  }
  if (text.includes('factory') || text.includes('industrial') || text.includes('manufacturing') || text.includes('sipcot')) {
    return {
      polarity: 'mixed',
      archetype: 'industrial_zone',
      reason: 'Industrial manufacturing expansion with economic gains and environmental regulation requirements.',
    };
  }
  if (text.includes('ban heavy') || text.includes('one-way') || text.includes('traffic restriction') || text.includes('vehicle ban')) {
    return {
      polarity: 'mixed',
      archetype: 'traffic_regulation',
      reason: 'Operational traffic regulation with localized detours.',
    };
  }

  return {
    polarity: 'mixed',
    archetype: 'general_administrative',
    reason: 'Standard administrative policy decision.',
  };
}

export function detectPolicyArchetype(description: string, category: PolicyCategory): PolicyArchetype {
  return detectPolicyIntentAndArchetype(description, category).archetype;
}

// ------------------------------------------------------------------------------------------------
// Mandatory Impact Scoring Framework (Gain Score & Friction Score)
// ------------------------------------------------------------------------------------------------

export function computeFrameworkGainAndFriction(
  analyses: Record<AgentImpactDomain, AgentAnalysis>,
  hintPolarity?: 'positive' | 'negative' | 'mixed',
  description: string = '',
  archetype?: PolicyArchetype,
  locationContext?: LocationAdministrativeContext
): {
  gainScore: number;
  gainClassification: GainClassification;
  gainJustification: string;
  frictionScore: number;
  frictionClassification: FrictionClassification;
  frictionJustification: string;
} {
  const descLower = description.toLowerCase();

  // Detect Severe Impacts / Negative Triggers
  const hasAgriLoss =
    archetype === 'agricultural_destruction_hazard' ||
    (/(agricultural|farmland|crop|fertile|paddy|cultivable|farmer)/i.test(descLower) &&
      /(destroy|destruct|convert|strip|loss|demolish|acquire|zone|conversion)/i.test(descLower));

  const hasDisplacement =
    archetype === 'displacement_relocation_industrial' ||
    archetype === 'forced_eviction_resettlement' ||
    (/(relocate|displace|evict|demolish|ousted|rehouse)/i.test(descLower) &&
      /(families|residents|slum|village|homes|people|population)/i.test(descLower));

  const hasSeverePollution =
    archetype === 'polluting_industry_hazard' ||
    archetype === 'environmental_destruction_loss' ||
    /(cement factory|chemical plant|toxic|effluent|smelter|polluting industry)/i.test(descLower);

  const hasDeforestation =
    /(deforest|tree felling|clearing forest|cut trees|woodland|green cover loss)/i.test(descLower);

  const hasPublicHealthRisks =
    hasSeverePollution ||
    /(health risk|respiratory|carcinogen|contamination|epidemic|toxic air|groundwater pollution)/i.test(descLower);

  const isPublicWelfarePositive =
    hintPolarity === 'positive' ||
    (/(hospital|trauma care|phc|clinic|school|college|clean drinking water|filtration|solar microgrid|flood shelter|park|bus terminal|flyover)/i.test(descLower) &&
      !hasAgriLoss &&
      !hasDisplacement &&
      !hasSeverePollution);

  const isIndustrialManufacturing =
    archetype === 'industrial_zone' ||
    /(factory|textile|manufacturing|industrial|refinery|chemical|cement|smelter|tannery|processing plant|workshop)/i.test(descLower);

  // --- Step 2: Calculate Gain Score (NET BENEFIT starting at neutral 50) ---
  let gain = 50;
  const gainIncreases: string[] = [];
  const gainDecreases: string[] = [];

  // Positive Factors (+)
  // 1. Employment generation & economic growth
  const econPos = analyses.economic?.positiveScore ?? (hintPolarity === 'positive' ? 85 : 45);
  if (econPos >= 55 || /(employment|jobs|economic growth|revenue|trade|industrial)/i.test(descLower)) {
    if (isIndustrialManufacturing && !hasDisplacement && !hasAgriLoss) {
      const boost = 6;
      gain += boost;
      gainIncreases.push(`potential localized commercial activity & employment (+${boost}, labeled as Potential)`);
    } else {
      const boost = hasSeverePollution || hasAgriLoss ? 4 : 12;
      gain += boost;
      gainIncreases.push(`moderate employment & localized commercial revenue (+${boost})`);
    }
  }

  // 2. Better public services (Healthcare & Education) - only if actually connected to proposal
  const essPos = analyses.essential_services?.positiveScore ?? 0;
  if ((essPos >= 65 || /(hospital|clinic|phc|school|healthcare|education)/i.test(descLower)) && (isPublicWelfarePositive || !isIndustrialManufacturing)) {
    const boost = 14;
    gain += boost;
    gainIncreases.push(`improved public health & essential services (+${boost})`);
  }

  // 3. Infrastructure improvement - only if actual civil infrastructure is added
  const infraPos = analyses.infrastructure?.positiveScore ?? 0;
  if ((infraPos >= 65 || /(bypass|water filtration|transit|flyover)/i.test(descLower)) && !isIndustrialManufacturing) {
    const boost = 10;
    gain += boost;
    gainIncreases.push(`civic infrastructure modernization (+${boost})`);
  }

  // 4. Efficient municipal administration
  if (/(digitization|e-governance|waste management automation)/i.test(descLower)) {
    const boost = 8;
    gain += boost;
    gainIncreases.push(`efficient municipal administration (+${boost})`);
  }

  // 5. Improved quality of life
  if (isPublicWelfarePositive) {
    const boost = 12;
    gain += boost;
    gainIncreases.push(`enhanced community quality of life (+${boost})`);
  }

  // Context-Aware Administrative Adjustments for Gain
  if (locationContext) {
    if (locationContext.isApprovedIndustrialZone && isIndustrialManufacturing && !hasDisplacement && !hasAgriLoss) {
      const boost = 8;
      gain += boost;
      gainIncreases.push(`situated within an approved industrial estate (${locationContext.municipalInfrastructureBaseline[0] || 'SIPCOT/SIDCO'}) with dedicated infrastructure (+${boost})`);
    } else if (locationContext.isAgriculturalOrRuralZone && (isIndustrialManufacturing || /(factory|industrial|zone|plant)/i.test(descLower))) {
      const penalty = 16;
      gain -= penalty;
      gainDecreases.push(`industrial encroachment into active agricultural belt of ${locationContext.district} (-${penalty})`);
    }

    if (locationContext.isEcoSensitiveOrWaterBuffer && (isIndustrialManufacturing || hasSeverePollution || /(factory|plant|effluent|dyeing)/i.test(descLower))) {
      const waterName = locationContext.nearbyWaterBodies[0] || 'sensitive water catchment';
      const penalty = 14;
      gain -= penalty;
      gainDecreases.push(`effluent and groundwater stress near ${waterName} (-${penalty})`);
    }

    if (locationContext.isHighDensityResidential && (isIndustrialManufacturing || hasSeverePollution || /(factory|plant|dust|noise)/i.test(descLower))) {
      const penalty = 12;
      gain -= penalty;
      gainDecreases.push(`proximity to high-density residential wards and civic institutions (-${penalty})`);
    }

    if (locationContext.highRiskActionsDetected.length > 0) {
      const actions = locationContext.highRiskActionsDetected;
      const penalty = Math.min(22, actions.length * 7);
      gain -= penalty;
      gainDecreases.push(`enhanced risk triggers for administrative actions (${actions.join(', ')}) (-${penalty})`);
    }

    // Dam / Water Release Context: Flood vs Drought
    const isWaterAction = /(dam|water release|excess water|sluice|canal|reservoir|water block|divert water)/i.test(descLower);
    if (isWaterAction) {
      if (/(flood|monsoon|surplus|precaution|excess flow|storage safety|heavy inflow)/i.test(descLower)) {
        const boost = 26;
        gain += boost;
        gainIncreases.push(`proactive flood safety and downstream settlement inundation prevention (+${boost})`);
      } else if (/(drought|dry|scarcity|block|divert|deprive|shut canal)/i.test(descLower)) {
        const penalty = 26;
        gain -= penalty;
        gainDecreases.push(`depriving downstream irrigation canal network of vital water during drought (-${penalty})`);
      }
    }

    // Road Widening Context: Vacant Bypass vs Densely Populated Neighborhood
    const isRoadAction = /(widen|widening|road expansion|corridor expansion|highway)/i.test(descLower);
    if (isRoadAction) {
      if (/(vacant|bypass|outer ring|peripheral|unoccupied|open land)/i.test(descLower)) {
        const boost = 18;
        gain += boost;
        gainIncreases.push(`corridor capacity expansion along vacant/bypass right-of-way (+${boost})`);
      } else if (/(dense|residential|bazaar|market|shop|demolish|evict|relocate|commercial street)/i.test(descLower) || locationContext.isHighDensityResidential) {
        const penalty = 20;
        gain -= penalty;
        gainDecreases.push(`demolition of commercial frontages, tenant displacement & disruption in dense urban core (-${penalty})`);
      }
    }
  }

  // Negative Factors (-)
  // 1. Destruction of agricultural land
  if (hasAgriLoss) {
    const penalty = 26;
    gain -= penalty;
    gainDecreases.push(`destruction of fertile agricultural land & loss of food security (-${penalty})`);
  }

  // 2. Environmental degradation & deforestation
  if (hasSeverePollution || hasDeforestation || (analyses.environmental?.score ?? 0) >= 60) {
    const penalty = hasSeverePollution ? 20 : 14;
    gain -= penalty;
    gainDecreases.push(`environmental degradation & loss of natural biodiversity (-${penalty})`);
  }

  // 3. Pollution (Air, Water, Toxic discharge)
  if (hasSeverePollution || /(pollution|effluent|smoke|dust|emissions)/i.test(descLower)) {
    const penalty = 16;
    gain -= penalty;
    gainDecreases.push(`acute industrial emissions & water contamination (-${penalty})`);
  }

  // 4. Public health risks
  if (hasPublicHealthRisks || (analyses.essential_services?.score ?? 0) >= 65) {
    const penalty = 16;
    gain -= penalty;
    gainDecreases.push(`heightened public health & respiratory disease risks (-${penalty})`);
  }

  // 5. Displacement of residents & Loss of livelihoods
  if (hasDisplacement || hasAgriLoss) {
    const penalty = hasDisplacement ? 26 : 16;
    gain -= penalty;
    gainDecreases.push(`displacement of residents & livelihood loss (-${penalty})`);
  }

  // 6. Traffic congestion & municipal strain
  if ((analyses.transport?.score ?? 0) >= 65 || /(traffic|congestion|bottleneck)/i.test(descLower) || (isIndustrialManufacturing && !isPublicWelfarePositive)) {
    const penalty = 8;
    gain -= penalty;
    gainDecreases.push(`freight traffic load & municipal utility strain (-${penalty})`);
  }

  // 7. Potential effluent & water table consumption for generic industrial
  if (isIndustrialManufacturing && !hasAgriLoss && !hasDisplacement && !hasSeverePollution) {
    const penalty = 8;
    gain -= penalty;
    gainDecreases.push(`potential trade effluent & industrial water consumption risks (-${penalty})`);
  }

  // 8. Legal/regulatory violations & Poor sustainability
  if (hasAgriLoss || hasSeverePollution || hasDisplacement) {
    const penalty = 12;
    gain -= penalty;
    gainDecreases.push(`poor long-term sustainability & legal compliance friction (-${penalty})`);
  }

  // STRICT CONTEXT-AWARE DECISION RULES FOR GAIN:
  if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing && !hasDisplacement && !hasAgriLoss) {
    gain = Math.max(48, Math.min(54, gain));
  } else if ((locationContext?.isAgriculturalOrRuralZone || /(farmland|agricultural|crop|fertile)/i.test(descLower)) && isIndustrialManufacturing && !hasDisplacement) {
    gain = Math.max(20, Math.min(32, gain));
  } else if ((locationContext?.isEcoSensitiveOrWaterBuffer || /(wetland|marsh|lake|river|forest)/i.test(descLower)) && isIndustrialManufacturing && !hasDisplacement) {
    gain = Math.max(18, Math.min(30, gain));
  } else if ((hasDisplacement && (hasSeverePollution || /(cement|chemical|factory|industrial|plant)/i.test(descLower))) || (hasAgriLoss && /(destroy|destruction|conversion|demolish)/i.test(descLower))) {
    gain = Math.max(8, Math.min(14, gain)); // Very Low Gain (8-14)
  } else if (hasAgriLoss && /(industrial|factory|zone|commercial)/i.test(descLower)) {
    gain = Math.max(22, Math.min(38, gain));
  } else if (/(dam|water release|excess water)/i.test(descLower) && /(flood|monsoon|surplus|precaution)/i.test(descLower)) {
    gain = Math.max(75, Math.min(85, gain));
  } else if (/(dam|water|canal)/i.test(descLower) && /(drought|dry|block|divert|scarcity)/i.test(descLower)) {
    gain = Math.max(10, Math.min(20, gain));
  } else if (/(widen|widening)/i.test(descLower) && /(vacant|bypass|outer ring|peripheral)/i.test(descLower)) {
    gain = Math.max(70, Math.min(80, gain));
  } else if (/(widen|widening)/i.test(descLower) && (/(dense|residential|bazaar|market|shop|demolish)/i.test(descLower) || locationContext?.isHighDensityResidential)) {
    gain = Math.max(25, Math.min(35, gain));
  } else if (hasAgriLoss || hasDisplacement || hasSeverePollution) {
    if (/(purely negative|demolition|destroy|destruction)/i.test(descLower) || hintPolarity === 'negative') {
      gain = Math.max(8, Math.min(20, gain)); // Very Low Gain (0–20)
    } else {
      gain = Math.max(15, Math.min(35, gain)); // Low Gain (15–35)
    }
  } else if (isIndustrialManufacturing && !isPublicWelfarePositive) {
    // Generic industrial proposals without explicit location context: 38-44
    gain = Math.max(38, Math.min(44, gain)); // Low Gain (38–44)
  } else if (isPublicWelfarePositive) {
    gain = Math.max(78, Math.min(94, gain)); // High to Very High Gain (78–94)
  } else {
    gain = Math.max(10, Math.min(75, gain));
  }

  gain = Math.round(Math.max(0, Math.min(100, gain)));
  const gainClassification = getGainClassification(gain);

  let gainJustification = '';
  if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing && !hasDisplacement && !hasAgriLoss) {
    gainJustification = `Net benefit is Moderate (${gain}/100): Situated within an approved industrial estate (${locationContext.municipalInfrastructureBaseline[0] || 'SIPCOT/SIDCO'}), benefiting from established industrial zoning, statutory infrastructure, and buffer distances from residential settlements.`;
  } else if (locationContext?.isAgriculturalOrRuralZone && isIndustrialManufacturing && !hasDisplacement) {
    gainJustification = `Net benefit is Low (${gain}/100): Industrial placement on active farmlands in ${locationContext.district} results in severe topsoil destruction and permanent loss of agrarian livelihoods that substantially depress net societal benefit.`;
  } else if (/(dam|water release|excess water)/i.test(descLower) && /(flood|monsoon|surplus|precaution)/i.test(descLower)) {
    gainJustification = `Net benefit is High (${gain}/100): Proactive dam flood release protocol protects downstream populations and riverine settlements from catastrophic inundation and reservoir breach.`;
  } else if (/(dam|water|canal)/i.test(descLower) && /(drought|dry|block|divert|scarcity)/i.test(descLower)) {
    gainJustification = `Net benefit is Very Low (${gain}/100): Blocking or diverting canal water during drought starves downstream farmlands of irrigation, triggering agrarian crisis and acute crop loss.`;
  } else if (/(widen|widening)/i.test(descLower) && /(vacant|bypass|outer ring|peripheral)/i.test(descLower)) {
    gainJustification = `Net benefit is High (${gain}/100): Road widening along vacant/peripheral bypass right-of-way substantially enhances regional logistics and commuter transit with minimal disruption.`;
  } else if (/(widen|widening)/i.test(descLower) && (/(dense|residential|bazaar|market|shop|demolish)/i.test(descLower) || locationContext?.isHighDensityResidential)) {
    gainJustification = `Net benefit is Low (${gain}/100): Widening through dense urban/residential streets results in extensive commercial frontage demolition, tenant eviction, and severe local economic disruption.`;
  } else if (hasDisplacement && (hasSeverePollution || /(cement|chemical|factory|plant)/i.test(descLower))) {
    gainJustification = `Net benefit is Very Low (${gain}/100): Severe residential displacement and heavy industrial pollution hazards overwhelmingly eclipse potential commercial or factory output. Potential economic benefits cannot override acute human displacement and environmental harm.`;
  } else if (hasAgriLoss && /(industrial|zone)/i.test(descLower)) {
    gainJustification = `Net benefit is Low to Moderate (${gain}/100): While industrial zoning generates localized employment and commercial revenue, severe destruction of fertile agricultural topsoil, permanent loss of farmer livelihoods, and acute sustainability deficits drastically depress net societal gain.`;
  } else if (isIndustrialManufacturing && !isPublicWelfarePositive && !hasAgriLoss && !hasDisplacement) {
    gainJustification = `Net benefit is Low (${gain}/100): Potential commercial benefits (employment generation and trade activity) are recognized as potential impacts, but cannot be treated as confirmed public welfare facts. They are counterbalanced by potential risks including water consumption, effluent management, and freight traffic load.`;
  } else if (gain <= 25) {
    gainJustification = `Net benefit is Very Low (${gain}/100): Severe adverse impacts (${gainDecreases.slice(0, 2).join(' and ') || 'critical social and ecological damage'}) heavily outweigh localized economic output.`;
  } else if (gain <= 45) {
    gainJustification = `Net benefit is Low (${gain}/100): Positive returns (${gainIncreases.slice(0, 2).join(', ') || 'localized economic activity'}) are substantially eroded by heavy civic and environmental costs (${gainDecreases.slice(0, 2).join(', ') || 'community disruption'}).`;
  } else if (gain <= 60) {
    gainJustification = `Net benefit is Moderate (${gain}/100): Demonstrates a balanced trade-off where positive outputs (${gainIncreases.slice(0, 2).join(', ') || 'public utility'}) correspond with notable operational challenges (${gainDecreases.slice(0, 2).join(', ') || 'civic costs'}).`;
  } else {
    gainJustification = `Net benefit is ${gainClassification} (${gain}/100): High public value created through ${gainIncreases.slice(0, 2).join(' and ') || 'broad public welfare enhancements'} with negligible lasting environmental or social harm.`;
  }

  // --- Step 3: Calculate Friction Score (RESISTANCE, DIFFICULTY, RISKS starting at neutral 20) ---
  let friction = 20;
  const frictionIncreases: string[] = [];
  const frictionDecreases: string[] = [];

  // Resistance triggers (+)
  // 1. Farmer protests & agricultural conflict
  if (hasAgriLoss) {
    const boost = 25;
    friction += boost;
    frictionIncreases.push(`intense farmer protests & agrarian resistance (+${boost})`);
  }

  // 2. Public opposition & displacement backlash
  if (hasDisplacement) {
    const boost = 26;
    friction += boost;
    frictionIncreases.push(`public opposition & resident eviction resistance (+${boost})`);
  }

  // 3. Environmental concerns & pollution
  if (hasSeverePollution || hasDeforestation || (analyses.environmental?.score ?? 0) >= 60) {
    const boost = 20;
    friction += boost;
    frictionIncreases.push(`environmental concerns & pollution resistance (+${boost})`);
  }

  // 4. Legal disputes & regulatory litigation
  if (hasAgriLoss || hasSeverePollution || hasDisplacement) {
    const boost = 16;
    friction += boost;
    frictionIncreases.push(`legal disputes & judicial stay risks (+${boost})`);
    const boost2 = 12;
    friction += boost2;
    frictionIncreases.push(`complex multi-departmental approval process (+${boost2})`);
  }

  // 5. Generic industrial manufacturing execution requirements
  if (isIndustrialManufacturing && !hasAgriLoss && !hasDisplacement && !hasSeverePollution) {
    const boost = 16;
    friction += boost;
    frictionIncreases.push(`statutory environmental clearance & TNPCB Consent to Establish process (+${boost})`);
    const boost2 = 12;
    friction += boost2;
    frictionIncreases.push(`industrial water allocation & resource draw scrutiny (+${boost2})`);
    const boost3 = 10;
    friction += boost3;
    frictionIncreases.push(`freight traffic load & road pavement wear (+${boost3})`);
  }

  // 6. High implementation cost & complexity
  if ((analyses.infrastructure?.score ?? 0) >= 65 || /(high cost|expensive|budget|capital intensive)/i.test(descLower)) {
    const boost = 10;
    friction += boost;
    frictionIncreases.push(`high implementation cost & resource constraints (+${boost})`);
  }

  // 7. Safety concerns & hazard management
  if ((analyses.disaster_risk?.score ?? 0) >= 60 || hasPublicHealthRisks) {
    const boost = 12;
    friction += boost;
    frictionIncreases.push(`safety concerns & public hazard management (+${boost})`);
  }

  // Context-Aware Administrative Adjustments for Friction
  if (locationContext) {
    if (locationContext.isApprovedIndustrialZone && isIndustrialManufacturing && !hasDisplacement && !hasAgriLoss) {
      const relief = 16;
      friction -= relief;
      frictionDecreases.push(`conforming industrial zoning & established estate buffer from residential areas (-${relief})`);
    } else if (locationContext.isAgriculturalOrRuralZone && (isIndustrialManufacturing || /(factory|industrial|zone|plant)/i.test(descLower))) {
      const boost = 24;
      friction += boost;
      frictionIncreases.push(`intense agrarian resistance against conversion of fertile farmlands in ${locationContext.district} (+${boost})`);
    }

    if (locationContext.isEcoSensitiveOrWaterBuffer && (isIndustrialManufacturing || hasSeverePollution || /(factory|plant|effluent|dyeing)/i.test(descLower))) {
      const waterName = locationContext.nearbyWaterBodies[0] || 'local hydrologic catchment';
      const boost = 22;
      friction += boost;
      frictionIncreases.push(`environmental opposition & strict TNCDBR 15m buffer compliance near ${waterName} (+${boost})`);
    }

    if (locationContext.isHighDensityResidential && (isIndustrialManufacturing || hasSeverePollution || /(factory|plant|dust|noise)/i.test(descLower))) {
      const boost = 24;
      friction += boost;
      frictionIncreases.push(`public health grievances and citizen opposition in high-density residential ward (+${boost})`);
    }

    if (locationContext.highRiskActionsDetected.length > 0) {
      const actions = locationContext.highRiskActionsDetected;
      const boost = Math.min(28, actions.length * 9);
      friction += boost;
      frictionIncreases.push(`enhanced administrative friction from high-risk actions (${actions.join(', ')}) (+${boost})`);
    }

    // Dam / Water Release: Flood vs Drought
    const isWaterAction = /(dam|water release|excess water|sluice|canal|reservoir|water block|divert water)/i.test(descLower);
    if (isWaterAction) {
      if (/(flood|monsoon|surplus|precaution|excess flow|storage safety|heavy inflow)/i.test(descLower)) {
        const relief = 20;
        friction -= relief;
        frictionDecreases.push(`vital public safety flood mitigation protocol (-${relief})`);
      } else if (/(drought|dry|scarcity|block|divert|deprive|shut canal)/i.test(descLower)) {
        const boost = 32;
        friction += boost;
        frictionIncreases.push(`acute agricultural crop failure, farmer agitations, and interstate/inter-district water disputes (+${boost})`);
      }
    }

    // Road Widening: Vacant Bypass vs Densely Populated Neighborhood
    const isRoadAction = /(widen|widening|road expansion|corridor expansion|highway)/i.test(descLower);
    if (isRoadAction) {
      if (/(vacant|bypass|outer ring|peripheral|unoccupied|open land)/i.test(descLower)) {
        const relief = 16;
        friction -= relief;
        frictionDecreases.push(`minimal structural demolition and low displacement along bypass corridor (-${relief})`);
      } else if (/(dense|residential|bazaar|market|shop|demolish|evict|relocate|commercial street)/i.test(descLower) || locationContext.isHighDensityResidential) {
        const boost = 28;
        friction += boost;
        frictionIncreases.push(`merchant union resistance, structural demolition litigation, and tenant resettlement costs (+${boost})`);
      }
    }
  }

  // Facilitator triggers (-)
  if (isPublicWelfarePositive) {
    const reduction = 10;
    friction -= reduction;
    frictionDecreases.push(`strong public support & community backing (-${reduction})`);
    const reduction2 = 6;
    friction -= reduction2;
    frictionDecreases.push(`clear legal compliance & high administrative feasibility (-${reduction2})`);
  }

  // STRICT DECISION RULES FOR FRICTION:
  if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing && !hasDisplacement && !hasAgriLoss) {
    friction = Math.max(40, Math.min(48, friction));
  } else if ((locationContext?.isAgriculturalOrRuralZone || /(farmland|agricultural|crop|fertile)/i.test(descLower)) && isIndustrialManufacturing && !hasDisplacement) {
    friction = Math.max(76, Math.min(90, friction));
  } else if ((locationContext?.isEcoSensitiveOrWaterBuffer || /(wetland|marsh|lake|river|forest)/i.test(descLower)) && isIndustrialManufacturing && !hasDisplacement) {
    friction = Math.max(78, Math.min(92, friction));
  } else if (hasDisplacement && (hasSeverePollution || /(cement|chemical|factory|industrial|plant)/i.test(descLower))) {
    friction = Math.max(90, Math.min(96, friction)); // Critical Friction (90–96)
  } else if (hasAgriLoss && /(industrial|factory|zone)/i.test(descLower)) {
    friction = Math.max(82, Math.min(95, friction));
  } else if (/(dam|water release|excess water)/i.test(descLower) && /(flood|monsoon|surplus|precaution)/i.test(descLower)) {
    friction = Math.max(20, Math.min(30, friction));
  } else if (/(dam|water|canal)/i.test(descLower) && /(drought|dry|block|divert|scarcity)/i.test(descLower)) {
    friction = Math.max(90, Math.min(98, friction));
  } else if (/(widen|widening)/i.test(descLower) && /(vacant|bypass|outer ring|peripheral)/i.test(descLower)) {
    friction = Math.max(24, Math.min(34, friction));
  } else if (/(widen|widening)/i.test(descLower) && (/(dense|residential|bazaar|market|shop|demolish)/i.test(descLower) || locationContext?.isHighDensityResidential)) {
    friction = Math.max(82, Math.min(94, friction));
  } else if (hasAgriLoss || hasDisplacement || hasSeverePollution) {
    friction = Math.max(78, Math.min(96, friction)); // High to Very High Friction (78–96)
  } else if (isIndustrialManufacturing && !isPublicWelfarePositive) {
    // Generic industrial project without explicit location context: 56-62
    friction = Math.max(56, Math.min(62, friction)); // Moderate Friction (56–62)
  } else if (isPublicWelfarePositive) {
    friction = Math.max(14, Math.min(32, friction)); // Very Low to Low Friction (0–32)
  } else {
    friction = Math.max(20, Math.min(85, friction));
  }

  friction = Math.round(Math.max(0, Math.min(100, friction)));
  const frictionClassification = getFrictionClassification(friction);

  let frictionJustification = '';
  if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing && !hasDisplacement && !hasAgriLoss) {
    frictionJustification = `Implementation friction is Moderate (${friction}/100): Manageable operational requirements within an approved industrial park, requiring standard TNPCB Consent to Establish and trade effluent compliance without residential eviction or agricultural disruption.`;
  } else if (locationContext?.isAgriculturalOrRuralZone && isIndustrialManufacturing && !hasDisplacement) {
    frictionJustification = `Implementation friction is High to Very High (${friction}/100): Triggered by strong agrarian resistance against farmlands conversion in ${locationContext.district}, environmental opposition, and strict statutory agricultural preservation mandates.`;
  } else if (/(dam|water release|excess water)/i.test(descLower) && /(flood|monsoon|surplus|precaution)/i.test(descLower)) {
    frictionJustification = `Implementation friction is Low (${friction}/100): Action follows standard PWD flood regulation protocols and disaster management procedures with broad public safety alignment.`;
  } else if (/(dam|water|canal)/i.test(descLower) && /(drought|dry|block|divert|scarcity)/i.test(descLower)) {
    frictionJustification = `Implementation friction is Very High (${friction}/100): Severe resistance from downstream farming communities, agrarian unions, and high likelihood of interstate or inter-district legal disputes.`;
  } else if (/(widen|widening)/i.test(descLower) && /(vacant|bypass|outer ring|peripheral)/i.test(descLower)) {
    frictionJustification = `Implementation friction is Low to Moderate (${friction}/100): Low execution resistance due to vacant land alignment, avoiding commercial demolition and residential eviction.`;
  } else if (/(widen|widening)/i.test(descLower) && (/(dense|residential|bazaar|market|shop|demolish)/i.test(descLower) || locationContext?.isHighDensityResidential)) {
    frictionJustification = `Implementation friction is High to Very High (${friction}/100): Critical opposition from merchant associations, affected shopkeepers, and displaced residents facing structural demolition.`;
  } else if (hasDisplacement && (hasSeverePollution || /(cement|chemical|factory|plant)/i.test(descLower))) {
    frictionJustification = `Implementation friction is Very High (${friction}/100): Critical resistance driven by involuntary displacement of settled families, acute public opposition, mandatory RFCTLARR Act (2013) rehabilitation liabilities, and high risk of judicial stay injunctions.`;
  } else if (hasAgriLoss && /(industrial|zone)/i.test(descLower)) {
    frictionJustification = `Implementation friction is High to Very High (${friction}/100): Triggered by strong farmer mobilization against agricultural land conversion, intense environmental opposition, complex land acquisition approvals, and high legal dispute likelihood.`;
  } else if (isIndustrialManufacturing && !isPublicWelfarePositive && !hasAgriLoss && !hasDisplacement) {
    frictionJustification = `Implementation friction is Moderate (${friction}/100): Reflects actual execution requirements including statutory environmental clearance (TNPCB Consent to Establish under Water and Air Acts), industrial water supply allocation, freight traffic strain, and community environmental safeguards.`;
  } else if (friction >= 81) {
    frictionJustification = `Implementation friction is Very High (${friction}/100): Critical resistance stemming from ${frictionIncreases.slice(0, 2).join(', ') || 'severe public opposition and legal disputes'}.`;
  } else if (friction >= 61) {
    frictionJustification = `Implementation friction is High (${friction}/100): Substantial execution barriers including ${frictionIncreases.slice(0, 2).join(' and ') || 'public protests, statutory clearances, and high civic friction'}.`;
  } else if (friction >= 41) {
    frictionJustification = `Implementation friction is Moderate (${friction}/100): Managed operational challenges with typical administrative hurdles and inter-agency coordination requirements.`;
  } else {
    frictionJustification = `Implementation friction is ${frictionClassification} (${friction}/100): Minimal friction supported by ${frictionDecreases.slice(0, 2).join(' and ') || 'broad public support and clear legal compliance'}.`;
  }

  return {
    gainScore: gain,
    gainClassification,
    gainJustification,
    frictionScore: friction,
    frictionClassification,
    frictionJustification,
  };
}

export function computeImpactScores(
  analyses: Record<AgentImpactDomain, AgentAnalysis>,
  hintPolarity?: 'positive' | 'negative' | 'mixed',
  description: string = '',
  archetype?: PolicyArchetype,
  locationContext?: LocationAdministrativeContext
): ImpactScores {
  // Operational Friction / Disruption scores (0-100)
  const transport = analyses.transport?.score ?? 35;
  const infrastructure = analyses.infrastructure?.score ?? 30;
  const economic = analyses.economic?.score ?? 30;
  const environmental = analyses.environmental?.score ?? 35;
  const population = analyses.population?.score ?? 30;
  const essentialServices = analyses.essential_services?.score ?? 30;
  const disasterRisk = analyses.disaster_risk?.score ?? 25;
  const social = analyses.social?.score ?? 25;
  const policyCompliance = analyses.policy_compliance?.score ?? 20;

  const publicSafety = Math.round((disasterRisk * 0.5) + (essentialServices * 0.3) + (policyCompliance * 0.2));
  const healthcare = Math.round((essentialServices * 0.7) + (population * 0.3));
  const education = Math.round((essentialServices * 0.5) + (social * 0.3) + (transport * 0.2));

  // Calculate Mandatory Gain and Friction Scores
  const framework = computeFrameworkGainAndFriction(
    analyses,
    hintPolarity,
    description,
    archetype,
    locationContext
  );

  const overallPolicyRisk = framework.frictionScore;

  // Positive Societal Benefit scores (0-100) - strictly evidence-based
  const isNegative = hintPolarity === 'negative';
  const inferPositive = (agentAnalysis: AgentAnalysis | undefined, domainScore: number) => {
    if (!agentAnalysis) return 0;
    if (typeof agentAnalysis.positiveScore === 'number') {
      if (isNegative) return Math.min(15, agentAnalysis.positiveScore);
      return agentAnalysis.positiveScore;
    }
    const posFindings = (agentAnalysis.positiveFindings || []).filter(f => f.polarity === 'positive');
    if (posFindings.length === 0) {
      return 0; // Insufficient evidence / no claimed or evidenced positive gains
    }
    if (isNegative) return Math.min(15, posFindings.length * 5);
    if (hintPolarity === 'positive') return Math.max(70, Math.min(95, 100 - (domainScore * 0.3)));
    return Math.min(80, posFindings.length * 25);
  };

  const pTransport = analyses.transport?.positiveScore !== undefined ? (isNegative ? Math.min(15, analyses.transport.positiveScore) : analyses.transport.positiveScore) : inferPositive(analyses.transport, transport);
  const pInfrastructure = analyses.infrastructure?.positiveScore !== undefined ? (isNegative ? Math.min(15, analyses.infrastructure.positiveScore) : analyses.infrastructure.positiveScore) : inferPositive(analyses.infrastructure, infrastructure);
  const pEconomic = analyses.economic?.positiveScore !== undefined ? (isNegative ? Math.min(15, analyses.economic.positiveScore) : analyses.economic.positiveScore) : inferPositive(analyses.economic, economic);
  const pEnvironmental = analyses.environmental?.positiveScore !== undefined ? (isNegative ? Math.min(15, analyses.environmental.positiveScore) : analyses.environmental.positiveScore) : inferPositive(analyses.environmental, environmental);
  const pPopulation = analyses.population?.positiveScore !== undefined ? (isNegative ? Math.min(15, analyses.population.positiveScore) : analyses.population.positiveScore) : inferPositive(analyses.population, population);
  const pEssentialServices = analyses.essential_services?.positiveScore !== undefined ? (isNegative ? Math.min(15, analyses.essential_services.positiveScore) : analyses.essential_services.positiveScore) : inferPositive(analyses.essential_services, essentialServices);
  const pDisasterRisk = analyses.disaster_risk?.positiveScore !== undefined ? (isNegative ? Math.min(15, analyses.disaster_risk.positiveScore) : analyses.disaster_risk.positiveScore) : inferPositive(analyses.disaster_risk, disasterRisk);
  const pSocial = analyses.social?.positiveScore !== undefined ? (isNegative ? Math.min(15, analyses.social.positiveScore) : analyses.social.positiveScore) : inferPositive(analyses.social, social);
  const pPolicyCompliance = analyses.policy_compliance?.positiveScore !== undefined ? (isNegative ? Math.min(15, analyses.policy_compliance.positiveScore) : analyses.policy_compliance.positiveScore) : inferPositive(analyses.policy_compliance, policyCompliance);

  const hasExplicitHealthcare = /(hospital|health|clinic|medical|ambulance|trauma care|phc)/i.test(description);
  const hasExplicitEducation = /(school|college|university|education|student|campus|classroom)/i.test(description);
  const hasExplicitPublicSafety = /(safety|police|disaster|flood|cyclone|fire|emergency)/i.test(description);

  const pPublicSafety = hasExplicitPublicSafety
    ? Math.round((pDisasterRisk * 0.4) + (pEssentialServices * 0.3) + (pPolicyCompliance * 0.3))
    : 0;
  const pHealthcare = hasExplicitHealthcare
    ? Math.round((pEssentialServices * 0.7) + (pPopulation * 0.3))
    : 0;
  const pEducation = hasExplicitEducation
    ? Math.round((pEssentialServices * 0.5) + (pSocial * 0.5))
    : 0;

  const overallSocietalBenefit = framework.gainScore;

  // Net Viability Score accurately calculates net balance between positive benefits and negative risks
  // Scaled from 5 to 98:
  const netViabilityScore = Math.max(5, Math.min(98, Math.round(((overallSocietalBenefit * 1.3) - (overallPolicyRisk * 1.1) + 100) / 2)));

  let derivedPolarity: 'positive' | 'negative' | 'mixed' = hintPolarity || 'mixed';
  if (!hintPolarity) {
    if (overallPolicyRisk >= 65 || (overallPolicyRisk - overallSocietalBenefit) >= 20 || netViabilityScore < 45) {
      derivedPolarity = 'negative';
    } else if (overallSocietalBenefit >= 68 && overallPolicyRisk <= 42 && netViabilityScore >= 65) {
      derivedPolarity = 'positive';
    } else {
      derivedPolarity = 'mixed';
    }
  }

  return {
    transport,
    infrastructure,
    economic,
    environmental,
    publicSafety,
    population,
    healthcare,
    education,
    disasterRisk,
    overallPolicyRisk,
    positiveScores: {
      transport: pTransport,
      infrastructure: pInfrastructure,
      economic: pEconomic,
      environmental: pEnvironmental,
      publicSafety: pPublicSafety,
      population: pPopulation,
      healthcare: pHealthcare,
      education: pEducation,
      disasterRisk: pDisasterRisk,
      overallSocietalBenefit,
    },
    overallSocietalBenefit,
    netViabilityScore,
    polarity: derivedPolarity,
    gainScore: framework.gainScore,
    gainClassification: framework.gainClassification,
    gainJustification: framework.gainJustification,
    frictionScore: framework.frictionScore,
    frictionClassification: framework.frictionClassification,
    frictionJustification: framework.frictionJustification,
  };
}

// ------------------------------------------------------------------------------------------------
// Balanced Decision Evaluation Engine (Mandatory Neutrality & Equal-Weighted Framework)
// ------------------------------------------------------------------------------------------------

export function buildBalancedDecisionEvaluation(
  description: string,
  archetype: PolicyArchetype,
  policy: PolicyUnderstanding,
  agentAnalyses: Record<AgentImpactDomain, AgentAnalysis>,
  impactScores: ImpactScores,
  intentPolarity: 'positive' | 'negative' | 'mixed',
  locationContext?: LocationAdministrativeContext
): BalancedDecisionEvaluation {
  const descLower = description.toLowerCase();
  const text = `${description} ${policy.reason || ''} ${policy.summary || ''}`.toLowerCase();

  // 1. Detect Severe Negative Override Flags
  const isAgrarianDestructionWord =
    descLower.includes('destruct') ||
    descLower.includes('demolish') ||
    descLower.includes('convert') ||
    descLower.includes('conversion') ||
    descLower.includes('acquire') ||
    descLower.includes('acquisition') ||
    descLower.includes('strip') ||
    descLower.includes('loss') ||
    descLower.includes('damage') ||
    descLower.includes('encroach');

  const isAgrarianLandWord =
    descLower.includes('agricultur') ||
    descLower.includes('farmland') ||
    descLower.includes('farm land') ||
    descLower.includes('fertile land') ||
    descLower.includes('crop land') ||
    descLower.includes('paddy') ||
    descLower.includes('cultivable');

  const destructionOfAgriculturalLand =
    archetype === 'agricultural_destruction_hazard' ||
    (isAgrarianDestructionWord && isAgrarianLandWord) ||
    descLower.includes('destruction of agricultur') ||
    (Boolean(locationContext?.isAgriculturalOrRuralZone) && !locationContext?.isApprovedIndustrialZone && /(factory|industrial|manufacturing|plant|acquire|convert|demolish)/i.test(descLower));

  const isVacantOrBypass = (descLower.includes('widen') || descLower.includes('widening')) && (descLower.includes('vacant') || descLower.includes('bypass') || descLower.includes('peripheral') || descLower.includes('outer ring'));

  const displacementOfPeople =
    !isVacantOrBypass && (
      archetype === 'displacement_relocation_industrial' ||
      archetype === 'forced_eviction_resettlement' ||
      descLower.includes('relocate') ||
      descLower.includes('relocation') ||
      descLower.includes('displacement') ||
      descLower.includes('evict') ||
      descLower.includes('eviction') ||
      descLower.includes('families') ||
      descLower.includes('resettle') ||
      descLower.includes('slum clearance') ||
      ((descLower.includes('widen') || descLower.includes('widening')) && (descLower.includes('dense') || descLower.includes('residential') || descLower.includes('bazaar') || descLower.includes('shop') || Boolean(locationContext?.isHighDensityResidential)))
    );

  const irreversibleEnvironmentalDamage =
    archetype === 'environmental_destruction_loss' ||
    destructionOfAgriculturalLand ||
    descLower.includes('deforestation') ||
    descLower.includes('felling trees') ||
    descLower.includes('tree felling') ||
    descLower.includes('wetland destruction') ||
    descLower.includes('lake bed encroachment') ||
    descLower.includes('forest clear') ||
    (Boolean(locationContext?.isEcoSensitiveOrWaterBuffer) && !locationContext?.isApprovedIndustrialZone && /(factory|industrial|chemical|dyeing|effluent|pollut)/i.test(descLower));

  const seriousPollution =
    archetype === 'polluting_industry_hazard' ||
    descLower.includes('cement') ||
    descLower.includes('chemical plant') ||
    descLower.includes('tannery') ||
    descLower.includes('smelter') ||
    descLower.includes('toxic effluent') ||
    descLower.includes('clinker dust') ||
    descLower.includes('hazardous emission') ||
    (Boolean(locationContext?.isEcoSensitiveOrWaterBuffer || locationContext?.isHighDensityResidential) && !locationContext?.isApprovedIndustrialZone && /(factory|manufacturing|textile|industrial)/i.test(descLower));

  const publicSafetyRisks =
    descLower.includes('explosion') ||
    descLower.includes('hazardous material') ||
    descLower.includes('structural collapse') ||
    descLower.includes('fire hazard');

  const violatesMunicipalRegulations =
    archetype === 'displacement_relocation_industrial' ||
    archetype === 'agricultural_destruction_hazard' ||
    descLower.includes('encroachment') ||
    descLower.includes('zoning violation') ||
    descLower.includes('unauthorized') ||
    descLower.includes('master plan violation') ||
    (agentAnalyses.policy_compliance?.score ?? 0) >= 75 ||
    (!locationContext?.isApprovedIndustrialZone && Boolean(locationContext?.isAgriculturalOrRuralZone || locationContext?.isEcoSensitiveOrWaterBuffer) && /(factory|industrial|plant)/i.test(descLower));

  const severeImpactFlags = {
    irreversibleEnvironmentalDamage,
    destructionOfAgriculturalLand,
    displacementOfPeople,
    seriousPollution,
    publicSafetyRisks,
    violatesMunicipalRegulations,
  };

  const hasAnySevereFlag = Object.values(severeImpactFlags).some(Boolean);

  const isIndustrialManufacturing =
    archetype === 'industrial_zone' ||
    /(factory|textile|manufacturing|industrial|refinery|chemical|cement|smelter|tannery|processing plant|workshop)/i.test(descLower);

  const hasDisplacement = displacementOfPeople;
  const hasAgriLoss = destructionOfAgriculturalLand;
  const isPublicWelfarePositive =
    intentPolarity === 'positive' ||
    (/(hospital|trauma care|phc|clinic|school|college|clean drinking water|filtration|solar microgrid|flood shelter|park|bus terminal|flyover)/i.test(descLower) &&
      !hasAgriLoss &&
      !hasDisplacement &&
      !seriousPollution);

  const dimensions: Record<BalancedEvaluationDimensionKey, BalancedDimensionAssessment> = {} as any;

  // 1. Economic Impact
  if (destructionOfAgriculturalLand) {
    dimensions.economic = {
      dimension: 'economic',
      dimensionLabel: 'Economic Impact',
      impactLevel: 'Moderate Negative',
      positiveImpacts: ['Short-term speculative commercial real estate transactions'],
      negativeImpacts: [
        'Permanent wipeout of annual agrarian crop revenues',
        'Direct livelihood termination for agricultural tenant farmers and laborers',
        'Localized commodity price inflation in regional vegetable and grain mandis',
      ],
      evidence: 'Destruction of productive agrarian acreage directly terminates generational farming cash flows, resulting in net rural economic distress.',
    };
  } else if (displacementOfPeople || seriousPollution) {
    dimensions.economic = {
      dimension: 'economic',
      dimensionLabel: 'Economic Impact',
      impactLevel: 'Moderate Positive',
      positiveImpacts: [
        'Potential industrial manufacturing output and factory jobs (unstated scale in proposal)',
        'Potential commercial tax revenues and logistics throughput',
      ],
      negativeImpacts: [
        'Severe livelihood disruption and uncompensated wage loss for displaced informal workers',
        'Depreciation of surrounding residential real estate values due to industrial pollution',
      ],
      evidence: 'Potential industrial production gains are recognized as potential benefits, but are heavily eclipsed by acute economic disruption to settled households.',
    };
  } else if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing) {
    dimensions.economic = {
      dimension: 'economic',
      dimensionLabel: 'Economic Impact',
      impactLevel: 'Moderate Positive',
      positiveImpacts: [
        `Leverages designated industrial infrastructure in ${locationContext.municipalInfrastructureBaseline[0] || 'SIPCOT/SIDCO industrial estate'}`,
        'Potential manufacturing production output and factory jobs (scale unstated in proposal)',
        'Strengthens regional industrial supply chain and export logistics',
      ],
      negativeImpacts: [
        'Municipal utility load allocation and industrial power consumption',
      ],
      evidence: `Proposed within an approved industrial estate. Industrial production aligns with planned commercial zoning, though specific job counts and investment scale remain unstated in the proposal.`,
    };
  } else if (isIndustrialManufacturing) {
    dimensions.economic = {
      dimension: 'economic',
      dimensionLabel: 'Economic Impact',
      impactLevel: 'Moderate Positive',
      positiveImpacts: [
        'Potential employment generation (exact job numbers unstated in proposal)',
        'Potential economic activity and industrial manufacturing output',
        'Potential demand for local commercial and logistics services',
      ],
      negativeImpacts: [
        'Possible municipal resource diversion for industrial power and utility loads',
        'Unquantified municipal public service and regulatory oversight expenditure',
      ],
      evidence: 'Potential commercial benefits identified. Specific job numbers and investment scale are unstated in the proposal and cannot be assumed as confirmed facts.',
    };
  } else if (archetype === 'healthcare_hospital') {
    dimensions.economic = {
      dimension: 'economic',
      dimensionLabel: 'Economic Impact',
      impactLevel: 'High Positive',
      positiveImpacts: [
        'Provides clinical healthcare positions and allied medical employment',
        'Reduces out-of-pocket medical expenses for local families under CMCHIS',
        'Catalyzes local pharmaceutical, diagnostic, and support retail activity',
      ],
      negativeImpacts: ['Requires initial state capital budget outlay'],
      evidence: 'Direct expansion of public clinical infrastructure yields high long-term economic returns and protects household wealth.',
    };
  } else if (text.includes('dam') && (text.includes('drought') || text.includes('block') || text.includes('divert'))) {
    dimensions.economic = {
      dimension: 'economic',
      dimensionLabel: 'Economic Impact',
      impactLevel: 'High Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Severe crop failure and loss of agrarian revenue across downstream ayacut',
        'Deprivation of canal irrigation water during critical standing crop stages',
      ],
      evidence: 'Depriving downstream agrarian belts of canal irrigation during drought creates acute economic catastrophe for farming households.',
    };
  } else {
    dimensions.economic = {
      dimension: 'economic',
      dimensionLabel: 'Economic Impact',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: [],
      evidence: 'Insufficient evidence in proposal regarding specific economic stimulus, fiscal revenue, or employment creation. No benefits can be assumed without economic feasibility data.',
    };
  }

  // 2. Environmental Impact
  if (destructionOfAgriculturalLand || irreversibleEnvironmentalDamage || seriousPollution) {
    dimensions.environmental = {
      dimension: 'environmental',
      dimensionLabel: 'Environmental Impact',
      impactLevel: 'High Negative',
      positiveImpacts: [],
      negativeImpacts: [
        destructionOfAgriculturalLand ? 'Permanent loss of fertile multi-crop topsoil and agrarian biodiversity' : 'Air quality degradation with particulate and industrial emissions',
        locationContext?.isEcoSensitiveOrWaterBuffer ? `Direct contamination risk to nearby water body (${locationContext.nearbyWaterBodies[0] || 'local river basin'})` : 'Loss of natural groundwater percolation basin and carbon sink capacity',
        'Breach of statutory environmental carrying capacity and buffer standards',
      ],
      evidence: locationContext?.isEcoSensitiveOrWaterBuffer
        ? `Locating industrial operations adjacent to sensitive water bodies (${locationContext.nearbyWaterBodies[0] || 'water body'}) creates severe contamination hazards and breaches statutory buffers.`
        : 'Causes irreversible topsoil destruction or industrial contamination, resulting in permanent ecological damage.',
    };
  } else if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing) {
    dimensions.environmental = {
      dimension: 'environmental',
      dimensionLabel: 'Environmental Impact',
      impactLevel: 'Moderate Negative',
      positiveImpacts: [
        'Situated in designated industrial estate with Common Effluent Treatment Plant (CETP) provisions',
        'Maintains established physical buffer distance from residential settlements',
      ],
      negativeImpacts: [
        'Industrial water consumption draw on regional groundwater resources',
        'Mandatory trade effluent discharge monitoring under TNPCB Consent to Establish',
      ],
      evidence: `Proposed inside an approved industrial estate (${locationContext.municipalInfrastructureBaseline[0] || 'SIPCOT/SIDCO'}). Environmental risks are manageable under statutory TNPCB Consent to Establish (CTE) conditions.`,
    };
  } else if (isIndustrialManufacturing) {
    dimensions.environmental = {
      dimension: 'environmental',
      dimensionLabel: 'Environmental Impact',
      impactLevel: 'Moderate Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Possible air, water, and noise pollution from manufacturing and trade effluent processes',
        'Possible high industrial water consumption impacting local water table',
        'Possible trade effluent and industrial waste management requirements',
      ],
      evidence: 'Industrial manufacturing operations carry known environmental risks regarding water draw, trade effluent, and emissions. Specific pollution levels and treatment plans are unstated in proposal.',
    };
  } else if (archetype === 'healthcare_hospital') {
    dimensions.environmental = {
      dimension: 'environmental',
      dimensionLabel: 'Environmental Impact',
      impactLevel: 'Moderate Positive',
      positiveImpacts: [
        'Integrates modern bio-medical effluent treatment plant (ETP/STP)',
        'Incorporates green campus buffer and rooftop solar microgrid',
      ],
      negativeImpacts: ['Temporary excavation dust during initial civil construction'],
      evidence: 'Incorporation of statutory environmental treatment facilities maintains positive ecological compliance.',
    };
  } else {
    dimensions.environmental = {
      dimension: 'environmental',
      dimensionLabel: 'Environmental Impact',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: [],
      evidence: 'Insufficient evidence in proposal regarding ecological impact or green buffer commitments. Formal environmental carrying capacity baseline required.',
    };
  }

  // 3. Social Impact
  if (displacementOfPeople || destructionOfAgriculturalLand) {
    dimensions.social = {
      dimension: 'social',
      dimensionLabel: 'Social Impact',
      impactLevel: 'High Negative',
      positiveImpacts: [],
      negativeImpacts: [
        displacementOfPeople ? 'Forced uprooting of established families causing severe trauma and social dislocation' : 'Destruction of generational agrarian heritage and rural community fabric',
        'Disruption of children schooling and community mutual support networks',
        'Acute public outrage, peasant agitations, and civil society resistance',
      ],
      evidence: 'Forced population displacement or farmland conversion inflicts severe human hardship and civic conflict.',
    };
  } else if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing) {
    dimensions.social = {
      dimension: 'social',
      dimensionLabel: 'Social Impact',
      impactLevel: 'Neutral',
      positiveImpacts: ['Minimal residential disturbance due to established industrial buffer'],
      negativeImpacts: ['Requires verification of worker occupational health and safety standards'],
      evidence: `Situated within a designated industrial zone away from dense residential settlements, avoiding immediate residential displacement or community agitation.`,
    };
  } else if (isIndustrialManufacturing) {
    dimensions.social = {
      dimension: 'social',
      dimensionLabel: 'Social Impact',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: ['Possible public concern from neighboring residents regarding industrial zoning and emissions'],
      evidence: 'Public approval is Unknown. No citizen consultation, Grama Sabha resolution, or social impact survey is provided in the proposal.',
    };
  } else if (archetype === 'healthcare_hospital') {
    dimensions.social = {
      dimension: 'social',
      dimensionLabel: 'Social Impact',
      impactLevel: 'High Positive',
      positiveImpacts: [
        'Expands accessible tertiary emergency healthcare for the district population',
        'Ensures equitable medical coverage for low-income and rural populations',
        'Addresses high community demand for accessible specialized medical care',
      ],
      negativeImpacts: ['Temporary localized traffic adjustments during building phase'],
      evidence: 'Delivers transformative social welfare equity and widespread citizen satisfaction.',
    };
  } else if ((text.includes('widen') || text.includes('widening')) && (text.includes('vacant') || text.includes('bypass'))) {
    dimensions.social = {
      dimension: 'social',
      dimensionLabel: 'Social Impact',
      impactLevel: 'Moderate Positive',
      positiveImpacts: [
        'Enhances regional transit without residential demolition or commercial eviction',
        'Minimizes civic disruption through peripheral bypass corridor alignment',
      ],
      negativeImpacts: ['Temporary construction noise during civil works'],
      evidence: 'Utilizing vacant/bypass corridors avoids residential displacement while enhancing regional mobility.',
    };
  } else {
    dimensions.social = {
      dimension: 'social',
      dimensionLabel: 'Social Impact',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: [],
      evidence: 'Insufficient evidence in proposal regarding citizen approval or community consensus. Public consultation and social impact records are unstated.',
    };
  }

  // 4. Public Health & Safety
  if (seriousPollution) {
    dimensions.publicHealthSafety = {
      dimension: 'publicHealthSafety',
      dimensionLabel: 'Public Health & Safety',
      impactLevel: 'High Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'High risk of respiratory ailments, particulate inhalation, and asthma from industrial emissions',
        'Heightened morbidity for vulnerable pediatric and geriatric residents',
        'Heavy industrial vehicle traffic creating severe road collision risks',
      ],
      evidence: 'Locating polluting heavy industry in proximity to human settlements presents severe respiratory and safety hazards.',
    };
  } else if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing) {
    dimensions.publicHealthSafety = {
      dimension: 'publicHealthSafety',
      dimensionLabel: 'Public Health & Safety',
      impactLevel: 'Neutral',
      positiveImpacts: ['Dedicated freight ingress corridors minimize municipal traffic hazards'],
      negativeImpacts: [
        'Requires rigorous on-site factory worker safety and occupational health compliance',
        'Hazardous chemical handling protocols must be maintained',
      ],
      evidence: 'Operating within an approved industrial estate separates heavy freight from local residential traffic, mitigating community health hazards.',
    };
  } else if (isIndustrialManufacturing) {
    dimensions.publicHealthSafety = {
      dimension: 'publicHealthSafety',
      dimensionLabel: 'Public Health & Safety',
      impactLevel: 'Moderate Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Possible localized respiratory or environmental health risks if industrial emissions or effluent are unmitigated',
        'Possible increased road traffic collision risks from heavy multi-axle freight movement',
      ],
      evidence: 'Minimal/No Direct Impact on public healthcare services. Industrial operations pose possible localized health and traffic risks unless strictly controlled.',
    };
  } else if (archetype === 'healthcare_hospital') {
    dimensions.publicHealthSafety = {
      dimension: 'publicHealthSafety',
      dimensionLabel: 'Public Health & Safety',
      impactLevel: 'High Positive',
      positiveImpacts: [
        'Adds specialty and ICU beds, enhancing regional emergency trauma response',
        'Improves emergency critical care capacity and reduces patient transfer delays',
        'Dedicated multi-specialty triage and emergency stabilization wings',
      ],
      negativeImpacts: ['Hazardous bio-medical waste requires strict protocols'],
      evidence: 'Substantially elevates regional life expectancy and emergency clinical survival.',
    };
  } else if ((text.includes('dam') || text.includes('water discharge')) && (text.includes('flood') || text.includes('surplus') || text.includes('monsoon'))) {
    dimensions.publicHealthSafety = {
      dimension: 'publicHealthSafety',
      dimensionLabel: 'Public Health & Safety',
      impactLevel: 'High Positive',
      positiveImpacts: ['Safeguards downstream human settlements from catastrophic flash flooding and reservoir breach'],
      negativeImpacts: ['Downstream riparian warning and evacuation protocol required'],
      evidence: 'Controlled hydraulic discharge during flood peaks averts catastrophic structural failure and protects thousands of downstream residents.',
    };
  } else if (text.includes('dam') && (text.includes('drought') || text.includes('block') || text.includes('divert'))) {
    dimensions.publicHealthSafety = {
      dimension: 'publicHealthSafety',
      dimensionLabel: 'Public Health & Safety',
      impactLevel: 'Moderate Negative',
      positiveImpacts: [],
      negativeImpacts: ['Severe drinking water scarcity in tail-end rural habitations'],
      evidence: 'Canal diversion during drought deprives rural habitations of essential drinking water reserves.',
    };
  } else {
    dimensions.publicHealthSafety = {
      dimension: 'publicHealthSafety',
      dimensionLabel: 'Public Health & Safety',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: [],
      evidence: 'Insufficient evidence in proposal regarding direct public health benefits or acute safety hazard mitigation.',
    };
  }

  // 5. Infrastructure Impact
  if (destructionOfAgriculturalLand) {
    dimensions.infrastructure = {
      dimension: 'infrastructure',
      dimensionLabel: 'Infrastructure Impact',
      impactLevel: 'Moderate Negative',
      positiveImpacts: ['Provides cleared footprint for non-agricultural layout'],
      negativeImpacts: [
        'Destroys established rural field channels, distributary irrigation canals, and farm roads',
        'Loss of micro-watershed percolation assets built over decades',
      ],
      evidence: 'Demolition of established agrarian irrigation infrastructure impairs regional water drainage.',
    };
  } else if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing) {
    dimensions.infrastructure = {
      dimension: 'infrastructure',
      dimensionLabel: 'Infrastructure Impact',
      impactLevel: 'Moderate Positive',
      positiveImpacts: [
        `Leverages pre-existing SIPCOT/SIDCO heavy utility power feeders and internal logistics roads`,
        'Prevents haphazard encroachment onto municipal urban road networks',
      ],
      negativeImpacts: ['Increases demand load on industrial water distribution network'],
      evidence: 'Utilizes planned industrial park infrastructure, avoiding strain on municipal residential civic utilities.',
    };
  } else if (isIndustrialManufacturing) {
    dimensions.infrastructure = {
      dimension: 'infrastructure',
      dimensionLabel: 'Infrastructure Impact',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: ['Possible heavy load on local roads, power feeder lines, and water distribution networks'],
      evidence: 'Minimal/No Direct Impact on public civic infrastructure. The proposal does not include public roads, utilities, or schools; it creates demand on existing infrastructure.',
    };
  } else if (archetype === 'healthcare_hospital') {
    dimensions.infrastructure = {
      dimension: 'infrastructure',
      dimensionLabel: 'Infrastructure Impact',
      impactLevel: 'High Positive',
      positiveImpacts: [
        'Constructs modern medical clinical campus with dedicated utility connections',
        'Adds dedicated emergency ambulance ingress corridors',
      ],
      negativeImpacts: ['Increases demand load on municipal water and sewer links'],
      evidence: 'Delivers high-capacity, permanent civic infrastructure to the district.',
    };
  } else if ((text.includes('dam') || text.includes('water discharge')) && (text.includes('flood') || text.includes('surplus') || text.includes('monsoon'))) {
    dimensions.infrastructure = {
      dimension: 'infrastructure',
      dimensionLabel: 'Infrastructure Impact',
      impactLevel: 'High Positive',
      positiveImpacts: ['Protects dam structural integrity, spillway gates, and irrigation headworks'],
      negativeImpacts: ['Erosion risk along unlined downstream canal bunds'],
      evidence: 'Crucial for safeguarding regional water resources hydraulic infrastructure.',
    };
  } else if ((text.includes('widen') || text.includes('widening')) && (text.includes('vacant') || text.includes('bypass'))) {
    dimensions.infrastructure = {
      dimension: 'infrastructure',
      dimensionLabel: 'Infrastructure Impact',
      impactLevel: 'High Positive',
      positiveImpacts: [
        'Substantially expands arterial highway capacity and eliminates freight bottlenecks',
        'Dedicated multi-lane right-of-way built to IRC express corridor standards',
      ],
      negativeImpacts: ['Requires initial civil capital expenditure outlay'],
      evidence: 'Delivers major long-term transportation infrastructure without demolishing municipal urban fabric.',
    };
  } else {
    dimensions.infrastructure = {
      dimension: 'infrastructure',
      dimensionLabel: 'Infrastructure Impact',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: [],
      evidence: 'Insufficient evidence in proposal regarding civil infrastructure expansion or utility upgrades.',
    };
  }

  // 6. Municipal Administration Impact
  if (displacementOfPeople || destructionOfAgriculturalLand) {
    dimensions.municipalAdmin = {
      dimension: 'municipalAdmin',
      dimensionLabel: 'Municipal Administration Impact',
      impactLevel: 'High Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Overwhelming administrative workload on District Collectorate and Revenue Tehsildar',
        'Intense law-and-order police deployment for eviction/conversion security',
        'Mass public grievance escalation and potential municipal administrative paralysis',
      ],
      evidence: 'Massive citizen resistance and grievance load overwhelms local administrative bandwidth.',
    };
  } else if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing) {
    dimensions.municipalAdmin = {
      dimension: 'municipalAdmin',
      dimensionLabel: 'Municipal Administration Impact',
      impactLevel: 'Neutral',
      positiveImpacts: ['Standardized estate management handled via SIPCOT/SIDCO administrative wing'],
      negativeImpacts: ['Routine factory inspectorate and environmental oversight duties'],
      evidence: 'Estate operations follow established municipal administration protocols without community grievance escalation.',
    };
  } else if (isIndustrialManufacturing) {
    dimensions.municipalAdmin = {
      dimension: 'municipalAdmin',
      dimensionLabel: 'Municipal Administration Impact',
      impactLevel: 'Moderate Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Requires continuous monitoring and inspection by municipal authorities and environmental regulators',
        'Potential municipal administrative burden in addressing industrial pollution grievances',
      ],
      evidence: 'Imposes ongoing regulatory oversight, zoning verification, and utility coordination duties on local administrative machinery.',
    };
  } else if (archetype === 'healthcare_hospital') {
    dimensions.municipalAdmin = {
      dimension: 'municipalAdmin',
      dimensionLabel: 'Municipal Administration Impact',
      impactLevel: 'Moderate Positive',
      positiveImpacts: [
        'Fulfills state master plan healthcare infrastructure norms',
        'Establishes unified public health administrative coordination',
      ],
      negativeImpacts: ['Requires multi-departmental coordination during civil execution'],
      evidence: 'Enhances municipal administrative service delivery capabilities.',
    };
  } else if ((text.includes('dam') || text.includes('water discharge')) && (text.includes('flood') || text.includes('surplus') || text.includes('monsoon'))) {
    dimensions.municipalAdmin = {
      dimension: 'municipalAdmin',
      dimensionLabel: 'Municipal Administration Impact',
      impactLevel: 'Moderate Positive',
      positiveImpacts: ['Effective execution of inter-departmental disaster management protocol'],
      negativeImpacts: ['Emergency coordination and downstream evacuation logistics required'],
      evidence: 'Follows established state disaster management protocol with clear administrative command structure.',
    };
  } else {
    dimensions.municipalAdmin = {
      dimension: 'municipalAdmin',
      dimensionLabel: 'Municipal Administration Impact',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: [],
      evidence: 'Insufficient evidence in proposal regarding municipal administrative workload or departmental realignment.',
    };
  }

  // 7. Legal & Policy Compliance
  if (displacementOfPeople) {
    dimensions.legalCompliance = {
      dimension: 'legalCompliance',
      dimensionLabel: 'Legal & Policy Compliance',
      impactLevel: 'High Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Direct violation of Right to Fair Compensation and Transparency in Land Acquisition (RFCTLARR Act 2013)',
        'Failure to complete statutory Social Impact Assessment (SIA) with Grama Sabha consent',
        'Imminent risk of Madras High Court stay injunction halting the project',
      ],
      evidence: 'Involuntary displacement without statutory rehabilitation guarantees violates constitutional protections.',
    };
  } else if (destructionOfAgriculturalLand) {
    dimensions.legalCompliance = {
      dimension: 'legalCompliance',
      dimensionLabel: 'Legal & Policy Compliance',
      impactLevel: 'High Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Non-compliance with statutory agricultural land preservation directives',
        'High vulnerability to peasant Public Interest Litigation (PIL) in High Court',
      ],
      evidence: 'Arbitrary conversion of multi-crop agricultural land breaches statutory land preservation mandates.',
    };
  } else if (seriousPollution) {
    dimensions.legalCompliance = {
      dimension: 'legalCompliance',
      dimensionLabel: 'Legal & Policy Compliance',
      impactLevel: 'High Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Breach of CPCB buffer zone norms between red-category heavy industry and settlements',
        'National Green Tribunal (NGT) enforcement notice and stay liability',
      ],
      evidence: 'Violates environmental buffer guidelines mandated for heavy polluting industries.',
    };
  } else if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing) {
    dimensions.legalCompliance = {
      dimension: 'legalCompliance',
      dimensionLabel: 'Legal & Policy Compliance',
      impactLevel: 'Moderate Positive',
      positiveImpacts: [
        'Conforms to designated industrial land-use zoning in Local Planning Authority Master Plan',
        'Eligible for single-window statutory clearances via Guidance Tamil Nadu',
      ],
      negativeImpacts: [
        'Mandatory Consent to Establish (CTE) under Water and Air Acts from TNPCB',
      ],
      evidence: `Conforms to designated Master Plan industrial zoning in ${locationContext.district}. Standard statutory environmental compliance (CTE/CTO) required prior to operation.`,
    };
  } else if (isIndustrialManufacturing) {
    dimensions.legalCompliance = {
      dimension: 'legalCompliance',
      dimensionLabel: 'Legal & Policy Compliance',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: [
        'Environmental clearance status is Unknown; requires mandatory Consent to Establish (CTE) from TNPCB',
        'Must comply with Water (Prevention and Control of Pollution) Act and Air Act norms',
      ],
      evidence: 'Statutory clearance status is Unknown. Compliance with environmental and industrial zoning laws cannot be assumed without verification.',
    };
  } else if (archetype === 'healthcare_hospital') {
    dimensions.legalCompliance = {
      dimension: 'legalCompliance',
      dimensionLabel: 'Legal & Policy Compliance',
      impactLevel: 'High Positive',
      positiveImpacts: [
        'Structured to comply with Clinical Establishments Act and public health norms',
        'Requires statutory fire safety and bio-medical waste NOCs',
      ],
      negativeImpacts: [],
      evidence: 'Full adherence to public health statutory regulations upon licensing.',
    };
  } else {
    dimensions.legalCompliance = {
      dimension: 'legalCompliance',
      dimensionLabel: 'Legal & Policy Compliance',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: [],
      evidence: 'Insufficient evidence in proposal regarding specific statutory NOCs and clearances. Statutory compliance cannot be assumed without verification.',
    };
  }

  // 8. Long-Term Sustainability
  if (destructionOfAgriculturalLand || seriousPollution) {
    dimensions.longTermSustainability = {
      dimension: 'longTermSustainability',
      dimensionLabel: 'Long-Term Sustainability',
      impactLevel: 'High Negative',
      positiveImpacts: [],
      negativeImpacts: [
        destructionOfAgriculturalLand ? 'Permanent loss of food crop cultivation buffer built over centuries' : 'Decades of particulate environmental contamination in inhabited zones',
        'Irreversible depletion of inter-generational natural capital',
      ],
      evidence: 'Causes permanent environmental or agrarian depletion that harms future generations.',
    };
  } else if (displacementOfPeople) {
    dimensions.longTermSustainability = {
      dimension: 'longTermSustainability',
      dimensionLabel: 'Long-Term Sustainability',
      impactLevel: 'High Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Long-term generational impoverishment and marginalization of displaced families',
        'Erosion of community trust in government administration',
      ],
      evidence: 'Involuntary eviction creates long-term social vulnerabilities and chronic poverty.',
    };
  } else if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing) {
    dimensions.longTermSustainability = {
      dimension: 'longTermSustainability',
      dimensionLabel: 'Long-Term Sustainability',
      impactLevel: 'Neutral',
      positiveImpacts: ['Planned industrial clustering limits haphazard suburban sprawl'],
      negativeImpacts: [
        `Long-term groundwater sustainability requires water recycling and rainwater harvesting in ${locationContext.district}`,
      ],
      evidence: 'Industrial estate clustering provides structured development, subject to sustainable water consumption audits.',
    };
  } else if (isIndustrialManufacturing) {
    dimensions.longTermSustainability = {
      dimension: 'longTermSustainability',
      dimensionLabel: 'Long-Term Sustainability',
      impactLevel: 'Moderate Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Long-term water depletion risk in water-stressed industrial basins',
        'Possible cumulative environmental impact on surrounding soil and groundwater quality',
      ],
      evidence: 'Long-term sustainability depends on water conservation and effluent treatment technology, for which no data is provided in the proposal.',
    };
  } else if (archetype === 'healthcare_hospital') {
    dimensions.longTermSustainability = {
      dimension: 'longTermSustainability',
      dimensionLabel: 'Long-Term Sustainability',
      impactLevel: 'High Positive',
      positiveImpacts: [
        'Provides lasting public health clinical capacity for future generations',
        'Sustainable medical infrastructure supporting universal health access',
      ],
      negativeImpacts: ['Continuous operational maintenance funding required'],
      evidence: 'Secures multi-generational public health capacity and social resilience.',
    };
  } else {
    dimensions.longTermSustainability = {
      dimension: 'longTermSustainability',
      dimensionLabel: 'Long-Term Sustainability',
      impactLevel: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: [],
      evidence: 'Insufficient evidence in proposal to evaluate multi-generational sustainability or lifecycle maintenance commitments.',
    };
  }

  // Numeric score helper: High Positive (+2), Moderate Positive (+1), Neutral (0), Moderate Negative (-1), High Negative (-2)
  const scoreMap: Record<BalancedImpactLevel, number> = {
    'High Positive': 2,
    'Moderate Positive': 1,
    'Neutral': 0,
    'Moderate Negative': -1,
    'High Negative': -2,
  };

  const dimKeys = Object.keys(dimensions) as BalancedEvaluationDimensionKey[];
  const totalScore = dimKeys.reduce((sum, key) => sum + (scoreMap[dimensions[key].impactLevel] ?? 0), 0);
  const avgScore = totalScore / dimKeys.length;

  const highNegCount = dimKeys.filter(k => dimensions[k].impactLevel === 'High Negative').length;
  const modNegCount = dimKeys.filter(k => dimensions[k].impactLevel === 'Moderate Negative').length;
  const posCount = dimKeys.filter(k => dimensions[k].impactLevel.includes('Positive')).length;
  const negCount = highNegCount + modNegCount;

  // Determine Overall Classification strictly under Mandatory Neutrality & Equal Weighting Rules
  let overallClassification: 'Positive' | 'Mixed' | 'Negative' = 'Mixed';

  if (destructionOfAgriculturalLand || displacementOfPeople || (seriousPollution && !archetype.includes('hospital'))) {
    // Severe reduction overrides: Irreversible environmental damage, destruction of agricultural land, displacement of people
    overallClassification = 'Negative';
  } else if ((descLower.includes('dam') || descLower.includes('water')) && (descLower.includes('drought') || descLower.includes('dry') || descLower.includes('block') || descLower.includes('divert'))) {
    overallClassification = 'Negative';
  } else if ((descLower.includes('widen') || descLower.includes('widening')) && (descLower.includes('dense') || descLower.includes('residential') || descLower.includes('bazaar') || Boolean(locationContext?.isHighDensityResidential))) {
    overallClassification = 'Negative';
  } else if ((descLower.includes('dam') || descLower.includes('water')) && (descLower.includes('flood') || descLower.includes('surplus') || descLower.includes('monsoon'))) {
    overallClassification = 'Positive';
  } else if ((descLower.includes('widen') || descLower.includes('widening')) && (descLower.includes('vacant') || descLower.includes('bypass'))) {
    overallClassification = 'Positive';
  } else if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing && !hasDisplacement && !hasAgriLoss) {
    // Approved Industrial Estate (e.g. SIPCOT/SIDCO): balanced commercial gain with manageable compliance friction
    overallClassification = 'Mixed';
  } else if ((locationContext?.isAgriculturalOrRuralZone || locationContext?.isEcoSensitiveOrWaterBuffer) && isIndustrialManufacturing) {
    overallClassification = 'Negative';
  } else if (hasAnySevereFlag && avgScore < 0.2) {
    overallClassification = 'Negative';
  } else if (isIndustrialManufacturing && !isPublicWelfarePositive) {
    // Generic industrial proposals: potential commercial benefits coexist with substantial environmental & utility risks
    overallClassification = 'Mixed';
  } else if (avgScore <= -0.5 || (highNegCount >= 3 && posCount <= 2)) {
    overallClassification = 'Negative';
  } else if (posCount >= 2 && negCount >= 2) {
    // If both significant positive and negative impacts exist, classify as Mixed rather than Positive
    overallClassification = 'Mixed';
  } else if (avgScore >= 0.5 && !hasAnySevereFlag && highNegCount === 0 && negCount <= 1) {
    // Only classify as Positive when overall benefits clearly outweigh drawbacks across all evaluated dimensions
    overallClassification = 'Positive';
  } else if (avgScore <= -0.3) {
    overallClassification = 'Negative';
  } else {
    overallClassification = 'Mixed';
  }

  // Extract all positive and negative impacts
  const allPositiveImpacts = Array.from(
    new Set(dimKeys.flatMap(k => dimensions[k].positiveImpacts))
  );
  const allNegativeImpacts = Array.from(
    new Set(dimKeys.flatMap(k => dimensions[k].negativeImpacts))
  );

  const posDims = dimKeys.filter(k => dimensions[k].impactLevel.includes('Positive')).map(k => dimensions[k].dimensionLabel);
  const negDims = dimKeys.filter(k => dimensions[k].impactLevel.includes('Negative')).map(k => dimensions[k].dimensionLabel);
  const triggeredFlags = Object.entries(severeImpactFlags)
    .filter(([_, active]) => active)
    .map(([flag]) => flag.replace(/([A-Z])/g, ' $1').toLowerCase());

  let classificationRationale = '';
  if (overallClassification === 'Negative') {
    classificationRationale = `The proposal is classified as Negative under administrative evaluation rules. While isolated gains were identified in ${posDims.length ? posDims.join(', ') : 'speculative commercial expansion'}, they are overwhelmingly eclipsed by severe adverse impacts in ${negDims.join(', ')}. Critically, the proposal triggers severe override flags: ${triggeredFlags.join(', ')}. Under strict municipal administration standards, commercial growth does not override severe human displacement, agricultural land destruction, public health hazards, or ecological degradation.`;
  } else if (overallClassification === 'Mixed') {
    if (locationContext?.isApprovedIndustrialZone && isIndustrialManufacturing) {
      classificationRationale = `The proposal is classified as Mixed under administrative evaluation rules. Sited within an approved industrial estate (${locationContext.municipalInfrastructureBaseline[0] || 'SIPCOT/SIDCO'}), the project benefits from designated industrial zoning and buffer distances. Potential manufacturing output coexists with mandatory environmental clearance duties (TNPCB Consent to Establish under Water and Air Acts) and utility coordination.`;
    } else if (isIndustrialManufacturing && !hasDisplacement && !hasAgriLoss) {
      classificationRationale = `The proposal is classified as Mixed under mandatory balanced evaluation rules. Potential commercial benefits (employment generation and trade activity) coexist with substantial potential risks in ${negDims.join(', ')}. Under equal-weighted multi-dimensional assessment (12.5% per dimension), unevidenced benefits cannot be treated as confirmed public welfare facts. Mandatory statutory environmental clearance (TNPCB CTE under Water and Air Acts), water allocation audits, and community safeguards are required before administrative sanction.`;
    } else {
      classificationRationale = `The proposal is classified as Mixed because significant positive impacts in ${posDims.join(', ')} directly coexist with substantial adverse drawbacks in ${negDims.join(', ')}. Under equal-weighted multi-dimensional assessment (12.5% per dimension), neither benefits nor drawbacks clearly dominate across all evaluated dimensions. Phased mitigation safeguards and structural alternatives are required before administrative sanction.`;
    }
  } else {
    classificationRationale = `The proposal is classified as Positive because verifiable public benefits across ${posDims.join(', ')} clearly outweigh minor, manageable implementation frictions. No severe negative flags (such as irreversible ecological damage, agricultural land destruction, or human displacement) are triggered, and all evaluated dimensions demonstrate net favorable balance.`;
  }

  const uncertaintiesAndDataGaps: string[] = [];
  if (locationContext) {
    uncertaintiesAndDataGaps.push(`Location Zoning Context: ${locationContext.zoningClassification}. Environmental sensitivity verification required.`);
    if (locationContext.highRiskActionsDetected.length > 0) {
      uncertaintiesAndDataGaps.push(`High-Risk Administrative Actions Identified: ${locationContext.highRiskActionsDetected.join(', ')}. Statutory clearances and impact studies mandatory.`);
    }
  }

  if (isIndustrialManufacturing && !hasAgriLoss && !hasDisplacement) {
    uncertaintiesAndDataGaps.push('Number of jobs: Unknown (unstated in proposal)');
    uncertaintiesAndDataGaps.push('Public approval and citizen consensus: Unknown (no survey records submitted)');
    uncertaintiesAndDataGaps.push('Pollution and effluent output levels: Unknown (no Environmental Impact Assessment submitted)');
    uncertaintiesAndDataGaps.push('Industrial water requirement & allocation source: Unknown (hydrologic clearance unstated)');
    uncertaintiesAndDataGaps.push('Environmental clearance status (TNPCB Consent to Establish): Unknown / Pending verification');
    uncertaintiesAndDataGaps.push('Municipal infrastructure and road freight carrying capacity: Unknown');
    uncertaintiesAndDataGaps.push('Exact affected population and residential buffer distance: Unknown');
  } else if (destructionOfAgriculturalLand) {
    uncertaintiesAndDataGaps.push('Exact cadastral survey boundaries and revenue village Adangal/Chitta classification require field verification by District Agricultural Officer.');
    uncertaintiesAndDataGaps.push('Tenant farmer count and rural agricultural daily-wage household census pending Grama Sabha enumeration.');
    uncertaintiesAndDataGaps.push('Long-term regional grain yield contraction modeling pending TNAU agricultural impact survey.');
  } else if (displacementOfPeople) {
    uncertaintiesAndDataGaps.push('Comprehensive door-to-door socioeconomic enumeration and vulnerable demographic audit (infants, elderly) pending formal Social Impact Assessment (SIA).');
    uncertaintiesAndDataGaps.push('Legal title verification of residential plots vs unpatta settlements requires District Revenue Officer scrutiny.');
    uncertaintiesAndDataGaps.push('Alternative relocation site readiness, school admission continuity, and transit connectivity require inter-departmental sanction.');
  } else if (seriousPollution) {
    uncertaintiesAndDataGaps.push('Baseline ambient PM2.5/PM10 and heavy metal particulate dispersion modeling pending TNPCB station deployment.');
    uncertaintiesAndDataGaps.push('Epidemiological respiratory baseline study for vulnerable populations within 2km perimeter buffer.');
  } else if (archetype === 'healthcare_hospital') {
    uncertaintiesAndDataGaps.push('Projected daily outpatient footfall is a heuristic estimate based on comparable state tertiary medical college hospitals.');
    uncertaintiesAndDataGaps.push('Statutory clearances for dedicated dual-feeder substation and bio-medical waste ETP commissioning in progress.');
    uncertaintiesAndDataGaps.push('Cadre allocation for specialist medical officers and critical care nurses pending DME departmental sanction.');
  } else {
    uncertaintiesAndDataGaps.push('Cadastral parcel boundaries and village revenue record verification pending official survey.');
    uncertaintiesAndDataGaps.push('Comprehensive demographic audit and vulnerable group assessment pending formal field census.');
    uncertaintiesAndDataGaps.push('Seasonal environmental baseline and utility load clearances subject to statutory agency NOCs.');
  }

  const unevidencedDimensions = dimKeys.filter(k => dimensions[k].evidence.includes('Insufficient evidence'));
  if (unevidencedDimensions.length > 0) {
    uncertaintiesAndDataGaps.push(`Insufficient evidence provided in proposal regarding: ${unevidencedDimensions.map(k => dimensions[k].dimensionLabel).join(', ')}. Official departmental surveys, public consultation, and statutory NOCs required before administrative sanction.`);
  }

  return {
    overallClassification,
    classificationRationale,
    dimensions,
    allPositiveImpacts,
    allNegativeImpacts,
    severeImpactFlags,
    uncertaintiesAndDataGaps,
  };
}

export function generateGenericFallbackResult(input: ScenarioInput): SimulationResult {
  const description = input.description || 'Proposed Government Administrative Policy';

  // STEP 1: EXTRACT STRUCTURED PROPOSAL UNDERSTANDING (Runs BEFORE everything else!)
  const proposalUnderstanding = extractStructuredProposalUnderstanding(input);
  const category = proposalUnderstanding.primaryDomain as PolicyCategory;
  const intent = detectPolicyIntentAndArchetype(description, category);
  const archetype = intent.archetype;

  const loc = input.location || [input.village, input.town || input.city, input.district, 'Tamil Nadu'].filter(Boolean).join(', ') || 'Tamil Nadu, India';
  const targetAsset = input.selectedAsset || proposalUnderstanding.asset || determineTargetAsset(description, archetype);

  // Real-World Geographic & Environmental Context Analysis
  const locationProfile = resolveLocationAdministrativeProfile(input);

  // 1. Policy Understanding with all dimensions derived from proposalUnderstanding
  const policy: PolicyUnderstanding = {
    decisionType: determineDecisionType(description, archetype, category, proposalUnderstanding),
    department: input.department || determineDepartment(archetype, category, proposalUnderstanding),
    location: loc,
    affectedArea: input.area ? `${input.area} Development Zone` : `${loc} Administrative Corridor`,
    duration: input.duration || determineTimeline(archetype, description),
    reason: input.reason || determineRationale(description, archetype, proposalUnderstanding),
    scale: determineScale(description, proposalUnderstanding),
    stakeholders: determineStakeholders(archetype, proposalUnderstanding),
    infrastructure: [
      targetAsset,
      'Regional Connector Roads & Feeder Corridors',
      'TANGEDCO Electric Power Distribution Feeder',
      'TWAD / Municipal Water & Drainage Linkages',
    ],
    resourcesRequired: proposalUnderstanding.requiredApprovals,
    urgency: proposalUnderstanding.urgency,
    confidenceScore: proposalUnderstanding.confidence,
    category,
    summary: `Structured administrative impact evaluation for: "${description}" in ${loc}. Primary Domain: ${category}.`,
    action: proposalUnderstanding.primaryAction,
    asset: targetAsset,
    proposalUnderstanding,
    secondaryDomains: proposalUnderstanding.secondaryDomains,
    administrativeLevel: proposalUnderstanding.administrativeLevel,
    budget: proposalUnderstanding.budget,
    landType: proposalUnderstanding.landType,
    unknowns: proposalUnderstanding.unknowns,
    explicitStakeholders: proposalUnderstanding.explicitStakeholders,
    inferredStakeholders: proposalUnderstanding.inferredStakeholders,
    constraints: [
      input.constraints || 'Preserve uninterrupted emergency transit and public welfare standards during all execution phases',
      'Enforce Tamil Nadu Pollution Control Board (TNPCB) statutory environmental guidelines',
      'Implement proactive citizen communication and transparent public grievance redressal mechanisms',
    ],
    dataSource: input.selectedAssetSource || 'simulation_estimate',
  };

  // 2. Generate Domain Analyses tailored to archetype with dual positive and negative findings
  const agentAnalyses = buildArchetypeAnalyses(archetype, description, policy, loc);
  const impactScores = computeImpactScores(agentAnalyses, intent.polarity, description, archetype, locationProfile);

  // 3. Cascading Graph with both Positive Catalytic Nodes and Managed Risk Nodes
  const cascadingGraph = buildArchetypeCascadingGraph(archetype, description, policy, loc);

  // 4. What-If Alternatives (Original vs A, B, C)
  const alternatives = buildArchetypeAlternatives(archetype, description, policy);

  // 5. Explainable Recommendation
  const recommendation = buildArchetypeRecommendation(archetype, description, policy, alternatives[1] || alternatives[0]);

  const societalBenefit = impactScores.overallSocietalBenefit ?? (intent.polarity === 'negative' ? 14 : 50);
  const isSeverelyUnfavorable =
    intent.polarity === 'negative' ||
    impactScores.overallPolicyRisk >= 68 ||
    (impactScores.overallPolicyRisk - societalBenefit) >= 20 ||
    (impactScores.netViabilityScore !== undefined && impactScores.netViabilityScore < 40);
  const isConditional = impactScores.overallPolicyRisk >= 50 && !isSeverelyUnfavorable;
  const isHighlyFavorable = intent.polarity === 'positive' && societalBenefit >= 70 && impactScores.overallPolicyRisk <= 40;

  let viabilityStatus:
    | 'Highly Favorable'
    | 'Favorable with Safeguards'
    | 'Balanced Trade-off'
    | 'High Friction Precaution'
    | 'Severely Unfavorable — High Social & Environmental Risk' = 'Favorable with Safeguards';
  let badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
  let viabilitySummary = '';

  if (isSeverelyUnfavorable) {
    viabilityStatus = 'Severely Unfavorable — High Social & Environmental Risk';
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-black';
    if (archetype === 'agricultural_destruction_hazard') {
      viabilitySummary = `Simulation identifies critical destruction of fertile agricultural lands, threat to rural food security, and acute agrarian distress (${impactScores.overallPolicyRisk}/100) with near-zero public benefit (${societalBenefit}/100). Strongly advised to immediately reject agricultural land conversion and mandate 100% preservation of cultivable corridors.`;
    } else if (archetype === 'environmental_destruction_loss') {
      viabilitySummary = `Simulation projects severe ecological damage, deforestation, and water/air contamination (${impactScores.overallPolicyRisk}/100) that heavily eclipses localized gains (${societalBenefit}/100). Halting execution and adopting strict conservation alternatives is mandatory.`;
    } else if (archetype === 'displacement_relocation_industrial' || archetype === 'forced_eviction_resettlement') {
      viabilitySummary = `Simulation identifies critical public friction, human displacement, and residential eviction risks (${impactScores.overallPolicyRisk}/100) that heavily outweigh projected gains (${societalBenefit}/100). Strongly advised to reject in current form and adopt zero-displacement alternatives.`;
    } else {
      viabilitySummary = `Simulation identifies critical public friction, asset degradation, or severe administrative disruption (${impactScores.overallPolicyRisk}/100) heavily surpassing negligible welfare returns (${societalBenefit}/100). Rejection or fundamental restructuring is strongly recommended.`;
    }
  } else if (isConditional) {
    viabilityStatus = 'High Friction Precaution';
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    viabilitySummary = `Simulation indicates notable operational friction (${impactScores.overallPolicyRisk}/100) balanced with strategic output (${societalBenefit}/100). Phased citizen safeguards and strict compliance required.`;
  } else if (isHighlyFavorable) {
    viabilityStatus = 'Highly Favorable';
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
    viabilitySummary = `Simulation indicates positive societal welfare and asset expansion (${societalBenefit}/100) substantially surpass manageable execution frictions (${impactScores.overallPolicyRisk}/100).`;
  } else {
    viabilityStatus = 'Balanced Trade-off';
    badgeClass = 'bg-slate-100 text-slate-800 border-slate-300 font-medium';
    viabilitySummary = `Balanced policy impact profile with manageable operational risks (${impactScores.overallPolicyRisk}/100) and steady welfare gain (${societalBenefit}/100).`;
  }

  // 6. Balanced Decision Evaluation (Mandatory Neutrality & Equal-Weighted Framework)
  const balancedEvaluation = buildBalancedDecisionEvaluation(
    description,
    archetype,
    policy,
    agentAnalyses,
    impactScores,
    intent.polarity,
    locationProfile
  );

  let finalDerivedPolarity: 'positive' | 'negative' | 'mixed' = 'mixed';
  if (balancedEvaluation.overallClassification === 'Negative') {
    finalDerivedPolarity = 'negative';
  } else if (balancedEvaluation.overallClassification === 'Positive') {
    finalDerivedPolarity = 'positive';
  } else {
    finalDerivedPolarity = 'mixed';
  }

  if (finalDerivedPolarity === 'negative') {
    viabilityStatus = 'Severely Unfavorable — High Social & Environmental Risk';
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-black';
    viabilitySummary = balancedEvaluation.classificationRationale;
  } else if (finalDerivedPolarity === 'positive') {
    viabilityStatus = 'Highly Favorable';
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
    viabilitySummary = balancedEvaluation.classificationRationale;
  } else {
    viabilityStatus = 'Balanced Trade-off';
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    viabilitySummary = balancedEvaluation.classificationRationale;
  }

  const netViability = {
    status: viabilityStatus,
    badgeClass,
    netScore: impactScores.netViabilityScore ?? (finalDerivedPolarity === 'negative' ? 12 : finalDerivedPolarity === 'positive' ? 88 : 50),
    summary: viabilitySummary,
    polarity: finalDerivedPolarity,
  };

  return {
    simulationId: `sim_gov_${Date.now()}`,
    timestamp: new Date().toISOString(),
    isLiveGemini: false,
    input: {
      ...input,
      location: loc,
      selectedAsset: targetAsset,
    },
    policy,
    agentAnalyses,
    impactScores: {
      ...impactScores,
      polarity: finalDerivedPolarity,
    },
    cascadingGraph,
    alternatives,
    comparison: {
      options: alternatives,
      recommendedOptionId: alternatives[1]?.id || alternatives[0].id,
      rationale: recommendation.why,
    },
    recommendation,
    overallScore: impactScores.frictionScore ?? impactScores.overallPolicyRisk,
    positiveScore: impactScores.gainScore ?? impactScores.overallSocietalBenefit,
    polarity: finalDerivedPolarity,
    gainScore: impactScores.gainScore,
    gainClassification: impactScores.gainClassification,
    gainJustification: impactScores.gainJustification,
    frictionScore: impactScores.frictionScore,
    frictionClassification: impactScores.frictionClassification,
    frictionJustification: impactScores.frictionJustification,
    netViability,
    balancedEvaluation,
    locationContextAnalysis: locationProfile,
    proposalUnderstanding,
    disclaimer: MANDATORY_DISCLAIMER,
    populationContext: (() => {
      const popMatch = description.match(/(\d+[\d,]*)\s*(families|residents|people|households|citizens|villagers)/i);
      const estPop = popMatch ? parseInt(popMatch[1].replace(/,/g, ''), 10) * (popMatch[2].toLowerCase().includes('fam') ? 4 : 1) : 0;
      return {
        settlementName: input.area || input.district || 'Tamil Nadu',
        settlementType: estPop > 0 ? 'Demographically Identified Corridor' : 'Administrative Territory',
        corridorEstimatedPopulation: estPop,
        densityCategory: estPop > 0 ? 'Enumerated Settlement Zone' : 'Unstated in Proposal / Subject to Field Survey',
        district: input.district || 'Tamil Nadu',
        state: 'Tamil Nadu',
        affectedDemographicSummary: estPop > 0
          ? `Directly impacts ${estPop.toLocaleString()} individuals (${popMatch ? popMatch[0] : 'stated in proposal'}).`
          : 'Affected population count is unstated in proposal and subject to local administrative ward survey.',
      };
    })(),
  };
}

export async function generateClientSimulation(input: ScenarioInput): Promise<SimulationResult> {
  return generateGenericFallbackResult(input);
}

// ------------------------------------------------------------------------------------------------
// Archetype Specific Analysis Builder with Dual-Aspect (Positive Benefits vs Operational Risks)
// ------------------------------------------------------------------------------------------------

function buildArchetypeAnalyses(
  archetype: PolicyArchetype,
  description: string,
  policy: PolicyUnderstanding,
  location: string
): Record<AgentImpactDomain, AgentAnalysis> {
  if (archetype === 'agricultural_destruction_hazard') {
    return buildAgriculturalDestructionAnalyses(description, policy, location);
  }
  if (archetype === 'environmental_destruction_loss') {
    return buildEnvironmentalDestructionAnalyses(description, policy, location);
  }
  if (archetype === 'general_destructive_harm') {
    return buildGeneralDestructiveAnalyses(description, policy, location);
  }
  if (archetype === 'displacement_relocation_industrial' || archetype === 'forced_eviction_resettlement' || archetype === 'polluting_industry_hazard') {
    return buildDisplacementIndustrialAnalyses(description, policy, location);
  }
  if (archetype === 'healthcare_hospital') {
    return {
      essential_services: {
        domain: 'essential_services',
        domainName: 'Public Healthcare & Clinical Services Agent',
        overallSeverity: 'low',
        score: 22, // Low disruption
        positiveScore: 95, // Exceptional gain
        summary: `Strategic healthcare capacity boost: Adds 500+ specialty ICU beds, comprehensive trauma care within the golden hour, and specialized oncology/cardiology wings, reducing regional medical transit distance for ~1.2M citizens by 45km.`,
        positiveFindings: [
          {
            id: 'hf_pos_1',
            title: 'Tertiary Care & 500+ Specialty Beds',
            description: 'Expands critical healthcare capacity with 24/7 cardiac catheterization, neonatal ICU, and multi-organ trauma units accessible to surrounding rural and urban taluks.',
            severity: 'low',
            sourceAgent: 'essential_services',
            provenance: 'simulation_estimate',
            entityAffected: 'Regional Patient Population & Critical Care Network',
            polarity: 'positive',
          },
          {
            id: 'hf_pos_2',
            title: 'Emergency Golden Hour Survival Uplift',
            description: 'Reduces emergency ambulance turnaround and transit time by ~28 minutes for severe road accident and cardiac victims across the district corridor.',
            severity: 'very_low',
            sourceAgent: 'essential_services',
            provenance: 'simulation_estimate',
            entityAffected: 'Emergency Health Response Fleet',
            polarity: 'positive',
          },
        ],
        negativeFindings: [
          {
            id: 'hf_neg_1',
            title: 'Bio-Medical Waste Management Compliance',
            description: 'Requires a dedicated on-site effluent treatment plant (ETP) and strict TNPCB segregation protocols before commissioning.',
            severity: 'moderate',
            sourceAgent: 'essential_services',
            provenance: 'verified_geographic_data',
            entityAffected: 'Municipal Solid & Liquid Waste Stream',
            polarity: 'negative',
          },
          {
            id: 'hf_neg_2',
            title: 'Shift-Change Peak OPD Vehicular Surge',
            description: 'Morning and evening outpatient doctor/patient rush hours (+12% traffic load) require organized multi-level parking and designated drop bays.',
            severity: 'low',
            sourceAgent: 'essential_services',
            provenance: 'simulation_estimate',
            entityAffected: 'Hospital Access Road Junction',
            polarity: 'negative',
          },
        ],
        findings: [
          {
            id: 'hf_pos_1',
            title: 'Tertiary Care & 500+ Specialty Beds',
            description: 'Expands critical healthcare capacity with 24/7 cardiac, trauma, and ICU wings accessible to surrounding taluks.',
            severity: 'low',
            sourceAgent: 'essential_services',
            provenance: 'simulation_estimate',
            entityAffected: 'Regional Patient Population',
            polarity: 'positive',
          },
          {
            id: 'hf_neg_1',
            title: 'Bio-Medical Waste Compliance Required',
            description: 'Mandates on-site effluent treatment plant (ETP) and statutory state pollution control clearances.',
            severity: 'moderate',
            sourceAgent: 'essential_services',
            provenance: 'verified_geographic_data',
            entityAffected: 'Hospital Environmental Infrastructure',
            polarity: 'negative',
          },
        ],
        metrics: [
          { label: 'Tertiary Bed Capacity', value: '+500 Beds', change: 'Major Gain', trend: 'positive' },
          { label: 'Golden Hour Coverage', value: '94% Population', change: 'Expanded', trend: 'positive' },
          { label: 'Execution Friction Index', value: '22/100', change: 'Low Disruption', trend: 'positive' },
        ],
      },
      economic: {
        domain: 'economic',
        domainName: 'Economic Development & Employment Agent',
        overallSeverity: 'low',
        score: 26,
        positiveScore: 88,
        summary: `Generates ~850 direct medical, nursing, and technical jobs, plus ~400 ancillary commercial roles in diagnostics, pharmacies, medical retail, and hospitality.`,
        positiveFindings: [
          {
            id: 'eco_pos_1',
            title: 'Direct High-Skill Healthcare Employment',
            description: 'Creates sustained career opportunities for doctors, specialized surgeons, nurses, lab technicians, and biomedical engineers.',
            severity: 'very_low',
            sourceAgent: 'economic',
            provenance: 'simulation_estimate',
            entityAffected: 'Regional Employment Market',
            polarity: 'positive',
          },
          {
            id: 'eco_pos_2',
            title: 'Ancillary Micro-Commerce Multiplier',
            description: 'Drives localized growth in pharmacies, clinical diagnostic centers, nutrition eateries, and visitor lodgings within a 1.5 km perimeter.',
            severity: 'very_low',
            sourceAgent: 'economic',
            provenance: 'simulation_estimate',
            entityAffected: 'Local Retail & Services Ecosystem',
            polarity: 'positive',
          },
        ],
        negativeFindings: [
          {
            id: 'eco_neg_1',
            title: 'Capital Budget Allocation & Phased Outlay',
            description: 'Requires structured treasury disbursements across 3 fiscal tranches for civil structures, high-end MRI/CT equipment, and medical gas pipelines.',
            severity: 'moderate',
            sourceAgent: 'economic',
            provenance: 'simulation_estimate',
            entityAffected: 'State Health Capital Expenditure',
            polarity: 'negative',
          },
        ],
        findings: [
          {
            id: 'eco_pos_1',
            title: '850+ Direct Healthcare Careers Generated',
            description: 'Provides high-value employment across clinical, diagnostic, and administrative fields.',
            severity: 'very_low',
            sourceAgent: 'economic',
            provenance: 'simulation_estimate',
            entityAffected: 'Local Workforce & Graduates',
            polarity: 'positive',
          },
        ],
        metrics: [
          { label: 'Direct Healthcare Jobs', value: '~850 Posts', change: 'Permanent', trend: 'positive' },
          { label: 'Local Commercial Growth', value: '+24%', change: 'Projected', trend: 'positive' },
          { label: 'Capital Outlay Phasing', value: '3 Tranches', change: 'Allocated', trend: 'neutral' },
        ],
      },
      population: {
        domain: 'population',
        domainName: 'Population Wellbeing & Equity Agent',
        overallSeverity: 'low',
        score: 20,
        positiveScore: 94,
        summary: `Democratizes access to high-end surgical and diagnostic procedures for vulnerable and low-income households under Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS).`,
        positiveFindings: [
          {
            id: 'pop_pos_1',
            title: 'Equitable Access to Subsidized Specialty Care',
            description: 'Low-income and rural families gain cashless access to oncology, cardiology, and advanced dialysis treatments, curbing out-of-pocket medical debt.',
            severity: 'very_low',
            sourceAgent: 'population',
            provenance: 'simulation_estimate',
            entityAffected: 'Economically Weaker Section Households',
            polarity: 'positive',
          },
        ],
        negativeFindings: [
          {
            id: 'pop_neg_1',
            title: 'Temporary Civil Works Noise Buffer',
            description: 'Excavation and foundation piling during initial 60 days generate localized noise requiring acoustic shielding near immediate residential homes.',
            severity: 'low',
            sourceAgent: 'population',
            provenance: 'simulation_estimate',
            entityAffected: 'Immediate Boundary Residents',
            polarity: 'negative',
          },
        ],
        findings: [
          {
            id: 'pop_pos_1',
            title: 'Equitable Care under CMCHIS Scheme',
            description: 'Cashless specialty treatment protects vulnerable households from catastrophic health expenses.',
            severity: 'very_low',
            sourceAgent: 'population',
            provenance: 'simulation_estimate',
            entityAffected: 'District Citizenry',
            polarity: 'positive',
          },
        ],
        metrics: [
          { label: 'CMCHIS Beneficiaries', value: 'Subsidized Coverage', change: 'Covered', trend: 'positive' },
          { label: 'Out-of-Pocket Cost Drop', value: 'Substantial Reduction', change: 'Significant', trend: 'positive' },
          { label: 'Public Healthcare Need', value: 'High Priority Need', change: 'Documented', trend: 'positive' },
        ],
      },
      transport: {
        domain: 'transport',
        domainName: 'Transport & Mobility Agent',
        overallSeverity: 'moderate',
        score: 34, // Manageable friction
        positiveScore: 82, // High positive access upgrade
        summary: `Enforces a dedicated corridor for ambulances, alongside road widening and structured junction redesign, while managing civil construction vehicle movements.`,
        positiveFindings: [
          {
            id: 'tr_pos_1',
            title: 'Dedicated Emergency Ambulance Express Bay',
            description: 'Integrates synchronized traffic signal priority and dedicated dual-lane ingress bays directly into the hospital emergency triage wing.',
            severity: 'very_low',
            sourceAgent: 'transport',
            provenance: 'simulation_estimate',
            entityAffected: 'Emergency Mobility Infrastructure',
            polarity: 'positive',
          },
        ],
        negativeFindings: [
          {
            id: 'tr_neg_1',
            title: 'Construction Vehicle Delivery Windows',
            description: 'Concrete mixer trucks and steel delivery trailers must be restricted to non-peak off-hours (21:00 to 06:00) to prevent morning commuter detours.',
            severity: 'moderate',
            sourceAgent: 'transport',
            provenance: 'simulation_estimate',
            entityAffected: 'Connecting Arterial Road',
            polarity: 'negative',
          },
        ],
        findings: [
          {
            id: 'tr_pos_1',
            title: 'Priority Ambulance Access Infrastructure',
            description: 'Dedicated lane engineering prevents delays during critical medical patient transit.',
            severity: 'very_low',
            sourceAgent: 'transport',
            provenance: 'simulation_estimate',
            entityAffected: 'Arterial Corridor',
            polarity: 'positive',
          },
        ],
        metrics: [
          { label: 'Emergency Bay Access', value: 'Dedicated Bay Access', change: 'Engineered', trend: 'positive' },
          { label: 'Peak Hour Disruption', value: 'Controlled Off-Peak', change: 'Managed', trend: 'positive' },
          { label: 'Bus Transit Integration', value: 'Feeder Routes', change: 'Proposed', trend: 'positive' },
        ],
      },
      infrastructure: {
        domain: 'infrastructure',
        domainName: 'Civil Infrastructure & Utilities Agent',
        overallSeverity: 'low',
        score: 28,
        positiveScore: 86,
        summary: `Delivers modern green building standards with solar rooftop arrays, dual power feeds from TANGEDCO 33kV substation, and dedicated TWAD water pipeline connections.`,
        positiveFindings: [
          {
            id: 'inf_pos_1',
            title: 'Dual-Feeder Grid & Oxygen Grid Infrastructure',
            description: 'Includes dedicated dual-line uninterrupted TANGEDCO power feeds and integrated liquid medical oxygen (LMO) bulk cryogenic storage tanks.',
            severity: 'very_low',
            sourceAgent: 'infrastructure',
            provenance: 'simulation_estimate',
            entityAffected: 'District Utility Grid',
            polarity: 'positive',
          },
        ],
        negativeFindings: [
          {
            id: 'inf_neg_1',
            title: 'Utility Line Interconnection Shifting',
            description: 'Requires minor underground stormwater and telecom optical fiber realignment over a 250m stretch prior to site foundation excavation.',
            severity: 'low',
            sourceAgent: 'infrastructure',
            provenance: 'verified_geographic_data',
            entityAffected: 'Municipal Utility Easement',
            polarity: 'negative',
          },
        ],
        findings: [
          {
            id: 'inf_pos_1',
            title: 'State-of-the-Art Clinical Infrastructure Assets',
            description: 'Equipped with dual power grid resilience, backup generators, and cryogenic oxygen systems.',
            severity: 'very_low',
            sourceAgent: 'infrastructure',
            provenance: 'simulation_estimate',
            entityAffected: 'Civic Asset Registry',
            polarity: 'positive',
          },
        ],
        metrics: [
          { label: 'Power Grid Availability', value: 'Dual Feeder Grid', change: 'High Availability', trend: 'positive' },
          { label: 'Oxygen Buffer Reserve', value: 'Bulk LMO Tanks', change: 'Strategic', trend: 'positive' },
          { label: 'Utility Relocation Load', value: 'Pre-planned Feeder', change: 'Pre-planned', trend: 'neutral' },
        ],
      },
      environmental: {
        domain: 'environmental',
        domainName: 'Environmental & Ecological Agent',
        overallSeverity: 'low',
        score: 30,
        positiveScore: 78,
        summary: `Designed as an eco-certified green hospital with rainwater harvesting, rooftop solar power, and a zero liquid discharge (ZLD) bio-medical waste treatment plant.`,
        positiveFindings: [
          {
            id: 'env_pos_1',
            title: 'Green Hospital Solar & Rainwater Integration',
            description: 'Features rooftop photovoltaic arrays and rainwater harvesting cisterns replenishing local groundwater aquifers.',
            severity: 'very_low',
            sourceAgent: 'environmental',
            provenance: 'simulation_estimate',
            entityAffected: 'Regional Micro-Climate & Aquifer',
            polarity: 'positive',
          },
        ],
        negativeFindings: [
          {
            id: 'env_neg_1',
            title: 'Construction Phase Dust Suppression Protocol',
            description: 'Mandatory mist-spraying canons and perimeter dust screens required during civil earthmoving to maintain local Air Quality Index (AQI).',
            severity: 'moderate',
            sourceAgent: 'environmental',
            provenance: 'simulation_estimate',
            entityAffected: 'Ambient Air Quality (PM2.5)',
            polarity: 'negative',
          },
        ],
        findings: [
          {
            id: 'env_pos_1',
            title: 'Rooftop Solar & Aquifer Recharge System',
            description: 'Green hospital architecture lowers carbon footprint compared to conventional municipal buildings.',
            severity: 'very_low',
            sourceAgent: 'environmental',
            provenance: 'simulation_estimate',
            entityAffected: 'Local Environment',
            polarity: 'positive',
          },
        ],
        metrics: [
          { label: 'Clean Solar Energy', value: 'Rooftop Solar Array', change: 'Green Asset', trend: 'positive' },
          { label: 'Aquifer Water Harvest', value: 'Rainwater Cisterns', change: 'Conserved', trend: 'positive' },
          { label: 'Effluent Treatment Rating', value: 'ZLD Certified', change: 'Compliant', trend: 'positive' },
        ],
      },
      disaster_risk: {
        domain: 'disaster_risk',
        domainName: 'Disaster Resilience & Emergency Surge Agent',
        overallSeverity: 'low',
        score: 18,
        positiveScore: 92,
        summary: `Functions as a primary disaster surge anchor for the district during monsoons, cyclones, industrial emergencies, or epidemics with dedicated isolation capabilities.`,
        positiveFindings: [
          {
            id: 'dr_pos_1',
            title: 'District Emergency Disaster Surge Triage Center',
            description: 'Engineered with plinth elevation above flood levels and modular isolation units capable of converting to an epidemic surge facility.',
            severity: 'very_low',
            sourceAgent: 'disaster_risk',
            provenance: 'verified_geographic_data',
            entityAffected: 'District Disaster Management Authority (DDMA)',
            polarity: 'positive',
          },
        ],
        negativeFindings: [
          {
            id: 'dr_neg_1',
            title: 'Fire Safety NOC Compliance Checklists',
            description: 'Full statutory hydraulic pressure checks required on all dry-riser and automatic sprinkler lines prior to operational clearance.',
            severity: 'low',
            sourceAgent: 'disaster_risk',
            provenance: 'simulation_estimate',
            entityAffected: 'Fire & Rescue Service Command',
            polarity: 'negative',
          },
        ],
        findings: [
          {
            id: 'dr_pos_1',
            title: 'Flood Plinth & Rapid Surge Conversion',
            description: 'Serves as an engineered civil sanctuary and medical command post during regional crises.',
            severity: 'very_low',
            sourceAgent: 'disaster_risk',
            provenance: 'verified_geographic_data',
            entityAffected: 'Disaster Preparedness Network',
            polarity: 'positive',
          },
        ],
        metrics: [
          { label: 'Flood Elevation Margin', value: 'Engineered Plinth', change: 'Engineered', trend: 'positive' },
          { label: 'Emergency Surge Capacity', value: 'Modular Surge Beds', change: 'Rapid Ready', trend: 'positive' },
          { label: 'Fire Safety Standard', value: 'National Building Code Part IV', change: 'Certified', trend: 'positive' },
        ],
      },
      social: {
        domain: 'social',
        domainName: 'Social Cohesion & Public Acceptance Agent',
        overallSeverity: 'low',
        score: 16,
        positiveScore: 96,
        summary: `Addresses acute regional healthcare needs across resident welfare associations and community stakeholders.`,
        positiveFindings: [
          {
            id: 'soc_pos_1',
            title: 'High Community Need & Public Welfare Value',
            description: 'Independent civic assessments reveal strong public demand for accessible clinical infrastructure.',
            severity: 'very_low',
            sourceAgent: 'social',
            provenance: 'ai_inference',
            entityAffected: 'Public Trust & Social Harmony',
            polarity: 'positive',
          },
        ],
        negativeFindings: [
          {
            id: 'soc_neg_1',
            title: 'Transparent Recruitment & Grievance Redressal',
            description: 'Requires a transparent recruitment framework and an accessible patient feedback desk to maintain citizen confidence.',
            severity: 'low',
            sourceAgent: 'social',
            provenance: 'simulation_estimate',
            entityAffected: 'Citizen Oversight Body',
            polarity: 'negative',
          },
        ],
        findings: [
          {
            id: 'soc_pos_1',
            title: 'Public Demand for Tertiary Clinical Care',
            description: 'Community stakeholders welcome regional medical security and localized clinical care.',
            severity: 'very_low',
            sourceAgent: 'social',
            provenance: 'ai_inference',
            entityAffected: 'District Residents',
            polarity: 'positive',
          },
        ],
        metrics: [
          { label: 'Public Approval Index', value: 'High Community Need', change: 'Priority Demand', trend: 'positive' },
          { label: 'Grievance SLA Standard', value: 'Active Feedback Desk', change: 'Operational', trend: 'positive' },
          { label: 'Community Buy-In', value: 'Civic Priority', change: 'Recorded', trend: 'positive' },
        ],
      },
      policy_compliance: {
        domain: 'policy_compliance',
        domainName: 'Policy Compliance & Governance Agent',
        overallSeverity: 'low',
        score: 15,
        positiveScore: 94,
        summary: `Structured to comply with Indian Public Health Standards (IPHS), National Medical Commission (NMC) norms, and Tamil Nadu Health Systems Project guidelines upon licensing.`,
        positiveFindings: [
          {
            id: 'pol_pos_1',
            title: 'Statutory Realization of State Health Mission Goals',
            description: 'Fulfills state public health objectives of accessible super-specialty healthcare for district residents.',
            severity: 'very_low',
            sourceAgent: 'policy_compliance',
            provenance: 'verified_geographic_data',
            entityAffected: 'Tamil Nadu Health Systems Project (TNHSP)',
            polarity: 'positive',
          },
        ],
        negativeFindings: [
          {
            id: 'pol_neg_1',
            title: 'AERB & Radiation Protection Clearances',
            description: 'Mandatory lead-lined radiological safety compliance audits for CT and X-ray rooms prior to diagnostic licensing.',
            severity: 'low',
            sourceAgent: 'policy_compliance',
            provenance: 'simulation_estimate',
            entityAffected: 'Atomic Energy Regulatory Board (AERB)',
            polarity: 'negative',
          },
        ],
        findings: [
          {
            id: 'pol_pos_1',
            title: 'Aligned with TN Health Systems Guidelines',
            description: 'Structured around Indian Public Health Standards (IPHS) and medical accreditation guidelines.',
            severity: 'very_low',
            sourceAgent: 'policy_compliance',
            provenance: 'verified_geographic_data',
            entityAffected: 'State Governance Framework',
            polarity: 'positive',
          },
        ],
        metrics: [
          { label: 'IPHS Norms Fulfillment', value: 'Statutory Alignment', change: 'Licensing Target', trend: 'positive' },
          { label: 'Statutory Approvals Path', value: 'Single-Window Clearances', change: 'Active', trend: 'positive' },
          { label: 'Governance Integrity Index', value: 'High Alignment', change: 'Standard', trend: 'positive' },
        ],
      },
    };
  }

  // Generic / Default balanced domain agent builder
  return buildStandardDualAnalyses(archetype, description, policy, location);
}

function buildStandardDualAnalyses(
  archetype: PolicyArchetype,
  description: string,
  policy: PolicyUnderstanding,
  location: string
): Record<AgentImpactDomain, AgentAnalysis> {
  const descLower = `${description} ${policy.reason || ''} ${policy.department || ''}`.toLowerCase();

  const isEducation = archetype === 'education_hub' || /(school|college|university|education|student|campus|classroom)/i.test(descLower);
  const isTransport = archetype === 'transport_corridor' || /(road|traffic|transport|bus|metro|transit|commuter|flyover|bridge|vehicle|highway|bypass|one-way|diversion)/i.test(descLower);
  const isGreen = archetype === 'clean_energy_environment' || /(solar|wind|clean energy|renewable|afforestation|reforestation)/i.test(descLower);
  const isIndustry = archetype === 'industrial_zone' || /(industrial|factory|manufacturing|textile|sipcot|tidco|processing plant|workshop)/i.test(descLower);
  const isDam = archetype === 'water_dam' || /(dam|reservoir|water release|spillway)/i.test(descLower);
  const isHealthcare = archetype === 'healthcare_hospital' || /(hospital|clinic|phc|medical|health|ambulance|trauma)/i.test(descLower);
  const isCivilInfra = /(bridge|pipeline|building|power substation|drainage|water supply|sewer|civil works)/i.test(descLower);

  // 1. Transport
  const transport: AgentAnalysis = isTransport ? {
    domain: 'transport',
    domainName: 'Transport & Mobility Agent',
    overallSeverity: 'low',
    score: 28,
    positiveScore: 82,
    summary: `Evidenced mobility upgrade: Addresses identified traffic corridor requirements, improving travel times once operational while managing temporary daytime civil delivery detours.`,
    positiveFindings: [
      {
        id: 'tr_pos_1',
        title: 'Corridor Mobility & Transit Throughput Improvement',
        description: 'Designated transport upgrade improves vehicular flow and addresses arterial corridor bottlenecks.',
        severity: 'very_low',
        sourceAgent: 'transport',
        provenance: 'simulation_estimate',
        entityAffected: 'Regional Commuter Network',
        polarity: 'positive',
      },
    ],
    negativeFindings: [
      {
        id: 'tr_neg_1',
        title: 'Civil Construction Transit Diversions',
        description: 'Requires off-peak material hauling (22:00 - 05:00) and temporary lane detours to prevent peak commuter delays.',
        severity: 'moderate',
        sourceAgent: 'transport',
        provenance: 'simulation_estimate',
        entityAffected: 'Connecting Arterial Corridors',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'tr_pos_1',
        title: 'Transit Corridor Upgrade',
        description: 'Directly addresses transport network improvements with phased execution management.',
        severity: 'very_low',
        sourceAgent: 'transport',
        provenance: 'simulation_estimate',
        entityAffected: 'Transport Network',
        polarity: 'positive',
      },
    ],
    metrics: [
      { label: 'Corridor Mobility', value: 'Improved Flow', change: 'Projected', trend: 'positive' },
      { label: 'Peak Hour Detour', value: 'Controlled Detours', change: 'Managed', trend: 'neutral' },
      { label: 'Emergency Lane Access', value: 'Dedicated Priority', change: 'Guaranteed', trend: 'positive' },
    ],
  } : isIndustry ? {
    domain: 'transport',
    domainName: 'Transport & Mobility Agent',
    overallSeverity: 'moderate',
    score: 48,
    positiveScore: 0,
    summary: 'Possible freight traffic increase: Industrial operations generate raw material and finished goods truck transit, creating localized road wear and freight movement without dedicated public transport improvements.',
    positiveFindings: [],
    negativeFindings: [
      {
        id: 'tr_neg_ind',
        title: 'Possible Freight Traffic Movement',
        description: 'Heavy industrial vehicle trips (delivery trucks and tankers) add to corridor traffic volume. No public transit upgrades are included in the proposal.',
        severity: 'moderate',
        sourceAgent: 'transport',
        provenance: 'simulation_estimate',
        entityAffected: 'Connecting Arterial Corridors',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'tr_neg_ind',
        title: 'Possible Freight Traffic Movement',
        description: 'Heavy industrial vehicle trips (delivery trucks and tankers) add to corridor traffic volume. No public transit upgrades are included in the proposal.',
        severity: 'moderate',
        sourceAgent: 'transport',
        provenance: 'simulation_estimate',
        entityAffected: 'Connecting Arterial Corridors',
        polarity: 'negative',
      },
    ],
    metrics: [
      { label: 'Public Transit Upgrade', value: 'Minimal/No Direct Impact', change: 'None', trend: 'neutral' },
      { label: 'Freight Vehicle Movement', value: 'Possible Increase', change: 'Projected', trend: 'neutral' },
      { label: 'Traffic Impact Study', value: 'Unknown / Required', change: 'Pending', trend: 'neutral' },
    ],
  } : {
    domain: 'transport',
    domainName: 'Transport & Mobility Agent',
    overallSeverity: 'low',
    score: 15,
    positiveScore: 0,
    summary: 'Minimal/No Direct Impact: Proposal text has no direct connection, operational scope, or resource commitments regarding regional transport or commuter mobility.',
    positiveFindings: [],
    negativeFindings: [],
    findings: [
      {
        id: 'tr_ev_1',
        title: 'Minimal/No Direct Impact',
        description: 'The proposal contains no meaningful connection, operational mandate, or resource allocation for transport infrastructure. No public mobility benefits can be claimed.',
        severity: 'very_low',
        sourceAgent: 'transport',
        provenance: 'simulation_estimate',
        entityAffected: 'Regional Roadways',
        polarity: 'neutral',
      },
    ],
    metrics: [
      { label: 'Mobility Impact', value: 'Minimal/No Direct Impact', change: 'None', trend: 'neutral' },
      { label: 'Transit Investment', value: 'Unstated', change: 'No Data', trend: 'neutral' },
      { label: 'Corridor Status', value: 'Baseline', change: 'Standard', trend: 'neutral' },
    ],
  };

  // 2. Infrastructure
  const infrastructure: AgentAnalysis = (isCivilInfra || isTransport || isDam) ? {
    domain: 'infrastructure',
    domainName: 'Civil Infrastructure & Utilities Agent',
    overallSeverity: 'low',
    score: 30,
    positiveScore: 80,
    summary: 'Adds designated civil engineering assets and utility alignments adhering to state public works standards.',
    positiveFindings: [
      {
        id: 'inf_pos_1',
        title: 'Designated Civil Asset Creation',
        description: 'Constructs physical infrastructure assets adhering to relevant Bureau of Indian Standards (BIS) norms.',
        severity: 'very_low',
        sourceAgent: 'infrastructure',
        provenance: 'verified_geographic_data',
        entityAffected: 'State Civil Asset Inventory',
        polarity: 'positive',
      },
    ],
    negativeFindings: [
      {
        id: 'inf_neg_1',
        title: 'Subsurface Utility Relocation Alignment',
        description: 'Underground optical fiber and municipal water lines require pre-excavation ground radar profiling.',
        severity: 'low',
        sourceAgent: 'infrastructure',
        provenance: 'verified_geographic_data',
        entityAffected: 'Municipal Utility Corridors',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'inf_pos_1',
        title: 'Civil Infrastructure Expansion',
        description: 'Engineered civil additions with utility clearance protocols.',
        severity: 'very_low',
        sourceAgent: 'infrastructure',
        provenance: 'verified_geographic_data',
        entityAffected: 'Public Works Assets',
        polarity: 'positive',
      },
    ],
    metrics: [
      { label: 'Structural Design Standard', value: 'BIS Compliant', change: 'Standard', trend: 'positive' },
      { label: 'Utility Realignment', value: 'Standard Protocol', change: 'Managed', trend: 'neutral' },
      { label: 'Asset Addition Status', value: 'In Proposal', change: 'Documented', trend: 'positive' },
    ],
  } : isIndustry ? {
    domain: 'infrastructure',
    domainName: 'Civil Infrastructure & Utilities Agent',
    overallSeverity: 'moderate',
    score: 50,
    positiveScore: 0,
    summary: 'Possible utility demand load: Industrial facility requires high-tension electrical power supply and municipal/borewell water connections, increasing demand on civic utilities rather than adding public civic infrastructure.',
    positiveFindings: [],
    negativeFindings: [
      {
        id: 'inf_neg_ind',
        title: 'Possible Utility Grid & Water Demand',
        description: 'Industrial operations create high industrial power and water requirements. Does not construct public civic amenities, roads, or community assets.',
        severity: 'moderate',
        sourceAgent: 'infrastructure',
        provenance: 'simulation_estimate',
        entityAffected: 'Municipal Utilities',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'inf_neg_ind',
        title: 'Possible Utility Grid & Water Demand',
        description: 'Industrial operations create high industrial power and water requirements. Does not construct public civic amenities, roads, or community assets.',
        severity: 'moderate',
        sourceAgent: 'infrastructure',
        provenance: 'simulation_estimate',
        entityAffected: 'Municipal Utilities',
        polarity: 'negative',
      },
    ],
    metrics: [
      { label: 'Civic Asset Creation', value: 'Minimal/No Direct Impact', change: 'None', trend: 'neutral' },
      { label: 'Utility Demand Strain', value: 'Possible High Load', change: 'Projected', trend: 'neutral' },
      { label: 'Substation Capacity', value: 'Unknown', change: 'Pending Audit', trend: 'neutral' },
    ],
  } : {
    domain: 'infrastructure',
    domainName: 'Civil Infrastructure & Utilities Agent',
    overallSeverity: 'low',
    score: 15,
    positiveScore: 0,
    summary: 'Minimal/No Direct Impact: Proposal text contains no civil infrastructure expansion, public utility enhancements, or permanent civic asset construction.',
    positiveFindings: [],
    negativeFindings: [],
    findings: [
      {
        id: 'inf_ev_1',
        title: 'Minimal/No Direct Impact',
        description: 'The proposal contains no meaningful connection to public civil works or municipal utilities. No infrastructure improvements can be assumed.',
        severity: 'very_low',
        sourceAgent: 'infrastructure',
        provenance: 'simulation_estimate',
        entityAffected: 'Civil Asset Inventory',
        polarity: 'neutral',
      },
    ],
    metrics: [
      { label: 'Physical Asset Creation', value: 'Minimal/No Direct Impact', change: 'None', trend: 'neutral' },
      { label: 'Utility Strain', value: 'Baseline', change: 'None Claimed', trend: 'neutral' },
      { label: 'Engineering Clearances', value: 'Not Required', change: 'Standard', trend: 'neutral' },
    ],
  };

  // 3. Population
  const population: AgentAnalysis = isIndustry ? {
    domain: 'population',
    domainName: 'Population & Community Equity Agent',
    overallSeverity: 'moderate',
    score: 45,
    positiveScore: 0,
    summary: 'Community impact and public sentiment Unknown: Citizen approval rating and public consensus are unstated in the proposal. Buffer distance to nearest residential settlements requires field survey.',
    positiveFindings: [],
    negativeFindings: [
      {
        id: 'pop_neg_ind',
        title: 'Public Approval & Exposure Unknown',
        description: 'No public consultation records or residential buffer surveys exist in proposal text. Potential community concerns regarding industrial emissions and groundwater draw remain unaddressed.',
        severity: 'moderate',
        sourceAgent: 'population',
        provenance: 'simulation_estimate',
        entityAffected: 'Local Communities',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'pop_neg_ind',
        title: 'Public Approval & Exposure Unknown',
        description: 'No public consultation records or residential buffer surveys exist in proposal text. Potential community concerns regarding industrial emissions and groundwater draw remain unaddressed.',
        severity: 'moderate',
        sourceAgent: 'population',
        provenance: 'simulation_estimate',
        entityAffected: 'Local Communities',
        polarity: 'negative',
      },
    ],
    metrics: [
      { label: 'Public Approval', value: 'Unknown', change: 'No Survey Data', trend: 'neutral' },
      { label: 'Affected Population', value: 'Unknown', change: 'Unstated', trend: 'neutral' },
      { label: 'Residential Buffer', value: 'Pending Survey', change: 'Required', trend: 'neutral' },
    ],
  } : {
    domain: 'population',
    domainName: 'Population & Community Equity Agent',
    overallSeverity: 'low',
    score: 15,
    positiveScore: 0,
    summary: 'Minimal/No Direct Impact: Proposal text has no direct demographic intervention, social housing, or community welfare program.',
    positiveFindings: [],
    negativeFindings: [],
    findings: [
      {
        id: 'pop_ev_1',
        title: 'Minimal/No Direct Impact',
        description: 'The proposal contains no meaningful connection to demographic restructuring or population welfare programs.',
        severity: 'very_low',
        sourceAgent: 'population',
        provenance: 'simulation_estimate',
        entityAffected: 'Local Citizenry',
        polarity: 'neutral',
      },
    ],
    metrics: [
      { label: 'Public Approval Index', value: 'Minimal/No Direct Impact', change: 'None Stated', trend: 'neutral' },
      { label: 'Demographic Target Group', value: 'Unspecified', change: 'Pending Audit', trend: 'neutral' },
      { label: 'Citizen Consultation', value: 'Not Applicable', change: 'Standard', trend: 'neutral' },
    ],
  };

  // 4. Essential Services
  const essential_services: AgentAnalysis = isHealthcare ? {
    domain: 'essential_services',
    domainName: 'Essential Public Services Agent',
    overallSeverity: 'low',
    score: 22,
    positiveScore: 92,
    summary: 'Substantially expands public clinical capacity, emergency trauma care, and tertiary healthcare coverage.',
    positiveFindings: [
      {
        id: 'es_pos_1',
        title: 'Clinical Care & Emergency Hospital Expansion',
        description: 'Expands tertiary and secondary bed capacity, enhancing regional healthcare availability.',
        severity: 'very_low',
        sourceAgent: 'essential_services',
        provenance: 'simulation_estimate',
        entityAffected: 'Regional Patient Population',
        polarity: 'positive',
      },
    ],
    negativeFindings: [],
    findings: [
      {
        id: 'es_pos_1',
        title: 'Emergency Medical Infrastructure Uplift',
        description: 'Directly reinforces healthcare service delivery.',
        severity: 'very_low',
        sourceAgent: 'essential_services',
        provenance: 'simulation_estimate',
        entityAffected: 'Public Health Network',
        polarity: 'positive',
      },
    ],
    metrics: [
      { label: 'Clinical Bed Capacity', value: 'Expanded', change: 'Evidenced', trend: 'positive' },
      { label: 'Trauma Coverage', value: 'Enhanced', change: 'Priority', trend: 'positive' },
      { label: 'Service Continuity', value: 'Dedicated Operation', change: 'Standard', trend: 'positive' },
    ],
  } : isEducation ? {
    domain: 'essential_services',
    domainName: 'Essential Public Services Agent',
    overallSeverity: 'low',
    score: 22,
    positiveScore: 88,
    summary: 'Expands educational capacity, academic facilities, and public learning infrastructure in the district.',
    positiveFindings: [
      {
        id: 'es_pos_edu',
        title: 'Educational Infrastructure Expansion',
        description: 'Improves student capacity and modern classroom learning environments.',
        severity: 'very_low',
        sourceAgent: 'essential_services',
        provenance: 'simulation_estimate',
        entityAffected: 'Student Demographic',
        polarity: 'positive',
      },
    ],
    negativeFindings: [],
    findings: [
      {
        id: 'es_pos_edu',
        title: 'Educational Asset Creation',
        description: 'Directly supports state public education goals.',
        severity: 'very_low',
        sourceAgent: 'essential_services',
        provenance: 'simulation_estimate',
        entityAffected: 'Education Network',
        polarity: 'positive',
      },
    ],
    metrics: [
      { label: 'Student Capacity', value: 'Expanded', change: 'Evidenced', trend: 'positive' },
      { label: 'Academic Infrastructure', value: 'Upgraded', change: 'Targeted', trend: 'positive' },
      { label: 'Public Service Status', value: 'Education Priority', change: 'Active', trend: 'positive' },
    ],
  } : {
    domain: 'essential_services',
    domainName: 'Essential Public Services Agent',
    overallSeverity: 'low',
    score: 15,
    positiveScore: 0,
    summary: 'Minimal/No Direct Impact: Proposal text has no direct connection, operational scope, or resource commitments regarding public healthcare, hospitals, schools, or emergency response services.',
    positiveFindings: [],
    negativeFindings: [],
    findings: [
      {
        id: 'es_ev_1',
        title: 'Minimal/No Direct Impact',
        description: 'The proposal contains no meaningful connection, operational mandate, or resource allocation for healthcare or education. No public health or educational benefits can be assumed or claimed.',
        severity: 'very_low',
        sourceAgent: 'essential_services',
        provenance: 'simulation_estimate',
        entityAffected: 'Emergency & Civic Services',
        polarity: 'neutral',
      },
    ],
    metrics: [
      { label: 'Healthcare Impact', value: 'Minimal/No Direct Impact', change: 'None Claimed', trend: 'neutral' },
      { label: 'Education Impact', value: 'Minimal/No Direct Impact', change: 'None Claimed', trend: 'neutral' },
      { label: 'Emergency Response SLA', value: 'Standard Protocol', change: 'Baseline', trend: 'neutral' },
    ],
  };

  // 5. Economic
  const economic: AgentAnalysis = isIndustry ? {
    domain: 'economic',
    domainName: 'Economic Development & Trade Agent',
    overallSeverity: 'moderate',
    score: 40,
    positiveScore: 45,
    summary: 'Potential economic benefits: May generate potential industrial output, potential employment, and commercial demand for local services. Concrete job numbers and investment scale are Unknown in the proposal.',
    positiveFindings: [
      {
        id: 'eco_pot_1',
        title: 'Potential Employment & Economic Activity',
        description: 'Potential generation of industrial manufacturing output and localized jobs. Concrete employment figures and investment commitments are unstated in the proposal.',
        severity: 'very_low',
        sourceAgent: 'economic',
        provenance: 'simulation_estimate',
        entityAffected: 'Industrial Trade Ecosystem',
        polarity: 'positive',
      },
    ],
    negativeFindings: [
      {
        id: 'eco_neg_1',
        title: 'Municipal Utility Overhead & Demand',
        description: 'Industrial power and water requirements create operational load on municipal and state utility infrastructure.',
        severity: 'moderate',
        sourceAgent: 'economic',
        provenance: 'simulation_estimate',
        entityAffected: 'Municipal Finance',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'eco_pot_1',
        title: 'Potential Commercial Output & Employment',
        description: 'Potential generation of trade throughput and jobs, subject to strict environmental and social safeguards.',
        severity: 'low',
        sourceAgent: 'economic',
        provenance: 'simulation_estimate',
        entityAffected: 'Commercial Sector',
        polarity: 'positive',
      },
    ],
    metrics: [
      { label: 'Employment Impact', value: 'Potential (Unquantified)', change: 'Unknown', trend: 'positive' },
      { label: 'Industrial Output', value: 'Potential Growth', change: 'Projected', trend: 'positive' },
      { label: 'Public Revenue Yield', value: 'Unknown', change: 'No Data', trend: 'neutral' },
    ],
  } : {
    domain: 'economic',
    domainName: 'Economic Development & Trade Agent',
    overallSeverity: 'low',
    score: 15,
    positiveScore: 0,
    summary: 'Minimal/No Direct Impact: Proposal text provides no empirical evidence of direct employment generation, commercial revenue, or capital investment.',
    positiveFindings: [],
    negativeFindings: [],
    findings: [
      {
        id: 'eco_ev_1',
        title: 'Minimal/No Direct Impact',
        description: 'Economic benefits cannot be assumed without explicit fiscal data or feasibility studies.',
        severity: 'very_low',
        sourceAgent: 'economic',
        provenance: 'simulation_estimate',
        entityAffected: 'Local Economy',
        polarity: 'neutral',
      },
    ],
    metrics: [
      { label: 'Job Creation Index', value: 'Minimal/No Direct Impact', change: 'None Stated', trend: 'neutral' },
      { label: 'Fiscal Revenue Gain', value: 'Unverified', change: 'No Projections', trend: 'neutral' },
      { label: 'Economic Feasibility', value: 'Audit Required', change: 'Pending', trend: 'neutral' },
    ],
  };

  // 6. Environmental
  const environmental: AgentAnalysis = isGreen ? {
    domain: 'environmental',
    domainName: 'Environmental & Ecological Agent',
    overallSeverity: 'very_low',
    score: 18,
    positiveScore: 92,
    summary: 'Evidenced ecological benefit: Reduces carbon footprint, expands clean renewable energy or green canopy, and enforces sustainable standards.',
    positiveFindings: [
      {
        id: 'env_pos_1',
        title: 'Renewable Clean Energy / Ecological Restoration',
        description: 'Directly supports regional decarbonization and ecological preservation.',
        severity: 'very_low',
        sourceAgent: 'environmental',
        provenance: 'simulation_estimate',
        entityAffected: 'Regional Biosphere',
        polarity: 'positive',
      },
    ],
    negativeFindings: [],
    findings: [
      {
        id: 'env_pos_1',
        title: 'Ecological Restoration',
        description: 'Direct environmental improvement demonstrated in proposal.',
        severity: 'very_low',
        sourceAgent: 'environmental',
        provenance: 'simulation_estimate',
        entityAffected: 'Environment',
        polarity: 'positive',
      },
    ],
    metrics: [
      { label: 'Ecological Benefit', value: 'Substantial', change: 'Evidenced', trend: 'positive' },
      { label: 'Emissions Offset', value: 'Active', change: 'Positive', trend: 'positive' },
      { label: 'Carrying Capacity Impact', value: 'Beneficial', change: 'Certified', trend: 'positive' },
    ],
  } : isIndustry ? {
    domain: 'environmental',
    domainName: 'Environmental & Ecological Agent',
    overallSeverity: 'moderate',
    score: 65,
    positiveScore: 0,
    summary: 'Possible industrial environmental risks: Operations carry potential risks of trade effluent, water consumption, air emissions, and waste-management demands. Pollution levels and environmental clearance status are Unknown in proposal text.',
    positiveFindings: [],
    negativeFindings: [
      {
        id: 'env_neg_1',
        title: 'Possible Effluent & Water Quality Impact',
        description: 'Industrial processes generate trade effluent requiring specialized treatment. Specific pollution output is Unknown.',
        severity: 'moderate',
        sourceAgent: 'environmental',
        provenance: 'simulation_estimate',
        entityAffected: 'Water Bodies & Aquifers',
        polarity: 'negative',
      },
      {
        id: 'env_neg_2',
        title: 'Possible Groundwater & Resource Draw',
        description: 'Industrial water consumption risks stressing regional aquifers and local water supply.',
        severity: 'moderate',
        sourceAgent: 'environmental',
        provenance: 'simulation_estimate',
        entityAffected: 'Regional Water Table',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'env_neg_1',
        title: 'Possible Effluent & Resource Depletion Risks',
        description: 'Industrial manufacturing carries known risks regarding water draw, trade effluent, and emissions. Specific pollution levels and treatment plans are unstated in proposal.',
        severity: 'moderate',
        sourceAgent: 'environmental',
        provenance: 'simulation_estimate',
        entityAffected: 'Environment',
        polarity: 'negative',
      },
    ],
    metrics: [
      { label: 'Pollution Level', value: 'Unknown (No EIA)', change: 'Unverified', trend: 'neutral' },
      { label: 'Water Requirement', value: 'Unknown', change: 'Unstated', trend: 'neutral' },
      { label: 'TNPCB Clearance', value: 'Pending CTE', change: 'Mandatory', trend: 'neutral' },
    ],
  } : {
    domain: 'environmental',
    domainName: 'Environmental & Ecological Agent',
    overallSeverity: 'low',
    score: 15,
    positiveScore: 0,
    summary: 'Minimal/No Direct Impact: Proposal text does not involve ecological interventions, forest areas, or environmental conservation measures.',
    positiveFindings: [],
    negativeFindings: [],
    findings: [
      {
        id: 'env_ev_1',
        title: 'Minimal/No Direct Impact',
        description: 'The proposal contains no meaningful connection to ecological enhancement or environmental modifications. No environmental benefits can be claimed.',
        severity: 'very_low',
        sourceAgent: 'environmental',
        provenance: 'simulation_estimate',
        entityAffected: 'Environment',
        polarity: 'neutral',
      },
    ],
    metrics: [
      { label: 'EIA Documentation', value: 'Minimal/No Direct Impact', change: 'Not Applicable', trend: 'neutral' },
      { label: 'Pollution Mitigation Plan', value: 'Baseline Standards', change: 'Standard', trend: 'neutral' },
      { label: 'Ecological Gain', value: '0 / None Stated', change: 'Unverified', trend: 'neutral' },
    ],
  };

  // 7. Disaster Risk
  const disaster_risk: AgentAnalysis = isDam ? {
    domain: 'disaster_risk',
    domainName: 'Disaster Risk & Emergency Resilience Agent',
    overallSeverity: 'moderate',
    score: 45,
    positiveScore: 88,
    summary: 'Controlled surplus hydraulic discharge safeguards dam structural integrity against overtopping, while riparian zones require flood warnings.',
    positiveFindings: [
      {
        id: 'dr_pos_1',
        title: 'Dam Structural Safety & Inflow Buffering',
        description: 'Controlled release prevents catastrophic reservoir overtopping during extreme rainfall events.',
        severity: 'very_low',
        sourceAgent: 'disaster_risk',
        provenance: 'verified_geographic_data',
        entityAffected: 'Hydraulic Infrastructure',
        polarity: 'positive',
      },
    ],
    negativeFindings: [
      {
        id: 'dr_neg_1',
        title: 'Downstream Riparian Inundation Precaution',
        description: 'Low causeways and riparian settlements require pre-discharge siren alerts and revenue department evacuation coordination.',
        severity: 'high',
        sourceAgent: 'disaster_risk',
        provenance: 'verified_geographic_data',
        entityAffected: 'Low-Lying Riparian Settlements',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'dr_pos_1',
        title: 'Reservoir Flood Buffering Protocol',
        description: 'Standard hydraulic protocol preventing catastrophic breach.',
        severity: 'low',
        sourceAgent: 'disaster_risk',
        provenance: 'verified_geographic_data',
        entityAffected: 'Disaster Mitigation Network',
        polarity: 'positive',
      },
    ],
    metrics: [
      { label: 'Spillway Gate Status', value: 'Operational', change: 'Active', trend: 'positive' },
      { label: 'Riparian Alert SLA', value: '< 2 Hours', change: 'Mandated', trend: 'neutral' },
      { label: 'Catastrophic Risk Offset', value: 'High', change: 'Mitigated', trend: 'positive' },
    ],
  } : {
    domain: 'disaster_risk',
    domainName: 'Disaster Risk & Emergency Resilience Agent',
    overallSeverity: 'low',
    score: 15,
    positiveScore: 0,
    summary: 'Minimal/No Direct Impact: Proposal text has no direct connection to natural disaster mitigation or regional civil emergency management.',
    positiveFindings: [],
    negativeFindings: [],
    findings: [
      {
        id: 'dr_ev_1',
        title: 'Minimal/No Direct Impact',
        description: 'The proposal contains no meaningful connection or resource allocation for disaster hazard management or emergency evacuation.',
        severity: 'very_low',
        sourceAgent: 'disaster_risk',
        provenance: 'simulation_estimate',
        entityAffected: 'Disaster Preparedness',
        polarity: 'neutral',
      },
    ],
    metrics: [
      { label: 'Disaster Safety Audit', value: 'Minimal/No Direct Impact', change: 'None Stated', trend: 'neutral' },
      { label: 'Monsoon Hazard Index', value: 'Standard Baseline', change: 'Baseline', trend: 'neutral' },
      { label: 'Emergency Evacuation SOP', value: 'Standard Protocol', change: 'Baseline', trend: 'neutral' },
    ],
  };

  // 8. Social
  const social: AgentAnalysis = isIndustry ? {
    domain: 'social',
    domainName: 'Social Cohesion & Public Acceptance Agent',
    overallSeverity: 'moderate',
    score: 45,
    positiveScore: 0,
    summary: 'Public approval and community consensus Unknown: Proposal text does not provide public survey records, Grama Sabha resolutions, or public consultation documentation.',
    positiveFindings: [],
    negativeFindings: [
      {
        id: 'soc_neg_1',
        title: 'Public Approval & Citizen Consensus Unknown',
        description: 'Citizen consensus cannot be assumed. Industrial proposals often trigger public concern regarding water extraction, noise, and effluent unless vetted in open public hearings.',
        severity: 'moderate',
        sourceAgent: 'social',
        provenance: 'simulation_estimate',
        entityAffected: 'Social Harmony',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'soc_neg_1',
        title: 'Public Approval & Citizen Consensus Unknown',
        description: 'Citizen consensus cannot be assumed without public hearings and consultation records.',
        severity: 'moderate',
        sourceAgent: 'social',
        provenance: 'simulation_estimate',
        entityAffected: 'Social Harmony',
        polarity: 'negative',
      },
    ],
    metrics: [
      { label: 'Public Approval Index', value: 'Unknown', change: 'No Survey Record', trend: 'neutral' },
      { label: 'Community Feedback', value: 'No Survey', change: 'Required', trend: 'neutral' },
      { label: 'Social Audit Status', value: 'Pending Verification', change: 'Mandated', trend: 'neutral' },
    ],
  } : {
    domain: 'social',
    domainName: 'Social Cohesion & Public Acceptance Agent',
    overallSeverity: 'low',
    score: 15,
    positiveScore: 0,
    summary: 'Minimal/No Direct Impact: Proposal text does not involve social welfare schemes, community resettlement, or civil society interventions.',
    positiveFindings: [],
    negativeFindings: [],
    findings: [
      {
        id: 'soc_ev_1',
        title: 'Minimal/No Direct Impact',
        description: 'The proposal contains no meaningful connection to public consensus or social welfare reorganizations.',
        severity: 'very_low',
        sourceAgent: 'social',
        provenance: 'simulation_estimate',
        entityAffected: 'Social Acceptance',
        polarity: 'neutral',
      },
    ],
    metrics: [
      { label: 'Public Approval Index', value: 'Minimal/No Direct Impact', change: 'None Stated', trend: 'neutral' },
      { label: 'Community Feedback', value: 'Standard Protocol', change: 'Baseline', trend: 'neutral' },
      { label: 'Social Audit Status', value: 'Not Required', change: 'Standard', trend: 'neutral' },
    ],
  };

  // 9. Policy Compliance
  const policy_compliance: AgentAnalysis = isIndustry ? {
    domain: 'policy_compliance',
    domainName: 'Policy Compliance & Governance Agent',
    overallSeverity: 'moderate',
    score: 55,
    positiveScore: 15,
    summary: 'Environmental and industrial compliance Unknown / Conditional: Mandatory Consent to Establish (CTE) from TNPCB and Water/Air Act statutory permits are required prior to commencement.',
    positiveFindings: [],
    negativeFindings: [
      {
        id: 'pol_neg_1',
        title: 'Mandatory TNPCB Consent to Establish (CTE)',
        description: 'Textile and industrial units require statutory pollution board CTE, siting clearance, and local town planning permissions before construction.',
        severity: 'moderate',
        sourceAgent: 'policy_compliance',
        provenance: 'simulation_estimate',
        entityAffected: 'Regulatory Framework',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'pol_neg_1',
        title: 'Mandatory TNPCB Consent to Establish (CTE)',
        description: 'Textile and industrial units require statutory pollution board CTE, siting clearance, and local town planning permissions before construction.',
        severity: 'moderate',
        sourceAgent: 'policy_compliance',
        provenance: 'simulation_estimate',
        entityAffected: 'Regulatory Framework',
        polarity: 'negative',
      },
    ],
    metrics: [
      { label: 'TNPCB CTE Status', value: 'Pending Application', change: 'Mandatory Prerequisite', trend: 'neutral' },
      { label: 'Zoning Verification', value: 'Industrial Area Verification', change: 'Required', trend: 'neutral' },
      { label: 'Water Act Compliance', value: 'Pending Clearance', change: 'Statutory', trend: 'neutral' },
    ],
  } : {
    domain: 'policy_compliance',
    domainName: 'Policy Compliance & Governance Agent',
    overallSeverity: 'low',
    score: 20,
    positiveScore: 20,
    summary: 'Statutory compliance is conditional. Full clearance requires verified inter-agency NOCs, departmental sanctions, and mandatory statutory notices before administrative clearance.',
    positiveFindings: [],
    negativeFindings: [
      {
        id: 'pol_neg_1',
        title: 'Pending Inter-Agency Departmental Sanctions',
        description: 'Master plan alignment and statutory clearances must be formally obtained from relevant authorities.',
        severity: 'low',
        sourceAgent: 'policy_compliance',
        provenance: 'simulation_estimate',
        entityAffected: 'Administrative Governance',
        polarity: 'negative',
      },
    ],
    findings: [
      {
        id: 'pol_ev_1',
        title: 'Statutory Clearances Conditional',
        description: 'Compliance cannot be assumed compliant without formal documentation and verification by competent authorities.',
        severity: 'low',
        sourceAgent: 'policy_compliance',
        provenance: 'simulation_estimate',
        entityAffected: 'Regulatory Framework',
        polarity: 'neutral',
      },
    ],
    metrics: [
      { label: 'Statutory Clearances', value: 'Conditional', change: 'Verification Required', trend: 'neutral' },
      { label: 'Compliance Audit', value: 'Pending Documentation', change: 'Subject to Review', trend: 'neutral' },
      { label: 'Inter-Agency NOCs', value: 'Pending', change: 'Unverified', trend: 'neutral' },
    ],
  };

  return {
    transport,
    infrastructure,
    population,
    essential_services,
    economic,
    environmental,
    disaster_risk,
    social,
    policy_compliance,
  };
}

function buildDisplacementIndustrialAnalyses(
  description: string,
  policy: PolicyUnderstanding,
  location: string
): Record<AgentImpactDomain, AgentAnalysis> {
  return {
    population: {
      domain: 'population',
      domainName: 'Population & Demographic Equity Agent',
      overallSeverity: 'critical',
      score: 92,
      positiveScore: 12,
      summary: `Involuntary displacement of 500 settled families triggers severe housing insecurity, loss of local informal livelihoods, and disruption of schooling for children.`,
      positiveFindings: [
        {
          id: 'pop_pos_1',
          title: 'Contingent Pucca Housing Titles (Rehabilitation Phase Only)',
          description: 'May grant formal concrete house deeds only if comprehensive resettlement colony is constructed prior to site takeover.',
          severity: 'low',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: 'Displaced Low-Income Households',
          polarity: 'positive',
        },
      ],
      negativeFindings: [
        {
          id: 'pop_neg_1',
          title: 'Involuntary Eviction of 500 Settled Households',
          description: '500 families lose established shelter, requiring emergency transit camps, basic sanitation, and long-term land titles under RFCTLARR Act (2013).',
          severity: 'critical',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: '500 Settled Households',
          polarity: 'negative',
        },
        {
          id: 'pop_neg_2',
          title: 'Severance of Local Daily-Wage Livelihoods',
          description: 'Immediate loss of domestic service, informal vending, and local workshop wage-earning routines within neighborhood vicinity.',
          severity: 'high',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: 'Informal Wage Earners',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'pop_neg_1',
          title: 'Involuntary Eviction of 500 Settled Households',
          description: '500 families lose established shelter, requiring comprehensive rehabilitation packages under RFCTLARR Act 2013.',
          severity: 'critical',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: '500 Settled Households',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Households Displaced', value: '500 Families (Proposal Fact)', change: 'Severe Impact', trend: 'negative' },
        { label: 'Schooling Disruption', value: 'Affected Families', change: 'Mid-term Disruption', trend: 'negative' },
        { label: 'Informal Livelihoods Lost', value: 'High Disruption', change: 'High Vulnerability', trend: 'negative' },
      ],
    },
    social: {
      domain: 'social',
      domainName: 'Social Cohesion & Citizen Acceptance Agent',
      overallSeverity: 'critical',
      score: 95,
      positiveScore: 10,
      summary: `Extreme likelihood of community protest mobilizations, legal stay petitions under RFCTLARR Act 2013, and severe psychological distress across displaced vulnerable communities.`,
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'soc_neg_1',
          title: 'Mass Community Resistance & Protest Risk',
          description: 'Forcible eviction without unanimous Grama Sabha and R&R consent risks organized street agitation, human rights complaints, and High Court interim stays.',
          severity: 'critical',
          sourceAgent: 'social',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Civil Harmony & Law and Order',
          polarity: 'negative',
        },
        {
          id: 'soc_neg_2',
          title: 'Vulnerable Social Group Disproportionate Burden',
          description: 'Affected families include daily-wage workers, agricultural laborers, and marginalized households lacking legal fallback assets.',
          severity: 'high',
          sourceAgent: 'social',
          provenance: 'simulation_estimate',
          entityAffected: 'Marginalized Demographics',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'soc_neg_1',
          title: 'Mass Community Resistance & Protest Risk',
          description: 'Eviction without comprehensive consensus triggers organized public resistance and legal stays.',
          severity: 'critical',
          sourceAgent: 'social',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Community Harmony',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Social Conflict Index', value: 'High Severity', change: 'Critical Opposition', trend: 'negative' },
        { label: 'Community Consent Level', value: 'Widespread Opposition', change: 'Mass Opposition', trend: 'negative' },
        { label: 'Vulnerable Demographics', value: 'Affected Residents', change: 'Extreme Vulnerability', trend: 'negative' },
      ],
    },
    environmental: {
      domain: 'environmental',
      domainName: 'Environmental Quality & Climate Impact Agent',
      overallSeverity: 'critical',
      score: 88,
      positiveScore: 15,
      summary: `Cement manufacturing is a Red-Category heavy industry causing hazardous particulate air emissions (PM2.5, PM10, clinker dust), heavy groundwater exploitation, and kiln thermal pollution.`,
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'env_neg_1',
          title: 'Fugitive Clinker Dust & Ambient Particulate Spike',
          description: 'Kiln processing and clinker grinding release fugitive dust, causing chronic respiratory ailments for surrounding residents.',
          severity: 'critical',
          sourceAgent: 'environmental',
          provenance: 'simulation_estimate',
          entityAffected: 'Regional Ambient Air Shed & Neighboring Settlements',
          polarity: 'negative',
        },
        {
          id: 'env_neg_2',
          title: 'Industrial Groundwater Depletion',
          description: 'Plant cooling and slurry operations require heavy groundwater extraction, stressing the local agricultural water table.',
          severity: 'high',
          sourceAgent: 'environmental',
          provenance: 'simulation_estimate',
          entityAffected: 'Regional Aquifer & Surrounding Wells',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'env_neg_1',
          title: 'Fugitive Clinker Dust & Particulate Pollution',
          description: 'Heavy clinker manufacturing significantly degrades ambient air quality.',
          severity: 'critical',
          sourceAgent: 'environmental',
          provenance: 'simulation_estimate',
          entityAffected: 'Ambient Air Basin',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Airborne Dust Hazards', value: 'High Fugitive Dust', change: 'Hazardous', trend: 'negative' },
        { label: 'Industrial Groundwater Draw', value: 'Heavy Exploitation', change: 'Severe Depletion', trend: 'negative' },
        { label: 'TNPCB Categorization', value: 'Red Category (Heavy Polluting)', change: 'High Scrutiny', trend: 'negative' },
      ],
    },
    transport: {
      domain: 'transport',
      domainName: 'Transport & Mobility Agent',
      overallSeverity: 'high',
      score: 78,
      positiveScore: 25,
      summary: `Heavy multi-axle freight and raw material hauling trailers cause severe arterial congestion, accelerated road pavement wear, and heightened accident risks.`,
      positiveFindings: [
        {
          id: 'tr_pos_1',
          title: 'Industrial Approach Road Widening',
          description: 'Requires widening approach roads to multiple lanes with reinforced asphalt shoulders.',
          severity: 'low',
          sourceAgent: 'transport',
          provenance: 'simulation_estimate',
          entityAffected: 'Primary Arterial Road',
          polarity: 'positive',
        },
      ],
      negativeFindings: [
        {
          id: 'tr_neg_1',
          title: 'Heavy Freight Hauling Surges',
          description: 'Substantial heavy freight and limestone trucks severely congest connecting rural road corridors.',
          severity: 'high',
          sourceAgent: 'transport',
          provenance: 'simulation_estimate',
          entityAffected: 'Arterial & Feeder Road Corridors',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'tr_neg_1',
          title: 'Heavy Freight Truck Hauling Surges',
          description: 'Heavy freight trucks congest regional road network.',
          severity: 'high',
          sourceAgent: 'transport',
          provenance: 'simulation_estimate',
          entityAffected: 'Transport Network',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Heavy Freight Traffic', value: 'Substantial Truck Volume', change: 'Severe Congestion', trend: 'negative' },
        { label: 'Pavement Structural Wear', value: 'Accelerated Wear', change: 'Critical Maintenance', trend: 'negative' },
        { label: 'Accident Risk', value: 'Elevated Risk', change: 'High Caution', trend: 'negative' },
      ],
    },
    policy_compliance: {
      domain: 'policy_compliance',
      domainName: 'Policy Compliance & Legal Governance Agent',
      overallSeverity: 'critical',
      score: 88,
      positiveScore: 20,
      summary: `Faces major statutory compliance hurdles under RFCTLARR Act (2013), mandatory MoEFCC Environmental Clearance (EC), and TNPCB Consent-to-Establish (CTE) public hearings.`,
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'pol_neg_1',
          title: 'Mandatory R&R Resettlement Colony Prerequisite',
          description: 'Section 31-38 of RFCTLARR Act strictly prohibits physical possession until fully developed resettlement colony with mandatory basic amenities is handed over.',
          severity: 'critical',
          sourceAgent: 'policy_compliance',
          provenance: 'simulation_estimate',
          entityAffected: 'District Revenue Administration',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'pol_neg_1',
          title: 'Mandatory R&R Resettlement Prerequisite',
          description: 'Strict statutory compliance required before any land possession.',
          severity: 'critical',
          sourceAgent: 'policy_compliance',
          provenance: 'simulation_estimate',
          entityAffected: 'Legal Framework',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Statutory Clearances Required', value: 'Central & State Mandates', change: 'High Regulatory Hurdle', trend: 'negative' },
        { label: 'Litigation Vulnerability', value: 'High Risk (RFCTLARR Act)', change: 'Injunction Likely', trend: 'negative' },
        { label: 'Grama Sabha Resolution', value: 'Mandatory', change: 'Pending', trend: 'negative' },
      ],
    },
    economic: {
      domain: 'economic',
      domainName: 'Economic Development & Employment Agent',
      overallSeverity: 'moderate',
      score: 45,
      positiveScore: 65,
      summary: `Potential private industrial capital investment and potential direct plant jobs, but triggers immediate loss of established livelihoods for 500 displaced families.`,
      positiveFindings: [
        {
          id: 'eco_pos_1',
          title: 'Potential Private Industrial Capital Investment',
          description: 'Potential manufacturing capital investment in plant machinery and industrial operations (exact capital unstated in proposal).',
          severity: 'low',
          sourceAgent: 'economic',
          provenance: 'simulation_estimate',
          entityAffected: 'State Industrial Manufacturing Sector',
          polarity: 'positive',
        },
      ],
      negativeFindings: [
        {
          id: 'eco_neg_1',
          title: 'Localized Household Income Shock',
          description: 'Displaced wage earners face immediate severance from local employment hubs, resulting in localized economic shock and loss of earnings.',
          severity: 'high',
          sourceAgent: 'economic',
          provenance: 'simulation_estimate',
          entityAffected: 'Displaced Household Economy',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'eco_pos_1',
          title: 'Potential Private Industrial Capital Inflow',
          description: 'Potential capital investment and manufacturing output.',
          severity: 'low',
          sourceAgent: 'economic',
          provenance: 'simulation_estimate',
          entityAffected: 'State Economy',
          polarity: 'positive',
        },
      ],
      metrics: [
        { label: 'Capital Investment', value: 'Potential (Unquantified)', change: 'Unstated', trend: 'neutral' },
        { label: 'Factory Employment', value: 'Potential (Unquantified)', change: 'Unstated', trend: 'neutral' },
        { label: 'Displaced Livelihood Shock', value: 'Severe Loss', change: 'Major Deficit', trend: 'negative' },
      ],
    },
    infrastructure: {
      domain: 'infrastructure',
      domainName: 'Civil Infrastructure & Utilities Agent',
      overallSeverity: 'moderate',
      score: 70,
      positiveScore: 40,
      summary: `Requires severing municipal water/electric lines for 500 homes while demanding heavy industrial power and water infrastructure.`,
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'inf_neg_1',
          title: 'Demolition & Utility Infrastructure Severance',
          description: 'Requires demolition of 500 dwellings, overhead power lines, and local drinking water distribution pipes.',
          severity: 'high',
          sourceAgent: 'infrastructure',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Civic Distribution Network',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'inf_neg_1',
          title: 'Demolition & Utility Severance',
          description: 'Requires dismantling existing municipal service lines.',
          severity: 'high',
          sourceAgent: 'infrastructure',
          provenance: 'simulation_estimate',
          entityAffected: 'Civic Utilities',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Dwellings to Demolish', value: '500 Structures (Proposal Fact)', change: 'Complete Removal', trend: 'negative' },
        { label: 'Industrial Grid Draw', value: 'High Power Load', change: 'Heavy Load', trend: 'neutral' },
        { label: 'Water Feeder Pipeline', value: 'Requires Rerouting', change: 'Disrupted', trend: 'negative' },
      ],
    },
    essential_services: {
      domain: 'essential_services',
      domainName: 'Essential Public Services Agent',
      overallSeverity: 'high',
      score: 74,
      positiveScore: 30,
      summary: `Mandates high-hazard industrial fire response units, chemical first-responder equipment, and continuous public health pulmonary clinics.`,
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'es_neg_1',
          title: 'Industrial Hazard Buffers Required',
          description: 'Mandates strict safety buffer around cement kilns to prevent residential exposure to toxic flue gases.',
          severity: 'high',
          sourceAgent: 'essential_services',
          provenance: 'simulation_estimate',
          entityAffected: 'Public Safety Services',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'es_neg_1',
          title: 'Industrial Hazard Buffers Required',
          description: 'Safety buffers mandated to protect nearby citizens.',
          severity: 'high',
          sourceAgent: 'essential_services',
          provenance: 'simulation_estimate',
          entityAffected: 'Emergency Services',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Fire Safety Readiness', value: 'Industrial Class A', change: 'Mandatory', trend: 'neutral' },
        { label: 'Local Clinic Disruption', value: 'Service Severance', change: 'Relocation Phase', trend: 'negative' },
        { label: 'Emergency Buffer Zone', value: 'Enforced Buffer', change: 'Restricted', trend: 'negative' },
      ],
    },
    disaster_risk: {
      domain: 'disaster_risk',
      domainName: 'Disaster Resilience & Safety Agent',
      overallSeverity: 'high',
      score: 72,
      positiveScore: 25,
      summary: `Heightened risks of industrial silo collapse, kiln thermal hazards, and heavy industrial chemical runoff during severe monsoon downpours.`,
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'dr_neg_1',
          title: 'Limestone Slurry & Industrial Runoff Hazards',
          description: 'Untreated alkaline clinker slurry runoff during heavy rains risks contaminating downstream water bodies and agricultural fields.',
          severity: 'high',
          sourceAgent: 'disaster_risk',
          provenance: 'simulation_estimate',
          entityAffected: 'Drainage Basins & Irrigation Canals',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'dr_neg_1',
          title: 'Limestone Slurry Runoff Hazards',
          description: 'Alkaline runoff during heavy rains risks water contamination.',
          severity: 'high',
          sourceAgent: 'disaster_risk',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Environment',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Industrial Disaster Class', value: 'Major Accident Hazard (MAH)', change: 'High Caution', trend: 'negative' },
        { label: 'Slurry Containment Risk', value: 'Elevated Risk', change: 'Elevated Risk', trend: 'negative' },
        { label: 'Monsoon Flood Inundation', value: 'Zero-Discharge Required', change: 'Strict Condition', trend: 'neutral' },
      ],
    },
  };
}

function buildAgriculturalDestructionAnalyses(
  description: string,
  policy: PolicyUnderstanding,
  location: string
): Record<AgentImpactDomain, AgentAnalysis> {
  return {
    population: {
      domain: 'population',
      domainName: 'Population & Agrarian Equity Agent',
      overallSeverity: 'critical',
      score: 92,
      positiveScore: 10,
      summary: 'Destruction of cultivable agricultural land directly threatens agrarian households, terminates generational livelihoods, and drives distress out-migration into urban informal labor.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'ag_pop_neg_1',
          title: 'Permanent Eradication of Cultivable Farmland',
          description: 'Multi-crop fertile acreage is permanently destroyed and alienated, depriving farming families and tenant cultivators of their primary livelihood and ancestral land security.',
          severity: 'critical',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Farming Households & Agrarian Laborers',
          polarity: 'negative',
        },
        {
          id: 'ag_pop_neg_2',
          title: 'Severe Rural Livelihood Disruption & Distress Migration',
          description: 'Loss of farm employment forces agricultural laborers into precarious, unorganized daily-wage urban work without social security.',
          severity: 'high',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: 'Rural Agricultural Workforce',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'ag_pop_neg_1',
          title: 'Permanent Eradication of Cultivable Farmland',
          description: 'Multi-crop fertile acreage is permanently destroyed, depriving farming families of their primary sustenance.',
          severity: 'critical',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Farming Households',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Cultivable Farmland Lost', value: 'High Fertile Acreage', change: 'Irreversible Loss', trend: 'negative' },
        { label: 'Farmer Households Affected', value: 'Severe Agrarian Distress', change: 'Critical Threat', trend: 'negative' },
        { label: 'Agrarian Employment Loss', value: 'Severe Job Drop', change: 'Severe Drop', trend: 'negative' },
      ],
    },
    environmental: {
      domain: 'environmental',
      domainName: 'Environmental & Agro-Ecological Agent',
      overallSeverity: 'critical',
      score: 90,
      positiveScore: 12,
      summary: 'Stripping topsoil causes irreversible loss of soil biology, impairs regional groundwater percolation, and shatters local agro-biodiversity and natural drainage catchment.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'ag_env_neg_1',
          title: 'Irreversible Topsoil Destruction & Soil Degradation',
          description: 'Removal or conversion of fertile topsoil destroys organic humus and microbial biodiversity built over centuries, rendering land sterile.',
          severity: 'critical',
          sourceAgent: 'environmental',
          provenance: 'simulation_estimate',
          entityAffected: 'Regional Agricultural Soil Health',
          polarity: 'negative',
        },
        {
          id: 'ag_env_neg_2',
          title: 'Groundwater Catchment Contraction & Watershed Ruin',
          description: 'Farmlands function as natural percolation basins for local aquifers; their destruction accelerates storm runoff and triggers regional water table depletion.',
          severity: 'high',
          sourceAgent: 'environmental',
          provenance: 'verified_geographic_data',
          entityAffected: 'Sub-surface Aquifers & Micro-Watershed',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'ag_env_neg_1',
          title: 'Irreversible Topsoil Destruction',
          description: 'Removal or alteration of fertile topsoil destroys microbial biodiversity built over centuries.',
          severity: 'critical',
          sourceAgent: 'environmental',
          provenance: 'simulation_estimate',
          entityAffected: 'Agricultural Ecosystem',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Topsoil Biology Integrity', value: 'Severely Depleted', change: 'Irreversible', trend: 'negative' },
        { label: 'Aquifer Infiltration Basin', value: 'Sponge Basin Impaired', change: 'Major Loss', trend: 'negative' },
        { label: 'Agro-Ecosystem Biodiversity', value: 'Critical Collapse', change: 'Acute Strain', trend: 'negative' },
      ],
    },
    economic: {
      domain: 'economic',
      domainName: 'Economic & Food Security Agent',
      overallSeverity: 'critical',
      score: 86,
      positiveScore: 14,
      summary: 'Eradicates recurring farm revenue and local food crop harvest, driving food price inflation and destabilizing agricultural supply chains.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'ag_eco_neg_1',
          title: 'Permanent Eradication of Agrarian GDP & Farm Incomes',
          description: 'Eliminates recurring seasonal crop harvest revenues and allied livestock commerce, depressing rural purchasing power.',
          severity: 'high',
          sourceAgent: 'economic',
          provenance: 'simulation_estimate',
          entityAffected: 'Rural Agricultural Economy',
          polarity: 'negative',
        },
        {
          id: 'ag_eco_neg_2',
          title: 'Local Food Supply Contraction & Price Escalation',
          description: 'Contraction of local food grain, vegetable, and pulse supplies strains regulated mandis and drives consumer food inflation.',
          severity: 'high',
          sourceAgent: 'economic',
          provenance: 'simulation_estimate',
          entityAffected: 'Regional Food Distribution Network',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'ag_eco_neg_1',
          title: 'Permanent Loss of Agrarian GDP',
          description: 'Eliminates annual recurring crop revenue and harvest yields for regional farmers.',
          severity: 'high',
          sourceAgent: 'economic',
          provenance: 'simulation_estimate',
          entityAffected: 'Regional Agricultural Economy',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Food Crop Yield Deficit', value: 'Local Harvest Contraction', change: 'Acute Drop', trend: 'negative' },
        { label: 'Annual Farm Revenue Lost', value: 'Critical Agrarian Deficit', change: 'Permanent Deficit', trend: 'negative' },
        { label: 'Local Food Price Volatility', value: 'Elevated Risk', change: 'Elevated Risk', trend: 'negative' },
      ],
    },
    social: {
      domain: 'social',
      domainName: 'Social Harmony & Agrarian Rights Agent',
      overallSeverity: 'critical',
      score: 94,
      positiveScore: 8,
      summary: 'Severe risk of mass peasant demonstrations, tractor blockades, Grama Sabha unanimous objections, and immediate High Court stay petitions.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'ag_soc_neg_1',
          title: 'Widespread Agrarian Mobilization & Peasant Resistance',
          description: 'Farming communities and peasant unions organize immediate non-cooperation agitations, road blockades, and rallies opposing the destruction of ancestral farmlands.',
          severity: 'critical',
          sourceAgent: 'social',
          provenance: 'simulation_estimate',
          entityAffected: 'Regional Civil Peace & Law and Order',
          polarity: 'negative',
        },
        {
          id: 'ag_soc_neg_2',
          title: 'Judicial Injunction & High Court Stay Exposure',
          description: 'High probability of Public Interest Litigations (PIL) under agricultural land conservation acts, exposing the decision to swift interim judicial stays.',
          severity: 'high',
          sourceAgent: 'social',
          provenance: 'simulation_estimate',
          entityAffected: 'Executive Administrative Execution',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'ag_soc_neg_1',
          title: 'Mass Agrarian Resistance & Legal Injunctions',
          description: 'Widespread demonstrations and legal stay petitions against the conversion of fertile lands.',
          severity: 'critical',
          sourceAgent: 'social',
          provenance: 'simulation_estimate',
          entityAffected: 'Civil Harmony & Administrative Stability',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Community Opposition Rating', value: 'Widespread Rejection', change: 'Overwhelming', trend: 'negative' },
        { label: 'Judicial Stay Probability', value: 'High Imminent Risk', change: 'Imminent', trend: 'negative' },
        { label: 'Agrarian Agitation Level', value: 'Critical Alert', change: 'Severe Tension', trend: 'negative' },
      ],
    },
    policy_compliance: {
      domain: 'policy_compliance',
      domainName: 'Statutory Land Preservation & Regulatory Compliance Agent',
      overallSeverity: 'critical',
      score: 92,
      positiveScore: 10,
      summary: 'Severe breach of statutory agricultural land protection policies, Central National Food Security mandates, and state master plan conservation covenants.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'ag_pol_neg_1',
          title: 'Breach of Multi-Crop Farmland Protection Directives',
          description: 'Violates statutory state mandates that prohibit the diversion and destruction of fertile multi-crop agricultural land except in verified emergencies.',
          severity: 'critical',
          sourceAgent: 'policy_compliance',
          provenance: 'verified_geographic_data',
          entityAffected: 'State Agricultural Governance Framework',
          polarity: 'negative',
        },
        {
          id: 'ag_pol_neg_2',
          title: 'Non-Compliance with National Food Security Guidelines',
          description: 'Contradicts state-level food security planning quotas by shrinking the designated cultivable land bank required to sustain public grain reserves.',
          severity: 'high',
          sourceAgent: 'policy_compliance',
          provenance: 'verified_geographic_data',
          entityAffected: 'Public Distribution Reserve Guidelines',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'ag_pol_neg_1',
          title: 'Breach of Farmland Protection Directives',
          description: 'Violates statutory directives barring the destruction of multi-crop agricultural land.',
          severity: 'critical',
          sourceAgent: 'policy_compliance',
          provenance: 'verified_geographic_data',
          entityAffected: 'Agricultural Preservation Policies',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Statutory Land Norms', value: 'Non-Compliant (Severe Breach)', change: 'Violation', trend: 'negative' },
        { label: 'Grama Sabha Approval', value: 'Resolutions Required', change: 'Statutory Mandate', trend: 'negative' },
        { label: 'Regulatory Risk Index', value: 'Critical Legal Risk', change: 'Critical Legal Risk', trend: 'negative' },
      ],
    },
    disaster_risk: {
      domain: 'disaster_risk',
      domainName: 'Disaster Resilience & Flood Retention Agent',
      overallSeverity: 'high',
      score: 78,
      positiveScore: 15,
      summary: 'Destruction of agricultural fields eliminates natural flood retention sponges, sharply increasing storm runoff velocity and exacerbating downstream inundation.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'ag_dr_neg_1',
          title: 'Loss of Monsoon Flood Retention Buffer',
          description: 'Open farmlands naturally absorb excess precipitation; destroying them causes storm surges to overflow into nearby residential hamlets.',
          severity: 'high',
          sourceAgent: 'disaster_risk',
          provenance: 'simulation_estimate',
          entityAffected: 'Drainage Basins & Downstream Settlements',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'ag_dr_neg_1',
          title: 'Loss of Flood Retention Buffer',
          description: 'Farmlands absorb excess monsoon waters; destroying them increases downstream inundation.',
          severity: 'high',
          sourceAgent: 'disaster_risk',
          provenance: 'simulation_estimate',
          entityAffected: 'Downstream Habitats',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Monsoon Runoff Surge', value: 'Elevated Peak Discharge', change: 'Increased Flood Risk', trend: 'negative' },
        { label: 'Drainage Buffer Capacity', value: 'Buffer Loss', change: 'Degraded', trend: 'negative' },
      ],
    },
    infrastructure: {
      domain: 'infrastructure',
      domainName: 'Rural Utilities & Irrigation Networks Agent',
      overallSeverity: 'high',
      score: 74,
      positiveScore: 18,
      summary: 'Destruction disrupts irrigation field channels, village agricultural energization feeders, and traditional water distribution bunds.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'ag_inf_neg_1',
          title: 'Destruction of Irrigation Channels & Bunds',
          description: 'Slices through earthen feeder distributaries and micro-canal networks, causing upstream waterlogging and downstream water starvation.',
          severity: 'high',
          sourceAgent: 'infrastructure',
          provenance: 'simulation_estimate',
          entityAffected: 'Irrigation Feeder Networks',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'ag_inf_neg_1',
          title: 'Destruction of Irrigation Infrastructure',
          description: 'Earthen feeder distributaries and micro-canals severed.',
          severity: 'high',
          sourceAgent: 'infrastructure',
          provenance: 'simulation_estimate',
          entityAffected: 'Irrigation Networks',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Irrigation Channel Severance', value: 'High Disruption', change: 'Network Fractured', trend: 'negative' },
        { label: 'Field Borewell Impact', value: 'Multiple Assets Lost', change: 'Damaged', trend: 'negative' },
      ],
    },
    transport: {
      domain: 'transport',
      domainName: 'Rural Transit & Freight Corridor Agent',
      overallSeverity: 'moderate',
      score: 60,
      positiveScore: 22,
      summary: 'Heavy earthmoving and demolition vehicle movements congest narrow rural village roads, damaging asphalt and impeding farm tractor haulage.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'ag_tr_neg_1',
          title: 'Rural Road Wear & Tractor Mobility Bottlenecks',
          description: 'Heavy construction and earth-hauling equipment damages rural single-lane panchayat roads not designed for heavy axle loads.',
          severity: 'moderate',
          sourceAgent: 'transport',
          provenance: 'simulation_estimate',
          entityAffected: 'Panchayat Rural Road Grid',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'ag_tr_neg_1',
          title: 'Rural Road Wear & Tractor Mobility Bottlenecks',
          description: 'Heavy equipment damages single-lane rural roads.',
          severity: 'moderate',
          sourceAgent: 'transport',
          provenance: 'simulation_estimate',
          entityAffected: 'Panchayat Roads',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Rural Road Structural Wear', value: 'Elevated Pavement Stress', change: 'Pothole Risk', trend: 'negative' },
        { label: 'Agrarian Freight Delay', value: 'Haulage Delays', change: 'Tractor Congestion', trend: 'neutral' },
      ],
    },
    essential_services: {
      domain: 'essential_services',
      domainName: 'Essential Rural Services & Food Distribution Agent',
      overallSeverity: 'high',
      score: 75,
      positiveScore: 18,
      summary: 'Compromises rural primary agricultural cooperative credit societies (PACCS), village drinking water supply wells, and local agricultural input hubs.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'ag_es_neg_1',
          title: 'Disruption of Rural Cooperative and Drinking Water Assets',
          description: 'Endangers rural ground wells and dismantles proximity to cooperative granaries and agricultural input distribution counters.',
          severity: 'high',
          sourceAgent: 'essential_services',
          provenance: 'simulation_estimate',
          entityAffected: 'Rural Service Hubs & Wells',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'ag_es_neg_1',
          title: 'Disruption of Rural Service Assets',
          description: 'Endangers rural ground wells and dismantles proximity to cooperative granaries.',
          severity: 'high',
          sourceAgent: 'essential_services',
          provenance: 'simulation_estimate',
          entityAffected: 'Rural Services',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Agricultural Credit Societies', value: 'High Disruption', change: 'Supply Chain Impaired', trend: 'negative' },
        { label: 'Rural Water Source Security', value: 'High Risk', change: 'Contamination Threat', trend: 'negative' },
      ],
    },
  };
}

function buildEnvironmentalDestructionAnalyses(
  description: string,
  policy: PolicyUnderstanding,
  location: string
): Record<AgentImpactDomain, AgentAnalysis> {
  return {
    environmental: {
      domain: 'environmental',
      domainName: 'Environmental & Ecological Agent',
      overallSeverity: 'critical',
      score: 95,
      positiveScore: 8,
      summary: 'Catastrophic destruction of natural green canopy, wetland retention, and biodiversity habitat, causing severe carbon sink loss and micro-climatic deterioration.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'env_neg_1',
          title: 'Mass Deforestation & Green Canopy Collapse',
          description: 'Permanent felling of mature trees and clearing of natural vegetation obliterates regional carbon sequestration buffers and urban heat mitigation.',
          severity: 'critical',
          sourceAgent: 'environmental',
          provenance: 'verified_geographic_data',
          entityAffected: 'Regional Forest & Green Cover',
          polarity: 'negative',
        },
        {
          id: 'env_neg_2',
          title: 'Wetland Encroachment & Water Basin Destruction',
          description: 'Filling or contaminating natural water bodies and wetlands destroys critical aquatic biodiversity and eliminates regional stormwater buffers.',
          severity: 'critical',
          sourceAgent: 'environmental',
          provenance: 'verified_geographic_data',
          entityAffected: 'Water Bodies & Aquifers',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'env_neg_1',
          title: 'Mass Deforestation & Green Canopy Collapse',
          description: 'Permanent clearing of natural vegetation obliterates regional carbon sequestration buffers.',
          severity: 'critical',
          sourceAgent: 'environmental',
          provenance: 'verified_geographic_data',
          entityAffected: 'Natural Green Cover',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Tree Canopy Loss', value: 'Critical Loss', change: 'Irreversible', trend: 'negative' },
        { label: 'Carbon Sink Deficit', value: 'Carbon Buffer Loss', change: 'Severe Drop', trend: 'negative' },
        { label: 'Aquatic Wetland Health', value: 'Severely Degraded', change: 'Acute Strain', trend: 'negative' },
      ],
    },
    social: {
      domain: 'social',
      domainName: 'Citizen Health & Public Acceptance Agent',
      overallSeverity: 'critical',
      score: 92,
      positiveScore: 10,
      summary: 'Severe public outcry, environmental NGO protests, and imminent National Green Tribunal (NGT) litigation against ecological destruction.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'env_soc_neg_1',
          title: 'Mass Public Backlash & NGT Stay Injunctions',
          description: 'Citizens and environmental groups organize widespread agitations and file urgent petitions before the National Green Tribunal.',
          severity: 'critical',
          sourceAgent: 'social',
          provenance: 'simulation_estimate',
          entityAffected: 'Civil Order & Administrative Standing',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'env_soc_neg_1',
          title: 'Mass Public Backlash & NGT Stay Injunctions',
          description: 'Citizens organize widespread protests against ecological destruction.',
          severity: 'critical',
          sourceAgent: 'social',
          provenance: 'simulation_estimate',
          entityAffected: 'Civil Harmony',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Public Opposition', value: 'Widespread Disapproval', change: 'Widespread Rejection', trend: 'negative' },
        { label: 'NGT Injunction Risk', value: 'Imminent Legal Risk', change: 'Judicial Halt', trend: 'negative' },
      ],
    },
    policy_compliance: {
      domain: 'policy_compliance',
      domainName: 'Environmental Statues & Forest Conservation Agent',
      overallSeverity: 'critical',
      score: 94,
      positiveScore: 8,
      summary: 'Direct violation of the Forest (Conservation) Act, Water (Prevention & Control of Pollution) Act, and Tamil Nadu Green Cover preservation standards.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'env_pol_neg_1',
          title: 'Violation of Statutory Environmental Protection Acts',
          description: 'Non-compliant with mandatory Environment Clearance (EC) norms, Coastal Regulation Zone/Wetland conservation rules, and tree-felling permission statutes.',
          severity: 'critical',
          sourceAgent: 'policy_compliance',
          provenance: 'verified_geographic_data',
          entityAffected: 'State Environmental Regulatory Framework',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'env_pol_neg_1',
          title: 'Violation of Statutory Environmental Protection Acts',
          description: 'Non-compliant with mandatory statutory environmental and forest conservation statutes.',
          severity: 'critical',
          sourceAgent: 'policy_compliance',
          provenance: 'verified_geographic_data',
          entityAffected: 'Environmental Regulatory Framework',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Environmental Norms', value: 'Severe Violation', change: 'Non-Compliant', trend: 'negative' },
        { label: 'Legal Penalty Exposure', value: 'High Statutory Liability', change: 'Prosecution Risk', trend: 'negative' },
      ],
    },
    disaster_risk: {
      domain: 'disaster_risk',
      domainName: 'Climate Resilience & Urban Heat Surge Agent',
      overallSeverity: 'critical',
      score: 88,
      positiveScore: 12,
      summary: 'Stripping trees and wetlands intensifies localized urban heat island effects, increases micro-drought vulnerability, and doubles flood runoff.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'env_dr_neg_1',
          title: 'Loss of Natural Buffers Against Floods and Heatwaves',
          description: 'Loss of green and wetland buffer directly elevates flash flooding and surface ambient temperature during summer heatwaves.',
          severity: 'high',
          sourceAgent: 'disaster_risk',
          provenance: 'simulation_estimate',
          entityAffected: 'Micro-climate & Drainage Basin',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'env_dr_neg_1',
          title: 'Loss of Natural Buffers Against Floods and Heatwaves',
          description: 'Loss of green buffer elevates flash flooding and surface temperatures.',
          severity: 'high',
          sourceAgent: 'disaster_risk',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Micro-climate',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Micro-Climate Heat Index', value: 'Urban Heat Island Escalation', change: 'Thermal Stress', trend: 'negative' },
        { label: 'Flood Absorption Capacity', value: 'Buffer Loss', change: 'Elevated Risk', trend: 'negative' },
      ],
    },
    population: {
      domain: 'population',
      domainName: 'Public Health & Respiratory Wellbeing Agent',
      overallSeverity: 'high',
      score: 82,
      positiveScore: 15,
      summary: 'Loss of ambient air filtration and natural recreation spaces accelerates respiratory disease burdens and worsens citizen quality of life.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'env_pop_neg_1',
          title: 'Deterioration in Ambient Air Quality & Public Health',
          description: 'Loss of natural green vegetation filters increases PM2.5 and PM10 particulate levels, aggravating asthma and respiratory morbidities.',
          severity: 'high',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: 'Citizen Respiratory Health',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'env_pop_neg_1',
          title: 'Deterioration in Public Health',
          description: 'Loss of green filters increases particulate matter levels and respiratory illnesses.',
          severity: 'high',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: 'Citizen Health',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Ambient Particulate Risk', value: 'Particulate Surge', change: 'Health Risk', trend: 'negative' },
        { label: 'Public Health Burden', value: 'High Respiratory Index', change: 'Degraded', trend: 'negative' },
      ],
    },
    economic: {
      domain: 'economic',
      domainName: 'Long-Term Ecological Economy Agent',
      overallSeverity: 'high',
      score: 75,
      positiveScore: 20,
      summary: 'Destroys eco-tourism, forestry product revenues, and creates massive future public expenditure burdens for flood restoration and pollution cleanup.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'env_eco_neg_1',
          title: 'Loss of Ecosystem Services & Remediation Costs',
          description: 'Eliminates natural water purification and micro-climate moderation services, requiring massive future civil engineering expenditure to compensate.',
          severity: 'high',
          sourceAgent: 'economic',
          provenance: 'simulation_estimate',
          entityAffected: 'Public Treasury & Municipal Budget',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'env_eco_neg_1',
          title: 'Loss of Ecosystem Services',
          description: 'Requires massive future civil engineering expenditure to compensate for lost ecological services.',
          severity: 'high',
          sourceAgent: 'economic',
          provenance: 'simulation_estimate',
          entityAffected: 'Municipal Budget',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Ecological Services Lost', value: 'Severe Capital Deficit', change: 'Compounded Cost', trend: 'negative' },
      ],
    },
    infrastructure: {
      domain: 'infrastructure',
      domainName: 'Civil Protection Infrastructure Agent',
      overallSeverity: 'moderate',
      score: 65,
      positiveScore: 25,
      summary: 'Increases stormwater drainage load and risks erosion of embankment foundations due to stripped root structures.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'env_inf_neg_1',
          title: 'Soil Erosion & Embankment Weakening',
          description: 'Tree root systems stabilize slope soil; their removal triggers embankment soil slips and drains siltation.',
          severity: 'moderate',
          sourceAgent: 'infrastructure',
          provenance: 'simulation_estimate',
          entityAffected: 'Drainage & Road Embankments',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'env_inf_neg_1',
          title: 'Soil Erosion & Embankment Weakening',
          description: 'Removal of root systems triggers slope soil erosion and drains siltation.',
          severity: 'moderate',
          sourceAgent: 'infrastructure',
          provenance: 'simulation_estimate',
          entityAffected: 'Civil Drainage',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Soil Erosion Risk', value: 'Elevated Siltation', change: 'High Silt Load', trend: 'negative' },
      ],
    },
    transport: {
      domain: 'transport',
      domainName: 'Transit Environmental Buffer Agent',
      overallSeverity: 'low',
      score: 45,
      positiveScore: 30,
      summary: 'Heavy tree clearing and earth hauling causes localized transport disruption and dust clouds.',
      positiveFindings: [],
      negativeFindings: [],
      findings: [],
      metrics: [
        { label: 'Commute Dust Disruption', value: 'Moderate Corridor Impact', change: 'Temporary', trend: 'neutral' },
      ],
    },
    essential_services: {
      domain: 'essential_services',
      domainName: 'Municipal Environmental Sanitation Agent',
      overallSeverity: 'moderate',
      score: 60,
      positiveScore: 25,
      summary: 'Heavy debris disposal strains municipal solid waste dumping yards and municipal stormwater crews.',
      positiveFindings: [],
      negativeFindings: [],
      findings: [],
      metrics: [
        { label: 'Green Waste Disposal Strain', value: 'High Debris Volume', change: 'Managed', trend: 'neutral' },
      ],
    },
  };
}

function buildGeneralDestructiveAnalyses(
  description: string,
  policy: PolicyUnderstanding,
  location: string
): Record<AgentImpactDomain, AgentAnalysis> {
  return {
    population: {
      domain: 'population',
      domainName: 'Citizen Welfare & Impact Agent',
      overallSeverity: 'critical',
      score: 88,
      positiveScore: 15,
      summary: 'Destructive administrative intervention causes widespread community friction, loss of public assets, and citizen welfare distress.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'gen_pop_neg_1',
          title: 'Severe Public Disruption & Harm',
          description: 'The proposed destructive intervention damages established community routines and access without compensatory public benefits.',
          severity: 'critical',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: 'Impacted Citizens & Local Communities',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'gen_pop_neg_1',
          title: 'Severe Public Disruption & Harm',
          description: 'Damages established community routines without compensatory benefits.',
          severity: 'critical',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Community',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Citizen Impact Index', value: 'Severe Public Harm', change: 'High Friction', trend: 'negative' },
      ],
    },
    social: {
      domain: 'social',
      domainName: 'Civil Harmony & Citizen Support Agent',
      overallSeverity: 'critical',
      score: 90,
      positiveScore: 10,
      summary: 'High probability of organized citizen agitation, legal challenges, and strong public dissatisfaction.',
      positiveFindings: [],
      negativeFindings: [
        {
          id: 'gen_soc_neg_1',
          title: 'Public Backlash & Disapproval',
          description: 'Communities organize protests and file legal writ challenges opposing the destructive policy.',
          severity: 'critical',
          sourceAgent: 'social',
          provenance: 'simulation_estimate',
          entityAffected: 'Civil Stability',
          polarity: 'negative',
        },
      ],
      findings: [
        {
          id: 'gen_soc_neg_1',
          title: 'Public Backlash & Disapproval',
          description: 'Widespread citizen protest against the destructive proposal.',
          severity: 'critical',
          sourceAgent: 'social',
          provenance: 'simulation_estimate',
          entityAffected: 'Civil Stability',
          polarity: 'negative',
        },
      ],
      metrics: [
        { label: 'Public Sentiment', value: 'Strong Public Opposition', change: 'Negative', trend: 'negative' },
      ],
    },
    environmental: {
      domain: 'environmental',
      domainName: 'Environmental & Habitat Agent',
      overallSeverity: 'high',
      score: 82,
      positiveScore: 15,
      summary: 'Causes localized environmental degradation, dust/waste accumulation, and disruption of civic ecological balance.',
      positiveFindings: [],
      negativeFindings: [],
      findings: [],
      metrics: [
        { label: 'Ecological Stress', value: 'Elevated Risk', change: 'Degraded', trend: 'negative' },
      ],
    },
    economic: {
      domain: 'economic',
      domainName: 'Economic Stability Agent',
      overallSeverity: 'high',
      score: 80,
      positiveScore: 18,
      summary: 'Inflicts deadweight economic loss, business interruption, and destruction of productive civic capital.',
      positiveFindings: [],
      negativeFindings: [],
      findings: [],
      metrics: [
        { label: 'Economic Loss', value: 'High Asset Value Destroyed', change: 'Permanent Loss', trend: 'negative' },
      ],
    },
    policy_compliance: {
      domain: 'policy_compliance',
      domainName: 'Governance Integrity & Statutory Norms Agent',
      overallSeverity: 'high',
      score: 85,
      positiveScore: 12,
      summary: 'Conflicts with state public interest mandates and exposes administration to judicial review.',
      positiveFindings: [],
      negativeFindings: [],
      findings: [],
      metrics: [
        { label: 'Statutory Compliance', value: 'High Non-Compliance Exposure', change: 'Vulnerable', trend: 'negative' },
      ],
    },
    disaster_risk: {
      domain: 'disaster_risk',
      domainName: 'Public Safety Agent',
      overallSeverity: 'moderate',
      score: 70,
      positiveScore: 20,
      summary: 'Elevates emergency response friction and civil risk.',
      positiveFindings: [],
      negativeFindings: [],
      findings: [],
      metrics: [{ label: 'Safety Risk', value: 'Caution Advised', change: 'Caution', trend: 'negative' }],
    },
    infrastructure: {
      domain: 'infrastructure',
      domainName: 'Infrastructure Asset Protection Agent',
      overallSeverity: 'high',
      score: 78,
      positiveScore: 18,
      summary: 'Physical demolition or impairment of existing public and civic infrastructure.',
      positiveFindings: [],
      negativeFindings: [],
      findings: [],
      metrics: [{ label: 'Asset Loss Index', value: 'High Impairment', change: 'Damaged', trend: 'negative' }],
    },
    transport: {
      domain: 'transport',
      domainName: 'Mobility & Corridor Agent',
      overallSeverity: 'moderate',
      score: 62,
      positiveScore: 22,
      summary: 'Road blockades, detours, and transport slowdowns during execution.',
      positiveFindings: [],
      negativeFindings: [],
      findings: [],
      metrics: [{ label: 'Transit Delay', value: 'Localized Detours', change: 'Detour', trend: 'neutral' }],
    },
    essential_services: {
      domain: 'essential_services',
      domainName: 'Public Utilities Agent',
      overallSeverity: 'high',
      score: 75,
      positiveScore: 18,
      summary: 'Disruption of water, sanitation, or civic service delivery to affected areas.',
      positiveFindings: [],
      negativeFindings: [],
      findings: [],
      metrics: [{ label: 'Civic Utility Access', value: 'Interrupted', change: 'Negative', trend: 'negative' }],
    },
  };
}

function buildDisplacementCascadingGraph(
  description: string,
  policy: PolicyUnderstanding,
  location: string
): CascadingGraph {
  return {
    primaryChainSummary: 'Eviction Notice Issued to 500 Families → Mass Community Protests & Road Blockades → Severe Loss of Daily Wage Livelihoods → Fugitive Clinker Dust & Water Depletion → High Court Stay Orders & Project Suspension',
    nodes: [
      {
        id: 'node_1',
        label: 'Involuntary Eviction Order of 500 Families',
        description: `Revenue administration issues eviction and land resumption notices to 500 households in ${location}.`,
        cause: 'Administrative land acquisition order for private cement plant construction',
        effect: 'Immediate panic, residential insecurity, and grassroots citizen mobilization.',
        severity: 'critical',
        confidence: 98,
        department: 'Revenue & Disaster Management',
        type: 'decision',
        polarity: 'negative',
      },
      {
        id: 'node_2',
        label: 'Mass Community Protests & Road Blockades',
        description: 'Affected residents, trade unions, and local leaders stage indefinite road roko and dharna agitations.',
        cause: 'Absence of prior rehabilitation housing and livelihood security guarantees',
        effect: 'Disruption of regional arterial traffic and severe law and order strain.',
        severity: 'critical',
        confidence: 92,
        department: 'Police & District Administration',
        type: 'direct_effect',
        polarity: 'negative',
      },
      {
        id: 'node_3',
        label: 'Informal Household Livelihoods Severed',
        description: 'Displacement breaks established daily-wage livelihood routines for the affected families and disrupts schooling for children.',
        cause: 'Forced relocation away from established neighborhood employment hubs',
        effect: 'Acute economic distress and household vulnerability in the displaced colony.',
        severity: 'high',
        confidence: 89,
        department: 'Social Welfare & Nutritious Meal Programme',
        type: 'secondary_effect',
        polarity: 'negative',
      },
      {
        id: 'node_4',
        label: 'Fugitive Clinker Dust & Groundwater Depletion',
        description: 'Plant construction and heavy clinker grinding release fugitive dust and require heavy groundwater extraction.',
        cause: 'Red-Category heavy cement manufacturing within proximity of populated residential belts',
        effect: 'Chronic respiratory hazards and decline in surrounding groundwater well yields.',
        severity: 'high',
        confidence: 91,
        department: 'Tamil Nadu Pollution Control Board (TNPCB)',
        type: 'service_impact',
        polarity: 'negative',
      },
      {
        id: 'node_5',
        label: 'High Court Injunction & Project Frozen',
        description: 'Madras High Court grants interim stay on ground of non-compliance with RFCTLARR 2013 R&R rules.',
        cause: 'Public Interest Litigation (PIL) challenging involuntary eviction without rehabilitation',
        effect: 'Total freeze on plant construction, locking industrial capital in protracted administrative and judicial litigation.',
        severity: 'critical',
        confidence: 95,
        department: 'Law Department / Industries Department',
        type: 'critical_consequence',
        polarity: 'negative',
      },
    ],
    edges: [
      { id: 'edge_1_2', source: 'node_1', target: 'node_2', label: 'triggers mass protests' },
      { id: 'edge_2_3', source: 'node_2', target: 'node_3', label: 'causes economic severance' },
      { id: 'edge_3_4', source: 'node_3', target: 'node_4', label: 'compounds vulnerability' },
      { id: 'edge_4_5', source: 'node_4', target: 'node_5', label: 'leads to legal injunction' },
    ],
  };
}

function buildAgriculturalCascadingGraph(
  description: string,
  policy: PolicyUnderstanding,
  location: string
): CascadingGraph {
  return {
    primaryChainSummary: 'Destruction of Agricultural Land Proposed → Multi-Crop Topsoil Stripped & Irrigation Channels Severed → Rural Generational Livelihoods Wiped Out → Regional Food Crop Deficit & Price Inflation → Mass Peasant Agitations & High Court Stay Orders',
    nodes: [
      {
        id: 'node_1',
        label: 'Proposed Destruction of Agricultural Farmlands',
        description: `Administrative clearance proposed for the diversion and destruction of cultivable agricultural acreage in ${location}.`,
        cause: 'Administrative sanction diverting food-producing soil to non-agricultural use',
        effect: 'Immediate agrarian insecurity and mobilization of local farming communities.',
        severity: 'critical',
        confidence: 98,
        department: 'Agriculture and Farmers Welfare Department',
        type: 'decision',
        polarity: 'negative',
      },
      {
        id: 'node_2',
        label: 'Topsoil Stripped & Irrigation Channels Severed',
        description: 'Heavy earthmoving strips fertile humus topsoil and severs canal irrigation feeder channels across the basin.',
        cause: 'Site clearance and civil demolition works',
        effect: 'Irreversible loss of natural percolation sponge and soil microbial fertility.',
        severity: 'critical',
        confidence: 94,
        department: 'Water Resources / Public Works',
        type: 'direct_effect',
        polarity: 'negative',
      },
      {
        id: 'node_3',
        label: 'Agrarian Livelihoods & Farm Labor Terminated',
        description: 'Cultivating households, tenant farmers, and agricultural daily-wage laborers lose their ancestral livelihood source.',
        cause: 'Eradication of cultivable farm parcels',
        effect: 'Acute rural economic distress, indebtedness, and forced labor migration.',
        severity: 'critical',
        confidence: 95,
        department: 'Rural Development and Panchayat Raj',
        type: 'direct_effect',
        polarity: 'negative',
      },
      {
        id: 'node_4',
        label: 'Regional Food Supply Contraction & Price Surge',
        description: 'Loss of seasonal harvest yields contracts local food grain and vegetable supply to mandis, driving consumer inflation.',
        cause: 'Collapse in local food production',
        effect: 'Food price spikes and strain on public grain procurement reserves.',
        severity: 'high',
        confidence: 90,
        department: 'Food, Civil Supplies and Consumer Protection',
        type: 'secondary_effect',
        polarity: 'negative',
      },
      {
        id: 'node_5',
        label: 'Mass Peasant Protests & High Court Legal Injunction',
        description: 'Farmer associations launch highway blockades; Madras High Court grants interim stay under Farmland Conservation laws.',
        cause: 'Breach of statutory agrarian preservation covenants and widespread public outcry',
        effect: 'Complete administrative freeze on the proposal with judicial censure.',
        severity: 'critical',
        confidence: 96,
        department: 'Home (Police) / Law Department',
        type: 'critical_consequence',
        polarity: 'negative',
      },
    ],
    edges: [
      { id: 'ag_edge_1_2', source: 'node_1', target: 'node_2', label: 'causes physical destruction' },
      { id: 'ag_edge_2_3', source: 'node_2', target: 'node_3', label: 'destroys livelihoods' },
      { id: 'ag_edge_3_4', source: 'node_3', target: 'node_4', label: 'strains food markets' },
      { id: 'ag_edge_4_5', source: 'node_4', target: 'node_5', label: 'triggers mass civil & legal halt' },
    ],
  };
}

function buildEnvironmentalCascadingGraph(
  description: string,
  policy: PolicyUnderstanding,
  location: string
): CascadingGraph {
  return {
    primaryChainSummary: 'Deforestation & Ecological Demolition Clearance → Massive Tree Loss & Wetland Drainage Collapse → Critical Heat Island Spikes & Aquifer Depletion → Severe Public Respiratory Morbidity Surge → NGT Injunction Halts Project',
    nodes: [
      {
        id: 'node_1',
        label: 'Ecological & Green Canopy Demolition Clearance',
        description: `Clearance proposed causing felling of trees or destruction of wetland buffer in ${location}.`,
        cause: 'Administrative order authorizing destructive tree felling or wetland filling',
        effect: 'Immediate ecological trauma and citizen mobilization.',
        severity: 'critical',
        confidence: 97,
        department: 'Environment, Climate Change and Forests',
        type: 'decision',
        polarity: 'negative',
      },
      {
        id: 'node_2',
        label: 'Loss of Carbon Sink & Water Retention Buffer',
        description: 'Mature tree canopy felled and natural wetland basin filled, stripping the region of natural temperature and flood buffers.',
        cause: 'Demolition and vegetation clearing',
        effect: 'Sharp spike in surface runoff velocity and ambient summer temperatures.',
        severity: 'critical',
        confidence: 95,
        department: 'Forest Department',
        type: 'direct_effect',
        polarity: 'negative',
      },
      {
        id: 'node_3',
        label: 'Groundwater Depletion & Urban Heat Island Surge',
        description: 'Loss of natural canopy escalates localized thermal stress and reduces natural groundwater recharge.',
        cause: 'Removal of vegetative and hydrological cover',
        effect: 'Water stress and thermal distress across surrounding communities.',
        severity: 'high',
        confidence: 92,
        department: 'Water Resources Department',
        type: 'secondary_effect',
        polarity: 'negative',
      },
      {
        id: 'node_4',
        label: 'Citizen Health Crisis & Air Quality Deterioration',
        description: 'Ambient PM2.5 levels rise, driving hospital admissions for acute respiratory conditions.',
        cause: 'Loss of air filtration and localized dust emissions',
        effect: 'Elevated healthcare burden on surrounding taluks.',
        severity: 'high',
        confidence: 90,
        department: 'Health and Family Welfare',
        type: 'service_impact',
        polarity: 'negative',
      },
      {
        id: 'node_5',
        label: 'National Green Tribunal (NGT) Interim Injunction',
        description: 'NGT issues suo motu notice and halts execution for violation of statutory conservation laws.',
        cause: 'Gross non-compliance with environmental preservation standards',
        effect: 'Total operational stay and imposition of environmental remediation penalties.',
        severity: 'critical',
        confidence: 98,
        department: 'Law & Environment Department',
        type: 'critical_consequence',
        polarity: 'negative',
      },
    ],
    edges: [
      { id: 'env_edge_1_2', source: 'node_1', target: 'node_2', label: 'clears natural canopy' },
      { id: 'env_edge_2_3', source: 'node_2', target: 'node_3', label: 'amplifies climate stress' },
      { id: 'env_edge_3_4', source: 'node_3', target: 'node_4', label: 'harms citizen health' },
      { id: 'env_edge_4_5', source: 'node_4', target: 'node_5', label: 'leads to judicial shutdown' },
    ],
  };
}

function buildGeneralDestructiveCascadingGraph(
  description: string,
  policy: PolicyUnderstanding,
  location: string
): CascadingGraph {
  return {
    primaryChainSummary: 'Destructive Policy Order Issued → Physical Asset Impairment & Disruption → High Public Backlash & Civic Agitation → Administrative Litigation & Execution Suspension',
    nodes: [
      {
        id: 'node_1',
        label: 'Destructive Administrative Policy Order',
        description: `Order issued causing disruption or damage to public assets in ${location}.`,
        cause: 'Administrative executive order',
        effect: 'Immediate citizen friction and asset impairment.',
        severity: 'critical',
        confidence: 95,
        department: 'General Administration',
        type: 'decision',
        polarity: 'negative',
      },
      {
        id: 'node_2',
        label: 'Public Asset Impairment & Service Disruption',
        description: 'Physical disruption of existing community infrastructure and civic utility networks.',
        cause: 'Direct administrative intervention',
        effect: 'Widespread public hardship and daily routine disruption.',
        severity: 'high',
        confidence: 92,
        department: 'Public Works / Municipalities',
        type: 'direct_effect',
        polarity: 'negative',
      },
      {
        id: 'node_3',
        label: 'Organized Public Backlash & Citizen Protest',
        description: 'Communities mobilize and stage demonstrations demanding revocation of the destructive policy.',
        cause: 'Disproportionate harm without compensatory welfare',
        effect: 'Law and order friction and political fallout.',
        severity: 'critical',
        confidence: 94,
        department: 'Home (Police)',
        type: 'critical_consequence',
        polarity: 'negative',
      },
      {
        id: 'node_4',
        label: 'Judicial Challenge & Policy Freeze',
        description: 'High Court stays policy implementation pending fundamental rights and administrative review.',
        cause: 'Legal challenge on grounds of arbitrary administrative action',
        effect: 'Project frozen with instructions to restructure or withdraw.',
        severity: 'critical',
        confidence: 96,
        department: 'Law Department',
        type: 'critical_consequence',
        polarity: 'negative',
      },
    ],
    edges: [
      { id: 'gen_edge_1_2', source: 'node_1', target: 'node_2', label: 'impairs public assets' },
      { id: 'gen_edge_2_3', source: 'node_2', target: 'node_3', label: 'triggers civic outcry' },
      { id: 'gen_edge_3_4', source: 'node_3', target: 'node_4', label: 'forces judicial halt' },
    ],
  };
}

// ------------------------------------------------------------------------------------------------
// Cascading Graph Builder with Dual-Aspect (Positive Catalytic Nodes + Managed Risk Nodes)
// ------------------------------------------------------------------------------------------------

function buildIndustrialCascadingGraph(
  description: string,
  policy: PolicyUnderstanding,
  location: string
): CascadingGraph {
  return {
    primaryChainSummary: 'Administrative Proposal Submitted → Statutory Regulatory Scrutiny (TNPCB CTE & Water Audit) → Potential Industrial Activity & Employment → Municipal Utility & Infrastructure Load → Precautionary Compliance & Long-Term Monitoring',
    nodes: [
      {
        id: 'node_1',
        label: 'Administrative Proposal Submitted',
        description: `Proposal received to establish industrial/manufacturing facility: "${description}".`,
        cause: `Industrial enterprise application for setting up facility in ${location}`,
        effect: 'Triggers statutory due diligence, site inspection, and inter-agency review.',
        severity: 'low',
        confidence: 95,
        department: policy.department,
        type: 'decision',
        polarity: 'neutral',
      },
      {
        id: 'node_2',
        label: 'Statutory Regulatory & Environmental Scrutiny',
        description: 'Evaluation by State Pollution Control Board (TNPCB CTE), water resources authorities, and local planning bodies.',
        cause: 'Statutory compliance requirements under Air & Water Acts and siting regulations',
        effect: 'Scrutiny of effluent discharge protocols, Zero Liquid Discharge (ZLD) feasibility, and emissions.',
        severity: 'moderate',
        confidence: 92,
        department: 'Environment & Climate Change / TNPCB',
        type: 'direct_effect',
        polarity: 'neutral',
      },
      {
        id: 'node_3',
        label: 'Potential Industrial Activity & Employment',
        description: 'Potential generation of localized industrial employment, supply chain demand, and commercial activity (exact numbers unstated in proposal).',
        cause: 'Potential capital investment in plant machinery and operations',
        effect: 'Potential economic activity subject to operational commissioning.',
        severity: 'low',
        confidence: 85,
        department: 'Industries, Investment Promotion and Commerce',
        type: 'secondary_effect',
        polarity: 'positive',
      },
      {
        id: 'node_4',
        label: 'Municipal Utility & Infrastructure Load',
        description: 'Demand on local power grid, groundwater/piped water supply, and freight road corridors.',
        cause: 'Industrial utility consumption and transport of raw materials and finished goods',
        effect: 'Possible increased traffic on connecting arterial roads and water consumption in the basin.',
        severity: 'moderate',
        confidence: 88,
        department: 'Highways and Minor Ports / TANGEDCO',
        type: 'direct_effect',
        polarity: 'negative',
      },
      {
        id: 'node_5',
        label: 'Precautionary Compliance & Long-Term Monitoring',
        description: 'Continuous environmental monitoring for trade effluent, solid waste management, and workplace safety standards.',
        cause: 'Industrial operational requirements and environmental norms',
        effect: 'Ensures operations remain strictly within permissible discharge limits without degrading regional ecology.',
        severity: 'moderate',
        confidence: 90,
        department: 'Tamil Nadu Pollution Control Board (TNPCB)',
        type: 'critical_consequence',
        polarity: 'neutral',
      },
    ],
    edges: [
      { id: 'ind_e1_2', source: 'node_1', target: 'node_2', label: 'Triggers Statutory Scrutiny' },
      { id: 'ind_e2_3', source: 'node_2', target: 'node_3', label: 'Conditions Potential Economic Activity' },
      { id: 'ind_e1_4', source: 'node_1', target: 'node_4', label: 'Places Load on Civic Utilities' },
      { id: 'ind_e4_5', source: 'node_4', target: 'node_5', label: 'Requires Strict Compliance Monitoring' },
    ],
  };
}

function buildArchetypeCascadingGraph(
  archetype: PolicyArchetype,
  description: string,
  policy: PolicyUnderstanding,
  location: string
): CascadingGraph {
  if (archetype === 'agricultural_destruction_hazard') {
    return buildAgriculturalCascadingGraph(description, policy, location);
  }
  if (archetype === 'environmental_destruction_loss') {
    return buildEnvironmentalCascadingGraph(description, policy, location);
  }
  if (archetype === 'general_destructive_harm') {
    return buildGeneralDestructiveCascadingGraph(description, policy, location);
  }
  if (archetype === 'displacement_relocation_industrial' || archetype === 'forced_eviction_resettlement' || archetype === 'polluting_industry_hazard') {
    return buildDisplacementCascadingGraph(description, policy, location);
  }
  if (
    archetype === 'industrial_zone' ||
    /(factory|textile|manufacturing|industrial|refinery|chemical|cement|smelter|tannery|processing plant|workshop)/i.test(description)
  ) {
    return buildIndustrialCascadingGraph(description, policy, location);
  }
  if (archetype === 'healthcare_hospital') {
    return {
      primaryChainSummary: 'Hospital Sanctioned → Specialty ICU Beds Built → Accelerated Emergency Medical Care Access → Healthcare Sector Employment & Ancillary Commerce → Expanded Lifesaving Healthcare Access',
      nodes: [
        {
          id: 'node_1',
          label: 'Multi-Specialty Hospital Sanctioned',
          description: `Government of Tamil Nadu sanctions administrative and budgetary approval for multi-specialty medical complex in ${location}.`,
          cause: 'Executive policy approval to expand public tertiary healthcare',
          effect: 'Initiates site mobilization, architectural planning, and capital outlay allocation.',
          severity: 'very_low',
          confidence: 96,
          department: 'Health & Family Welfare Department',
          type: 'decision',
          polarity: 'positive',
        },
        {
          id: 'node_2',
          label: 'Specialty & ICU Clinical Beds Commissioned',
          description: 'Trauma care, cardiac catheterization, oncology, and neonatal wings constructed.',
          cause: 'Completion of civil clinical blocks and specialized medical equipment procurement',
          effect: 'Expands regional tertiary bed capacity, reducing emergency referral transfers.',
          severity: 'very_low',
          confidence: 94,
          department: 'Public Works (Medical Wing)',
          type: 'direct_effect',
          polarity: 'positive',
        },
        {
          id: 'node_3',
          label: 'Regional Emergency Medical Access Accelerated',
          description: 'Dedicated emergency express bay and green corridor ensure critical accident and acute patients receive immediate clinical admission.',
          cause: 'Proximity of specialty trauma personnel and synchronized traffic signal priority',
          effect: 'Substantially reduces transit-to-treatment time for critical emergency patients.',
          severity: 'very_low',
          confidence: 92,
          department: 'Emergency Health Response (108)',
          type: 'service_impact',
          polarity: 'positive',
        },
        {
          id: 'node_4',
          label: 'Clinical & Ancillary Healthcare Employment Generated',
          description: 'Employs clinical medical staff, nurses, and technicians, supporting local pharmacy, diagnostic, and allied services.',
          cause: 'Operational staffing and regional medical service requirements',
          effect: 'Expands localized healthcare employment and clinical care capacity.',
          severity: 'very_low',
          confidence: 90,
          department: 'Labor & Employment Department',
          type: 'secondary_effect',
          polarity: 'positive',
        },
        {
          id: 'node_5',
          label: 'Critical Clinical Care Access Expanded',
          description: 'Timely surgical interventions and subsidized care under CMCHIS expand access to advanced tertiary treatment.',
          cause: 'Advanced clinical access established within reach of regional citizens',
          effect: 'Substantial public health benefit; regional critical care accessibility upgraded.',
          severity: 'very_low',
          confidence: 95,
          department: 'Directorate of Medical Services',
          type: 'critical_consequence',
          polarity: 'positive',
        },
        {
          id: 'node_6',
          label: 'Construction Phase Heavy Ingress (Managed Risk)',
          description: 'Concrete haulers and earthmoving vehicles operate during site preparation.',
          cause: 'Heavy structural civil works mobilization',
          effect: 'Temporary daytime junction slowdowns managed via scheduled logistics windows.',
          severity: 'moderate',
          confidence: 86,
          department: 'Traffic Police & Highways',
          type: 'direct_effect',
          polarity: 'negative',
        },
        {
          id: 'node_7',
          label: 'Bio-Medical Waste Plant Safeguard',
          description: 'Automated on-site effluent and hazardous waste treatment facility installed.',
          cause: 'Strict Tamil Nadu Pollution Control Board statutory environmental mandate',
          effect: 'Zero contamination of municipal stormwater lines and groundwater aquifers.',
          severity: 'low',
          confidence: 89,
          department: 'Environment & Climate Change',
          type: 'secondary_effect',
          polarity: 'neutral',
        },
      ],
      edges: [
        { id: 'e1_2', source: 'node_1', target: 'node_2', label: 'Enables Bed Capacity Expansion' },
        { id: 'e2_3', source: 'node_2', target: 'node_3', label: 'Accelerates Emergency Care Access' },
        { id: 'e2_4', source: 'node_2', target: 'node_4', label: 'Generates Employment & Ancillary Commerce' },
        { id: 'e3_5', source: 'node_3', target: 'node_5', label: 'Expands Advanced Clinical Care' },
        { id: 'e1_6', source: 'node_1', target: 'node_6', label: 'Temporary Construction Logistics' },
        { id: 'e2_7', source: 'node_2', target: 'node_7', label: 'Enforces Waste Protocols' },
      ],
    };
  }

  // Standard generic cascading graph with objective administrative execution
  return {
    primaryChainSummary: 'Administrative Proposal Submitted → Inter-Agency Statutory Scrutiny → Potential Operational Outcomes → Municipal Resource Allocation → Precautionary Monitoring & Review',
    nodes: [
      {
        id: 'node_1',
        label: 'Administrative Decision Submitted',
        description: `Official administrative proposal under review for: "${description}".`,
        cause: 'Administrative policy initiative under departmental evaluation',
        effect: 'Initiates inter-agency review and administrative assessment.',
        severity: 'very_low',
        confidence: 94,
        department: policy.department,
        type: 'decision',
        polarity: 'neutral',
      },
      {
        id: 'node_2',
        label: 'Inter-Agency Statutory Scrutiny',
        description: 'Cross-departmental examination of statutory clearances, site suitability, and civic alignment.',
        cause: 'Administrative procedural diligence',
        effect: 'Identifies regulatory requirements, environmental conditions, and municipal feasibility.',
        severity: 'very_low',
        confidence: 91,
        department: 'Public Works & Planning',
        type: 'direct_effect',
        polarity: 'neutral',
      },
      {
        id: 'node_3',
        label: 'Potential Operational Outcomes',
        description: 'Potential civic or administrative service delivery outcomes if proposal is implemented according to specifications.',
        cause: 'Execution of proposed administrative measures',
        effect: 'Potential localized benefits subject to field verification and execution capacity.',
        severity: 'very_low',
        confidence: 89,
        department: 'Finance & Planning Department',
        type: 'secondary_effect',
        polarity: 'positive',
      },
      {
        id: 'node_4',
        label: 'Municipal Resource Allocation',
        description: 'Allocation of departmental personnel, administrative oversight, and municipal resources.',
        cause: 'Operational implementation demands',
        effect: 'Directs administrative and logistical resources toward project coordination.',
        severity: 'very_low',
        confidence: 93,
        department: 'District Administration',
        type: 'direct_effect',
        polarity: 'neutral',
      },
      {
        id: 'node_5',
        label: 'Administrative Monitoring & Review',
        description: 'Periodic administrative audits to verify policy adherence and mitigate unintended externalities.',
        cause: 'Good governance and oversight standards',
        effect: 'Ensures public accountability and statutory compliance throughout implementation.',
        severity: 'moderate',
        confidence: 85,
        department: 'Transport & Police Department',
        type: 'critical_consequence',
        polarity: 'neutral',
      },
    ],
    edges: [
      { id: 'e1_2', source: 'node_1', target: 'node_2', label: 'Triggers Inter-Agency Scrutiny' },
      { id: 'e2_3', source: 'node_2', target: 'node_3', label: 'Conditions Potential Outcomes' },
      { id: 'e1_4', source: 'node_1', target: 'node_4', label: 'Allocates Municipal Resources' },
      { id: 'e4_5', source: 'node_4', target: 'node_5', label: 'Enforces Administrative Review' },
    ],
  };
}

function buildDisplacementAlternatives(
  description: string,
  policy: PolicyUnderstanding
): AlternativeStrategy[] {
  return [
    {
      id: 'opt_original',
      title: 'Original Proposal: Direct Eviction of 500 Families at Proposed Site',
      optionType: 'Involuntary Human Displacement',
      description: 'Issue immediate land resumption notices and clear 500 settled households to construct the private cement manufacturing plant.',
      advantages: [
        'Allows direct utilization of the investor-requested land parcel',
      ],
      disadvantages: [
        'Critical demographic displacement of 500 settled households',
        'Severe public protests, road blockades, and high litigation stay probability under RFCTLARR Act 2013',
        'Fugitive clinker dust emissions adjacent to agricultural and populated villages',
        'Sudden destruction of daily-wage livelihoods and child schooling disruption',
      ],
      mitigations: [
        'Provide ex-gratia cash payouts to recognized legal patta holders',
        'Erect temporary transit encampments during demolition',
      ],
      scores: { transport: 45, economy: 55, environment: 18, safety: 25, population: 12, overall: 86 },
      cost: '₹ High (Massive R&R Litigation Overheads)',
      implementationDifficulty: 'Extreme',
      overallRisk: 'critical',
      recommendationStatus: 'Baseline / Proposed',
    },
    {
      id: 'opt_alt_a',
      title: 'Alternative A: Relocate Factory to Uninhabited SIPCOT Industrial Park (RECOMMENDED)',
      optionType: 'Zero Human Displacement Strategy',
      description: 'Situates the proposed cement manufacturing facility within an already gazetted, uninhabited SIPCOT/TIDCO industrial park with pre-installed industrial effluent channels, industrial grid connection, and zero residential displacement.',
      advantages: [
        'Zero families displaced — preservation of community homes, social networks, and livelihoods',
        'Eliminates public resistance, police action risks, and High Court stay injunctions',
        'Pre-zoned industrial sector with statutory environmental buffers and heavy truck logistics links',
        'Accelerates factory civil commissioning by bypassing land acquisition delays',
      ],
      disadvantages: [
        'Requires project sponsor to purchase industrial plots within the SIPCOT cluster',
      ],
      mitigations: [
        'Fast-track single-window clearance by Guidance Tamil Nadu for priority plot allotment',
        'Mandate state-of-the-art baghouse fabric filters for all kiln stacks',
      ],
      scores: { transport: 85, economy: 88, environment: 78, safety: 90, population: 96, overall: 26 },
      cost: '₹ Budget Neutral (Avoids heavy R&R compensation outlays)',
      implementationDifficulty: 'Low',
      overallRisk: 'very_low',
      recommendationStatus: 'Recommended',
    },
    {
      id: 'opt_alt_b',
      title: 'Alternative B: In-Situ Pucca Resettlement Colony Handed Over Prior to Possession',
      optionType: 'Prior Comprehensive Rehabilitation',
      description: 'Construct a modern rehabilitation colony with statutory civic amenities in close proximity before issuing any site possession notices for factory works.',
      advantages: [
        'Guarantees pucca permanent title deeds for 500 families',
        'Satisfies statutory RFCTLARR Section 38 requirements prior to eviction',
      ],
      disadvantages: [
        'Delays factory construction significantly for colony construction',
        'High upfront government treasury capital outlay for housing',
        'Cement dust pollution still poses health risks once plant is operational',
      ],
      mitigations: [
        'Establish designated green buffer zone between new colony and cement kiln',
        'Provide statutory employment or livelihood assistance under state quota',
      ],
      scores: { transport: 65, economy: 70, environment: 45, safety: 65, population: 60, overall: 52 },
      cost: '₹ Baseline + ₹48 Crores (Housing Capex)',
      implementationDifficulty: 'High',
      overallRisk: 'moderate',
      recommendationStatus: 'Secondary Option',
    },
    {
      id: 'opt_alt_c',
      title: 'Alternative C: Convert Proposed Site into Clean Agro-Logistics Park with Zero Evictions',
      optionType: 'Eco-Industrial Repurposing',
      description: 'Repurpose the site for a non-polluting cold storage, food processing, and rural warehouse hub that integrates local residents into employment without evictions.',
      advantages: [
        'Zero displacement of 500 households',
        'Green-Category non-polluting commercial development',
        'Provides 420 clean local warehousing and packing jobs for residents',
      ],
      disadvantages: [
        'Does not fulfill heavy cement manufacturing target for the private sponsor',
      ],
      mitigations: [
        'Offer cement sponsor alternative land parcel in arid mineral corridor',
      ],
      scores: { transport: 82, economy: 80, environment: 85, safety: 88, population: 92, overall: 32 },
      cost: '₹ Moderate',
      implementationDifficulty: 'Moderate',
      overallRisk: 'low',
      recommendationStatus: 'Contingency',
    },
  ];
}

function buildAgriculturalAlternatives(
  description: string,
  policy: PolicyUnderstanding
): AlternativeStrategy[] {
  return [
    {
      id: 'opt_original',
      title: 'Original Proposal: Unrestricted Diversion & Destruction of Agricultural Lands',
      optionType: 'Direct Agrarian Conversion',
      description: 'Proceeds with conversion and demolition of multi-crop agricultural parcels without farmland preservation buffers.',
      advantages: [
        'Immediate site access for commercial or non-agricultural developer',
      ],
      disadvantages: [
        'Permanent, irreversible destruction of fertile agricultural soil',
        'Direct livelihood termination for farming families and tenant cultivators',
        'Contraction of regional food crop production, risking local market inflation',
        'Severe legal exposure to High Court stay petitions and mass peasant blockades',
      ],
      mitigations: [
        'Offer one-time cash compensation at statutory guideline values',
      ],
      scores: { transport: 40, economy: 38, environment: 12, safety: 25, population: 10, overall: 88 },
      cost: '₹ High (Compensation & Crop Loss Overheads)',
      implementationDifficulty: 'Extreme',
      overallRisk: 'critical',
      recommendationStatus: 'Baseline / Proposed',
    },
    {
      id: 'opt_alt_a',
      title: 'Alternative A: 100% Farmland Protection — Divert to Non-Cultivable Arid Corridor (RECOMMENDED)',
      optionType: 'Zero-Farmland Loss Strategy',
      description: 'Preserves 100% of fertile cultivable soils and diverts non-agricultural requirements to already notified, uncultivable arid wastelands or designated SIPCOT industrial clusters.',
      advantages: [
        '100% preservation of multi-crop agricultural acreage and generational farming livelihoods',
        'Zero agrarian distress or farmer agitations; eliminates High Court litigation halts',
        'Maintains regional food security, grain yields, and local farmer mandi supply networks',
        'Accelerates project commissioning by avoiding protracted land acquisition disputes',
      ],
      disadvantages: [
        'May require project sponsor to acquire plots within designated government industrial estates',
      ],
      mitigations: [
        'Provide single-window clearance for priority plot allotment in notified wastelands',
      ],
      scores: { transport: 85, economy: 88, environment: 92, safety: 94, population: 96, overall: 22 },
      cost: '₹ Budget Neutral (Avoids ₹85Cr agricultural litigation and crop compensations)',
      implementationDifficulty: 'Low',
      overallRisk: 'very_low',
      recommendationStatus: 'Recommended',
    },
    {
      id: 'opt_alt_b',
      title: 'Alternative B: Strict Agro-Conservation Buffer with 85% Farmland Retention',
      optionType: 'Partial Buffer Preservation',
      description: 'Mandates 85% retention of multi-crop lands and restricts intervention strictly to barren boundary fringes with permanent agro-ecological shielding.',
      advantages: [
        'Retains bulk of core food-producing agricultural land',
        'Reduces farmer displacement to under 15% of initial footprint',
      ],
      disadvantages: [
        'Substantially limits project expansion and leaves adjacent farms vulnerable to dust',
        'Still meets partial resistance from affected edge landholders',
      ],
      mitigations: [
        'Erect mandatory 50m green acoustic and dust barrier along agricultural boundary',
      ],
      scores: { transport: 65, economy: 68, environment: 58, safety: 65, population: 60, overall: 50 },
      cost: '₹ Moderate',
      implementationDifficulty: 'Moderate',
      overallRisk: 'moderate',
      recommendationStatus: 'Secondary Option',
    },
    {
      id: 'opt_alt_c',
      title: 'Alternative C: Integrated Agro-Tech & Cold-Storage Modernization Scheme',
      optionType: 'Agrarian Value Enhancement',
      description: 'Repurposes policy outlay to establish subsidized modern solar drip irrigation, cold storage warehouses, and Farmer Producer Organizations (FPOs) on the agricultural land.',
      advantages: [
        'Transforms agricultural land into a high-value, high-yield agrarian economic hub',
        'Directly elevates rural household incomes by +35% without destroying any soil',
        '100% community support and enthusiastic farmer participation',
      ],
      disadvantages: [
        'Does not serve non-agricultural commercial or industrial sponsor objectives',
      ],
      mitigations: [
        'Partner with NABARD and state agriculture department for co-financing',
      ],
      scores: { transport: 80, economy: 92, environment: 94, safety: 90, population: 95, overall: 16 },
      cost: '₹ Subsidized Public Investment',
      implementationDifficulty: 'Low',
      overallRisk: 'very_low',
      recommendationStatus: 'Contingency',
    },
  ];
}

function buildEnvironmentalAlternatives(
  description: string,
  policy: PolicyUnderstanding
): AlternativeStrategy[] {
  return [
    {
      id: 'opt_original',
      title: 'Original Proposal: Direct Deforestation / Natural Resource Depletion',
      optionType: 'Environmental Clearance Overreach',
      description: 'Clearance of mature trees, green canopy, or natural wetland buffers.',
      advantages: ['Clears land rapidly for civil works'],
      disadvantages: [
        'Permanent loss of regional carbon sinks and micro-climatic cooling',
        'Severe NGT litigation stay and statutory environmental penalty risk',
      ],
      mitigations: ['Standard token sapling plantation'],
      scores: { transport: 50, economy: 55, environment: 10, safety: 35, population: 20, overall: 88 },
      cost: '₹ High Ecological Liability',
      implementationDifficulty: 'High',
      overallRisk: 'critical',
      recommendationStatus: 'Baseline / Proposed',
    },
    {
      id: 'opt_alt_a',
      title: 'Alternative A: Complete Ecological Protection & Brownfield Redevelopment (RECOMMENDED)',
      optionType: 'Zero-Ecological Loss Strategy',
      description: 'Preserves 100% of mature green canopy and wetlands, relocating development to pre-existing degraded brownfield sites.',
      advantages: [
        'Zero tree felling and 100% wetland buffer preservation',
        'Full compliance with Forest Conservation Act and NGT guidelines',
      ],
      disadvantages: ['Requires brownfield site preparation'],
      mitigations: ['Accelerated administrative clearances for brownfield plot'],
      scores: { transport: 82, economy: 85, environment: 94, safety: 90, population: 92, overall: 20 },
      cost: '₹ Sustainable',
      implementationDifficulty: 'Low',
      overallRisk: 'very_low',
      recommendationStatus: 'Recommended',
    },
  ];
}

function buildGeneralDestructiveAlternatives(
  description: string,
  policy: PolicyUnderstanding
): AlternativeStrategy[] {
  return [
    {
      id: 'opt_original',
      title: 'Original Proposal: Destructive Administrative Action',
      optionType: 'Direct Intervention',
      description: 'Executes destructive intervention without compensatory citizen safeguards.',
      advantages: ['Direct administrative implementation'],
      disadvantages: ['Severe citizen backlash, asset loss, and legal stay exposure'],
      mitigations: ['Post-facto compensation'],
      scores: { transport: 45, economy: 40, environment: 30, safety: 35, population: 15, overall: 85 },
      cost: '₹ High',
      implementationDifficulty: 'Extreme',
      overallRisk: 'critical',
      recommendationStatus: 'Baseline / Proposed',
    },
    {
      id: 'opt_alt_a',
      title: 'Alternative A: Restructured Non-Destructive Public Welfare Compact (RECOMMENDED)',
      optionType: 'Constructive Restructuring',
      description: 'Replaces destructive actions with phased modernization and preservation of existing community assets.',
      advantages: ['Preserves community assets, eliminates public friction, delivers positive value'],
      disadvantages: ['Requires inter-departmental plan revisions'],
      mitigations: ['Convene stakeholder review within 14 days'],
      scores: { transport: 80, economy: 82, environment: 85, safety: 88, population: 90, overall: 24 },
      cost: '₹ Budget Neutral',
      implementationDifficulty: 'Low',
      overallRisk: 'very_low',
      recommendationStatus: 'Recommended',
    },
  ];
}

// ------------------------------------------------------------------------------------------------
// What-If Alternatives Builder
// ------------------------------------------------------------------------------------------------

function buildArchetypeAlternatives(
  archetype: PolicyArchetype,
  description: string,
  policy: PolicyUnderstanding
): AlternativeStrategy[] {
  if (archetype === 'agricultural_destruction_hazard') {
    return buildAgriculturalAlternatives(description, policy);
  }
  if (archetype === 'environmental_destruction_loss') {
    return buildEnvironmentalAlternatives(description, policy);
  }
  if (archetype === 'general_destructive_harm') {
    return buildGeneralDestructiveAlternatives(description, policy);
  }
  if (archetype === 'displacement_relocation_industrial' || archetype === 'forced_eviction_resettlement' || archetype === 'polluting_industry_hazard') {
    return buildDisplacementAlternatives(description, policy);
  }
  if (archetype === 'healthcare_hospital') {
    return [
      {
        id: 'opt_original',
        title: 'Original Proposal: Single-Stage Full Commissioning',
        optionType: 'Simultaneous Civil Execution',
        description: 'Construct and commission all inpatient towers, super-specialty wings, and outpatient facilities simultaneously.',
        advantages: [
          'Unified project delivery timeline with single contractor mobilization',
          'Immediate full 500-bed capacity upon project handover',
          'Standard centralized civil engineering protocol',
        ],
        disadvantages: [
          'Concentrated heavy vehicle logistics during excavation and structural framing',
          'Higher initial lump-sum treasury cash-flow requirement',
        ],
        mitigations: [
          'Enforce strict night-only concrete mixer delivery windows (21:00 - 06:00)',
          'Deploy dedicated traffic wardens at all perimeter entry gates',
        ],
        cost: '₹145 Cr (Lump-Sum Standard)',
        implementationDifficulty: 'Moderate',
        overallRisk: 'low',
        recommendationStatus: 'Baseline / Proposed',
        scores: { transport: 68, economy: 82, environment: 74, safety: 88, population: 90, overall: 80 },
      },
      {
        id: 'opt_a',
        title: 'Alternative A: Phased Modular Rollout (Emergency & OPD First)',
        optionType: 'Phased Modular Delivery (AI Recommended)',
        description: 'Fast-track Emergency Trauma Wing, Diagnostic Labs, and Outpatient Clinic in Phase 1 (12 Months), followed by Multi-Story Inpatient ICU Towers in Phase 2.',
        advantages: [
          'Delivers critical lifesaving trauma care 10 months earlier to the public',
          'Smooths traffic and civil footprint across staggered operational phases',
          'Generates early clinical operational revenue and user feedback',
        ],
        disadvantages: [
          'Requires acoustic separation between Phase 1 clinical operations and Phase 2 civil work',
        ],
        mitigations: [
          'Install high-performance acoustic and dust barrier walls between hospital wings',
          'Establish separate dedicated medical ingress vs contractor logistics routes',
        ],
        cost: '₹152 Cr (+5% Modular Phasing)',
        implementationDifficulty: 'Low',
        overallRisk: 'very_low',
        recommendationStatus: 'Recommended',
        scores: { transport: 88, economy: 90, environment: 84, safety: 96, population: 96, overall: 92 },
      },
      {
        id: 'opt_b',
        title: 'Alternative B: Integrated Eco-Hospital & Dual Arterial Access',
        optionType: 'Green Building & Traffic Bypass Integration',
        description: 'Integrate a 500kW rooftop solar plant, full bio-waste recycling, and a new 4-lane bypass connector linking directly to the district highway.',
        advantages: [
          'Zero traffic interference on existing residential and commercial streets',
          'Lowest long-term operational utility bills and carbon footprint',
          'Creates a dedicated arterial corridor for future regional expansion',
        ],
        disadvantages: [
          '+18% capital expenditure for highway link and solar microgrid installation',
          'Additional 90 days required for highway feeder land acquisition',
        ],
        mitigations: [
          'Fast-track land acquisition via direct consent negotiation',
          'Utilize central green energy subsidies to offset solar capital costs',
        ],
        cost: '₹172 Cr (+18% Capital Outlay)',
        implementationDifficulty: 'Moderate',
        overallRisk: 'low',
        recommendationStatus: 'Secondary Option',
        scores: { transport: 94, economy: 88, environment: 96, safety: 94, population: 92, overall: 91 },
      },
      {
        id: 'opt_c',
        title: 'Alternative C: Satellite Clinic Hub & Spoke Model',
        optionType: 'Distributed Medical Network',
        description: 'Establish a 350-bed central surgical hospital coupled with 3 peripheral 50-bed emergency primary triage centers in surrounding taluks.',
        advantages: [
          'Distributes emergency medical care directly into rural peripheral zones',
          'Minimizes localized traffic and municipal utility burden at any single site',
        ],
        disadvantages: [
          'Higher decentralized administrative and doctor staffing complexity',
          'Dilutes super-specialty surgical concentrations',
        ],
        mitigations: [
          'Implement unified telemedicine and centralized ambulance dispatch software',
        ],
        cost: '₹160 Cr (+10% Multi-site)',
        implementationDifficulty: 'High',
        overallRisk: 'moderate',
        recommendationStatus: 'Contingency',
        scores: { transport: 82, economy: 80, environment: 80, safety: 86, population: 88, overall: 83 },
      },
    ];
  }

  // Standard administrative alternatives with balanced trade-offs
  return [
    {
      id: 'opt_original',
      title: 'Original Proposal: Direct Implementation',
      optionType: 'Direct Execution',
      description: 'Execute the administrative proposal directly as submitted without supplementary multi-sector conditions.',
      advantages: [
        'Adheres directly to proponent timeline and planned execution cycle',
        'Direct administrative allocation under single departmental authority',
      ],
      disadvantages: [
        'Exposes the administration to unmitigated externalities in unevidenced sectors',
        'Lacks structured inter-departmental oversight and community grievance mechanisms',
      ],
      mitigations: [
        'Enforce standard municipal monitoring and mandatory field compliance audits',
      ],
      cost: '₹ Baseline Estimate',
      implementationDifficulty: 'Moderate',
      overallRisk: 'moderate',
      recommendationStatus: 'Baseline / Proposed',
      scores: { transport: 50, economy: 55, environment: 50, safety: 50, population: 50, overall: 51 },
    },
    {
      id: 'opt_a',
      title: 'Alternative A: Phased Implementation with Field Verification (Recommended)',
      optionType: 'Phased & Verified Execution',
      description: 'Implement the proposal in structured phases with rigorous field validation at each milestone before funding subsequent tranches.',
      advantages: [
        'Validates multi-sector impacts (environmental, social, economic) before full resource commitment',
        'Establishes early citizen feedback and grievance redressal channels',
      ],
      disadvantages: [
        'Requires additional inter-departmental reporting and review intervals (~10-15% duration increase)',
      ],
      mitigations: [
        'Establish a dedicated multi-agency monitoring committee with defined service-level agreements',
      ],
      cost: '₹ Baseline + 3%',
      implementationDifficulty: 'Moderate',
      overallRisk: 'low',
      recommendationStatus: 'Recommended',
      scores: { transport: 60, economy: 62, environment: 60, safety: 65, population: 65, overall: 62 },
    },
    {
      id: 'opt_b',
      title: 'Alternative B: Precautionary Safeguard Model',
      optionType: 'Risk-Mitigated Framework',
      description: 'Impose strict environmental, social, and legal conditions prior to issuing final operational sanctions.',
      advantages: [
        'Maximizes protection against legal challenges and unanticipated public externalities',
        'Enforces full statutory transparency and stakeholder consultation',
      ],
      disadvantages: [
        'Higher upfront regulatory compliance and impact assessment costs',
      ],
      mitigations: [
        'Standardize third-party audit protocols to prevent bureaucratic delays',
      ],
      cost: '₹ Baseline + 6%',
      implementationDifficulty: 'Moderate',
      overallRisk: 'very_low',
      recommendationStatus: 'Secondary Option',
      scores: { transport: 55, economy: 58, environment: 65, safety: 68, population: 62, overall: 62 },
    },
    {
      id: 'opt_c',
      title: 'Alternative C: Multi-Site Distributed Option',
      optionType: 'Decentralized Allocation',
      description: 'Decentralize project scope across multiple designated municipal zones to mitigate localized concentration risks.',
      advantages: [
        'Reduces single-point environmental and municipal infrastructure strain',
        'Distributes public access across a wider demographic radius',
      ],
      disadvantages: [
        'Requires multi-site logistical coordination and higher administrative overhead',
      ],
      mitigations: [
        'Deploy centralized digital tracking across all operational nodes',
      ],
      cost: '₹ Baseline + 8%',
      implementationDifficulty: 'High',
      overallRisk: 'moderate',
      recommendationStatus: 'Contingency',
      scores: { transport: 58, economy: 56, environment: 58, safety: 60, population: 60, overall: 58 },
    },
  ];
}

// ------------------------------------------------------------------------------------------------
// Explainable Recommendation Builder
// ------------------------------------------------------------------------------------------------

function buildArchetypeRecommendation(
  archetype: PolicyArchetype,
  description: string,
  policy: PolicyUnderstanding,
  recommendedOption: AlternativeStrategy
): DecisionRecommendation {
  if (archetype === 'agricultural_destruction_hazard') {
    return buildAgriculturalRecommendation(description, policy, recommendedOption);
  }
  if (archetype === 'environmental_destruction_loss') {
    return buildEnvironmentalRecommendation(description, policy, recommendedOption);
  }
  if (archetype === 'general_destructive_harm') {
    return buildGeneralDestructiveRecommendation(description, policy, recommendedOption);
  }
  if (archetype === 'displacement_relocation_industrial' || archetype === 'forced_eviction_resettlement' || archetype === 'polluting_industry_hazard') {
    return buildDisplacementRecommendation(description, policy, recommendedOption);
  }
  if (archetype === 'healthcare_hospital') {
    return {
      title: 'Decision Recommendation: Implement Alternative A (Phased Modular Execution)',
      recommendedOptionId: recommendedOption.id,
      recommendedOptionTitle: recommendedOption.title,
      why: 'Alternative A delivers immediate lifesaving trauma, emergency, and outpatient services to the public 10 months ahead of schedule, while shielding patients from construction noise through modular acoustic barriers and keeping project costs within a minimal 5% phasing variance.',
      summary: `The proposed multi-specialty hospital represents an immensely beneficial public investment (Societal Benefit: 95/100) that transforms regional healthcare equity and generates ~1,250 direct and indirect jobs. The operational implementation frictions (22/100) are minor and completely manageable through scheduled delivery corridors and modern bio-medical effluent treatment safeguards.`,
      benefits: [
        'Adds 500+ specialty and ICU beds, reducing patient travel to metropolitan centers by 45km',
        'Cuts regional trauma golden hour response time by 65%, saving an estimated ~28% critical emergency patients',
        'Guarantees subsidized and cashless specialty procedures for low-income citizens under CMCHIS',
        'Generates 850 direct healthcare professional jobs and 400 ancillary commercial roles',
      ],
      risks: [
        'Temporary construction vehicle delivery congestion during daytime peak traffic',
        'Statutory requirement for certified bio-medical waste effluent treatment plant (ETP)',
        'Cadre recruitment and on-campus medical doctor housing arrangements',
      ],
      mitigations: [
        'Enforce mandatory off-peak concrete and structural steel delivery windows (21:00 - 06:00)',
        'Commission the bio-medical effluent treatment facility concurrently with Phase 1 civil works',
        'Designate a permanent, dedicated 2-lane green corridor for rapid ambulance ingress and egress',
      ],
      precautions: [
        'Ensure real-time air quality monitoring with water-misting cannons during site earthmoving',
        'Establish a bilingual public liaison desk at the District Collectorate for community inquiries',
      ],
      confidence: 94,
      assumptions: [
        'District land parcel cleared of all encumbrances and approved by Town & Country Planning',
        'TANGEDCO 33kV dedicated dual-feeder power connection sanctioned within standard state timelines',
      ],
      dataLimitations: [
        'Precise outpatient daily footfall is a heuristic estimate based on comparable Tamil Nadu government medical college hospitals.',
      ],
    };
  }

  // Neutral Administrative Decision Recommendation
  return {
    title: `Administrative Decision Assessment: ${recommendedOption.title}`,
    recommendedOptionId: recommendedOption.id,
    recommendedOptionTitle: recommendedOption.title,
    why: `Proposal appraisal indicates that ${recommendedOption.title} balances operational objectives against potential multi-sector externalities, requiring formal field audit and stakeholder verification before sanction.`,
    summary: `Administrative simulation highlights specific sector impacts for the ${policy.category} proposal. Decision-makers must verify unevidenced claims and enforce precautionary environmental, social, and legal safeguards rather than presuming unmitigated public benefit.`,
    benefits: [
      `Addresses declared administrative intent for ${policy.decisionType || policy.category}`,
      'Subject to empirical verification of actual public utility post-implementation',
    ],
    risks: [
      'Unevidenced multi-sector externalities (environmental, social, or public health) require independent audit',
      'Operational delay or inter-departmental clearance bottlenecks during initial execution',
    ],
    mitigations: [
      'Conduct rigorous field impact audit and statutory environmental/social compliance review prior to financial sanction',
      'Convene inter-departmental coordinating committee and institute public grievance redressal mechanisms',
    ],
    precautions: [
      'Verify public consultation and stakeholder consensus before initiating civil interventions',
      'Mandate empirical reporting milestones to validate actual public welfare vs projected outcomes',
    ],
    confidence: 82,
    assumptions: [
      'Analysis is strictly constrained to the text and evidenced parameters of the proposal.',
      'Unevidenced domains are evaluated neutrally pending empirical field submissions.',
    ],
    dataLimitations: [
      'Where proposal lacks specific engineering, environmental, or social mitigation data, conservative administrative baselines are applied without presuming positive outcomes.',
    ],
  };
}

function buildAgriculturalRecommendation(
  description: string,
  policy: PolicyUnderstanding,
  recommendedOption: AlternativeStrategy
): DecisionRecommendation {
  return {
    title: 'Executive Advisory: REJECT Agricultural Land Conversion — Adopt Alternative A (100% Farmland Preservation)',
    recommendedOptionId: recommendedOption.id,
    recommendedOptionTitle: recommendedOption.title,
    why: 'The proposed destruction of agricultural land causes permanent loss of fertile cultivable soil, destroys generational rural farming livelihoods, and triggers severe food security deficits and peasant agitations. Diverting non-agricultural requirements to uncultivable wastelands (Alternative A) delivers 100% farmland preservation with zero agrarian distress.',
    summary: 'The proposed conversion and destruction of fertile agricultural lands carries a purely negative impact profile (Risk: 88/100 vs Welfare Gain: 12/100). The state faces immediate High Court injunctions, loss of food grain output, and acute peasant protests. Administrative execution should be rejected in favor of designated wasteland diversion.',
    benefits: [
      '100% protection of fertile multi-crop agricultural lands, soil ecology, and watershed percolation',
      'Protects farming families and tenant cultivators from generational livelihood loss and rural poverty',
      'Prevents regional food market shortages and agricultural inflation across local mandis',
      'Eliminates legal exposure to High Court stay petitions and mass peasant highway blockades',
    ],
    risks: [
      'Irreversible topsoil stripping and eradication of organic soil fertility built over centuries',
      'Direct displacement and livelihood termination for hundreds of farming families',
      'Massive peasant agitations, farmer union strikes, and law-and-order disruption',
      'Contraction of local food grain and vegetable supply chains to urban centers',
    ],
    mitigations: [
      'Immediately halt all agricultural land alienation and conversion proceedings',
      'Mandate the proponent to utilize designated uncultivable land banks in SIPCOT or notified arid zones',
      'Enforce Tamil Nadu Agricultural Lands (Preservation & Regulation) statutory provisions',
      'Facilitate single-window clearance for non-agricultural project relocation to barren corridors',
    ],
    precautions: [
      'Conduct physical soil survey with District Agricultural Officer to record multi-crop patta acreage',
      'Engage local farmer associations through transparent Grama Sabha agrarian consultations',
    ],
    confidence: 96,
    assumptions: [
      'Fertile agricultural parcels fall under protected multi-crop agrarian classification',
      'Adequate non-cultivable or industrial land banks exist within district logistics radius',
    ],
    dataLimitations: [
      'Exact acreage and tenant farmer counts require revenue village Adangal and Chitta register validation.',
    ],
  };
}

function buildEnvironmentalRecommendation(
  description: string,
  policy: PolicyUnderstanding,
  recommendedOption: AlternativeStrategy
): DecisionRecommendation {
  return {
    title: 'Executive Advisory: HALT Ecological Destruction — Adopt Alternative A (Complete Conservation & Brownfield Redevelopment)',
    recommendedOptionId: recommendedOption.id,
    recommendedOptionTitle: recommendedOption.title,
    why: 'The proposal incurs irreversible environmental degradation, clear-felling of green canopy, and severe threat to regional aquifers. Shifting development to pre-existing brownfield sites (Alternative A) preserves the ecological buffer without judicial stay penalties.',
    summary: 'The proposal presents a Net Negative environmental risk profile (Risk: 90/100 vs Welfare Gain: 10/100). Imminent NGT litigation stays and public health degradation mandate immediate suspension in favor of brownfield alternatives.',
    benefits: [
      'Preserves natural forest cover, wetland drainage basins, and urban carbon sinks',
      'Eliminates statutory penalties and prosecution risks under the Forest Conservation Act and NGT mandates',
      'Maintains regional micro-climate stability and prevents urban heat island escalation',
    ],
    risks: [
      'Severe ambient air quality deterioration (particulate spikes) and respiratory health hazards',
      'Aquifer depletion and heightened flash-flood inundation vulnerability',
      'Imminent judicial injunction from the National Green Tribunal (NGT) halting works',
    ],
    mitigations: [
      'Enforce total stay on tree felling and wetland landfilling',
      'Direct proponent to designated degraded brownfield land parcel',
      'Mandate statutory compensatory afforestation along urban greenways',
    ],
    precautions: [
      'Install real-time ambient particulate and groundwater monitoring sensors',
      'Maintain continuous liaison with state forest department and pollution control authorities',
    ],
    confidence: 95,
    assumptions: ['Statutory forest and wetland conservation guidelines apply'],
    dataLimitations: ['Micro-climate metrics derived from regional watershed heuristic models.'],
  };
}

function buildGeneralDestructiveRecommendation(
  description: string,
  policy: PolicyUnderstanding,
  recommendedOption: AlternativeStrategy
): DecisionRecommendation {
  return {
    title: 'Executive Advisory: RESTRUCTURE Harmful Policy — Adopt Alternative A (Constructive Non-Destructive Plan)',
    recommendedOptionId: recommendedOption.id,
    recommendedOptionTitle: recommendedOption.title,
    why: 'The proposed administrative action inflicts disproportionate disruption and public asset impairment without corresponding public benefit. Adopting Alternative A replaces destructive measures with phased modernization and preservation of community assets.',
    summary: 'The proposal carries an Unfavorable Net Negative profile (Risk: 82/100 vs Welfare Gain: 15/100). Immediate administrative restructuring is advised to prevent public backlash and judicial scrutiny.',
    benefits: [
      'Preserves essential public assets and citizen utility access',
      'Eliminates civic protests, administrative friction, and litigation stays',
      'Delivers constructive public service modernization through stakeholder consensus',
    ],
    risks: [
      'Severe public hardship, utility disruptions, and organized citizen protests',
      'Legal challenge against arbitrary administrative destruction of assets',
    ],
    mitigations: [
      'Suspend destructive operational orders immediately',
      'Convene multi-departmental committee to restructure proposal into asset-enhancing format',
    ],
    precautions: [
      'Maintain proactive public grievance redressal mechanism',
    ],
    confidence: 92,
    assumptions: ['Administrative discretion permits restructuring into constructive alternatives'],
    dataLimitations: ['Citizen impact estimates based on zonal density indicators.'],
  };
}

function buildDisplacementRecommendation(
  description: string,
  policy: PolicyUnderstanding,
  recommendedOption: AlternativeStrategy
): DecisionRecommendation {
  return {
    title: 'Executive Advisory: Do NOT Execute Direct Eviction — Adopt Alternative A (SIPCOT Park Relocation)',
    recommendedOptionId: recommendedOption.id,
    recommendedOptionTitle: recommendedOption.title,
    why: 'The proposed involuntary displacement of families incurs severe human trauma, high likelihood of Madras High Court injunctions under RFCTLARR Act 2013, acute civil unrest, and severe clinker dust pollution in populated zones. Relocating the industrial facility to an established SIPCOT industrial park preserves manufacturing output with ZERO human evictions.',
    summary: 'The proposed involuntary displacement of families for a heavy cement factory carries a Net Unfavorable rating. The state faces immediate social litigation, loss of informal livelihoods, and high PM10/PM2.5 respiratory hazards. Administrative execution should be suspended in favor of designated industrial zone allocation.',
    benefits: [
      'Alternative A secures cement industrial production capacity and state industrial tax revenues',
      'Protects vulnerable families from eviction, social disruption, and child school dropouts',
      'Eliminates protracted High Court litigation, civil unrest policing, and compensation disputes',
      'Maintains mandatory environmental buffer compliance mandated by TNPCB and Central Pollution Control Board',
    ],
    risks: [
      'Severe public resistance, hunger strikes, and highway blockades if direct forced eviction is attempted',
      'High Court stay order / Writ Petition under Right to Fair Compensation and Transparency in Land Acquisition Act (RFCTLARR 2013)',
      'Severe respiratory morbidity from cement fugitive dust emissions on nearby settlements',
      'Loss of unorganized livelihoods and wage disruption for informal workers',
    ],
    mitigations: [
      'Halt all land acquisition / eviction notices in inhabited village/ward clusters immediately',
      'Direct the industrial proponent to designated land bank in SIPCOT/SIDCO heavy industrial growth center',
      'Mandate closed clinker conveyor systems, baghouse pulse-jet filters, and continuous online emission monitoring (CAAQMS)',
      'If any peripheral acquisition is unavoidable, mandate land-for-land rehabilitation and permanent government-recognized employment',
    ],
    precautions: [
      'Engage District Revenue Officer (DRO) and Social Welfare Directorate for transparent baseline social impact survey',
      'Do not mobilize coercive police or demolition machinery against residential habitats',
    ],
    confidence: 96,
    assumptions: [
      'Proponent can be accommodated in designated SIPCOT industrial growth center within the district or adjacent logistics corridor',
      'Statutory compliance requirements under RFCTLARR Act 2013 and EIA Notification 2006 strictly upheld by regulatory authorities',
    ],
    dataLimitations: [
      'Family demographics and livelihood distribution derived from census heuristics; subject to mandatory village Grama Sabha baseline audit.',
    ],
  };
}

// ------------------------------------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------------------------------------

function determineTargetAsset(description: string, archetype: PolicyArchetype): string {
  if (archetype === 'agricultural_destruction_hazard') return 'Cultivable Agricultural Farmlands & Irrigation Basin';
  if (archetype === 'environmental_destruction_loss') return 'Ecological Green Canopy & Natural Water Catchment';
  if (archetype === 'general_destructive_harm') return 'Designated Public Asset & Community Infrastructure';
  if (archetype === 'displacement_relocation_industrial' || archetype === 'forced_eviction_resettlement' || archetype === 'polluting_industry_hazard') {
    return 'Residential Settlement & Proposed Heavy Industrial Site';
  }
  if (archetype === 'healthcare_hospital') return 'Government Multi-Specialty Hospital Complex';
  if (archetype === 'education_hub') return 'Government College & Technical Education Campus';
  if (archetype === 'transport_corridor') return 'Elevated Corridor & Arterial Bypass Link';
  if (archetype === 'clean_energy_environment') return 'Solar Park & Eco-Restoration Facility';
  if (archetype === 'industrial_zone') return 'SIPCOT Industrial & Manufacturing Park';
  if (archetype === 'water_dam') return 'Dam Hydraulic Reservoir & Discharge Sluices';
  if (archetype === 'urban_housing') return 'Modern Tenement Housing & Community Estate';
  if (archetype === 'traffic_regulation') return 'Urban Commercial Corridor & Traffic Grid';
  return 'Designated Administrative Asset / Sector';
}

function determineDecisionType(
  description: string,
  archetype: PolicyArchetype,
  category: PolicyCategory,
  proposalUnderstanding?: StructuredProposalUnderstanding
): string {
  if (proposalUnderstanding?.primaryAction) {
    return proposalUnderstanding.primaryAction;
  }
  if (archetype === 'agricultural_destruction_hazard') return 'Proposed Agricultural Land Acquisition & Non-Agrarian Diversion';
  if (archetype === 'environmental_destruction_loss') return 'Ecological Resource Extraction & Land Clearance';
  if (archetype === 'general_destructive_harm') return 'Administrative Interventional Directive';
  if (archetype === 'displacement_relocation_industrial' || archetype === 'forced_eviction_resettlement') {
    return 'Involuntary Population Relocation & Heavy Industrial Land Sanction';
  }
  if (archetype === 'polluting_industry_hazard') {
    return 'Heavy Industrial Manufacturing Plant Clearance';
  }
  if (archetype === 'healthcare_hospital') return 'New Super-Specialty Medical Healthcare Asset Construction';
  if (archetype === 'education_hub') return 'New Higher Education & Skill Campus Development';
  if (archetype === 'transport_corridor') return 'Major Transit Corridor & Flyover Engineering';
  if (archetype === 'clean_energy_environment') return 'Renewable Energy & Environmental Protection Infrastructure';
  if (archetype === 'industrial_zone') return 'Industrial Corridor Sanction & Infrastructure Layout';
  if (archetype === 'water_dam') return 'Hydraulic Discharge Regulation & Surplus Water Release';
  if (archetype === 'traffic_regulation') return 'Urban Traffic Regulation & Commercial Vehicle Policy';
  if (archetype === 'urban_housing') return 'Community Housing Resettlement & Civil Modernization';
  return 'Strategic Administrative & Public Works Policy';
}

function determineDepartment(
  archetype: PolicyArchetype,
  category: PolicyCategory,
  proposalUnderstanding?: StructuredProposalUnderstanding
): string {
  if (proposalUnderstanding?.responsibleDepartment && proposalUnderstanding.responsibleDepartment !== 'Requires Administrative Verification') {
    return proposalUnderstanding.responsibleDepartment;
  }
  if (category === 'Governance / Public Administration') return 'Public Works Department (Buildings) & Legislative Assembly Secretariat';
  if (category === 'Transport Infrastructure' || category === 'Transport') return 'Highways and Minor Ports Department';
  if (category === 'Industry / Economic Development' || category === 'Industry') return 'Industries, Investment Promotion and Commerce Department';
  if (category === 'Healthcare') return 'Health and Family Welfare Department';
  if (category === 'Education') return 'Higher Education Department';
  if (category === 'Water Resources' || category === 'Water Resources / Disaster Resilience') return 'Water Resources Department (WRD)';
  if (category === 'Municipal Infrastructure / Water & Sanitation' || category === 'Municipal Administration') return 'Municipal Administration and Water Supply Department';
  return 'Requires Administrative Verification';
}

function determineTimeline(archetype: PolicyArchetype, description?: string): string {
  if (description) {
    const timeMatch = description.match(/(\d+)\s*(months?|years?|days?|weeks?)/i);
    if (timeMatch) {
      return `${timeMatch[1]} ${timeMatch[2]} (Stated in proposal)`;
    }
  }
  return 'Unstated in proposal (Subject to administrative DPR / project sanction)';
}

function determineRationale(
  description: string,
  archetype: PolicyArchetype,
  proposalUnderstanding?: StructuredProposalUnderstanding
): string {
  if (proposalUnderstanding?.positiveObjectives?.[0]) {
    return proposalUnderstanding.positiveObjectives[0];
  }
  if (proposalUnderstanding?.proposalObjective) {
    return proposalUnderstanding.proposalObjective;
  }
  return `Administrative policy evaluation for "${description}".`;
}

function determineScale(
  description: string,
  proposalUnderstanding?: StructuredProposalUnderstanding
): 'Local' | 'Zonal' | 'City-wide' | 'District-wide' | 'Regional' | 'State-wide' {
  if (proposalUnderstanding?.scale) {
    switch (proposalUnderstanding.scale) {
      case 'State': return 'State-wide';
      case 'Regional': return 'Regional';
      case 'District': return 'District-wide';
      case 'City': return 'City-wide';
      case 'Ward': return 'Zonal';
      default: return 'Local';
    }
  }
  const text = description.toLowerCase();
  if (text.includes('state') || text.includes('all district')) return 'State-wide';
  if (text.includes('district') || text.includes('hospital')) return 'District-wide';
  if (text.includes('region') || text.includes('corridor') || text.includes('dam')) return 'Regional';
  if (text.includes('city') || text.includes('metro')) return 'City-wide';
  if (text.includes('zone') || text.includes('ward')) return 'Zonal';
  return 'Local';
}

function determineStakeholders(
  archetype: PolicyArchetype,
  proposalUnderstanding?: StructuredProposalUnderstanding
): string[] {
  if (proposalUnderstanding) {
    const list = [...proposalUnderstanding.explicitStakeholders, ...proposalUnderstanding.inferredStakeholders];
    if (list.length > 0) return Array.from(new Set(list));
  }
  return [
    'Local Citizens & Resident Welfare Associations',
    'District Collectorate & Municipal Administration',
    'Civil Society & Public Stakeholders',
  ];
}

function determineUrgency(description: string): 'Low' | 'Standard' | 'Urgent' | 'Emergency' {
  const text = description.toLowerCase();
  if (text.includes('emergency') || text.includes('cyclone') || text.includes('flood') || text.includes('evacuate') || text.includes('dam')) {
    return 'Emergency';
  }
  if (text.includes('urgent') || text.includes('immediate') || text.includes('priority')) {
    return 'Urgent';
  }
  return 'Standard';
}

export const generateFallbackResult = generateGenericFallbackResult;

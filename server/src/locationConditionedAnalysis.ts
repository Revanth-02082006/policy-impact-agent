import {
  ScenarioInput,
  StructuredProposalUnderstanding,
  SensitiveReceptor,
  LocationImpactContext,
  AgentImpactDomain,
  DomainConditionEvaluation,
} from './types.js';
import { InfrastructureLookupResult } from './infrastructure.js';
import { LocationAdministrativeContext, getDistrictProfile } from './locationContextData.js';

/**
 * UPGRADE 2: LOCATION-CONDITIONED IMPACT ANALYSIS ENGINE
 * 
 * Evaluates:
 * DECISION + SELECTED LOCATION + LOCAL CONDITIONS + VERIFIED EVIDENCE
 * -> LOCATION-SPECIFIC IMPACT
 * 
 * The impact of an administrative decision is NEVER determined from policy type alone.
 */

export function analyzeLocationConditionedImpact(
  proposal: StructuredProposalUnderstanding,
  input: ScenarioInput,
  infra: InfrastructureLookupResult | undefined,
  locationProfile: LocationAdministrativeContext
): {
  locationImpactContext: LocationImpactContext;
  domainConditionEvaluations: Record<AgentImpactDomain, DomainConditionEvaluation>;
} {
  const fullText = `${input.description || ''} ${input.location || ''} ${input.area || ''} ${input.village || ''} ${input.town || ''} ${input.city || ''} ${input.district || ''}`.toLowerCase();
  const districtName = locationProfile.district || input.district || 'Tamil Nadu';
  const districtProfile = getDistrictProfile(districtName);

  // 1. Identify Verified vs Unknown Location Characteristics
  const selectedLocation =
    input.location ||
    [locationProfile.resolvedArea, districtName, 'Tamil Nadu'].filter(Boolean).join(', ');

  const hasExplicitCoordinates =
    input.latitude !== undefined &&
    input.longitude !== undefined &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude);

  const locationVerificationStatus: LocationImpactContext['locationVerificationStatus'] =
    hasExplicitCoordinates && locationProfile.resolvedArea !== 'Tamil Nadu'
      ? 'Verified'
      : locationProfile.resolvedArea
      ? 'Partially Verified'
      : 'Unverified / Unknown';

  // 2. Identify Sensitive Receptors (Strict: No hallucination, unstated proximity = UNKNOWN)
  const sensitiveReceptors: SensitiveReceptor[] = [];
  const receptorTypeSet = new Set<string>();

  // A. Water Bodies (Rivers, Lakes, Wetlands, Reservoirs)
  const waterKeywords = ['river', 'lake', 'wetland', 'dam', 'reservoir', 'canal', 'stream', 'basin', 'creek'];
  const textHasWaterMention = waterKeywords.some(w => fullText.includes(w));
  
  if (textHasWaterMention || locationProfile.isEcoSensitiveOrWaterBuffer) {
    // Find matching water bodies from district profile or text
    const matchedBodies = districtProfile.majorWaterBodies.filter(b => {
      const bLower = b.toLowerCase();
      const tokens = bLower.split(/[\s,()/-]+/).filter(t => t.length >= 4);
      return tokens.some(tok => fullText.includes(tok));
    });

    const waterBodyName = matchedBodies.length > 0 
      ? matchedBodies[0] 
      : districtProfile.majorWaterBodies[0] || 'Local Catchment / Water Body';

    // Proximity strictly checked
    const proximity = fullText.includes('adjacent to river') || fullText.includes('on river bank')
      ? 'Adjacent (< 100m)'
      : fullText.includes('near river') || fullText.includes('near water') || fullText.includes('near dam')
      ? 'Riparian Zone (< 500m)'
      : 'UNKNOWN';

    sensitiveReceptors.push({
      type: 'River / Water Body',
      name: waterBodyName,
      relevance: 'Hydrological receptor vulnerable to effluent discharge, runoff contamination, or intake pressure',
      distanceOrProximity: proximity,
      source: matchedBodies.length > 0 ? 'Verified Regional Catchment Data' : 'District Environmental Profile',
      verificationStatus: matchedBodies.length > 0 ? 'Verified' : 'Inferred',
      potentialImpact: 'Risk of trade effluent contamination, sediment runoff, and statutory 15m buffer violation under TNCDBR 2019',
    });
    receptorTypeSet.add('water');
  }

  // B. Agricultural Land & Farmland Belts
  const agKeywords = ['agricultural', 'farmland', 'farm', 'paddy', 'fertile', 'crop', 'agrarian', 'cultivable'];
  const textHasAgMention = agKeywords.some(w => fullText.includes(w));

  if (textHasAgMention || locationProfile.isAgriculturalOrRuralZone) {
    const matchedBelts = districtProfile.knownFarmlandBelts.filter(b => {
      const bLower = b.toLowerCase();
      const tokens = bLower.split(/[\s,()/-]+/).filter(t => t.length >= 4);
      return tokens.some(tok => fullText.includes(tok));
    });

    const agBeltName = matchedBelts.length > 0
      ? matchedBelts[0]
      : districtProfile.knownFarmlandBelts[0] || `${districtName} Agrarian Zone`;

    const proximity = fullText.includes('on fertile agricultural') || fullText.includes('converting agricultural land') || fullText.includes('on farmland')
      ? 'Direct Footprint (100% In Situ)'
      : fullText.includes('adjacent to farmland') || fullText.includes('near agricultural')
      ? 'Adjacent (< 250m)'
      : 'UNKNOWN';

    sensitiveReceptors.push({
      type: 'Agricultural land',
      name: agBeltName,
      relevance: 'Food security, agrarian livelihoods, and fertile cultivable topsoil preservation',
      distanceOrProximity: proximity,
      source: matchedBelts.length > 0 ? 'Verified District Revenue Belt' : 'District Agrarian Profile',
      verificationStatus: matchedBelts.length > 0 ? 'Verified' : 'Inferred',
      potentialImpact: 'Permanent loss of cultivable agricultural topsoil, severance of irrigation channels, and agrarian livelihood displacement',
    });
    receptorTypeSet.add('agriculture');
  }

  // C. Dense Residential Settlements & Urban Communities
  const resKeywords = ['residential', 'settlement', 'colony', 'bazaar', 'housing', 'dwellers', 'village core', 'neighborhood'];
  const textHasResMention = resKeywords.some(w => fullText.includes(w));

  if (textHasResMention || locationProfile.isHighDensityResidential || (infra?.populationContext?.corridorEstimatedPopulation || 0) > 10000) {
    const matchedWards = districtProfile.highDensityResidentialZones.filter(z => {
      const zLower = z.toLowerCase();
      const tokens = zLower.split(/[\s,()/-]+/).filter(t => t.length >= 4);
      return tokens.some(tok => fullText.includes(tok));
    });

    const wardName = matchedWards.length > 0
      ? matchedWards[0]
      : infra?.resolvedArea
      ? `${infra.resolvedArea} Inhabited Settlement`
      : `${districtName} Central Residential Wards`;

    const proximity = fullText.includes('within settlement') || fullText.includes('populated settlement')
      ? 'Immediate Interface (< 200m)'
      : fullText.includes('near residential') || fullText.includes('near settlement')
      ? 'Adjacent (< 500m)'
      : 'UNKNOWN';

    sensitiveReceptors.push({
      type: 'Dense residential settlement',
      name: wardName,
      relevance: 'Public health exposure, ambient noise, air particulate burden, and community safety',
      distanceOrProximity: proximity,
      source: matchedWards.length > 0 ? 'Verified Ward Directory' : 'OpenStreetMap Census Baseline',
      verificationStatus: matchedWards.length > 0 ? 'Verified' : 'Inferred',
      potentialImpact: 'Public health risks from industrial air/noise emissions, increased traffic friction, and community resistance',
    });
    receptorTypeSet.add('residential');
  }

  // D. Approved Industrial Parks (When project is inside or adjoining an industrial estate)
  if (locationProfile.isApprovedIndustrialZone) {
    const matchedParks = districtProfile.approvedIndustrialParks.filter(p => {
      const pLower = p.toLowerCase();
      const tokens = pLower.split(/[\s,()/-]+/).filter(t => t.length >= 4);
      return tokens.some(tok => fullText.includes(tok));
    });

    const parkName = matchedParks.length > 0
      ? matchedParks[0]
      : districtProfile.approvedIndustrialParks[0] || `${districtName} SIDCO/SIPCOT Industrial Estate`;

    sensitiveReceptors.push({
      type: 'Industrial area',
      name: parkName,
      relevance: 'Designated zoning compatibility, shared industrial effluent treatment, and dedicated freight connectivity',
      distanceOrProximity: 'Direct In-Zone Allotment',
      source: 'Verified Statutory Industrial Estate Registry',
      verificationStatus: 'Verified',
      potentialImpact: 'Conforming industrial land use; statutory utility linkages and residential buffer separation already established',
    });
    receptorTypeSet.add('industrial');
  }

  // E. Institutional Receptors: Hospitals & Healthcare
  if (infra?.emergencyHospitals && infra.emergencyHospitals.length > 0) {
    const hosp = infra.emergencyHospitals[0];
    sensitiveReceptors.push({
      type: 'Hospital',
      name: hosp.name,
      relevance: 'Emergency healthcare accessibility, uninterrupted ambulance routing, and clinical quiet zone',
      distanceOrProximity: 'UNKNOWN', // OpenStreetMap vicinity match without precise route survey
      source: 'OpenStreetMap Infrastructure Data',
      verificationStatus: 'Verified',
      potentialImpact: 'Risk of ambulance corridor delay or air quality degradation if industrial emissions or road diversions occur',
    });
    receptorTypeSet.add('hospital');
  }

  // F. Institutional Receptors: Schools & Education
  if (infra?.schools && infra.schools.length > 0) {
    const sch = infra.schools[0];
    sensitiveReceptors.push({
      type: 'School',
      name: sch.name,
      relevance: 'Pedestrian safety for children, school bus corridor transit, and noise regulation',
      distanceOrProximity: 'UNKNOWN',
      source: 'OpenStreetMap Infrastructure Data',
      verificationStatus: 'Verified',
      potentialImpact: 'Heavy construction traffic or freight volume could compromise student pedestrian safety during school hours',
    });
    receptorTypeSet.add('school');
  }

  // G. Major Roads / Transit Corridors
  if (infra?.transitLinks && infra.transitLinks.length > 0) {
    const tr = infra.transitLinks[0];
    sensitiveReceptors.push({
      type: 'Major road',
      name: tr.name,
      relevance: 'Regional logistics connectivity, commuter throughput, and freight axle-load endurance',
      distanceOrProximity: 'Direct Transit Interface',
      source: 'OpenStreetMap Highway Registry',
      verificationStatus: 'Verified',
      potentialImpact: 'Capacity strain during construction or long-term freight loading requiring pavement reinforcement',
    });
    receptorTypeSet.add('transit');
  }

  // 3. Synthesize Context Dimensions
  const isIndustrial =
    proposal.primaryDomain.includes('Industry') ||
    /(chemical|manufacturing|factory|cement|plant|refinery|tannery|textile)/i.test(fullText);

  const isAgriConversion =
    locationProfile.isAgriculturalOrRuralZone ||
    /(convert|farmland|agricultural land|agrarian)/i.test(fullText);

  const isEcoSensitive =
    locationProfile.isEcoSensitiveOrWaterBuffer ||
    /(river|lake|dam|wetland|catchment|buffer)/i.test(fullText);

  const isIndustrialZone = locationProfile.isApprovedIndustrialZone;

  // Land Use Context
  let landUseContext = isIndustrialZone
    ? `Designated statutory industrial zone (${districtProfile.approvedIndustrialParks[0] || 'SIPCOT/SIDCO'}). Master plan accommodates heavy/light manufacturing with statutory setback buffers.`
    : isAgriConversion
    ? `Active agrarian / cultivable farmland tract in ${districtName}. Land conversion requires statutory DTCP reclassification and RFCTLARR Act review.`
    : isEcoSensitive
    ? `Riparian / hydrologic catchment buffer. Protected under Tamil Nadu Combined Development and Building Rules (TNCDBR 2019) 15m statutory buffer.`
    : `Mixed suburban and rural-urban interface in ${districtName}. Land use subject to municipal master plan zoning verification.`;

  // Environmental Context
  let environmentalContext = isEcoSensitive
    ? `High ecological sensitivity. Directly proximate to ${districtProfile.majorWaterBodies[0] || 'drainage basin'}. Stringent TNPCB effluent and air standards apply.`
    : isIndustrialZone
    ? `Managed industrial environment. Established air and noise buffers with shared or individual Common Effluent Treatment Plant (CETP) requirements.`
    : `Moderate environmental baseline in ${districtName}. Groundwater status is ${districtProfile.groundwaterStatus}; requires conservation.`;

  // Water Context
  let waterContext = isEcoSensitive
    ? `Critical water sensitivity: Adjacent to ${districtProfile.majorWaterBodies[0] || 'water body'}. High risk of point-source and non-point source contamination.`
    : isIndustrial
    ? `Industrial water intake and trade effluent discharge require statutory TNPCB Water Act (1974) clearances and Zero Liquid Discharge (ZLD) audit.`
    : `Standard municipal water supply and drainage baseline for ${districtName}. Groundwater status categorized as ${districtProfile.groundwaterStatus}.`;

  // Population Context
  let populationContext = locationProfile.isHighDensityResidential
    ? `High-density settlement zone (${districtProfile.highDensityResidentialZones[0] || 'municipal core'}). Elevated public vulnerability to industrial hazards and noise.`
    : isIndustrialZone
    ? `Adequate buffer separation from high-density residential wards. Worker colonies located along peripheral transport corridors.`
    : `Dispersed rural and agrarian demographic settlement. Community livelihood intimately tied to agricultural soil fertility.`;

  // Infrastructure Context
  let infrastructureContext = isIndustrialZone
    ? `High utility readiness: High-tension TANGEDCO power feeder, dedicated industrial water line, and freight access roads already present.`
    : `Standard rural/suburban civic infrastructure. Heavy industrial utility hookups (bulk water, high-voltage power) unverified and require capital augmentation.`;

  // Transport Context
  let transportContext = infra?.transitLinks && infra.transitLinks.length > 0
    ? `Connected via ${infra.transitLinks.map(t => t.name).join(', ')}. Industrial freight routing requires axle-load survey.`
    : `Feeder road connectivity in ${districtName}. Direct heavy freight transport capacity is UNKNOWN and requires road width verification.`;

  // Public Safety Context
  let publicSafetyContext = isIndustrial && !isIndustrialZone && (locationProfile.isHighDensityResidential || isEcoSensitive)
    ? `High public safety hazard: Placement of industrial manufacturing near residential/riparian receptors elevates chemical exposure and hazard vulnerability.`
    : isIndustrialZone
    ? `Standard industrial safety protocols under Factories Act and Tamil Nadu Fire and Rescue Services norms.`
    : `Standard civic public safety environment with moderate seasonal disaster risks (Flood: ${districtProfile.floodVulnerability}, Drought: ${districtProfile.droughtVulnerability}).`;

  // Economic Context
  let economicContext = `District economic foundation anchored by ${districtProfile.primaryLivelihoods.join(', ')}. Industrial investment offers potential employment, but must not destroy primary agrarian livelihoods.`;

  // Administrative Context
  let administrativeContext = `Governed by ${proposal.responsibleDepartment} and ${proposal.leadAdministrativeAuthority}. Statutory compliance mandates: ${districtProfile.applicableSpecialRegulations.slice(0, 2).join('; ')}.`;

  // 4. Identify Location Advantages, Risks, Constraints, Unknowns
  const locationAdvantages: string[] = [];
  const locationRisks: string[] = [];
  const locationConstraints: string[] = [];
  const locationUnknowns: string[] = [];

  if (isIndustrialZone) {
    locationAdvantages.push(`Statutory industrial zoning already approved in ${districtProfile.approvedIndustrialParks[0] || 'SIPCOT/SIDCO'}`);
    locationAdvantages.push('Existing industrial road connectivity and dedicated utility rights-of-way');
    locationAdvantages.push('Established buffer separation from dense residential neighborhoods');
  } else {
    if (infra?.transitLinks && infra.transitLinks.length > 0) {
      locationAdvantages.push(`Proximity to arterial transport corridors (${infra.transitLinks[0].name})`);
    }
  }

  if (isAgriConversion) {
    locationRisks.push('Permanent loss of fertile cultivable topsoil and irreversible damage to agrarian food production');
    locationRisks.push('Severe agrarian resistance, farmer protests, and statutory acquisition legal challenges');
  }
  if (isEcoSensitive) {
    locationRisks.push(`Severe water contamination risk to ${districtProfile.majorWaterBodies[0] || 'local river basin'} from industrial runoff or effluent`);
    locationRisks.push('Violation of statutory riparian setback buffers under TNCDBR 2019 and Madras High Court river protection rulings');
  }
  if (locationProfile.isHighDensityResidential && isIndustrial) {
    locationRisks.push('Direct airborne particulate and chemical exposure to densely populated residential settlements');
    locationRisks.push('Heightened public health risk and potential civic backlash');
  }

  // Constraints
  if (isEcoSensitive) {
    locationConstraints.push('Mandatory 15m to 50m no-development riparian buffer from water body high-flood level');
    locationConstraints.push('Mandatory Zero Liquid Discharge (ZLD) installation for any trade effluent');
  }
  if (isAgriConversion) {
    locationConstraints.push('Reclassification approval required from Directorate of Town and Country Planning (DTCP)');
    locationConstraints.push('Social Impact Assessment (SIA) mandate under RFCTLARR Act 2013');
  }
  locationConstraints.push('Statutory Consent to Establish (CTE) from Tamil Nadu Pollution Control Board (TNPCB)');

  // Unknowns (Crucial: Unknown conditions MUST reduce confidence)
  if (!isIndustrialZone) {
    locationUnknowns.push('Zoning Master Plan status: UNKNOWN (requires revenue / DTCP master plan verification)');
    locationUnknowns.push('Distance from river high-flood mark: UNKNOWN (requires physical cadastral survey; never assumed safe)');
    locationUnknowns.push('Local residential population within 1km radius: UNKNOWN (requires field census verification)');
    locationUnknowns.push('Industrial utility capacity (TANGEDCO power, TWAD bulk water): UNKNOWN (requires departmental feasibility study)');
  }
  if (isIndustrial && isIndustrialZone) {
    locationUnknowns.push('Common Effluent Treatment Plant (CETP) spare hydraulic capacity: UNKNOWN (requires SIPCOT/TNPCB audit)');
  }

  // 5. Decision-to-Condition Matching Matrix for All 9 Domains
  const domainConditionEvaluations = {} as Record<AgentImpactDomain, DomainConditionEvaluation>;

  // A. Transport Impact
  const isTransportRelevant =
    proposal.primaryDomain.includes('Transport') ||
    proposal.secondaryDomains.includes('Transport') ||
    isIndustrial ||
    proposal.primaryDomain.includes('Governance');

  if (isTransportRelevant) {
    if (isIndustrialZone) {
      domainConditionEvaluations.transport = {
        domain: 'transport',
        relevance: 'Contextually Relevant',
        impactClassification: 'Potential Positive',
        positiveImpacts: ['Potential utilization of designated industrial freight transit corridors'],
        negativeImpacts: ['Incremental heavy freight vehicle movements and localized feeder intersection loading'],
        locationFactors: ['Approved industrial park access routes designed for multi-axle freight'],
        evidence: ['OpenStreetMap verified arterial transit corridors in vicinity'],
        unknowns: ['Peak freight tonnage generation unstated in proposal'],
        mitigationOptions: ['Designate designated heavy vehicle entry hours and grade-separated turning bays'],
        confidence: 85,
      };
    } else if (isAgriConversion || isEcoSensitive) {
      domainConditionEvaluations.transport = {
        domain: 'transport',
        relevance: 'Contextually Relevant',
        impactClassification: 'Potential Negative',
        positiveImpacts: [],
        negativeImpacts: [
          'Heavy construction and industrial freight vehicles on rural/agricultural roads not engineered for high axle loads',
          'Pavement degradation and rural traffic bottlenecks'
        ],
        locationFactors: ['Rural road network with narrow carriageway widths'],
        evidence: ['District rural road baseline'],
        unknowns: ['Existing pavement structural strength and bridge carrying capacity: UNKNOWN'],
        mitigationOptions: ['Pavement widening and strengthening of rural feeder road before facility construction'],
        confidence: 78,
      };
    } else {
      domainConditionEvaluations.transport = {
        domain: 'transport',
        relevance: 'Directly Relevant',
        impactClassification: 'Neutral',
        positiveImpacts: ['Integration with designated municipal roads'],
        negativeImpacts: ['Localized traffic volume redistribution during operational shift hours'],
        locationFactors: ['Corridor access to civic infrastructure'],
        evidence: ['OpenStreetMap transit links'],
        unknowns: ['Detailed traffic impact assessment unsubmitted'],
        mitigationOptions: ['Traffic management plan with lane markings and dedicated turning pockets'],
        confidence: 82,
      };
    }
  } else {
    domainConditionEvaluations.transport = {
      domain: 'transport',
      relevance: 'Minimal/No Direct Impact',
      impactClassification: 'Minimal/No Direct Impact',
      positiveImpacts: [],
      negativeImpacts: [],
      locationFactors: ['No direct transport intervention or significant traffic alteration identified'],
      evidence: ['Proposal scope does not alter road network or vehicular volumes'],
      unknowns: [],
      mitigationOptions: [],
      confidence: 90,
    };
  }

  // B. Infrastructure Impact
  const isInfraRelevant =
    proposal.primaryDomain.includes('Infrastructure') ||
    proposal.primaryDomain.includes('Governance') ||
    isIndustrial;

  if (isInfraRelevant) {
    if (isIndustrialZone) {
      domainConditionEvaluations.infrastructure = {
        domain: 'infrastructure',
        relevance: 'Directly Relevant',
        impactClassification: 'Potential Positive',
        positiveImpacts: ['Utilizes dedicated industrial power feeder and centralized drainage systems in industrial estate'],
        negativeImpacts: ['Connection load on shared estate water and power distribution'],
        locationFactors: ['Industrial park utility infrastructure baseline'],
        evidence: ['Statutory industrial estate infrastructure availability'],
        unknowns: ['Exact daily megawatt and kiloliter demand: UNKNOWN'],
        mitigationOptions: ['Advance allocation clearance with TANGEDCO and TWAD'],
        confidence: 86,
      };
    } else if (isAgriConversion || isEcoSensitive) {
      domainConditionEvaluations.infrastructure = {
        domain: 'infrastructure',
        relevance: 'Directly Relevant',
        impactClassification: 'Potential Negative',
        positiveImpacts: [],
        negativeImpacts: [
          'High capital expenditure required to extend industrial utilities into greenfield agricultural tract',
          'Risk of disrupting underground agricultural irrigation conduits and canal channels'
        ],
        locationFactors: ['Greenfield agrarian site devoid of heavy industrial utilities'],
        evidence: ['Agrarian land classification without dedicated industrial infrastructure'],
        unknowns: ['Utility augmentation cost and timeline: UNKNOWN'],
        mitigationOptions: ['Pre-engineering survey to safeguard existing irrigation networks'],
        confidence: 80,
      };
    } else {
      domainConditionEvaluations.infrastructure = {
        domain: 'infrastructure',
        relevance: 'Directly Relevant',
        impactClassification: 'Potential Positive',
        positiveImpacts: ['Expansion of civic administrative infrastructure assets'],
        negativeImpacts: ['Capital outlay and construction utility management'],
        locationFactors: ['Municipal administrative footprint'],
        evidence: ['Municipal utility baseline'],
        unknowns: ['Project lifecycle maintenance budget: UNKNOWN'],
        mitigationOptions: ['Adopt green building standards and solar rooftop generation'],
        confidence: 84,
      };
    }
  } else {
    domainConditionEvaluations.infrastructure = {
      domain: 'infrastructure',
      relevance: 'Minimal/No Direct Impact',
      impactClassification: 'Minimal/No Direct Impact',
      positiveImpacts: [],
      negativeImpacts: [],
      locationFactors: ['No civil infrastructure construction or utility realignment required'],
      evidence: ['Proposal scope does not involve civil construction or utilities'],
      unknowns: [],
      mitigationOptions: [],
      confidence: 90,
    };
  }

  // C. Population Impact
  if (isIndustrial && (isAgriConversion || isEcoSensitive || locationProfile.isHighDensityResidential)) {
    domainConditionEvaluations.population = {
      domain: 'population',
      relevance: 'Contextually Relevant',
      impactClassification: 'Significant Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Agrarian community livelihood loss and displacement of farming households',
        'Heightened health concerns and public anxiety among surrounding residential settlements'
      ],
      locationFactors: ['Settled residential and farming population in immediate vicinity'],
      evidence: ['Demographic baseline of rural agricultural settlement'],
      unknowns: ['Exact household census within impact zone: UNKNOWN (requires field survey)'],
      mitigationOptions: ['Mandate strict separation buffer or consider alternative site in established industrial estate'],
      confidence: 84,
    };
  } else if (isIndustrial && isIndustrialZone) {
    domainConditionEvaluations.population = {
      domain: 'population',
      relevance: 'Contextually Relevant',
      impactClassification: 'Neutral',
      positiveImpacts: ['Potential localized employment opportunities for regional workforce'],
      negativeImpacts: ['Shift-hour localized transit congestion near industrial gate'],
      locationFactors: ['Separated from dense residential settlements by planned buffer zones'],
      evidence: ['Industrial park zoning buffer standards'],
      unknowns: ['Exact number of direct local hires: UNKNOWN (unstated in proposal)'],
      mitigationOptions: ['Establish dedicated worker transit and worker safety training protocols'],
      confidence: 86,
    };
  } else if (proposal.primaryDomain.includes('Governance')) {
    domainConditionEvaluations.population = {
      domain: 'population',
      relevance: 'Directly Relevant',
      impactClassification: 'Potential Positive',
      positiveImpacts: ['Consolidated civic public access to administrative services under one roof'],
      negativeImpacts: ['Potential commuter friction around complex during legislative or high-level sessions'],
      locationFactors: ['Public accessibility via urban transit corridors'],
      evidence: ['Urban administrative center accessibility baseline'],
      unknowns: ['Citizen visitor volume projections: UNKNOWN'],
      mitigationOptions: ['Integrated public transit feeder stops and ample citizen parking facilities'],
      confidence: 88,
    };
  } else {
    domainConditionEvaluations.population = {
      domain: 'population',
      relevance: 'Minimal/No Direct Impact',
      impactClassification: 'Minimal/No Direct Impact',
      positiveImpacts: [],
      negativeImpacts: [],
      locationFactors: ['No direct residential displacement or community interface identified'],
      evidence: ['No demographic dislocation triggered by proposal'],
      unknowns: [],
      mitigationOptions: [],
      confidence: 90,
    };
  }

  // D. Essential Services Impact
  const nearHospitalOrSchool = sensitiveReceptors.some(r => r.type === 'Hospital' || r.type === 'School');

  if (nearHospitalOrSchool && isIndustrial) {
    domainConditionEvaluations.essential_services = {
      domain: 'essential_services',
      relevance: 'Contextually Relevant',
      impactClassification: 'Potential Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Potential emergency ambulance access friction if freight traffic increases on key arterial roads',
        'Air emissions and acoustic burden in the vicinity of healthcare/educational facilities'
      ],
      locationFactors: ['Verified hospital/school institutions identified in vicinity inventory'],
      evidence: ['OpenStreetMap institutional data'],
      unknowns: ['Exact physical distance to closest school/hospital: UNKNOWN (marked UNKNOWN)'],
      mitigationOptions: ['Emergency corridor green-wave synchronization and ambient air monitoring'],
      confidence: 80,
    };
  } else if (proposal.primaryDomain.includes('Healthcare')) {
    domainConditionEvaluations.essential_services = {
      domain: 'essential_services',
      relevance: 'Directly Relevant',
      impactClassification: 'Significant Positive',
      positiveImpacts: ['Substantial expansion in regional clinical capacity and emergency care access'],
      negativeImpacts: ['Biomedical waste management and emergency ambulance lane congestion'],
      locationFactors: ['Civic healthcare access corridor'],
      evidence: ['Public healthcare service expansion mandate'],
      unknowns: ['Staffing sanctioned strength: UNKNOWN'],
      mitigationOptions: ['Integrated automated biomedical waste incineration and priority ambulance bays'],
      confidence: 92,
    };
  } else {
    domainConditionEvaluations.essential_services = {
      domain: 'essential_services',
      relevance: 'Minimal/No Direct Impact',
      impactClassification: 'Minimal/No Direct Impact',
      positiveImpacts: [],
      negativeImpacts: [],
      locationFactors: ['Does not modify emergency hospital, fire service, or school operations'],
      evidence: ['Proposal does not alter essential service infrastructure'],
      unknowns: [],
      mitigationOptions: [],
      confidence: 92,
    };
  }

  // E. Economic Impact
  if (isIndustrial) {
    if (isIndustrialZone) {
      domainConditionEvaluations.economic = {
        domain: 'economic',
        relevance: 'Directly Relevant',
        impactClassification: 'Potential Positive',
        positiveImpacts: [
          'Potential industrial investment and supply chain growth in designated manufacturing zone',
          'Potential employment opportunities for local engineering and manufacturing workforce'
        ],
        negativeImpacts: ['Capital investment exposure and ongoing raw material procurement costs'],
        locationFactors: ['Approved industrial park with commercial logistics access'],
        evidence: ['SIPCOT/SIDCO industrial park economic baseline'],
        unknowns: ['Number of confirmed permanent jobs: UNKNOWN (unstated in proposal; labeled as Potential)'],
        mitigationOptions: ['Local hiring preference and technical apprentice partnerships with regional ITIs'],
        confidence: 88,
      };
    } else if (isAgriConversion) {
      domainConditionEvaluations.economic = {
        domain: 'economic',
        relevance: 'Directly Relevant',
        impactClassification: 'Potential Negative',
        positiveImpacts: [
          'Potential private manufacturing investment (labeled as Potential; subject to execution)'
        ],
        negativeImpacts: [
          'Destruction of agrarian rural economy, crop yield loss, and loss of daily agricultural wages',
          'Long-term cost of agrarian distress and compensation disputes under RFCTLARR Act'
        ],
        locationFactors: ['Agrarian land with active crop cultivation and agricultural employment'],
        evidence: ['District agricultural livelihood data'],
        unknowns: ['Net economic loss vs projected manufacturing turnover: UNKNOWN'],
        mitigationOptions: ['Relocate industrial project to non-agricultural industrial estate to preserve farm economy'],
        confidence: 84,
      };
    } else {
      domainConditionEvaluations.economic = {
        domain: 'economic',
        relevance: 'Directly Relevant',
        impactClassification: 'Potential Positive',
        positiveImpacts: ['Potential employment and economic activity may result from industrial investment'],
        negativeImpacts: ['Capital expenditure and commercial operational risks'],
        locationFactors: ['Regional commercial environment'],
        evidence: ['General industrial economic profile'],
        unknowns: ['Verified job creation statistics: UNKNOWN (unstated in proposal)'],
        mitigationOptions: ['Transparent economic audit and local procurement commitments'],
        confidence: 82,
      };
    }
  } else if (proposal.primaryDomain.includes('Governance')) {
    domainConditionEvaluations.economic = {
      domain: 'economic',
      relevance: 'Indirect / Secondary',
      impactClassification: 'Potential Positive',
      positiveImpacts: ['Potential secondary commercial footfall for local services around administrative hub'],
      negativeImpacts: ['Public capital expenditure from state exchequer'],
      locationFactors: ['Urban commercial service zone'],
      evidence: ['Administrative expenditure budget'],
      unknowns: ['Exact economic multiplier on surrounding retail: UNKNOWN'],
      mitigationOptions: ['Transparent public tendering and fiscal prudence audits'],
      confidence: 85,
    };
  } else {
    domainConditionEvaluations.economic = {
      domain: 'economic',
      relevance: 'Minimal/No Direct Impact',
      impactClassification: 'Minimal/No Direct Impact',
      positiveImpacts: [],
      negativeImpacts: [],
      locationFactors: ['Proposal creates no direct commercial trading or industrial output shift'],
      evidence: ['No commercial trade mechanism affected'],
      unknowns: [],
      mitigationOptions: [],
      confidence: 90,
    };
  }

  // F. Environmental Impact
  if (isIndustrial) {
    if (isEcoSensitive || isAgriConversion) {
      domainConditionEvaluations.environmental = {
        domain: 'environmental',
        relevance: 'Directly Relevant',
        impactClassification: 'Significant Negative',
        positiveImpacts: [],
        negativeImpacts: [
          `Severe pollution and contamination risk to ${districtProfile.majorWaterBodies[0] || 'local river basin'} from industrial effluent`,
          'Permanent destruction of agricultural topsoil fertility and green cover degradation',
          'Air quality deterioration from industrial boiler and chemical process emissions'
        ],
        locationFactors: ['Riparian buffer / fertile agricultural land setting without common effluent treatment'],
        evidence: ['District environmental profile: sensitive river catchment and over-exploited groundwater'],
        unknowns: ['Baseline environmental quality and discharge volume: UNKNOWN (requires formal EIA)'],
        mitigationOptions: ['Mandate 100% Zero Liquid Discharge (ZLD) or reject site in favor of industrial park with CETP'],
        confidence: 90,
      };
    } else if (isIndustrialZone) {
      domainConditionEvaluations.environmental = {
        domain: 'environmental',
        relevance: 'Directly Relevant',
        impactClassification: 'Potential Negative',
        positiveImpacts: [],
        negativeImpacts: [
          'Industrial emissions, hazardous solid waste generation, and trade effluent require strict ongoing monitoring',
          'Incremental industrial carbon footprint'
        ],
        locationFactors: ['Zoned industrial estate; baseline environmental controls in place'],
        evidence: ['TNPCB industrial consent framework and estate emission standards'],
        unknowns: ['Specific chemical emission inventory and waste classification: UNKNOWN'],
        mitigationOptions: [
          'Mandatory Consent to Establish (CTE) and Consent to Operate (CTO) from TNPCB',
          'Continuous Online Effluent Monitoring System (OCEMS) linked to TNPCB Care Air Centre'
        ],
        confidence: 88,
      };
    } else {
      domainConditionEvaluations.environmental = {
        domain: 'environmental',
        relevance: 'Directly Relevant',
        impactClassification: 'Potential Negative',
        positiveImpacts: [],
        negativeImpacts: ['Environmental risks requiring rigorous impact assessment and statutory pollution controls'],
        locationFactors: ['Standard regional environment'],
        evidence: ['Air and Water Pollution Acts baseline'],
        unknowns: ['Environmental baseline study: UNKNOWN (unsubmitted in proposal)'],
        mitigationOptions: ['Comprehensive Environmental Impact Assessment (EIA) prior to financial sanction'],
        confidence: 85,
      };
    }
  } else if (proposal.primaryDomain.includes('Environment') || proposal.secondaryDomains.includes('Environment')) {
    domainConditionEvaluations.environmental = {
      domain: 'environmental',
      relevance: 'Directly Relevant',
      impactClassification: 'Significant Positive',
      positiveImpacts: ['Restoration of ecological green cover and wetland hydrology'],
      negativeImpacts: ['Short-term earthmoving and soil alteration'],
      locationFactors: ['Protected conservation zone'],
      evidence: ['Ecological restoration project plan'],
      unknowns: ['Survival rate of indigenous saplings: UNKNOWN'],
      mitigationOptions: ['Three-year bio-monitoring and rainwater harvesting integration'],
      confidence: 90,
    };
  } else {
    domainConditionEvaluations.environmental = {
      domain: 'environmental',
      relevance: 'Contextually Relevant',
      impactClassification: 'Neutral',
      positiveImpacts: ['Potential incorporation of green building standards and solar rooftops'],
      negativeImpacts: ['Construction phase dust, debris generation, and localized stormwater runoff'],
      locationFactors: ['Urban developed footprint'],
      evidence: ['TNCDBR building regulations'],
      unknowns: ['Detailed site tree enumeration: UNKNOWN'],
      mitigationOptions: ['Compensatory 1:10 tree afforestation and rainwater harvesting recharge pits'],
      confidence: 86,
    };
  }

  // G. Disaster Risk Impact
  if (isEcoSensitive) {
    domainConditionEvaluations.disaster_risk = {
      domain: 'disaster_risk',
      relevance: 'Directly Relevant',
      impactClassification: 'Significant Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Placement within or adjacent to floodplain/riparian buffer elevates industrial inundation risk during monsoons',
        'Severe disaster risk of chemical flood wash-off spreading toxic contamination downstream'
      ],
      locationFactors: [`River basin proximity; Flood Vulnerability: ${districtProfile.floodVulnerability}`],
      evidence: ['PWD flood catchment records'],
      unknowns: ['100-year flood inundation model for site: UNKNOWN'],
      mitigationOptions: ['Elevate plinth level above maximum flood level (MFL) and construct protective peripheral flood embankments'],
      confidence: 88,
    };
  } else if (isIndustrial) {
    domainConditionEvaluations.disaster_risk = {
      domain: 'disaster_risk',
      relevance: 'Contextually Relevant',
      impactClassification: 'Neutral',
      positiveImpacts: [],
      negativeImpacts: ['Chemical handling fire hazard and on-site industrial safety risks'],
      locationFactors: ['Industrial park emergency response infrastructure'],
      evidence: ['District Disaster Management Plan'],
      unknowns: ['On-site Chemical Disaster Management Plan: UNKNOWN'],
      mitigationOptions: ['Mandatory On-Site Emergency Plan approved by Directorate of Industrial Safety and Health (DISH)'],
      confidence: 86,
    };
  } else {
    domainConditionEvaluations.disaster_risk = {
      domain: 'disaster_risk',
      relevance: 'Minimal/No Direct Impact',
      impactClassification: 'Minimal/No Direct Impact',
      positiveImpacts: [],
      negativeImpacts: [],
      locationFactors: ['Standard regional seismic and cyclone risk; no critical hazard triggered'],
      evidence: ['District disaster vulnerability baseline'],
      unknowns: [],
      mitigationOptions: [],
      confidence: 90,
    };
  }

  // H. Social Impact
  if (isAgriConversion || (isIndustrial && isEcoSensitive)) {
    domainConditionEvaluations.social = {
      domain: 'social',
      relevance: 'Directly Relevant',
      impactClassification: 'Significant Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Severe community grievance and farmer protests against converting agrarian heritage lands',
        'Erosion of community trust in local administration and prolonged social unrest'
      ],
      locationFactors: ['Rural farming community with high cultural attachment to ancestral agricultural lands'],
      evidence: ['Agrarian land tenure and rural livelihood records'],
      unknowns: ['Public hearing consensus: UNKNOWN (no public consultation documented)'],
      mitigationOptions: ['Conduct mandatory public hearings and explore alternative brownfield industrial sites'],
      confidence: 88,
    };
  } else if (isIndustrial && isIndustrialZone) {
    domainConditionEvaluations.social = {
      domain: 'social',
      relevance: 'Contextually Relevant',
      impactClassification: 'Potential Positive',
      positiveImpacts: ['Lower social friction due to conforming industrial zoning and residential separation', 'Potential local employment opportunities'],
      negativeImpacts: ['Labor welfare oversight required for migrant and local industrial workforce'],
      locationFactors: ['Zoned industrial estate with established community acceptance of manufacturing'],
      evidence: ['Industrial park social baseline'],
      unknowns: ['Local community feedback on estate expansion: UNKNOWN'],
      mitigationOptions: ['Corporate Social Responsibility (CSR) allocation for neighboring village schools and clinics'],
      confidence: 86,
    };
  } else if (proposal.primaryDomain.includes('Governance')) {
    domainConditionEvaluations.social = {
      domain: 'social',
      relevance: 'Directly Relevant',
      impactClassification: 'Potential Positive',
      positiveImpacts: ['Civic pride and enhanced citizen interface with state administrative authorities'],
      negativeImpacts: ['Access security protocols during high-profile administrative proceedings'],
      locationFactors: ['Capital administrative corridor'],
      evidence: ['Public governance mandate'],
      unknowns: ['Citizen visitor comfort facility details: UNKNOWN'],
      mitigationOptions: ['Provide air-conditioned citizen facilitation centers and digital token systems'],
      confidence: 88,
    };
  } else {
    domainConditionEvaluations.social = {
      domain: 'social',
      relevance: 'Minimal/No Direct Impact',
      impactClassification: 'Minimal/No Direct Impact',
      positiveImpacts: [],
      negativeImpacts: [],
      locationFactors: ['No community relocation, social restructuring, or cultural disruption'],
      evidence: ['Proposal scope does not alter community rights or social structures'],
      unknowns: [],
      mitigationOptions: [],
      confidence: 92,
    };
  }

  // I. Policy Compliance
  if (isIndustrial && (isAgriConversion || isEcoSensitive)) {
    domainConditionEvaluations.policy_compliance = {
      domain: 'policy_compliance',
      relevance: 'Directly Relevant',
      impactClassification: 'Significant Negative',
      positiveImpacts: [],
      negativeImpacts: [
        'Major regulatory hurdles: Non-conforming land use under DTCP Master Plan',
        'Potential violation of TNCDBR 2019 water body buffer rules and National Green Tribunal (NGT) directives',
        'High litigation risk of High Court stay orders restraining construction on farmland'
      ],
      locationFactors: ['Statutory agricultural and riparian zoning protections in Tamil Nadu'],
      evidence: ['TNCDBR 2019, Water Act 1974, RFCTLARR Act 2013'],
      unknowns: ['Status of statutory land conversion application: UNKNOWN'],
      mitigationOptions: ['Comply fully with DTCP Master Plan zoning and seek brownfield site alternative'],
      confidence: 90,
    };
  } else if (isIndustrial && isIndustrialZone) {
    domainConditionEvaluations.policy_compliance = {
      domain: 'policy_compliance',
      relevance: 'Directly Relevant',
      impactClassification: 'Neutral',
      positiveImpacts: ['Land use is conforming with statutory DTCP and SIPCOT industrial master plans'],
      negativeImpacts: ['Requires strict statutory compliance: TNPCB Consent to Establish and Factory Inspectorate approval'],
      locationFactors: ['Conforming industrial land parcel'],
      evidence: ['SIPCOT master plan and TNPCB industrial guidelines'],
      unknowns: ['Timeline for TNPCB Consent to Establish processing: UNKNOWN'],
      mitigationOptions: ['Submit comprehensive Environmental Management Plan (EMP) to TNPCB'],
      confidence: 88,
    };
  } else {
    domainConditionEvaluations.policy_compliance = {
      domain: 'policy_compliance',
      relevance: 'Directly Relevant',
      impactClassification: 'Potential Positive',
      positiveImpacts: ['Project aligns with administrative and public works policy guidelines'],
      negativeImpacts: ['Requires standard financial sanction and building plan approvals'],
      locationFactors: ['Administrative public-use land allocation'],
      evidence: ['Tamil Nadu Public Works Department code'],
      unknowns: ['Cabinet expenditure clearance: UNKNOWN'],
      mitigationOptions: ['Strict compliance with Tamil Nadu Transparency in Tenders Act'],
      confidence: 90,
    };
  }

  // 6. Compute Location Compatibility Score
  // Compatibility = Land Use + Environmental + Infrastructure + Population + Transport + Safety + Regulatory - Conflicts - Unknowns
  let compatScore = 50; // Neutral baseline
  const compatReasons: string[] = [];

  // Land Use Suitability
  if (isIndustrialZone) {
    compatScore += 18;
    compatReasons.push('Conforming industrial master plan zoning (+18)');
  } else if (isAgriConversion) {
    compatScore -= 24;
    compatReasons.push('Severe conflict with fertile agricultural land use (-24)');
  }

  // Environmental Suitability
  if (isEcoSensitive) {
    compatScore -= 22;
    compatReasons.push(`Proximity to sensitive water body (${districtProfile.majorWaterBodies[0] || 'river catchment'}) creates high ecological risk (-22)`);
  } else if (isIndustrialZone) {
    compatScore += 4;
    compatReasons.push('Standard industrial environmental management buffer (+4)');
  }

  // Infrastructure Suitability
  if (isIndustrialZone) {
    compatScore += 12;
    compatReasons.push('Pre-existing heavy industrial utility infrastructure (+12)');
  } else if (isIndustrial && !isIndustrialZone) {
    compatScore -= 10;
    compatReasons.push('Greenfield site lacks industrial utilities (-10)');
  }

  // Population Suitability
  if (isIndustrial && locationProfile.isHighDensityResidential) {
    compatScore -= 16;
    compatReasons.push('Incompatible proximity to dense residential settlements (-16)');
  } else if (isIndustrial && isIndustrialZone) {
    compatScore += 6;
    compatReasons.push('Planned buffer separation from residential populations (+6)');
  }

  // Unknowns penalty (Unknown conditions reduce confidence and suitability)
  const unknownCount = locationUnknowns.length;
  if (unknownCount > 0) {
    const penalty = Math.min(15, unknownCount * 3);
    compatScore -= penalty;
    compatReasons.push(`Unverified location data gaps (${unknownCount} critical unknowns) reduce suitability (-${penalty})`);
  }

  compatScore = Math.round(Math.max(10, Math.min(95, compatScore)));

  let locationCompatibilityClassification: LocationImpactContext['locationCompatibilityClassification'] =
    'Conditional / Safeguards Required';

  if (compatScore >= 70) {
    locationCompatibilityClassification = 'Highly Compatible';
  } else if (compatScore >= 55) {
    locationCompatibilityClassification = 'Moderately Compatible';
  } else if (compatScore >= 40) {
    locationCompatibilityClassification = 'Conditional / Safeguards Required';
  } else {
    locationCompatibilityClassification = 'High Conflict / Incompatible';
  }

  const compatibilityRationale =
    `Location Compatibility is evaluated as ${locationCompatibilityClassification} (${compatScore}/100). Key Drivers: ${compatReasons.join('; ')}.`;

  // Calibrate overall confidence based on unknowns
  let confidence = 88;
  if (unknownCount >= 4) {
    confidence = 68; // Significantly reduced due to major data gaps
  } else if (unknownCount >= 2) {
    confidence = 76;
  }
  if (locationVerificationStatus === 'Unverified / Unknown') {
    confidence -= 10;
  }

  const locationImpactContext: LocationImpactContext = {
    selectedLocation,
    locationVerificationStatus,
    landUseContext,
    environmentalContext,
    waterContext,
    populationContext,
    infrastructureContext,
    transportContext,
    publicSafetyContext,
    economicContext,
    administrativeContext,
    sensitiveReceptors,
    locationAdvantages,
    locationRisks,
    locationConstraints,
    locationUnknowns,
    evidenceSources: [
      `OpenStreetMap Geographic Vicinity Data (${infra?.resolvedArea || locationProfile.resolvedArea})`,
      `${districtName} District Environmental & Industrial Profile`,
      'Tamil Nadu Pollution Control Board (TNPCB) Regulatory Framework',
      'Tamil Nadu Combined Development and Building Rules (TNCDBR 2019)',
    ],
    confidence,
    locationCompatibilityScore: compatScore,
    locationCompatibilityClassification,
    compatibilityRationale,
    domainConditionEvaluations,
  };

  return {
    locationImpactContext,
    domainConditionEvaluations,
  };
}

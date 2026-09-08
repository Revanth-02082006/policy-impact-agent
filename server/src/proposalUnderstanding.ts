import {
  ScenarioInput,
  PolicyCategory,
  StructuredProposalUnderstanding,
} from './types.js';

export interface ProposalClassificationResult {
  primaryDomain: PolicyCategory;
  secondaryDomains: string[];
  sector: string;
  confidence: number;
}

/**
 * Robust classification based on the COMPLETE MEANING of the proposal,
 * never on isolated structural keywords (e.g. "campus", "complex", "center", "building").
 */
export function classifyProposalMeaning(
  description: string,
  department?: string
): ProposalClassificationResult {
  const text = (description || '').trim();
  const lower = text.toLowerCase();
  const deptLower = (department || '').toLowerCase();

  // 1. Governance / Public Administration
  // Covers legislative assemblies, secretariats, collectorates, raj bhavan, court complexes, administrative headquarters
  const isGovernance =
    lower.includes('legislative assembly') ||
    lower.includes('secretariat') ||
    lower.includes('collectorate') ||
    lower.includes('parliament') ||
    lower.includes('high court') ||
    lower.includes('district court') ||
    lower.includes('raj bhavan') ||
    lower.includes('administrative complex') ||
    lower.includes('administrative headquarters') ||
    lower.includes('government headquarters') ||
    lower.includes('civic centre headquarters') ||
    (deptLower.includes('public works') && lower.includes('assembly')) ||
    deptLower.includes('legislative') ||
    deptLower.includes('general administration');

  // 2. Transport & Transport Infrastructure
  // Roads, highways, expressways, ring roads, bypasses, flyovers, bridges, metro rail, railway, bus terminus
  const isTransport =
    lower.includes('highway') ||
    lower.includes('expressway') ||
    lower.includes('bypass') ||
    lower.includes('ring road') ||
    lower.includes('flyover') ||
    lower.includes('road widening') ||
    lower.includes('widen road') ||
    lower.includes('metro rail') ||
    lower.includes('railway') ||
    lower.includes('bus terminus') ||
    lower.includes('transit corridor') ||
    lower.includes('elevated corridor') ||
    lower.includes('underpass') ||
    lower.includes('traffic diversion') ||
    lower.includes('one-way traffic') ||
    deptLower.includes('transport') ||
    deptLower.includes('highways');

  // 3. Water Resources & Disaster Resilience
  // Dams, reservoirs, flood control, canals, barrages, river training, surplus water release
  const isWaterResources =
    lower.includes('flood-control reservoir') ||
    lower.includes('flood control') ||
    lower.includes('flood control reservoir') ||
    lower.includes('reservoir') ||
    lower.includes('dam') ||
    lower.includes('barrage') ||
    lower.includes('check dam') ||
    lower.includes('irrigation canal') ||
    lower.includes('water diversion') ||
    lower.includes('water release') ||
    lower.includes('surplus water') ||
    lower.includes('sluice') ||
    lower.includes('river basin management') ||
    deptLower.includes('water resources');

  // 4. Municipal Infrastructure / Water & Sanitation
  // Sewage treatment plants, underground drainage, solid waste processing, municipal dump yard, stormwater drain
  const isMunicipalSanitation =
    lower.includes('sewage treatment') ||
    lower.includes('treatment plant') ||
    lower.includes('underground drainage') ||
    lower.includes('solid waste') ||
    lower.includes('waste processing') ||
    lower.includes('compost yard') ||
    lower.includes('biomethanation') ||
    lower.includes('storm water drain') ||
    lower.includes('stormwater drain') ||
    lower.includes('sanitation network') ||
    lower.includes('drinking water supply network') ||
    (deptLower.includes('municipal administration') && (lower.includes('drainage') || lower.includes('waste') || lower.includes('sewage')));

  // 5. Land Use / Urban & Regional Development
  // Land conversion, rezoning, converting agricultural land into industrial/urban, master plan zoning
  const isLandUse =
    lower.includes('convert agricultural land') ||
    lower.includes('converting agricultural land') ||
    lower.includes('convert fertile land') ||
    lower.includes('farmland conversion') ||
    lower.includes('land use conversion') ||
    lower.includes('rezoning') ||
    lower.includes('master plan amendment') ||
    lower.includes('urban expansion zone') ||
    lower.includes('convert farmland') ||
    deptLower.includes('town and country planning') ||
    (deptLower.includes('housing and urban development') && lower.includes('convert'));

  // 6. Industry & Economic Development
  // Factories, textile units, cement factories, chemical plants, manufacturing parks, industrial estates, SIPCOT, TIDCO
  const isIndustry =
    lower.includes('factory') ||
    lower.includes('manufacturing plant') ||
    lower.includes('textile unit') ||
    lower.includes('textile mill') ||
    lower.includes('industrial estate') ||
    lower.includes('industrial park') ||
    lower.includes('industrial zone') ||
    lower.includes('cement factory') ||
    lower.includes('steel mill') ||
    lower.includes('chemical plant') ||
    lower.includes('tannery') ||
    lower.includes('sipcot') ||
    lower.includes('tidco') ||
    lower.includes('special economic zone') ||
    deptLower.includes('industries');

  // 7. Healthcare & Clinical Services
  // Hospitals, PHCs, medical colleges with hospital, clinics, trauma centers, health centres
  const isHealthcare =
    lower.includes('hospital') ||
    lower.includes('trauma care') ||
    lower.includes('primary health centre') ||
    lower.includes('phc') ||
    lower.includes('clinic') ||
    lower.includes('dispensary') ||
    lower.includes('maternity center') ||
    lower.includes('super-specialty') ||
    lower.includes('multi-specialty') ||
    deptLower.includes('health') ||
    deptLower.includes('family welfare');

  // 8. Education
  // College, university, school, polytechnic, student hostels, classrooms (ONLY if explicitly educational, not generic "campus" or "complex")
  const isEducation =
    (lower.includes('college') ||
      lower.includes('university') ||
      lower.includes('school') ||
      lower.includes('polytechnic') ||
      lower.includes('educational institute') ||
      lower.includes('vocational institute') ||
      lower.includes('arts and science college') ||
      lower.includes('engineering college') ||
      lower.includes('medical college') ||
      lower.includes('student') ||
      lower.includes('classroom') ||
      deptLower.includes('education')) &&
    !isGovernance; // Explicit safeguard: governance administrative complexes never misclassified as education

  // 9. Public Safety & Home Affairs
  // CCTV surveillance, police stations, checkpoints, law and order, traffic policing
  const isPublicSafety =
    lower.includes('cctv') ||
    lower.includes('surveillance camera') ||
    lower.includes('police station') ||
    lower.includes('police patrol') ||
    lower.includes('checkpoint') ||
    lower.includes('law and order') ||
    deptLower.includes('home') ||
    deptLower.includes('police');

  // 10. Housing & Social Resettlement
  // Housing board tenements, slum clearance, rehabilitation colonies, affordable housing
  const isHousing =
    lower.includes('housing board') ||
    lower.includes('tenements') ||
    lower.includes('slum clearance') ||
    lower.includes('rehabilitation colony') ||
    lower.includes('affordable housing') ||
    (lower.includes('relocate') && lower.includes('families') && !isTransport && !isIndustry);

  // 11. Environment & Forest
  // Tree planting, afforestation, reserve forest, wildlife sanctuary, park, wetland restoration
  const isEnvironment =
    lower.includes('afforestation') ||
    lower.includes('tree planting') ||
    lower.includes('reserve forest') ||
    lower.includes('wildlife sanctuary') ||
    lower.includes('wetland conservation') ||
    lower.includes('solar park') ||
    lower.includes('wind farm') ||
    deptLower.includes('forest') ||
    deptLower.includes('climate change');

  // Complete-Meaning Priority Resolution
  let primaryDomain: PolicyCategory = 'Municipal Administration';
  let sector = 'General Public Administration';
  let confidence = 88;

  // Purpose Check: What is the PRIMARY ACTION AND INTENDED ASSET?
  if (isGovernance) {
    primaryDomain = 'Governance / Public Administration';
    sector = 'Governance & Public Administration';
    confidence = 96;
  } else if (lower.includes('relocate') && isTransport) {
    // e.g. "Relocate 500 families to construct a new highway"
    // The ultimate asset/purpose is Transport Infrastructure with major Resettlement secondary
    primaryDomain = 'Transport Infrastructure';
    sector = 'Transport Infrastructure & Highways';
    confidence = 95;
  } else if (isLandUse) {
    primaryDomain = 'Land Use / Urban & Regional Development';
    sector = 'Urban & Regional Land Planning';
    confidence = 94;
  } else if (isIndustry) {
    primaryDomain = 'Industry / Economic Development';
    sector = 'Industry & Manufacturing';
    confidence = 95;
  } else if (isTransport) {
    primaryDomain = 'Transport Infrastructure';
    sector = 'Transport Infrastructure & Mobility';
    confidence = 94;
  } else if (isMunicipalSanitation) {
    primaryDomain = 'Municipal Infrastructure / Water & Sanitation';
    sector = 'Municipal Infrastructure & Sanitation';
    confidence = 94;
  } else if (isWaterResources) {
    primaryDomain = 'Water Resources / Disaster Resilience';
    sector = 'Water Resources & Disaster Resilience';
    confidence = 95;
  } else if (isHealthcare) {
    primaryDomain = 'Healthcare';
    sector = 'Public Health & Clinical Infrastructure';
    confidence = 94;
  } else if (isEducation) {
    primaryDomain = 'Education';
    sector = 'Higher & School Education';
    confidence = 92;
  } else if (isPublicSafety) {
    primaryDomain = 'Public Safety';
    sector = 'Public Safety & Law Enforcement';
    confidence = 92;
  } else if (isHousing) {
    primaryDomain = 'Housing';
    sector = 'Housing & Community Resettlement';
    confidence = 90;
  } else if (isEnvironment) {
    primaryDomain = 'Environment';
    sector = 'Environment & Ecological Management';
    confidence = 90;
  }

  // Identify Secondary Domains based on contextual consequences & interdependencies
  const secondaryDomains: string[] = [];

  // Environmental impact triggers
  if (
    lower.includes('factory') ||
    lower.includes('industrial') ||
    lower.includes('chemical') ||
    lower.includes('effluent') ||
    lower.includes('sewage') ||
    lower.includes('highway') ||
    lower.includes('dam') ||
    lower.includes('agricultural land') ||
    lower.includes('wetland') ||
    lower.includes('trees') ||
    lower.includes('pollution')
  ) {
    if (!primaryDomain.includes('Environment')) secondaryDomains.push('Environment');
  }

  // Agriculture / Land Use triggers
  if (
    lower.includes('agricultural land') ||
    lower.includes('farmland') ||
    lower.includes('fertile') ||
    lower.includes('crop') ||
    lower.includes('farmer') ||
    lower.includes('irrigation') ||
    lower.includes('canal')
  ) {
    if (!primaryDomain.includes('Land Use')) {
      secondaryDomains.push('Agriculture / Land Use');
    }
  }

  // Water Resources triggers
  if (
    lower.includes('water') ||
    lower.includes('river') ||
    lower.includes('aquifer') ||
    lower.includes('reservoir') ||
    lower.includes('drainage') ||
    lower.includes('dam') ||
    lower.includes('effluent') ||
    lower.includes('factory')
  ) {
    if (!primaryDomain.includes('Water Resources')) {
      secondaryDomains.push('Water Resources');
    }
  }

  // Transport triggers
  if (
    lower.includes('traffic') ||
    lower.includes('road') ||
    lower.includes('freight') ||
    lower.includes('vehicle') ||
    lower.includes('factory') ||
    lower.includes('assembly') ||
    lower.includes('hospital')
  ) {
    if (!primaryDomain.includes('Transport')) {
      secondaryDomains.push('Transport');
    }
  }

  // Public Health & Safety triggers
  if (
    lower.includes('factory') ||
    lower.includes('effluent') ||
    lower.includes('pollut') ||
    lower.includes('toxic') ||
    lower.includes('cement') ||
    lower.includes('chemical') ||
    lower.includes('sewage') ||
    lower.includes('highway')
  ) {
    if (!primaryDomain.includes('Health') && !primaryDomain.includes('Safety')) {
      secondaryDomains.push('Public Health');
      if (lower.includes('highway') || lower.includes('traffic')) {
        secondaryDomains.push('Public Safety');
      }
    }
  }

  // Municipal Administration triggers
  if (
    lower.includes('municipal') ||
    lower.includes('urban') ||
    lower.includes('city') ||
    lower.includes('drainage') ||
    lower.includes('civic') ||
    lower.includes('factory') ||
    lower.includes('complex') ||
    lower.includes('highway')
  ) {
    if (!primaryDomain.includes('Municipal Administration') && !primaryDomain.includes('Sanitation')) {
      secondaryDomains.push('Municipal Administration');
    }
  }

  // Social / Resettlement triggers
  if (
    lower.includes('relocate') ||
    lower.includes('displacement') ||
    lower.includes('families') ||
    lower.includes('slum') ||
    lower.includes('eviction') ||
    lower.includes('farmer')
  ) {
    if (!primaryDomain.includes('Housing')) {
      secondaryDomains.push('Social / Resettlement');
      secondaryDomains.push('Housing');
    }
  }

  // Legal / Regulatory compliance triggers
  if (
    lower.includes('factory') ||
    lower.includes('industrial') ||
    lower.includes('land acquisition') ||
    lower.includes('relocate') ||
    lower.includes('convert') ||
    lower.includes('dam')
  ) {
    secondaryDomains.push('Legal / Regulatory');
  }

  // Deduplicate and filter out primary
  const finalSecondary = Array.from(
    new Set(
      secondaryDomains.filter(
        d => !primaryDomain.toLowerCase().includes(d.toLowerCase())
      )
    )
  );

  return {
    primaryDomain,
    secondaryDomains: finalSecondary,
    sector,
    confidence,
  };
}

/**
 * Extracts explicit budget metrics strictly from proposal text (FACT).
 */
function extractExplicitBudget(text: string): string {
  const budgetRegex = /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(crore|cr|lakhs?|lakh|million|billion)?/i;
  const match = text.match(budgetRegex);
  if (match) {
    const val = match[1];
    const unit = match[2] ? ` ${match[2]}` : '';
    return `₹${val}${unit}`;
  }

  const altBudgetRegex = /([\d,]+(?:\.\d+)?)\s*(?:crore|cr|lakhs?)\s*(?:rupees|budget|cost|investment)/i;
  const match2 = text.match(altBudgetRegex);
  if (match2) {
    return `₹${match2[1]} crore`;
  }

  return 'Unstated in proposal (Subject to administrative DPR / financial sanction)';
}

/**
 * Extracts explicit affected population or households strictly from proposal text (FACT).
 */
function extractExplicitPopulation(text: string): string {
  const familyRegex = /(\d[\d,]*)\s*(families|households|homes|slum dwellers|farmers|residents|citizens|people|patients|students)/i;
  const match = text.match(familyRegex);
  if (match) {
    const count = parseInt(match[1].replace(/,/g, ''), 10);
    const entity = match[2].toLowerCase();
    if (entity.includes('famil') || entity.includes('household') || entity.includes('home')) {
      return `${count.toLocaleString()} families (~${(count * 4).toLocaleString()} residents)`;
    }
    return `${count.toLocaleString()} ${entity}`;
  }
  return 'Unstated in proposal (Subject to local ward / field survey)';
}

/**
 * Extracts explicit land type strictly from proposal text (FACT).
 */
function extractExplicitLandType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('fertile agricultural land') || lower.includes('agricultural land') || lower.includes('farm land') || lower.includes('farmland')) {
    return 'Fertile agricultural land (Cultivable agrarian tract)';
  }
  if (lower.includes('residential area') || lower.includes('residential zone') || lower.includes('settlement')) {
    return 'Residential urban/suburban zone';
  }
  if (lower.includes('industrial estate') || lower.includes('sipcot') || lower.includes('sidco')) {
    return 'Approved industrial estate (Zoned manufacturing tract)';
  }
  if (lower.includes('bypass') || lower.includes('vacant corridor') || lower.includes('corridor')) {
    return 'Designated transport corridor / bypass right-of-way';
  }
  if (lower.includes('wetland') || lower.includes('river basin') || lower.includes('lake bed')) {
    return 'Eco-sensitive water body / riparian catchment tract';
  }
  if (lower.includes('forest land') || lower.includes('reserve forest')) {
    return 'Statutory forest land';
  }
  return 'Unstated in proposal (Subject to revenue records verification)';
}

/**
 * Extracts the primary action verb / administrative action.
 */
function extractPrimaryAction(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('relocate') || lower.includes('displacement')) {
    return 'Relocation & Resettlement of Settled Residents';
  }
  if (lower.includes('convert agricultural') || lower.includes('rezone') || lower.includes('conversion')) {
    return 'Statutory Land Use Reclassification & Agrarian Conversion';
  }
  if (lower.includes('widen') || lower.includes('widening')) {
    return 'Highway Corridor Widening & Capacity Expansion';
  }
  if (lower.includes('construct') || lower.includes('build') || lower.includes('erect')) {
    return 'New Capital Civil Infrastructure Construction';
  }
  if (lower.includes('release') || lower.includes('discharge') || lower.includes('divert')) {
    return 'Regulated Hydraulic Discharge & Sluice Gate Operation';
  }
  if (lower.includes('install') || lower.includes('deploy')) {
    return 'Civic Technology Deployment & Enforcement';
  }
  if (lower.includes('shut down') || lower.includes('demolish')) {
    return 'Demolition / Regulatory Facility Closure';
  }
  return 'Strategic Administrative Intervention';
}

/**
 * Extracts target asset or project being created / modified.
 */
function extractTargetAsset(text: string, primaryDomain: PolicyCategory): string {
  const lower = text.toLowerCase();

  if (lower.includes('legislative assembly') || lower.includes('secretariat')) {
    return 'Integrated Tamil Nadu Legislative Assembly & Secretariat Complex';
  }
  if (lower.includes('textile factory')) {
    return 'Industrial Textile Manufacturing Facility';
  }
  if (lower.includes('cement factory')) {
    return 'Heavy Industrial Cement Production Plant';
  }
  if (lower.includes('highway') || lower.includes('expressway')) {
    return 'Multi-Lane Highway Transit Corridor';
  }
  if (lower.includes('hospital') || lower.includes('trauma center')) {
    return 'Multi-Specialty Government Hospital & Trauma Care Center';
  }
  if (lower.includes('college campus') || lower.includes('university')) {
    return 'Government Higher Education College Campus';
  }
  if (lower.includes('sewage treatment')) {
    return 'Municipal Sewage Treatment Plant (STP)';
  }
  if (lower.includes('reservoir') || lower.includes('flood-control')) {
    return 'Flood-Control Water Storage Reservoir';
  }
  if (lower.includes('dam')) {
    return 'Hydraulic Dam & Sluice Gate Infrastructure';
  }
  if (lower.includes('industrial zone') || lower.includes('industrial park')) {
    return 'Planned Industrial Park & Manufacturing Zone';
  }
  if (lower.includes('cctv')) {
    return 'Smart City CCTV Surveillance & Safety Network';
  }

  return text.length > 50 ? `${text.slice(0, 47)}...` : text;
}

/**
 * Determines responsible administrative department.
 * STRICT RULE: If the exact authority or department cannot be confidently determined,
 * return "Requires Administrative Verification" rather than inventing one.
 */
function determineResponsibleDepartment(
  primaryDomain: PolicyCategory,
  deptProvided?: string
): string {
  if (deptProvided && deptProvided.trim().length > 3) {
    return deptProvided.trim();
  }

  switch (primaryDomain) {
    case 'Governance / Public Administration':
      return 'Public Works Department (Buildings) & Legislative Assembly Secretariat';
    case 'Transport Infrastructure':
    case 'Transport':
      return 'Highways and Minor Ports Department';
    case 'Industry / Economic Development':
    case 'Industry':
      return 'Industries, Investment Promotion and Commerce Department';
    case 'Healthcare':
      return 'Health and Family Welfare Department';
    case 'Education':
      return 'Higher Education Department';
    case 'Water Resources':
    case 'Water Resources / Disaster Resilience':
      return 'Water Resources Department (WRD)';
    case 'Municipal Infrastructure / Water & Sanitation':
    case 'Municipal Administration':
      return 'Municipal Administration and Water Supply Department';
    case 'Land Use / Urban & Regional Development':
    case 'Urban Planning':
      return 'Housing and Urban Development Department & Directorate of Town and Country Planning (DTCP)';
    case 'Public Safety':
    case 'Police':
      return 'Home, Prohibition and Excise (Police) Department';
    case 'Environment':
    case 'Forest':
      return 'Environment, Climate Change and Forests Department';
    case 'Housing':
      return 'Housing and Urban Development Department';
    default:
      return 'Requires Administrative Verification';
  }
}

/**
 * Determines lead administrative authority.
 * STRICT RULE: If cannot be confidently determined, return "Requires Administrative Verification".
 */
function determineLeadAdministrativeAuthority(
  primaryDomain: PolicyCategory,
  deptProvided?: string
): string {
  if (deptProvided && deptProvided.trim().length > 3) {
    return `${deptProvided} Competent Authority`;
  }

  switch (primaryDomain) {
    case 'Governance / Public Administration':
      return 'Chief Engineer (Buildings), Public Works Department / Secretary, Legislative Assembly';
    case 'Transport Infrastructure':
    case 'Transport':
      return 'Chief Engineer (Highways), Construction & Maintenance / NHAI Project Director';
    case 'Industry / Economic Development':
    case 'Industry':
      return 'SIPCOT / Guidance Tamil Nadu / District Collector';
    case 'Healthcare':
      return 'Director of Medical Education & Research / Directorate of Medical and Rural Health Services';
    case 'Education':
      return 'Directorate of Collegiate Education';
    case 'Water Resources':
    case 'Water Resources / Disaster Resilience':
      return 'Chief Engineer, Water Resources Department';
    case 'Municipal Infrastructure / Water & Sanitation':
    case 'Municipal Administration':
      return 'Commissioner of Municipal Administration / Municipal Corporation Commissioner';
    case 'Land Use / Urban & Regional Development':
    case 'Urban Planning':
      return 'Director of Town and Country Planning (DTCP) / Member Secretary, CMDA';
    case 'Public Safety':
    case 'Police':
      return 'Director General of Police (DGP) / Commissioner of Police';
    case 'Environment':
    case 'Forest':
      return 'Member Secretary, Tamil Nadu Pollution Control Board (TNPCB)';
    case 'Housing':
      return 'Managing Director, Tamil Nadu Urban Habitat Development Board (TNUHDB)';
    default:
      return 'Requires Administrative Verification';
  }
}

/**
 * Extracts Administrative Level:
 * Village | Town | Municipality | Corporation | District | State
 */
function determineAdministrativeLevel(
  text: string,
  input: ScenarioInput,
  primaryDomain: PolicyCategory
): 'Village' | 'Town' | 'Municipality' | 'Corporation' | 'District' | 'State' {
  const lower = `${text} ${input.location || ''} ${input.city || ''} ${input.town || ''} ${input.village || ''}`.toLowerCase();

  if (
    primaryDomain === 'Governance / Public Administration' ||
    lower.includes('state') ||
    lower.includes('tamil nadu') ||
    lower.includes('legislative assembly') ||
    lower.includes('secretariat')
  ) {
    return 'State';
  }

  if (
    lower.includes('chennai') ||
    lower.includes('coimbatore') ||
    lower.includes('madurai') ||
    lower.includes('tiruppur') ||
    lower.includes('salem') ||
    lower.includes('trichy') ||
    lower.includes('tiruchirappalli') ||
    lower.includes('corporation')
  ) {
    return 'Corporation';
  }

  if (lower.includes('municipality') || lower.includes('municipal')) {
    return 'Municipality';
  }

  if (lower.includes('village') || lower.includes('panchayat') || lower.includes('rural') || lower.includes('hamlet')) {
    return 'Village';
  }

  if (lower.includes('town') || lower.includes('taluk') || lower.includes('thondamuthur') || lower.includes('perundurai')) {
    return 'Town';
  }

  if (lower.includes('district') || input.district) {
    return 'District';
  }

  return 'District';
}

/**
 * Extracts Project Scale:
 * Local | Ward | City | District | State | Regional
 */
function determineProjectScale(
  text: string,
  adminLevel: 'Village' | 'Town' | 'Municipality' | 'Corporation' | 'District' | 'State'
): 'Local' | 'Ward' | 'City' | 'District' | 'State' | 'Regional' {
  const lower = text.toLowerCase();
  if (adminLevel === 'State' || lower.includes('state-wide') || lower.includes('state')) {
    return 'State';
  }
  if (lower.includes('highway') || lower.includes('corridor') || lower.includes('dam') || lower.includes('river basin')) {
    return 'Regional';
  }
  if (lower.includes('district') || adminLevel === 'District') {
    return 'District';
  }
  if (adminLevel === 'Corporation' || lower.includes('city')) {
    return 'City';
  }
  if (lower.includes('ward') || lower.includes('street') || lower.includes('junction')) {
    return 'Ward';
  }
  return 'Local';
}

/**
 * Core function extracting the comprehensive StructuredProposalUnderstanding
 * running BEFORE all domain agents, scoring, and recommendation pipelines.
 */
export function extractStructuredProposalUnderstanding(
  input: ScenarioInput
): StructuredProposalUnderstanding {
  const rawText = input.description || 'Proposed Administrative Intervention';
  const classification = classifyProposalMeaning(rawText, input.department);

  const primaryAction = extractPrimaryAction(rawText);
  const asset = extractTargetAsset(rawText, classification.primaryDomain);
  const budget = extractExplicitBudget(rawText);
  const affectedPopulation = extractExplicitPopulation(rawText);
  const landType = extractExplicitLandType(rawText);

  const loc =
    input.location ||
    [input.village, input.town || input.city, input.district, 'Tamil Nadu']
      .filter(Boolean)
      .join(', ') ||
    'Tamil Nadu, India';

  const administrativeLevel = determineAdministrativeLevel(
    rawText,
    input,
    classification.primaryDomain
  );
  const scale = determineProjectScale(rawText, administrativeLevel);

  const responsibleDepartment = determineResponsibleDepartment(
    classification.primaryDomain,
    input.department
  );
  const leadAdministrativeAuthority = determineLeadAdministrativeAuthority(
    classification.primaryDomain,
    input.department
  );

  // Explicit vs Inferred Stakeholders (Strict separation)
  const explicitStakeholders: string[] = [];
  const lower = rawText.toLowerCase();
  if (lower.includes('family') || lower.includes('families')) explicitStakeholders.push('Affected Settled Families');
  if (lower.includes('farmer')) explicitStakeholders.push('Cultivating Farmers');
  if (lower.includes('student')) explicitStakeholders.push('Students');
  if (lower.includes('patient')) explicitStakeholders.push('Hospital Patients');
  if (lower.includes('trader') || lower.includes('shopkeeper')) explicitStakeholders.push('Local Traders & Shopkeepers');
  if (lower.includes('assembly') || lower.includes('secretariat')) {
    explicitStakeholders.push('Members of Legislative Assembly & State Secretariat Staff');
  }

  const inferredStakeholders: string[] = [];
  if (classification.primaryDomain === 'Industry / Economic Development') {
    inferredStakeholders.push('Tamil Nadu Pollution Control Board (TNPCB)');
    inferredStakeholders.push('District Revenue Administration');
    inferredStakeholders.push('Local Resident Welfare Associations');
    if (landType.includes('agricultural')) inferredStakeholders.push('Agricultural Laborers & Neighboring Farmers');
  } else if (classification.primaryDomain === 'Transport Infrastructure') {
    inferredStakeholders.push('Highways Department & Traffic Enforcement Authorities');
    inferredStakeholders.push('Commuters & Freight Operators');
    if (affectedPopulation.includes('families')) inferredStakeholders.push('Resettlement Action Plan (RAP) Administrators');
  } else if (classification.primaryDomain === 'Governance / Public Administration') {
    inferredStakeholders.push('Public Works Department Engineers');
    inferredStakeholders.push('Chennai Metropolitan Development Authority (CMDA)');
    inferredStakeholders.push('Citizens & Civic Public Representatives');
  } else {
    inferredStakeholders.push('Local Civic Administration');
    inferredStakeholders.push('Community Residents');
  }

  // Positive Objectives (Stated or directly implied purpose)
  const positiveObjectives: string[] = [
    `Establish / deliver ${asset} to achieve administrative objectives for ${classification.sector}.`,
  ];
  if (classification.primaryDomain === 'Governance / Public Administration') {
    positiveObjectives.push('Provide state-of-the-art administrative facilities for state legislative and executive governance.');
  } else if (classification.primaryDomain === 'Industry / Economic Development') {
    positiveObjectives.push('Expand industrial manufacturing and potential regional economic throughput.');
  } else if (classification.primaryDomain === 'Transport Infrastructure') {
    positiveObjectives.push('Enhance arterial road transit capacity and reduce vehicular freight congestion.');
  }

  // Potential Impacts (Reasonable operational inferences)
  const potentialImpacts: string[] = [
    `Operational establishment of ${asset} in ${loc}.`,
    `Capital allocation requirement (${budget.includes('₹') ? budget : 'Pending approved Detailed Project Report'}).`,
  ];
  if (classification.secondaryDomains.includes('Transport')) {
    potentialImpacts.push('Altered traffic patterns and localized vehicle loading on feeder corridors.');
  }
  if (classification.secondaryDomains.includes('Water Resources')) {
    potentialImpacts.push('Incremental industrial or municipal water intake requirement.');
  }

  // Potential Risks & Negative Consequences
  const potentialRisks: string[] = [];
  if (affectedPopulation.includes('families')) {
    potentialRisks.push(`Involuntary physical displacement and livelihood disruption for ${affectedPopulation}.`);
  }
  if (landType.includes('agricultural')) {
    potentialRisks.push('Permanent loss of fertile cultivable topsoil and agrarian livelihood displacement.');
  }
  if (classification.secondaryDomains.includes('Environment') || classification.primaryDomain === 'Industry / Economic Development') {
    potentialRisks.push('Effluent discharge, industrial air emissions, and local environmental compliance risks.');
  }
  if (potentialRisks.length === 0) {
    potentialRisks.push('Project execution delays, capital cost escalations, and civil contractor compliance friction.');
  }

  // Required Approvals / Clearances
  const requiredApprovals: string[] = [
    'Administrative Sanction & Cabinet / Competent Authority Approval',
  ];
  if (budget.includes('₹')) {
    requiredApprovals.push('Finance Department Expenditure Clearance');
  }
  if (classification.primaryDomain === 'Industry / Economic Development' || classification.secondaryDomains.includes('Environment')) {
    requiredApprovals.push('Consent to Establish (CTE) from Tamil Nadu Pollution Control Board (TNPCB)');
  }
  if (classification.primaryDomain === 'Transport Infrastructure' || affectedPopulation.includes('families')) {
    requiredApprovals.push('Social Impact Assessment & Rehabilitation Award under RFCTLARR Act (2013)');
  }
  if (classification.primaryDomain === 'Governance / Public Administration' || classification.primaryDomain === 'Land Use / Urban & Regional Development') {
    requiredApprovals.push('Master Plan Land Use Sanction & Town Planning Clearance (CMDA / DTCP)');
  }

  // Key Unknown Information (Data Gaps that must NOT be invented)
  const unknowns: string[] = [
    'Project Duration & Construction Schedule: Unknown (unstated in proposal; subject to DPR)',
    'Detailed Environmental Impact Assessment (EIA) baseline: Unknown (unsubmitted in proposal)',
    'Public Consensus & Citizen Consultation records: Unknown (no formal survey submitted)',
    'Comprehensive Operation & Maintenance (O&M) lifecycle budget: Unknown',
  ];
  if (budget.includes('Unstated')) {
    unknowns.push('Detailed Project Cost Estimate / Approved Financial Sanction: Unknown (unstated in proposal)');
  }
  if (affectedPopulation.includes('Unstated')) {
    unknowns.push('Exact Affected Population & Household Census: Unknown (unstated in proposal; requires field survey)');
  }
  if (classification.primaryDomain === 'Industry / Economic Development') {
    unknowns.push('Number of Direct & Indirect Jobs Created: Unknown (unstated in proposal)');
    unknowns.push('Daily Industrial Water Demand & Effluent Discharge Volume: Unknown');
  }

  // Urgency
  let urgency: 'Low' | 'Standard' | 'Urgent' | 'Emergency' = 'Standard';
  if (lower.includes('emergency') || lower.includes('cyclone') || lower.includes('flood') || lower.includes('disaster')) {
    urgency = 'Emergency';
  } else if (lower.includes('urgent') || lower.includes('priority') || lower.includes('immediate')) {
    urgency = 'Urgent';
  }

  const proposalObjective = `Administer execution of "${rawText}" in ${loc}.`;

  return {
    proposalObjective,
    primaryAction,
    asset,
    sector: classification.sector,
    primaryDomain: classification.primaryDomain,
    secondaryDomains: classification.secondaryDomains,
    responsibleDepartment,
    leadAdministrativeAuthority,
    geographicLocation: loc,
    administrativeLevel,
    scale,
    budget,
    affectedPopulation,
    landType,
    explicitStakeholders,
    inferredStakeholders,
    positiveObjectives,
    potentialImpacts,
    potentialRisks,
    requiredApprovals,
    unknowns,
    urgency,
    confidence: classification.confidence,
  };
}

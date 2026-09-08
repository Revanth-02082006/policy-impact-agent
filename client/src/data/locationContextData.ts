import { ScenarioInput } from '../types/index.js';

export interface DistrictEnvironmentalProfile {
  district: string;
  majorWaterBodies: string[];
  ecologicalZones: string[];
  primaryLivelihoods: string[];
  approvedIndustrialParks: string[];
  knownFarmlandBelts: string[];
  highDensityResidentialZones: string[];
  floodVulnerability: 'High' | 'Moderate' | 'Low';
  droughtVulnerability: 'High' | 'Moderate' | 'Low';
  groundwaterStatus: 'Over-Exploited / Critical' | 'Semi-Critical' | 'Safe';
  applicableSpecialRegulations: string[];
}

export interface LocationAdministrativeContext {
  district: string;
  resolvedArea: string;
  zoningClassification: 
    | 'Approved Industrial Estate (SIPCOT/SIDCO)'
    | 'Agricultural / Rural Farmland Zone'
    | 'Eco-Sensitive Water Body Buffer'
    | 'Densely Populated Residential / Urban Core'
    | 'Commercial & Transit Corridor'
    | 'Coastal CRZ Zone'
    | 'Hill & Forest Conservation Zone'
    | 'Suburban Mixed / Growth Corridor';
  isApprovedIndustrialZone: boolean;
  isAgriculturalOrRuralZone: boolean;
  isEcoSensitiveOrWaterBuffer: boolean;
  isHighDensityResidential: boolean;
  nearbyWaterBodies: string[];
  ecologicalFeatures: string[];
  primaryLivelihoods: string[];
  disasterVulnerabilities: string[];
  municipalInfrastructureBaseline: string[];
  applicableStatutoryFrameworks: string[];
  highRiskActionsDetected: string[];
  contextualAnalysisSummary: string;
  contextualRiskAdjustment: {
    gainAdjustment: number;
    frictionAdjustment: number;
    reasoning: string;
  };
}

export const DISTRICT_ENVIRONMENTAL_PROFILES: Record<string, DistrictEnvironmentalProfile> = {
  Tiruppur: {
    district: 'Tiruppur',
    majorWaterBodies: [
      'Noyyal River (Severely effluent-stressed industrial river basin)',
      'Amaravathi River & Dam catchment',
      'Nanjarayan Tank (Notified Bird Sanctuary & Wetland)',
      'Uppar Dam Reservoir',
      'Thirumoorthy Dam canal system'
    ],
    ecologicalZones: [
      'Noyyal River riparian buffer zone',
      'Nanjarayan Bird Sanctuary Eco-Sensitive Zone',
      'Anamalai Tiger Reserve foothills (Udumalpet border)'
    ],
    primaryLivelihoods: [
      'Textile knitting, bleaching, dyeing & knitwear exports',
      'Agricultural farming (Kangeyam cattle, coconut, groundnut, maize)',
      'Powerloom and yarn spinning'
    ],
    approvedIndustrialParks: [
      'SIPCOT Industrial Complex Perundurai/Tiruppur',
      'SIDCO Industrial Estate Mudalipalayam',
      'SIDCO Industrial Estate Angeripalayam',
      'Nethaji Apparel Park (NAP), New Tiruppur'
    ],
    knownFarmlandBelts: [
      'Dharapuram agrarian belt',
      'Kangeyam rural farming tract',
      'Madathukulam canal-irrigated farmland',
      'Kundadam agricultural union',
      'Uthukuli dairy farming tract'
    ],
    highDensityResidentialZones: [
      'Tiruppur North core municipal wards',
      'Tiruppur South bazaar ward',
      'Kumar Nagar residential ward',
      'Rayapuram congested settlement',
      'Velampalayam densely populated worker colony'
    ],
    floodVulnerability: 'Moderate',
    droughtVulnerability: 'High',
    groundwaterStatus: 'Over-Exploited / Critical',
    applicableSpecialRegulations: [
      'TNPCB Mandatory Zero Liquid Discharge (ZLD) for trade effluent',
      'Madras High Court Strict Directives on Noyyal River preservation',
      'Tamil Nadu Combined Development & Building Rules (TNCDBR 2019) 15m water body buffer',
      'Water (Prevention and Control of Pollution) Act 1974 Consent to Establish (CTE)'
    ]
  },
  Salem: {
    district: 'Salem',
    majorWaterBodies: [
      'Mettur Dam (Stanley Reservoir — Primary Cauvery storage)',
      'Cauvery River lower basin',
      'Sarabanga River tributary',
      'Thirumanimutharu River (Salem city drainage river)',
      'Yercaud Emerald Lake (Highland wetland)'
    ],
    ecologicalZones: [
      'Shevaroy Hills Reserve Forest (Eastern Ghats corridor)',
      'Yercaud Hill Area Conservation Authority (HACA) zone',
      'Kanjamalai iron ore reserve forest fringe'
    ],
    primaryLivelihoods: [
      'Mango horticulture & agriculture',
      'Sago & tapioca starch processing',
      'Steel, cement & alloy manufacturing',
      'Magnesite mining & limestone quarrying'
    ],
    approvedIndustrialParks: [
      'Steel Authority of India (SAIL) Salem Steel Plant Complex',
      'SIDCO Industrial Estate Mettur Dam',
      'SIDCO Industrial Estate Karuppur',
      'SIPCOT Industrial Park Gangavalli / Salem'
    ],
    knownFarmlandBelts: [
      'Attur fertile sago and paddy basin',
      'Omalur horticultural belt',
      'Edappadi Cauvery-irrigated farmland',
      'Thalaivasal vegetable production belt',
      'Vazhapadi agricultural tract'
    ],
    highDensityResidentialZones: [
      'Salem 5 Roads urban commercial-residential junction',
      'Shevapet dense commercial settlement',
      'Hasthampatti residential ward',
      'Ammapet handloom residential colony',
      'Gugai congested urban settlement'
    ],
    floodVulnerability: 'Moderate',
    droughtVulnerability: 'Moderate',
    groundwaterStatus: 'Over-Exploited / Critical',
    applicableSpecialRegulations: [
      'Hill Area Conservation Authority (HACA) clearance in Shevaroy foothills',
      'Air (Prevention and Control of Pollution) Act 1981 cement/mineral dust standards',
      'Cauvery River Basin riparian protection norms',
      'Public Works Department (PWD) Mettur Dam flood release protocols'
    ]
  },
  Coimbatore: {
    district: 'Coimbatore',
    majorWaterBodies: [
      'Noyyal River upper catchment',
      'Bhavani River & Siruvani River drinking water supply',
      'Aliyar Dam Reservoir & Canal network',
      'Singanallur Lake (Urban Wetland & Biodiversity Heritage Site)',
      'Ukkadam Big Tank (Periyakulam) & Valankulam Lake'
    ],
    ecologicalZones: [
      'Western Ghats Eco-Sensitive Zone (UNESCO World Heritage fringe)',
      'Anamalai Tiger Reserve (Pollachi taluk)',
      'Madukkarai & Boluvampatti Wildlife Corridors (Elephant habitat)'
    ],
    primaryLivelihoods: [
      'Precision engineering, textile machinery, auto-components & pumps',
      'Information Technology & Software Services',
      'Commercial agriculture (Pollachi coconut, Thondamuthur vegetables)',
      'Tea & cardamom plantations (Valparai plateau)'
    ],
    approvedIndustrialParks: [
      'SIDCO Industrial Estate Kurichi',
      'SIDCO Industrial Estate Ganapathy',
      'SIDCO Industrial Estate Malumichampatti',
      'TIDEL Park Coimbatore (ELCOT IT SEZ, Peelamedu)',
      'Eachanari Heavy Industrial Corridor'
    ],
    knownFarmlandBelts: [
      'Pollachi coconut & banana agricultural belt',
      'Thondamuthur vegetable basin',
      'Kinathukadavu fertile red-soil agrarian belt',
      'Annur agricultural tract',
      'Sultanpet dryland farming union'
    ],
    highDensityResidentialZones: [
      'Gandhipuram high-density urban core',
      'RS Puram prime residential sector',
      'Peelamedu urban educational-residential corridor',
      'Saibaba Colony dense residential area',
      'Singanallur high-traffic residential ward'
    ],
    floodVulnerability: 'Low',
    droughtVulnerability: 'High',
    groundwaterStatus: 'Over-Exploited / Critical',
    applicableSpecialRegulations: [
      'Western Ghats Eco-Sensitive Area (ESA) construction prohibitions',
      'Wildlife Protection Act 1972 Elephant Corridor buffer directives',
      'Singanallur Lake Wetland Conservation Regulations',
      'Tamil Nadu Town & Country Planning Act industrial masterplan zoning'
    ]
  },
  Chennai: {
    district: 'Chennai',
    majorWaterBodies: [
      'Adyar River (Estuary & Tidal Waterway)',
      'Cooum River urban drainage channel',
      'Buckingham Canal tidal water corridor',
      'Pallikaranai Marshland (Ramsar Wetland Site No. 1490)',
      'Puzhal (Red Hills) Lake drinking reservoir',
      'Chembarambakkam Lake downstream flood basin'
    ],
    ecologicalZones: [
      'Pallikaranai Marshland Protected Wetland Zone',
      'Guindy National Park (Urban Protected Forest)',
      'Ennore Creek Coastal Wetland Ecosystem',
      'Bay of Bengal Coastal Regulation Zone (CRZ-I/II/III)'
    ],
    primaryLivelihoods: [
      'Information Technology, Financial Services & Consulting',
      'Automotive, Hardware Manufacturing & Port Logistics',
      'Healthcare, Higher Education & Retail Trade',
      'Artisanal coastal fisheries'
    ],
    approvedIndustrialParks: [
      'Guindy Industrial Estate (SIDCO)',
      'Ambattur Industrial Estate (Asia’s largest small-scale industrial hub)',
      'Manali Petrochemical Complex',
      'Ennore Port Industrial Corridor',
      'TIDEL Park Taramani IT SEZ'
    ],
    knownFarmlandBelts: [
      'Suburban fringe agrarian pockets (Madhavaram / Manapakkam perimeter)'
    ],
    highDensityResidentialZones: [
      'T. Nagar mega-commercial & dense residential ward',
      'Mylapore cultural-residential heritage zone',
      'Anna Nagar planned high-density sector',
      'George Town historic high-density market hub',
      'Velachery low-lying flood-vulnerable residential colony',
      'Triplicane high-density settlement'
    ],
    floodVulnerability: 'High',
    droughtVulnerability: 'Moderate',
    groundwaterStatus: 'Over-Exploited / Critical',
    applicableSpecialRegulations: [
      'Coastal Regulation Zone (CRZ) Notification 2019 strict coastline rules',
      'Ramsar Convention Pallikaranai Wetland buffer protection directives',
      'Chennai Metropolitan Development Authority (CMDA) Second Master Plan',
      'Disaster Management Act 2005 Stormwater & Inundation Safeguards'
    ]
  },
  Chengalpattu: {
    district: 'Chengalpattu',
    majorWaterBodies: [
      'Palar River lower basin',
      'Madurantakam Big Lake (Second largest irrigation lake in TN)',
      'Kolavai Lake (Chengalpattu drinking water lake)',
      'Kovalam backwaters & Muttukadu estuary'
    ],
    ecologicalZones: [
      'Vedanthangal Bird Sanctuary (Protected Wetland & Eco-Sensitive Zone)',
      'Karikili Bird Sanctuary',
      'East Coast Road (ECR) coastal eco-sensitive corridor'
    ],
    primaryLivelihoods: [
      'Automotive & electronic manufacturing',
      'Information Technology (OMR / GST Corridor)',
      'Agriculture and dairy farming in Madurantakam/Cheyyur',
      'Coastal fishing & eco-tourism'
    ],
    approvedIndustrialParks: [
      'Mahindra World City SEZ, Chengalpattu',
      'SIPCOT Industrial Park Oragadam (Automotive hub)',
      'SIPCOT Industrial Park Vallam Vadagal',
      'SIPCOT Industrial Park Irungattukottai'
    ],
    knownFarmlandBelts: [
      'Madurantakam extensive paddy farming basin',
      'Cheyyur agrarian and coastal farming belt',
      'Tiruporur rural village farmland'
    ],
    highDensityResidentialZones: [
      'Tambaram city gateway sector',
      'Pallavaram urban corridor',
      'Guduvancheri commuter residential belt',
      'Maraimalai Nagar township',
      'Chengalpattu town core'
    ],
    floodVulnerability: 'High',
    droughtVulnerability: 'Low',
    groundwaterStatus: 'Semi-Critical',
    applicableSpecialRegulations: [
      'Vedanthangal 5km Eco-Sensitive Zone construction restrictions',
      'CRZ 2019 coastal setback norms',
      'Palar River sand mining and industrial discharge ban orders'
    ]
  },
  Thanjavur: {
    district: 'Thanjavur',
    majorWaterBodies: [
      'Cauvery River & Grand Anicut (Kallanai — 2000-year-old irrigation marvel)',
      'Vennar River distributary system',
      'Grand Anicut Canal (Pudukkottai / Thanjavur lifeline)',
      'Kollidam (Coleroon) River northern flood carrier',
      'Vadavar canal & agricultural lake network'
    ],
    ecologicalZones: [
      'Cauvery Delta Protected Agricultural Zone (Strict statutory protection)',
      'Riparian fertile alluvial floodplains',
      'Palk Strait coastal mangrove buffer (Sethubhavachatram)'
    ],
    primaryLivelihoods: [
      'Intensive wetland paddy farming (Rice Bowl of Tamil Nadu)',
      'Coconut, banana, sugarcane & black gram cultivation',
      'Artisanal handicrafts, bronze casting & temple tourism'
    ],
    approvedIndustrialParks: [
      'SIDCO Industrial Estate Nanjikottai',
      'SIDCO Industrial Estate Kumbakonam (Agro-processing only)'
    ],
    knownFarmlandBelts: [
      'Orathanadu intensive paddy cultivation belt',
      'Thiruvaiyaru Cauvery riparian farmland',
      'Kumbakonam fertile alluvial agrarian tract',
      'Papanasam multi-crop agricultural zone',
      'Pattukkottai coconut agricultural belt'
    ],
    highDensityResidentialZones: [
      'Thanjavur Old Town (Brihadisvara Temple perimeter)',
      'Kumbakonam temple city core',
      'Pattukkottai municipal center'
    ],
    floodVulnerability: 'High',
    droughtVulnerability: 'Moderate',
    groundwaterStatus: 'Safe',
    applicableSpecialRegulations: [
      'Tamil Nadu Protected Agricultural Zone Development Act, 2020 (Strict ban on chemical, petrochemical, tannery, and polluting industries)',
      'Heritage site buffer zones around UNESCO Monument (Brihadisvara Temple)',
      'Irrigation network preservation regulations under PWD Cauvery basin code'
    ]
  },
  Namakkal: {
    district: 'Namakkal',
    majorWaterBodies: [
      'Cauvery River western boundary',
      'Thirumanimutharu River lower basin',
      'Kolli Hills mountain streams & Agaya Gangai waterfall',
      'Mohanur Cauvery river intake'
    ],
    ecologicalZones: [
      'Kolli Hills Reserve Forest (Eastern Ghats medicinal plant sanctuary)',
      'Cauvery riverine riparian vegetation'
    ],
    primaryLivelihoods: [
      'Poultry farming and commercial egg exports (Poultry Capital)',
      'Lorry body building & heavy transport fleet operations',
      'Tapioca cultivation & sago processing',
      'Powerloom textile manufacturing'
    ],
    approvedIndustrialParks: [
      'SIDCO Industrial Estate Namakkal (Thummanankurichi)',
      'SIDCO Industrial Estate Tiruchengode',
      'Paramathi Velur agro-industrial cluster'
    ],
    knownFarmlandBelts: [
      'Paramathi Velur betel vine and sugarcane belt',
      'Mohanur Cauvery-irrigated paddy farmland',
      'Sendamangalam agricultural tract',
      'Rasipuram sago and tapioca farming belt',
      'Kolli Hills tribal organic agriculture'
    ],
    highDensityResidentialZones: [
      'Namakkal Fort & Bus Stand urban core',
      'Tiruchengode hill temple town core',
      'Rasipuram commercial center'
    ],
    floodVulnerability: 'Low',
    droughtVulnerability: 'High',
    groundwaterStatus: 'Over-Exploited / Critical',
    applicableSpecialRegulations: [
      'Poultry waste and bio-effluent pollution control norms',
      'Hill Area Conservation Authority (HACA) rules for Kolli Hills',
      'Groundwater extraction restrictions in over-exploited blocks'
    ]
  },
  Erode: {
    district: 'Erode',
    majorWaterBodies: [
      'Cauvery River & Bhavani River confluence (Kooduthurai sacred Sangam)',
      'Bhavanisagar Dam & Reservoir',
      'Lower Bhavani Project (LBP) Canal network',
      'Kalingarayan Canal (historic 740-year-old agricultural irrigation canal)'
    ],
    ecologicalZones: [
      'Sathyamangalam Tiger Reserve (Largest tiger reserve in Tamil Nadu)',
      'Hasanur plateau wildlife corridor',
      'Bhavani river riparian belt'
    ],
    primaryLivelihoods: [
      'Turmeric trading & processing (Yellow City)',
      'Textile dyeing, printing, bleaching & powerloom weaving',
      'Sugarcane, banana and paddy cultivation under LBP canal'
    ],
    approvedIndustrialParks: [
      'SIPCOT Industrial Growth Centre Perundurai',
      'SIDCO Industrial Estate Erode',
      'Chithode Textile Processing Park'
    ],
    knownFarmlandBelts: [
      'Gobichettipalayam (Mini Kodambakkam agricultural granary)',
      'Bhavani river valley agricultural belt',
      'Kodumudi Cauvery bank fertile tract',
      'Sathyamangalam foot-hill banana belt',
      'Perundurai agrarian perimeter'
    ],
    highDensityResidentialZones: [
      'Erode Town Core (Brough Road / Clock Tower)',
      'Surampatti residential ward',
      'Veerappanchatram textile worker residential cluster',
      'Perundurai town center'
    ],
    floodVulnerability: 'Moderate',
    droughtVulnerability: 'Moderate',
    groundwaterStatus: 'Semi-Critical',
    applicableSpecialRegulations: [
      'Sathyamangalam Tiger Reserve Eco-Sensitive Zone regulations',
      'Zero Liquid Discharge (ZLD) mandatory for textile wet processing',
      'Kalingarayan Canal agricultural water preservation orders'
    ]
  },
  'The Nilgiris': {
    district: 'The Nilgiris',
    majorWaterBodies: [
      'Pykara River & Dam Lake reservoir',
      'Avalanche Lake & Emerald Lake catchment',
      'Bhavani River upper mountain tributaries',
      'Ketti Valley perennial mountain stream network',
      'Kamaraj Sagar (Sandynalla) Dam reservoir'
    ],
    ecologicalZones: [
      'Western Ghats Eco-Sensitive Zone (UNESCO World Heritage Site)',
      'Nilgiri Biosphere Reserve core buffer zone',
      'Mudumalai Tiger Reserve & Elephant Corridor fringe'
    ],
    primaryLivelihoods: [
      'Tea & coffee plantation cultivation',
      'Highland horticulture (potato, carrot, cabbage, hill fruits)',
      'Ecotourism, hospitality & guided nature travel'
    ],
    approvedIndustrialParks: [],
    knownFarmlandBelts: [
      'Ketti Valley terraced vegetable farming tract',
      'Kotagiri tea plantation basin',
      'Gudalur coffee and spices belt'
    ],
    highDensityResidentialZones: [
      'Udhagamandalam (Ooty) municipal market core',
      'Coonoor Bedford commercial & residential hub',
      'Kotagiri town center'
    ],
    floodVulnerability: 'Low',
    droughtVulnerability: 'Low',
    groundwaterStatus: 'Safe',
    applicableSpecialRegulations: [
      'Hill Area Conservation Authority (HACA) mandatory clearances',
      'Tamil Nadu District Municipalities (Hill Stations) Building Rules 1993',
      'Forest (Conservation) Act 1980 tree felling and eco-buffer restrictions',
      'National Green Tribunal (NGT) ban on commercial slope cutting and heavy construction in landslide hazard zones'
    ]
  },
  Perambalur: {
    district: 'Perambalur',
    majorWaterBodies: [
      'Vellar River southern basin',
      'Chinnar River & local irrigation tanks (Eri)',
      'Kottarai Dam reservoir'
    ],
    ecologicalZones: [
      'Pachaimalai Hills eastern reserve forest foothills',
      'Rural scrub and agrarian catchment'
    ],
    primaryLivelihoods: [
      'Rainfed agriculture (Cotton & Maize capital of Tamil Nadu)',
      'Smallholder dairy farming and rural trade',
      'Limestone extraction and cement manufacturing (Chettipalayam/Alathur)'
    ],
    approvedIndustrialParks: [
      'SIDCO Industrial Estate Elambalur (Perambalur)',
      'SIPCOT Industrial Park Eraiyur'
    ],
    knownFarmlandBelts: [
      'Veppanthattai cotton and maize agrarian belt',
      'Kunnam agricultural farming tract',
      'Alathur rainfed agricultural union'
    ],
    highDensityResidentialZones: [
      'Perambalur New Bus Stand town core',
      'Madhanagopalapuram residential ward'
    ],
    floodVulnerability: 'Low',
    droughtVulnerability: 'High',
    groundwaterStatus: 'Semi-Critical',
    applicableSpecialRegulations: [
      'Tamil Nadu Town & Country Planning Act civic and institutional zoning',
      'Central Ground Water Authority (CGWA) guidelines for rainfed dry zones',
      'Public Works Department (Buildings) statutory educational infrastructure standards'
    ]
  },
  Ranipet: {
    district: 'Ranipet',
    majorWaterBodies: [
      'Palar River industrial basin',
      'Ponnai River tributary',
      'Ranipet Big Tank & irrigation lakes'
    ],
    ecologicalZones: [
      'Palar riverine riparian buffer zone',
      'Mahimandalam scrub forest fringe'
    ],
    primaryLivelihoods: [
      'Leather tanning, footwear finishing & export manufacturing',
      'Chemical manufacturing, heavy engineering & boiler fabrication',
      'Paddy and sugarcane farming along Palar canal tracts'
    ],
    approvedIndustrialParks: [
      'SIPCOT Industrial Complex Ranipet Phase I, II & III',
      'SIDCO Industrial Estate Ranipet',
      'Ranipet Tannery Industrial Cluster'
    ],
    knownFarmlandBelts: [
      'Walajah agricultural canal belt',
      'Arcot agrarian farming perimeter',
      'Nemili multi-crop agricultural union'
    ],
    highDensityResidentialZones: [
      'Ranipet Town bazaar ward',
      'Walajapet commercial core',
      'Arcot historical urban settlement'
    ],
    floodVulnerability: 'Moderate',
    droughtVulnerability: 'Moderate',
    groundwaterStatus: 'Over-Exploited / Critical',
    applicableSpecialRegulations: [
      'TNPCB Strict Zero Liquid Discharge (ZLD) for tanneries and chemical units',
      'Palar River Basin effluent discharge absolute prohibition orders',
      'Water (Prevention & Control of Pollution) Act 1974 CTE/CTO conditions'
    ]
  },
  Thiruvallur: {
    district: 'Thiruvallur',
    majorWaterBodies: [
      'Chembarambakkam Lake (Primary drinking water reservoir for Chennai & Adyar River headwaters)',
      'Poondi (Sathyamurthy Sagar) drinking reservoir',
      'Kosasthalaiyar River basin',
      'Pulicat Lake (Ramsar Wetland Site & Bird Sanctuary)'
    ],
    ecologicalZones: [
      'Chembarambakkam Lake protected drinking water catchment buffer',
      'Pulicat Lake Bird Sanctuary Eco-Sensitive Zone',
      'Kosasthalaiyar flood basin'
    ],
    primaryLivelihoods: [
      'Automotive, electronics & engineering manufacturing',
      'Warehousing, logistics & port freight handling',
      'Wetland agriculture and coastal fisheries'
    ],
    approvedIndustrialParks: [
      'SIPCOT Industrial Complex Gummidipoondi',
      'SIDCO Industrial Estate Thirumazhisai',
      'SIPCOT Industrial Park Irungattukottai perimeter'
    ],
    knownFarmlandBelts: [
      'Uthukottai fertile paddy tract',
      'Tiruttani agrarian union',
      'Poonamallee agricultural perimeter'
    ],
    highDensityResidentialZones: [
      'Thiruvallur town core and temple perimeter',
      'Avadi municipal corporation urban core',
      'Poonamallee residential-transit corridor'
    ],
    floodVulnerability: 'High',
    droughtVulnerability: 'Moderate',
    groundwaterStatus: 'Over-Exploited / Critical',
    applicableSpecialRegulations: [
      'TNCDBR 2019 Rule 19 statutory 15-meter buffer from Chembarambakkam Lake & Poondi Reservoir',
      'National Water Policy drinking water catchment protection protocols',
      'CRZ 2019 Coastal Regulation Zone norms for Pulicat lagoon'
    ]
  }
};

// Generic Fallback Profile for any Tamil Nadu district
export function getDistrictProfile(districtName?: string): DistrictEnvironmentalProfile {
  if (!districtName) return DISTRICT_ENVIRONMENTAL_PROFILES['Tiruppur'];
  const normalized = districtName.trim().toLowerCase();
  for (const [key, profile] of Object.entries(DISTRICT_ENVIRONMENTAL_PROFILES)) {
    const k = key.toLowerCase();
    if (k === normalized || normalized.includes(k) || k.includes(normalized)) {
      return profile;
    }
  }

  // Common aliases
  if (normalized.includes('nilgiri') || normalized.includes('coonoor') || normalized.includes('ooty') || normalized.includes('udhagai')) {
    return DISTRICT_ENVIRONMENTAL_PROFILES['The Nilgiris'];
  }
  if (normalized.includes('chembarambakkam') || normalized.includes('thiruvallur') || normalized.includes('tiruvallur')) {
    return DISTRICT_ENVIRONMENTAL_PROFILES['Thiruvallur'];
  }
  if (normalized.includes('ranipet')) {
    return DISTRICT_ENVIRONMENTAL_PROFILES['Ranipet'];
  }
  if (normalized.includes('perambalur')) {
    return DISTRICT_ENVIRONMENTAL_PROFILES['Perambalur'];
  }

  return {
    district: districtName,
    majorWaterBodies: [
      'Local seasonal river / irrigation canal system',
      'Village irrigation tank (Eri) network',
      'Groundwater aquifer basin'
    ],
    ecologicalZones: [
      'Rural agricultural green belt & tree cover',
      'Local public waterbody catchment area'
    ],
    primaryLivelihoods: [
      'Agrarian farming & small-scale rural trade',
      'Commercial services & localized manufacturing'
    ],
    approvedIndustrialParks: [
      `SIDCO / SIPCOT Industrial Estate ${districtName}`
    ],
    knownFarmlandBelts: [
      `Farmland belt of ${districtName}`
    ],
    highDensityResidentialZones: [
      `${districtName} central municipal bus stand / town core wards`
    ],
    floodVulnerability: 'Moderate',
    droughtVulnerability: 'Moderate',
    groundwaterStatus: 'Semi-Critical',
    applicableSpecialRegulations: [
      'Tamil Nadu Combined Development and Building Rules (TNCDBR 2019)',
      'Tamil Nadu Pollution Control Board (TNPCB) consent regulations',
      'Public Works Department (PWD) water resources statutory buffers'
    ]
  };
}

export const HIGH_RISK_ACTION_KEYWORDS = [
  'demolish', 'demolition',
  'destroy', 'destruction',
  'block', 'blocking', 'divert', 'diversion',
  'relocate', 'relocation', 'displace', 'displacement', 'evict', 'eviction',
  'acquire', 'acquisition', 'expropriate',
  'remove', 'removal', 'clear', 'clearing', 'cut', 'cutting', 'deforest',
  'pollute', 'pollution', 'discharge', 'effluent', 'emission',
  'mine', 'mining', 'quarry', 'reclaim', 'reclamation',
  'restrict access', 'close', 'closure', 'reduce service', 'shutdown'
];

/**
 * Resolves the real-world LocationAdministrativeContext for any scenario input
 */
export function resolveLocationAdministrativeProfile(input: ScenarioInput): LocationAdministrativeContext {
  const districtName = input.district || 'Tamil Nadu';
  const profile = getDistrictProfile(districtName);

  const locText = [
    input.description,
    input.area,
    input.village,
    input.town,
    input.city,
    input.location,
    input.selectedAsset
  ].filter(Boolean).join(' ').toLowerCase();

  // 1. Detect High-Risk Action Words
  const highRiskActionsDetected: string[] = [];
  HIGH_RISK_ACTION_KEYWORDS.forEach(kw => {
    if (locText.includes(kw) && !highRiskActionsDetected.includes(kw)) {
      highRiskActionsDetected.push(kw);
    }
  });

  const STOP_WORDS = new Set([
    'rural', 'taluk', 'taluks', 'union', 'unions', 'district', 'districts',
    'zone', 'zones', 'area', 'areas', 'panchayat', 'panchayats', 'village',
    'villages', 'town', 'towns', 'municipal', 'municipality', 'state', 'block',
    'blocks', 'nagar', 'colony', 'estate', 'belt', 'tract', 'corridor',
    'north', 'south', 'east', 'west', 'central', 'upper', 'lower',
    'industrial', 'complex', 'phase', 'basin', 'park', 'centre', 'center',
    'growth', 'development', 'buffer', 'fringe', 'perimeter', 'cluster'
  ]);

  const isMeaningfulTokenMatch = (names: string[], district: string, text: string) => {
    return names.some(name => {
      const tokens = name
        .toLowerCase()
        .split(/[\s,()/-]+/)
        .filter(t => t.length >= 4 && t !== district.toLowerCase() && !STOP_WORDS.has(t));
      return tokens.some(tok => text.includes(tok));
    });
  };

  // 2. Classify Zoning & Geography
  const isApprovedIndustrialZone = 
    locText.includes('sipcot') ||
    locText.includes('sidco') ||
    locText.includes('industrial estate') ||
    locText.includes('industrial park') ||
    locText.includes('industrial complex') ||
    locText.includes('sez') ||
    locText.includes('apparel park') ||
    locText.includes('tidel') ||
    isMeaningfulTokenMatch(profile.approvedIndustrialParks, profile.district, locText);

  const isAgriculturalOrRuralZone = 
    !isApprovedIndustrialZone && (
      locText.includes('farmland') ||
      locText.includes('paddy field') ||
      locText.includes('agriculture') ||
      locText.includes('agricultural land') ||
      locText.includes('cultivable land') ||
      locText.includes('fertile land') ||
      locText.includes('crop field') ||
      isMeaningfulTokenMatch(profile.knownFarmlandBelts, profile.district, locText)
    );

  const isEcoSensitiveOrWaterBuffer = 
    !isApprovedIndustrialZone && (
      locText.includes('river') ||
      locText.includes('lake') ||
      locText.includes('dam') ||
      locText.includes('wetland') ||
      locText.includes('marsh') ||
      locText.includes('canal') ||
      locText.includes('reservoir') ||
      locText.includes('forest') ||
      locText.includes('sanctuary') ||
      locText.includes('tiger reserve') ||
      locText.includes('hills') ||
      locText.includes('ghats') ||
      isMeaningfulTokenMatch(profile.majorWaterBodies, profile.district, locText)
    );

  const isHighDensityResidential = 
    !locText.includes('bypass') && !locText.includes('vacant') && (
      locText.includes('residential') ||
      locText.includes('settlement') ||
      locText.includes('colony') ||
      locText.includes('bazaar') ||
      locText.includes('market') ||
      locText.includes('ward') ||
      locText.includes('town core') ||
      locText.includes('housing') ||
      isMeaningfulTokenMatch(profile.highDensityResidentialZones, profile.district, locText)
    );

  // Determine Primary Zoning Classification
  let zoningClassification: LocationAdministrativeContext['zoningClassification'] = 'Suburban Mixed / Growth Corridor';
  if (isApprovedIndustrialZone) {
    zoningClassification = 'Approved Industrial Estate (SIPCOT/SIDCO)';
  } else if (locText.includes('hill') || locText.includes('mountain') || locText.includes('ghat') || profile.district.toLowerCase().includes('nilgiri')) {
    zoningClassification = 'Hill & Forest Conservation Zone';
  } else if (isEcoSensitiveOrWaterBuffer) {
    zoningClassification = 'Eco-Sensitive Water Body Buffer';
  } else if (isAgriculturalOrRuralZone) {
    zoningClassification = 'Agricultural / Rural Farmland Zone';
  } else if (isHighDensityResidential) {
    zoningClassification = 'Densely Populated Residential / Urban Core';
  } else if (locText.includes('coast') || locText.includes('beach') || locText.includes('crz')) {
    zoningClassification = 'Coastal CRZ Zone';
  }

  // 3. Compute Contextual Risk Modifiers
  let gainAdjustment = 0;
  let frictionAdjustment = 0;
  const reasoningPoints: string[] = [];

  // A. Approved Industrial Estate vs Farmland/Settlement Divergence
  if (isApprovedIndustrialZone) {
    gainAdjustment += 6;
    frictionAdjustment -= 12;
    reasoningPoints.push(`Proposed within an Approved Industrial Estate (${profile.approvedIndustrialParks[0] || 'SIPCOT/SIDCO'}); benefits from established industrial zoning, statutory infrastructure, and buffer distances from residential settlements.`);
  } else if (isAgriculturalOrRuralZone) {
    gainAdjustment -= 16;
    frictionAdjustment += 22;
    reasoningPoints.push(`Located in or adjacent to an active Agricultural/Farmland Belt (${profile.knownFarmlandBelts[0] || 'fertile agrarian area'}); heightened risk of topsoil degradation, permanent loss of farm livelihoods, and severe agrarian community resistance.`);
  }

  // B. Water Body & Ecological Sensitivity Modifiers
  if (isEcoSensitiveOrWaterBuffer) {
    gainAdjustment -= 14;
    frictionAdjustment += 20;
    reasoningPoints.push(`Proximity to sensitive water body / ecological zone (${profile.majorWaterBodies[0] || 'local hydrologic catchment'}); mandates compliance with TNCDBR 15m buffer, environmental clearances, and risk of seasonal pollution/inundation.`);
  }

  // C. High Density Residential Proximity
  if (isHighDensityResidential) {
    gainAdjustment -= 10;
    frictionAdjustment += 18;
    reasoningPoints.push(`Direct interface with High-Density Residential/Institutional settlements; sharp escalation in public safety concerns, air/noise exposure, and public grievance likelihood.`);
  }

  // D. High-Risk Action Multiplier
  if (highRiskActionsDetected.length > 0) {
    const actionCount = highRiskActionsDetected.length;
    gainAdjustment -= Math.min(25, actionCount * 8);
    frictionAdjustment += Math.min(35, actionCount * 12);
    reasoningPoints.push(`High-risk administrative actions detected in proposal (${highRiskActionsDetected.join(', ')}); invokes statutory safeguards under RFCTLARR Act (2013), environmental regulations, and intensive public resistance.`);
  }

  // E. Dam / Water Diversion Specific Context: Flood vs Drought
  const isDamOrWater = locText.includes('dam') || locText.includes('water') || locText.includes('reservoir') || locText.includes('flood');
  if (isDamOrWater) {
    if (locText.includes('flood') || locText.includes('monsoon') || locText.includes('surplus') || locText.includes('excess')) {
      gainAdjustment += 18;
      frictionAdjustment -= 14;
      reasoningPoints.push('Water management actions designed for flood mitigation and monsoon surplus safeguard downstream settlements and protect public safety.');
    } else if (locText.includes('drought') || locText.includes('dry') || locText.includes('scarcity') || locText.includes('block') || locText.includes('divert')) {
      gainAdjustment -= 22;
      frictionAdjustment += 28;
      reasoningPoints.push('Water restrictions or canal diversions during drought/water-stressed periods trigger catastrophic agricultural distress, crop failure, and intense agrarian conflict.');
    }
  }

  // F. Road Widening Context: Vacant Bypass vs Densely Populated Neighborhood
  const isRoadWidening = locText.includes('widen') || locText.includes('widening') || locText.includes('expansion') || locText.includes('corridor');
  if (isRoadWidening) {
    if (locText.includes('vacant') || locText.includes('bypass') || locText.includes('peripheral') || locText.includes('outer ring')) {
      gainAdjustment += 14;
      frictionAdjustment -= 12;
      reasoningPoints.push('Widening along vacant/peripheral bypass corridors relieves regional congestion with negligible structural demolition or citizen displacement.');
    } else if (locText.includes('residential') || locText.includes('bazaar') || locText.includes('dense') || locText.includes('shop') || locText.includes('demolish') || locText.includes('relocate')) {
      gainAdjustment -= 18;
      frictionAdjustment += 26;
      reasoningPoints.push('Widening through densely settled residential/bazaar streets triggers extensive commercial demolition, tenant displacement, and severe livelihood disruption.');
    }
  }

  const resolvedArea = input.area || input.village || input.town || input.city || profile.district;

  return {
    district: profile.district,
    resolvedArea,
    zoningClassification,
    isApprovedIndustrialZone,
    isAgriculturalOrRuralZone,
    isEcoSensitiveOrWaterBuffer,
    isHighDensityResidential,
    nearbyWaterBodies: profile.majorWaterBodies.slice(0, 3),
    ecologicalFeatures: profile.ecologicalZones.slice(0, 2),
    primaryLivelihoods: profile.primaryLivelihoods,
    disasterVulnerabilities: [
      `Flood Vulnerability: ${profile.floodVulnerability}`,
      `Drought Vulnerability: ${profile.droughtVulnerability}`,
      `Groundwater Status: ${profile.groundwaterStatus}`
    ],
    municipalInfrastructureBaseline: profile.approvedIndustrialParks,
    applicableStatutoryFrameworks: profile.applicableSpecialRegulations,
    highRiskActionsDetected,
    contextualAnalysisSummary: reasoningPoints.join(' | ') || `Evaluated against ${profile.district} district administrative baseline and environmental constraints.`,
    contextualRiskAdjustment: {
      gainAdjustment,
      frictionAdjustment,
      reasoning: reasoningPoints.join(' ') || 'Standard administrative baseline evaluation applied.'
    }
  };
}

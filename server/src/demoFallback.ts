import { SimulationResult, ScenarioInput } from './types.js';

export function getRiversideBridgeDemoResult(): SimulationResult {
  return {
    simulationId: "sim_namakkal_riverside_demo",
    timestamp: new Date().toISOString(),
    isLiveGemini: false,
    input: {
      description: "Assess how a damaged Riverside Bridge blocked for 30 days will affect nearby residents, essential services, and emergency access.",
      location: "Riverside Corridor, Namakkal, Tamil Nadu",
      district: "Namakkal",
      area: "Riverside Corridor",
      selectedAsset: "Riverside Bridge (Main Span)",
      selectedAssetId: "asset_riverside_bridge",
      selectedAssetSource: "synthetic_demo_data",
      duration: "30 days",
      reason: "Emergency structural repairs",
      department: "Public Works & Transportation",
      constraints: "Maintain emergency hospital connectivity if possible"
    },
    policy: {
      action: "Complete Structural Closure",
      asset: "Riverside Bridge (Main Span)",
      location: "Riverside Corridor (Connecting West Bank & East Bank)",
      duration: "30 days (Continuous 24/7 work)",
      reason: "Emergency Structural Maintenance & Pier Reinforcement",
      constraints: ["No heavy vehicle load permitted", "Emergency vehicle access required"],
      affectedArea: "Namakkal Central Riverside Sector (Zone B & Zone E)",
      summary: "Proposed 30-day complete shutdown of Namakkal's primary 4-lane arterial river crossing for critical load-bearing repairs.",
      dataSource: "synthetic_demo_data"
    },
    agentAnalyses: {
      transport: {
        domain: "transport",
        domainName: "Transport & Mobility Impact",
        overallSeverity: "high",
        score: 82,
        summary: "Closing Riverside Bridge diverts ~4,500 peak vehicles per hour onto East Connector Road (+140% capacity strain), causing severe bottlenecking and +22 minute average commuter delays.",
        findings: [
          {
            id: "tf_1",
            title: "East Connector Severe Bottleneck",
            description: "East Connector Road capacity will exceed safe operational thresholds by 140% during peak 08:00-10:00 and 17:00-19:00 hours.",
            severity: "high",
            sourceAgent: "transport",
            provenance: "simulation_estimate",
            entityAffected: "East Connector Road Corridor"
          },
          {
            id: "tf_2",
            title: "Commuter Transit Delays",
            description: "Public bus routes 12, 14, and 28 diverted with estimated 20-30 minute travel time increases.",
            severity: "moderate",
            sourceAgent: "transport",
            provenance: "ai_inference",
            entityAffected: "Namakkal Municipal Transit Bus Routes 12, 14, 28"
          },
          {
            id: "tf_3",
            title: "Freight Transport Rerouting",
            description: "Heavy trucks diverted to North Expressway Viaduct adding 8.4 km to industrial transit loops.",
            severity: "moderate",
            sourceAgent: "transport",
            provenance: "provided_data",
            entityAffected: "Zone C Freight Hub"
          }
        ],
        metrics: [
          { label: "Diverted Peak Traffic", value: "4,500 veh/hr", change: "+140% road load" },
          { label: "Avg Travel Delay", value: "22 mins", change: "+180% normal time" },
          { label: "Corridors Congested", value: 3, change: "East & Central" }
        ]
      },
      essential_services: {
        domain: "essential_services",
        domainName: "Essential Public Services",
        overallSeverity: "high",
        score: 74,
        summary: "Critical access to Riverside General Hospital is severely compromised for West Bank residents. Emergency response travel times increase from 7 minutes to 25 minutes.",
        findings: [
          {
            id: "ef_1",
            title: "Hospital Ambulance Travel Time Spike",
            description: "Ambulances dispatched from Fire Station 1 heading to Riverside General Hospital must take the congested East Connector, increasing turnaround time by 18 minutes.",
            severity: "critical",
            sourceAgent: "essential_services",
            provenance: "simulation_estimate",
            entityAffected: "Riverside General Hospital & Fire Station 1"
          },
          {
            id: "ef_2",
            title: "School Bus Disruption",
            description: "Namakkal Model High School and St. Jude Academy morning drop-offs delayed by 25-35 minutes, affecting ~3,800 students daily.",
            severity: "moderate",
            sourceAgent: "essential_services",
            provenance: "ai_inference",
            entityAffected: "Namakkal Model High & St. Jude Academy"
          },
          {
            id: "ef_3",
            title: "Fire & Rescue Route Bottleneck",
            description: "Primary fire engine dispatch route to Zone B west residential sector blocked, requiring alternate response from Central Station.",
            severity: "high",
            sourceAgent: "essential_services",
            provenance: "provided_data",
            entityAffected: "Namakkal Fire Station 1 Coverage Area"
          }
        ],
        metrics: [
          { label: "Ambulance Delay", value: "+18 mins", change: "Critical risk" },
          { label: "Affected Schools", value: 2, change: "3,800 students" },
          { label: "Hospitals Impaired", value: 1, change: "Riverside General" }
        ]
      },
      population: {
        domain: "population",
        domainName: "Population & Equity Access",
        overallSeverity: "moderate",
        score: 68,
        summary: "Disproportionately affects 90,000 residents in Zone B and high-vulnerability Zone E who rely on public transit for access to healthcare and employment.",
        findings: [
          {
            id: "pf_1",
            title: "Vulnerable Settlement Isolation Risk",
            description: "Zone E residents (high vulnerability index) face reduced public bus frequency and isolated medical access during peak hours.",
            severity: "high",
            sourceAgent: "population",
            provenance: "provided_data",
            entityAffected: "Zone E Riverside Vulnerable Settlement"
          },
          {
            id: "pf_2",
            title: "Commuter Financial & Time Burden",
            description: "Daily wage workers suffer an estimated 45 cumulative lost minutes per day in transit bottleneck.",
            severity: "moderate",
            sourceAgent: "population",
            provenance: "ai_inference",
            entityAffected: "Zone B Commuter Workforce"
          }
        ],
        metrics: [
          { label: "Affected Residents", value: "90,000", change: "Zone B & E" },
          { label: "Vulnerability Level", value: "High (Zone E)", change: "Equity alert" },
          { label: "Daily Transit Loss", value: "45 mins/person", change: "Economic burden" }
        ]
      },
      disaster_risk: {
        domain: "disaster_risk",
        domainName: "Disaster Risk & Emergency Operations",
        overallSeverity: "high",
        score: 79,
        summary: "Evacuation route capacity reduced by 60% across the river corridor. In the event of monsoon flash flooding, emergency evacuation bottlenecks will present catastrophic risk.",
        findings: [
          {
            id: "df_1",
            title: "Monsoon Evacuation Bottleneck",
            description: "Primary river evacuation route disabled. If river water levels rise, Zone E evacuation times increase from 40 mins to over 2.5 hours.",
            severity: "critical",
            sourceAgent: "disaster_risk",
            provenance: "assumption",
            entityAffected: "Namakkal Emergency Evacuation Plan B"
          },
          {
            id: "df_2",
            title: "Single-Bridge Vulnerability",
            description: "Total cross-river flow heavily reliant on North Expressway Viaduct; any secondary accident on North Viaduct would paralyze city transport.",
            severity: "high",
            sourceAgent: "disaster_risk",
            provenance: "ai_inference",
            entityAffected: "North Expressway Viaduct"
          }
        ],
        metrics: [
          { label: "Evacuation Capacity", value: "-60%", change: "Severe reduction" },
          { label: "Secondary Risk", value: "Monsoon Flood", change: "High severity" },
          { label: "Backup Corridor", value: "North Viaduct", change: "Single failure point" }
        ]
      }
    },
    cascadingGraph: {
      primaryChainSummary: "Riverside Bridge Closure → Traffic Diversion to East Connector → Severe Gridlock → Ambulance Response Delay (+18m) → High Critical Health & Fire Risk for 90,000 Residents",
      nodes: [
        {
          id: "node_1",
          label: "Riverside Bridge 30-Day Closure",
          type: "decision",
          severity: "high",
          department: "Public Works",
          description: "Full emergency structural closure of the main span for 30 calendar days."
        },
        {
          id: "node_2",
          label: "Traffic Diversion to East Connector (+140%)",
          type: "direct_effect",
          severity: "high",
          department: "Transport Operations",
          description: "4,500 peak vehicles rerouted onto single alternative arterial connector."
        },
        {
          id: "node_3",
          label: "East Connector Corridor Gridlock",
          type: "secondary_effect",
          severity: "high",
          department: "Traffic Police",
          description: "Average vehicle movement speed drops from 45 km/h to 8 km/h during peak hours."
        },
        {
          id: "node_4",
          label: "Ambulance Access Delay to Riverside General (+18m)",
          type: "service_impact",
          severity: "critical",
          department: "Healthcare & Emergency Response",
          description: "Emergency vehicles dispatched from West Bank delayed in gridlock.",
          assumption: "Assumes no dedicated contra-flow emergency lane is established."
        },
        {
          id: "node_5",
          label: "Critical Health & Emergency Response Risk (Zone B & E)",
          type: "critical_consequence",
          severity: "critical",
          department: "Disaster Management Authority",
          description: "Elevated life safety risk for 90,000 residents needing critical acute hospital transit."
        },
        {
          id: "node_6",
          label: "School Bus & Public Transit Delays (+25-35m)",
          type: "secondary_effect",
          severity: "moderate",
          department: "Education & Transit",
          description: "Major morning commute delays for 3,800 students and daily workforce."
        },
        {
          id: "node_7",
          label: "Increased Vulnerable Community Disruption",
          type: "critical_consequence",
          severity: "high",
          department: "Social Services",
          description: "Compounded transport and service accessibility burden on low-income Zone E."
        }
      ],
      edges: [
        { id: "edge_1_2", source: "node_1", target: "node_2", label: "Forces Reroute" },
        { id: "edge_2_3", source: "node_2", target: "node_3", label: "Overwhelms Capacity" },
        { id: "edge_3_4", source: "node_3", target: "node_4", label: "Traps Ambulances" },
        { id: "edge_4_5", source: "node_4", target: "node_5", label: "Escalates Hazard" },
        { id: "edge_1_6", source: "node_1", target: "node_6", label: "Disrupts Routes" },
        { id: "edge_6_7", source: "node_6", target: "node_7", label: "Compounds Delay" }
      ]
    },
    alternatives: [
      {
        id: "opt_a",
        title: "Option A — Full 24/7 Closure (Original Proposal)",
        optionType: "full_closure",
        description: "Complete shutdown of all 4 lanes on Riverside Bridge for 30 consecutive days. Allows rapid 24-hour repair work.",
        benefits: [
          "Shortest engineering repair window (30 days)",
          "Maximum worker safety on bridge deck",
          "Lowest engineering project cost"
        ],
        risks: [
          "Severe East Connector congestion (+140%)",
          "Critical ambulance delay to Riverside General Hospital (+18 mins)",
          "High disaster evacuation vulnerability"
        ],
        mitigations: [
          "Deploy 15 traffic marshals at East Connector intersections",
          "Stagger municipal worker shifts"
        ],
        scores: {
          transport: 82,
          essentialServices: 74,
          population: 68,
          disasterRisk: 79,
          overall: 76
        }
      },
      {
        id: "opt_b",
        title: "Option B — Partial Closure (Emergency & Transit Barrier Lane)",
        optionType: "partial_closure",
        description: "Maintain 1 controlled central lane for emergency vehicles, hospital ambulances, and high-capacity buses while repairing outer spans over 42 days.",
        benefits: [
          "Preserves ambulance turnaround time to Riverside General Hospital (<5 min delay)",
          "Maintains core public bus connectivity for Zone E residents",
          "Reduces peak East Connector traffic strain by 45%"
        ],
        risks: [
          "Extends total repair duration from 30 days to 42 days",
          "Requires strict traffic enforcement at bridge entry checkpoints"
        ],
        mitigations: [
          "Install automated license-plate barrier gates for registered emergency vehicles",
          "Implement signalized alternating flow during off-peak hours"
        ],
        scores: {
          transport: 52,
          essentialServices: 38,
          population: 44,
          disasterRisk: 41,
          overall: 44
        }
      },
      {
        id: "opt_c",
        title: "Option C — Night-Only Work & Weekend Phased Closure",
        optionType: "night_closure",
        description: "Bridge open during daytime peak hours (06:00 - 21:00); full closure restricted to 21:00 - 06:00 and full weekend shifts.",
        benefits: [
          "Minimal daytime traffic disruption for commuters and schools",
          "Zero peak-hour ambulance congestion on East Connector",
          "High public acceptance"
        ],
        risks: [
          "Extends project timeline to 75 days",
          "Higher night labor costs (+35%) and noise impact on nearby residents"
        ],
        mitigations: [
          "Install acoustic noise barriers along West Bank residential edge",
          "Utilize pre-fabricated structural steel beams to accelerate night fits"
        ],
        scores: {
          transport: 34,
          essentialServices: 28,
          population: 32,
          disasterRisk: 30,
          overall: 31
        }
      }
    ],
    comparison: {
      options: [],
      recommendedOptionId: "opt_b",
      rationale: "Option B (Partial Closure with Dedicated Emergency Corridor) provides the optimal balance: it mitigates life-critical ambulance response risks to Riverside General Hospital while avoiding excessive 75-day construction extension of Option C."
    },
    recommendation: {
      title: "AI Recommendation: Implement Option B (Partial Closure with Emergency Barrier Lane)",
      recommendedOptionId: "opt_b",
      recommendedOptionTitle: "Option B — Partial Closure with Dedicated Emergency Lane",
      summary: "Partial closure with a dedicated emergency access lane is recommended. While extending construction duration by 12 days (to 42 days), it successfully prevents critical emergency health delays to Riverside General Hospital and protects 90,000 residents in Zone B and Zone E.",
      rationalePoints: [
        "Protects Emergency Response: Keeps ambulance transit delays under 5 minutes compared to +18 minutes under Full Closure.",
        "Equitable Access: Preserves public transit bus lane for Zone E vulnerable community.",
        "Manageable Timeline: Completes structural repairs in 42 days versus 75 days for Night-Only closure."
      ],
      keyRisks: [
        "Unapproved vehicle intrusion into emergency lane",
        "12-day longer overall construction window compared to baseline"
      ],
      mitigationMeasures: [
        "Deploy automated barriers and police enforcement at both bridge approaches.",
        "Establish real-time GPS traffic monitoring along East Connector detour routes.",
        "Pre-position temporary Fire & EMS unit at West Bank precinct."
      ],
      assumptions: [
        "Bridge load capacity allows 1 single lane to carry 15-tonne emergency vehicles during outer span repairs.",
        "Namakkal Police can enforce emergency lane exclusivity 24/7."
      ],
      dataLimitations: [
        "Simulation relies on synthetic Namakkal baseline traffic numbers.",
        "Weather and river current variables not dynamically modeled."
      ]
    },
    overallScore: 76
  };
}

export function generateGenericFallbackResult(input: ScenarioInput): SimulationResult {
  const desc = input.description || "Proposed Municipal Infrastructure Project";
  const loc = input.location || "Central Sector, Namakkal, Tamil Nadu";
  const targetAsset = input.selectedAsset || input.area || loc;
  const targetLocation = loc;

  return {
    simulationId: `sim_generic_${Date.now()}`,
    timestamp: new Date().toISOString(),
    isLiveGemini: false,
    input,
    policy: {
      action: "Infrastructure Modification / Interruption",
      asset: targetAsset,
      location: loc,
      duration: input.duration || "Estimated 30 Days",
      reason: input.reason || "Scheduled Maintenance & Upgrade",
      constraints: input.constraints ? [input.constraints] : ["Maintain emergency access", "Minimize business disruption"],
      affectedArea: `${loc} and Surrounding Transit Grid`,
      summary: `Simulation for: "${desc}". Analyzed across 4 public service dimensions.`
    },
    agentAnalyses: {
      transport: {
        domain: "transport",
        domainName: "Transport & Mobility Impact",
        overallSeverity: "moderate",
        score: 62,
        summary: `Traffic rerouting near ${loc} will cause localized peak congestion and estimated 12-18 minute transit delays.`,
        findings: [
          {
            id: "gen_tf_1",
            title: "Local Arterial Capacity Strain",
            description: "Traffic diversion creates peak hour bottlenecks on secondary connector roads.",
            severity: "moderate",
            sourceAgent: "transport",
            provenance: "simulation_estimate",
            entityAffected: "Secondary Road Network"
          }
        ],
        metrics: [
          { label: "Estimated Transit Delay", value: "15 mins", change: "+40%" },
          { label: "Rerouted Corridors", value: 2, change: "Moderate" }
        ]
      },
      essential_services: {
        domain: "essential_services",
        domainName: "Essential Public Services",
        overallSeverity: "moderate",
        score: 58,
        summary: `Access to nearby healthcare facilities and schools near ${loc} experiencing moderate route extensions.`,
        findings: [
          {
            id: "gen_ef_1",
            title: "Emergency Response Routing Adjustment",
            description: "Ambulances and fire units rerouted via secondary connectors.",
            severity: "moderate",
            sourceAgent: "essential_services",
            provenance: "ai_inference",
            entityAffected: "Namakkal Emergency Response Services"
          }
        ],
        metrics: [
          { label: "Emergency Reroute Delay", value: "+8 mins", change: "Manageable" },
          { label: "Facilities Impacted", value: 2, change: "Low-Moderate" }
        ]
      },
      population: {
        domain: "population",
        domainName: "Population & Equity Access",
        overallSeverity: "low",
        score: 45,
        summary: "Impact primarily felt by daily commuters and localized commercial businesses.",
        findings: [
          {
            id: "gen_pf_1",
            title: "Commuter Transit Time Increase",
            description: "Increased travel time for surrounding residential neighborhoods.",
            severity: "low",
            sourceAgent: "population",
            provenance: "provided_data",
            entityAffected: "Local Resident Commuters"
          }
        ],
        metrics: [
          { label: "Population Impacted", value: "~35,000", change: "Localized" },
          { label: "Vulnerability Strain", value: "Low", change: "Standard" }
        ]
      },
      disaster_risk: {
        domain: "disaster_risk",
        domainName: "Disaster Risk & Emergency Operations",
        overallSeverity: "moderate",
        score: 54,
        summary: "Secondary emergency evacuation routes remain functional with minor speed reductions.",
        findings: [
          {
            id: "gen_df_1",
            title: "Evacuation Plan Adjustment",
            description: "Secondary evacuation path activated to maintain safety margins.",
            severity: "moderate",
            sourceAgent: "disaster_risk",
            provenance: "assumption",
            entityAffected: "Municipal Emergency Contingency Corridor"
          }
        ],
        metrics: [
          { label: "Evacuation Capacity", value: "-25%", change: "Acceptable" },
          { label: "Contingency Status", value: "Active", change: "Safe" }
        ]
      }
    },
    cascadingGraph: {
      primaryChainSummary: `${desc} → Rerouted Traffic → Moderate Arterial Congestion → Minor Emergency Response Delay → Localized Commuter Impact`,
      nodes: [
        {
          id: "node_g1",
          label: `Proposed Action: ${desc.substring(0, 35)}...`,
          type: "decision",
          severity: "moderate",
          department: "Municipal Administration",
          description: desc
        },
        {
          id: "node_g2",
          label: "Arterial Traffic Diversion",
          type: "direct_effect",
          severity: "moderate",
          department: "Transport Department",
          description: "Vehicles redirected onto secondary connector routes."
        },
        {
          id: "node_g3",
          label: "Localized Corridor Slowdowns",
          type: "secondary_effect",
          severity: "moderate",
          department: "Traffic Management",
          description: "12-15 minute average commuter delay during morning peak."
        },
        {
          id: "node_g4",
          label: "Emergency Vehicle Route Adjustment (+8m)",
          type: "service_impact",
          severity: "moderate",
          department: "Emergency Services",
          description: "Ambulance and fire response times slightly increased."
        },
        {
          id: "node_g5",
          label: "Managed Civic Impact",
          type: "critical_consequence",
          severity: "low",
          department: "City Council",
          description: "Manageable impact with standard traffic mitigations."
        }
      ],
      edges: [
        { id: "eg1", source: "node_g1", target: "node_g2" },
        { id: "eg2", source: "node_g2", target: "node_g3" },
        { id: "eg3", source: "node_g3", target: "node_g4" },
        { id: "eg4", source: "node_g4", target: "node_g5" }
      ]
    },
    alternatives: [
      {
        id: "opt_gen_1",
        title: "Option A — Full 24/7 Closure (Baseline Proposal)",
        optionType: "full_closure",
        description: `Complete 24-hour closure of ${targetAsset} for the proposed ${input.duration || 'duration'}. Eliminates traffic interference to maximize construction speed, but forces 100% of vehicular flow onto adjacent regional corridors.`,
        benefits: [
          "Fastest engineering completion window with uninterrupted work shifts",
          "Lowest direct contractor mobilization and safety staging expense"
        ],
        risks: [
          `Severe peak hour congestion on alternate roads near ${targetLocation}`,
          "Significant response turnaround delays for emergency hospital ambulances"
        ],
        mitigations: [
          "Station municipal traffic wardens at key diversion choke-points",
          "Issue daily digital detour advisories across regional channels"
        ],
        scores: { transport: 74, essentialServices: 68, population: 58, disasterRisk: 66, overall: 66.5 }
      },
      {
        id: "opt_gen_2",
        title: "Option B — Partial Phased Closure with Dedicated Emergency & Transit Lane (AI Recommended)",
        optionType: "partial_closure",
        description: `Maintain a single automated bidirectional lane along ${targetAsset} dedicated exclusively to emergency ambulances, school buses, and local residents, while civil repairs proceed on the adjacent lane.`,
        benefits: [
          "Guarantees rapid, uninterrupted ambulance access to nearby healthcare facilities",
          "Maintains vital school bus and local public transit connectivity",
          "Reduces spillover congestion on secondary roads by ~45%"
        ],
        risks: [
          "Extends total construction timeline by approximately 25-35%",
          "Requires strict checkpoint enforcement and automated signal timing"
        ],
        mitigations: [
          "Deploy automated boom barriers with priority detection for emergency vehicles",
          "Schedule heavy structural excavation strictly during off-peak daytime hours"
        ],
        scores: { transport: 38, essentialServices: 28, population: 32, disasterRisk: 30, overall: 32.0 }
      },
      {
        id: "opt_gen_3",
        title: "Option C — Night-Only Work Window (10:00 PM – 5:00 AM) with Full Daytime Opening",
        optionType: "night_closure",
        description: `Keep ${targetAsset} 100% open during all daytime and peak commuter hours (5:00 AM – 10:00 PM) using heavy-duty steel plating over construction trenches. Restrict all active closure and heavy machinery work to overnight hours.`,
        benefits: [
          "Zero traffic disruption during morning and evening rush hours",
          "Completely protects local commercial businesses, tourists, and daily school transport",
          "Virtually zero spillover traffic load onto secondary residential streets"
        ],
        risks: [
          "Higher contractor expenses for nighttime illumination and night-shift labor premiums",
          "Potential noise restrictions near residential zones"
        ],
        mitigations: [
          "Mandate acoustic noise baffles around generators near residential areas",
          "Daily mandatory 5:00 AM structural safety inspections before morning opening"
        ],
        scores: { transport: 22, essentialServices: 18, population: 24, disasterRisk: 20, overall: 21.0 }
      }
    ],
    comparison: {
      options: [],
      recommendedOptionId: "opt_gen_2",
      rationale: `Partial Phased Closure (Option B) is recommended as the optimal balance: it prevents critical ambulance delays and maintains essential school/transit access along ${targetAsset} while keeping traffic spillover within manageable thresholds.`
    },
    recommendation: {
      title: "AI Recommendation: Implement Option B (Partial Phased Closure with Transit Lane)",
      recommendedOptionId: "opt_gen_2",
      recommendedOptionTitle: "Option B — Partial Phased Closure with Dedicated Emergency Lane",
      summary: `Staging the repair into controlled phases while maintaining a dedicated single lane for ambulances and local transit along ${targetAsset} significantly reduces cross-department service disruption and protects ~${targetLocation} residents.`,
      rationalePoints: [
        "Eliminates severe ambulance delays by providing a guaranteed emergency corridor.",
        "Prevents gridlock on alternate arterial roads by keeping ~45% of critical traffic flowing through the primary corridor.",
        "Maintains vital school bus accessibility and local commuter mobility."
      ],
      keyRisks: [
        "Project duration extended by approximately 25-35% compared to complete shutdown.",
        "Requires automated traffic signal management and active enforcement at entry checkpoints."
      ],
      mitigationMeasures: [
        "Deploy automated boom barriers with emergency vehicle preemption.",
        "Schedule high-impact construction phases during off-peak windows."
      ],
      assumptions: [
        "Corridor width allows single-lane alternating flow with safety barriers.",
        "Emergency services and local school transport can be registered for barrier bypass."
      ],
      dataLimitations: [
        "Traffic diversion volumes calculated using corridor capacity modeling."
      ]
    },
    overallScore: 52
  };
}

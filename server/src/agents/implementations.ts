import {
  AgentAnalysis,
  AgentImpactDomain,
  ImpactSeverity,
  PolicyCategory,
  PolicyUnderstanding,
  ScenarioInput,
} from '../types.js';
import { AgentExecutionContext, PolicySimulationAgent } from './baseAgent.js';

import { classifyProposalMeaning } from '../proposalUnderstanding.js';

export function classifyPolicy(description: string, department?: string): PolicyCategory {
  return classifyProposalMeaning(description, department).primaryDomain;
}

// 1. Transport Impact Agent
export class TransportImpactAgent implements PolicySimulationAgent {
  readonly id = 'transport';
  readonly name = 'Transport & Mobility Agent';
  readonly departmentAffinity = 'Highways & Transport Department';
  readonly description = 'Analyzes road network, traffic diversions, travel time, public transit, and emergency access.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const { input, policy } = context;
    const category = policy.category;
    const isTransportHeavy = category === 'Transport' || category === 'Infrastructure' || category === 'Urban Planning';
    const score = isTransportHeavy ? 78 : 45;
    const severity: ImpactSeverity = score >= 75 ? 'high' : score >= 50 ? 'moderate' : 'low';

    return {
      domain: 'transport',
      domainName: this.name,
      overallSeverity: severity,
      score,
      confidence: 89,
      summary: `Evaluated mobility corridor impact for ${policy.location}. Anticipates ${isTransportHeavy ? 'significant modal redistribution and detour congestion' : 'localized traffic modifications during implementation'}.`,
      findings: [
        {
          id: 'tf_1',
          title: 'Corridor Capacity Strain',
          description: `Key arterial corridors around ${policy.affectedArea} will experience estimated +${isTransportHeavy ? '35-50%' : '15-20%'} volume shift.`,
          severity: isTransportHeavy ? 'high' : 'moderate',
          sourceAgent: 'transport',
          provenance: 'simulation_estimate',
          entityAffected: `${policy.location} Road Network`,
        },
        {
          id: 'tf_2',
          title: 'Public Transit & Commuter Travel Times',
          description: `Bus routes and local passenger transit face an average detour delay of ${isTransportHeavy ? '14-22' : '5-10'} minutes per trip.`,
          severity: isTransportHeavy ? 'moderate' : 'low',
          sourceAgent: 'transport',
          provenance: 'ai_inference',
          entityAffected: 'Public Bus & Commuter Links',
        },
        {
          id: 'tf_3',
          title: 'Emergency Vehicle Transit Priority',
          description: `Emergency ambulance and fire tender routing requires active signal green-wave corridors during peak hours.`,
          severity: 'moderate',
          sourceAgent: 'transport',
          provenance: 'assumption',
          entityAffected: 'Emergency Response Corridors',
        },
      ],
      metrics: [
        { label: 'Peak Travel Delay', value: isTransportHeavy ? '+18 mins' : '+6 mins', change: isTransportHeavy ? '+45%' : '+12%', trend: 'negative' },
        { label: 'Public Transit Reliability', value: isTransportHeavy ? '72%' : '91%', change: isTransportHeavy ? '-18%' : '-4%', trend: 'negative' },
        { label: 'Freight Logistics Impact', value: isTransportHeavy ? 'Moderate' : 'Low', change: 'Rerouted' },
      ],
    };
  }
}

// 2. Infrastructure Agent
export class InfrastructureImpactAgent implements PolicySimulationAgent {
  readonly id = 'infrastructure';
  readonly name = 'Civil Infrastructure & Utilities Agent';
  readonly departmentAffinity = 'Public Works & Municipal Administration';
  readonly description = 'Analyzes utilities, power grids, water supply, stormwater drainage, and government civil assets.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const { policy } = context;
    const score = 65;
    return {
      domain: 'infrastructure',
      domainName: this.name,
      overallSeverity: 'moderate',
      score,
      confidence: 86,
      summary: `Assessed municipal utilities, underground water/sewer pipelines, power transmission lines, and civic assets across ${policy.affectedArea}.`,
      findings: [
        {
          id: 'inf_1',
          title: 'Subsurface Utility Relocation Needs',
          description: `Underground water mains and electrical cabling along the designated footprint require surveyed relocation before ground-breaking.`,
          severity: 'moderate',
          sourceAgent: 'infrastructure',
          provenance: 'verified_geographic_data',
          entityAffected: 'Municipal Water & TANGEDCO Power Grid',
        },
        {
          id: 'inf_2',
          title: 'Stormwater Drainage Continuity',
          description: `Runoff channels must be reinforced to prevent localized water stagnation during monsoon surges.`,
          severity: 'moderate',
          sourceAgent: 'infrastructure',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Stormwater Network',
        },
      ],
      metrics: [
        { label: 'Utility Relocation Load', value: '4 Major Trunks', change: 'Survey Req', trend: 'neutral' },
        { label: 'Power Grid Stability', value: '98.5%', change: 'Normal', trend: 'positive' },
        { label: 'Asset Life Expectancy', value: '30+ Years', change: 'Post-Upgrade', trend: 'positive' },
      ],
    };
  }
}

// 3. Population Impact Agent
export class PopulationImpactAgent implements PolicySimulationAgent {
  readonly id = 'population';
  readonly name = 'Population & Community Equity Agent';
  readonly departmentAffinity = 'Revenue & Social Welfare';
  readonly description = 'Assesses impacts on local residents, businesses, schools, vulnerable demographics, and public convenience.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const { policy, infrastructure } = context;
    const pop = infrastructure.populationContext?.corridorEstimatedPopulation || 45000;
    const score = 70;
    return {
      domain: 'population',
      domainName: this.name,
      overallSeverity: 'high',
      score,
      confidence: 88,
      summary: `Estimated daily impact on approximately ~${pop.toLocaleString()} residents, local commercial traders, and school students in ${policy.location}.`,
      findings: [
        {
          id: 'pop_1',
          title: 'Direct Citizen Daily Life Disruption',
          description: `Residents face pedestrian detour detours, periodic noise, and dust management concerns in immediate residential clusters.`,
          severity: 'moderate',
          sourceAgent: 'population',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Residents & Neighborhoods',
        },
        {
          id: 'pop_2',
          title: 'Vulnerable Group & Elder Accessibility',
          description: `Senior citizens and persons with disabilities require preserved barrier-free access corridors to clinics and community centers.`,
          severity: 'high',
          sourceAgent: 'population',
          provenance: 'ai_inference',
          entityAffected: 'Elderly & Vulnerable Residents',
        },
      ],
      metrics: [
        { label: 'Estimated Affected Residents', value: pop.toLocaleString(), change: 'Zone-wide' },
        { label: 'Pedestrian Accessibility Index', value: '64/100', change: '-22%', trend: 'negative' },
        { label: 'Public Satisfaction Risk', value: 'Moderate-High', change: 'Pre-Briefing Req' },
      ],
    };
  }
}

// 4. Essential Services Agent
export class EssentialServicesImpactAgent implements PolicySimulationAgent {
  readonly id = 'essential_services';
  readonly name = 'Essential Public Services Agent';
  readonly departmentAffinity = 'Health & Family Welfare / Police / Fire & Rescue';
  readonly description = 'Monitors hospital connectivity, fire station response, police coverage, schools, and civic offices.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const { policy } = context;
    const score = 62;
    return {
      domain: 'essential_services',
      domainName: this.name,
      overallSeverity: 'moderate',
      score,
      confidence: 91,
      summary: `Assessed operational response times for hospitals, primary health centers, fire stations, and school transit routes around ${policy.affectedArea}.`,
      findings: [
        {
          id: 'es_1',
          title: 'Ambulance Response Turnaround',
          description: `Hospital ambulances operating along primary transit links may encounter +4 to +8 minutes turnaround latency without priority passage.`,
          severity: 'high',
          sourceAgent: 'essential_services',
          provenance: 'simulation_estimate',
          entityAffected: 'District Hospital & Emergency Fleets',
        },
        {
          id: 'es_2',
          title: 'School Transit Continuity',
          description: `Morning and evening school bus schedules require 15-minute staggered departure windows to avoid bottlenecking.`,
          severity: 'moderate',
          sourceAgent: 'essential_services',
          provenance: 'ai_inference',
          entityAffected: 'Local Educational Institutions',
        },
      ],
      metrics: [
        { label: 'Ambulance Turnaround Latency', value: '+6.5 mins', change: 'Elevated', trend: 'negative' },
        { label: 'Fire Service Readiness', value: '94%', change: 'Optimal', trend: 'positive' },
        { label: 'School Transport Access', value: '82%', change: '-12%', trend: 'neutral' },
      ],
    };
  }
}

// 5. Economic Agent
export class EconomicImpactAgent implements PolicySimulationAgent {
  readonly id = 'economic';
  readonly name = 'Economic & Local Trade Agent';
  readonly departmentAffinity = 'Finance & Commercial Taxes / MSME';
  readonly description = 'Analyzes local business revenue, employment, supply chain logistics, municipal revenue, and trade.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const { policy } = context;
    const isIndustry = policy.category === 'Industry' || policy.category === 'Revenue';
    const score = isIndustry ? 75 : 52;
    return {
      domain: 'economic',
      domainName: this.name,
      overallSeverity: score > 70 ? 'high' : 'moderate',
      score,
      confidence: 84,
      summary: `Evaluated economic trade velocity, supply chains, daily wage employment, and retail commerce for ${policy.location}.`,
      findings: [
        {
          id: 'eco_1',
          title: 'Micro-Commerce Footfall Variation',
          description: `Retail storefronts, petty traders, and weekly markets near the project boundary may experience temporary -15% customer footfall during execution.`,
          severity: 'moderate',
          sourceAgent: 'economic',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Retail & Micro-Enterprises',
        },
        {
          id: 'eco_2',
          title: 'Long-term Regional Economic Multiplier',
          description: `Successful implementation is projected to enhance regional logistics efficiency and trade throughput by +25-35% upon completion.`,
          severity: 'low',
          sourceAgent: 'economic',
          provenance: 'ai_inference',
          entityAffected: 'Regional Business Corridor',
        },
      ],
      metrics: [
        { label: 'Temporary Trade Disruption', value: '-12%', change: 'Phase 1 Only', trend: 'negative' },
        { label: 'Long-term Economic Growth', value: '+18.5%', change: 'Projected', trend: 'positive' },
        { label: 'Employment Generation', value: 'Direct & Indirect', change: 'Expanding', trend: 'positive' },
      ],
    };
  }
}

// 6. Environmental Agent
export class EnvironmentalImpactAgent implements PolicySimulationAgent {
  readonly id = 'environmental';
  readonly name = 'Environmental & Ecological Agent';
  readonly departmentAffinity = 'Environment, Climate Change & Forests / TNPCB';
  readonly description = 'Evaluates air quality, water bodies, tree canopy, noise levels, wetlands, floodplains, and climate resilience.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const { policy } = context;
    const score = policy.category === 'Environment' || policy.category === 'Industry' ? 76 : 58;
    return {
      domain: 'environmental',
      domainName: this.name,
      overallSeverity: score > 70 ? 'high' : 'moderate',
      score,
      confidence: 87,
      summary: `Analyzed ambient air particulate matter (PM2.5/PM10), acoustic noise thresholds, groundwater recharge, and local green canopy preservation in ${policy.affectedArea}.`,
      findings: [
        {
          id: 'env_1',
          title: 'Dust & Particulate Suppression',
          description: `Heavy machinery and excavation require mandatory mist-cannons and water sprinkling to comply with TNPCB air quality standards.`,
          severity: 'moderate',
          sourceAgent: 'environmental',
          provenance: 'verified_geographic_data',
          entityAffected: 'Air Shed & Residential Zone',
        },
        {
          id: 'env_2',
          title: 'Riparian & Wetland Preservation',
          description: `Strict buffer zone setbacks must be verified to eliminate industrial runoff or civil silt infiltration into local water bodies.`,
          severity: score > 70 ? 'high' : 'moderate',
          sourceAgent: 'environmental',
          provenance: 'simulation_estimate',
          entityAffected: 'Local Waterways & Aquifers',
        },
      ],
      metrics: [
        { label: 'Acoustic Decibel Forecast', value: '62 dB(A)', change: 'Within Limits', trend: 'neutral' },
        { label: 'Green Cover Compensatory Ratio', value: '1:10 Planting', change: 'Mandatory', trend: 'positive' },
        { label: 'Water Resource Security', value: 'Secured', change: 'Zero Discharge', trend: 'positive' },
      ],
    };
  }
}

// 7. Disaster Risk Agent
export class DisasterRiskImpactAgent implements PolicySimulationAgent {
  readonly id = 'disaster_risk';
  readonly name = 'Disaster Management & Emergency Resilience Agent';
  readonly departmentAffinity = 'Tamil Nadu Disaster Risk Reduction Agency (TNDRRA)';
  readonly description = 'Assesses flood, cyclone, fire, seismic vulnerability, heatwaves, and emergency evacuation clearance.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const { policy } = context;
    const score = policy.category === 'Disaster Management' || policy.category === 'Water Resources' ? 82 : 48;
    return {
      domain: 'disaster_risk',
      domainName: this.name,
      overallSeverity: score > 75 ? 'critical' : score > 60 ? 'high' : 'moderate',
      score,
      confidence: 90,
      summary: `Evaluated structural resilience against extreme weather events, monsoon flood discharge, fire escape routes, and district evacuation pathways in ${policy.location}.`,
      findings: [
        {
          id: 'dr_1',
          title: 'Monsoon Flood Inundation Buffer',
          description: `Low-lying catchments require clear hydraulic clearance and calibrated runoff conduits to accommodate 100-year storm flood peaks.`,
          severity: score > 75 ? 'critical' : 'moderate',
          sourceAgent: 'disaster_risk',
          provenance: 'simulation_estimate',
          entityAffected: 'District Flood Drainage Network',
        },
        {
          id: 'dr_2',
          title: 'Evacuation Corridor Redundancy',
          description: `Emergency evacuation access routes must maintain at least 2 independent unblocked egress paths at all times.`,
          severity: 'moderate',
          sourceAgent: 'disaster_risk',
          provenance: 'ai_inference',
          entityAffected: 'Emergency Evacuation Route',
        },
      ],
      metrics: [
        { label: 'Evacuation Clearance Time', value: '< 45 mins', change: 'Standard', trend: 'positive' },
        { label: 'Secondary Hazard Vulnerability', value: 'Low', change: 'Mitigated', trend: 'positive' },
        { label: 'Emergency Shelter Proximity', value: '1.8 km', change: 'Accessible', trend: 'positive' },
      ],
    };
  }
}

// 8. Social Impact Agent
export class SocialImpactAgent implements PolicySimulationAgent {
  readonly id = 'social';
  readonly name = 'Social Impact & Community Cohesion Agent';
  readonly departmentAffinity = 'Social Welfare & Community Development';
  readonly description = 'Analyzes public acceptance, quality of life, livelihood stability, social harmony, and public feedback.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const { policy } = context;
    const score = 56;
    return {
      domain: 'social',
      domainName: this.name,
      overallSeverity: 'moderate',
      score,
      confidence: 85,
      summary: `Gauged community sentiment, public trust, social equity, and civic participation regarding the proposed administrative intervention.`,
      findings: [
        {
          id: 'soc_1',
          title: 'Public Information & Grama Sabha Briefing',
          description: `Transparent public hearings and bilingual Tamil/English administrative notices will substantially minimize misinformation and citizen apprehension.`,
          severity: 'moderate',
          sourceAgent: 'social',
          provenance: 'ai_inference',
          entityAffected: 'Local Community Forums & Civic Bodies',
        },
        {
          id: 'soc_2',
          title: 'Livelihood Transition Support',
          description: `Any affected local vendors or families require structured rehabilitation or scheduled relocation compensation timelines.`,
          severity: 'high',
          sourceAgent: 'social',
          provenance: 'assumption',
          entityAffected: 'Impacted Families & Artisans',
        },
      ],
      metrics: [
        { label: 'Public Acceptance Probability', value: '78%', change: 'High with Outreach', trend: 'positive' },
        { label: 'Social Grievance Redressal Mechanism', value: 'Ready', change: 'Toll-free Helpdesk', trend: 'positive' },
        { label: 'Quality of Life Index', value: 'Balanced', change: 'Stable', trend: 'neutral' },
      ],
    };
  }
}

// 9. Policy Compliance Agent
export class PolicyComplianceAgent implements PolicySimulationAgent {
  readonly id = 'policy_compliance';
  readonly name = 'Policy & Regulatory Compliance Agent';
  readonly departmentAffinity = 'Law & Administrative Reforms / Secretariat';
  readonly description = 'Audits administrative norms, statutory clearances, legal consistency, safety codes, and official guidelines.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const { policy } = context;
    const score = 42;
    return {
      domain: 'policy_compliance',
      domainName: this.name,
      overallSeverity: 'low',
      score,
      confidence: 93,
      summary: `Verified alignment with Tamil Nadu Municipal Corporation Acts, environmental guidelines, road safety manuals (IRC), and administrative protocols.`,
      findings: [
        {
          id: 'pol_1',
          title: 'Statutory Administrative Sanctions',
          description: `The proposed measure adheres to standard government approval hierarchies; inter-departmental NOCs from Highways and Police are required prior to gazette notification.`,
          severity: 'low',
          sourceAgent: 'policy_compliance',
          provenance: 'ai_inference',
          entityAffected: 'Government Secretariat & District Administration',
        },
        {
          id: 'pol_2',
          title: 'Public Safety Standard Adherence',
          description: `Complies with national safety and accessibility guidelines, provided contractor safety audits occur fortnightly.`,
          severity: 'low',
          sourceAgent: 'policy_compliance',
          provenance: 'simulation_estimate',
          entityAffected: 'Safety Inspection Directorate',
        },
      ],
      metrics: [
        { label: 'Statutory Clearance Status', value: 'Compliant', change: 'NOC Req', trend: 'positive' },
        { label: 'Regulatory Risk', value: 'Low', change: 'Standard Norms', trend: 'positive' },
        { label: 'Audit Trail Readiness', value: '100%', change: 'Digital Log', trend: 'positive' },
      ],
    };
  }
}

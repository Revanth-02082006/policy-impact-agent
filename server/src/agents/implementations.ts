import {
  AgentAnalysis,
  AgentImpactDomain,
  ImpactFinding,
  ImpactSeverity,
  PolicyCategory,
  PolicyUnderstanding,
  ScenarioInput,
  DomainConditionEvaluation,
} from '../types.js';
import { AgentExecutionContext, PolicySimulationAgent } from './baseAgent.js';
import { classifyProposalMeaning, extractStructuredProposalUnderstanding } from '../proposalUnderstanding.js';
import { resolveLocationAdministrativeProfile } from '../locationContextData.js';
import { analyzeLocationConditionedImpact } from '../locationConditionedAnalysis.js';

export function classifyPolicy(description: string, department?: string): PolicyCategory {
  return classifyProposalMeaning(description, department).primaryDomain;
}

/**
 * Helper to fetch location-conditioned evaluation for any domain
 */
function getDomainConditionEvaluation(
  context: AgentExecutionContext,
  domain: AgentImpactDomain
): DomainConditionEvaluation {
  if (context.locationImpactContext && (context as any).domainConditionEvaluations?.[domain]) {
    return (context as any).domainConditionEvaluations[domain];
  }

  const proposal =
    context.proposalUnderstanding ||
    extractStructuredProposalUnderstanding(context.input);
  const locationProfile = resolveLocationAdministrativeProfile(context.input);
  const { domainConditionEvaluations } = analyzeLocationConditionedImpact(
    proposal,
    context.input,
    context.infrastructure,
    locationProfile
  );
  return domainConditionEvaluations[domain];
}

/**
 * Builds standard AgentAnalysis adhering to Location-Conditioned Impact Analysis rules:
 * - Irrelevant domains receive "Minimal/No Direct Impact", 0 score, 0 positiveScore (NEVER generic 15-20 friction)
 * - Relevant domains reflect site-specific conditions, sensitive receptors, and location factors
 */
function buildAnalysisFromConditionEvaluation(
  agent: PolicySimulationAgent,
  context: AgentExecutionContext,
  evalResult: DomainConditionEvaluation,
  customMetrics?: Array<{ label: string; value: string | number; change?: string; trend?: 'positive' | 'negative' | 'neutral' }>
): AgentAnalysis {
  const {
    domain,
    relevance,
    impactClassification,
    positiveImpacts,
    negativeImpacts,
    locationFactors,
    evidence,
    unknowns,
    mitigationOptions,
    confidence,
  } = evalResult;

  // RULE 12: Irrelevant domains receive ZERO friction (not arbitrary 15, 18, 20)
  if (impactClassification === 'Minimal/No Direct Impact' || relevance === 'Minimal/No Direct Impact') {
    return {
      domain,
      domainName: agent.name,
      overallSeverity: 'very_low',
      score: 0, // Zero friction
      positiveScore: 0,
      confidence,
      summary: `Minimal/No Direct Impact — The proposed decision has no direct causal relationship to ${agent.name.toLowerCase()} at ${context.policy.location}.`,
      conditionEvaluation: evalResult,
      findings: [
        {
          id: `${domain}_min_1`,
          title: 'Minimal/No Direct Impact',
          description: `Analysis confirms that ${agent.name} is not directly impacted by this administrative proposal under verified site conditions in ${context.policy.location}.`,
          severity: 'very_low',
          sourceAgent: domain,
          provenance: 'ai_inference',
          entityAffected: 'Non-impacted domain',
          polarity: 'neutral',
        },
      ],
      positiveFindings: [],
      negativeFindings: [],
      metrics: [
        { label: 'Domain Relevance', value: 'None', change: 'Zero Causal Link', trend: 'neutral' },
        { label: 'Operational Friction', value: '0/100', change: 'No Disruption', trend: 'neutral' },
        { label: 'Direct Public Impact', value: 'Negligible', change: 'Isolated', trend: 'neutral' },
      ],
    };
  }

  let score = 30;
  let positiveScore = 30;
  let overallSeverity: ImpactSeverity = 'moderate';

  if (impactClassification === 'Significant Negative') {
    score = 88;
    positiveScore = 0;
    overallSeverity = 'high';
  } else if (impactClassification === 'Potential Negative') {
    score = 65;
    positiveScore = 12;
    overallSeverity = 'moderate';
  } else if (impactClassification === 'Significant Positive') {
    score = 22;
    positiveScore = 88;
    overallSeverity = 'low';
  } else if (impactClassification === 'Potential Positive') {
    score = 38;
    positiveScore = 65;
    overallSeverity = 'moderate';
  } else if (impactClassification === 'Neutral') {
    score = 30;
    positiveScore = 30;
    overallSeverity = 'low';
  }

  const positiveFindings: ImpactFinding[] = positiveImpacts.map((txt, idx) => ({
    id: `${domain}_pos_${idx + 1}`,
    title: `Potential Impact: ${txt.length > 50 ? txt.slice(0, 47) + '...' : txt}`,
    description: txt,
    severity: 'low',
    sourceAgent: domain,
    provenance: 'ai_inference',
    entityAffected: `${context.policy.location} Economic & Civic Network`,
    polarity: 'positive',
  }));

  const negativeFindings: ImpactFinding[] = negativeImpacts.map((txt, idx) => ({
    id: `${domain}_neg_${idx + 1}`,
    title: `Location Risk: ${txt.length > 50 ? txt.slice(0, 47) + '...' : txt}`,
    description: txt,
    severity: impactClassification === 'Significant Negative' ? 'high' : 'moderate',
    sourceAgent: domain,
    provenance: 'verified_geographic_data',
    entityAffected: `${context.policy.location} Environment & Public Safety`,
    polarity: 'negative',
  }));

  const findings = [...positiveFindings, ...negativeFindings];

  const summary = [
    `Location-Conditioned Assessment for ${agent.name} (${impactClassification}):`,
    positiveImpacts.length > 0 ? `Benefits: ${positiveImpacts.join('; ')}.` : '',
    negativeImpacts.length > 0 ? `Risks: ${negativeImpacts.join('; ')}.` : '',
    locationFactors.length > 0 ? `Site Factors: ${locationFactors.join('; ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const defaultMetrics = [
    {
      label: 'Site Compatibility',
      value: impactClassification.includes('Positive')
        ? 'Favorable'
        : impactClassification.includes('Negative')
        ? 'Constrained'
        : 'Neutral',
      trend: (impactClassification.includes('Positive')
        ? 'positive'
        : impactClassification.includes('Negative')
        ? 'negative'
        : 'neutral') as 'positive' | 'negative' | 'neutral',
    },
    {
      label: 'Operational Risk',
      value: `${score}/100`,
      change: impactClassification === 'Significant Negative' ? 'High Risk' : 'Standard',
      trend: score > 50 ? ('negative' as const) : ('positive' as const),
    },
    {
      label: 'Evidenced Benefit',
      value: `${positiveScore}/100`,
      change: positiveScore > 50 ? 'Evidenced' : 'Unconfirmed',
      trend: positiveScore > 50 ? ('positive' as const) : ('neutral' as const),
    },
  ];

  return {
    domain,
    domainName: agent.name,
    overallSeverity,
    score,
    positiveScore,
    confidence,
    summary,
    conditionEvaluation: evalResult,
    findings,
    positiveFindings,
    negativeFindings,
    metrics: customMetrics && customMetrics.length > 0 ? customMetrics : defaultMetrics,
  };
}

// 1. Transport Impact Agent
export class TransportImpactAgent implements PolicySimulationAgent {
  readonly id = 'transport';
  readonly name = 'Transport & Mobility Agent';
  readonly departmentAffinity = 'Highways & Transport Department';
  readonly description = 'Analyzes road network, traffic diversions, travel time, public transit, and emergency access.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const evalResult = getDomainConditionEvaluation(context, 'transport');
    return buildAnalysisFromConditionEvaluation(this, context, evalResult);
  }
}

// 2. Infrastructure Agent
export class InfrastructureImpactAgent implements PolicySimulationAgent {
  readonly id = 'infrastructure';
  readonly name = 'Civil Infrastructure & Utilities Agent';
  readonly departmentAffinity = 'Public Works & Municipal Administration';
  readonly description = 'Analyzes utilities, power grids, water supply, stormwater drainage, and administrative civil assets.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const evalResult = getDomainConditionEvaluation(context, 'infrastructure');
    return buildAnalysisFromConditionEvaluation(this, context, evalResult);
  }
}

// 3. Population Impact Agent
export class PopulationImpactAgent implements PolicySimulationAgent {
  readonly id = 'population';
  readonly name = 'Population & Community Equity Agent';
  readonly departmentAffinity = 'Revenue & Social Welfare';
  readonly description = 'Assesses impacts on local residents, businesses, schools, vulnerable demographics, and public convenience.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const evalResult = getDomainConditionEvaluation(context, 'population');
    return buildAnalysisFromConditionEvaluation(this, context, evalResult);
  }
}

// 4. Essential Services Agent
export class EssentialServicesImpactAgent implements PolicySimulationAgent {
  readonly id = 'essential_services';
  readonly name = 'Essential Public Services Agent';
  readonly departmentAffinity = 'Health & Family Welfare / Police / Fire & Rescue';
  readonly description = 'Monitors hospital connectivity, fire station response, police coverage, schools, and civic offices.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const evalResult = getDomainConditionEvaluation(context, 'essential_services');
    return buildAnalysisFromConditionEvaluation(this, context, evalResult);
  }
}

// 5. Economic Agent
export class EconomicImpactAgent implements PolicySimulationAgent {
  readonly id = 'economic';
  readonly name = 'Economic & Local Trade Agent';
  readonly departmentAffinity = 'Finance & Commercial Taxes / MSME';
  readonly description = 'Analyzes local business revenue, employment, supply chain logistics, municipal revenue, and trade.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const evalResult = getDomainConditionEvaluation(context, 'economic');
    return buildAnalysisFromConditionEvaluation(this, context, evalResult);
  }
}

// 6. Environmental Agent
export class EnvironmentalImpactAgent implements PolicySimulationAgent {
  readonly id = 'environmental';
  readonly name = 'Environmental & Ecological Agent';
  readonly departmentAffinity = 'Environment, Climate Change & Forests / TNPCB';
  readonly description = 'Evaluates air quality, water bodies, tree canopy, noise levels, wetlands, floodplains, and climate resilience.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const evalResult = getDomainConditionEvaluation(context, 'environmental');
    return buildAnalysisFromConditionEvaluation(this, context, evalResult);
  }
}

// 7. Disaster Risk Agent
export class DisasterRiskImpactAgent implements PolicySimulationAgent {
  readonly id = 'disaster_risk';
  readonly name = 'Disaster Management & Emergency Resilience Agent';
  readonly departmentAffinity = 'Tamil Nadu Disaster Risk Reduction Agency (TNDRRA)';
  readonly description = 'Assesses flood, cyclone, fire, seismic vulnerability, heatwaves, and emergency evacuation clearance.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const evalResult = getDomainConditionEvaluation(context, 'disaster_risk');
    return buildAnalysisFromConditionEvaluation(this, context, evalResult);
  }
}

// 8. Social Impact Agent
export class SocialImpactAgent implements PolicySimulationAgent {
  readonly id = 'social';
  readonly name = 'Social Impact & Community Cohesion Agent';
  readonly departmentAffinity = 'Social Welfare & Community Development';
  readonly description = 'Analyzes public acceptance, quality of life, livelihood stability, social harmony, and public feedback.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const evalResult = getDomainConditionEvaluation(context, 'social');
    return buildAnalysisFromConditionEvaluation(this, context, evalResult);
  }
}

// 9. Policy Compliance Agent
export class PolicyComplianceAgent implements PolicySimulationAgent {
  readonly id = 'policy_compliance';
  readonly name = 'Policy & Regulatory Compliance Agent';
  readonly departmentAffinity = 'Law & Administrative Reforms / Secretariat';
  readonly description = 'Audits administrative norms, statutory clearances, legal consistency, safety codes, and official guidelines.';

  async analyze(context: AgentExecutionContext): Promise<AgentAnalysis> {
    const evalResult = getDomainConditionEvaluation(context, 'policy_compliance');
    return buildAnalysisFromConditionEvaluation(this, context, evalResult);
  }
}

export type ImpactSeverity = 'very_low' | 'low' | 'moderate' | 'high' | 'critical';

export type DataProvenance =
  | 'provided_data'
  | 'verified_geographic_data'
  | 'synthetic_demo_data'
  | 'ai_inference'
  | 'simulation_estimate'
  | 'assumption';

export type PolicyCategory =
  | 'Infrastructure'
  | 'Transport'
  | 'Transport Infrastructure'
  | 'Disaster Management'
  | 'Urban Planning'
  | 'Municipal Administration'
  | 'Municipal Infrastructure / Water & Sanitation'
  | 'Water Resources'
  | 'Water Resources / Disaster Resilience'
  | 'Public Safety'
  | 'Healthcare'
  | 'Education'
  | 'Environment'
  | 'Industry'
  | 'Industry / Economic Development'
  | 'Land Use / Urban & Regional Development'
  | 'Governance / Public Administration'
  | 'Agriculture'
  | 'Energy'
  | 'Housing'
  | 'Revenue'
  | 'Police'
  | 'Forest'
  | 'Tourism'
  | 'Others';

export interface StructuredProposalUnderstanding {
  proposalObjective: string;
  primaryAction: string;
  asset: string;
  sector: string;
  primaryDomain: string;
  secondaryDomains: string[];
  responsibleDepartment: string;
  leadAdministrativeAuthority: string;
  geographicLocation: string;
  administrativeLevel: 'Village' | 'Town' | 'Municipality' | 'Corporation' | 'District' | 'State';
  scale: 'Local' | 'Ward' | 'City' | 'District' | 'State' | 'Regional';
  budget: string;
  affectedPopulation: string;
  landType: string;
  explicitStakeholders: string[];
  inferredStakeholders: string[];
  positiveObjectives: string[];
  potentialImpacts: string[];
  potentialRisks: string[];
  requiredApprovals: string[];
  unknowns: string[];
  urgency: 'Low' | 'Standard' | 'Urgent' | 'Emergency';
  confidence: number;
}

export type AgentImpactDomain =
  | 'transport'
  | 'infrastructure'
  | 'population'
  | 'essential_services'
  | 'economic'
  | 'environmental'
  | 'disaster_risk'
  | 'social'
  | 'policy_compliance';

export interface ScenarioInput {
  description: string;
  location?: string;
  district?: string;
  city?: string;
  town?: string;
  village?: string;
  area?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  selectedAsset?: string;
  selectedAssetId?: string;
  selectedAssetSource?: DataProvenance;
  duration?: string;
  reason?: string;
  department?: string;
  constraints?: string;
}

export interface PolicyUnderstanding {
  decisionType: string;
  department: string;
  location: string;
  affectedArea: string;
  duration: string;
  reason: string;
  scale: 'Local' | 'Zonal' | 'City-wide' | 'District-wide' | 'Regional' | 'State-wide';
  stakeholders: string[];
  infrastructure: string[];
  resourcesRequired: string[];
  urgency: 'Low' | 'Standard' | 'Urgent' | 'Emergency';
  confidenceScore: number; // 0 to 100
  summary: string;
  category: PolicyCategory;
  // Structured Proposal Understanding
  proposalUnderstanding?: StructuredProposalUnderstanding;
  secondaryDomains?: string[];
  administrativeLevel?: 'Village' | 'Town' | 'Municipality' | 'Corporation' | 'District' | 'State';
  budget?: string;
  landType?: string;
  unknowns?: string[];
  explicitStakeholders?: string[];
  inferredStakeholders?: string[];
  // Backward compatibility fields
  action?: string;
  asset?: string;
  constraints?: string[];
  dataSource?: DataProvenance;
}

export interface ImpactFinding {
  id: string;
  title: string;
  description: string;
  severity: ImpactSeverity;
  sourceAgent: AgentImpactDomain;
  provenance: DataProvenance;
  entityAffected: string;
  polarity?: 'positive' | 'negative' | 'neutral';
}

export interface AgentAnalysis {
  domain: AgentImpactDomain;
  domainName: string;
  overallSeverity: ImpactSeverity;
  score: number; // 0 to 100 (Operational / Risk index)
  positiveScore?: number; // 0 to 100 (Societal Benefit / Gain index)
  positiveSummary?: string;
  riskSummary?: string;
  summary: string;
  findings: ImpactFinding[];
  positiveFindings?: ImpactFinding[];
  negativeFindings?: ImpactFinding[];
  metrics: Array<{
    label: string;
    value: string | number;
    change?: string;
    trend?: 'positive' | 'negative' | 'neutral';
  }>;
  confidence?: number; // 0 to 100
}

export interface CascadingNode {
  id: string;
  label: string;
  cause: string;
  effect: string;
  severity: ImpactSeverity;
  confidence: number; // 0 to 100
  department: string;
  description: string;
  type: 'decision' | 'direct_effect' | 'secondary_effect' | 'service_impact' | 'critical_consequence';
  polarity?: 'positive' | 'negative' | 'neutral';
  assumption?: string;
}

export interface CascadingEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface CascadingGraph {
  nodes: CascadingNode[];
  edges: CascadingEdge[];
  primaryChainSummary: string;
}

export type GainClassification =
  | 'Very Low Gain'
  | 'Low Gain'
  | 'Moderate Gain'
  | 'High Gain'
  | 'Very High Gain';

export type FrictionClassification =
  | 'Very Low Friction'
  | 'Low Friction'
  | 'Moderate Friction'
  | 'High Friction'
  | 'Very High Friction';

export function getGainClassification(score: number): GainClassification {
  if (score <= 25) return 'Very Low Gain';
  if (score <= 45) return 'Low Gain';
  if (score <= 60) return 'Moderate Gain';
  if (score <= 80) return 'High Gain';
  return 'Very High Gain';
}

export function getFrictionClassification(score: number): FrictionClassification {
  if (score <= 20) return 'Very Low Friction';
  if (score <= 40) return 'Low Friction';
  if (score <= 60) return 'Moderate Friction';
  if (score <= 80) return 'High Friction';
  return 'Very High Friction';
}

export interface ImpactScores {
  transport: number;
  infrastructure: number;
  economic: number;
  environmental: number;
  publicSafety: number;
  population: number;
  healthcare: number;
  education: number;
  disasterRisk: number;
  overallPolicyRisk: number;
  positiveScores?: {
    transport: number;
    infrastructure: number;
    economic: number;
    environmental: number;
    publicSafety: number;
    population: number;
    healthcare: number;
    education: number;
    disasterRisk: number;
    overallSocietalBenefit: number;
  };
  overallSocietalBenefit?: number;
  netViabilityScore?: number;
  polarity?: 'positive' | 'negative' | 'mixed';
  gainScore?: number;
  gainClassification?: GainClassification;
  gainJustification?: string;
  frictionScore?: number;
  frictionClassification?: FrictionClassification;
  frictionJustification?: string;
}

export interface AlternativeStrategy {
  id: string;
  title: string;
  optionType: string;
  description: string;
  advantages: string[]; // Benefits
  disadvantages: string[]; // Risks
  mitigations: string[];
  cost: string; // e.g. "₹2.5 Cr", "Low (+5%)", "Budget Neutral"
  implementationDifficulty: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  overallRisk: ImpactSeverity;
  recommendationStatus: 'Recommended' | 'Baseline / Proposed' | 'Secondary Option' | 'Contingency';
  scores: {
    transport: number;
    economy: number;
    environment: number;
    safety: number;
    population: number;
    overall: number;
    // Backward compatibility
    essentialServices?: number;
    disasterRisk?: number;
  };
  // Backward compatibility
  benefits?: string[];
  risks?: string[];
}

export interface ComparisonMatrix {
  options: AlternativeStrategy[];
  recommendedOptionId: string;
  rationale: string;
}

export interface DecisionRecommendation {
  title: string;
  recommendedOptionId: string;
  recommendedOptionTitle: string;
  why: string;
  summary: string;
  benefits: string[];
  risks: string[];
  mitigations: string[];
  precautions: string[];
  confidence: number; // 0 to 100
  assumptions: string[];
  dataLimitations: string[];
  // Backward compatibility
  rationalePoints?: string[];
  keyRisks?: string[];
  mitigationMeasures?: string[];
}

export interface SimulationResult {
  simulationId: string;
  timestamp: string;
  isLiveGemini: boolean;
  input: ScenarioInput;
  policy: PolicyUnderstanding;
  agentAnalyses: Record<AgentImpactDomain, AgentAnalysis>;
  impactScores: ImpactScores;
  cascadingGraph: CascadingGraph;
  alternatives: AlternativeStrategy[];
  comparison: ComparisonMatrix;
  recommendation: DecisionRecommendation;
  overallScore: number;
  positiveScore?: number; // Overall Societal Benefit (0 to 100)
  polarity?: 'positive' | 'negative' | 'mixed';
  gainScore?: number;
  gainClassification?: GainClassification;
  gainJustification?: string;
  frictionScore?: number;
  frictionClassification?: FrictionClassification;
  frictionJustification?: string;
  netViability?: {
    status:
      | 'Highly Favorable'
      | 'Favorable with Safeguards'
      | 'Balanced Trade-off'
      | 'High Friction Precaution'
      | 'Unfavorable — Net Negative Impact'
      | 'Severely Unfavorable — High Social & Environmental Risk';
    badgeClass: string;
    netScore: number;
    summary: string;
    polarity?: 'positive' | 'negative' | 'mixed';
  };
  balancedEvaluation?: BalancedDecisionEvaluation;
  disclaimer: string;
  populationContext?: {
    settlementName: string;
    settlementType: string;
    corridorEstimatedPopulation: number;
    densityCategory: string;
    district: string;
    state: string;
    affectedDemographicSummary: string;
  };
  locationContextAnalysis?: {
    district: string;
    resolvedArea: string;
    zoningClassification: string;
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
  };
  proposalUnderstanding?: StructuredProposalUnderstanding;
}

export type BalancedImpactLevel =
  | 'High Positive'
  | 'Moderate Positive'
  | 'Neutral'
  | 'Moderate Negative'
  | 'High Negative';

export type BalancedEvaluationDimensionKey =
  | 'economic'
  | 'environmental'
  | 'social'
  | 'publicHealthSafety'
  | 'infrastructure'
  | 'municipalAdmin'
  | 'legalCompliance'
  | 'longTermSustainability';

export interface BalancedDimensionAssessment {
  dimension: BalancedEvaluationDimensionKey;
  dimensionLabel: string;
  impactLevel: BalancedImpactLevel;
  positiveImpacts: string[];
  negativeImpacts: string[];
  evidence: string;
  uncertainties?: string[];
}

export interface BalancedDecisionEvaluation {
  overallClassification: 'Positive' | 'Mixed' | 'Negative';
  classificationRationale: string;
  dimensions: Record<BalancedEvaluationDimensionKey, BalancedDimensionAssessment>;
  allPositiveImpacts: string[];
  allNegativeImpacts: string[];
  severeImpactFlags: {
    irreversibleEnvironmentalDamage: boolean;
    destructionOfAgriculturalLand: boolean;
    displacementOfPeople: boolean;
    seriousPollution: boolean;
    publicSafetyRisks: boolean;
    violatesMunicipalRegulations: boolean;
  };
  uncertaintiesAndDataGaps: string[];
}

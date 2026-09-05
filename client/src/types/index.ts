export type ImpactSeverity = 'low' | 'moderate' | 'high' | 'critical';

export type DataProvenance = 'provided_data' | 'verified_geographic_data' | 'synthetic_demo_data' | 'ai_inference' | 'simulation_estimate' | 'assumption';

export type AgentImpactDomain = 'transport' | 'essential_services' | 'population' | 'disaster_risk';

export interface ScenarioInput {
  description: string;
  location?: string;
  district?: string;
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
  action: string;
  asset: string;
  location: string;
  duration: string;
  reason: string;
  constraints: string[];
  affectedArea: string;
  summary: string;
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
}

export interface AgentAnalysis {
  domain: AgentImpactDomain;
  domainName: string;
  overallSeverity: ImpactSeverity;
  score: number;
  summary: string;
  findings: ImpactFinding[];
  metrics: Array<{ label: string; value: string | number; change?: string }>;
}

export interface CascadingNode {
  id: string;
  label: string;
  type: 'decision' | 'direct_effect' | 'secondary_effect' | 'service_impact' | 'critical_consequence';
  severity: ImpactSeverity;
  department: string;
  description: string;
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

export interface AlternativeStrategy {
  id: string;
  title: string;
  optionType: string;
  description: string;
  benefits: string[];
  risks: string[];
  mitigations: string[];
  scores: {
    transport: number;
    essentialServices: number;
    population: number;
    disasterRisk: number;
    overall: number;
  };
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
  summary: string;
  rationalePoints: string[];
  keyRisks: string[];
  mitigationMeasures: string[];
  assumptions: string[];
  dataLimitations: string[];
}

export interface SimulationResult {
  simulationId: string;
  timestamp: string;
  isLiveGemini: boolean;
  input: ScenarioInput;
  policy: PolicyUnderstanding;
  agentAnalyses: {
    transport: AgentAnalysis;
    essential_services: AgentAnalysis;
    population: AgentAnalysis;
    disaster_risk: AgentAnalysis;
  };
  cascadingGraph: CascadingGraph;
  alternatives: AlternativeStrategy[];
  comparison: ComparisonMatrix;
  recommendation: DecisionRecommendation;
  overallScore: number;
  populationContext?: {
    settlementName: string;
    settlementType: string;
    corridorEstimatedPopulation: number;
    densityCategory: string;
    district: string;
    state: string;
    affectedDemographicSummary: string;
  };
}

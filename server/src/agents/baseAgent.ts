import {
  AgentAnalysis,
  AgentImpactDomain,
  PolicyUnderstanding,
  ScenarioInput,
  StructuredProposalUnderstanding,
  LocationImpactContext,
} from '../types.js';
import { InfrastructureLookupResult } from '../infrastructure.js';

export interface AgentExecutionContext {
  input: ScenarioInput;
  policy: PolicyUnderstanding;
  infrastructure: InfrastructureLookupResult;
  locationTitle: string;
  proposalUnderstanding?: StructuredProposalUnderstanding;
  locationImpactContext?: LocationImpactContext;
  unknowns?: string[];
  verifiedEvidence?: string[];
}

/**
 * Common Future-Ready AI Agent Interface
 * Any new specialized AI agent (e.g., Energy Impact, Tourism, Agriculture)
 * can implement this interface and be plugged directly into the Orchestrator.
 */
export interface PolicySimulationAgent {
  readonly id: AgentImpactDomain;
  readonly name: string;
  readonly departmentAffinity: string;
  readonly description: string;

  analyze(context: AgentExecutionContext): Promise<AgentAnalysis>;
}

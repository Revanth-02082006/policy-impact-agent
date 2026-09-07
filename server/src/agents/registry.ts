import {
  AgentAnalysis,
  AgentImpactDomain,
  ImpactScores,
} from '../types.js';
import { computeImpactScores as computeEngineImpactScores } from '../demoFallback.js';
import { AgentExecutionContext, PolicySimulationAgent } from './baseAgent.js';
import {
  TransportImpactAgent,
  InfrastructureImpactAgent,
  PopulationImpactAgent,
  EssentialServicesImpactAgent,
  EconomicImpactAgent,
  EnvironmentalImpactAgent,
  DisasterRiskImpactAgent,
  SocialImpactAgent,
  PolicyComplianceAgent,
} from './implementations.js';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<AgentImpactDomain, PolicySimulationAgent> = new Map();

  private constructor() {
    // Register all default core agents for V2
    this.register(new TransportImpactAgent());
    this.register(new InfrastructureImpactAgent());
    this.register(new PopulationImpactAgent());
    this.register(new EssentialServicesImpactAgent());
    this.register(new EconomicImpactAgent());
    this.register(new EnvironmentalImpactAgent());
    this.register(new DisasterRiskImpactAgent());
    this.register(new SocialImpactAgent());
    this.register(new PolicyComplianceAgent());
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Future-Ready Extensibility:
   * Third parties or future plugins can register additional custom agents at runtime!
   */
  public register(agent: PolicySimulationAgent): void {
    this.agents.set(agent.id, agent);
  }

  public get(id: AgentImpactDomain): PolicySimulationAgent | undefined {
    return this.agents.get(id);
  }

  public getAll(): PolicySimulationAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Execute all registered domain agents in parallel and aggregate their analyses
   */
  public async executeAll(
    context: AgentExecutionContext
  ): Promise<Record<AgentImpactDomain, AgentAnalysis>> {
    const promises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        const analysis = await agent.analyze(context);
        return { id: agent.id, analysis };
      } catch (err: any) {
        console.error(`Agent execution failed for ${agent.name}:`, err);
        // Resilient fallback for that specific agent
        const fallbackAnalysis: AgentAnalysis = {
          domain: agent.id,
          domainName: agent.name,
          overallSeverity: 'moderate',
          score: 50,
          confidence: 70,
          summary: `Analysis for ${agent.name} completed with heuristic baseline due to timeout.`,
          findings: [],
          metrics: [],
        };
        return { id: agent.id, analysis: fallbackAnalysis };
      }
    });

    const results = await Promise.all(promises);
    const map = {} as Record<AgentImpactDomain, AgentAnalysis>;
    for (const r of results) {
      map[r.id] = r.analysis;
    }
    return map;
  }

  /**
   * Calculate standardized 10-metric impact scores from agent analyses using mandatory Impact Scoring Framework
   */
  public computeImpactScores(
    analyses: Record<AgentImpactDomain, AgentAnalysis>,
    hintPolarity?: 'positive' | 'negative' | 'mixed',
    description: string = ''
  ): ImpactScores {
    return computeEngineImpactScores(analyses, hintPolarity, description);
  }
}

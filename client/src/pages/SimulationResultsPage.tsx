import React, { useState, useEffect } from 'react';
import { SimulationResult, AgentImpactDomain } from '../types/index.js';
import { AgentPipeline } from '../components/AgentPipeline.js';
import { PolicyUnderstandingCard } from '../components/PolicyUnderstandingCard.js';
import { AgentCard } from '../components/AgentCard.js';
import { CascadingGraphView } from '../components/CascadingGraph.js';
import { TamilNaduMap } from '../components/TamilNaduMap.js';
import { WhatIfMatrix } from '../components/WhatIfMatrix.js';
import { RecommendationCard } from '../components/RecommendationCard.js';
import { ImpactScoresCard, getRiskClassification } from '../components/ImpactScoresCard.js';
import { DisclaimerBanner } from '../components/DisclaimerBanner.js';
import {
  Activity,
  ShieldAlert,
  Cpu,
  FileText,
  ArrowRight,
  Printer,
  Network,
  Layers,
  MapPin,
  CheckCircle2,
  Filter,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { BalancedEvaluationCard } from '../components/BalancedEvaluationCard.js';
import { Link, useLocation } from 'react-router-dom';

interface SimulationResultsPageProps {
  simulation: SimulationResult | null;
  isSimulating: boolean;
  onPipelineComplete?: () => void;
}

export const SimulationResultsPage: React.FC<SimulationResultsPageProps> = ({
  simulation,
  isSimulating,
  onPipelineComplete,
}) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'balanced' | 'agents' | 'cascading' | 'alternatives'>('all');
  const [selectedAgentDomain, setSelectedAgentDomain] = useState<string>('all');
  const [agentFilterType, setAgentFilterType] = useState<'all' | 'critical' | 'benefits' | 'moderate'>('all');

  useEffect(() => {
    if (location.pathname === '/cascading') {
      setActiveTab('cascading');
    } else if (location.pathname === '/alternatives') {
      setActiveTab('alternatives');
    } else {
      setActiveTab('all');
    }
  }, [location.pathname]);

  if (isSimulating) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AgentPipeline isSimulating={isSimulating} onComplete={onPipelineComplete} />
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-full inline-block">
          <Activity className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Policy Simulation Results Loaded</h2>
        <p className="text-slate-600 text-sm">Input a proposed government policy decision in natural language to generate a simulation.</p>
        <Link
          to="/new-simulation"
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-sm shadow inline-flex items-center space-x-2"
        >
          <span>Create New Simulation</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const { policy, agentAnalyses, cascadingGraph, alternatives, comparison, recommendation, overallScore, impactScores } = simulation;
  const overallRisk = getRiskClassification(simulation.frictionScore ?? overallScore);

  const gainScore = simulation.gainScore ?? (simulation.positiveScore !== undefined ? simulation.positiveScore : (impactScores?.overallSocietalBenefit || 50));
  const frictionScore = simulation.frictionScore ?? overallScore;
  const gainClass = simulation.gainClassification || (gainScore >= 81 ? 'Very High Gain' : gainScore >= 61 ? 'High Gain' : gainScore >= 46 ? 'Moderate Gain' : gainScore >= 26 ? 'Low Gain' : 'Very Low Gain');
  const benefitBadge = gainScore >= 81
    ? { label: 'Very High Gain', class: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
    : gainScore >= 61
    ? { label: 'High Gain', class: 'bg-teal-100 text-teal-900 border-teal-300' }
    : gainScore >= 46
    ? { label: 'Moderate Gain', class: 'bg-blue-100 text-blue-900 border-blue-300' }
    : gainScore >= 26
    ? { label: 'Low Gain', class: 'bg-amber-100 text-amber-900 border-amber-300' }
    : { label: 'Very Low Gain', class: 'bg-rose-100 text-rose-950 border-rose-300' };

  const isSeverelyUnfavorable = frictionScore >= 65 || simulation.polarity === 'negative' || (simulation.netViability?.status && simulation.netViability.status.includes('Unfavorable')) || gainScore <= 45;

  const agentKeys = Object.keys(agentAnalyses) as AgentImpactDomain[];
  const criticalAgents = agentKeys.filter(
    (k) => (agentAnalyses[k]?.score || 0) >= 60 || agentAnalyses[k]?.overallSeverity === 'critical' || agentAnalyses[k]?.overallSeverity === 'high'
  );
  const benefitAgents = agentKeys.filter(
    (k) => (agentAnalyses[k]?.positiveScore || 0) >= 75
  );
  const moderateAgents = agentKeys.filter(
    (k) => (agentAnalyses[k]?.score || 0) < 60 && !criticalAgents.includes(k)
  );

  const filteredByQuickType = agentKeys.filter((k) => {
    if (agentFilterType === 'critical') return criticalAgents.includes(k);
    if (agentFilterType === 'benefits') return benefitAgents.includes(k);
    if (agentFilterType === 'moderate') return moderateAgents.includes(k);
    return true;
  });

  const displayedAgents = selectedAgentDomain === 'all'
    ? filteredByQuickType
    : filteredByQuickType.filter((k) => k === selectedAgentDomain);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Simulation Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
              {policy.category} Simulation Complete
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {policy.asset || policy.decisionType}
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed max-w-3xl">
            {policy.summary}
          </p>
        </div>

        {/* Dual Impact Score Indicators: Gain (Net Benefit) & Friction (Resistance) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex-shrink-0">
          {/* Gain Score */}
          <div className="text-right pr-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Gain Score (Net Benefit)
            </span>
            <span className={`text-2xl font-black block leading-tight ${gainScore >= 61 ? 'text-emerald-700' : gainScore >= 46 ? 'text-blue-700' : 'text-rose-700'}`}>
              {gainScore}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
            <span className={`text-[9px] px-2 py-0.2 rounded-full font-black uppercase border ${benefitBadge.class}`}>
              {gainClass}
            </span>
          </div>

          <div className="h-10 w-px bg-slate-200"></div>

          {/* Friction Score */}
          <div className="text-right pr-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Friction Score (Resistance)
            </span>
            <span className={`text-2xl font-black block leading-tight ${frictionScore >= 61 ? 'text-rose-700' : frictionScore >= 41 ? 'text-amber-700' : 'text-slate-800'}`}>
              {frictionScore}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
            <span className={`text-[9px] px-2 py-0.2 rounded-full font-black uppercase border ${overallRisk.badgeClass}`}>
              {simulation.frictionClassification || overallRisk.label}
            </span>
          </div>

          {/* Balanced Assessment Indicator */}
          {simulation.balancedEvaluation && (
            <>
              <div className="h-10 w-px bg-slate-200"></div>
              <div className="text-right pr-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Balanced Status
                </span>
                <span
                  className={`text-xl font-black block leading-tight ${
                    simulation.balancedEvaluation.overallClassification === 'Positive'
                      ? 'text-emerald-700'
                      : simulation.balancedEvaluation.overallClassification === 'Negative'
                      ? 'text-rose-700'
                      : 'text-amber-700'
                  }`}
                >
                  {simulation.balancedEvaluation.overallClassification}
                </span>
                <span className="text-[9px] text-slate-500 font-bold block">
                  Equal-Weighted (12.5%)
                </span>
              </div>
            </>
          )}

          <div className="h-10 w-px bg-slate-200"></div>

          <Link
            to="/report"
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3.5 py-2.5 rounded-xl text-xs shadow flex items-center space-x-1.5 transition-colors whitespace-nowrap"
          >
            <Printer className="h-4 w-4" />
            <span>Executive Report</span>
          </Link>
        </div>
      </div>

      {/* Critical Advisory Alert Banner if Severely Unfavorable */}
      {isSeverelyUnfavorable && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-rose-900">
          <AlertTriangle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                ⚠️ Critical Advisory • Severely Unfavorable Proposal
              </span>
              <span className="text-xs font-bold text-rose-800">Friction Score: {frictionScore}/100</span>
              <span className="text-xs font-semibold text-rose-700">Gain Score: {gainScore}/100</span>
            </div>
            <p className="text-sm font-semibold text-rose-950 leading-snug">
              {simulation.netViability?.summary || 'This administrative proposal involves critical human displacement and heavy industrial pollution hazards that heavily outweigh projected welfare gains. Suspension of direct eviction and adoption of Alternative A (Relocate Factory to Uninhabited SIPCOT Industrial Park) is strongly recommended.'}
            </p>
          </div>
        </div>
      )}

      {/* Prominent Decision-Support Disclaimer */}
      <DisclaimerBanner />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-700 bg-blue-50/60'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Complete Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${
            activeTab === 'agents'
              ? 'border-blue-600 text-blue-700 bg-blue-50/60'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>9 Domain Impact Agents</span>
        </button>
        <button
          onClick={() => setActiveTab('cascading')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${
            activeTab === 'cascading'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Network className="h-4 w-4" />
          <span>Cascading Impact Graph</span>
        </button>
        <button
          onClick={() => setActiveTab('alternatives')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${
            activeTab === 'alternatives'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>What-If Alternatives & Recommendation</span>
        </button>
        <button
          onClick={() => setActiveTab('balanced')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-xl border-b-2 transition-all ${
            activeTab === 'balanced'
              ? 'border-amber-600 text-amber-700 bg-amber-50/60'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Balanced Evaluation (8 Dimensions)</span>
        </button>
      </div>

      {/* Mandatory Balanced Decision Evaluation Card */}
      {(activeTab === 'all' || activeTab === 'balanced') && (
        <BalancedEvaluationCard evaluation={simulation.balancedEvaluation} />
      )}

      {/* 1. Policy Understanding & Extracted Parameters */}
      {(activeTab === 'all' || activeTab === 'agents') && (
        <PolicyUnderstandingCard
          policy={policy}
          populationContext={simulation.populationContext}
        />
      )}

      {/* 2. Standardized 10-Metric Impact Scores */}
      {(activeTab === 'all') && (
        <ImpactScoresCard scores={impactScores || {
          transport: 76,
          infrastructure: 64,
          economic: 55,
          environmental: 62,
          publicSafety: 70,
          population: 72,
          healthcare: 68,
          education: 60,
          disasterRisk: 70,
          overallPolicyRisk: overallScore,
        }} />
      )}

      {/* 3. Nine Specialized Domain Agents */}
      {(activeTab === 'all' || activeTab === 'agents') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-extrabold text-slate-900">
                Nine Autonomous Domain Impact Agents
              </h2>
            </div>

            {/* Filter Domain */}
            <div className="flex items-center space-x-2 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedAgentDomain}
                onChange={(e) => setSelectedAgentDomain(e.target.value)}
                className="rounded-lg border border-slate-300 py-1 px-2 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="all">All 9 Agents</option>
                {agentKeys.map((k) => (
                  <option key={k} value={k}>
                    {agentAnalyses[k]?.domainName || k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Buttons & Executive Tally */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Tally:</span>
              <span className={`text-xs px-2 py-0.5 rounded-lg font-bold border ${criticalAgents.length > 0 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                🔴 {criticalAgents.length} Critical {criticalAgents.length === 1 ? 'Concern' : 'Concerns'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold border bg-emerald-100 text-emerald-800 border-emerald-200">
                🟢 {benefitAgents.length} Key {benefitAgents.length === 1 ? 'Benefit' : 'Benefits'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold border bg-blue-100 text-blue-800 border-blue-200">
                🟡 {moderateAgents.length} Manageable
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAgentFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${agentFilterType === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
              >
                All 9 Domains ({agentKeys.length})
              </button>
              {criticalAgents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAgentFilterType('critical')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${agentFilterType === 'critical' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'}`}
                >
                  Critical Concerns ({criticalAgents.length})
                </button>
              )}
              {benefitAgents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAgentFilterType('benefits')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${agentFilterType === 'benefits' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}
                >
                  Key Gains ({benefitAgents.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setAgentFilterType('moderate')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${agentFilterType === 'moderate' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}
              >
                Manageable ({moderateAgents.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedAgents.map((key) => {
              const analysis = agentAnalyses[key];
              if (!analysis) return null;
              return <AgentCard key={key} analysis={analysis} />;
            })}
          </div>
        </div>
      )}

      {/* 4. Cascading Consequence Engine Graph */}
      {(activeTab === 'all' || activeTab === 'cascading') && (
        <CascadingGraphView graph={cascadingGraph} />
      )}

      {/* 5. Interactive Spatial Map */}
      {(activeTab === 'all') && (
        <TamilNaduMap
          location={simulation.input.location}
          district={simulation.input.district}
          city={simulation.input.city}
          town={simulation.input.town}
          village={simulation.input.village}
          selectedAsset={simulation.input.selectedAsset || simulation.policy.asset}
          latitude={simulation.input.latitude}
          longitude={simulation.input.longitude}
        />
      )}

      {/* 6. What-If Multi-Strategy Comparison Table */}
      {(activeTab === 'all' || activeTab === 'alternatives') && (
        <WhatIfMatrix
          alternatives={alternatives}
          recommendedOptionId={comparison.recommendedOptionId}
        />
      )}

      {/* 7. AI Recommendation Card */}
      {(activeTab === 'all' || activeTab === 'alternatives') && (
        <RecommendationCard recommendation={recommendation} />
      )}
    </div>
  );
};

export default SimulationResultsPage;

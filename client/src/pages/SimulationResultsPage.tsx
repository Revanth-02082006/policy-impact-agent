import React, { useState, useEffect } from 'react';
import { SimulationResult } from '../types/index.js';
import { AgentPipeline } from '../components/AgentPipeline.js';
import { PolicyUnderstandingCard } from '../components/PolicyUnderstandingCard.js';
import { AgentCard } from '../components/AgentCard.js';
import { CascadingGraphView } from '../components/CascadingGraph.js';
import { NamakkalMap } from '../components/NamakkalMap.js';
import { WhatIfMatrix } from '../components/WhatIfMatrix.js';
import { RecommendationCard } from '../components/RecommendationCard.js';
import { Activity, ShieldAlert, Cpu, FileText, ArrowRight, Printer, Network, Layers, MapPin, CheckCircle2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'all' | 'agents' | 'cascading' | 'alternatives'>('all');

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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-full inline-block mb-4">
          <Activity className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Simulation Results Loaded</h2>
        <p className="text-slate-600 text-sm mb-6">Select a simulation scenario or run a new policy impact simulation.</p>
        <Link
          to="/new-simulation"
          className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm shadow hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
        >
          <span>Create New Simulation</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const { policy, agentAnalyses, cascadingGraph, alternatives, comparison, recommendation, overallScore } = simulation;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Simulation Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-200">
              Simulation Analysis Complete
            </span>
            <span className="text-xs text-slate-400">ID: {simulation.simulationId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{policy.asset}</h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">{policy.summary}</p>
        </div>

        {/* AI Simulation Overall Score Gauge */}
        <div className="flex items-center space-x-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex-shrink-0">
          <div className="text-right">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">AI Simulation Score</span>
            <span className="text-3xl font-black text-rose-700 block leading-tight">{overallScore}<span className="text-xs font-normal text-slate-400">/100</span></span>
            <span className="text-[10px] text-rose-600 font-bold uppercase">High Impact Risk</span>
          </div>
          <div className="h-12 w-px bg-slate-200"></div>
          <Link
            to="/report"
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-lg text-xs shadow flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Generate Executive Report</span>
          </Link>
        </div>
      </div>

      {/* Interactive Module Navigation Bar */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-lg border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Complete Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-lg border-b-2 transition-all ${
            activeTab === 'agents'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>Domain Impact Agents</span>
        </button>
        <button
          onClick={() => setActiveTab('cascading')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-lg border-b-2 transition-all ${
            activeTab === 'cascading'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Network className="h-4 w-4" />
          <span>Cascading Chains</span>
        </button>
        <button
          onClick={() => setActiveTab('alternatives')}
          className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-lg border-b-2 transition-all ${
            activeTab === 'alternatives'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>What-If Matrix & Recommendation</span>
        </button>
      </div>

      {/* 1. Policy Understanding Card */}
      {(activeTab === 'all' || activeTab === 'agents') && (
        <PolicyUnderstandingCard policy={policy} populationContext={simulation.populationContext} />
      )}

      {/* 2. Four Specialized Impact Agents */}
      {(activeTab === 'all' || activeTab === 'agents') && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              <span>Four Specialized Impact Agents</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Domain-Specific Assessment</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <AgentCard analysis={agentAnalyses.transport} />
            <AgentCard analysis={agentAnalyses.essential_services} />
            <AgentCard analysis={agentAnalyses.population} />
            <AgentCard analysis={agentAnalyses.disaster_risk} />
          </div>
        </div>
      )}

      {/* 3. Cascading Consequence Engine Graph */}
      {(activeTab === 'all' || activeTab === 'cascading') && (
        <CascadingGraphView graph={cascadingGraph} />
      )}

      {/* 4. Spatial Map */}
      {(activeTab === 'all') && (
        <NamakkalMap
          location={simulation.input.location}
          district={simulation.input.district}
          locationName={simulation.input.locationName}
          selectedAsset={simulation.input.selectedAsset || simulation.policy.asset}
          latitude={simulation.input.latitude}
          longitude={simulation.input.longitude}
        />
      )}

      {/* 5. What-If Multi-Strategy Comparison */}
      {(activeTab === 'all' || activeTab === 'alternatives') && (
        <WhatIfMatrix alternatives={alternatives} recommendedOptionId={comparison.recommendedOptionId} />
      )}

      {/* 6. AI Recommendation Card */}
      {(activeTab === 'all' || activeTab === 'alternatives') && (
        <RecommendationCard recommendation={recommendation} />
      )}
    </div>
  );
};


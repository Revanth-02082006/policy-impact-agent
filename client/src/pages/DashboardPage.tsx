import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Building2,
  ArrowRight,
  Printer,
  Layers,
  Cpu,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { SimulationResult } from '../types/index.js';
import { DisclaimerBanner } from '../components/DisclaimerBanner.js';
import { BalancedEvaluationCard } from '../components/BalancedEvaluationCard.js';
import { ImpactScoresCard } from '../components/ImpactScoresCard.js';
import { PolicyUnderstandingCard } from '../components/PolicyUnderstandingCard.js';
import { CascadingGraphView } from '../components/CascadingGraph.js';
import { WhatIfMatrix } from '../components/WhatIfMatrix.js';
import { RecommendationCard } from '../components/RecommendationCard.js';
import { TamilNaduMap } from '../components/TamilNaduMap.js';

interface DashboardPageProps {
  currentSimulation: SimulationResult | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentSimulation }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12 pointer-events-none">
          <Building2 className="h-96 w-96 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-blue-950/40 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-blue-200 mb-3">
            <ShieldAlert className="h-3.5 w-3.5 text-blue-300" />
            <span>Administrative Decision-Support Layer</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Policy Impact Simulation Platform
          </h1>
          <p className="text-base text-blue-100 font-medium mb-6 leading-relaxed">
            Simulate-before-you-decide. Model the multi-departmental consequences of proposed municipal, infrastructure, environmental, and administrative policies across Tamil Nadu before implementation.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to="/new-simulation"
              className="bg-white text-blue-900 hover:bg-blue-50 px-5 py-3 rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="h-4 w-4 text-blue-600" />
              <span>Create New Policy Simulation</span>
            </Link>

            {currentSimulation && (
              <>
                <Link
                  to="/analysis"
                  className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-400/40 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center space-x-2 transition-all"
                >
                  <Activity className="h-4 w-4 text-blue-200" />
                  <span>View Complete Simulation Analysis</span>
                </Link>

                <Link
                  to="/report"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all"
                >
                  <Printer className="h-4 w-4 text-blue-200" />
                  <span>Executive Report</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Responsible AI Decision Support Notice */}
      <DisclaimerBanner />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Autonomous Domain Agents
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">9 Active</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Transport, Environment, Economy, etc.
          </p>
        </div>

        {/* Card 2: Net Gain Score (Net Benefit) */}
        <div
          className={`p-5 rounded-2xl border shadow-sm transition-all ${
            !currentSimulation
              ? 'bg-white border-slate-200'
              : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 25
              ? 'bg-rose-50/80 border-rose-300'
              : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 45
              ? 'bg-amber-50/80 border-amber-300'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-[11px] font-black uppercase tracking-wider ${
                !currentSimulation
                  ? 'text-slate-500'
                  : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 25
                  ? 'text-rose-800'
                  : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 45
                  ? 'text-amber-800'
                  : 'text-emerald-800'
              }`}
            >
              Gain Score (Net Benefit)
            </span>
            <div
              className={`p-2 rounded-xl ${
                !currentSimulation
                  ? 'bg-blue-50 text-blue-600'
                  : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 25
                  ? 'bg-rose-100 text-rose-700'
                  : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 45
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {!currentSimulation ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 45 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
          </div>
          <p
            className={`text-3xl font-black ${
              !currentSimulation
                ? 'text-slate-900'
                : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 25
                ? 'text-rose-950'
                : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 45
                ? 'text-amber-950'
                : 'text-emerald-950'
            }`}
          >
            {!currentSimulation
              ? 'Ready'
              : `${currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50}/100`}
          </p>
          <p
            className={`text-xs font-bold mt-1 ${
              !currentSimulation
                ? 'text-slate-500 font-semibold'
                : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 25
                ? 'text-rose-700'
                : (currentSimulation.gainScore ?? currentSimulation.positiveScore ?? 50) <= 45
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {!currentSimulation
              ? 'Awaiting simulation'
              : currentSimulation.gainClassification ||
                (currentSimulation.gainScore !== undefined && currentSimulation.gainScore <= 25 ? 'Very Low Gain' : currentSimulation.gainScore !== undefined && currentSimulation.gainScore <= 45 ? 'Low Gain' : currentSimulation.gainScore !== undefined && currentSimulation.gainScore <= 60 ? 'Moderate Gain' : 'High Gain')}
          </p>
        </div>

        {/* Card 3: Friction Score (Resistance & Risk) */}
        <div
          className={`p-5 rounded-2xl border shadow-sm transition-all ${
            !currentSimulation
              ? 'bg-white border-slate-200'
              : (currentSimulation.frictionScore ?? currentSimulation.overallScore ?? 30) >= 61
              ? 'bg-rose-50/80 border-rose-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Friction Score (Resistance)
            </span>
            <div
              className={`p-2 rounded-xl ${
                !currentSimulation
                  ? 'bg-slate-100 text-slate-700'
                  : (currentSimulation.frictionScore ?? currentSimulation.overallScore ?? 30) >= 61
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`text-3xl font-black ${
              !currentSimulation
                ? 'text-slate-800'
                : (currentSimulation.frictionScore ?? currentSimulation.overallScore ?? 30) >= 61
                ? 'text-rose-950'
                : 'text-slate-800'
            }`}
          >
            {currentSimulation ? `${currentSimulation.frictionScore ?? currentSimulation.overallScore}/100` : 'Ready'}
          </p>
          <p
            className={`text-xs font-bold mt-1 ${
              !currentSimulation
                ? 'text-slate-500 font-medium'
                : (currentSimulation.frictionScore ?? currentSimulation.overallScore ?? 30) >= 61
                ? 'text-rose-700'
                : 'text-slate-500'
            }`}
          >
            {!currentSimulation
              ? 'Awaiting simulation'
              : currentSimulation.frictionClassification ||
                (currentSimulation.frictionScore !== undefined && currentSimulation.frictionScore >= 81 ? 'Very High Friction' : currentSimulation.frictionScore !== undefined && currentSimulation.frictionScore >= 61 ? 'High Friction' : currentSimulation.frictionScore !== undefined && currentSimulation.frictionScore >= 41 ? 'Moderate Friction' : 'Low Friction')}
          </p>
        </div>

        {/* Card 4: What-If Alternatives */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              What-If Alternatives
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {currentSimulation?.alternatives.length || 4} Strategies
          </p>
          <p className="text-xs text-indigo-700 font-semibold mt-1">
            Baseline vs. Alternatives A, B, C
          </p>
        </div>
      </div>

      {/* Active Policy Simulation Display OR Workspace Prompt */}
      {currentSimulation ? (
        <div className="space-y-6">
          {/* Active Policy Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  Active Simulation: {currentSimulation.policy.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {currentSimulation.simulationId}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {currentSimulation.policy.asset || currentSimulation.policy.decisionType}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                {currentSimulation.policy.summary}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/analysis"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs flex items-center space-x-1.5"
              >
                <span>Full Multi-Agent Results</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Critical Advisory Banner if Proposal is Net Negative / Severely Unfavorable */}
          {(currentSimulation.polarity === 'negative' ||
            (currentSimulation.netViability?.status && currentSimulation.netViability.status.includes('Unfavorable')) ||
            currentSimulation.overallScore >= 65) && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm flex items-start space-x-3 text-rose-900">
              <AlertTriangle className="h-6 w-6 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                    ⚠️ Critical Advisory • Severely Unfavorable Proposal
                  </span>
                  <span className="text-xs font-bold text-rose-800">
                    Execution Risk: {currentSimulation.overallScore}/100
                  </span>
                  <span className="text-xs font-semibold text-rose-700">
                    Societal Benefit: {currentSimulation.positiveScore || 20}/100
                  </span>
                </div>
                <p className="text-sm font-semibold text-rose-950 leading-snug">
                  {currentSimulation.netViability?.summary ||
                    'Simulation projects high human displacement, acute environmental degradation, or critical public friction that heavily outweighs projected gains. Halting direct execution and adopting Alternative A (Zero-Displacement Relocation to designated Industrial Buffer) is strongly advised.'}
                </p>
              </div>
            </div>
          )}

          {/* Mandatory Balanced Decision Evaluation Card */}
          <BalancedEvaluationCard evaluation={currentSimulation.balancedEvaluation} />

          {/* 10 Impact Score Progress Bars */}
          <ImpactScoresCard scores={currentSimulation.impactScores} />

          {/* Policy Understanding & Extracted Parameters */}
          <PolicyUnderstandingCard
            policy={currentSimulation.policy}
            populationContext={currentSimulation.populationContext}
            locationContextAnalysis={currentSimulation.locationContextAnalysis}
            proposalUnderstanding={currentSimulation.proposalUnderstanding || currentSimulation.policy.proposalUnderstanding}
          />

          {/* Interactive Tamil Nadu Map */}
          <TamilNaduMap
            location={currentSimulation.input.location}
            district={currentSimulation.input.district}
            city={currentSimulation.input.city}
            town={currentSimulation.input.town}
            village={currentSimulation.input.village}
            selectedAsset={currentSimulation.input.selectedAsset || currentSimulation.policy.asset}
            latitude={currentSimulation.input.latitude}
            longitude={currentSimulation.input.longitude}
          />

          {/* Cascading Consequence Engine Graph */}
          <CascadingGraphView graph={currentSimulation.cascadingGraph} />

          {/* What-If Comparison Table */}
          <WhatIfMatrix
            alternatives={currentSimulation.alternatives}
            recommendedOptionId={currentSimulation.comparison.recommendedOptionId}
          />

          {/* Recommendation Card */}
          <RecommendationCard recommendation={currentSimulation.recommendation} />
        </div>
      ) : (
        /* When No Simulation is Active: Clean Administrative Workspace Prompt & Map */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Administrative Simulation Workspace
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Enter any proposed administrative decision, municipal works project, traffic diversion, reservoir release, or regulatory intervention to project cross-departmental consequences across Tamil Nadu.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/new-simulation"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl shadow-md text-sm transition-all transform hover:-translate-y-0.5"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create New Policy Simulation</span>
              </Link>
            </div>
          </div>

          {/* Interactive Tamil Nadu Explorer Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Tamil Nadu Geographic Explorer
                </h3>
                <p className="text-xs text-slate-500">
                  Interactive satellite GIS mapping across all 38 districts of Tamil Nadu.
                </p>
              </div>
            </div>
            <TamilNaduMap district="Chennai" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

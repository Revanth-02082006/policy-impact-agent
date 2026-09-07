import React, { useState } from 'react';
import { AlternativeStrategy, ImpactSeverity } from '../types/index.js';
import { Layers, CheckCircle2, ShieldCheck, AlertTriangle, Wrench, Info, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { getRiskClassification } from './ImpactScoresCard.js';

interface WhatIfMatrixProps {
  alternatives: AlternativeStrategy[];
  recommendedOptionId: string;
}

export const WhatIfMatrix: React.FC<WhatIfMatrixProps> = ({
  alternatives,
  recommendedOptionId,
}) => {
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(recommendedOptionId);

  const getScoreBadge = (score: number) => {
    const risk = getRiskClassification(score);
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-bold border ${risk.badgeClass}`}>
        <span>{score}</span>
        <span className="text-[9px] opacity-75 font-normal">({risk.label})</span>
      </span>
    );
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'low':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold">Low</span>;
      case 'moderate':
        return <span className="bg-blue-50 text-blue-800 border border-blue-300 px-2 py-0.5 rounded text-[11px] font-bold">Moderate</span>;
      case 'high':
        return <span className="bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">High</span>;
      case 'very high':
      case 'extreme':
        return <span className="bg-red-50 text-red-800 border border-red-300 px-2 py-0.5 rounded text-[11px] font-bold">{diff}</span>;
      default:
        return <span className="bg-slate-50 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-bold">{diff}</span>;
    }
  };

  const getRecommendationBadge = (opt: AlternativeStrategy, isRecommended: boolean) => {
    if (isRecommended || opt.recommendationStatus === 'Recommended') {
      return (
        <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider inline-flex items-center space-x-1 shadow-xs">
          <CheckCircle2 className="h-3 w-3" />
          <span>Recommended</span>
        </span>
      );
    }
    if (opt.id.includes('original') || opt.recommendationStatus === 'Baseline / Proposed') {
      return (
        <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Proposed Baseline
        </span>
      );
    }
    return (
      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
        Alternative Option
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Layers className="h-5 w-5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              What-If Multi-Strategy Comparison Table
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              Lower Score = Minimized Disruption
            </span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {alternatives.length} Strategies Evaluated
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Side-by-side trade-off matrix comparing the Original Decision against AI-generated operational alternatives across all policy dimensions.
        </p>
      </div>

      {/* Structured Comparison Table matching master prompt requirements */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[11px] tracking-wider">
              <th className="py-3.5 px-4 min-w-[220px]">Strategy Option</th>
              <th className="py-3.5 px-3 text-center">Transport</th>
              <th className="py-3.5 px-3 text-center">Economy</th>
              <th className="py-3.5 px-3 text-center">Environment</th>
              <th className="py-3.5 px-3 text-center">Safety</th>
              <th className="py-3.5 px-3 text-center">Population</th>
              <th className="py-3.5 px-3 text-center">Cost Estimate</th>
              <th className="py-3.5 px-3 text-center">Implementation Difficulty</th>
              <th className="py-3.5 px-3 text-center">Overall Risk</th>
              <th className="py-3.5 px-4 text-center">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {alternatives.map((opt) => {
              const isRecommended = opt.id === recommendedOptionId || opt.recommendationStatus === 'Recommended';
              const overallRisk = getRiskClassification(opt.scores.overall);

              return (
                <tr
                  key={opt.id}
                  className={`transition-colors hover:bg-slate-50/80 cursor-pointer ${
                    isRecommended ? 'bg-blue-50/50 font-medium' : ''
                  }`}
                  onClick={() => setExpandedOptionId(expandedOptionId === opt.id ? null : opt.id)}
                >
                  {/* Strategy Option Name */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span className="leading-snug">{opt.title}</span>
                    </div>
                  </td>

                  {/* Transport */}
                  <td className="py-3 px-3 text-center">
                    {getScoreBadge(opt.scores.transport)}
                  </td>

                  {/* Economy */}
                  <td className="py-3 px-3 text-center">
                    {getScoreBadge(opt.scores.economy)}
                  </td>

                  {/* Environment */}
                  <td className="py-3 px-3 text-center">
                    {getScoreBadge(opt.scores.environment)}
                  </td>

                  {/* Safety */}
                  <td className="py-3 px-3 text-center">
                    {getScoreBadge(opt.scores.safety)}
                  </td>

                  {/* Population */}
                  <td className="py-3 px-3 text-center">
                    {getScoreBadge(opt.scores.population)}
                  </td>

                  {/* Cost */}
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {opt.cost || '₹ Baseline'}
                  </td>

                  {/* Implementation Difficulty */}
                  <td className="py-3 px-3 text-center">
                    {getDifficultyBadge(opt.implementationDifficulty)}
                  </td>

                  {/* Overall Risk */}
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase border ${overallRisk.badgeClass}`}>
                      {overallRisk.label} ({opt.scores.overall})
                    </span>
                  </td>

                  {/* Recommendation Badge */}
                  <td className="py-3 px-4 text-center">
                    {getRecommendationBadge(opt, isRecommended)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expanded Strategy Detail Cards */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Strategy Operational Breakdown & Mitigations:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alternatives.map((opt) => {
            const isRecommended = opt.id === recommendedOptionId || opt.recommendationStatus === 'Recommended';
            const isExpanded = expandedOptionId === opt.id;

            return (
              <div
                key={opt.id}
                className={`p-4 rounded-xl border transition-all ${
                  isRecommended
                    ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-900">{opt.title}</span>
                  {getRecommendationBadge(opt, isRecommended)}
                </div>

                <p className="text-xs text-slate-700 mb-3 leading-relaxed font-medium">
                  {opt.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mb-3">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-emerald-800 block mb-1">✓ Advantages (Benefits):</span>
                    <ul className="space-y-1 list-disc pl-3 text-slate-600">
                      {(opt.advantages || opt.benefits || []).map((adv, idx) => (
                        <li key={idx}>{adv}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-rose-800 block mb-1">⚠ Disadvantages (Risks):</span>
                    <ul className="space-y-1 list-disc pl-3 text-slate-600">
                      {(opt.disadvantages || opt.risks || []).map((dis, idx) => (
                        <li key={idx}>{dis}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {opt.mitigations && opt.mitigations.length > 0 && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                    <span className="font-bold text-blue-900 block mb-1">🛠 Actionable Mitigations:</span>
                    <ul className="space-y-0.5 list-disc pl-3 text-slate-600">
                      {opt.mitigations.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WhatIfMatrix;

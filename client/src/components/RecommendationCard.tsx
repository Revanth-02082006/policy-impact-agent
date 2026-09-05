import React from 'react';
import { DecisionRecommendation } from '../types/index.js';
import { ShieldCheck, CheckCircle2, AlertOctagon, Wrench, HelpCircle, Info } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: DecisionRecommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-md mb-8 relative overflow-hidden">
      {/* Top Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>

      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 mb-4">
        <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shadow-sm">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Explainable AI Decision Support
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{recommendation.title}</h3>
        </div>
      </div>

      {/* Recommended Strategy Badge Callout */}
      {recommendation.recommendedOptionTitle && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-100/60 border border-blue-300/80 rounded-lg">
          <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded font-extrabold uppercase tracking-wider">
            Selected Alternative
          </span>
          <span className="text-xs sm:text-sm font-black text-blue-950">
            {recommendation.recommendedOptionTitle}
          </span>
        </div>
      )}

      {/* Executive Summary */}
      <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-xl mb-6">
        <p className="text-sm font-medium text-blue-950 leading-relaxed">
          {recommendation.summary}
        </p>
      </div>

      {/* Rationale & Key Mitigations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Core Rationale */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Strategic Rationale</span>
          </h4>
          <ul className="space-y-2">
            {recommendation.rationalePoints.map((pt, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                <span className="text-blue-600 font-bold">•</span>
                <span className="leading-normal">{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mandatory Mitigations */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-3">
            <Wrench className="h-4 w-4 text-blue-600" />
            <span>Recommended Mitigation Actions</span>
          </h4>
          <ul className="space-y-2">
            {recommendation.mitigationMeasures.map((m, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span className="leading-normal">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Identified Risks & System Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div>
          <h5 className="font-bold text-xs text-slate-700 flex items-center space-x-1.5 mb-2">
            <AlertOctagon className="h-3.5 w-3.5 text-rose-600" />
            <span>Key Residual Risks:</span>
          </h5>
          <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600">
            {recommendation.keyRisks.map((rk, idx) => (
              <li key={idx}>{rk}</li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-xs text-slate-700 flex items-center space-x-1.5 mb-2">
            <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>Underlying System Assumptions:</span>
          </h5>
          <ul className="space-y-1 pl-5 list-disc text-xs text-slate-600">
            {recommendation.assumptions.map((asm, idx) => (
              <li key={idx}>{asm}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

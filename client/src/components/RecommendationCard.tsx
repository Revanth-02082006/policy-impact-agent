import React from 'react';
import { DecisionRecommendation } from '../types/index.js';
import {
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';

interface RecommendationCardProps {
  recommendation: DecisionRecommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
}) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-blue-300 p-6 shadow-md mb-8 relative overflow-hidden space-y-6">
      {/* Top Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shadow-xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Explainable Decision Support
              </span>
              {recommendation.confidence && (
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Confidence: {recommendation.confidence}%
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">{recommendation.title}</h3>
          </div>
        </div>

        {/* Selected Option Callout */}
        {recommendation.recommendedOptionTitle && (
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-black text-blue-950">
              {recommendation.recommendedOptionTitle}
            </span>
          </div>
        )}
      </div>

      {/* 1. WHY THIS RECOMMENDATION */}
      {recommendation.why && (
        <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200 p-4 rounded-xl">
          <div className="flex items-center space-x-2 mb-1 text-blue-900">
            <Lightbulb className="h-4 w-4 text-blue-700 flex-shrink-0" />
            <span className="font-extrabold uppercase text-xs tracking-wider">
              Strategic Evaluation: Why This Alternative is Optimal
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-blue-950 leading-relaxed pl-6">
            {recommendation.why}
          </p>
        </div>
      )}

      {/* Executive Summary */}
      <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
        <span className="font-extrabold text-slate-900 block mb-1 uppercase text-[11px]">
          Recommendation Summary:
        </span>
        {recommendation.summary}
      </div>

      {/* Grid: Benefits vs Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Expected Benefits */}
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
          <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 flex items-center space-x-1.5 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>Key Strategic Benefits</span>
          </h4>
          <ul className="space-y-2">
            {(recommendation.benefits || recommendation.rationalePoints || []).map((b, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-slate-700">
                <span className="text-emerald-600 font-bold">✓</span>
                <span className="leading-snug">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Residual Risks */}
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200">
          <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900 flex items-center space-x-1.5 mb-3">
            <AlertOctagon className="h-4 w-4 text-rose-700" />
            <span>Residual Operational Risks</span>
          </h4>
          <ul className="space-y-2">
            {(recommendation.risks || recommendation.keyRisks || []).map((r, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-slate-700">
                <span className="text-rose-600 font-bold">⚠</span>
                <span className="leading-snug">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grid: Mitigations & Precautions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Actionable Mitigations */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-1.5 mb-3">
            <Wrench className="h-4 w-4 text-blue-600" />
            <span>Actionable Operational Mitigations</span>
          </h4>
          <ul className="space-y-2">
            {(recommendation.mitigations || recommendation.mitigationMeasures || []).map((m, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-slate-700">
                <span className="text-blue-600 font-bold">•</span>
                <span className="leading-snug">{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mandatory Precautions */}
        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200">
          <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center space-x-1.5 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <span>Administrative Precautions & Checks</span>
          </h4>
          <ul className="space-y-2">
            {(recommendation.precautions || [
              'Verify underground utility lines prior to excavation',
              'Issue advance 7-day notifications in local district gazettes',
              'Maintain active 24/7 coordination with Fire & Rescue and 108 Emergency Services',
            ]).map((p, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-slate-700">
                <span className="text-amber-600 font-bold">!</span>
                <span className="leading-snug">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Explicit Non-Certainty Disclaimer Callout */}
      <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 bg-slate-50/70 p-3 rounded-xl">
        <HelpCircle className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-700">AI Decision-Support Notice:</strong> This recommendation is generated through multi-agent simulation heuristics and synthetic impact modeling. It does not replace official on-ground administrative assessments, site surveys, or human judgment by competent authorities.
        </p>
      </div>
    </div>
  );
};

export default RecommendationCard;

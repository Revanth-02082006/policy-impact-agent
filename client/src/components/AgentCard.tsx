import React, { useState } from 'react';
import { AgentAnalysis } from '../types/index.js';
import {
  Truck,
  Cross,
  Users,
  ShieldAlert,
  Building2,
  TrendingUp,
  Leaf,
  HeartHandshake,
  Scale,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

interface AgentCardProps {
  analysis: AgentAnalysis;
}

export const AgentCard: React.FC<AgentCardProps> = ({ analysis }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getDomainDetails = (domain: string) => {
    switch (domain) {
      case 'transport':
        return { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
      case 'infrastructure':
        return { icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' };
      case 'population':
        return { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' };
      case 'essential_services':
        return { icon: Cross, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
      case 'economic':
        return { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
      case 'environmental':
        return { icon: Leaf, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' };
      case 'disaster_risk':
        return { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
      case 'social':
        return { icon: HeartHandshake, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' };
      case 'policy_compliance':
        return { icon: Scale, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' };
      default:
        return { icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };
    }
  };

  const domainInfo = getDomainDetails(analysis.domain);
  const Icon = domainInfo.icon;
  const positiveVal = analysis.positiveScore ?? 25;
  const riskVal = analysis.score ?? 35;

  // Derive simple and sweet verdict
  const isSevereRisk = riskVal >= 75;
  const isHighBenefit = positiveVal >= 75 && riskVal < 50;
  const isElevatedRisk = riskVal >= 50 && !isSevereRisk;

  let verdictBadge = {
    text: `Manageable Friction (${riskVal}/100)`,
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
  };

  if (isSevereRisk) {
    verdictBadge = {
      text: `Critical Concern (${riskVal}/100 Risk)`,
      classes: 'bg-rose-100 text-rose-800 border-rose-300 font-black',
      dot: 'bg-rose-600 animate-pulse',
    };
  } else if (isElevatedRisk) {
    verdictBadge = {
      text: `High Impact (${riskVal}/100 Friction)`,
      classes: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      dot: 'bg-amber-600',
    };
  } else if (isHighBenefit) {
    verdictBadge = {
      text: `Major Benefit (+${positiveVal} Gain)`,
      classes: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black',
      dot: 'bg-emerald-600',
    };
  } else if (positiveVal > riskVal) {
    verdictBadge = {
      text: `Favorable (+${positiveVal} Gain)`,
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
      dot: 'bg-emerald-500',
    };
  }

  // Extract cleanest top positive & negative findings
  const posFinding = (analysis.positiveFindings && analysis.positiveFindings[0]) ||
    analysis.findings.find((f) => f.polarity === 'positive' || f.id.includes('pos'));

  const negFinding = (analysis.negativeFindings && analysis.negativeFindings[0]) ||
    analysis.findings.find((f) => f.polarity === 'negative' || f.id.includes('neg') || f.severity === 'high' || f.severity === 'critical');

  const topMetric = analysis.metrics && analysis.metrics.length > 0 ? analysis.metrics[0] : null;

  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
      isSevereRisk ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'
    }`}>
      <div className="space-y-3">
        {/* Simple Clean Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${domainInfo.bg} ${domainInfo.color} shadow-2xs`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                {analysis.domainName}
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                Autonomous Policy Agent
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-full border shadow-2xs shrink-0 ${verdictBadge.classes}`}>
            <span className={`h-2 w-2 rounded-full ${verdictBadge.dot}`} />
            <span>{verdictBadge.text}</span>
          </span>
        </div>

        {/* Sweet 1-2 sentence Plain English Summary */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          {analysis.summary}
        </p>

        {/* Simple & Sweet 2-Box Takeaway */}
        <div className="space-y-2">
          {/* Benefit Box */}
          {posFinding ? (
            <div className="flex items-start space-x-2.5 bg-emerald-50/70 border border-emerald-200/80 p-2.5 rounded-xl text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950 block text-[11px] uppercase tracking-wide">
                  Top Societal Benefit:
                </span>
                <span className="text-emerald-900 font-medium leading-tight block mt-0.5">
                  {posFinding.title}: {posFinding.description}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/70 p-2 rounded-xl text-xs text-slate-500 italic">
              <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>No substantial direct societal benefit identified for this domain.</span>
            </div>
          )}

          {/* Risk / Hurdle Box */}
          {negFinding ? (
            <div className={`flex items-start space-x-2.5 p-2.5 rounded-xl text-xs border ${
              isSevereRisk
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
            }`}>
              <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${isSevereRisk ? 'text-rose-600' : 'text-amber-600'}`} />
              <div>
                <span className={`font-bold block text-[11px] uppercase tracking-wide ${isSevereRisk ? 'text-rose-900' : 'text-amber-900'}`}>
                  {isSevereRisk ? 'Critical Risk / Hurdle:' : 'Operational Friction:'}
                </span>
                <span className="font-medium leading-tight block mt-0.5">
                  {negFinding.title}: {negFinding.description}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-emerald-50/40 border border-emerald-100 p-2 rounded-xl text-xs text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Minimal operational friction observed in this sector.</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Key Metric & Clean Collapsible */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          {topMetric ? (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{topMetric.label}:</span>
              <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {topMetric.value}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">Confidence: {analysis.confidence || 88}%</span>
          )}

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
            {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Expandable Technical Details (Keeps default view clean and sweet) */}
        {showDetails && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs animate-in fade-in duration-200">
            {/* Score pill bars */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-semibold">Societal Gain:</span>
                <span className="text-emerald-700 font-extrabold text-sm">{positiveVal}/100</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-semibold">Operational Disruption:</span>
                <span className="text-rose-700 font-extrabold text-sm">{riskVal}/100</span>
              </div>
            </div>

            {/* Metrics List */}
            {analysis.metrics && analysis.metrics.length > 1 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">All Domain Indicators:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {analysis.metrics.map((m, idx) => (
                    <div key={idx} className="bg-white px-2 py-1 rounded border border-slate-200 text-[11px]">
                      <span className="text-slate-500 block truncate">{m.label}</span>
                      <span className="font-bold text-slate-900">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

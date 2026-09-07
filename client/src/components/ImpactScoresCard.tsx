import React, { useState } from 'react';
import { ImpactScores, ImpactSeverity } from '../types/index.js';
import {
  Activity,
  Truck,
  Building2,
  TrendingUp,
  Leaf,
  ShieldCheck,
  Users,
  Cross,
  GraduationCap,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

interface ImpactScoresCardProps {
  scores: ImpactScores;
}

export function getRiskClassification(score: number): { label: string; severity: ImpactSeverity; badgeClass: string; barColor: string } {
  if (score <= 20) {
    return {
      label: 'Very Low Friction',
      severity: 'very_low',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
      barColor: 'bg-emerald-500',
    };
  }
  if (score <= 40) {
    return {
      label: 'Low Friction',
      severity: 'low',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
      barColor: 'bg-blue-500',
    };
  }
  if (score <= 60) {
    return {
      label: 'Moderate Friction',
      severity: 'moderate',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      barColor: 'bg-amber-500',
    };
  }
  if (score <= 80) {
    return {
      label: 'High Friction',
      severity: 'high',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      barColor: 'bg-rose-500',
    };
  }
  return {
    label: 'Very High Friction',
    severity: 'critical',
    badgeClass: 'bg-red-200 text-red-950 border-red-400 font-black',
    barColor: 'bg-red-600',
  };
}

export function getBenefitClassification(score: number): { label: string; badgeClass: string; barColor: string } {
  if (score >= 81) {
    return {
      label: 'Very High Gain',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black',
      barColor: 'bg-emerald-600',
    };
  }
  if (score >= 61) {
    return {
      label: 'High Gain',
      badgeClass: 'bg-teal-100 text-teal-900 border-teal-300 font-bold',
      barColor: 'bg-teal-500',
    };
  }
  if (score >= 46) {
    return {
      label: 'Moderate Gain',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
      barColor: 'bg-blue-500',
    };
  }
  if (score >= 26) {
    return {
      label: 'Low Gain',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      barColor: 'bg-amber-500',
    };
  }
  return {
    label: 'Very Low Gain',
    badgeClass: 'bg-rose-100 text-rose-950 border-rose-300 font-bold',
    barColor: 'bg-rose-500',
  };
}

export const ImpactScoresCard: React.FC<ImpactScoresCardProps> = ({ scores }) => {
  const [viewMode, setViewMode] = useState<'both' | 'positive' | 'risk'>('both');

  const isHarmful = scores.polarity === 'negative' || (scores.overallPolicyRisk || 0) >= 65;
  const p = scores.positiveScores || {
    transport: isHarmful ? 25 : 75,
    infrastructure: isHarmful ? 30 : 82,
    economic: isHarmful ? 35 : 85,
    environmental: isHarmful ? 15 : 78,
    publicSafety: isHarmful ? 20 : 84,
    population: isHarmful ? 15 : 88,
    healthcare: isHarmful ? 20 : 92,
    education: isHarmful ? 25 : 85,
    disasterRisk: isHarmful ? 25 : 80,
    overallSocietalBenefit: scores.overallSocietalBenefit || (isHarmful ? 20 : 86),
  };

  const overallBenefit = scores.overallSocietalBenefit !== undefined ? scores.overallSocietalBenefit : (p.overallSocietalBenefit || 50);
  const overallRisk = scores.overallPolicyRisk || 30;
  const netViability = scores.netViabilityScore !== undefined
    ? scores.netViabilityScore
    : Math.max(5, Math.min(98, Math.round(((overallBenefit * 1.3) - (overallRisk * 1.1) + 100) / 2)));

  const benefitClassification = getBenefitClassification(overallBenefit);
  const riskClassification = getRiskClassification(overallRisk);

  const metrics = [
    { key: 'healthcare', label: 'Healthcare & Public Health', benefit: p.healthcare, risk: scores.healthcare, icon: Cross },
    { key: 'economic', label: 'Economic & Employment', benefit: p.economic, risk: scores.economic, icon: TrendingUp },
    { key: 'population', label: 'Population Wellbeing', benefit: p.population, risk: scores.population, icon: Users },
    { key: 'publicSafety', label: 'Public Safety & Defense', benefit: p.publicSafety, risk: scores.publicSafety, icon: ShieldCheck },
    { key: 'infrastructure', label: 'Civil Infrastructure', benefit: p.infrastructure, risk: scores.infrastructure, icon: Building2 },
    { key: 'transport', label: 'Transport & Mobility', benefit: p.transport, risk: scores.transport, icon: Truck },
    { key: 'environmental', label: 'Environmental & Ecological', benefit: p.environmental, risk: scores.environmental, icon: Leaf },
    { key: 'education', label: 'Education & Knowledge', benefit: p.education, risk: scores.education, icon: GraduationCap },
    { key: 'disasterRisk', label: 'Disaster Resilience', benefit: p.disasterRisk, risk: scores.disasterRisk, icon: Flame },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
      {/* Top Banner with Dual Net Verdict */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Activity className="h-5 w-5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              Dual-Aspect Policy Impact Analysis (0–100)
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isHarmful
                ? 'bg-rose-100 text-rose-800'
                : overallBenefit >= 70
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isHarmful ? 'High Friction Warning' : overallBenefit >= 70 ? 'Welfare Expansion' : 'Balanced Evaluation'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simultaneous evaluation of <strong>Positive Societal Gains</strong> (public welfare, capacity, growth) and <strong>Implementation Frictions</strong> (temporary disruption, execution risks).
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'both' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dual View (Both)
          </button>
          <button
            onClick={() => setViewMode('positive')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              viewMode === 'positive' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Positive Gains</span>
          </button>
          <button
            onClick={() => setViewMode('risk')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              viewMode === 'risk' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Frictions & Risks</span>
          </button>
        </div>
      </div>
      
      {/* High-Level Dual KPI Strip (Impact Scoring Framework) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Gain Score (Net Benefit) */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                Gain Score (Net Benefit)
              </span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                Base: 50
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl font-black text-emerald-900">{scores.gainScore ?? overallBenefit}</span>
              <span className="text-xs text-emerald-700 font-semibold">/100</span>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border mt-1 inline-block ${benefitClassification.badgeClass}`}>
              {scores.gainClassification || benefitClassification.label}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Friction Score (Resistance & Risk) */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          overallRisk >= 61 ? 'bg-rose-50/80 border-rose-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
                Friction Score (Resistance & Risk)
              </span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.2 rounded">
                Base: 20
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className={`text-2xl font-black ${overallRisk >= 61 ? 'text-rose-900' : 'text-slate-800'}`}>
                {scores.frictionScore ?? overallRisk}
              </span>
              <span className="text-xs text-slate-500 font-semibold">/100</span>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border mt-1 inline-block ${riskClassification.badgeClass}`}>
              {scores.frictionClassification || riskClassification.label}
            </span>
          </div>
          <div className={`p-2.5 rounded-xl ${overallRisk >= 61 ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'}`}>
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        {/* Net Policy Viability */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isHarmful || netViability < 45
            ? 'bg-rose-50/90 border-rose-300'
            : overallBenefit >= 70 && overallRisk <= 40
            ? 'bg-emerald-50/80 border-emerald-300'
            : 'bg-blue-50/80 border-blue-200'
        }`}>
          <div>
            <span className={`text-[10px] font-black uppercase tracking-wider block ${
              isHarmful || netViability < 45 ? 'text-rose-800' : 'text-blue-800'
            }`}>
              Net Policy Viability
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className={`text-2xl font-black ${
                isHarmful || netViability < 45 ? 'text-rose-950' : 'text-blue-950'
              }`}>
                {isHarmful || netViability < 45 ? `${netViability}/100` : `+${netViability}`}
              </span>
              <span className={`text-xs font-semibold ${
                isHarmful || netViability < 45 ? 'text-rose-700' : 'text-blue-700'
              }`}>
                {isHarmful || netViability < 45 ? 'High Friction' : 'Net Value'}
              </span>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border mt-1 inline-block font-black uppercase ${
              isHarmful || netViability < 45
                ? 'bg-rose-100 text-rose-900 border-rose-300'
                : overallBenefit >= 70 && overallRisk <= 40
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-blue-100 text-blue-900 border-blue-300'
            }`}>
              {isHarmful || netViability < 45
                ? 'Severely Unfavorable — High Harm'
                : overallBenefit >= 70 && overallRisk <= 40
                ? 'Highly Favorable Public Investment'
                : 'Balanced Policy Trade-off'}
            </span>
          </div>
          <div className={`p-2.5 rounded-xl ${
            isHarmful || netViability < 45
              ? 'bg-rose-100 text-rose-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {isHarmful || netViability < 45 ? (
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            ) : (
              <TrendingUp className="h-5 w-5 text-blue-600" />
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Framework Concise Justifications */}
      {(scores.gainJustification || scores.frictionJustification) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {scores.gainJustification && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start space-x-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
                  Gain Score Justification (Net Benefit)
                </span>
                <p className="text-xs text-emerald-950 font-medium mt-0.5 leading-relaxed">
                  {scores.gainJustification}
                </p>
              </div>
            </div>
          )}
          {scores.frictionJustification && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 flex items-start space-x-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 block">
                  Friction Score Justification (Resistance & Risks)
                </span>
                <p className="text-xs text-rose-950 font-medium mt-0.5 leading-relaxed">
                  {scores.frictionJustification}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          const benefitInfo = getBenefitClassification(item.benefit);
          const riskInfo = getRiskClassification(item.risk);

          return (
            <div
              key={item.key}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="p-1.5 bg-white text-blue-700 border border-slate-200 rounded-lg shadow-2xs">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-black text-slate-900">{item.label}</span>
                </div>
              </div>

              {/* Progress Bars for Benefit & Risk */}
              {(viewMode === 'both' || viewMode === 'positive') && (
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-emerald-800 font-bold flex items-center space-x-1">
                      <span>✓ Societal Benefit:</span>
                      <span className="font-black text-emerald-950">{item.benefit}/100</span>
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border ${benefitInfo.badgeClass}`}>
                      {benefitInfo.label}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${benefitInfo.barColor}`}
                      style={{ width: `${Math.min(Math.max(item.benefit, 5), 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {(viewMode === 'both' || viewMode === 'risk') && (
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 font-bold flex items-center space-x-1">
                      <span>⚠ Implementation Friction:</span>
                      <span className="font-black text-slate-800">{item.risk}/100</span>
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border ${riskInfo.badgeClass}`}>
                      {riskInfo.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${riskInfo.barColor}`}
                      style={{ width: `${Math.min(Math.max(item.risk, 4), 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interpretive Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 mt-5 text-[11px] text-slate-500">
        <span className="font-bold text-slate-700">Dual Evaluation Framework:</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-800 font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span> Positive Benefit (Higher = Greater Public Welfare)
          </span>
          <span className="flex items-center gap-1 text-slate-600 font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Operational Friction (Lower = Seamless Execution)
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImpactScoresCard;

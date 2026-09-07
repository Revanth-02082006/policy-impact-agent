import React, { useState } from 'react';
import {
  BalancedDecisionEvaluation,
  BalancedImpactLevel,
  BalancedEvaluationDimensionKey,
} from '../types/index.js';
import {
  Scale,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Leaf,
  Users,
  HeartPulse,
  Building2,
  Landmark,
  Compass,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  FileText,
  Info,
  HelpCircle,
} from 'lucide-react';

interface BalancedEvaluationCardProps {
  evaluation?: BalancedDecisionEvaluation;
}

const DIMENSION_ICONS: Record<BalancedEvaluationDimensionKey, React.ComponentType<{ className?: string }>> = {
  economic: TrendingUp,
  environmental: Leaf,
  social: Users,
  publicHealthSafety: HeartPulse,
  infrastructure: Building2,
  municipalAdmin: Landmark,
  legalCompliance: Scale,
  longTermSustainability: Sparkles,
};

export const BalancedEvaluationCard: React.FC<BalancedEvaluationCardProps> = ({ evaluation }) => {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  if (!evaluation) return null;

  const {
    overallClassification,
    classificationRationale,
    dimensions,
    allPositiveImpacts,
    allNegativeImpacts,
    severeImpactFlags,
    uncertaintiesAndDataGaps,
  } = evaluation;

  const hasSevereFlags = severeImpactFlags && Object.values(severeImpactFlags).some(Boolean);

  const getClassificationTheme = () => {
    switch (overallClassification) {
      case 'Positive':
        return {
          bannerBg: 'from-emerald-600 via-teal-600 to-emerald-700',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          borderCol: 'border-emerald-300',
          icon: CheckCircle2,
          tagText: 'POSITIVE (High Societal Benefit)',
          summaryDesc: 'Overall benefits clearly outweigh drawbacks across all evaluated dimensions without severe violations.',
        };
      case 'Negative':
        return {
          bannerBg: 'from-rose-600 via-red-600 to-rose-700',
          badgeBg: 'bg-rose-100 text-rose-950 border-rose-300',
          borderCol: 'border-rose-300',
          icon: AlertOctagon,
          tagText: 'NEGATIVE (Adverse Impacts & Severe Risks Outweigh Benefits)',
          summaryDesc: 'Severe adverse impacts or critical overrides heavily surpass localized gains.',
        };
      case 'Mixed':
      default:
        return {
          bannerBg: 'from-amber-600 via-indigo-600 to-amber-700',
          badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
          borderCol: 'border-amber-300',
          icon: Scale,
          tagText: 'MIXED (Balanced Trade-Off)',
          summaryDesc: 'Significant positive benefits coexist with substantial adverse drawbacks across evaluated dimensions.',
        };
    }
  };

  const theme = getClassificationTheme();
  const HeaderIcon = theme.icon;

  const getImpactBadgeClass = (level: BalancedImpactLevel) => {
    switch (level) {
      case 'High Positive':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
      case 'Moderate Positive':
        return 'bg-teal-100 text-teal-800 border-teal-300 font-bold';
      case 'Neutral':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-semibold';
      case 'Moderate Negative':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'High Negative':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-black';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getScoreNumber = (level: BalancedImpactLevel) => {
    switch (level) {
      case 'High Positive':
        return '+2';
      case 'Moderate Positive':
        return '+1';
      case 'Neutral':
        return '0';
      case 'Moderate Negative':
        return '-1';
      case 'High Negative':
        return '-2';
      default:
        return '0';
    }
  };

  const dimensionKeys = dimensions ? (Object.keys(dimensions) as BalancedEvaluationDimensionKey[]) : [];

  return (
    <div className={`bg-white rounded-2xl border-2 ${theme.borderCol} p-6 shadow-md mb-8 relative overflow-hidden space-y-6`}>
      {/* Top Accent Gradient */}
      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${theme.bannerBg}`}></div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-sm">
            <Scale className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
                Mandatory Balanced Evaluation
              </span>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Equal-Weighted (12.5% per dimension)
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Balanced Decision Evaluation & Neutrality Assessment
            </h2>
          </div>
        </div>

        {/* Overall Classification Stamp */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 shadow-sm ${theme.badgeBg}`}>
          <HeaderIcon className="h-5 w-5 shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
              Overall Classification
            </div>
            <div className="text-sm font-black tracking-wide">
              {overallClassification}
            </div>
          </div>
        </div>
      </div>

      {/* RATIONALE: WHY THIS CLASSIFICATION WAS DETERMINED */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 rounded-xl p-4.5 shadow-xs space-y-2">
        <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-800">
          <FileText className="h-4 w-4 text-blue-600" />
          <span>Category-by-Category Classification Evidence (Why):</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed font-medium">
          {classificationRationale}
        </p>
      </div>

      {/* CRITICAL OVERRIDE / SEVERE IMPACT WARNING BOX */}
      {hasSevereFlags && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4.5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-rose-900 font-black text-sm">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>Severe Impact Warning & Decision Reduction Override Activated</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed font-medium">
            Under mandatory balanced evaluation rules, proposals causing irreversible damage, destruction of fertile land, or displacement of people cannot be treated as positive based purely on economic or industrial revenue.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {severeImpactFlags.destructionOfAgriculturalLand && (
              <span className="text-xs font-bold bg-rose-200/90 text-rose-900 px-3 py-1 rounded-lg border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                🌾 Destruction of Agricultural Land
              </span>
            )}
            {severeImpactFlags.displacementOfPeople && (
              <span className="text-xs font-bold bg-rose-200/90 text-rose-900 px-3 py-1 rounded-lg border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                👥 Involuntary Relocation of Families / Displacement
              </span>
            )}
            {severeImpactFlags.irreversibleEnvironmentalDamage && (
              <span className="text-xs font-bold bg-rose-200/90 text-rose-900 px-3 py-1 rounded-lg border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                🌲 Irreversible Environmental Damage
              </span>
            )}
            {severeImpactFlags.seriousPollution && (
              <span className="text-xs font-bold bg-rose-200/90 text-rose-900 px-3 py-1 rounded-lg border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                🏭 Serious Industrial Pollution Hazard
              </span>
            )}
            {severeImpactFlags.publicSafetyRisks && (
              <span className="text-xs font-bold bg-rose-200/90 text-rose-900 px-3 py-1 rounded-lg border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                ⚠️ Severe Public Safety Risk
              </span>
            )}
            {severeImpactFlags.violatesMunicipalRegulations && (
              <span className="text-xs font-bold bg-rose-200/90 text-rose-900 px-3 py-1 rounded-lg border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                📜 Municipal / Statutory Regulation Non-Compliance
              </span>
            )}
          </div>
        </div>
      )}

      {/* 8-DIMENSION EQUAL-WEIGHTED EVALUATION GRID */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Compass className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              8 Dimensions Evaluated With Equal 12.5% Weighting
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Click any card to expand positive and negative findings
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {dimensionKeys.map((key) => {
            const dim = dimensions[key];
            const Icon = DIMENSION_ICONS[key] || FileText;
            const isExpanded = expandedDimension === key;
            const scoreNum = getScoreNumber(dim.impactLevel);

            return (
              <div
                key={key}
                onClick={() => setExpandedDimension(isExpanded ? null : key)}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all duration-200 bg-white hover:shadow-md ${
                  isExpanded ? 'border-blue-400 ring-2 ring-blue-100 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-slate-100 text-slate-800 rounded-lg">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {dim.dimensionLabel}
                      </h4>
                      <span className="text-[10px] text-slate-600 font-bold block">
                        Weight: 12.5%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {scoreNum}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full border ${getImpactBadgeClass(dim.impactLevel)}`}>
                    {dim.impactLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed font-medium">
                  {dim.evidence}
                </p>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-xs animate-fadeIn">
                    {dim.positiveImpacts && dim.positiveImpacts.length > 0 && (
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-1">
                          Positive Impacts (+):
                        </span>
                        <ul className="space-y-1 pl-3 text-slate-700 list-disc">
                          {dim.positiveImpacts.map((pos, idx) => (
                            <li key={idx} className="leading-snug">{pos}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dim.negativeImpacts && dim.negativeImpacts.length > 0 && (
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block mb-1">
                          Negative Impacts (-):
                        </span>
                        <ul className="space-y-1 pl-3 text-slate-700 list-disc">
                          {dim.negativeImpacts.map((neg, idx) => (
                            <li key={idx} className="leading-snug">{neg}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPREHENSIVE IDENTIFIED IMPACTS: ALL POSITIVE VS ALL NEGATIVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* All Positive Impacts */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-emerald-900 font-black text-xs uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>All Positive Impacts Identified ({allPositiveImpacts?.length || 0})</span>
          </div>
          {allPositiveImpacts && allPositiveImpacts.length > 0 ? (
            <ul className="space-y-1.5 pl-4 text-xs text-emerald-950 list-disc font-medium">
              {allPositiveImpacts.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-800 italic">
              No significant positive public impacts identified across evaluated dimensions.
            </p>
          )}
        </div>

        {/* All Negative Impacts */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-rose-900 font-black text-xs uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>All Negative Impacts Identified ({allNegativeImpacts?.length || 0})</span>
          </div>
          {allNegativeImpacts && allNegativeImpacts.length > 0 ? (
            <ul className="space-y-1.5 pl-4 text-xs text-rose-950 list-disc font-medium">
              {allNegativeImpacts.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-rose-800 italic">
              No significant adverse negative impacts identified across evaluated dimensions.
            </p>
          )}
        </div>
      </div>

      {/* UNCERTAINTIES & DATA GAPS (Rule 10) */}
      {uncertaintiesAndDataGaps && uncertaintiesAndDataGaps.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="h-4 w-4 text-slate-500" />
            <span>Information Boundaries, Uncertainties & Field Data Gaps:</span>
          </div>
          <ul className="space-y-1 pl-4 text-xs text-slate-600 list-disc font-medium">
            {uncertaintiesAndDataGaps.map((gap, idx) => (
              <li key={idx} className="leading-relaxed">{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FOOTER NOTICE: EQUAL WEIGHTING & NEUTRALITY GUARANTEE */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
        <span>Framework: Neutral Heuristic Multi-Dimensional Evaluation</span>
        <span className="font-semibold text-slate-700">All 8 Dimensions Weighed Equally (No Economic Priority)</span>
      </div>
    </div>
  );
};

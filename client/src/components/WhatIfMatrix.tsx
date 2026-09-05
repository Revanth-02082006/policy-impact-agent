import React, { useState } from 'react';
import { AlternativeStrategy } from '../types/index.js';
import { Layers, CheckCircle2, ShieldCheck, AlertTriangle, Wrench, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface WhatIfMatrixProps {
  alternatives: AlternativeStrategy[];
  recommendedOptionId: string;
}

export const WhatIfMatrix: React.FC<WhatIfMatrixProps> = ({ alternatives, recommendedOptionId }) => {
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(recommendedOptionId);
  const [expandAll, setExpandAll] = useState(false);

  const getScoreBadge = (score: number) => {
    let bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    let label = 'Low Impact';
    if (score > 70) {
      bg = 'bg-red-50 text-red-800 border-red-200';
      label = 'High Risk';
    } else if (score > 40) {
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      label = 'Moderate Risk';
    }
    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold border ${bg}`}>
        <span>{score}</span>
        <span className="text-[10px] opacity-75 font-normal">({label})</span>
      </span>
    );
  };

  const getOptionBadgeColor = (id: string, isRecommended: boolean) => {
    if (isRecommended) return 'bg-blue-600 text-white';
    if (id.includes('a') || id.includes('1')) return 'bg-rose-600 text-white';
    return 'bg-emerald-600 text-white';
  };

  const getOptionRoleBadge = (id: string, isRecommended: boolean) => {
    if (isRecommended) {
      return (
        <span className="bg-blue-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest flex items-center space-x-1 shadow-sm mt-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>AI Recommended Strategy</span>
        </span>
      );
    }
    if (id.includes('a') || id.includes('1')) {
      return (
        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1">
          Proposed Baseline (Your Input)
        </span>
      );
    }
    return (
      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1">
        Alternative Operational Model
      </span>
    );
  };

  const getTrafficAccessSummary = (opt: AlternativeStrategy) => {
    const id = opt.id.toLowerCase();
    const type = (opt.optionType || '').toLowerCase();
    if (type.includes('partial') || id.includes('b') || id.includes('2')) {
      return '1 Phased Lane dedicated for Ambulances, School Buses & Local Residents';
    }
    if (type.includes('night') || id.includes('c') || id.includes('3')) {
      return '100% Open Daytime (5 AM – 10 PM) • Closure restricted to 10 PM – 5 AM';
    }
    return '100% Full Closure (All lanes blocked 24/7 for entire project duration)';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-extrabold text-slate-900">What-If Multi-Strategy Comparison</h3>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
            Lower Score = Lower Disruption
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Side-by-side trade-off analysis showing what each strategy option actually is, its operational mechanism, and multi-domain impact scores.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600 font-bold uppercase tracking-wider">
              <th className="py-4 px-4 min-w-[200px] rounded-tl-xl align-top">Strategy & Dimensions</th>
              {alternatives.map((opt) => {
                const isRecommended = opt.id === recommendedOptionId;
                const optionLabel = opt.title.includes('—') ? opt.title.split('—')[0].trim() : opt.title;
                const optionStrategy = opt.title.includes('—') ? opt.title.split('—')[1].trim() : '';

                return (
                  <th
                    key={opt.id}
                    className={`py-4 px-4 text-center min-w-[280px] align-top ${
                      isRecommended ? 'bg-blue-50/90 text-blue-950 border-x-2 border-t-2 border-blue-400' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${getOptionBadgeColor(opt.id, isRecommended)}`}>
                        {optionLabel}
                      </span>
                      <span className="text-sm font-black text-slate-900 leading-snug">
                        {optionStrategy || opt.title}
                      </span>
                      {getOptionRoleBadge(opt.id, isRecommended)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {/* Row 1: What is this Option? (Operational Concept) */}
            <tr className="bg-blue-50/20 border-b border-slate-200">
              <td className="py-3.5 px-4 font-extrabold text-slate-900 align-top">
                <div className="flex items-center space-x-1.5 text-blue-800">
                  <Info className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>What This Option Is</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Operational mechanism & execution rule
                </span>
              </td>
              {alternatives.map((opt) => {
                const isRecommended = opt.id === recommendedOptionId;
                return (
                  <td
                    key={opt.id}
                    className={`py-3.5 px-4 text-xs leading-relaxed text-slate-700 align-top ${
                      isRecommended ? 'bg-blue-50/50 border-x-2 border-blue-300 font-medium' : ''
                    }`}
                  >
                    <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/80 shadow-2xs">
                      <span className="font-extrabold text-slate-900 block mb-1">
                        {opt.title.includes('—') ? opt.title.split('—')[1].trim() : opt.title}:
                      </span>
                      <p className="text-slate-700 leading-normal">{opt.description}</p>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Traffic & Access Policy */}
            <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-200">
              <td className="py-3 px-4 font-bold text-slate-800">
                <span>🚦 Traffic & Access Policy</span>
              </td>
              {alternatives.map((opt) => (
                <td
                  key={opt.id}
                  className={`py-3 px-4 text-center ${
                    opt.id === recommendedOptionId ? 'bg-blue-50/30 border-x-2 border-blue-200' : ''
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-800 block">
                    {getTrafficAccessSummary(opt)}
                  </span>
                </td>
              ))}
            </tr>

            {/* Transport Row */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-800">
                <span>🚗 Transport & Grid Congestion</span>
              </td>
              {alternatives.map((opt) => (
                <td key={opt.id} className={`py-3 px-4 text-center ${opt.id === recommendedOptionId ? 'bg-blue-50/30 border-x-2 border-blue-200' : ''}`}>
                  {getScoreBadge(opt.scores.transport)}
                </td>
              ))}
            </tr>

            {/* Essential Services Row */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-800">
                <span>🏥 Hospital Ambulance & School Access</span>
              </td>
              {alternatives.map((opt) => (
                <td key={opt.id} className={`py-3 px-4 text-center ${opt.id === recommendedOptionId ? 'bg-blue-50/30 border-x-2 border-blue-200' : ''}`}>
                  {getScoreBadge(opt.scores.essentialServices)}
                </td>
              ))}
            </tr>

            {/* Population Equity Row */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-800">
                <span>👥 Community Accessibility & Transit Load</span>
              </td>
              {alternatives.map((opt) => (
                <td key={opt.id} className={`py-3 px-4 text-center ${opt.id === recommendedOptionId ? 'bg-blue-50/30 border-x-2 border-blue-200' : ''}`}>
                  {getScoreBadge(opt.scores.population)}
                </td>
              ))}
            </tr>

            {/* Disaster Risk Row */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-800">
                <span>🛡️ Disaster Preparedness & Evacuation</span>
              </td>
              {alternatives.map((opt) => (
                <td key={opt.id} className={`py-3 px-4 text-center ${opt.id === recommendedOptionId ? 'bg-blue-50/30 border-x-2 border-blue-200' : ''}`}>
                  {getScoreBadge(opt.scores.disasterRisk)}
                </td>
              ))}
            </tr>

            {/* Overall Composite Score Row */}
            <tr className="bg-slate-100 font-extrabold text-sm border-t-2 border-slate-300">
              <td className="py-4 px-4 text-slate-900 uppercase tracking-wider">
                Overall AI Simulation Score
              </td>
              {alternatives.map((opt) => {
                const isRecommended = opt.id === recommendedOptionId;
                return (
                  <td
                    key={opt.id}
                    className={`py-4 px-4 text-center ${
                      isRecommended ? 'bg-blue-100/90 text-blue-950 border-x-2 border-b-2 border-blue-400' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-2xl font-black">{opt.scores.overall}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Composite Disruption</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Strategy Descriptions & Operational Profiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span>Alternative Strategy Operational Details & Rationale</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive operational breakdown of each strategy's implementation model, benefits, risks, and required mitigations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpandAll(!expandAll)}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold"
          >
            {expandAll ? 'Collapse Details' : 'Expand All Details'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {alternatives.map((opt) => {
            const isRecommended = opt.id === recommendedOptionId;
            const isExpanded = expandAll || expandedOptionId === opt.id;

            return (
              <div
                key={opt.id}
                className={`rounded-xl border transition-all ${
                  isRecommended
                    ? 'border-blue-300 bg-blue-50/30 shadow-sm ring-1 ring-blue-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Option Card Header */}
                <div
                  onClick={() => setExpandedOptionId(isExpanded && !expandAll ? null : opt.id)}
                  className="p-4 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center space-x-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-extrabold ${getOptionBadgeColor(opt.id, isRecommended)}`}>
                      {opt.title.includes('—') ? opt.title.split('—')[0].trim() : opt.title}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900">
                          {opt.title.includes('—') ? opt.title.split('—')[1].trim() : opt.title}
                        </h5>
                        {isRecommended && (
                          <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{opt.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Composite Score</span>
                      <span className="text-base font-black text-slate-900">{opt.scores.overall}/100</span>
                    </div>
                    <button type="button" className="p-1 text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-100 space-y-4 text-xs">
                    {/* Operational Mechanism Callout */}
                    <div className="mt-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="font-extrabold text-slate-900 block mb-1">
                        Operational Execution Plan:
                      </span>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {opt.description}
                      </p>
                      <div className="mt-2 text-[11px] font-semibold text-slate-800 bg-white p-2 rounded border border-slate-200">
                        <span className="text-blue-700">Access Policy: </span>
                        {getTrafficAccessSummary(opt)}
                      </div>
                    </div>

                    {/* Benefits & Risks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Benefits */}
                      <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                        <span className="font-extrabold text-emerald-900 block mb-2 flex items-center space-x-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Key Advantages:</span>
                        </span>
                        <ul className="space-y-1.5 text-slate-700">
                          {opt.benefits.map((b, idx) => (
                            <li key={idx} className="flex items-start space-x-1.5">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span className="leading-snug">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risks */}
                      <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-100">
                        <span className="font-extrabold text-amber-900 block mb-2 flex items-center space-x-1.5">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span>Operational Risks & Trade-offs:</span>
                        </span>
                        <ul className="space-y-1.5 text-slate-700">
                          {opt.risks.map((r, idx) => (
                            <li key={idx} className="flex items-start space-x-1.5">
                              <span className="text-amber-600 font-bold">⚠</span>
                              <span className="leading-snug">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Mitigations */}
                    {opt.mitigations && opt.mitigations.length > 0 && (
                      <div className="p-3.5 rounded-lg bg-blue-50/40 border border-blue-100">
                        <span className="font-extrabold text-blue-950 block mb-1.5 flex items-center space-x-1.5">
                          <Wrench className="h-4 w-4 text-blue-600" />
                          <span>Required Safeguards & Traffic Mitigations:</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {opt.mitigations.map((m, idx) => (
                            <span key={idx} className="bg-white text-slate-800 border border-blue-200 px-2.5 py-1 rounded text-[11px] font-medium shadow-2xs">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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

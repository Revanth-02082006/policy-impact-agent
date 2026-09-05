import React from 'react';
import { AgentAnalysis, ImpactSeverity } from '../types/index.js';
import { DataTransparencyBadge } from './DataTransparencyBadge.js';
import { Truck, Cross, Users, ShieldAlert, AlertCircle, ArrowUpRight } from 'lucide-react';

interface AgentCardProps {
  analysis: AgentAnalysis;
}

export const AgentCard: React.FC<AgentCardProps> = ({ analysis }) => {
  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'transport':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'essential_services':
        return <Cross className="h-5 w-5 text-rose-600" />;
      case 'population':
        return <Users className="h-5 w-5 text-purple-600" />;
      case 'disaster_risk':
        return <ShieldAlert className="h-5 w-5 text-amber-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-600" />;
    }
  };

  const getSeverityBadge = (severity: ImpactSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">Critical Impact</span>;
      case 'high':
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">High Impact</span>;
      case 'moderate':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">Moderate Impact</span>;
      case 'low':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">Low Impact</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
              {getDomainIcon(analysis.domain)}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{analysis.domainName}</h4>
              <p className="text-[11px] text-slate-500">Autonomous Domain Agent</p>
            </div>
          </div>
          {getSeverityBadge(analysis.overallSeverity)}
        </div>

        {/* Score & Summary */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-medium">Domain Risk Score</span>
            <span className="text-lg font-extrabold text-slate-900">{analysis.score}<span className="text-xs text-slate-400 font-normal">/100</span></span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            {analysis.summary}
          </p>
        </div>

        {/* Key Domain Metrics */}
        {analysis.metrics && analysis.metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {analysis.metrics.map((m, idx) => (
              <div key={idx} className="bg-slate-50/80 p-2 rounded border border-slate-200/70">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">{m.label}</span>
                <span className="text-sm font-extrabold text-slate-900 block">{m.value}</span>
                {m.change && <span className="text-[10px] font-semibold text-rose-600 block">{m.change}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Domain Findings */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Key Domain Findings:</span>
          {analysis.findings.map((f) => (
            <div key={f.id} className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 flex items-center space-x-1">
                  <span>{f.title}</span>
                </span>
                <DataTransparencyBadge provenance={f.provenance} />
              </div>
              <p className="text-slate-600 text-[11px] mb-1">{f.description}</p>
              <div className="text-[10px] text-slate-400 font-medium flex items-center space-x-1">
                <span>Affected Entity:</span>
                <span className="font-semibold text-slate-700">{f.entityAffected}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

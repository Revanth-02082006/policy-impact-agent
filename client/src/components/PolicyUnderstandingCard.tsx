import React from 'react';
import { PolicyUnderstanding, SimulationResult } from '../types/index.js';
import {
  FileText,
  MapPin,
  Calendar,
  Wrench,
  AlertTriangle,
  Users,
  Building,
  Shield,
  Layers,
  Clock,
  CheckCircle2,
  Tag,
  Briefcase,
} from 'lucide-react';
import { DataTransparencyBadge } from './DataTransparencyBadge.js';

interface PolicyUnderstandingCardProps {
  policy: PolicyUnderstanding;
  populationContext?: SimulationResult['populationContext'];
}

export const PolicyUnderstandingCard: React.FC<PolicyUnderstandingCardProps> = ({
  policy,
  populationContext,
}) => {
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency':
        return 'bg-red-100 text-red-900 border-red-300 font-extrabold';
      case 'urgent':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'low':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300 font-semibold';
    }
  };

  const getScaleBadge = (scale: string) => {
    return 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Policy Understanding & Classification Agent
              </h3>
              <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                LLM Extracted
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Structured multi-dimensional parameters synthesized from raw natural language policy input.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Classification Badge */}
          <span className="text-xs bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-1 rounded-lg font-bold shadow-2xs flex items-center space-x-1.5">
            <Tag className="h-3.5 w-3.5" />
            <span>Category: {policy.category || 'General Administration'}</span>
          </span>

          {policy.confidenceScore && (
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
              Confidence: {policy.confidenceScore}%
            </span>
          )}

          {policy.dataSource && <DataTransparencyBadge provenance={policy.dataSource} />}
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-blue-50/50 border border-blue-200/80 p-4 rounded-xl">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 block mb-1">
          Executive Policy Brief
        </span>
        <p className="text-sm text-slate-800 font-medium leading-relaxed">
          "{policy.summary}"
        </p>
      </div>

      {/* 8 Primary Structured Dimension Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
        {/* 1. Decision Type & Category */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-slate-500 font-semibold mb-1">
              <Briefcase className="h-3.5 w-3.5 text-blue-600" />
              <span>Decision Type</span>
            </div>
            <p className="text-sm font-black text-slate-900 leading-snug">{policy.decisionType || policy.action || 'Civil Intervention'}</p>
          </div>
          <span className="mt-2 text-[10px] text-blue-700 font-semibold block">
            Domain: {policy.category}
          </span>
        </div>

        {/* 2. Department */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-slate-500 font-semibold mb-1">
              <Building className="h-3.5 w-3.5 text-indigo-600" />
              <span>Responsible Department</span>
            </div>
            <p className="text-sm font-black text-slate-900 leading-snug">{policy.department}</p>
          </div>
          <span className="mt-2 text-[10px] text-slate-500 font-medium block">
            Lead Administrative Authority
          </span>
        </div>

        {/* 3. Location & Scale */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-slate-500 font-semibold mb-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span>Location & Affected Area</span>
            </div>
            <p className="text-sm font-black text-slate-900 leading-snug">{policy.location}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">{policy.affectedArea}</p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-[10px] px-2 py-0.5 rounded border ${getScaleBadge(policy.scale)}`}>
              Scale: {policy.scale}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${getUrgencyBadge(policy.urgency)}`}>
              {policy.urgency} Urgency
            </span>
          </div>
        </div>

        {/* 4. Duration & Schedule */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-slate-500 font-semibold mb-1">
              <Calendar className="h-3.5 w-3.5 text-purple-600" />
              <span>Project Duration</span>
            </div>
            <p className="text-sm font-black text-slate-900 leading-snug">{policy.duration}</p>
          </div>
          <span className="mt-2 text-[10px] text-slate-500 font-medium block">
            Proposed Operational Window
          </span>
        </div>
      </div>

      {/* Stated Reason & Grounded Demographic Context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 text-xs">
        {/* Stated Reason */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-1.5 text-slate-600 font-bold mb-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Underlying Rationale & Justification</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">
            {policy.reason}
          </p>
        </div>

        {/* Grounded Demographic Context */}
        {populationContext && (
          <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-blue-900 font-bold mb-1">
                <Users className="h-3.5 w-3.5 text-blue-700" />
                <span>Geographic Demographic Context</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {populationContext.corridorEstimatedPopulation && populationContext.corridorEstimatedPopulation > 0
                  ? `~${populationContext.corridorEstimatedPopulation.toLocaleString()} residents in immediate catchment (${populationContext.densityCategory}). `
                  : ''}{populationContext.affectedDemographicSummary}
              </p>
            </div>
            <span className="text-[10px] text-blue-800 font-mono font-bold mt-2">
              District: {populationContext.district} • State: {populationContext.state}
            </span>
          </div>
        )}
      </div>

      {/* Stakeholders & Infrastructure Assets Involved */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs pt-1">
        {/* Stakeholders */}
        {policy.stakeholders && policy.stakeholders.length > 0 && (
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-2 flex items-center space-x-1">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              <span>Key Stakeholders:</span>
            </span>
            <ul className="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
              {policy.stakeholders.map((sh, idx) => (
                <li key={idx}>{sh}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Infrastructure Assets */}
        {policy.infrastructure && policy.infrastructure.length > 0 && (
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-2 flex items-center space-x-1">
              <Wrench className="h-3.5 w-3.5 text-indigo-600" />
              <span>Infrastructure Affected:</span>
            </span>
            <ul className="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
              {policy.infrastructure.map((inf, idx) => (
                <li key={idx}>{inf}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Resources Required */}
        {policy.resourcesRequired && policy.resourcesRequired.length > 0 && (
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-2 flex items-center space-x-1">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span>Resources & Clearances Required:</span>
            </span>
            <ul className="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
              {policy.resourcesRequired.map((res, idx) => (
                <li key={idx}>{res}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Constraints */}
      {policy.constraints && policy.constraints.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-start space-x-2 text-xs text-slate-600">
          <span className="font-bold text-slate-800 flex-shrink-0">Key Administrative Constraints:</span>
          <div className="flex flex-wrap gap-1.5">
            {policy.constraints.map((c, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyUnderstandingCard;

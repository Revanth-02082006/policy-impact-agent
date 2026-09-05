import React from 'react';
import { PolicyUnderstanding, SimulationResult } from '../types/index.js';
import { FileText, MapPin, Calendar, Wrench, AlertTriangle, Users } from 'lucide-react';
import { DataTransparencyBadge } from './DataTransparencyBadge.js';

interface PolicyUnderstandingCardProps {
  policy: PolicyUnderstanding;
  populationContext?: SimulationResult['populationContext'];
}

export const PolicyUnderstandingCard: React.FC<PolicyUnderstandingCardProps> = ({ policy, populationContext }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-bold text-slate-900">Policy Understanding Agent Output</h3>
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-200 ml-auto">
          Parsed Natural Language
        </span>
        {policy.dataSource && <DataTransparencyBadge provenance={policy.dataSource} />}
      </div>

      <p className="text-sm text-slate-600 mb-5 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
        "{policy.summary}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <Wrench className="h-3.5 w-3.5 text-blue-600" />
            <span>Action & Asset</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{policy.action}</p>
          <p className="text-xs text-blue-700 font-semibold">{policy.asset}</p>
        </div>

        <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>Location & Corridor</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{policy.location}</p>
          <p className="text-xs text-slate-500">{policy.affectedArea}</p>
        </div>

        <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <Calendar className="h-3.5 w-3.5 text-purple-600" />
            <span>Duration & Schedule</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{policy.duration}</p>
          <p className="text-xs text-slate-500">Proposed Work Window</p>
        </div>

        <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Stated Reason</span>
          </div>
          <p className="text-sm font-bold text-slate-900 line-clamp-2">{policy.reason}</p>
        </div>
      </div>

      {populationContext && (
        <div className="mt-4 p-3.5 bg-blue-50/60 rounded-lg border border-blue-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-950">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-700 flex-shrink-0" />
            <div>
              <span className="font-bold">Grounded Demographic Context:</span> ~{populationContext.corridorEstimatedPopulation.toLocaleString()} residents in immediate impact zone ({populationContext.densityCategory})
              <p className="text-[11px] text-slate-600 mt-0.5">{populationContext.affectedDemographicSummary}</p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-1 rounded-full uppercase tracking-wider self-start sm:self-center flex-shrink-0">
            Real Census Grounded
          </span>
        </div>
      )}

      {policy.constraints && policy.constraints.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-start space-x-2 text-xs text-slate-600">
          <span className="font-bold text-slate-700 flex-shrink-0">Key Constraints:</span>
          <div className="flex flex-wrap gap-1.5">
            {policy.constraints.map((c, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

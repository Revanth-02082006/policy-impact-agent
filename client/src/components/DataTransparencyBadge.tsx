import React from 'react';
import { DataProvenance } from '../types/index.js';
import { Database, Sparkles, LineChart, HelpCircle } from 'lucide-react';

interface DataTransparencyBadgeProps {
  provenance: DataProvenance;
  className?: string;
}

export const DataTransparencyBadge: React.FC<DataTransparencyBadgeProps> = ({ provenance, className = '' }) => {
  switch (provenance) {
    case 'verified_geographic_data':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <Database className="h-3 w-3 text-emerald-600" />
          <span>Verified Geographic Data</span>
        </span>
      );
    case 'synthetic_demo_data':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <Database className="h-3 w-3 text-amber-600" />
          <span>Synthetic Demo Data</span>
        </span>
      );
    case 'provided_data':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          <Database className="h-3 w-3 text-slate-500" />
          <span>Provided Data</span>
        </span>
      );
    case 'ai_inference':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          <Sparkles className="h-3 w-3 text-blue-500" />
          <span>AI Inference</span>
        </span>
      );
    case 'simulation_estimate':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
          <LineChart className="h-3 w-3 text-purple-500" />
          <span>Simulation Estimate</span>
        </span>
      );
    case 'assumption':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <HelpCircle className="h-3 w-3 text-amber-500" />
          <span>Assumption</span>
        </span>
      );
    default:
      return null;
  }
};

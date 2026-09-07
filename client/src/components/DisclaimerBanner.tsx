import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  className?: string;
  variant?: 'banner' | 'compact' | 'footer';
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  className = '',
  variant = 'banner',
}) => {
  const disclaimerText =
    'This platform provides AI-assisted simulations for decision support only. Results are based on available information, assumptions, and heuristic reasoning. Final decisions should be made by qualified government authorities using official data and expert evaluation.';

  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-2 bg-blue-50/80 border border-blue-200 text-blue-900 rounded-lg p-2.5 text-xs ${className}`}>
        <AlertTriangle className="h-4 w-4 text-blue-700 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          <strong className="font-bold">Decision-Support Notice:</strong> {disclaimerText}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50/60 border-l-4 border-blue-600 rounded-xl p-4 shadow-xs text-xs text-slate-700 border border-slate-200 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-blue-600 text-white rounded-lg flex-shrink-0 shadow-xs">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <span className="font-extrabold uppercase tracking-wider text-[11px] text-blue-800 block mb-0.5">
            Official AI Decision-Support Notice & Policy Simulation Protocol
          </span>
          <p className="leading-relaxed font-medium text-slate-700">
            {disclaimerText}
          </p>
        </div>
      </div>
    </div>
  );
};

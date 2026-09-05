import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Cpu, ArrowRight } from 'lucide-react';

interface AgentPipelineProps {
  onComplete?: () => void;
  isSimulating: boolean;
}

const PIPELINE_STEPS = [
  { id: 'policy', label: 'Policy Understanding', message: 'Parsing policy parameters and extraction bounds...' },
  { id: 'transport', label: 'Transport Impact Agent', message: 'Analyzing road network capacity and traffic diversion...' },
  { id: 'services', label: 'Essential Services Agent', message: 'Checking hospital, emergency, and school accessibility...' },
  { id: 'population', label: 'Population & Equity Agent', message: 'Assessing vulnerable zone transit impacts...' },
  { id: 'disaster', label: 'Disaster & Risk Agent', message: 'Evaluating emergency evacuation routes and secondary hazards...' },
  { id: 'cascading', label: 'Cascading Consequence Analyzer', message: 'Tracing cross-department cause-and-effect dependency chains...' },
  { id: 'alternatives', label: 'Alternative Strategy Agent', message: 'Generating Full, Partial, and Night-only closure models...' },
  { id: 'decision', label: 'Decision Recommendation Agent', message: 'Synthesizing what-if matrix and preparing final report...' },
];

export const AgentPipeline: React.FC<AgentPipelineProps> = ({ isSimulating, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isSimulating) return;

    setCurrentStepIndex(0);
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isSimulating, onComplete]);

  if (!isSimulating && currentStepIndex === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Cpu className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Multi-Agent AI Simulation Pipeline</h3>
            <p className="text-xs text-slate-500">Autonomous domain agents executing cross-department impact analysis</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
          Stage {Math.min(currentStepIndex + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length}
        </span>
      </div>

      {/* Progress Line */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {PIPELINE_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex || (!isSimulating && currentStepIndex === PIPELINE_STEPS.length - 1);
          const isCurrent = idx === currentStepIndex && isSimulating;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : isCurrent
                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm ring-1 ring-blue-400/30'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold">{step.label}</span>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin flex-shrink-0" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                )}
              </div>
              <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDone ? 'bg-emerald-500 w-full' : isCurrent ? 'bg-blue-600 w-3/4 animate-pulse' : 'w-0'
                  }`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Step Active Log Banner */}
      <div className="bg-slate-900 text-slate-100 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-emerald-400 font-bold">&gt;&gt;</span>
          <span className="text-slate-300">{PIPELINE_STEPS[currentStepIndex]?.message}</span>
        </div>
        <span className="text-slate-400 text-[11px] animate-pulse">Running Orchestration</span>
      </div>
    </div>
  );
};

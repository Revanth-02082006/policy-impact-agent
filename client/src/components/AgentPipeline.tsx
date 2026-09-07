import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Cpu } from 'lucide-react';

interface AgentPipelineProps {
  onComplete?: () => void;
  isSimulating: boolean;
}

const PIPELINE_STEPS = [
  { id: 'policy', label: 'Policy Understanding & Classifier', message: 'Extracting 12 structured dimensions and administrative category...' },
  { id: 'transport', label: 'Transport Impact Agent', message: 'Analyzing road capacity, detour congestion, and transit...' },
  { id: 'infrastructure', label: 'Infrastructure & Utilities Agent', message: 'Assessing underground water, power grid, and civil assets...' },
  { id: 'population', label: 'Population & Equity Agent', message: 'Assessing residents, commercial zones, and vulnerable groups...' },
  { id: 'services', label: 'Essential Services Agent', message: 'Checking hospitals, ambulance turnaround, fire, and schools...' },
  { id: 'economic', label: 'Economic & Trade Agent', message: 'Evaluating local trade velocity, logistics, and employment...' },
  { id: 'environmental', label: 'Environmental Agent', message: 'Auditing air particulate quality, acoustics, and water bodies...' },
  { id: 'disaster', label: 'Disaster Risk Agent', message: 'Evaluating flood margins, cyclone egress, and evacuation routes...' },
  { id: 'social', label: 'Social Impact Agent', message: 'Evaluating community sentiment, acceptance, and quality of life...' },
  { id: 'compliance', label: 'Policy Compliance Agent', message: 'Auditing administrative norms, safety principles, and regulations...' },
  { id: 'cascading', label: 'Cascading Impact Engine', message: 'Synthesizing Cause → Effect directed dependency graph...' },
  { id: 'alternatives', label: 'What-If Comparison Engine', message: 'Generating multi-strategy alternatives against baseline...' },
  { id: 'decision', label: 'Decision Recommendation Agent', message: 'Formulating explainable recommendation and executive report...' },
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
    }, 380);

    return () => clearInterval(interval);
  }, [isSimulating, onComplete]);

  if (!isSimulating && currentStepIndex === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
            <Cpu className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Autonomous Multi-Agent AI Simulation Orchestrator
            </h3>
            <p className="text-xs text-slate-500">
              Executing 9 specialized domain agents, cascading consequence analyzer, and What-If matrix engine.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full self-start sm:self-center">
          Agent Stage {Math.min(currentStepIndex + 1, PIPELINE_STEPS.length)} of {PIPELINE_STEPS.length}
        </span>
      </div>

      {/* Progress Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {PIPELINE_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex || (!isSimulating && currentStepIndex === PIPELINE_STEPS.length - 1);
          const isCurrent = idx === currentStepIndex && isSimulating;

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : isCurrent
                  ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-sm ring-1 ring-blue-400/30'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[11px] truncate">{step.label}</span>
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin flex-shrink-0" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                )}
              </div>
              <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
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

      {/* Real-time Agent Log Banner */}
      <div className="bg-slate-900 text-slate-100 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-emerald-400 font-bold">&gt;&gt;</span>
          <span className="text-slate-300">{PIPELINE_STEPS[currentStepIndex]?.message}</span>
        </div>
        <span className="text-slate-400 text-[11px] animate-pulse hidden sm:inline">Orchestrator Active</span>
      </div>
    </div>
  );
};

export default AgentPipeline;

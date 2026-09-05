import React from 'react';
import { SimulationResult } from '../types/index.js';
import { ShieldCheck, Printer, Download, ArrowLeft, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTransparencyBadge } from '../components/DataTransparencyBadge.js';

interface ReportPageProps {
  simulation: SimulationResult | null;
}

export const ReportPage: React.FC<ReportPageProps> = ({ simulation }) => {
  if (!simulation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Simulation Report</h2>
        <p className="text-slate-600 text-sm mb-4">Please run a simulation before viewing the decision report.</p>
        <Link to="/new-simulation" className="text-blue-600 font-bold hover:underline">
          Go to New Simulation
        </Link>
      </div>
    );
  }

  const { policy, agentAnalyses, cascadingGraph, alternatives, comparison, recommendation, overallScore } = simulation;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Action Bar (hidden during print) */}
      <div className="no-print flex items-center justify-between border-b border-slate-200 pb-4">
        <Link to="/analysis" className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Analysis Dashboard</span>
        </Link>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-lg text-xs shadow flex items-center space-x-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>Print Executive Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Body */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 text-slate-900">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheck className="h-6 w-6 text-blue-700" />
              <span className="font-black text-slate-900 text-lg uppercase tracking-tight">Policy Impact Agent</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase border border-slate-300">
                Official Decision Brief
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Decision Impact Report</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-slate-500">{policy.location} • Cross-Department Simulation Layer</p>
              {policy.dataSource && <DataTransparencyBadge provenance={policy.dataSource} />}
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <p><span className="font-bold text-slate-700">Date:</span> {new Date(simulation.timestamp).toLocaleDateString()}</p>
            <p><span className="font-bold text-slate-700">Sim ID:</span> {simulation.simulationId}</p>
            <p><span className="font-bold text-slate-700">Overall Score:</span> <span className="text-rose-700 font-extrabold">{overallScore}/100</span></p>
          </div>
        </div>

        {/* 1. Proposed Decision & Summary */}
        <section className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            1. Proposed Municipal Infrastructure Decision
          </h2>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-900 text-sm">"{policy.summary}"</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 pt-2 border-t border-slate-200">
              <div><span className="font-bold block text-slate-700">Target Asset:</span>{policy.asset}</div>
              <div><span className="font-bold block text-slate-700">Location:</span>{policy.location}</div>
              <div><span className="font-bold block text-slate-700">Duration:</span>{policy.duration}</div>
              <div><span className="font-bold block text-slate-700">Reason:</span>{policy.reason}</div>
            </div>
          </div>
        </section>

        {/* 2. Four Domain Analysis Summaries */}
        <section className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            2. Cross-Department Impact Findings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {Object.values(agentAnalyses).map((agent) => (
              <div key={agent.domain} className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">{agent.domainName}</span>
                  <span className="font-bold text-rose-700">Score: {agent.score}/100</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{agent.summary}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Cascading Consequence Chain */}
        <section className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            3. Identified Cascading Impact Chain
          </h2>
          <div className="bg-blue-50/60 p-4 rounded-lg border border-blue-200 text-xs">
            <span className="font-bold text-blue-950 block mb-2">Cause-and-Effect Dependency Path:</span>
            <p className="font-mono text-slate-800 leading-relaxed font-semibold">{cascadingGraph.primaryChainSummary}</p>
          </div>
        </section>

        {/* 4. Alternative Strategies & What-If Comparison */}
        <section className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            4. Alternative Strategies Evaluated
          </h2>
          <div className="space-y-3 text-xs">
            {alternatives.map((opt) => (
              <div key={opt.id} className="p-3.5 border border-slate-200 rounded-lg">
                <div className="flex justify-between font-bold text-slate-900 mb-1">
                  <span>{opt.title}</span>
                  <span className="text-blue-700">Composite Impact Score: {opt.scores.overall}</span>
                </div>
                <p className="text-slate-600 mb-2">{opt.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="font-bold text-emerald-700">Key Benefits:</span> {opt.benefits.join('; ')}</div>
                  <div><span className="font-bold text-rose-700">Key Risks:</span> {opt.risks.join('; ')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. AI Recommendation */}
        <section className="space-y-3 bg-blue-50/80 p-5 rounded-xl border border-blue-200">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-blue-950 flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-blue-700" />
            <span>5. Explainable AI Recommendation</span>
          </h2>
          <h3 className="font-bold text-sm text-slate-900">{recommendation.title}</h3>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">{recommendation.summary}</p>
          <div className="pt-2 text-xs text-slate-700 space-y-1">
            <span className="font-bold block">Required Operational Mitigations:</span>
            <ul className="list-disc pl-5 space-y-0.5">
              {recommendation.mitigationMeasures.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Disclaimer Footer (Mandatory responsible AI requirement) */}
        <div className="pt-6 border-t border-slate-300 text-center text-[11px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">
            AI-generated simulation. Intended for decision support only. It does not replace official municipal assessment or human decision-making.
          </p>
          <p>Policy Impact Agent • Urban Decision Simulator</p>
        </div>
      </div>
    </div>
  );
};

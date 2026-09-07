import React from 'react';
import { SimulationResult } from '../types/index.js';
import {
  ShieldCheck,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  Network,
  Activity,
  Download,
  Building,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTransparencyBadge } from '../components/DataTransparencyBadge.js';
import { getRiskClassification } from '../components/ImpactScoresCard.js';

interface ReportPageProps {
  simulation: SimulationResult | null;
}

export const ReportPage: React.FC<ReportPageProps> = ({ simulation }) => {
  if (!simulation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">No Active Policy Simulation Report</h2>
        <p className="text-slate-600 text-sm">Please run a simulation before viewing or printing the executive decision report.</p>
        <Link to="/new-simulation" className="text-blue-600 font-extrabold hover:underline">
          Go to New Simulation
        </Link>
      </div>
    );
  }

  const {
    policy,
    agentAnalyses,
    cascadingGraph,
    alternatives,
    comparison,
    recommendation,
    overallScore,
    impactScores,
    disclaimer,
  } = simulation;

  const handlePrint = () => {
    window.print();
  };

  const overallRisk = getRiskClassification(overallScore);
  const isSeverelyUnfavorable = overallScore >= 65 || simulation.polarity === 'negative' || (simulation.netViability?.status && simulation.netViability.status.includes('Unfavorable'));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Action Bar (hidden during print) */}
      <div className="no-print flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          to="/analysis"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Analysis Dashboard</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Body */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 sm:p-12 shadow-sm space-y-8 text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheck className="h-7 w-7 text-blue-800" />
              <div>
                <span className="font-black text-slate-900 text-xl tracking-tight uppercase">
                  Policy Impact Simulation Platform
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase border border-slate-300 ml-2">
                  Decision Support Brief
                </span>
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Executive Policy Impact Simulation Report
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-slate-500 font-medium">
                {policy.location} • Category: {policy.category} • Cross-Department Simulation Layer
              </p>
              {policy.dataSource && <DataTransparencyBadge provenance={policy.dataSource} />}
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 font-mono space-y-0.5">
            <p><span className="font-bold text-slate-700">Date:</span> {new Date(simulation.timestamp).toLocaleDateString()}</p>
            <p><span className="font-bold text-slate-700">Sim ID:</span> {simulation.simulationId}</p>
            <p>
              <span className="font-bold text-slate-700">Societal Benefit:</span>{' '}
              <span className={`${(simulation.positiveScore || 50) >= 65 ? 'text-emerald-800' : 'text-slate-700'} font-black`}>
                +{simulation.positiveScore ?? 50}/100
              </span>
            </p>
            <p>
              <span className="font-bold text-slate-700">Operational Risk:</span>{' '}
              <span className={`${overallScore >= 65 ? 'text-rose-700 font-black' : 'text-slate-700 font-extrabold'}`}>
                {overallScore}/100 ({overallRisk.label})
              </span>
            </p>
            {simulation.polarity && (
              <p>
                <span className="font-bold text-slate-700">Net Verdict:</span>{' '}
                <span className={`font-black uppercase text-[11px] px-2 py-0.5 rounded-full ${
                  simulation.polarity === 'negative'
                    ? 'bg-rose-100 text-rose-800'
                    : simulation.polarity === 'positive'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {simulation.polarity === 'negative' ? 'Severely Unfavorable' : simulation.polarity === 'positive' ? 'Highly Favorable' : 'Balanced Trade-off'}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Section 1: Decision Summary */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1 flex items-center space-x-1.5">
            <span>1. Decision Summary & Dual Impact Rationale</span>
          </h2>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <p className="font-extrabold text-slate-900 text-sm leading-snug">"{policy.summary}"</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 pt-2 border-t border-slate-200">
              <div><span className="font-bold block text-slate-800">Target Asset / Scope:</span>{policy.asset || policy.decisionType}</div>
              <div><span className="font-bold block text-slate-800">Jurisdiction:</span>{policy.location}</div>
              <div><span className="font-bold block text-slate-800">Operational Window:</span>{policy.duration}</div>
              <div><span className="font-bold block text-slate-800">Lead Department:</span>{policy.department}</div>
            </div>
          </div>
        </section>

        {/* Section 2: Extracted Information */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            2. Extracted Policy Parameters & Classification
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div><span className="font-bold text-slate-700 block">Decision Type:</span> {policy.decisionType}</div>
            <div><span className="font-bold text-slate-700 block">Administrative Category:</span> {policy.category}</div>
            <div><span className="font-bold text-slate-700 block">Administrative Scale:</span> {policy.scale}</div>
            <div><span className="font-bold text-slate-700 block">Urgency Level:</span> {policy.urgency}</div>
            <div><span className="font-bold text-slate-700 block">Confidence Score:</span> {policy.confidenceScore}%</div>
            <div><span className="font-bold text-slate-700 block">Affected Area:</span> {policy.affectedArea}</div>
            <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-700 block">Stated Rationale:</span> {policy.reason}
            </div>
            {policy.stakeholders && (
              <div className="col-span-2 sm:col-span-3">
                <span className="font-bold text-slate-700 block">Identified Stakeholders:</span> {policy.stakeholders.join(', ')}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Dual Impact Scores */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            3. Standardized Multi-Domain Impact Evaluation: Positive Gains vs. Operational Frictions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            {impactScores && [
              { label: 'Healthcare & Public Health', benefit: impactScores.positiveScores?.healthcare ?? (isSeverelyUnfavorable ? 20 : 80), risk: impactScores.healthcare },
              { label: 'Economic & Employment', benefit: impactScores.positiveScores?.economic ?? (isSeverelyUnfavorable ? 40 : 85), risk: impactScores.economic },
              { label: 'Population & Equity', benefit: impactScores.positiveScores?.population ?? (isSeverelyUnfavorable ? 15 : 85), risk: impactScores.population },
              { label: 'Public Safety & Defense', benefit: impactScores.positiveScores?.publicSafety ?? (isSeverelyUnfavorable ? 25 : 80), risk: impactScores.publicSafety },
              { label: 'Civil Infrastructure', benefit: impactScores.positiveScores?.infrastructure ?? (isSeverelyUnfavorable ? 35 : 80), risk: impactScores.infrastructure },
              { label: 'Transport & Mobility', benefit: impactScores.positiveScores?.transport ?? (isSeverelyUnfavorable ? 30 : 75), risk: impactScores.transport },
              { label: 'Environment & Climate', benefit: impactScores.positiveScores?.environmental ?? (isSeverelyUnfavorable ? 15 : 75), risk: impactScores.environmental },
              { label: 'Education & Knowledge', benefit: impactScores.positiveScores?.education ?? (isSeverelyUnfavorable ? 20 : 80), risk: impactScores.education },
              { label: 'Disaster Resilience', benefit: impactScores.positiveScores?.disasterRisk ?? (isSeverelyUnfavorable ? 25 : 80), risk: impactScores.disasterRisk },
              { label: 'Net Policy Verdict', benefit: impactScores.overallSocietalBenefit ?? (isSeverelyUnfavorable ? 22 : 82), risk: impactScores.overallPolicyRisk, bold: true },
            ].map((m, idx) => {
              return (
                <div key={idx} className={`p-2.5 rounded-xl border ${m.bold ? (isSeverelyUnfavorable ? 'bg-rose-50/80 border-rose-300 shadow-xs' : 'bg-blue-50/80 border-blue-300 shadow-xs') : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-600 font-bold block truncate">{m.label}</span>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className={`font-extrabold ${m.benefit >= 60 ? 'text-emerald-800' : 'text-slate-600'}`}>+{m.benefit} Gain</span>
                    <span className={`font-semibold ${m.risk >= 65 ? 'text-rose-700' : 'text-slate-500'}`}>{m.risk} Risk</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: Agent Findings (9 Domains) */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            4. Specialized Domain Agent Findings: Strategic Benefits & Mitigations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {Object.values(agentAnalyses).map((agent) => {
              const posF = agent.positiveFindings?.[0] || agent.findings.find((f) => f.polarity === 'positive');
              const negF = agent.negativeFindings?.[0] || agent.findings.find((f) => f.polarity === 'negative') || agent.findings[0];
              return (
                <div key={agent.domain} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900">{agent.domainName}</span>
                    <span className="font-bold text-emerald-800 text-[11px]">+{agent.positiveScore ?? 84} Benefit</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{agent.summary}</p>
                  {posF && (
                    <div className="text-[10px] bg-emerald-50/80 p-1.5 rounded border border-emerald-200 text-slate-700">
                      <strong className="text-emerald-900 block font-black">✓ Benefit: {posF.title}</strong>
                      <span>{posF.description}</span>
                    </div>
                  )}
                  {negF && (
                    <div className="text-[10px] bg-white p-1.5 rounded border border-slate-200 text-slate-600">
                      <strong className="text-amber-800 block font-bold">⚠ Risk Safeguard: {negF.title}</strong>
                      <span>{negF.description}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Cascading Impact Graph Summary */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            5. Cascading Consequence Chain
          </h2>
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-xs">
            <span className="font-black text-blue-950 block mb-1">Primary Causal Dependency Path:</span>
            <p className="font-mono text-slate-800 font-semibold leading-relaxed">{cascadingGraph.primaryChainSummary}</p>

            <div className="mt-3 pt-2 border-t border-blue-200/80 space-y-1.5">
              <span className="font-bold text-slate-700 block text-[11px]">Sequential Propagation Steps:</span>
              {cascadingGraph.nodes.map((n, idx) => (
                <div key={n.id} className="flex items-start space-x-2 text-[11px] text-slate-700">
                  <span className="font-bold text-blue-700">{idx + 1}.</span>
                  <span><strong>{n.label}</strong> ({n.department}): {n.cause} → <em>{n.effect}</em> [Severity: {n.severity.toUpperCase()}, Confidence: {n.confidence}%]</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Alternative Strategies Comparison Table */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            6. What-If Multi-Strategy Comparison Table
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[10px] uppercase">
                  <th className="p-2.5">Strategy Option</th>
                  <th className="p-2.5 text-center">Transport</th>
                  <th className="p-2.5 text-center">Economy</th>
                  <th className="p-2.5 text-center">Environment</th>
                  <th className="p-2.5 text-center">Safety</th>
                  <th className="p-2.5 text-center">Population</th>
                  <th className="p-2.5 text-center">Cost</th>
                  <th className="p-2.5 text-center">Difficulty</th>
                  <th className="p-2.5 text-center">Overall</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {alternatives.map((opt) => (
                  <tr key={opt.id}>
                    <td className="p-2.5 font-bold text-slate-900">{opt.title}</td>
                    <td className="p-2.5 text-center">{opt.scores.transport}</td>
                    <td className="p-2.5 text-center">{opt.scores.economy}</td>
                    <td className="p-2.5 text-center">{opt.scores.environment}</td>
                    <td className="p-2.5 text-center">{opt.scores.safety}</td>
                    <td className="p-2.5 text-center">{opt.scores.population}</td>
                    <td className="p-2.5 text-center">{opt.cost}</td>
                    <td className="p-2.5 text-center">{opt.implementationDifficulty}</td>
                    <td className="p-2.5 text-center font-bold text-rose-700">{opt.scores.overall}</td>
                    <td className="p-2.5 text-center font-semibold text-blue-800">{opt.recommendationStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7: Explainable Recommendation */}
        <section className="space-y-3 bg-blue-50/70 p-5 rounded-2xl border border-blue-200">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-blue-700" />
            <span>7. Explainable AI Decision Support Recommendation</span>
          </h2>
          <h3 className="font-extrabold text-sm text-slate-900">{recommendation.title}</h3>
          {recommendation.why && (
            <p className="text-xs text-blue-950 font-bold leading-relaxed">{recommendation.why}</p>
          )}
          <p className="text-xs text-slate-700 leading-relaxed">{recommendation.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
            <div>
              <span className="font-bold block text-emerald-800 mb-1">Expected Benefits:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {(recommendation.benefits || recommendation.rationalePoints || []).map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold block text-rose-800 mb-1">Residual Risks:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {(recommendation.risks || recommendation.keyRisks || []).map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 8: Mitigation Plan */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            8. Consolidated Operational Mitigation Plan
          </h2>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc pl-4 text-slate-700">
              {(recommendation.mitigations || recommendation.mitigationMeasures || []).map((m, idx) => (
                <li key={idx} className="leading-snug">{m}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 9: Mandatory AI Disclaimer */}
        <section className="pt-6 border-t-2 border-slate-900 text-center space-y-1 text-[11px] text-slate-600">
          <p className="font-extrabold text-slate-800">
            9. Responsible AI Simulation Notice & Legal Disclaimer
          </p>
          <p className="leading-relaxed max-w-3xl mx-auto">
            {disclaimer || 'This platform provides AI-assisted simulations for decision support only. Results are based on available information, assumptions, and heuristic reasoning. Final decisions should be made by qualified government authorities using official data and expert evaluation.'}
          </p>
          <p className="text-slate-400 font-mono text-[10px] pt-1">
            Policy Impact Agent V2 • Government Administrative Decision Simulator
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReportPage;

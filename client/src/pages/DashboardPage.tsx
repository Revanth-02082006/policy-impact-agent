import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Activity, ShieldAlert, CheckCircle2, Building2, ArrowRight, FileText, Layers, Network, Printer, MapPin } from 'lucide-react';
import { SimulationResult } from '../types/index.js';
import { DataTransparencyBadge } from '../components/DataTransparencyBadge.js';

interface DashboardPageProps {
  currentSimulation: SimulationResult | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentSimulation }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12 pointer-events-none">
          <Building2 className="h-96 w-96 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Policy Impact Agent
          </h1>
          <p className="text-lg text-blue-100 font-medium mb-6 leading-relaxed">
            Simulate the cross-department consequences of urban infrastructure decisions before implementation.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to="/new-simulation"
              className="bg-white text-blue-900 hover:bg-blue-50 px-5 py-3 rounded-xl font-extrabold text-sm shadow-lg flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="h-5 w-5 text-blue-600" />
              <span>Create New Simulation</span>
            </Link>
            {currentSimulation && (
              <Link
                to="/analysis"
                className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-400/40 px-5 py-3 rounded-xl font-extrabold text-sm shadow-lg flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <Activity className="h-5 w-5 text-blue-200" />
                <span>View Active Analysis</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Simulations</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity className="h-4 w-4" /></div>
          </div>
          <p className="text-3xl font-black text-slate-900">{currentSimulation ? '1' : '0'}</p>
          <p className="text-xs text-slate-500 mt-1">Across 4 domain agents</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Risk Level</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ShieldAlert className="h-4 w-4" /></div>
          </div>
          <p className="text-3xl font-black text-rose-700">{currentSimulation ? `${currentSimulation.overallScore}/100` : '--'}</p>
          <p className="text-xs text-rose-600 font-semibold mt-1">{currentSimulation ? (currentSimulation.overallScore > 70 ? 'High Risk Impact' : 'Moderate Risk Impact') : 'No simulation active'}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alternatives Evaluated</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Layers className="h-4 w-4" /></div>
          </div>
          <p className="text-3xl font-black text-slate-900">{currentSimulation?.alternatives.length || 0}</p>
          <p className="text-xs text-amber-600 font-semibold mt-1">What-if strategy matrix</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Engine Status</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="h-4 w-4" /></div>
          </div>
          <p className="text-3xl font-black text-slate-900">{currentSimulation?.isLiveGemini ? 'Live' : 'Ready'}</p>
          <p className="text-xs text-slate-500 mt-1">{currentSimulation?.isLiveGemini ? 'Live Gemini AI' : 'AI Simulation Engine'}</p>
        </div>
      </div>

      {/* Main Content: Active Simulation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">Active Urban Policy Simulation</h3>
          <span className="text-xs text-slate-500 font-medium">Policy Simulation Registry</span>
        </div>

        {!currentSimulation && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-600 text-center space-y-3">
            <p>No active simulation results loaded.</p>
            <Link to="/new-simulation" className="inline-flex items-center space-x-1.5 text-blue-600 font-extrabold hover:underline">
              <span>Run a new simulation scenario</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {currentSimulation && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-200">
                    Simulation Ready
                  </span>
                  <span className="text-xs text-slate-400">ID: {currentSimulation.simulationId}</span>
                  {currentSimulation.policy.dataSource && <DataTransparencyBadge provenance={currentSimulation.policy.dataSource} />}
                </div>
                <h4 className="text-xl font-bold text-slate-900">{currentSimulation.policy.asset}</h4>
                <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{currentSimulation.policy.location}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Impact Score</span>
                <span className="text-2xl font-black text-rose-700">{currentSimulation.overallScore}/100</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-1">Policy Executive Summary:</span>
              <p className="leading-relaxed font-medium">"{currentSimulation.policy.summary}"</p>
            </div>

            {/* Recommendation Preview */}
            <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200 text-xs">
              <span className="font-extrabold text-blue-900 block mb-1">AI Recommendation Preview:</span>
              <p className="text-slate-800 font-semibold">{currentSimulation.recommendation.title}</p>
              <p className="text-slate-600 mt-1 line-clamp-2">{currentSimulation.recommendation.summary}</p>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <Link
                to="/analysis"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg text-xs font-extrabold shadow flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Activity className="h-4 w-4" />
                <span>Full Overview</span>
              </Link>
              <Link
                to="/cascading"
                className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-lg text-xs font-extrabold shadow flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Network className="h-4 w-4" />
                <span>Cascading Graph</span>
              </Link>
              <Link
                to="/alternatives"
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg text-xs font-extrabold shadow flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Layers className="h-4 w-4" />
                <span>What-If Matrix</span>
              </Link>
              <Link
                to="/report"
                className="bg-slate-800 hover:bg-slate-900 text-white p-2.5 rounded-lg text-xs font-extrabold shadow flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Print Report</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

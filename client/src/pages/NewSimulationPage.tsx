import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  MapPin,
  Calendar,
  Wrench,
  ShieldCheck,
  Users,
  Navigation,
  Loader2,
  Sparkles,
  Layers,
  Building,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { ScenarioInput } from '../types/index.js';
import { TamilNaduMap } from '../components/TamilNaduMap.js';
import { DisclaimerBanner } from '../components/DisclaimerBanner.js';

export const NewSimulationPage: React.FC<{
  onSubmitSimulation: (input: ScenarioInput) => void;
  isSimulating: boolean;
}> = ({ onSubmitSimulation, isSimulating }) => {
  const navigate = useNavigate();

  // Natural language description
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Tiruppur');
  const [city, setCity] = useState('');
  const [town, setTown] = useState('');
  const [village, setVillage] = useState('');
  const [area, setArea] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(11.1085);
  const [longitude, setLongitude] = useState<number | undefined>(77.3411);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [duration, setDuration] = useState('');
  const [reason, setReason] = useState('');
  const [department, setDepartment] = useState('');
  const [constraints, setConstraints] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmitSimulation({
      description,
      district,
      city,
      town,
      village,
      area: area || village || town || city,
      location: [village, town || city, district, 'Tamil Nadu'].filter(Boolean).join(', '),
      latitude,
      longitude,
      selectedAsset: selectedAsset.trim() || undefined,
      duration: duration.trim() || undefined,
      reason: reason.trim() || undefined,
      department: department.trim() || undefined,
      constraints: constraints.trim() || undefined,
    });

    navigate('/analysis');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-blue-200 bg-blue-950/40 px-3 py-1 rounded-full w-fit mb-3 border border-blue-400/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Administrative Policy Simulator V2</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Simulate Any Administrative Decision
          </h1>
          <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed mb-4">
            Type any proposed municipal, environmental, disaster, transit, or development policy in natural language. The autonomous multi-agent engine will project cross-departmental consequences, cascading chains, and alternative strategies before execution.
          </p>
        </div>
      </div>

      {/* Mandatory AI Decision Support Disclaimer */}
      <DisclaimerBanner />

      {/* Main Simulation Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          {/* Primary Natural Language Input */}
          <div>
            <label htmlFor="policy-input" className="block text-sm font-black text-slate-900 mb-1.5">
              Proposed Administrative Decision (Natural Language) *
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Type naturally. For example: "Construct a textile factory near Tiruppur", "Relocate 500 families due to reservoir expansion", "Release excess water from Mettur Dam", "Ban heavy vehicles in the city center", or any municipal action.
            </p>
            <div className="relative">
              <textarea
                id="policy-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Type any administrative decision, public works project, regulation, or emergency notice..."
                className="w-full rounded-xl border border-slate-300 p-3.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Interactive Tamil Nadu Map */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Geographic Targeting (Tamil Nadu Coverage)
            </span>
            <TamilNaduMap
              district={district}
              city={city}
              town={town}
              village={village}
              selectedAsset={selectedAsset || description.slice(0, 30)}
              latitude={latitude}
              longitude={longitude}
              onPlaceSelect={(place) => {
                setDistrict(place.district);
                if (place.type === 'village') {
                  setVillage(place.name);
                } else if (place.type === 'city' || place.type === 'town') {
                  setCity(place.name);
                  setTown(place.name);
                }
                setLatitude(place.latitude);
                setLongitude(place.longitude);
              }}
              onLocationSelect={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
          </div>

          {/* Advanced Policy Parameters Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1.5"
            >
              <span>{showAdvanced ? '− Hide Advanced Parameters' : '+ Customize Administrative Parameters (Department, Schedule, Constraints)'}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Highways / WRD / Health"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-900 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Execution Duration / Timeline</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 30 Days, 6 Months"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-900 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Asset / Facility Name</label>
                <input
                  type="text"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  placeholder="e.g. Mettur Dam Sluice, NH-44 Sector"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-900 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Official Administrative Constraints</label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g. Maintain emergency ambulance lanes; advance gazette notification"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-900 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stated Reason / Justification</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Surplus inflow relief, export park"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-900 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Launch Simulation Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Multi-Agent Orchestrator executes 9 domain agents in parallel.
            </span>
            <button
              type="submit"
              disabled={isSimulating || !description.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold px-6 py-3 rounded-xl text-sm shadow-md flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Simulating Policy Consequences...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Run Multi-Agent Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewSimulationPage;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { NewSimulationPage } from './pages/NewSimulationPage.js';
import { SimulationResultsPage } from './pages/SimulationResultsPage.js';
import { ReportPage } from './pages/ReportPage.js';
import { SimulationResult, ScenarioInput } from './types/index.js';
import { fetchHealth, runSimulation } from './services/api.js';
import { generateClientSimulation } from './services/simulationEngine.js';

export const App: React.FC = () => {
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isLiveGemini, setIsLiveGemini] = useState<boolean>(true);

  const [simulationError, setSimulationError] = useState<string | null>(null);

  // Check backend health on initial mount
  useEffect(() => {
    async function init() {
      try {
        const health = await fetchHealth();
        setIsLiveGemini(health.isLiveGeminiAvailable);
      } catch (err: any) {
        console.warn('Backend initialization check error:', err?.message || err);
      }
    }
    init();
  }, []);

  const handleRunSimulation = async (input: ScenarioInput) => {
    setIsSimulating(true);
    setSimulationError(null);
    try {
      const result = await runSimulation(input);
      setSimulation(result);
      if (result.isLiveGemini) {
        setIsLiveGemini(true);
      }
    } catch (err: any) {
      console.error('Simulation error:', err);
      setSimulationError(err?.message || 'Failed to process simulation request.');
    } finally {
      // Small timeout to allow pipeline animation to complete smoothly
      setTimeout(() => {
        setIsSimulating(false);
      }, 3500);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
        <Navigation isLiveGemini={isLiveGemini} />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<DashboardPage currentSimulation={simulation} />}
            />
            <Route
              path="/new-simulation"
              element={<NewSimulationPage onSubmitSimulation={handleRunSimulation} isSimulating={isSimulating} />}
            />
            <Route
              path="/analysis"
              element={<SimulationResultsPage simulation={simulation} isSimulating={isSimulating} />}
            />
            <Route
              path="/cascading"
              element={<SimulationResultsPage simulation={simulation} isSimulating={isSimulating} />}
            />
            <Route
              path="/alternatives"
              element={<SimulationResultsPage simulation={simulation} isSimulating={isSimulating} />}
            />
            <Route path="/report" element={<ReportPage simulation={simulation} />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-700">Policy Impact Agent</span> — Simulate Before You Decide.
            </div>
            <div className="text-[11px] text-slate-400">
              Live Geographic Data • Live Gemini Analysis • Built with React, TypeScript & Gemini AI
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;

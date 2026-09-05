import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, PlusCircle, Network, Layers, FileText, LayoutDashboard, Cpu, Menu, X } from 'lucide-react';

interface NavigationProps {
  isLiveGemini: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ isLiveGemini }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/new-simulation', label: 'New Simulation', icon: PlusCircle },
    { path: '/analysis', label: 'Impact Overview', icon: Activity },
    { path: '/cascading', label: 'Cascading Chains', icon: Network },
    { path: '/alternatives', label: 'Alternatives & Compare', icon: Layers },
    { path: '/report', label: 'Decision Report', icon: FileText },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center min-w-0">
          <div className="flex items-center gap-5 min-w-0">
            {/* Collapsed Navigation Menu */}
            <div className="relative flex-shrink-0">
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="main-navigation-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {isMenuOpen && (
              <nav
                id="main-navigation-menu"
                className="absolute left-0 top-12 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
            </div>

            {/* Brand Logo & Title */}
            <Link to="/" className="flex items-center space-x-3 group min-w-0 flex-shrink-0">
              <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-lg tracking-tight whitespace-nowrap">Policy Impact Agent</span>
                </div>
                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Simulate Before You Decide.</p>
              </div>
            </Link>
          </div>

          {/* Status Badge: Live Gemini vs Demo Simulation Mode */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className={`hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${
              isLiveGemini
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`h-2 w-2 rounded-full animate-pulse ${isLiveGemini ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <Cpu className="h-3.5 w-3.5" />
              <span>{isLiveGemini ? 'Live Gemini Analysis' : 'Multi-Agent AI Engine'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

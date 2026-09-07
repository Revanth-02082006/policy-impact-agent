import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  PlusCircle,
  Network,
  Layers,
  FileText,
  LayoutDashboard,
  Cpu,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface NavigationProps {
  isLiveGemini: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ isLiveGemini }) => {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on route change or ESC key
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, desc: 'Executive overview & active policy impact' },
    { path: '/new-simulation', label: 'New Simulation', icon: PlusCircle, desc: 'Input proposed administrative decision' },
    { path: '/analysis', label: 'Impact Overview', icon: Activity, desc: 'Multi-agent domain assessment & scores' },
    { path: '/cascading', label: 'Cascading Chains', icon: Network, desc: 'Cause-and-effect sequential graph' },
    { path: '/alternatives', label: 'Alternatives & Compare', icon: Layers, desc: 'What-If strategy comparison matrix' },
    { path: '/report', label: 'Decision Report', icon: FileText, desc: 'Official printable executive briefing' },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left Margin: Hamburger button followed by Brand Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Hamburger Button Positioned on Left Margin */}
              <button
                type="button"
                aria-label={isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isDrawerOpen}
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Brand Logo & Title */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:from-blue-700 group-hover:to-indigo-800 transition-all">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                      Policy Impact Agent
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-600 text-white tracking-wider uppercase shadow-xs">
                      V2.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium hidden sm:block">
                    Government Policy Simulation Platform • Simulate Before You Decide
                  </p>
                </div>
              </Link>
            </div>

            {/* Right Side: Quick Action & Status Badge */}
            <div className="flex items-center space-x-3">
              <Link
                to="/new-simulation"
                className="hidden sm:inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Simulation</span>
              </Link>

              <div
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-2xs ${
                  isLiveGemini
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full animate-pulse ${
                    isLiveGemini ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                ></span>
                <Cpu className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">
                  {isLiveGemini ? 'Live Gemini AI' : 'Autonomous Multi-Agent Engine'}
                </span>
                <span className="xs:hidden">AI Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer from Left Margin */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Left Drawer Container */}
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-80 max-w-[85vw] bg-white shadow-2xl border-r border-slate-200 flex flex-col transform transition-transform ease-in-out duration-300">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-sm">Policy Impact Agent</h2>
                    <p className="text-[11px] text-slate-500 font-medium">Government Decision Support</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items List */}
              <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1.5">
                  Platform Views
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                          : 'text-slate-700 hover:text-blue-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate leading-tight">{item.label}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 flex-shrink-0 ${
                          isActive ? 'text-blue-600' : 'text-slate-300 group-hover:text-blue-500'
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Drawer Footer CTA */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
                <Link
                  to="/new-simulation"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Start New Simulation</span>
                </Link>
                <p className="text-[11px] text-slate-400 text-center font-medium">
                  Simulate Before You Decide • Tamil Nadu
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;

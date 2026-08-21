import React from 'react';
import { 
  ShieldCheck, 
  Download, 
  Terminal, 
  BookOpen, 
  Sparkles, 
  Server, 
  AlertTriangle,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'patching' | 'install' | 'terminal' | 'knowledge';
  setActiveTab: (tab: 'patching' | 'install' | 'terminal' | 'knowledge') => void;
  onOpenCopilot: () => void;
  criticalCveCount: number;
  securityPendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCopilot,
  criticalCveCount,
  securityPendingCount
}) => {
  return (
    <header className="bg-slate-950/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40 text-slate-200">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-13">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-2.5 cursor-pointer select-none" onClick={() => setActiveTab('patching')}>
            <div className="h-8 w-8 rounded-lg bg-indigo-600/90 flex items-center justify-center border border-indigo-400/30 text-white shadow-xs">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-white font-mono">SYSADMIN.OPS</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-mono border border-indigo-500/25">
                  v2.4 HIGH-DENSITY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block leading-none mt-0.5">
                Patch Lifecycle • Deployment Engine • Systemd Hardening • Interactive Labs
              </p>
            </div>
          </div>

          {/* Fleet Status Pill */}
          <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
              <Cpu className="h-3 w-3 text-slate-400" />
              <span>FLEET:</span>
            </div>
            {criticalCveCount > 0 ? (
              <span className="flex items-center space-x-1 text-amber-400 font-mono font-medium bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[11px]">
                <AlertTriangle className="h-3 w-3" />
                <span>{criticalCveCount} CRITICAL CVE</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400 font-mono font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                <CheckCircle2 className="h-3 w-3" />
                <span>0 CRITICAL</span>
              </span>
            )}
            {securityPendingCount > 0 && (
              <span className="text-slate-400 font-mono text-[11px]">
                • {securityPendingCount} updates
              </span>
            )}
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                activeTab === 'terminal'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title="Open Interactive Linux Terminal Lab"
            >
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">TERMINAL LAB</span>
            </button>

            <button
              onClick={onOpenCopilot}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 transition-colors shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>AI COPILOT</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('patching')}
            className={`flex items-center space-x-1.5 py-1.5 px-2.5 border-b-2 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'patching'
                ? 'border-indigo-400 text-indigo-300 font-semibold bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Server Patching Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('install')}
            className={`flex items-center space-x-1.5 py-1.5 px-2.5 border-b-2 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'install'
                ? 'border-indigo-400 text-indigo-300 font-semibold bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>App Installation & Deploy</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center space-x-1.5 py-1.5 px-2.5 border-b-2 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'terminal'
                ? 'border-indigo-400 text-indigo-300 font-semibold bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Interactive Server Labs</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center space-x-1.5 py-1.5 px-2.5 border-b-2 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'knowledge'
                ? 'border-indigo-400 text-indigo-300 font-semibold bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Runbooks & Cheat Sheets</span>
          </button>
        </div>
      </div>
    </header>
  );
};

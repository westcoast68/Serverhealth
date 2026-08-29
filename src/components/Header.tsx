import React, { useState } from 'react';
import { 
  Cloud, 
  Target, 
  Layers, 
  Timer, 
  Bot, 
  Flame, 
  DollarSign, 
  RotateCcw, 
  Download, 
  Upload,
  CheckCircle,
  AlertTriangle,
  Award
} from 'lucide-react';
import { UserProgressState } from '../types';
import { computeOverallExamReadiness } from '../utils/adaptiveEngine';

export type ActiveTab = 'dashboard' | 'quiz' | 'flashcards' | 'exam' | 'copilot';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userState: UserProgressState;
  onOpenBudgetModal: () => void;
  onResetProgress: () => void;
  onExportProgress: () => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  userState,
  onOpenBudgetModal,
  onResetProgress,
  onExportProgress
}) => {
  const readiness = computeOverallExamReadiness(userState);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Adaptive Plan & Diagnostics', icon: <Target className="w-4 h-4" /> },
    { id: 'quiz', label: 'Gap Quizzes', icon: <Layers className="w-4 h-4" />, badge: 'Weakest First' },
    { id: 'flashcards', label: 'Spaced Flashcards', icon: <Cloud className="w-4 h-4" /> },
    { id: 'exam', label: 'Timed Mock Exam', icon: <Timer className="w-4 h-4" /> },
    { id: 'copilot', label: 'AWS Architect AI', icon: <Bot className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Cloud className="w-6 h-6 text-slate-950 font-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-base text-slate-100 tracking-tight">
                    AWS <span className="text-amber-400">Core Mastery</span>
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Adaptive AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                  EC2 • S3 • VPC • RDS • IAM • CloudWatch
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-3">
            {/* Live Readiness Meter */}
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 cursor-pointer hover:border-slate-600 transition-colors"
              title="AWS Passing Benchmark is 720/1000"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Readiness:</span>
                  <span className="font-bold font-mono text-slate-100">{readiness.score} / 1000</span>
                  <span 
                    className="text-[10px] font-semibold px-1.5 py-0.2 rounded"
                    style={{ backgroundColor: `${readiness.color}20`, color: readiness.color }}
                  >
                    {readiness.verdict}
                  </span>
                </div>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>{userState.dailyStreak}d Streak</span>
            </div>

            {/* Tool & Budget Breakdown Button */}
            <button
              onClick={onOpenBudgetModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all hover:scale-[1.02]"
              title="View why this stack was chosen and the budget analysis"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Budget & Stack Guide</span>
            </button>

            {/* Options Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Data & Progress Settings"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {showSettingsDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase">
                    Session & Data
                  </div>
                  <button
                    onClick={() => {
                      onExportProgress();
                      setShowSettingsDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    Export Progress (JSON)
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Reset your mastery scores and study history back to initial diagnostic state?')) {
                        onResetProgress();
                      }
                      setShowSettingsDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    Reset Diagnostic Scores
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/60">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { X, Search, Radar, Compass, Sparkles, Filter, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { AWS_RADAR_LEXICON, RadarLexiconEntry, RADAR_CATEGORY_META } from '../../utils/keywordRadar';
import { AwsService } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrigger?: (triggerText: string) => void;
}

export const RadarLexiconModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<AwsService | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredEntries = AWS_RADAR_LEXICON.filter(entry => {
    if (selectedService !== 'all' && entry.service !== selectedService) return false;
    if (selectedCategory !== 'all' && entry.category !== selectedCategory) return false;
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      entry.triggerPhrase.toLowerCase().includes(query) ||
      entry.deducedArchitecture.toLowerCase().includes(query) ||
      entry.examExplanation.toLowerCase().includes(query) ||
      entry.distractorTrap.toLowerCase().includes(query)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-100 font-display">AWS Exam Keyword Radar Lexicon</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                  Exam Decoder
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Master the architectural trigger phrases that instantly reveal the correct answer on AWS exams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search triggers, services, traps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Service Filter */}
            <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 text-xs">
              {(['all', 'EC2', 'Lambda', 'ECS'] as const).map((svc) => (
                <button
                  key={svc}
                  onClick={() => setSelectedService(svc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedService === svc
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {svc === 'all' ? 'All Services' : svc}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              <option value="constraint">🎯 Constraint / Goal</option>
              <option value="workload">⚡ Workload Pattern</option>
              <option value="architecture">🏛️ Architecture Anchor</option>
            </select>
          </div>
        </div>

        {/* Radar Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEntries.map((entry, idx) => {
              const meta = RADAR_CATEGORY_META[entry.category] || RADAR_CATEGORY_META.constraint;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${meta.badgeClass}`}>
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                        {entry.service}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                      &ldquo;{entry.triggerPhrase}&rdquo;
                    </h4>

                    {/* Deduced Solution */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-200">Deduced Architecture: </span>
                        <span>{entry.deducedArchitecture}</span>
                      </div>
                    </div>

                    {/* Exam Explanation */}
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {entry.examExplanation}
                    </p>
                  </div>

                  {/* Distractor Trap Warning */}
                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300/90 flex items-start gap-2 pt-2 border-t border-slate-800/60">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-200">Exam Trap: </span>
                      <span>{entry.distractorTrap}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Compass className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-medium">No radar signals match your filter.</p>
              <p className="text-xs text-slate-500">Try clearing your search query or selecting All Services.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Keyword Radar decodes the implicit hints embedded in AWS scenario questions.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all"
          >
            Close Lexicon
          </button>
        </div>
      </div>
    </div>
  );
};

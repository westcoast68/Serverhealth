import React, { useState, useMemo } from 'react';
import { Radar, ChevronDown, ChevronUp, Sparkles, BookOpen, AlertCircle, Info, X } from 'lucide-react';
import { QuizQuestion, KeywordRadarSignal } from '../../types';
import { scanQuestionRadar, parseRadarSegments, RADAR_CATEGORY_META } from '../../utils/keywordRadar';
import { RadarLexiconModal } from './RadarLexiconModal';

interface Props {
  question: QuizQuestion;
  radarEnabled: boolean;
  onToggleRadar: () => void;
}

export const QuestionScenarioRadar: React.FC<Props> = ({
  question,
  radarEnabled,
  onToggleRadar
}) => {
  const [activeSignal, setActiveSignal] = useState<KeywordRadarSignal | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLexiconOpen, setIsLexiconOpen] = useState<boolean>(false);

  // Scan signals for this question
  const signals = useMemo(() => {
    return scanQuestionRadar(question);
  }, [question]);

  // Parse scenario text into text chunks + highlighted signals
  const segments = useMemo(() => {
    if (!radarEnabled || signals.length === 0) {
      return [{ text: question.scenario }];
    }
    return parseRadarSegments(question.scenario, signals);
  }, [question.scenario, signals, radarEnabled]);

  return (
    <div className="space-y-3">
      {/* Radar Control Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleRadar}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              radarEnabled
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Keyword Radar to highlight exam decision pivot words"
          >
            <Radar className={`w-3.5 h-3.5 ${radarEnabled ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Keyword Radar: <strong className={radarEnabled ? 'text-amber-300' : 'text-slate-400'}>{radarEnabled ? 'ON' : 'OFF'}</strong></span>
          </button>

          {radarEnabled && signals.length > 0 && (
            <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>{signals.length} {signals.length === 1 ? 'signal' : 'signals'} locked</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {radarEnabled && signals.length > 0 && (
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 transition-colors px-2 py-1 rounded-lg hover:bg-amber-500/10"
            >
              <span>{isDrawerOpen ? 'Hide Signal Feed' : 'View Signal Feed'}</span>
              {isDrawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={() => setIsLexiconOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            title="Browse all AWS Compute Exam trigger words"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Exam Decoder</span>
          </button>
        </div>
      </div>

      {/* Scenario Text with Interactive Highlight Nodes */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 leading-relaxed font-sans relative">
        <h3 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
          {segments.map((seg, i) => {
            if (!seg.signal || !radarEnabled) {
              return <span key={i}>{seg.text}</span>;
            }

            const meta = RADAR_CATEGORY_META[seg.signal.category] || RADAR_CATEGORY_META.constraint;
            const isCurrentActive = activeSignal?.keyword === seg.signal.keyword;

            return (
              <span
                key={i}
                onClick={() => setActiveSignal(isCurrentActive ? null : seg.signal!)}
                className={`inline-block relative group ${meta.highlightClass} ${
                  isCurrentActive ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950' : ''
                }`}
                title="Click to view Radar Signal details"
              >
                <span>{seg.text}</span>
                <span className="ml-1 text-[10px] opacity-75">{meta.icon}</span>
              </span>
            );
          })}
        </h3>

        {/* Selected Keyword Popover */}
        {activeSignal && radarEnabled && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-xl space-y-2 relative animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                  RADAR_CATEGORY_META[activeSignal.category]?.badgeClass
                }`}>
                  <span>{RADAR_CATEGORY_META[activeSignal.category]?.icon}</span>
                  <span>{RADAR_CATEGORY_META[activeSignal.category]?.label}</span>
                </span>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  &ldquo;{activeSignal.keyword}&rdquo;
                </span>
              </div>
              <button
                onClick={() => setActiveSignal(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-amber-200">Exam Radar Implication: </strong>
              {activeSignal.meaning}
            </p>

            {activeSignal.targetConcept && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Points directly toward: <strong className="text-emerald-300 font-mono">{activeSignal.targetConcept}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expandable Radar Signal Scanner Drawer */}
      {radarEnabled && isDrawerOpen && signals.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Radar className="w-4 h-4 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
              <span>Question Keyword Radar Findings ({signals.length})</span>
            </div>
            <span className="text-[10px] text-slate-400">Exam Decision Matrix</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {signals.map((sig, idx) => {
              const meta = RADAR_CATEGORY_META[sig.category] || RADAR_CATEGORY_META.constraint;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveSignal(sig)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-200 truncate font-mono">
                      {meta.icon} {sig.keyword}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${meta.badgeClass}`}>
                      {sig.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {sig.meaning}
                  </p>
                  {sig.targetConcept && (
                    <div className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span>➔ {sig.targetConcept}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Radar Lexicon Modal */}
      <RadarLexiconModal
        isOpen={isLexiconOpen}
        onClose={() => setIsLexiconOpen(false)}
      />
    </div>
  );
};

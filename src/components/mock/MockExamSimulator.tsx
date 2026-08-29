import React, { useState, useEffect, useMemo } from 'react';
import { 
  Timer, 
  Flag, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Layers, 
  ShieldCheck, 
  Play,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, UserProgressState, AwsDomain, AwsService } from '../../types';
import { INITIAL_QUIZ_QUESTIONS, AWS_DOMAINS, AWS_SERVICES_META } from '../../data/awsData';
import { updateMasteryOnQuizAnswer, computeGapWeight } from '../../utils/adaptiveEngine';

interface Props {
  userState: UserProgressState;
  onUpdateState: (newState: UserProgressState) => void;
}

export const MockExamSimulator: React.FC<Props> = ({ userState, onUpdateState }) => {
  const [examStatus, setExamStatus] = useState<'config' | 'in-progress' | 'completed'>('config');
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(20);
  const [adaptiveBiasing, setAdaptiveBiasing] = useState<boolean>(true);

  // Active Exam state
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20 * 60);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Exam Result state
  const [examResult, setExamResult] = useState<{
    scaledScore: number;
    percentage: number;
    isPass: boolean;
    correctCount: number;
    domainBreakdown: Record<AwsDomain, { total: number; correct: number; percentage: number }>;
  } | null>(null);

  // Timer Countdown Effect
  useEffect(() => {
    let timer: any = null;
    if (examStatus === 'in-progress' && !isTimerPaused && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examStatus, isTimerPaused, secondsRemaining]);

  const handleStartExam = () => {
    let pool = [...INITIAL_QUIZ_QUESTIONS];

    if (adaptiveBiasing) {
      // Prioritize questions from weaker services
      pool.sort((a, b) => {
        const statsA = userState.services[a.service];
        const statsB = userState.services[b.service];
        const gapA = statsA ? computeGapWeight(statsA) : 50;
        const gapB = statsB ? computeGapWeight(statsB) : 50;
        return gapB - gapA;
      });
    }

    const selected = pool.slice(0, questionCount);
    setExamQuestions(selected);
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentIndex(0);
    setSecondsRemaining(timeLimitMinutes * 60);
    setExamStatus('in-progress');
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleFinishExam = () => {
    let correct = 0;
    const domainMap: Record<AwsDomain, { total: number; correct: number; percentage: number }> = {
      compute: { total: 0, correct: 0, percentage: 0 },
      storage: { total: 0, correct: 0, percentage: 0 },
      networking: { total: 0, correct: 0, percentage: 0 },
      database: { total: 0, correct: 0, percentage: 0 },
      security: { total: 0, correct: 0, percentage: 0 },
      management: { total: 0, correct: 0, percentage: 0 },
    };

    let updatedState = { ...userState };

    examQuestions.forEach(q => {
      const chosen = userAnswers[q.id];
      const isCorrect = chosen === q.correctOptionId;
      if (isCorrect) correct += 1;

      if (domainMap[q.domain]) {
        domainMap[q.domain].total += 1;
        if (isCorrect) domainMap[q.domain].correct += 1;
      }

      // Update student's mastery profile
      updatedState = updateMasteryOnQuizAnswer(
        updatedState,
        q.service,
        isCorrect,
        isCorrect ? undefined : `Exam error: selected (${chosen}) instead of (${q.correctOptionId})`
      );
    });

    Object.keys(domainMap).forEach(d => {
      const item = domainMap[d as AwsDomain];
      item.percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 100;
    });

    const percentage = Math.round((correct / examQuestions.length) * 100);
    const scaledScore = Math.round(100 + (percentage / 100) * 900); // 100 - 1000 scale
    const isPass = scaledScore >= 720;

    setExamResult({
      scaledScore,
      percentage,
      isPass,
      correctCount: correct,
      domainBreakdown: domainMap
    });

    onUpdateState(updatedState);
    setExamStatus('completed');

    if (isPass) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const currentQ = examQuestions[currentIndex];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. CONFIGURATION VIEW */}
      {examStatus === 'config' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 font-display">AWS Core Fundamentals Mock Exam Simulator</h2>
              <p className="text-xs text-slate-400">Timed exam environment with real-time scaled scoring (Pass = 720/1000)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Question Count:</label>
              <div className="grid grid-cols-3 gap-3">
                {[10, 15, 25].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => { setQuestionCount(cnt); setTimeLimitMinutes(cnt === 10 ? 12 : cnt === 15 ? 20 : 30); }}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      questionCount === cnt ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20' : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Time Allowed:</span>
                <span className="text-xs font-mono font-bold text-amber-400">{timeLimitMinutes} Minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Passing Score:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">720 / 1000 (72%)</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Gap-Targeted Adaptive Biasing:
                </span>
                <button
                  onClick={() => setAdaptiveBiasing(!adaptiveBiasing)}
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    adaptiveBiasing ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {adaptiveBiasing ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Launch Timed Exam Session</span>
          </button>
        </div>
      )}

      {/* 2. IN-PROGRESS EXAM VIEW */}
      {examStatus === 'in-progress' && currentQ && (
        <div className="space-y-6">
          {/* Top Exam Header & Timer */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                {currentQ.service}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Question {currentIndex + 1} of {examQuestions.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-bold text-sm ${
                secondsRemaining < 180 ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}>
                <Timer className="w-4 h-4 text-amber-400" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              {/* Flag Toggle */}
              <button
                onClick={() => handleToggleFlag(currentQ.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  flaggedQuestions.has(currentQ.id) ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flaggedQuestions.has(currentQ.id) ? 'Flagged' : 'Flag'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Finish and submit your exam now?')) {
                    handleFinishExam();
                  }
                }}
                className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Question Navigator Drawer */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2 overflow-x-auto">
            {examQuestions.map((q, idx) => {
              const isAnswered = !!userAnswers[q.id];
              const isFlagged = flaggedQuestions.has(q.id);
              const isCurrent = currentIndex === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 border transition-all ${
                    isCurrent ? 'border-amber-400 ring-2 ring-amber-400/40 text-slate-100' : 'border-slate-800'
                  } ${
                    isFlagged ? 'bg-amber-500/30 text-amber-300' :
                    isAnswered ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <h3 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed font-sans">
              {currentQ.scenario}
            </h3>

            <div className="space-y-3 pt-2">
              {currentQ.options.map(opt => {
                const isSelected = userAnswers[currentQ.id] === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected ? 'bg-amber-500/10 border-amber-500 text-amber-100 shadow-md shadow-amber-500/10' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 ${
                      isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {opt.id}
                    </div>
                    <div className="text-sm leading-relaxed pt-0.5 flex-1">{opt.text}</div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < examQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (confirm('Finish and submit exam?')) handleFinishExam();
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  Submit All Answers
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. POST-EXAM RESULTS VIEW */}
      {examStatus === 'completed' && examResult && (
        <div className="space-y-6">
          {/* Hero Results Banner */}
          <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 ${
            examResult.isPass ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${examResult.isPass ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 font-display">
                    {examResult.isPass ? '🎉 PASS — AWS Exam Ready!' : '⚠️ Below Passing Threshold'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Official AWS passing scaled score is 720/1000
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-slate-100">
                  {examResult.scaledScore} <span className="text-sm font-normal text-slate-400">/ 1000</span>
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  {examResult.correctCount} of {examQuestions.length} correct ({examResult.percentage}%)
                </div>
              </div>
            </div>

            {/* Domain Breakdown Cards */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Domain Performance Breakdown:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.keys(examResult.domainBreakdown) as AwsDomain[]).map(d => {
                  const stat = examResult.domainBreakdown[d];
                  if (stat.total === 0) return null;
                  return (
                    <div key={d} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-300 capitalize">
                        <span>{d}</span>
                        <span className="font-mono">{stat.percentage}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${stat.percentage}%`,
                            backgroundColor: stat.percentage >= 70 ? '#10B981' : stat.percentage >= 50 ? '#F59E0B' : '#EF4444'
                          }} 
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {stat.correct} / {stat.total} questions
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-400">
                Your real-time mastery profile has been updated with these results.
              </span>
              <button
                onClick={() => setExamStatus('config')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Start Another Simulation
              </button>
            </div>
          </div>

          {/* Question Review List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 font-display">Detailed Question Review</h3>
            {examQuestions.map((q, idx) => {
              const chosen = userAnswers[q.id];
              const isCorrect = chosen === q.correctOptionId;

              return (
                <div key={q.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-amber-400">{q.service}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Incorrect (Chose {chosen || 'None'})
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-sans">{q.scenario}</p>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <div className="font-bold text-emerald-400">
                      Correct Answer: Option {q.correctOptionId}
                    </div>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

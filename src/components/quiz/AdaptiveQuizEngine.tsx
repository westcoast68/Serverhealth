import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RefreshCw, 
  ArrowRight, 
  HelpCircle, 
  Bookmark, 
  Share2, 
  Flame, 
  AlertTriangle, 
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Lightbulb,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, UserProgressState, AwsDomain, AwsService } from '../../types';
import { INITIAL_QUIZ_QUESTIONS, AWS_DOMAINS, AWS_SERVICES_META } from '../../data/awsData';
import { updateMasteryOnQuizAnswer, computeGapWeight } from '../../utils/adaptiveEngine';

interface Props {
  userState: UserProgressState;
  onUpdateState: (newState: UserProgressState) => void;
  initialServiceFilter?: AwsService | null;
}

export const AdaptiveQuizEngine: React.FC<Props> = ({
  userState,
  onUpdateState,
  initialServiceFilter
}) => {
  const [selectedDomain, setSelectedDomain] = useState<AwsDomain | 'all'>('all');
  const [selectedService, setSelectedService] = useState<AwsService | 'all'>(initialServiceFilter || 'all');
  const [adaptiveMode, setAdaptiveMode] = useState<boolean>(!initialServiceFilter);

  // Question pool combining built-in and generated
  const [questionPool, setQuestionPool] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [feedbackDelta, setFeedbackDelta] = useState<{ service: AwsService; isCorrect: boolean; oldScore: number; newScore: number } | null>(null);

  // AI Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [customFocusPrompt, setCustomFocusPrompt] = useState<string>('');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // Filtered and Sequenced Questions
  const sequencedQuestions = useMemo(() => {
    let list = [...questionPool];

    // Filter by domain
    if (selectedDomain !== 'all') {
      list = list.filter(q => q.domain === selectedDomain);
    }

    // Filter by service
    if (selectedService !== 'all') {
      list = list.filter(q => q.service === selectedService);
    }

    // If Adaptive Mode is ON, sort by user's highest gap weight first!
    if (adaptiveMode && selectedService === 'all') {
      list.sort((a, b) => {
        const statsA = userState.services[a.service];
        const statsB = userState.services[b.service];
        const gapA = statsA ? computeGapWeight(statsA) : 50;
        const gapB = statsB ? computeGapWeight(statsB) : 50;
        return gapB - gapA; // Highest gap weight first
      });
    }

    return list;
  }, [questionPool, selectedDomain, selectedService, adaptiveMode, userState]);

  const currentQuestion: QuizQuestion | undefined = sequencedQuestions[currentIndex] || sequencedQuestions[0];

  const handleSelectOption = (optId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !currentQuestion || isAnswerSubmitted) return;

    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    setIsAnswerSubmitted(true);

    const prevScore = userState.services[currentQuestion.service]?.masteryScore || 50;
    
    // Update mastery score in real time
    const mistakeText = isCorrect ? undefined : `Selected (${selectedOptionId}) instead of correct (${currentQuestion.correctOptionId}): ${currentQuestion.explanation.slice(0, 100)}`;
    const updated = updateMasteryOnQuizAnswer(userState, currentQuestion.service, isCorrect, mistakeText);
    onUpdateState(updated);

    const newScore = updated.services[currentQuestion.service]?.masteryScore || 50;
    setFeedbackDelta({
      service: currentQuestion.service,
      isCorrect,
      oldScore: prevScore,
      newScore
    });

    if (isCorrect) {
      if ((updated.services[currentQuestion.service]?.streak || 0) % 3 === 0) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setFeedbackDelta(null);

    if (currentIndex < sequencedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // loop or finish
    }
  };

  const handleGenerateAiQuestions = async (targetSvc?: AwsService) => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const targetServices = targetSvc ? [targetSvc] : [currentQuestion?.service || 'VPC', 'EFS', 'KMS'];
      const response = await fetch('/api/aws/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetServices,
          count: 3,
          difficulty: 'Associate',
          focusNotes: customFocusPrompt || `Focus specifically on common misconceptions and edge cases for ${targetServices.join(', ')}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz questions from Gemini AI');
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        const marked = data.questions.map((q: QuizQuestion, idx: number) => ({
          ...q,
          id: `ai-gen-${Date.now()}-${idx}`,
          isAiGenerated: true
        }));
        setQuestionPool(prev => [...marked, ...prev]);
        setShowAiModal(false);
        setCustomFocusPrompt('');
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setIsAnswerSubmitted(false);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error generating AI questions');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const currentServiceMeta = currentQuestion ? AWS_SERVICES_META[currentQuestion.service] : null;
  const currentServiceStats = currentQuestion ? userState.services[currentQuestion.service] : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Controls & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Adaptive Mode Toggle */}
          <button
            onClick={() => setAdaptiveMode(!adaptiveMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              adaptiveMode
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Automatically puts questions from your weakest AWS services first"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Weakest-First Adaptive: {adaptiveMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value as any);
              setSelectedService('all');
              setCurrentIndex(0);
              setIsAnswerSubmitted(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Domains (6)</option>
            {Object.keys(AWS_DOMAINS).map(d => (
              <option key={d} value={d}>{AWS_DOMAINS[d as AwsDomain].name}</option>
            ))}
          </select>

          {/* Service Filter */}
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value as any);
              setCurrentIndex(0);
              setIsAnswerSubmitted(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Services (14)</option>
            {Object.keys(AWS_SERVICES_META).map(s => (
              <option key={s} value={s}>{s} ({AWS_SERVICES_META[s as AwsService].domain})</option>
            ))}
          </select>
        </div>

        {/* Generate AI Questions Button */}
        <button
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/90 hover:bg-purple-500 text-slate-100 text-xs font-semibold transition-all shadow-md shadow-purple-600/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-200" />
          <span>Generate AI Gap Questions</span>
        </button>
      </div>

      {/* Question Card */}
      {currentQuestion ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Top Question Meta & Real-time Gap Badge */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                {currentQuestion.service}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                {currentQuestion.domain}
              </span>
              {currentQuestion.isAiGenerated && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Gemini 3.7 AI
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>Current Mastery:</span>
                <span className={`font-mono font-bold ${
                  (currentServiceStats?.masteryScore || 0) < 40 ? 'text-rose-400' :
                  (currentServiceStats?.masteryScore || 0) < 70 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {currentServiceStats?.masteryScore || 50}%
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 font-mono">
                Question {currentIndex + 1} of {sequencedQuestions.length}
              </span>
            </div>
          </div>

          {/* Scenario Text */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed font-sans">
              {currentQuestion.scenario}
            </h3>
          </div>

          {/* 4 Options List */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = option.id === currentQuestion.correctOptionId;
              
              let cardStyle = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-200';
              let badgeStyle = 'bg-slate-800 text-slate-300';

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  cardStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-500/10';
                  badgeStyle = 'bg-emerald-500 text-slate-950 font-bold';
                } else if (isSelected && !isCorrect) {
                  cardStyle = 'bg-rose-950/30 border-rose-500 text-rose-200 shadow-md shadow-rose-500/10';
                  badgeStyle = 'bg-rose-500 text-slate-100 font-bold';
                } else {
                  cardStyle = 'bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                cardStyle = 'bg-amber-500/10 border-amber-500 text-amber-100 shadow-md shadow-amber-500/10';
                badgeStyle = 'bg-amber-500 text-slate-950 font-bold';
              }

              return (
                <div
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${cardStyle}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 transition-colors ${badgeStyle}`}>
                    {option.id}
                  </div>
                  <div className="text-sm font-normal leading-relaxed pt-0.5 flex-1">
                    {option.text}
                  </div>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-1" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar (Submit or Next) */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              {currentQuestion.tags && currentQuestion.tags.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  #{t}
                </span>
              ))}
            </div>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOptionId}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                Confirm & Check Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Detailed Explanations & Why Other Options Failed (shown after submit) */}
          {isAnswerSubmitted && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-300">
              {/* Real-time Mastery Feedback Toast */}
              {feedbackDelta && (
                <div className={`p-3 rounded-lg flex items-center justify-between text-xs font-semibold ${
                  feedbackDelta.isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {feedbackDelta.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                    <span>{feedbackDelta.isCorrect ? 'Correct! Real-time mastery adjusted:' : 'Incorrect. Real-time gap registered:'}</span>
                  </div>
                  <span className="font-mono font-bold">
                    {feedbackDelta.service}: {feedbackDelta.oldScore}% → {feedbackDelta.newScore}% ({feedbackDelta.isCorrect ? '+8%' : '-5%'})
                  </span>
                </div>
              )}

              {/* Core Explanation */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Correct Architectural Explanation:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-5">
                  {currentQuestion.explanation}
                </p>
              </div>

              {/* Architecture Pro-Tip */}
              {currentQuestion.architectureTip && (
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Lightbulb className="w-4 h-4" />
                    <span>AWS Solutions Architect Pro-Tip:</span>
                  </div>
                  <p className="leading-relaxed pl-5">{currentQuestion.architectureTip}</p>
                </div>
              )}

              {/* Why Other Options Failed */}
              {currentQuestion.whyWrong && Object.keys(currentQuestion.whyWrong).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Why the other options are wrong:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(currentQuestion.whyWrong).map(([optKey, reason]) => (
                      <div key={optKey} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                        <strong className="text-rose-400 font-mono mr-2">Option {optKey}:</strong>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Info className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No questions found matching your filter</h3>
          <p className="text-xs text-slate-400">Try selecting "All Domains" or generate custom questions with Gemini 3.7 AI.</p>
          <button
            onClick={() => { setSelectedDomain('all'); setSelectedService('all'); }}
            className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* AI Quiz Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-display">Generate Custom AWS Scenario Questions</h3>
                <p className="text-xs text-slate-400">Powered by Gemini 3.7 Flash with structured exam schemas</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Target Service or Topic Focus:
                </label>
                <input
                  type="text"
                  value={customFocusPrompt}
                  onChange={(e) => setCustomFocusPrompt(e.target.value)}
                  placeholder="e.g. VPC NAT Gateways vs Gateway Endpoints, DynamoDB DAX vs ElastiCache"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {aiError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAiModal(false)}
                disabled={isGeneratingAi}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerateAiQuestions(currentQuestion?.service)}
                disabled={isGeneratingAi}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-slate-100 font-bold text-xs transition-all shadow-md shadow-purple-600/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAi ? 'Generating via Gemini...' : 'Generate 3 Questions'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

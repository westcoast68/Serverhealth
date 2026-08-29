import React, { useState, useMemo } from 'react';
import { 
  Cloud, 
  RotateCw, 
  Sparkles, 
  Check, 
  X, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Layers, 
  Bookmark, 
  Zap, 
  RefreshCw,
  Lightbulb,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard, UserProgressState, AwsDomain, AwsService } from '../../types';
import { INITIAL_FLASHCARDS, AWS_DOMAINS, AWS_SERVICES_META } from '../../data/awsData';
import { updateMasteryOnCardRating, computeGapWeight } from '../../utils/adaptiveEngine';

interface Props {
  userState: UserProgressState;
  onUpdateState: (newState: UserProgressState) => void;
  initialServiceFilter?: AwsService | null;
}

export const SpacedFlashcardDeck: React.FC<Props> = ({
  userState,
  onUpdateState,
  initialServiceFilter
}) => {
  const [selectedDomain, setSelectedDomain] = useState<AwsDomain | 'all'>('all');
  const [selectedService, setSelectedService] = useState<AwsService | 'all'>(initialServiceFilter || 'all');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cardPool, setCardPool] = useState<Flashcard[]>(INITIAL_FLASHCARDS);

  // AI Generator state
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiFocusTopic, setAiFocusTopic] = useState<string>('');
  const [aiError, setAiError] = useState<string | null>(null);

  const filteredCards = useMemo(() => {
    let list = [...cardPool];
    if (selectedDomain !== 'all') {
      list = list.filter(c => c.domain === selectedDomain);
    }
    if (selectedService !== 'all') {
      list = list.filter(c => c.service === selectedService);
    }

    // Sort weakest service cards first
    list.sort((a, b) => {
      const statsA = userState.services[a.service];
      const statsB = userState.services[b.service];
      const gapA = statsA ? computeGapWeight(statsA) : 50;
      const gapB = statsB ? computeGapWeight(statsB) : 50;
      return gapB - gapA;
    });

    return list;
  }, [cardPool, selectedDomain, selectedService, userState]);

  const currentCard: Flashcard | undefined = filteredCards[currentIndex] || filteredCards[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRateCard = (rating: 'again' | 'hard' | 'good' | 'mastered') => {
    if (!currentCard) return;

    const updated = updateMasteryOnCardRating(userState, currentCard.service, rating);
    onUpdateState(updated);

    if (rating === 'mastered') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    // Move to next card
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleGenerateAiFlashcards = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const targetServices = currentCard ? [currentCard.service] : ['EBS', 'EFS', 'VPC', 'KMS'];
      const response = await fetch('/api/aws/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetServices,
          count: 4,
          focusTopic: aiFocusTopic || 'Contrasting similar AWS services, hard limits, and security traps'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI flashcards');
      }

      const data = await response.json();
      if (data.flashcards && Array.isArray(data.flashcards)) {
        const marked = data.flashcards.map((c: Flashcard, idx: number) => ({
          ...c,
          id: `ai-fc-${Date.now()}-${idx}`
        }));
        setCardPool(prev => [...marked, ...prev]);
        setShowAiModal(false);
        setAiFocusTopic('');
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error generating AI flashcards');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const currentServiceStats = currentCard ? userState.services[currentCard.service] : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Filter and Top Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDomain}
            onChange={(e) => {
              setSelectedDomain(e.target.value as any);
              setSelectedService('all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium focus:outline-none"
          >
            <option value="all">All Domains (6)</option>
            {Object.keys(AWS_DOMAINS).map(d => (
              <option key={d} value={d}>{AWS_DOMAINS[d as AwsDomain].name}</option>
            ))}
          </select>

          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value as any);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium focus:outline-none"
          >
            <option value="all">All Services (14)</option>
            {Object.keys(AWS_SERVICES_META).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/90 hover:bg-purple-500 text-slate-100 text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate AI Flashcards</span>
        </button>
      </div>

      {/* Main Flashcard Container */}
      {currentCard ? (
        <div className="space-y-4">
          <div 
            onClick={handleFlip}
            className="min-h-[380px] p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between cursor-pointer select-none hover:border-slate-700 transition-all duration-300 relative group"
          >
            {/* Card Top Meta */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {currentCard.service}
                </span>
                <span className="text-xs uppercase font-medium text-slate-400">
                  {currentCard.domain}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Card {currentIndex + 1} of {filteredCards.length}</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-bold">
                  {currentServiceStats?.masteryScore || 50}% Mastery
                </span>
              </div>
            </div>

            {/* Card Content (Front or Back) */}
            <div className="py-8 flex-1 flex flex-col justify-center">
              {!isFlipped ? (
                <div className="space-y-4 text-center">
                  <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    Active Recall Question
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-display leading-snug">
                    {currentCard.front}
                  </h3>
                  <p className="text-xs text-slate-400 pt-4 flex items-center justify-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
                    Click anywhere on card to reveal answer & architecture nuance
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block">
                    Architectural Answer & Distinction
                  </span>
                  <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                    {currentCard.back}
                  </div>

                  {currentCard.examGotcha && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 block mb-0.5">Exam Trap / Gotcha:</strong>
                        <span>{currentCard.examGotcha}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer Indicator */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">
                {currentCard.architectureContext || 'AWS Core Fundamentals'}
              </span>
              <span className="text-amber-400/80 font-medium">
                {isFlipped ? 'Tap card to flip back' : 'Tap card to reveal'}
              </span>
            </div>
          </div>

          {/* Self-Rating Leitner Controls (Shown when card is flipped) */}
          {isFlipped ? (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 animate-in fade-in duration-200">
              <div className="text-center text-xs font-semibold text-slate-400 mb-2">
                Rate your recall to update real-time domain mastery:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleRateCard('again')}
                  className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors flex flex-col items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>Again</span>
                  <span className="text-[10px] text-rose-400/80 font-normal">Need Review (-6%)</span>
                </button>

                <button
                  onClick={() => handleRateCard('hard')}
                  className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors flex flex-col items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Hard</span>
                  <span className="text-[10px] text-amber-400/80 font-normal">Struggled (+2%)</span>
                </button>

                <button
                  onClick={() => handleRateCard('good')}
                  className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold transition-colors flex flex-col items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Good</span>
                  <span className="text-[10px] text-blue-400/80 font-normal">Solid Recall (+5%)</span>
                </button>

                <button
                  onClick={() => handleRateCard('mastered')}
                  className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors flex flex-col items-center gap-1"
                >
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Mastered</span>
                  <span className="text-[10px] text-emerald-400/80 font-normal">Instant Recall (+9%)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(prev => Math.max(0, prev - 1));
                }}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Card</span>
              </button>

              <button
                onClick={handleFlip}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
              >
                Reveal Answer
              </button>

              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(prev => (prev + 1) % filteredCards.length);
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
              >
                <span>Skip</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <HelpCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No flashcards match this filter</h3>
          <button
            onClick={() => { setSelectedDomain('all'); setSelectedService('all'); }}
            className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* AI Flashcard Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-display">Generate AWS Contrast Flashcards</h3>
                <p className="text-xs text-slate-400">Targeting trade-offs, limits, and traps with Gemini 3.7 Flash</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Specific Comparison / Topic Focus:
                </label>
                <input
                  type="text"
                  value={aiFocusTopic}
                  onChange={(e) => setAiFocusTopic(e.target.value)}
                  placeholder="e.g. S3 Storage Class Durability vs Retrieval times, EBS vs EFS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {aiError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
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
                onClick={handleGenerateAiFlashcards}
                disabled={isGeneratingAi}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-slate-100 font-bold text-xs transition-all shadow-md shadow-purple-600/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAi ? 'Generating Cards...' : 'Generate 4 Cards'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

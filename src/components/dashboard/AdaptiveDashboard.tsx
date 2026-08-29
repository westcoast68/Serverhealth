import React, { useState } from 'react';
import { 
  Target, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  ShieldAlert, 
  BookOpen, 
  Clock, 
  Flame, 
  Award,
  RefreshCw,
  Server,
  HardDrive,
  Network,
  Database,
  Shield,
  FileSearch,
  ExternalLink
} from 'lucide-react';
import { UserProgressState, AwsDomain, AwsService, AiDiagnosticReport, StudyPlanItem } from '../../types';
import { 
  computeDomainStats, 
  getRankedWeakestServices, 
  generateAdaptiveStudyPlan, 
  computeOverallExamReadiness 
} from '../../utils/adaptiveEngine';
import { AWS_DOMAINS, AWS_SERVICES_META } from '../../data/awsData';
import { ActiveTab } from '../Header';
import { ProgressTrajectoryChart } from './ProgressTrajectoryChart';

interface Props {
  userState: UserProgressState;
  onNavigateToQuiz: (serviceFilter?: AwsService) => void;
  onNavigateToFlashcards: (serviceFilter?: AwsService) => void;
  onNavigateToExam: () => void;
  onNavigateToCopilot: (initialTopic?: string) => void;
}

export const AdaptiveDashboard: React.FC<Props> = ({
  userState,
  onNavigateToQuiz,
  onNavigateToFlashcards,
  onNavigateToExam,
  onNavigateToCopilot
}) => {
  const domainStats = computeDomainStats(userState);
  const rankedWeakest = getRankedWeakestServices(userState);
  const studyPlan = generateAdaptiveStudyPlan(userState);
  const readiness = computeOverallExamReadiness(userState);

  const [aiReport, setAiReport] = useState<AiDiagnosticReport | null>(null);
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const topWeakness = rankedWeakest[0];
  const topWeaknessMeta = topWeakness ? AWS_SERVICES_META[topWeakness.service] : null;

  const handleGenerateDiagnosticReport = async () => {
    setIsGeneratingAiReport(true);
    setReportError(null);
    try {
      const response = await fetch('/api/aws/gap-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProgress: userState })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI diagnostic');
      }

      const data = await response.json();
      setAiReport(data.report);
    } catch (err: any) {
      console.error(err);
      setReportError(err.message || 'Error communicating with Gemini AI service');
    } finally {
      setIsGeneratingAiReport(false);
    }
  };

  const getDomainIcon = (domain: AwsDomain) => {
    switch (domain) {
      case 'compute': return <Server className="w-4 h-4 text-orange-400" />;
      case 'storage': return <HardDrive className="w-4 h-4 text-blue-400" />;
      case 'networking': return <Network className="w-4 h-4 text-purple-400" />;
      case 'database': return <Database className="w-4 h-4 text-emerald-400" />;
      case 'security': return <Shield className="w-4 h-4 text-red-400" />;
      case 'management': return <FileSearch className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Next Best Action / Real-time Weakest-First Engine */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>Real-Time Weakest-First Priority Sequence</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-display tracking-tight">
              Next Priority Gap: <span className="text-amber-400">{topWeaknessMeta?.name} ({topWeakness?.service})</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your mastery on <strong className="text-slate-100">{topWeakness?.service}</strong> is currently at <strong className="text-rose-400">{topWeakness?.masteryScore}%</strong> with <strong className="text-rose-400">{topWeakness?.wrongAttempts} logged mistakes</strong>. The engine has automatically queued this at the top of your sessions so you spend zero time on topics you already know.
            </p>

            {topWeakness?.recentMistakes && topWeakness.recentMistakes.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-start gap-2.5 text-slate-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-rose-300">Identified Concept Gap: </span>
                  <span>{topWeakness.recentMistakes[0]}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToQuiz(topWeakness?.service)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/25 hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Drill {topWeakness?.service} Gaps Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateToFlashcards(topWeakness?.service)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Review Flashcards</span>
              </button>

              <button
                onClick={() => onNavigateToCopilot(`Explain key exam tradeoffs and common pitfalls for AWS ${topWeakness?.service}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Ask Architect AI</span>
              </button>
            </div>
          </div>

          {/* Exam Readiness Card */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AWS Scaled Benchmark</span>
              <span className="text-xs font-mono text-slate-400">Pass = 720</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono text-slate-100">{readiness.score}</span>
              <span className="text-sm text-slate-400">/ 1000</span>
            </div>

            {/* Readiness progress bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                {/* 720 pass marker */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white/70 z-10" 
                  style={{ left: '72%' }}
                  title="720 Passing Line" 
                />
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${Math.min(100, Math.max(5, (readiness.score / 1000) * 100))}%`,
                    backgroundColor: readiness.color
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>100</span>
                <span className="text-emerald-400 font-bold">720 Pass Threshold</span>
                <span>1000</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-900">
                <div className="text-slate-400 text-[10px]">Questions Tested</div>
                <div className="font-bold text-slate-200 mt-0.5">{userState.totalQuestionsAnswered}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900">
                <div className="text-slate-400 text-[10px]">Cards Mastered</div>
                <div className="font-bold text-slate-200 mt-0.5">{userState.totalCardsReviewed}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts 30-Day Trajectory & Knowledge Retention Visualization */}
      <ProgressTrajectoryChart
        userState={userState}
        onNavigateToQuiz={onNavigateToQuiz}
        onNavigateToFlashcards={onNavigateToFlashcards}
      />

      {/* AI Gap Diagnostic & Real-Time Prescription Section */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">AI Deep Gap Diagnostic & Prescription</h2>
              <p className="text-xs text-slate-400">Gemini 3.7 Flash analyzes your mistake log across all 14 AWS services and prescribes a high-yield study plan</p>
            </div>
          </div>

          <button
            onClick={handleGenerateDiagnosticReport}
            disabled={isGeneratingAiReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 text-slate-100 font-semibold text-xs transition-all shadow-md shadow-purple-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAiReport ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAiReport ? 'Analyzing Error Logs...' : 'Generate Real-Time AI Diagnosis'}</span>
          </button>
        </div>

        {reportError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{reportError}</span>
          </div>
        )}

        {aiReport && (
          <div className="mt-4 p-5 rounded-xl bg-slate-950/70 border border-purple-500/20 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">AI Readiness Verdict:</span>
                <span className="text-xs font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                  {aiReport.readinessVerdict} (Estimated Score: {aiReport.overallReadinessScore})
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Generated {new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Action Plan Paragraph */}
            <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
              <strong className="text-purple-300 block mb-1">Targeted Prescription:</strong>
              {aiReport.targetedActionPlan}
            </div>

            {/* Strategic Prescription Steps */}
            {aiReport.strategicPrescription && aiReport.strategicPrescription.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300">High-Yield Directives:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {aiReport.strategicPrescription.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* The 6 AWS Core Domains Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-display">Core AWS Domains Breakdown</h2>
            <p className="text-xs text-slate-400">Real-time mastery across all 6 foundational domains and 14 services</p>
          </div>
          <button
            onClick={onNavigateToExam}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-medium border border-slate-700 transition-colors"
          >
            <span>Launch Full Mock Exam</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Object.keys(AWS_DOMAINS) as AwsDomain[]).map((domainKey) => {
            const domain = AWS_DOMAINS[domainKey];
            const stats = domainStats[domainKey];
            
            return (
              <div
                key={domainKey}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Domain Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                      {getDomainIcon(domainKey)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 font-display">{domain.name}</h3>
                      <span className="text-[11px] text-slate-400">{domain.services.join(' • ')}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-slate-100">{stats.averageMastery}%</span>
                    <div className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      stats.averageMastery >= 75 ? 'text-emerald-400 bg-emerald-500/10' :
                      stats.averageMastery >= 50 ? 'text-amber-400 bg-amber-500/10' :
                      'text-rose-400 bg-rose-500/10'
                    }`}>
                      {stats.status}
                    </div>
                  </div>
                </div>

                {/* Domain average progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.averageMastery}%`,
                      backgroundColor: stats.averageMastery >= 75 ? '#10B981' : stats.averageMastery >= 50 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>

                {/* Service Cards within this Domain */}
                <div className="space-y-2 pt-1">
                  {domain.services.map((serviceKey) => {
                    const sStats = userState.services[serviceKey];
                    const sMeta = AWS_SERVICES_META[serviceKey];
                    const isWeakest = rankedWeakest[0]?.service === serviceKey;

                    return (
                      <div
                        key={serviceKey}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isWeakest 
                            ? 'bg-amber-500/5 border-amber-500/30' 
                            : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-200 font-mono">{serviceKey}</span>
                            {isWeakest && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
                                #1 Gap
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-slate-300">
                              {sStats?.masteryScore || 0}%
                            </span>
                            <button
                              onClick={() => onNavigateToQuiz(serviceKey)}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-medium transition-colors"
                            >
                              Drill
                            </button>
                          </div>
                        </div>

                        {/* Mini progress bar */}
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${sStats?.masteryScore || 0}%`,
                              backgroundColor: (sStats?.masteryScore || 0) >= 70 ? '#10B981' : (sStats?.masteryScore || 0) >= 45 ? '#F59E0B' : '#EF4444'
                            }}
                          />
                        </div>

                        <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400">
                          <span>{sStats?.totalAttempts || 0} attempts ({sStats?.wrongAttempts || 0} errors)</span>
                          <span className="font-mono text-slate-400">Streak: {sStats?.streak || 0}🔥</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Adaptive Study Plan Queue */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">Adaptive Queue (Updated in Real-Time)</h2>
              <p className="text-xs text-slate-400">The algorithm automatically re-ranks these tasks whenever you answer questions</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">5 Prioritized Modules</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {studyPlan.map((item) => {
            return (
              <div 
                key={item.id} 
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/20 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-300 shrink-0">
                    #{item.priorityRank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-200">{item.service}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded bg-slate-800 text-slate-400">
                        {item.domain}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                        item.urgency === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        item.urgency === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {item.urgency} PRIORITY ({item.currentMastery}% Mastery)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.recommendedAction}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center pl-10 sm:pl-0">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{item.estimatedMinutes}m
                  </span>
                  
                  {item.targetMode === 'flashcards' ? (
                    <button
                      onClick={() => onNavigateToFlashcards(item.service)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-slate-100 font-semibold text-xs transition-colors"
                    >
                      Cards
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateToQuiz(item.service)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Start Drill
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

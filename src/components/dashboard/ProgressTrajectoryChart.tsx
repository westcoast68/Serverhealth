import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  LineChart,
  BarChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import {
  TrendingUp,
  Brain,
  Zap,
  Calendar,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import { UserProgressState, AwsService, AwsDomain } from '../../types';
import {
  generate30DayTrajectory,
  evaluateServicesRetention,
  computeTrajectorySummary,
  DailyTrajectoryPoint,
  ServiceRetentionHealth
} from '../../utils/trajectoryRetentionEngine';
import { AWS_DOMAINS } from '../../data/awsData';

interface Props {
  userState: UserProgressState;
  onNavigateToQuiz: (serviceFilter?: AwsService) => void;
  onNavigateToFlashcards: (serviceFilter?: AwsService) => void;
}

type ChartViewMode = 'overview' | 'forgetting_curve' | 'domains' | 'velocity';
type TimeframeOption = '7d' | '14d' | '30d';

export const ProgressTrajectoryChart: React.FC<Props> = ({
  userState,
  onNavigateToQuiz,
  onNavigateToFlashcards
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('overview');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('30d');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [showPassingZoneShading, setShowPassingZoneShading] = useState<boolean>(true);

  // Compute full 30-day trajectory data
  const fullTrajectory = useMemo(() => generate30DayTrajectory(userState), [userState]);
  const retentionHealth = useMemo(() => evaluateServicesRetention(userState), [userState]);
  const summary = useMemo(() => computeTrajectorySummary(fullTrajectory, userState), [fullTrajectory, userState]);

  // Slice data based on selected timeframe
  const displayData = useMemo(() => {
    if (timeframe === '7d') return fullTrajectory.slice(-7);
    if (timeframe === '14d') return fullTrajectory.slice(-14);
    return fullTrajectory;
  }, [fullTrajectory, timeframe]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: DailyTrajectoryPoint = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px] z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200">{dataPoint.fullDate}</span>
            <span className="text-[10px] text-amber-400 font-mono">
              {dataPoint.daysAgo === 0 ? 'Today' : `${dataPoint.daysAgo}d ago`}
            </span>
          </div>

          <div className="space-y-1 pt-1 font-mono">
            {viewMode === 'overview' && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-amber-400 font-sans flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    AWS Scaled Score:
                  </span>
                  <span className="font-bold text-slate-100">{dataPoint.scaledScore} / 1000</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-emerald-400 font-sans flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    Retention Stability:
                  </span>
                  <span className="font-bold text-slate-100">{dataPoint.retentionStability}%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-blue-400 font-sans flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                    Domain Mastery:
                  </span>
                  <span className="font-bold text-slate-100">{dataPoint.masteryPercentage}%</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                  <span>Daily Study Activity:</span>
                  <span>{dataPoint.questionsCount} questions • {dataPoint.cardsCount} cards</span>
                </div>
              </>
            )}

            {viewMode === 'forgetting_curve' && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-emerald-400 font-sans flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    Active Recall Retention:
                  </span>
                  <span className="font-bold text-emerald-300">{dataPoint.retentionStability}%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-rose-400 font-sans flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                    Without Review Decay:
                  </span>
                  <span className="font-bold text-rose-300">{dataPoint.decayWithoutReview}%</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Retention Boost: </span>
                  <strong className="text-emerald-400">+{dataPoint.retentionStability - dataPoint.decayWithoutReview}% saved by spaced recall</strong>
                </div>
              </>
            )}

            {viewMode === 'domains' && (
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-orange-400">
                  <span>Compute:</span> <strong>{dataPoint.computeMastery}%</strong>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>Storage:</span> <strong>{dataPoint.storageMastery}%</strong>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Networking:</span> <strong>{dataPoint.networkingMastery}%</strong>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Database:</span> <strong>{dataPoint.databaseMastery}%</strong>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Security:</span> <strong>{dataPoint.securityMastery}%</strong>
                </div>
                <div className="flex justify-between text-pink-400">
                  <span>Management:</span> <strong>{dataPoint.managementMastery}%</strong>
                </div>
              </div>
            )}

            {viewMode === 'velocity' && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-amber-400 font-sans">Questions Answered:</span>
                  <span className="font-bold text-slate-100">{dataPoint.questionsCount}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-blue-400 font-sans">Flashcards Drilled:</span>
                  <span className="font-bold text-slate-100">{dataPoint.cardsCount}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-purple-400 font-sans">Estimated Time:</span>
                  <span className="font-bold text-slate-100">~{dataPoint.studyMinutes} mins</span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>30-Day Adaptive Trajectory & Knowledge Retention</span>
            </span>
            <span className="text-xs text-slate-500">• Powered by Recharts</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 font-display">
            Learning Velocity & Spaced Retention Engine
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Mathematical modeling of memory consolidation, Ebbinghaus forgetting decay, and your AWS Scaled Score progression toward the 720 pass benchmark.
          </p>
        </div>

        {/* Top Control Bar: Mode Tabs & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs font-medium">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeframe === '7d' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeframe('14d')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeframe === '14d' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeframe === '30d' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Scaled Score Delta</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-100">
              +{summary.thirtyDayScoreDelta}
            </span>
            <span className="text-xs text-emerald-400 font-semibold font-mono">pts (30d)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Current: <strong className="text-amber-400 font-mono">{fullTrajectory[fullTrajectory.length - 1]?.scaledScore || 620}</strong> / 1000
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Retention Stability Index</span>
            <Brain className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {summary.currentRetentionRate}%
            </span>
            <span className="text-xs text-blue-400 font-semibold">Active</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Ebbinghaus consolidation level
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pass Threshold Forecast</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {summary.projectedPassDays === 0 ? 'Ready' : `~${summary.projectedPassDays}d`}
            </span>
            <span className="text-xs text-amber-400 font-semibold">to 720+</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {summary.projectedPassDays === 0 ? 'Exceeding 720 pass bar' : 'At current study velocity'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Decay Vulnerability</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-rose-300">
              {summary.retentionRisks.length}
            </span>
            <span className="text-xs text-rose-400 font-semibold">Services</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {summary.retentionRisks[0] ? `Risk on ${summary.retentionRisks[0].service}` : 'All services in safe retention'}
          </div>
        </div>
      </div>

      {/* Chart View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setViewMode('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>AWS Score & Retention Overview</span>
          </button>

          <button
            onClick={() => setViewMode('forgetting_curve')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'forgetting_curve'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Spaced Recall vs. Decay Curve</span>
          </button>

          <button
            onClick={() => setViewMode('domains')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'domains'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20 font-bold'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>6-Domain Trajectories</span>
          </button>

          <button
            onClick={() => setViewMode('velocity')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'velocity'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20 font-bold'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Daily Activity Velocity</span>
          </button>
        </div>

        {/* View mode auxiliary controls */}
        {viewMode === 'overview' && (
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPassingZoneShading}
              onChange={(e) => setShowPassingZoneShading(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0"
            />
            <span>Highlight 720+ Passing Zone</span>
          </label>
        )}
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="h-[340px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {/* VIEW 1: Overview Composite Chart */}
          {viewMode === 'overview' && (
            <ComposedChart data={displayData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="retentionAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
              
              <XAxis 
                dataKey="date" 
                stroke="#64748B" 
                tick={{ fontSize: 11, fill: '#94A3B8' }} 
                tickLine={false}
              />
              
              {/* Left Y Axis: Scaled Score 100 - 1000 */}
              <YAxis
                yAxisId="left"
                domain={[100, 1000]}
                ticks={[200, 400, 600, 720, 850, 1000]}
                stroke="#64748B"
                tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
              />

              {/* Right Y Axis: Retention & Mastery Percentage 0 - 100% */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                stroke="#64748B"
                tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
              />

              {/* 720 Passing Zone Shading */}
              {showPassingZoneShading && (
                <ReferenceArea
                  yAxisId="left"
                  y1={720}
                  y2={1000}
                  fill="#10B981"
                  fillOpacity={0.07}
                  stroke="none"
                />
              )}

              {/* 720 Benchmark Reference Line */}
              <ReferenceLine
                yAxisId="left"
                y={720}
                stroke="#10B981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'AWS Pass (720)',
                  position: 'insideTopRight',
                  fill: '#10B981',
                  fontSize: 10,
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}
              />

              {/* Scaled Score Trajectory Area */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="scaledScore"
                name="AWS Scaled Benchmark (100-1000)"
                stroke="#F59E0B"
                strokeWidth={2.5}
                fill="url(#scoreAreaGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#F59E0B', stroke: '#0F172A', strokeWidth: 2 }}
              />

              {/* Knowledge Retention Stability Spline */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="retentionStability"
                name="Spaced Retention Index (%)"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#10B981', stroke: '#0F172A', strokeWidth: 2 }}
              />

              {/* Average Domain Mastery Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="masteryPercentage"
                name="Average Domain Mastery (%)"
                stroke="#3B82F6"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          )}

          {/* VIEW 2: Ebbinghaus Forgetting Curve vs Active Recall */}
          {viewMode === 'forgetting_curve' && (
            <AreaChart data={displayData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="activeRetentionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />

              <ReferenceLine
                y={75}
                stroke="#3B82F6"
                strokeDasharray="3 3"
                label={{ value: 'Target Retention Safe Zone (75%)', fill: '#60A5FA', fontSize: 10, position: 'insideTopLeft' }}
              />

              <Area
                type="monotone"
                dataKey="retentionStability"
                name="Your Spaced Recall Retention Curve (%)"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#activeRetentionGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#10B981' }}
              />

              <Area
                type="monotone"
                dataKey="decayWithoutReview"
                name="Theoretical Decay Without Spaced Drills (%)"
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={2}
                fill="url(#decayGrad)"
                dot={false}
              />
            </AreaChart>
          )}

          {/* VIEW 3: 6 Core AWS Domain Trajectories */}
          {viewMode === 'domains' && (
            <LineChart data={displayData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />

              <Line type="monotone" dataKey="computeMastery" name="Compute (EC2, Lambda, ECS)" stroke="#F97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="storageMastery" name="Storage (S3, EBS, EFS)" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="networkingMastery" name="Networking (VPC, R53, CF)" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="databaseMastery" name="Database (RDS, DynamoDB)" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="securityMastery" name="Security (IAM, KMS)" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="managementMastery" name="Management (CW, CT)" stroke="#EC4899" strokeWidth={2} dot={false} />
            </LineChart>
          )}

          {/* VIEW 4: Daily Velocity & Volume */}
          {viewMode === 'velocity' && (
            <BarChart data={displayData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />

              <Bar dataKey="questionsCount" name="Questions Solved" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cardsCount" name="Flashcards Reviewed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Retention Health Alert & Half-Life Decay Warning Grid */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Service-Level Memory Half-Life & Decay Risk Status
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Reviews reset decay half-life back to 100%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {retentionHealth.slice(0, 6).map((item) => {
            const isCritical = item.status === 'high_decay_risk';
            const isModerate = item.status === 'moderate_decay';

            return (
              <div
                key={item.service}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : isModerate
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200 font-mono">{item.service}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300'
                        : isModerate
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {item.retentionScore}% Retention
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.daysSinceLastReview}d since drill
                  </span>
                </div>

                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden my-1">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${item.retentionScore}%`,
                      backgroundColor: item.retentionScore >= 70 ? '#10B981' : item.retentionScore >= 45 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    Half-life: ~{item.halfLifeDays} days
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onNavigateToFlashcards(item.service)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 font-medium transition-colors"
                      title="Review Flashcards"
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => onNavigateToQuiz(item.service)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-medium transition-colors"
                      title="Drill Quiz Questions"
                    >
                      Drill
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

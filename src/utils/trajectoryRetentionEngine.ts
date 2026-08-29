import { UserProgressState, AwsDomain, AwsService } from '../types';
import { AWS_DOMAINS, AWS_SERVICES_META } from '../data/awsData';
import { computeDomainStats, computeOverallExamReadiness } from './adaptiveEngine';

export interface DailyTrajectoryPoint {
  date: string; // 'MMM DD' e.g. 'Aug 01'
  fullDate: string; // 'YYYY-MM-DD'
  dayIndex: number; // 0 to 29
  daysAgo: number;
  
  // Overall metrics
  scaledScore: number; // 100 to 1000
  masteryPercentage: number; // 0 to 100%
  retentionStability: number; // 0 to 100% (Ebbinghaus retention model)
  decayWithoutReview: number; // Theoretical retention if no spaced reviews happened
  
  // Activity
  questionsCount: number;
  cardsCount: number;
  totalActivities: number;
  studyMinutes: number;
  
  // Domain masteries
  computeMastery: number;
  storageMastery: number;
  networkingMastery: number;
  databaseMastery: number;
  securityMastery: number;
  managementMastery: number;
}

export interface ServiceRetentionHealth {
  service: AwsService;
  domain: AwsDomain;
  currentMastery: number;
  retentionScore: number; // 0 to 100%
  daysSinceLastReview: number;
  status: 'optimal' | 'moderate_decay' | 'high_decay_risk';
  halfLifeDays: number;
  recommendedAction: string;
}

export interface TrajectorySummary {
  thirtyDayScoreDelta: number; // e.g. +145
  thirtyDayMasteryDelta: number; // e.g. +22%
  currentRetentionRate: number; // e.g. 84%
  projectedPassDays: number; // Days until reaching 720 pass score
  averageDailyQuestions: number;
  retentionRisks: ServiceRetentionHealth[];
  highestRetentionServices: ServiceRetentionHealth[];
}

/**
 * Computes 30-day daily trajectory and knowledge retention curve
 * anchored to the real user progress state.
 */
export function generate30DayTrajectory(userState: UserProgressState): DailyTrajectoryPoint[] {
  const currentReadiness = computeOverallExamReadiness(userState);
  const currentDomainStats = computeDomainStats(userState);
  
  const points: DailyTrajectoryPoint[] = [];
  const now = new Date();
  
  // Baseline stats 30 days ago (student started with initial diagnostic knowledge)
  const baseScaledScore = Math.max(220, currentReadiness.score - 160);
  const baseMastery = Math.max(18, currentReadiness.percentage - 28);
  
  // Base domain scores 30 days ago
  const baseDomainMastery: Record<AwsDomain, number> = {
    compute: Math.max(15, currentDomainStats.compute.averageMastery - 25),
    storage: Math.max(20, currentDomainStats.storage.averageMastery - 30),
    networking: Math.max(10, currentDomainStats.networking.averageMastery - 18),
    database: Math.max(15, currentDomainStats.database.averageMastery - 26),
    security: Math.max(25, currentDomainStats.security.averageMastery - 35),
    management: Math.max(20, currentDomainStats.management.averageMastery - 28),
  };

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayProgressRatio = (29 - i) / 29; // 0 at day -29, 1 at today
    
    // Non-linear learning curve (S-curve / sigmoid growth with realistic daily study variance)
    const learningVelocity = Math.pow(dayProgressRatio, 0.85);
    
    // Simulate daily question volume based on total questions
    const dailySeed = Math.sin((i + 3) * 1.7) * 0.5 + 0.5; // deterministic variation
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const activityWeight = isWeekend ? 1.4 : 0.9;
    
    const approxDailyQuestions = Math.max(
      1,
      Math.round((userState.totalQuestionsAnswered / 30) * (dailySeed * 0.8 + 0.6) * activityWeight)
    );
    const approxDailyCards = Math.max(
      1,
      Math.round((userState.totalCardsReviewed / 30) * (dailySeed * 0.7 + 0.7) * activityWeight)
    );
    
    // Calculated score trajectory
    const currentDayScaled = Math.round(
      baseScaledScore + (currentReadiness.score - baseScaledScore) * learningVelocity
    );
    
    const currentDayMastery = Math.round(
      baseMastery + (currentReadiness.percentage - baseMastery) * learningVelocity
    );
    
    // Ebbinghaus Forgetting Curve Simulation:
    // With active recall reviews (spaced repetition), retention stays elevated (80-92%).
    // Without reviews, retention would decay exponentially towards ~35%.
    const daysSinceRecentSpike = (i % 4); // reviews happen every few days
    const activeRetention = Math.min(
      98,
      Math.max(65, Math.round(88 + Math.sin(i * 0.9) * 6 - daysSinceRecentSpike * 2.5 + (learningVelocity * 8)))
    );
    
    const decayedRetention = Math.round(
      100 * Math.exp(-((29 - i) * 0.08)) + 30
    );

    const point: DailyTrajectoryPoint = {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: d.toISOString().split('T')[0],
      dayIndex: 29 - i,
      daysAgo: i,
      scaledScore: i === 0 ? currentReadiness.score : currentDayScaled,
      masteryPercentage: i === 0 ? currentReadiness.percentage : currentDayMastery,
      retentionStability: i === 0 ? Math.min(95, Math.max(78, Math.round(currentReadiness.percentage * 0.9 + 15))) : activeRetention,
      decayWithoutReview: Math.max(25, Math.min(100, decayedRetention)),
      questionsCount: i === 0 ? Math.max(2, Math.round(userState.totalQuestionsAnswered * 0.06)) : approxDailyQuestions,
      cardsCount: i === 0 ? Math.max(2, Math.round(userState.totalCardsReviewed * 0.05)) : approxDailyCards,
      totalActivities: (i === 0 ? Math.max(2, Math.round(userState.totalQuestionsAnswered * 0.06)) : approxDailyQuestions) + 
                       (i === 0 ? Math.max(2, Math.round(userState.totalCardsReviewed * 0.05)) : approxDailyCards),
      studyMinutes: Math.round(((i === 0 ? 4 : approxDailyQuestions) * 1.8) + ((i === 0 ? 3 : approxDailyCards) * 1.1)),
      
      // Domain trajectories
      computeMastery: Math.min(100, Math.round(baseDomainMastery.compute + (currentDomainStats.compute.averageMastery - baseDomainMastery.compute) * learningVelocity)),
      storageMastery: Math.min(100, Math.round(baseDomainMastery.storage + (currentDomainStats.storage.averageMastery - baseDomainMastery.storage) * learningVelocity)),
      networkingMastery: Math.min(100, Math.round(baseDomainMastery.networking + (currentDomainStats.networking.averageMastery - baseDomainMastery.networking) * learningVelocity)),
      databaseMastery: Math.min(100, Math.round(baseDomainMastery.database + (currentDomainStats.database.averageMastery - baseDomainMastery.database) * learningVelocity)),
      securityMastery: Math.min(100, Math.round(baseDomainMastery.security + (currentDomainStats.security.averageMastery - baseDomainMastery.security) * learningVelocity)),
      managementMastery: Math.min(100, Math.round(baseDomainMastery.management + (currentDomainStats.management.averageMastery - baseDomainMastery.management) * learningVelocity)),
    };

    points.push(point);
  }

  return points;
}

/**
 * Evaluates service-by-service retention health based on days since last review and current mastery
 */
export function evaluateServicesRetention(userState: UserProgressState): ServiceRetentionHealth[] {
  const now = Date.now();
  const servicesList = Object.values(userState.services);

  return servicesList.map((stat) => {
    let daysSince = 1;
    if (stat.lastStudiedAt) {
      daysSince = Math.max(0, Math.round((now - new Date(stat.lastStudiedAt).getTime()) / (1000 * 60 * 60 * 24)));
    } else {
      daysSince = 5;
    }

    // Memory half-life in days based on streak & mastery
    const halfLifeDays = Math.max(2, Math.round(3 + (stat.streak * 2) + (stat.masteryScore / 25)));
    
    // Retention decayed exponential formula: R = e^(-t / S)
    const decayFactor = Math.exp(-daysSince / halfLifeDays);
    const retentionScore = Math.min(100, Math.max(20, Math.round(stat.masteryScore * decayFactor + (stat.streak * 3))));

    let status: 'optimal' | 'moderate_decay' | 'high_decay_risk' = 'optimal';
    let recommendedAction = 'Retention is strong. Scheduled for standard spaced review.';

    if (retentionScore < 45 || daysSince >= 4) {
      status = 'high_decay_risk';
      recommendedAction = `Immediate recall drill required (${daysSince}d without review).`;
    } else if (retentionScore < 70 || daysSince >= 2) {
      status = 'moderate_decay';
      recommendedAction = `Review flashcards soon to reinforce memory stability.`;
    }

    return {
      service: stat.service,
      domain: stat.domain,
      currentMastery: stat.masteryScore,
      retentionScore,
      daysSinceLastReview: daysSince,
      status,
      halfLifeDays,
      recommendedAction
    };
  }).sort((a, b) => a.retentionScore - b.retentionScore);
}

/**
 * Generates key analytical takeaways from the 30-day curve
 */
export function computeTrajectorySummary(
  trajectoryPoints: DailyTrajectoryPoint[],
  userState: UserProgressState
): TrajectorySummary {
  const first = trajectoryPoints[0];
  const last = trajectoryPoints[trajectoryPoints.length - 1];
  
  const scoreDelta = (last?.scaledScore || 600) - (first?.scaledScore || 450);
  const masteryDelta = (last?.masteryPercentage || 50) - (first?.masteryPercentage || 30);
  const currentRetention = last?.retentionStability || 82;

  // Rate of gain per day
  const dailyGain = Math.max(1, scoreDelta / 30);
  const pointsNeededToPass = Math.max(0, 720 - (last?.scaledScore || 600));
  const projectedDays = pointsNeededToPass === 0 ? 0 : Math.ceil(pointsNeededToPass / dailyGain);

  const retentionHealthList = evaluateServicesRetention(userState);
  const risks = retentionHealthList.filter(s => s.status === 'high_decay_risk' || s.status === 'moderate_decay');
  const topStable = [...retentionHealthList].reverse().slice(0, 4);

  const totalQuestions = trajectoryPoints.reduce((acc, p) => acc + p.questionsCount, 0);

  return {
    thirtyDayScoreDelta: scoreDelta,
    thirtyDayMasteryDelta: masteryDelta,
    currentRetentionRate: currentRetention,
    projectedPassDays: projectedDays,
    averageDailyQuestions: Math.round(totalQuestions / trajectoryPoints.length),
    retentionRisks: risks,
    highestRetentionServices: topStable
  };
}

import { AwsDomain, AwsService, DomainMasteryStats, ServiceMasteryStats, UserProgressState, StudyPlanItem, QuizQuestion, Flashcard } from '../types';
import { AWS_DOMAINS, AWS_SERVICES_META } from '../data/awsData';

const STORAGE_KEY = 'aws_adaptive_mastery_state_v1';

export function calculateConfidence(mastery: number): 'High' | 'Moderate' | 'Low' | 'Critical Gap' {
  if (mastery >= 78) return 'High';
  if (mastery >= 55) return 'Moderate';
  if (mastery >= 35) return 'Low';
  return 'Critical Gap';
}

export function computeGapWeight(stats: ServiceMasteryStats): number {
  // Base gap weight is (100 - masteryScore) * 1.5
  const baseGap = (100 - stats.masteryScore) * 1.5;
  
  // Recency penalty: if studied > 2 days ago, add weight
  let recencyBonus = 0;
  if (stats.lastStudiedAt) {
    const daysSince = (Date.now() - new Date(stats.lastStudiedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 4) recencyBonus = 20;
    else if (daysSince > 2) recencyBonus = 10;
  } else {
    recencyBonus = 30; // Never studied
  }

  // Consecutive mistake penalty
  const mistakeBonus = Math.min(stats.wrongAttempts * 3, 25);

  return Math.round(baseGap + recencyBonus + mistakeBonus);
}

export function computeDomainStats(userState: UserProgressState): Record<AwsDomain, DomainMasteryStats> {
  const domains = Object.keys(AWS_DOMAINS) as AwsDomain[];
  const result: Partial<Record<AwsDomain, DomainMasteryStats>> = {};

  for (const domain of domains) {
    const services = AWS_DOMAINS[domain].services;
    let totalMastery = 0;
    let totalAttempts = 0;
    let totalCorrect = 0;

    for (const s of services) {
      const stats = userState.services[s];
      if (stats) {
        totalMastery += stats.masteryScore;
        totalAttempts += stats.totalAttempts;
        totalCorrect += stats.correctAttempts;
      }
    }

    const averageMastery = Math.round(totalMastery / services.length);
    let status: 'Mastered' | 'Strong' | 'Needs Practice' | 'Critical Gap' = 'Needs Practice';
    if (averageMastery >= 80) status = 'Mastered';
    else if (averageMastery >= 65) status = 'Strong';
    else if (averageMastery >= 45) status = 'Needs Practice';
    else status = 'Critical Gap';

    result[domain] = {
      domain,
      name: AWS_DOMAINS[domain].name,
      color: AWS_DOMAINS[domain].color,
      services,
      averageMastery,
      totalAttempts,
      correctAttempts: totalCorrect,
      status
    };
  }

  return result as Record<AwsDomain, DomainMasteryStats>;
}

export function getRankedWeakestServices(userState: UserProgressState): ServiceMasteryStats[] {
  const serviceList = Object.values(userState.services);
  return [...serviceList].sort((a, b) => {
    // Sort by highest gap weight first (lowest mastery & highest need)
    const gapA = computeGapWeight(a);
    const gapB = computeGapWeight(b);
    return gapB - gapA;
  });
}

export function generateAdaptiveStudyPlan(userState: UserProgressState): StudyPlanItem[] {
  const ranked = getRankedWeakestServices(userState);
  const items: StudyPlanItem[] = [];

  ranked.slice(0, 5).forEach((stat, index) => {
    const meta = AWS_SERVICES_META[stat.service];
    let urgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    if (stat.masteryScore >= 60) urgency = 'MEDIUM';
    else if (stat.masteryScore >= 75) urgency = 'LOW';

    let gapReason = `Mastery is at ${stat.masteryScore}% with ${stat.wrongAttempts} logged mistakes.`;
    if (stat.recentMistakes.length > 0) {
      gapReason = `Struggled with: ${stat.recentMistakes[0]}`;
    }

    let recommendedAction = `Drill 5 adaptive questions on ${meta.name} and review key gotchas.`;
    let targetMode: 'quiz' | 'flashcards' | 'exam' | 'copilot' = 'quiz';
    if (stat.masteryScore < 35) {
      recommendedAction = `Review flashcards first to solidify fundamentals of ${stat.service}, then run diagnostic quiz.`;
      targetMode = 'flashcards';
    }

    items.push({
      id: `plan-${stat.service}-${index}`,
      priorityRank: index + 1,
      domain: stat.domain,
      service: stat.service,
      currentMastery: stat.masteryScore,
      urgency,
      gapReason,
      recommendedAction,
      targetMode,
      estimatedMinutes: 5 + (index * 2)
    });
  });

  return items;
}

export function computeOverallExamReadiness(userState: UserProgressState): {
  score: number; // 0 to 1000 scale (720 is AWS pass)
  percentage: number;
  verdict: 'Exam Ready' | 'Passing Zone' | 'Borderline' | 'High Risk';
  color: string;
} {
  const serviceList = Object.values(userState.services);
  let totalScore = 0;
  let totalExamWeight = 0;

  for (const s of serviceList) {
    const meta = AWS_SERVICES_META[s.service];
    const weight = meta ? meta.examWeightPct : 10;
    totalScore += s.masteryScore * weight;
    totalExamWeight += weight;
  }

  const weightedPercentage = Math.round(totalScore / totalExamWeight);
  // Scale to AWS 100-1000 scale
  const scaledScore = Math.min(1000, Math.max(100, Math.round(100 + (weightedPercentage / 100) * 900)));

  let verdict: 'Exam Ready' | 'Passing Zone' | 'Borderline' | 'High Risk' = 'Borderline';
  let color = '#F59E0B';

  if (scaledScore >= 820) {
    verdict = 'Exam Ready';
    color = '#10B981';
  } else if (scaledScore >= 720) {
    verdict = 'Passing Zone';
    color = '#059669';
  } else if (scaledScore >= 550) {
    verdict = 'Borderline';
    color = '#F59E0B';
  } else {
    verdict = 'High Risk';
    color = '#EF4444';
  }

  return {
    score: scaledScore,
    percentage: weightedPercentage,
    verdict,
    color
  };
}

export function updateMasteryOnQuizAnswer(
  currentState: UserProgressState,
  serviceName: AwsService,
  isCorrect: boolean,
  mistakeSummary?: string
): UserProgressState {
  const current = currentState.services[serviceName] || {
    service: serviceName,
    domain: AWS_SERVICES_META[serviceName]?.domain || 'compute',
    masteryScore: 50,
    totalAttempts: 0,
    correctAttempts: 0,
    wrongAttempts: 0,
    streak: 0,
    confidenceLevel: 'Moderate',
    lastStudiedAt: null,
    gapWeight: 50,
    recentMistakes: []
  };

  const newTotalAttempts = current.totalAttempts + 1;
  const newCorrectAttempts = isCorrect ? current.correctAttempts + 1 : current.correctAttempts;
  const newWrongAttempts = !isCorrect ? current.wrongAttempts + 1 : current.wrongAttempts;
  const newStreak = isCorrect ? current.streak + 1 : 0;

  // Real-time mastery score adjustment:
  // Correct answers boost score proportionally (more if low mastery)
  // Wrong answers reduce score
  let delta = 0;
  if (isCorrect) {
    delta = current.masteryScore < 50 ? 10 : current.masteryScore < 80 ? 6 : 4;
  } else {
    delta = current.masteryScore > 60 ? -8 : -5;
  }

  const newMastery = Math.min(100, Math.max(5, current.masteryScore + delta));
  const newConfidence = calculateConfidence(newMastery);

  let newMistakes = [...current.recentMistakes];
  if (!isCorrect && mistakeSummary) {
    newMistakes = [mistakeSummary, ...newMistakes.filter(m => m !== mistakeSummary)].slice(0, 4);
  }

  const updatedService: ServiceMasteryStats = {
    ...current,
    masteryScore: newMastery,
    totalAttempts: newTotalAttempts,
    correctAttempts: newCorrectAttempts,
    wrongAttempts: newWrongAttempts,
    streak: newStreak,
    confidenceLevel: newConfidence,
    lastStudiedAt: new Date().toISOString(),
    gapWeight: 0, // will be recomputed
    recentMistakes: newMistakes
  };
  updatedService.gapWeight = computeGapWeight(updatedService);

  const updatedState: UserProgressState = {
    ...currentState,
    services: {
      ...currentState.services,
      [serviceName]: updatedService
    },
    totalQuestionsAnswered: currentState.totalQuestionsAnswered + 1,
    lastActiveDate: new Date().toISOString().split('T')[0]
  };

  saveUserState(updatedState);
  return updatedState;
}

export function updateMasteryOnCardRating(
  currentState: UserProgressState,
  serviceName: AwsService,
  rating: 'again' | 'hard' | 'good' | 'mastered'
): UserProgressState {
  const current = currentState.services[serviceName];
  if (!current) return currentState;

  let delta = 0;
  let streakDelta = current.streak;
  if (rating === 'again') {
    delta = -6;
    streakDelta = 0;
  } else if (rating === 'hard') {
    delta = 2;
    streakDelta += 1;
  } else if (rating === 'good') {
    delta = 5;
    streakDelta += 1;
  } else if (rating === 'mastered') {
    delta = 9;
    streakDelta += 2;
  }

  const newMastery = Math.min(100, Math.max(5, current.masteryScore + delta));
  const updatedService: ServiceMasteryStats = {
    ...current,
    masteryScore: newMastery,
    streak: streakDelta,
    confidenceLevel: calculateConfidence(newMastery),
    lastStudiedAt: new Date().toISOString(),
    gapWeight: 0
  };
  updatedService.gapWeight = computeGapWeight(updatedService);

  const updatedState: UserProgressState = {
    ...currentState,
    services: {
      ...currentState.services,
      [serviceName]: updatedService
    },
    totalCardsReviewed: currentState.totalCardsReviewed + 1,
    lastActiveDate: new Date().toISOString().split('T')[0]
  };

  saveUserState(updatedState);
  return updatedState;
}

export function loadUserState(): UserProgressState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load user state from localStorage:', e);
  }
  return null;
}

export function saveUserState(state: UserProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save user state to localStorage:', e);
  }
}

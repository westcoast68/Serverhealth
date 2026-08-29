export type AwsDomain = 
  | 'compute' 
  | 'storage' 
  | 'networking' 
  | 'database' 
  | 'security' 
  | 'management';

export type AwsService = 
  | 'EC2' 
  | 'Lambda' 
  | 'ECS' 
  | 'S3' 
  | 'EBS' 
  | 'EFS' 
  | 'VPC' 
  | 'Route 53' 
  | 'CloudFront' 
  | 'RDS' 
  | 'DynamoDB' 
  | 'IAM' 
  | 'KMS' 
  | 'CloudWatch' 
  | 'CloudTrail';

export interface ServiceMeta {
  id: AwsService;
  name: string;
  domain: AwsDomain;
  tagline: string;
  iconName: string;
  color: string;
  description: string;
  examWeightPct: number;
  coreConcepts: string[];
  commonGotchas: string[];
  keyTradeoffs: string[];
}

export interface ServiceMasteryStats {
  service: AwsService;
  domain: AwsDomain;
  masteryScore: number; // 0 to 100
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  streak: number;
  confidenceLevel: 'High' | 'Moderate' | 'Low' | 'Critical Gap';
  lastStudiedAt: string | null;
  gapWeight: number; // dynamically computed, higher = prioritize first
  recentMistakes: string[];
}

export interface DomainMasteryStats {
  domain: AwsDomain;
  name: string;
  color: string;
  services: AwsService[];
  averageMastery: number;
  totalAttempts: number;
  correctAttempts: number;
  status: 'Mastered' | 'Strong' | 'Needs Practice' | 'Critical Gap';
}

export interface QuizOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface QuizQuestion {
  id: string;
  domain: AwsDomain;
  service: AwsService;
  scenario: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  architectureTip: string;
  whyWrong: Record<string, string>; // e.g. { 'A': '...', 'C': '...' }
  difficulty: 'Foundational' | 'Associate' | 'Deep Dive';
  tags: string[];
  isAiGenerated?: boolean;
}

export interface Flashcard {
  id: string;
  domain: AwsDomain;
  service: AwsService;
  front: string;
  back: string;
  architectureContext: string;
  examGotcha: string;
  boxLevel: number; // Leitner box 1 to 5
  lastReviewedAt?: string;
  nextReviewDue?: string;
  consecutiveCorrect: number;
  status: 'new' | 'learning' | 'review' | 'mastered';
}

export interface MockExamQuestionAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  markedForReview: boolean;
}

export interface MockExamResult {
  id: string;
  timestamp: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  passingScore: number; // 72%
  isPassed: boolean;
  totalTimeSeconds: number;
  domainScores: Record<AwsDomain, { correct: number; total: number; percentage: number }>;
  weakestServicesFound: AwsService[];
  answers: MockExamQuestionAnswer[];
}

export interface StudyPlanItem {
  id: string;
  priorityRank: number;
  domain: AwsDomain;
  service: AwsService;
  currentMastery: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  gapReason: string;
  recommendedAction: string;
  targetMode: 'quiz' | 'flashcards' | 'exam' | 'copilot';
  estimatedMinutes: number;
}

export interface UserProgressState {
  services: Record<AwsService, ServiceMasteryStats>;
  customNotes: Record<string, string>;
  bookmarkedQuestionIds: string[];
  bookmarkedCardIds: string[];
  examHistory: MockExamResult[];
  dailyStreak: number;
  lastActiveDate: string;
  totalQuestionsAnswered: number;
  totalCardsReviewed: number;
}

export interface AiDiagnosticReport {
  timestamp: string;
  overallReadinessScore: number; // 0-1000 scaled
  readinessVerdict: 'Ready to Book Exam' | 'High Likelihood Pass' | 'Moderate Gap Risk' | 'Critical Review Required';
  topWeaknesses: {
    service: AwsService;
    domain: AwsDomain;
    estimatedGap: string;
    suggestedFocus: string;
  }[];
  topStrengths: {
    service: AwsService;
    domain: AwsDomain;
    mastery: string;
  }[];
  strategicPrescription: string[];
  targetedActionPlan: string;
}


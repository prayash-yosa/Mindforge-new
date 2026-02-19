/**
 * Mindforge Client — API Response Types (Task 6.1)
 *
 * Typed interfaces matching backend response shapes.
 */

export interface LoginResponse {
  token: string;
  student: {
    id: string;
    displayName: string;
    class: string;
    board: string;
  };
  expiresIn: number;
}

export interface TodayPlan {
  student: { id: string; displayName: string; class: string; board: string };
  tasks: TaskCard[];
  completedToday: number;
  totalToday: number;
  progressPercent: number;
}

export interface TaskCard {
  id: string;
  type: string;
  title: string;
  syllabusRef?: { subject?: string; chapter?: string; topic?: string };
  questionCount: number;
  estimatedMinutes: number | null;
  status: string;
  score?: number | null;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  status: string;
  questionCount: number;
  estimatedMinutes: number | null;
  syllabusRef?: { subject?: string; chapter?: string; topic?: string };
  questions: Question[];
}

export interface Question {
  id: string;
  type: string;
  content: string;
  options?: string[];
  difficulty?: string;
  sortOrder: number;
  answered?: boolean;
}

export interface AnswerResult {
  questionId: string;
  isCorrect: boolean | null;
  score: number | null;
  feedback: string | null;
  feedbackLevel: string;
  isComplete: boolean;
  nextQuestionId: string | null;
}

export interface FeedbackResult {
  questionId: string;
  level: string;
  content: string;
  fromAi: boolean;
  nextLevel: string | null;
  maxLevelReached: boolean;
}

export interface ActivityResult {
  activityId: string;
  type: string;
  title: string;
  status: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  score: number;
  breakdown: { questionId: string; isCorrect: boolean | null; score: number | null }[];
  suggestedNext: { type: string; title: string; reason: string }[];
}

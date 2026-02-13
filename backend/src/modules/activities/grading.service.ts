/**
 * Mindforge Backend — Grading Service (Task 2.3)
 *
 * Deterministic and AI-assisted grading rules.
 * Stub for Sprint 2 — full implementation in Task 4.3.
 *
 * Architecture ref: §9 AI — "deterministic or cheaper structured evaluation
 * for MCQs and simple grading"
 *
 * Checklist 2.3:
 *   [x] Business service for grading (stubs OK)
 */

import { Injectable, Logger } from '@nestjs/common';
import { QuestionType } from '../../database/entities/question.entity';

export interface GradeInput {
  questionType: QuestionType;
  studentAnswer: string;
  correctAnswer?: string;
  rubric?: string;
}

export interface GradeResult {
  isCorrect: boolean | null;
  score: number | null;
  feedback?: string;
  gradingMethod: 'deterministic' | 'ai' | 'pending';
}

@Injectable()
export class GradingService {
  private readonly logger = new Logger(GradingService.name);

  /**
   * Grade a student's answer.
   *
   * - MCQ, true/false, fill-blank: deterministic (exact match)
   * - Short/long answer: AI-assisted (deferred to Task 4.3)
   */
  grade(input: GradeInput): GradeResult {
    // Deterministic grading for objective types
    if (this.isDeterministic(input.questionType) && input.correctAnswer) {
      const isCorrect =
        input.studentAnswer.trim().toLowerCase() ===
        input.correctAnswer.trim().toLowerCase();

      return {
        isCorrect,
        score: isCorrect ? 100 : 0,
        feedback: isCorrect ? 'Correct!' : 'Incorrect.',
        gradingMethod: 'deterministic',
      };
    }

    // AI-assisted grading (stub — Task 4.3)
    this.logger.warn(`AI grading requested for ${input.questionType} — stub (Task 4.3)`);
    return {
      isCorrect: null,
      score: null,
      feedback: 'Grading pending — AI evaluation will be available soon.',
      gradingMethod: 'pending',
    };
  }

  /** Check if a question type can be graded deterministically */
  private isDeterministic(type: QuestionType): boolean {
    return [QuestionType.MCQ, QuestionType.TRUE_FALSE, QuestionType.FILL_BLANK].includes(type);
  }
}

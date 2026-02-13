/**
 * Mindforge Backend — Doubt Service (Task 2.3)
 *
 * Business logic for doubt threads with syllabus context.
 * Services = business logic only. No HTTP, no direct DB access.
 *
 * Checklist 2.3:
 *   [x] Business service for doubts (stubs OK for AI parts)
 *   [x] Business layer calls data access and external (AI) only
 */

import { Injectable, Logger } from '@nestjs/common';
import { DoubtRepository } from '../../database/repositories/doubt.repository';
import { StudentRepository } from '../../database/repositories/student.repository';
import {
  DoubtThreadNotFoundException,
  StudentNotFoundException,
  AiUnavailableException,
} from '../../common/exceptions/domain.exceptions';
import { MessageRole } from '../../database/entities/doubt-message.entity';

/** Thread list item */
export interface DoubtThreadSummary {
  id: string;
  title: string | null;
  syllabusContext: {
    class?: string;
    subject?: string;
    chapter?: string;
    topic?: string;
  };
  isResolved: boolean;
  messageCount?: number;
  updatedAt: Date;
}

/** Thread detail with messages */
export interface DoubtThreadDetail {
  id: string;
  title: string | null;
  syllabusContext: {
    class?: string;
    subject?: string;
    chapter?: string;
    topic?: string;
  };
  isResolved: boolean;
  messages: { id: string; role: string; content: string; createdAt: Date }[];
}

/** Input for creating a new doubt message */
export interface CreateDoubtInput {
  syllabusClass?: string;
  syllabusSubject?: string;
  syllabusChapter?: string;
  syllabusTopic?: string;
  message: string;
  threadId?: string; // If provided, adds to existing thread
}

@Injectable()
export class DoubtService {
  private readonly logger = new Logger(DoubtService.name);

  constructor(
    private readonly doubtRepo: DoubtRepository,
    private readonly studentRepo: StudentRepository,
  ) {}

  /**
   * Get all doubt threads for a student.
   *
   * Architecture ref: §5.2 — "GET /student/doubts"
   */
  async getThreads(studentId: string): Promise<DoubtThreadSummary[]> {
    const threads = await this.doubtRepo.findThreadsByStudent(studentId);

    return threads.map((t) => ({
      id: t.id,
      title: t.title,
      syllabusContext: {
        class: t.syllabusClass ?? undefined,
        subject: t.syllabusSubject ?? undefined,
        chapter: t.syllabusChapter ?? undefined,
        topic: t.syllabusTopic ?? undefined,
      },
      isResolved: t.isResolved,
      updatedAt: t.updatedAt,
    }));
  }

  /**
   * Get a doubt thread with messages.
   *
   * Architecture ref: §5.2 — "GET /student/doubts/:threadId"
   */
  async getThread(threadId: string, studentId: string): Promise<DoubtThreadDetail> {
    const thread = await this.doubtRepo.findThreadByIdForStudent(threadId, studentId);
    if (!thread) throw new DoubtThreadNotFoundException(threadId);

    return {
      id: thread.id,
      title: thread.title,
      syllabusContext: {
        class: thread.syllabusClass ?? undefined,
        subject: thread.syllabusSubject ?? undefined,
        chapter: thread.syllabusChapter ?? undefined,
        topic: thread.syllabusTopic ?? undefined,
      },
      isResolved: thread.isResolved,
      messages: (thread.messages ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    };
  }

  /**
   * Create a doubt message (new thread or reply to existing).
   * Calls AI provider for response — stub in Sprint 2.
   *
   * Architecture ref: §5.2 — "POST /student/doubts"
   */
  async createMessage(
    studentId: string,
    input: CreateDoubtInput,
  ): Promise<DoubtThreadDetail> {
    const student = await this.studentRepo.findById(studentId);
    if (!student) throw new StudentNotFoundException();

    let threadId = input.threadId;

    // Create new thread if needed
    if (!threadId) {
      const thread = await this.doubtRepo.createThread({
        studentId,
        syllabusClass: input.syllabusClass,
        syllabusSubject: input.syllabusSubject,
        syllabusChapter: input.syllabusChapter,
        syllabusTopic: input.syllabusTopic,
        title: input.message.substring(0, 100),
      });
      threadId = thread.id;
    }

    // Add student message
    await this.doubtRepo.addMessage({
      threadId,
      role: MessageRole.STUDENT,
      content: input.message,
    });

    // AI response — stub for Sprint 2 (full in Task 5.2 / 4.1)
    const aiResponse = this.generateStubAiResponse(input);
    await this.doubtRepo.addMessage({
      threadId,
      role: MessageRole.AI,
      content: aiResponse,
      aiModel: 'stub-v1',
    });

    return this.getThread(threadId, studentId);
  }

  /**
   * Stub AI response — will be replaced with real AI call in Task 4.1/5.2.
   */
  private generateStubAiResponse(input: CreateDoubtInput): string {
    const context = [
      input.syllabusSubject,
      input.syllabusChapter,
      input.syllabusTopic,
    ]
      .filter(Boolean)
      .join(' > ');

    return (
      `Thank you for your question${context ? ` about ${context}` : ''}. ` +
      `AI-powered responses will be available once the AI provider is integrated (Task 4.1). ` +
      `In the meantime, please refer to your textbook or ask your teacher.`
    );
  }
}

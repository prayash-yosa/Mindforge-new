/**
 * Mindforge Backend — Doubt Service (Sprint 4)
 *
 * Business logic for doubt threads with syllabus context.
 * Integrates with AiProviderService for AI-powered responses.
 * Falls back to static guidance when AI is unavailable.
 *
 * Standards applied:
 *   - No PII in AI prompts (pseudonymous, syllabus context only)
 *   - Explicit edge case handling (thread not found, student not found, AI failure)
 *   - No raw AI errors exposed to client
 */

import { Injectable, Logger } from '@nestjs/common';
import { DoubtRepository } from '../../database/repositories/doubt.repository';
import { StudentRepository } from '../../database/repositories/student.repository';
import { AiProviderService } from '../ai/ai-provider.service';
import { PromptBuilderService } from '../ai/prompt-builder.service';
import {
  DoubtThreadNotFoundException,
  StudentNotFoundException,
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
  threadId?: string;
}

@Injectable()
export class DoubtService {
  private readonly logger = new Logger(DoubtService.name);

  constructor(
    private readonly doubtRepo: DoubtRepository,
    private readonly studentRepo: StudentRepository,
    private readonly aiProvider: AiProviderService,
    private readonly promptBuilder: PromptBuilderService,
  ) {}

  /** Get all doubt threads for a student */
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

  /** Get a doubt thread with messages */
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
   * Calls AI provider for response; falls back to static guidance on failure.
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

    // Build conversation history for context
    const thread = await this.doubtRepo.findThreadByIdForStudent(threadId, studentId);
    const history = (thread?.messages ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Use thread's existing syllabus context for replies; fall back to input or defaults
    const syllabusClass = input.syllabusClass ?? thread?.syllabusClass ?? student.class ?? '8';
    const syllabusSubject = input.syllabusSubject ?? thread?.syllabusSubject ?? 'General';
    const syllabusChapter = input.syllabusChapter ?? thread?.syllabusChapter ?? 'General';
    const syllabusTopic = input.syllabusTopic ?? thread?.syllabusTopic ?? 'General';

    // Call AI provider with syllabus context (no PII)
    const { messages, fallback } = this.promptBuilder.buildDoubtPrompt({
      syllabusClass,
      syllabusSubject,
      syllabusChapter,
      syllabusTopic,
      studentMessage: input.message,
      conversationHistory: history.slice(0, -1),
    });

    const aiResult = await this.aiProvider.chatCompletion(messages, 'feedback', fallback);

    // Persist AI response
    await this.doubtRepo.addMessage({
      threadId,
      role: MessageRole.AI,
      content: aiResult.content,
      aiModel: aiResult.fromFallback ? 'fallback' : aiResult.model,
    });

    return this.getThread(threadId, studentId);
  }
}

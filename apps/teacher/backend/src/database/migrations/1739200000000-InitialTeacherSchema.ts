import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from 'typeorm';

export class InitialTeacherSchema1739200000000 implements MigrationInterface {
  name = 'InitialTeacherSchema1739200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'teachers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'external_id', type: 'varchar', isUnique: true },
          { name: 'display_name', type: 'varchar' },
          { name: 'email', type: 'varchar', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'subjects', type: 'text', isNullable: true },
          { name: 'password_hash', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'classes',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'grade', type: 'varchar' },
          { name: 'section', type: 'varchar' },
          { name: 'subject', type: 'varchar' },
          { name: 'academic_year', type: 'varchar' },
          { name: 'teacher_id', type: 'uuid' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('classes', new TableIndex({ columnNames: ['grade', 'section', 'subject', 'academic_year'] }));
    await queryRunner.createIndex('classes', new TableIndex({ columnNames: ['teacher_id'] }));

    await queryRunner.createTable(
      new Table({
        name: 'class_sessions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'class_id', type: 'uuid' },
          { name: 'teacher_id', type: 'uuid' },
          { name: 'subject', type: 'varchar' },
          { name: 'scheduled_at', type: 'timestamp' },
          { name: 'duration_minutes', type: 'integer', default: 60 },
          { name: 'editable_until', type: 'timestamp' },
          { name: 'is_attendance_taken', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('class_sessions', new TableIndex({ columnNames: ['class_id', 'scheduled_at'] }));

    await queryRunner.createTable(
      new Table({
        name: 'class_students',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'class_id', type: 'uuid' },
          { name: 'student_id', type: 'varchar' },
          { name: 'student_name', type: 'varchar' },
          { name: 'roll_number', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'enrolled_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createUniqueConstraint('class_students', new TableUnique({ columnNames: ['class_id', 'student_id'] }));

    await queryRunner.createTable(
      new Table({
        name: 'attendance_records',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'class_session_id', type: 'uuid' },
          { name: 'student_id', type: 'varchar' },
          { name: 'status', type: 'varchar', default: "'absent'" },
          { name: 'notes', type: 'varchar', isNullable: true },
          { name: 'marked_by', type: 'varchar' },
          { name: 'marked_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createUniqueConstraint('attendance_records', new TableUnique({ columnNames: ['class_session_id', 'student_id'] }));

    await queryRunner.createTable(
      new Table({
        name: 'syllabus_documents',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'class_id', type: 'uuid' },
          { name: 'subject', type: 'varchar' },
          { name: 'file_name', type: 'varchar' },
          { name: 'file_type', type: 'varchar' },
          { name: 'storage_path', type: 'varchar' },
          { name: 'file_size_bytes', type: 'integer', default: 0 },
          { name: 'status', type: 'varchar', default: "'pending'" },
          { name: 'error_message', type: 'varchar', isNullable: true },
          { name: 'uploaded_by', type: 'varchar' },
          { name: 'class_date', type: 'date', isNullable: true },
          { name: 'duration_minutes', type: 'integer', default: 60 },
          { name: 'uploaded_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'lesson_sessions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'syllabus_document_id', type: 'uuid' },
          { name: 'class_id', type: 'uuid' },
          { name: 'subject', type: 'varchar' },
          { name: 'concept_summary', type: 'text' },
          { name: 'learning_objectives', type: 'text' },
          { name: 'has_numericals', type: 'boolean', default: false },
          { name: 'chapters', type: 'text', isNullable: true },
          { name: 'topics', type: 'text', isNullable: true },
          { name: 'raw_text', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'test_definitions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'class_id', type: 'uuid' },
          { name: 'subject', type: 'varchar' },
          { name: 'title', type: 'varchar' },
          { name: 'mode', type: 'varchar' },
          { name: 'status', type: 'varchar', default: "'draft'" },
          { name: 'total_marks', type: 'integer' },
          { name: 'duration_minutes', type: 'integer' },
          { name: 'question_types', type: 'text' },
          { name: 'lesson_session_id', type: 'uuid', isNullable: true },
          { name: 'scheduled_at', type: 'timestamp', isNullable: true },
          { name: 'created_by', type: 'varchar' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'test_questions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'test_definition_id', type: 'uuid' },
          { name: 'question_type', type: 'varchar' },
          { name: 'question_text', type: 'text' },
          { name: 'options', type: 'text', isNullable: true },
          { name: 'correct_answer', type: 'text' },
          { name: 'explanation', type: 'text', isNullable: true },
          { name: 'marks', type: 'integer' },
          { name: 'order_index', type: 'integer' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'test_attempts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'test_definition_id', type: 'uuid' },
          { name: 'student_id', type: 'varchar' },
          { name: 'status', type: 'varchar', default: "'in_progress'" },
          { name: 'started_at', type: 'timestamp' },
          { name: 'submitted_at', type: 'timestamp', isNullable: true },
          { name: 'total_marks', type: 'integer', default: 0 },
          { name: 'scored_marks', type: 'real', default: 0 },
          { name: 'attempted_count', type: 'integer', default: 0 },
          { name: 'not_attempted_count', type: 'integer', default: 0 },
          { name: 'answers', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createUniqueConstraint('test_attempts', new TableUnique({ columnNames: ['test_definition_id', 'student_id'] }));

    await queryRunner.createTable(
      new Table({
        name: 'offline_mark_entries',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'test_definition_id', type: 'uuid' },
          { name: 'student_id', type: 'varchar' },
          { name: 'section_label', type: 'varchar', isNullable: true },
          { name: 'question_index', type: 'integer', isNullable: true },
          { name: 'marks_obtained', type: 'real' },
          { name: 'max_marks', type: 'real' },
          { name: 'entered_by', type: 'varchar' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'notification_events',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'category', type: 'varchar' },
          { name: 'priority', type: 'varchar', default: "'medium'" },
          { name: 'title', type: 'varchar' },
          { name: 'body', type: 'text' },
          { name: 'recipient_role', type: 'varchar' },
          { name: 'recipient_id', type: 'varchar', isNullable: true },
          { name: 'payload', type: 'text', isNullable: true },
          { name: 'is_read', type: 'boolean', default: false },
          { name: 'is_delivered', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notification_events');
    await queryRunner.dropTable('offline_mark_entries');
    await queryRunner.dropTable('test_attempts');
    await queryRunner.dropTable('test_questions');
    await queryRunner.dropTable('test_definitions');
    await queryRunner.dropTable('lesson_sessions');
    await queryRunner.dropTable('syllabus_documents');
    await queryRunner.dropTable('attendance_records');
    await queryRunner.dropTable('class_students');
    await queryRunner.dropTable('class_sessions');
    await queryRunner.dropTable('classes');
    await queryRunner.dropTable('teachers');
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialAdminSchema1738368000000 implements MigrationInterface {
  name = 'InitialAdminSchema1738368000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_accounts" (
        "id" varchar PRIMARY KEY NOT NULL,
        "role" varchar(20) NOT NULL,
        "username" varchar,
        "mobile_number" varchar,
        "status" varchar(30) DEFAULT 'PENDING_APPROVAL',
        "must_change_mpin_on_first_login" boolean DEFAULT true,
        "mpin_hash" varchar,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_user_accounts_role" ON "user_accounts" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_accounts_status" ON "user_accounts" ("status")`);

    await queryRunner.query(`
      CREATE TABLE "grade_fee_configs" (
        "id" varchar PRIMARY KEY NOT NULL,
        "grade" integer NOT NULL,
        "academic_year" varchar(20) NOT NULL,
        "total_fee_amount" decimal(12,2) NOT NULL,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_grade_fee_configs_grade_year" ON "grade_fee_configs" ("grade", "academic_year")`);

    await queryRunner.query(`
      CREATE TABLE "extra_subject_fee_configs" (
        "id" varchar PRIMARY KEY NOT NULL,
        "student_id" varchar NOT NULL,
        "subject_code" varchar(50) NOT NULL,
        "extra_fee_amount" decimal(12,2) NOT NULL,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_extra_subject_student_subject" ON "extra_subject_fee_configs" ("student_id", "subject_code")`);

    await queryRunner.query(`
      CREATE TABLE "fee_payments" (
        "id" varchar PRIMARY KEY NOT NULL,
        "student_id" varchar NOT NULL,
        "amount_paid" decimal(12,2) NOT NULL,
        "payment_date" date NOT NULL,
        "payment_mode" varchar(30) NOT NULL,
        "reference" varchar,
        "recorded_by_admin_id" varchar,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_fee_payments_student_date" ON "fee_payments" ("student_id", "payment_date")`);

    await queryRunner.query(`
      CREATE TABLE "student_fee_summary" (
        "studentId" varchar NOT NULL,
        "academic_year" varchar(20) NOT NULL,
        "base_fee_amount" decimal(12,2) DEFAULT 0,
        "extra_fee_amount" decimal(12,2) DEFAULT 0,
        "total_fee_amount" decimal(12,2) DEFAULT 0,
        "total_paid_amount" decimal(12,2) DEFAULT 0,
        "balance_amount" decimal(12,2) DEFAULT 0,
        "last_payment_date" date,
        "updated_at" timestamp NOT NULL,
        PRIMARY KEY ("studentId", "academic_year")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "payment_info_config" (
        "id" varchar PRIMARY KEY NOT NULL,
        "qr_image_url" varchar,
        "upi_id" varchar,
        "bank_name" varchar,
        "account_name" varchar,
        "account_number" varchar,
        "ifsc_code" varchar,
        "updated_by_admin_id" varchar,
        "updated_at" timestamp NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "admin_audit_logs" (
        "id" varchar PRIMARY KEY NOT NULL,
        "admin_id" varchar NOT NULL,
        "entity_type" varchar(30) NOT NULL,
        "entity_id" varchar NOT NULL,
        "action" varchar(30) NOT NULL,
        "before_state" text,
        "after_state" text,
        "created_at" timestamp NOT NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_admin_audit_entity" ON "admin_audit_logs" ("entity_type", "entity_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_admin_audit_created" ON "admin_audit_logs" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admin_audit_logs"`);
    await queryRunner.query(`DROP TABLE "payment_info_config"`);
    await queryRunner.query(`DROP TABLE "student_fee_summary"`);
    await queryRunner.query(`DROP TABLE "fee_payments"`);
    await queryRunner.query(`DROP TABLE "extra_subject_fee_configs"`);
    await queryRunner.query(`DROP TABLE "grade_fee_configs"`);
    await queryRunner.query(`DROP TABLE "user_accounts"`);
  }
}

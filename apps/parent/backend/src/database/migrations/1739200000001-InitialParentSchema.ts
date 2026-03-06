import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialParentSchema1739200000001 implements MigrationInterface {
  name = 'InitialParentSchema1739200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'parent_accounts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'mobile_number', type: 'varchar', isUnique: true },
          { name: 'mpin_hash', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'relationship', type: 'varchar', length: '20' },
          { name: 'linked_student_id', type: 'varchar' },
          { name: 'student_external_id', type: 'varchar', isNullable: true },
          { name: 'status', type: 'varchar', length: '20', default: "'ACTIVE'" },
          { name: 'created_by_admin_id', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('parent_accounts', new TableIndex({ columnNames: ['mobile_number'] }));
    await queryRunner.createIndex('parent_accounts', new TableIndex({ columnNames: ['linked_student_id'] }));

    await queryRunner.createTable(
      new Table({
        name: 'parent_login_attempts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'parent_id', type: 'varchar' },
          { name: 'success', type: 'boolean' },
          { name: 'ip', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('parent_login_attempts', new TableIndex({ columnNames: ['parent_id'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('parent_login_attempts');
    await queryRunner.dropTable('parent_accounts');
  }
}

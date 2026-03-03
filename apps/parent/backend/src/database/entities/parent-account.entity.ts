import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type ParentRelationship = 'FATHER' | 'MOTHER' | 'GUARDIAN';
export type ParentStatus = 'ACTIVE' | 'DISABLED';

@Entity('parent_accounts')
export class ParentAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mobile_number', unique: true })
  @Index()
  mobileNumber: string;

  @Column({ name: 'mpin_hash' })
  mpinHash: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 20 })
  relationship: ParentRelationship;

  /** Links to Student backend student.id (UUID) */
  @Column({ name: 'linked_student_id' })
  @Index()
  linkedStudentId: string;

  /** Teacher API studentId (externalId e.g. 12131). Required for Teacher sync. */
  @Column({ name: 'student_external_id', type: 'varchar', nullable: true })
  studentExternalId: string | null;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: ParentStatus;

  @Column({ name: 'created_by_admin_id', type: 'varchar', nullable: true })
  createdByAdminId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

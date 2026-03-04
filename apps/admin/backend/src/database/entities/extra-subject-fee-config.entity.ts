import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('extra_subject_fee_configs')
@Index(['studentId', 'subjectCode'], { unique: true })
export class ExtraSubjectFeeConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id' })
  @Index()
  studentId: string;

  @Column({ name: 'subject_code', type: 'varchar', length: 50 })
  @Index()
  subjectCode: string;

  @Column({ name: 'extra_fee_amount', type: 'decimal', precision: 12, scale: 2 })
  extraFeeAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

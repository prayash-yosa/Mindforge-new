import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('student_fee_summary')
@Index(['studentId', 'academicYear'], { unique: true })
export class StudentFeeSummaryEntity {
  @PrimaryColumn('uuid')
  studentId: string;

  @PrimaryColumn({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'base_fee_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  baseFeeAmount: number;

  @Column({ name: 'extra_fee_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  extraFeeAmount: number;

  @Column({ name: 'total_fee_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalFeeAmount: number;

  @Column({ name: 'total_paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPaidAmount: number;

  @Column({ name: 'balance_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  balanceAmount: number;

  @Column({ name: 'last_payment_date', type: 'date', nullable: true })
  lastPaymentDate: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

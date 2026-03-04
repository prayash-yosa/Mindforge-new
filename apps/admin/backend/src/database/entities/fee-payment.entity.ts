import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('fee_payments')
@Index(['studentId', 'paymentDate'])
export class FeePaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id' })
  @Index()
  studentId: string;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 12, scale: 2 })
  amountPaid: number;

  @Column({ name: 'payment_date', type: 'date' })
  @Index()
  paymentDate: Date;

  @Column({ name: 'payment_mode', type: 'varchar', length: 30 })
  paymentMode: string;

  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ name: 'recorded_by_admin_id', type: 'varchar', nullable: true })
  recordedByAdminId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

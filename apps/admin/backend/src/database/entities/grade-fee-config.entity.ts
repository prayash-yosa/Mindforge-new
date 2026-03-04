import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('grade_fee_configs')
@Index(['grade', 'academicYear'], { unique: true })
export class GradeFeeConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  @Index()
  grade: number;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  @Index()
  academicYear: string;

  @Column({ name: 'total_fee_amount', type: 'decimal', precision: 12, scale: 2 })
  totalFeeAmount: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

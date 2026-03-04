import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payment_info_config')
export class PaymentInfoConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'qr_image_url', type: 'varchar', nullable: true })
  qrImageUrl: string | null;

  @Column({ name: 'upi_id', type: 'varchar', nullable: true })
  upiId: string | null;

  @Column({ name: 'bank_name', type: 'varchar', nullable: true })
  bankName: string | null;

  @Column({ name: 'account_name', type: 'varchar', nullable: true })
  accountName: string | null;

  @Column({ name: 'account_number', type: 'varchar', nullable: true })
  accountNumber: string | null;

  @Column({ name: 'ifsc_code', type: 'varchar', nullable: true })
  ifscCode: string | null;

  @Column({ name: 'updated_by_admin_id', type: 'varchar', nullable: true })
  updatedByAdminId: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

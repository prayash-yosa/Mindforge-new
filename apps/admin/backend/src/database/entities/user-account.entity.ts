import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type UserStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'DISABLED' | 'DELETED' | 'REJECTED';

@Entity('user_accounts')
export class UserAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  role: string;

  @Column({ name: 'username', type: 'varchar', nullable: true })
  username: string | null;

  @Column({ name: 'mobile_number', type: 'varchar', nullable: true })
  @Index()
  mobileNumber: string | null;

  @Column({ type: 'varchar', length: 30, default: 'PENDING_APPROVAL' })
  @Index()
  status: UserStatus;

  @Column({ name: 'must_change_mpin_on_first_login', type: 'boolean', default: true })
  mustChangeMpinOnFirstLogin: boolean;

  @Column({ name: 'mpin_hash', type: 'varchar', nullable: true })
  mpinHash: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

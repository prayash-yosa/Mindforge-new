import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('admin_audit_logs')
@Index(['entityType', 'entityId'])
@Index(['createdAt'])
export class AdminAuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'admin_id' })
  @Index()
  adminId: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 30 })
  @Index()
  entityType: string;

  @Column({ name: 'entity_id', type: 'varchar' })
  @Index()
  entityId: string;

  @Column({ type: 'varchar', length: 30 })
  action: string;

  @Column({ name: 'before_state', type: 'text', nullable: true })
  beforeState: string | null;

  @Column({ name: 'after_state', type: 'text', nullable: true })
  afterState: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

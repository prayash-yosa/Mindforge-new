import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentLoginAttemptEntity } from '../entities/parent-login-attempt.entity';

@Injectable()
export class LoginAttemptRepository {
  constructor(
    @InjectRepository(ParentLoginAttemptEntity)
    private readonly repo: Repository<ParentLoginAttemptEntity>,
  ) {}

  async create(data: Partial<ParentLoginAttemptEntity>): Promise<ParentLoginAttemptEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async countRecentFailures(parentId: string, since: Date): Promise<number> {
    return this.repo
      .createQueryBuilder('a')
      .where('a.parent_id = :parentId', { parentId })
      .andWhere('a.success = :success', { success: false })
      .andWhere('a.created_at >= :since', { since })
      .getCount();
  }
}

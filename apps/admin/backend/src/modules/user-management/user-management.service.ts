import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccountEntity } from '../../database/entities';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(UserAccountEntity)
    private readonly userRepo: Repository<UserAccountEntity>,
  ) {}

  async listPending(role?: string) {
    const qb = this.userRepo
      .createQueryBuilder('u')
      .where('u.status = :status', { status: 'PENDING_APPROVAL' });
    if (role) qb.andWhere('u.role = :role', { role });
    return qb.getMany();
  }

  async approve(id: string, adminId: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    if (user.status !== 'PENDING_APPROVAL') return null;
    user.status = 'ACTIVE';
    user.mustChangeMpinOnFirstLogin = true;
    await this.userRepo.save(user);
    return user;
  }

  async reject(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    user.status = 'REJECTED';
    await this.userRepo.save(user);
    return user;
  }

  async activate(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    user.status = 'ACTIVE';
    await this.userRepo.save(user);
    return user;
  }

  async deactivate(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    user.status = 'DISABLED';
    await this.userRepo.save(user);
    return user;
  }
}

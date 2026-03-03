import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentAccountEntity } from '../entities/parent-account.entity';

@Injectable()
export class ParentRepository {
  constructor(
    @InjectRepository(ParentAccountEntity)
    private readonly repo: Repository<ParentAccountEntity>,
  ) {}

  async findByMobile(mobileNumber: string): Promise<ParentAccountEntity | null> {
    return this.repo.findOne({
      where: { mobileNumber: mobileNumber.trim(), status: 'ACTIVE' },
    });
  }

  async findById(id: string): Promise<ParentAccountEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<ParentAccountEntity>): Promise<ParentAccountEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async countActiveParentsForStudent(linkedStudentId: string): Promise<number> {
    return this.repo.count({
      where: { linkedStudentId, status: 'ACTIVE' },
    });
  }
}

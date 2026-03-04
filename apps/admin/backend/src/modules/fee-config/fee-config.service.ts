import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeFeeConfigEntity, ExtraSubjectFeeConfigEntity } from '../../database/entities';

@Injectable()
export class FeeConfigService {
  constructor(
    @InjectRepository(GradeFeeConfigEntity)
    private readonly gradeFeeRepo: Repository<GradeFeeConfigEntity>,
    @InjectRepository(ExtraSubjectFeeConfigEntity)
    private readonly extraFeeRepo: Repository<ExtraSubjectFeeConfigEntity>,
  ) {}

  async listGradeConfigs(academicYear?: string) {
    const qb = this.gradeFeeRepo.createQueryBuilder('g').where('g.is_active = 1');
    if (academicYear) qb.andWhere('g.academic_year = :year', { year: academicYear });
    return qb.getMany();
  }

  async createGradeConfig(dto: { grade: number; academicYear: string; totalFeeAmount: number }) {
    const config = this.gradeFeeRepo.create(dto);
    return this.gradeFeeRepo.save(config);
  }

  async listExtraConfigs(studentId: string) {
    return this.extraFeeRepo.find({ where: { studentId } });
  }
}

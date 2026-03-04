import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccountEntity, PaymentInfoConfigEntity, StudentFeeSummaryEntity } from '../../database/entities';

@Injectable()
export class IntegrationService {
  constructor(
    @InjectRepository(UserAccountEntity)
    private readonly userRepo: Repository<UserAccountEntity>,
    @InjectRepository(PaymentInfoConfigEntity)
    private readonly paymentInfoRepo: Repository<PaymentInfoConfigEntity>,
    @InjectRepository(StudentFeeSummaryEntity)
    private readonly summaryRepo: Repository<StudentFeeSummaryEntity>,
  ) {}

  async getUserStatus(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    return {
      status: user.status,
      isApproved: user.status === 'ACTIVE',
      mustChangeMpinOnFirstLogin: user.mustChangeMpinOnFirstLogin,
    };
  }

  async getPaymentInfo() {
    return this.paymentInfoRepo.findOne({ where: {}, order: { updatedAt: 'DESC' } });
  }

  async getFeeSummary(studentId: string, academicYear: string) {
    return this.summaryRepo.findOne({ where: { studentId, academicYear } });
  }
}

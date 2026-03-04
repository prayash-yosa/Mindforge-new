import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentInfoConfigEntity } from '../../database/entities';

@Injectable()
export class PaymentInfoService {
  constructor(
    @InjectRepository(PaymentInfoConfigEntity)
    private readonly paymentInfoRepo: Repository<PaymentInfoConfigEntity>,
  ) {}

  async getPaymentInfo() {
    const config = await this.paymentInfoRepo.findOne({ where: {}, order: { updatedAt: 'DESC' } });
    return config;
  }

  async updatePaymentInfo(dto: Partial<PaymentInfoConfigEntity>) {
    let config = await this.paymentInfoRepo.findOne({ where: {} });
    if (!config) {
      config = this.paymentInfoRepo.create(dto);
    } else {
      Object.assign(config, dto);
    }
    config.updatedByAdminId = 'admin';
    return this.paymentInfoRepo.save(config);
  }
}

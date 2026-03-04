import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentInfoService } from './payment-info.service';

@Controller('admin/payment-info')
export class PaymentInfoController {
  constructor(private readonly paymentInfoService: PaymentInfoService) {}

  @Get()
  async getPaymentInfo() {
    const data = await this.paymentInfoService.getPaymentInfo();
    return { data };
  }

  @Post()
  async updatePaymentInfo(
    @Body()
    body: {
      qrImageUrl?: string;
      upiId?: string;
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      ifscCode?: string;
    },
  ) {
    const data = await this.paymentInfoService.updatePaymentInfo(body);
    return { data };
  }
}

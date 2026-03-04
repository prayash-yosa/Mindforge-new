import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PaymentEntryService } from './payment-entry.service';

@Controller('admin/fees')
export class PaymentEntryController {
  constructor(private readonly paymentService: PaymentEntryService) {}

  @Get('payments/:studentId')
  async listPayments(@Param('studentId') studentId: string, @Query('academicYear') academicYear?: string) {
    const data = await this.paymentService.listPayments(studentId, academicYear);
    return { data };
  }

  @Post('payments')
  async createPayment(
    @Body()
    body: {
      studentId: string;
      amountPaid: number;
      paymentDate: string;
      paymentMode: string;
      reference?: string;
      academicYear?: string;
    },
  ) {
    const data = await this.paymentService.createPayment(body);
    return { data };
  }

  @Get('summary/:studentId')
  async getSummary(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear: string,
  ) {
    const data = await this.paymentService.getSummary(studentId, academicYear ?? '2025-26');
    return { data };
  }

  @Get('kpis')
  async getKpis() {
    const data = await this.paymentService.getKpis();
    return { data };
  }
}

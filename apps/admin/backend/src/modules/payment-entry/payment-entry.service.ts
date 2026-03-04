import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeePaymentEntity, StudentFeeSummaryEntity } from '../../database/entities';

@Injectable()
export class PaymentEntryService {
  constructor(
    @InjectRepository(FeePaymentEntity)
    private readonly paymentRepo: Repository<FeePaymentEntity>,
    @InjectRepository(StudentFeeSummaryEntity)
    private readonly summaryRepo: Repository<StudentFeeSummaryEntity>,
  ) {}

  async listPayments(studentId: string, academicYear?: string) {
    const qb = this.paymentRepo.createQueryBuilder('p').where('p.student_id = :id', { id: studentId });
    return qb.orderBy('p.payment_date', 'DESC').getMany();
  }

  async createPayment(dto: {
    studentId: string;
    amountPaid: number;
    paymentDate: string;
    paymentMode: string;
    reference?: string;
    academicYear?: string;
  }) {
    const payment = this.paymentRepo.create({
      studentId: dto.studentId,
      amountPaid: dto.amountPaid,
      paymentDate: new Date(dto.paymentDate),
      paymentMode: dto.paymentMode,
      reference: dto.reference,
      recordedByAdminId: 'admin',
    });
    return this.paymentRepo.save(payment);
  }

  async getSummary(studentId: string, academicYear: string) {
    return this.summaryRepo.findOne({
      where: { studentId, academicYear },
    });
  }

  async getKpis() {
    const summaries = await this.summaryRepo.find();
    const outstanding = summaries.reduce((s, r) => s + Number(r.balanceAmount || 0), 0);
    const now = new Date();
    const thisMonth = now.getFullYear() * 100 + (now.getMonth() + 1);
    const payments = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount_paid)', 'total')
      .where("strftime('%Y%m', p.payment_date) = :m", { m: String(thisMonth) })
      .getRawOne();
    return {
      totalOutstanding: outstanding,
      paymentsThisMonth: Number(payments?.total ?? 0),
    };
  }
}

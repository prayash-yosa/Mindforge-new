import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ChildFeesSummaryDto, PayInfoDto } from '@mindforge/shared';

export interface FeesHistoryEntry {
  date: string;
  amount: number;
  mode?: string;
}

@Injectable()
export class FeesService {
  constructor(private readonly config: ConfigService) {}

  getSummary(): ChildFeesSummaryDto {
    const fees = this.config.get<{ total?: number; paid?: number }>('fees') ?? {};
    const total = fees.total ?? 50000;
    const paid = fees.paid ?? 25000;
    const balance = Math.max(0, total - paid);
    return {
      total,
      paid,
      balance,
      lastPaymentDate: paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
    };
  }

  getHistory(): FeesHistoryEntry[] {
    const fees = this.config.get<{ paid?: number }>('fees') ?? {};
    const paid = fees.paid ?? 25000;
    if (paid <= 0) return [];
    return [
      {
        date: new Date().toISOString().split('T')[0],
        amount: paid,
        mode: 'Bank Transfer',
      },
    ];
  }

  getPayInfo(): PayInfoDto {
    const p = this.config.get<Record<string, string>>('payInfo') ?? {};
    return {
      qrCodeUrl: p.qrCodeUrl ?? '',
      upiId: p.upiId ?? 'school@upi',
      bankName: p.bankName ?? 'Example Bank',
      accountName: p.accountName ?? 'School Account',
      accountNumber: p.accountNumber ?? '1234567890',
      ifsc: p.ifsc ?? 'EXMP0001234',
    };
  }
}

/**
 * Mindforge Shared — Admin API DTOs
 *
 * Used by Admin frontend/backend and other apps for cross-app contracts.
 */

export enum UserStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  DELETED = 'DELETED',
  REJECTED = 'REJECTED',
}

export enum PaymentMode {
  CASH = 'CASH',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export interface AdminUserApprovalDto {
  id: string;
  role: string;
  username?: string;
  mobileNumber?: string;
  status: UserStatus;
  mustChangeMpinOnFirstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFeeConfigDto {
  id: string;
  grade: number;
  academicYear: string;
  totalFeeAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminExtraSubjectFeeConfigDto {
  id: string;
  studentId: string;
  subjectCode: string;
  extraFeeAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentRecordDto {
  id: string;
  studentId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMode: PaymentMode | string;
  reference?: string;
  recordedByAdminId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentInfoDto {
  id: string;
  qrImageUrl?: string;
  upiId?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  updatedByAdminId?: string;
  updatedAt: string;
}

export interface AdminStudentFeeSummaryDto {
  studentId: string;
  academicYear: string;
  baseFeeAmount: number;
  extraFeeAmount: number;
  totalFeeAmount: number;
  totalPaidAmount: number;
  balanceAmount: number;
  lastPaymentDate?: string;
}

export interface AdminAuditLogDto {
  id: string;
  adminId: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeState?: string;
  afterState?: string;
  createdAt: string;
}

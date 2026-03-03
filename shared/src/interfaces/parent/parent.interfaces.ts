/**
 * Mindforge Shared — Parent API DTOs
 *
 * Used by Parent frontend and backend; Gateway for type consistency.
 */

export interface ParentProfileDto {
  id: string;
  name: string;
  mobileNumber: string;
  relationship: string;
  status: string;
}

export interface ChildSummaryDto {
  linkedStudentId: string;
  name: string;
  class: string;
  section: string;
}

export interface ParentDashboardDto {
  latestTest: {
    subject: string;
    testName: string;
    childMarks: number;
    highestMarks: number;
    message?: string;
  } | null;
  attendanceThisMonth: {
    percent: number;
    present: number;
    total: number;
  };
  feesSummary: {
    total: number;
    paid: number;
    balance: number;
    lastPaymentDate?: string;
  };
}

export interface ChildProgressTestDto {
  testId: string;
  testName: string;
  subject: string;
  date: string;
  childMarks: number;
  highestMarks: number;
  lowestMarks: number;
  topScorerName?: string;
  bottomScorerName?: string;
}

export interface ChildAttendanceSummaryDto {
  period: { startDate: string; endDate: string };
  present: number;
  absent: number;
  total: number;
  percent: number;
  absentDates?: string[];
}

export interface ChildFeesSummaryDto {
  total: number;
  paid: number;
  balance: number;
  lastPaymentDate?: string;
}

export interface PayInfoDto {
  qrCodeUrl?: string;
  upiId?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifsc?: string;
}

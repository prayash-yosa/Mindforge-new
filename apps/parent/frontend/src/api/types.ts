/** Standard API response wrapper */
export interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: string;
  tokenType: string;
}

export interface ParentProfile {
  parent: { id: string; name: string; mobileNumber: string; relationship: string; status: string };
  child: { linkedStudentId: string; name: string; class: string; section: string };
}

export interface ParentDashboard {
  latestTest: {
    subject: string;
    testName: string;
    childMarks: number;
    highestMarks: number;
    message?: string;
  } | null;
  attendanceThisMonth: { percent: number; present: number; total: number };
  feesSummary: { total: number; paid: number; balance: number; lastPaymentDate?: string };
}

export interface ChildProgressTest {
  testId: string;
  testName: string;
  subject: string;
  date: string;
  childMarks: number;
  highestMarks: number;
  lowestMarks: number;
}

export interface ChildAttendanceSummary {
  period: { startDate: string; endDate: string };
  present: number;
  absent: number;
  total: number;
  percent: number;
  absentDates?: string[];
}

export interface ChildFeesSummary {
  total: number;
  paid: number;
  balance: number;
  lastPaymentDate?: string;
}

export interface PayInfo {
  qrCodeUrl?: string;
  upiId?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifsc?: string;
}

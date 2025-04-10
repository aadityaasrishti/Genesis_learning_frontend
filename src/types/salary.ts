export enum SalaryType {
  FIXED = "FIXED",
  COMMISSION_BASED = "COMMISSION_BASED",
}

export enum PaymentMode {
  CASH = "CASH",
  CHEQUE = "CHEQUE",
  ONLINE = "ONLINE",
  BANK_TRANSFER = "BANK_TRANSFER",
  UPI = "UPI",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export interface TeacherSalaryConfig {
  id: number;
  teacher_id: number;
  salary_type: SalaryType;
  base_amount?: number;
  commission_rate?: number;
  class_specific_rates?: string; // JSON string storing class-wise commission rates
  effective_from: Date;
  effective_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CommissionDetails {
  classDetails: {
    classId: string;
    studentCount: number;
    commissionRate: number;
    totalCommission: number;
  }[];
  totalStudentCount: number;
  totalCommission: number;
}

export interface SalaryPayment {
  id: number;
  teacher_id: number;
  salary_id: number;
  amount: number;
  month: Date;
  commission_details?: CommissionDetails;
  payment_date: Date;
  payment_status: PaymentStatus;
  payment_mode: PaymentMode;
  transaction_id?: string;
  remarks?: string;
  teacher_salary: TeacherSalaryConfig;
}

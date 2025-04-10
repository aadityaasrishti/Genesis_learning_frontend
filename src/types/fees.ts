export interface FeeStructure {
  id: number;
  class_id: string;
  subject: string | null;
  amount: number;
  payment_type: "ONE_TIME" | "INSTALLMENT" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeePayment {
  id: number;
  student_id: number;
  fee_structure_id: number;
  amount_paid: number;
  payment_date: string;
  payment_mode: "CASH" | "CHEQUE" | "ONLINE" | "BANK_TRANSFER" | "UPI";
  transaction_id?: string;
  receipt_number: string;
  payment_status: "PAID" | "PARTIALLY_PAID" | "PENDING" | "CANCELLED";
  discount_amount?: number;
  discount_reason?: string;
  month: string;
  created_at: string;
  updated_at: string;
  student: {
    user: {
      name: string;
    };
    class_id: string;
  };
  fee_structure: FeeStructure;
}

export interface FeeReport {
  payments: FeePayment[];
  summary: {
    total_collected: number;
    total_students: number;
    payment_modes: Record<string, number>;
  };
}

export interface StudentFeeDetails {
  payments: FeePayment[];
  summary: {
    total_paid: number;
    total_due: number;
  };
}

export interface FeeRefund {
  id: number;
  payment_id: number;
  amount: number;
  reason: string;
  refund_date: string;
  status: "PENDING" | "PROCESSED" | "REJECTED";
  created_at: string;
  updated_at: string;
}

export interface FeeReminder {
  id: number;
  student_id: number;
  payment_id?: number;
  reminder_type: "DUE_DATE" | "OVERDUE" | "GENERAL";
  message: string;
  sent_at: string;
  created_at: string;
  updated_at: string;
}

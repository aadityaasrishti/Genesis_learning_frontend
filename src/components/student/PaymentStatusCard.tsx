import type { FeePayment } from '../../types/fees';

export interface StudentPayment {
  id: number;
  student_id: number;
  student_name: string;
  fee_structure_id: number;
  class_id: string;
  amount_paid: number;
  total_amount: number;
  payment_date: string;
  payment_mode: "CASH" | "CHEQUE" | "ONLINE" | "BANK_TRANSFER" | "UPI";
  transaction_id?: string;
  receipt_number: string;
  status: "PAID" | "PARTIALLY_PAID" | "PENDING" | "CANCELLED";
  discount_amount?: number;
  discount_reason?: string;
  month: string;
  created_at: string;
  updated_at: string;
}

const transformPayment = (payment: StudentPayment): FeePayment => ({
  ...payment,
  student: {
    user: {
      name: payment.student_name,
    },
    class_id: payment.class_id,
  },
  fee_structure: {
    id: payment.fee_structure_id,
    amount: payment.total_amount,
    payment_type: "MONTHLY",
    class_id: payment.class_id,
    subject: null,
    valid_from: payment.created_at,
    valid_until: null,
    created_at: payment.created_at,
    updated_at: payment.updated_at
  },
  payment_status: payment.status,
});

export default transformPayment;
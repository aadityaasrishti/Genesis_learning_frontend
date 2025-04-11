import api from "./api";
import type { FeePayment } from "../types/fees";


export type PaymentType =
  | "ONE_TIME"
  | "INSTALLMENT"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

export interface CreateFeeStructureInput {
  class_id: string;
  subject: string;
  amount: number;
  payment_type: PaymentType;
  valid_from: string;
  valid_until?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}


// Get all fee structures
export async function getFeeStructures() {
  const response = await api.get("/fees/structures");
  return response.data;
}

// Create new fee structure
export async function createFeeStructure(data: CreateFeeStructureInput) {
  const response = await api.post("/fees/structure", data);
  return response.data;
}

// Delete fee structure
export async function deleteFeeStructure(id: number) {
  const response = await api.delete(`/fees/structures/${id}`);
  return response.data;
}

// Process fee payment
export async function processFeePayment(data: any) {
  const response = await api.post("/fees/payments", data);
  return response.data;
}

// Get payment status by class
export async function getFeePaymentStatus(classId: string = "") {
  console.log("[FeeService] Getting fee payment status:", { classId });
  try {
    const response = await api.get("/fees/status", {
      params: { class_id: classId },
    });
    console.log("[FeeService] Successfully retrieved payment status:", {
      count: response.data.length,
      classId: classId || 'all'
    });
    return response.data;
  } catch (error: any) {
    console.error("[FeeService] Failed to get payment status:", {
      classId,
      error: error.message,
      status: error.response?.status,
      details: error.response?.data?.message
    });
    throw {
      message: error.response?.data?.message || "Failed to fetch payment status. Please try again later.",
      statusCode: error.response?.status || 500,
      classId
    };
  }
}

// Get fee payment report
export async function getFeeReports(filters: {
  start_date: string;
  end_date: string;
  class_id: string;
  payment_mode: string;
  payment_status: string;
}) {
  const response = await api.get("/fees/reports", { params: filters });
  return response.data;
}

// Get student fee details
export const getStudentFeeDetails = async (studentId: number) => {
  const response = await api.get(`/fees/student/${studentId}`);
  return response.data;
};

// Get student fee details by ID
export async function getStudentFeeDetailsById(studentId: number) {
  console.log("[FeeService] Getting student fee details:", { studentId });
  try {
    const response = await api.get(`/fees/student/${studentId}`);
    // Transform the response data
    return {
      student: response.data.student,
      fee_structure: response.data.fee_structure,
      payments: response.data.student?.fee_payments || [],
      summary: {
        total_paid: response.data.student?.fee_payments?.reduce(
          (sum: number, payment: any) => sum + payment.amount_paid,
          0
        ) || 0,
        total_due: response.data.fee_structure?.amount 
          ? Math.max(
              0,
              response.data.fee_structure.amount -
                (response.data.student?.fee_payments?.reduce(
                  (sum: number, payment: any) => sum + payment.amount_paid,
                  0
                ) || 0)
            )
          : 0
      }
    };
  } catch (error: any) {
    console.error("[FeeService] Failed to get student fee details:", {
      studentId,
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
}

// Cancel fee payment
export const cancelFeePayment = async (paymentId: number, reason: string) => {
  const response = await api.post(`/fees/payments/${paymentId}/cancel`, {
    reason,
  });
  return response.data;
};

// Process fee refund
export async function processFeeRefund(
  paymentId: number,
  amount: number,
  reason: string
) {
  const response = await api.post(`/fees/payments/${paymentId}/refund`, {
    amount,
    reason,
  });
  return response.data;
}

// Get fee payment receipt
export const getFeePaymentReceipt = async (paymentId: number) => {
  console.log("[FeeService] Getting payment receipt:", { paymentId });
  try {
    const response = await api.get(`/fees/payments/${paymentId}/receipt`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error: any) {
    console.error("[FeeService] Failed to get payment receipt:", {
      paymentId,
      error: error.message,
      status: error.response?.status
    });
    throw {
      message: error.response?.data?.message || "Failed to fetch fee receipt",
      statusCode: error.response?.status || 500,
    };
  }
};

export const getFeeReceipt = async (paymentId: number): Promise<FeePayment> => {
  console.log("[FeeService] Getting fee receipt:", { paymentId });
  try {
    const response = await api.get(`/fees/receipt/${paymentId}`);
    return response.data;
  } catch (error: any) {
    console.error("[FeeService] Failed to get fee receipt:", {
      paymentId,
      error: error.message,
      status: error.response?.status
    });
    throw {
      message: error.response?.data?.message || "Failed to fetch fee receipt",
      statusCode: error.response?.status || 500,
    };
  }
};

export async function getAllPayments() {
  console.log("[FeeService] Getting all payments");
  try {
    const response = await api.get("/fees/payments");
    console.log("[FeeService] Successfully retrieved payments:", { 
      count: response.data.length 
    });
    return response.data;
  } catch (error: any) {
    console.error("[FeeService] Failed to get all payments:", {
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
}

export async function getStudentsByClass(classId: string) {
  console.log("[FeeService] Getting students by class:", { classId });
  try {
    const response = await api.get(`/fees/students-by-class/${classId}`);
    console.log("[FeeService] Successfully retrieved students:", { 
      classId,
      count: response.data.length 
    });
    return response.data;
  } catch (error: any) {
    console.error("[FeeService] Failed to get students by class:", {
      classId,
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
}

// Send fee reminder
export async function sendFeeReminder(studentId: number, data: {
  student_id: number;
  payment_id: number;
  reminder_type: "DUE_DATE" | "OVERDUE" | "FINAL_NOTICE";
  message: string;
}) {
  console.log("[FeeService] Sending fee reminder:", {
    studentId,
    paymentId: data.payment_id,
    type: data.reminder_type
  });
  try {
    const response = await api.post(`/fees/reminders/${studentId}`, data);
    return response.data;
  } catch (error: any) {
    console.error("[FeeService] Failed to send fee reminder:", {
      studentId,
      paymentId: data.payment_id,
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
}

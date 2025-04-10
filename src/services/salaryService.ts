import api from "./api";
import { TeacherSalaryConfig, SalaryPayment } from "../types/salary";

// Custom error type that includes code property
class SalaryError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'SalaryError';
    this.code = code;
  }
}

export const salaryService = {
  setTeacherSalary: async (salaryConfig: Partial<TeacherSalaryConfig>) => {
    try {
      const response = await api.post("/salary/teacher/config", salaryConfig);
      return response.data;
    } catch (err: any) {
      throw new SalaryError(
        err.response?.data?.message || "Failed to set salary configuration"
      );
    }
  },

  calculateCommission: async (teacher_id: number, month: Date) => {
    try {
      const response = await api.post("/salary/teacher/calculate-commission", {
        teacher_id,
        month,
      });
      return response.data;
    } catch (err: any) {
      throw new SalaryError(
        err.response?.data?.message || "Failed to calculate commission"
      );
    }
  },

  processSalaryPayment: async (payment: Partial<SalaryPayment>) => {
    try {
      const response = await api.post("/salary/teacher/payment", payment);
      return response.data;
    } catch (err: any) {
      throw new SalaryError(
        err.response?.data?.message || "Failed to process salary payment"
      );
    }
  },

  getTeacherSalaryHistory: async (
    teacher_id: number,
    start_date?: Date,
    end_date?: Date
  ) => {
    try {
      const params = new URLSearchParams();
      if (start_date) params.append("start_date", start_date.toISOString());
      if (end_date) params.append("end_date", end_date.toISOString());

      const response = await api.get(
        `/salary/teacher/${teacher_id}/history?${params}`
      );
      return response.data;
    } catch (err: any) {
      throw new SalaryError(
        err.response?.data?.message || "Failed to fetch salary history"
      );
    }
  },

  getCurrentSalaryConfig: async (teacher_id: number) => {
    try {
      const response = await api.get(`/salary/teacher/${teacher_id}/config`);
      return response.data;
    } catch (err: any) {
      // Create a new SalaryError with both message and code
      throw new SalaryError(
        err.response?.data?.message || "Failed to fetch salary configuration",
        err.response?.data?.code
      );
    }
  },
};

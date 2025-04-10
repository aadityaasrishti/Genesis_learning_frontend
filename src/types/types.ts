// types.ts
import { SalaryType } from "./salary";

export interface Student {
  id: number;
  user_id: number;
  class_id: string;
  enrollment_date: string;
  mobile: string;
  guardian_name: string;
  guardian_mobile: string;
  subjects: string;
  address: string;
  date_of_birth: string;
  fee_structure_id: number | null;
  user: User;
}

export interface Teacher {
  id: number;
  user_id: number;
  subject: string;
  class_assigned: string;
  mobile: string;
  salary: number;
  salary_type?: SalaryType;
  commission_rate?: number;
  user: User;
}

export interface SupportStaff {
  id: number;
  user_id: number;
  department: string;
  mobile: string;
  salary: number;
  user: User;
}

export interface User {
  user_id: number;
  email: string;
  name: string;
  mobile: string;
  role?: string;
  class?: string;
  subjects?: string;
  requested_class?: string;
  requested_subjects?: string;
  guardian_name?: string;
  plan_status?: string;
  demo_user_flag?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  is_active?: boolean;
  inactivation_date?: string;
  profile_image_url?: string | null;
  student?: Student;
  teacher?: Teacher;
  adminSupportStaff?: AdminStaff;
  inactiveUser?: InactiveUser;
}

export interface Feedback {
  id: number;
  from_id: number;
  to_id: number;
  message: string;
  rating: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  from_user: {
    name: string;
    role: string;
  };
  to_user: {
    name: string;
    role: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: string;
}

export interface AdminStaff {
  id: number;
  user_id: number;
  department: string;
  salary: number;
  mobile: string;
  user: {
    name: string;
    email: string;
    created_at: string;
    is_active?: boolean;
    role: string;
    plan_status: string;
  };
}

export interface InactiveUser {
  id: number;
  user_id: number;
  original_role: string;
  inactivation_date: string;
  role_data: Record<string, unknown>;
  user: {
    name: string;
    email: string;
    mobile: string;
    created_at: string;
    role: string;
    plan_status: string;
  };
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  mobile?: string;
  // Admin/Support Staff specific
  department?: string;
  salary?: number;
  // Teacher specific
  subject?: string;
  class_assigned?: string;
  salary_type?: SalaryType;
  commission_rate?: number;
  // Student specific
  class_id?: string;
  guardian_name?: string;
  guardian_mobile?: string;
  address?: string;
  date_of_birth?: string;
  subjects?: string;
  fees?: number;
  fee_structure_id?: number | null;
}

export interface EditableUser extends User {
  student?: Student;
  teacher?: Teacher;
  adminStaff?: AdminStaff;
  user?: User;
}

export interface StudentReport {
  student: {
    user: {
      name: string;
      email: string;
      class: string;
    };
    guardian_name: string;
    fee_structure: {
      amount: number;
      payment_type: string;
    };
    fee_payments: Array<{
      payment_date: string;
      amount_paid: number;
      payment_mode: string;
      payment_status: string;
      receipt_number: string;
      discount_reason: string;
      month: string;
    }>;
    fee_reminders: Array<{
      reminder_date: string;
      reminder_type: string;
      message: string;
    }>;
    fee_due_date: string;
  };
  feeSummary: {
    total_fee: number;
    total_paid: number;
    total_due: number;
    payment_status: string;
    payment_history: Array<{
      payment_date: string;
      receipt_number: string;
      month: string;
      amount_paid: number;
      payment_mode: string;
      payment_status: string;
      remarks?: string;
    }>;
    recent_reminders: Array<{
      reminder_date: string;
      reminder_type: string;
      message: string;
    }>;
    due_date: string;
  };
  attendance: Array<{
    date: string;
    subject: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }>;
  extraClassAttendance: Array<{
    date: string;
    subject: string;
    status: "PRESENT" | "ABSENT" | "LATE";
    extra_class: {
      description: string;
    };
  }>;
  testSubmissions: Array<{
    grade: number;
    test: {
      title: string;
      subject: string;
      startTime: string;
    };
  }>;
  mcqSessions: Array<{
    subject: string;
    chapter: string;
    start_time: string;
    correct_count: number;
    incorrect_count: number;
  }>;
  assignments: Array<{
    grade: number | null;
    submitted_at: string;
    assignment: {
      title: string;
      subject: string;
      due_date: string;
    };
  }>;
}

// Type guards
export function isStudent(user: any): user is Student {
  return user && user.class_id !== undefined;
}

export function isTeacher(user: any): user is Teacher {
  return user && user.subject !== undefined;
}

export function isAdminStaff(user: any): user is AdminStaff {
  return user && user.department !== undefined;
}

export function isInactiveUser(user: any): user is InactiveUser {
  return user && user.original_role !== undefined;
}

export function isSupportStaff(user: any): user is SupportStaff {
  return (
    user && user.department !== undefined && user.user.role === "support_staff"
  );
}

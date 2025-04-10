export interface Assignment {
  id: number;
  title: string;
  description: string;
  class_id: string;
  subject: string;
  due_date: string;
  teacher_id: number;
  assigned_students: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  submissions?: AssignmentSubmission[];
  status?: "pending" | "submitted" | "overdue" | "closed";
  isLate?: boolean;
  isClosed?: boolean;
  submissionStatus?: string;
  teacher?: {
    name: string;
  };
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: number;
  file_url?: string;
  text_response?: string;
  submitted_at: string;
  grade?: number;
  teacher_comment?: string;
  graded_at?: string;
  assignment: Assignment;
  student?: {
    name: string;
    email: string;
  };
  isLate?: boolean;
  submissionStatus?: string;
}

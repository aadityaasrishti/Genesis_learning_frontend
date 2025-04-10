export interface Test {
  id: number;
  title: string;
  description: string;
  type: string;
  content: string;
  duration: number;
  startTime: string;
  subject: string;
  class_id: string;
  created_by: number;
  assignedStudents?: string;
  createdAt: string;
  updatedAt: string;
  submissions?: TestSubmission[];
  hasSubmitted?: boolean;
  submission?: TestSubmission;
  status?: "upcoming" | "ongoing" | "late" | "expired";
  timeLeft?: number;
  lateTimeLeft?: number;
  endTime?: Date;
  lateEndTime?: Date;
  isInGracePeriod?: boolean;
}

export interface TestSubmission {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
  is_late: boolean;
  status: 'graded' | 'pending';
}

export interface CreateTestInput {
  title: string;
  description: string;
  duration: number;
  type: "TEXT" | "PDF";
  content?: string;
  class?: string;
  subject?: string;
  assignedStudents?: string;
}

export interface GradeSubmissionInput {
  grade: number;
  feedback?: string;
}

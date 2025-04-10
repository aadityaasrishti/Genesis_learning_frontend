export type NotificationType =
  | "extra_class"
  | "system"
  | "teacher_task"
  | "task_update"
  | "student_request"
  | "student_request_update"
  | "assignment"
  | "assignment_created"
  | "assignment_submission"
  | "submission_confirmation"
  | "assignment_graded"
  | "assignment_overdue"
  | "assignment_update"
  | "feedback"
  | "exam_notification"
  | "fee_payment"
  | "fee_reminder"
  | "salary_payment"
  | "salary_update"
  | "test_created"
  | "test_assigned"
  | "test_submission"
  | "test_graded"
  | "test_reminder"
  | "expense_created"
  | "expense_approved"
  | "expense_rejected"
  | "expense_pending";

export type NotificationFilterType =
  | "all"
  | "extra_class"
  | "system"
  | "teacher_task" // This will handle both teacher_task and task_update
  | "student_request" // This will handle both student_request and student_request_update
  | "assignment" // This will handle all assignment-related notifications
  | "feedback"
  | "exam_notification"
  | "fee" // This will handle both fee_payment and fee_reminder
  | "salary" // This will handle both salary_payment and salary_update
  | "test" // This will handle all test-related notifications
  | "expense"; // This will handle all expense management notifications

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  type: NotificationType;
  created_at: string;
  is_read: boolean;
}

export interface NotificationCleanupOptions {
  olderThan: string;
  status: "all" | "read";
}

export interface NotificationCleanupResult {
  success: boolean;
  message: string;
  count: number;
  error?: string;
}

export interface NotificationFilters {
  type: NotificationFilterType;
}

export interface NotificationPreferences {
  soundEnabled: boolean;
}

export interface MCQQuestion {
  id: number;
  class_id: string;
  subject: string;
  chapter: string;
  question_text: string;
  image_url?: string;
  options: string[];
  correct_answer: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface MCQSessionQuestion {
  id: number;
  session_id: number;
  question_id: number;
  selected_answer: number | null;
  is_correct: boolean | null;
  answered_at: Date | null;
  question: MCQQuestion;
}

export interface MCQSession {
  id: number;
  student_id: number;
  class_id: string;
  subject: string;
  chapter: string;
  start_time: Date;
  end_time: Date | null;
  duration: number;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  last_question_index: number;
  questions: MCQSessionQuestion[];
  totalQuestions?: number;
  currentBatchSize?: number;
  remainingQuestions?: number;
  student?: {
    name: string;
  };
}

export interface MCQError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export interface StudentProgress {
  id: number;
  student_id: number;
  class_id: string;
  subject: string;
  chapter: string;
  last_question_index: number;
  last_attempted: Date;
  updated_at: Date;
}

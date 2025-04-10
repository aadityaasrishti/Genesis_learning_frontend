import api from "./api";
import { MCQQuestion, MCQSession, MCQError } from "../types/mcq";

// Teacher functions
export const createMCQQuestion = async (formData: FormData) => {
  try {
    const response = await api.post("/mcq/questions", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error || "Failed to create MCQ question"
    );
  }
};

export const bulkCreateMCQQuestions = async (formData: FormData) => {
  try {
    const response = await api.post("/mcq/questions/bulk", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error || "Failed to create MCQ questions"
    );
  }
};

export const getMCQQuestions = async (
  class_id: string,
  subject: string,
  chapter?: string
): Promise<MCQQuestion[]> => {
  try {
    const response = await api.get("/mcq/questions", {
      params: { class_id, subject, chapter },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error ||
        "Failed to fetch MCQ questions"
    );
  }
};

export const getChapters = async (
  class_id: string,
  subject: string
): Promise<string[]> => {
  try {
    const response = await api.get("/mcq/chapters", {
      params: { class_id, subject },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error || "Failed to fetch chapters"
    );
  }
};

// Student functions
export const startMCQSession = async (
  class_id: string,
  subject: string,
  chapter: string
): Promise<MCQSession> => {
  try {
    const response = await api.post("/mcq/sessions/start", {
      class_id,
      subject,
      chapter,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error || "Failed to start MCQ session"
    );
  }
};

export const submitAnswer = async (
  session_id: number,
  question_id: number,
  selected_answer: number | null
): Promise<{ isCorrect?: boolean; isSkipped?: boolean }> => {
  try {
    const response = await api.post("/mcq/sessions/submit-answer", {
      session_id,
      question_id,
      selected_answer,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error || "Failed to submit answer"
    );
  }
};

export const endSession = async (session_id: number): Promise<MCQSession> => {
  try {
    const response = await api.post("/mcq/sessions/end", { session_id });
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error || "Failed to end session"
    );
  }
};

export const getSessionResults = async (
  session_id: number
): Promise<MCQSession> => {
  try {
    const response = await api.get(`/mcq/sessions/${session_id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error ||
        "Failed to fetch session results"
    );
  }
};

export const getStudentSessions = async (): Promise<MCQSession[]> => {
  try {
    const response = await api.get("/mcq/sessions");
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error ||
        "Failed to fetch student sessions"
    );
  }
};

export const getTeacherSessions = async (): Promise<MCQSession[]> => {
  try {
    const response = await api.get("/mcq/teacher/sessions");
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error ||
        "Failed to fetch teacher sessions"
    );
  }
};

export const getStudentProgress = async (
  class_id: string,
  subject: string,
  chapter: string
) => {
  try {
    const response = await api.get("/mcq/student-progress", {
      params: { class_id, subject, chapter },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error ||
        "Failed to fetch student progress"
    );
  }
};

export const getClassStatistics = async (class_id: string, subject: string) => {
  try {
    const response = await api.get("/mcq/class-statistics", {
      params: { class_id, subject },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error ||
        "Failed to fetch class statistics"
    );
  }
};

export const loadNextBatch = async (session_id: number) => {
  try {
    const response = await api.post("/mcq/sessions/next-batch", { session_id });
    return response.data;
  } catch (error) {
    throw new Error(
      (error as MCQError).response?.data?.error || "Failed to load next batch"
    );
  }
};

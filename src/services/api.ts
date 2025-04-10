import apiClient from "./apiClient";

// Extend AxiosRequestConfig to include our custom properties
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    retryCount?: number;
    priority?: "feedback" | "normal";
  }
}

// Export a configured API instance with typed methods
const api = {
  get: (url: string, config?: any) => apiClient.get(url, config),
  post: (url: string, data?: any, config?: any) =>
    apiClient.post(url, data, config),
  put: (url: string, data?: any, config?: any) =>
    apiClient.put(url, data, config),
  patch: (url: string, data?: any, config?: any) =>
    apiClient.patch(url, data, config),
  delete: (url: string, config?: any) => apiClient.delete(url, config),

  // Allow direct access to modify defaults
  defaults: apiClient.defaults,

  reports: {
    getStudentsByClass: (classId: string) =>
      apiClient.get(`/student-reports/class/${classId}`),
    getStudentReport: (studentId: number) =>
      apiClient.get(`/student-reports/student/${studentId}`, {
        timeout: 30000, // Higher timeout for comprehensive reports
      }),
  },

  // Test Management
  tests: {
    create: (formData: FormData) =>
      apiClient.post("/tests", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }),
    getTeacherTests: () => apiClient.get("/tests/teacher"),
    getAvailable: () => apiClient.get("/tests/available"),
    submit: (formData: FormData) =>
      apiClient.post("/tests/submit", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }),
    getSubmissions: (testId: number) =>
      apiClient.get(`/tests/${testId}/submissions`),
    getSubmissionContent: (submissionId: number) =>
      apiClient.get(`/tests/submissions/${submissionId}/content`, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
    getTestContent: (testId: number) =>
      apiClient.get(`/tests/${testId}/content`, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
    gradeSubmission: (
      submissionId: number,
      data: { grade: number; feedback?: string }
    ) => apiClient.post(`/tests/submissions/${submissionId}/grade`, data),
    deleteTest: (testId: number) => apiClient.delete(`/tests/${testId}`),
    deleteSubmission: (submissionId: number) =>
      apiClient.delete(`/tests/submissions/${submissionId}`),
    resetCompromisedTest: (testId: number, studentId: number) =>
      apiClient.post(`/tests/${testId}/reset-compromise/${studentId}`),
  },
};

export default api;

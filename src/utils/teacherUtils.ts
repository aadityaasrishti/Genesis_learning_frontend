import api from "../services/api";

export async function getTeacherIdFromClass(classId: string): Promise<number> {
  try {
    const response = await api.get(`/auth/teacher-by-class/${classId}`);
    return response.data.user_id;
  } catch (error) {
    console.error("Error fetching teacher ID:", error);
    return 0;
  }
}

export function extractTeacherIdFromClassId(classId?: string): number {
  if (!classId) return 0;
  const teacherId = classId.split("-")[0];
  return Number(teacherId) || 0;
}

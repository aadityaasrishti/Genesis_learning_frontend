import { apiClient } from './apiClient';

interface Note {
  id: number;
  title: string;
  description: string;
  file_path: string;
  subject: string;
  upload_date: string;
  file_type: string;
  class_id: string;
}

interface Subject {
  id: number;
  name: string;
}

interface NotesResponse {
  notes: Note[];
  subjects: Subject[];
}

export const getNotes = async (classId: string): Promise<NotesResponse> => {
  const response = await apiClient.get(`/notes/${classId}`);
  return response.data;
};
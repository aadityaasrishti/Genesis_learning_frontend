export interface Feedback {
  id: number;
  from_id: number;
  to_id: number;
  message: string;
  rating: number;
  created_at: string;
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

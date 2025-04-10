import { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalActions,
  FormField,
  ModalFormField,
  StyledTextField,
} from "../../theme/StyledComponents";

interface ExtraClassModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Teacher {
  user_id: number;
  name: string;
  subject: string;
  class_assigned: string;
}

const ExtraClassModal = ({ onClose, onSuccess }: ExtraClassModalProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [teacherData, setTeacherData] = useState<{
    class_assigned: string;
    subject: string;
  } | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    class_id: "",
    subject: "",
    teacher_id: user?.role === "teacher" ? String(user.user_id) : "",
    date: "",
    start_time: "",
    end_time: "",
    description: "",
  });

  // Fetch teacher's assigned classes and subjects if user is a teacher
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (user?.role === "teacher") {
        try {
          const response = await api.get(`/auth/teachers/${user.user_id}`);
          setTeacherData(response.data);
          
          // Set available subjects from teacher's assigned subjects
          const subjects = response.data.subject
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
          setAvailableSubjects(subjects);
          
          // Pre-select the first class if teacher has only one class
          const classes = response.data.class_assigned
            .split(",")
            .map((c: string) => c.trim());
          if (classes.length === 1) {
            setFormData((prev) => ({ ...prev, class_id: classes[0] }));
          }
        } catch (err) {
          console.error("Error fetching teacher data:", err);
          setError("Failed to fetch teacher's class and subject data");
        }
      }
    };

    fetchTeacherData();
  }, [user]);

  // Fetch subjects for support staff when class is selected
  useEffect(() => {
    const fetchSubjects = async () => {
      if (formData.class_id && user?.role !== "teacher") {
        try {
          const response = await api.get("/attendance/subjects", {
            params: { classId: formData.class_id }
          });
          setAvailableSubjects(response.data);
          setError("");
        } catch (err: any) {
          console.error("Error fetching subjects:", err);
          setError(err.response?.data?.error || "Failed to fetch subjects");
          setAvailableSubjects([]);
        }
      }
    };

    fetchSubjects();
  }, [formData.class_id, user?.role]);

  // Fetch teachers when class and subject are selected
  useEffect(() => {
    const fetchTeachers = async () => {
      if (formData.class_id && formData.subject && user?.role !== "teacher") {
        setIsLoadingTeachers(true);
        try {
          const response = await api.get("/extra-class/teachers", {
            params: {
              class_id: formData.class_id,
              subject: formData.subject,
            },
          });
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            setTeachers(response.data);
            setError("");
          } else {
            setTeachers([]);
            setError("No teachers found for selected class and subject");
          }
        } catch (err: any) {
          console.error("Error fetching teachers:", err);
          setTeachers([]);
          setError(err.response?.data?.error || "Failed to fetch teachers");
        } finally {
          setIsLoadingTeachers(false);
        }
      }
    };

    fetchTeachers();
  }, [formData.class_id, formData.subject, user?.role]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const dataToSubmit = {
        ...formData,
        teacher_id: user?.role === "teacher" ? Number(user.user_id) : Number(formData.teacher_id),
      };

      await api.post("/extra-class", dataToSubmit);
      
      // Trigger notifications refresh
      await api.get("/notifications");
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating extra class:", err);
      setError(err.response?.data?.error || "Failed to schedule extra class");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to get class options based on user role
  const getClassOptions = () => {
    if (user?.role === "teacher" && teacherData?.class_assigned) {
      return teacherData.class_assigned.split(",").map((c: string) => c.trim());
    }
    return Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
  };

  return (
    <ModalOverlay open={true} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Schedule Extra Class</ModalHeader>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <ModalFormField>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={formData.class_id}
                label="Class"
                onChange={(e: SelectChangeEvent) =>
                  setFormData((prev) => ({
                    ...prev,
                    class_id: e.target.value,
                    teacher_id: user?.role === "teacher" ? String(user.user_id) : "",
                  }))
                }
                required
              >
                <MenuItem value="">
                  <em>Select Class</em>
                </MenuItem>
                {getClassOptions().map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ModalFormField>

          <ModalFormField>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={formData.subject}
                label="Subject"
                onChange={(e: SelectChangeEvent) =>
                  setFormData((prev) => ({
                    ...prev,
                    subject: e.target.value,
                    teacher_id: user?.role === "teacher" ? String(user.user_id) : "",
                  }))
                }
                required
                disabled={!formData.class_id}
              >
                <MenuItem value="">
                  <em>Select Subject</em>
                </MenuItem>
                {availableSubjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ModalFormField>

          {user?.role !== "teacher" && (
            <ModalFormField>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  value={formData.teacher_id}
                  label="Teacher"
                  onChange={(e: SelectChangeEvent) =>
                    setFormData((prev) => ({
                      ...prev,
                      teacher_id: e.target.value,
                    }))
                  }
                  required
                  disabled={isLoadingTeachers}
                >
                  <MenuItem value="">
                    <em>Select a teacher</em>
                  </MenuItem>
                  {isLoadingTeachers ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    teachers.map((teacher) => (
                      <MenuItem key={teacher.user_id} value={String(teacher.user_id)}>
                        {teacher.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </ModalFormField>
          )}

          <FormField>
            <StyledTextField
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              fullWidth
              required
              inputProps={{
                min: new Date().toISOString().split("T")[0]
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormField>

          <FormField>
            <StyledTextField
              type="time"
              label="Start Time"
              value={formData.start_time}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, start_time: e.target.value }))
              }
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormField>

          <FormField>
            <StyledTextField
              type="time"
              label="End Time"
              value={formData.end_time}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, end_time: e.target.value }))
              }
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormField>

          <FormField>
            <StyledTextField
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              placeholder="Enter class description..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              fullWidth
            />
          </FormField>

          <ModalActions>
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Scheduling..." : "Schedule Class"}
            </Button>
          </ModalActions>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ExtraClassModal;

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Paper,
  styled,
  SelectChangeEvent,
  FormControl,
  InputLabel,
} from "@mui/material";
import TeacherNavbar from "./TeacherNavbar";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../types/types";
import FeedbackList from "../Common/FeedbackList";

const PageContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Section = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const FormControlStyled = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  minWidth: 200,
}));

interface Student extends User {
  id: number;
  user_id: number;
  class_id: string;
}

const TeacherFeedbackPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [editingFeedback, setEditingFeedback] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<string>("");

  // Fetch teacher's assigned classes
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user?.user_id) return;

      try {
        const response = await api.get(`/auth/teachers/${user.user_id}`);
        const teacherClasses = response.data.class_assigned
          .split(",")
          .map((c: string) => c.trim())
          .filter((c: string) => c);
        const teacherSubjects = response.data.subject
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s);

        setSubjects(teacherSubjects);

        if (teacherClasses.length === 1) {
          setSelectedClass(teacherClasses[0]);
        }
      } catch (error: any) {
        console.error("Error fetching teacher data:", error);
        setError("Failed to fetch assigned classes");
      }
    };

    fetchTeacherData();
  }, [user]);

  // Fetch students when both class and subject are selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass || !selectedSubject) return;

      try {
        const response = await api.get(`/auth/students-by-class`, {
          params: {
            class: selectedClass,
            subject: selectedSubject,
          },
        });

        if (response.data && Array.isArray(response.data)) {
          setStudents(response.data);
          setError("");
        }
      } catch (error: any) {
        console.error("Error fetching students:", error);
        setError(error.response?.data?.message || "Failed to fetch students");
        setStudents([]);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSubject]);

  const handleSubmitFeedback = async () => {
    setLoading(true);
    setSubmissionStatus("");

    try {
      // Submit feedback logic here
      // After successful submission, you can set submissionStatus to a success message
    } catch (error) {
      setSubmissionStatus("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingFeedback(false);
    setFeedbackText("");
    setSelectedStudent("");
  };

  return (
    <Box>
      <TeacherNavbar />
      <PageContainer maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Feedback Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Section>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            View Previous Feedback
          </Typography>
          <FeedbackList showControls />
        </Section>

        <Section>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            {editingFeedback ? "Edit Feedback" : "Submit New Feedback"}
          </Typography>

          <FormControlStyled fullWidth>
            <InputLabel id="student-select-label">Select Student</InputLabel>
            <Select
              labelId="student-select-label"
              value={selectedStudent}
              onChange={(e: SelectChangeEvent) => setSelectedStudent(e.target.value)}
              label="Select Student"
            >
              <MenuItem value="">
                <em>Select a student</em>
              </MenuItem>
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name}
                </MenuItem>
              ))}
            </Select>
          </FormControlStyled>

          {selectedStudent && (
            <>
              <FormControlStyled fullWidth>
                <InputLabel id="subject-select-label">Select Subject</InputLabel>
                <Select
                  labelId="subject-select-label"
                  value={selectedSubject}
                  onChange={(e: SelectChangeEvent) => setSelectedSubject(e.target.value)}
                  label="Select Subject"
                >
                  <MenuItem value="">
                    <em>Select a subject</em>
                  </MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControlStyled>

              <FormControlStyled fullWidth>
                <TextField
                  multiline
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  label="Feedback"
                  placeholder="Enter your feedback here..."
                  required
                />
              </FormControlStyled>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitFeedback}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : editingFeedback ? "Update" : "Submit"}
                </Button>
                {editingFeedback && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </Box>

              {submissionStatus && (
                <Alert 
                  severity={submissionStatus.includes("Failed") ? "error" : "success"}
                  sx={{ mt: 2 }}
                >
                  {submissionStatus}
                </Alert>
              )}
            </>
          )}
        </Section>
      </PageContainer>
    </Box>
  );
};

export default TeacherFeedbackPage;

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  styled,
  Paper,
} from "@mui/material";
import StudentNavbar from "./StudentNavbar";
import FeedbackList from "../Common/FeedbackList";
import FeedbackForm from "../Common/FeedbackForm";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const PageContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Section = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const TeacherCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: theme.palette.primary.light,
  },
}));

interface TeacherInfo {
  user_id: number;
  name: string;
  subjects: string;
}

const StudentFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchTeachers = async () => {
    try {
      if (!user?.class) {
        setError("No class assigned to your account");
        setLoading(false);
        return;
      }

      const cleanClass = user.class.replace(/[^\w\s-]/g, "");

      const response = await api.get(
        `/auth/teacher-by-class/${encodeURIComponent(cleanClass)}`,
        {
          timeout: 5000,
        }
      );

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setTeachers(response.data);
        setError(null);
        setRetryCount(0);
      } else {
        setError("No teachers found for your class");
      }
    } catch (err: any) {
      console.error("Error fetching teachers:", err);

      const errorMessage = err.response?.data?.error || err.message;
      if (errorMessage.includes("Invalid class ID format")) {
        setError(
          "Your class assignment needs to be updated. Please contact support."
        );
      } else if (errorMessage.includes("No teacher found")) {
        setError(
          "No teachers are currently assigned to your class. Please contact support."
        );
      } else {
        setError(
          "Unable to fetch teacher information. Please try again later."
        );
      }

      setRetryCount((prev) => prev + 1);

      if (retryCount < 2) {
        setTimeout(fetchTeachers, 1000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [user]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    fetchTeachers();
  };

  const handleTeacherSelect = (teacherId: number) => {
    setSelectedTeacherId(teacherId);
  };

  if (loading) {
    return (
      <Box>
        <StudentNavbar />
        <PageContainer maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <Box textAlign="center">
              <CircularProgress size={40} />
              {retryCount > 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Retrying... ({retryCount}/3)
                </Typography>
              )}
            </Box>
          </Box>
        </PageContainer>
      </Box>
    );
  }

  return (
    <Box>
      <StudentNavbar />
      <PageContainer maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Feedback Management
        </Typography>

        <Section>
          <Typography variant="h5" gutterBottom>
            Give Feedback to Teachers
          </Typography>

          {error ? (
            <Box sx={{ mt: 3 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              {error !== "No class assigned to your account" && (
                <Button
                  variant="contained"
                  onClick={handleRetry}
                  sx={{ mt: 2 }}
                >
                  Try Again
                </Button>
              )}
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                If this issue persists, please contact your administrator.
              </Typography>
            </Box>
          ) : teachers.length > 0 ? (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Select a Teacher:
                </Typography>
                <Grid container spacing={3}>
                  {teachers.map((teacher) => (
                    <Grid item xs={12} sm={6} key={teacher.user_id}>
                      <TeacherCard 
                        className={selectedTeacherId === teacher.user_id ? 'selected' : ''}
                        onClick={() => handleTeacherSelect(teacher.user_id)}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {teacher.name}
                          </Typography>
                          <Typography color="textSecondary">
                            Subject: {teacher.subjects}
                          </Typography>
                        </CardContent>
                      </TeacherCard>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {selectedTeacherId > 0 && (
                <Section>
                  <Typography variant="h6" gutterBottom>
                    Selected Teacher
                  </Typography>
                  {teachers.find((t) => t.user_id === selectedTeacherId) && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography color="textSecondary">Name:</Typography>
                        <Typography variant="body1">
                          {teachers.find((t) => t.user_id === selectedTeacherId)?.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography color="textSecondary">Subjects:</Typography>
                        <Typography variant="body1">
                          {teachers.find((t) => t.user_id === selectedTeacherId)?.subjects}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                  <FeedbackForm
                    recipientId={selectedTeacherId}
                    onSubmit={() => window.location.reload()}
                  />
                </Section>
              )}
            </>
          ) : (
            <Alert severity="info">
              No teachers assigned to your class
            </Alert>
          )}
        </Section>

        <Section>
          <Typography variant="h5" gutterBottom>
            My Feedback History
          </Typography>
          <FeedbackList />
        </Section>
      </PageContainer>
    </Box>
  );
};

export default StudentFeedbackPage;

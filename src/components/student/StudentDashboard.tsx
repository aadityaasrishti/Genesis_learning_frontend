import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import api from "../../services/api";
import { User } from "../../types/types";
import StudentNavbar from "./StudentNavbar";
import UpcomingAssignments from "../Common/UpcomingAssignments";
import ProfileImage from "../Common/ProfileImage";
import MiniCalendar from "../Common/MiniCalendar";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (err) {
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const ActionButton = ({ title, path }: { title: string; path: string }) => (
    <Button
      fullWidth
      variant="contained"
      sx={{
        py: 1.5,
        textTransform: "none",
        fontSize: "1rem",
      }}
      onClick={() => navigate(path)}
    >
      {title}
    </Button>
  );

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <StudentNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom align="center">
                Student Profile
              </Typography>
              {user && (
                <Box>
                  <Box display="flex" justifyContent="center" mb={3}>
                    <ProfileImage
                      imageUrl={user.profile_image_url}
                      size={120}
                      editable={true}
                      onImageUpdate={(newImageUrl) => {
                        setUser((prev) =>
                          prev
                            ? { ...prev, profile_image_url: newImageUrl }
                            : null
                        );
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Name:</strong> {user.name}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Email:</strong> {user.email}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Class:</strong> {user.student?.class_id || "N/A"}
                    </Typography>
                    <Typography variant="subtitle1">
                      <strong>Status:</strong>{" "}
                      <Box
                        component="span"
                        sx={{
                          color: user.is_active ? "success.main" : "error.main",
                          fontWeight: "medium",
                        }}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Box>
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Actions Section */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <ActionButton
                        title="My Assignments"
                        path="/dashboard/assignments"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ActionButton
                        title="View Attendance"
                        path="/dashboard/attendance/view"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ActionButton
                        title="Extra Classes"
                        path="/dashboard/extra-classes"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ActionButton
                        title="Class Schedule"
                        path="/dashboard/schedules/view"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ActionButton
                        title="Submit Request"
                        path="/dashboard/student-requests"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ActionButton
                        title="My Report Card"
                        path="/dashboard/report"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ActionButton
                        title="Exam Notifications"
                        path="/dashboard/exam-notifications"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ActionButton title="Notes" path="/dashboard/notes" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ActionButton title="Tests" path="/dashboard/tests" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ActionButton
                        title="Multiple Choice Questions"
                        path="/dashboard/mcq"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Mini Calendar Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Calendar Overview
                  </Typography>
                  <MiniCalendar />
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Assignments Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Upcoming Assignments
              </Typography>
              <UpcomingAssignments role="student" />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentDashboard;

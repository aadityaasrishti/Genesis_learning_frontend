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
import {
  School,
  Class,
  Assignment,
  Notifications,
  Feedback,
  QuestionAnswer,
  AttachMoney,
} from "@mui/icons-material";
import api from "../../services/api";
import { User } from "../../types/types";
import TeacherNavbar from "./TeacherNavbar";
import UpcomingAssignments from "../Common/UpcomingAssignments";
import ProfileImage from "../Common/ProfileImage";
import MiniCalendar from "../Common/MiniCalendar";

interface MenuAction {
  title: string;
  icon: React.ReactNode;
  path: string;
  color?: string;
}

const TeacherDashboard: React.FC = () => {
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

  const menuItems: MenuAction[] = [
    {
      title: "Manage Assignments",
      icon: <Assignment />,
      path: "/dashboard/assignments",
      color: "#3f51b5",
    },
    {
      title: "View Attendance",
      icon: <Class />,
      path: "/dashboard/attendance/view",
      color: "#f44336",
    },
    {
      title: "Extra Classes",
      icon: <School />,
      path: "/dashboard/extra-classes",
      color: "#4caf50",
    },
    {
      title: "Class Schedule",
      icon: <School />,
      path: "/dashboard/schedules/view",
      color: "#2196f3",
    },
    {
      title: "My Tasks",
      icon: <Feedback />,
      path: "/dashboard/tasks",
      color: "#ff9800",
    },
    {
      title: "Exam Notifications",
      icon: <Notifications />,
      path: "/dashboard/exam-notifications",
      color: "#9c27b0",
    },
    {
      title: "View Salary",
      icon: <AttachMoney />,
      path: "/dashboard/salary",
      color: "#009688",
    },
    {
      title: "Tests",
      icon: <QuestionAnswer />,
      path: "/dashboard/tests",
      color: "#9c27b0",
    },
  ];

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

  return (
    <div className="admin-dashboard">
      <TeacherNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom align="center">
                Teacher Profile
              </Typography>
              {user && (
                <Box>
                  <Box display="flex" justifyContent="center" mb={3}>
                    <ProfileImage
                      imageUrl={user?.profile_image_url ?? null}
                      size={120}
                      onImageUpdate={(newImageUrl) => {
                        setUser(
                          user
                            ? { ...user, profile_image_url: newImageUrl }
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
                      <strong>Role:</strong> {user.role}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Class:</strong> {user.teacher?.class_assigned}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Subjects:</strong> {user.teacher?.subject}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Email:</strong> {user.email}
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

          {/* Quick Actions and Calendar Section */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    {menuItems.map((item) => (
                      <Grid item xs={12} sm={6} key={item.path}>
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{
                            py: 2,
                            bgcolor: item.color,
                            "&:hover": {
                              bgcolor: item.color,
                              opacity: 0.9,
                            },
                            display: "flex",
                            gap: 1,
                            textTransform: "none",
                            fontSize: "1rem",
                          }}
                          onClick={() => navigate(item.path)}
                          startIcon={item.icon}
                        >
                          {item.title}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
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
              <UpcomingAssignments role="teacher" />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default TeacherDashboard;

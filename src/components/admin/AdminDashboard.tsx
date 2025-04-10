import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  Button,
} from "@mui/material";
import api from "../../services/api";
import { User } from "../../types/types";
import AdminNavbar from "./AdminNavbar";
import ProfileImage from "../Common/ProfileImage";
import MiniCalendar from "../Common/MiniCalendar";
import SystemNotificationCreator from "../Common/SystemNotificationCreator";

const AdminDashboard: React.FC = () => {
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

  const MenuCard = ({
    to,
    icon,
    title,
    description,
  }: {
    to: string;
    icon: string;
    title: string;
    description: string;
  }) => (
    <Card component={Link} to={to} sx={{ textDecoration: "none" }}>
      <CardActionArea>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h1" sx={{ fontSize: "2rem", mb: 2 }}>
            {icon}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <AdminNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom align="center">
                Admin Profile
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

          {/* Quick Links and Calendar Section */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* System Notifications Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    System Notifications
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <SystemNotificationCreator />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Quick Links
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/dashboard/usermanagement")}
                      >
                        User Management
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/dashboard/fees")}
                      >
                        Fee Management
                      </Button>
                    </Grid>
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

          {/* Menu Grid */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/usermanagement"
                  icon="👥"
                  title="User Management"
                  description="Manage users and roles"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/fees"
                  icon="💵"
                  title="Fee Management"
                  description="Manage student fees"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/salary"
                  icon="💳"
                  title="Salary Management"
                  description="Manage staff salaries"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/expenses"
                  icon="💰"
                  title="Expense Management"
                  description="Track and manage expenses"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/daily-challenge"
                  icon="🎯"
                  title="Daily Challenge"
                  description="View all daily challenges"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/assignments"
                  icon="📚"
                  title="Assignments"
                  description="View and manage assignments"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/mark-attendance"
                  icon="✅"
                  title="Mark Attendance"
                  description="Record student attendance"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/attendance-report"
                  icon="📊"
                  title="Attendance Reports"
                  description="View attendance reports"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/holidays"
                  icon="🌴"
                  title="Holiday Management"
                  description="Manage school holidays"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/extra-classes"
                  icon="📖"
                  title="Extra Classes"
                  description="Manage extra classes"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/student-requests"
                  icon="📝"
                  title="Student Requests"
                  description="View and manage requests"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/feedback"
                  icon="💬"
                  title="Feedback"
                  description="View and manage feedback"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/schedules/manage"
                  icon="📅"
                  title="Class Schedules"
                  description="Manage class schedules"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <MenuCard
                  to="/dashboard/notes"
                  icon="📓"
                  title="Notes Management"
                  description="Review and manage notes"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;

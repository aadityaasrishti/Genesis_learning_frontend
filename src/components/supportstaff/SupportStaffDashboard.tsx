import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import SupportStaffNavbar from "./SupportStaffNavbar";
import ProfileImage from "../Common/ProfileImage";
import MiniCalendar from "../Common/MiniCalendar";
import { useAuth } from "../../context/AuthContext";

const SupportStaffDashboard: React.FC = () => {
  const { user, checkAuth } = useAuth();

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
      <SupportStaffNavbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Profile Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom align="center">
                Support Staff Profile
              </Typography>
              {user && (
                <Box>
                  <Box display="flex" justifyContent="center" mb={3}>
                    <ProfileImage
                      imageUrl={user.profile_image_url ?? null}
                      size={120}
                      onImageUpdate={async () => {
                        await checkAuth();
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

          {/* Menu and Calendar Section */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Calendar Overview
                  </Typography>
                  <MiniCalendar />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={3}>
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
                      to="/dashboard/fees"
                      icon="💵"
                      title="Fee Management"
                      description="Manage student fees"
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
                      to="/dashboard/assignments"
                      icon="📚"
                      title="Assignments"
                      description="View and manage assignments"
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
                      to="/dashboard/schedules/manage"
                      icon="📅"
                      title="Class Schedules"
                      description="Manage class schedules"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SupportStaffDashboard;

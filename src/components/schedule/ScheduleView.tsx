import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Button,
} from "@mui/material";
import { AccessTime } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Schedule {
  id: number;
  class_id: string;
  subject: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room?: string;
  teacher: {
    name: string;
  };
}

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const ScheduleView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classId, setClassId] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (classId) {
      fetchSchedules();
    }
  }, [classId]);

  const fetchUserData = async () => {
    try {
      if (user?.role === "teacher") {
        const response = await api.get(`/auth/teachers/${user.user_id}`);
        const classes = response.data.class_assigned
          .split(",")
          .map((c: string) => c.trim());
        if (classes.length > 0) {
          setClassId(classes[0]);
        }
      } else if (user?.role === "student") {
        const response = await api.get("/auth/me");
        if (response.data.student?.class_id) {
          setClassId(response.data.student.class_id);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data");
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/schedules/class/${classId}`);

      // Sort schedules by day and time
      const sortedSchedules = response.data.sort((a: Schedule, b: Schedule) => {
        if (a.day_of_week !== b.day_of_week) {
          return a.day_of_week - b.day_of_week;
        }
        return a.start_time.localeCompare(b.start_time);
      });

      setSchedules(sortedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  if (!classId) {
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Alert
          severity="warning"
          sx={{
            width: "100%",
            maxWidth: 600,
            mb: 2,
          }}
        >
          No class has been assigned to you yet. Please contact your
          administrator.
        </Alert>
        {user?.role === "student" && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/dashboard/student-requests")}
          >
            Submit Request
          </Button>
        )}
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, Schedule[]>);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Class Schedule - {classId}
      </Typography>

      <Grid container spacing={3}>
        {daysOfWeek.map((day, index) => (
          <Grid item xs={12} sm={6} md={4} key={day}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {day}
                </Typography>
                <Divider sx={{ my: 1 }} />
                {schedulesByDay[index]?.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {schedulesByDay[index].map((schedule) => (
                      <Paper
                        key={schedule.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          backgroundColor: "background.default",
                          "&:last-child": { mb: 0 },
                        }}
                        elevation={1}
                      >
                        <Typography variant="subtitle1" color="primary">
                          {schedule.subject}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <AccessTime sx={{ fontSize: "1rem", mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {schedule.start_time} - {schedule.end_time}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Teacher: {schedule.teacher.name}
                        </Typography>
                        {schedule.room && (
                          <Typography variant="body2" color="text.secondary">
                            Room: {schedule.room}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    No classes scheduled
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ScheduleView;

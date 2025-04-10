import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import api from "../../services/api";

interface Schedule {
  id: number;
  class_id: string;
  subject: string;
  teacher_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room?: string;
  is_active: boolean;
  teacher: {
    name: string;
  };
}

interface Teacher {
  user_id: number;
  name: string;
  subject: string;
  class_assigned: string;
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

const ScheduleManager = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    class_id: "",
    subject: "",
    teacher_id: 0,
    day_of_week: 0,
    start_time: "",
    end_time: "",
    room: "",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSchedules(selectedClass);
      fetchSubjects(selectedClass);
      setFormData((prev) => ({ ...prev, class_id: selectedClass }));
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && formData.subject) {
      fetchTeachers(selectedClass, formData.subject);
      setFormData((prev) => ({ ...prev, teacher_id: 0 })); // Reset teacher selection
    }
  }, [selectedClass, formData.subject]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/attendance/classes");
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError("Failed to fetch classes");
    }
  };

  const fetchSubjects = async (classId: string) => {
    try {
      const response = await api.get("/attendance/subjects", {
        params: { classId },
      });
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to fetch subjects");
    }
  };

  const fetchTeachers = async (classId: string, subject: string) => {
    try {
      const response = await api.get("/extra-class/teachers", {
        params: {
          class_id: classId,
          subject: subject,
        },
      });
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setError("Failed to fetch teachers");
    }
  };

  const fetchSchedules = async (classId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/schedules/class/${classId}`);
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/schedules", formData);
      fetchSchedules(selectedClass);
      setFormData({
        class_id: selectedClass, // Keep the selected class
        subject: "",
        teacher_id: 0,
        day_of_week: 0,
        start_time: "",
        end_time: "",
        room: "",
      });
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to create schedule");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules(selectedClass);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      setError("Failed to delete schedule");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Class Schedule Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : classes.length === 0 ? (
        <Alert
          severity="info"
          sx={{
            width: "100%",
            maxWidth: 600,
            mx: "auto",
            mt: 4,
          }}
        >
          No classes are available in the system. Please add classes before
          managing schedules.
        </Alert>
      ) : (
        <>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              label="Select Class"
            >
              <MenuItem value="">
                <em>Select a class</em>
              </MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedClass && (
            <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
              <Typography variant="h5" gutterBottom>
                Add New Schedule
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Subject</InputLabel>
                      <Select
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        label="Subject"
                        required
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
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Teacher</InputLabel>
                      <Select
                        value={formData.teacher_id || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            teacher_id: Number(e.target.value),
                          })
                        }
                        label="Teacher"
                        required
                      >
                        <MenuItem value={0}>
                          <em>Select a teacher</em>
                        </MenuItem>
                        {teachers.map((teacher) => (
                          <MenuItem
                            key={teacher.user_id}
                            value={teacher.user_id}
                          >
                            {teacher.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Day</InputLabel>
                      <Select
                        value={formData.day_of_week}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            day_of_week: Number(e.target.value),
                          })
                        }
                        label="Day"
                        required
                      >
                        {daysOfWeek.map((day, index) => (
                          <MenuItem key={day} value={index}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Start Time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="time"
                      label="End Time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Room"
                      value={formData.room}
                      onChange={(e) =>
                        setFormData({ ...formData, room: e.target.value })
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                    >
                      Add Schedule
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          )}

          {loading ? (
            <Typography>Loading schedules...</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Teacher</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{daysOfWeek[schedule.day_of_week]}</TableCell>
                      <TableCell>
                        {schedule.start_time} - {schedule.end_time}
                      </TableCell>
                      <TableCell>{schedule.subject}</TableCell>
                      <TableCell>{schedule.teacher.name}</TableCell>
                      <TableCell>{schedule.room || "-"}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
};

export default ScheduleManager;

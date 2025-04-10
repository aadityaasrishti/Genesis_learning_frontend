import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Grid,
} from "@mui/material";

interface Student {
  user_id: number;
  name: string;
  subjects: string;
  class_id: string;
  attendances: Array<{
    subject: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }>;
}

interface ExtraClass {
  id: number;
  class_id: string;
  subject: string;
  date: string;
  start_time: string;
  end_time: string;
  description?: string;
  teacher: {
    name: string;
  };
}

const ExtraClassAttendance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const extraClassId = searchParams.get("extraClassId");
  const [extraClassDetails, setExtraClassDetails] = useState<ExtraClass | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState<{
    [key: number]: "PRESENT" | "ABSENT" | "LATE";
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchExtraClassDetails = async () => {
      if (!extraClassId) {
        setError("No extra class selected");
        return;
      }

      setIsLoading(true);
      try {
        // Fetch extra class details
        const extraClassResponse = await api.get(
          `/extra-class/${extraClassId}`
        );
        setExtraClassDetails(extraClassResponse.data);

        // Fetch students for the class
        const studentsResponse = await api.get("/attendance/students", {
          params: {
            classId: extraClassResponse.data.class_id,
            subject: extraClassResponse.data.subject,
          },
        });

        if (studentsResponse.data.length === 0) {
          setError("No students found for this extra class");
        } else {
          setStudents(studentsResponse.data);
          // Initialize attendance statuses
          const initialStatuses: {
            [key: number]: "PRESENT" | "ABSENT" | "LATE";
          } = {};
          studentsResponse.data.forEach((student: Student) => {
            initialStatuses[student.user_id] = "ABSENT";
          });
          setAttendanceStatuses(initialStatuses);
        }
      } catch (error: any) {
        console.error("Error fetching extra class details:", error);
        setError(
          error.response?.data?.error || "Failed to fetch class details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExtraClassDetails();
  }, [extraClassId]);

  const handleAttendanceChange = (
    userId: number,
    status: "PRESENT" | "ABSENT" | "LATE"
  ) => {
    setAttendanceStatuses((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!extraClassDetails) return;

    setIsLoading(true);
    setError("");

    try {
      const attendanceRecords = students.map((student) => ({
        user_id: student.user_id,
        status: attendanceStatuses[student.user_id] || "ABSENT",
        extra_class_id: extraClassDetails.id,
      }));

      const response = await api.post("/attendance/mark-extra", {
        attendanceRecords,
      });

      if (response.data.success) {
        alert("Extra class attendance marked successfully");
      } else {
        throw new Error(response.data.error || "Failed to mark attendance");
      }
    } catch (error: any) {
      console.error("Error marking attendance:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to mark attendance"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const markAllPresent = () => {
    const newStatuses: { [key: number]: "PRESENT" } = {};
    students.forEach((student) => {
      newStatuses[student.user_id] = "PRESENT";
    });
    setAttendanceStatuses(newStatuses);
  };

  const clearAllMarks = () => {
    const newStatuses: { [key: number]: "ABSENT" } = {};
    students.forEach((student) => {
      newStatuses[student.user_id] = "ABSENT";
    });
    setAttendanceStatuses(newStatuses);
  };

  if (!extraClassId) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">No extra class selected</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mark Extra Class Attendance
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {extraClassDetails && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">
                  <strong>Subject:</strong> {extraClassDetails.subject}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Class:</strong> {extraClassDetails.class_id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">
                  <strong>Date:</strong> {extraClassDetails.date}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Time:</strong> {extraClassDetails.start_time} -{" "}
                  {extraClassDetails.end_time}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Teacher:</strong> {extraClassDetails.teacher.name}
                </Typography>
              </Grid>
              {extraClassDetails.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    <strong>Description:</strong>{" "}
                    {extraClassDetails.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {students.length > 0 && (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={markAllPresent}
                sx={{ mr: 1 }}
              >
                Mark All Present
              </Button>
              <Button
                variant="contained"
                onClick={clearAllMarks}
                color="secondary"
              >
                Clear All Marks
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell align="right">Attendance Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.user_id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell align="right">
                        <FormControl sx={{ minWidth: 120 }}>
                          <Select
                            value={
                              attendanceStatuses[student.user_id] || "ABSENT"
                            }
                            onChange={(e: SelectChangeEvent) =>
                              handleAttendanceChange(
                                student.user_id,
                                e.target.value as "PRESENT" | "ABSENT" | "LATE"
                              )
                            }
                          >
                            <MenuItem value="PRESENT">Present</MenuItem>
                            <MenuItem value="ABSENT">Absent</MenuItem>
                            <MenuItem value="LATE">Late</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSubmitAttendance}
                disabled={isLoading}
                size="large"
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit Attendance"
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ExtraClassAttendance;

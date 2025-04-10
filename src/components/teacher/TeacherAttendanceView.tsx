import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Container,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  SelectChangeEvent,
} from "@mui/material";

interface DetailedRecord {
  date: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
  students: {
    name: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }[];
}

const TeacherAttendanceView: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<DetailedRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  // Fetch teacher's assigned classes
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        const response = await api.get("/attendance/teacher/classes");
        setClasses(response.data);
        setError("");
      } catch (error: any) {
        console.error("Error fetching classes:", error);
        setError(error.response?.data?.error || "Failed to fetch classes");
        setClasses([]);
      }
    };

    fetchTeacherClasses();
  }, []);

  // Fetch teacher's subjects for the selected class
  useEffect(() => {
    const fetchTeacherSubjects = async () => {
      try {
        if (selectedClass) {
          const response = await api.get("/attendance/teachers/subjects", {
            params: { classId: selectedClass },
          });
          setSubjects(response.data);
          setError("");
        }
      } catch (error: any) {
        console.error("Error fetching subjects:", error);
        setError(error.response?.data?.error || "Failed to fetch subjects");
        setSubjects([]);
      }
    };

    if (selectedClass) {
      fetchTeacherSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedClass]);

  // Validate date range
  const validateDateRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (end < start) {
      setError("End date cannot be before start date");
      return false;
    }

    if (end > today) {
      setError("Cannot generate report for future dates");
      return false;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 31) {
      setError("Date range cannot exceed 31 days");
      return false;
    }

    return true;
  };

  // Fetch attendance data
  const fetchAttendance = async () => {
    if (!selectedClass || !selectedSubject || !startDate || !endDate) {
      setError("Please select all required fields");
      return;
    }

    if (!validateDateRange()) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/attendance/detailed-report", {
        params: {
          classId: selectedClass,
          subject: selectedSubject,
          startDate,
          endDate,
        },
      });

      if (
        !response.data.daily_records ||
        response.data.daily_records.length === 0
      ) {
        setError("No attendance records found for the selected criteria");
        setAttendanceData([]);
      } else {
        setAttendanceData(response.data.daily_records);
        setError("");
      }
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      setError(
        error.response?.data?.error || "Failed to fetch attendance data"
      );
      setAttendanceData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error when selection changes
  useEffect(() => {
    setError("");
  }, [selectedClass, selectedSubject, startDate, endDate]);

  // Calculate overall statistics
  const calculateOverallStats = () => {
    if (!attendanceData.length) return null;

    const total = attendanceData.reduce(
      (acc, day) => {
        acc.present += day.present_count;
        acc.absent += day.absent_count;
        acc.late += day.late_count;
        acc.total += day.total_students;
        return acc;
      },
      { present: 0, absent: 0, late: 0, total: 0 }
    );

    return {
      presentPercentage: (total.present / total.total) * 100,
      absentPercentage: (total.absent / total.total) * 100,
      latePercentage: (total.late / total.total) * 100,
    };
  };

  const stats = calculateOverallStats();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Class Attendance Report
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={selectedClass}
              label="Class"
              onChange={(e: SelectChangeEvent) => {
                setSelectedClass(e.target.value);
                setSelectedSubject("");
                setAttendanceData([]);
                setError("");
              }}
              disabled={isLoading}
            >
              <MenuItem value="">
                <em>Select Class</em>
              </MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedClass && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e: SelectChangeEvent) => {
                  setSelectedSubject(e.target.value);
                  setAttendanceData([]);
                  setError("");
                }}
                disabled={isLoading}
              >
                <MenuItem value="">
                  <em>Select Subject</em>
                </MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setAttendanceData([]);
              setError("");
            }}
            disabled={isLoading}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />

          <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setAttendanceData([]);
              setError("");
            }}
            disabled={isLoading}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />

          <Button
            variant="contained"
            onClick={fetchAttendance}
            disabled={
              isLoading ||
              !selectedClass ||
              !selectedSubject ||
              !startDate ||
              !endDate
            }
            sx={{ height: 56 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Generate Report"
            )}
          </Button>
        </Box>

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Present
                </Typography>
                <Typography variant="h4">
                  {stats.presentPercentage.toFixed(1)}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" color="error" gutterBottom>
                  Absent
                </Typography>
                <Typography variant="h4">
                  {stats.absentPercentage.toFixed(1)}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" color="warning.main" gutterBottom>
                  Late
                </Typography>
                <Typography variant="h4">
                  {stats.latePercentage.toFixed(1)}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {!isLoading && attendanceData.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total Students</TableCell>
                  <TableCell align="right">Present</TableCell>
                  <TableCell align="right">Absent</TableCell>
                  <TableCell align="right">Late</TableCell>
                  <TableCell align="right">Attendance %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">{record.total_students}</TableCell>
                    <TableCell align="right">{record.present_count}</TableCell>
                    <TableCell align="right">{record.absent_count}</TableCell>
                    <TableCell align="right">{record.late_count}</TableCell>
                    <TableCell align="right">
                      {record.attendance_percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!isLoading &&
          selectedClass &&
          selectedSubject &&
          startDate &&
          endDate &&
          attendanceData.length === 0 &&
          !error && (
            <Box sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}>
              <Typography variant="body1">
                No attendance records found for the selected criteria.
              </Typography>
            </Box>
          )}
      </Box>
    </Container>
  );
};

export default TeacherAttendanceView;

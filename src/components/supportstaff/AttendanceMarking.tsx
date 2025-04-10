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
  Alert,
  ButtonGroup,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";

interface Student {
  user_id: number;
  name: string;
  subjects: string;
  class_id: string;
  attendances?: Array<{
    subject: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }>;
}

const AttendanceMarking: React.FC = () => {
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState<{
    [key: number]: "PRESENT" | "ABSENT" | "LATE";
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("/auth/classes");
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setError("Failed to fetch classes");
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setIsLoading(true);
      api
        .get("/attendance/students", {
          params: { classId: selectedClass },
        })
        .then((response) => {
          const allSubjects = new Set<string>();
          response.data.forEach((student: Student) => {
            if (student.subjects) {
              student.subjects
                .split(",")
                .map((s: string) => s.trim().toLowerCase())
                .forEach((subject: string) => allSubjects.add(subject));
            }
          });
          const sortedSubjects = Array.from(allSubjects).sort();
          setAvailableSubjects(sortedSubjects);
          setSelectedSubject("");
        })
        .catch((error) => {
          console.error("Error fetching subjects", error);
          setAvailableSubjects([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [selectedClass]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass && selectedSubject) {
        try {
          console.log(
            "Fetching students for class:",
            selectedClass,
            "and subject:",
            selectedSubject
          );
          const response = await api.get("/attendance/students", {
            params: {
              classId: selectedClass,
              subject: selectedSubject.trim().toLowerCase(),
            },
          });

          if (response.data.length === 0) {
            setError("No students found for the selected class and subject");
          } else {
            setError("");
            const initialStatuses: {
              [key: number]: "PRESENT" | "ABSENT" | "LATE";
            } = {};
            response.data.forEach((student: Student) => {
              const existingAttendance = student.attendances?.find(
                (a) => a.subject.toLowerCase() === selectedSubject.toLowerCase()
              );
              if (existingAttendance) {
                initialStatuses[student.user_id] = existingAttendance.status;
              }
            });
            setAttendanceStatuses(initialStatuses);
          }
          setStudents(response.data);
        } catch (error) {
          console.error("Error fetching students:", error);
          setError("Failed to fetch students");
          setStudents([]);
        }
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSubject]);

  const handleAttendanceSubmit = async () => {
    if (!selectedClass || !selectedSubject || !selectedDate) {
      setError("Please select class, subject and date");
      return;
    }

    setIsLoading(true);
    setError("");

    const attendanceRecords = students.map((student) => ({
      user_id: student.user_id,
      status: attendanceStatuses[student.user_id] || "ABSENT",
      subject: selectedSubject.trim(),
      date: selectedDate,
    }));

    try {
      const response = await api.post("/attendance/mark", {
        attendanceRecords,
      });

      if (response.data.success) {
        // Format date as dd/mm/yyyy
        const formattedDate = new Date(selectedDate).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );
        alert("Attendance marked successfully for " + formattedDate);
        setAttendanceStatuses({});

        const studentsResponse = await api.get("/attendance/students", {
          params: {
            classId: selectedClass,
            subject: selectedSubject.trim(),
          },
        });
        setStudents(studentsResponse.data as Student[]);
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

  const markAllAbsent = () => {
    const newStatuses: { [key: number]: "ABSENT" } = {};
    students.forEach((student) => {
      newStatuses[student.user_id] = "ABSENT";
    });
    setAttendanceStatuses(newStatuses);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mark Attendance
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
              onChange={(e: SelectChangeEvent) =>
                setSelectedClass(e.target.value)
              }
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

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={selectedSubject}
              label="Subject"
              onChange={(e: SelectChangeEvent) =>
                setSelectedSubject(e.target.value)
              }
              disabled={!selectedClass || isLoading}
            >
              <MenuItem value="">
                <em>Select Subject</em>
              </MenuItem>
              {availableSubjects.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={isLoading}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {students.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <ButtonGroup variant="contained" sx={{ mb: 2 }}>
              <Button onClick={markAllPresent}>Mark All Present</Button>
              <Button onClick={markAllAbsent}>Mark All Absent</Button>
            </ButtonGroup>

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
                              setAttendanceStatuses((prev) => ({
                                ...prev,
                                [student.user_id]: e.target.value as
                                  | "PRESENT"
                                  | "ABSENT"
                                  | "LATE",
                              }))
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
                onClick={handleAttendanceSubmit}
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

export default AttendanceMarking;

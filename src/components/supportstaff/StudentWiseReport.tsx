import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { styled } from "@mui/material/styles";

interface SubjectAttendance {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

interface StudentReport {
  studentId: number;
  name: string;
  subjects: {
    [key: string]: SubjectAttendance;
  };
}

interface Student {
  user_id: number;
  name: string;
}

const ChartsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  '& .chart-title': {
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  }
}));

const StudentWiseReport: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [reportData, setReportData] = useState<StudentReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("/auth/classes");
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass) {
        try {
          const response = await api.get(`/auth/students-by-class`, {
            params: {
              class: selectedClass
            }
          });
          setStudents(response.data.map((student: any) => ({
            user_id: student.user_id,
            name: student.name
          })));
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      } else {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const generateReport = async () => {
    if (!selectedClass || !startDate || !endDate || !selectedStudent) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setReportData(null); // Clear previous report data

    try {
      const response = await api.get("/attendance/student-wise-report", {
        params: {
          classId: selectedClass,
          studentQuery: selectedStudent,
          startDate,
          endDate,
        },
      });
      setReportData(response.data);
    } catch (error: any) {
      console.error("Error generating report:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        "Failed to generate report. Please check your inputs and try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceColor = (percentage: number): "success" | "warning" | "error" => {
    if (percentage >= 90) return "success";
    if (percentage >= 75) return "warning";
    return "error";
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Student Attendance Report
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={selectedClass}
              label="Class"
              onChange={(e) => setSelectedClass(e.target.value)}
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
            <InputLabel>Student</InputLabel>
            <Select
              value={selectedStudent}
              label="Student"
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={!selectedClass}
            >
              <MenuItem value="">
                <em>Select Student</em>
              </MenuItem>
              {students.map((student) => (
                <MenuItem key={student.user_id} value={student.user_id}>
                  {student.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Button variant="contained" onClick={generateReport} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Generate Report"}
          </Button>
        </Box>

        {reportData ? (
          <Box>
            <Typography variant="h5" gutterBottom>
              Student: {reportData.name}
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Present</TableCell>
                    <TableCell>Absent</TableCell>
                    <TableCell>Late</TableCell>
                    <TableCell>Total Classes</TableCell>
                    <TableCell>Attendance %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(reportData.subjects).map(([subject, data]) => (
                    <TableRow key={subject}>
                      <TableCell>{subject}</TableCell>
                      <TableCell>{data.present}</TableCell>
                      <TableCell>{data.absent}</TableCell>
                      <TableCell>{data.late}</TableCell>
                      <TableCell>{data.total}</TableCell>
                      <TableCell>
                        <Typography color={getAttendanceColor(data.percentage)}>
                          {data.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Subject-wise Attendance Breakdown
            </Typography>
            <ChartsGrid>
              {Object.entries(reportData.subjects).map(([subject, data]) => (
                <Box key={subject} sx={{ boxShadow: 1, p: 2, borderRadius: 1 }}>
                  <Typography className="chart-title" variant="h6">
                    {subject}
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: 'Present',
                          value: data.present,
                          color: '#00C49F'
                        },
                        {
                          name: 'Absent',
                          value: data.absent,
                          color: '#FF8042'
                        },
                        {
                          name: 'Late',
                          value: data.late,
                          color: '#FFBB28'
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {[
                          { name: 'Present', color: '#00C49F' },
                          { name: 'Absent', color: '#FF8042' },
                          { name: 'Late', color: '#FFBB28' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ))}
            </ChartsGrid>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}>
            <Typography variant="body1">
              {isLoading ? "Generating report..." : "Enter student details and date range to generate the report"}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default StudentWiseReport;

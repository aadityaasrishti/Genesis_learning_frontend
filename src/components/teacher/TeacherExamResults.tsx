import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Container,
  styled,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TeacherNavbar from "./TeacherNavbar";
import api from "../../services/api";

const PageContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

interface StudentResult {
  student: {
    id: number;
    name: string;
    email: string;
  };
  results: Array<{
    id: number;
    subject: string;
    exam_type: string;
    marks: number;
    total_marks: number;
    percentage: number;
    grade?: string;
    exam_date: string;
    remarks?: string;
  }>;
}

const TeacherExamResults: React.FC = () => {
  const [classId, setClassId] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classId) {
      fetchSubjects();
    }
  }, [classId]);

  useEffect(() => {
    if (classId) {
      fetchResults();
    }
  }, [classId, subject]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/attendance/teacher/classes");
      setClasses(response.data);
    } catch (err) {
      setError("Failed to fetch classes");
      console.error("Error fetching classes:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/attendance/subjects", {
        params: { classId },
      });
      setSubjects(response.data);
    } catch (err) {
      setError("Failed to fetch subjects");
      console.error("Error fetching subjects:", err);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const normalizedSubject = subject ? subject.trim().toLowerCase() : "";
      const response = await api.get(`/exam-results/class/${classId}`, {
        params: { subject: normalizedSubject },
      });
      setResults(response.data);
    } catch (err) {
      setError("Failed to fetch exam results");
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (studentResults: StudentResult) => {
    const totalResults = studentResults.results.length;
    if (totalResults === 0) return "N/A";

    const sum = studentResults.results.reduce(
      (acc, result) => acc + result.percentage,
      0
    );
    return `${(sum / totalResults).toFixed(1)}%`;
  };

  const handleExpandClick = (studentId: number) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  return (
    <Box>
      <TeacherNavbar />
      <PageContainer>
        <ContentWrapper>
          <Typography variant="h4" gutterBottom>
            Class Exam Results
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Select Class"
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSubject("");
                }}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Select Subject (Optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subj) => (
                  <MenuItem key={subj} value={subj}>
                    {subj}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : results.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Student Name</TableCell>
                    <TableCell>Average Score</TableCell>
                    <TableCell>Latest Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((studentResult) => (
                    <React.Fragment key={studentResult.student.id}>
                      <TableRow>
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() =>
                              handleExpandClick(studentResult.student.id)
                            }
                          >
                            {expandedStudent === studentResult.student.id ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>{studentResult.student.name}</TableCell>
                        <TableCell>{calculateAverage(studentResult)}</TableCell>
                        <TableCell>
                          {studentResult.results[0] ? (
                            <>
                              {studentResult.results[0].subject} -{" "}
                              {studentResult.results[0].percentage.toFixed(1)}%
                              {studentResult.results[0].grade && (
                                <> (Grade: {studentResult.results[0].grade})</>
                              )}
                            </>
                          ) : (
                            "No results"
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={4}
                        >
                          <Collapse
                            in={expandedStudent === studentResult.student.id}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ margin: 1 }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                              >
                                Detailed Results
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Exam Type</TableCell>
                                    <TableCell>Marks</TableCell>
                                    <TableCell>Total Marks</TableCell>
                                    <TableCell>Percentage</TableCell>
                                    <TableCell>Grade</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Remarks</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {studentResult.results.map((result) => (
                                    <TableRow key={result.id}>
                                      <TableCell>{result.subject}</TableCell>
                                      <TableCell>{result.exam_type}</TableCell>
                                      <TableCell>{result.marks}</TableCell>
                                      <TableCell>
                                        {result.total_marks}
                                      </TableCell>
                                      <TableCell>
                                        {result.percentage.toFixed(1)}%
                                      </TableCell>
                                      <TableCell>
                                        {result.grade || "-"}
                                      </TableCell>
                                      <TableCell>
                                        {new Date(
                                          result.exam_date
                                        ).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell>
                                        {result.remarks || "-"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" color="text.secondary" align="center">
              {classId
                ? "No exam results found for this class"
                : "Select a class to view exam results"}
            </Typography>
          )}
        </ContentWrapper>
      </PageContainer>
    </Box>
  );
};

export default TeacherExamResults;

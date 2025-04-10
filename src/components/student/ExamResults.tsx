import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ExamResult {
  id: number;
  subject: string;
  exam_type: string;
  marks: number;
  total_marks: number;
  percentage: number;
  grade?: string;
  exam_date: string;
  remarks?: string;
}

interface GroupedResults {
  [subject: string]: ExamResult[];
}

interface NewResult {
  subject: string;
  exam_type: string;
  marks: string;
  total_marks: string;
  grade: string;
  remarks: string;
}

const ExamResults: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<GroupedResults>({});
  const [summary, setSummary] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);
  const [newResult, setNewResult] = useState<NewResult>({
    subject: "",
    exam_type: "",
    marks: "",
    total_marks: "",
    grade: "",
    remarks: "",
  });

  useEffect(() => {
    fetchStudentData();
    fetchResults();
  }, []);

  const fetchStudentData = async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data.student?.subjects) {
        const subjects = response.data.student.subjects
          .split(",")
          .map((s: string) => s.trim());
        setEnrolledSubjects(subjects);
      }
    } catch (err) {
      console.error("Error fetching student subjects:", err);
      setError("Failed to fetch enrolled subjects");
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/exam-results/student/${user?.user_id}`);

      const groupedResults: GroupedResults = response.data.results || {};
      // No need to filter here since backend already handles subject validation
      setResults(groupedResults);
      setSummary(response.data.summary || null);
    } catch (err) {
      setError("Failed to fetch exam results");
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      if (!newResult.subject) {
        setError("Please select a subject");
        return;
      }
      await api.post("/exam-results/upload", newResult);
      setIsUploadDialogOpen(false);
      fetchResults();
      setNewResult({
        subject: "",
        exam_type: "",
        marks: "",
        total_marks: "",
        grade: "",
        remarks: "",
      });
    } catch (err) {
      setError("Failed to upload exam result");
      console.error("Error uploading result:", err);
    }
  };

  const getChartData = (subjectResults: ExamResult[]) => {
    const sortedResults = [...subjectResults].sort(
      (a, b) =>
        new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
    );

    return {
      labels: sortedResults.map((result) =>
        new Date(result.exam_date).toLocaleDateString()
      ),
      datasets: [
        {
          label: "Percentage",
          data: sortedResults.map((result) => result.percentage),
          backgroundColor: "rgb(75, 192, 192)",
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Performance Trend",
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };

  if (loading) return <Box p={3}>Loading...</Box>;
  if (error)
    return (
      <Box p={3} color="error.main">
        {error}
      </Box>
    );

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Exam Results</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsUploadDialogOpen(true)}
        >
          Upload New Result
        </Button>
      </Box>

      {summary && (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography>
                Overall Average: {summary.overall_average?.toFixed(2) ?? "N/A"}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography>
                Highest Score: {summary.highest_score?.toFixed(2) ?? "N/A"}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography>
                Lowest Score: {summary.lowest_score?.toFixed(2) ?? "N/A"}%
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {Object.keys(results).length > 0 ? (
        <>
          <Box mb={3}>
            <TextField
              select
              fullWidth
              label="Select Subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <MenuItem value="">All Subjects</MenuItem>
              {Object.keys(results).map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Grid container spacing={3}>
            {Object.entries(results)
              .filter(
                ([subject]) => !selectedSubject || subject === selectedSubject
              )
              .map(([subject, subjectResults]) => (
                <Grid item xs={12} key={subject}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {subject}
                    </Typography>
                    <Grid container spacing={2} mb={2}>
                      {subjectResults.map((result) => (
                        <Grid item xs={12} key={result.id}>
                          <Paper elevation={1} sx={{ p: 1 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle2">
                                  {result.exam_type} -{" "}
                                  {new Date(
                                    result.exam_date
                                  ).toLocaleDateString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography>
                                  Marks: {result.marks}/{result.total_marks} (
                                  {result.percentage.toFixed(2)}%)
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography>
                                  Grade: {result.grade || "N/A"}
                                </Typography>
                              </Grid>
                              {result.remarks && (
                                <Grid item xs={12}>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Remarks: {result.remarks}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                    <Box height={300}>
                      <Bar
                        data={getChartData(subjectResults)}
                        options={chartOptions}
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </>
      ) : (
        !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              No exam results available
            </Typography>
          </Box>
        )
      )}

      {/* Upload Dialog */}
      <Dialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
      >
        <DialogTitle>Upload New Result</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Subject"
                  value={newResult.subject}
                  onChange={(e) =>
                    setNewResult({ ...newResult, subject: e.target.value })
                  }
                >
                  {enrolledSubjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Exam Type"
                  value={newResult.exam_type}
                  onChange={(e) =>
                    setNewResult({ ...newResult, exam_type: e.target.value })
                  }
                >
                  <MenuItem value="UNIT_TEST">Unit Test</MenuItem>
                  <MenuItem value="MIDTERM">Midterm</MenuItem>
                  <MenuItem value="FINAL">Final</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Marks"
                  value={newResult.marks}
                  onChange={(e) =>
                    setNewResult({ ...newResult, marks: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Marks"
                  value={newResult.total_marks}
                  onChange={(e) =>
                    setNewResult({ ...newResult, total_marks: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Grade"
                  value={newResult.grade}
                  onChange={(e) =>
                    setNewResult({ ...newResult, grade: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Remarks"
                  value={newResult.remarks}
                  onChange={(e) =>
                    setNewResult({ ...newResult, remarks: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleUpload}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamResults;

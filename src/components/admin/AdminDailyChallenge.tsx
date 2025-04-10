import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AdminNavbar from "./AdminNavbar";
import api from "../../services/api";

interface Question {
  question: string;
  type: "MCQ" | "SUBJECTIVE";
  options?: string[];
  correctAnswer?: number;
}

interface DailyChallenge {
  id: number;
  title: string;
  class_id: string;
  subject: string;
  questions: Question[];
  date: string;
  teacher: {
    name: string;
  };
  submissionCount: number;
  submissions: Array<{
    student: { name: string };
    answers: Array<{ questionIndex: number; answer: string | number }>;
    score: number | null;
  }>;
}

const AdminDailyChallenge: React.FC = () => {
  const [expandedCards, setExpandedCards] = useState<{
    [key: number]: boolean;
  }>({});
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchClasses();
    fetchChallenges();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/attendance/classes");
      setClasses(response.data);
    } catch (err: any) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/attendance/subjects", {
        params: { classId: selectedClass },
      });
      setSubjects(response.data);
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    }
  };

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append("date", selectedDate);
      }
      if (selectedClass) {
        params.append("class_id", selectedClass);
      }
      if (selectedSubject) {
        params.append("subject", selectedSubject);
      }

      const response = await api.get(`/daily-challenges/admin?${params}`);
      setChallenges(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch challenges");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchChallenges();
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedClass("");
    setSelectedSubject("");
    fetchChallenges();
  };

  const toggleExpand = (challengeId: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [challengeId]: !prev[challengeId],
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return "Invalid Date";
    }
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupChallengesByDate = (challenges: DailyChallenge[]) => {
    const groups = challenges.reduce(
      (acc: { [key: string]: DailyChallenge[] }, challenge) => {
        const date = new Date(challenge.date);
        if (isNaN(date.getTime())) {
          console.warn("Invalid challenge date:", challenge.date);
          return acc;
        }

        const dateKey = date.toISOString().split("T")[0];

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(challenge);
        return acc;
      },
      {}
    );

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  return (
    <Box className="admin-dashboard">
      <AdminNavbar />
      <Box className="dashboard-container" sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Daily Challenges Overview
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                label="Filter by Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      {cls}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={selectedSubject}
                  label="Subject"
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="contained" onClick={handleFilter} fullWidth>
                  Apply Filters
                </Button>
                <Button variant="outlined" onClick={clearFilters}>
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {groupChallengesByDate(challenges).map(([dateKey, dateGroup]) => (
              <Box key={dateKey} sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "text.secondary" }}
                >
                  {formatDate(dateKey)}
                </Typography>
                <Grid container spacing={3}>
                  {dateGroup.map((challenge) => (
                    <Grid item xs={12} key={challenge.id}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          borderLeft: "5px solid",
                          borderLeftColor: "primary.main",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">
                              {challenge.title}
                            </Typography>
                            <Typography color="textSecondary" gutterBottom>
                              Class: {challenge.class_id} | Subject:{" "}
                              {challenge.subject}
                            </Typography>
                            <Typography color="textSecondary" gutterBottom>
                              Teacher: {challenge.teacher.name}
                            </Typography>
                            <Typography>
                              Total Submissions: {challenge.submissionCount} /{" "}
                              Questions: {challenge.questions.length}
                            </Typography>
                            {challenge.submissionCount > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography
                                  sx={{
                                    color: "primary.main",
                                    fontWeight: "medium",
                                  }}
                                >
                                  Average Score:{" "}
                                  {(
                                    challenge.submissions.reduce(
                                      (acc, sub) => acc + (sub.score || 0),
                                      0
                                    ) / challenge.submissionCount
                                  ).toFixed(1)}
                                  %
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {challenge.submissionCount > 0 && (
                            <IconButton
                              onClick={() => toggleExpand(challenge.id)}
                              sx={{
                                transform: expandedCards[challenge.id]
                                  ? "rotate(180deg)"
                                  : "none",
                                transition: "transform 0.3s",
                              }}
                            >
                              <ExpandMoreIcon />
                            </IconButton>
                          )}
                        </Box>

                        <Collapse in={expandedCards[challenge.id]}>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Questions & Submissions
                            </Typography>
                            {challenge.questions.map((question, qIndex) => (
                              <Box key={qIndex} sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                  Q{qIndex + 1}: {question.question}
                                </Typography>
                                {question.type === "MCQ" && (
                                  <Box sx={{ ml: 2 }}>
                                    {question.options?.map((option, oIndex) => (
                                      <Typography
                                        key={oIndex}
                                        variant="body2"
                                        sx={{
                                          color:
                                            question.correctAnswer === oIndex
                                              ? "success.main"
                                              : "text.primary",
                                        }}
                                      >
                                        Option {oIndex + 1}: {option}
                                        {question.correctAnswer === oIndex &&
                                          " (Correct)"}
                                      </Typography>
                                    ))}
                                  </Box>
                                )}
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Submissions:
                                  </Typography>
                                  {challenge.submissions.map((sub, sIndex) => (
                                    <Box
                                      key={sIndex}
                                      sx={{
                                        ml: 2,
                                        mb: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography variant="body2">
                                        {sub.student.name}:
                                      </Typography>
                                      {question.type === "MCQ" ? (
                                        <Typography
                                          component="span"
                                          sx={{
                                            color:
                                              sub.answers?.find(
                                                (a) =>
                                                  a.questionIndex === qIndex
                                              )?.answer ===
                                              question.correctAnswer
                                                ? "success.main"
                                                : "error.main",
                                          }}
                                        >
                                          {
                                            question.options?.[
                                              sub.answers?.find(
                                                (a) =>
                                                  a.questionIndex === qIndex
                                              )?.answer as number
                                            ]
                                          }
                                          (
                                          {sub.answers?.find(
                                            (a) => a.questionIndex === qIndex
                                          )?.answer === question.correctAnswer
                                            ? "✓ Correct"
                                            : "✗ Incorrect"}
                                          )
                                        </Typography>
                                      ) : (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <Typography>
                                            {
                                              sub.answers?.find(
                                                (a) =>
                                                  a.questionIndex === qIndex
                                              )?.answer
                                            }
                                          </Typography>
                                          {sub.score !== null && (
                                            <Typography
                                              component="span"
                                              sx={{
                                                color:
                                                  sub.score >= 70
                                                    ? "success.main"
                                                    : "warning.main",
                                                ml: 1,
                                                fontSize: "0.875rem",
                                              }}
                                            >
                                              (Grade: {sub.score}%)
                                            </Typography>
                                          )}
                                        </Box>
                                      )}
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Collapse>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}

            {challenges.length === 0 && (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography color="textSecondary">
                  No challenges found for the selected criteria
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminDailyChallenge;

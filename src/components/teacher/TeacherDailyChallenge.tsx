import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Collapse,
  Tabs,
  Tab,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TeacherNavbar from "./TeacherNavbar";
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
  submissionCount: number;
  submissions: Array<{
    id: number;
    student: { name: string };
    answers: Array<{ questionIndex: number; answer: string | number }> | null;
    score: number | null;
  }> | null;
}

const TeacherDailyChallenge: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCards, setExpandedCards] = useState<{
    [key: number]: boolean;
  }>({});
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      type: "MCQ",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [grading, setGrading] = useState<{ [key: string]: number }>({});
  const [gradingError, setGradingError] = useState("");
  const [gradingSuccess, setGradingSuccess] = useState(false);

  useEffect(() => {
    fetchTeacherData();
    fetchChallenges();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const response = await api.get("/auth/teacher-data");
      setClasses(response.data.classes || []);
      setSubjects(response.data.subjects || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch teacher data");
    }
  };

  const fetchChallenges = async (date?: string) => {
    try {
      const params = new URLSearchParams();
      if (date) {
        const formattedDate = new Date(date).toISOString().split("T")[0];
        params.append("date", formattedDate);
      }
      const response = await api.get(`/daily-challenges/teacher?${params}`);
      setChallenges(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch challenges");
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        type: "MCQ",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    const newQuestions = [...questions];
    if (field === "type") {
      newQuestions[index] = {
        question: newQuestions[index].question,
        type: value,
        ...(value === "MCQ"
          ? { options: ["", "", "", ""], correctAnswer: 0 }
          : {}),
      };
    } else {
      newQuestions[index] = { ...newQuestions[index], [field]: value };
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options![optionIndex] = value;
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/daily-challenges", {
        class_id: selectedClass,
        subject: selectedSubject,
        title,
        questions,
      });

      setTitle("");
      setSelectedClass("");
      setSelectedSubject("");
      setQuestions([
        {
          question: "",
          type: "MCQ",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ]);

      fetchChallenges();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create challenge");
    } finally {
      setLoading(false);
    }
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

  const toggleExpand = (challengeId: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [challengeId]: !prev[challengeId],
    }));
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchChallenges(date);
  };

  const handleGrade = async (submissionId: number, score: number) => {
    try {
      await api.post("/daily-challenges/grade", {
        submission_id: submissionId,
        score,
      });
      setGradingSuccess(true);
      fetchChallenges(selectedDate);
      setTimeout(() => setGradingSuccess(false), 3000);
    } catch (err: any) {
      setGradingError(
        err.response?.data?.error || "Failed to grade submission"
      );
    }
  };

  return (
    <div className="admin-dashboard">
      <TeacherNavbar />
      <Box className="dashboard-container" sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Daily Challenges
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {gradingSuccess && (
          <Alert
            severity="success"
            sx={{ mt: 2 }}
            onClose={() => setGradingSuccess(false)}
          >
            Answer graded successfully
          </Alert>
        )}
        {gradingError && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            onClose={() => setGradingError("")}
          >
            {gradingError}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Create Challenge" />
          <Tab label="View Submissions" />
        </Tabs>

        {activeTab === 0 ? (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Create New Challenge
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Class</InputLabel>
                    <Select
                      value={selectedClass}
                      label="Class"
                      onChange={(e) => setSelectedClass(e.target.value)}
                      required
                    >
                      {classes.map((cls) => (
                        <MenuItem key={cls} value={cls}>
                          {cls}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={selectedSubject}
                      label="Subject"
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      required
                    >
                      {subjects.map((subj) => (
                        <MenuItem key={subj} value={subj}>
                          {subj}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Challenge Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Grid>

                {questions.map((question, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper sx={{ p: 2, position: "relative" }}>
                      <IconButton
                        sx={{ position: "absolute", right: 8, top: 8 }}
                        onClick={() => handleRemoveQuestion(index)}
                        disabled={questions.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label={`Question ${index + 1}`}
                            value={question.question}
                            onChange={(e) =>
                              handleQuestionChange(
                                index,
                                "question",
                                e.target.value
                              )
                            }
                            required
                            multiline
                            rows={2}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel>Question Type</InputLabel>
                            <Select
                              value={question.type}
                              label="Question Type"
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  "type",
                                  e.target.value
                                )
                              }
                              required
                            >
                              <MenuItem value="MCQ">Multiple Choice</MenuItem>
                              <MenuItem value="SUBJECTIVE">Subjective</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {question.type === "MCQ" && (
                          <>
                            {question.options?.map((option, optIndex) => (
                              <Grid item xs={12} md={6} key={optIndex}>
                                <TextField
                                  fullWidth
                                  label={`Option ${optIndex + 1}`}
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      index,
                                      optIndex,
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </Grid>
                            ))}
                            <Grid item xs={12} md={4}>
                              <FormControl fullWidth>
                                <InputLabel>Correct Answer</InputLabel>
                                <Select
                                  value={question.correctAnswer}
                                  label="Correct Answer"
                                  onChange={(e) =>
                                    handleQuestionChange(
                                      index,
                                      "correctAnswer",
                                      e.target.value
                                    )
                                  }
                                  required
                                >
                                  {question.options?.map((_, optIndex) => (
                                    <MenuItem key={optIndex} value={optIndex}>
                                      Option {optIndex + 1}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    onClick={handleAddQuestion}
                    sx={{ mr: 2 }}
                  >
                    Add Question
                  </Button>
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Create Challenge"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        ) : (
          <Box>
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                type="date"
                label="Filter by Date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              {selectedDate && (
                <Button
                  variant="outlined"
                  onClick={() => handleDateChange("")}
                  size="small"
                >
                  Clear Filter
                </Button>
              )}
            </Box>

            {groupChallengesByDate(challenges).map(([date, dateGroup]) => (
              <Box key={date} sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "text.secondary" }}
                >
                  {formatDate(date)}
                </Typography>
                <Grid container spacing={3}>
                  {dateGroup.map((challenge) => (
                    <Grid item xs={12} md={6} key={challenge.id}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          borderLeft: "5px solid",
                          borderLeftColor:
                            challenge.submissionCount > 0
                              ? challenge.submissions?.some(
                                  (s) => s.score === 100
                                )
                                ? "success.main"
                                : "warning.main"
                              : "primary.main",
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
                            <Typography>
                              Total Submissions: {challenge.submissionCount} /
                              Questions: {challenge.questions.length}
                            </Typography>
                            {challenge.submissionCount > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography
                                  sx={{
                                    color: challenge.submissions?.some(
                                      (s) => s.score === 100
                                    )
                                      ? "success.main"
                                      : "warning.main",
                                    fontWeight: "medium",
                                  }}
                                >
                                  Average Score:{" "}
                                  {challenge.submissions
                                    ? (
                                        challenge.submissions.reduce(
                                          (acc, sub) => acc + (sub.score || 0),
                                          0
                                        ) / challenge.submissionCount
                                      ).toFixed(1)
                                    : 0}
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
                        {challenge.submissionCount > 0 &&
                          challenge.submissions && (
                            <Collapse in={expandedCards[challenge.id]}>
                              <Box sx={{ mt: 2 }}>
                                {challenge.submissions.map((sub, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      mt: 2,
                                      pl: 2,
                                      borderLeft: "2px solid #e0e0e0",
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontWeight: "bold" }}
                                    >
                                      {sub.student.name} - Score:{" "}
                                      {sub.score !== null
                                        ? `${sub.score}%`
                                        : "Pending"}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                      {challenge.questions.map(
                                        (question, qIndex) => (
                                          <Box key={qIndex} sx={{ mb: 1.5 }}>
                                            <Typography
                                              variant="body2"
                                              color="textSecondary"
                                            >
                                              Q{qIndex + 1}: {question.question}
                                            </Typography>
                                            {sub.answers?.find(
                                              (a) => a.questionIndex === qIndex
                                            ) && (
                                              <Box>
                                                {question.type === "MCQ" ? (
                                                  <Box>
                                                    <Typography
                                                      variant="body2"
                                                      sx={{ pl: 2 }}
                                                    >
                                                      {
                                                        question.options?.[
                                                          sub.answers?.find(
                                                            (a) =>
                                                              a.questionIndex ===
                                                              qIndex
                                                          )?.answer as number
                                                        ]
                                                      }
                                                      {question.correctAnswer !==
                                                        undefined && (
                                                        <Typography
                                                          component="span"
                                                          sx={{
                                                            ml: 1,
                                                            color:
                                                              sub.answers?.find(
                                                                (a) =>
                                                                  a.questionIndex ===
                                                                  qIndex
                                                              )?.answer ===
                                                              question.correctAnswer
                                                                ? "success.main"
                                                                : "error.main",
                                                          }}
                                                        >
                                                          (
                                                          {sub.answers?.find(
                                                            (a) =>
                                                              a.questionIndex ===
                                                              qIndex
                                                          )?.answer ===
                                                          question.correctAnswer
                                                            ? "✓ Correct"
                                                            : "✗ Incorrect"}
                                                          )
                                                        </Typography>
                                                      )}
                                                    </Typography>
                                                  </Box>
                                                ) : (
                                                  <Box sx={{ pl: 2 }}>
                                                    <Typography
                                                      variant="body2"
                                                      sx={{ mb: 1 }}
                                                    >
                                                      {
                                                        sub.answers?.find(
                                                          (a) =>
                                                            a.questionIndex ===
                                                            qIndex
                                                        )?.answer
                                                      }
                                                    </Typography>
                                                    <Box
                                                      sx={{
                                                        mt: 1,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 2,
                                                      }}
                                                    >
                                                      <TextField
                                                        type="number"
                                                        label="Score (0-100)"
                                                        size="small"
                                                        value={
                                                          grading[
                                                            `${sub.id}-${qIndex}`
                                                          ] || ""
                                                        }
                                                        onChange={(e) => {
                                                          const value =
                                                            Math.min(
                                                              100,
                                                              Math.max(
                                                                0,
                                                                Number(
                                                                  e.target.value
                                                                )
                                                              )
                                                            );
                                                          setGrading(
                                                            (prev) => ({
                                                              ...prev,
                                                              [`${sub.id}-${qIndex}`]:
                                                                value,
                                                            })
                                                          );
                                                        }}
                                                        InputProps={{
                                                          inputProps: {
                                                            min: 0,
                                                            max: 100,
                                                          },
                                                        }}
                                                      />
                                                      <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() =>
                                                          handleGrade(
                                                            sub.id,
                                                            grading[
                                                              `${sub.id}-${qIndex}`
                                                            ] || 0
                                                          )
                                                        }
                                                      >
                                                        Grade
                                                      </Button>
                                                    </Box>
                                                  </Box>
                                                )}
                                              </Box>
                                            )}
                                          </Box>
                                        )
                                      )}
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Collapse>
                          )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}

            {challenges.length === 0 && (
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "background.default",
                }}
              >
                <Typography color="textSecondary">
                  No challenges created yet
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Box>
    </div>
  );
};

export default TeacherDailyChallenge;

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  IconButton,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StudentNavbar from "./StudentNavbar";
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
  subject: string;
  questions: Question[];
  attempted: boolean;
  score: number | null;
  submittedAnswers: Array<{ questionIndex: number; answer: string | number }>;
  submittedAt: string;
  date: string;
}

const StudentDailyChallenge: React.FC = () => {
  // Add state for expanded cards
  const [expandedCards, setExpandedCards] = useState<{
    [key: number]: boolean;
  }>({});
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] =
    useState<DailyChallenge | null>(null);
  const [answers, setAnswers] = useState<
    Array<{ questionIndex: number; answer: string | number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async (date?: string) => {
    try {
      const params = new URLSearchParams();
      if (date) {
        // Format date to YYYY-MM-DD
        const formattedDate = new Date(date).toISOString().split("T")[0];
        params.append("date", formattedDate);
      }
      const response = await api.get(`/daily-challenges/student?${params}`);
      setChallenges(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch challenges");
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchChallenges(date);
  };

  const handleChallengeSelect = (challenge: DailyChallenge) => {
    if (!challenge.attempted) {
      setSelectedChallenge(challenge);
      setAnswers(
        challenge.questions.map((_, index) => ({
          questionIndex: index,
          answer: "",
        }))
      );
      setSubmitSuccess(false);
    }
  };

  const renderAnswer = (question: Question, index: number) => {
    const submittedAnswer = selectedChallenge?.submittedAnswers?.find(
      (a) => a.questionIndex === index
    )?.answer;

    if (!selectedChallenge?.attempted) {
      // Input mode for new submission
      if (question.type === "MCQ" && question.options) {
        return (
          <FormControl component="fieldset">
            <FormLabel>Select your answer:</FormLabel>
            <RadioGroup
              value={
                answers
                  .find((a) => a.questionIndex === index)
                  ?.answer.toString() || ""
              }
              onChange={(e) =>
                handleAnswerChange(index, parseInt(e.target.value))
              }
            >
              {question.options.map((option, optIndex) => (
                <FormControlLabel
                  key={optIndex}
                  value={optIndex.toString()}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      }
      return (
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Your answer"
          value={answers.find((a) => a.questionIndex === index)?.answer || ""}
          onChange={(e) => handleAnswerChange(index, e.target.value)}
          required
        />
      );
    }

    // View mode for submitted answers
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Your Answer:
        </Typography>
        <Typography
          sx={{
            pl: 2,
            borderLeft: "3px solid",
            borderColor:
              question.type === "MCQ" && question.correctAnswer !== undefined
                ? submittedAnswer === question.correctAnswer
                  ? "success.main"
                  : "error.main"
                : "grey.400",
          }}
        >
          {question.type === "MCQ" && question.options
            ? question.options[submittedAnswer as number]
            : submittedAnswer}
        </Typography>

        {question.type === "MCQ" && question.correctAnswer !== undefined && (
          <>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ mt: 2 }}
              gutterBottom
            >
              Correct Answer:
            </Typography>
            <Typography sx={{ pl: 2 }}>
              {question.options?.[question.correctAnswer]}
            </Typography>
          </>
        )}
      </Box>
    );
  };

  const handleAnswerChange = (
    questionIndex: number,
    answer: string | number
  ) => {
    setAnswers(
      answers.map((ans) =>
        ans.questionIndex === questionIndex ? { ...ans, answer } : ans
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedChallenge) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/daily-challenges/submit", {
        challenge_id: selectedChallenge.id,
        answers,
      });

      setSubmitSuccess(true);
      await fetchChallenges(); // Refresh challenges to update status
      setSelectedChallenge(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit challenge");
    } finally {
      setLoading(false);
    }
  };

  // Add formatDate function
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

  const renderSubmittedAnswers = (challenge: DailyChallenge) => {
    return (
      <Box sx={{ mt: 2, pl: 2 }}>
        {challenge.questions.map((question, qIndex) => (
          <Box key={qIndex} sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Q{qIndex + 1}: {question.question}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                pl: 2,
                borderLeft: "3px solid",
                borderColor:
                  question.type === "MCQ" &&
                  question.correctAnswer !== undefined
                    ? challenge.submittedAnswers?.find(
                        (a) => a.questionIndex === qIndex
                      )?.answer === question.correctAnswer
                      ? "success.main"
                      : "error.main"
                    : "grey.400",
                py: 0.5,
              }}
            >
              Your Answer:{" "}
              {question.type === "MCQ" && question.options
                ? question.options[
                    challenge.submittedAnswers?.find(
                      (a) => a.questionIndex === qIndex
                    )?.answer as number
                  ]
                : challenge.submittedAnswers?.find(
                    (a) => a.questionIndex === qIndex
                  )?.answer}
              {question.type === "MCQ" &&
                question.correctAnswer !== undefined && (
                  <Typography
                    component="span"
                    sx={{
                      ml: 1,
                      color:
                        challenge.submittedAnswers?.find(
                          (a) => a.questionIndex === qIndex
                        )?.answer === question.correctAnswer
                          ? "success.main"
                          : "error.main",
                    }}
                  >
                    (
                    {challenge.submittedAnswers?.find(
                      (a) => a.questionIndex === qIndex
                    )?.answer === question.correctAnswer
                      ? "✓ Correct"
                      : "✗ Incorrect"}
                    )
                  </Typography>
                )}
            </Typography>
            {question.type === "MCQ" &&
              question.correctAnswer !== undefined && (
                <Typography
                  variant="body2"
                  sx={{ pl: 2, mt: 0.5, color: "success.main" }}
                >
                  Correct Answer: {question.options?.[question.correctAnswer]}
                </Typography>
              )}
          </Box>
        ))}
      </Box>
    );
  };

  const checkTimeLimit = (challengeDate: string) => {
    const challengeTime = new Date(challengeDate).getTime();
    const now = new Date().getTime();
    const hoursDifference = (now - challengeTime) / (1000 * 60 * 60);
    return hoursDifference <= 12;
  };

  const getTimeRemaining = (challengeDate: string) => {
    const challengeTime = new Date(challengeDate).getTime();
    const now = new Date().getTime();
    const difference = challengeTime + 12 * 60 * 60 * 1000 - now;

    if (difference <= 0) return null;

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box className="admin-dashboard">
      <StudentNavbar />
      <Box className="dashboard-container" sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Daily Challenges
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {submitSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSubmitSuccess(false)}
          >
            Challenge submitted successfully!
          </Alert>
        )}

        {selectedChallenge ? (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {selectedChallenge.title}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              Subject: {selectedChallenge.subject}
            </Typography>

            {selectedChallenge.attempted && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" color="primary">
                  Score:{" "}
                  {selectedChallenge.score !== null
                    ? `${selectedChallenge.score}%`
                    : "Pending"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Submitted on:{" "}
                  {new Date(selectedChallenge.submittedAt).toLocaleString()}
                </Typography>
              </Box>
            )}

            {!checkTimeLimit(selectedChallenge.date) &&
              !selectedChallenge.attempted && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  The submission period for this challenge has expired. You can
                  view the questions but cannot submit answers.
                </Alert>
              )}

            {selectedChallenge.questions.map((question, index) => (
              <Box
                key={index}
                sx={{
                  mt: 3,
                  pb: 3,
                  borderBottom:
                    index < selectedChallenge.questions.length - 1
                      ? "1px solid #e0e0e0"
                      : "none",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Question {index + 1}
                </Typography>
                <Typography paragraph>{question.question}</Typography>
                {renderAnswer(question, index)}
              </Box>
            ))}

            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setSelectedChallenge(null)}
              >
                Back
              </Button>
              {!selectedChallenge.attempted && (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !answers.every((a) => a.answer !== "") ||
                    !checkTimeLimit(selectedChallenge.date)
                  }
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Submit Challenge"
                  )}
                </Button>
              )}
            </Box>
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
                          cursor:
                            challenge.attempted ||
                            !checkTimeLimit(challenge.date)
                              ? "default"
                              : "pointer",
                          borderLeft: "5px solid",
                          borderLeftColor: challenge.attempted
                            ? challenge.score === 100
                              ? "success.main"
                              : "warning.main"
                            : !checkTimeLimit(challenge.date)
                            ? "error.main"
                            : "primary.main",
                          "&:hover": {
                            bgcolor:
                              challenge.attempted ||
                              !checkTimeLimit(challenge.date)
                                ? "transparent"
                                : "action.hover",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box
                            sx={{ flex: 1 }}
                            onClick={() =>
                              !challenge.attempted &&
                              checkTimeLimit(challenge.date) &&
                              handleChallengeSelect(challenge)
                            }
                          >
                            <Typography variant="h6">
                              {challenge.title}
                            </Typography>
                            <Typography color="textSecondary" gutterBottom>
                              Subject: {challenge.subject}
                            </Typography>
                            <Typography>
                              Questions: {challenge.questions.length}
                            </Typography>
                            {challenge.attempted && (
                              <Box sx={{ mt: 1 }}>
                                <Typography
                                  sx={{
                                    color:
                                      challenge.score === 100
                                        ? "success.main"
                                        : "warning.main",
                                    fontWeight: "medium",
                                  }}
                                >
                                  Completed - Score: {challenge.score}%{" "}
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                  >
                                    (
                                    {new Date(
                                      challenge.submittedAt
                                    ).toLocaleTimeString()}
                                    )
                                  </Typography>
                                </Typography>
                              </Box>
                            )}
                            {!challenge.attempted && (
                              <Box sx={{ mt: 1 }}>
                                {checkTimeLimit(challenge.date) ? (
                                  <Typography
                                    sx={{
                                      color: "primary.main",
                                      fontWeight: "medium",
                                    }}
                                  >
                                    Time Remaining:{" "}
                                    {getTimeRemaining(challenge.date)}
                                  </Typography>
                                ) : (
                                  <Typography
                                    sx={{
                                      color: "error.main",
                                      fontWeight: "medium",
                                    }}
                                  >
                                    Submission time expired
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                          {challenge.attempted && (
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
                        {challenge.attempted && (
                          <Collapse in={expandedCards[challenge.id]}>
                            {renderSubmittedAnswers(challenge)}
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
                  No challenges available
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StudentDailyChallenge;

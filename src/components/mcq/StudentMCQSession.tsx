import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  LinearProgress,
} from "@mui/material";
import {
  startMCQSession,
  submitAnswer,
  endSession,
  getChapters,
  loadNextBatch,
} from "../../services/mcqService";
import { MCQSession, MCQSessionQuestion } from "../../types/mcq";
import api from "../../services/api";

interface StudentMCQSessionProps {
  onSessionComplete?: (session: MCQSession) => void;
}

export const StudentMCQSession = ({
  onSessionComplete,
}: StudentMCQSessionProps) => {
  const [sessionData, setSessionData] = useState<MCQSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [batchCompleted, setBatchCompleted] = useState(false);
  const [formData, setFormData] = useState({
    class_id: "",
    subject: "",
    chapter: "",
  });
  const [timer, setTimer] = useState<number>(0);
  const [studentSubjects, setStudentSubjects] = useState<string[]>([]);
  const [initLoading, setInitLoading] = useState(true);
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);
  const [progress, setProgress] = useState<{
    totalQuestions: number;
    completedQuestions: number;
  } | null>(null);

  // Fetch student's class and subjects
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data.student) {
          const studentClass = response.data.student.class_id;
          setFormData((prev) => ({ ...prev, class_id: studentClass }));

          const subjects = response.data.student.subjects
            ? response.data.student.subjects
                .split(",")
                .map((s: string) => s.trim())
            : [];
          setStudentSubjects(subjects);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch student data");
      } finally {
        setInitLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStarted && !sessionEnded) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStarted, sessionEnded]);

  useEffect(() => {
    const fetchChapters = async () => {
      if (formData.class_id && formData.subject) {
        try {
          const chapters = await getChapters(
            formData.class_id,
            formData.subject
          );
          setAvailableChapters(chapters);
          // Clear selected chapter when subject changes
          setFormData((prev) => ({ ...prev, chapter: "" }));
        } catch (err: any) {
          setError(err.response?.data?.error || "Failed to fetch chapters");
        }
      }
    };

    fetchChapters();
  }, [formData.class_id, formData.subject]);

  const fetchProgress = async (
    classId: string,
    subject: string,
    chapter: string
  ) => {
    try {
      // First get total questions
      const questionsResponse = await api.get("/mcq/questions", {
        params: { class_id: classId, subject, chapter },
      });
      const totalQuestions = questionsResponse.data.length;

      // Then get student progress
      const progressResponse = await api.get("/mcq/student-progress", {
        params: { class_id: classId, subject, chapter },
      });

      const completedIndex = progressResponse.data?.last_question_index || 0;

      setProgress({
        totalQuestions,
        completedQuestions: completedIndex,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch progress");
    }
  };

  useEffect(() => {
    if (formData.class_id && formData.subject && formData.chapter) {
      fetchProgress(formData.class_id, formData.subject, formData.chapter);
    }
  }, [formData.class_id, formData.subject, formData.chapter]);

  const handleStartSession = async (isNewBatch: boolean = false) => {
    setLoading(true);
    try {
      const session = await startMCQSession(
        formData.class_id,
        formData.subject,
        formData.chapter
      );
      setSessionData(session);
      setSessionStarted(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setBatchCompleted(false);
      if (!isNewBatch) {
        setTimer(0);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadNextBatch = async () => {
    if (!sessionData) return;

    setLoading(true);
    try {
      const nextBatchData = await loadNextBatch(sessionData.id);

      // Update session data with new questions
      setSessionData((prev) => ({
        ...prev!,
        questions: [...prev!.questions, ...nextBatchData.questions],
        currentBatchSize: nextBatchData.currentBatchSize,
        remainingQuestions: nextBatchData.remainingQuestions,
        last_question_index: nextBatchData.last_question_index,
      }));
      setCurrentQuestionIndex(sessionData.questions.length); // Start from the first new question
      setBatchCompleted(false);
      setSelectedAnswer(null);
    } catch (err: any) {
      setError(err.message || "Failed to load next batch");
    } finally {
      setLoading(false);
    }
  };

  const renderSessionSetup = () => (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Start MCQ Session
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Subject</InputLabel>
        <Select
          value={formData.subject}
          label="Subject"
          onChange={(e: SelectChangeEvent) =>
            setFormData((prev) => ({ ...prev, subject: e.target.value }))
          }
        >
          {studentSubjects.map((subject) => (
            <MenuItem key={subject} value={subject}>
              {subject}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Chapter</InputLabel>
        <Select
          value={formData.chapter}
          label="Chapter"
          onChange={(e: SelectChangeEvent) =>
            setFormData((prev) => ({ ...prev, chapter: e.target.value }))
          }
          disabled={!formData.subject}
        >
          {availableChapters.map((chapter) => (
            <MenuItem key={chapter} value={chapter}>
              {chapter}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {progress && (
        <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Your Progress
          </Typography>
          <Typography variant="body2" color="textSecondary">
            You have completed {progress.completedQuestions} out of{" "}
            {progress.totalQuestions} questions
            {progress.completedQuestions >= progress.totalQuestions &&
              " (Starting over from beginning)"}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={
              (progress.completedQuestions / progress.totalQuestions) * 100
            }
            sx={{ mt: 1 }}
          />
        </Paper>
      )}

      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={() => handleStartSession()}
        disabled={
          loading ||
          !formData.class_id ||
          !formData.subject ||
          !formData.chapter
        }
        sx={{ mt: 2 }}
      >
        {loading ? "Starting..." : "Start Session"}
      </Button>
    </Box>
  );

  const renderQuestion = (question: MCQSessionQuestion) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      console.error('[MCQ] Image load failed:', e.currentTarget.src);
      setError('Failed to load question image. You can still continue with the question.');
      // Hide the image container if image fails to load
      const container = e.currentTarget.parentElement;
      if (container) {
        container.style.display = 'none';
      }
    };

    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h6">
              Question {currentQuestionIndex + 1} of {sessionData?.questions.length || 10}
            </Typography>
            {progress && (
              <Typography variant="body2" color="textSecondary">
                Overall Progress: Question {Math.min(progress.completedQuestions + currentQuestionIndex + 1, progress.totalQuestions)} of {progress.totalQuestions}
              </Typography>
            )}
          </Box>
          <Typography>
            Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </Typography>
        </Box>

        <Typography variant="body1" gutterBottom>
          {question.question.question_text}
        </Typography>

        {question.question.image_url && (
          <Box 
            sx={{ 
              my: 2, 
              maxWidth: "100%", 
              textAlign: "center",
              position: 'relative',
              '& img': {
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "contain",
                borderRadius: 1,
                boxShadow: 1
              }
            }}
          >
            <img
              src={question.question.image_url}
              alt="Question"
              onError={handleImageError}
              loading="eager"
              crossOrigin="anonymous"
            />
          </Box>
        )}

        <RadioGroup
          value={selectedAnswer === null ? "" : selectedAnswer}
          onChange={(e) => setSelectedAnswer(Number(e.target.value))}
        >
          {(typeof question.question.options === "string"
            ? JSON.parse(question.question.options)
            : question.question.options
          ).map((option: string, index: number) => (
            <FormControlLabel
              key={index}
              value={index}
              control={<Radio />}
              label={option}
            />
          ))}
        </RadioGroup>

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => handleSubmitAnswer(question)}
            disabled={loading || selectedAnswer === null}
          >
            Submit Answer
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleSkipQuestion(question)}
            disabled={loading}
          >
            Skip Question
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleEndSession}
            disabled={loading}
          >
            End Session
          </Button>
        </Box>
      </Paper>
    );
  };

  const handleSubmitAnswer = async (question: MCQSessionQuestion) => {
    if (!sessionData || selectedAnswer === null) return;

    setLoading(true);
    try {
      await submitAnswer(sessionData.id, question.question.id, selectedAnswer);

      if (currentQuestionIndex < sessionData.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        // Current batch completed
        await handleEndBatch();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipQuestion = async (question: MCQSessionQuestion) => {
    if (!sessionData) return;

    setLoading(true);
    try {
      await submitAnswer(sessionData.id, question.question.id, null);

      if (currentQuestionIndex < sessionData.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        // Current batch completed
        await handleEndBatch();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to skip question");
    } finally {
      setLoading(false);
    }
  };

  const handleEndBatch = async () => {
    if (!sessionData) return;

    setLoading(true);
    try {
      const results = await endSession(sessionData.id);
      setBatchCompleted(true);
      setSessionData(results);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to end batch");
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionData) return;

    setLoading(true);
    try {
      const results = await endSession(sessionData.id);
      setSessionEnded(true);
      setSessionData(results);
      if (onSessionComplete) {
        onSessionComplete(results);
      }

      // Refresh progress after session ends
      if (formData.class_id && formData.subject && formData.chapter) {
        await fetchProgress(
          formData.class_id,
          formData.subject,
          formData.chapter
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to end session");
    } finally {
      setLoading(false);
    }
  };

  const renderBatchResults = () => {
    if (!sessionData) return null;

    const totalAttempted =
      sessionData.correct_count +
      sessionData.incorrect_count +
      sessionData.skipped_count;
    const accuracy =
      totalAttempted > 0
        ? (sessionData.correct_count / totalAttempted) * 100
        : 0;

    return (
      <Paper sx={{ p: 3, mt: 2, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Batch Results
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Batch Duration: {Math.floor(sessionData.duration / 60)}:
            {(sessionData.duration % 60).toString().padStart(2, "0")}
          </Typography>
          {progress && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Chapter Progress: {progress.completedQuestions} of{" "}
              {progress.totalQuestions} questions
              {progress.completedQuestions >= progress.totalQuestions &&
                " (Full chapter completed, starting over)"}
            </Typography>
          )}
          {sessionData.remainingQuestions !== undefined && (
            <Typography
              variant="body2"
              color={
                sessionData.remainingQuestions > 0
                  ? "primary.main"
                  : "success.main"
              }
            >
              {sessionData.remainingQuestions > 0
                ? `${sessionData.remainingQuestions} questions remaining in this chapter`
                : "You have completed all questions in this chapter!"}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography variant="h6" color="success.main">
              Correct: {sessionData.correct_count}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="error.main">
              Incorrect: {sessionData.incorrect_count}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="text.secondary">
              Skipped: {sessionData.skipped_count}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Batch Accuracy
          </Typography>
          <LinearProgress
            variant="determinate"
            value={accuracy}
            color={
              accuracy >= 70 ? "success" : accuracy >= 40 ? "warning" : "error"
            }
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {accuracy.toFixed(1)}%
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleLoadNextBatch}
            disabled={loading}
          >
            {loading ? "Loading..." : "Continue with Next Batch"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="warning"
            onClick={handleEndSession}
            disabled={loading}
          >
            End Session
          </Button>
        </Box>
      </Paper>
    );
  };

  const renderSessionResults = () => {
    if (!sessionData) return null;

    const totalAttempted =
      sessionData.correct_count +
      sessionData.incorrect_count +
      sessionData.skipped_count;
    const accuracy =
      totalAttempted > 0
        ? (sessionData.correct_count / totalAttempted) * 100
        : 0;

    return (
      <Paper sx={{ p: 3, mt: 2, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Session Results
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Duration: {Math.floor(sessionData.duration / 60)}:
            {(sessionData.duration % 60).toString().padStart(2, "0")}
          </Typography>
          {progress && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Chapter Progress: {progress.completedQuestions} of{" "}
              {progress.totalQuestions} questions completed
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography variant="h6" color="success.main">
              Correct: {sessionData.correct_count}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="error.main">
              Incorrect: {sessionData.incorrect_count}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="text.secondary">
              Skipped: {sessionData.skipped_count}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Accuracy
          </Typography>
          <LinearProgress
            variant="determinate"
            value={accuracy}
            color={
              accuracy >= 70 ? "success" : accuracy >= 40 ? "warning" : "error"
            }
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {accuracy.toFixed(1)}%
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            setSessionData(null);
            setSessionStarted(false);
            setSessionEnded(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setTimer(0);
          }}
        >
          Start New Session
        </Button>
      </Paper>
    );
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {initLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : sessionEnded ? (
        renderSessionResults()
      ) : batchCompleted ? (
        renderBatchResults()
      ) : !sessionStarted ? (
        renderSessionSetup()
      ) : (
        sessionData &&
        renderQuestion(sessionData.questions[currentQuestionIndex])
      )}
    </Box>
  );
};

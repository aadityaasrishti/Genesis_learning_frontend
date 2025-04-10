import { Container, Typography, Box, Paper, Button, Grid } from "@mui/material";
import { StudentMCQSession } from "../mcq/StudentMCQSession";
import { useState, useEffect } from "react";
import { MCQSession } from "../../types/mcq";
import { getStudentSessions } from "../../services/mcqService";

export const StudentMCQPage = () => {
  const [selectedSession, setSelectedSession] = useState<MCQSession | null>(
    null
  );
  const [pastSessions, setPastSessions] = useState<MCQSession[]>([]);

  useEffect(() => {
    const fetchPastSessions = async () => {
      try {
        const sessions = await getStudentSessions();
        setPastSessions(
          sessions.filter((session: MCQSession) => session.end_time)
        ); // Only show completed sessions
      } catch (error) {
        console.error("Failed to fetch past sessions:", error);
      }
    };
    fetchPastSessions();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 4 }}>
        MCQ Session
      </Typography>

      {selectedSession ? (
        <>
          <Button
            variant="outlined"
            onClick={() => setSelectedSession(null)}
            sx={{ mb: 2 }}
          >
            Back to Current Session
          </Button>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Session Summary
            </Typography>
            <Typography>Subject: {selectedSession.subject}</Typography>
            <Typography>Chapter: {selectedSession.chapter}</Typography>
            <Typography>
              Correct Answers: {selectedSession.correct_count}
            </Typography>
            <Typography>
              Incorrect Answers: {selectedSession.incorrect_count}
            </Typography>
            <Typography>
              Skipped Questions:{" "}
              {
                selectedSession.questions.filter(
                  (q) => q.selected_answer === null
                ).length
              }
            </Typography>
            <Typography>
              Duration: {Math.floor(selectedSession.duration / 60)}:
              {(selectedSession.duration % 60).toString().padStart(2, "0")}
            </Typography>
            <Typography>
              Score:{" "}
              {(
                (selectedSession.correct_count /
                  (selectedSession.correct_count +
                    selectedSession.incorrect_count)) *
                100
              ).toFixed(1)}
              %
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Question Details
              </Typography>
              {selectedSession.questions.map((q, index) => (
                <Paper key={index} sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Question {index + 1}: {q.question.question_text}
                  </Typography>
                  <Typography
                    color={
                      q.selected_answer === null
                        ? "text.secondary"
                        : q.is_correct
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {q.selected_answer === null
                      ? "Skipped"
                      : q.is_correct
                      ? "✓ Correct"
                      : "✗ Incorrect"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Your Answer:{" "}
                    {q.selected_answer !== undefined &&
                    q.selected_answer !== null
                      ? q.question.options[q.selected_answer]
                      : "Skipped"}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Correct Answer:{" "}
                    {q.question.correct_answer !== undefined
                      ? q.question.options[q.question.correct_answer]
                      : "Not available"}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </>
      ) : (
        <>
          <StudentMCQSession onSessionComplete={setSelectedSession} />

          {pastSessions.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Past Sessions
              </Typography>
              <Grid container spacing={2}>
                {pastSessions.map((session) => (
                  <Grid item xs={12} sm={6} md={4} key={session.id}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                      onClick={() => setSelectedSession(session)}
                    >
                      <Typography variant="h6" color="primary" gutterBottom>
                        {session.subject}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Chapter: {session.chapter}
                      </Typography>
                      <Typography>
                        Score:{" "}
                        {(
                          (session.correct_count /
                            (session.correct_count + session.incorrect_count)) *
                          100
                        ).toFixed(1)}
                        %
                      </Typography>
                      <Typography>
                        Correct: {session.correct_count} | Incorrect:{" "}
                        {session.incorrect_count} | Skipped:{" "}
                        {
                          session.questions.filter(
                            (q) => q.selected_answer === null
                          ).length
                        }
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(session.start_time).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

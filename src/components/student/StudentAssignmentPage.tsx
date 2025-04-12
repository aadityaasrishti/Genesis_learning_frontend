import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Assignment } from "../../types/assignments";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  TextField,
  Alert,
  Paper,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  GetApp as DownloadIcon,
} from "@mui/icons-material";

const StudentAssignmentPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textResponse, setTextResponse] = useState("");
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get("/assignments");
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (assignmentId: number) => {
    try {
      setSubmittingId(assignmentId);
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      if (textResponse) {
        formData.append("text_response", textResponse);
      }

      const response = await api.post(
        `/assignments/${assignmentId}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.isLate) {
        alert("Assignment submitted successfully (Late Submission)");
      } else {
        alert("Assignment submitted successfully");
      }

      setSelectedFile(null);
      setTextResponse("");
      fetchAssignments();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Error submitting assignment. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDownload = async (fileUrl: string | undefined) => {
    if (!fileUrl) {
      alert("No file available to download");
      return;
    }

    try {
      // If it's already a Supabase URL, use it directly
      if (fileUrl.includes("supabase")) {
        window.open(fileUrl, "_blank");
        return;
      }

      // For legacy URLs, try to get the file through the API
      const response = await api.get(fileUrl, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileUrl.split("/").pop() || "download");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file. Please try again.");
    }
  };

  const isSubmitted = (assignment: Assignment) => {
    return assignment.submissions && assignment.submissions.length > 0;
  };

  const isPastDue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const isPastLateSubmissionPeriod = (dueDate: string) => {
    const latePeriod = new Date(dueDate);
    latePeriod.setDate(latePeriod.getDate() + 5);
    return new Date() > latePeriod;
  };

  const getLateSubmissionDeadline = (dueDate: string) => {
    const latePeriod = new Date(dueDate);
    latePeriod.setDate(latePeriod.getDate() + 5);
    return latePeriod;
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    if (!isSubmitted(assignment)) {
      if (isPastLateSubmissionPeriod(assignment.due_date)) return "closed";
      return isPastDue(assignment.due_date) ? "overdue" : "pending";
    }
    const submission = assignment.submissions![0];
    const submittedDate = new Date(submission.submitted_at);
    const dueDate = new Date(assignment.due_date);
    return submittedDate > dueDate ? "late" : "on-time";
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Assignments
        </Typography>

        <Grid container spacing={3}>
          {assignments.map((assignment) => (
            <Grid item xs={12} key={assignment.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {assignment.title}
                  </Typography>
                  <Typography color="textSecondary" paragraph>
                    {assignment.description}
                  </Typography>
                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                  >
                    <Chip label={`Subject: ${assignment.subject}`} />
                    <Chip
                      label={`Due: ${new Date(
                        assignment.due_date
                      ).toLocaleDateString()}`}
                      color="primary"
                    />
                    <Chip
                      label={getSubmissionStatus(assignment)}
                      color={
                        getSubmissionStatus(assignment) === "on-time"
                          ? "success"
                          : getSubmissionStatus(assignment) === "late"
                          ? "warning"
                          : getSubmissionStatus(assignment) === "closed"
                          ? "default"
                          : "primary"
                      }
                      variant="outlined"
                    />
                  </Box>

                  {assignment.file_url && (
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(assignment.file_url)}
                      sx={{ mb: 2 }}
                    >
                      Download Assignment PDF
                    </Button>
                  )}

                  {!isSubmitted(assignment) &&
                    !isPastLateSubmissionPeriod(assignment.due_date) && (
                      <Paper
                        sx={{ p: 2, mt: 2, bgcolor: "background.default" }}
                      >
                        {isPastDue(assignment.due_date) && (
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            This assignment is past due. Your submission will be
                            marked as late.
                            <br />
                            Late submission deadline:{" "}
                            {getLateSubmissionDeadline(
                              assignment.due_date
                            ).toLocaleDateString()}
                          </Alert>
                        )}

                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Button
                              variant="contained"
                              component="label"
                              startIcon={<UploadIcon />}
                              fullWidth
                            >
                              Upload Solution (PDF)
                              <input
                                type="file"
                                accept=".pdf"
                                hidden
                                onChange={handleFileChange}
                              />
                            </Button>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              variant="outlined"
                              label="Text Response (Optional)"
                              placeholder="If you have doubts enter the question numbers here...."
                              value={textResponse}
                              onChange={(e) => setTextResponse(e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Button
                              variant="contained"
                              color="primary"
                              fullWidth
                              onClick={() => handleSubmit(assignment.id)}
                              disabled={
                                submittingId === assignment.id ||
                                (!selectedFile && !textResponse)
                              }
                            >
                              {submittingId === assignment.id
                                ? "Submitting..."
                                : isPastDue(assignment.due_date)
                                ? "Submit Late Assignment"
                                : "Submit Assignment"}
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    )}

                  {!isSubmitted(assignment) &&
                    isPastLateSubmissionPeriod(assignment.due_date) && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        Submission period has ended. This assignment can no
                        longer be submitted.
                      </Alert>
                    )}

                  {isSubmitted(assignment) && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={`✓ Submitted (${getSubmissionStatus(
                            assignment
                          )})`}
                          color={
                            getSubmissionStatus(assignment) === "on-time"
                              ? "success"
                              : "warning"
                          }
                        />
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mt: 1 }}
                        >
                          Submitted on:{" "}
                          {new Date(
                            assignment.submissions![0].submitted_at
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {assignment.submissions![0].grade !== null && (
                        <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                          <Typography variant="h6">
                            Grade: {assignment.submissions![0].grade}/100
                          </Typography>
                          {assignment.submissions![0].teacher_comment && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                Teacher's Feedback:
                              </Typography>
                              <Typography variant="body1">
                                {assignment.submissions![0].teacher_comment}
                              </Typography>
                            </Box>
                          )}
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mt: 1 }}
                          >
                            Graded on:{" "}
                            {new Date(
                              assignment.submissions![0].graded_at!
                            ).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default StudentAssignmentPage;

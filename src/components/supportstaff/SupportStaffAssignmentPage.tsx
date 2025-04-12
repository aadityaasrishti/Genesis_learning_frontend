import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Assignment, AssignmentSubmission } from "../../types/assignments";
import SupportStaffNavbar from "./SupportStaffNavbar";
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudDownload as DownloadIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

const SubmissionModal: React.FC<{
  submission: AssignmentSubmission;
  onClose: () => void;
}> = ({ submission, onClose }) => {
  const handleDownload = async (fileUrl: string) => {
    try {
      // For Supabase URLs, open directly in a new tab
      if (fileUrl.includes("supabase")) {
        window.open(fileUrl, "_blank");
        return;
      }

      // For legacy URLs, use the API
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

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Submission Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                <Typography variant="h6" gutterBottom color="primary">
                  Student Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Name:</strong> {submission.student?.name}
                    </Typography>
                    <Typography variant="subtitle1">
                      <strong>Email:</strong> {submission.student?.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Class:</strong> {submission.assignment?.class_id}
                    </Typography>
                    <Typography variant="subtitle1">
                      <strong>Subject:</strong> {submission.assignment?.subject}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                <Typography variant="h6" gutterBottom color="primary">
                  Submission Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">
                      <strong>Assignment:</strong>{" "}
                      {submission.assignment?.title}
                    </Typography>
                    <Typography variant="subtitle1">
                      <strong>Due Date:</strong>{" "}
                      {new Date(
                        submission.assignment?.due_date
                      ).toLocaleString()}
                    </Typography>
                    <Typography variant="subtitle1">
                      <strong>Submitted:</strong>{" "}
                      {new Date(submission.submitted_at).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Chip
                        label={
                          submission.isLate ? "Late Submission" : "On Time"
                        }
                        color={submission.isLate ? "warning" : "success"}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {submission.grade !== null && (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="h6" gutterBottom color="primary">
                    Grade Information
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                    Grade: {submission.grade}/100
                  </Typography>
                  {submission.teacher_comment && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Teacher's Feedback:</strong>
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}
                      >
                        {submission.teacher_comment}
                      </Typography>
                    </Box>
                  )}
                  {submission.graded_at && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 2 }}
                    >
                      Graded on:{" "}
                      {new Date(submission.graded_at).toLocaleString()}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {submission.text_response && (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="h6" gutterBottom color="primary">
                    Student Response
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}
                  >
                    {submission.text_response}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {submission.file_url && (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="h6" gutterBottom color="primary">
                    Submitted File
                  </Typography>
                  {submission.file_url.toLowerCase().endsWith(".pdf") ? (
                    <Box sx={{ height: "500px", mt: 2 }}>
                      <iframe
                        src={`/api${submission.file_url}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                        }}
                        title="PDF Preview"
                      />
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(submission.file_url!)}
                      sx={{ mt: 1 }}
                    >
                      Download Submission
                    </Button>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const StudentListModal: React.FC<{
  assignment: Assignment;
  onClose: () => void;
  onViewSubmission: (studentId: number) => void;
}> = ({ assignment, onClose, onViewSubmission }) => {
  const [studentList, setStudentList] = useState<
    Array<{
      user_id: number;
      name: string;
      hasSubmitted: boolean;
      submission?: AssignmentSubmission;
    }>
  >([]);

  useEffect(() => {
    const fetchStudentList = async () => {
      try {
        const assignedStudentIds = assignment.assigned_students
          .split(",")
          .map(Number);
        const response = await api.get("/auth/students-by-ids", {
          params: { studentIds: assignedStudentIds.join(",") },
        });

        const studentsWithStatus = response.data.map((student: any) => ({
          user_id: student.user_id,
          name: student.name,
          hasSubmitted:
            assignment.submissions?.some(
              (s) => s.student_id === student.user_id
            ) || false,
          submission: assignment.submissions?.find(
            (s) => s.student_id === student.user_id
          ),
        }));

        setStudentList(studentsWithStatus);
      } catch (error) {
        console.error("Error fetching student list:", error);
      }
    };

    fetchStudentList();
  }, [assignment]);

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Assigned Students
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <List>
          {studentList.map((student) => (
            <React.Fragment key={student.user_id}>
              <ListItem>
                <ListItemText
                  primary={student.name}
                  secondary={
                    <Typography component="div">
                      <Chip
                        label={
                          student.hasSubmitted ? "Submitted" : "Not Submitted"
                        }
                        color={student.hasSubmitted ? "success" : "default"}
                        size="small"
                      />
                    </Typography>
                  }
                />
                {student.hasSubmitted && (
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => onViewSubmission(student.user_id)}
                    >
                      View Submission
                    </Button>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

const SupportStaffAssignmentPage: React.FC = () => {
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [selectedAssignmentForStudents, setSelectedAssignmentForStudents] =
    useState<Assignment | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchAssignments();
    }
  }, [selectedClass, selectedSubject]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/attendance/classes");
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/attendance/subjects", {
        params: { classId: selectedClass },
      });
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/assignments/admin", {
        params: {
          class_id: selectedClass,
          subject: selectedSubject,
        },
      });
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmissionFromList = async (studentId: number) => {
    if (!selectedAssignmentForStudents) return;

    const submission = selectedAssignmentForStudents.submissions?.find(
      (s) => s.student_id === studentId
    );

    if (submission) {
      try {
        const response = await api.get(
          `/assignments/submission/${submission.id}`
        );
        if (!response.data) {
          throw new Error("No data received from server");
        }

        const submissionData = {
          ...response.data,
          student: {
            name: response.data.student?.name || "Unknown Student",
            email: response.data.student?.email || "No email available",
          },
        };

        setSelectedAssignmentForStudents(null);
        setSelectedSubmission(submissionData);
      } catch (error: any) {
        console.error("Error fetching submission details:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "An unexpected error occurred while loading submission details";
        alert(errorMessage);
      }
    }
  };

  const handleDownload = async (fileUrl: string) => {
    try {
      // For Supabase URLs, open directly in a new tab
      if (fileUrl.includes("supabase")) {
        window.open(fileUrl, "_blank");
        return;
      }

      // For legacy URLs, use the API
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

  return (
    <Container maxWidth="xl">
      <SupportStaffNavbar />
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Assignment Overview
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          Select Class and Subject
        </Alert>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSubject("");
                    setAssignments([]);
                  }}
                  label="Class"
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
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setAssignments([]);
                  }}
                  disabled={!selectedClass}
                  label="Subject"
                >
                  <MenuItem value="">
                    <em>Select Subject</em>
                  </MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {assignments.map((assignment) => (
              <Grid item xs={12} key={assignment.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {assignment.title}
                    </Typography>
                    <Typography color="textSecondary" paragraph>
                      {assignment.description}
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                    >
                      <Chip label={`Class: ${assignment.class_id}`} />
                      <Chip label={`Subject: ${assignment.subject}`} />
                      <Chip label={`Teacher: ${assignment.teacher?.name}`} />
                      <Chip
                        label={`Due: ${new Date(
                          assignment.due_date
                        ).toLocaleDateString()}`}
                        color="primary"
                      />
                    </Box>

                    <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Total Students:{" "}
                        {assignment.assigned_students.split(",").length}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        Submissions: {assignment.submissions?.length || 0}
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setSelectedAssignmentForStudents(assignment)
                        }
                        sx={{ mt: 1 }}
                      >
                        View Student List
                      </Button>
                    </Paper>

                    {assignment.file_url && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(assignment.file_url!)}
                        >
                          Download Assignment PDF
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {assignments.length === 0 && selectedClass && selectedSubject && (
              <Grid item xs={12}>
                <Alert severity="info">
                  No assignments found for this class and subject.
                </Alert>
              </Grid>
            )}
          </Grid>
        )}

        {selectedAssignmentForStudents && (
          <StudentListModal
            assignment={selectedAssignmentForStudents}
            onClose={() => setSelectedAssignmentForStudents(null)}
            onViewSubmission={handleViewSubmissionFromList}
          />
        )}

        {selectedSubmission && (
          <SubmissionModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
          />
        )}
      </Box>
    </Container>
  );
};

export default SupportStaffAssignmentPage;

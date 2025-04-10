import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  styled,
  Tabs,
  Tab,
} from "@mui/material";
import AccessibleDialog from "../Common/AccessibleDialog";
import api from "../../services/api";
import StudentSelector from "./StudentSelector";
import { Test, TestSubmission } from "../../types/test";

interface GradeSubmissionInput {
  grade: number;
  feedback?: string;
}

const TestForm = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  maxWidth: 600,
  margin: "0 auto",
}));

const ActionBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  justifyContent: "flex-end",
  alignItems: "center",
  marginTop: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    width: "100%",
    "& .MuiButton-root": {
      width: "100%",
    },
  },
}));

const GradeForm = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  minWidth: 400,
  [theme.breakpoints.down("sm")]: {
    minWidth: "unset",
    width: "100%",
  },
}));

const TeacherTestManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<TestSubmission | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [testType, setTestType] = useState<"TEXT" | "PDF">("TEXT");
  const [content, setContent] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  const [grading, setGrading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSubmissionDialogOpen, setDeleteSubmissionDialogOpen] =
    useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);
  const [hasBeenPreviewed, setHasBeenPreviewed] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchTeacherData();
    fetchTests();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const response = await api.get("/auth/teacher-data");
      setClasses(response.data.classes);
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      fetchSubmissions();
    }
  }, [selectedTest]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await api.tests.getTeacherTests();
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      setTests(response.data);
    } catch (error: any) {
      console.error(
        "Error fetching tests:",
        error.response?.data?.error || error.message || "Failed to load tests"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedTest) return;
    setLoadingSubmissions(true);
    try {
      const response = await api.tests.getSubmissions(selectedTest);
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      setSubmissions(response.data);
    } catch (error: any) {
      console.error(
        "Error fetching submissions:",
        error.response?.data?.error ||
          error.message ||
          "Failed to load submissions"
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleViewSubmission = async (submission: TestSubmission) => {
    setSelectedSubmission(submission);
    try {
      const response = await api.tests.getSubmissionContent(submission.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSubmissionUrl(url);
      setShowSubmissionDialog(true);
    } catch (error) {
      console.error('Error fetching submission:', error);
      // Handle error appropriately
      alert('Failed to load submission. Please try again.');
    }
  };

  const handleCreateTest = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!hasBeenPreviewed) {
        throw new Error("Please preview the test before creating");
      }

      // Validation checks
      if (!title?.trim()) throw new Error("Title is required");
      if (!description?.trim()) throw new Error("Description is required");
      if (!duration || isNaN(parseInt(duration)))
        throw new Error("Valid duration is required");
      if (!startTime) throw new Error("Start time is required");
      if (!selectedClass) throw new Error("Class selection is required");
      if (!selectedSubject) throw new Error("Subject selection is required");
      if (testType === "PDF" && !pdfFile) {
        setShowGradeDialog(true);
        return;
      }
      if (testType === "TEXT" && !content?.trim()) {
        setShowGradeDialog(true);
        return;
      }

      // Create FormData instance
      const formData = new FormData();

      // Append all fields to FormData
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("duration", duration.toString());
      formData.append("startTime", startTime);
      formData.append("type", testType);
      formData.append("class", selectedClass);
      formData.append("subject", selectedSubject);

      // Handle content based on type
      if (testType === "TEXT") {
        formData.append("content", content.trim());
      } else if (testType === "PDF" && pdfFile) {
        formData.append("pdf", pdfFile, pdfFile.name);
      }

      // Add assigned students if any
      if (assignedStudents.length > 0) {
        formData.append("assignedStudents", assignedStudents.join(","));
      }

      // Log the FormData contents for debugging
      console.log("Creating test with data:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? value.name : value);
      }

      await api.tests.create(formData);

      // Reset form on success
      setTitle("");
      setDescription("");
      setDuration("");
      setContent("");
      setPdfFile(null);
      setSelectedClass("");
      setSelectedSubject("");
      setAssignedStudents([]);
      setStartTime("");
      setHasBeenPreviewed(false);

      // Show success message
      alert("Test created successfully!");

      // Refresh test list
      await fetchTests();
    } catch (error: any) {
      console.error("Error creating test:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async () => {
    if (!selectedSubmission) return;

    setGrading(true);

    try {
      const gradeValue = parseFloat(grade);
      if (!grade || isNaN(gradeValue)) {
        throw new Error("Please enter a valid grade");
      }

      const gradeData: GradeSubmissionInput = {
        grade: gradeValue,
        feedback: feedback?.trim() || undefined,
      };

      await api.tests.gradeSubmission(selectedSubmission.id, gradeData);

      await fetchSubmissions();
      setShowGradeDialog(false);
      setGrade("");
      setFeedback("");
    } catch (error: any) {
      console.error("Error grading submission:", error);
    } finally {
      setGrading(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!itemToDelete) return;
    setDeleting(true);

    try {
      await api.tests.deleteTest(itemToDelete);
      await fetchTests();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting test:", error);
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!itemToDelete) return;
    setDeleting(true);

    try {
      await api.tests.deleteSubmission(itemToDelete);
      await fetchSubmissions();
      setDeleteSubmissionDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting submission:", error);
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    switch (name) {
      case "title":
        setTitle(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "duration":
        setDuration(value);
        break;
      case "content":
        setContent(value);
        break;
      case "startTime":
        setStartTime(value);
        break;
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleStudentsSelect = (selectedIds: string[]) => {
    setAssignedStudents(selectedIds);
  };

  const handlePreview = () => {
    setHasBeenPreviewed(true);
    setShowSubmissionDialog(true);
  };

  // Reset preview status when form fields change
  useEffect(() => {
    setHasBeenPreviewed(false);
  }, [
    title,
    description,
    duration,
    content,
    testType,
    pdfFile,
    selectedClass,
    selectedSubject,
    assignedStudents,
    startTime,
  ]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Test Management
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Create Test" />
        <Tab label="View & Grade Submissions" />
      </Tabs>

      {activeTab === 0 ? (
        <Box>
          <Typography variant="h4" gutterBottom>
            Create Test
          </Typography>
          <TestForm component="form" onSubmit={handleCreateTest}>
            <TextField
              label="Title"
              name="title"
              value={title}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Description"
              name="description"
              value={description}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Start Time"
              name="startTime"
              type="datetime-local"
              value={startTime}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16),
              }}
            />
            <TextField
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={duration}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass}
                label="Class"
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject("");
                  setAssignedStudents([]);
                }}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setAssignedStudents([]);
                }}
                disabled={!selectedClass}
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Test Type</InputLabel>
              <Select
                value={testType}
                label="Test Type"
                onChange={(e) => setTestType(e.target.value as "TEXT" | "PDF")}
              >
                <MenuItem value="TEXT">Text</MenuItem>
                <MenuItem value="PDF">PDF</MenuItem>
              </Select>
            </FormControl>
            {testType === "PDF" ? (
              <>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  style={{ display: "none" }}
                  id="test-file-input"
                />
                <label htmlFor="test-file-input">
                  <Button
                    variant="contained"
                    component="span"
                    color="primary"
                    sx={{ mt: 2, mb: 2 }}
                  >
                    Upload Test PDF
                  </Button>
                </label>
              </>
            ) : (
              <TextField
                label="Test Content"
                name="content"
                value={content}
                onChange={handleInputChange}
                multiline
                rows={6}
                fullWidth
                required={testType === "TEXT"}
                margin="normal"
              />
            )}
            {selectedClass && selectedSubject && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Assign Students
                </Typography>
                <StudentSelector
                  classId={selectedClass}
                  subject={selectedSubject}
                  onStudentsSelect={handleStudentsSelect}
                />
              </Box>
            )}
            <ActionBox>
              <Button
                variant="outlined"
                color="primary"
                onClick={handlePreview}
                disabled={loading}
              >
                Preview Test
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={!hasBeenPreviewed}
              >
                {hasBeenPreviewed
                  ? "Create Test"
                  : "Preview Required Before Creation"}
              </Button>
            </ActionBox>
            {!hasBeenPreviewed && (
              <Typography color="warning.main" sx={{ mt: 1 }}>
                Please preview the test before submitting
              </Typography>
            )}
          </TestForm>
        </Box>
      ) : (
        <Box>
          <Typography variant="h4" gutterBottom>
            View & Grade Submissions
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Test</InputLabel>
            <Select
              value={selectedTest?.toString() ?? ""}
              label="Test"
              onChange={(e) =>
                setSelectedTest(e.target.value ? Number(e.target.value) : null)
              }
              disabled={loading}
            >
              {tests.map((test) => (
                <MenuItem key={test.id} value={test.id.toString()}>
                  {test.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : selectedTest ? (
            loadingSubmissions ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <ListItem
                      key={submission.id}
                      sx={{
                        mb: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        cursor: "pointer",
                      }}
                      onClick={() => handleViewSubmission(submission)}
                    >
                      <ListItemText
                        primary={submission.student_name}
                        secondary={
                          <Typography component="div" variant="body2">
                            <Typography
                              component="span"
                              variant="body2"
                              display="block"
                            >
                              Submitted:{" "}
                              {new Date(submission.submitted_at).toLocaleString()}
                              {submission.is_late && (
                                <Typography
                                  component="span"
                                  color="error"
                                  sx={{ ml: 1 }}
                                >
                                  (Late)
                                </Typography>
                              )}
                            </Typography>
                            {submission.grade !== null && (
                              <Typography component="span" color="primary">
                                Grade: {submission.grade}/100
                              </Typography>
                            )}
                            {submission.feedback && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {submission.feedback}
                              </Typography>
                            )}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No submissions found." />
                  </ListItem>
                )}
              </List>
            )
          ) : (
            <Typography variant="body1" color="text.secondary">
              Please select a test to view submissions.
            </Typography>
          )}
        </Box>
      )}
      <AccessibleDialog
        open={showGradeDialog}
        onClose={() => setShowGradeDialog(false)}
      >
        <DialogTitle>Grade Submission</DialogTitle>
        <DialogContent>
          <GradeForm>
            <TextField
              label="Grade"
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              multiline
              rows={4}
              fullWidth
              margin="normal"
            />
          </GradeForm>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGradeDialog(false)}>Cancel</Button>
          <Button onClick={handleGradeSubmit} disabled={grading}>
            {grading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </DialogActions>
      </AccessibleDialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Test</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this test?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTest} disabled={deleting}>
            {deleting ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteSubmissionDialogOpen}
        onClose={() => setDeleteSubmissionDialogOpen(false)}
      >
        <DialogTitle>Delete Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this submission?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSubmissionDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteSubmission} disabled={deleting}>
            {deleting ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      {selectedSubmission && (
        <Dialog
          open={showSubmissionDialog}
          onClose={() => {
            setShowSubmissionDialog(false);
            setSubmissionUrl(null);
          }}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Submission Details</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Student: {selectedSubmission.student_name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Email: {selectedSubmission.student_email}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <Typography>
                  Submitted: {new Date(selectedSubmission.submitted_at).toLocaleString()}
                </Typography>
                {selectedSubmission.is_late && (
                  <Typography component="span" color="error">
                    (Late Submission)
                  </Typography>
                )}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Status: {selectedSubmission.status === 'graded' ? 'Graded' : 'Pending Review'}
                </Typography>
                {selectedSubmission.grade !== null && (
                  <Typography color="primary">
                    Grade: {selectedSubmission.grade}/100
                  </Typography>
                )}
                {selectedSubmission.feedback && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Feedback:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: "grey.100",
                        p: 2,
                        borderRadius: 1,
                        whiteSpace: "pre-wrap"
                      }}
                    >
                      {selectedSubmission.feedback}
                    </Typography>
                  </Box>
                )}
              </Box>
              {submissionUrl && (
                <Box sx={{ mt: 2, height: "60vh", width: "100%" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Submission Preview:
                  </Typography>
                  <iframe
                    src={submissionUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "4px"
                    }}
                    title="Submission Preview"
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            {selectedSubmission.status === 'pending' && (
              <Button
                onClick={() => {
                  setShowSubmissionDialog(false);
                  setShowGradeDialog(true);
                }}
                color="primary"
                variant="contained"
              >
                Grade Submission
              </Button>
            )}
            <Button onClick={() => setShowSubmissionDialog(false)} color="inherit">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default TeacherTestManagement;

import React, { useState, useEffect } from "react";
import { Assignment, AssignmentSubmission } from "../../types/assignments";
import api from "../../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";
import { styled } from "@mui/material/styles";

// Styled components
const StyledStudentSelection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .student-selection-help": {
    marginBottom: theme.spacing(2),
    "& ul": {
      paddingLeft: theme.spacing(2),
      "& li": {
        marginBottom: theme.spacing(1),
      },
    },
  },
}));

const StyledSubmissionsList = styled(Box)(({ theme }) => ({
  "& .submission-item": {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  "& .submission-summary": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  "& .submission-status": {
    marginLeft: theme.spacing(1),
    "&.late": {
      color: theme.palette.warning.main,
    },
    "&.on-time": {
      color: theme.palette.success.main,
    },
  },
  "& .submission-actions": {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
  },
}));

const PreviewBox = styled(Box)(({ theme }) => ({
  "& .preview-detail-item": {
    marginBottom: theme.spacing(2),
    "& .preview-label": {
      fontWeight: "bold",
      marginRight: theme.spacing(1),
    },
  },
  "& .pdf-preview-container": {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  "& .pdf-details": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
}));

interface SubmissionModalProps {
  submission: AssignmentSubmission;
  onClose: () => void;
}

const SubmissionModal = ({ submission, onClose }: SubmissionModalProps) => {
  const [grade, setGrade] = useState<string>(
    submission.grade?.toString() || ""
  );
  const [teacherComment, setTeacherComment] = useState<string>(
    submission.teacher_comment || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitGrade = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.post(
        `/assignments/submission/${submission.id}/grade`,
        {
          grade: parseFloat(grade),
          teacher_comment: teacherComment,
        }
      );

      if (response.data.success) {
        alert("Grade submitted successfully");
        onClose();
      }
    } catch (error) {
      console.error("Error submitting grade:", error);
      alert("Failed to submit grade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Grade Submission
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
                      onClick={() =>
                        window.open(`/api${submission.file_url}`, "_blank")
                      }
                      sx={{ mt: 1 }}
                    >
                      Download Submission
                    </Button>
                  )}
                </Paper>
              </Grid>
            )}

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
                  Grade Submission
                </Typography>
                <TextField
                  type="number"
                  label="Grade (0-100)"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  inputProps={{ min: "0", max: "100" }}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Teacher's Comment"
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  margin="normal"
                />
                <Button
                  onClick={handleSubmitGrade}
                  disabled={isSubmitting || !grade}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Grade"}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const TeacherAssignmentPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: new Date(),
  });
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState<
    number | null
  >(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchTeacherData();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get("/assignments");
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const fetchTeacherData = async () => {
    try {
      const response = await api.get("/auth/teacher-data");
      setClasses(response.data.classes);
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    }
  };

  const fetchStudents = async (classId: string, subject: string) => {
    try {
      setIsLoadingStudents(true);
      const response = await api.get(`/auth/students-by-class`, {
        params: {
          class: classId,
          subject: subject,
        },
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Error fetching students. Please try again.");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleClassChange = (e: SelectChangeEvent<string>) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    setSelectedStudents([]);
    setSelectedSubject(""); // Reset subject when class changes
  };

  const handleSubjectChange = (e: SelectChangeEvent<string>) => {
    const newSubject = e.target.value;
    setSelectedSubject(newSubject);
    setSelectedStudents([]);
    if (selectedClass && newSubject) {
      fetchStudents(selectedClass, newSubject);
    }
  };

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsEditing(true);
    setIsCreating(true);
    setSelectedClass(assignment.class_id);
    setSelectedSubject(assignment.subject);
    setSelectedStudents(assignment.assigned_students.split(","));
    setFormData({
      title: assignment.title,
      description: assignment.description,
      due_date: new Date(assignment.due_date),
    });
    fetchStudents(assignment.class_id, assignment.subject);
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this assignment? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/assignments/${assignmentId}`);
        fetchAssignments();
      } catch (error) {
        console.error("Error deleting assignment:", error);
        alert("Error deleting assignment. Please try again.");
      }
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("class_id", selectedClass);
      formDataToSend.append("subject", selectedSubject);
      formDataToSend.append("due_date", formData.due_date.toISOString());
      formDataToSend.append("student_ids", JSON.stringify(selectedStudents));
      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }

      if (isEditing && editingAssignment) {
        // Update existing assignment
        await api.put(`/assignments/${editingAssignment.id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Create new assignment
        await api.post("/assignments", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setIsCreating(false);
      setIsEditing(false);
      setEditingAssignment(null);
      fetchAssignments();
      setFormData({ title: "", description: "", due_date: new Date() });
      setSelectedStudents([]);
      setSelectedFile(null);
      setSelectedClass("");
      setSelectedSubject("");
    } catch (error) {
      console.error("Error creating/updating assignment:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPdfPreviewUrl(previewUrl);
      } else {
        alert("Please upload a PDF file");
        e.target.value = "";
      }
    }
  };

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  const viewSubmissions = async (assignmentId: number) => {
    try {
      const response = await api.get(
        `/assignments/submissions/${assignmentId}`
      );
      if (response.data?.submissions?.length > 0) {
        const assignmentWithSubmissions = assignments.find(
          (a) => a.id === assignmentId
        );
        if (assignmentWithSubmissions) {
          // Update the assignment's submissions with the fetched data
          assignmentWithSubmissions.submissions = response.data.submissions;
          setAssignments([...assignments]); // Trigger re-render
        }
        setSubmissionsModalOpen(assignmentId);
      } else {
        alert("No submissions yet for this assignment.");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      alert("Error fetching submissions. Please try again.");
    }
  };

  const viewSubmissionDetails = async (submission: AssignmentSubmission) => {
    try {
      const response = await api.get(
        `/assignments/submission/${submission.id}`
      );
      if (!response.data) {
        throw new Error("No data received from server");
      }

      // Add null checks for student data
      const submissionData = {
        ...response.data,
        student: {
          name: response.data.student?.name || "Unknown Student",
          email: response.data.student?.email || "No email available",
        },
      };

      setSelectedSubmission(submissionData);
    } catch (error: any) {
      console.error("Error fetching submission details:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred while loading submission details";
      alert(errorMessage);
      setSelectedSubmission(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" component="h1">
            Assignment Management
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="primary"
            startIcon={isCreating ? <CloseIcon /> : <AddIcon />}
            onClick={() => {
              setIsCreating(!isCreating);
              if (!isCreating) {
                setIsEditing(false);
                setEditingAssignment(null);
                setFormData({
                  title: "",
                  description: "",
                  due_date: new Date(),
                });
                setSelectedStudents([]);
                setSelectedFile(null);
                setSelectedClass("");
                setSelectedSubject("");
              }
            }}
            sx={{
              px: 3,
              py: 1,
              fontWeight: 'bold',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            {isCreating ? "Cancel" : "Create New Assignment"}
          </Button>
        </Box>

        {isCreating && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <form onSubmit={handleCreateAssignment}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Assignment Details
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      fullWidth
                      label="Title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                    <FormControl fullWidth required>
                      <InputLabel>Class</InputLabel>
                      <Select
                        value={selectedClass}
                        onChange={handleClassChange}
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
                    <FormControl fullWidth required>
                      <InputLabel>Subject</InputLabel>
                      <Select
                        value={selectedSubject}
                        onChange={handleSubjectChange}
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

                    {(!selectedClass || !selectedSubject) && (
                      <div className="selection-requirement">
                        Please select both Class and Subject to view students
                      </div>
                    )}

                    {selectedClass && selectedSubject && (
                      <StyledStudentSelection>
                        <Typography variant="subtitle1" gutterBottom>
                          Students:
                        </Typography>
                        <Box className="student-selection-help">
                          <ul>
                            <li>
                              Click individual checkboxes to select/deselect
                              students
                            </li>
                            <li>
                              Hold Shift + Click to select a range of students
                            </li>
                            <li>
                              Use "Select All" button to toggle all students
                            </li>
                          </ul>
                        </Box>
                        {isLoadingStudents ? (
                          <Typography>Loading students...</Typography>
                        ) : students.length > 0 ? (
                          <>
                            <Box sx={{ mb: 2 }}>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  if (
                                    selectedStudents.length === students.length
                                  ) {
                                    setSelectedStudents([]);
                                  } else {
                                    setSelectedStudents(
                                      students.map((s) => s.user_id.toString())
                                    );
                                  }
                                }}
                              >
                                {selectedStudents.length === students.length
                                  ? "Deselect All"
                                  : "Select All"}
                              </Button>
                            </Box>
                            <div className="students-checkbox-list">
                              {students.map((student, index) => (
                                <div
                                  key={student.user_id}
                                  className="student-checkbox-item"
                                >
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={selectedStudents.includes(
                                          student.user_id.toString()
                                        )}
                                        onChange={(e) => {
                                          if (
                                            e.nativeEvent instanceof
                                              MouseEvent &&
                                            e.nativeEvent.shiftKey &&
                                            lastSelectedIndex !== -1
                                          ) {
                                            const start = Math.min(
                                              lastSelectedIndex,
                                              index
                                            );
                                            const end = Math.max(
                                              lastSelectedIndex,
                                              index
                                            );
                                            const rangeIds = students
                                              .slice(start, end + 1)
                                              .map((s) => s.user_id.toString());

                                            if (e.target.checked) {
                                              const newSelected = Array.from(
                                                new Set([
                                                  ...selectedStudents,
                                                  ...rangeIds,
                                                ])
                                              );
                                              setSelectedStudents(newSelected);
                                            } else {
                                              setSelectedStudents(
                                                selectedStudents.filter(
                                                  (id) => !rangeIds.includes(id)
                                                )
                                              );
                                            }
                                          } else {
                                            if (e.target.checked) {
                                              setSelectedStudents([
                                                ...selectedStudents,
                                                student.user_id.toString(),
                                              ]);
                                            } else {
                                              setSelectedStudents(
                                                selectedStudents.filter(
                                                  (id) =>
                                                    id !==
                                                    student.user_id.toString()
                                                )
                                              );
                                            }
                                          }
                                          setLastSelectedIndex(index);
                                        }}
                                      />
                                    }
                                    label={student.name}
                                  />
                                </div>
                              ))}
                            </div>
                            <small className="selected-count">
                              Selected {selectedStudents.length} of{" "}
                              {students.length} students
                            </small>
                          </>
                        ) : (
                          <Typography color="text.secondary">
                            No students found for this class and subject
                          </Typography>
                        )}
                      </StyledStudentSelection>
                    )}

                    <div className="form-group">
                      <label>Due Date:</label>
                      <DatePicker
                        selected={formData.due_date}
                        onChange={(date: Date | null) =>
                          setFormData({
                            ...formData,
                            due_date: date || new Date(),
                          })
                        }
                        showTimeSelect
                        dateFormat="MMMM d, yyyy h:mm aa"
                        minDate={new Date()}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Assignment PDF (Optional):</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                    </div>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Preview
                  </Typography>
                  <PreviewBox>
                    <div className="preview-detail-item">
                      <span className="preview-label">Title:</span>
                      <span className="preview-value">
                        {formData.title || "Not set"}
                      </span>
                    </div>
                    <div className="preview-detail-item">
                      <span className="preview-label">Description:</span>
                      <span className="preview-value">
                        {formData.description || "Not set"}
                      </span>
                    </div>
                    <div className="preview-detail-item">
                      <span className="preview-label">Class:</span>
                      <span className="preview-value">
                        {selectedClass || "Not selected"}
                      </span>
                    </div>
                    <div className="preview-detail-item">
                      <span className="preview-label">Subject:</span>
                      <span className="preview-value">
                        {selectedSubject || "Not selected"}
                      </span>
                    </div>
                    <div className="preview-detail-item">
                      <span className="preview-label">Due Date:</span>
                      <span className="preview-value">
                        {formData.due_date
                          ? formData.due_date.toLocaleString()
                          : "Not set"}
                      </span>
                    </div>
                    <div className="preview-detail-item">
                      <span className="preview-label">Selected Students:</span>
                      <span className="preview-value">
                        {selectedStudents.length > 0
                          ? `${selectedStudents.length} students selected`
                          : "No students selected"}
                      </span>
                    </div>
                  </PreviewBox>

                  {selectedFile && (
                    <div className="preview-content">
                      <h4>PDF Preview</h4>
                      <div className="preview-file">
                        <div className="pdf-preview-container">
                          {pdfPreviewUrl && (
                            <iframe
                              src={pdfPreviewUrl}
                              style={{
                                width: "100%",
                                height: "500px",
                                border: "none",
                              }}
                              title="PDF Preview"
                            />
                          )}
                        </div>
                        <div className="pdf-details">
                          <div className="pdf-filename">
                            {selectedFile.name}
                          </div>
                          <div className="pdf-filesize">
                            {formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Grid>
              </Grid>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  size="large"
                  disabled={!formData.title || !formData.description || !selectedClass || !selectedSubject || selectedStudents.length === 0}
                  sx={{
                    fontWeight: 'bold',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  {isEditing ? 'Update Assignment' : 'Create Assignment'}
                </Button>
              </Box>
            </form>
          </Paper>
        )}

        <Typography variant="h5" gutterBottom>
          Your Assignments
        </Typography>
        <Grid container spacing={3}>
          {assignments.map((assignment) => (
            <Grid item xs={12} key={assignment.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{assignment.title}</Typography>
                  <Typography color="textSecondary" paragraph>
                    {assignment.description}
                  </Typography>
                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                  >
                    <Chip label={`Class: ${assignment.class_id}`} />
                    <Chip label={`Subject: ${assignment.subject}`} />
                    <Chip
                      label={`Due: ${new Date(
                        assignment.due_date
                      ).toLocaleDateString()}`}
                      color="primary"
                    />
                    {assignment.isClosed && (
                      <Chip
                        label="Closed for Submissions"
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <div className="submissions-info">
                    Total Submissions:{" "}
                    {assignment.submissions ? assignment.submissions.length : 0}
                    {assignment.submissions &&
                      assignment.submissions.length > 0 && (
                        <>
                          <br />
                          <span className="submission-stats">
                            On Time:{" "}
                            {
                              assignment.submissions.filter((s) => !s.isLate)
                                .length
                            }
                            {" | "}
                            Late:{" "}
                            {
                              assignment.submissions.filter((s) => s.isLate)
                                .length
                            }
                          </span>
                        </>
                      )}
                    {assignment.isClosed && !assignment.submissions?.length && (
                      <div className="submission-closed-message">
                        This assignment is closed. No submissions were received.
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardActions>
                  {!assignment.isClosed && (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEditClick(assignment)}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => handleDeleteAssignment(assignment.id)}
                  >
                    Delete
                  </Button>
                  {assignment.submissions &&
                    assignment.submissions.length > 0 && (
                      <Button
                        onClick={() => viewSubmissions(assignment.id)}
                        className="view-submissions-btn"
                      >
                        View {assignment.submissions.length} Submissions
                      </Button>
                    )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Modals */}
        {submissionsModalOpen && (
          <Dialog
            open={true}
            onClose={() => setSubmissionsModalOpen(null)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Assignment Submissions
              <IconButton
                onClick={() => setSubmissionsModalOpen(null)}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <StyledSubmissionsList>
                {assignments
                  .find((a) => a.id === submissionsModalOpen)
                  ?.submissions?.map((submission) => (
                    <div key={submission.id} className="submission-item">
                      <div className="submission-summary">
                        <span>{submission.student?.name}</span>
                        <span>
                          Submitted:{" "}
                          {new Date(
                            submission.submitted_at
                          ).toLocaleDateString()}
                          <span
                            className={`submission-status ${
                              submission.isLate ? "late" : "on-time"
                            }`}
                          >
                            ({submission.isLate ? "Late" : "On Time"})
                          </span>
                        </span>
                        {submission.grade !== null &&
                          submission.grade !== undefined && (
                            <span className="grade">
                              Grade: {submission.grade}/100
                            </span>
                          )}
                      </div>
                      <div className="submission-actions">
                        {submission.graded_at && (
                          <span className="graded-timestamp">
                            Graded on:{" "}
                            {new Date(
                              submission.graded_at
                            ).toLocaleDateString()}
                          </span>
                        )}
                        <Button
                          onClick={() => viewSubmissionDetails(submission)}
                          className="view-details-btn"
                        >
                          {submission.grade !== null
                            ? "Review Grade"
                            : "Grade Submission"}
                        </Button>
                      </div>
                    </div>
                  ))}
              </StyledSubmissionsList>
            </DialogContent>
          </Dialog>
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

export default TeacherAssignmentPage;

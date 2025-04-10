import React, { useState, useEffect } from "react";
import StudentNavbar from "./StudentNavbar";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  ExamNotificationsContainer,
  ExamTitleInput,
  UploadButton,
  SyllabusUploadContainer,
  SyllabusPreview,
  ExamTable,
  PreviewSection,
  PreviewContent,
  PreviewExamItem,
  ActionButtons,
  DashboardGrid,
  PageContainer,
} from "../../theme/StyledComponents";

interface ExamNotification {
  id: number;
  subject: string;
  title: string;
  exam_date: string;
  description: string;
  syllabus_url?: string;
}

interface SubjectExam {
  subject: string;
  exam_date: string;
  description?: string;
}

const ExamNotification: React.FC = () => {
  const {} = useAuth();
  const [notifications, setNotifications] = useState<ExamNotification[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);
  const [subjectExams, setSubjectExams] = useState<SubjectExam[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [reuseSyllabus, setReuseSyllabus] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchEnrolledSubjects();
  }, []);

  const fetchEnrolledSubjects = async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data.student?.subjects) {
        const subjects = response.data.student.subjects
          .split(",")
          .map((s: string) => s.trim());
        setEnrolledSubjects(subjects);
        setSubjectExams(
          subjects.map((subject: string) => ({
            subject,
            exam_date: "",
            description: "",
          }))
        );
      }
    } catch (err) {
      setError("Failed to load enrolled subjects");
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get(
        "/exam-notifications/student/exam-notifications"
      );
      setNotifications(response.data);
    } catch (err) {
      setError("Failed to load exam notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    subject: string,
    field: keyof SubjectExam,
    value: any
  ) => {
    setSubjectExams((prevExams) =>
      prevExams.map((exam) =>
        exam.subject === subject ? { ...exam, [field]: value } : exam
      )
    );
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      setError("Please enter an exam title");
      return;
    }

    const examsToPreview = subjectExams.filter((exam) => exam.exam_date);
    if (examsToPreview.length === 0) {
      setError("Please select at least one exam date");
      return;
    }

    setShowPreview(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!examTitle.trim()) {
      setError("Please enter an exam title");
      return;
    }

    try {
      const examsToSubmit = subjectExams.filter((exam) => exam.exam_date);

      if (examsToSubmit.length === 0) {
        setError("Please select at least one exam date");
        return;
      }

      // Create a single notification
      const selectedExam = examsToSubmit[0];
      const formData = new FormData();
      formData.append("title", examTitle);
      formData.append("subject", selectedExam.subject);
      formData.append("exam_date", selectedExam.exam_date);
      if (selectedExam.description) {
        formData.append("description", selectedExam.description);
      }
      if (syllabusFile) {
        formData.append("syllabus", syllabusFile);
      }
      if (reuseSyllabus) {
        formData.append("reuseSyllabus", "true");
      }

      const response = await api.post(
        "/exam-notifications/student/exam-notifications",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data) {
        throw new Error("No response from server");
      }

      // Success - reset form and fetch updated notifications
      fetchNotifications();
      setShowPreview(false);
      setExamTitle("");
      setSyllabusFile(null);
      setReuseSyllabus(false);
      setSubjectExams(
        enrolledSubjects.map((subject) => ({
          subject,
          exam_date: "",
          description: "",
        }))
      );
    } catch (err: any) {
      console.error("Error creating exam notification:", err);
      setError(
        err.response?.data?.error || "Failed to create exam notifications"
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/exam-notifications/student/exam-notifications/${id}`);
      fetchNotifications();
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to delete exam notification"
      );
    }
  };

  const handleDownload = async (syllabusUrl: string) => {
    try {
      // Extract filename from the URL
      const filename = syllabusUrl.split("/").pop();
      if (!filename) {
        throw new Error("Invalid file URL");
      }

      const response = await api.get(
        `/exam-notifications/download/${filename}`,
        {
          responseType: "blob",
        }
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading file:", err);
      setError("Failed to download syllabus file");
    }
  };

  const handleSyllabusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        setError("Only PDF and image files are allowed");
        return;
      }
      setSyllabusFile(file);
    }
  };

  const renderSyllabusPreview = () => {
    if (!syllabusFile) return null;

    if (syllabusFile.type.startsWith("image/")) {
      return (
        <SyllabusPreview>
          <img
            src={URL.createObjectURL(syllabusFile)}
            alt="Syllabus preview"
            style={{
              maxWidth: 120,
              maxHeight: 120,
              objectFit: "contain",
              borderRadius: 4,
            }}
          />
          <Typography>{syllabusFile.name}</Typography>
        </SyllabusPreview>
      );
    }

    if (syllabusFile.type === "application/pdf") {
      return (
        <SyllabusPreview>
          <Box sx={{ width: "100%", height: 600 }}>
            <iframe
              src={URL.createObjectURL(syllabusFile)}
              title="PDF Preview"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </Box>
          <Typography>📄 {syllabusFile.name}</Typography>
        </SyllabusPreview>
      );
    }

    return (
      <SyllabusPreview>
        <Typography>📄 {syllabusFile.name}</Typography>
      </SyllabusPreview>
    );
  };

  return (
    <PageContainer>
      <StudentNavbar />
      <DashboardGrid>
        <ExamNotificationsContainer>
          <Typography variant="h4" gutterBottom>
            Create Exam Notifications
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <ExamTitleInput
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="Enter exam title (e.g., Mid-Term Examination)"
              required
            />
          </Box>

          <SyllabusUploadContainer>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <input
                type="file"
                id="syllabus-upload"
                accept=".pdf,image/*"
                onChange={handleSyllabusUpload}
                style={{ display: "none" }}
              />
              <UploadButton
                htmlFor="syllabus-upload"
                className={syllabusFile ? "has-file" : ""}
              >
                {syllabusFile
                  ? "✓ File Selected"
                  : "Upload Syllabus (PDF/Image)"}
              </UploadButton>
              {renderSyllabusPreview()}
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reuseSyllabus}
                  onChange={(e) => setReuseSyllabus(e.target.checked)}
                />
              }
              label="Use same syllabus for all subjects"
            />
          </SyllabusUploadContainer>

          <Box>
            <form onSubmit={handlePreview}>
              <ExamTable component="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Exam Date</th>
                    <th>Description (Optional)</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectExams.map((exam) => (
                    <tr key={exam.subject}>
                      <td>{exam.subject}</td>
                      <td>
                        <input
                          type="date"
                          value={exam.exam_date}
                          onChange={(e) =>
                            handleInputChange(
                              exam.subject,
                              "exam_date",
                              e.target.value
                            )
                          }
                          style={{
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            width: "100%",
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={exam.description}
                          onChange={(e) =>
                            handleInputChange(
                              exam.subject,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Enter additional details (optional)"
                          style={{
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            width: "100%",
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </ExamTable>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
              >
                Preview Notifications
              </Button>
            </form>
          </Box>

          {showPreview && (
            <PreviewSection>
              <Typography variant="h5" gutterBottom>
                Preview Exam Notifications
              </Typography>
              <PreviewContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  {examTitle}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {subjectExams
                    .filter((exam) => exam.exam_date)
                    .map((exam) => (
                      <PreviewExamItem key={exam.subject}>
                        <Typography variant="h6">{exam.subject}</Typography>
                        <Typography>
                          Date: {new Date(exam.exam_date).toLocaleDateString()}
                        </Typography>
                        {exam.description && (
                          <Typography>
                            Description: {exam.description}
                          </Typography>
                        )}
                      </PreviewExamItem>
                    ))}
                </Box>
                {syllabusFile && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1,
                      bgcolor: "success.light",
                      borderRadius: 1,
                    }}
                  >
                    <Typography color="success.dark">
                      Syllabus File: {syllabusFile.name}
                    </Typography>
                    {reuseSyllabus && (
                      <Typography color="success.dark">
                        This syllabus will be used for all subjects
                      </Typography>
                    )}
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setShowPreview(false)}
                  >
                    Back to Edit
                  </Button>
                  <Button variant="contained" onClick={handleSubmit}>
                    Confirm & Submit
                  </Button>
                </Box>
              </PreviewContent>
            </PreviewSection>
          )}

          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            My Exam Notifications
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Typography color="textSecondary" align="center">
              No exam notifications found.
            </Typography>
          ) : (
            <ExamTable component="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Exam Date</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td>{notification.title}</td>
                    <td>{notification.subject}</td>
                    <td>
                      {new Date(notification.exam_date).toLocaleDateString()}
                    </td>
                    <td>{notification.description || "-"}</td>
                    <td>
                      <ActionButtons>
                        {notification.syllabus_url && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              handleDownload(notification.syllabus_url!)
                            }
                            startIcon={<span>📄</span>}
                          >
                            Download
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(notification.id)}
                          startIcon={<span>🗑️</span>}
                        >
                          Delete
                        </Button>
                      </ActionButtons>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ExamTable>
          )}
        </ExamNotificationsContainer>
      </DashboardGrid>
    </PageContainer>
  );
};

export default ExamNotification;

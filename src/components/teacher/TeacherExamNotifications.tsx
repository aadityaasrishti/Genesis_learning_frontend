import React, { useState, useEffect } from "react";
import TeacherNavbar from "./TeacherNavbar";
import api from "../../services/api";
import { Button, CircularProgress, Typography, Alert } from "@mui/material";
import {
  ExamNotificationsContainer,
  ExamTable,
  DashboardGrid,
  PageContainer,
} from "../../theme/StyledComponents";

interface ExamNotification {
  id: number;
  title: string;
  subject: string;
  exam_date: string;
  description: string;
  syllabus_url?: string;
  student: {
    name: string;
    class: string;
  };
}

const TeacherExamNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<ExamNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(
        "/exam-notifications/student/exam-notifications"
      );
      setNotifications(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to load exam notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (syllabusUrl: string) => {
    try {
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

  return (
    <PageContainer>
      <TeacherNavbar />
      <DashboardGrid>
        <ExamNotificationsContainer>
          <Typography variant="h4" component="h1" gutterBottom>
            Student Exam Notifications
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <CircularProgress />
          ) : notifications.length === 0 ? (
            <Typography color="textSecondary" align="center">
              No exam notifications found.
            </Typography>
          ) : (
            <ExamTable component="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Student</th>
                  <th>Class</th>
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
                    <td>{notification.student.name}</td>
                    <td>{notification.student.class}</td>
                    <td>{notification.subject}</td>
                    <td>
                      {new Date(notification.exam_date).toLocaleDateString()}
                    </td>
                    <td>{notification.description || "-"}</td>
                    <td>
                      {notification.syllabus_url && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            handleDownload(notification.syllabus_url!)
                          }
                          startIcon={<span>📄</span>}
                        >
                          View Syllabus
                        </Button>
                      )}
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

export default TeacherExamNotifications;

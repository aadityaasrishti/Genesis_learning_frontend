import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  styled,
  Fade,
  Chip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotificationSound, compareNotifications } from "../../utils/NotificationSound";
import NotificationSettings from "./NotificationSettings";
import { Notification, NotificationType, NotificationFilterType } from "../../types/notifications";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import api from "../../services/api";

interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
}

const NotificationWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 800,
  margin: "0 auto",
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(3),
}));

const HeaderActions = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  alignItems: "center",
}));

const NotificationItem = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isRead",
})<{ isRead?: boolean }>(({ theme, isRead }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  backgroundColor: isRead ? theme.palette.background.paper : theme.palette.action.hover,
  borderLeft: `4px solid ${isRead ? theme.palette.divider : theme.palette.primary.main}`,
  "&:hover": {
    transform: "translateX(4px)",
    boxShadow: theme.shadows[3],
  },
}));

const NotificationIcon = styled(Box)(({ theme }) => ({
  fontSize: "1.5rem",
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.main,
  flexShrink: 0,
}));

const NotificationContent = styled(Box)(({ theme }) => ({
  flex: 1,
  "& .notification-meta": {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

const NotificationActions = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "flex-start",
}));

const LoadMoreButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  width: "100%",
}));

const NotificationContainer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedType, setSelectedType] =
    useState<NotificationFilterType>("all");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousNotifications = useRef<Notification[]>([]);
  const playNotificationSound = useNotificationSound();

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/notifications", {
        params: {
          page,
          limit: 20,
          type: selectedType,
        },
      });
      const data = response.data as NotificationResponse;

      const newNotifications = data.notifications;
      setHasMore(page < data.pagination.pages);

      if (page === 1) {
        if (
          compareNotifications(
            newNotifications,
            previousNotifications.current
          ) &&
          localStorage.getItem("notificationSound") !== "disabled"
        ) {
          playNotificationSound();
        }
        previousNotifications.current = newNotifications;
        setNotifications(newNotifications);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      if (error.code === "ERR_NETWORK") {
        setError("Connection error. Retrying...");
        return;
      }
      setError(error.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset page when filter changes
    fetchNotifications(1);
  }, [selectedType]);

  useEffect(() => {
    let pollInterval = 30000;

    const poll = () => {
      if (error) {
        pollInterval = Math.min(pollInterval * 2, 300000);
      } else {
        pollInterval = 30000;
      }
      return fetchNotifications(1);
    };

    const interval = setInterval(poll, pollInterval);
    return () => clearInterval(interval);
  }, [error, selectedType]);

  const markAsRead = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAsReadDirect = async (notificationId: number) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (
    e: React.MouseEvent,
    notificationId: number
  ) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await api.post("/notifications/mark-all-read");
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case "extra_class":
        return "📚";
      case "teacher_task":
      case "task_update":
        return "✅";
      case "student_request":
      case "student_request_update":
        return "📝";
      case "system":
        return "🔔";
      case "assignment":
      case "assignment_created":
      case "assignment_update":
        return "📚"; // Changed to more appropriate icon for teachers
      case "assignment_submission":
      case "submission_confirmation":
        return "✍️"; // Specific icon for submissions
      case "assignment_graded":
        return "✅"; // Specific icon for graded assignments
      case "assignment_overdue":
        return "⚠️"; // Warning icon for overdue assignments
      case "feedback":
        return "💭";
      case "exam_notification":
        return "📝";
      case "fee_payment":
        return "💰";
      case "fee_reminder":
        return "📅";
      case "salary_payment":
        return "💵";
      case "salary_update":
        return "💼";
      case "test_created":
      case "test_assigned":
      case "test_submission":
        return "📝";
      case "test_graded":
        return "✅";
      case "test_reminder":
        return "⏰";
      case "expense_created":
      case "expense_pending":
        return "💰";
      case "expense_approved":
        return "✔️";
      case "expense_rejected":
        return "❌";
      default:
        return "📌";
    }
  };

  const getFilterOptions = (): {
    value: NotificationFilterType;
    label: string;
  }[] => {
    const baseOptions: { value: NotificationFilterType; label: string }[] = [
      { value: "all", label: "All Notifications" },
      { value: "extra_class", label: "Extra Classes" },
      { value: "system", label: "System" },
      { value: "assignment", label: "Assignments" },
      { value: "feedback", label: "Feedback" },
      { value: "fee", label: "Fee Updates" },
      { value: "salary", label: "Salary Updates" },
      { value: "test", label: "Tests" },
    ];

    if (!user) return baseOptions;

    // Add role-specific options
    switch (user.role) {
      case "teacher":
        return [
          ...baseOptions,
          { value: "teacher_task", label: "Tasks" },
          { value: "exam_notification", label: "Exam Notifications" },
        ];
      case "student":
        return [
          ...baseOptions,
          { value: "student_request", label: "My Requests" },
        ];
      case "admin":
      case "support_staff":
        return [
          ...baseOptions,
          { value: "teacher_task", label: "Teacher Tasks" },
          { value: "student_request", label: "Student Requests" },
          { value: "expense", label: "Expenses" },
        ];
      default:
        return baseOptions;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadDirect(notification.id);
    }

    const navigationPaths: Record<NotificationType, string> = {
      extra_class: "/dashboard/extra-classes",
      teacher_task: "/dashboard/tasks",
      task_update: "/dashboard/tasks",
      student_request: "/dashboard/student-requests",
      student_request_update: "/dashboard/student-requests",
      assignment: "/dashboard/assignments",
      assignment_created: "/dashboard/assignments",
      assignment_update: "/dashboard/assignments",
      assignment_submission: "/dashboard/assignments",
      submission_confirmation: "/dashboard/assignments",
      assignment_graded: "/dashboard/assignments",
      assignment_overdue: "/dashboard/assignments",
      feedback: "/dashboard/feedback",
      exam_notification: "/dashboard/exam-notifications",
      system: "/dashboard",
      fee_payment: "/dashboard/fees",
      fee_reminder: "/dashboard/fees",
      salary_payment: "/dashboard/salary",
      salary_update: "/dashboard/salary",
      test_created: "/dashboard/tests",
      test_assigned: "/dashboard/tests",
      test_submission: "/dashboard/tests",
      test_graded: "/dashboard/tests",
      test_reminder: "/dashboard/tests",
      expense_created: "/dashboard/expenses",
      expense_pending: "/dashboard/expenses",
      expense_approved: "/dashboard/expenses",
      expense_rejected: "/dashboard/expenses",
    };

    const path = navigationPaths[notification.type] || "/dashboard";
    navigate(path, { state: { fromNotification: true } });
  };

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.is_read
  );

  return (
    <NotificationWrapper>
      <NotificationHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <NotificationsIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" component="h2">
            Notifications
          </Typography>
        </Box>
        <HeaderActions>
          {error && (
            <Alert severity="error" sx={{ mr: 2 }}>
              {error}
            </Alert>
          )}
          {hasUnreadNotifications && (
            <Button
              variant="outlined"
              onClick={markAllAsRead}
              disabled={loading}
              startIcon={<DoneAllIcon />}
              size="small"
            >
              {loading ? "Marking..." : "Mark All as Read"}
            </Button>
          )}
          <IconButton
            onClick={() => setShowSettings(!showSettings)}
            color="primary"
            size="small"
          >
            <SettingsIcon />
          </IconButton>
        </HeaderActions>
      </NotificationHeader>

      {showSettings && (
        <Fade in>
          <Paper sx={{ mb: 3, p: 2 }}>
            <NotificationSettings onCleanup={() => fetchNotifications(1)} />
          </Paper>
        </Fade>
      )}

      <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
        <InputLabel>Filter Notifications</InputLabel>
        <Select
          value={selectedType}
          label="Filter Notifications"
          onChange={(e) => {
            setSelectedType(e.target.value as NotificationFilterType);
            setCurrentPage(1);
          }}
        >
          {getFilterOptions().map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {notifications.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          {loading ? (
            <LoadingSpinner message="Loading notifications..." />
          ) : (
            <Typography color="text.secondary">
              No notifications found
            </Typography>
          )}
        </Box>
      ) : (
        <>
          {notifications.map((notification) => (
            <Fade in key={notification.id}>
              <NotificationItem
                isRead={notification.is_read}
                onClick={() => handleNotificationClick(notification)}
                elevation={notification.is_read ? 0 : 1}
              >
                <NotificationIcon>
                  {getNotificationIcon(notification.type)}
                </NotificationIcon>
                <NotificationContent>
                  <Typography variant="body1">{notification.message}</Typography>
                  <Box className="notification-meta">
                    <Chip
                      size="small"
                      label={notification.type.replace(/_/g, " ")}
                      color={notification.is_read ? "default" : "primary"}
                      variant={notification.is_read ? "outlined" : "filled"}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </NotificationContent>
                <NotificationActions>
                  {!notification.is_read && (
                    <IconButton
                      size="small"
                      onClick={(e) => markAsRead(e, notification.id)}
                      color="primary"
                      title="Mark as read"
                    >
                      <DoneIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => deleteNotification(e, notification.id)}
                    color="error"
                    title="Delete notification"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </NotificationActions>
              </NotificationItem>
            </Fade>
          ))}
          {hasMore && (
            <LoadMoreButton
              variant="outlined"
              onClick={() => {
                const nextPage = currentPage + 1;
                setCurrentPage(nextPage);
                fetchNotifications(nextPage);
              }}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </LoadMoreButton>
          )}
        </>
      )}
    </NotificationWrapper>
  );
};

export default NotificationContainer;

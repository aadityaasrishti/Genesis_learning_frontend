import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  styled,
} from "@mui/material";
import {
  TasksGrid,
  TaskCard,
  TaskTitle,
  TaskDescription,
  TaskInfo,
  PriorityTag,
  TaskStatus,
  NoTasks,
} from "../../theme/StyledComponents";

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
}

const HighlightedTaskCard = styled(TaskCard, {
  shouldForwardProp: (prop) => prop !== "isHighlighted" && prop !== "priority",
})<{ isHighlighted?: boolean; priority: string }>(
  ({ theme, isHighlighted, priority }) => ({
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    ...(isHighlighted && {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[4],
    }),
    ...(priority === "high" && {
      borderTop: `3px solid ${theme.palette.error.main}`,
    }),
    ...(priority === "medium" && {
      borderTop: `3px solid ${theme.palette.warning.main}`,
    }),
    ...(priority === "low" && {
      borderTop: `3px solid ${theme.palette.success.main}`,
    }),
  })
);

const StatusSelect = styled(Select)(({ theme }) => ({
  flex: 1,
  "& .MuiSelect-select": {
    padding: theme.spacing(1),
  },
}));

const TeacherTasks = () => {
  const location = useLocation();
  const fromNotification = location.state?.fromNotification;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  useEffect(() => {
    if (fromNotification) {
      // Add highlight class to tasks
      const taskElements = document.querySelectorAll(".task-card");
      taskElements.forEach((element) => {
        element.classList.add("highlight-task");
      });

      // Remove highlight after animation
      setTimeout(() => {
        taskElements.forEach((element) => {
          element.classList.remove("highlight-task");
        });
      }, 2000);
    }
  }, [fromNotification]);

  const fetchMyTasks = async () => {
    try {
      const response = await api.get("/taskRoutes/tasks/my-tasks");
      setTasks(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      setError(null);
      await api.patch(`/taskRoutes/tasks/${taskId}/status`, {
        status: newStatus,
      });
      fetchMyTasks();
    } catch (error: any) {
      console.error("Error updating task status:", error);
      setError(error.response?.data?.error || "Failed to update task status");
      // Refresh tasks to revert the select to the previous value
      fetchMyTasks();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Tasks
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TasksGrid>
        {tasks.map((task) => (
          <HighlightedTaskCard
            key={task.id}
            isHighlighted={fromNotification}
            priority={task.priority.toLowerCase()}
            elevation={2}
          >
            <TaskTitle variant="h6">{task.title}</TaskTitle>
            <TaskDescription>{task.description}</TaskDescription>
            <TaskInfo>
              <Typography variant="body2">
                Due: {new Date(task.due_date).toLocaleString()}
              </Typography>
              <PriorityTag
                sx={(theme) => ({
                  backgroundColor:
                    task.priority.toLowerCase() === "high"
                      ? theme.palette.error.light
                      : task.priority.toLowerCase() === "medium"
                      ? theme.palette.warning.light
                      : theme.palette.success.light,
                  color:
                    task.priority.toLowerCase() === "high"
                      ? theme.palette.error.dark
                      : task.priority.toLowerCase() === "medium"
                      ? theme.palette.warning.dark
                      : theme.palette.success.dark,
                })}
              >
                {task.priority}
              </PriorityTag>
            </TaskInfo>
            <TaskStatus>
              <Typography variant="body2" component="label">
                Status:
              </Typography>
              <StatusSelect
                value={task.status}
                onChange={(e) =>
                  updateTaskStatus(task.id, e.target.value as string)
                }
                disabled={task.status === "COMPLETED"}
                size="small"
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </StatusSelect>
            </TaskStatus>
          </HighlightedTaskCard>
        ))}
      </TasksGrid>
      {tasks.length === 0 && <NoTasks>No tasks assigned yet.</NoTasks>}
    </Box>
  );
};

export default TeacherTasks;

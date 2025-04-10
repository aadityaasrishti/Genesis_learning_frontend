import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  styled,
} from "@mui/material";

const FormField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ContentContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

interface Teacher {
  user_id: number;
  name: string;
  subject: string;
  class_assigned: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  teacher_id: number;
  due_date: string;
  priority: string;
  status: string;
  teacher?: {
    name: string;
  };
}

interface TaskManagementProps {
  onTaskCreated?: () => void;
}

const TaskManagement: React.FC<TaskManagementProps> = ({
  onTaskCreated,
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    teacher_id: "",
    due_date: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [teachersResponse, tasksResponse] = await Promise.all([
          api.get("/taskRoutes/users/teachers"),
          api.get("/taskRoutes/tasks"),
        ]);

        setTeachers(teachersResponse.data);
        setTasks(tasksResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        teacher_id: parseInt(newTask.teacher_id),
      };

      await api.post("/taskRoutes/tasks", taskData);

      setNewTask({
        title: "",
        description: "",
        teacher_id: "",
        due_date: "",
        priority: "MEDIUM",
      });

      const response = await api.get("/taskRoutes/tasks");
      setTasks(response.data);
      
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task. Please try again.");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <ContentContainer elevation={1}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Typography variant="h6" sx={{ mb: 3 }}>Create New Task</Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <FormField>
            <FormControl fullWidth>
              <InputLabel>Teacher</InputLabel>
              <Select
                value={newTask.teacher_id}
                onChange={(e) => setNewTask({ ...newTask, teacher_id: e.target.value })}
                label="Teacher"
                required
              >
                <MenuItem value="">Select Teacher</MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.user_id} value={teacher.user_id}>
                    {teacher.name} ({teacher.subject} - {teacher.class_assigned})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>

          <FormField>
            <TextField
              fullWidth
              label="Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
          </FormField>

          <FormField>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              required
            />
          </FormField>

          <FormField>
            <TextField
              fullWidth
              label="Due Date"
              type="datetime-local"
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16)
              }}
            />
          </FormField>

          <FormField>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                label="Priority"
                required
              >
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>
          </FormField>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Assign Task
          </Button>
        </Box>
      </ContentContainer>

      <ContentContainer elevation={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Assigned Tasks
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    {task.teacher?.name || teachers.find((t) => t.user_id === task.teacher_id)?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {new Date(task.due_date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={task.priority}
                      color={getPriorityColor(task.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={task.status.replace('_', ' ')}
                      color={getStatusColor(task.status) as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No tasks assigned yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ContentContainer>
    </Box>
  );
};

export default TaskManagement;

import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Typography,
} from "@mui/material";
import api from "../../../services/api";

interface Student {
  id: number;
  user: {
    name: string;
    email: string;
  };
}

interface StudentListProps {
  classId: string;
  selectedStudent: number | null;
  onStudentSelect: (studentId: number) => void;
}

const StudentList: React.FC<StudentListProps> = ({
  classId,
  selectedStudent,
  onStudentSelect,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!classId) return;

      try {
        setLoading(true);
        const response = await api.reports.getStudentsByClass(classId);
        setStudents(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load students");
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  if (!students.length) {
    return (
      <Typography align="center" sx={{ p: 2 }}>
        No students found in this class
      </Typography>
    );
  }

  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {students.map((student) => (
        <ListItem key={student.id} disablePadding>
          <ListItemButton
            selected={selectedStudent === student.id}
            onClick={() => onStudentSelect(student.id)}
          >
            <ListItemText
              primary={student.user.name}
              secondary={student.user.email}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default StudentList;

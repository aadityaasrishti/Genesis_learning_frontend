import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

interface ClassSelectorProps {
  selectedClass: string;
  onClassSelect: (classId: string) => void;
}

const DEFAULT_CLASSES = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

const ClassSelector: React.FC<ClassSelectorProps> = ({
  selectedClass,
  onClassSelect,
}) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (user?.role === "teacher") {
          const response = await api.get(`/auth/teachers/${user.user_id}`);
          if (response.data?.class_assigned) {
            const teacherClasses = response.data.class_assigned
              .split(",")
              .map((c: string) => c.trim())
              .filter(Boolean);
            setClasses(teacherClasses);
          }
        } else if (user?.role === "admin" || user?.role === "support_staff") {
          setClasses(DEFAULT_CLASSES);
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        // Fallback to default classes in case of error
        setClasses(DEFAULT_CLASSES);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchClasses();
    }
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <FormControl fullWidth>
      <InputLabel>Select Class</InputLabel>
      <Select
        value={selectedClass}
        label="Select Class"
        onChange={(e) => onClassSelect(e.target.value)}
      >
        {classes.map((className) => (
          <MenuItem key={className} value={className}>
            {className}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ClassSelector;

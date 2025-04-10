import React, { useState, useEffect } from "react";
import { Box, Paper } from "@mui/material";
import ClassSelector from "./reports/ClassSelector";
import StudentList from "./reports/StudentList";
import StudentDetailedReport from "./reports/StudentDetailedReport";
import AdminNavbar from "./AdminNavbar";
import TeacherNavbar from "../teacher/TeacherNavbar";
import { useAuth } from "../../context/AuthContext";

const StudentReportPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  useEffect(() => {
    // Set initial class based on user role
    if (user) {
      if (user.role === "teacher" && user.teacher?.class_assigned) {
        const classes = user.teacher.class_assigned
          .split(",")
          .map((c) => c.trim());
        if (classes.length > 0) {
          setSelectedClass(classes[0]);
        }
      } else if (user.role === "admin" || user.role === "support_staff") {
        setSelectedClass("Class 1"); // Set a default class for admin/support staff
      }
    }
  }, [user]);

  return (
    <div className="admin-dashboard">
      {user?.role === "teacher" ? <TeacherNavbar /> : <AdminNavbar />}
      <div className="dashboard-container">
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <ClassSelector
              selectedClass={selectedClass}
              onClassSelect={setSelectedClass}
            />
          </Paper>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Paper sx={{ p: 2, flex: 1, maxWidth: 300 }}>
              <StudentList
                classId={selectedClass}
                selectedStudent={selectedStudent}
                onStudentSelect={setSelectedStudent}
              />
            </Paper>
            <Paper sx={{ p: 2, flex: 2 }}>
              {selectedStudent ? (
                <StudentDetailedReport studentId={selectedStudent} />
              ) : (
                <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                  Select a student to view their detailed report
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default StudentReportPage;

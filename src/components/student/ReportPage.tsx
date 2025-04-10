import React from "react";
import { Box, Paper } from "@mui/material";
import StudentDetailedReport from "../admin/reports/StudentDetailedReport";
import StudentNavbar from "./StudentNavbar";
import { useAuth } from "../../context/AuthContext";

const ReportPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <StudentNavbar />
      <div className="dashboard-container">
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 2 }}>
            <StudentDetailedReport studentId={user.user_id} />
          </Paper>
        </Box>
      </div>
    </div>
  );
};

export default ReportPage;

import SupportStaffNavbar from "./SupportStaffNavbar";
import TaskManagement from "../admin/modals/TaskManagement";
import { Box, Typography } from "@mui/material";

const SupportStaffTasksPage = () => {
  return (
    <div className="admin-dashboard">
      <SupportStaffNavbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Task Management</Typography>
        <TaskManagement />
      </Box>
    </div>
  );
};

export default SupportStaffTasksPage;

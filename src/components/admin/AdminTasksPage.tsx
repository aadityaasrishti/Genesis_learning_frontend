import AdminNavbar from "./AdminNavbar";
import TaskManagement from "./modals/TaskManagement";
import { Box, Typography } from "@mui/material";

const AdminTasksPage = () => {
  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Task Management</Typography>
        <TaskManagement />
      </Box>
    </div>
  );
};

export default AdminTasksPage;

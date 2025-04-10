import AdminNavbar from "./AdminNavbar";
import StudentRequestList from "../Common/StudentRequestList";

const AdminStudentRequestsPage = () => {
  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      <div className="dashboard-container">
        <h1 className="text-2xl font-bold mb-6">Student Requests</h1>
        <div className="student-requests-container">
          <StudentRequestList userRole="admin" />
        </div>
      </div>
    </div>
  );
};

export default AdminStudentRequestsPage;

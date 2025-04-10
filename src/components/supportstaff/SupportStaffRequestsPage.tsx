import SupportStaffNavbar from "./SupportStaffNavbar";
import StudentRequestList from "../Common/StudentRequestList";

const SupportStaffRequestsPage = () => {
  return (
    <div className="admin-dashboard">
      <SupportStaffNavbar />
      <div className="dashboard-container">
        <h1 className="text-2xl font-bold mb-6">Student Requests</h1>

        <div className="student-requests-section">
          <StudentRequestList userRole="support_staff" />
        </div>
      </div>
    </div>
  );
};

export default SupportStaffRequestsPage;

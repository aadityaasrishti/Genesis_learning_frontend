import { useState } from "react";
import StudentNavbar from "./StudentNavbar";
import StudentRequestList from "../Common/StudentRequestList";
import StudentRequest from "./StudentRequest";

const StudentRequestsPage = () => {
  const [requestListKey, setRequestListKey] = useState(0);

  const handleRequestSubmitted = () => {
    setRequestListKey((prev) => prev + 1);
  };

  return (
    <div className="admin-dashboard">
      <StudentNavbar />
      <div className="dashboard-container">
        <h1 className="text-2xl font-bold mb-6">My Requests</h1>
        <div className="request-page-container">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Submit New Request</h2>
            <StudentRequest onRequestSubmitted={handleRequestSubmitted} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">My Request History</h2>
            <StudentRequestList userRole="student" key={requestListKey} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRequestsPage;

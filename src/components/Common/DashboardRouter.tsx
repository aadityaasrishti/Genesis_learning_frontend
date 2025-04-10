import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "../admin/AdminDashboard";
import TeacherDashboard from "../teacher/TeacherDashboard";
import StudentDashboard from "../student/StudentDashboard";
import SupportStaffDashboard from "../supportstaff/SupportStaffDashboard";
import AttendanceMarking from "../supportstaff/AttendanceMarking";
import AttendanceReport from "../supportstaff/AttendanceReport";
import AttendanceViewing from "../student/AttendanceViewing";
import TeacherAttendanceView from "../teacher/TeacherAttendanceView";
import HolidayManagement from "../admin/HolidayManagement";
import StudentWiseReport from "../supportstaff/StudentWiseReport";
import ExtraClassAttendance from "../extra-classes/ExtraClassAttendance";
import EditExtraClass from "../extra-classes/EditExtraClass";
import NotificationContainer from "../Common/NotificationContainer";
import StudentFeedbackPage from "../student/StudentFeedbackPage";
import TeacherFeedbackPage from "../teacher/TeacherFeedbackPage";
import AdminFeedbackPage from "../admin/AdminFeedbackPage";
import AdminExtraClassesPage from "../admin/AdminExtraClassesPage";
import AdminTasksPage from "../admin/AdminTasksPage";
import AdminStudentRequestsPage from "../admin/AdminStudentRequestsPage";
import TeacherExtraClassesPage from "../teacher/TeacherExtraClassesPage";
import TeacherTasksPage from "../teacher/TeacherTasksPage";
import StudentExtraClassesPage from "../student/StudentExtraClassesPage";
import StudentRequestsPage from "../student/StudentRequestsPage";
import ExamNotification from "../student/ExamNotification";
import SupportStaffExtraClassesPage from "../supportstaff/SupportStaffExtraClassesPage";
import SupportStaffTasksPage from "../supportstaff/SupportStaffTasksPage";
import SupportStaffRequestsPage from "../supportstaff/SupportStaffRequestsPage";
import UserManagement from "../admin/UserManagement";
import TeacherAssignmentPage from "../teacher/TeacherAssignmentPage";
import StudentAssignmentPage from "../student/StudentAssignmentPage";
import AdminAssignmentView from "../admin/AdminAssignmentView";
import TeacherExamNotifications from "../teacher/TeacherExamNotifications";
import SupportStaffCalendarPage from "../supportstaff/SupportStaffCalendarPage";
import SupportStaffAssignmentPage from "../supportstaff/SupportStaffAssignmentPage";
import FeeManagement from "../admin/FeeManagement";
import StudentFeeView from "../student/StudentFeeView";
import SalaryManagement from "../salary/SalaryManagement";
import TeacherTestManagement from "../teacher/TeacherTestManagement";
import StudentTestView from "../student/StudentTestView";
import AdminNotesReview from "../admin/AdminNotesReview";
import TeacherNotesUpload from "../teacher/TeacherNotesUpload";
import StudentNotesWrapper from "../student/StudentNotes";
import { TeacherMCQPage } from "../pages/TeacherMCQPage";
import { StudentMCQPage } from "../pages/StudentMCQPage";
import StudentReportPage from "../admin/StudentReportPage";
import ReportPage from "../student/ReportPage";
import ExpenseManagement from "../admin/ExpenseManagement";
import ExamResults from "../student/ExamResults";
import TeacherExamResults from "../teacher/TeacherExamResults";
import AdminExamResults from "../admin/AdminExamResults";
import ScheduleManager from "../schedule/ScheduleManager";
import ScheduleView from "../schedule/ScheduleView";
import TeacherDailyChallenge from "../teacher/TeacherDailyChallenge";
import StudentDailyChallenge from "../student/StudentDailyChallenge";
import AdminDailyChallenge from "../admin/AdminDailyChallenge";
import TeacherCalendarPage from "../teacher/TeacherCalendarPage";
import StudentCalendarPage from "../student/StudentCalendarPage";
import AdminCalendarPage from "../admin/AdminCalendarPage";
import TeacherNotesView from "../teacher/TeacherNotesView";

const DashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        pt: "64px", // Account for AppBar height
      }}
    >
      <Routes>
        {/* Common Routes for All Roles */}
        <Route path="/notifications" element={<NotificationContainer />} />
        <Route
          path="/mark-extra-attendance"
          element={<ExtraClassAttendance />}
        />

        {/* Admin Routes */}
        {user.role === "admin" && (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/mark-attendance" element={<AttendanceMarking />} />
            <Route path="/attendance-report" element={<AttendanceReport />} />
            <Route
              path="/attendance/student-wise"
              element={<StudentWiseReport />}
            />
            <Route path="/holidays" element={<HolidayManagement />} />
            <Route path="/extra-classes" element={<AdminExtraClassesPage />} />
            <Route path="/assignments" element={<AdminAssignmentView />} />
            <Route path="/tasks" element={<AdminTasksPage />} />
            <Route
              path="/student-requests"
              element={<AdminStudentRequestsPage />}
            />
            <Route path="/feedback" element={<AdminFeedbackPage />} />
            <Route path="/usermanagement" element={<UserManagement />} />
            <Route path="/fees" element={<FeeManagement />} />
            <Route path="/salary" element={<SalaryManagement />} />
            <Route path="/expenses" element={<ExpenseManagement />} />
            <Route path="/notes" element={<AdminNotesReview />} />
            <Route path="/student-reports" element={<StudentReportPage />} />
            <Route path="/exam-results" element={<AdminExamResults />} />
            <Route path="/schedules/manage" element={<ScheduleManager />} />
            <Route path="/calendar" element={<AdminCalendarPage />} />
            <Route path="/daily-challenge" element={<AdminDailyChallenge />} />
          </>
        )}

        {/* Teacher Routes */}
        {user.role === "teacher" && (
          <>
            <Route path="/" element={<TeacherDashboard />} />
            <Route
              path="/attendance/view"
              element={<TeacherAttendanceView />}
            />
            <Route path="/assignments" element={<TeacherAssignmentPage />} />
            <Route
              path="/extra-classes"
              element={<TeacherExtraClassesPage />}
            />
            <Route path="/tasks" element={<TeacherTasksPage />} />
            <Route
              path="/exam-notifications"
              element={<TeacherExamNotifications />}
            />
            <Route
              path="/extra-classes/edit/:id"
              element={<EditExtraClass />}
            />
            <Route path="/feedback" element={<TeacherFeedbackPage />} />
            <Route path="/salary" element={<SalaryManagement />} />
            <Route path="/tests" element={<TeacherTestManagement />} />
            <Route path="/notes/upload" element={<TeacherNotesUpload />} />
            <Route path="/notes/view" element={<TeacherNotesView />} />
            <Route path="/mcq" element={<TeacherMCQPage />} />
            <Route path="/student-reports" element={<StudentReportPage />} />
            <Route path="/exam-results" element={<TeacherExamResults />} />
            <Route
              path="/exam-results/student/:studentId"
              element={<ExamResults />}
            />
            <Route path="/schedules/view" element={<ScheduleView />} />
            <Route path="/daily-challenge" element={<TeacherDailyChallenge />} />
            <Route path="/calendar" element={<TeacherCalendarPage />} />
          </>
        )}

        {/* Student Routes */}
        {user.role === "student" && (
          <>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/attendance/view" element={<AttendanceViewing />} />
            <Route path="/assignments" element={<StudentAssignmentPage />} />
            <Route
              path="/extra-classes"
              element={<StudentExtraClassesPage />}
            />
            <Route path="/student-requests" element={<StudentRequestsPage />} />
            <Route path="/exam-notifications" element={<ExamNotification />} />
            <Route path="/feedback" element={<StudentFeedbackPage />} />
            <Route path="/fees" element={<StudentFeeView />} />
            <Route path="/tests" element={<StudentTestView />} />
            <Route path="/notes" element={<StudentNotesWrapper />} />
            <Route path="/mcq" element={<StudentMCQPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/exam-results" element={<ExamResults />} />
            <Route path="/schedules/view" element={<ScheduleView />} />
            <Route path="/daily-challenge" element={<StudentDailyChallenge />} />
            <Route path="/calendar" element={<StudentCalendarPage />} />
          </>
        )}

        {/* Support Staff Routes */}
        {user.role === "support_staff" && (
          <>
            <Route path="/" element={<SupportStaffDashboard />} />
            <Route path="/mark-attendance" element={<AttendanceMarking />} />
            <Route
              path="/mark-extra-attendance"
              element={<ExtraClassAttendance />}
            />
            <Route path="/attendance-report" element={<AttendanceReport />} />
            <Route
              path="/attendance/student-wise"
              element={<StudentWiseReport />}
            />
            <Route path="/usermanagement" element={<UserManagement />} />
            <Route path="/calendar" element={<SupportStaffCalendarPage />} />
            <Route
              path="/assignments"
              element={<SupportStaffAssignmentPage />}
            />
            <Route
              path="/extra-classes"
              element={<SupportStaffExtraClassesPage />}
            />
            <Route path="/tasks" element={<SupportStaffTasksPage />} />
            <Route
              path="/student-requests"
              element={<SupportStaffRequestsPage />}
            />
            <Route path="/fees" element={<FeeManagement />} />
            <Route path="/expenses" element={<ExpenseManagement />} />
            <Route path="/schedules/manage" element={<ScheduleManager />} />
          </>
        )}

        {/* Extra Class Routes */}
        <Route
          path="/extra-classes/attendance/:id"
          element={<ExtraClassAttendance />}
        />
        <Route path="/extra-classes/edit/:id" element={<EditExtraClass />} />
      </Routes>
    </Box>
  );
};

export default DashboardRouter;

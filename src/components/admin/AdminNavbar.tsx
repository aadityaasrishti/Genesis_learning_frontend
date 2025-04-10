import BaseNavbar from "../Common/BaseNavbar";

const AdminNavbar = () => {
  const navLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      isHighPriority: true,
    },
    {
      to: "/attendance",
      label: "Attendance & Calendar",
      subLinks: [
        { to: "/dashboard/mark-attendance", label: "Mark Attendance" },
        { to: "/dashboard/attendance-report", label: "Attendance Reports" },
        {
          to: "/dashboard/attendance/student-wise",
          label: "Student wise Attendance report",
        },
        { to: "/dashboard/calendar", label: "Calendar" },
        { to: "/dashboard/holidays", label: "Holiday Management" },
      ],
    },
    {
      to: "/management",
      label: "Management",
      subLinks: [
        { to: "/dashboard/schedules/manage", label: "Class Schedules" },
        { to: "/dashboard/extra-classes", label: "Extra Classes" },
        { to: "/dashboard/tasks", label: "Task Management" },
        { to: "/dashboard/student-requests", label: "Student Requests" },
        { to: "/dashboard/notes", label: "Notes" },
        { to: "/dashboard/exam-results", label: "Exam Results" },
        { to: "/dashboard/student-reports", label: "Student Reports" },
        { to: "/dashboard/daily-challenge", label: "Daily Challenge" },
      ],
    },
    {
      to: "/system",
      label: "System",
      subLinks: [
        { to: "/dashboard/feedback", label: "Feedback Management" },
        { to: "/dashboard/usermanagement", label: "Users" },
        { to: "/dashboard/assignments", label: "Assignments" },
        { to: "/dashboard/fees", label: "Fee Management" },
        { to: "/dashboard/salary", label: "Salary Management" },
        { to: "/dashboard/expenses", label: "Expence Management" },
      ],
    },
  ];

  return (
    <BaseNavbar brandName="Genesis Learning - Admin" navLinks={navLinks} />
  );
};

export default AdminNavbar;

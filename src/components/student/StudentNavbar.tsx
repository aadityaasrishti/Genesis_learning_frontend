import BaseNavbar from "../Common/BaseNavbar";

const StudentNavbar = () => {
  const navLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      isHighPriority: true,
    },
    {
      label: "Academic",
      subLinks: [
        { to: "/dashboard/schedules/view", label: "Class Schedule" },
        { to: "/dashboard/assignments", label: "Assignments" },
        { to: "/dashboard/exam-notifications", label: "Exam Notifications" },
        { to: "/dashboard/attendance/view", label: "View Attendance" },
        { to: "/dashboard/calendar", label: "Calendar" },
        { to: "/dashboard/tests", label: "Tests" },
        { to: "/dashboard/notes", label: "Notes" },
        { to: "/dashboard/mcq", label: "MCQ Tests" },
        { to: "/dashboard/exam-results", label: "Exam Results" },
        { to: "/dashboard/daily-challenge", label: "Daily Challenge" },
      ],
    },
    {
      label: "Activities",
      subLinks: [
        { to: "/dashboard/extra-classes", label: "Extra Classes" },
        { to: "/dashboard/student-requests", label: "Submit Request" },
        { to: "/dashboard/feedback", label: "Feedback" },
        { to: "/dashboard/fees", label: "Fee Details" },
      ],
    },
  ];

  return (
    <BaseNavbar brandName="Genesis Learning - Student" navLinks={navLinks} />
  );
};

export default StudentNavbar;

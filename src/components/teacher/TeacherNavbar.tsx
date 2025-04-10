import BaseNavbar from "../Common/BaseNavbar";

const TeacherNavbar = () => {
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
        { 
          to: "/dashboard/notes/upload", 
          label: "Upload Notes" 
        },
        { 
          to: "/dashboard/notes/view", 
          label: "View My Notes" 
        },
        { to: "/dashboard/mcq", label: "MCQ Management" },
        { to: "/dashboard/exam-results", label: "Exam Results" },
        { to: "/dashboard/daily-challenge", label: "Daily Challenge" },
      ],
    },
    {
      label: "Activities",
      subLinks: [
        { to: "/dashboard/extra-classes", label: "Extra Classes" },
        { to: "/dashboard/tasks", label: "My Tasks" },
        { to: "/dashboard/feedback", label: "Feedback" },
        { to: "/dashboard/salary", label: "My Salary" },
        { to: "/dashboard/student-reports", label: "Student Reports" },
      ],
    },
  ];

  return (
    <BaseNavbar brandName="Genesis Learning - Teacher" navLinks={navLinks} />
  );
};

export default TeacherNavbar;

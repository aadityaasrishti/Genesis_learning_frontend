import BaseNavbar from "../Common/BaseNavbar";

const SupportStaffNavbar: React.FC = () => {
  const navLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      isHighPriority: true,
    },
    {
      label: "Attendance & Calendar",
      subLinks: [
        { to: "/dashboard/mark-attendance", label: "Mark Attendance" },
        { to: "/dashboard/attendance-report", label: "View Reports" },
        {
          to: "/dashboard/attendance/student-wise",
          label: "Student wise report",
        },
        { to: "/dashboard/calendar", label: "Calendar" },
      ],
    },
    {
      label: "Management",
      subLinks: [
        { to: "/dashboard/schedules/manage", label: "Class Schedules" },
        { to: "/dashboard/extra-classes", label: "Extra Classes" },
        { to: "/dashboard/tasks", label: "Task Management" },
        { to: "/dashboard/usermanagement", label: "Users" },
        { to: "/dashboard/student-requests", label: "Student Requests" },
        { to: "/dashboard/assignments", label: "Assignments" },
        { to: "/dashboard/fees", label: "Fee Management" },
      ],
    },
  ];

  return (
    <BaseNavbar
      brandName="Genesis Learning - Support Staff"
      navLinks={navLinks}
    />
  );
};

export default SupportStaffNavbar;

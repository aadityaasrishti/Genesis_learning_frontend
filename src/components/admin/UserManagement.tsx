import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import api from "../../services/api";
import DemoUsersTable from "./tables/DemoUsersTable";
import StudentsTable from "./tables/StudentsTable";
import TeachersTable from "./tables/TeachersTable";
import AdminStaffTable from "./tables/AdminStaffTable";
import InactiveUsersTable from "./tables/InactiveUsersTable";
import EditUserModal from "./modals/EditUserModal";
import UpgradeModal from "./modals/UpgradeModal";
import Navbar from "./AdminNavbar";
import {
  ManagementContainer,
  ManagementHeader,
  FiltersSection,
  SearchField,
  StyledTabs,
  StyledTab,
  StyledPaper,
} from "../../theme/StyledComponents";
import {
  Student,
  Teacher,
  AdminStaff,
  InactiveUser,
  EditableUser,
  isStudent,
  isTeacher,
  isAdminStaff,
  User,
} from "../../types/types";

interface DemoUser {
  user_id: number;
  name: string;
  email: string;
  role: string;
  mobile: string;
  class?: string;
  subjects?: string;
  requested_class?: string;
  requested_subjects?: string;
  guardian_name?: string;
  is_active: boolean;
  created_at: string;
  plan_status: string;
}

interface BaseUserInfo {
  name: string;
  email: string;
  created_at: string;
  role: string;
  plan_status: string;
  requested_class?: string;
  requested_subjects?: string;
}

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("demo");
  const [selectedUser, setSelectedUser] = useState<EditableUser | null>(null);
  const [modalType, setModalType] = useState<"edit" | "upgrade" | "inactive">(
    "edit"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [adminStaff, setAdminStaff] = useState<AdminStaff[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([]);
  const [showModal, setShowModal] = useState(false);

  const mapToEditableUser = (
    user: DemoUser | Student | Teacher | AdminStaff | InactiveUser
  ): EditableUser => {
    if ("name" in user && !("user" in user)) {
      // Handle DemoUser
      return {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        plan_status: user.plan_status,
        mobile: user.mobile || "",
        class: user.class || "",
        subjects: user.subjects || "",
        guardian_name: user.guardian_name || "",
        requested_class: user.requested_class || "",
        requested_subjects: user.requested_subjects || "",
        demo_user_flag: true,
        updated_at: "",
        inactivation_date: "",
      };
    }

    // Handle nested user types
    const userInfo = (user as { user: BaseUserInfo }).user;
    const baseUser: EditableUser = {
      user_id: user.user_id,
      name: userInfo.name,
      email: userInfo.email,
      role: userInfo.role,
      is_active: true,
      created_at: userInfo.created_at,
      plan_status: userInfo.plan_status,
      mobile: "mobile" in user ? user.mobile : "",
      class: "",
      subjects: "",
      guardian_name: "",
      requested_class: userInfo.requested_class || "",
      requested_subjects: userInfo.requested_subjects || "",
      demo_user_flag: false,
      updated_at: "",
      inactivation_date: "",
    };

    if (isStudent(user)) {
      baseUser.student = user;
    } else if (isTeacher(user)) {
      baseUser.teacher = user;
    } else if (isAdminStaff(user)) {
      baseUser.adminStaff = user;
    }

    return baseUser;
  };

  const loadData = async () => {
    try {
      const [demoRes, studentsRes, teachersRes, staffRes, inactiveRes] =
        await Promise.all([
          api.get("/auth/demo-users"),
          api.get("/auth/students"),
          api.get("/auth/teachers"),
          api.get("/auth/admin-staff"),
          api.get("/auth/inactive-users"),
        ]);

      setDemoUsers(demoRes.data);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
      setAdminStaff(staffRes.data);
      setInactiveUsers(inactiveRes.data);
    } catch (err) {
      console.error("Loading failed:", err);
    }
  };

  // Reload data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Handle successful updates
  const handleEditSuccess = async () => {
    await loadData(); // Reload all data
    setShowModal(false);
    setSelectedUser(null);
  };

  // Handle successful upgrades
  const handleUpgradeSuccess = async () => {
    await loadData(); // Reload all data
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleDeactivate = async (userId: number) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      try {
        await api.post(`/auth/users/${userId}/deactivate`);
        loadData();
      } catch (err) {
        console.error("Deactivation failed:", err);
      }
    }
  };

  const tabs = [
    { id: "demo", label: "Demo Users" },
    { id: "students", label: "Students" },
    { id: "teachers", label: "Teachers" },
    { id: "adminStaff", label: "Admin Staff" },
    { id: "inactive", label: "Inactive Users" },
  ];

  return (
    <div>
      <Navbar />
      <ManagementContainer>
        <ManagementHeader>
          <Typography variant="h4" gutterBottom>
            User Management
          </Typography>
        </ManagementHeader>

        <FiltersSection>
          <SearchField
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
          />
        </FiltersSection>

        <StyledTabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <StyledTab key={tab.id} label={tab.label} value={tab.id} />
          ))}
        </StyledTabs>

        <StyledPaper>
          {activeTab === "demo" && (
            <DemoUsersTable
              users={demoUsers.filter(
                (user) =>
                  user.email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  user.name?.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              onEdit={(user) => {
                setSelectedUser(mapToEditableUser(user as unknown as DemoUser));
                setModalType("edit");
                setShowModal(true);
              }}
              onUpgrade={(user) => {
                setSelectedUser(mapToEditableUser(user as unknown as DemoUser));
                setModalType("upgrade");
                setShowModal(true);
              }}
            />
          )}

          {activeTab === "students" && (
            <StudentsTable
              students={students.filter(
                (student) =>
                  student.user.email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  student.user.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )}
              onEdit={(student) => {
                setSelectedUser(mapToEditableUser(student));
                setModalType("edit");
                setShowModal(true);
              }}
              onDeactivate={handleDeactivate}
            />
          )}

          {activeTab === "teachers" && (
            <TeachersTable
              teachers={teachers.filter(
                (teacher) =>
                  teacher.user.email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  teacher.user.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )}
              onEdit={(teacher) => {
                setSelectedUser(mapToEditableUser(teacher));
                setModalType("edit");
                setShowModal(true);
              }}
              onDeactivate={handleDeactivate}
            />
          )}

          {activeTab === "adminStaff" && (
            <AdminStaffTable
              staff={adminStaff.filter(
                (staff) =>
                  staff.user.email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  staff.user.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )}
              onEdit={(staff) => {
                setSelectedUser(mapToEditableUser(staff));
                setModalType("edit");
                setShowModal(true);
              }}
              onDeactivate={handleDeactivate}
            />
          )}

          {activeTab === "inactive" && (
            <InactiveUsersTable
              users={inactiveUsers.filter(
                (user) =>
                  user.user.email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  user.user.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )}
              onReactivate={async (userId) => {
                try {
                  await api.post(`/auth/inactive-users/${userId}/reactivate`);
                  loadData();
                } catch (err) {
                  console.error("Reactivation failed:", err);
                }
              }}
            />
          )}
        </StyledPaper>

        {showModal && modalType === "edit" && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowModal(false);
              setSelectedUser(null);
            }}
            onSuccess={handleEditSuccess}
          />
        )}

        {showModal && modalType === "upgrade" && selectedUser && (
          <UpgradeModal
            user={selectedUser}
            onClose={() => {
              setShowModal(false);
              setSelectedUser(null);
            }}
            onSuccess={handleUpgradeSuccess}
          />
        )}
      </ManagementContainer>
    </div>
  );
};

export default UserManagement;

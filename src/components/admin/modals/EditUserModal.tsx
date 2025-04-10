import { useState, useEffect } from "react";
import {
  Alert,
  Typography,
  Button,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import api from "../../../services/api";
import { UserUpdateData, EditableUser } from "../../../types/types";
import { FeeStructure } from "../../../types/fees";
import { useAuth } from "../../../context/AuthContext";
import { ClassSelect, SubjectSelect } from "../../Auth/selections";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalActions,
  StyledTextField,
  ModalFormField,
  CloseButton,
} from "../../../theme/StyledComponents";

interface EditUserModalProps {
  user: EditableUser;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal = ({ user, onClose, onSuccess }: EditUserModalProps) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<UserUpdateData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentRole = user.role?.toLowerCase();
  const isPermanent = user.plan_status === "permanent";
  const isAdmin = currentUser?.role === "admin";
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);

  const initializeFormData = () => {
    const baseData: UserUpdateData = {
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
    };

    if (currentRole === "student") {
      return {
        ...baseData,
        class_id: user.student?.class_id || user.class || "",
        subjects: user.student?.subjects || user.subjects || "",
        guardian_name: user.student?.guardian_name || user.guardian_name || "",
        guardian_mobile: user.student?.guardian_mobile || user.mobile || "",
        fee_structure_id: user.student?.fee_structure_id || null,
        address: user.student?.address || "",
        date_of_birth: user.student?.date_of_birth || "",
      };
    }

    if (currentRole === "teacher") {
      return {
        ...baseData,
        subject: user.teacher?.subject || user.subjects || "",
        class_assigned: user.teacher?.class_assigned || user.class || "",
      };
    }

    if (currentRole === "admin" || currentRole === "support_staff") {
      return {
        ...baseData,
        department: user.adminSupportStaff?.department || "",
      };
    }

    return baseData;
  };

  useEffect(() => {
    setFormData(initializeFormData());
  }, [user]);

  useEffect(() => {
    const fetchFeeStructures = async () => {
      try {
        const { data } = await api.get("/fees/structures");
        setFeeStructures(data);
      } catch (error) {
        console.error("Failed to fetch fee structures:", error);
      }
    };

    if (currentRole === "student") {
      fetchFeeStructures();
    }
  }, [currentRole]);

  const handleInputChange = (
    field: keyof UserUpdateData,
    value: string | number | null
  ) => {
    if (field === "fee_structure_id" && isPermanent && !isAdmin) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create user update data object
      const userUpdateData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
      };

      // Add role-specific fields to user update
      if (currentRole === "student") {
        Object.assign(userUpdateData, {
          class: formData.class_id,
          subjects: formData.subjects,
        });
      } else if (currentRole === "teacher") {
        Object.assign(userUpdateData, {
          class: formData.class_assigned,
          subjects: formData.subject,
        });
      }

      // Update User first
      await api.put(`/auth/users/${user.user_id}`, userUpdateData);

      // Update role-specific data
      if (currentRole === "student") {
        await api.put(`/auth/students/${user.user_id}`, {
          class_id: formData.class_id,
          subjects: formData.subjects,
          guardian_name: formData.guardian_name,
          guardian_mobile: formData.guardian_mobile,
          address: formData.address,
          date_of_birth: formData.date_of_birth,
          fee_structure_id: formData.fee_structure_id,
        });
      } else if (currentRole === "teacher") {
        if (!formData.subject?.trim() || !formData.class_assigned?.trim()) {
          throw new Error("Subject and class assignment are required for teachers");
        }
        await api.put(`/auth/teachers/${user.user_id}`, {
          subject: formData.subject,
          class_assigned: formData.class_assigned,
          mobile: formData.mobile,
        });
      } else if (currentRole === "admin" || currentRole === "support_staff") {
        await api.put(`/auth/admin-staff/${user.user_id}`, {
          department: formData.department,
          mobile: formData.mobile,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || err.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form
  return (
    <ModalOverlay open={true} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <Typography variant="h5">Edit User</Typography>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form>
          <ModalFormField>
            <StyledTextField
              label="Name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              fullWidth
            />
          </ModalFormField>

          <ModalFormField>
            <StyledTextField
              label="Email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              fullWidth
            />
          </ModalFormField>

          <ModalFormField>
            <StyledTextField
              label="Mobile"
              value={formData.mobile || ""}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              fullWidth
            />
          </ModalFormField>

          {/* Role-specific fields */}
          {currentRole === "student" && (
            <>
              <ModalFormField>
                <ClassSelect
                  label="Class"
                  value={formData.class_id || ""}
                  onChange={(value) => handleInputChange("class_id", value)}
                />
              </ModalFormField>

              <ModalFormField>
                <SubjectSelect
                  label="Subjects"
                  value={formData.subjects || ""}
                  onChange={(value) => handleInputChange("subjects", value)}
                  classId={formData.class_id || ""}
                />
              </ModalFormField>

              <ModalFormField>
                <StyledTextField
                  label="Guardian Name"
                  value={formData.guardian_name || ""}
                  onChange={(e) =>
                    handleInputChange("guardian_name", e.target.value)
                  }
                  fullWidth
                />
              </ModalFormField>

              <ModalFormField>
                <StyledTextField
                  label="Guardian Mobile"
                  value={formData.guardian_mobile || ""}
                  onChange={(e) =>
                    handleInputChange("guardian_mobile", e.target.value)
                  }
                  fullWidth
                />
              </ModalFormField>

              <ModalFormField>
                <StyledTextField
                  select
                  label="Fee Structure"
                  value={formData.fee_structure_id || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "fee_structure_id",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  fullWidth
                  disabled={isPermanent && !isAdmin}
                  title={
                    isPermanent && !isAdmin
                      ? "Only admins can modify fee structure for permanent students"
                      : ""
                  }
                >
                  <MenuItem value="">Select Fee Structure</MenuItem>
                  {feeStructures.map((structure) => (
                    <MenuItem key={structure.id} value={structure.id}>
                      {structure.class_id} -{" "}
                      {structure.subject || "All Subjects"} (₹{structure.amount}
                      )
                    </MenuItem>
                  ))}
                </StyledTextField>
              </ModalFormField>
            </>
          )}

          {currentRole === "teacher" && (
            <>
              <ModalFormField>
                <ClassSelect
                  label="Class Assigned"
                  value={formData.class_assigned || ""}
                  onChange={(value) =>
                    handleInputChange("class_assigned", value)
                  }
                />
              </ModalFormField>

              <ModalFormField>
                <SubjectSelect
                  label="Subject"
                  value={formData.subject || ""}
                  onChange={(value) => handleInputChange("subject", value)}
                  classId={formData.class_assigned || ""}
                />
              </ModalFormField>
            </>
          )}

          {(currentRole === "admin" || currentRole === "support_staff") && (
            <ModalFormField>
              <StyledTextField
                label="Department"
                value={formData.department || ""}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                fullWidth
              />
            </ModalFormField>
          )}

          <ModalActions>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </ModalActions>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditUserModal;

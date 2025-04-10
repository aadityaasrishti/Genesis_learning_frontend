import { useState, useEffect } from "react";
import {
  Typography,
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import api from "../../../services/api";
import { User } from "../../../types/types";
import { ClassSelect, SubjectSelect } from "../../Auth/selections";
import { getFeeStructures } from "../../../services/feeService";
import type { FeeStructure } from "../../../types/fees";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalActions,
  StyledTextField,
  ModalFormField,
  InfoBox,
  CloseButton,
} from "../../../theme/StyledComponents";

interface UpgradeModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const UpgradeModal = ({ user, onClose, onSuccess }: UpgradeModalProps) => {
  const [selectedRole, setSelectedRole] = useState(user.role || "");
  const [roleDetails, setRoleDetails] = useState<Record<string, any>>({
    // Common fields
    class_id: user.requested_class || user.class || "",
    class_assigned: user.requested_class || user.class || "",
    subject: user.requested_subjects || user.subjects || "",
    subjects: user.requested_subjects || user.subjects || "",
    guardian_name: user.guardian_name || user.student?.guardian_name || "",
    guardian_mobile: user.student?.guardian_mobile || user.mobile || "",
    department: user.adminSupportStaff?.department || "",
    // Student specific fields
    fee_structure_id: user.student?.fee_structure_id?.toString() || "",
    address: user.student?.address || "",
    date_of_birth:
      user.student?.date_of_birth || new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [isLoadingFeeStructures, setIsLoadingFeeStructures] = useState(false);

  const validRoles = ["teacher", "student", "admin", "support_staff"];

  // Reset form when role changes
  useEffect(() => {
    setErrors({});
  }, [selectedRole]);

  // Fetch fee structures for student role
  useEffect(() => {
    const fetchFeeStructures = async () => {
      if (selectedRole === "student") {
        try {
          setIsLoadingFeeStructures(true);
          const data = await getFeeStructures();
          setFeeStructures(data);
        } catch (error) {
          setApiError("Failed to fetch fee structures");
        } finally {
          setIsLoadingFeeStructures(false);
        }
      }
    };
    fetchFeeStructures();
  }, [selectedRole]);

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedRole) {
      newErrors.role = "Role selection is required";
    }

    switch (selectedRole) {
      case "teacher":
        if (!roleDetails.subject?.trim())
          newErrors.subject = "Subject is required";
        if (!roleDetails.class_assigned?.trim())
          newErrors.class_assigned = "Class assignment is required";
        break;

      case "student":
        if (!roleDetails.class_id?.trim())
          newErrors.class_id = "Class ID is required";
        if (!roleDetails.subjects?.trim())
          newErrors.subjects = "Subjects are required";
        if (!roleDetails.guardian_name?.trim())
          newErrors.guardian_name = "Guardian name is required";
        if (!roleDetails.guardian_mobile?.trim())
          newErrors.guardian_mobile = "Guardian mobile is required";
        if (!roleDetails.fee_structure_id)
          newErrors.fees = "Fee structure is required";
        break;

      case "admin":
      case "support_staff":
        if (!roleDetails.department?.trim())
          newErrors.department = "Department is required";
        if (!roleDetails.salary?.trim())
          newErrors.salary = "Salary is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const classValue =
        selectedRole === "teacher"
          ? roleDetails.class_assigned
          : roleDetails.class_id;
      const subjectValue =
        selectedRole === "teacher" ? roleDetails.subject : roleDetails.subjects;

      // Create a copy of roleDetails without the salary field for teachers
      const { salary, ...otherDetails } = roleDetails;

      const upgradeData = {
        role: selectedRole,
        ...(selectedRole === "teacher" ? otherDetails : roleDetails),
        mobile: user.mobile,
        class: classValue,
        subjects: subjectValue,
        requested_class: user.requested_class || classValue,
        requested_subjects: user.requested_subjects || subjectValue,
      };

      const response = await api.put(
        `/auth/upgrade-user/${user.user_id}`,
        upgradeData
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Upgrade failed");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setApiError(
        err.response?.data?.message || err.message || "Upgrade failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleFields = () => {
    switch (selectedRole) {
      case "teacher":
        return (
          <div>
            <InfoBox>
              <Typography>
                <strong>Current Class:</strong> {user.class || "None"}
              </Typography>
            </InfoBox>
            <InfoBox>
              <Typography>
                <strong>Current Subjects:</strong> {user.subjects || "None"}
              </Typography>
            </InfoBox>
            {user.requested_class && (
              <InfoBox className="highlighted-request">
                <Typography>
                  <strong>Requested Class:</strong> {user.requested_class}
                </Typography>
              </InfoBox>
            )}
            {user.requested_subjects && (
              <InfoBox className="highlighted-request">
                <Typography>
                  <strong>Requested Subjects:</strong> {user.requested_subjects}
                </Typography>
              </InfoBox>
            )}
            <ModalFormField>
              <ClassSelect
                label="Assigned Class"
                value={roleDetails.class_assigned || user.requested_class || ""}
                onChange={(value) =>
                  setRoleDetails((prev) => ({
                    ...prev,
                    class_assigned: value,
                  }))
                }
              />
            </ModalFormField>
            <ModalFormField>
              <SubjectSelect
                label="Subject"
                value={roleDetails.subject || user.requested_subjects || ""}
                onChange={(value) =>
                  setRoleDetails((prev) => ({
                    ...prev,
                    subject: value,
                  }))
                }
                classId={
                  roleDetails.class_assigned || user.requested_class || ""
                }
              />
            </ModalFormField>
          </div>
        );

      case "student":
        return (
          <div>
            {user.requested_class && (
              <InfoBox className="highlighted-request">
                <Typography>
                  <strong>Requested Class:</strong> {user.requested_class}
                </Typography>
              </InfoBox>
            )}
            {user.requested_subjects && (
              <InfoBox className="highlighted-request">
                <Typography>
                  <strong>Requested Subjects:</strong> {user.requested_subjects}
                </Typography>
              </InfoBox>
            )}
            <ModalFormField>
              <ClassSelect
                label="Class ID"
                value={roleDetails.class_id || user.requested_class || ""}
                onChange={(value) =>
                  setRoleDetails((prev) => ({
                    ...prev,
                    class_id: value,
                  }))
                }
              />
            </ModalFormField>
            <ModalFormField>
              <SubjectSelect
                label="Subjects"
                value={roleDetails.subjects || user.requested_subjects || ""}
                onChange={(value) =>
                  setRoleDetails((prev) => ({
                    ...prev,
                    subjects: value,
                  }))
                }
                classId={roleDetails.class_id || user.requested_class || ""}
              />
            </ModalFormField>
            <ModalFormField>
              <StyledTextField
                label="Guardian Name"
                value={roleDetails.guardian_name || ""}
                onChange={(e) =>
                  setRoleDetails((prev) => ({
                    ...prev,
                    guardian_name: e.target.value,
                  }))
                }
                error={!!errors.guardian_name}
                helperText={errors.guardian_name}
                fullWidth
              />
            </ModalFormField>
            <ModalFormField>
              <StyledTextField
                label="Guardian Mobile"
                value={roleDetails.guardian_mobile || ""}
                onChange={(e) =>
                  setRoleDetails((prev) => ({
                    ...prev,
                    guardian_mobile: e.target.value,
                  }))
                }
                error={!!errors.guardian_mobile}
                helperText={errors.guardian_mobile}
                fullWidth
              />
            </ModalFormField>
            <ModalFormField>
              <FormControl fullWidth error={!!errors.fees}>
                <InputLabel>Fee Structure</InputLabel>
                <Select
                  value={roleDetails.fee_structure_id || ""}
                  onChange={(e) => {
                    const selectedStructure = feeStructures.find(
                      (s) => s.id === parseInt(e.target.value as string)
                    );
                    setRoleDetails((prev) => ({
                      ...prev,
                      fee_structure_id: e.target.value,
                      fees: selectedStructure
                        ? selectedStructure.amount.toString()
                        : "",
                    }));
                  }}
                  label="Fee Structure"
                >
                  <MenuItem value="">Select Fee Structure</MenuItem>
                  {feeStructures.map((structure) => (
                    <MenuItem key={structure.id} value={structure.id}>
                      {structure.class_id} -{" "}
                      {structure.subject || "All Subjects"} (₹{structure.amount}
                      )
                    </MenuItem>
                  ))}
                </Select>
                {errors.fees && <FormHelperText>{errors.fees}</FormHelperText>}
                {isLoadingFeeStructures && (
                  <FormHelperText>Loading fee structures...</FormHelperText>
                )}
              </FormControl>
            </ModalFormField>
          </div>
        );

      case "admin":
      case "support_staff":
        return (
          <div>
            <ModalFormField>
              <StyledTextField
                label="Department"
                value={roleDetails.department || ""}
                onChange={(e) =>
                  setRoleDetails((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                error={!!errors.department}
                helperText={errors.department}
                fullWidth
              />
            </ModalFormField>
            <ModalFormField>
              <StyledTextField
                label="Salary"
                type="number"
                value={roleDetails.salary || ""}
                onChange={(e) =>
                  setRoleDetails((prev) => ({
                    ...prev,
                    salary: e.target.value,
                  }))
                }
                error={!!errors.salary}
                helperText={errors.salary}
                fullWidth
              />
            </ModalFormField>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ModalOverlay open={true} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <Typography variant="h5">Upgrade User: {user.name}</Typography>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleUpgrade}>
          <ModalFormField>
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel id="role-select-label">Select Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Select Role"
              >
                <MenuItem value="">Choose a role</MenuItem>
                {validRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() +
                      role.slice(1).replace("_", " ")}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
            </FormControl>
          </ModalFormField>

          {renderRoleFields()}

          <ModalActions>
            <Button variant="outlined" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !selectedRole}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? "Upgrading..." : "Confirm Upgrade"}
            </Button>
          </ModalActions>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UpgradeModal;

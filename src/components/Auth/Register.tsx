import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import api from "../../services/api";
import { ClassSelect, SubjectSelect } from "./selections";

type FormDataType = {
  name: string;
  email: string;
  password: string;
  mobile: string;
  role: string;
  emailOTP: string;
  guardian_name: string;
  guardian_mobile: string;
  class: string;
  subjects: string;
  demo_user_flag: boolean;
  plan_status: string;
};

const Register = () => {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "",
    emailOTP: "",
    guardian_name: "",
    guardian_mobile: "",
    class: "",
    subjects: "",
    demo_user_flag: true,
    plan_status: "demo",
  });

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string>("");
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();

  const steps = ['Basic Information', 'Verify Email', 'Additional Details'];

  const validateBasicInfo = () => {
    const missingFields = [];
    if (!formData.name.trim()) missingFields.push("name");
    if (!formData.email.trim()) missingFields.push("email");
    if (!formData.password.trim()) missingFields.push("password");
    if (!formData.mobile.trim()) missingFields.push("mobile");
    if (!formData.role.trim()) missingFields.push("role");

    if (missingFields.length > 0) {
      const errorMessage = `Please fill in the following fields: ${missingFields.join(", ")}`;
      setError(errorMessage);
      return false;
    }

    // Validate mobile number format
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError("Mobile number must be exactly 10 digits");
      return false;
    }

    setError("");
    return true;
  };

  const validateAdditionalInfo = () => {
    const missingFields = [];
    if (formData.role === "student" || formData.role === "teacher") {
      if (!formData.class?.trim()) missingFields.push("class");
      if (!formData.subjects?.trim()) missingFields.push("subjects");
      if (!formData.guardian_name?.trim()) missingFields.push("guardian name");

      if (formData.role === "student" && !formData.guardian_mobile?.trim()) {
        missingFields.push("guardian mobile");
      }
    }

    if (missingFields.length > 0) {
      const errorMessage = `Please fill in the following fields: ${missingFields.join(", ")}`;
      setError(errorMessage);
      return false;
    }

    setError("");
    return true;
  };

  const handleSendOTP = async (type: 'EMAIL') => {
    try {
      await api.post("/auth/generate-otp", {
        identifier: formData.email,
        type
      });
      setError("");
    } catch (err: any) {
      console.error(`Failed to send ${type} OTP:`, err);
      setError(err.response?.data?.message || `Failed to send ${type} OTP`);
    }
  };

  const handleVerifyOTP = async (type: 'EMAIL') => {
    try {
      await api.post("/auth/verify-otp", {
        identifier: formData.email,
        type,
        code: formData.emailOTP
      });

      setEmailVerified(true);
      setActiveStep(prevStep => prevStep + 1);
      setError("");
    } catch (err: any) {
      console.error(`Failed to verify ${type} OTP:`, err);
      setError(err.response?.data?.message || `Invalid ${type} OTP`);
    }
  };

  const handleNext = () => {
    switch (activeStep) {
      case 0:
        if (validateBasicInfo()) {
          setActiveStep(1);
          handleSendOTP('EMAIL');
        }
        break;
      case 1:
        handleVerifyOTP('EMAIL');
        break;
      case 2:
        if (validateAdditionalInfo()) {
          handleSubmit();
        }
        break;
    }
  };

  const handleBack = () => {
    const newStep = activeStep - 1;
    setActiveStep(newStep);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      if (!emailVerified) {
        setError("Please verify your email before proceeding");
        return;
      }

      const submissionData = {
        ...formData,
        demo_user_flag: true,
        plan_status: "demo",
        emailOTP: formData.emailOTP,
        ...(formData.class && { class: formData.class }),
        ...(formData.subjects && { subjects: formData.subjects }),
        ...(formData.guardian_name && { guardian_name: formData.guardian_name }),
        ...(formData.guardian_mobile && { guardian_mobile: formData.guardian_mobile }),
      };

      await api.post("/auth/register", submissionData);
      navigate("/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message;
      
      if (errorMessage?.includes("Invalid or expired OTPs")) {
        // Handle specific OTP failure
        const invalidOTP = err.response?.data?.invalidOTP;
        if (invalidOTP === "email") {
          setEmailVerified(false);
          setError("Email verification expired. Please verify your email again.");
        } else {
          setEmailVerified(false);
          setError("Verification expired. Please verify your email again.");
        }
        setActiveStep(invalidOTP === "mobile" ? 2 : 1);
      } else {
        setError(errorMessage || "Registration failed. Please check all required fields.");
      }
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              required
              fullWidth
              label="Full Name"
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              required
              fullWidth
              label="Email Address"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <TextField
              required
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <TextField
              required
              fullWidth
              label="Mobile Number"
              type="tel"
              variant="outlined"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />

            <FormControl component="fieldset">
              <FormLabel component="legend">Role</FormLabel>
              <RadioGroup
                row
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <FormControlLabel value="teacher" control={<Radio />} label="Teacher" />
                <FormControlLabel value="student" control={<Radio />} label="Student" />
                <FormControlLabel value="support_staff" control={<Radio />} label="Support Staff" />
              </RadioGroup>
            </FormControl>
          </>
        );

      case 1:
        return (
          <>
            <Typography variant="body1" gutterBottom>
              Enter the verification code sent to your email address: {formData.email}
            </Typography>
            {emailVerified ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Email verified successfully!
              </Alert>
            ) : (
              <>
                <TextField
                  required
                  fullWidth
                  label="Email OTP"
                  variant="outlined"
                  value={formData.emailOTP}
                  onChange={(e) => setFormData({ ...formData, emailOTP: e.target.value })}
                />
                <Button onClick={() => handleSendOTP('EMAIL')}>Resend OTP</Button>
              </>
            )}
          </>
        );

      case 2:
        return (
          <>
            {(formData.role === "teacher" || formData.role === "student") && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Additional Information
                  </Typography>
                </Divider>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <ClassSelect
                    label="Class"
                    value={formData.class || ""}
                    onChange={(value) => setFormData({ ...formData, class: value })}
                  />

                  <SubjectSelect
                    label="Subjects"
                    classId={formData.class || ""}
                    value={formData.subjects || ""}
                    onChange={(value) => setFormData({ ...formData, subjects: value })}
                  />

                  <TextField
                    required
                    fullWidth
                    label="Guardian Name"
                    variant="outlined"
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                  />

                  {formData.role === "student" && (
                    <TextField
                      required
                      fullWidth
                      label="Guardian Mobile"
                      type="tel"
                      variant="outlined"
                      value={formData.guardian_mobile}
                      onChange={(e) => setFormData({ ...formData, guardian_mobile: e.target.value })}
                    />
                  )}
                </Box>
              </Box>
            )}
          </>
        );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", bgcolor: "grey.100", py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleNext(); }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join our learning community today
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
              >
                {activeStep === steps.length - 1 ? 'Create Account' : 'Next'}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link component="button" variant="body2" onClick={() => navigate("/login")}>
                  Log in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;

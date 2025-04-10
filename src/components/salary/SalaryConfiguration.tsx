import React, { useState, useEffect } from "react";
import { 
  Box,  
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Alert,
  MenuItem,
  Typography,
  Grid,
  Card,
  CardContent
} from "@mui/material";
import { SalaryType, TeacherSalaryConfig } from "../../types/salary";
import { salaryService } from "../../services/salaryService";
import api from "../../services/api";

interface ClassRate {
  classId: string;
  rate: number;
}

interface Teacher {
  user_id: number;
  name: string;
  subject: string;
  class_assigned: string;
}

interface ExistingSalaryConfig {
  id: number;
  teacher_id: number;
  salary_type: SalaryType;
  base_amount: number | null;
  class_specific_rates: string | null;
  effective_from: string;
  effective_until: string | null;
}

interface Props {
  teacherId?: number;
  readOnly?: boolean;
}

const SalaryConfiguration: React.FC<Props> = ({ teacherId, readOnly = false }) => {
  // Teacher states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [teacherClasses, setTeacherClasses] = useState<string[]>([]);

  // Existing configuration state
  const [existingConfig, setExistingConfig] = useState<ExistingSalaryConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Salary configuration states
  const [salaryType, setSalaryType] = useState<SalaryType>(SalaryType.FIXED);
  const [baseAmount, setBaseAmount] = useState<string>("");
  const [classRates, setClassRates] = useState<ClassRate[]>([]);
  const [effectiveFrom, setEffectiveFrom] = useState<string>(new Date().toISOString().split("T")[0]);
  const [effectiveUntil, setEffectiveUntil] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        console.log("[Frontend][SalaryConfig] Fetching teachers list");
        const response = await api.get("/salary/teachers");
        setTeachers(response.data);
        console.log("[Frontend][SalaryConfig] Teachers fetched:", response.data.length);
      } catch (err: any) {
        console.error("[Frontend][SalaryConfig] Error fetching teachers:", err);
        setError("Failed to fetch teachers list");
      }
    };

    if (!readOnly) {
      fetchTeachers();
    }
  }, [readOnly]);

  useEffect(() => {
    // Only set selectedTeacher if teacherId is provided and valid
    if (teacherId && teacherId > 0) {
      setSelectedTeacher(teacherId.toString());
    }
  }, [teacherId]);

  // Effect to handle teacher change and class assignments
  useEffect(() => {
    if (selectedTeacher && salaryType === SalaryType.COMMISSION_BASED) {
      // Convert selectedTeacher to number for comparison
      const teacherId = Number(selectedTeacher);
      const teacher = teachers.find((t) => t.user_id === teacherId);

      console.log("[Frontend][SalaryConfig] Teacher found:", {
        teacherId,
        name: teacher?.name,
        rawClassesAssigned: teacher?.class_assigned,
        teacherCount: teachers.length,
        teacherIds: teachers.map(t => t.user_id)
      });

      if (teacher?.class_assigned) {
        const classes = teacher.class_assigned
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
        
        console.log("[Frontend][SalaryConfig] Parsed teacher classes:", {
          teacherId,
          teacherName: teacher.name,
          rawInput: teacher.class_assigned,
          parsedClasses: classes,
          validClassCount: classes.length
        });
        
        if (classes.length > 0) {
          setTeacherClasses(classes);
          
          // Initialize rates from existing config if available
          if (existingConfig?.salary_type === SalaryType.COMMISSION_BASED && existingConfig.class_specific_rates) {
            try {
              const existingRates = JSON.parse(existingConfig.class_specific_rates);
              setClassRates(classes.map((classId) => ({
                classId,
                rate: existingRates[classId] || 0
              })));
            } catch (e) {
              console.error("[Frontend][SalaryConfig] Error parsing existing rates:", e);
              setClassRates(classes.map((classId) => ({ classId, rate: 0 })));
            }
          } else {
            // Initialize with zero rates for new configuration
            setClassRates(classes.map((classId) => ({ classId, rate: 0 })));
          }
          setError("");
        } else {
          setTeacherClasses([]);
          setClassRates([]);
          setError("No valid classes found for teacher");
        }
      } else {
        setTeacherClasses([]);
        setClassRates([]);
        setError("Teacher has no classes assigned");
      }
    } else {
      setTeacherClasses([]);
      setClassRates([]);
    }
  }, [selectedTeacher, salaryType, teachers, existingConfig]);

  useEffect(() => {
    const fetchConfig = async () => {
      if (selectedTeacher && Number(selectedTeacher) > 0) {
        try {
          console.log("[Frontend][SalaryConfig] Fetching configuration for teacher:", selectedTeacher);
          const config = await salaryService.getCurrentSalaryConfig(Number(selectedTeacher));
          console.log("[Frontend][SalaryConfig] Configuration received:", {
            id: config.id,
            type: config.salary_type,
            effectiveFrom: config.effective_from
          });
          
          setExistingConfig({
            ...config,
            effective_from: new Date(config.effective_from).toISOString().split("T")[0],
            effective_until: config.effective_until
              ? new Date(config.effective_until).toISOString().split("T")[0]
              : null,
          });
          setError("");
        } catch (err: any) {
          console.error("[Frontend][SalaryConfig] Error fetching configuration:", {
            error: err.message,
            code: err.code
          });
          if (err.code === "NO_SALARY_CONFIG") {
            setError("No active salary configuration found. Please set up a new configuration.");
          } else if (err.code === "TEACHER_NOT_FOUND") {
            setError("Teacher not found or is no longer active.");
          } else {
            setError(err.message || "An error occurred while fetching the salary configuration");
          }
          setExistingConfig(null);
        }
      } else {
        setExistingConfig(null);
      }
    };

    fetchConfig();
  }, [selectedTeacher]);

  const handleTeacherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSelectedTeacher(e.target.value);
    setBaseAmount("");
    setClassRates([]);
    setError("");
  };

  const handleSalaryTypeChange = (type: SalaryType) => {
    setSalaryType(type);
    setBaseAmount("");
    
    if (type === SalaryType.COMMISSION_BASED && selectedTeacher) {
      const teacher = teachers.find((t) => t.user_id.toString() === selectedTeacher);
      console.log("[Frontend][SalaryConfig] Teacher found:", {
        teacherId: selectedTeacher,
        name: teacher?.name,
        rawClassesAssigned: teacher?.class_assigned
      });

      if (teacher && teacher.class_assigned && teacher.class_assigned.trim()) {
        const classes = teacher.class_assigned
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
        
        console.log("[Frontend][SalaryConfig] Parsed teacher classes:", {
          teacherId: selectedTeacher,
          rawInput: teacher.class_assigned,
          parsedClasses: classes,
          validClassCount: classes.length
        });
        
        if (classes.length > 0) {
          setTeacherClasses(classes);
          
          // Initialize rates from existing config if available
          if (existingConfig?.salary_type === SalaryType.COMMISSION_BASED && existingConfig.class_specific_rates) {
            try {
              const existingRates = JSON.parse(existingConfig.class_specific_rates);
              console.log("[Frontend][SalaryConfig] Using existing rates:", {
                existingRates,
                classCount: Object.keys(existingRates).length
              });
              const rates = classes.map((classId) => ({
                classId,
                rate: existingRates[classId] || 0
              }));
              setClassRates(rates);
            } catch (e) {
              console.error("[Frontend][SalaryConfig] Error parsing existing class rates:", e);
              setClassRates(classes.map((classId) => ({ classId, rate: 0 })));
            }
          } else {
            // Initialize with zero rates for new configuration
            setClassRates(classes.map((classId) => ({ classId, rate: 0 })));
          }
          setError("");
        } else {
          console.log("[Frontend][SalaryConfig] No valid classes found after parsing:", {
            teacherId: selectedTeacher,
            rawInput: teacher.class_assigned
          });
          setError("No valid classes found for teacher");
          setTeacherClasses([]);
          setClassRates([]);
        }
      } else {
        console.log("[Frontend][SalaryConfig] Teacher has no classes assigned:", {
          teacherId: selectedTeacher,
          hasTeacher: !!teacher,
          hasClassAssigned: !!teacher?.class_assigned,
          rawClassAssigned: teacher?.class_assigned
        });
        setError("Teacher has no classes assigned");
        setTeacherClasses([]);
        setClassRates([]);
      }
    } else {
      setTeacherClasses([]);
      setClassRates([]);
      setError("");
    }
  };

  const handleClassRateChange = (classId: string, value: string) => {
    const rate = Number(value);
    if (!validateCommissionRate(rate)) {
      setError("Commission rate must be between 1 and 10,000 per student");
      return;
    }
    setClassRates((prev) =>
      prev.map((cr) => (cr.classId === classId ? { ...cr, rate } : cr))
    );
    setError("");
  };

  const validateCommissionRate = (rate: number): boolean => {
    return rate > 0 && rate <= 10000;
  };

  const validateConfiguration = (): boolean => {
    if (!selectedTeacher) {
      setError("Please select a teacher");
      return false;
    }

    if (!effectiveFrom) {
      setError("Effective from date is required");
      return false;
    }

    const effectiveFromDate = new Date(effectiveFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Allow effectiveFrom to be today or any future date, but not past dates
    if (effectiveFromDate.getTime() < today.getTime()) {
      setError("Effective from date cannot be in the past");
      return false;
    }

    if (effectiveUntil) {
      const effectiveUntilDate = new Date(effectiveUntil);
      effectiveUntilDate.setHours(0, 0, 0, 0);
      
      // Check if effective until is at least one day after effective from
      if (effectiveUntilDate.getTime() <= effectiveFromDate.getTime()) {
        setError("Effective until date must be at least one day after effective from date");
        return false;
      }
    }

    // Validate salary type specific fields
    if (salaryType === SalaryType.FIXED) {
      if (!baseAmount || Number(baseAmount) <= 0) {
        setError("Base amount must be greater than 0");
        return false;
      }
      if (Number(baseAmount) > 1000000) {
        setError("Base amount cannot exceed ₹10,00,000");
        return false;
      }
    } else {
      const invalidRates = classRates.filter(
        (cr) => !cr.rate || !validateCommissionRate(cr.rate)
      );
      if (invalidRates.length > 0) {
        setError(
          "All classes must have valid commission rates (between 1 and 10,000 per student)"
        );
        return false;
      }
    }

    return true;
  };

  const handleEdit = () => {
    if (!existingConfig) return;

    setIsEditing(true);
    setSalaryType(existingConfig.salary_type);

    // Find the teacher's current classes
    const teacher = teachers.find((t) => t.user_id === existingConfig.teacher_id);
    if (teacher && teacher.class_assigned) {
      const classes = teacher.class_assigned
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      setTeacherClasses(classes);

      if (existingConfig.salary_type === SalaryType.COMMISSION_BASED && existingConfig.class_specific_rates) {
        try {
          const existingRates = JSON.parse(existingConfig.class_specific_rates);
          const rateArray = classes.map((classId) => ({
            classId,
            rate: existingRates[classId] || 0
          }));
          setClassRates(rateArray);
        } catch (e) {
          console.error("[Frontend][SalaryConfig] Error parsing class rates:", e);
          // Initialize with zero rates if parsing fails
          const defaultRates = classes.map((classId) => ({
            classId,
            rate: 0
          }));
          setClassRates(defaultRates);
        }
      }
    }

    if (existingConfig.salary_type === SalaryType.FIXED) {
      setBaseAmount(existingConfig.base_amount?.toString() || "");
    }

    setEffectiveFrom(existingConfig.effective_from);
    setEffectiveUntil(existingConfig.effective_until || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    console.log("[Frontend][SalaryConfig] Submitting configuration:", {
      teacherId: selectedTeacher,
      type: salaryType,
      hasBaseAmount: !!baseAmount,
      hasClassRates: classRates.length > 0,
      effectiveFrom,
      effectiveUntil
    });

    if (!validateConfiguration()) {
      setLoading(false);
      return;
    }

    try {
      const classSpecificRates = classRates.reduce((acc, { classId, rate }) => {
        acc[classId.trim()] = rate;
        return acc;
      }, {} as Record<string, number>);

      const config: Partial<TeacherSalaryConfig> = {
        teacher_id: Number(selectedTeacher),
        salary_type: salaryType,
        base_amount:
          salaryType === SalaryType.FIXED ? Number(baseAmount) : undefined,
        class_specific_rates:
          salaryType === SalaryType.COMMISSION_BASED
            ? JSON.stringify(classSpecificRates)
            : undefined,
        effective_from: new Date(effectiveFrom),
        ...(effectiveUntil
          ? { effective_until: new Date(effectiveUntil) }
          : {}),
      };

      await salaryService.setTeacherSalary(config);
      console.log("[Frontend][SalaryConfig] Configuration saved successfully");
      
      setSuccess(
        `Salary configuration successfully updated to ${salaryType.toLowerCase()} type ${
          salaryType === SalaryType.FIXED
            ? `with base amount ₹${baseAmount}`
            : `with commission rates set for ${teacherClasses.length} classes`
        }`
      );

      setSelectedTeacher("");
      setSalaryType(SalaryType.FIXED);
      setBaseAmount("");
      setClassRates([]);
      setEffectiveFrom(new Date().toISOString().split("T")[0]);
      setEffectiveUntil("");
    } catch (err: any) {
      console.error("[Frontend][SalaryConfig] Error saving configuration:", err);
      setError(err.message || "Failed to update salary configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {!readOnly && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <TextField
            select
            label="Select Teacher"
            value={selectedTeacher}
            onChange={(e) => handleTeacherChange(e)}
            required
            disabled={loading}
          >
            <MenuItem value="">Select a teacher</MenuItem>
            {teachers.map((teacher) => (
              <MenuItem key={teacher.user_id} value={teacher.user_id}>
                {teacher.name} - {teacher.subject} ({teacher.class_assigned})
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
      )}

      {existingConfig && !isEditing && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Current Configuration</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography><strong>Type:</strong> {existingConfig.salary_type}</Typography>
              </Grid>
              {existingConfig.salary_type === SalaryType.FIXED ? (
                <Grid item xs={12}>
                  <Typography><strong>Base Amount:</strong> ₹{existingConfig.base_amount}</Typography>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom><strong>Commission Rates:</strong></Typography>
                  {existingConfig.class_specific_rates && (
                    <Box component="ul" sx={{ pl: 2 }}>
                      {Object.entries(JSON.parse(existingConfig.class_specific_rates))
                        .map(([classId, rate]) => (
                          <Typography component="li" key={classId}>
                            Class {classId}: ₹{String(rate)} per student
                          </Typography>
                        ))}
                    </Box>
                  )}
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography>
                  <strong>Effective From:</strong>{" "}
                  {new Date(existingConfig.effective_from).toLocaleDateString()}
                </Typography>
              </Grid>
              {existingConfig.effective_until && (
                <Grid item xs={12}>
                  <Typography>
                    <strong>Effective Until:</strong>{" "}
                    {new Date(existingConfig.effective_until).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
            {!readOnly && (
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={handleEdit}
                  color="primary"
                >
                  Edit Configuration
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {(!existingConfig || isEditing) && !readOnly && (
        <>
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Salary Type</FormLabel>
            <RadioGroup
              row
              value={salaryType}
              onChange={(e) => handleSalaryTypeChange(e.target.value as SalaryType)}
            >
              <FormControlLabel 
                value={SalaryType.FIXED} 
                control={<Radio />} 
                label="Fixed" 
              />
              <FormControlLabel 
                value={SalaryType.COMMISSION_BASED} 
                control={<Radio />} 
                label="Commission Based" 
              />
            </RadioGroup>
          </FormControl>

          {salaryType === SalaryType.FIXED && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Base Amount (₹)"
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                required
                inputProps={{ min: 1, max: 1000000 }}
              />
            </FormControl>
          )}

          {salaryType === SalaryType.COMMISSION_BASED && teacherClasses.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Set Commission Rates per Class</Typography>
              <Grid container spacing={2}>
                {classRates.map((rate) => (
                  <Grid item xs={12} sm={6} md={4} key={rate.classId}>
                    <TextField
                      fullWidth
                      label={`Class ${rate.classId} Commission Rate (₹)`}
                      type="number"
                      value={rate.rate || ""}
                      onChange={(e) => handleClassRateChange(rate.classId, e.target.value)}
                      required
                      inputProps={{ min: 1, max: 10000 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Effective From"
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Effective Until (Optional)"
                type="date"
                value={effectiveUntil}
                onChange={(e) => setEffectiveUntil(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? "Saving..." : isEditing ? "Update Configuration" : "Save Configuration"}
            </Button>
            {isEditing && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setSalaryType(SalaryType.FIXED);
                  setBaseAmount("");
                  setClassRates([]);
                  setEffectiveFrom(new Date().toISOString().split("T")[0]);
                  setEffectiveUntil("");
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default SalaryConfiguration;

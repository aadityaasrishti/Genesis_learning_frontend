import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Paper,
  CircularProgress,
  SelectChangeEvent
} from "@mui/material";
import { PaymentMode, PaymentStatus, SalaryType } from "../../types/salary";
import { salaryService } from "../../services/salaryService";
import api from "../../services/api";

interface Teacher {
  user_id: number;
  name: string;
  subject: string;
  class_assigned: string;
}

// Add interface for commission details
interface ClassCommissionDetail {
  classId: string;
  studentCount: number;
  commissionRate: number;
  totalCommission: number;
  students: {
    name: string;
    subjectCount: number;
    commission: number;
  }[];
}

const SalaryPaymentForm: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState<number | string>("");
  const [paymentMonth, setPaymentMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.CASH);
  const [transactionId, setTransactionId] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [salaryConfig, setSalaryConfig] = useState<any>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        console.log("[Frontend][SalaryPayment] Fetching teachers list");
        const response = await api.get("/salary/teachers");
        setTeachers(response.data);
        console.log("[Frontend][SalaryPayment] Teachers fetched:", response.data.length);
      } catch (err: any) {
        console.error("[Frontend][SalaryPayment] Error fetching teachers:", err);
        setError("Failed to fetch teachers list");
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchSalaryConfig();
    }
  }, [teacherId]);

  const fetchSalaryConfig = async () => {
    try {
      console.log("[Frontend][SalaryPayment] Fetching salary config for teacher:", teacherId);
      const config = await salaryService.getCurrentSalaryConfig(Number(teacherId));
      setSalaryConfig(config);
      console.log("[Frontend][SalaryPayment] Salary config received:", {
        type: config.salary_type,
        baseAmount: config.base_amount,
        hasCommissionRates: !!config.class_specific_rates
      });

      if (config.salary_type === SalaryType.COMMISSION_BASED) {
        calculateCommissionSalary();
      } else {
        setAmount(config.base_amount || 0);
      }
    } catch (err: any) {
      console.error("[Frontend][SalaryPayment] Error fetching salary config:", {
        error: err.message,
        code: err.code
      });
      setSalaryConfig(null);
      setAmount(0);
      setError(err.message || "Failed to fetch salary configuration");
    }
  };

  const checkExistingPayment = async (
    selectedTeacherId: number,
    selectedMonth: string
  ): Promise<boolean> => {
    try {
      console.log("[Frontend][SalaryPayment] Checking existing payment:", {
        teacherId: selectedTeacherId,
        month: selectedMonth
      });

      const [year, month] = selectedMonth.split("-");
      const monthStart = new Date(Number(year), Number(month) - 1, 1);
      const monthEnd = new Date(Number(year), Number(month), 0);

      const payments = await salaryService.getTeacherSalaryHistory(
        selectedTeacherId,
        monthStart,
        monthEnd
      );

      if (payments && payments.length > 0) {
        console.log("[Frontend][SalaryPayment] Found existing payment for month");
        setError("A payment for this month already exists");
        setAmount(0);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[Frontend][SalaryPayment] Error checking existing payments:", err);
      return false;
    }
  };

  const handleTeacherChange = async (event: SelectChangeEvent<number | string>) => {
    const newTeacherId = Number(event.target.value);
    console.log("[Frontend][SalaryPayment] Teacher changed:", newTeacherId);
    
    if (paymentMonth && newTeacherId) {
      const hasExistingPayment = await checkExistingPayment(
        newTeacherId,
        paymentMonth
      );
      if (hasExistingPayment) {
        setTeacherId("");
        return;
      }
    }
    setTeacherId(newTeacherId);
    setSalaryConfig(null);
    setAmount(0);
    setError("");
  };

  const handlePaymentMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMonth(e.target.value);
    if (salaryConfig?.salary_type === SalaryType.COMMISSION_BASED) {
      calculateCommissionSalary();
    }
  };

  const calculateCommissionSalary = async () => {
    try {
      if (!teacherId) {
        setError("Please select a teacher first");
        return;
      }

      console.log("[Frontend][SalaryPayment] Calculating commission:", {
        teacherId,
        month: paymentMonth
      });

      const result = await salaryService.calculateCommission(
        Number(teacherId),
        new Date(paymentMonth)
      );

      console.log("[Frontend][SalaryPayment] Commission calculated:", {
        amount: result.calculatedAmount,
        totalStudents: result.commissionDetails.totalStudentCount,
        classDetails: result.commissionDetails.classDetails.map((detail: ClassCommissionDetail) => ({
          classId: detail.classId,
          studentCount: detail.studentCount,
          commissionRate: detail.commissionRate,
          totalCommission: detail.totalCommission,
          students: detail.students.map((student) => ({
            name: student.name,
            subjectCount: student.subjectCount,
            commission: student.commission
          }))
        }))
      });

      setAmount(result.calculatedAmount);
      setError("");
    } catch (err: any) {
      console.error("[Frontend][SalaryPayment] Error calculating commission:", {
        error: err.message,
        code: err.code
      });
      const errorMessage =
        err.code === "NO_ACTIVE_COMMISSION_CONFIG"
          ? "No active commission-based salary configuration found. Please set up a commission configuration first."
          : err.message || "Failed to calculate commission-based salary";
      setError(errorMessage);
      setAmount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    console.log("[Frontend][SalaryPayment] Submitting payment:", {
      teacherId,
      amount,
      month: paymentMonth,
      paymentMode
    });

    try {
      if (!validatePayment()) {
        setLoading(false);
        return;
      }

      let commissionDetails;
      if (salaryConfig.salary_type === SalaryType.COMMISSION_BASED) {
        const result = await salaryService.calculateCommission(
          Number(teacherId),
          new Date(paymentMonth)
        );
        commissionDetails = result.commissionDetails;
      }

      const payment = {
        teacher_id: Number(teacherId),
        salary_id: salaryConfig.id,
        amount: amount,
        month: new Date(paymentMonth),
        payment_date: new Date(paymentDate),
        payment_mode: paymentMode,
        payment_status: PaymentStatus.PAID,
        transaction_id: transactionId || undefined,
        remarks: remarks || undefined,
        commission_details: commissionDetails
      };

      await salaryService.processSalaryPayment(payment);
      console.log("[Frontend][SalaryPayment] Payment processed successfully");
      
      setSuccess("Salary payment processed successfully");

      // Reset form
      setAmount(0);
      setTransactionId("");
      setRemarks("");
    } catch (err: any) {
      console.error("[Frontend][SalaryPayment] Error processing payment:", err);
      setError(err.message || "Failed to process salary payment");
    } finally {
      setLoading(false);
    }
  };

  const validatePayment = () => {
    const errors: string[] = [];

    if (!teacherId) {
      errors.push("Teacher is required");
    }

    if (!paymentMonth) {
      errors.push("Payment month is required");
    } else {
      const selectedMonth = new Date(paymentMonth);
      const currentDate = new Date();
      if (selectedMonth > currentDate) {
        errors.push("Cannot process payment for future months");
      }
    }

    if (!amount || amount <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (amount > 1000000) {
      errors.push("Amount exceeds maximum limit of ₹10,00,000");
    }

    if (["ONLINE", "BANK_TRANSFER", "UPI"].includes(paymentMode) && !transactionId.trim()) {
      errors.push("Transaction ID is required for online payments");
    }

    if (errors.length > 0) {
      setError(errors.join(". "));
      return false;
    }

    return true;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        Process Salary Payment
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Teacher</InputLabel>
                <Select
                  value={teacherId}
                  label="Select Teacher"
                  onChange={handleTeacherChange}
                  required
                >
                  <MenuItem value="">
                    <em>Select a teacher</em>
                  </MenuItem>
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.user_id} value={teacher.user_id}>
                      {teacher.name} - {teacher.subject} ({teacher.class_assigned})
                    </MenuItem>
                  ))}
                </Select>
                {!salaryConfig && teacherId && !error && (
                  <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                    Fetching salary configuration...
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Month"
                type="month"
                value={paymentMonth}
                onChange={handlePaymentMonthChange}
                required
                inputProps={{
                  max: new Date().toISOString().split("T")[0].substring(0, 7)
                }}
                InputLabelProps={{ shrink: true }}
              />
              {salaryConfig && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  Valid range:{" "}
                  {new Date(salaryConfig.effective_from).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long" }
                  )}
                  {salaryConfig.effective_until
                    ? ` to ${new Date(
                        salaryConfig.effective_until
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}`
                    : " onwards"}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount (₹)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                inputProps={{ min: 0, max: 1000000 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  value={paymentMode}
                  label="Payment Mode"
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                >
                  {Object.values(PaymentMode).map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required={["ONLINE", "BANK_TRANSFER", "UPI"].includes(paymentMode)}
                helperText={
                  ["ONLINE", "BANK_TRANSFER", "UPI"].includes(paymentMode)
                    ? "Transaction ID is required for online payments"
                    : undefined
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : (
                  "Process Payment"
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default SalaryPaymentForm;

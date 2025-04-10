import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  TablePagination,
  Grid,
  Container
} from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from "../../context/AuthContext";
import { salaryService } from "../../services/salaryService";
import { downloadSalaryReceipt } from "../../utils/pdfUtils";
import { getSchoolInfo } from "../../utils/schoolUtils";
import api from "../../services/api";
import { PaymentStatus, PaymentMode, SalaryType, CommissionDetails } from "../../types/salary";

interface Teacher {
  user_id: number;
  name: string;
  subject: string;
  class_assigned: string;
}

interface SalaryPayment {
  id: number;
  teacher_id: number;
  salary_id: number;  payment_date: string;
  month: string;
  amount: number;
  payment_mode: PaymentMode;
  commission_details?: CommissionDetails;
  teacher_salary: {
    id: number;
    teacher_id: number;
    salary_type: SalaryType;
    effective_from: Date;
    created_at: Date;
    updated_at: Date;
  };
  payment_status: PaymentStatus;
  transaction_id?: string;
  teacher?: {
    name: string;
  };
}

const SalaryHistory: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState<number | "">(user?.role === "teacher" ? user.user_id : "");
  const [downloadingPaymentId, setDownloadingPaymentId] = useState<number | null>(null);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Date range states with 6 months default
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Fetch teachers list for admin
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get("/salary/teachers");
        setTeachers(response.data);
      } catch (err: any) {
        setError("Failed to fetch teachers list");
        console.error("Error fetching teachers:", err);
      }
    };

    if (isAdmin) {
      fetchTeachers();
    }
  }, [isAdmin]);

  // Auto-fetch for teacher role
  useEffect(() => {
    if (!isAdmin && user?.user_id) {
      setTeacherId(user.user_id);
      fetchSalaryHistory(user.user_id);
    }
  }, [user, isAdmin]);

  // Fetch when date range changes
  useEffect(() => {
    if (teacherId) {
      fetchSalaryHistory(Number(teacherId));
    }
  }, [startDate, endDate, teacherId]);

  const fetchSalaryHistory = async (teacherId: number) => {
    try {
      setLoading(true);
      setError("");

      // Validate date range
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Please select valid date range");
      }

      if (start > end) {
        throw new Error("Start date cannot be after end date");
      }

      if (end > new Date()) {
        throw new Error("End date cannot be in the future");
      }

      const history = await salaryService.getTeacherSalaryHistory(teacherId, start, end);

      if (!history || history.length === 0) {
        setPayments([]);
        setError("No salary records found for the selected period");
        return;
      }

      setPayments(history);
      setPage(0); // Reset to first page when new data is loaded
    } catch (err: any) {
      setPayments([]);
      setError(err.message || "Failed to fetch salary history");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = (event: SelectChangeEvent<number | string>) => {
    const newTeacherId = event.target.value as number;
    if (newTeacherId) {
      setTeacherId(Number(newTeacherId));
      setError(""); // Clear any previous errors
      fetchSalaryHistory(Number(newTeacherId));
    } else {
      setTeacherId("");
      setPayments([]);
    }
  };

  const handleDownloadReceipt = async (payment: SalaryPayment) => {
    try {
      setDownloadingPaymentId(payment.id);
      setError("");      await downloadSalaryReceipt({
        ...payment,
        teacherInfo: { name: payment.teacher?.name || 'Unknown Teacher' }
      }, getSchoolInfo());
    } catch (error: any) {
      console.error("Error downloading receipt:", error);
      setError(error.message || "Failed to download receipt");
    } finally {
      setDownloadingPaymentId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Salary Payment History</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {isAdmin && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Teacher</InputLabel>
                <Select
                  value={teacherId}
                  label="Select Teacher"
                  onChange={handleTeacherChange}
                >
                  <MenuItem value="">
                    <em>Select a teacher</em>
                  </MenuItem>
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.user_id} value={teacher.user_id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} md={isAdmin ? 4 : 6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={isAdmin ? 4 : 6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : payments.length > 0 ? (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Payment Date</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment Mode</TableCell>
                    <TableCell>Salary Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((payment) => (
                      <TableRow key={payment.id} hover>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(payment.month).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.payment_mode.replace(/_/g, " ")}</TableCell>
                        <TableCell>{payment.teacher_salary.salary_type}</TableCell>
                        <TableCell>{payment.payment_status}</TableCell>
                        <TableCell>{payment.transaction_id || "-"}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Download Receipt">
                            <IconButton
                              onClick={() => handleDownloadReceipt(payment)}
                              disabled={downloadingPaymentId === payment.id}
                              size="small"
                            >
                              {downloadingPaymentId === payment.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <DownloadIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={payments.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
            No payment records found. {!teacherId && isAdmin ? "Please select a teacher." : "Try different search criteria."}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default SalaryHistory;

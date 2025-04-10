import React, { useState, useEffect } from "react";
import { getFeeReports } from "../../../services/feeService";
import LoadingSpinner from "../../Common/LoadingSpinner";
import AlertMessage from "../../Common/AlertMessage";
import ExportButton from "../../Common/ExportButton";
import {
  formatCurrency,
  getPaymentModeLabel,
} from "../../../utils/feeUtils";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  styled,
  SelectChangeEvent,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const FiltersContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  '& > *': {
    minWidth: 200,
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%',
    },
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  '&.paid': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    borderColor: theme.palette.success.main,
  },
  '&.partially-paid': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
    borderColor: theme.palette.warning.main,
  },
  '&.pending': {
    backgroundColor: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main,
    borderColor: theme.palette.info.main,
  },
  '&.overdue': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
  },
}));

const ReportSummary = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const FilterSummary = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
  '& strong': {
    color: theme.palette.text.primary,
  },
}));

const TableWrapper = styled(Paper)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

interface PaymentWithDetails {
  id: number;
  receipt_number: string;
  amount_paid: number;
  payment_mode: string;
  payment_status: string;
  payment_date: string;
  student_id: number;
  student: {
    user: {
      name: string;
    };
    class_id: string;
  };
}

interface FeeReport {
  totalAmount: number;
  totalPayments: number;
  payments: PaymentWithDetails[];
}

interface FilterState {
  start_date: string;
  end_date: string;
  class_id: string;
  payment_mode: string;
  payment_status: string;
}

const FeeReports: React.FC = () => {
  const [report, setReport] = useState<FeeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    start_date: "",
    end_date: "",
    class_id: "",
    payment_mode: "",
    payment_status: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateReport();
  }, [filters]);

  const generateReport = async () => {
    console.log("[FeeReports] Generating report with filters:", filters);
    try {
      setLoading(true);
      const data = await getFeeReports(filters);
      console.log("[FeeReports] Report generated successfully:", {
        totalAmount: data.totalAmount,
        totalPayments: data.totalPayments,
        paymentCount: data.payments?.length || 0
      });
      setReport(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate report";
      console.error("[FeeReports] Error generating report:", {
        error: errorMessage,
        filters,
        timestamp: new Date().toISOString()
      });
      setError("Failed to generate report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[FeeReports] Text input changed:", {
      field: e.target.name,
      value: e.target.value
    });
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const getExportData = () => {
    if (!report) return [];
    return report.payments.map((payment) => ({
      "Receipt No": payment.receipt_number || "",
      "Student Name": payment.student?.user?.name || "",
      "Class": payment.student?.class_id || "",
      "Amount": payment.amount_paid.toString(), // Export raw number instead of formatted currency
      "Payment Mode": getPaymentModeLabel(payment.payment_mode),
      "Status": payment.payment_status,
      "Date": new Date(payment.payment_date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }));
  };

  const getExportHeaders = () => [
    "Receipt No",
    "Student Name",
    "Class",
    "Amount",
    "Payment Mode",
    "Status",
    "Date"
  ];

  const getFilterSummary = () => {
    const parts = [
      filters.start_date && filters.end_date
        ? `Period: ${filters.start_date} to ${filters.end_date}`
        : "",
      filters.class_id ? `Class: ${filters.class_id}` : "",
      filters.payment_mode
        ? `Payment Mode: ${getPaymentModeLabel(filters.payment_mode)}`
        : "",
      filters.payment_status ? `Status: ${filters.payment_status}` : "",
    ].filter(Boolean);
    return parts.join(" | ");
  };

  return (
    <Container>
      <FiltersContainer>
        <TextField
          type="date"
          name="start_date"
          label="Start Date"
          value={filters.start_date}
          onChange={handleTextInputChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          name="end_date"
          label="End Date"
          value={filters.end_date}
          onChange={handleTextInputChange}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl>
          <InputLabel>Class</InputLabel>
          <Select
            value={filters.class_id}
            onChange={handleSelectChange}
            name="class_id"
            label="Class"
          >
            <MenuItem value="">All Classes</MenuItem>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
              <MenuItem key={num} value={`Class ${num}`}>
                Class {num}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Payment Mode</InputLabel>
          <Select
            value={filters.payment_mode}
            onChange={handleSelectChange}
            name="payment_mode"
            label="Payment Mode"
          >
            <MenuItem value="">All Modes</MenuItem>
            <MenuItem value="CASH">Cash</MenuItem>
            <MenuItem value="CHEQUE">Cheque</MenuItem>
            <MenuItem value="ONLINE">Online</MenuItem>
            <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.payment_status}
            onChange={handleSelectChange}
            name="payment_status"
            label="Status"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="PAID">Paid</MenuItem>
            <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="OVERDUE">Overdue</MenuItem>
          </Select>
        </FormControl>
      </FiltersContainer>

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <LoadingSpinner size="large" />
        </Box>
      ) : report ? (
        <>
          <ReportSummary>
            <FilterSummary variant="body2">
              {getFilterSummary()}
            </FilterSummary>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Typography variant="h6">
                Total Amount: {formatCurrency(report.totalAmount)}
              </Typography>
              <Typography variant="h6">
                Total Payments: {report.totalPayments}
              </Typography>
            </Box>
          </ReportSummary>

          <Box sx={{ mb: 2 }}>
            <ExportButton
              data={getExportData()}
              headers={getExportHeaders()}
              filename={`fee-report-${new Date().toISOString().split("T")[0]}`}
              format="csv"
              buttonText="Export Report"
            />
          </Box>

          <TableWrapper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Receipt No</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.receipt_number}</TableCell>
                      <TableCell>{payment.student.user.name}</TableCell>
                      <TableCell>{payment.student.class_id}</TableCell>
                      <TableCell>{formatCurrency(payment.amount_paid)}</TableCell>
                      <TableCell>{getPaymentModeLabel(payment.payment_mode)}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={payment.payment_status}
                          className={payment.payment_status.toLowerCase().replace('_', '-')}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TableWrapper>
        </>
      ) : (
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          sx={{ mt: 3 }}
        >
          No report data available. Please adjust your filters and try again.
        </Typography>
      )}
    </Container>
  );
};

export default FeeReports;

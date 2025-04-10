import React, { useState, useEffect, useMemo } from "react";
import {
  getAllPayments,
  getFeeStructures,
  processFeePayment,
  processFeeRefund,
  sendFeeReminder,
  getStudentsByClass,
  PaymentType,
  getStudentFeeDetailsById,
} from "../../../services/feeService";
import LoadingSpinner from "../../Common/LoadingSpinner";
import ConfirmationModal from "../../Common/ConfirmationModal";
import PaymentReceiptModal from "../../student/PaymentReceiptModal";
import ExportButton from "../../Common/ExportButton";
import {
  formatCurrency,
  getPaymentModeLabel,
  validatePaymentAmount,
} from "../../../utils/feeUtils";
import type { FeePayment, FeeStructure } from "../../../types/fees";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  styled,
  alpha,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const FiltersContainer = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(8px)',
}));

const FilterGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  alignItems: 'center',
  '& > *': {
    minWidth: 200,
    maxWidth: 250,
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%',
    },
  },
  '& input[type="date"]': {
    minWidth: 150,
  },
}));

const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
  '& button': {
    whiteSpace: 'nowrap',
  },
}));

const StyledTableContainer = styled(Box)(({ theme }) => ({
  overflowX: 'auto',
  '& table': {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    '& th': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      padding: theme.spacing(1.5),
      fontWeight: 600,
    },
    '& td': {
      padding: theme.spacing(1.5),
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '& tr:hover td': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
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

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    width: '90%',
    maxWidth: 600,
    animation: `fadeIn 0.3s ease-out`,
  },
});

const FormContainer = styled(Box)(({ theme }) => ({
  '& .MuiFormControl-root': {
    marginBottom: theme.spacing(2),
  },
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  '& > *': {
    flex: 1,
    minWidth: 'max-content',
    whiteSpace: 'nowrap',
  },
}));

type PaymentMode = FeePayment["payment_mode"];
type PaymentStatus = FeePayment["payment_status"];

interface FormData {
  class_id: string;
  student_id: string;
  fee_structure_id: string;
  amount_paid: string;
  payment_mode: PaymentMode;
  transaction_id: string;
  discount_amount: string;
  discount_reason: string;
  month: string;
}

interface Student {
  student_id: number;
  name: string;
  fee_structure?: {
    id: number;
    amount: number;
    payment_type: PaymentType;
    subject: string | null;
    class_id: string;
  };
}

const FeePayments: React.FC = () => {
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState<number | null>(null);
  const [paymentToRefund, setPaymentToRefund] = useState<FeePayment | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState<FormData>({
    class_id: "",
    student_id: "",
    fee_structure_id: "",
    amount_paid: "",
    payment_mode: "CASH",
    transaction_id: "",
    discount_amount: "",
    discount_reason: "",
    month: "",
  });
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    paymentMode: "",
    paymentStatus: "",
    searchTerm: "",
    class_id: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeeStructures();
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    console.log("[FeePayments] Fetching all payments");
    try {
      setLoading(true);
      const data = await getAllPayments();
      console.log("[FeePayments] Successfully fetched payments:", {
        count: data.length,
        totalAmount: data.reduce((sum: number, p: FeePayment) => sum + p.amount_paid, 0)
      });
      setPayments(data);
    } catch (error) {
      console.error("[FeePayments] Failed to fetch payments:", {
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeStructures = async () => {
    console.log("[FeePayments] Fetching fee structures");
    try {
      const data = await getFeeStructures();
      // Filter out expired structures and sort by class and validity
      const validStructures = data
        .filter((s: FeeStructure) => !s.valid_until || new Date(s.valid_until) >= new Date())
        .sort((a: FeeStructure, b: FeeStructure) => {
          const classCompare = a.class_id.localeCompare(b.class_id);
          if (classCompare !== 0) return classCompare;
          return new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime();
        });
      
      setStructures(validStructures);
      console.log("[FeePayments] Successfully fetched fee structures:", {
        total: data.length,
        valid: validStructures.length
      });
    } catch (error) {
      console.error("[FeePayments] Failed to fetch fee structures:", {
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = async (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    if (name === "student_id" && value) {
      console.log("[FeePayments] Student selected:", { studentId: value });
      try {
        // Fetch complete student details including payment history and assigned fee structure
        const studentDetails = await getStudentFeeDetailsById(parseInt(value));
        console.log("[FeePayments] Retrieved complete student details:", {
          studentId: value,
          payments: studentDetails.payments,
          summary: studentDetails.summary,
          feeStructure: studentDetails.fee_structure
        });
        
        if (studentDetails.fee_structure) {
          const { id, amount, payment_type } = studentDetails.fee_structure;
          setFormData(prev => ({
            ...prev,
            [name]: value,
            fee_structure_id: id.toString(),
            amount_paid: amount.toString()
          }));
          console.log("[FeePayments] Using assigned fee structure:", {
            feeStructureId: id,
            amount,
            paymentType: payment_type
          });
        } else {
          // If no assigned fee structure, clear the fee structure selection
          setFormData(prev => ({
            ...prev,
            [name]: value,
            fee_structure_id: "",
            amount_paid: ""
          }));
          console.warn("[FeePayments] No fee structure assigned to student");
        }
      } catch (error) {
        console.error("[FeePayments] Error handling student selection:", {
          studentId: value,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === "fee_structure_id" && value) {
      // Update amount when fee structure changes
      const selectedStructure = structures.find(s => s.id.toString() === value);
      if (selectedStructure) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          amount_paid: selectedStructure.amount.toString()
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentModeChange = (e: SelectChangeEvent<PaymentMode>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassChange = async (e: SelectChangeEvent<string>) => {
    const classId = e.target.value;
    console.log("[FeePayments] Class selection changed:", { classId });
    
    // Reset student and fee structure when class changes
    setFormData((prev) => ({
      ...prev,
      class_id: classId,
      student_id: "",
      fee_structure_id: "",
      amount_paid: ""
    }));

    if (classId) {
      try {
        const students = await getStudentsByClass(classId);
        console.log("[FeePayments] Retrieved students for class:", {
          classId,
          studentCount: students.length
        });
        setStudents(students);
      } catch (error) {
        console.error("[FeePayments] Error fetching students for class:", {
          classId,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        setStudents([]);
      }
    } else {
      setStudents([]);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[FeePayments] Processing new payment:", {
      studentId: formData.student_id,
      amount: formData.amount_paid,
      paymentMode: formData.payment_mode
    });
    
    try {
      setLoading(true);
      setError(null);

      // Validate month
      const selectedMonth = new Date(formData.month + "-01");
      const today = new Date();
      if (selectedMonth > today) {
        throw new Error("Payment month cannot be in the future");
      }

      const selectedStructure = structures.find(
        (s) => s.id === parseInt(formData.fee_structure_id)
      );

      if (!selectedStructure) {
        throw new Error("Invalid fee structure selected");
      }

      const amountPaid = parseFloat(formData.amount_paid);
      const discountAmount = formData.discount_amount
        ? parseFloat(formData.discount_amount)
        : 0;
      const totalPayment = amountPaid + discountAmount;

      // Enhanced payment validation
      if (amountPaid <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      if (totalPayment > selectedStructure.amount) {
        throw new Error("Total payment cannot exceed fee structure amount");
      }

      if (!validatePaymentAmount(amountPaid, selectedStructure.amount)) {
        throw new Error("Invalid payment amount");
      }

      // If payment mode requires transaction ID, validate it
      if (["ONLINE", "BANK_TRANSFER", "UPI"].includes(formData.payment_mode) && !formData.transaction_id) {
        throw new Error("Transaction ID is required for " + formData.payment_mode + " payments");
      }

      const paymentStatus: PaymentStatus =
        totalPayment >= selectedStructure.amount ? "PAID" : "PARTIALLY_PAID";

      const paymentData = {
        student_id: parseInt(formData.student_id),
        fee_structure_id: parseInt(formData.fee_structure_id),
        amount_paid: amountPaid,
        payment_date: new Date().toISOString(),
        payment_mode: formData.payment_mode,
        payment_status: paymentStatus,
        transaction_id: formData.transaction_id || undefined,
        discount_amount: discountAmount || undefined,
        discount_reason: formData.discount_reason || undefined,
        month: new Date(formData.month + "-01").toISOString(),
      };

      await processFeePayment(paymentData);
      console.log("[FeePayments] Payment processed successfully:", {
        studentId: paymentData.student_id,
        amount: paymentData.amount_paid,
        status: paymentStatus,
        paymentMode: paymentData.payment_mode
      });
      setIsModalOpen(false);
      fetchPayments();
      setFormData({
        class_id: "",
        student_id: "",
        fee_structure_id: "",
        amount_paid: "",
        payment_mode: "CASH",
        transaction_id: "",
        discount_amount: "",
        discount_reason: "",
        month: "",
      });
    } catch (error) {
      console.error("[FeePayments] Payment processing failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        formData
      });
      setError(error instanceof Error ? error.message : "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const handleRefundClick = (payment: FeePayment) => {
    console.log("[FeePayments] Initiating refund process:", {
      paymentId: payment.id,
      receiptNumber: payment.receipt_number,
      amount: payment.amount_paid
    });
    setPaymentToRefund(payment);
    setRefundAmount(payment.amount_paid.toString());
    setIsConfirmModalOpen(true);
  };

  const handleRefundConfirm = async () => {
    if (!paymentToRefund) return;

    console.log("[FeePayments] Processing refund:", {
      paymentId: paymentToRefund.id,
      receiptNumber: paymentToRefund.receipt_number,
      refundAmount
    });
    try {
      setProcessingPaymentId(paymentToRefund.id);
      await processFeeRefund(
        paymentToRefund.id,
        parseFloat(refundAmount),
        "Refund requested by admin"
      );
      console.log("[FeePayments] Refund processed successfully:", {
        paymentId: paymentToRefund.id,
        amount: refundAmount
      });
      fetchPayments();
    } catch (error) {
      console.error("[FeePayments] Refund processing failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        paymentId: paymentToRefund.id
      });
    } finally {
      setProcessingPaymentId(null);
      setIsConfirmModalOpen(false);
      setPaymentToRefund(null);
    }
  };

  const handleReminder = async (studentId: number, paymentId: number) => {
    console.log("[FeePayments] Sending payment reminder:", {
      studentId,
      paymentId
    });
    try {
      setProcessingPaymentId(paymentId);
      await sendFeeReminder(studentId, {
        student_id: studentId,
        payment_id: paymentId,
        reminder_type: "DUE_DATE",
        message: "Your fee payment is due. Please clear the pending amount.",
      });
      console.log("[FeePayments] Payment reminder sent successfully:", {
        studentId,
        paymentId
      });
    } catch (error) {
      console.error("[FeePayments] Failed to send payment reminder:", {
        error: error instanceof Error ? error.message : "Unknown error",
        studentId,
        paymentId
      });
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleViewReceipt = (payment: FeePayment) => {
    console.log("[FeePayments] Viewing payment receipt:", {
      paymentId: payment.id,
      receiptNumber: payment.receipt_number,
      studentId: payment.student_id
    });
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    console.log("[FeePayments] Applying filters:", filters);
    // Filter logic is already handled in the filteredPayments memo
    // This function is called when the Search button is clicked
    // We can use it to validate date ranges
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      if (start > end) {
        setError("Start date cannot be after end date");
        return;
      }
    }
    setError(null);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const paymentDate = new Date(payment.payment_date);
      const matchesDateRange =
        (!filters.startDate || paymentDate >= new Date(filters.startDate)) &&
        (!filters.endDate || paymentDate <= new Date(filters.endDate));
      const matchesPaymentMode =
        !filters.paymentMode || payment.payment_mode === filters.paymentMode;
      const matchesPaymentStatus =
        !filters.paymentStatus ||
        payment.payment_status === filters.paymentStatus;
      const matchesSearch =
        !filters.searchTerm ||
        payment.student.user.name
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        payment.receipt_number
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase());

      return (
        matchesDateRange &&
        matchesPaymentMode &&
        matchesPaymentStatus &&
        matchesSearch
      );
    });
  }, [payments, filters]);

  const getExportData = () => {
    return filteredPayments.map((payment) => {
      const totalAmount = payment.amount_paid + (payment.discount_amount || 0);
      const fullAmount = payment.fee_structure?.amount || 0;

      return {
        "Receipt No": payment.receipt_number || "",
        "Student Name": payment.student?.user?.name || "",
        Class: payment.student?.class_id || "",
        "Full Amount": formatCurrency(fullAmount),
        "Amount Paid": formatCurrency(payment.amount_paid),
        Discount: payment.discount_amount
          ? formatCurrency(payment.discount_amount)
          : "",
        "Total Amount": formatCurrency(totalAmount),
        "Payment Mode": getPaymentModeLabel(payment.payment_mode),
        Status: payment.payment_status,
        "Transaction ID": payment.transaction_id || "",
        "Discount Reason": payment.discount_reason || "",
        Month: payment.month || "",
        Date: new Date(payment.payment_date).toLocaleDateString(),
      };
    });
  };

  const getExportHeaders = () => [
    "Receipt No",
    "Student Name",
    "Class",
    "Full Amount",
    "Amount Paid",
    "Discount",
    "Total Amount",
    "Payment Mode",
    "Status",
    "Transaction ID",
    "Discount Reason",
    "Remarks",
    "Date",
    "Due Date",
  ];

  return (
    <Box>
      <HeaderActions>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
        >
          Process New Payment
        </Button>
        <ExportButton
          data={getExportData()}
          headers={getExportHeaders()}
          filename={`fee-payments-${new Date().toISOString().split("T")[0]}`}
          format="csv"
          buttonText="Export as CSV"
        />
      </HeaderActions>

      <FiltersContainer>
        <FilterGroup>
          <TextField
            name="searchTerm"
            label="Search"
            value={filters.searchTerm}
            onChange={handleTextChange}
            placeholder="Search by name or receipt"
          />
          
          <FormControl>
            <InputLabel>Class</InputLabel>
            <Select
              value={filters.class_id}
              onChange={handleFilterSelectChange}
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
              value={filters.paymentMode}
              onChange={handleFilterSelectChange}
              name="paymentMode"
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
              value={filters.paymentStatus}
              onChange={handleFilterSelectChange}
              name="paymentStatus"
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="OVERDUE">Overdue</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={applyFilters}
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </FilterGroup>
      </FiltersContainer>

      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {loading && !payments.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <LoadingSpinner size="large" />
        </Box>
      ) : (
        <StyledTableContainer>
          <table>
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Student</th>
                <th>Class</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.receipt_number}</td>
                  <td>{payment.student.user.name}</td>
                  <td>{payment.student.class_id}</td>
                  <td>{formatCurrency(payment.amount_paid)}</td>
                  <td>{getPaymentModeLabel(payment.payment_mode)}</td>
                  <td>
                    <StatusChip
                      label={payment.payment_status}
                      className={payment.payment_status.toLowerCase().replace('_', '-')}
                      variant="outlined"
                      size="small"
                    />
                  </td>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>
                    <ButtonGroup>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewReceipt(payment)}
                      >
                        View Receipt
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => handleReminder(payment.student_id, payment.id)}
                        disabled={processingPaymentId === payment.id}
                      >
                        {processingPaymentId === payment.id ? (
                          <>
                            <LoadingSpinner size="small" />
                            Sending...
                          </>
                        ) : (
                          "Remind"
                        )}
                      </Button>
                      {payment.payment_status !== "CANCELLED" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleRefundClick(payment)}
                          disabled={processingPaymentId === payment.id}
                        >
                          {processingPaymentId === payment.id ? (
                            <>
                              <LoadingSpinner size="small" />
                              Processing...
                            </>
                          ) : (
                            "Refund"
                          )}
                        </Button>
                      )}
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </StyledTableContainer>
      )}

      <StyledDialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md">
        <DialogTitle>Process New Payment</DialogTitle>
        <DialogContent>
          <FormContainer component="form" onSubmit={handlePaymentSubmit}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={formData.class_id}
                onChange={handleClassChange}
                name="class_id"
                required
                label="Class"
              >
                <MenuItem value="">Select Class</MenuItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <MenuItem key={num} value={`Class ${num}`}>
                    Class {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select
                value={formData.student_id}
                onChange={handleSelectChange}
                name="student_id"
                required
                label="Student"
                disabled={!formData.class_id}
              >
                <MenuItem value="">Select Student</MenuItem>
                {students.map((student) => (
                  <MenuItem key={student.student_id} value={student.student_id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Fee Structure</InputLabel>
              <Select
                value={formData.fee_structure_id}
                onChange={handleSelectChange}
                name="fee_structure_id"
                required
                label="Fee Structure"
              >
                <MenuItem value="">Select Fee Structure</MenuItem>
                {structures
                  .sort((a, b) => {
                    const selectedStudent = students.find(
                      (s) => s.student_id.toString() === formData.student_id
                    );
                    const aIsAssigned = selectedStudent?.fee_structure?.id === a.id;
                    const bIsAssigned = selectedStudent?.fee_structure?.id === b.id;
                    if (aIsAssigned && !bIsAssigned) return -1;
                    if (!aIsAssigned && bIsAssigned) return 1;
                    return a.class_id.localeCompare(b.class_id);
                  })
                  .map((structure) => {
                    const selectedStudent = students.find(
                      (s) => s.student_id.toString() === formData.student_id
                    );
                    const isAssignedStructure =
                      selectedStudent?.fee_structure?.id === structure.id;
                    return (
                      <MenuItem 
                        key={structure.id} 
                        value={structure.id}
                        sx={{
                          fontWeight: isAssignedStructure ? 'bold' : 'normal',
                          backgroundColor: isAssignedStructure ? 'action.hover' : 'inherit'
                        }}
                      >
                        {isAssignedStructure ? "★ " : ""}
                        {structure.class_id} - {structure.subject || "All Subjects"} (₹
                        {structure.amount})
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              name="amount_paid"
              type="number"
              value={formData.amount_paid}
              onChange={handleTextInputChange}
              required
              inputProps={{ min: 0 }}
            />

            <FormControl fullWidth>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={formData.payment_mode}
                onChange={handlePaymentModeChange}
                name="payment_mode"
                required
                label="Payment Mode"
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="CHEQUE">Cheque</MenuItem>
                <MenuItem value="ONLINE">Online</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Transaction ID"
              name="transaction_id"
              value={formData.transaction_id}
              onChange={handleTextInputChange}
              placeholder="Enter transaction ID"
            />

            <TextField
              fullWidth
              label="Discount Amount"
              name="discount_amount"
              type="number"
              value={formData.discount_amount}
              onChange={handleTextInputChange}
              inputProps={{ min: 0 }}
            />

            <TextField
              fullWidth
              label="Discount Reason"
              name="discount_reason"
              value={formData.discount_reason}
              onChange={handleTextInputChange}
              placeholder="Enter discount reason"
            />

            <TextField
              fullWidth
              label="Payment Month"
              name="month"
              type="month"
              value={formData.month}
              onChange={handleTextInputChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </FormContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Processing..." : "Process Payment"}
          </Button>
        </DialogActions>
      </StyledDialog>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Process Refund"
        message={`Are you sure you want to process a refund of ${formatCurrency(
          parseFloat(refundAmount)
        )} for receipt ${paymentToRefund?.receipt_number}?`}
        confirmText="Process Refund"
        cancelText="Cancel"
        isProcessing={processingPaymentId === paymentToRefund?.id}
        onConfirm={handleRefundConfirm}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setPaymentToRefund(null);
          setRefundAmount("");
        }}
        variant="warning"
      />

      {selectedPayment && (
        <PaymentReceiptModal
          open={isReceiptModalOpen}
          payment={selectedPayment}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </Box>
  );
};

export default FeePayments;

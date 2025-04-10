import React, { useState, useEffect } from "react";
import StudentNavbar from "./StudentNavbar";
import { useAuth } from "../../context/AuthContext";
import { getStudentFeeDetailsById } from "../../services/feeService";
import PaymentReceiptModal from "./PaymentReceiptModal";
import type { StudentPayment } from "./PaymentStatusCard";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  styled,
  keyframes,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { formatCurrency } from "../../utils/feeUtils";

interface FeePayment {
  id: number;
  student_id: number;
  fee_structure_id: number;
  description: string;
  amount: number;
  amount_paid: number;
  payment_date: string;
  due_date: string;
  status: string;
  receipt_number?: string;
  payment_method?: string;
  transaction_id?: string;
  student?: {
    user: {
      name: string;
    };
    class_id: string;
  };
  discount_amount?: number;
  discount_reason?: string;
  payment_mode?: string;
  payment_status?: "PAID" | "PARTIALLY_PAID" | "PENDING" | "CANCELLED";
  month?: string;
  created_at?: string;
  updated_at?: string;
}

interface FeeStructure {
  id: number;
  class_id: string;
  subject: string | null;
  amount: number;
  payment_type: string;
  valid_from: string;
  valid_until: string | null;
}

interface FeeData {
  fee_structure: FeeStructure;
  total_amount: number;
  status: 'PAID' | 'PARTIALLY_PAID' | 'PENDING';
  payments: FeePayment[];
  summary: {
    total_paid: number;
    total_due: number;
  };
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1200,
  margin: "0 auto",
}));

const FeeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  animation: `${fadeIn} 0.5s ease-out`,
}));

const FeeHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(3),
}));

const FeeAmount = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  '&.paid': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  '&.partially_paid': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  '&.pending': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

const StudentFeeView: React.FC = () => {
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentReceipt, setShowPaymentReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.user_id) {
      fetchFeeData();
    } else {
      setError("User not authenticated");
      setLoading(false);
    }
  }, [user]);

  const fetchFeeData = async () => {
    if (!user?.user_id) return;

    console.log("[StudentFeeView] Fetching student fee details");
    try {
      setLoading(true);
      const response = await getStudentFeeDetailsById(user.user_id);

      const transformedData: FeeData = {
        fee_structure: response.fee_structure,
        total_amount: response.fee_structure.amount,
        status: calculateStatus(response.summary.total_paid, response.fee_structure.amount),
        payments: response.payments || [],
        summary: response.summary
      };

      setFeeData(transformedData);
      console.log("[StudentFeeView] Successfully fetched fee details:", {
        totalAmount: transformedData.total_amount,
        status: transformedData.status,
        paymentsCount: transformedData.payments?.length || 0
      });
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to fetch fee details";
      console.error("[StudentFeeView] Error fetching fee details:", {
        error: err.message,
        status: err.response?.status,
        details: errorMessage
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (paid: number, total: number): FeeData['status'] => {
    if (paid >= total) return 'PAID';
    if (paid > 0) return 'PARTIALLY_PAID';
    return 'PENDING';
  };

  const handleViewReceipt = (payment: FeePayment) => {
    const studentPayment: StudentPayment = {
      id: payment.id,
      student_id: payment.student_id,
      student_name: payment.student?.user?.name || "",
      fee_structure_id: payment.fee_structure_id,
      class_id: payment.student?.class_id || "",
      amount_paid: payment.amount_paid,
      total_amount: payment.amount,
      payment_date: payment.payment_date,
      payment_mode: (payment.payment_mode || "CASH") as StudentPayment["payment_mode"],
      transaction_id: payment.transaction_id,
      receipt_number: payment.receipt_number || "",
      status: (payment.payment_status || payment.status || "PENDING") as StudentPayment["status"],      discount_amount: payment.discount_amount,
      discount_reason: payment.discount_reason,
      month: payment.month || new Date(payment.payment_date).toISOString().substring(0, 7),
      created_at: payment.created_at || payment.payment_date,
      updated_at: payment.updated_at || payment.payment_date
    };
    setSelectedPayment(studentPayment);
    setShowPaymentReceipt(true);
  };

  return (
    <>
      <StudentNavbar />
      <PageContainer>
        <Typography variant="h4" gutterBottom>
          Fee Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Typography>Loading...</Typography>
        ) : feeData ? (
          <>
            <FeeCard>
              <FeeHeader>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Current Fee Structure
                  </Typography>
                  <Typography variant="body1">
                    Class: {feeData.fee_structure.class_id}
                  </Typography>
                  {feeData.fee_structure.subject && (
                    <Typography variant="body1">
                      Subject: {feeData.fee_structure.subject}
                    </Typography>
                  )}
                  <Typography variant="body1">
                    Payment Type: {feeData.fee_structure.payment_type}
                  </Typography>
                </Box>
                <Box>
                  <FeeAmount variant="h5">
                    {formatCurrency(feeData.total_amount)}
                  </FeeAmount>
                  <StatusChip
                    label={feeData.status}
                    className={feeData.status.toLowerCase()}
                  />
                </Box>
              </FeeHeader>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Payment Summary
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                  <Typography>
                    Total Paid: {formatCurrency(feeData.summary.total_paid)}
                  </Typography>
                  <Typography>
                    Total Due: {formatCurrency(feeData.summary.total_due)}
                  </Typography>
                </Box>
              </Box>

              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Receipt No.</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Amount Paid</TableCell>
                      <TableCell>Payment Mode</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeData.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.receipt_number || '-'}</TableCell>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">{formatCurrency(payment.amount_paid)}</TableCell>
                        <TableCell>{payment.payment_mode || payment.payment_method || 'CASH'}</TableCell>
                        <TableCell>
                          <StatusChip
                            label={payment.payment_status || payment.status || 'PENDING'}
                            className={(payment.payment_status || payment.status || 'pending').toLowerCase()}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            startIcon={<CloudDownloadIcon />}
                            onClick={() => handleViewReceipt(payment)}
                            size="small"
                          >
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </FeeCard>
          </>
        ) : (
          <Typography>No fee data available</Typography>
        )}

        {showPaymentReceipt && selectedPayment && (
          <PaymentReceiptModal
            open={showPaymentReceipt}
            onClose={() => setShowPaymentReceipt(false)}
            payment={selectedPayment}
          />
        )}
      </PageContainer>
    </>
  );
};

export default StudentFeeView;

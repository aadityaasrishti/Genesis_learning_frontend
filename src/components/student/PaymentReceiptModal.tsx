import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  styled,
} from '@mui/material';
import { downloadReceipt } from '../../utils/pdfUtils';
import { formatCurrency, getPaymentModeLabel } from '../../utils/feeUtils';
import { getSchoolInfo } from '../../utils/schoolUtils';
import type { FeePayment } from '../../types/fees';
import type { StudentPayment } from './PaymentStatusCard';

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const Value = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 400,
}));

interface PaymentReceiptModalProps {
  open: boolean;
  onClose: () => void;
  payment: StudentPayment | FeePayment;
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  open,
  payment,
  onClose,
}) => {
  const getStudentName = (payment: StudentPayment | FeePayment) => {
    if ('student_name' in payment) {
      return payment.student_name;
    }
    return payment.student?.user?.name || '';
  };

  const getClassId = (payment: StudentPayment | FeePayment) => {
    if ('class_id' in payment) {
      return payment.class_id;
    }
    return payment.student?.class_id || '';
  };

  const getStatus = (payment: StudentPayment | FeePayment) => {
    if ('status' in payment) {
      return payment.status;
    }
    return payment.payment_status;
  };

  const handleDownload = () => {
    console.log("[PaymentReceiptModal] Downloading receipt:", {
      paymentId: payment.id,
      receiptNumber: payment.receipt_number,
      studentName: getStudentName(payment),
      amount: payment.amount_paid
    });
    try {
      downloadReceipt(payment, getSchoolInfo());
      console.log("[PaymentReceiptModal] Receipt downloaded successfully:", {
        receiptNumber: payment.receipt_number
      });
    } catch (error) {
      console.error("[PaymentReceiptModal] Error downloading receipt:", {
        error: error instanceof Error ? error.message : "Unknown error",
        paymentId: payment.id,
        receiptNumber: payment.receipt_number
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Payment Receipt</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <DetailRow>
            <Label>Receipt Number:</Label>
            <Value>{payment.receipt_number}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Student Name:</Label>
            <Value>{getStudentName(payment)}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Class:</Label>
            <Value>{getClassId(payment)}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Amount Paid:</Label>
            <Value>{formatCurrency(payment.amount_paid)}</Value>
          </DetailRow>
          {payment.discount_amount !== undefined && payment.discount_amount > 0 && (
            <>
              <DetailRow>
                <Label>Discount:</Label>
                <Value>{formatCurrency(payment.discount_amount)}</Value>
              </DetailRow>
              <DetailRow>
                <Label>Total Amount:</Label>
                <Value>
                  {formatCurrency(payment.amount_paid + (payment.discount_amount || 0))}
                </Value>
              </DetailRow>
            </>
          )}
          <DetailRow>
            <Label>Payment Mode:</Label>
            <Value>{getPaymentModeLabel(payment.payment_mode)}</Value>
          </DetailRow>
          {payment.transaction_id && (
            <DetailRow>
              <Label>Transaction ID:</Label>
              <Value>{payment.transaction_id}</Value>
            </DetailRow>
          )}
          <DetailRow>
            <Label>Payment Date:</Label>
            <Value>{new Date(payment.payment_date).toLocaleDateString()}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Status:</Label>
            <Value>{getStatus(payment)}</Value>
          </DetailRow>
          {payment.discount_reason && (
            <DetailRow>
              <Label>Discount Reason:</Label>
              <Value>{payment.discount_reason}</Value>
            </DetailRow>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button onClick={handleDownload} color="primary" variant="contained">
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentReceiptModal;

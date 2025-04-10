import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { getFeePaymentStatus } from '../../../services/feeService';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: 14,
  padding: theme.spacing(1),
  textAlign: 'center',
  whiteSpace: 'nowrap'
}));

const MonthCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  fontSize: 13,
  minWidth: '100px',
  position: 'relative',
  '&.paid': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.dark,
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: theme.palette.success.main
    }
  },
  '&.pending': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.dark,
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: theme.palette.warning.main
    }
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: '4px',
  '&.paid': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  '&.pending': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  '&.partially-paid': {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark,
  },
}));

interface PaymentStatus {
  student_id: number;
  student_name: string;
  class_id: string;
  total_fee: number;
  paid_amount: number;
  pending_amount: number;
  last_payment: string | null;
  payment_status: string;
  monthly_status?: {
    [month: string]: {
      status: string;
      amount: number;
      dueDate: string;
    };
  };
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PaymentStatusTable: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');

  const getMonthStatus = (status: PaymentStatus, month: string): string => {
    if (!status.monthly_status || !status.monthly_status[month]) {
      return 'PENDING';
    }
    return status.monthly_status[month].status;
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, [selectedClass]);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      const data = await getFeePaymentStatus(selectedClass);
      // Filter out demo users before setting the state
      const filteredData = data.filter((status: PaymentStatus) => !status.student_name.toLowerCase().includes('demo') && !status.student_name.toLowerCase().includes('pari'));
      setPaymentStatus(filteredData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Select Class</InputLabel>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value as string)}
            label="Select Class"
          >
            <MenuItem value="">All Classes</MenuItem>
            {/* Add your class options here */}
            <MenuItem value="Class 10">Class 10</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell>Student Name</StyledTableCell>
              <StyledTableCell>Class</StyledTableCell>
              {months.map(month => (
                <StyledTableCell key={month}>{month}</StyledTableCell>
              ))}
              <StyledTableCell>Total Fee</StyledTableCell>
              <StyledTableCell>Paid Amount</StyledTableCell>
              <StyledTableCell>Pending</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentStatus.map((status) => (
              <TableRow key={status.student_id}>
                <TableCell>{status.student_name}</TableCell>
                <TableCell>{status.class_id}</TableCell>
                {months.map(month => (
                  <MonthCell 
                    key={month} 
                    className={getMonthStatus(status, month).toLowerCase()}
                  >
                    {getMonthStatus(status, month)}
                  </MonthCell>
                ))}
                <TableCell>{formatCurrency(status.total_fee)}</TableCell>
                <TableCell>{formatCurrency(status.paid_amount)}</TableCell>
                <TableCell>
                  <StatusChip 
                    label={formatCurrency(status.pending_amount)}
                    className={status.payment_status.toLowerCase().replace('_', '-')}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PaymentStatusTable;

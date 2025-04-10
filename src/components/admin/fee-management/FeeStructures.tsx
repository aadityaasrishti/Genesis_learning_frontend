import React, { useState, useEffect } from "react";
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
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  styled,
  keyframes,
  SelectChangeEvent,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import type { PaymentType } from "../../../services/feeService";
import LoadingSpinner from "../../Common/LoadingSpinner";
import ConfirmationModal from "../../Common/ConfirmationModal";
import AlertMessage from "../../Common/AlertMessage";
import { formatCurrency } from "../../../utils/feeUtils";
import type { FeeStructure } from "../../../types/fees";
import {
  createFeeStructure,
  getFeeStructures,
  deleteFeeStructure,
} from "../../../services/feeService";


const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    width: '90%',
    maxWidth: 600,
    animation: `${slideUp} 0.3s ease-out`,
  },
});

const FormContainer = styled(Box)(({ theme }) => ({
  '& .MuiFormControl-root': {
    marginBottom: theme.spacing(2),
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

type FormData = {
  class_id: string;
  subject: string;
  amount: string;
  payment_type: PaymentType;
  valid_from: string;
  valid_until: string;
};

const FeeStructures: React.FC = () => {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    class_id: "",
    subject: "",
    amount: "",
    payment_type: "ONE_TIME",
    valid_from: "",
    valid_until: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [structureToDelete, setStructureToDelete] = useState<FeeStructure | null>(
    null
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    console.log("[FeeStructures] Fetching fee structures");
    try {
      setLoading(true);
      const data = await getFeeStructures();
      console.log("[FeeStructures] Successfully fetched fee structures:", {
        count: data.length,
        structureIds: data.map((s: FeeStructure) => s.id),
        classIds: data.map((s: FeeStructure) => s.class_id)
      });
      
      // Sort structures by class_id and valid_from date
      const sortedData = [...data].sort((a: FeeStructure, b: FeeStructure) => {
        const classCompare = a.class_id.localeCompare(b.class_id);
        if (classCompare !== 0) return classCompare;
        return new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime();
      });
      
      setStructures(sortedData);
    } catch (error) {
      console.error("[FeeStructures] Failed to fetch fee structures:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
      showErrorMessage("Failed to fetch fee structures");
    } finally {
      setLoading(false);
    }
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[FeeStructures] Creating new fee structure:", {
      classId: formData.class_id,
      subject: formData.subject || "All Subjects",
      amount: formData.amount,
      paymentType: formData.payment_type
    });
    try {
      setLoading(true);
      await createFeeStructure({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      console.log("[FeeStructures] Fee structure created successfully");
      showSuccessMessage("Fee structure created successfully");
      setIsModalOpen(false);
      fetchFeeStructures();
      setFormData({
        class_id: "",
        subject: "",
        amount: "",
        payment_type: "ONE_TIME",
        valid_from: "",
        valid_until: "",
      });
    } catch (error) {
      console.error("[FeeStructures] Error creating fee structure:", {
        error: error instanceof Error ? error.message : "Unknown error",
        formData,
        timestamp: new Date().toISOString()
      });
      showErrorMessage("Failed to create fee structure");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!structureToDelete) return;
    
    console.log("[FeeStructures] Deleting fee structure:", {
      structureId: structureToDelete.id,
      classId: structureToDelete.class_id,
      subject: structureToDelete.subject || "All Subjects"
    });

    try {
      setLoading(true);
      await deleteFeeStructure(structureToDelete.id);
      console.log("[FeeStructures] Fee structure deleted successfully:", {
        structureId: structureToDelete.id
      });
      showSuccessMessage("Fee structure deleted successfully");
      fetchFeeStructures();
    } catch (error) {
      console.error("[FeeStructures] Failed to delete fee structure:", {
        error: error instanceof Error ? error.message : "Unknown error",
        structureId: structureToDelete.id,
        timestamp: new Date().toISOString()
      });
      showErrorMessage("Failed to delete fee structure");
    } finally {
      setLoading(false);
      setIsConfirmModalOpen(false);
      setStructureToDelete(null);
    }
  };

  const showErrorMessage = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <Box>
      <HeaderActions>
        <Typography variant="h6">Fee Structures</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Structure
        </Button>
      </HeaderActions>

      {error && (
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <AlertMessage
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {loading && !structures.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <LoadingSpinner size="large" />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Type</TableCell>
                  <TableCell>Valid From</TableCell>
                  <TableCell>Valid Until</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {structures.map((structure) => (
                  <TableRow key={structure.id}>
                    <TableCell>{structure.class_id}</TableCell>
                    <TableCell>{structure.subject || "All Subjects"}</TableCell>
                    <TableCell>{formatCurrency(structure.amount)}</TableCell>
                    <TableCell>{structure.payment_type}</TableCell>
                    <TableCell>
                      {new Date(structure.valid_from).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {structure.valid_until
                        ? new Date(structure.valid_until).toLocaleDateString()
                        : "No End Date"}
                    </TableCell>
                    <TableCell align="center">
                      <ActionButtons>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setStructureToDelete(structure);
                            setIsConfirmModalOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <StyledDialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>Add New Fee Structure</DialogTitle>
        <DialogContent>
          <FormContainer component="form" onSubmit={handleSubmit}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={formData.class_id}
                onChange={handleSelectChange as (e: SelectChangeEvent<string>) => void}
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

            <TextField
              fullWidth
              label="Subject (Optional)"
              name="subject"
              value={formData.subject}
              onChange={handleTextInputChange}
              placeholder="Enter subject"
            />

            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleTextInputChange}
              required
              inputProps={{ min: 0 }}
            />

            <FormControl fullWidth>
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={formData.payment_type}
                onChange={handleSelectChange}
                name="payment_type"
                required
                label="Payment Type"
              >
                <MenuItem value="ONE_TIME">One Time</MenuItem>
                <MenuItem value="INSTALLMENT">Installment</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                <MenuItem value="YEARLY">Yearly</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Valid From"
              name="valid_from"
              type="date"
              value={formData.valid_from}
              onChange={handleTextInputChange}
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Valid Until (Optional)"
              name="valid_until"
              type="date"
              value={formData.valid_until}
              onChange={handleTextInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </FormContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Structure"}
          </Button>
        </DialogActions>
      </StyledDialog>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Delete Fee Structure"
        message="Are you sure you want to delete this fee structure? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setStructureToDelete(null);
        }}
        variant="danger"
      />
    </Box>
  );
};

export default FeeStructures;

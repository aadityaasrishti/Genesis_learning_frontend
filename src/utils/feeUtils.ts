import { FeePayment, FeeStructure } from "../types/fees";

export const calculateDueAmount = (
  feeStructure: FeeStructure,
  payments: FeePayment[]
): number => {
  const totalAmount = feeStructure.amount;
  const paidAmount = payments.reduce(
    (sum, payment) => sum + payment.amount_paid,
    0
  );
  return totalAmount - paidAmount;
};

export const calculateLateFee = (
  dueDate: Date,
  amount: number,
  lateFeePercentage = 0.1
): number => {
  if (new Date() <= dueDate) return 0;
  return Math.round(amount * lateFeePercentage);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
};

export const validatePaymentAmount = (
  amount: number,
  dueAmount: number
): boolean => {
  return amount > 0 && amount <= dueAmount;
};

export const generateReceiptNumber = (
  studentId: number,
  timestamp = Date.now()
): string => {
  const dateStr = new Date(timestamp)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `RCP-${dateStr}-${studentId}-${random}`;
};

export const getPaymentModeLabel = (mode: string): string => {
  const labels: Record<string, string> = {
    CASH: "Cash",
    CHEQUE: "Cheque",
    ONLINE: "Online",
    BANK_TRANSFER: "Bank Transfer",
    UPI: "UPI",
  };
  return labels[mode] || mode;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PAID: "Paid",
    PARTIALLY_PAID: "Partially Paid",
    PENDING: "Pending",
    CANCELLED: "Cancelled",
  };
  return labels[status] || status;
};

export const isValidPaymentMode = (mode: string): boolean => {
  const validModes = ["CASH", "CHEQUE", "ONLINE", "BANK_TRANSFER", "UPI"];
  return validModes.includes(mode);
};

export const calculateInstallmentAmount = (
  totalAmount: number,
  installments: number
): number => {
  return Math.ceil(totalAmount / installments);
};

export const isPaymentComplete = (
  feeStructure: FeeStructure,
  payments: FeePayment[]
): boolean => {
  return calculateDueAmount(feeStructure, payments) <= 0;
};

export const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    PAID: "badge badge-success",
    PARTIALLY_PAID: "badge badge-warning",
    PENDING: "badge badge-warning",
    CANCELLED: "badge badge-danger",
  };
  return classes[status] || "badge badge-default";
};

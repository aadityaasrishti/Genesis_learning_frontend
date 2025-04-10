export interface ValidationError {
  field: string;
  message: string;
}

export const validatePaymentForm = (data: {
  student_id: string;
  fee_structure_id: string;
  amount_paid: string;
  payment_mode: string;
  transaction_id?: string;
  discount_amount?: string;
  discount_reason?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.student_id) {
    errors.push({ field: "student_id", message: "Student ID is required" });
  } else if (isNaN(Number(data.student_id))) {
    errors.push({
      field: "student_id",
      message: "Student ID must be a number",
    });
  }

  if (!data.fee_structure_id) {
    errors.push({
      field: "fee_structure_id",
      message: "Fee structure is required",
    });
  }

  if (!data.amount_paid) {
    errors.push({ field: "amount_paid", message: "Amount is required" });
  } else if (isNaN(Number(data.amount_paid)) || Number(data.amount_paid) <= 0) {
    errors.push({
      field: "amount_paid",
      message: "Amount must be a positive number",
    });
  }

  if (!data.payment_mode) {
    errors.push({ field: "payment_mode", message: "Payment mode is required" });
  }

  // Conditional validations
  if (
    ["CHEQUE", "ONLINE", "BANK_TRANSFER", "UPI"].includes(data.payment_mode) &&
    !data.transaction_id
  ) {
    errors.push({
      field: "transaction_id",
      message: "Transaction ID is required for this payment mode",
    });
  }

  if (data.discount_amount && isNaN(Number(data.discount_amount))) {
    errors.push({
      field: "discount_amount",
      message: "Discount amount must be a number",
    });
  }

  if (
    data.discount_amount &&
    Number(data.discount_amount) > 0 &&
    !data.discount_reason
  ) {
    errors.push({
      field: "discount_reason",
      message: "Discount reason is required when discount is applied",
    });
  }

  return errors;
};

export const validateFilterDates = (
  startDate: string,
  endDate: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      errors.push({
        field: "start_date",
        message: "Start date cannot be after end date",
      });
      errors.push({
        field: "end_date",
        message: "End date cannot be before start date",
      });
    }
  } else if (startDate && !endDate) {
    errors.push({
      field: "end_date",
      message: "End date is required when start date is provided",
    });
  } else if (!startDate && endDate) {
    errors.push({
      field: "start_date",
      message: "Start date is required when end date is provided",
    });
  }

  return errors;
};

export const validateFeeStructure = (data: {
  class_id: string;
  subject?: string;
  amount: string;
  payment_type: string;
  valid_from: string;
  valid_until?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.class_id) {
    errors.push({ field: "class_id", message: "Class is required" });
  }

  if (!data.amount) {
    errors.push({ field: "amount", message: "Amount is required" });
  } else if (isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
    errors.push({
      field: "amount",
      message: "Amount must be a positive number",
    });
  }

  if (!data.payment_type) {
    errors.push({ field: "payment_type", message: "Payment type is required" });
  }

  if (!data.valid_from) {
    errors.push({
      field: "valid_from",
      message: "Valid from date is required",
    });
  }

  if (data.valid_from && data.valid_until) {
    const start = new Date(data.valid_from);
    const end = new Date(data.valid_until);

    if (start > end) {
      errors.push({
        field: "valid_from",
        message: "Valid from date cannot be after valid until date",
      });
      errors.push({
        field: "valid_until",
        message: "Valid until date cannot be before valid from date",
      });
    }
  }

  return errors;
};

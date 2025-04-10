import React from "react";
import type { ValidationError } from "../../utils/feeValidation";

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  errors?: ValidationError[];
  as?: "input" | "select";
  children?: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  errors = [],
  as = "input",
  children,
  className = "",
}) => {
  const fieldErrors = errors.filter((error) => error.field === name);
  const hasError = fieldErrors.length > 0;

  return (
    <div className={`form-group ${className}`}>
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>

      {as === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`form-select ${hasError ? "form-error" : ""}`}
          required={required}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${hasError ? "form-error" : ""}`}
          required={required}
        />
      )}

      {fieldErrors.map((error, index) => (
        <div key={index} className="form-error-message">
          {error.message}
        </div>
      ))}
    </div>
  );
};

export default FormField;

import React from "react";
import "../../styles/animations.css";
import LoadingSpinner from "./LoadingSpinner";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "info" | "warning" | "danger";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isProcessing = false,
  onConfirm,
  onCancel,
  variant = "info",
}) => {
  if (!isOpen) return null;

  const getButtonClass = () => {
    switch (variant) {
      case "danger":
        return "btn-danger";
      case "warning":
        return "btn-warning";
      default:
        return "btn-primary";
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button
            className={`btn ${getButtonClass()} ${
              isProcessing ? "btn-loading" : ""
            }`}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="small" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

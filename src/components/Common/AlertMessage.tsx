import React, { useEffect } from "react";
import { Alert, IconButton, Collapse } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface AlertMessageProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 3000,
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <Collapse in={Boolean(message)}>
      <Alert
        severity={type}
        action={
          onClose ? (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : null
        }
        sx={{
          mb: 2,
          "& .MuiAlert-message": {
            flex: 1,
          },
        }}
      >
        {message}
      </Alert>
    </Collapse>
  );
};

export default AlertMessage;

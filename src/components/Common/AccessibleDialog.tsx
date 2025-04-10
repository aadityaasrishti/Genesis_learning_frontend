import React, { useEffect, useRef } from "react";
import { Dialog, DialogProps } from "@mui/material";

interface AccessibleDialogProps extends DialogProps {
  children: React.ReactNode;
}

const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  children,
  open,
  onClose,
  ...props
}) => {
  const previousFocus = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // Store current focus
      previousFocus.current = document.activeElement as HTMLElement;
      
      // Remove aria-hidden from root
      const root = document.getElementById("root");
      if (root) {
        root.removeAttribute("aria-hidden");
      }

      // Focus the dialog
      if (dialogRef.current) {
        const focusableElement = dialogRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        if (focusableElement) {
          focusableElement.focus();
        } else {
          dialogRef.current.focus();
        }
      }
    } else if (previousFocus.current) {
      // Restore previous focus when dialog closes
      previousFocus.current.focus();
    }

    return () => {
      // Cleanup: ensure root doesn't retain aria-hidden
      const root = document.getElementById("root");
      if (root) {
        root.removeAttribute("aria-hidden");
      }
    };
  }, [open]);

  return (
    <Dialog
      ref={dialogRef}
      open={open}
      onClose={onClose}
      {...props}
      aria-modal="true"
      container={document.body}
      BackdropProps={{
        ...props.BackdropProps,
        sx: {
          ...props.BackdropProps?.sx,
          "&[aria-hidden]": { visibility: "visible" }
        }
      }}
      PaperProps={{
        ...props.PaperProps,
        tabIndex: -1,
        role: "dialog"
      }}
      sx={{
        ...props.sx,
        "& .MuiBackdrop-root[aria-hidden]": {
          visibility: "visible"
        }
      }}
    >
      {children}
    </Dialog>
  );
};

export default AccessibleDialog;

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: "small" | "medium" | "large";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  fullScreen = false,
  size = "medium",
}) => {
  const getSize = () => {
    switch (size) {
      case "small":
        return 20;
      case "large":
        return 50;
      default:
        return 35;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: fullScreen ? "100vh" : "200px",
        gap: 2,
      }}
    >
      <CircularProgress size={getSize()} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;

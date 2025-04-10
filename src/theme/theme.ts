import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#3490dc",
      light: "#85c8f2",
      dark: "#2980b9",
    },
    secondary: {
      main: "#6574cd",
      light: "#9da3e4",
      dark: "#4c5bb5",
    },
    error: {
      main: "#e74c3c",
      light: "#f1a9a0",
      dark: "#c0392b",
    },
    warning: {
      main: "#f6993f",
      light: "#ffc107",
      dark: "#e0a800",
    },
    success: {
      main: "#4caf50",
      light: "#7dcea0",
      dark: "#388e3c",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#64748b",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
  typography: {
    fontFamily: '"Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
  },
});

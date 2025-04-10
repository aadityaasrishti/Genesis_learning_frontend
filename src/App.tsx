import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import AuthProvider from "./context/AuthContext";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import DashboardRouter from "./components/Common/DashboardRouter";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LandingPage from "./components/Common/LandingPage";
import { theme } from "./theme/theme";

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MuiThemeProvider>
  );
}

export default App;

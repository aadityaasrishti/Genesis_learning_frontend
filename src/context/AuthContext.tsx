// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { User as CompleteUser, Student, Teacher } from "../types/types";

interface AuthUser extends Omit<CompleteUser, "student" | "teacher"> {
  student?: Student;
  teacher?: Teacher;
  class_id?: string;
  profile_image_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Create a wrapper component that has access to navigation
const AuthProviderWithNavigate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  return <AuthProvider navigate={navigate}>{children}</AuthProvider>;
};

interface AuthProviderProps {
  children: React.ReactNode;
  navigate: (path: string) => void;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children, navigate }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get("/auth/me");
      if (response.data) {
        setUser(response.data);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token } = response.data;
      if (!token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", token);
      await checkAuth();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout properly");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext };
export default AuthProviderWithNavigate;

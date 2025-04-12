import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
} from "@mui/material";

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 600,
  margin: "0 auto",
  marginTop: theme.spacing(4),
}));

const FormField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  "& img": {
    maxWidth: "100%",
    maxHeight: 300,
    borderRadius: theme.shape.borderRadius,
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(2),
  },
}));

interface StudentRequestProps {
  onRequestSubmitted?: () => void;
}

const StudentRequest: React.FC<StudentRequestProps> = ({
  onRequestSubmitted,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestType, setRequestType] = useState("EXTRA_CLASS");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", requestType);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await api.post("/student/requests", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTitle("");
      setDescription("");
      setRequestType("EXTRA_CLASS");
      setSelectedFile(null);
      setImagePreview(null);
      setShowSuccess(true);

      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to submit request");
      console.error("Error submitting request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer elevation={2}>
      <Typography variant="h5" gutterBottom>
        Submit Request
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <FormField>
          <FormControl fullWidth>
            <InputLabel>Request Type</InputLabel>
            <Select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              required
            >
              <MenuItem value="EXTRA_CLASS">Extra Class</MenuItem>
              <MenuItem value="leave">Leave Request</MenuItem>
              <MenuItem value="document">Document Request</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </FormField>

        <FormField>
          <TextField
            fullWidth
            label="Request Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>

        <FormField>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </FormField>

        <FormField>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button variant="contained" component="span" color="primary">
              Upload Supporting Document
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </FormField>

        {imagePreview && (
          <ImagePreview>
            <img src={imagePreview} alt="Preview" />
          </ImagePreview>
        )}

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Box>
      </form>

      <StyledDialog open={showSuccess} onClose={() => setShowSuccess(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>Your request has been submitted successfully.</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowSuccess(false);
              navigate(-1);
            }}
          >
            OK
          </Button>
        </DialogActions>
      </StyledDialog>
    </FormContainer>
  );
};

export default StudentRequest;

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  Typography,
  Rating,
  Paper,
  styled,
} from "@mui/material";
import api from "../../services/api";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

interface FeedbackFormProps {
  recipientId: number;
  onSubmit?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  recipientId,
  onSubmit,
}) => {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please enter a feedback message");
      return;
    }
    if (!recipientId) {
      setError("No recipient selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/feedback", {
        to_id: recipientId,
        message: message.trim(),
        rating,
      });

      if (response.status === 201) {
        setSuccess(true);
        setMessage("");
        setRating(0);
        if (onSubmit) onSubmit();
      }
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(
        err.response?.data?.error || err.message?.includes("timeout")
          ? "The request is taking longer than expected. Please try again."
          : "Failed to submit feedback. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPaper elevation={2}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Feedback submitted successfully!
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Your Feedback:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            required
            placeholder="Enter your feedback here..."
            disabled={loading}
            sx={{ mb: 2 }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Rating:
          </Typography>
          <Rating
            name="feedback-rating"
            value={rating}
            onChange={(_, newValue) => setRating(newValue || 0)}
            size="large"
            disabled={loading}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>
      </Box>
    </StyledPaper>
  );
};

export default FeedbackForm;

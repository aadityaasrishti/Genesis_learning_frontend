import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import api from "../../services/api";

const SystemNotificationCreator: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post("/notifications/system", { message });
      setSuccess(`Notification sent to ${response.data.recipientCount} users`);
      setMessage("");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to send notification");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Create System Notification
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter system notification message..."
          required
          disabled={isLoading}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !message.trim()}
          startIcon={<SendIcon />}
          fullWidth
        >
          {isLoading ? "Sending..." : "Send Notification"}
        </Button>
      </Box>
    </Paper>
  );
};

export default SystemNotificationCreator;

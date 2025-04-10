import React, { useState } from "react";
import {
  Box,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  styled,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import api from "../../services/api";
import { NotificationCleanupOptions, NotificationCleanupResult } from "../../types/notifications";

const SettingsSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  "& .MuiFormControl-root": {
    marginBottom: theme.spacing(2),
  },
}));

const CleanupOptions = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

interface NotificationSettingsProps {
  onCleanup?: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onCleanup,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    () => localStorage.getItem("notificationSound") !== "disabled"
  );

  const [cleanupOptions, setCleanupOptions] = useState<NotificationCleanupOptions>({
    olderThan: "30",
    status: "all",
  });

  const [loading, setLoading] = useState(false);
  const [lastCleanupResult, setLastCleanupResult] = useState<string | null>(null);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("notificationSound", newValue ? "enabled" : "disabled");
  };

  const handleCleanup = async () => {
    try {
      setLoading(true);
      const response = await api.delete("/notifications/cleanup/batch", {
        params: {
          olderThan: cleanupOptions.olderThan,
          status: cleanupOptions.status,
        },
      });

      const data = response.data as NotificationCleanupResult;
      if (data.success) {
        setLastCleanupResult(`Successfully removed ${data.count} notifications`);
        if (onCleanup) {
          onCleanup();
        }
      } else {
        setLastCleanupResult(data.error || "Failed to clean up notifications");
      }
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
      setLastCleanupResult("Failed to clean up notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <SettingsSection>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsOffIcon fontSize="small" />
          Notification Preferences
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={soundEnabled}
                onChange={toggleSound}
                color="primary"
              />
            }
            label="Enable notification sounds"
          />
        </FormGroup>
      </SettingsSection>

      <Divider sx={{ my: 2 }} />

      <SettingsSection>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteSweepIcon fontSize="small" />
          Cleanup Options
        </Typography>
        <CleanupOptions>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Remove notifications older than</InputLabel>
            <Select
              value={cleanupOptions.olderThan}
              label="Remove notifications older than"
              onChange={(e) =>
                setCleanupOptions((prev) => ({
                  ...prev,
                  olderThan: e.target.value as string,
                }))
              }
            >
              <MenuItem value="0">Today only</MenuItem>
              <MenuItem value="7">7 days</MenuItem>
              <MenuItem value="30">30 days</MenuItem>
              <MenuItem value="90">90 days</MenuItem>
              <MenuItem value="180">180 days</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={cleanupOptions.status}
              label="Status"
              onChange={(e) =>
                setCleanupOptions((prev) => ({
                  ...prev,
                  status: e.target.value as NotificationCleanupOptions["status"],
                }))
              }
            >
              <MenuItem value="all">All notifications</MenuItem>
              <MenuItem value="read">Read notifications only</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleCleanup}
            disabled={loading}
            startIcon={<DeleteSweepIcon />}
            color="warning"
            fullWidth
          >
            {loading ? "Cleaning..." : "Clean Up Notifications"}
          </Button>

          {lastCleanupResult && (
            <Alert
              severity={lastCleanupResult.includes("Failed") ? "error" : "success"}
              sx={{ mt: 1 }}
              variant="filled"
            >
              {lastCleanupResult}
            </Alert>
          )}
        </CleanupOptions>
      </SettingsSection>
    </Box>
  );
};

export default NotificationSettings;

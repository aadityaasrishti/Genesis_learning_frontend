import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Box,
  Button,
  CircularProgress,
  DialogActions,
} from "@mui/material";
import multiavatar from "@multiavatar/multiavatar";

const LoadingBox: React.FC = () => (
  <Box
    component="div"
    sx={{
      display: "flex",
      justifyContent: "center",
      padding: "32px",
    }}
  >
    <CircularProgress />
  </Box>
);

interface AvatarGalleryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (avatar: string) => void;
}

const defaultAvatars: string[] = [
  "smile",
  "happy",
  "cool",
  "funny",
  "nerd",
  "geek",
  "hipster",
  "classic",
  "artist",
  "rocker",
  "gamer",
  "coder",
];

const AvatarGallery: React.FC<AvatarGalleryProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const generatedAvatars = defaultAvatars.map((seed) => multiavatar(seed));
      setAvatars(generatedAvatars);
      setLoading(false);
    }
  }, [open]);

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  const regenerateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = multiavatar(seed);
    setAvatars((prev) => [...prev.slice(0, -1), newAvatar]);
  };

  const handleConfirm = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Choose Your Avatar</DialogTitle>
      <DialogContent>
        {loading ? (
          <LoadingBox />
        ) : (
          <Grid container spacing={2}>
            {avatars.map((avatar, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Box
                  component="div"
                  sx={{
                    border:
                      selectedAvatar === avatar
                        ? "2px solid #1976d2"
                        : "2px solid transparent",
                    borderRadius: "4px",
                    padding: "8px",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.08)",
                    },
                  }}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <Box
                    component="div"
                    dangerouslySetInnerHTML={{ __html: avatar }}
                    sx={{
                      width: "80px",
                      height: "80px",
                    }}
                  />
                </Box>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button variant="outlined" onClick={regenerateAvatar} fullWidth>
                Generate New Avatar
              </Button>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedAvatar || loading}
        >
          Select Avatar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarGallery;

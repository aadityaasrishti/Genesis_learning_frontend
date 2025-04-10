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
import { createAvatar } from "@dicebear/core";
import * as adventurer from "@dicebear/adventurer";
import * as avataaars from "@dicebear/avataaars";
import * as bottts from "@dicebear/bottts";
import * as funEmoji from "@dicebear/fun-emoji";
import * as lorelei from "@dicebear/lorelei";
import * as miniavs from "@dicebear/miniavs";
import * as openPeeps from "@dicebear/open-peeps";
import * as identicon from "@dicebear/identicon";

interface AvatarSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (svgString: string) => void;
}

interface AvatarStyle {
  style: any;
  name: string;
}

const styles: AvatarStyle[] = [
  { style: adventurer, name: "Adventurer" },
  { style: avataaars, name: "Avataaars" },
  { style: bottts, name: "Bottts" },
  { style: funEmoji, name: "Fun Emoji" },
  { style: lorelei, name: "Lorelei" },
  { style: miniavs, name: "Mini Avatars" },
  { style: openPeeps, name: "Open Peeps" },
  { style: identicon, name: "Identicon" },
];

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [avatars, setAvatars] = useState<{ svg: string; style: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  useEffect(() => {
    const generateAvatars = async () => {
      if (!open) return;

      setLoading(true);
      const newAvatars = await Promise.all(
        styles.flatMap((style) =>
          Array(4)
            .fill(null)
            .map(async () => {
              const avatar = createAvatar(style.style, {
                seed: Math.random().toString(),
              });
              const svg = await avatar.toString();
              return { svg, style: style.name };
            })
        )
      );
      setAvatars(newAvatars);
      setLoading(false);
    };

    generateAvatars();
  }, [open]);

  const handleSelect = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
      onClose();
    }
  };

  const regenerateAvatar = async (styleName: string) => {
    const style = styles.find((s) => s.name === styleName);
    if (!style) return;

    const avatar = createAvatar(style.style, {
      seed: Math.random().toString(),
    });
    const svg = await avatar.toString();
    setAvatars((prev) =>
      prev.map((a) => (a.style === styleName ? { ...a, svg } : a))
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Choose Your Avatar</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {avatars.map((avatar, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Box
                  sx={{
                    border:
                      selectedAvatar === avatar.svg
                        ? "2px solid #1976d2"
                        : "2px solid transparent",
                    borderRadius: 1,
                    p: 1,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.08)",
                    },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                  onClick={() => setSelectedAvatar(avatar.svg)}
                >
                  <Box
                    dangerouslySetInnerHTML={{ __html: avatar.svg }}
                    sx={{ width: 80, height: 80 }}
                  />
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      regenerateAvatar(avatar.style);
                    }}
                  >
                    Regenerate
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSelect}
          variant="contained"
          disabled={!selectedAvatar}
        >
          Select Avatar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarSelector;

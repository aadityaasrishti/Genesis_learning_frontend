import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import {
  generateAvatar,
  getAvatarStyles,
  generateRandomSeed,
  type AvatarStyle,
} from "../../services/avatarService";

interface AvatarGeneratorProps {
  onSelect: (avatarUrl: string) => void;
}

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ onSelect }) => {
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>("avataaars");
  const [currentAvatar, setCurrentAvatar] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const styles = getAvatarStyles().filter((style) => !style.startsWith("3d-"));

  const generateNewAvatar = useCallback(async () => {
    setIsLoading(true);
    try {
      const seed = generateRandomSeed();
      const avatarUrl = generateAvatar(seed, selectedStyle);
      setCurrentAvatar(avatarUrl);
    } catch (error) {
      console.error("Error generating avatar:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStyle]);

  React.useEffect(() => {
    generateNewAvatar();
  }, [generateNewAvatar]);

  const handleStyleChange = (event: SelectChangeEvent<AvatarStyle>) => {
    setSelectedStyle(event.target.value as AvatarStyle);
    generateNewAvatar();
  };

  const handleSelect = () => {
    if (currentAvatar) {
      onSelect(currentAvatar);
    }
  };

  return (
    <Box
      component="div"
      sx={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "center",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Generate Your Avatar
      </Typography>

      <Box
        component="div"
        sx={{
          width: "200px",
          height: "200px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : (
          currentAvatar && (
            <div
              dangerouslySetInnerHTML={{ __html: currentAvatar }}
              style={{ width: "100%", height: "100%" }}
            />
          )
        )}
      </Box>

      <FormControl fullWidth sx={{ marginBottom: "16px" }}>
        <InputLabel>Avatar Style</InputLabel>
        <Select
          value={selectedStyle}
          label="Avatar Style"
          onChange={handleStyleChange}
        >
          {styles.map((style) => (
            <MenuItem key={style} value={style}>
              {style.charAt(0).toUpperCase() +
                style.slice(1).replace(/-/g, " ")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={generateNewAvatar}>
          Generate New
        </Button>
        <Button variant="contained" onClick={handleSelect}>
          Select Avatar
        </Button>
      </Stack>
    </Box>
  );
};

export default AvatarGenerator;

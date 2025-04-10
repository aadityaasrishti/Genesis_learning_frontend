import React, { useState, useRef } from "react";
import {
  Box,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  Menu,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../services/api";
import AvatarGallery from "./AvatarGallery";

interface ProfileImageProps {
  imageUrl?: string | null;
  alt?: string;
  editable?: boolean;
  size?: number;
  onImageUpdate?: (url: string) => void;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  imageUrl,
  alt = "Profile Image",
  editable = true,
  size = 150,
  onImageUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePhotoUpload = () => {
    handleMenuClose();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/profile/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (onImageUpdate) {
        onImageUpdate(response.data.imageUrl);
      }
    } catch (err) {
      setError("Failed to upload photo");
      console.error("Photo upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSelect = async (avatarData: string) => {
    setError("");
    setIsLoading(true);

    try {
      const blob = new Blob([avatarData], { type: "image/svg+xml" });
      const file = new File([blob], "avatar.svg", { type: "image/svg+xml" });
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/profile/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (onImageUpdate) {
        onImageUpdate(response.data.imageUrl);
      }
    } catch (err) {
      setError("Failed to update avatar");
      console.error("Avatar update error:", err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleRemoveImage = async () => {
    handleMenuClose();
    setIsLoading(true);
    setError("");

    try {
      await api.delete("/profile/remove-image");
      if (onImageUpdate) {
        onImageUpdate("");
      }
    } catch (err) {
      setError("Failed to remove image");
      console.error("Image removal error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageContent = () => {
    if (!imageUrl) {
      return "/profilepic.png"; // Use the default profile picture from public folder
    }
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http") || imageUrl.startsWith("data:")) {
      return imageUrl;
    }

    // If it's a relative path from the API, ensure it starts with /api/
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (imageUrl.startsWith('/api/')) {
      return `${apiUrl}${imageUrl}`;
    }
    
    // If it's a path without /api/, add it
    return `${apiUrl}/api${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const renderAvatar = () => {
    if (isLoading) {
      return (
        <Box
          component="div"
          sx={{
            width: `${size}px`,
            height: `${size}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box
        component="img"
        src={getImageContent()}
        alt={alt}
        sx={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #e0e0e0",
        }}
      />
    );
  };

  return (
    <Box
      component="div"
      sx={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {renderAvatar()}
      {editable && (
        <>
          <IconButton
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "background.paper",
              "&:hover": {
                backgroundColor: "action.hover",
              },
              boxShadow: 1,
            }}
            onClick={handleMenuOpen}
          >
            <EditIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                setIsOpen(true);
                handleMenuClose();
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Choose Avatar
              </Box>
            </MenuItem>
            <MenuItem onClick={handlePhotoUpload}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhotoCameraIcon fontSize="small" />
                Upload Photo
              </Box>
            </MenuItem>
            {imageUrl && (
              <MenuItem onClick={handleRemoveImage}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "error.main",
                  }}
                >
                  <DeleteIcon fontSize="small" />
                  Remove Image
                </Box>
              </MenuItem>
            )}
          </Menu>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleFileChange}
          />
        </>
      )}
      <AvatarGallery
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleAvatarSelect}
      />
      <Dialog open={!!error} onClose={() => setError("")}>
        <DialogContent>{error}</DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProfileImage;

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  PictureAsPdf,
  Description,
  VideoLibrary,
  Folder,
} from "@mui/icons-material";
import TeacherNavbar from "./TeacherNavbar";
import api from "../../services/api";
import PDFViewer from "../Common/PDFViewer";

interface Note {
  id: number;
  topic: string;
  description: string;
  file_url: string;
  file_type: string;
  class_id: string;
  subject: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  approval?: {
    remarks: string;
    admin_id: number;
    created_at: string;
  };
}

const TeacherNotesView = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    console.log("Fetching teacher's uploaded notes");
    try {
      setLoading(true);
      const response = await api.get("/notes/teacher");
      console.log(`Successfully fetched ${response.data.length} notes`);
      setNotes(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch teacher's notes:", err);
      setError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "PDF":
        return <PictureAsPdf color="error" />;
      case "DOCX":
        return <Description color="primary" />;
      case "VIDEO":
        return <VideoLibrary color="secondary" />;
      default:
        return <Folder />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <TeacherNavbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Learning Materials
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {notes.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  You haven't uploaded any learning materials yet.
                </Alert>
              </Grid>
            ) : (
              notes.map((note) => (
                <Grid item xs={12} md={6} key={note.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        {getFileIcon(note.file_type)}
                        <Typography variant="h6">{note.topic}</Typography>
                      </Box>
                      <Typography color="textSecondary" paragraph>
                        {note.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Chip label={`Class: ${note.class_id}`} sx={{ mr: 1 }} />
                        <Chip label={`Subject: ${note.subject}`} sx={{ mr: 1 }} />
                        <Chip
                          label={note.status}
                          color={getStatusColor(note.status)}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Uploaded: {new Date(note.created_at).toLocaleDateString()}
                      </Typography>
                      {note.approval && (
                        <Box sx={{ mt: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>Admin Remarks:</strong> {note.approval.remarks || "No remarks provided"}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Reviewed on: {new Date(note.approval.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      <Button
                        variant="contained"
                        onClick={() => setSelectedNote(note)}
                        sx={{ mt: 2 }}
                        fullWidth
                      >
                        Preview
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        <Dialog
          open={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          maxWidth="lg"
          fullWidth
        >
          {selectedNote && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6">{selectedNote.topic}</Typography>
                <IconButton onClick={() => setSelectedNote(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ height: "70vh" }}>
                {selectedNote.file_type === "VIDEO" ? (
                  <video
                    controls
                    src={`${import.meta.env.VITE_API_URL}${selectedNote.file_url}`}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onError={(e) => {
                      console.error("Video loading error for note:", selectedNote.id, e);
                      setError("Failed to load video");
                    }}
                    onLoadStart={() => console.log("Starting to load video for note:", selectedNote.id)}
                    onLoadedData={() => console.log("Video loaded successfully for note:", selectedNote.id)}
                  />
                ) : selectedNote.file_type === "DOCX" ? (
                  <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button 
                      variant="contained" 
                      href={`${import.meta.env.VITE_API_URL}${selectedNote.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download DOCX File
                    </Button>
                  </Box>
                ) : (
                  <PDFViewer
                    fileUrl={selectedNote.file_url}
                    onDownload={() => window.open(`${import.meta.env.VITE_API_BASE_URL}${selectedNote.file_url}`, '_blank')}
                  />
                )}
              </Box>
            </Box>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default TeacherNotesView;
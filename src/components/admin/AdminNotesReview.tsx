import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import {
  Close as CloseIcon,
  PictureAsPdf,
  Description,
  VideoLibrary,
  Folder,
} from "@mui/icons-material";
import AdminNavbar from "./AdminNavbar";
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
  teacher: {
    name: string;
  };
  created_at: string;
  approval?: {
    remarks: string;
    admin_id: number;
    created_at: string;
  };
}

const AdminNotesReview = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [remarks, setRemarks] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const fetchNotes = async (signal?: AbortSignal) => {
    console.debug('AdminNotesReview: Starting notes fetch', {
      tab: activeTab,
      timestamp: new Date().toISOString()
    });
    
    try {
      setLoading(true);
      const response = await api.get("/notes/all", { signal });
      console.debug(`AdminNotesReview: Successfully fetched ${response.data.length} notes`, {
        tab: activeTab,
        timestamp: new Date().toISOString()
      });
      setNotes(response.data);
      setError("");
    } catch (err) {
      if (!signal?.aborted) {
        console.error("AdminNotesReview: Failed to fetch notes:", err);
        setError("Failed to fetch notes");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchNotes(controller.signal);
    return () => controller.abort();
  }, [activeTab]);

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

  const handleReview = async (id: number, status: "APPROVED" | "REJECTED") => {
    console.log(`Reviewing note ${id} with status: ${status}`);
    try {
      await api.post(`/notes/${id}/review`, { status, remarks });
      console.log("Note review successful");
      setSelectedNote(null);
      setRemarks("");
      fetchNotes();
    } catch (err) {
      console.error("Failed to update note status:", err);
      setError("Failed to update note status");
    }
  };

  const handleDownload = (note: Note) => {
    const url = note.file_url.startsWith('/api/') 
      ? `${import.meta.env.VITE_API_BASE_URL}${note.file_url}`
      : `${import.meta.env.VITE_API_BASE_URL}/api${note.file_url}`;
    window.open(url, '_blank');
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

  const filteredNotes = notes.filter(note => {
    switch (activeTab) {
      case 0:
        return note.status === "PENDING";
      case 1:
        return note.status === "APPROVED";
      case 2:
        return note.status === "REJECTED";
      default:
        return true;
    }
  });

  return (
    <Box>
      <AdminNavbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Review Learning Materials
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Pending Review" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>
        </Box>

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
            {filteredNotes.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No {activeTab === 0 ? "pending" : activeTab === 1 ? "approved" : "rejected"} notes found
                </Alert>
              </Grid>
            ) : (
              filteredNotes.map((note) => (
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
                        <Chip label={note.status} color={getStatusColor(note.status)} />
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        Teacher: {note.teacher.name}
                      </Typography>
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
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => setSelectedNote(note)}
                          fullWidth
                        >
                          Preview
                        </Button>
                        {note.status === "PENDING" && (
                          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleReview(note.id, "APPROVED")}
                              fullWidth
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleReview(note.id, "REJECTED")}
                              fullWidth
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </Box>
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
              <Box sx={{ height: "70vh", mb: selectedNote.status === "PENDING" ? 2 : 0 }}>
                {selectedNote.file_type === "VIDEO" ? (
                  <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <video
                      key={selectedNote.id} // Add key to force remount when note changes
                      controls
                      playsInline
                      controlsList="nodownload"
                      src={`${import.meta.env.VITE_API_BASE_URL}${selectedNote.file_url.startsWith('/api/') ? selectedNote.file_url : `/api${selectedNote.file_url}`}`}
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain",
                        backgroundColor: "#000"
                      }}
                      onError={(e) => {
                        console.error("Video loading error for note:", selectedNote.id, e);
                        setError("Failed to load video. Please try refreshing the page.");
                      }}
                      onLoadStart={() => {
                        console.log("Starting to load video for note:", selectedNote.id);
                        setError(""); // Clear any previous errors
                      }}
                      onLoadedData={() => {
                        console.log("Video loaded successfully for note:", selectedNote.id);
                        setError("");
                      }}
                    />
                    {error && (
                      <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
                        {error}
                      </Alert>
                    )}
                  </Box>
                ) : selectedNote.file_type === "DOCX" ? (
                  <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button 
                      variant="contained" 
                      href={`${import.meta.env.VITE_API_BASE_URL}${selectedNote.file_url.startsWith('/api/') ? selectedNote.file_url : `/api${selectedNote.file_url}`}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download DOCX File
                    </Button>
                  </Box>
                ) : (
                  <PDFViewer
                    fileUrl={selectedNote.file_url}
                    onDownload={() => handleDownload(selectedNote)}
                  />
                )}
              </Box>
              {selectedNote.status === "PENDING" && (
                <Box>
                  <TextField
                    fullWidth
                    label="Review Remarks"
                    multiline
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleReview(selectedNote.id, "APPROVED")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleReview(selectedNote.id, "REJECTED")}
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminNotesReview;

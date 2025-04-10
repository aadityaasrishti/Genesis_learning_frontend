import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  IconButton,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  styled,
  SelectChangeEvent,
  CircularProgress,
  TextField,
} from "@mui/material";
import {
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Close as CloseIcon,
  PictureAsPdf,
  Description,
  VideoLibrary,
  Folder,
  Search as SearchIcon,
} from "@mui/icons-material";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PDFViewer from "../Common/PDFViewer";

interface Note {
  id: number;
  topic: string;
  description: string;
  file_url: string;
  file_type: string;
  created_at: string;
  teacher: {
    name: string;
  };
}

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const NoteHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const PreviewModal = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    width: '90%',
    maxWidth: 1200,
    height: '90vh',
  },
}));

const PreviewContent = styled(Box)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const PreviewBody = styled(Box)({
  flex: 1,
  position: 'relative',
  '& iframe, & video': {
    width: '100%',
    height: '100%',
    border: 'none',
  },
});

const StudentNotes: React.FC<{ class_id: string }> = ({ class_id }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [viewType, setViewType] = useState<"list" | "grid">("grid");
  const [error, setError] = useState("");
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEnrolledSubjects();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [selectedSubject]);

  const fetchEnrolledSubjects = async () => {
    console.log("Fetching enrolled subjects for student");
    try {
      const response = await api.get("/auth/me");
      if (response.data.student?.subjects) {
        const subjects = response.data.student.subjects
          .split(",")
          .map((s: string) => s.trim());
        console.log("Successfully fetched enrolled subjects:", subjects);
        setEnrolledSubjects(subjects);
      }
    } catch (err) {
      console.error("Failed to load enrolled subjects:", err);
      setError("Failed to load enrolled subjects");
    }
  };

  const fetchNotes = async () => {
    console.log("Fetching notes for student", { class_id, selectedSubject });
    try {
      setLoading(true);
      if (selectedSubject) {
        const response = await api.get(
          `/notes/class/${class_id}/subject/${selectedSubject}`
        );
        console.log(`Successfully fetched ${response.data.length} notes for ${selectedSubject}`);
        setNotes(response.data);
      } else {
        console.log("Fetching notes for all subjects:", enrolledSubjects);
        const allNotesPromises = enrolledSubjects.map((subject) =>
          api.get(`/notes/class/${class_id}/subject/${subject}`)
        );
        const responses = await Promise.all(allNotesPromises);
        const allNotes = responses.flatMap((response) => response.data);
        console.log(`Successfully fetched ${allNotes.length} total notes across all subjects`);
        setNotes(allNotes);
      }
      setError("");
    } catch (error) {
      console.error("Failed to fetch notes:", error);
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

  const handleDownload = async (note: Note) => {
    console.log("Attempting to download note:", { id: note.id, type: note.file_type });
    if (note.file_type === "VIDEO") {
      console.log("Video download not allowed - streaming only");
      setError("Video files can only be viewed online, not downloaded.");
      return;
    }

    try {
      const url = note.file_url.startsWith("/api/")
        ? `${import.meta.env.VITE_API_BASE_URL}${note.file_url}`
        : `${import.meta.env.VITE_API_BASE_URL}/api${note.file_url}`;

      console.log("Downloading file from:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = note.topic + getFileExtension(note.file_type);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      console.log("File download successful");
    } catch (error) {
      console.error("Error downloading file:", error);
      setError("Failed to download file. Please try again.");
    }
  };

  const getFileExtension = (fileType: string): string => {
    switch (fileType) {
      case "PDF":
        return ".pdf";
      case "DOCX":
        return ".docx";
      case "VIDEO":
        return ".mp4";
      default:
        return "";
    }
  };

  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSelectedSubject(event.target.value);
  };

  const handleViewTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewType: "list" | "grid"
  ) => {
    if (newViewType !== null) {
      setViewType(newViewType);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      note.topic.toLowerCase().includes(searchLower) ||
      note.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Learning Materials</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Subject</InputLabel>
              <Select
                value={selectedSubject}
                onChange={handleSubjectChange}
                label="Select Subject"
              >
                <MenuItem value="">All Subjects</MenuItem>
                {enrolledSubjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewTypeChange}
            >
              <ToggleButton value="grid">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ListViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredNotes.length === 0 ? (
              <Grid item xs={12}>
                <Typography align="center" color="text.secondary">
                  {searchQuery
                    ? "No materials found matching your search"
                    : selectedSubject
                    ? `No materials available for ${selectedSubject}`
                    : "No learning materials available"}
                </Typography>
              </Grid>
            ) : (
              filteredNotes.map((note) => (
                <Grid
                  item
                  xs={12}
                  sm={viewType === "grid" ? 6 : 12}
                  md={viewType === "grid" ? 4 : 12}
                  key={note.id}
                >
                  <StyledCard>
                    <CardContent>
                      <NoteHeader>
                        {getFileIcon(note.file_type)}
                        <Typography variant="h6" component="h3">
                          {note.topic}
                        </Typography>
                      </NoteHeader>
                      <Typography color="text.secondary" paragraph>
                        {note.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Uploaded by: {note.teacher.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {new Date(note.created_at).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                        {note.file_url && (
                          <Button
                            variant="contained"
                            onClick={() => setSelectedNote(note)}
                            fullWidth
                          >
                            Preview
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))
            )}
          </Grid>
        )}

        <PreviewModal
          open={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          maxWidth={false}
        >
          {selectedNote && (
            <PreviewContent>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedNote.topic}</Typography>
                <IconButton onClick={() => setSelectedNote(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <PreviewBody>
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
                      onClick={() => handleDownload(selectedNote)}
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
              </PreviewBody>
              {selectedNote.file_type !== "VIDEO" && (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={() => handleDownload(selectedNote)}
                  >
                    Download
                  </Button>
                </Box>
              )}
            </PreviewContent>
          )}
        </PreviewModal>
      </Box>
    </Container>
  );
};

// Wrapper component that provides class_id
const StudentNotesWrapper: React.FC = () => {
  const { user } = useAuth();
  const studentClass = user?.student?.class_id;

  if (!studentClass) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Unable to determine your class</Typography>
      </Box>
    );
  }

  return <StudentNotes class_id={studentClass} />;
};

export { StudentNotesWrapper as default, StudentNotes };

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  styled,
  FormControl,
  InputLabel,
  Paper,
  SelectChangeEvent,
} from "@mui/material";
import api from "../../services/api";

const Container = styled(Paper)(({ theme }) => ({
  maxWidth: 800,
  margin: "0 auto",
  padding: theme.spacing(3),
}));

const Form = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

const FormGroup = styled(FormControl)({
  width: "100%",
});

const FileInput = styled("input")(({ theme }) => ({
  margin: theme.spacing(1, 0),
}));

const TeacherNotesUpload: React.FC = () => {
  const [formData, setFormData] = useState({
    class_id: "",
    subject: "",
    topic: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await api.get("/auth/teacher-data");
        setAssignedClasses(response.data.classes || []);
        setAssignedSubjects(response.data.subjects || []);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setMessage("Failed to fetch assigned classes and subjects");
      }
    };

    fetchTeacherData();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      if (file) {
        data.append("file", file);
      }
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      await api.post("/notes", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Notes uploaded successfully! Waiting for admin approval.");
      setFormData({ class_id: "", subject: "", topic: "", description: "" });
      setFile(null);
    } catch (error) {
      setMessage("Failed to upload notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Upload Learning Material
      </Typography>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <FormControl fullWidth>
            <InputLabel>Class</InputLabel>
            <Select
              name="class_id"
              value={formData.class_id}
              onChange={handleSelectChange}
              required
              label="Class"
            >
              <MenuItem value="">Select Class</MenuItem>
              {assignedClasses.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <FormControl fullWidth>
            <InputLabel>Subject</InputLabel>
            <Select
              name="subject"
              value={formData.subject}
              onChange={handleSelectChange}
              required
              label="Subject"
            >
              <MenuItem value="">Select Subject</MenuItem>
              {assignedSubjects.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <TextField
            fullWidth
            label="Topic"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            required
            placeholder="Enter topic name"
          />
        </FormGroup>

        <FormGroup>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Enter description"
            multiline
            rows={4}
          />
        </FormGroup>

        <FormGroup>
          <Typography variant="subtitle1" gutterBottom>
            Upload File (PDF, DOCX, or Video)
          </Typography>
          <FileInput
            type="file"
            accept=".pdf,.docx,.mp4,.webm"
            onChange={handleFileChange}
            required
          />
        </FormGroup>

        {message && (
          <Alert severity={message.includes("success") ? "success" : "error"}>
            {message}
          </Alert>
        )}

        <Button
          type="submit"
          disabled={loading}
          variant="contained"
          color="primary"
          size="large"
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </Form>
    </Container>
  );
};

export default TeacherNotesUpload;

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import {
  CircularProgress,
  Alert,
  Button,
  Typography,
  Box,
} from "@mui/material";
import {
  StyledPaper,
  FormField,
  StyledTextField,
} from "../../theme/StyledComponents";

interface ExtraClass {
  id: number;
  class_id: string;
  subject: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
}

const EditExtraClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [extraClass, setExtraClass] = useState<ExtraClass | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExtraClass = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/extra-class/${id}`);
        setExtraClass(response.data);
        setFormData({
          date: response.data.date,
          start_time: response.data.start_time,
          end_time: response.data.end_time,
          description: response.data.description || "",
        });
      } catch (error: any) {
        console.error("Error fetching extra class:", error);
        setError(
          error.response?.data?.error || "Failed to fetch extra class details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExtraClass();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setIsLoading(true);
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error("Invalid extra class ID");
      }

      await api.put(`/extra-class/${numericId}`, formData);
      alert("Extra class updated successfully");
      navigate(`/dashboard/mark-extra-attendance?extraClassId=${numericId}`);
    } catch (error: any) {
      console.error("Error updating extra class:", error);
      setError(error.response?.data?.error || "Failed to update extra class");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!extraClass) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Extra class not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <StyledPaper>
        <Typography variant="h5" gutterBottom>
          Edit Extra Class
        </Typography>

        <FormField>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Class:</strong> {extraClass.class_id}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Subject:</strong> {extraClass.subject}
          </Typography>
        </FormField>

        <form onSubmit={handleSubmit}>
          <FormField>
            <StyledTextField
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormField>

          <FormField>
            <StyledTextField
              type="time"
              label="Start Time"
              value={formData.start_time}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, start_time: e.target.value }))
              }
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormField>

          <FormField>
            <StyledTextField
              type="time"
              label="End Time"
              value={formData.end_time}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, end_time: e.target.value }))
              }
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormField>

          <FormField>
            <StyledTextField
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              fullWidth
            />
          </FormField>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Extra Class"}
          </Button>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default EditExtraClass;

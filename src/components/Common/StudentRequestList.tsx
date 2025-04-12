import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  styled,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  position: "relative",
  "&.highlight-request": {
    animation: "highlightFade 2s",
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  "& img": {
    maxWidth: "100%",
    maxHeight: 200,
    borderRadius: theme.shape.borderRadius,
  },
}));

interface StudentRequest {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  created_at: string;
  image_url: string | null;
  student_id: number;
  student?: {
    user: {
      name: string;
    };
  };
}

interface StudentRequestListProps {
  userRole: string;
  studentId?: number | string;
  fromNotification?: boolean;
}

const StudentRequestList = ({
  userRole,
  studentId,
  fromNotification,
}: StudentRequestListProps) => {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<StudentRequest[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setError(null);
      const endpoint =
        userRole === "admin" || userRole === "support_staff"
          ? "/student/requests/all"
          : "/student/requests";

      const response = await api.get(endpoint);
      setRequests(response.data);
      setFilteredRequests(response.data);
    } catch (error: any) {
      setError(
        error.response?.data?.error ||
          "Failed to load requests. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userRole]);

  useEffect(() => {
    let filtered = [...requests];
    if (statusFilter !== "ALL") {
      filtered = requests.filter((request) => request.status === statusFilter);
    }
    setFilteredRequests(filtered);
  }, [statusFilter, requests]);

  useEffect(() => {
    if (fromNotification) {
      const requestCards = document.querySelectorAll(".request-card");
      requestCards.forEach((card) => {
        card.classList.add("highlight-request");
      });

      // Remove highlight after animation
      setTimeout(() => {
        requestCards.forEach((card) => {
          card.classList.remove("highlight-request");
        });
      }, 2000);
    }
  }, [fromNotification]);

  const handleStatusUpdate = async (requestId: number, newStatus: string) => {
    try {
      setError(null);
      await api.patch(`/student/requests/${requestId}/status`, {
        status: newStatus.toUpperCase(),
      });
      await fetchRequests();
    } catch (error: any) {
      setError(
        error.response?.data?.error ||
          "Failed to update status. Please try again."
      );
    }
  };

  const handleDelete = async (requestId: number) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        setError(null);
        await api.delete(`/student/requests/${requestId}`);
        await fetchRequests();
      } catch (error: any) {
        setError(
          error.response?.data?.error ||
            "Failed to delete request. Please try again."
        );
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="ALL">All Requests</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {filteredRequests.length === 0 ? (
        <Typography variant="h6" textAlign="center">
          No requests found
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredRequests.map((request) => (
            <Grid item xs={12} key={request.id}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {request.title}
                  </Typography>

                  {(userRole === "admin" || userRole === "support_staff") &&
                    request.student?.user && (
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Student: {request.student.user.name}
                      </Typography>
                    )}

                  <Typography variant="body1" paragraph>
                    {request.description}
                  </Typography>

                  <Box display="flex" gap={1} mb={2}>
                    <Chip
                      label={request.status}
                      color={
                        request.status === "APPROVED"
                          ? "success"
                          : request.status === "REJECTED"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                    />
                    <Chip label={request.type} size="small" />
                    <Chip
                      label={new Date(request.created_at).toLocaleDateString()}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {request.image_url && (
                    <ImageContainer>
                      <img src={request.image_url} alt="Request attachment" />
                    </ImageContainer>
                  )}

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                  >
                    {(userRole === "admin" || userRole === "support_staff") && (
                      <FormControl size="small">
                        <Select
                          value={request.status}
                          onChange={(e) =>
                            handleStatusUpdate(request.id, e.target.value)
                          }
                        >
                          <MenuItem value="PENDING">Pending</MenuItem>
                          <MenuItem value="APPROVED">Approved</MenuItem>
                          <MenuItem value="REJECTED">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    )}

                    {((userRole === "student" &&
                      studentId === request.student_id) ||
                      userRole === "admin" ||
                      userRole === "support_staff") && (
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(request.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default StudentRequestList;

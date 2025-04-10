import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Assignment as AssignmentIcon } from "@mui/icons-material";

interface Assignment {
  id: number;
  title: string;
  due_date: string;
  subject: string;
  status?: "pending" | "submitted";
}

interface UpcomingAssignmentsProps {
  role: "teacher" | "student";
}

const UpcomingAssignments: React.FC<UpcomingAssignmentsProps> = ({ role }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get("/assignments", {
          params: {
            limit: 5,
            upcoming: true,
          },
        });
        setAssignments(response.data.assignments);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upcoming {role === "teacher" ? "Class" : ""} Assignments
      </Typography>
      <Stack spacing={2}>
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <Card key={assignment.id} variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {assignment.title}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        label={assignment.subject}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Due: ${new Date(
                          assignment.due_date
                        ).toLocaleDateString()}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                      {role === "student" && (
                        <Chip
                          label={assignment.status}
                          size="small"
                          color={
                            assignment.status === "submitted"
                              ? "success"
                              : "warning"
                          }
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/dashboard/assignments")}
                    startIcon={<AssignmentIcon />}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="textSecondary" fontStyle="italic">
              No upcoming assignments
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default UpcomingAssignments;

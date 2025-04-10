import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Tab,
  Tabs,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import { MCQSession } from "../../types/mcq";
import { getTeacherSessions } from "../../services/mcqService";
import { TeacherMCQForm } from "../mcq/TeacherMCQForm";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const TeacherMCQPage = () => {
  const [sessions, setSessions] = useState<MCQSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<MCQSession | null>(
    null
  );
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getTeacherSessions();
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const columns: GridColDef<MCQSession & { student_name: string }>[] = [
    { field: "student_name", headerName: "Student Name", width: 200 },
    { field: "class_id", headerName: "Class", width: 100 },
    { field: "subject", headerName: "Subject", width: 120 },
    { field: "chapter", headerName: "Chapter", width: 120 },
    {
      field: "score",
      headerName: "Score",
      width: 100,
      type: "number",
      valueGetter: (
        params: GridRenderCellParams<MCQSession & { student_name: string }>
      ) => {
        if (!params || !params.row) return 0;
        const total = params.row.correct_count + params.row.incorrect_count;
        return total > 0 ? params.row.correct_count / total : 0;
      },
      renderCell: (params: GridRenderCellParams) => {
        const value = params.value;
        if (value === undefined || value === null) return "N/A";
        return `${(Number(value) * 100).toFixed(1)}%`;
      },
    },
    { field: "correct_count", headerName: "Correct", width: 100 },
    { field: "incorrect_count", headerName: "Incorrect", width: 100 },
    { field: "skipped_count", headerName: "Skipped", width: 100 },
    {
      field: "duration",
      headerName: "Duration",
      width: 120,
      renderCell: (params) => {
        const value = params.value;
        if (!value) return "";
        const mins = Math.floor(Number(value) / 60);
        const secs = Number(value) % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
      },
    },
    {
      field: "start_time",
      headerName: "Date",
      width: 150,
      renderCell: (params) => {
        const value = params.value;
        if (!value) return "";
        return new Date(value).toLocaleDateString();
      },
    },
  ];

  const rows = sessions.map((session) => ({
    ...session,
    id: session.id, // Explicitly set id for DataGrid
    student_name: session.student?.name || "Unknown",
  }));

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderSessionDetails = () => (
    <>
      <Button variant="outlined" onClick={() => setSelectedSession(null)} sx={{ mb: 2 }}>
        Back to Sessions List
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Session Details
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography>Student: {selectedSession?.student?.name}</Typography>
          <Typography>Subject: {selectedSession?.subject}</Typography>
          <Typography>Chapter: {selectedSession?.chapter}</Typography>
          <Typography>
            Date:{" "}
            {new Date(selectedSession?.start_time || "").toLocaleDateString()}
          </Typography>
          <Typography>
            Duration:{" "}
            {Math.floor(selectedSession?.duration || 0 / 60)}:
            {((selectedSession?.duration || 0) % 60)
              .toString()
              .padStart(2, "0")}
          </Typography>
          <Typography>
            Score:{" "}
            {(
              (selectedSession?.correct_count || 0) /
              (selectedSession?.questions?.length || 1)
            ).toFixed(1)}
            %
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          Questions
        </Typography>
        {selectedSession?.questions.map((q, index) => (
          <Paper key={index} sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Question {index + 1}: {q.question.question_text}
            </Typography>
            
            {q.question.image_url && (
              <Box sx={{ my: 2, maxWidth: "100%", textAlign: "center" }}>
                <img
                  src={q.question.image_url}
                  alt="Question image"
                  style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
                />
              </Box>
            )}

            <Typography
              color={
                q.selected_answer === null
                  ? "text.secondary"
                  : q.is_correct
                  ? "success.main"
                  : "error.main"
              }
            >
              {q.selected_answer === null
                ? "Skipped"
                : q.is_correct
                ? "✓ Correct"
                : "✗ Incorrect"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Student's Answer:{" "}
              {q.selected_answer !== undefined &&
              q.selected_answer !== null
                ? q.question.options[q.selected_answer]
                : "Skipped"}
            </Typography>
            <Typography variant="body2" color="success.main">
              Correct Answer:{" "}
              {q.question.correct_answer !== undefined
                ? q.question.options[q.question.correct_answer]
                : "Not available"}
            </Typography>
          </Paper>
        ))}
      </Paper>
    </>
  );

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 4 }}>
        MCQ Management
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Session Results" />
        <Tab label="Create Questions" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {selectedSession ? (
          renderSessionDetails()
        ) : (
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              onRowClick={(params: GridRowParams) => {
                const session = sessions.find((s) => s.id === params.row.id);
                if (session) setSelectedSession(session);
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: {
                  sortModel: [{ field: "start_time", sort: "desc" }],
                },
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TeacherMCQForm />
      </TabPanel>
    </Container>
  );
};

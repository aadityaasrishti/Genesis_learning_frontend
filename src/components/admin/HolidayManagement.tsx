import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

interface Holiday {
  id: number;
  date: string;
  name: string;
  description: string | null;
  type: string;
}

const HolidayManagement: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState({
    date: "",
    name: "",
    description: "",
    type: "HOLIDAY",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/holidays");
      setHolidays(response.data);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch holidays");
      console.error("Error fetching holidays:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api.post("/holidays", newHoliday);
      setNewHoliday({ date: "", name: "", description: "", type: "HOLIDAY" });
      await fetchHolidays();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to add holiday");
      console.error("Error adding holiday:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this holiday?"))
      return;

    setIsLoading(true);
    try {
      await api.delete(`/holidays/${id}`);
      await fetchHolidays();
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to delete holiday");
      console.error("Error deleting holiday:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Holiday Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 4 }}>
          <Box
            component="form"
            onSubmit={handleAddHoliday}
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              type="date"
              value={newHoliday.date}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, date: e.target.value })
              }
              required
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
              label="Date"
              sx={{ minWidth: 200 }}
            />

            <TextField
              value={newHoliday.name}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, name: e.target.value })
              }
              label="Holiday Name"
              required
              disabled={isLoading}
              sx={{ minWidth: 200 }}
            />

            <TextField
              value={newHoliday.description || ""}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, description: e.target.value })
              }
              label="Description (optional)"
              disabled={isLoading}
              sx={{ minWidth: 200 }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={newHoliday.type}
                onChange={(e: SelectChangeEvent) =>
                  setNewHoliday({ ...newHoliday, type: e.target.value })
                }
                disabled={isLoading}
                label="Type"
              >
                <MenuItem value="HOLIDAY">Holiday</MenuItem>
                <MenuItem value="SPECIAL_EVENT">Special Event</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ height: 56 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Add Holiday"
              )}
            </Button>
          </Box>
        </Paper>

        {isLoading && !holidays.length ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell>
                      {new Date(holiday.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{holiday.name}</TableCell>
                    <TableCell>{holiday.description}</TableCell>
                    <TableCell>{holiday.type}</TableCell>
                    <TableCell align="right">
                      <Button
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        variant="outlined"
                        color="error"
                        disabled={isLoading}
                        size="small"
                      >
                        {isLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default HolidayManagement;

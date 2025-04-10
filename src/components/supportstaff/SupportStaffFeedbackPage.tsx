import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  styled,
  Paper,
} from "@mui/material";
import SupportStaffNavbar from "./SupportStaffNavbar";
import FeedbackList from "../Common/FeedbackList";

const PageContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Section = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiToggleButton-root': {
    textTransform: 'none',
    minWidth: 120,
  },
}));

interface DateRange {
  startDate: string;
  endDate: string;
}

const SupportStaffFeedbackPage: React.FC = () => {
  const [filterType, setFilterType] = useState<"all" | "student" | "teacher">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: "all" | "student" | "teacher" | null
  ) => {
    if (newFilter !== null) {
      setFilterType(newFilter);
    }
  };

  return (
    <Box>
      <SupportStaffNavbar />
      <PageContainer maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Feedback Management System
        </Typography>

        <Section>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Filter Feedback
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Role Filter
            </Typography>
            <StyledToggleButtonGroup
              value={filterType}
              exclusive
              onChange={handleFilterChange}
              aria-label="feedback filter"
              color="primary"
            >
              <ToggleButton value="all">
                All Feedback
              </ToggleButton>
              <ToggleButton value="student">
                Student Feedback
              </ToggleButton>
              <ToggleButton value="teacher">
                Teacher Feedback
              </ToggleButton>
            </StyledToggleButtonGroup>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Date Range
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                InputLabelProps={{
                  shrink: true,
                }}
                label="Start Date"
              />
              <Typography sx={{ mx: 1 }}>to</Typography>
              <TextField
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                InputLabelProps={{
                  shrink: true,
                }}
                label="End Date"
              />
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Search
            </Typography>
            <TextField
              fullWidth
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="medium"
            />
          </Box>
        </Section>

        <Section>
          <Typography variant="h5" gutterBottom>
            Feedback List
          </Typography>
          <FeedbackList
            filterType={filterType}
            searchTerm={searchTerm}
            dateRange={dateRange}
            showControls
          />
        </Section>
      </PageContainer>
    </Box>
  );
};

export default SupportStaffFeedbackPage;

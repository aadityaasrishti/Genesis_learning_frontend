import React from "react";
import Calendar from "../Common/Calendar";
import StudentNavbar from "./StudentNavbar";
import { Box, Typography, Container, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

const PageContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const CalendarSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const StudentCalendarPage: React.FC = () => {
  return (
    <PageContainer>
      <StudentNavbar />
      <ContentContainer maxWidth="lg">
        <PageHeader>
          <Typography variant="h4" gutterBottom>
            My Academic Calendar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View your class schedule, assignments, exams, and important school events.
          </Typography>
        </PageHeader>
        <CalendarSection>
          <Calendar />
        </CalendarSection>
      </ContentContainer>
    </PageContainer>
  );
};

export default StudentCalendarPage;
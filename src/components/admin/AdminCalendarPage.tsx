import React from "react";
import Calendar from "../Common/Calendar";
import AdminNavbar from "./AdminNavbar";
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

const AdminCalendarPage: React.FC = () => {
  return (
    <PageContainer>
      <AdminNavbar />
      <ContentContainer maxWidth="lg">
        <PageHeader>
          <Typography variant="h4" gutterBottom>
            School Calendar Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administrative view of all school events, schedules, and activities.
          </Typography>
        </PageHeader>
        <CalendarSection>
          <Calendar />
        </CalendarSection>
      </ContentContainer>
    </PageContainer>
  );
};

export default AdminCalendarPage;
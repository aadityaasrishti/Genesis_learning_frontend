import { Box, Typography, styled } from "@mui/material";
import TeacherNavbar from "./TeacherNavbar";
import TeacherTasks from "./TeacherTasks";

const PageContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: "0 auto",
  padding: theme.spacing(3),
}));

const ContentSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

const TeacherTasksPage = () => {
  return (
    <PageContainer>
      <TeacherNavbar />
      <ContentSection>
        <Typography variant="h4" gutterBottom>
          Tasks
        </Typography>
        <TeacherTasks />
      </ContentSection>
    </PageContainer>
  );
};

export default TeacherTasksPage;

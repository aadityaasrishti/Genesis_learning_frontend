import StudentNavbar from "./StudentNavbar";
import ExtraClassList from "../extra-classes/ExtraClassList";
import { useAuth } from "../../context/AuthContext";
import { Typography } from "@mui/material";
import {
  PageContainer,
  ExtraClassesContainer,
} from "../../theme/StyledComponents";

const StudentExtraClassesPage = () => {
  const { user } = useAuth();
  const classId = user?.student?.class_id || "";

  return (
    <PageContainer>
      <StudentNavbar />
      <Typography variant="h4" gutterBottom>
        Extra Classes
      </Typography>
      <ExtraClassesContainer>
        <ExtraClassList
          classId={classId}
          showAddButton={false}
          userRole="student"
        />
      </ExtraClassesContainer>
    </PageContainer>
  );
};

export default StudentExtraClassesPage;

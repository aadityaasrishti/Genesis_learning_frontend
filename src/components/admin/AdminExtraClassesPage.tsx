import { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import { ClassSelect } from "../Auth/selections";
import ExtraClassList from "../extra-classes/ExtraClassList";
import { Typography } from "@mui/material";
import {
  PageContainer,
  ExtraClassesContainer,
  ClassSelectorWrapper,
} from "../../theme/StyledComponents";

const AdminExtraClassesPage = () => {
  const [selectedClass, setSelectedClass] = useState("all");

  return (
    <PageContainer>
      <AdminNavbar />
      <Typography variant="h4" gutterBottom>
        Extra Classes Management
      </Typography>
      <ExtraClassesContainer>
        <ClassSelectorWrapper>
          <ClassSelect
            label="Filter Extra Classes by Class:"
            value={selectedClass}
            onChange={setSelectedClass}
            includeAllOption={true}
          />
        </ClassSelectorWrapper>

        <ExtraClassList
          classId={selectedClass === "all" ? undefined : selectedClass}
          showAddButton={true}
          userRole="admin"
        />
      </ExtraClassesContainer>
    </PageContainer>
  );
};

export default AdminExtraClassesPage;

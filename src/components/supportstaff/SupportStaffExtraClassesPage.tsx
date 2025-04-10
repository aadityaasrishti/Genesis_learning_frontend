import { useState } from "react";
import SupportStaffNavbar from "./SupportStaffNavbar";
import ExtraClassList from "../extra-classes/ExtraClassList";
import { ClassSelect } from "../Auth/selections";
import ExtraClassModal from "../extra-classes/ExtraClassModal";
import { Typography, Button } from "@mui/material";
import {
  PageContainer,
  ExtraClassesContainer,
  ClassSelectorWrapper,
} from "../../theme/StyledComponents";

const SupportStaffExtraClassesPage = () => {
  const [selectedClass, setSelectedClass] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const handleExtraClassSuccess = () => {
    setShowModal(false);
  };

  return (
    <PageContainer>
      <SupportStaffNavbar />
      <Typography variant="h4" gutterBottom>
        Extra Classes Management
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowModal(true)}
        sx={{ mb: 3 }}
      >
        Schedule New Extra Class
      </Button>

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
          showAddButton={false}
          userRole="support_staff"
        />
      </ExtraClassesContainer>

      {showModal && (
        <ExtraClassModal
          onClose={() => setShowModal(false)}
          onSuccess={handleExtraClassSuccess}
        />
      )}
    </PageContainer>
  );
};

export default SupportStaffExtraClassesPage;

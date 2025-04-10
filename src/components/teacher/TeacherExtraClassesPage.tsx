import { useState } from "react";
import ExtraClassList from "../extra-classes/ExtraClassList";
import ExtraClassModal from "../extra-classes/ExtraClassModal";
import { useAuth } from "../../context/AuthContext";
import { Typography } from "@mui/material";
import {
  PageContainer,
  ExtraClassesContainer,
} from "../../theme/StyledComponents";

const TeacherExtraClassesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const userClasses = user?.teacher?.class_assigned?.split(",").map(c => c.trim()) || [];

  const handleExtraClassSuccess = () => {
    setShowModal(false);
  };

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        Extra Classes
      </Typography>
      <ExtraClassesContainer>
        {userClasses.length > 0 ? (
          <ExtraClassList
            classId={userClasses[0]} // Initially show first assigned class
            showAddButton={true}
            userRole={user?.role}
            onAddClick={() => setShowModal(true)}
          />
        ) : (
          <Typography color="text.secondary">No class assigned</Typography>
        )}
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

export default TeacherExtraClassesPage;

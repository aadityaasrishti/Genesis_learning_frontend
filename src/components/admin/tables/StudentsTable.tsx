import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Chip, Stack, Box, Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import { Student } from "../../../types/types";
import { StyledPaper } from "../../../theme/StyledComponents";
import { useState } from "react";

interface Props {
  students: Student[];
  onEdit: (student: Student) => void;
  onDeactivate: (userId: number) => void;
}

const StudentsTable: React.FC<Props> = ({ students, onEdit, onDeactivate }) => {
  const [popupContent, setPopupContent] = useState<{ title: string; content: string } | null>(null);

  const handleCellClick = (field: string, value: string) => {
    if (value && typeof value === 'string') {
      setPopupContent({
        title: field,
        content: value
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      valueGetter: (params) => params.row.user.name,
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Name", params.row.user.name)}>
          {params.row.user.name}
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      valueGetter: (params) => params.row.user.email,
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Email", params.row.user.email)}>
          {params.row.user.email}
        </div>
      ),
    },
    {
      field: "mobile",
      headerName: "Mobile",
      flex: 1,
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Mobile", params.row.mobile)}>
          {params.row.mobile}
        </div>
      ),
    },
    {
      field: "class_id",
      headerName: "Class",
      flex: 1,
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Class", params.row.class_id)}>
          {params.row.class_id}
        </div>
      ),
    },
    {
      field: "subjects",
      headerName: "Subjects",
      flex: 1,
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Subjects", params.row.subjects)}>
          {params.row.subjects}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row.user.is_active ? "Active" : "Inactive"}
          color={params.row.user.is_active ? "success" : "error"}
          variant="outlined"
        />
      ),
    },
    {
      field: "plan_status",
      headerName: "Plan Status",
      flex: 1,
      valueGetter: (params) => params.row.user.plan_status,
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      valueGetter: (params) =>
        new Date(params.row.user.created_at).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(params.row)}
            variant="outlined"
          >
            Edit
          </Button>
          <Button
            size="small"
            startIcon={<BlockIcon />}
            onClick={() => onDeactivate(params.row.user_id)}
            variant="outlined"
            color="error"
          >
            Deactivate
          </Button>
        </Stack>
      ),
    },
  ];

  const rows = students.map((student) => ({
    ...student,
  }));

  return (
    <StyledPaper>
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection={false}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog 
        open={Boolean(popupContent)} 
        onClose={() => setPopupContent(null)}
        maxWidth="sm"
        fullWidth
      >
        {popupContent && (
          <>
            <DialogTitle>{popupContent.title}</DialogTitle>
            <DialogContent>
              <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {popupContent.content}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </StyledPaper>
  );
};

export default StudentsTable;

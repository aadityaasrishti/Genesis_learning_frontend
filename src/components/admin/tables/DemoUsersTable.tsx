import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Chip, Stack, Box, Typography, Dialog, DialogTitle, DialogContent } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import { User } from "../../../types/types";
import { StyledPaper } from "../../../theme/StyledComponents";
import { useState } from "react";

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onUpgrade: (user: User) => void;
}

const DemoUsersTable = ({ users, onEdit, onUpgrade }: Props) => {
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
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Name", params.row.name)}>
          {params.row.name}
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Email", params.row.email)}>
          {params.row.email}
        </div>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Role", params.row.role)}>
          {params.row.role}
        </div>
      ),
    },
    {
      field: "class",
      headerName: "Class",
      flex: 1,
      valueGetter: (params) => params.row.class || "N/A",
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Class", params.row.class || "N/A")}>
          {params.row.class || "N/A"}
        </div>
      ),
    },
    {
      field: "subjects",
      headerName: "Subjects",
      flex: 1,
      valueGetter: (params) => params.row.subjects || "N/A",
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Subjects", params.row.subjects || "N/A")}>
          {params.row.subjects || "N/A"}
        </div>
      ),
    },
    {
      field: "plan_status",
      headerName: "Plan Status",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "demo" ? "warning" : "success"}
          variant="outlined"
        />
      ),
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
            startIcon={<UpgradeIcon />}
            onClick={() => onUpgrade(params.row)}
            variant="outlined"
            color="primary"
          >
            Upgrade
          </Button>
        </Stack>
      ),
    },
  ];

  const rows = users.map((user) => ({
    id: user.user_id,
    ...user,
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
        {users.length === 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 3,
              color: "text.secondary",
            }}
          >
            <Typography>No demo users found</Typography>
          </Box>
        )}
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

export default DemoUsersTable;

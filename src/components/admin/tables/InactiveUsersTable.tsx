import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Chip, Typography, Box, Dialog, DialogTitle, DialogContent } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { InactiveUser } from "../../../types/types";
import { StyledPaper } from "../../../theme/StyledComponents";
import { useState } from "react";

interface InactiveUsersTableProps {
  users: InactiveUser[];
  onReactivate: (userId: number) => void;
}

const InactiveUsersTable = ({
  users,
  onReactivate,
}: InactiveUsersTableProps) => {
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
      field: "role",
      headerName: "Role",
      flex: 1,
      valueGetter: (params) => params.row.user.role,
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Role", params.row.user.role)}>
          {params.row.user.role}
        </div>
      ),
    },
    {
      field: "plan_status",
      headerName: "Plan Status",
      flex: 1,
      valueGetter: (params) => params.row.user.plan_status,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "permanent" ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      field: "inactivation_date",
      headerName: "Inactivated On",
      flex: 1,
      valueGetter: (params) =>
        new Date(params.row.inactivation_date).toLocaleDateString(),
      renderCell: (params) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleCellClick("Inactivated On", new Date(params.row.inactivation_date).toLocaleDateString())}>
          {new Date(params.row.inactivation_date).toLocaleDateString()}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Button
          startIcon={<RestoreIcon />}
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => onReactivate(params.row.user_id)}
        >
          Reactivate
        </Button>
      ),
    },
  ];

  const rows = users.map((user) => ({
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
            <Typography>No inactive users found</Typography>
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

export default InactiveUsersTable;

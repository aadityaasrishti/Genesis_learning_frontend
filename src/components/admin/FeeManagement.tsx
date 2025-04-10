import React, { useState } from "react";
import FeeStructures from "./fee-management/FeeStructures";
import FeePayments from "./fee-management/FeePayments";
import FeeReports from "./fee-management/FeeReports";
import PaymentStatusTable from "./fee-management/PaymentStatusTable";
import { Box, Typography, Tabs, Tab, Paper, styled } from "@mui/material";

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1400,
  margin: "0 auto",
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ContentWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const FeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "Fee Structures", component: <FeeStructures /> },
    { label: "Fee Payments", component: <FeePayments /> },
    { label: "Payment Status", component: <PaymentStatusTable /> },
    { label: "Fee Reports", component: <FeeReports /> },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom>
        Fee Management
      </Typography>
      
      <ContentWrapper>
        <StyledTabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label}
              sx={{
                textTransform: 'none',
                minWidth: 120,
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 'medium',
                }
              }}
            />
          ))}
        </StyledTabs>
        
        <Box sx={{ mt: 3 }}>
          {tabs[activeTab].component}
        </Box>
      </ContentWrapper>
    </PageContainer>
  );
};

export default FeeManagement;

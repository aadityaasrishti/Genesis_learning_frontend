import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Container
} from "@mui/material";
import SalaryConfiguration from "./SalaryConfiguration";
import SalaryPaymentForm from "./SalaryPaymentForm";
import SalaryHistory from "./SalaryHistory";
import { useAuth } from "../../context/AuthContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`salary-tabpanel-${index}`}
      aria-labelledby={`salary-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `salary-tab-${index}`,
    'aria-controls': `salary-tabpanel-${index}`,
  };
};

const SalaryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const handleTabClick = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Salary Management
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabClick}
            aria-label="salary management tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {isAdmin ? [
              <Tab key="config" label="Salary Configuration" {...a11yProps(0)} />,
              <Tab key="payment" label="Process Payment" {...a11yProps(1)} />,
              <Tab key="history" label="Salary History" {...a11yProps(2)} />
            ] : [
              <Tab key="myconfig" label="My Salary Configuration" {...a11yProps(0)} />,
              <Tab key="myhistory" label="Salary History" {...a11yProps(1)} />
            ]}
          </Tabs>
        </Box>

        {isAdmin ? (
          <>
            <TabPanel value={activeTab} index={0}>
              <SalaryConfiguration />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <SalaryPaymentForm />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <SalaryHistory />
            </TabPanel>
          </>
        ) : (
          <>
            <TabPanel value={activeTab} index={0}>
              <SalaryConfiguration teacherId={user?.user_id} readOnly />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <SalaryHistory />
            </TabPanel>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default SalaryManagement;

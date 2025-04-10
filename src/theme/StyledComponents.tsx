import { styled } from "@mui/material/styles";
import {
  Box,
  Paper,
  Button,
  Card,
  TableCell,
  TableRow,
  Typography,
  TextField,
  Modal,
  Tabs,
  Tab,
  Container,
} from "@mui/material";

// Common container styles
export const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1200,
  margin: "0 auto",
}));

// Form components
export const FormContainer = styled(Container)(({ theme }) => ({
  maxWidth: 800,
  margin: "0 auto",
  padding: theme.spacing(3),
}));

export const FormField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  "& .MuiFormControl-root": {
    width: "100%",
  },
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

// Enhanced Paper component
export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
}));

// Custom Card styles
export const StyledCard = styled(Card)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
});

// Action buttons
export const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  padding: theme.spacing(1, 2),
}));

// Table styles
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  "&.header": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 600,
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

// Status badge container
export const StatusBadge = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 16,
  display: "inline-flex",
  alignItems: "center",
  fontSize: "0.875rem",
  fontWeight: 500,
  "&.success": {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  "&.warning": {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  "&.error": {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
}));

// Form section
export const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  "& .MuiFormControl-root": {
    marginBottom: theme.spacing(2),
  },
}));

// Dashboard grid container
export const DashboardGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(3),
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  padding: theme.spacing(3),
}));

// Stats card
export const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  "& .stat-value": {
    fontSize: "2rem",
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  "& .stat-label": {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
}));

// Extra Class specific components
export const ExtraClassCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  position: "relative",
  "&.current": {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  },
  "&.upcoming": {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
  "&.past": {
    borderLeft: `4px solid ${theme.palette.grey[400]}`,
    opacity: 0.8,
  },
  "&.highlight-class": {
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
  },
}));

export const LiveBadge = styled("span")(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontSize: "0.75rem",
  marginLeft: theme.spacing(1),
  display: "inline-block",
  verticalAlign: "middle",
}));

export const ExtraClassGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  "@media (min-width: 600px)": {
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
  },
}));

export const ClassInfo = styled("div")(({ theme }) => ({
  margin: theme.spacing(2, 0),
  "& > *": {
    marginBottom: theme.spacing(1),
  },
}));

export const CardActions = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  justifyContent: "flex-end",
}));

export const LoadingWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(4),
}));

export const NoClassesMessage = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.text.secondary,
  padding: theme.spacing(2),
}));

export const ExtraClassesContainer = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

export const ClassSelectorWrapper = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(3),
  maxWidth: "300px",
}));

export const ModalOverlay = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: 600,
    margin: 16,
  },
});

export const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(3),
  outline: "none",
  maxWidth: "90%",
  width: "500px",
  maxHeight: "90vh",
  overflowY: "auto",
  position: "relative",
}));

export const ModalHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(2),
  fontWeight: 600,
  fontSize: "1.5rem",
}));

export const ModalActions = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  marginTop: theme.spacing(3),
  borderTop: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(2),
}));

export const CloseButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  minWidth: "auto",
  padding: theme.spacing(0.5),
}));

// Form Within Modal
export const ModalFormField = styled(Box)(() => ({
  marginBottom: "20px",
}));

export const InfoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  "&.highlighted-request": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

// User Management specific components
export const ManagementContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1400,
  margin: "0 auto",
}));

export const ManagementHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  "& h2": {
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
  },
}));

export const FiltersSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: "flex",
  gap: theme.spacing(2),
  alignItems: "center",
  flexWrap: "wrap",
}));

export const SearchField = styled(TextField)(({ theme }) => ({
  minWidth: 300,
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
  },
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  minWidth: 100,
  fontWeight: 500,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

// Fee Management specific components
export const FeeContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1400,
  margin: "0 auto",
}));

export const FeeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  "& .MuiTypography-root": {
    marginBottom: theme.spacing(1),
  },
}));

export const FeeHeaderActions = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));

export const FeeDetailsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

export const FeeAmount = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: "1.25rem",
}));

export const PaymentStatusChip = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 16,
  fontSize: "0.875rem",
  fontWeight: 500,
  "&.paid": {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  "&.pending": {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  "&.overdue": {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
}));

// Attendance Marking Components
export const AttendanceContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1200,
  margin: "0 auto",
}));

export const AttendanceTable = styled(Box)(({ theme }) => ({
  width: "100%",
  borderCollapse: "collapse",
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: theme.shadows[1],
  "& th, & td": {
    padding: theme.spacing(2),
    textAlign: "left",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  "& th": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
}));

export const AttendanceSelectionField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  "& label": {
    display: "block",
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
}));

export const ExtraClassInfo = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  "& h3": {
    marginTop: 0,
    color: theme.palette.primary.main,
  },
}));

// Event Details Modal Components
export const EventModalPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  maxWidth: 500,
  width: "90%",
  position: "relative",
  boxShadow: theme.shadows[5],
}));

export const EventHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(2),
}));

export const EventTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  color: theme.palette.primary.main,
  fontWeight: 600,
  marginBottom: theme.spacing(1),
}));

export const EventDate = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
}));

export const EventContent = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const EventDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  lineHeight: 1.6,
  marginBottom: theme.spacing(2),
}));

export const EventDetails = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

export const DetailItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
}));

export const DetailLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
  minWidth: 100,
}));

export const DetailValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  flex: 1,
}));

export const EventActions = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(2),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

// Feedback Components
export const FeedbackContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: "0 auto",
  padding: theme.spacing(4),
}));

export const FeedbackList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const FeedbackItem = styled(Paper)(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
  },
}));

export const FeedbackMeta = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const RatingStars = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
  "& .star": {
    color: theme.palette.warning.main,
    fontSize: "1.5rem",
  },
  "& .star.empty": {
    color: theme.palette.grey[300],
  },
}));

export const FeedbackForm = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4),
  "& textarea": {
    width: "100%",
    minHeight: 120,
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    "&:focus": {
      outline: "none",
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
  },
}));

// Exam Notification Components
export const ExamNotificationsContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: "0 auto",
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

export const PreviewFile = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 600,
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.common.white,
  margin: theme.spacing(2.5, 0),
  position: "relative",
  overflow: "hidden",
  boxShadow: theme.shadows[1],
  "& iframe": {
    border: "none",
    background: theme.palette.common.white,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  "&:empty": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.grey[100],
    "&::after": {
      content: '"Upload a PDF file to preview"',
      color: theme.palette.text.secondary,
      fontStyle: "italic",
    },
  },
}));

export const NotificationForm = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3.75),
  boxShadow: theme.shadows[1],
  "& .form-group": {
    marginBottom: theme.spacing(2),
  },
  "& label": {
    display: "block",
    marginBottom: theme.spacing(0.625),
    fontWeight: 500,
  },
  "& input, & select, & textarea": {
    width: "100%",
    padding: theme.spacing(1, 1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  "& textarea": {
    minHeight: 100,
    resize: "vertical",
  },
}));

export const SyllabusUploadContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(2.5, 0),
  boxShadow: theme.shadows[1],
}));

export const SyllabusPreview = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  fontSize: "0.9em",
  color: theme.palette.success.main,
  backgroundColor: theme.palette.success.light,
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.shape.borderRadius,
  "& span": {
    maxWidth: 250,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));

export const ExamTable = styled(Box)(({ theme }) => ({
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: theme.shadows[1],
  marginTop: theme.spacing(2.5),
  "& th, & td": {
    padding: theme.spacing(2),
    textAlign: "left",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  "& th": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 600,
    textTransform: "uppercase",
    fontSize: "0.9em",
    letterSpacing: "0.5px",
  },
  "& tr:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Exam Title Input
export const ExamTitleInput = styled("input")(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1.5, 2),
  fontSize: "1.1em",
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: "all 0.2s ease",
  "&:focus": {
    outline: "none",
    boxShadow: `0 0 0 3px ${theme.palette.primary.light}`,
  },
  "&::placeholder": {
    color: theme.palette.text.secondary,
  },
}));

export const UploadButton = styled("label")(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(1),
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "translateY(-1px)",
  },
  "&.has-file": {
    backgroundColor: theme.palette.success.main,
  },
}));

export const PreviewSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3.75),
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  "& h2": {
    marginBottom: theme.spacing(2.5),
    color: theme.palette.text.primary,
  },
}));

export const PreviewContent = styled(Box)(({ theme }) => ({
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.background.default,
  "& h3": {
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
}));

export const PreviewExamItem = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  "& h4": {
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  "& p": {
    color: theme.palette.text.secondary,
    margin: theme.spacing(0.5, 0),
  },
}));

export const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  "& button": {
    padding: theme.spacing(0.75, 1.5),
    borderRadius: theme.shape.borderRadius,
    cursor: "pointer",
    fontSize: "0.9em",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    transition: "all 0.2s ease",
    border: "none",
    "&.download-btn": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    "&.delete-btn": {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
      "&:hover": {
        backgroundColor: theme.palette.error.dark,
      },
    },
  },
}));

// Task Management Components
export const TasksGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2),
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  padding: theme.spacing(2),
}));

export const TaskCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
  "&.highlight-task": {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(1.5),
  },
  "&.priority-high": {
    borderTop: `3px solid ${theme.palette.error.main}`,
  },
  "&.priority-medium": {
    borderTop: `3px solid ${theme.palette.warning.main}`,
  },
  "&.priority-low": {
    borderTop: `3px solid ${theme.palette.success.main}`,
  },
}));

export const TaskTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "1.1em",
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

export const TaskDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  flex: 1,
}));

export const TaskInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(1),
}));

export const PriorityTag = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontSize: "0.8em",
  fontWeight: 500,
  "&.high": {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  "&.medium": {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  "&.low": {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
}));

export const TaskStatus = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "center",
  "& select": {
    flex: 1,
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "&:disabled": {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.text.disabled,
    },
  },
}));

export const NoTasks = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2.5),
}));

export const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  padding: theme.spacing(12, 0),
  textAlign: "center",
}));

export const FeatureCard = styled(Card)(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

export const TimerSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.grey[50],
}));

export const TimerDisplay = styled(Typography)(({ theme }) => ({
  fontSize: "3rem",
  fontWeight: "bold",
  color: theme.palette.primary.main,
  margin: theme.spacing(3, 0),
}));

export const TestimonialCard = styled(Card)(({ theme }) => ({
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

export const PricingCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
  },
  "&.premium": {
    border: `2px solid ${theme.palette.secondary.main}`,
  },
}));

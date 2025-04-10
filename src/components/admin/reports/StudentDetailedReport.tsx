import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  LocalizationProvider,
  DateCalendar,
  PickersDay,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { format, isSameDay } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StudentReport {
  student: {
    user: {
      name: string;
      email: string;
      class: string;
    };
    guardian_name: string;
  };
  feeSummary: {
    payment_status: string;
    total_fee: number;
    total_paid: number;
    total_due: number;
    due_date: string;
    payment_history: Array<{
      payment_date: string;
      receipt_number: string;
      month: string;
      amount_paid: number;
      payment_mode: string;
      payment_status: string;
      discount_reason?: string;
    }>;
    recent_reminders: Array<{
      reminder_date: string;
      reminder_type: string;
      message: string;
    }>;
  };
  attendance: Array<{
    date: string;
    subject: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }>;
  extraClassAttendance: Array<{
    date: string;
    subject: string;
    status: "PRESENT" | "ABSENT" | "LATE";
    extra_class: {
      description: string;
    };
  }>;
  testSubmissions: Array<{
    grade: number;
    test: {
      title: string;
      subject: string;
      startTime: string;
    };
  }>;
  mcqSessions: Array<{
    subject: string;
    chapter: string;
    start_time: string;
    correct_count: number;
    incorrect_count: number;
  }>;
  assignments: Array<{
    grade: number | null;
    submitted_at: string;
    assignment: {
      title: string;
      subject: string;
      due_date: string;
    };
  }>;
  examResults: Array<{
    id: number;
    subject: string;
    exam_type: string;
    marks: number;
    total_marks: number;
    percentage: number;
    grade?: string;
    exam_date: string;
    remarks?: string;
  }>;
  dailyChallenges: Array<{
    score: number;
    submitted_at: string;
    challenge: {
      title: string;
      subject: string;
    };
  }>;
}

interface Props {
  studentId: number;
}

const StudentDetailedReport: React.FC<Props> = ({ studentId }) => {
  const [report, setReport] = useState<StudentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [extraClassCurrentMonth, setExtraClassCurrentMonth] = useState<Date>(
    new Date()
  );

  useEffect(() => {
    const fetchReport = async () => {
      if (!studentId) return;

      try {
        setLoading(true);
        const response = await api.reports.getStudentReport(studentId);

        if (!response.data) {
          throw new Error("No data received from server");
        }

        setReport(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load student report");
        console.error("Error fetching student report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [studentId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const renderEmptyMessage = (section: string) => (
    <TableRow>
      <TableCell colSpan={6} align="center">
        No {section} records available
      </TableCell>
    </TableRow>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !report || !report.student) {
    return (
      <Typography color="error" align="center">
        {error || "No report data available"}
      </Typography>
    );
  }

  const calculateAttendancePercentage = () => {
    if (!report.attendance?.length) return 0;
    const total = report.attendance.length;
    const present = report.attendance.filter(
      (a) => a.status === "PRESENT"
    ).length;
    return total ? Math.round((present / total) * 100) : 0;
  };

  const calculateAverageTestScore = () => {
    if (!report.testSubmissions?.length) return 0;
    const scores = report.testSubmissions.map((t) => t.grade);
    return scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  };

  const calculateExamPerformance = () => {
    if (!report?.examResults?.length)
      return { average: 0, highest: 0, lowest: 0 };

    const scores = report.examResults.map((result) => result.percentage);
    return {
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
    };
  };

  const getAttendanceForDate = (date: Date) => {
    if (!report?.attendance) return null;
    return report.attendance.find((a) => isSameDay(new Date(a.date), date));
  };

  const getExtraClassAttendanceForDate = (date: Date) => {
    if (!report?.extraClassAttendance) return null;
    return report.extraClassAttendance.find((a) =>
      isSameDay(new Date(a.date), date)
    );
  };

  const getAttendanceColor = (
    status: "PRESENT" | "ABSENT" | "LATE" | undefined
  ) => {
    switch (status) {
      case "PRESENT":
        return { background: "#4caf50", color: "#fff" }; // Green
      case "ABSENT":
        return { background: "#f44336", color: "#fff" }; // Red
      case "LATE":
        return { background: "#ffeb3b", color: "#000" }; // Yellow
      default:
        return { background: "transparent", color: "inherit" };
    }
  };

  const CustomDay = (props: any) => {
    const { day, ...other } = props;
    const attendance = getAttendanceForDate(day);
    const colors = getAttendanceColor(attendance?.status);

    return (
      <PickersDay
        {...other}
        day={day}
        sx={{
          ...colors,
          "&:hover": {
            ...colors,
            opacity: 0.8,
          },
          "&.Mui-selected": {
            ...colors,
            opacity: 0.9,
          },
        }}
      />
    );
  };

  const CustomExtraClassDay = (props: any) => {
    const { day, ...other } = props;
    const attendance = getExtraClassAttendanceForDate(day);
    const colors = getAttendanceColor(attendance?.status);

    return (
      <PickersDay
        {...other}
        day={day}
        sx={{
          ...colors,
          "&:hover": {
            ...colors,
            opacity: 0.8,
          },
          "&.Mui-selected": {
            ...colors,
            opacity: 0.9,
          },
        }}
      />
    );
  };

  const formatDailyChallengesData = () => {
    if (!report.dailyChallenges?.length) return [];

    return report.dailyChallenges.map((challenge) => ({
      ...challenge,
      submitted_at: format(new Date(challenge.submitted_at), "MMM dd"),
      subject: challenge.challenge.subject,
    }));
  };

  const calculateDailyChallengeStats = () => {
    if (!report.dailyChallenges?.length)
      return { average: 0, highest: 0, total: 0 };

    const scores = report.dailyChallenges.map((c) => c.score);
    return {
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      highest: Math.max(...scores),
      total: scores.length,
    };
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Student Report: {report.student.user.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="textSecondary">
        Class: {report.student.user.class} | Guardian:{" "}
        {report.student.guardian_name}
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
          <Box>
            <Typography variant="subtitle2">Attendance</Typography>
            <Typography variant="h4">
              {calculateAttendancePercentage()}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Average Test Score</Typography>
            <Typography variant="h4">{calculateAverageTestScore()}%</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Fee Status</Typography>
            <Typography variant="h4">
              <Chip
                label={report.feeSummary.payment_status}
                color={
                  report.feeSummary.payment_status === "PAID"
                    ? "success"
                    : "warning"
                }
              />
            </Typography>
          </Box>
        </Box>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Fee Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
                <Typography>
                  <strong>Total Fee:</strong>{" "}
                  {formatCurrency(report.feeSummary.total_fee)}
                </Typography>
                <Typography>
                  <strong>Paid:</strong>{" "}
                  {formatCurrency(report.feeSummary.total_paid)}
                </Typography>
                <Typography>
                  <strong>Due:</strong>{" "}
                  {formatCurrency(report.feeSummary.total_due)}
                </Typography>
                <Typography>
                  <strong>Due Date:</strong>{" "}
                  {format(new Date(report.feeSummary.due_date), "MMM dd, yyyy")}
                </Typography>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Receipt No.</TableCell>
                      <TableCell>Month</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Mode</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Discount Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.feeSummary.payment_history.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {format(
                            new Date(payment.payment_date),
                            "MMM dd, yyyy"
                          )}
                        </TableCell>
                        <TableCell>{payment.receipt_number}</TableCell>
                        <TableCell>{payment.month}</TableCell>
                        <TableCell>
                          {formatCurrency(payment.amount_paid)}
                        </TableCell>
                        <TableCell>{payment.payment_mode}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={payment.payment_status}
                            color={
                              payment.payment_status === "SUCCESS"
                                ? "success"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell>{payment.discount_reason}</TableCell>
                      </TableRow>
                    ))}
                    {report.feeSummary.payment_history.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No payment records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {report.feeSummary.recent_reminders.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recent Fee Reminders
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Message</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.feeSummary.recent_reminders.map(
                        (reminder, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {format(
                                new Date(reminder.reminder_date),
                                "MMM dd, yyyy"
                              )}
                            </TableCell>
                            <TableCell>{reminder.reminder_type}</TableCell>
                            <TableCell>{reminder.message}</TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Regular Attendance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateCalendar
                    value={currentMonth}
                    onChange={(newValue) =>
                      setCurrentMonth(newValue || new Date())
                    }
                    slots={{ day: CustomDay }}
                    sx={{
                      "& .MuiPickersDay-root": {
                        borderRadius: "50%",
                        "&:not(.Mui-selected)": {
                          borderColor: "transparent",
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: "#4caf50",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="caption">Present</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: "#f44336",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="caption">Absent</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: "#ffeb3b",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="caption">Late</Typography>
                  </Box>
                </Box>
              </Box>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ flex: 2 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.attendance?.length > 0
                      ? report.attendance.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {format(new Date(record.date), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>{record.subject}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={record.status}
                                color={
                                  record.status === "PRESENT"
                                    ? "success"
                                    : record.status === "ABSENT"
                                    ? "error"
                                    : "warning"
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      : renderEmptyMessage("attendance")}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Extra Class Attendance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateCalendar
                    value={extraClassCurrentMonth}
                    onChange={(newValue) =>
                      setExtraClassCurrentMonth(newValue || new Date())
                    }
                    slots={{ day: CustomExtraClassDay }}
                    sx={{
                      "& .MuiPickersDay-root": {
                        borderRadius: "50%",
                        "&:not(.Mui-selected)": {
                          borderColor: "transparent",
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: "#4caf50",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="caption">Present</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: "#f44336",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="caption">Absent</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: "#ffeb3b",
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="caption">Late</Typography>
                  </Box>
                </Box>
              </Box>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ flex: 2 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report?.extraClassAttendance?.length > 0
                      ? report.extraClassAttendance.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {format(new Date(record.date), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>{record.subject}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={record.status}
                                color={
                                  record.status === "PRESENT"
                                    ? "success"
                                    : record.status === "ABSENT"
                                    ? "error"
                                    : "warning"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {record.extra_class?.description || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))
                      : renderEmptyMessage("extra class attendance")}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Test Submissions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.testSubmissions?.length > 0
                    ? report.testSubmissions.map((test, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {format(
                              new Date(test.test.startTime),
                              "MMM dd, yyyy"
                            )}
                          </TableCell>
                          <TableCell>{test.test.subject}</TableCell>
                          <TableCell>{test.test.title}</TableCell>
                          <TableCell>{test.grade}%</TableCell>
                        </TableRow>
                      ))
                    : renderEmptyMessage("test submission")}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>MCQ Performance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Chapter</TableCell>
                    <TableCell>Correct</TableCell>
                    <TableCell>Incorrect</TableCell>
                    <TableCell>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.mcqSessions?.length > 0
                    ? report.mcqSessions.map((session, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {format(
                              new Date(session.start_time),
                              "MMM dd, yyyy"
                            )}
                          </TableCell>
                          <TableCell>{session.subject}</TableCell>
                          <TableCell>{session.chapter}</TableCell>
                          <TableCell>{session.correct_count}</TableCell>
                          <TableCell>{session.incorrect_count}</TableCell>
                          <TableCell>
                            {Math.round(
                              (session.correct_count /
                                (session.correct_count +
                                  session.incorrect_count)) *
                                100
                            )}
                            %
                          </TableCell>
                        </TableRow>
                      ))
                    : renderEmptyMessage("MCQ session")}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Assignment Submissions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.assignments?.length > 0
                    ? report.assignments.map((assignment, index) => (
                        <TableRow key={index}>
                          <TableCell>{assignment.assignment.title}</TableCell>
                          <TableCell>{assignment.assignment.subject}</TableCell>
                          <TableCell>
                            {format(
                              new Date(assignment.assignment.due_date),
                              "MMM dd, yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(assignment.submitted_at),
                              "MMM dd, yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            {assignment.grade !== null
                              ? `${assignment.grade}%`
                              : "Not graded"}
                          </TableCell>
                        </TableRow>
                      ))
                    : renderEmptyMessage("assignment")}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Exam Results</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {report.examResults?.length > 0 ? (
              <>
                <Box sx={{ mb: 3, display: "flex", gap: 3 }}>
                  <Card sx={{ minWidth: 200 }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Average Score
                      </Typography>
                      <Typography variant="h5">
                        {calculateExamPerformance().average.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ minWidth: 200 }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Highest Score
                      </Typography>
                      <Typography variant="h5">
                        {calculateExamPerformance().highest.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ minWidth: 200 }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Lowest Score
                      </Typography>
                      <Typography variant="h5">
                        {calculateExamPerformance().lowest.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Exam Type</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Total Marks</TableCell>
                        <TableCell>Percentage</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.examResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            {format(new Date(result.exam_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>{result.subject}</TableCell>
                          <TableCell>{result.exam_type}</TableCell>
                          <TableCell>{result.marks}</TableCell>
                          <TableCell>{result.total_marks}</TableCell>
                          <TableCell>{result.percentage.toFixed(1)}%</TableCell>
                          <TableCell>{result.grade || "-"}</TableCell>
                          <TableCell>{result.remarks || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Typography variant="body1" color="textSecondary" align="center">
                No exam results available
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Daily Challenges</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {report.dailyChallenges?.length > 0 ? (
              <>
                <Box sx={{ mb: 3, display: "flex", gap: 3 }}>
                  <Card sx={{ minWidth: 200 }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Average Score
                      </Typography>
                      <Typography variant="h5">
                        {calculateDailyChallengeStats().average.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ minWidth: 200 }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Highest Score
                      </Typography>
                      <Typography variant="h5">
                        {calculateDailyChallengeStats().highest}%
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card sx={{ minWidth: 200 }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Challenges Completed
                      </Typography>
                      <Typography variant="h5">
                        {calculateDailyChallengeStats().total}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ height: 300, mb: 3 }}>
                  <ResponsiveContainer>
                    <LineChart data={formatDailyChallengesData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="submitted_at"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        domain={[0, 100]}
                        label={{
                          value: "Score (%)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Challenge Score"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Challenge</TableCell>
                        <TableCell>Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.dailyChallenges.map((challenge, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {format(
                              new Date(challenge.submitted_at),
                              "MMM dd, yyyy"
                            )}
                          </TableCell>
                          <TableCell>{challenge.challenge.subject}</TableCell>
                          <TableCell>{challenge.challenge.title}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={`${challenge.score}%`}
                              color={
                                challenge.score >= 90
                                  ? "success"
                                  : challenge.score >= 70
                                  ? "primary"
                                  : "warning"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Typography variant="body1" color="textSecondary" align="center">
                No daily challenges available
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default StudentDetailedReport;

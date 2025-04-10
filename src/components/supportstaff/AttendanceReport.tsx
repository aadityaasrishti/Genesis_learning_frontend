import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScriptableContext as ChartScriptableContext,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import {
  Box,
  Typography,
  TextField,
  Button,
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Styled components
const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1200,
  margin: "0 auto",
}));

const FiltersContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: "wrap",
  "& .MuiTextField-root, & .MuiSelect-root": {
    minWidth: 150,
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(3),
  gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
  marginBottom: theme.spacing(3),
  "& .chart": {
    opacity: 0,
    transform: "translateY(20px)",
    animation: "fadeInUp 0.5s ease forwards",
  },
  "@keyframes fadeInUp": {
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const StyledTable = styled("table")(({ theme }) => ({
  width: "100%",
  borderCollapse: "collapse",
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
  "& tr:last-child td": {
    borderBottom: "none",
  },
}));

const StyledCell = styled(Box)(({ theme }) => ({
  "&.positive": {
    color: theme.palette.success.main,
  },
  "&.warning": {
    color: theme.palette.warning.main,
  },
  "&.negative": {
    color: theme.palette.error.main,
  },
}));

const TrendIndicator = styled(Box)(({ theme }) => ({
  display: "inline-block",
  marginLeft: theme.spacing(1),
  "&.trendUp": {
    color: theme.palette.success.main,
  },
  "&.trendDown": {
    color: theme.palette.error.main,
  },
  "&.trendStable": {
    color: theme.palette.info.main,
  },
}));

const LoadingMessage = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
}));

interface AttendanceReportData {
  class_id: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
  subject: string;
  date: string;
  students: {
    name: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }[];
}

const AttendanceReport: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [reportData, setReportData] = useState<AttendanceReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("/attendance/classes");
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const fetchSubjects = async () => {
        try {
          const response = await api.get("/attendance/subjects", {
            params: { classId: selectedClass },
          });
          setSubjects(response.data);
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      };
      fetchSubjects();
    }
  }, [selectedClass]);

  const generateReport = async () => {
    if (!selectedClass || !selectedSubject || !startDate || !endDate) {
      alert("Please select all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get("/attendance/detailed-report", {
        params: {
          classId: selectedClass,
          subject: selectedSubject,
          startDate,
          endDate,
        },
      });
      setReportData(response.data.daily_records);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedClass || !selectedSubject || !startDate || !endDate) {
      alert("Please select all required fields");
      return;
    }

    try {
      const response = await api.get("/attendance/export", {
        params: {
          classId: selectedClass,
          subject: selectedSubject,
          startDate,
          endDate,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `attendance_report_${selectedClass}_${selectedSubject}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting attendance:", error);
      alert("Failed to export attendance data");
    }
  };

  const calculateOverallStats = () => {
    if (reportData.length === 0) return null;

    const total = reportData.reduce(
      (acc, day) => {
        acc.present += day.present_count;
        acc.absent += day.absent_count;
        acc.late += day.late_count;
        return acc;
      },
      { present: 0, absent: 0, late: 0 }
    );

    const totalAttendance = total.present + total.absent + total.late;
    return {
      presentPercentage: (total.present / totalAttendance) * 100,
      absentPercentage: (total.absent / totalAttendance) * 100,
      latePercentage: (total.late / totalAttendance) * 100,
      present: total.present,
      absent: total.absent,
      late: total.late,
    };
  };

  const getTrend = (current: number, previous: number) => {
    const difference = current - previous;
    if (Math.abs(difference) < 0.5) return "stable";
    return difference > 0 ? "up" : "down";
  };

  const renderTrendIndicator = (
    currentDay: AttendanceReportData,
    index: number
  ) => {
    if (index === 0) return null;
    const previousDay = reportData[index - 1];
    const trend = getTrend(
      currentDay.attendance_percentage,
      previousDay.attendance_percentage
    );

    return (
      <TrendIndicator
        className={`trend${trend.charAt(0).toUpperCase() + trend.slice(1)}`}
      >
        {trend === "up" && "↑"}
        {trend === "down" && "↓"}
        {trend === "stable" && "→"}
      </TrendIndicator>
    );
  };

  const lineChartData = {
    labels: reportData.map((day) => new Date(day.date).toLocaleDateString()),
    datasets: [
      {
        label: "Present",
        data: reportData.map((day) => day.present_count),
        borderColor: "rgba(0, 184, 148, 1)",
        backgroundColor: (context: ChartScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(0, 184, 148, 0.1)";
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(0, 184, 148, 0.4)");
          gradient.addColorStop(1, "rgba(0, 184, 148, 0.05)");
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Absent",
        data: reportData.map((day) => day.absent_count),
        borderColor: "rgba(235, 59, 90, 1)",
        backgroundColor: (context: ChartScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(235, 59, 90, 0.1)";
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(235, 59, 90, 0.4)");
          gradient.addColorStop(1, "rgba(235, 59, 90, 0.05)");
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Late",
        data: reportData.map((day) => day.late_count),
        borderColor: "rgba(254, 164, 27, 1)",
        backgroundColor: (context: ChartScriptableContext<"line">) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(254, 164, 27, 0.1)";
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(254, 164, 27, 0.4)");
          gradient.addColorStop(1, "rgba(254, 164, 27, 0.05)");
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
            weight: 600,
          },
          color: "var(--text-primary, #2c3e50)",
          usePointStyle: true,
          pointStyle: "circle",
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset: any, i: number) => ({
              text: dataset.label,
              fillStyle: dataset.borderColor,
              hidden: !chart.isDatasetVisible(i),
              lineCap: "round",
              lineDash: [],
              lineDashOffset: 0,
              lineWidth: 2,
              strokeStyle: dataset.borderColor,
              pointStyle: "circle",
              datasetIndex: i,
            }));
          },
        },
      },
      title: {
        display: true,
        text: "Daily Attendance Trends",
        font: {
          size: 18,
          weight: "bold" as const,
        },
        padding: 20,
        color: "var(--text-primary, #2c3e50)",
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
        backgroundColor: "var(--bg-table, rgba(255, 255, 255, 0.98))",
        titleColor: "var(--text-primary, #2c3e50)",
        bodyColor: "var(--text-primary, #2c3e50)",
        borderColor: "var(--border-color, rgba(0, 0, 0, 0.1))",
        titleFont: {
          weight: 700,
          size: 14,
        },
        bodyFont: {
          size: 13,
          weight: 500,
        },
        padding: 12,
        boxPadding: 6,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          title: (tooltipItems: any) => {
            return new Date(tooltipItems[0].label).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          },
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "var(--border-color, rgba(0, 0, 0, 0.06))",
          drawBorder: false,
          drawTicks: true,
          tickLength: 8,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 10,
          color: "var(--text-primary, #666)",
          font: {
            weight: 500,
            size: 12,
          },
          stepSize: Math.max(
            1,
            Math.ceil(
              Math.max(
                ...reportData.map((day) =>
                  Math.max(day.present_count, day.absent_count, day.late_count)
                )
              ) / 10
            )
          ),
          callback: function (this: any, value: string | number) {
            const numValue = Number(value);
            if (Math.floor(numValue) === numValue) {
              return numValue;
            }
            return null;
          },
          maxTicksLimit: 10,
          autoSkip: true,
        },
        title: {
          display: true,
          text: "Number of Students",
          font: {
            size: 14,
            weight: 700,
          },
          color: "var(--text-primary, #2c3e50)",
          padding: { bottom: 10 },
        },
        min: 0,
        suggestedMax: Math.ceil(
          Math.max(
            ...reportData.map((day) =>
              Math.max(day.present_count, day.absent_count, day.late_count)
            )
          ) * 1.2
        ),
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
          drawOnChartArea: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 10,
          color: "var(--text-primary, #666)",
          font: {
            weight: 500,
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
        },
        title: {
          display: true,
          text: "Date",
          font: {
            size: 14,
            weight: 700,
          },
          color: "var(--text-primary, #2c3e50)",
          padding: { top: 10 },
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        hitRadius: 8,
        borderWidth: 2,
        hoverBorderWidth: 2,
        backgroundColor: "var(--bg-table, #ffffff)",
      },
      line: {
        tension: 0.3,
        borderWidth: 2.5,
        fill: true,
        spanGaps: true,
      },
    },
    animation: {
      duration: 750,
      easing: "easeInOutQuart" as const,
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
  };

  const stats = calculateOverallStats();
  const pieChartData = stats
    ? {
        labels: ["Present", "Absent", "Late"],
        datasets: [
          {
            data: [stats.present, stats.absent, stats.late],
            backgroundColor: [
              "rgba(0, 184, 148, 0.85)",
              "rgba(235, 59, 90, 0.85)",
              "rgba(254, 164, 27, 0.85)",
            ],
            hoverBackgroundColor: [
              "rgba(0, 184, 148, 1)",
              "rgba(235, 59, 90, 1)",
              "rgba(254, 164, 27, 1)",
            ],
            borderColor: "transparent",
            borderWidth: 0,
            offset: [15, 15, 15],
          },
        ],
      }
    : null;

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
          color: "var(--text-primary, #2c3e50)",
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} students (${percentage}%)`;
          },
        },
        backgroundColor: "var(--bg-table, rgba(255, 255, 255, 0.95))",
        titleColor: "var(--text-primary, #2c3e50)",
        bodyColor: "var(--text-primary, #2c3e50)",
        borderColor: "var(--border-color, rgba(0, 0, 0, 0.1))",
      },
    },
    cutout: "65%",
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
    maintainAspectRatio: true,
    backgroundColor: "transparent",
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Attendance Report
      </Typography>

      <FiltersContainer>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Select Class</InputLabel>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            label="Select Class"
          >
            {classes.map((cls) => (
              <MenuItem key={cls} value={cls}>
                {cls}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Select Subject</InputLabel>
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            label="Select Subject"
          >
            {subjects.map((subject) => (
              <MenuItem key={subject} value={subject}>
                {subject}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          label="Start Date"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          label="End Date"
          InputLabelProps={{ shrink: true }}
        />

        <Button
          onClick={generateReport}
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Report"}
        </Button>

        <Button
          onClick={handleExportCSV}
          variant="contained"
          color="success"
          disabled={
            !selectedClass || !selectedSubject || !startDate || !endDate
          }
        >
          Export to CSV
        </Button>
      </FiltersContainer>

      {isLoading ? (
        <LoadingMessage>Generating report...</LoadingMessage>
      ) : reportData.length > 0 ? (
        <>
          <ChartContainer>
            <Box className="chart">
              <Line options={lineChartOptions} data={lineChartData} />
            </Box>
            {pieChartData && (
              <Box className="chart">
                <Pie options={pieChartOptions} data={pieChartData} />
              </Box>
            )}
          </ChartContainer>

          <StyledTable>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Students</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((day, index) => (
                <tr key={index}>
                  <td>{new Date(day.date).toLocaleDateString()}</td>
                  <td>{day.total_students}</td>
                  <td>
                    <StyledCell className="positive">
                      {day.present_count}
                    </StyledCell>
                  </td>
                  <td>
                    <StyledCell className="negative">
                      {day.absent_count}
                    </StyledCell>
                  </td>
                  <td>
                    <StyledCell className="warning">
                      {day.late_count}
                    </StyledCell>
                  </td>
                  <td>
                    <StyledCell
                      className={
                        day.attendance_percentage >= 90
                          ? "positive"
                          : day.attendance_percentage >= 75
                          ? "warning"
                          : "negative"
                      }
                    >
                      {day.attendance_percentage.toFixed(1)}%
                      {renderTrendIndicator(day, index)}
                    </StyledCell>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </>
      ) : (
        <LoadingMessage>
          Select class, subject, and date range to generate the report
        </LoadingMessage>
      )}
    </Container>
  );
};

export default AttendanceReport;

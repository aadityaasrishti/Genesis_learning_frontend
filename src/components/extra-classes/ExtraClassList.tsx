import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import {
  ExtraClassCard,
  LiveBadge,
  ExtraClassGrid,
  ClassInfo,
  CardActions,
  PageContainer,
  LoadingWrapper,
  NoClassesMessage,
} from "../../theme/StyledComponents";

interface ExtraClass {
  id: number;
  class_id: string;
  subject: string;
  teacher: {
    name: string;
    user_id?: string;
  };
  creator?: {
    name: string;
    role: string;
  };
  date: string;
  start_time: string;
  end_time: string;
  description?: string;
  created_by?: string;
}

interface ExtraClassListProps {
  classId?: string;
  showAddButton: boolean;
  onAddClick?: () => void;
  userRole?: string;
}

const ExtraClassList = ({
  classId,
  showAddButton,
  onAddClick,
  userRole,
}: ExtraClassListProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromNotification = location.state?.fromNotification;
  const [extraClasses, setExtraClasses] = useState<ExtraClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExtraClasses = async () => {
      try {
        let endpoint = "/extra-class";
        if (classId) {
          endpoint = `/extra-class/class/${classId}`;
        }

        const response = await api.get(endpoint);
        const classes = response.data.map((ec: any) => ({
          ...ec,
          teacher: { name: ec.teacher?.name || "Unknown Teacher" },
        }));
        setExtraClasses(classes);
      } catch (err: any) {
        console.error("Error fetching extra classes:", err);
        setError(err.response?.data?.error || "Failed to fetch extra classes");
      } finally {
        setLoading(false);
      }
    };

    fetchExtraClasses();
  }, [classId]);

  // Auto-scroll to highlighted class when coming from notification
  useEffect(() => {
    if (fromNotification) {
      const currentSection = document.querySelector(".classes-grid");
      if (currentSection) {
        currentSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [fromNotification]);

  const now = new Date();

  const formatDateTime = (date: string, time: string) => {
    const formattedDate = new Date(date + "T" + time);
    return {
      date: formattedDate.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: formattedDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const currentClasses = extraClasses.filter((extraClass) => {
    const classDate = new Date(extraClass.date + "T" + extraClass.start_time);
    const endTime = new Date(extraClass.date + "T" + extraClass.end_time);
    return classDate <= now && endTime >= now;
  });

  const upcomingClasses = extraClasses.filter((extraClass) => {
    const classDate = new Date(extraClass.date + "T" + extraClass.start_time);
    return classDate > now;
  });

  const previousClasses = extraClasses.filter((extraClass) => {
    const endTime = new Date(extraClass.date + "T" + extraClass.end_time);
    return endTime < now;
  });

  const renderClassCard = (
    extraClass: ExtraClass,
    status: "current" | "upcoming" | "past"
  ) => {
    const { date } = formatDateTime(extraClass.date, extraClass.start_time);
    const startTime = formatDateTime(
      extraClass.date,
      extraClass.start_time
    ).time;
    const endTime = formatDateTime(extraClass.date, extraClass.end_time).time;

    const canMarkAttendance =
      userRole === "admin" || userRole === "support_staff";

    return (
      <ExtraClassCard
        key={extraClass.id}
        className={`${status} ${fromNotification ? "highlight-class" : ""}`}
      >
        <Typography variant="h6" component="h4">
          {extraClass.subject}
          {status === "current" && <LiveBadge>Live Now</LiveBadge>}
        </Typography>

        <ClassInfo>
          <Typography>
            <strong>Date:</strong> {date}
          </Typography>
          <Typography>
            <strong>Time:</strong> {startTime} - {endTime}
          </Typography>
          <Typography>
            <strong>Class:</strong> {extraClass.class_id}
          </Typography>
          <Typography>
            <strong>Teacher:</strong> {extraClass.teacher.name}
          </Typography>
          {userRole === "support_staff" && extraClass.creator && (
            <Typography>
              <strong>Created by:</strong> {extraClass.creator.name}
              <Typography
                component="span"
                sx={{ ml: 1, color: "text.secondary", fontStyle: "italic" }}
              >
                ({extraClass.creator.role.toLowerCase().replace("_", " ")})
              </Typography>
            </Typography>
          )}
          {extraClass.description && (
            <Typography>
              <strong>Description:</strong> {extraClass.description}
            </Typography>
          )}
        </ClassInfo>

        <CardActions>
          {canMarkAttendance && (
            <Button
              variant="contained"
              color="success"
              onClick={() =>
                navigate(
                  `/dashboard/mark-extra-attendance?extraClassId=${extraClass.id}`
                )
              }
            >
              Mark Attendance
            </Button>
          )}
          {(userRole === "admin" ||
            userRole === "support_staff" ||
            (userRole === "teacher" &&
              extraClass.teacher.user_id === extraClass.created_by)) && (
            <>
              <Button
                variant="outlined"
                onClick={() =>
                  navigate(`/dashboard/extra-classes/edit/${extraClass.id}`)
                }
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this extra class? This will also delete all attendance records associated with this class."
                    )
                  ) {
                    try {
                      const response = await api.delete(
                        `/extra-class/${extraClass.id}`
                      );
                      if (response.data.success) {
                        alert(response.data.message);
                        window.location.reload();
                      }
                    } catch (error: any) {
                      alert(
                        `Error: ${
                          error.response?.data?.error ||
                          "Failed to delete extra class"
                        }`
                      );
                    }
                  }
                }}
              >
                Delete
              </Button>
            </>
          )}
        </CardActions>
      </ExtraClassCard>
    );
  };

  if (loading)
    return (
      <LoadingWrapper>
        <CircularProgress />
      </LoadingWrapper>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <PageContainer>
      {showAddButton && onAddClick && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onAddClick}
            fullWidth
          >
            Schedule Extra Class
          </Button>
        </Box>
      )}

      {currentClasses.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom>
            Currently Running Classes
          </Typography>
          <ExtraClassGrid>
            {currentClasses.map((extraClass) =>
              renderClassCard(extraClass, "current")
            )}
          </ExtraClassGrid>
        </>
      )}

      <Typography variant="h5" gutterBottom>
        Upcoming Extra Classes
      </Typography>
      <ExtraClassGrid>
        {upcomingClasses.length === 0 ? (
          <NoClassesMessage>
            No upcoming extra classes scheduled
          </NoClassesMessage>
        ) : (
          upcomingClasses.map((extraClass) =>
            renderClassCard(extraClass, "upcoming")
          )
        )}
      </ExtraClassGrid>

      <Typography variant="h5" gutterBottom>
        Previous Extra Classes
      </Typography>
      <ExtraClassGrid>
        {previousClasses.length === 0 ? (
          <NoClassesMessage>No previous extra classes found</NoClassesMessage>
        ) : (
          previousClasses.map((extraClass) =>
            renderClassCard(extraClass, "past")
          )
        )}
      </ExtraClassGrid>
    </PageContainer>
  );
};

export default ExtraClassList;

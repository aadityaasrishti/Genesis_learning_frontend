import React from "react";
import { Modal, Button, Typography } from "@mui/material";
import { stringToColor } from "../../utils/colorUtils";
import {
  EventModalPaper,
  EventHeader,
  EventTitle,
  EventContent,
  EventDetails,
  DetailItem,
  DetailLabel,
  DetailValue,
  EventActions,
} from "../../theme/StyledComponents";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    start: Date;
    end: Date;
    extendedProps: {
      type: string;
      teacher?: string;
      description?: string;
      classId?: string;
      status?: "pending" | "submitted" | "overdue";
      dueDate?: string;
      submissionStats?: {
        submitted: number;
        total: number;
      };
      subject?: string;
      syllabus_url?: string;
    };
  } | null;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  if (!isOpen || !event) return null;

  const isHoliday = event.extendedProps.type === "holiday";
  const isAssignment = event.extendedProps.type === "assignment";
  const isExam = event.extendedProps.type === "exam";

  const formattedDate =
    isHoliday || isExam
      ? new Date(event.start).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : `${new Date(event.start).toLocaleString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} - ${new Date(event.end).toLocaleString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })}`;

  const handleSyllabusDownload = (url: string) => {
    window.open(url, "_blank");
  };

  const primaryColor =
    event.extendedProps.type === "holiday"
      ? "#ff4444"
      : event.extendedProps.type === "assignment"
      ? "#2196F3"
      : event.extendedProps.type === "exam" && event.extendedProps.subject
      ? stringToColor(event.extendedProps.subject)
      : "#4CAF50";

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="event-details-modal"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <EventModalPaper
        sx={{
          borderTop: `4px solid ${primaryColor}`,
        }}
      >
        <EventHeader>
          <EventTitle>{event.title}</EventTitle>
          <Button
            onClick={onClose}
            sx={{
              minWidth: "auto",
              p: 0.5,
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            ×
          </Button>
        </EventHeader>

        <EventContent>
          <EventDetails>
            <DetailItem>
              <DetailLabel>Type:</DetailLabel>
              <DetailValue>
                {event.extendedProps.type
                  .split("_")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
              </DetailValue>
            </DetailItem>

            {event.extendedProps.subject && (
              <DetailItem>
                <DetailLabel>Subject:</DetailLabel>
                <DetailValue>{event.extendedProps.subject}</DetailValue>
              </DetailItem>
            )}

            <DetailItem>
              <DetailLabel>{isAssignment ? "Due Date" : "Date"}:</DetailLabel>
              <DetailValue>{formattedDate}</DetailValue>
            </DetailItem>

            {event.extendedProps.description && (
              <DetailItem>
                <DetailLabel>Description:</DetailLabel>
                <DetailValue>{event.extendedProps.description}</DetailValue>
              </DetailItem>
            )}

            {event.extendedProps.teacher && (
              <DetailItem>
                <DetailLabel>Teacher:</DetailLabel>
                <DetailValue>{event.extendedProps.teacher}</DetailValue>
              </DetailItem>
            )}

            {event.extendedProps.classId && (
              <DetailItem>
                <DetailLabel>Class:</DetailLabel>
                <DetailValue>{event.extendedProps.classId}</DetailValue>
              </DetailItem>
            )}

            {isAssignment && event.extendedProps.status && (
              <DetailItem>
                <DetailLabel>Status:</DetailLabel>
                <DetailValue
                  sx={(theme) => ({
                    display: "inline-flex",
                    alignItems: "center",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    typography: "body2",
                    bgcolor:
                      event.extendedProps.status === "submitted"
                        ? theme.palette.success.light
                        : event.extendedProps.status === "overdue"
                        ? theme.palette.error.light
                        : theme.palette.warning.light,
                    color:
                      event.extendedProps.status === "submitted"
                        ? theme.palette.success.dark
                        : event.extendedProps.status === "overdue"
                        ? theme.palette.error.dark
                        : theme.palette.warning.dark,
                  })}
                >
                  {event.extendedProps.status.charAt(0).toUpperCase() +
                    event.extendedProps.status.slice(1)}
                </DetailValue>
              </DetailItem>
            )}

            {isAssignment && event.extendedProps.submissionStats && (
              <DetailItem>
                <DetailLabel>Submissions:</DetailLabel>
                <DetailValue>
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 500,
                      color: "primary.main",
                    }}
                  >
                    {event.extendedProps.submissionStats.submitted}
                  </Typography>
                  {" / "}
                  <Typography component="span">
                    {event.extendedProps.submissionStats.total} students
                  </Typography>
                </DetailValue>
              </DetailItem>
            )}
          </EventDetails>

          {isExam && event.extendedProps.syllabus_url && (
            <EventActions>
              <Button
                variant="contained"
                startIcon={<span>📄</span>}
                onClick={() =>
                  handleSyllabusDownload(event.extendedProps.syllabus_url!)
                }
              >
                Download Syllabus
              </Button>
            </EventActions>
          )}
        </EventContent>
      </EventModalPaper>
    </Modal>
  );
};

export default EventDetailsModal;

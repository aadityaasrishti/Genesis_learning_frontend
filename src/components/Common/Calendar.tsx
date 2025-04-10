import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, EventMountArg } from "@fullcalendar/core";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import LoadingSpinner from "./LoadingSpinner";
import EventDetailsModal from "./EventDetailsModal";
import { format } from "date-fns";
import { stringToColor } from "../../utils/colorUtils";
import "../../styles/Calendar.css";

const formatDateTime = (date: Date) => {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
    .replace("T", "")
    .replace("Z", "");
};

// Helper function to generate iCal file
const generateICalFile = (events: any[]) => {
  let iCalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EduManage//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  events.forEach((event) => {
    try {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      const eventType = event.extendedProps?.type || "event";
      const eventTitle = event.title || "Untitled Event";
      const eventDescription = event.extendedProps?.description || "";
      const eventTeacher = event.extendedProps?.teacher || "";

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn("Invalid date for event:", event);
        return; // Skip this event
      }

      iCalContent = iCalContent.concat(
        [
          "BEGIN:VEVENT",
          `UID:${eventType}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@edumanage`,
          `DTSTAMP:${formatDateTime(new Date())}`,
          `DTSTART:${formatDateTime(startDate)}`,
          `DTEND:${formatDateTime(endDate)}`,
          `SUMMARY:${eventTitle}`,
          eventDescription ? `DESCRIPTION:${eventDescription}` : "",
          eventTeacher
            ? `ORGANIZER;CN=${eventTeacher}:mailto:no-reply@edumanage.com`
            : "",
          `CATEGORIES:${eventType.toUpperCase()}`,
          "END:VEVENT",
        ].filter(Boolean)
      );
    } catch (error) {
      console.warn("Error processing event:", event, error);
    }
  });

  iCalContent.push("END:VCALENDAR");
  return iCalContent.join("\r\n");
};

interface CalendarEvent {
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
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  event: any;
}

interface CalendarFilters {
  eventTypes: string[];
  subjects: string[];
  classId?: string;
}

const Calendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<CalendarFilters>({
    eventTypes: [],
    subjects: [],
  });
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const { user } = useAuth();
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    event: null,
  });

  const eventTypes = [
    { value: "holiday", label: "Holidays" },
    { value: "assignment", label: "Assignments" },
    { value: "extra-class", label: "Extra Classes" },
    { value: "exam", label: "Exams" },
  ];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (user?.role === "teacher") {
          const response = await api.get("/auth/me");
          if (response.data.teacher?.class_assigned) {
            setAvailableClasses(
              response.data.teacher.class_assigned
                .split(",")
                .map((c: string) => c.trim())
            );
          }
        } else if (user?.role === "student") {
          const response = await api.get("/auth/me");
          if (response.data.student?.class_id) {
            setAvailableClasses([response.data.student.class_id]);
          }
        } else if (user?.role === "admin" || user?.role === "support_staff") {
          // Get all classes for admin and support staff
          setAvailableClasses([
            "Class 1",
            "Class 2",
            "Class 3",
            "Class 4",
            "Class 5",
            "Class 6",
            "Class 7",
            "Class 8",
            "Class 9",
            "Class 10",
            "Class 11",
            "Class 12",
          ]);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, [user]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;
      try {
        // Get subjects based on user role
        let subjects: string[] = [];
        if (user.role === "teacher") {
          const teacherData = await api.get(`/auth/teachers/${user.user_id}`);
          const classes =
            teacherData.data.class_assigned
              ?.split(",")
              .map((c: string) => c.trim()) || [];
          // Get subjects for first assigned class
          if (classes.length > 0) {
            const response = await api.get("/attendance/teachers/subjects", {
              params: { classId: classes[0] },
            });
            subjects = response.data;
          }
        } else if (user.role === "student") {
          const response = await api.get("/auth/me");
          if (response.data.student?.subjects) {
            subjects = response.data.student.subjects
              .split(",")
              .map((s: string) => s.trim());
          }
        }
        setAvailableSubjects(subjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        const end = new Date();
        end.setMonth(end.getMonth() + 2);

        // Convert filters to query parameters
        const queryParams = {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          role: user.role,
          userId: user.user_id,
          ...(filters.eventTypes.length > 0 && {
            eventTypes: filters.eventTypes.join(","),
          }),
          ...(filters.subjects.length > 0 && {
            subjects: filters.subjects.join(","),
          }),
          ...(filters.classId && { class_id: filters.classId }),
        };

        const response = await api.get("/calendar/events", {
          params: queryParams,
        });

        if (response.data.success) {
          const processedEvents = response.data.events.map((event: any) => {
            if (event.type === "assignment") {
              const now = new Date();
              const dueDate = new Date(event.end);
              const isOverdue = dueDate < now && event.status === "pending";
              return {
                ...event,
                className: `assignment ${event.status} ${
                  isOverdue ? "overdue" : ""
                }`,
              };
            }
            return event;
          });
          setEvents(processedEvents);
        }
      } catch (error) {
        console.error("Error fetching calendar events:", error);
        setError("Failed to load calendar events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user, filters]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (clickInfo.event.start && clickInfo.event.end) {
      const extendedProps = clickInfo.event
        .extendedProps as CalendarEvent["extendedProps"];
      setSelectedEvent({
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        extendedProps,
      });
      setIsModalOpen(true);
    }
  };

  const handleEventMouseEnter = (mouseEnterInfo: any) => {
    const rect = mouseEnterInfo.el.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      event: mouseEnterInfo.event,
    });
  };

  const handleEventMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const renderTooltip = () => {
    if (!tooltip.visible || !tooltip.event) return null;

    const { event } = tooltip;
    const startDate = event.start instanceof Date ? event.start : new Date(event.start);
    const endDate = event.end instanceof Date ? event.end : new Date(event.end);

    // Check if dates are valid before rendering
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('Invalid date encountered in calendar event:', event);
      return null;
    }

    return (
      <div
        className={`calendar-tooltip ${tooltip.visible ? "visible" : ""}`}
        style={{
          left: `${tooltip.x}px`,
          top: `${tooltip.y - 10}px`,
        }}
      >
        <div className="calendar-tooltip-title">{event.title}</div>
        <div className="calendar-tooltip-time">
          {format(startDate, "MMM d, yyyy h:mm a")} - {format(endDate, "h:mm a")}
        </div>
        {event.extendedProps?.description && (
          <div className="calendar-tooltip-description">
            {event.extendedProps.description}
          </div>
        )}
      </div>
    );
  };

  const renderEventContent = (eventInfo: {
    event: { title: string; extendedProps: CalendarEvent["extendedProps"] };
  }) => {
    const { type, status, dueDate, subject, syllabus_url } =
      eventInfo.event.extendedProps;
    const style =
      type === "exam" && subject
        ? { backgroundColor: stringToColor(subject) }
        : undefined;

    return (
      <div
        className={`calendar-event ${type} ${status || ""}`}
        title={
          eventInfo.event.extendedProps.description || eventInfo.event.title
        }
        style={style}
      >
        <div className="event-title">{eventInfo.event.title}</div>
        {type === "extra-class" && (
          <div className="event-teacher">
            Teacher: {eventInfo.event.extendedProps.teacher}
          </div>
        )}
        {type === "assignment" && dueDate && (
          <div className="event-due-date">
            Due: {new Date(dueDate).toLocaleDateString()}
          </div>
        )}
        {type === "exam" && subject && (
          <div className="event-subject">
            {subject}
            {syllabus_url && " 📄"}
          </div>
        )}
        {eventInfo.event.extendedProps.description && (
          <div className="event-description">
            {eventInfo.event.extendedProps.description}
          </div>
        )}
      </div>
    );
  };

  const handleExportCalendar = () => {
    try {
      if (!events || events.length === 0) {
        console.warn("No events to export");
        return;
      }

      const iCalData = generateICalFile(events);
      const blob = new Blob([iCalData], {
        type: "text/calendar;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "edumanage-calendar.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting calendar:", error);
    }
  };

  const calendarRef = React.useRef<any>(null);

  if (isLoading) {
    return (
      <div className="calendar-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="calendar-error">{error}</div>;
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Calendar Events</h2>
        <div className="calendar-filters">
          <div className="filter-group">
            <label>Event Types:</label>
            <div className="filter-options">
              {eventTypes.map((type) => (
                <label key={type.value} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.eventTypes.includes(type.value)}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        eventTypes: e.target.checked
                          ? [...new Set([...prev.eventTypes, type.value])]
                          : prev.eventTypes.filter((t) => t !== type.value),
                      }));
                    }}
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>
          {availableClasses.length > 0 && (
            <div className="filter-group">
              <label>Class:</label>
              <select
                value={filters.classId || ""}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    classId: e.target.value || undefined,
                  }));
                }}
              >
                <option value="">All Classes</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          )}
          {availableSubjects.length > 0 && (
            <div className="filter-group">
              <label>Subjects:</label>
              <div className="filter-options">
                {availableSubjects.map((subject) => (
                  <label key={subject} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.subjects.includes(subject)}
                      onChange={(e) => {
                        setFilters((prev) => ({
                          ...prev,
                          subjects: e.target.checked
                            ? [...new Set([...prev.subjects, subject])]
                            : prev.subjects.filter((s) => s !== subject),
                        }));
                      }}
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="calendar-actions">
          <button
            onClick={handleExportCalendar}
            className="calendar-export-button"
          >
            Export Calendar
          </button>
        </div>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
        height="auto"
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
        }}
        eventDisplay="block"
        eventDidMount={(info: EventMountArg) => {
          if (info.event.extendedProps.description) {
            const tooltip = info.event.extendedProps.description;
            info.el.setAttribute("title", tooltip);
          }
        }}
      />
      {renderTooltip()}
      <EventDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
};

export default Calendar;

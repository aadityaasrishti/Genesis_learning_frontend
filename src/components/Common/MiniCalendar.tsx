import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LocalizationProvider,
  DateCalendar,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { isSameDay } from "date-fns";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface CustomPickerDayProps extends PickersDayProps<Date> {
  highlightedDays?: Date[];
}

const MiniCalendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [highlightedDays, setHighlightedDays] = useState<Date[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      try {
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        const end = new Date();
        end.setMonth(end.getMonth() + 2);

        const queryParams = {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          role: user.role,
          userId: user.user_id,
        };

        const response = await api.get("/calendar/events", {
          params: queryParams,
        });

        if (response.data.success) {
          const daysWithEvents = response.data.events.map((event: any) => new Date(event.start));
          setHighlightedDays(daysWithEvents);
        }
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      }
    };

    fetchEvents();
  }, [user]);

  const CustomDay = (props: CustomPickerDayProps) => {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

    const isSelected =
      !props.outsideCurrentMonth &&
      highlightedDays.some((date: Date) => isSameDay(date, props.day));

    return (
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        sx={{
          ...props.sx,
          ...(isSelected && {
            backgroundColor: '#4caf50',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#45a049',
            },
            '&:focus': {
              backgroundColor: '#45a049',
            },
          }),
        }}
      />
    );
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    // Navigate to the full calendar view
    navigate('/dashboard/calendar');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateCalendar
        value={selectedDate}
        onChange={handleDateChange}
        slots={{
          day: CustomDay,
        }}
        slotProps={{
          day: {
            highlightedDays,
          } as any,
        }}
        className="mini-calendar"
        sx={{
          '& .MuiPickersDay-root.Mui-selected': {
            backgroundColor: '#1976d2',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            '&:focus': {
              backgroundColor: '#1565c0',
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default MiniCalendar;
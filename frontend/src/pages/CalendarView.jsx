import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getAppointments } from '../api';

const statusColor = (status) => {
  if (status === 0 || status === 'Scheduled') return '#22c55e';
  if (status === 1 || status === 'Cancelled') return '#ef4444';
  if (status === 2 || status === 'Completed') return '#3b82f6';
  return '#6b7280';
};

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointments()
      .then((appts) => {
        const mapped = appts.map((a) => ({
          id: a.appointmentId,
          title: `${a.patient?.name || 'Patient'}`,
          start: a.appointmentDate,
          backgroundColor: statusColor(a.status),
          borderColor: statusColor(a.status),
          extendedProps: { patient: a.patient, status: a.status },
        }));
        setEvents(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleEventClick = (info) => {
    const p = info.event.extendedProps.patient;
    if (p) {
      alert(`Patient: ${p.name}\nAge: ${p.age} yrs | ${p.gender}\nContact: ${p.contactNumber}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Appointment Calendar</h1>
        <div className="flex items-center gap-4 text-sm">
          {[['#22c55e', 'Scheduled'], ['#ef4444', 'Cancelled'], ['#3b82f6', 'Completed']].map(([color, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }}></span>
              {label}
            </span>
          ))}
          {loading && <span className="text-gray-400 text-xs">Loading...</span>}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={handleEventClick}
          height="100%"
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          eventDisplay="block"
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: true }}
          eventContent={(arg) => (
            <div className="px-1.5 py-0.5 text-xs font-semibold truncate">
              <span>{arg.timeText}</span>
              <span className="ml-1">{arg.event.title}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default CalendarView;

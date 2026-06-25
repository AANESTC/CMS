import React, { useState, useEffect, useRef } from 'react';
import { 
  MdAdd, MdViewList, MdCalendarMonth, MdClose, MdEvent, MdDelete, 
  MdSearch, MdRefresh, MdFilterList, MdCheckCircle, MdCancel,
  MdFileDownload, MdMoreVert, MdAccessTime, MdLocationOn, MdLocalCafe, 
  MdPerson, MdErrorOutline
} from 'react-icons/md';

import { 
  getAppointments, getPatients, bookAppointment, 
  rescheduleAppointment, cancelAppointment, deleteAppointment,
  getDoctors
} from '../api';

const Z = {
  blue:'#0B5FFF', blueL:'#EEF4FF',
  green:'#00AA45', greenL:'#E6F7EE',
  orange:'#F5A623', orangeL:'#FFF5E5',
  red:'#E42527', redL:'#FEE9E9',
  navy:'#1A2B4A', text:'#6B7A99',
};

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const statusColors = {
  Scheduled: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
};

const AppointmentManagement = ({ isDoctor = false }) => {
  const [viewMode, setViewMode] = useState(isDoctor ? 'calendar' : 'list');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Doctor identity from session
  const sessionDoctorId = localStorage.getItem('cf_doctorId') || null;

  // List View State
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Calendar View State
  const [scheduleView, setScheduleView] = useState('Day');
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const menuRef = useRef(null);

  // Modals
  const [showBook, setShowBook] = useState(false);
  const [bookForm, setBookForm] = useState({ patientId: '', doctorId: sessionDoctorId || '', date: '', time: '' });
  const [booking, setBooking] = useState(false);

  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // If logged in as a doctor, filter appointments to only this doctor's
      const data = await getAppointments(isDoctor && sessionDoctorId ? { doctorId: sessionDoctorId } : {});
      setAppointments(data);
    } catch (e) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    getPatients().then(setPatients).catch(() => {});
    getDoctors().then(setDoctors).catch(() => {});
  }, []);

  // Format date utility
  const formatDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateStr = formatDateStr(selectedDate);
  const todayStr = formatDateStr(new Date());

  const getHeaderDateLabel = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handlePrevDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date());
  };

  // Map Backend Appointments to UI Appointments
  const mappedAppointments = appointments.map(a => {
    const d = new Date(a.appointmentDate);
    const dateStr = formatDateStr(d);
    
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const startTime = `${hh}:${mm}`;

    d.setMinutes(d.getMinutes() + 30);
    const endHh = String(d.getHours()).padStart(2, '0');
    const endMm = String(d.getMinutes()).padStart(2, '0');
    const endTime = `${endHh}:${endMm}`;

    let statusText = 'Scheduled';
    if (a.status === 1 || a.status === 'Cancelled') statusText = 'Cancelled';
    if (a.status === 2 || a.status === 'Completed') statusText = 'Completed';

    return {
      id: a.appointmentId,
      patientId: a.patientId,
      patientName: a.patient?.name || 'Unknown Patient',
      doctor: a.doctor?.name || 'Dr. Default',
      date: dateStr,
      startTime,
      endTime,
      duration: 30,
      room: 'Main Clinic',
      reason: 'General Checkup',
      type: 'Consultation',
      status: statusText,
      originalStatus: a.status
    };
  });

  const filteredCalendarAppointments = mappedAppointments.filter((apt) => {
    const matchesDate = apt.date === selectedDateStr;
    const matchesDoctor = selectedDoctor === 'All Doctors' || apt.doctor === selectedDoctor;
    return matchesDate && matchesDoctor;
  });

  const statsTotal = filteredCalendarAppointments.length;
  const statsCompleted = filteredCalendarAppointments.filter((a) => a.status === 'Completed').length;
  const statsScheduled = filteredCalendarAppointments.filter((a) => a.status === 'Scheduled').length;
  const statsCancelled = filteredCalendarAppointments.filter((a) => a.status === 'Cancelled').length;

  const handleExportCSV = () => {
    if (filteredCalendarAppointments.length === 0) {
      alert('No appointments to export for the current filters.');
      return;
    }
    const headers = ['Appointment ID', 'Patient Name', 'Date', 'Time', 'Doctor', 'Status'];
    const rows = filteredCalendarAppointments.map((a) => [
      a.id, a.patientName, a.date, a.startTime, a.doctor, a.status
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Appointments_${selectedDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      const dt = new Date(`${bookForm.date}T${bookForm.time}:00`);
      const created = await bookAppointment({
        patientId: bookForm.patientId,
        doctorId: bookForm.doctorId || '00000000-0000-0000-0000-000000000001',
        appointmentDate: dt.toISOString(),
      });
      setAppointments(prev => [created, ...prev]);
      setShowBook(false);
      setBookForm({ patientId: '', doctorId: '', date: '', time: '' });
    } catch (e) {
      setError(e.message);
    } finally {
      setBooking(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    try {
      const dt = new Date(`${rescheduleDate}T${rescheduleTime}:00`);
      const updated = await rescheduleAppointment(rescheduleId, dt.toISOString());
      setAppointments(prev => prev.map(a => a.appointmentId === rescheduleId ? updated : a));
      setRescheduleId(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      setAppointments(prev => prev.map(a => a.appointmentId === id ? { ...a, status: 1 } : a));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this appointment record? This action cannot be undone.')) return;
    try {
      await deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.appointmentId !== id));
    } catch (e) {
      setError('Delete failed: ' + e.message);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const statusLabel = (status) => {
    if (status === 0 || status === 'Scheduled') return { label: 'Scheduled', cls: statusColors.Scheduled };
    if (status === 1 || status === 'Cancelled') return { label: 'Cancelled', cls: statusColors.Cancelled };
    if (status === 2 || status === 'Completed') return { label: 'Completed', cls: statusColors.Completed };
    return { label: String(status), cls: 'bg-gray-100 text-gray-600' };
  };

  const todaySorted = [...filteredCalendarAppointments].sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  const upcomingAppointment = todaySorted.find((a) => a.status === 'Scheduled');

  const isSlotBooked = (slotTime) => {
    return filteredCalendarAppointments.some((apt) => apt.startTime === slotTime && apt.status !== 'Cancelled');
  };

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTimeLabel = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const formattedHr = hr % 12 === 0 ? 12 : hr % 12;
    return `${String(formattedHr).padStart(2, '0')}:${m} ${ampm}`;
  };

  const timelineItems = [];
  todaySorted.forEach((apt) => {
    timelineItems.push({
      type: 'appointment',
      timeLabel: formatTimeLabel(apt.startTime),
      timeVal: apt.startTime,
      data: apt
    });
  });

  timelineItems.push({
    type: 'lunch',
    timeLabel: '12:00 PM',
    timeVal: '12:00',
    data: { label: 'Lunch Break (12:00 PM – 01:00 PM)' }
  });

  timelineItems.sort((a, b) => a.timeVal.localeCompare(b.timeVal));

  const isRealToday = selectedDateStr === todayStr;
  let insertTimeVal = null;
  let insertTimeLabel = '';

  if (isRealToday) {
    const now = new Date();
    const curHour = String(now.getHours()).padStart(2, '0');
    const curMin = String(now.getMinutes()).padStart(2, '0');
    insertTimeVal = `${curHour}:${curMin}`;
    
    const displayHr = now.getHours() % 12 === 0 ? 12 : now.getHours() % 12;
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    insertTimeLabel = `${String(displayHr).padStart(2, '0')}:${curMin} ${ampm}`;
  }

  if (insertTimeVal) {
    timelineItems.push({
      type: 'time-indicator',
      timeLabel: insertTimeLabel,
      timeVal: insertTimeVal,
      data: null
    });
    timelineItems.sort((a, b) => a.timeVal.localeCompare(b.timeVal));
  }

  // List View Computed Stats
  const listScheduled = appointments.filter(a => a.status === 0 || a.status === 'Scheduled').length;
  const listCompleted = appointments.filter(a => a.status === 2 || a.status === 'Completed').length;
  const listCancelled = appointments.filter(a => a.status === 1 || a.status === 'Cancelled').length;
  const listTodayCount = appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length;

  const filteredList = appointments.filter(a => {
    const name = a.patient?.name?.toLowerCase() || '';
    const matchSearch = !search || name.includes(search.toLowerCase());
    const isCancelled = a.status === 1 || a.status === 'Cancelled';
    const isCompleted = a.status === 2 || a.status === 'Completed' || (new Date(a.appointmentDate) < new Date() && !isCancelled);
    const isScheduled = !isCancelled && !isCompleted;
    const matchStatus = statusFilter === 'All'
      || (statusFilter === 'Scheduled' && isScheduled)
      || (statusFilter === 'Completed' && isCompleted)
      || (statusFilter === 'Cancelled' && isCancelled);
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="space-y-5 animate-fade-up h-full flex flex-col pb-6">

        {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: Z.navy }}>Appointments</h1>
          <p className="text-sm mt-0.5" style={{ color: Z.text }}>Manage all clinic appointments and schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAppointments} className="p-2.5 bg-white rounded-xl border zoho-card hover:bg-gray-50 transition-colors">
            <MdRefresh className="w-5 h-5" style={{ color: Z.text }} />
          </button>
          {!isDoctor && (
            <div className="flex p-1 rounded-xl gap-0.5" style={{ background: '#F0F4F8' }}>
              <button onClick={() => setViewMode('calendar')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={viewMode === 'calendar' ? { background: '#fff', color: Z.navy, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } : { color: Z.text }}>
                <MdCalendarMonth className="w-4 h-4" /> Calendar
              </button>
              <button onClick={() => setViewMode('list')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={viewMode === 'list' ? { background: '#fff', color: Z.navy, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } : { color: Z.text }}>
                <MdViewList className="w-4 h-4" /> List
              </button>
            </div>
          )}
          {!isDoctor && (
            <button onClick={() => {
                setBookForm({ ...bookForm, date: selectedDateStr, time: '10:00' });
                setShowBook(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
              style={{ background: Z.green, boxShadow: '0 4px 12px rgba(0,170,69,0.2)' }}>
              <MdAdd className="w-4 h-4" /> Book Appointment
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex justify-between"><span>{error}</span><button onClick={() => setError('')}><MdClose /></button></div>}

      {/* --- LIST VIEW --- */}
      {viewMode === 'list' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Today's Appts", value: listTodayCount, icon: MdEvent, color: Z.blue, bg: Z.blueL },
              { label: 'Scheduled', value: listScheduled, icon: MdEvent, color: Z.green, bg: Z.greenL },
              { label: 'Completed', value: listCompleted, icon: MdCheckCircle, color: Z.blue, bg: Z.blueL },
              { label: 'Cancelled', value: listCancelled, icon: MdCancel, color: Z.red, bg: Z.redL },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-4 flex items-center gap-3 zoho-card">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: Z.text }}>{label}</p>
                  <p className="text-xl font-bold" style={{ color: Z.navy }}>{loading ? '…' : value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-4 zoho-card flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: Z.text }} />
              <input type="text" placeholder="Search by patient name…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-all"
                style={{ borderColor: '#E2E8F0', color: Z.navy, background: '#F8FAFC' }}
                onFocus={e => e.target.style.borderColor = Z.blue} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div className="flex items-center gap-2">
              <MdFilterList className="w-4 h-4" style={{ color: Z.text }} />
              {['All','Scheduled','Completed','Cancelled'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={statusFilter === s
                    ? { background: s==='Cancelled'?Z.red:s==='Completed'?Z.blue:s==='Scheduled'?Z.green:Z.navy, color:'#fff' }
                    : { background:'#F0F4F8', color: Z.text }}>
                  {s}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold ml-auto" style={{ color: Z.text }}>{filteredList.length} results</span>
          </div>

          <div className="bg-white p-5 rounded-2xl zoho-card flex-1 min-h-0 flex flex-col">
            <div className="overflow-auto flex-1">
              {loading ? (
                <div className="text-center py-12 text-sm" style={{ color: Z.text }}>Loading appointments…</div>
              ) : filteredList.length === 0 ? (
                <div className="text-center py-12 text-sm" style={{ color: Z.text }}>No appointments found.</div>
              ) : (
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-[11px] uppercase border-b" style={{ color: Z.text, background: '#FAFBFD', borderColor: '#F0F4F8' }}>
                      <th className="px-4 py-3 font-semibold">Patient</th>
                      <th className="px-4 py-3 font-semibold">Doctor</th>
                      <th className="px-4 py-3 font-semibold">Date & Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
                    {filteredList.map((a) => {
                      const isPast = new Date(a.appointmentDate) < new Date();
                      const isCancelled = a.status === 1 || a.status === 'Cancelled';
                      const isCompleted = a.status === 2 || a.status === 'Completed' || (isPast && !isCancelled);
                      
                      let s = statusLabel(a.status);
                      if (isCompleted && !isCancelled) {
                        s = { label: 'Completed', cls: 'bg-blue-100 text-blue-700' };
                      }

                      const statusStyle = isCancelled ? { bg: Z.redL, color: Z.red } : isCompleted ? { bg: Z.blueL, color: Z.blue } : { bg: Z.greenL, color: Z.green };
                      return (
                        <tr key={a.appointmentId} className="transition-colors hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                  style={{ background: `linear-gradient(135deg, ${Z.blue}, #2D7FF9)` }}>
                                {(a.patient?.name || '?').charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: Z.navy }}>{a.patient?.name || '—'}</p>
                                <p className="text-[10px]" style={{ color: Z.text }}>{a.patient?.contactNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: Z.navy }}>{a.doctor?.name || 'Dr. Smith'}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: Z.navy }}>{formatDateTime(a.appointmentDate)}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: statusStyle.bg, color: statusStyle.color }}>{s.label}</span>
                          </td>
                          <td className="p-3 space-x-2 flex">
                            {!isCancelled && !isCompleted && (
                              <>
                                <button
                                  onClick={() => { 
                                    setRescheduleId(a.appointmentId); 
                                    const d = new Date(a.appointmentDate);
                                    const yyyy = d.getFullYear();
                                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                                    const dd = String(d.getDate()).padStart(2, '0');
                                    setRescheduleDate(`${yyyy}-${mm}-${dd}`);
                                    const hh = String(d.getHours()).padStart(2, '0');
                                    const min = String(d.getMinutes()).padStart(2, '0');
                                    setRescheduleTime(`${hh}:${min}`);
                                  }}
                                  className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100">
                                  Reschedule
                                </button>
                                <button onClick={() => handleCancel(a.appointmentId)}
                                  className="text-sm text-red-600 font-medium bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100">
                                  Cancel
                                </button>
                              </>
                            )}
                            {isCancelled && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 italic">Cancelled</span>
                                <button onClick={() => handleDelete(a.appointmentId)} className="p-1.5 text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
                                  <MdDelete className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {isCompleted && !isCancelled && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg">Completed</span>
                                <button onClick={() => handleDelete(a.appointmentId)} className="p-1.5 text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
                                  <MdDelete className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* --- CALENDAR VIEW --- */}
      {viewMode === 'calendar' && (
        <div className="flex flex-col gap-4 animate-fade-in flex-1">
          {/* Calendar View Filters Toolbar */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl zoho-card">
            
            {/* Doctor Filter */}
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="form-input text-xs font-semibold py-2 px-3 border border-gray-200 rounded-lg outline-none text-gray-700 focus:border-blue-500"
              style={{ width: '150px' }}
            >
              <option value="All Doctors">All Doctors</option>
              {Array.from(new Set(appointments.map(a => a.doctor?.name).filter(Boolean))).map(doc => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>

            {/* Date Picker Button */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <MdCalendarMonth className="text-gray-400 w-4 h-4" />
                <span>{getHeaderDateLabel(selectedDate)}</span>
              </button>
              {showDatePicker && (
                <div className="absolute top-10 left-0 z-50 bg-white p-3 border border-gray-200 rounded-xl shadow-xl flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Select Date</p>
                  <input
                    type="date"
                    value={selectedDateStr}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-').map(Number);
                        setSelectedDate(new Date(y, m - 1, d));
                      }
                      setShowDatePicker(false);
                    }}
                    className="text-xs border border-gray-300 rounded p-1 outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* View Tab Selector */}
            <div className="bg-gray-100 p-0.5 rounded-lg flex gap-0.5">
              {['Day', 'Week', 'Month'].map((tab) => (
                <button
                  key={tab}
                  className={`text-xs py-1.5 px-3 rounded-md font-semibold transition-all ${
                    scheduleView === tab ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setScheduleView(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            {/* Actions */}
            <button
              className="flex items-center gap-1.5 text-xs py-2 px-3 font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleExportCSV}
            >
              <MdFileDownload className="w-4 h-4" /> Export
            </button>
            <button
              className="text-xs py-2 px-3 font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handlePrevDate}
            >
              &lt; Prev
            </button>
            <button
              className="text-xs py-2 px-3 font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              onClick={handleSetToday}
            >
              Today
            </button>
            <button
              className="text-xs py-2 px-3 font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={handleNextDate}
            >
              Next &gt;
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
            {/* Left Section (Timeline/Grid) */}
            <div className="lg:col-span-8 bg-white border border-gray-200 zoho-card rounded-2xl flex flex-col overflow-hidden min-h-[550px]">
              
              {scheduleView === 'Day' && (
                <>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                    <h2 className="font-bold text-gray-800 text-sm">Day Schedule</h2>
                    <span className="text-[10.5px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                      {filteredCalendarAppointments.length} Active Records for {selectedDoctor}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-0 relative" style={{ scrollbarWidth: 'none' }}>
                    {timelineItems.length > 0 ? (
                      <div className="relative border-l border-gray-200 ml-20 pl-6 space-y-4 py-2">
                        {timelineItems.map((item, idx) => {
                          if (item.type === 'time-indicator') {
                            return (
                              <div key="indicator" className="relative flex items-center h-0 z-20" style={{ margin: '14px 0' }}>
                                <div className="absolute -left-[108px] w-20 text-right">
                                  <span className="bg-red-500 text-white text-[9.5px] font-bold px-2 py-0.5 rounded shadow-sm">
                                    {item.timeLabel}
                                  </span>
                                </div>
                                <div className="absolute -left-[30px] w-3 h-3 rounded-full bg-red-500 border-2 border-white ring-4 ring-red-100"></div>
                                <div className="w-full h-0.5 bg-red-500 border-t border-red-400 border-dashed opacity-80"></div>
                              </div>
                            );
                          }

                          if (item.type === 'lunch') {
                            return (
                              <div key="lunch" className="relative flex min-h-[48px] items-center">
                                <div className="absolute -left-[108px] w-20 text-right text-xs text-gray-400 font-semibold">
                                  {item.timeLabel}
                                </div>
                                <div className="absolute -left-[30px] w-2 h-2 rounded-full bg-gray-300 border-2 border-white shadow-sm"></div>
                                <div className="w-full border border-dashed border-gray-300 rounded-xl p-3 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                                  <MdLocalCafe className="text-gray-400 w-4 h-4" />
                                  <span className="text-xs text-gray-500 font-semibold">{item.data.label}</span>
                                </div>
                              </div>
                            );
                          }

                          const apt = item.data;
                          const isCancelled = apt.status === 'Cancelled';
                          const isCompleted = apt.status === 'Completed';
                          
                          let borderClass = 'border-blue-400';
                          let avatarClass = 'bg-blue-100 text-blue-600';
                          let bgClass = 'bg-blue-50/40 hover:bg-blue-50/80';
                          
                          if (isCompleted) {
                            borderClass = 'border-green-400'; avatarClass = 'bg-green-100 text-green-600'; bgClass = 'bg-green-50/40 hover:bg-green-50/80';
                          } else if (isCancelled) {
                            borderClass = 'border-red-400'; avatarClass = 'bg-red-100 text-red-600'; bgClass = 'bg-red-50/40 hover:bg-red-50/80';
                          }

                          return (
                            <div key={apt.id} className="relative flex items-start min-h-[92px]">
                              <div className="absolute -left-[108px] w-20 text-right text-xs text-gray-400 font-bold mt-1">
                                {item.timeLabel}
                              </div>
                              <div className={`absolute -left-[30px] w-2 h-2 rounded-full bg-white border-2 ${borderClass} shadow-sm z-10 mt-3`}></div>
                              <div className={`w-full rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition border-l-4 border border-gray-100 ${borderClass} ${bgClass}`}>
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs select-none flex-shrink-0 ${avatarClass}`}>
                                    {getInitials(apt.patientName)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="font-bold text-gray-800 text-xs truncate">{apt.patientName}</h3>
                                      {apt.type && <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{apt.type}</span>}
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1 font-semibold truncate max-w-[280px]">{apt.reason}</p>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1.5 font-semibold">
                                      <span className="flex items-center gap-1"><MdPerson className="w-3 h-3"/> <span className="text-gray-500">{apt.doctor}</span></span>
                                      <span className="text-gray-300">·</span>
                                      <span>{apt.room}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                                  <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                                      <MdAccessTime className="text-gray-400 w-3 h-3" />
                                      <span>{apt.startTime} - {apt.endTime}</span>
                                    </div>
                                    <span className="text-[9.5px] text-gray-400 font-semibold mr-1">{apt.duration} mins</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9.5px] py-0.5 px-2.5 flex items-center gap-1 rounded-full font-bold ${
                                      isCompleted ? 'bg-green-100 text-green-700' : isCancelled ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-600' : isCancelled ? 'bg-red-600' : 'bg-blue-600'}`}></span>
                                      {apt.status}
                                    </span>
                                    <div className="relative">
                                      <button onClick={() => setActiveMenuId(activeMenuId === apt.id ? null : apt.id)} className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-white cursor-pointer">
                                        <MdMoreVert className="w-4 h-4" />
                                      </button>
                                      {activeMenuId === apt.id && (
                                        <div ref={menuRef} className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs font-semibold">
                                          {!isCancelled && !isCompleted && (
                                            <>
                                              <button onClick={() => { handleCancel(apt.id); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-red-600">Cancel</button>
                                            </>
                                          )}
                                          <div className="border-t border-gray-100 my-1"></div>
                                          <button onClick={() => handleDelete(apt.id)} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-red-600 flex items-center gap-1.5">
                                            <MdDelete className="w-3 h-3" /> Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                        <MdErrorOutline className="w-7 h-7 text-gray-300" />
                        <p className="text-xs font-bold text-gray-500">No appointments scheduled for this date</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {scheduleView === 'Week' && (
                <div className="flex-1 flex flex-col p-5 overflow-hidden">
                  <h2 className="font-bold text-gray-800 text-sm mb-4">Weekly Overview Grid</h2>
                  <div className="grid grid-cols-7 gap-3 flex-1 overflow-y-auto">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const currDayNum = selectedDate.getDay() || 7;
                      const distance = i + 1 - currDayNum;
                      const date = new Date(selectedDate);
                      date.setDate(selectedDate.getDate() + distance);
                      const dStr = formatDateStr(date);
                      const isDaySelected = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
                      
                      const dayApts = mappedAppointments.filter(a => a.date === dStr && (selectedDoctor === 'All Doctors' || a.doctor === selectedDoctor));
                      const schedCount = dayApts.filter(a => a.status === 'Scheduled').length;
                      const complCount = dayApts.filter(a => a.status === 'Completed').length;
                      
                      const daysNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      
                      return (
                        <div key={i} onClick={() => { setSelectedDate(date); setScheduleView('Day'); }} 
                          className={`border rounded-xl p-3 flex flex-col justify-between hover:border-blue-400 transition cursor-pointer min-h-[200px] ${isDaySelected ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500' : 'border-gray-200 bg-white'}`}>
                          <div className="text-center pb-2 border-b border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{daysNames[date.getDay()]}</p>
                            <p className="text-sm font-extrabold text-gray-700 mt-0.5">{date.getDate()}</p>
                          </div>
                          <div className="flex-1 flex flex-col gap-1.5 py-3 text-[10px] font-bold">
                            <div className="flex justify-between items-center text-gray-500"><span>Total</span><span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{dayApts.length}</span></div>
                            {complCount > 0 && <div className="flex justify-between items-center text-green-600 bg-green-50 px-1 py-0.5 rounded"><span>Done</span><span>{complCount}</span></div>}
                            {schedCount > 0 && <div className="flex justify-between items-center text-blue-600 bg-blue-50 px-1 py-0.5 rounded"><span>Booked</span><span>{schedCount}</span></div>}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedDate(date); setBookForm({...bookForm, date: dStr}); setShowBook(true); }}
                            className="w-full text-center text-[9px] font-extrabold text-blue-600 hover:text-white hover:bg-blue-600 transition py-1 rounded border border-blue-200">+ Book Day</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {scheduleView === 'Month' && (
                <div className="flex-1 flex flex-col p-5 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-800 text-sm">Monthly Calendar</h2>
                    <span className="text-xs text-gray-400 font-semibold">Click any cell to inspect</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 text-[10.5px] uppercase tracking-wider mb-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const dayVal = i + 1;
                      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayVal);
                      const dStr = formatDateStr(date);
                      const isDaySelected = date.getDate() === selectedDate.getDate();
                      
                      const dayApts = mappedAppointments.filter(a => a.date === dStr && (selectedDoctor === 'All Doctors' || a.doctor === selectedDoctor));

                      return (
                        <div key={i} onClick={() => { setSelectedDate(date); setScheduleView('Day'); }}
                          className={`border rounded-lg p-2 hover:border-blue-400 transition cursor-pointer min-h-[75px] flex flex-col justify-between ${isDaySelected ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 bg-white'}`}>
                          <span className="text-[10px] font-extrabold text-gray-500">{dayVal}</span>
                          {dayApts.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-extrabold text-gray-700 bg-gray-100 px-1 rounded w-fit self-end">{dayApts.length} slots</span>
                              <div className="flex gap-0.5 justify-end">
                                {dayApts.slice(0,3).map((a, idx) => (
                                  <span key={idx} className={`w-1.5 h-1.5 rounded-full ${a.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                ))}
                                {dayApts.length > 3 && <span className="text-[8px] text-gray-400">+</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Right Section (Sidebar) */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              
              {/* Today's Summary */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 zoho-card">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Selected Date Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                    <p className="text-lg font-extrabold text-gray-700">{statsTotal}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">Total</p>
                  </div>
                  <div className="bg-green-50/50 rounded-xl p-3 border border-green-50 text-center">
                    <p className="text-lg font-extrabold text-green-600">{statsCompleted}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">Completed</p>
                  </div>
                  <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-50 text-center">
                    <p className="text-lg font-extrabold text-blue-600">{statsScheduled}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">Scheduled</p>
                  </div>
                  <div className="bg-red-50/50 rounded-xl p-3 border border-red-50 text-center">
                    <p className="text-lg font-extrabold text-red-600">{statsCancelled}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">Cancelled</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Patient */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 zoho-card">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Next Upcoming</h3>
                {upcomingAppointment ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl font-bold flex items-center justify-center text-sm bg-blue-100 text-blue-600">
                        {getInitials(upcomingAppointment.patientName)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 leading-tight">{upcomingAppointment.patientName}</h4>
                        <p className="text-[10.5px] text-gray-400 font-semibold mt-0.5">{upcomingAppointment.type}</p>
                      </div>
                    </div>
                    <div className="text-[11.5px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 font-semibold">
                      <span className="text-[10px] font-bold text-gray-400 block mb-0.5 uppercase tracking-wide">Reason</span>
                      {upcomingAppointment.reason}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500">
                      <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <MdAccessTime className="text-gray-400 w-3 h-3" />
                        <span>{formatTimeLabel(upcomingAppointment.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <MdLocationOn className="text-gray-400 w-3 h-3" />
                        <span>{upcomingAppointment.room}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-400 py-6 font-bold bg-gray-50/50 rounded-xl border border-gray-100">
                    No upcoming appointments
                  </div>
                )}
              </div>



            </div>
          </div>
        </div>
      )}
      </div>

      {/* Book Appointment Modal (Used by both modes) */}
      {showBook && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Book Appointment</h2>
              <button onClick={() => setShowBook(false)} className="text-gray-400 hover:text-gray-600"><MdClose className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                <select required value={bookForm.patientId} onChange={e => setBookForm({ ...bookForm, patientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.name} - {p.contactNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input required type="date" value={bookForm.date} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setBookForm({ ...bookForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot *</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(t => (
                    <button key={t} type="button" onClick={() => setBookForm({ ...bookForm, time: t })}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${bookForm.time === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowBook(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold">Cancel</button>
                <button type="submit" disabled={booking} className="px-6 py-2 text-white rounded-xl disabled:opacity-60 font-semibold" style={{ background: Z.green }}>
                  {booking ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Reschedule Appointment</h2>
              <button onClick={() => setRescheduleId(null)} className="text-gray-400 hover:text-gray-600"><MdClose className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Date *</label>
                <input type="date" value={rescheduleDate} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time Slot *</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(t => (
                    <button key={t} type="button" onClick={() => setRescheduleTime(t)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${rescheduleTime === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setRescheduleId(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold">Cancel</button>
                <button onClick={handleReschedule} disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                  className="px-6 py-2 text-white rounded-xl disabled:opacity-60 font-semibold" style={{ background: Z.navy }}>
                  {rescheduling ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default AppointmentManagement;

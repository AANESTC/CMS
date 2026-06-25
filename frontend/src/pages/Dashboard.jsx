import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdEventAvailable, MdCheckCircle, MdCancel, MdPeople,
  MdInsertDriveFile, MdOpenInNew, MdNotificationsActive,
  MdBloodtype, MdMedicalServices, MdSchedule, MdTrendingUp,
} from 'react-icons/md';
import {
  getDashboardSummary, getTodaysAppointments,
} from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';

/* ── Zoho tokens ── */
const Z = {
  blue:   '#0B5FFF', blueL:  '#EEF4FF',
  green:  '#00AA45', greenL: '#E6F7EE',
  orange: '#F5A623', orangeL:'#FFF5E5',
  red:    '#E42527', redL:   '#FEE9E9',
  purple: '#7B61FF', purpleL:'#F0EDFF',
  teal:   '#00B2A9', tealL:  '#E0F7F6',
  navy:   '#1A2B4A', text:   '#6B7A99',
};

const StatCard = ({ title, value, sub, icon: Icon, color, colorL }) => (
  <div className="bg-white rounded-2xl p-5 flex items-center gap-4 zoho-card">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: colorL }}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium truncate" style={{ color: Z.text }}>{title}</p>
      <p className="text-2xl font-bold leading-tight" style={{ color: Z.navy }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: Z.text }}>{sub}</p>}
    </div>
  </div>
);

const DOC_TYPE_LABELS = { BloodTest: 'Blood Test', XRay: 'X-Ray', PrescriptionScan: 'Prescription', Other: 'Other' };

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary]   = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [loading, setLoading]   = useState(true);

  // Read doctor identity from session
  const doctorId   = localStorage.getItem('cf_doctorId') || null;
  const doctorName = localStorage.getItem('cf_doctorName') || 'Doctor';

  useEffect(() => {
    Promise.all([
      getDashboardSummary(doctorId).catch(() => null),
      getTodaysAppointments().catch(() => []),
    ]).then(([s, appts]) => {
      setSummary(s);
      // If doctor-specific, filter today's appts by this doctor
      const filtered = doctorId
        ? appts.filter(a => a.doctor?.doctorId === doctorId || a.doctorId === doctorId)
        : appts;
      setTodayAppts(filtered);
      setLoading(false);
    });
  }, [doctorId]);

  const s = summary;
  const fmt  = (n) => loading ? '…' : (n ?? 0);
  const fmtT = (dt) => dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
  const statusCls = (st) => {
    if (st === 0 || st === 'Scheduled') return { label: 'Scheduled', bg: Z.greenL, color: Z.green };
    if (st === 1 || st === 'Cancelled') return { label: 'Cancelled', bg: Z.redL,   color: Z.red   };
    return { label: 'Completed', bg: Z.blueL, color: Z.blue };
  };

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: Z.navy }}>Doctor Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: Z.text }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            &nbsp;— Welcome, <strong style={{ color: Z.green }}>{doctorName}</strong>
          </p>
        </div>
      </div>

      {/* ── Row 1: 4 Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Today's Patients"   value={fmt(s?.todayTotal)}       sub={`${fmt(s?.scheduledToday)} awaiting`}     icon={MdEventAvailable}    color={Z.blue}   colorL={Z.blueL}   />
        <StatCard title="Completed Today"    value={fmt(s?.completedToday)}   sub="consultations done"                        icon={MdCheckCircle}       color={Z.green}  colorL={Z.greenL}  />
        <StatCard title="Follow-ups Tomorrow" value={fmt(s?.tomorrowFollowUps)} sub="scheduled next day"                     icon={MdNotificationsActive} color={Z.orange} colorL={Z.orangeL} />
        <StatCard title="Total Patients"     value={fmt(s?.totalPatients)}    sub={`${fmt(s?.newToday)} registered today`}   icon={MdPeople}            color={Z.purple} colorL={Z.purpleL} />
      </div>

      {/* ── Row 2: Chart (half) + Quick Patient Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Chart — half page width */}
        <div className="bg-white rounded-2xl p-5 zoho-card">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-sm" style={{ color: Z.navy }}>Weekly Appointments</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: Z.greenL, color: Z.green }}>7 Days</span>
          </div>
          <div className="h-[155px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: Z.text }}>Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s?.weekChart || []} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F4F8" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: Z.text, fontSize: 10 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: Z.text, fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Bar dataKey="appointments" name="Total"     fill={Z.green} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="completed"    name="Completed" fill={Z.blue}  radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Clinical Snapshot */}
        <div className="bg-white rounded-2xl p-5 zoho-card">
          <h2 className="font-bold text-sm mb-4" style={{ color: Z.navy }}>Clinical Snapshot</h2>
          <div className="space-y-3">
            {[
              { label: 'Scheduled',        value: fmt(s?.scheduledToday),       color: Z.green,  bg: Z.greenL,  icon: MdSchedule },
              { label: 'Completed Today',  value: fmt(s?.completedToday),       color: Z.blue,   bg: Z.blueL,   icon: MdCheckCircle },
              { label: 'Cancelled Today',  value: fmt(s?.cancelledToday),       color: Z.red,    bg: Z.redL,    icon: MdCancel },
              { label: 'Total Documents',  value: fmt(s?.totalDocuments),       color: Z.orange, bg: Z.orangeL, icon: MdInsertDriveFile },
              { label: 'Blood Tests',      value: fmt(s?.docsByType?.bloodTest),color: Z.red,    bg: Z.redL,    icon: MdBloodtype },
              { label: 'Prescriptions',    value: fmt(s?.docsByType?.prescription), color: Z.teal, bg: Z.tealL, icon: MdMedicalServices },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: bg }}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-xs font-medium" style={{ color: Z.navy }}>{label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="bg-white rounded-2xl p-5 zoho-card">
          <h2 className="font-bold text-sm mb-4" style={{ color: Z.navy }}>Patient Demographics</h2>
          <div className="mb-3">
            <p className="text-xs font-semibold mb-2" style={{ color: Z.text }}>GENDER SPLIT</p>
            {[
              { label: 'Male',   val: s?.genderSplit?.male   || 0, color: Z.blue },
              { label: 'Female', val: s?.genderSplit?.female || 0, color: '#EC4899' },
              { label: 'Other',  val: s?.genderSplit?.other  || 0, color: Z.orange },
            ].map(({ label, val, color }) => {
              const pct = s?.totalPatients ? Math.round((val / s.totalPatients) * 100) : 0;
              return (
                <div key={label} className="mb-2">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span style={{ color: Z.text }}>{label}</span>
                    <span style={{ color: Z.navy, fontWeight: 600 }}>{val} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t pt-3" style={{ borderColor: '#F0F4F8' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: Z.text }}>AGE GROUPS</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '< 18',  val: s?.ageGroups?.children || 0, color: Z.orange },
                { label: '18–60', val: s?.ageGroups?.adults   || 0, color: Z.blue },
                { label: '60+',   val: s?.ageGroups?.senior   || 0, color: Z.purple },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center p-2 rounded-xl" style={{ background: '#F8FAFC' }}>
                  <p className="text-lg font-bold" style={{ color }}>{val}</p>
                  <p className="text-[10px]" style={{ color: Z.text }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Today's Patient List (full width) ── */}
      <div className="bg-white rounded-2xl p-5 zoho-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-sm" style={{ color: Z.navy }}>Today's Patients</h2>
          <button onClick={() => navigate('/patients')} className="text-xs font-semibold" style={{ color: Z.green }}>View All →</button>
        </div>

        {loading ? (
          <p className="text-sm text-center py-6" style={{ color: Z.text }}>Loading patients…</p>
        ) : todayAppts.length === 0 ? (
          <div className="text-center py-8">
            <MdEventAvailable className="w-10 h-10 mx-auto mb-2" style={{ color: '#E2E8F0' }} />
            <p className="text-sm" style={{ color: Z.text }}>No appointments scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayAppts.map(a => {
              const st = statusCls(a.status);
              const isOpen = selectedAppt?.appointmentId === a.appointmentId;
              return (
                <div key={a.appointmentId}>
                  <div
                    className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border"
                    style={isOpen
                      ? { background: Z.greenL, borderColor: '#B6E8CA' }
                      : { background: '#FAFBFC', borderColor: 'transparent' }}
                    onClick={() => setSelectedAppt(isOpen ? null : a)}
                  >
                    <div className="text-center w-14 flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: Z.navy }}>{fmtT(a.appointmentDate)}</p>
                    </div>
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: st.color }} />
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 text-sm"
                         style={{ background: `linear-gradient(135deg, ${Z.green}, #00D4FF)` }}>
                      {(a.patient?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: Z.navy }}>{a.patient?.name || 'Unknown'}</p>
                      <p className="text-xs" style={{ color: Z.text }}>{a.patient?.age}yr · {a.patient?.gender} · {a.patient?.contactNumber}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/patient/${a.patientId}`); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
                      style={{ background: Z.greenL, color: Z.green }}
                    >View Record</button>
                  </div>

                  {/* Expanded patient details */}
                  {isOpen && a.patient && (
                    <div className="mx-4 mt-1 mb-2 p-4 rounded-xl border" style={{ background: '#F8FFF9', borderColor: '#B6E8CA' }}>
                      <p className="text-xs font-bold mb-3" style={{ color: Z.navy }}>Patient Details</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        {[
                          { l: 'Age',     v: `${a.patient.age} yrs` },
                          { l: 'Gender',  v: a.patient.gender },
                          { l: 'Phone',   v: a.patient.contactNumber },
                          { l: 'Email',   v: a.patient.email || '—' },
                        ].map(f => (
                          <div key={f.l} className="bg-white rounded-lg p-2 border" style={{ borderColor: '#E6F7EE' }}>
                            <p className="text-[10px]" style={{ color: Z.text }}>{f.l}</p>
                            <p className="text-xs font-semibold truncate" style={{ color: Z.navy }}>{f.v}</p>
                          </div>
                        ))}
                      </div>
                      {a.patient.documents?.length > 0 && (
                        <>
                          <p className="text-xs font-bold mb-2" style={{ color: Z.navy }}>
                            Documents ({a.patient.documents.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {a.patient.documents.map(d => (
                              <a key={d.documentId}
                                 href={`http://localhost:5011${d.fileUrl}`}
                                 target="_blank" rel="noreferrer"
                                 className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border text-xs transition-all hover:shadow-sm"
                                 style={{ borderColor: '#E6F7EE', color: Z.navy }}>
                                <MdInsertDriveFile className="w-4 h-4" style={{ color: Z.orange }} />
                                <span className="max-w-[100px] truncate">{(d.fileUrl || '').split('/').pop()}</span>
                                <span style={{ color: Z.text }}>({DOC_TYPE_LABELS[d.documentType] || d.documentType})</span>
                                <MdOpenInNew className="w-3 h-3" style={{ color: Z.blue }} />
                              </a>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

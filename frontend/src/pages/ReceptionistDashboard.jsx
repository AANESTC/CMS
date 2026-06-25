import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdEventAvailable, MdPersonAddAlt1, MdCloudUpload, MdPeople,
  MdInsertDriveFile, MdOpenInNew, MdAttachMoney, MdPendingActions,
  MdCheckCircle, MdCancel, MdNotificationsActive, MdTrendingUp,
  MdBloodtype, MdMedicalServices,
} from 'react-icons/md';
import {
  getDashboardSummary, getTodaysAppointments, getDocuments
} from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

/* ── Zoho tokens ── */
const Z = {
  blue:   '#0B5FFF', blueL:  '#EEF4FF',
  green:  '#00AA45', greenL: '#E6F7EE',
  orange: '#F5A623', orangeL:'#FFF5E5',
  red:    '#E42527', redL:   '#FEE9E9',
  purple: '#7B61FF', purpleL:'#F0EDFF',
  navy:   '#1A2B4A', text:   '#6B7A99',
  bg:     '#EEF2F7',
};

const StatCard = ({ title, value, sub, icon: Icon, color, colorL }) => (
  <div className="bg-white rounded-2xl p-5 flex items-center gap-4 zoho-card">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
         style={{ background: colorL }}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium truncate" style={{ color: Z.text }}>{title}</p>
      <p className="text-2xl font-bold leading-tight" style={{ color: Z.navy }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: Z.text }}>{sub}</p>}
    </div>
  </div>
);

const MiniStat = ({ label, value, color }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm" style={{ color: Z.text }}>{label}</span>
    <span className="text-sm font-bold" style={{ color }}>{value}</span>
  </div>
);

const PIE_COLORS = [Z.blue, Z.green, Z.orange, Z.purple];

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary]   = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardSummary().catch(() => null),
      getTodaysAppointments().catch(() => []),
      getDocuments().catch(() => []),
    ]).then(([s, appts, d]) => {
      setSummary(s);
      setTodayAppts(appts.slice(0, 5));
      setDocs(d.slice(0, 4));
      setLoading(false);
    });
  }, []);

  const s = summary;
  const fmt  = (n) => loading ? '…' : (n ?? 0);
  const fmtM = (n) => loading ? '…' : `₹${((n ?? 0)).toLocaleString('en-IN')}`;
  const fmtT = (dt) => dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
  const statusCls = (s) => {
    if (s === 0 || s === 'Scheduled') return { label: 'Scheduled', bg: Z.greenL, color: Z.green };
    if (s === 1 || s === 'Cancelled') return { label: 'Cancelled', bg: Z.redL, color: Z.red };
    return { label: 'Completed', bg: Z.blueL, color: Z.blue };
  };

  // Pie: doc types
  const docPie = s ? [
    { name: 'Blood Test',    value: s.docsByType?.bloodTest    || 0 },
    { name: 'X-Ray',         value: s.docsByType?.xray         || 0 },
    { name: 'Prescription',  value: s.docsByType?.prescription || 0 },
    { name: 'Other',         value: s.docsByType?.other        || 0 },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: Z.navy }}>Receptionist Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: Z.text }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Row 1: 6 Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Today's Appointments" value={fmt(s?.todayTotal)}        sub={`${fmt(s?.scheduledToday)} scheduled`}  icon={MdEventAvailable}    color={Z.blue}   colorL={Z.blueL}   />
        <StatCard title="New Registrations"    value={fmt(s?.newToday)}          sub={`${fmt(s?.newThisMonth)} this month`}   icon={MdPersonAddAlt1}     color={Z.green}  colorL={Z.greenL}  />
        <StatCard title="Total Patients"       value={fmt(s?.totalPatients)}     sub="in database"                            icon={MdPeople}            color={Z.purple} colorL={Z.purpleL} />
        <StatCard title="Documents Uploaded"   value={fmt(s?.totalDocuments)}    sub={`${fmt(s?.docsToday)} today`}           icon={MdCloudUpload}       color={Z.orange} colorL={Z.orangeL} />
        <StatCard title="Total Revenue"        value={fmtM(s?.totalRevenue)}     sub="collected so far"                       icon={MdAttachMoney}       color={Z.green}  colorL={Z.greenL}  />
        <StatCard title="Pending Dues"         value={fmtM(s?.pendingRevenue)}   sub={`${fmt(s?.unpaidCount)} unpaid`}        icon={MdPendingActions}    color={Z.red}    colorL={Z.redL}    />
      </div>

      {/* ── Row 2: Chart (half width) + Appt Breakdown + Patient Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar Chart — half width */}
        <div className="bg-white rounded-2xl p-5 zoho-card">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-sm" style={{ color: Z.navy }}>Appointments (7 Days)</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: Z.blueL, color: Z.blue }}>Weekly</span>
          </div>
          <div className="h-[160px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: Z.text }}>Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s?.weekChart || []} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F4F8" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: Z.text, fontSize: 10 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: Z.text, fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Bar dataKey="appointments" name="Total" fill={Z.blue} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="completed"    name="Done"  fill={Z.green} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Today's Appointment Breakdown */}
        <div className="bg-white rounded-2xl p-5 zoho-card">
          <h2 className="font-bold text-sm mb-4" style={{ color: Z.navy }}>Today's Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Booked',   value: fmt(s?.todayTotal),      color: Z.navy,   bg: '#F0F4F8', icon: MdEventAvailable },
              { label: 'Scheduled',      value: fmt(s?.scheduledToday),  color: Z.green,  bg: Z.greenL,  icon: MdCheckCircle },
              { label: 'Completed',      value: fmt(s?.completedToday),  color: Z.blue,   bg: Z.blueL,   icon: MdMedicalServices },
              { label: 'Cancelled',      value: fmt(s?.cancelledToday),  color: Z.red,    bg: Z.redL,    icon: MdCancel },
              { label: 'Follow-ups Tomorrow', value: fmt(s?.tomorrowFollowUps), color: Z.orange, bg: Z.orangeL, icon: MdNotificationsActive },
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
            <p className="text-xs font-semibold mb-2" style={{ color: Z.text }}>GENDER</p>
            <div className="space-y-1.5">
              {[
                { label: 'Male',   val: s?.genderSplit?.male   || 0, color: Z.blue,  total: s?.totalPatients || 1 },
                { label: 'Female', val: s?.genderSplit?.female || 0, color: '#EC4899', total: s?.totalPatients || 1 },
              ].map(({ label, val, color, total }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span style={{ color: Z.text }}>{label}</span>
                    <span style={{ color: Z.navy, fontWeight: 600 }}>{val}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((val / total) * 100)}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-3" style={{ borderColor: '#F0F4F8' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: Z.text }}>AGE GROUPS</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Under 18', val: s?.ageGroups?.children || 0, color: Z.orange },
                { label: '18–60',    val: s?.ageGroups?.adults   || 0, color: Z.blue },
                { label: '60+',      val: s?.ageGroups?.senior   || 0, color: Z.purple },
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

      {/* ── Row 3: Today's Schedule + Revenue + Doc Types ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Today's Appointment List */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 zoho-card">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-sm" style={{ color: Z.navy }}>Today's Schedule</h2>
            <button onClick={() => navigate('/receptionist/appointments')} className="text-xs font-semibold" style={{ color: Z.blue }}>View All →</button>
          </div>
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-center py-4" style={{ color: Z.text }}>Loading…</p>
            ) : todayAppts.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: Z.text }}>No appointments today.</p>
            ) : todayAppts.map(a => {
              const st = statusCls(a.status);
              return (
                <div key={a.appointmentId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                     onClick={() => navigate('/receptionist/appointments')}>
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-xs font-bold" style={{ color: Z.navy }}>{fmtT(a.appointmentDate)}</p>
                  </div>
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: st.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: Z.navy }}>{a.patient?.name || '—'}</p>
                    <p className="text-[10px]" style={{ color: Z.text }}>{a.patient?.contactNumber}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-2xl p-5 zoho-card">
          <h2 className="font-bold text-sm mb-4" style={{ color: Z.navy }}>Revenue Summary</h2>
          <div className="space-y-0">
            <MiniStat label="Collected (All Time)" value={fmtM(s?.totalRevenue)}   color={Z.green}  />
            <MiniStat label="Pending Dues"          value={fmtM(s?.pendingRevenue)} color={Z.red}    />
            <MiniStat label="Collected Today"       value={fmtM(s?.paidToday)}      color={Z.blue}   />
            <MiniStat label="Unpaid Invoices"       value={fmt(s?.unpaidCount)}     color={Z.orange} />
          </div>
          <button onClick={() => navigate('/receptionist/invoices')}
                  className="mt-4 w-full py-2 rounded-xl text-xs font-semibold transition-all zoho-btn-primary text-white">
            Manage Invoices
          </button>
        </div>

        {/* Document Types Pie */}
        <div className="bg-white rounded-2xl p-5 zoho-card">
          <h2 className="font-bold text-sm mb-2" style={{ color: Z.navy }}>Documents by Type</h2>
          {loading || docPie.length === 0 ? (
            <div className="flex items-center justify-center h-[160px] text-sm" style={{ color: Z.text }}>
              {loading ? 'Loading…' : 'No documents yet'}
            </div>
          ) : (
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={docPie} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                    {docPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <button onClick={() => navigate('/receptionist/documents')}
                  className="mt-2 w-full py-2 rounded-xl text-xs font-semibold border transition-all" style={{ color: Z.blue, borderColor: Z.blueL }}>
            View All Documents
          </button>
        </div>
      </div>

      {/* ── Row 4: Recent Documents ── */}
      <div className="bg-white rounded-2xl p-5 zoho-card">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-sm" style={{ color: Z.navy }}>Recent Document Uploads</h2>
          <button onClick={() => navigate('/receptionist/documents')} className="text-xs font-semibold" style={{ color: Z.blue }}>View All →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            <p className="col-span-4 text-sm text-center py-4" style={{ color: Z.text }}>Loading…</p>
          ) : docs.length === 0 ? (
            <p className="col-span-4 text-sm text-center py-4" style={{ color: Z.text }}>No documents uploaded yet.</p>
          ) : docs.map(d => (
            <div key={d.documentId} className="flex items-center gap-3 p-3 rounded-xl border transition-colors hover:bg-gray-50 cursor-pointer" style={{ borderColor: '#F0F4F8' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: Z.orangeL }}>
                <MdInsertDriveFile className="w-4 h-4" style={{ color: Z.orange }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: Z.navy }}>{d.patient?.name || '—'}</p>
                <p className="text-[10px] truncate" style={{ color: Z.text }}>{(d.fileUrl || '').split('/').pop()}</p>
              </div>
              <a href={`http://localhost:5011${d.fileUrl}`} target="_blank" rel="noreferrer"
                 className="flex-shrink-0 p-1.5 rounded-lg" style={{ background: Z.blueL }}
                 onClick={e => e.stopPropagation()}>
                <MdOpenInNew className="w-3.5 h-3.5" style={{ color: Z.blue }} />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ReceptionistDashboard;

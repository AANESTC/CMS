import React, { useState, useEffect } from 'react';
import {
  MdNotificationsActive, MdPhone, MdMessage, MdCheckCircle,
  MdPeople, MdSchedule, MdEvent, MdMarkEmailRead, MdRefresh,
} from 'react-icons/md';
import { getAppointments } from '../api';

const Z = {
  blue: '#0B5FFF', blueL: '#EEF4FF',
  green: '#00AA45', greenL: '#E6F7EE',
  orange: '#F5A623', orangeL: '#FFF5E5',
  teal: '#00B2A9', tealL: '#E0F7F6',
  navy: '#1A2B4A', text: '#6B7A99',
};

const FollowUpManagement = () => {
  const [allScheduled, setAllScheduled] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remindedIds, setRemindedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('tomorrow'); // 'tomorrow' | 'upcoming'

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      const now = new Date();

      const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
      const dayAfter = new Date(tomorrow); dayAfter.setDate(tomorrow.getDate() + 1);
      const weekAhead = new Date(now); weekAhead.setDate(now.getDate() + 7);

      const scheduled = data.filter(a => a.status === 0 || a.status === 'Scheduled');

      const tmrw = scheduled.filter(a => {
        const d = new Date(a.appointmentDate);
        return d >= tomorrow && d < dayAfter;
      }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

      const next7 = scheduled.filter(a => {
        const d = new Date(a.appointmentDate);
        return d >= dayAfter && d <= weekAhead;
      }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

      setFollowUps(tmrw);
      setUpcoming(next7);
      setAllScheduled(scheduled);
    } catch (err) {
      console.error('Failed to load follow-ups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remind = (id) => setRemindedIds(prev => new Set([...prev, id]));
  const remindAll = () => setRemindedIds(new Set(followUps.map(a => a.appointmentId)));
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  const list = activeTab === 'tomorrow' ? followUps : upcoming;
  const reminded = list.filter(a => remindedIds.has(a.appointmentId)).length;
  const pending = list.filter(a => !remindedIds.has(a.appointmentId)).length;

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: Z.navy }}>Follow-ups & Reminders</h1>
          <p className="text-sm mt-0.5" style={{ color: Z.text }}>Call or WhatsApp patients to confirm upcoming appointments.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 bg-white rounded-xl border zoho-card">
            <MdRefresh className="w-5 h-5" style={{ color: Z.text }} />
          </button>
          {activeTab === 'tomorrow' && followUps.length > 0 && (
            <button onClick={remindAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: Z.teal + '22', color: Z.teal, border: `1px solid ${Z.tealL}` }}>
              <MdMarkEmailRead className="w-4 h-4" /> Mark All Reminded
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tomorrow's Patients", value: loading ? '…' : followUps.length, icon: MdEvent, color: Z.blue, bg: Z.blueL },
          { label: 'Next 7 Days', value: loading ? '…' : upcoming.length, icon: MdSchedule, color: Z.orange, bg: Z.orangeL },
          { label: 'Reminded', value: loading ? '…' : remindedIds.size, icon: MdCheckCircle, color: Z.green, bg: Z.greenL },
          { label: 'Pending', value: loading ? '…' : pending, icon: MdNotificationsActive, color: Z.teal, bg: Z.tealL },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 flex items-center gap-3 zoho-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: Z.text }}>{label}</p>
              <p className="text-xl font-bold" style={{ color: Z.navy }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl zoho-card overflow-hidden">
        <div className="flex border-b" style={{ borderColor: '#F0F4F8' }}>
          {[
            { key: 'tomorrow', label: `Tomorrow (${followUps.length})` },
            { key: 'upcoming', label: `Next 7 Days (${upcoming.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-6 py-3.5 text-sm font-semibold transition-all border-b-2 -mb-px"
              style={activeTab === tab.key
                ? { color: Z.blue, borderColor: Z.blue, background: Z.blueL }
                : { color: Z.text, borderColor: 'transparent' }}>
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center px-4 gap-2">
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: Z.greenL, color: Z.green }}>{reminded} reminded</span>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: Z.orangeL, color: Z.orange }}>{pending} pending</span>
          </div>
        </div>

        {/* Progress bar */}
        {list.length > 0 && (
          <div className="px-5 py-2 border-b" style={{ borderColor: '#F0F4F8' }}>
            <div className="flex justify-between text-[10px] mb-1" style={{ color: Z.text }}>
              <span>Reminder Progress</span>
              <span>{reminded}/{list.length}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: '#F0F4F8' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${list.length ? Math.round((reminded / list.length) * 100) : 0}%`, background: Z.green }} />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase border-b" style={{ color: Z.text, background: '#FAFBFD', borderColor: '#F0F4F8' }}>
                <th className="px-5 py-3 font-semibold">{activeTab === 'tomorrow' ? 'Time' : 'Date & Time'}</th>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Doctor</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F8FAFC' }}>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-sm" style={{ color: Z.text }}>Loading…</td></tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <MdCheckCircle className="w-12 h-12 mx-auto mb-2" style={{ color: '#D1D5DB' }} />
                    <p className="font-semibold" style={{ color: Z.text }}>
                      {activeTab === 'tomorrow' ? 'No appointments scheduled for tomorrow.' : 'No upcoming appointments in the next 7 days.'}
                    </p>
                  </td>
                </tr>
              ) : list.map(a => {
                const isReminded = remindedIds.has(a.appointmentId);
                const phone = a.patient?.whatsAppNumber || a.patient?.contactNumber || '';
                return (
                  <tr key={a.appointmentId}
                    className="transition-colors hover:bg-gray-50"
                    style={isReminded ? { background: '#FAFBFC', opacity: 0.75 } : {}}>
                    <td className="px-5 py-3.5 font-bold text-sm" style={{ color: Z.teal }}>
                      {activeTab === 'upcoming' && <span className="block text-[10px] font-semibold text-gray-400">{fmtDate(a.appointmentDate)}</span>}
                      {fmtTime(a.appointmentDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${Z.blue}, #2D7FF9)` }}>
                          {(a.patient?.name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: Z.navy }}>{a.patient?.name || '—'}</p>
                          <p className="text-[10px]" style={{ color: Z.text }}>{a.patient?.age}yr · {a.patient?.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium" style={{ color: Z.navy }}>{a.patient?.contactNumber || '—'}</p>
                      {a.patient?.email && <p className="text-[10px]" style={{ color: Z.text }}>{a.patient.email}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: Z.navy }}>{a.doctor?.name || 'Dr. Smith'}</td>
                    <td className="px-5 py-3.5">
                      {isReminded
                        ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: Z.greenL, color: Z.green }}>✓ Reminded</span>
                        : <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: Z.orangeL, color: Z.orange }}>Pending</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {isReminded ? (
                        <button onClick={() => setRemindedIds(prev => { const n = new Set(prev); n.delete(a.appointmentId); return n; })}
                          className="text-xs px-2 py-1 rounded-lg" style={{ color: Z.text, background: '#F0F4F8' }}>Undo</button>
                      ) : (
                        <div className="flex gap-2">
                          <a href={`tel:${phone}`} onClick={() => remind(a.appointmentId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ background: Z.blueL, color: Z.blue }}>
                            <MdPhone className="w-3.5 h-3.5" /> Call
                          </a>
                          <a href={`https://wa.me/${phone.replace(/\D/g, '')}?text=Hello ${encodeURIComponent(a.patient?.name || '')}, this is a reminder for your appointment tomorrow at ${fmtTime(a.appointmentDate)} with ${a.doctor?.name || 'Dr. Smith'}.`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={() => remind(a.appointmentId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ background: Z.greenL, color: Z.green }}>
                            <MdMessage className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FollowUpManagement;

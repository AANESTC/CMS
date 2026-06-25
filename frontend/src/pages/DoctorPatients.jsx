import React, { useState, useEffect } from 'react';
import { MdPerson } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getTodaysAppointments } from '../api';

const statusStyle = (s) => {
  if (s === 0 || s === 'Scheduled') return { label: 'Scheduled', cls: 'bg-green-100 text-green-700' };
  if (s === 1 || s === 'Cancelled') return { label: 'Cancelled', cls: 'bg-red-100 text-red-700' };
  if (s === 2 || s === 'Completed') return { label: 'Completed', cls: 'bg-blue-100 text-blue-700' };
  return { label: String(s), cls: 'bg-gray-100 text-gray-600' };
};

const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodaysAppointments()
      .then(setAppointments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Today's Patients</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{loading ? '...' : `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400">Loading today's patients...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <MdPerson className="w-16 h-16 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No appointments scheduled for today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {appointments.map((a) => {
            const s = statusStyle(a.status);
            const p = a.patient;
            return (
              <div 
                key={a.appointmentId} 
                onClick={() => navigate(`/patient/${a.patientId}`)}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Decorative background element */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0 ${s.label === 'Scheduled' ? 'bg-indigo-50' : s.label === 'Cancelled' ? 'bg-red-50' : 'bg-blue-50'}`}></div>
                
                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${s.label === 'Scheduled' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30' : s.label === 'Cancelled' ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30' : 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30'}`}>
                    {(p?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600 font-mono">
                    {fmtTime(a.appointmentDate)}
                  </div>
                </div>

                <div className="relative z-10 mb-4 flex-1">
                  <h3 className="text-lg font-bold text-gray-800 capitalize truncate">{p?.name || 'Unknown Patient'}</h3>
                  <p className="text-indigo-500 text-sm font-semibold mb-2">Appointment</p>
                  
                  <div className="space-y-2 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="font-medium text-xs uppercase w-12">Age/Sex</span>
                      <span>{p?.age || '?'} / {p?.gender || '?'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="font-medium text-xs uppercase w-12">Phone</span>
                      <span>{p?.contactNumber || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-gray-100 flex justify-between items-center gap-1">
                   <span className={`px-2 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>{s.label}</span>
                   <button
                     className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                   >
                     View Record
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;

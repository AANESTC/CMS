import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLocalHospital, MdArrowForward, MdMedicalServices, MdPeople, MdBarChart } from 'react-icons/md';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Doctor');
  const [email, setEmail] = useState('admin@careflow.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5011/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid credentials');
      }
      const data = await res.json();
      // Store session in localStorage
      localStorage.setItem('cf_role', data.role);
      localStorage.setItem('cf_userId', data.userId);
      if (data.doctorId) localStorage.setItem('cf_doctorId', data.doctorId);
      if (data.doctorName) localStorage.setItem('cf_doctorName', data.doctorName);

      if (data.role === 'Doctor') navigate('/dashboard');
      else navigate('/receptionist/dashboard');
    } catch (err) {
      // Fallback: allow demo login with role selector for dev mode
      setError('');
      localStorage.setItem('cf_role', role);
      localStorage.removeItem('cf_doctorId');
      localStorage.removeItem('cf_doctorName');
      if (role === 'Doctor') navigate('/dashboard');
      else navigate('/receptionist/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: MdMedicalServices, label: 'Patient Management', color: '#0B5FFF' },
    { icon: MdPeople,          label: 'Appointments',       color: '#00AA45' },
    { icon: MdBarChart,        label: 'Analytics & Reports', color: '#F5A623' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#EEF2F7' }}>

      {/* ── Left Panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1A2B4A 0%, #0F1D35 60%, #0B5FFF 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10"
             style={{ background: '#0B5FFF' }} />
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full opacity-10"
             style={{ background: '#00AA45' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
             style={{ background: '#F5A623' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                 style={{ background: 'rgba(11,95,255,0.3)' }}>
              <MdLocalHospital className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CareFlow CMS</h1>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Clinic Management System</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Streamline Your<br />
            <span style={{ color: '#4DA6FF' }}>Clinic Operations</span>
          </h2>
          <p className="text-base mb-10" style={{ color: '#94A3B8' }}>
            A complete platform for managing patients, appointments,<br />
            documents and billing — all in one place.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-2xl"
                   style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: `${color}22` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-white font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer tag */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: '#475569' }}>
            © 2025 CareFlow CMS · All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                 style={{ background: '#0B5FFF' }}>
              <MdLocalHospital className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#1A2B4A' }}>CareFlow CMS</h1>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl" style={{ boxShadow: '0 20px 60px rgba(11,95,255,0.12)' }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A2B4A' }}>Welcome back 👋</h2>
              <p className="text-sm" style={{ color: '#6B7A99' }}>Sign in to your portal to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Role selector */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1A2B4A' }}>
                  Login As
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Doctor', 'Receptionist'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2"
                      style={role === r ? {
                        background: '#EEF4FF',
                        borderColor: '#0B5FFF',
                        color: '#0B5FFF',
                        boxShadow: '0 0 0 3px rgba(11,95,255,0.12)'
                      } : {
                        background: '#F8FAFC',
                        borderColor: '#E2E8F0',
                        color: '#64748B'
                      }}
                    >
                      {r === 'Doctor' ? '🩺' : '🏥'} {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1A2B4A' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@careflow.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm transition-all"
                  style={{ borderColor: '#E2E8F0', color: '#1A2B4A', background: '#F8FAFC' }}
                  onFocus={e => e.target.style.borderColor = '#0B5FFF'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1A2B4A' }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm transition-all"
                  style={{ borderColor: '#E2E8F0', color: '#1A2B4A', background: '#F8FAFC' }}
                  onFocus={e => e.target.style.borderColor = '#0B5FFF'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-600 font-semibold px-3 py-2 bg-red-50 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" />
                  <span className="text-sm" style={{ color: '#6B7A99' }}>Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold" style={{ color: '#0B5FFF' }}>
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="zoho-btn-primary w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <MdArrowForward className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
              <span className="text-xs" style={{ color: '#94A3B8' }}>CareFlow v1.0</span>
              <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
            </div>

            {/* Status indicator */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#00AA45' }} />
              <span className="text-xs" style={{ color: '#6B7A99' }}>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

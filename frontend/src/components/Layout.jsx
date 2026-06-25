import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { MdDashboard, MdCalendarMonth, MdPersonSearch, MdLogout, MdLocalHospital, MdInsertDriveFile } from 'react-icons/md';

/* ── Zoho color tokens ── */
const ZOHO = {
  sidebar:    '#1A2B4A',
  sidebarAlt: '#0F1D35',
  blue:       '#0B5FFF',
  blueLight:  'rgba(11,95,255,0.15)',
  text:       '#94A3B8',
  bg:         '#EEF2F7',
};

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
    { name: 'Calendar',  path: '/calendar',  icon: MdCalendarMonth },
    { name: 'Patients',  path: '/patients',  icon: MdPersonSearch },
    { name: 'Documents', path: '/documents', icon: MdInsertDriveFile },
  ];

  return (
    <div className="flex h-screen" style={{ background: ZOHO.bg }}>

      {/* ── Sidebar ───────────────────────────────── */}
      <div
        className="w-60 flex-shrink-0 flex flex-col h-full relative overflow-hidden"
        style={{ background: `linear-gradient(175deg, ${ZOHO.sidebar} 0%, ${ZOHO.sidebarAlt} 100%)` }}
      >
        {/* Decorative blob */}
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-10"
             style={{ background: '#00AA45' }} />

        {/* Logo */}
        <div className="p-5 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: '#00AA45' }}>
              <MdLocalHospital className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">CareFlow CMS</p>
              <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Doctor Portal</p>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
            Main Menu
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ name, path, icon: Icon }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <Link
                key={name}
                to={path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={isActive ? {
                  background: 'rgba(0,170,69,0.15)',
                  color: '#FFFFFF',
                  boxShadow: 'inset 3px 0 0 #00AA45',
                } : {
                  color: ZOHO.text,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: isActive ? '#00AA45' : ZOHO.text }}
                />
                {name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                 style={{ background: '#00AA45' }}>D</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Dr. Smith</p>
              <p className="text-xs truncate" style={{ color: '#475569' }}>doctor</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all"
            style={{ color: '#64748B' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#F87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
          >
            <MdLogout className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b flex items-center px-6 gap-4 flex-shrink-0"
                style={{ borderColor: '#E8EDF4' }}>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>
              {navItems.find(n => location.pathname === n.path || location.pathname.startsWith(n.path + '/'))?.name || 'Dashboard'}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

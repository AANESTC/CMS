import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { MdDashboard, MdPeople, MdEvent, MdInsertDriveFile, MdLogout, MdReceipt, MdNotificationsActive, MdLocalHospital, MdLibraryBooks, MdAnalytics, MdSettings, MdMedicalServices } from 'react-icons/md';

const ReceptionistLayout = () => {
  const location  = useLocation();
  const navigate  = useNavigate();

  const navItems = [
    { name: 'Dashboard',    path: '/receptionist/dashboard',    icon: MdDashboard },
    { name: 'Patients',     path: '/receptionist/patients',     icon: MdPeople },
    { name: 'Doctors',      path: '/receptionist/doctors',      icon: MdMedicalServices },
    { name: 'Appointments', path: '/receptionist/appointments', icon: MdEvent },
    { name: 'Follow-ups',   path: '/receptionist/follow-ups',   icon: MdNotificationsActive },
    { name: 'Documents',    path: '/receptionist/documents',    icon: MdInsertDriveFile },
    { name: 'Medical Records', path: '/receptionist/medical-records', icon: MdLibraryBooks },
    { name: 'Invoices',     path: '/receptionist/invoices',     icon: MdReceipt },
    { name: 'Reports',      path: '/receptionist/reports',      icon: MdAnalytics },
    { name: 'Settings',     path: '/receptionist/settings',     icon: MdSettings },
  ];

  const isDocumentsPage = location.pathname.includes('/receptionist/documents');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. SIDEBAR */}
      <div className="flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 z-20" style={{ width: '210px', background: '#1e2d4d' }}>
        
        {/* BRAND HEADER */}
        <div className="flex items-center gap-3" style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', background: '#3b82f6' }}>
            <MdLocalHospital size={18} className="text-white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff', lineHeight: 1.2 }}>CareFlow PCMS</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px', lineHeight: 1.2 }}>Receptionist Portal</span>
          </div>
        </div>

        {/* SECTION LABEL */}
        <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', padding: '16px 16px 6px' }}>
          MAIN MENU
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 overflow-y-auto pb-4" style={{ display: 'flex', flexDirection: 'column' }}>
          {navItems.map(({ name, path, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={name}
                to={path}
                className="flex items-center gap-2"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  margin: '2px 10px',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  transition: 'background 0.2s',
                  textDecoration: 'none'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} />
                <span style={{ fontSize: '13px' }}>{name}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="mt-auto flex flex-col" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3" style={{ padding: '12px 16px' }}>
            <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: '30px', height: '30px', background: '#3b82f6' }}>
              <span style={{ fontSize: '13px', color: 'white' }}>R</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#ffffff', lineHeight: 1.2 }}>Receptionist</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px', lineHeight: 1.2 }}>Front Desk</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 cursor-pointer bg-transparent border-none w-full text-left"
            style={{ padding: '7px 16px 16px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            <MdLogout size={16} /> Logout
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-screen bg-[#f8fafc]" style={{ marginLeft: '210px' }}>
        
        {/* 2. TOP BAR */}
        <header className="flex items-center bg-white flex-shrink-0" style={{ height: '52px', padding: '0 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#111827', margin: 0 }}>
            {navItems.find(n => location.pathname.startsWith(n.path))?.name || 'Dashboard'}
          </h1>
        </header>

        {/* Body */}
        <main className={`flex-1 flex flex-col ${isDocumentsPage ? 'overflow-hidden' : 'p-6 overflow-y-auto'}`}>
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default ReceptionistLayout;

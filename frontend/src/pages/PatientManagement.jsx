import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, registerPatient } from '../api';
import {
  MdArrowBack,
  MdFilterList,
  MdPersonAdd,
  MdPeople,
  MdPerson,
  MdSecurity,
  MdSearch,
  MdVisibility,
  MdDownload,
  MdKeyboardArrowDown,
  MdChevronLeft,
  MdChevronRight,
  MdAdd,
  MdMoreVert,
  MdClose,
  MdMail,
  MdCalendarMonth,
  MdTune,
  MdTableChart,
  MdGridView,
  MdDescription,
  MdAccessTime,
  MdEventAvailable,
  MdPhone
} from 'react-icons/md';

const getAvatarUrl = (name) => {
  const seed = encodeURIComponent((name || 'Unknown').trim().toLowerCase());
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

// Sparkline Component for Stats Cards
const Sparkline = ({ data, color, fill }) => {
  return (
    <svg className="w-full h-6 mt-1" viewBox="0 0 100 30" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-pat-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.2" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d={data}
        fill={`url(#grad-pat-${color.replace('#','')})`}
      />
      <path
        d={data.replace(/ L [0-9\s.]+ Z$/, '')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const PatientManagement = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [conditionFilter, setConditionFilter] = useState('All Conditions');
  const [doctorFilter, setDoctorFilter] = useState('All Doctors');
  const [sortBy, setSortBy] = useState('Newest First');
  
  // View mode state (defaults to 'table')
  const [viewMode, setViewMode] = useState('table');
  
  // Stats visibility state
  const [showStats, setShowStats] = useState(false);
  
  // Accordion state for collapsible cards
  const [expandedIds, setExpandedIds] = useState([]);
  
  // Selection and Checkbox States (for table view)
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Registration Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('Male');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientCondition, setNewPatientCondition] = useState('New Patient');
  const [newPatientRisk, setNewPatientRisk] = useState('Low');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (id) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter(item => item !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredPatients.map(p => p.patientId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(item => item !== id));
    }
  };

  // Filter & Sort patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contactNumber?.includes(searchTerm);

    // Dummy filters since backend doesn't support them natively yet
    const matchesStatus = statusFilter === 'All Status';
    const matchesCondition = conditionFilter === 'All Conditions';
    const matchesDoctor = doctorFilter === 'All Doctors';

    return matchesSearch && matchesStatus && matchesCondition && matchesDoctor;
  }).sort((a, b) => {
    if (sortBy === 'Name A-Z') {
      return (a.name || '').localeCompare(b.name || '');
    } else {
      return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
    }
  });

  const handleViewPatient = (id) => {
    navigate(`/receptionist/patients/${id}`);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPatientPhone.trim()) {
      alert('Please fill in Name and Phone Number.');
      return;
    }

    try {
      const payload = {
        name: newPatientName,
        age: parseInt(newPatientAge) || 30,
        gender: newPatientGender,
        contactNumber: newPatientPhone,
        whatsAppNumber: newPatientPhone,
        address: '100 Galaxy Circle',
        email: newPatientEmail || `${newPatientName.toLowerCase().replace(/ /g, '.')}@email.com`
      };

      const created = await registerPatient(payload);
      setPatients([created, ...patients]);
      setIsRegModalOpen(false);

      // Reset fields
      setNewPatientName('');
      setNewPatientAge('');
      setNewPatientPhone('');
      setNewPatientEmail('');
      setNewPatientCondition('New Patient');
      setNewPatientRisk('Low');

      alert(`Patient ${newPatientName} registered successfully!`);
    } catch (e) {
      alert('Registration failed: ' + e.message);
    }
  };

  const tableColWidths = { gridTemplateColumns: '40px 80px 2.2fr 0.7fr 1.4fr 1.4fr 2.2fr 1.6fr 1fr 1fr 1fr' };

  return (
    <div className="screen-fade h-full overflow-hidden p-4 flex flex-col gap-4 bg-slate-50/50 min-h-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
        </div>

        <button 
          className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3 rounded-lg cursor-pointer font-bold zoho-btn-primary" 
          onClick={() => setIsRegModalOpen(true)}
          style={{ background: '#0B5FFF', color: 'white' }}
        >
          <MdAdd size={14} />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Row 1: 5 Statistics Cards with Sparklines */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 transition-all duration-300 flex-shrink-0">
          {/* Total Patients */}
          <div className="stat-card flex flex-col justify-between py-2.5 px-3.5 h-26 bg-white border border-slate-200 rounded-xl">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Total Patients</p>
                  <p className="text-2xl font-bold text-slate-800 mt-0.5" style={{ fontWeight: 700 }}>{patients.length}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MdPeople className="text-blue-500" size={14} />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 block truncate">All registered patients</span>
            </div>
            <Sparkline data="M 0 25 Q 25 18 50 22 T 100 12 L 100 30 L 0 30 Z" color="#3b82f6" fill="#3b82f6" />
          </div>

          {/* Active Patients */}
          <div className="stat-card flex flex-col justify-between py-2.5 px-3.5 h-26 bg-white border border-slate-200 rounded-xl">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Active Patients</p>
                  <p className="text-2xl font-bold text-slate-800 mt-0.5" style={{ fontWeight: 700 }}>{Math.floor(patients.length * 0.8)}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <MdAccessTime className="text-green-500" size={14} />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 block truncate">78.8% of total patients</span>
            </div>
            <Sparkline data="M 0 20 Q 25 24 50 15 T 100 18 L 100 30 L 0 30 Z" color="#10b981" fill="#10b981" />
          </div>

          {/* Follow-up Due */}
          <div className="stat-card flex flex-col justify-between py-2.5 px-3.5 h-26 bg-white border border-slate-200 rounded-xl">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Follow-up Due</p>
                  <p className="text-2xl font-bold text-slate-800 mt-0.5" style={{ fontWeight: 700 }}>14</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <MdEventAvailable className="text-amber-500" size={14} />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 block truncate">Require follow-up</span>
            </div>
            <Sparkline data="M 0 15 Q 25 12 50 20 T 100 15 L 100 30 L 0 30 Z" color="#f59e0b" fill="#f59e0b" />
          </div>

          {/* New This Week */}
          <div className="stat-card flex flex-col justify-between py-2.5 px-3.5 h-26 bg-white border border-slate-200 rounded-xl">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">New This Week</p>
                  <p className="text-2xl font-bold text-slate-800 mt-0.5" style={{ fontWeight: 700 }}>7</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <MdAdd className="text-purple-500" size={14} />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 block truncate">New patients registered</span>
            </div>
            <Sparkline data="M 0 22 Q 25 25 50 12 T 100 10 L 100 30 L 0 30 Z" color="#8b5cf6" fill="#8b5cf6" />
          </div>

          {/* High Risk (New card) */}
          <div className="stat-card flex flex-col justify-between py-2.5 px-3.5 h-26 bg-white border border-slate-200 rounded-xl">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">High Risk</p>
                  <p className="text-2xl font-bold text-red-600 mt-0.5" style={{ fontWeight: 700 }}>2</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <MdTune className="text-red-500" size={14} />
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 block truncate">High risk patients</span>
            </div>
            <Sparkline data="M 0 10 Q 25 6 50 20 T 100 2 L 100 30 L 0 30 Z" color="#ef4444" fill="#ef4444" />
          </div>
        </div>
      )}

      {/* Row 2: Search and Select Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[150px] max-w-[200px]">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} style={{ pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search patients..."
            className="form-input text-slate-700 bg-white font-semibold border-slate-200 hover:border-slate-300 transition text-xs py-2 shadow-sm rounded-lg border w-full outline-none"
            style={{ paddingLeft: '32px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Conditions */}
        <select
          className="form-input form-select text-slate-700 bg-white font-semibold border-slate-200 hover:border-slate-300 transition text-xs py-2 px-2 shadow-sm rounded-lg border outline-none"
          style={{ width: '130px' }}
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
        >
          <option value="All Conditions">All Conditions</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Hypertension">Hypertension</option>
          <option value="Asthma">Asthma</option>
          <option value="Cardiac">Cardiac</option>
        </select>

        {/* Doctors */}
        <select
          className="form-input form-select text-slate-700 bg-white font-semibold border-slate-200 hover:border-slate-300 transition text-xs py-2 px-2 shadow-sm rounded-lg border outline-none"
          style={{ width: '130px' }}
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
        >
          <option value="All Doctors">All Doctors</option>
          <option value="Dr. Rajan">Dr. Rajan</option>
          <option value="Dr. Sharma">Dr. Sharma</option>
        </select>

        {/* Status */}
        <select
          className="form-input form-select text-slate-700 bg-white font-semibold border-slate-200 hover:border-slate-300 transition text-xs py-2 px-2 shadow-sm rounded-lg border outline-none"
          style={{ width: '110px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All Status">All Status</option>
          <option value="Active">Active</option>
          <option value="Follow-up">Follow-up</option>
          <option value="New">New</option>
        </select>

        {/* Export Button */}
        <button className="text-xs py-2 px-3 bg-white border shadow-sm rounded-lg hover:bg-slate-50 font-semibold flex items-center gap-1.5 flex-shrink-0 cursor-pointer" onClick={() => alert('Exporting records...')}>
          <MdDownload size={15} className="text-slate-500" />
          <span>Export</span>
        </button>

        {/* Filters Button */}
        <button className="text-xs py-2 px-3 bg-white border shadow-sm rounded-lg hover:bg-slate-50 font-semibold flex items-center gap-1.5 flex-shrink-0 cursor-pointer" onClick={() => setShowStats(!showStats)}>
          <MdFilterList size={15} className="text-slate-500" />
          <span>Stats</span>
        </button>

        {/* View toggles segment */}
        <div className="bg-slate-200/60 p-0.5 rounded-lg flex gap-0.5 flex-shrink-0">
          <button 
            className={`text-xs py-1.5 px-3 rounded-md font-semibold transition flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setViewMode('table')}
          >
            <MdTableChart size={15} />
            <span>Table View</span>
          </button>
          <button 
            className={`text-xs py-1.5 px-3 rounded-md font-semibold transition flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'card' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setViewMode('card')}
          >
            <MdGridView size={15} />
            <span>Card View</span>
          </button>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-500">
          <span>Sort by:</span>
          <select
            className="form-input text-slate-700 bg-white font-semibold border-slate-200 hover:border-slate-300 transition text-xs py-2 px-2 shadow-sm rounded-lg border outline-none"
            style={{ width: '120px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Newest First">Newest First</option>
            <option value="Name A-Z">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Row 3: Card View (Grid) or Table View */}
      {viewMode === 'card' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-1 min-h-0">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(p => (
                <div key={p.patientId}
                     className="bg-white rounded-2xl p-5 border border-gray-100 zoho-card relative overflow-hidden flex flex-col group hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => handleViewPatient(p.patientId)}>
                  {/* Decorative blob */}
                  <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"
                       style={{ background: '#EEF4FF' }} />

                  <div className="relative z-10 flex items-start justify-between mb-3">
                    <>
                      <img 
                        src={getAvatarUrl(p.name)}
                        alt={p.name} 
                        className="w-12 h-12 rounded-xl flex-shrink-0 object-cover shadow-sm"
                        style={{ border: '2px solid #E5E7EB', background: '#F3F4F6' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="w-12 h-12 rounded-xl items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0"
                           style={{ display: 'none', background: `linear-gradient(135deg, #0B5FFF, #2D7FF9)`, boxShadow: `0 6px 16px rgba(11,95,255,0.3)` }}>
                        {(p.name || '?').charAt(0).toUpperCase()}
                      </div>
                    </>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#F0F4F8', color: '#6B7A99' }}>
                      {p.patientId?.substring(0, 8).toUpperCase()}
                    </span>
                  </div>

                  <div className="relative z-10 flex-1">
                    <h3 className="font-bold truncate" style={{ color: '#1A2B4A' }}>{p.name}</h3>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#0B5FFF' }}>Patient</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex gap-2" style={{ color: '#6B7A99' }}>
                        <span className="font-medium uppercase w-10">Age</span>
                        <span>{p.age} yrs / {(p.gender || '').substring(0,1)}</span>
                      </div>
                      <div className="flex gap-2" style={{ color: '#6B7A99' }}>
                        <span className="font-medium uppercase w-10">Phone</span>
                        <span>{p.contactNumber}</span>
                      </div>
                      {p.email && (
                        <div className="flex gap-2" style={{ color: '#6B7A99' }}>
                          <span className="font-medium uppercase w-10">Email</span>
                          <span className="truncate">{p.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 pt-3 border-t mt-3 flex justify-between items-center gap-1"
                       style={{ borderColor: '#F0F4F8' }}>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ background: '#E6F7EE', color: '#00AA45', borderColor: '#00AA4533' }}>Active</span>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleViewPatient(p.patientId); }}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-all hover:bg-slate-200"
                        style={{ background: '#F0F4F8', color: '#1A2B4A' }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-xl">No patients match the filter criteria.</div>
            )}
          </div>
          
          {/* Card View Pagination Footer */}
          <div className="p-4 border border-slate-200 bg-white rounded-2xl flex items-center justify-between text-[11px] text-slate-400 font-extrabold flex-shrink-0 shadow-sm mt-2">
            <span>Showing 1 to {filteredPatients.length} of {filteredPatients.length} patients</span>
          </div>
        </>
      ) : (
        // Table View
        <div className="flex-1 flex flex-col overflow-hidden bg-white border rounded-2xl min-h-0 shadow-sm">
          <div className="grid text-[10.5px] items-center flex-shrink-0 border-b bg-slate-50 px-4 py-3 font-bold text-slate-500 uppercase tracking-wider" style={tableColWidths}>
            <input type="checkbox" className="cursor-pointer rounded border-slate-300"
              checked={selectedIds.length > 0 && selectedIds.length === filteredPatients.length}
              onChange={handleSelectAll} />
            <span>ID</span>
            <span>Patient</span>
            <span>Age</span>
            <span>Phone</span>
            <span>Registered</span>
            <span>Last Doctor</span>
            <span>Condition</span>
            <span>Risk</span>
            <span>Status</span>
            <span className="text-right pr-4">Actions</span>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-grow scrollbar-hide min-h-0">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => {
                const isChecked = selectedIds.includes(patient.patientId);
                const dtStr = patient.createdDate ? new Date(patient.createdDate).toLocaleDateString() : 'Today';
                
                return (
                  <div
                    key={patient.patientId}
                    className={`grid items-center py-3 px-4 hover:bg-slate-50 cursor-pointer ${isChecked ? 'bg-blue-50/50' : ''}`}
                    style={tableColWidths}
                    onClick={() => handleViewPatient(patient.patientId)}
                  >
                    <input type="checkbox" className="cursor-pointer rounded border-slate-300"
                      checked={isChecked} onClick={(e) => e.stopPropagation()} onChange={(e) => handleSelectOne(patient.patientId, e.target.checked)} />
                    <span className="text-slate-400 text-[10px] font-semibold">{patient.patientId.substring(0,6).toUpperCase()}</span>
                    
                    <div className="flex items-center gap-2.5 min-w-0">
                      <>
                        <img 
                          src={getAvatarUrl(patient.name)}
                          alt={patient.name} 
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            objectFit: 'cover', flexShrink: 0,
                            border: '1px solid #E5E7EB', background: '#F3F4F6'
                          }} 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div 
                          className="bg-blue-100 text-blue-700 font-bold flex-shrink-0 rounded-full items-center justify-center" 
                          style={{ display: 'none', width: '32px', height: '32px', fontSize: '12px' }}
                        >
                          {(patient.name || '?').charAt(0).toUpperCase()}
                        </div>
                      </>
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 text-xs truncate">{patient.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{patient.email}</div>
                      </div>
                    </div>
                    
                    <span className="text-slate-600 text-xs">{patient.age} / {patient.gender.substring(0,1)}</span>
                    <span className="text-slate-600 text-xs truncate">{patient.contactNumber}</span>
                    <span className="text-slate-600 text-xs truncate">{dtStr}</span>
                    
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] border border-slate-200 flex-shrink-0">DR</div>
                      <div className="truncate">
                        <span className="text-xs text-slate-700 font-semibold block leading-none truncate">Dr. Rajan</span>
                      </div>
                    </div>

                    <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 font-semibold text-[9.5px] w-fit">New Patient</span>
                    
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded w-fit">Low</span>
                    
                    <span className="bg-green-100 text-green-700 rounded px-2 py-0.5 font-semibold text-[9.5px] w-fit">Active</span>
                    
                    <div className="flex items-center justify-end gap-1.5 pr-2" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors" onClick={() => handleViewPatient(patient.patientId)}>
                        <MdVisibility size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">No patients match the filter criteria.</div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-semibold flex-shrink-0">
            <span>Showing 1 to {filteredPatients.length} of {filteredPatients.length} patients</span>
          </div>
        </div>
      )}

      {/* Registration Modal Overlay */}
      {isRegModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => setIsRegModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full shadow-2xl animate-scale-up border" style={{ maxWidth: '500px', borderColor: '#E8EDF4' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Register New Patient</h3>
              <button className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors" onClick={() => setIsRegModalOpen(false)}>
                <MdClose size={18} />
              </button>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                <div className="relative">
                  <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" required className="w-full border rounded-xl py-2.5 outline-none text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition-all"
                    style={{ paddingLeft: '38px', borderColor: '#E2E8F0' }} placeholder="e.g. John Doe"
                    value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Age</label>
                  <div className="relative">
                    <MdAccessTime className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="number" className="w-full border rounded-xl py-2.5 outline-none text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition-all"
                      style={{ paddingLeft: '38px', borderColor: '#E2E8F0' }} placeholder="e.g. 34"
                      value={newPatientAge} onChange={(e) => setNewPatientAge(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Gender</label>
                  <div className="relative">
                    <MdPeople className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select className="w-full border rounded-xl py-2.5 outline-none text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      style={{ paddingLeft: '38px', borderColor: '#E2E8F0' }}
                      value={newPatientGender} onChange={(e) => setNewPatientGender(e.target.value)}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Phone *</label>
                  <div className="relative">
                    <MdPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" required className="w-full border rounded-xl py-2.5 outline-none text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition-all"
                      style={{ paddingLeft: '38px', borderColor: '#E2E8F0' }} placeholder="e.g. 98765 43210"
                      value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email</label>
                  <div className="relative">
                    <MdMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="email" className="w-full border rounded-xl py-2.5 outline-none text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition-all"
                      style={{ paddingLeft: '38px', borderColor: '#E2E8F0' }} placeholder="e.g. john@email.com"
                      value={newPatientEmail} onChange={(e) => setNewPatientEmail(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Condition</label>
                  <div className="relative">
                    <MdDescription className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select className="w-full border rounded-xl py-2.5 outline-none text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      style={{ paddingLeft: '38px', borderColor: '#E2E8F0' }}
                      value={newPatientCondition} onChange={(e) => setNewPatientCondition(e.target.value)}>
                      <option value="New Patient">New Patient</option>
                      <option value="Hypertension">Hypertension</option>
                      <option value="Diabetes T2">Diabetes T2</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Risk Level</label>
                  <div className="relative">
                    <MdSecurity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select className="w-full border rounded-xl py-2.5 outline-none text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
                      style={{ paddingLeft: '38px', borderColor: '#E2E8F0' }}
                      value={newPatientRisk} onChange={(e) => setNewPatientRisk(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                <button type="button" className="px-5 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  onClick={() => setIsRegModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: '#0B5FFF' }}>
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;

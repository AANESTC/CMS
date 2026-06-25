import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdSearch,
  MdAdd,
  MdVisibility,
  MdCalendarToday,
  MdEdit,
  MdTableChart,
  MdGridView,
  MdMoreVert,
  MdStar,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdDelete
} from 'react-icons/md';

const Z = {
  blue:   '#0B5FFF', blueL:  '#EEF4FF',
  green:  '#00AA45', greenL: '#E6F7EE',
  orange: '#F5A623', orangeL:'#FFF5E5',
  red:    '#E42527', redL:   '#FEE9E9',
  purple: '#7B61FF', purpleL:'#F0EDFF',
  teal:   '#00B2A9', tealL:  '#E0F7F6',
  navy:   '#1A2B4A', text:   '#6B7A99',
};

const DoctorAvatar = ({ name, specialty, gender }) => {
  const cleanName = (name || '').replace(/^(Dr\.|Dr|Prof\.|Prof)\s+/i, '').trim().toLowerCase();
  
  let isFemale = false;
  if (gender === 'Female') {
    isFemale = true;
  } else if (gender === 'Male') {
    isFemale = false;
  } else {
    // Naive gender guesser fallback if DB gender is missing
    const femaleNames = ['priya', 'neha', 'anjali', 'kavya', 'shruti', 'pooja', 'aditi', 'divya', 'sneha', 'mehta', 'sharma', 'vishalini'];
    isFemale = femaleNames.some(f => cleanName.includes(f)) || cleanName.split(' ')[0]?.endsWith('a') || cleanName.split(' ')[0]?.endsWith('i');
  }

  // Premium soft gradient background
  const bgGradient = isFemale 
    ? 'linear-gradient(135deg, #fdf4ff 0%, #f5d0fe 100%)' 
    : 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)';
    
  const borderColor = isFemale ? '#e879f9' : '#60a5fa';
  
  // Explicit Doctor Emojis
  const emoji = isFemale ? '👩‍⚕️' : '👨‍⚕️';

  return (
    <div 
      className="relative w-20 h-20 rounded-full shadow-md flex items-center justify-center overflow-hidden flex-shrink-0 border-[3px] transition-transform hover:scale-105"
      style={{ background: bgGradient, borderColor: borderColor }}
      title={`${isFemale ? 'Female' : 'Male'} Doctor Avatar`}
    >
      <span 
        className="text-[42px] leading-none select-none" 
        role="img" 
        aria-label="doctor avatar" 
        style={{ transform: 'translateY(2px)' }}
      >
        {emoji}
      </span>
    </div>
  );
};

const Doctors = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [specFilter, setSpecFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState('All');

  const initialDoctors = [
    { id: 'DOC-101', name: 'Dr. Rajan Kumar', specialty: 'General Physician', dept: 'General Medicine', exp: '12', status: 'Available', patients: '18', rating: '4.8', ratingsCount: '128' },
    { id: 'DOC-102', name: 'Dr. Priya Sharma', specialty: 'Cardiologist', dept: 'Cardiology', exp: '10', status: 'Available', patients: '22', rating: '4.9', ratingsCount: '96' },
    { id: 'DOC-103', name: 'Dr. Amit Verma', specialty: 'Neurologist', dept: 'Neurology', exp: '15', status: 'In Consultation', patients: '15', rating: '4.7', ratingsCount: '88' },
    { id: 'DOC-104', name: 'Dr. Neha Kapoor', specialty: 'Pediatrician', dept: 'Pediatrics', exp: '8', status: 'On Break', patients: '8', rating: '4.6', ratingsCount: '74' },
    { id: 'DOC-105', name: 'Dr. Vikram Singh', specialty: 'Orthopedic Surgeon', dept: 'Orthopedics', exp: '14', status: 'Available', patients: '20', rating: '4.8', ratingsCount: '112' },
    { id: 'DOC-106', name: 'Dr. Anjali Mehta', specialty: 'Dermatologist', dept: 'Dermatology', exp: '9', status: 'In Consultation', patients: '12', rating: '4.7', ratingsCount: '63' },
    { id: 'DOC-107', name: 'Dr. Sandeep Rao', specialty: 'Radiologist', dept: 'Radiology', exp: '11', status: 'Available', patients: '16', rating: '4.9', ratingsCount: '98' },
    { id: 'DOC-108', name: 'Dr. Kavya Nair', specialty: 'Gynecologist', dept: 'Gynecology', exp: '7', status: 'Off Duty', patients: '0', rating: '4.6', ratingsCount: '57' }
  ];

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Doctor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newDoctor, setNewDoctor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    department: '',
    specialization: '',
    experience: '',
    status: 'Available',
    license: '',
    consultationDays: 'Mon-Fri',
    maxPatients: ''
  });

  const departmentSpecializations = {
    'General Medicine': ['General Physician', 'Internal Medicine'],
    'Cardiology': ['Cardiologist', 'Interventional Cardiologist'],
    'Pediatrics': ['Pediatrician', 'Neonatologist'],
    'Orthopedics': ['Orthopedic Surgeon', 'Sports Medicine']
  };

  useEffect(() => {
    fetch('http://localhost:5011/api/doctor')
      .then(res => {
        if (!res.ok) throw new Error('API not available');
        return res.json();
      })
      .then(data => {
        const mapped = data.map((d, i) => ({
          id: d.doctorId || `DOC-00${i}`,
          name: d.name,
          specialty: d.specialization || 'General',
          dept: d.department || d.specialization || 'General',
          gender: d.gender || null,
          exp: d.experienceYears?.toString() || '10',
          status: d.isAvailable ? 'Available' : 'Inactive',
          patients: d.patientCount?.toString() || '0',
          rating: '5.0',
          ratingsCount: '0'
        }));
        setDoctors(mapped.length > 0 ? mapped : initialDoctors);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend /api/doctor not ready, using fallback data.', err);
        setDoctors(initialDoctors);
        setLoading(false);
      });
  }, []);

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!newDoctor.firstName || !newDoctor.lastName || !newDoctor.email || !newDoctor.phone || !newDoctor.gender || !newDoctor.department || !newDoctor.specialization || !newDoctor.experience) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const doctorPayload = {
      name: `Dr. ${newDoctor.firstName} ${newDoctor.lastName}`,
      specialization: newDoctor.specialization,
      department: newDoctor.department,
      gender: newDoctor.gender,
      email: newDoctor.email,
      contactNumber: newDoctor.phone,
      experienceYears: parseInt(newDoctor.experience, 10) || 0,
      isAvailable: newDoctor.status !== 'Inactive' && newDoctor.status !== 'On leave',
      licenseNumber: newDoctor.license,
      consultationDays: newDoctor.consultationDays,
      maxPatientsPerDay: newDoctor.maxPatients ? parseInt(newDoctor.maxPatients, 10) : null
    };

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5011/api/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorPayload)
      });
      
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error('Email already exists. Please use a different email address.');
        } else if (res.status === 400) {
          throw new Error(data?.message || 'Validation failed. Please check required fields.');
        } else {
          throw new Error('Failed to create doctor in backend.');
        }
      }
      
      const createdDoctor = data;

      const newDoc = {
        id: createdDoctor.doctorId || `DOC-${Math.floor(Math.random() * 900) + 100}`,
        name: createdDoctor.name,
        specialty: createdDoctor.specialization || 'General',
        dept: createdDoctor.department || newDoctor.department,
        gender: newDoctor.gender,
        exp: createdDoctor.experienceYears?.toString() || newDoctor.experience.toString(),
        status: newDoctor.status,
        patients: createdDoctor.patientsToday?.toString() || '0',
        rating: '0.0',
        ratingsCount: '0'
      };

      setDoctors(prev => [newDoc, ...prev]);
      setIsModalOpen(false);
      setNewDoctor({
        firstName: '', lastName: '', email: '', phone: '', gender: '',
        department: '', specialization: '', experience: '', status: 'Available',
        license: '', consultationDays: 'Mon-Fri', maxPatients: ''
      });
      alert("Doctor added successfully!");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // Only call backend if it's a real Guid (not our fallback "DOC-" string)
      if (id && !id.toString().startsWith('DOC-')) {
        const res = await fetch(`http://localhost:5011/api/doctor/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete doctor in backend');
      }
      
      // Use functional state update to avoid stale closures
      setDoctors(prevDoctors => prevDoctors.filter(d => d.id !== id));
      
    } catch (err) {
      console.error(err);
      alert('Error deleting doctor: ' + err.message);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || doc.dept === deptFilter;
    const matchesSpec = specFilter === 'All' || doc.specialty === specFilter;
    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    const matchesAvail = availFilter === 'All' || (availFilter === 'Available' && doc.status === 'Available');

    return matchesSearch && matchesDept && matchesSpec && matchesStatus && matchesAvail;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return Z.green;
      case 'In Consultation': case 'Busy': return Z.orange;
      case 'On Break': case 'On leave': return Z.red;
      case 'Inactive': return Z.text;
      default: return Z.text;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Available': return `bg-green-50 text-green-600 border-green-200`;
      case 'In Consultation': case 'Busy': return `bg-amber-50 text-amber-600 border-amber-200`;
      case 'On Break': case 'On leave': return `bg-red-50 text-red-600 border-red-200`;
      case 'Inactive': return `bg-slate-50 text-slate-500 border-slate-200`;
      default: return `bg-slate-50 text-slate-500 border-slate-200`;
    }
  };

  const tableColWidths = { gridTemplateColumns: '1fr 2.2fr 1.6fr 1.6fr 1fr 1.5fr 1.2fr 1fr' };

  if (loading) {
    return <div className="h-full flex items-center justify-center font-bold text-slate-400">Loading Doctors...</div>;
  }

  return (
    <div className="screen-fade h-full overflow-hidden p-4 flex flex-col gap-4 min-h-0 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost p-1 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
            onClick={() => navigate(-1)}
          >
            <MdArrowBack size={20} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: Z.navy }}>Doctors Directory</h1>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <MdAdd size={16} />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[150px] max-w-[220px]">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} style={{ pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search doctors..."
            className="w-full text-slate-700 bg-slate-50 font-semibold border border-slate-200 focus:border-blue-500 focus:bg-white transition text-xs py-2 shadow-sm rounded-lg outline-none"
            style={{ paddingLeft: '32px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Departments */}
        <select
          className="text-slate-700 bg-slate-50 font-semibold border border-slate-200 focus:border-blue-500 transition text-xs py-2 px-2 shadow-sm rounded-lg outline-none"
          style={{ width: '150px' }}
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="All">All Departments</option>
          <option value="General Medicine">General Medicine</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Radiology">Radiology</option>
          <option value="Gynecology">Gynecology</option>
        </select>

        {/* Specialization */}
        <select
          className="text-slate-700 bg-slate-50 font-semibold border border-slate-200 focus:border-blue-500 transition text-xs py-2 px-2 shadow-sm rounded-lg outline-none"
          style={{ width: '165px' }}
          value={specFilter}
          onChange={(e) => setSpecFilter(e.target.value)}
        >
          <option value="All">All Specializations</option>
          <option value="General Physician">General Physician</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Radiologist">Radiologist</option>
          <option value="Gynecologist">Gynecologist</option>
        </select>

        {/* Status */}
        <select
          className="text-slate-700 bg-slate-50 font-semibold border border-slate-200 focus:border-blue-500 transition text-xs py-2 px-2 shadow-sm rounded-lg outline-none"
          style={{ width: '120px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="In Consultation">In Consultation</option>
          <option value="On Break">On Break</option>
          <option value="Off Duty">Off Duty</option>
        </select>

        {/* View toggles */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 flex-shrink-0 ml-auto border border-slate-200">
          <button 
            className={`text-xs py-1.5 px-3 rounded-lg font-bold transition flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setViewMode('table')}
          >
            <MdTableChart size={14} />
            <span>Table</span>
          </button>
          <button 
            className={`text-xs py-1.5 px-3 rounded-lg font-bold transition flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setViewMode('card')}
          >
            <MdGridView size={14} />
            <span>Card</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'card' ? (
        // Card Grid View
        <>
          <div className="flex-grow overflow-y-auto pr-1 min-h-0">
            {filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-2">
                {filteredDoctors.map((doc, idx) => (
                  <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center hover:border-blue-300 hover:shadow-lg transition-all duration-200 relative group cursor-pointer">
                    
                    <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded cursor-pointer">
                      <MdMoreVert size={18} />
                    </button>

                    <div className="relative">
                      <DoctorAvatar name={doc.name} specialty={doc.specialty} gender={doc.gender} />
                      <span 
                        className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: getStatusColor(doc.status) }}
                      ></span>
                    </div>

                    <h3 className="font-extrabold text-slate-800 text-base mt-4">{doc.name}</h3>
                    <span className="text-[11px] font-bold mt-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{doc.specialty}</span>
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-2">{doc.dept}</span>

                    <div className="flex items-center gap-1 mt-2 mb-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <MdStar key={i} size={14} className={i < Math.floor(doc.rating) ? 'text-amber-400' : 'text-slate-200'} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 mt-0.5 ml-1">{doc.rating} ({doc.ratingsCount})</span>
                    </div>

                    <div className="w-full grid grid-cols-3 border border-slate-100 rounded-xl mt-4 py-2 px-1 text-center bg-slate-50/50 items-center justify-center">
                      <div>
                        <span className="text-lg font-extrabold text-slate-800 block">{doc.exp}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Yrs Exp</span>
                      </div>
                      <div className="border-x border-slate-200 px-1">
                        <span className={`border ${getStatusBg(doc.status)} text-[8.5px] px-1 py-0.5 font-bold inline-block truncate w-full text-center rounded-md`}>
                          {doc.status === 'In Consultation' ? 'Consulting' : doc.status}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">Status</span>
                      </div>
                      <div>
                        <span className="text-lg font-extrabold text-slate-800 block">{doc.patients}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Patients</span>
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between border-t border-slate-100 mt-4 pt-3 text-[10px] text-slate-500 font-bold px-2 uppercase tracking-wide">
                      <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                        <MdVisibility size={14} />
                        <span>View</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-green-600 transition-colors cursor-pointer">
                        <MdCalendarToday size={14} />
                        <span>Schedule</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-red-600 transition-colors cursor-pointer"
                        onClick={(e) => handleDeleteDoctor(doc.id, e)}>
                        <MdDelete size={14} />
                        <span>Delete</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center font-bold text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">No doctors match the filter criteria.</div>
            )}
          </div>
          
          {/* Card View Pagination Footer */}
          <div className="px-5 py-3 border border-slate-200 bg-white rounded-xl flex items-center justify-between text-xs text-slate-400 font-bold flex-shrink-0 shadow-sm mt-1">
            <span>Showing 1 to {filteredDoctors.length} of {doctors.length} doctors</span>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1">
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors">
                <MdChevronLeft size={16} />
              </button>
              <button className="w-7 h-7 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold shadow-sm">1</button>
              <button className="w-7 h-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center font-bold transition-colors">2</button>
              <button className="w-7 h-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center font-bold transition-colors">3</button>
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors">
                <MdChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        // Table View
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-grow flex flex-col overflow-hidden min-h-0">
          <div className="grid bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-extrabold text-slate-400 py-3 px-4 items-center flex-shrink-0" style={tableColWidths}>
            <span>Avatar</span>
            <span>Name</span>
            <span>Department</span>
            <span>Specialization</span>
            <span>Experience</span>
            <span>Status</span>
            <span>Patients Today</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-grow scrollbar-hide min-h-0">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="grid items-center px-4 py-3 hover:bg-slate-50 transition-colors"
                  style={tableColWidths}
                >
                  <div className="flex items-center">
                    <div className="scale-[0.6] origin-left">
                      <DoctorAvatar name={doc.name} specialty={doc.specialty} gender={doc.gender} />
                    </div>
                  </div>
                  <span className="text-slate-800 text-sm font-extrabold">{doc.name}</span>
                  <span className="text-slate-500 text-sm font-semibold">{doc.dept}</span>
                  <span className="text-blue-600 text-sm font-bold bg-blue-50 px-2 py-0.5 rounded-full w-fit">{doc.specialty}</span>
                  <span className="text-slate-600 text-sm font-bold">{doc.exp} Years</span>
                  <div>
                    <span className={`border ${getStatusBg(doc.status)} px-2 text-xs font-bold rounded-md py-0.5 w-fit block`}>
                      {doc.status}
                    </span>
                  </div>
                  <span className="text-slate-700 text-sm font-extrabold">{doc.patients} Patients</span>
                  <div className="flex items-center justify-end gap-2 text-slate-400">
                    <button className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors cursor-pointer" title="View Profile">
                      <MdVisibility size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 hover:text-green-600 rounded-lg transition-colors cursor-pointer" title="Schedule">
                      <MdCalendarToday size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 hover:text-red-600 rounded-lg transition-colors cursor-pointer" title="Delete"
                      onClick={(e) => handleDeleteDoctor(doc.id, e)}>
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-bold">No doctors match the filter criteria.</div>
            )}
          </div>
          
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400 font-bold flex-shrink-0">
            <span>Showing 1 to {filteredDoctors.length} of {doctors.length} doctors</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors">
                <MdChevronLeft size={16} />
              </button>
              <button className="w-6 h-6 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold text-[10px] shadow-sm">1</button>
              <button className="w-6 h-6 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center font-bold text-[10px] transition-colors">2</button>
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors">
                <MdChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center py-10 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full shadow-2xl border my-auto mx-4" style={{ maxWidth: '650px', borderColor: '#E8EDF4' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 text-base tracking-wide">Add New Doctor</h3>
              <button className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer" onClick={() => setIsModalOpen(false)}>
                <MdClose size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDoctorSubmit} className="p-6 space-y-6">
              {errorMessage && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-2">
                  <span>{errorMessage}</span>
                </div>
              )}
              {/* Basic Info */}
              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Basic Info</h4>
                <div className="flex items-start gap-6">
                  {/* Avatar Preview */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                      {newDoctor.firstName || newDoctor.lastName ? (
                        <DoctorAvatar name={`Dr. ${newDoctor.firstName} ${newDoctor.lastName}`} gender={newDoctor.gender} />
                      ) : (
                        <div className="text-slate-300">
                          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preview</span>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">First Name *</label>
                      <input type="text" required className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors"
                        placeholder="e.g. Rajan" value={newDoctor.firstName} onChange={(e) => setNewDoctor({...newDoctor, firstName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Last Name *</label>
                      <input type="text" required className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors"
                        placeholder="e.g. Kumar" value={newDoctor.lastName} onChange={(e) => setNewDoctor({...newDoctor, lastName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Gender *</label>
                      <select required className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors cursor-pointer appearance-none"
                        value={newDoctor.gender} onChange={(e) => setNewDoctor({...newDoctor, gender: e.target.value})}>
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Phone *</label>
                      <input type="tel" required className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors"
                        placeholder="e.g. +91 9876543210" value={newDoctor.phone} onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">Email *</label>
                      <input type="email" required className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors"
                        placeholder="e.g. doctor@hospital.com" value={newDoctor.email} onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Professional Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Department *</label>
                    <select required className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors cursor-pointer appearance-none"
                      value={newDoctor.department} onChange={(e) => setNewDoctor({...newDoctor, department: e.target.value, specialization: ''})}>
                      <option value="" disabled>Select Department</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Specialization *</label>
                    <select required className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors cursor-pointer appearance-none"
                      value={newDoctor.specialization} onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})} disabled={!newDoctor.department}>
                      <option value="" disabled>Select Specialization</option>
                      {newDoctor.department && departmentSpecializations[newDoctor.department]?.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Experience (years) *</label>
                    <input type="number" required min="0" className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors"
                      placeholder="e.g. 10" value={newDoctor.experience} onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Status</label>
                    <select className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors cursor-pointer appearance-none"
                      value={newDoctor.status} onChange={(e) => setNewDoctor({...newDoctor, status: e.target.value})}>
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="On leave">On leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">License/Registration No. (Optional)</label>
                    <input type="text" className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors"
                      placeholder="e.g. MCI-12345" value={newDoctor.license} onChange={(e) => setNewDoctor({...newDoctor, license: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Consultation Days</label>
                    <select className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors cursor-pointer appearance-none"
                      value={newDoctor.consultationDays} onChange={(e) => setNewDoctor({...newDoctor, consultationDays: e.target.value})}>
                      <option value="Mon-Fri">Mon–Fri</option>
                      <option value="Mon-Sat">Mon–Sat</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Max Patients/Day (Optional)</label>
                    <input type="number" min="0" className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors"
                      placeholder="e.g. 25" value={newDoctor.maxPatients} onChange={(e) => setNewDoctor({...newDoctor, maxPatients: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                <button type="button" className="px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer shadow-sm ${isSubmitting ? 'bg-blue-400' : 'hover:shadow-md'}`} style={{ background: isSubmitting ? '#93C5FD' : '#0B5FFF' }}>
                  {isSubmitting ? 'Saving...' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Doctors;

import { useState, useEffect, useMemo } from 'react';
import { getPatientDocuments, getPatients, deleteDocument, uploadDocument } from '../api';
import {
  MdSearch, MdChevronRight, MdPerson,
  MdFolderShared, MdBloodtype, MdMedicalServices, MdImage, MdScience,
  MdDownload, MdDelete, MdOpenInNew, MdKeyboardArrowDown,
  MdDateRange, MdRefresh, MdKeyboardArrowUp,
  MdAssignment, MdAdd, MdClose
} from 'react-icons/md';

// Base URL for document links
const BASE_URL = 'http://localhost:5011';

const T = {
  bgPage:        '#f8fafc',
  bgCard:        '#ffffff',
  border:        '#e5e7eb',
  borderLight:   '#f3f4f6',
  textPrimary:   '#111827',
  textSecondary: '#6b7280',
  textMuted:     '#9ca3af',
  bluePrimary:   '#2563eb',
  blueLight:     '#eff6ff',
  blueBorder:    '#bfdbfe',
  redPrimary:    '#e11d48',
  redLight:      '#fff1f2',
  greenPrimary:  '#16a34a',
  greenLight:    '#f0fdf4',
  violetPrimary: '#7c3aed',
  violetLight:   '#faf5ff',
  skyPrimary:    '#0284c7',
  skyLight:      '#f0f9ff'
};

const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return '?';
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
};

const BACKEND_TO_FRONTEND_MAP = {
  0: 'Blood Test', 1: 'X-Ray', 2: 'Prescription', 3: 'Prescription', 4: 'Other',
  'BloodTest': 'Blood Test', 'XRay': 'X-Ray', 'PrescriptionScan': 'Prescription',
  'GeneratedPrescription': 'Prescription', 'Other': 'Other'
};

const TABS = [
  { id: 'All',           label: 'All' },
  { id: 'Blood Reports', label: 'Blood Reports' },
  { id: 'Radiology',     label: 'Radiology' },
  { id: 'Prescriptions', label: 'Prescriptions' },
  { id: 'Lab Reports',   label: 'Lab Reports' },
  { id: 'Discharge',     label: 'Discharge' },
];

const SECTIONS = [
  { id: 'Blood Reports', label: 'Blood Reports',     type: 'Blood Test',   iconBg: T.redLight,    iconColor: T.redPrimary,    Icon: MdBloodtype,       docLabel: 'Laboratory Blood Report' },
  { id: 'Radiology',     label: 'Radiology Reports', type: 'X-Ray',        iconBg: T.skyLight,    iconColor: T.skyPrimary,    Icon: MdImage,           docLabel: 'Radiology Report' },
  { id: 'Prescriptions', label: 'Prescriptions',     type: 'Prescription', iconBg: T.greenLight,  iconColor: T.greenPrimary,  Icon: MdMedicalServices, docLabel: 'Prescription Document' },
  { id: 'Lab Reports',   label: 'Lab Reports',       type: 'Other',        iconBg: T.violetLight, iconColor: T.violetPrimary, Icon: MdScience,         docLabel: 'Laboratory Report' },
  { id: 'Discharge',     label: 'Discharge Summary', type: 'Discharge',    iconBg: '#fffbeb',     iconColor: '#d97706',       Icon: MdAssignment,      docLabel: 'Discharge Summary' },
];

const getMappedDocType = (d) => BACKEND_TO_FRONTEND_MAP[d.documentType] || 'Other';

const DocumentManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDocs, setPatientDocs] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Upload States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDocType, setUploadDocType] = useState('Other');
  const [uploading, setUploading] = useState(false);

  // Filter States
  const [searchDocs, setSearchDocs] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUploadedBy, setSelectedUploadedBy] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    getPatients().then(data => {
      setPatients(data);
      if (data.length > 0) {
        loadPatientDocs(data.find(p => p.name.includes('Manivannan')) || data[0]);
      }
    });
  }, []);

  function loadPatientDocs(p) {
    setSelectedPatient(p);
    getPatientDocuments(p.patientId).then(setPatientDocs);
    resetFilters();
    setActiveTab('All');
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(docId);
      setPatientDocs(prev => prev.filter(d => d.documentId !== docId));
    } catch (error) {
      alert('Failed to delete document');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedPatient) {
      alert('Please select a file and a patient.');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('patientId', selectedPatient.patientId);
      formData.append('documentType', uploadDocType);
      formData.append('uploadedBy', 'Receptionist');

      const newDoc = await uploadDocument(formData);
      setPatientDocs(prev => [newDoc, ...prev]);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      alert('Document uploaded successfully!');
    } catch (err) {
      alert('Failed to upload document: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(patientSearch.toLowerCase()) || 
    p.contactNumber?.includes(patientSearch)
  );

  function resetFilters() {
    setSearchDocs('');
    setSelectedCategory('all');
    setSelectedUploadedBy('all');
    setSelectedDoctor('all');
    setStartDate('');
    setEndDate('');
  }

  // Extract unique filter options
  const uploadedByOptions = useMemo(() => {
    const opts = new Set(patientDocs.map(d => d.uploadedBy || 'Receptionist'));
    return ['all', ...Array.from(opts)];
  }, [patientDocs]);

  const doctorOptions = useMemo(() => {
    // Hardcoded Dr. Kumar fallback as the data model might lack it
    const opts = new Set(patientDocs.map(d => d.doctor || 'Dr. Kumar'));
    return ['all', ...Array.from(opts)];
  }, [patientDocs]);

  // Filter Documents Functionally
  const getFilteredDocs = () => {
    return patientDocs.filter(d => {
      const fileName = (d.fileUrl || '').split('/').pop() || 'Document.pdf';
      const type = getMappedDocType(d);
      const uploadedBy = d.uploadedBy || 'Receptionist';
      const doctor = d.doctor || 'Dr. Kumar';
      const uploadedDate = new Date(d.uploadedDate || new Date());

      const matchesSearch = fileName.toLowerCase().includes(searchDocs.toLowerCase());
      
      let categoryMatches = true;
      if (selectedCategory !== 'all') {
        const catObj = SECTIONS.find(s => s.label === selectedCategory);
        if (catObj) categoryMatches = (type === catObj.type);
      }

      const matchesUploadedBy = selectedUploadedBy === 'all' || uploadedBy === selectedUploadedBy;
      const matchesDoctor = selectedDoctor === 'all' || doctor === selectedDoctor;

      let matchesDate = true;
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0,0,0,0);
        if (uploadedDate < sDate) matchesDate = false;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23,59,59,999);
        if (uploadedDate > eDate) matchesDate = false;
      }

      return matchesSearch && categoryMatches && matchesUploadedBy && matchesDoctor && matchesDate;
    });
  };

  const processedDocs = getFilteredDocs();
  const docTypeCount = (type) => patientDocs.filter(d => getMappedDocType(d) === type).length;

  const SectionExpanded = ({ section, docs }) => (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{
          width: 28, height: 28,
          borderRadius: 6,
          background: section.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <section.Icon size={14} color={section.iconColor} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
          {section.label}
        </span>
        <span style={{
          background: '#f3f4f6', color: '#2563eb',
          fontSize: 11, fontWeight: 500,
          padding: '2px 8px', borderRadius: 10
        }}>
          ({docs.length})
        </span>
        <MdKeyboardArrowUp style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 18 }} />
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280', textAlign: 'left', fontWeight: 400 }}>Document Name</th>
            <th style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280', textAlign: 'left', fontWeight: 400 }}>Document Type</th>
            <th style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280', textAlign: 'left', fontWeight: 400 }}>Uploaded On</th>
            <th style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280', textAlign: 'left', fontWeight: 400 }}>Uploaded By</th>
            <th style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280', textAlign: 'left', fontWeight: 400 }}>Doctor</th>
            <th style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280', textAlign: 'left', fontWeight: 400 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d, i) => {
            const fileUrl = `${BASE_URL}${d.fileUrl}`;
            const fileName = (d.fileUrl || '').split('/').pop() || `Document_${i}.pdf`;
            const ext = fileName.split('.').pop()?.toUpperCase() || 'PDF';
            const uploadedBy = d.uploadedBy || 'Receptionist';
            const doctor = d.doctor || 'Dr. Kumar';
            const uploadedDate = d.uploadedDate ? new Date(d.uploadedDate) : new Date('2026-06-23T10:30:00');
            
            return (
              <tr key={d.documentId} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 16px', fontSize: 13, color: '#111827' }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '28px', height: '28px', background: ext==='PDF'? '#fee2e2' : '#e0e7ff', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '8px', color: ext==='PDF'? '#dc2626' : '#4338ca', fontWeight: 700 }}>{ext.substring(0,3)}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '12.5px', color: '#111827', fontWeight: 500 }}>{fileName}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280' }}>
                  <span style={{ background: '#fff1f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '10.5px', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    {section.docLabel}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280' }}>
                  <p style={{ fontSize: '12px', color: '#374151', whiteSpace: 'nowrap' }}>{uploadedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{uploadedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280' }}>
                  <span style={{ fontSize: '12px', color: '#374151' }}>{uploadedBy}</span>
                </td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280' }}>
                  <span style={{ fontSize: '12px', color: '#374151' }}>{doctor}</span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div className="flex items-center gap-1.5">
                    <a href={fileUrl} target="_blank" rel="noreferrer" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                      <MdOpenInNew size={13} /> View
                    </a>
                    <a href={fileUrl} download style={{ width: '28px', height: '28px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MdDownload size={14} />
                    </a>
                    <button onClick={() => handleDelete(d.documentId)} style={{ width: '28px', height: '28px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <MdDelete size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );

  const visibleSections = activeTab === 'All' 
    ? SECTIONS 
    : SECTIONS.filter(s => s.id === activeTab);

  return (
    <div className="flex flex-row flex-1 h-full overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 3. PATIENT PANEL */}
      <div className="flex flex-col flex-shrink-0 h-full" style={{ width: '220px', background: T.bgCard, borderRight: `1px solid ${T.border}` }}>
        <div style={{ padding: '12px 0 0 0', borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2" style={{ padding: '0 14px', marginBottom: '10px' }}>
            <MdPerson size={15} color={T.textSecondary} />
            <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>Patient Directory</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            margin: '0 12px 8px 12px'
          }}>
            <MdSearch size={14} style={{ color: '#9CA3AF' }} />
            <input 
              type="text" 
              placeholder="Search patients..."
              value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
              style={{ 
                border: 'none', background: 'transparent', fontSize: 13,
                color: '#111827', outline: 'none', width: '100%'
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-4" style={{ padding: '8px' }}>
          {filteredPatients.map(p => {
            const isSelected = selectedPatient?.patientId === p.patientId;
            const name = p.name || 'Unknown Patient';
            
            return (
              <div 
                key={p.patientId}
                onClick={() => loadPatientDocs(p)}
                className="transition-all duration-150 ease-in-out cursor-pointer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
                  background: isSelected ? '#EFF6FF' : 'transparent',
                  borderRadius: 8,
                  marginBottom: '2px'
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div 
                  style={{
                    width: 36, height: 36, borderRadius: '8px',
                    background: '#2563EB', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600, flexShrink: 0
                  }}>
                  {getInitials(name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: 13, fontWeight: 500, color: isSelected ? '#2563EB' : '#111827',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                  }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                    {p.contactNumber || p.phone}
                  </div>
                </div>
                {isSelected && <MdChevronRight size={14} style={{ color: '#2563EB', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DOCUMENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto" style={{ background: T.bgPage, padding: '18px 20px', gap: '14px' }}>
        {selectedPatient ? (
          <>
            {/* 4a. STAT CARDS ROW (5 Cards) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', flexShrink: 0 }}>
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: T.blueLight, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdFolderShared size={18} color={T.bluePrimary} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate" style={{ fontSize: '11px', color: T.textSecondary }}>Total Files</p>
                  <p style={{ fontSize: '22px', color: T.textPrimary, fontWeight: 600, lineHeight: 1, marginTop: '2px' }}>{patientDocs.length}</p>
                </div>
              </div>
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: T.redLight, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdBloodtype size={18} color={T.redPrimary} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate" style={{ fontSize: '11px', color: T.textSecondary }}>Blood Reports</p>
                  <p style={{ fontSize: '22px', color: T.textPrimary, fontWeight: 600, lineHeight: 1, marginTop: '2px' }}>{docTypeCount('Blood Test')}</p>
                </div>
              </div>
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: T.greenLight, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdMedicalServices size={18} color={T.greenPrimary} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate" style={{ fontSize: '11px', color: T.textSecondary }}>Prescriptions</p>
                  <p style={{ fontSize: '22px', color: T.textPrimary, fontWeight: 600, lineHeight: 1, marginTop: '2px' }}>{docTypeCount('Prescription')}</p>
                </div>
              </div>
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: T.skyLight, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdImage size={18} color={T.skyPrimary} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate" style={{ fontSize: '11px', color: T.textSecondary }}>Radiology Reports</p>
                  <p style={{ fontSize: '22px', color: T.textPrimary, fontWeight: 600, lineHeight: 1, marginTop: '2px' }}>{docTypeCount('X-Ray')}</p>
                </div>
              </div>
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: T.violetLight, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdScience size={18} color={T.violetPrimary} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate" style={{ fontSize: '11px', color: T.textSecondary }}>Lab Reports</p>
                  <p style={{ fontSize: '22px', color: T.textPrimary, fontWeight: 600, lineHeight: 1, marginTop: '2px' }}>{docTypeCount('Other')}</p>
                </div>
              </div>
            </div>

            {/* 4b. PATIENT DETAIL CARD HEADER */}
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
              <div className="flex justify-between items-start" style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
                <div className="flex gap-3">
                  <div style={{ width: '44px', height: '44px', background: T.bluePrimary, borderRadius: '8px', color: '#fff', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {(selectedPatient.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 500, color: T.textPrimary }}>{selectedPatient.name}</h2>
                    <p style={{ fontSize: '12px', color: T.textSecondary, marginTop: '2px' }}>
                      {selectedPatient.age} yrs • {selectedPatient.gender} • {selectedPatient.contactNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div style={{ background: T.blueLight, color: '#1d4ed8', border: `1px solid ${T.blueBorder}`, fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '6px' }}>
                    {processedDocs.length} Record{processedDocs.length !== 1 && 's'}
                  </div>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    style={{ background: T.bluePrimary, color: '#fff', fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MdAdd size={14} /> Upload Document
                  </button>
                </div>
              </div>

              {/* TAB ROW */}
              <div className="flex items-center gap-1 overflow-x-auto" style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border}` }}>
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button 
                      key={tab.id} 
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        background: isActive ? T.bluePrimary : 'transparent',
                        color: isActive ? '#fff' : T.textSecondary,
                        padding: '6px 14px', fontSize: '12px', borderRadius: '6px',
                        cursor: 'pointer', whiteSpace: 'nowrap', outline: 'none', border: 'none'
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.borderLight; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* FILTER BAR */}
              <div className="flex flex-wrap items-center gap-2" style={{ padding: '10px 16px', background: T.bgCard }}>
                
                {/* Search Docs Input */}
                <div className="relative flex items-center" style={{ minWidth: '160px', height: '32px', border: `1px solid ${T.border}`, borderRadius: '6px', padding: '0 10px', background: '#fff' }}>
                  <MdSearch size={13} color={T.textMuted} />
                  <input 
                    type="text" 
                    placeholder="Search documents..." 
                    value={searchDocs}
                    onChange={(e) => setSearchDocs(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#374151', width: '100%', marginLeft: '6px' }}
                  />
                </div>
                
                {/* Category Dropdown */}
                <div className="relative flex items-center justify-between" style={{ height: '32px', border: `1px solid ${T.border}`, borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#374151', background: '#fff', cursor: 'pointer', minWidth: '130px' }}>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                    style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', cursor: 'pointer', appearance: 'none', paddingRight: '20px' }}>
                    <option value="all">All Categories</option>
                    {SECTIONS.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                  </select>
                  <MdKeyboardArrowDown size={14} color={T.textMuted} style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }} />
                </div>

                {/* Date Range Inputs */}
                <div className="flex items-center gap-1" style={{ height: '32px', border: `1px solid ${T.border}`, borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#374151', background: '#fff' }}>
                  <MdDateRange size={14} color={T.textMuted} />
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '11px', color: '#374151' }} />
                  <span style={{ color: T.textMuted }}>–</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '11px', color: '#374151' }} />
                </div>

                {/* Uploaded By Dropdown */}
                <div className="relative flex items-center justify-between" style={{ height: '32px', border: `1px solid ${T.border}`, borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#374151', background: '#fff', cursor: 'pointer', minWidth: '130px' }}>
                  <select 
                    value={selectedUploadedBy} 
                    onChange={(e) => setSelectedUploadedBy(e.target.value)} 
                    style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', cursor: 'pointer', appearance: 'none', paddingRight: '20px' }}>
                    {uploadedByOptions.map(u => <option key={u} value={u}>{u === 'all' ? 'Uploaded By: All' : u}</option>)}
                  </select>
                  <MdKeyboardArrowDown size={14} color={T.textMuted} style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }} />
                </div>

                {/* Doctor Dropdown */}
                <div className="relative flex items-center justify-between" style={{ height: '32px', border: `1px solid ${T.border}`, borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: '#374151', background: '#fff', cursor: 'pointer', minWidth: '130px' }}>
                  <select 
                    value={selectedDoctor} 
                    onChange={(e) => setSelectedDoctor(e.target.value)} 
                    style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', cursor: 'pointer', appearance: 'none', paddingRight: '20px' }}>
                    {doctorOptions.map(d => <option key={d} value={d}>{d === 'all' ? 'Doctor Name: All' : d}</option>)}
                  </select>
                  <MdKeyboardArrowDown size={14} color={T.textMuted} style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }} />
                </div>

                {/* Reset Button */}
                <button onClick={resetFilters} className="flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors" style={{ height: '32px', border: `1px solid ${T.border}`, borderRadius: '6px', padding: '0 10px', fontSize: '12px', color: T.textSecondary, background: '#fff', cursor: 'pointer', marginLeft: 'auto' }}>
                  <MdRefresh size={14} /> Reset
                </button>
              </div>
            </div>

            {/* SECTIONS LIST */}
            <div className="flex flex-col gap-[14px] pb-6 flex-shrink-0">
              {visibleSections.map(section => {
                const sectionDocs = processedDocs.filter(d => getMappedDocType(d) === section.type);
                if (sectionDocs.length === 0) return null; // Only render if there are docs after filter

                return (
                  <SectionExpanded 
                    key={section.id} 
                    section={section} 
                    docs={sectionDocs} 
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: T.textSecondary, fontSize: '14px' }}>Select a patient to view documents.</p>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsUploadModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-sm">Upload Document for {selectedPatient?.name}</h3>
              <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setIsUploadModalOpen(false)}>
                <MdClose size={18} />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Document Type *</label>
                <select 
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-3 outline-none text-sm bg-gray-50 focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  value={uploadDocType} onChange={(e) => setUploadDocType(e.target.value)} required
                >
                  <option value="BloodTest">Blood Report</option>
                  <option value="XRay">Radiology (X-Ray, Scan)</option>
                  <option value="PrescriptionScan">Prescription Scan</option>
                  <option value="Other">Lab Report / Other</option>
                  <option value="Discharge">Discharge Summary</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Select File *</label>
                <input 
                  type="file" 
                  onChange={(e) => setUploadFile(e.target.files[0])} 
                  required
                  className="w-full border border-gray-200 rounded-xl py-2 px-3 text-sm"
                  accept="image/*,.pdf"
                />
                <p className="text-[10px] text-gray-400 mt-1">Accepts PDF, JPG, PNG. Max 10MB.</p>
              </div>
              <div className="flex gap-3 justify-end pt-4 mt-2">
                <button type="button" className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors flex items-center gap-2" style={{ background: uploading ? '#9ca3af' : '#2563eb' }}>
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;

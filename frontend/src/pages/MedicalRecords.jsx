import React, { useState, useEffect } from 'react';
import { getDocuments, deleteDocument } from '../api';
import {
  MdArrowBack, MdSearch, MdFilterList, MdAdd, MdFolderShared,
  MdInsertDriveFile, MdAccessTime, MdVisibility, MdDownload,
  MdDelete
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Z = {
  blue: '#0B5FFF', blueL: '#EEF4FF',
  green: '#00AA45', greenL: '#E6F7EE',
  orange: '#F5A623', orangeL: '#FFF5E5',
  teal: '#00B2A9', tealL: '#E0F7F6',
  purple: '#7B61FF', purpleL: '#F0EDFF',
  red: '#E42527', redL: '#FEE9E9',
  navy: '#1A2B4A', text: '#6B7A99',
};

const DOC_TYPES = ['All', 'BloodTest', 'XRay', 'PrescriptionScan', 'Other'];
const DOC_TYPE_LABELS = { BloodTest: 'Blood Test', XRay: 'X-Ray', PrescriptionScan: 'Prescription', Other: 'Other' };

const MedicalRecords = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteDocument(id);
        setRecords(records.filter(r => r.documentId !== id));
      } catch (e) {
        alert('Failed to delete document');
      }
    }
  };

  const filteredRecords = records.filter(rec => {
    const fileName = (rec.fileUrl || '').split('/').pop();
    const searchMatch = 
      (rec.patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.documentId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || rec.documentType === categoryFilter;

    return searchMatch && matchesCategory;
  });

  const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const today = new Date().toDateString();
  const addedToday = records.filter(r => new Date(r.uploadedDate).toDateString() === today).length;
  const imaging = records.filter(r => r.documentType === 'XRay').length;

  return (
    <div className="animate-fade-up h-full overflow-hidden flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-xl border hover:bg-gray-50 transition-colors zoho-card" style={{ borderColor: '#E8EDF4', color: Z.text }}
            onClick={() => navigate(-1)}
          >
            <MdArrowBack size={20} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: Z.navy }}>Medical Records</h1>
        </div>

        <button onClick={() => navigate('/receptionist/documents')} className="zoho-btn-primary text-sm flex items-center gap-2 py-2.5 px-4 rounded-xl text-white font-semibold shadow-md">
          <MdAdd size={18} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        {[
          { label: 'Total Records', value: records.length, icon: MdFolderShared, bg: Z.blueL, color: Z.blue },
          { label: 'Added Today', value: addedToday, icon: MdInsertDriveFile, bg: Z.greenL, color: Z.green },
          { label: 'Imaging & Scans', value: imaging, icon: MdVisibility, bg: Z.purpleL, color: Z.purple },
          { label: 'Pending Review', value: 0, icon: MdAccessTime, bg: Z.orangeL, color: Z.orange }, // Mocking pending since no status on document
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 flex items-center gap-4 zoho-card border" style={{ borderColor: '#F0F4F8' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat.bg }}>
              <stat.icon size={24} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: Z.text }}>{stat.label}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: Z.navy }}>{loading ? '...' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 flex-shrink-0 bg-white p-3 rounded-2xl zoho-card border" style={{ borderColor: '#F0F4F8' }}>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: Z.text }} />
          <input
            type="text"
            placeholder="Search records or patient name..."
            className="w-full pl-9 pr-4 py-2 border-2 rounded-xl text-sm outline-none transition-colors"
            style={{ borderColor: '#E8EDF4', background: '#F8FAFC', color: Z.navy }}
            onFocus={e => e.target.style.borderColor = Z.blue}
            onBlur={e => e.target.style.borderColor = '#E8EDF4'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <MdFilterList style={{ color: Z.text }} />
          <span className="text-xs font-semibold" style={{ color: Z.text }}>Category:</span>
          <select
            className="border-2 rounded-xl py-2 px-3 text-sm font-medium outline-none cursor-pointer"
            style={{ borderColor: '#E8EDF4', background: '#F8FAFC', color: Z.navy }}
            onFocus={e => e.target.style.borderColor = Z.blue}
            onBlur={e => e.target.style.borderColor = '#E8EDF4'}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {DOC_TYPES.map(t => (
              <option key={t} value={t}>{t === 'All' ? 'All Categories' : DOC_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Records Table Card */}
      <div className="bg-white flex-1 flex flex-col rounded-2xl zoho-card border overflow-hidden" style={{ borderColor: '#F0F4F8' }}>
        <div className="overflow-x-auto flex-1 flex flex-col">
          <table className="min-w-full text-left">
            <thead className="sticky top-0 bg-[#FAFBFD] z-10 border-b" style={{ borderColor: '#F0F4F8' }}>
              <tr className="text-[11px] uppercase" style={{ color: Z.text }}>
                <th className="px-5 py-4 font-bold">Record ID</th>
                <th className="px-5 py-4 font-bold">Patient</th>
                <th className="px-5 py-4 font-bold">Document Name</th>
                <th className="px-5 py-4 font-bold">Category</th>
                <th className="px-5 py-4 font-bold">Date Added</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y overflow-y-auto" style={{ borderColor: '#F8FAFC' }}>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: Z.text }}>Loading records...</td></tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  const fileName = (rec.fileUrl || '').split('/').pop() || 'document';
                  const docType = DOC_TYPE_LABELS[rec.documentType] || rec.documentType;
                  const fileUrl = `http://localhost:5011${rec.fileUrl}`;
                  return (
                    <tr key={rec.documentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold" style={{ color: Z.text }}>
                          {rec.documentId.split('-')[0].toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex flex-shrink-0 items-center justify-center text-white font-bold text-xs" style={{ background: `linear-gradient(135deg, ${Z.blue}, #2D7FF9)` }}>
                            {(rec.patient?.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm" style={{ color: Z.navy }}>{rec.patient?.name || 'Unknown'}</div>
                            <div className="text-[10px]" style={{ color: Z.text }}>ID: {rec.patient?.patientId ? rec.patient.patientId.split('-')[0].toUpperCase() : '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-semibold truncate max-w-[200px] block" style={{ color: Z.navy }}>{fileName}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold" style={{ background: Z.blueL, color: Z.blue }}>
                          {docType}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium" style={{ color: Z.navy }}>{formatDate(rec.uploadedDate)}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a href={fileUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-blue-600" title="View Document">
                            <MdVisibility size={18} />
                          </a>
                          <a href={fileUrl} download className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-green-600" title="Download">
                            <MdDownload size={18} />
                          </a>
                          <button onClick={() => handleDelete(rec.documentId)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600" title="Delete">
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan={6} className="p-12 text-center text-sm font-medium" style={{ color: Z.text }}>No medical records match the filter criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;

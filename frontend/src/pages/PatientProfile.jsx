import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPatient, getPatientDocuments, deletePatient, updatePatient } from '../api';
import {
  MdArrowBack,
  MdChevronRight,
  MdNoteAdd,
  MdEditCalendar,
  MdReceipt,
  MdDownload,
  MdVisibility,
  MdScience,
  MdWaterDrop,
  MdAdd,
  MdPrint,
  MdDelete,
  MdEdit,
  MdSave,
  MdClose
} from 'react-icons/md';

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDoctor = !location.pathname.includes('/receptionist');
  
  const [patientData, setPatientData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('overview');
  const [activePrintRx, setActivePrintRx] = useState(null);
  const [activePrintBill, setActivePrintBill] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [p, docs] = await Promise.all([
          getPatient(patientId),
          getPatientDocuments(patientId),
        ]);
        setPatientData(p);
        setDocuments(docs);
        setEditFormData({
          name: p.name || '',
          age: p.age || '',
          gender: p.gender || 'Male',
          contactNumber: p.contactNumber || '',
          whatsAppNumber: p.whatsAppNumber || p.contactNumber || '',
          email: p.email || ''
        });
      } catch (e) {
        setError('Failed to load patient record');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const handleEditSave = async () => {
    try {
      setLoading(true);
      const payload = {
        name: editFormData.name,
        age: parseInt(editFormData.age) || 30,
        gender: editFormData.gender,
        contactNumber: editFormData.contactNumber,
        whatsAppNumber: editFormData.whatsAppNumber,
        email: editFormData.email
      };
      await updatePatient(patientId, payload);
      const updatedP = await getPatient(patientId);
      setPatientData(updatedP);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update patient: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 font-semibold">Loading patient profile...</div>;
  if (error || !patientData) return (
    <div className="text-center py-16">
      <p className="text-red-500 font-bold mb-4">{error || 'Patient not found'}</p>
      <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold">Go Back</button>
    </div>
  );

  // Map backend entity to the UI structure (filling in dummy details where backend is missing properties)
  const selectedPatient = {
    name: patientData.name || 'Unknown Patient',
    id: patientData.patientId?.substring(0, 8).toUpperCase() || '—',
    registeredDate: patientData.createdDate ? new Date(patientData.createdDate).toLocaleDateString('en-GB') : '—',
    status: 'Active',
    condition: 'Stable',
    age: patientData.age || '—',
    gender: patientData.gender || '—',
    bloodGroup: 'O+', // Dummy
    phone: patientData.contactNumber || '—',
    emergencyPhone: patientData.whatsAppNumber || patientData.contactNumber || '—',
    lastVisit: patientData.appointments?.[0] ? new Date(patientData.appointments[0].appointmentDate).toLocaleDateString('en-GB') : '—',
    nextFollowUp: 'Not Scheduled',
    vitals: { bp: '120/80', pulse: '72 bpm', temp: '98.6°F', spo2: '98%' },
    complaints: 'No active complaints logged in system.',
    allergies: ['Penicillin'], // Example
    history: [
      { condition: 'Hypertension', date: '12 Jan 2024', status: 'Managed' }
    ],
    surgeries: [],
    familyHistory: { father: 'Diabetes Type 2', mother: 'No known conditions', siblings: 'No known conditions' },
    labs: [
      { name: 'Complete Blood Count (CBC)', ordered: '14 May 2026', received: '15 May 2026', status: 'Normal' },
      { name: 'Lipid Profile', ordered: '14 May 2026', received: '15 May 2026', status: 'High' }
    ],
    billingHistory: [
      { id: 'INV-2026-089', date: '14 May 2026', amount: 800, status: 'Paid' },
      { id: 'INV-2026-042', date: '10 Apr 2026', amount: 450, status: 'Paid' }
    ]
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'history', name: 'Medical History' },
    { id: 'labs', name: 'Lab Reports' }
  ];

  return (
    <div className="screen-fade h-full overflow-y-auto p-4 flex flex-col gap-3">
      {/* Breadcrumb + actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost p-1 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
            onClick={() => navigate(-1)}
          >
            <MdArrowBack size={16} />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <button className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/receptionist/patients')}>Patients</button>
            <MdChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-800 font-bold">{selectedPatient.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-200 transition-colors cursor-pointer" onClick={() => setIsEditing(true)}>
              <MdEdit size={14} />
              <span>Edit Patient</span>
            </button>
          ) : (
            <>
              <button className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-200 transition-colors cursor-pointer" onClick={() => {
                setIsEditing(false);
                setEditFormData({
                  name: patientData.name || '',
                  age: patientData.age || '',
                  gender: patientData.gender || 'Male',
                  contactNumber: patientData.contactNumber || '',
                  whatsAppNumber: patientData.whatsAppNumber || patientData.contactNumber || '',
                  email: patientData.email || ''
                });
              }}>
                <MdClose size={14} />
                <span>Cancel</span>
              </button>
              <button className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-green-600 transition-colors cursor-pointer" onClick={handleEditSave}>
                <MdSave size={14} />
                <span>Save</span>
              </button>
            </>
          )}
          <button className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-red-600 transition-colors cursor-pointer" onClick={async () => {
            if (window.confirm('Are you sure you want to delete this patient?')) {
              try {
                await deletePatient(patientId);
                navigate('/receptionist/patients');
              } catch (err) {
                alert('Failed to delete patient: ' + err.message);
              }
            }
          }}>
            <MdDelete size={14} />
            <span>Delete Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex-shrink-0">
        <div className="flex flex-col md:flex-row items-start gap-5">
          <div className="bg-blue-100 text-blue-700 font-bold rounded-2xl flex items-center justify-center shadow-inner" style={{ width: '56px', height: '56px', fontSize: '18px', flexShrink: 0 }}>
            {selectedPatient.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
            <div className="col-span-1 md:col-span-2">
              {isEditing ? (
                <input 
                  type="text" 
                  value={editFormData.name} 
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                  className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 outline-none bg-slate-50 w-full mb-1 px-1 rounded-sm" 
                />
              ) : (
                <h2 className="text-2xl text-slate-800" style={{ fontWeight: 800 }}>{selectedPatient.name}</h2>
              )}
              <p className="text-sm text-slate-500 mt-0.5 font-medium">Patient ID: {selectedPatient.id} · Registered {selectedPatient.registeredDate}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">{selectedPatient.status}</span>
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">{selectedPatient.condition}</span>
                <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">Follow-up due</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 tracking-wider" style={{ fontWeight: 700 }}>AGE / GENDER</p>
              {isEditing ? (
                <div className="flex gap-2 mt-1">
                  <input 
                    type="number" 
                    value={editFormData.age} 
                    onChange={e => setEditFormData({...editFormData, age: e.target.value})}
                    className="text-sm font-semibold border-b border-blue-500 outline-none bg-slate-50 w-12 px-1 rounded-sm" 
                  />
                  <select 
                    value={editFormData.gender} 
                    onChange={e => setEditFormData({...editFormData, gender: e.target.value})}
                    className="text-sm font-semibold border-b border-blue-500 outline-none bg-slate-50 px-1 rounded-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              ) : (
                <p className="text-sm text-slate-700 font-semibold mt-1">{selectedPatient.age} years · {selectedPatient.gender}</p>
              )}
              <p className="text-xs text-slate-400 mt-2 tracking-wider" style={{ fontWeight: 700 }}>BLOOD GROUP</p>
              <p className="text-sm text-slate-700 font-semibold mt-1">{selectedPatient.bloodGroup}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 tracking-wider" style={{ fontWeight: 700 }}>CONTACT</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editFormData.contactNumber} 
                  onChange={e => setEditFormData({...editFormData, contactNumber: e.target.value})}
                  className="text-sm font-semibold border-b border-blue-500 outline-none bg-slate-50 w-full mt-1 px-1 rounded-sm" 
                />
              ) : (
                <p className="text-sm text-slate-700 font-semibold mt-1">+{selectedPatient.phone}</p>
              )}
              <p className="text-xs text-slate-400 mt-2 tracking-wider" style={{ fontWeight: 700 }}>EMERGENCY</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editFormData.whatsAppNumber} 
                  onChange={e => setEditFormData({...editFormData, whatsAppNumber: e.target.value})}
                  className="text-sm font-semibold border-b border-blue-500 outline-none bg-slate-50 w-full mt-1 px-1 rounded-sm" 
                />
              ) : (
                <p className="text-sm text-slate-700 font-semibold mt-1">+{selectedPatient.emergencyPhone}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400 tracking-wider" style={{ fontWeight: 700 }}>LAST VISIT</p>
              <p className="text-sm text-slate-700 font-semibold mt-1">{selectedPatient.lastVisit}</p>
              <p className="text-xs text-slate-400 mt-2 tracking-wider" style={{ fontWeight: 700 }}>NEXT FOLLOW-UP</p>
              <p className="text-sm text-blue-600 font-bold mt-1">{selectedPatient.nextFollowUp}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0">
        <div className="flex border-b border-slate-100 px-4 gap-1 overflow-x-auto scrollbar-hide flex-shrink-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="col-span-1 lg:col-span-3 space-y-5">
                  {/* Vitals */}
                  <div>
                    <h3 className="text-sm text-slate-700 mb-3 flex items-center" style={{ fontWeight: 700 }}>
                      Latest Vitals <span className="bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded text-[10px] ml-2">Today, 9:05 AM</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 shadow-sm">
                        <p className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontWeight: 700 }}>BP</p>
                        <p className="text-2xl text-slate-800 mt-1" style={{ fontWeight: 800 }}>
                          {selectedPatient.vitals?.bp || '120/80'}
                        </p>
                        <p className="text-xs text-amber-600 font-bold mt-0.5">High</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 shadow-sm">
                        <p className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontWeight: 700 }}>Pulse</p>
                        <p className="text-2xl text-slate-800 mt-1" style={{ fontWeight: 800 }}>
                          {selectedPatient.vitals?.pulse || '72 bpm'}
                        </p>
                        <p className="text-xs text-green-600 font-bold mt-0.5">Normal</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 shadow-sm">
                        <p className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontWeight: 700 }}>Temp</p>
                        <p className="text-2xl text-slate-800 mt-1" style={{ fontWeight: 800 }}>
                          {selectedPatient.vitals?.temp || '98.6°F'}
                        </p>
                        <p className="text-xs text-green-600 font-bold mt-0.5">Normal</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 shadow-sm">
                        <p className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontWeight: 700 }}>SpO₂</p>
                        <p className="text-lg text-slate-800 mt-1" style={{ fontWeight: 800 }}>
                          {selectedPatient.vitals?.spo2 || '98%'}
                        </p>
                        <p className="text-xs text-green-600 font-bold mt-0.5">Normal</p>
                      </div>
                    </div>
                  </div>

                  {/* Today's Complaints */}
                  <div>
                    <h3 className="text-sm text-slate-700 mb-2" style={{ fontWeight: 700 }}>Today's Complaints</h3>
                    <div className="bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-700 leading-relaxed border border-slate-100">
                      {selectedPatient.complaints || 'No active complaints logged.'}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <h3 className="text-sm text-slate-700 mb-2" style={{ fontWeight: 700 }}>Known Allergies</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                        selectedPatient.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 text-xs font-bold rounded-lg ${
                              allergy.toLowerCase().includes('no ') ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 text-xs font-bold rounded-lg">No allergies recorded</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: Medical History */}
          {activeTab === 'history' && (
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h3 className="text-sm text-slate-700 mb-3" style={{ fontWeight: 700 }}>Chronic Conditions</h3>
                  <div className="space-y-2">
                    {selectedPatient.history && selectedPatient.history.length > 0 ? (
                      selectedPatient.history.map((hist, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{hist.condition}</p>
                            <p className="text-xs font-medium text-slate-400">Diagnosed {hist.date}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            hist.status === 'Managed' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                          }`}>{hist.status}</span>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-500 text-center">No chronic conditions on record</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm text-slate-700 mb-3" style={{ fontWeight: 700 }}>Past Surgeries</h3>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-500 text-center">
                    {selectedPatient.surgeries && selectedPatient.surgeries.length > 0
                      ? selectedPatient.surgeries.join(', ')
                      : 'No surgeries on record'}
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <h3 className="text-sm text-slate-700 mb-3" style={{ fontWeight: 700 }}>Family History</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Father</p>
                    <p className="text-sm text-slate-800 font-bold mt-1">
                      {selectedPatient.familyHistory?.father || 'No known conditions'}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Mother</p>
                    <p className="text-sm text-slate-800 font-bold mt-1">
                      {selectedPatient.familyHistory?.mother || 'No known conditions'}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Siblings</p>
                    <p className="text-sm text-slate-800 font-bold mt-1">
                      {selectedPatient.familyHistory?.siblings || 'No known conditions'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Tab 4: Lab Reports */}
          {activeTab === 'labs' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-600">Latest lab reports</p>
                <button className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition-colors" onClick={() => alert('Lab order manager coming soon!')}>
                  <MdAdd size={14} />
                  <span>Order Test</span>
                </button>
              </div>
              <div className="space-y-2">
                {documents && documents.length > 0 ? (
                  documents.map((doc, index) => {
                    const isBlood = String(doc.documentType).includes('Blood') || doc.documentType === 0;
                    const fileName = doc.fileUrl ? doc.fileUrl.split('/').pop() : 'Document';
                    
                    return (
                    <div key={doc.documentId || index} className="flex items-center gap-4 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-4 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isBlood ? 'bg-amber-100' : 'bg-blue-100'
                      }`}>
                        {isBlood ? (
                          <MdWaterDrop className="text-amber-600" size={18} />
                        ) : (
                          <MdScience className="text-blue-600" size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{fileName}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Uploaded {new Date(doc.uploadedDate).toLocaleDateString()} · By {doc.uploadedBy || 'System'}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-green-100 text-green-700">Uploaded</span>
                      <a href={`http://localhost:5011${doc.fileUrl}`} target="_blank" rel="noreferrer" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold">
                        <MdVisibility size={14} />
                        <span>View</span>
                      </a>
                    </div>
                  )})
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-500 text-center border border-slate-100 font-medium">No lab reports or documents found.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;

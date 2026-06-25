import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPatient, getPatientDocuments } from '../api';
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
  MdPrint
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
      } catch (e) {
        setError('Failed to load patient record');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

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
    { id: 'labs', name: 'Lab Reports' },
    ...(!isDoctor ? [{ id: 'billing-tab', name: 'Billing' }] : [])
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
          {!isDoctor && (
            <>
              <button className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition-colors" onClick={() => alert('Follow-up scheduler coming soon!')}>
                <MdEditCalendar size={14} />
                <span>Schedule Follow-up</span>
              </button>
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition-colors cursor-pointer" onClick={() => alert('Billing module routing...')}>
                <MdReceipt size={14} />
                <span>Create Bill</span>
              </button>
            </>
          )}
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
              <h2 className="text-2xl text-slate-800" style={{ fontWeight: 800 }}>{selectedPatient.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">Patient ID: {selectedPatient.id} · Registered {selectedPatient.registeredDate}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">{selectedPatient.status}</span>
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">{selectedPatient.condition}</span>
                <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">Follow-up due</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 tracking-wider" style={{ fontWeight: 700 }}>AGE / GENDER</p>
              <p className="text-sm text-slate-700 font-semibold mt-1">{selectedPatient.age} years · {selectedPatient.gender}</p>
              <p className="text-xs text-slate-400 mt-2 tracking-wider" style={{ fontWeight: 700 }}>BLOOD GROUP</p>
              <p className="text-sm text-slate-700 font-semibold mt-1">{selectedPatient.bloodGroup}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 tracking-wider" style={{ fontWeight: 700 }}>CONTACT</p>
              <p className="text-sm text-slate-700 font-semibold mt-1">+{selectedPatient.phone}</p>
              <p className="text-xs text-slate-400 mt-2 tracking-wider" style={{ fontWeight: 700 }}>EMERGENCY</p>
              <p className="text-sm text-slate-700 font-semibold mt-1">+{selectedPatient.emergencyPhone}</p>
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
                <div className={`col-span-1 ${isDoctor ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-5`}>
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

                {/* Right column - QR Portal and recent activity */}
                {!isDoctor && (
                <div className="space-y-5">
                  
                  {/* QR Patient Portal Card */}
                  <div className="bg-[#FAF5F0] border border-[#DCC3AA] rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
                    <div className="flex items-center gap-1.5 text-[#810B38] font-bold text-xs uppercase tracking-wider mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Secure Patient Portal</span>
                    </div>
                    
                    {/* Custom SVG QR Code */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-inner mb-3 cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => navigate('/patient-form/' + patientData?.patientId)}>
                      <svg className="w-32 h-32 text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                        {/* Quiet Zone */}
                        <rect width="100" height="100" fill="white" />
                        
                        {/* Top-Left Finder Pattern */}
                        <rect x="5" y="5" width="30" height="30" fill="black" />
                        <rect x="10" y="10" width="20" height="20" fill="white" />
                        <rect x="15" y="15" width="10" height="10" fill="black" />

                        {/* Top-Right Finder Pattern */}
                        <rect x="65" y="5" width="30" height="30" fill="black" />
                        <rect x="70" y="10" width="20" height="20" fill="white" />
                        <rect x="75" y="15" width="10" height="10" fill="black" />

                        {/* Bottom-Left Finder Pattern */}
                        <rect x="5" y="65" width="30" height="30" fill="black" />
                        <rect x="10" y="70" width="20" height="20" fill="white" />
                        <rect x="15" y="75" width="10" height="10" fill="black" />

                        {/* Bottom-Right Alignment Pattern */}
                        <rect x="70" y="70" width="15" height="15" fill="black" />
                        <rect x="75" y="75" width="5" height="5" fill="white" />

                        {/* Random Data Blocks */}
                        <rect x="40" y="5" width="5" height="10" fill="black" />
                        <rect x="50" y="15" width="10" height="5" fill="black" />
                        <rect x="40" y="25" width="15" height="5" fill="black" />
                        
                        <rect x="5" y="40" width="10" height="5" fill="black" />
                        <rect x="20" y="45" width="15" height="10" fill="black" />
                        <rect x="5" y="55" width="5" height="5" fill="black" />

                        <rect x="45" y="45" width="10" height="10" fill="black" />
                        <rect x="50" y="65" width="5" height="15" fill="black" />
                        <rect x="40" y="80" width="15" height="5" fill="black" />

                        <rect x="65" y="40" width="15" height="5" fill="black" />
                        <rect x="80" y="45" width="5" height="15" fill="black" />
                        <rect x="65" y="55" width="10" height="5" fill="black" />
                        
                        {/* Red cross inside the middle for medical feel */}
                        <rect x="45" y="40" width="10" height="20" fill="#810B38" />
                        <rect x="40" y="45" width="20" height="10" fill="#810B38" />
                      </svg>
                    </div>

                    <p className="text-[11px] text-slate-500 font-bold px-2 leading-relaxed">
                      Scan this unique QR code to access medical records, invoices, and follow-ups.
                    </p>
                    
                    <button 
                      className="w-full mt-4 py-2 bg-[#810B38] text-white rounded-xl text-xs font-bold hover:bg-[#6B082D] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      onClick={() => navigate('/patient-form/' + patientData?.patientId)}
                    >
                      <span>Simulate Mobile Scan</span>
                    </button>
                  </div>

                  {/* Recent Activity Timeline */}
                  <div>
                    <h3 className="text-sm text-slate-700 mb-3" style={{ fontWeight: 700 }}>Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3 relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0 relative z-10 shadow-[0_0_0_4px_#eff6ff]"></div>
                        <div className="absolute top-3 left-1 bottom-[-20px] w-[2px] bg-slate-100 z-0"></div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Consultation</p>
                          <p className="text-xs font-medium text-slate-400">Today · Dr. Rajan</p>
                        </div>
                      </div>
                      <div className="flex gap-3 relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mt-1 flex-shrink-0 relative z-10 shadow-[0_0_0_4px_#f0fdfa]"></div>
                        <div className="absolute top-3 left-1 bottom-[-20px] w-[2px] bg-slate-100 z-0"></div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Lab report received</p>
                          <p className="text-xs font-medium text-slate-400">28 May · CBC</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1 flex-shrink-0 shadow-[0_0_0_4px_#f8fafc]"></div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Bill paid</p>
                          <p className="text-xs font-medium text-slate-400">22 May · ₹400</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                )}
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

          {/* Tab 5: Billing */}
          {activeTab === 'billing-tab' && (
            <div className="p-5">
              <div className="space-y-3">
                {selectedPatient.billingHistory && selectedPatient.billingHistory.length > 0 ? (
                  selectedPatient.billingHistory.map((bill, index) => (
                    <div key={index} className="flex items-center gap-4 bg-slate-50 border border-slate-100 hover:bg-white rounded-xl p-4 transition-colors shadow-sm">
                      <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Invoice</p>
                          <p className="font-bold text-slate-800">{bill.id}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Date</p>
                          <p className="font-bold text-slate-800">{bill.date}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Amount</p>
                          <p className="font-bold text-slate-800">₹{bill.amount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</p>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            bill.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>{bill.status}</span>
                        </div>
                      </div>
                      <button className="p-2 bg-blue-50 text-blue-700 rounded-lg font-bold flex items-center gap-1.5 text-xs hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => setActivePrintBill(bill)}>
                        <MdPrint size={14} />
                        <span>View/Print</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-500 font-medium text-center border border-slate-100">No billing history found.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Bill Modal */}
      {activePrintBill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden animate-fade-in" onClick={() => setActivePrintBill(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              <h3 className="font-bold text-slate-800 text-sm">Invoice Print View</h3>
              <div className="flex items-center gap-2">
                <button 
                  className="bg-blue-600 text-white font-bold py-1.5 px-4 rounded-lg flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer text-xs"
                  onClick={() => window.print()}
                >
                  <MdPrint size={14} />
                  <span>Print Invoice</span>
                </button>
                <button 
                  className="bg-white border border-slate-200 text-slate-700 font-bold py-1.5 px-4 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs shadow-sm"
                  onClick={() => setActivePrintBill(null)}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-8 overflow-y-auto bg-white text-xs space-y-4">
              <div className="text-center border-b border-slate-100 pb-4 flex flex-col items-center justify-center">
                <div className="h-10 w-32 bg-slate-200 rounded animate-pulse mb-3 flex items-center justify-center text-slate-400 font-bold">Logo Placehoder</div>
                <p className="font-bold text-slate-800 text-sm font-sans" style={{ fontWeight: 800 }}>CareFlow Partner Clinic</p>
                <p className="text-slate-500 font-medium font-sans mt-0.5 tracking-wide">{activePrintBill.id} · {activePrintBill.date}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 font-sans mt-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold mb-1 tracking-wider uppercase">Bill To</p>
                  <p className="font-bold text-slate-800 text-sm">{selectedPatient.name}</p>
                  <p className="text-slate-500 font-medium mt-0.5">Patient ID: {selectedPatient.id}</p>
                </div>
                <div className="text-right font-sans">
                  <p className="text-[10px] text-slate-400 font-bold mb-1 tracking-wider uppercase">Bill From</p>
                  <p className="font-bold text-slate-800 text-sm">Dr. Rajan Kumar</p>
                  <p className="text-slate-500 font-medium mt-0.5">CareFlow Clinic Partner</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 font-sans">
                <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="border-t border-slate-100 my-1"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700">OPD Consultation Fee</span>
                  <span className="font-bold text-slate-800">₹{activePrintBill.amount - Math.round(activePrintBill.amount * 0.15)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700">Medicines dispensed & others</span>
                  <span className="font-bold text-slate-800">₹{Math.round(activePrintBill.amount * 0.15)}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 my-3"></div>
                <div className="flex justify-between text-slate-500 font-medium text-xs">
                  <span>GST (18% inclusive)</span>
                  <span>₹{Math.round(activePrintBill.amount * 0.18)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-3 mt-1">
                  <span className="text-slate-800 font-bold">Total Paid</span>
                  <span className="text-blue-700 font-bold">₹{activePrintBill.amount}</span>
                </div>
              </div>

              <div className="bg-green-50 text-green-700 rounded-xl p-3 text-center mt-6 font-sans border border-green-100 shadow-sm">
                <p className="font-bold text-xs tracking-wide">✓ Payment Received via Card/Cash/UPI</p>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-6 mt-6 border-t border-slate-100 font-sans font-medium">
                <p>Thank you for choosing CareFlow Hospitals Partner network.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;

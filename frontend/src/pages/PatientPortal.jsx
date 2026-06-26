import React, { useState, useEffect } from 'react';
import { getPatients } from '../api';
import { 
  MdSecurity, 
  MdContentCopy, 
  MdQrCodeScanner, 
  MdSend,
  MdCheckCircle,
  MdPhoneAndroid,
  MdMessage,
  MdEmail,
  MdArrowForwardIos,
  MdEvent,
  MdTimer,
  MdInsertDriveFile,
  MdPayment,
  MdMoreVert,
  MdPerson
} from 'react-icons/md';

const PatientPortal = () => {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatient(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch patients", error);
      }
    };
    loadPatients();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'P';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const portalLink = `https://cmsportal.com/patient/P${selectedPatient?.id || '1000'}`;
  
  // Theme constants
  const Z = {
    blue: '#0B5FFF',
    navy: '#1A2B4A',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E5E7EB',
    text: '#6B7A99',
    green: '#10B981',
    lightGreen: '#D1FAE5',
    lightBlue: '#EFF6FF'
  };

  const templates = [
    { title: 'Portal Access', desc: 'Send patient portal link', icon: MdSecurity, active: true },
    { title: 'Appointment Confirmation', desc: 'Confirm upcoming appointment', icon: MdEvent },
    { title: 'Follow-up Reminder', desc: 'Send follow-up reminder', icon: MdTimer },
    { title: 'Report Ready', desc: 'Inform report availability', icon: MdInsertDriveFile },
    { title: 'Payment Reminder', desc: 'Send payment reminder', icon: MdPayment },
    { title: 'Custom Message', desc: 'Send custom message', icon: MdMessage },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Top Banner - Patient Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm" 
               style={{ backgroundColor: Z.lightBlue, color: Z.blue, border: `1px solid ${Z.border}` }}>
            {getInitials(selectedPatient?.name)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <select 
                className="text-lg font-bold text-slate-800 bg-transparent outline-none cursor-pointer appearance-none hover:text-blue-600 transition-colors"
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const pat = patients.find(p => p.id === parseInt(e.target.value));
                  if (pat) setSelectedPatient(pat);
                }}
              >
                {patients.length === 0 && <option value="">Loading...</option>}
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-600 border border-green-200 uppercase tracking-wider">
                Active
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium flex gap-2 mt-1">
              <span>ID: #{selectedPatient?.id || '...'}</span>
              <span>•</span>
              <span>{selectedPatient?.age || '--'} yrs</span>
              <span>•</span>
              <span>{selectedPatient?.gender || 'Unknown'}</span>
              <span>•</span>
              <span>{selectedPatient?.contactNumber || 'No Phone'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            <MdPerson size={16} />
            View Full Profile
          </button>
          
          <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
            <div className="bg-slate-50 rounded-lg p-2 px-3 border border-slate-100 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <MdCheckCircle size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Portal Status</span>
                <span className="text-xs font-bold text-slate-700">Active</span>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-2 px-3 border border-slate-100 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <MdPhoneAndroid size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Last Login</span>
                <span className="text-xs font-bold text-slate-700">Today, 09:15 AM</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-2 px-3 border border-slate-100 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <MdCheckCircle size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Status</span>
                <span className="text-xs font-bold text-green-600">Delivered</span>
              </div>
            </div>
          </div>
          
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <MdMoreVert size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="col-span-5 flex flex-col gap-6">
          
          {/* Portal Access Link */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <MdSecurity size={18} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">PORTAL ACCESS LINK</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
              Share this secure link with the patient to grant access to their electronic medical records dashboard.
            </p>
            
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-3 justify-between mb-4">
              <span className="text-sm font-semibold text-slate-700">{portalLink}</span>
              <button className="text-slate-400 hover:text-blue-600 transition-colors">
                <MdContentCopy size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                <MdContentCopy size={14} /> Copy Link
              </button>
              <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                <MdQrCodeScanner size={14} /> Generate QR
              </button>
              <button className="flex items-center justify-center gap-2 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-colors hover:shadow-md" style={{ background: Z.blue }}>
                <MdSend size={14} /> Share WhatsApp
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <MdQrCodeScanner size={16} className="text-slate-400" />
                <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">QR Code Access</h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="p-3 bg-white border border-slate-100 shadow-sm rounded-xl">
                  {/* Fake QR code using SVG pattern */}
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white"/>
                    <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10z" fill="#0f172a"/>
                    <path d="M40 0h20v10H40zM50 20h20v10H50zM40 40h30v10H40zM20 50h10v20H20zM80 50h20v20H80zM40 70h20v10H40zM60 80h10v20H60z" fill="#0f172a"/>
                  </svg>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <MdInsertDriveFile size={14} /> Download QR Code
                </button>
              </div>
            </div>

            {/* WhatsApp Message Composer */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MdMessage size={16} className="text-blue-500" />
                <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">WhatsApp Message</h3>
              </div>
              <div className="mb-3">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Select Message Type</label>
                <select className="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-700 bg-slate-50 outline-none">
                  <option>Portal Access Link</option>
                  <option>Appointment Confirmation</option>
                </select>
              </div>
              <div className="mb-3">
                <textarea 
                  className="w-full border border-slate-200 rounded-lg p-3 text-[11px] font-medium text-slate-600 bg-slate-50 h-32 outline-none resize-none"
                  value={`Hello ${selectedPatient?.name || 'Patient'},\n\nYour patient portal is ready.\nUse the link below to:\n• Book Appointments\n• View Medical Reports\n• Download Documents\n• View Billing Information\n\n${portalLink}`}
                  readOnly
                />
              </div>
              <button className="w-full flex items-center justify-center gap-2 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition-colors hover:shadow-md" style={{ background: Z.blue }}>
                <MdSend size={14} /> Send via WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column - Phone Mockup */}
        <div className="col-span-4 flex flex-col bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[600px]">
          
          {/* Tabs */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <button 
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'whatsapp' ? 'bg-green-50 text-green-700 border border-green-200' : 'text-slate-400 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('whatsapp')}
            >
              <MdMessage size={14} /> WhatsApp
            </button>
          </div>

          {/* Phone Frame */}
          <div className="relative mx-auto w-[280px] h-[580px] bg-slate-800 rounded-[40px] border-[8px] border-slate-800 shadow-xl overflow-hidden flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
              <div className="w-24 h-5 bg-slate-800 rounded-b-xl"></div>
            </div>
            
            {/* Status Bar */}
            <div className="h-12 bg-[#075e54] flex items-end justify-between px-6 pb-2 text-white z-10">
              <span className="text-[10px] font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2.5 border border-white rounded-[2px] relative">
                  <div className="absolute top-0.5 bottom-0.5 left-0.5 right-[40%] bg-white"></div>
                </div>
              </div>
            </div>

            {/* WhatsApp Header */}
            <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3 shadow-sm z-10">
              <MdArrowForwardIos size={14} className="text-white rotate-180" />
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">PCMS</div>
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-white font-bold text-sm leading-tight">PCMS Clinic</span>
                <span className="text-green-200 text-[10px]">online</span>
              </div>
              <MdPhoneAndroid size={16} className="text-white" />
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-[#efeae2] p-4 flex flex-col gap-3 overflow-y-auto" style={{ backgroundImage: 'radial-gradient(circle, #e5dfd6 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
              
              <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-[85%] shadow-sm relative">
                <p className="text-[11px] text-slate-800 mb-2 font-medium">Hello {selectedPatient?.name || 'Patient'},</p>
                <p className="text-[11px] text-slate-800 mb-2">Your patient portal is ready.</p>
                <p className="text-[11px] text-slate-800 mb-1">Use the link below to:</p>
                <ul className="text-[11px] text-slate-800 mb-3 ml-2 list-disc list-inside space-y-0.5">
                  <li>Book Appointments</li>
                  <li>View Medical Reports</li>
                  <li>Download Documents</li>
                  <li>View Billing Information</li>
                </ul>
                <a href="#" className="text-[11px] text-blue-500 underline break-all block mb-3">{portalLink}</a>
                <p className="text-[11px] text-slate-800 mb-1">Regards,</p>
                <p className="text-[11px] text-slate-800 font-bold">Professional Client Management System</p>
                <span className="text-[8px] text-slate-400 absolute bottom-1.5 right-2">10:24 AM</span>
              </div>

              <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none p-2 px-3 max-w-[85%] shadow-sm self-end relative">
                <p className="text-[11px] text-slate-800 pr-10">Hi, Thank you!</p>
                <span className="text-[8px] text-green-700 absolute bottom-1 right-2 flex items-center gap-0.5">
                  10:25 AM <MdCheckCircle size={10} className="text-blue-500" />
                </span>
              </div>

              <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-[85%] shadow-sm relative mt-2">
                <p className="text-[11px] text-slate-800 pr-12 leading-relaxed">
                  Your appointment is confirmed for <strong className="font-bold">16 July 2026 at 10:30 AM</strong> with Dr. Rajan. See you soon!
                </p>
                <span className="text-[8px] text-slate-400 absolute bottom-1 right-2">10:26 AM</span>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column - Message Templates */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Message Templates</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
          </div>

          <div className="flex flex-col gap-3">
            {templates.map((tpl, i) => {
              const Icon = tpl.icon;
              return (
                <div 
                  key={i} 
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${tpl.active ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tpl.active ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-50 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50'}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${tpl.active ? 'text-blue-900' : 'text-slate-700'}`}>{tpl.title}</span>
                      <span className={`text-[10px] font-medium ${tpl.active ? 'text-blue-600' : 'text-slate-400'}`}>{tpl.desc}</span>
                    </div>
                  </div>
                  <MdArrowForwardIos size={14} className={tpl.active ? 'text-blue-400' : 'text-slate-300'} />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientPortal;

import React, { useState, useEffect } from 'react';
import {
  MdSettings, MdBusiness, MdInsertDriveFile, MdPersonAdd,
  MdPayment, MdAdd, MdDelete, MdSave, MdCheckCircle
} from 'react-icons/md';

const Z = {
  blue: '#0B5FFF', blueL: '#EEF4FF',
  green: '#00AA45', greenL: '#E6F7EE',
  orange: '#F5A623', orangeL: '#FFF5E5',
  red: '#E42527', redL: '#FEE9E9',
  navy: '#1A2B4A', text: '#6B7A99',
};

const DEFAULT_SETTINGS = {
  clinicName: 'MedFlow Partner Clinic',
  clinicAddress: '123 Health Ave, Mumbai, MH',
  gstNumber: '27AABCU9603R1ZP',
  documentTypes: ['Blood Test', 'X-Ray', 'Prescription', 'MRI Scan', 'Discharge Summary', 'Other'],
  patientCustomFields: [
    { id: '1', name: 'Blood Group', type: 'select', options: 'A+, A-, B+, B-, O+, O-, AB+, AB-', required: false },
    { id: '2', name: 'Known Allergies', type: 'text', options: '', required: false },
  ],
  paymentModes: ['Cash', 'UPI', 'Credit Card', 'Insurance'],
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('careflow_settings');
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('careflow_settings', JSON.stringify(settings));
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleDocTypeAdd = () => {
    const name = prompt('Enter new document type name:');
    if (name && !settings.documentTypes.includes(name)) {
      setSettings({ ...settings, documentTypes: [...settings.documentTypes, name] });
    }
  };

  const handleDocTypeRemove = (index) => {
    const newTypes = [...settings.documentTypes];
    newTypes.splice(index, 1);
    setSettings({ ...settings, documentTypes: newTypes });
  };

  const handleCustomFieldAdd = () => {
    const newField = {
      id: Date.now().toString(),
      name: 'New Custom Field',
      type: 'text',
      options: '',
      required: false
    };
    setSettings({ ...settings, patientCustomFields: [...settings.patientCustomFields, newField] });
  };

  const updateCustomField = (index, key, value) => {
    const newFields = [...settings.patientCustomFields];
    newFields[index][key] = value;
    setSettings({ ...settings, patientCustomFields: newFields });
  };

  const handleCustomFieldRemove = (index) => {
    const newFields = [...settings.patientCustomFields];
    newFields.splice(index, 1);
    setSettings({ ...settings, patientCustomFields: newFields });
  };

  const TABS = [
    { id: 'general', label: 'Clinic Details', icon: MdBusiness },
    { id: 'docs', label: 'Document Types', icon: MdInsertDriveFile },
    { id: 'fields', label: 'Patient Form Fields', icon: MdPersonAdd },
    { id: 'billing', label: 'Billing Config', icon: MdPayment },
  ];

  const inputCls = "w-full px-4 py-2.5 border-2 rounded-xl outline-none text-sm transition-all duration-200 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300";
  const inputStyle = { borderColor: '#E2E8F0', background: '#F8FAFC', color: Z.navy };

  return (
    <div className="animate-fade-up h-full flex flex-col pb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: Z.navy }}>System Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: Z.text }}>Configure forms, document types, and clinic details.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200" style={{ background: savedStatus ? Z.green : Z.blue }}>
          {savedStatus ? <><MdCheckCircle size={18} /> Saved!</> : <><MdSave size={18} /> Save Changes</>}
        </button>
      </div>

      <div className="flex gap-6 flex-1 h-[600px] overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-2xl zoho-card border p-3 flex flex-col gap-1" style={{ borderColor: '#E8EDF4' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 text-left cursor-pointer ${isActive ? 'shadow-sm' : 'hover:bg-slate-50 hover:translate-x-1 hover:text-slate-800'}`}
                  style={isActive ? { background: Z.blue, color: '#fff' } : { color: Z.text }}>
                  <tab.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} /> {tab.label}
                </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl zoho-card border p-6 overflow-y-auto" style={{ borderColor: '#E8EDF4' }}>
          
          {/* TAB: General Settings */}
          {activeTab === 'general' && (
            <div className="max-w-2xl animate-fade-up">
              <h2 className="text-lg font-bold mb-4" style={{ color: Z.navy }}>Clinic Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: Z.navy }}>Clinic Name</label>
                  <input type="text" className={inputCls} style={inputStyle} value={settings.clinicName}
                    onChange={e => setSettings({...settings, clinicName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: Z.navy }}>Address & Contact</label>
                  <textarea rows="3" className={inputCls} style={inputStyle} value={settings.clinicAddress}
                    onChange={e => setSettings({...settings, clinicAddress: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: Z.navy }}>Tax Registration / GST Number</label>
                  <input type="text" className={inputCls} style={inputStyle} value={settings.gstNumber}
                    onChange={e => setSettings({...settings, gstNumber: e.target.value})} />
                </div>
                <div className="p-4 rounded-xl mt-4 bg-blue-50/50 border" style={{ borderColor: Z.blueL }}>
                  <p className="text-xs" style={{ color: Z.text }}>These details will be used on printed Invoices and PDF reports generated by the system.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Document Types */}
          {activeTab === 'docs' && (
            <div className="max-w-2xl animate-fade-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold" style={{ color: Z.navy }}>Document Categories</h2>
                <button onClick={handleDocTypeAdd} className="flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer" style={{ background: Z.blueL, color: Z.blue }}>
                  <MdAdd size={16} /> Add Category
                </button>
              </div>
              <p className="text-xs mb-4" style={{ color: Z.text }}>Define the categories available when uploading a patient document.</p>
              
              <div className="space-y-2">
                {settings.documentTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-3.5 border rounded-xl hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer" style={{ borderColor: '#E8EDF4', background: '#F8FAFC' }}>
                    <span className="font-bold text-sm" style={{ color: Z.navy }}>{type}</span>
                    <button onClick={() => handleDocTypeRemove(index)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                      <MdDelete size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Custom Form Fields */}
          {activeTab === 'fields' && (
            <div className="animate-fade-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold" style={{ color: Z.navy }}>Patient Registration Fields</h2>
                <button onClick={handleCustomFieldAdd} className="flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer" style={{ background: Z.blueL, color: Z.blue }}>
                  <MdAdd size={16} /> Add Custom Field
                </button>
              </div>
              <p className="text-xs mb-4 max-w-3xl" style={{ color: Z.text }}>
                These custom fields will be dynamically added to the 'Add New Patient' modal. You can collect additional medical history or demographic data.
              </p>
              
              <div className="space-y-4 max-w-4xl">
                {settings.patientCustomFields.map((field, index) => (
                  <div key={field.id} className="p-5 border rounded-2xl flex items-start gap-4 hover:shadow-md transition-all duration-300 hover:border-slate-300" style={{ borderColor: '#E8EDF4', background: '#F8FAFC' }}>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: Z.text }}>Field Name</label>
                        <input type="text" className={inputCls} style={inputStyle} value={field.name}
                          onChange={e => updateCustomField(index, 'name', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: Z.text }}>Input Type</label>
                        <select className={inputCls} style={inputStyle} value={field.type}
                          onChange={e => updateCustomField(index, 'type', e.target.value)}>
                          <option value="text">Short Text</option>
                          <option value="textarea">Long Paragraph</option>
                          <option value="select">Dropdown Menu</option>
                          <option value="date">Date Picker</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: Z.text }}>Is Required?</label>
                        <select className={inputCls} style={inputStyle} value={field.required ? "yes" : "no"}
                          onChange={e => updateCustomField(index, 'required', e.target.value === 'yes')}>
                          <option value="no">Optional</option>
                          <option value="yes">Required</option>
                        </select>
                      </div>
                      {field.type === 'select' && (
                        <div className="md:col-span-3 mt-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: Z.text }}>Dropdown Options (Comma separated)</label>
                          <input type="text" className={inputCls} style={inputStyle} placeholder="e.g. Yes, No, Maybe" value={field.options}
                            onChange={e => updateCustomField(index, 'options', e.target.value)} />
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleCustomFieldRemove(index)} className="p-2 mt-5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                      <MdDelete size={20} />
                    </button>
                  </div>
                ))}
                {settings.patientCustomFields.length === 0 && (
                  <p className="text-center text-sm py-8" style={{ color: Z.text }}>No custom fields added yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB: Billing */}
          {activeTab === 'billing' && (
            <div className="max-w-2xl animate-fade-up">
              <h2 className="text-lg font-bold mb-4" style={{ color: Z.navy }}>Billing Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: Z.navy }}>Accepted Payment Modes</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.paymentModes.map(mode => (
                      <span key={mode} className="px-3 py-1.5 rounded-full text-xs font-bold border" style={{ background: '#fff', color: Z.navy, borderColor: '#E8EDF4' }}>
                        {mode}
                      </span>
                    ))}
                    <button className="px-3 py-1.5 rounded-full text-xs font-bold border border-dashed hover:bg-blue-50 transition-colors cursor-pointer" style={{ color: Z.blue, borderColor: Z.blue }}>
                      + Add Mode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;

const BASE_URL = 'http://localhost:5011/api';

// ─── DASHBOARD ───────────────────────────────────────────────
export const getDashboardSummary = async (doctorId = null) => {
  const params = doctorId ? `?doctorId=${doctorId}` : '';
  const res = await fetch(`${BASE_URL}/dashboard/summary${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
};

// ─── DOCTORS ─────────────────────────────────────────────────
export const getDoctors = async () => {
  const res = await fetch(`${BASE_URL}/doctor`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
};

export const createDoctor = async (data) => {
  const res = await fetch(`${BASE_URL}/doctor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create doctor');
  return res.json();
};



// ─── PATIENTS ────────────────────────────────────────────────
export const getPatients = async (search = '') => {
  const res = await fetch(`${BASE_URL}/patient${search ? `?search=${encodeURIComponent(search)}` : ''}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
};

export const getPatient = async (id) => {
  const res = await fetch(`${BASE_URL}/patient/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch patient');
  return res.json();
};

export const registerPatient = async (patientData) => {
  const res = await fetch(`${BASE_URL}/patient`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to register patient');
  }
  return res.json();
};

export const updatePatient = async (id, patientData) => {
  const res = await fetch(`${BASE_URL}/patient/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  if (!res.ok) throw new Error('Failed to update patient');
  return res.json();
};

export const deletePatient = async (id) => {
  const res = await fetch(`${BASE_URL}/patient/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete patient');
  return res.json();
};

// ─── APPOINTMENTS ────────────────────────────────────────────
export const getAppointments = async ({ date, patientId, doctorId } = {}) => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (patientId) params.append('patientId', patientId);
  if (doctorId) params.append('doctorId', doctorId);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/appointment${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
};

export const getTodaysAppointments = async () => {
  const res = await fetch(`${BASE_URL}/appointment/today`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch today appointments');
  return res.json();
};

export const bookAppointment = async (data) => {
  const res = await fetch(`${BASE_URL}/appointment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to book appointment');
  return res.json();
};

export const rescheduleAppointment = async (id, newDate) => {
  const res = await fetch(`${BASE_URL}/appointment/${id}/reschedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newDate }),
  });
  if (!res.ok) throw new Error('Failed to reschedule');
  return res.json();
};

export const cancelAppointment = async (id) => {
  const res = await fetch(`${BASE_URL}/appointment/${id}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to cancel');
  return res.json();
};

export const deleteAppointment = async (id) => {
  const res = await fetch(`${BASE_URL}/appointment/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete appointment');
  return res.json();
};

// ─── DOCUMENTS ───────────────────────────────────────────────
export const getDocuments = async ({ patientId, type } = {}) => {
  const params = new URLSearchParams();
  if (patientId) params.append('patientId', patientId);
  if (type) params.append('type', type);
  const res = await fetch(`${BASE_URL}/document?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
};

export const getPatientDocuments = async (patientId) => {
  const res = await fetch(`${BASE_URL}/document/patient/${patientId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
};

export const uploadDocument = async (formData) => {
  const res = await fetch(`${BASE_URL}/document/upload`, {
    method: 'POST',
    body: formData, // multipart/form-data, no Content-Type header needed
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return res.json();
};

export const deleteDocument = async (id) => {
  const res = await fetch(`${BASE_URL}/document/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete document');
  return res.json();
};

// ─── INVOICES ────────────────────────────────────────────────
export const getInvoices = async (patientId) => {
  const params = patientId ? `?patientId=${patientId}` : '';
  const res = await fetch(`${BASE_URL}/invoice${params}`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
};

export const createInvoice = async (data) => {
  const res = await fetch(`${BASE_URL}/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json();
};

export const updateInvoice = async (id, data) => {
  const res = await fetch(`${BASE_URL}/invoice/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update invoice');
  return res.json();
};

export const deleteInvoice = async (id) => {
  const res = await fetch(`${BASE_URL}/invoice/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete invoice');
  return res.json();
};

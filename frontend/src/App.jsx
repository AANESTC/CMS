import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import DoctorPatients from './pages/DoctorPatients';
import PatientProfile from './pages/PatientProfile';
import QrSelfService from './pages/QrSelfService';
import Layout from './components/Layout';
import ReceptionistLayout from './components/ReceptionistLayout';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PatientManagement from './pages/PatientManagement';
import Doctors from './pages/Doctors';
import AppointmentManagement from './pages/AppointmentManagement';
import DocumentManagement from './pages/DocumentManagement';
import InvoiceManagement from './pages/InvoiceManagement';
import FollowUpManagement from './pages/FollowUpManagement';
import MedicalRecords from './pages/MedicalRecords';
import ReportsAnalytics from './pages/ReportsAnalytics';
import Settings from './pages/Settings';
import PatientPortal from './pages/PatientPortal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient self service - no auth */}
        <Route path="/patient-form/:patientId" element={<QrSelfService />} />

        {/* Doctor Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<AppointmentManagement isDoctor={true} />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="patient/:patientId" element={<PatientProfile />} />
          <Route path="documents" element={<DocumentManagement />} />
        </Route>

        {/* Receptionist Routes */}
        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ReceptionistDashboard />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="patients/:patientId" element={<PatientProfile />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route path="documents" element={<DocumentManagement />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="invoices" element={<InvoiceManagement />} />
          <Route path="follow-ups" element={<FollowUpManagement />} />
          <Route path="patient-portal" element={<PatientPortal />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

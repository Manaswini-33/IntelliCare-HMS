import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { PatientDashboard } from '../components/dashboards/PatientDashboard';
import { DoctorDashboard } from '../components/dashboards/DoctorDashboard';
import { ReceptionistDashboard } from '../components/dashboards/ReceptionistDashboard';
import { LabDashboard } from '../components/dashboards/LabDashboard';
import { PharmacyDashboard } from '../components/dashboards/PharmacyDashboard';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  const renderDashboard = () => {
    switch (role) {
      case 'DOCTOR':
        return <DoctorDashboard />;
      case 'RECEPTIONIST':
        return <ReceptionistDashboard />;
      case 'LAB_TECHNICIAN':
        return <LabDashboard />;
      case 'PHARMACIST':
        return <PharmacyDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'PATIENT':
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>IntelliCare HMS • Academic College Project • Built with Spring Boot, Python FastAPI & React</p>
      </footer>
    </div>
  );
};

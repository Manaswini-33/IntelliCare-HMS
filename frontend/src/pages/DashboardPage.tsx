import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { PatientDashboard } from '../components/dashboards/PatientDashboard';
import { DoctorDashboard } from '../components/dashboards/DoctorDashboard';
import { ReceptionistDashboard } from '../components/dashboards/ReceptionistDashboard';
import { LabDashboard } from '../components/dashboards/LabDashboard';
import { PharmacyDashboard } from '../components/dashboards/PharmacyDashboard';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { ProfileSetupPage } from './ProfileSetupPage';
import type { Role } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, role, updateUser } = useAuth();

  const getDefaultTabForRole = (currentRole?: Role): string => {
    switch (currentRole) {
      case 'DOCTOR':
        return 'opd-queue';
      case 'RECEPTIONIST':
        return 'registration';
      case 'LAB_TECHNICIAN':
        return 'test-queue';
      case 'PHARMACIST':
        return 'prescriptions';
      case 'ADMIN':
        return 'doctors';
      case 'PATIENT':
      default:
        return 'dashboard';
    }
  };

  const [activeTab, setActiveTab] = useState<string>(getDefaultTabForRole(role || undefined));

  useEffect(() => {
    setActiveTab(getDefaultTabForRole(role || undefined));
  }, [role]);

  // First-time patient profile completion requirement
  if (role === 'PATIENT' && user && !user.profileCompleted) {
    return (
      <ProfileSetupPage
        onComplete={() => {
          updateUser({ profileCompleted: true });
        }}
      />
    );
  }

  const renderDashboard = () => {
    switch (role) {
      case 'DOCTOR':
        return <DoctorDashboard activeTab={activeTab} onSelectTab={setActiveTab} />;
      case 'RECEPTIONIST':
        return <ReceptionistDashboard activeTab={activeTab} onSelectTab={setActiveTab} />;
      case 'LAB_TECHNICIAN':
        return <LabDashboard activeTab={activeTab} onSelectTab={setActiveTab} />;
      case 'PHARMACIST':
        return <PharmacyDashboard activeTab={activeTab} onSelectTab={setActiveTab} />;
      case 'ADMIN':
        return <AdminDashboard activeTab={activeTab} onSelectTab={setActiveTab} />;
      case 'PATIENT':
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Staff modules use common role Sidebar */}
          {role !== 'PATIENT' && <Sidebar activeItem={activeTab} onSelect={setActiveTab} />}
          <main className="flex-1 min-w-0 w-full">
            {renderDashboard()}
          </main>
        </div>
      </div>
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>IntelliCare HMS • Academic College Project • Built with Spring Boot, Python FastAPI & React</p>
      </footer>
    </div>
  );
};

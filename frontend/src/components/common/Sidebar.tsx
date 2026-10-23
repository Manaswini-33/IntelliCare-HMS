import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  FileText,
  Pill,
  Users,
  Stethoscope,
  Activity,
  AlertTriangle,
  FlaskConical,
  UploadCloud,
  CheckCircle2,
  Package,
  Boxes,
  ShieldCheck,
  UserPlus,
  Menu,
  X,
} from 'lucide-react';
import type { Role } from '../../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { user, role } = useAuth();
  const [activeItem, setActiveItem] = useState<string>('overview');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  const getNavItems = (currentRole?: Role): NavItem[] => {
    switch (currentRole) {
      case 'DOCTOR':
        return [
          { id: 'opd-queue', label: 'OPD Consultation Queue', icon: Users, badge: 'Live' },
          { id: 'active-patient', label: 'Active Consultation & Vitals', icon: Activity },
          { id: 'lab-diagnostics', label: 'Lab Tests & Diagnostic Reports', icon: FlaskConical },
          { id: 'prescriptions', label: 'Issued Prescriptions', icon: Pill },
        ];
      case 'RECEPTIONIST':
        return [
          { id: 'registration', label: 'Patient Registration & Vitals', icon: UserPlus },
          { id: 'ai-triage', label: '🚨 AI Emergency Triage', icon: AlertTriangle, badge: 'ML' },
          { id: 'appointments', label: 'Appointment Scheduling', icon: Calendar },
          { id: 'doctor-roster', label: 'OPD Doctor Roster', icon: Stethoscope },
        ];
      case 'LAB_TECHNICIAN':
        return [
          { id: 'test-queue', label: 'Diagnostic Test Worklist', icon: FlaskConical, badge: 'Queue' },
          { id: 'upload-reports', label: 'Upload Lab Reports & X-Rays', icon: UploadCloud },
          { id: 'completed-tests', label: 'Completed Diagnostic Archives', icon: CheckCircle2 },
        ];
      case 'PHARMACIST':
        return [
          { id: 'prescriptions', label: 'Doctor Prescriptions to Dispense', icon: Pill, badge: 'Pending' },
          { id: 'formulary', label: 'Drug Formulary & Inventory', icon: Package },
          { id: 'procurement', label: 'Restock Orders & Procurement', icon: Boxes },
        ];
      case 'ADMIN':
        return [
          { id: 'doctors', label: 'Doctor Directory & Analytics', icon: Stethoscope },
          { id: 'staff', label: 'Staff Management & RBAC', icon: Users },
          { id: 'procurement', label: 'Procurement & Purchase Orders', icon: Package },
          { id: 'ml-health', label: 'ML Microservice & System Audits', icon: Activity, badge: 'UP' },
        ];
      case 'PATIENT':
      default:
        return [
          { id: 'appointments', label: 'Book Appointment & Turn Estimation', icon: Calendar, badge: 'AI' },
          { id: 'my-queue', label: 'My Consultation Status & Queue', icon: Clock },
          { id: 'my-reports', label: 'Lab Reports & Medical Records', icon: FileText },
          { id: 'my-prescriptions', label: 'Active Prescriptions', icon: Pill },
        ];
    }
  };

  const navItems = getNavItems(role || undefined);

  const handleNavClick = (id: string) => {
    setActiveItem(id);
    setIsOpenMobile(false);
    // Smooth scroll to top of main or specific anchor if present
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile Drawer Trigger Pill */}
      <div className="lg:hidden mb-4 flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            {role || 'PATIENT'} Navigation
          </span>
        </div>
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
        >
          {isOpenMobile ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`${
          isOpenMobile ? 'block' : 'hidden'
        } lg:block w-full lg:w-64 shrink-0 transition-all`}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-20 space-y-4">
          {/* User Profile Card */}
          <div className="p-3 bg-gradient-to-br from-teal-50 to-slate-50 rounded-xl border border-teal-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 text-xs truncate">
                {user?.name || user?.username || 'Authenticated User'}
              </div>
              <span className="text-[10px] font-semibold text-teal-700 block truncate">
                {role || 'PATIENT'} Portal
              </span>
            </div>
          </div>

          {/* Role Navigation Items */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">
              Workspace Modules
            </span>
            <nav className="space-y-1 pt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-black shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Clinical Status / System Info */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Service Health
              </span>
              <span className="font-bold text-emerald-700">100% UP</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Security
              </span>
              <span className="font-bold text-slate-700">JWT / RBAC</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

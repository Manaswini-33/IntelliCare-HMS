import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import type { Role } from '../../types';

export const Navbar: React.FC = () => {
  const { user, role, logout, demoLogin } = useAuth();

  const roles: Role[] = ['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'PHARMACIST', 'ADMIN'];

  const roleLabelMap: Record<Role, string> = {
    PATIENT: 'Patient',
    DOCTOR: 'Doctor',
    RECEPTIONIST: 'Receptionist',
    LAB_TECHNICIAN: 'Lab Tech',
    PHARMACIST: 'Pharmacist',
    ADMIN: 'Administrator',
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Hospital Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              IntelliCare <span className="text-teal-600 font-extrabold">HMS</span>
            </span>
            <p className="text-[11px] text-slate-500 hidden sm:block">AI-Driven Hospital Management</p>
          </div>
        </div>

        {/* Quick Role Switcher for seamless testing */}
        <div className="hidden md:flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Portal:
          </span>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => demoLogin(r)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                role === r
                  ? 'bg-white text-teal-700 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {roleLabelMap[r]}
            </button>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              {user?.username || 'Demo User'}
            </p>
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {roleLabelMap[role || 'PATIENT']}
            </span>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

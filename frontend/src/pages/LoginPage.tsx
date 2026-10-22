import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Lock,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import type { Role } from '../types';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('PATIENT');
  const [username, setUsername] = useState<string>('9876543210');
  const [password, setPassword] = useState<string>('password123');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roles: { role: Role; label: string; icon: string; defaultUser: string }[] = [
    { role: 'PATIENT', label: 'Patient', icon: '👤', defaultUser: '9876543210' },
    { role: 'DOCTOR', label: 'Doctor', icon: '👨‍⚕️', defaultUser: '2001' },
    { role: 'RECEPTIONIST', label: 'Receptionist', icon: '📋', defaultUser: '3001' },
    { role: 'LAB_TECHNICIAN', label: 'Lab Tech', icon: '🔬', defaultUser: '4001' },
    { role: 'PHARMACIST', label: 'Pharmacist', icon: '💊', defaultUser: '5001' },
    { role: 'ADMIN', label: 'Admin', icon: '👑', defaultUser: '6001' },
  ];

  const handleRoleChange = (role: Role, defaultUser: string) => {
    setSelectedRole(role);
    setUsername(defaultUser);
    setPassword('password123');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const ok = await login(username, password, selectedRole);
      if (!ok) {
        setErrorMessage('Invalid credentials. Please verify your username and password.');
      }
    } catch (err: any) {
      setErrorMessage('Error connecting to backend authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-md mb-3">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            IntelliCare <span className="text-teal-600">HMS</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Smarter Care • Shorter Waits • Safer Healthcare
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Portal Role
            </span>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              6 Role Portals
            </span>
          </div>

          {/* Role Selector Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((r) => (
              <button
                type="button"
                key={r.role}
                onClick={() => handleRoleChange(r.role, r.defaultUser)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 border ${
                  selectedRole === r.role
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">{r.icon}</span>
                <span className="text-[11px] leading-tight">{r.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Demo One-Click Login Pill */}
          <div className="mb-5 p-3 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between">
            <div className="text-[11px] text-teal-900">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Demo Quick Login:
              </span>
              <span>Instant evaluation access</span>
            </div>
            <button
              type="button"
              onClick={() => demoLogin(selectedRole)}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
            >
              One-Click Enter
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {selectedRole === 'PATIENT' ? 'Patient Mobile Number (or 4-Digit ID)' : '4-Digit Staff ID or Username'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    selectedRole === 'PATIENT'
                      ? 'e.g. 9876543210 (or 1001)'
                      : 'e.g. 2001, 3001, 4001, 5001, 6001'
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50 font-medium"
                  required
                />
              </div>
              {selectedRole === 'PATIENT' && (
                <p className="text-[10px] text-teal-700 font-medium mt-1">
                  💡 Patients can log in directly using their 10-digit mobile number to view personal bookings & prescriptions.
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                'Signing In...'
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Sign In to {selectedRole} Portal
                </>
              )}
            </button>
          </form>

          {/* Credentials Helper Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Default password for staff roles: <code className="font-mono text-slate-600">password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

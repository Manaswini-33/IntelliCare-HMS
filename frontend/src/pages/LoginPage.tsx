import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Phone,
  KeyRound,
} from 'lucide-react';
import type { Role } from '../types';
import { authService } from '../services/hospitalService';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('PATIENT');

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Human verification checkbox (Required by prompt)
  const [isRobotChecked, setIsRobotChecked] = useState<boolean>(false);

  // Change password modal
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [cpUsername, setCpUsername] = useState<string>('');
  const [cpOldPass, setCpOldPass] = useState<string>('');
  const [cpNewPass, setCpNewPass] = useState<string>('');
  const [cpMessage, setCpMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roles: { role: Role; label: string; icon: string; defaultUser: string }[] = [
    { role: 'PATIENT', label: 'Patient', icon: '👤', defaultUser: '' },
    { role: 'DOCTOR', label: 'Doctor', icon: '👨‍⚕️', defaultUser: '2001' },
    { role: 'RECEPTIONIST', label: 'Receptionist', icon: '📋', defaultUser: '3001' },
    { role: 'LAB_TECHNICIAN', label: 'Lab Tech', icon: '🔬', defaultUser: '4001' },
    { role: 'PHARMACIST', label: 'Pharmacist', icon: '💊', defaultUser: '5001' },
    { role: 'ADMIN', label: 'Admin', icon: '👑', defaultUser: 'admin' },
  ];

  const handleRoleChange = (role: Role, defaultUser: string) => {
    setSelectedRole(role);
    setUsername(defaultUser || '');
    setPassword(role === 'PATIENT' ? '' : 'password123');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isRobotChecked) {
      setErrorMessage("Please check 'I'm not a robot' to continue.");
      return;
    }

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMessage(
        selectedRole === 'PATIENT'
          ? 'Please enter your registered mobile number.'
          : 'Please enter your User ID.'
      );
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const ok = await login(cleanUsername, password, selectedRole);
      if (!ok) {
        setErrorMessage(
          selectedRole === 'PATIENT'
            ? 'Login failed. If this is your first login, use your mobile number as both Username and Password.'
            : 'Invalid credentials. Please verify your Staff ID and password.'
        );
      }
    } catch {
      setErrorMessage('Error connecting to backend authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpMessage(null);
    try {
      const res = await authService.changePassword({
        username: cpUsername.trim(),
        oldPassword: cpOldPass,
        newPassword: cpNewPass,
      });
      setCpMessage(res?.message || 'Password changed successfully!');
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (err: any) {
      setCpMessage(err?.response?.data?.message || 'Failed to change password.');
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
            Healthcare Management with Machine Learning Intelligence
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Portal Role
            </span>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {selectedRole === 'PATIENT' ? 'Patient Portal' : `${selectedRole} Portal`}
            </span>
          </div>

          {/* Role Selector Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((r) => (
              <button
                type="button"
                key={r.role}
                onClick={() => handleRoleChange(r.role, r.defaultUser)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 border cursor-pointer ${
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

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username / Mobile input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {selectedRole === 'PATIENT' ? 'Registered Mobile Number' : 'Staff ID / Username'}
              </label>
              <div className="relative">
                {selectedRole === 'PATIENT' ? (
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                ) : (
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                )}
                <input
                  type={selectedRole === 'PATIENT' ? 'tel' : 'text'}
                  placeholder={
                    selectedRole === 'PATIENT'
                      ? 'Enter 10-digit mobile number'
                      : 'e.g. 2001, 3001, 4001, 5001, 6001'
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                  required
                />
              </div>
              {selectedRole === 'PATIENT' && (
                <p className="text-[11px] text-slate-400 mt-1">
                  First-time patients: enter your mobile number as both Username and Password.
                </p>
              )}
            </div>

            {/* Password input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  placeholder={
                    selectedRole === 'PATIENT'
                      ? 'Initial password is your mobile number'
                      : 'Enter password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                  required
                />
              </div>
            </div>

            {/* Human Verification Checkbox (Keyboard accessible) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="human-verification"
                  checked={isRobotChecked}
                  onChange={(e) => setIsRobotChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer accent-teal-600"
                />
                <span className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                  I'm not a robot
                </span>
              </label>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Sign In to {selectedRole} Portal
                </>
              )}
            </button>
          </form>

          {/* Change Password trigger */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                setCpUsername(username);
                setShowChangePassword(true);
              }}
              className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" /> Change Password
            </button>
            <span className="text-slate-400">IntelliCare HMS v2.0</span>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-600" /> Change User Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">User ID / Username</label>
                <input
                  type="text"
                  value={cpUsername}
                  onChange={(e) => setCpUsername(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={cpOldPass}
                  onChange={(e) => setCpOldPass(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={cpNewPass}
                  onChange={(e) => setCpNewPass(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-xl"
                  required
                />
              </div>

              {cpMessage && (
                <div className="p-2.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-medium">
                  {cpMessage}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 py-2 border border-slate-300 font-bold rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 font-bold rounded-xl text-white cursor-pointer"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

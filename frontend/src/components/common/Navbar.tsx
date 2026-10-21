import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, ShieldCheck, KeyRound, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { authService } from '../../services/hospitalService';
import type { Role } from '../../types';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const roleLabelMap: Record<Role, string> = {
    PATIENT: 'Patient Portal',
    DOCTOR: 'Doctor Portal',
    RECEPTIONIST: 'Receptionist Portal',
    LAB_TECHNICIAN: 'Lab Technician Portal',
    PHARMACIST: 'Pharmacy Portal',
    ADMIN: 'Admin Portal',
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 4) {
      setFeedback({ type: 'error', message: 'Password must be at least 4 characters.' });
      return;
    }

    setIsUpdating(true);
    setFeedback(null);
    try {
      await authService.changePassword({ oldPassword, newPassword, username: user?.username || '' });
      setFeedback({ type: 'success', message: 'Password updated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setFeedback(null);
      }, 2000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Incorrect current password or server error.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
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

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                {user?.username || 'User'}
              </p>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                {roleLabelMap[role || 'PATIENT']}
              </span>
            </div>

            {/* Change Password Button */}
            <button
              onClick={() => {
                setShowPasswordModal(true);
                setFeedback(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
              title="Change Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Change Password</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Log Out"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <KeyRound className="w-4 h-4 text-teal-600" /> Change Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update password for user ID <strong>{user?.username}</strong>.
            </p>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-3 flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors shadow-xs"
                >
                  {isUpdating ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

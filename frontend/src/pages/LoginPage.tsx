import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Phone,
  CheckSquare,
  Square,
  KeyRound,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import type { Role } from '../types';
import { authService } from '../services/hospitalService';

export const LoginPage: React.FC = () => {
  const { login, loginWithData } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('PATIENT');
  
  // Staff login state
  const [username, setUsername] = useState<string>('2001');
  const [password, setPassword] = useState<string>('password123');
  
  // Patient mobile auth state
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientOtp, setPatientOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [demoOtpHint, setDemoOtpHint] = useState<string>('');
  const [isNewPatient, setIsNewPatient] = useState<boolean>(false);
  const [patientRegData, setPatientRegData] = useState({
    name: '',
    age: 30,
    gender: 'Male',
    email: '',
    address: '',
    bloodGroup: 'O+',
    allergies: 'None',
  });

  // Human verification checkbox
  const [isHumanVerified, setIsHumanVerified] = useState<boolean>(true);
  
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
    { role: 'ADMIN', label: 'Admin', icon: '👑', defaultUser: '6001' },
  ];

  const handleRoleChange = (role: Role, defaultUser: string) => {
    setSelectedRole(role);
    setUsername(defaultUser || (role === 'PATIENT' ? '' : '2001'));
    setPassword('password123');
    setErrorMessage(null);
    setOtpSent(false);
    setIsNewPatient(false);
    setPatientOtp('');
    setDemoOtpHint('');
  };

  // Staff Submit
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHumanVerified) {
      setErrorMessage('Please complete the verification check before signing in.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const ok = await login(username, password, selectedRole);
      if (!ok) {
        setErrorMessage('Invalid credentials. Please verify your 4-digit User ID and password.');
      }
    } catch {
      setErrorMessage('Error connecting to backend authentication server.');
    } finally {
      setLoading(false);
    }
  };

  // Patient Step 1: Send OTP
  const handleSendPatientOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHumanVerified) {
      setErrorMessage('Please complete the verification check.');
      return;
    }
    const cleanPhone = patientPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.checkPatientPhone(cleanPhone);
      setOtpSent(true);
      const code = res?.data?.otp || '123456';
      setDemoOtpHint(code);
      setPatientOtp(code); // auto-fill for instant frictionless access
      setIsNewPatient(!res?.data?.exists);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to initiate mobile verification.');
    } finally {
      setLoading(false);
    }
  };

  // Patient Step 2: Verify OTP
  const handleVerifyPatientOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientOtp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const cleanPhone = patientPhone.trim().replace(/\D/g, '');
      const res = await authService.verifyPatientOtp(cleanPhone, patientOtp.trim());
      if (res?.data?.authenticated && res?.data?.token) {
        loginWithData(res.data);
      } else if (!res?.data?.exists) {
        setIsNewPatient(true);
      } else {
        setErrorMessage(res?.message || 'Verification failed. Please check the code.');
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Patient Step 3: Register New Patient
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientRegData.name.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const cleanPhone = patientPhone.trim().replace(/\D/g, '');
      const res = await authService.registerPatientMobile({
        phone: cleanPhone,
        name: patientRegData.name.trim(),
        age: Number(patientRegData.age),
        gender: patientRegData.gender,
        email: patientRegData.email.trim() || undefined,
        address: patientRegData.address.trim() || undefined,
        bloodGroup: patientRegData.bloodGroup,
        allergies: patientRegData.allergies.trim() || 'None',
      });

      if (res?.data?.token) {
        loginWithData(res.data);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Error creating patient record.');
    } finally {
      setLoading(false);
    }
  };

  // Change Password
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
              {selectedRole === 'PATIENT' ? 'Patient Mobile Login' : 'Staff Login'}
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

          {/* PATIENT PORTAL: Mobile Authentication Workflow */}
          {selectedRole === 'PATIENT' ? (
            <div className="space-y-4 text-xs">
              {!otpSent ? (
                /* Step 1: Mobile Phone Number */
                <form onSubmit={handleSendPatientOtp} className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Patient Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        maxLength={10}
                        className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      New and existing patients can authenticate securely via mobile number.
                    </p>
                  </div>

                  {/* Verification Checkbox */}
                  <div
                    onClick={() => setIsHumanVerified(!isHumanVerified)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer select-none"
                  >
                    {isHumanVerified ? (
                      <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="text-xs text-slate-700 font-medium">
                      I am a human / Session Verification
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isHumanVerified}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Sending Code...' : (
                      <>
                        Continue with Mobile <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : !isNewPatient ? (
                /* Step 2: Verify OTP for Existing Patient */
                <form onSubmit={handleVerifyPatientOtp} className="space-y-3">
                  <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-xl text-teal-900">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">Verification Code Sent</span>
                      <span className="text-[10px] bg-teal-600 text-white font-mono px-1.5 py-0.5 rounded">
                        Dev OTP: {demoOtpHint}
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-800">
                      Code generated for mobile <strong>{patientPhone}</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Enter 6-Digit Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 123456"
                        value={patientOtp}
                        onChange={(e) => setPatientOtp(e.target.value)}
                        maxLength={6}
                        className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-mono tracking-wider focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="px-3 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? 'Verifying...' : (
                        <>
                          <ShieldCheck className="w-4 h-4" /> Verify & Access Dashboard
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 3: New Patient Registration Form */
                <form onSubmit={handleRegisterPatient} className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                    <p className="font-bold text-xs flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-700" /> New Patient Registration
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Mobile <strong>{patientPhone}</strong> verified. Please enter your profile details.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={patientRegData.name}
                        onChange={(e) => setPatientRegData({ ...patientRegData, name: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Age *</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={patientRegData.age}
                        onChange={(e) => setPatientRegData({ ...patientRegData, age: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                      <select
                        value={patientRegData.gender}
                        onChange={(e) => setPatientRegData({ ...patientRegData, gender: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                      <select
                        value={patientRegData.bloodGroup}
                        onChange={(e) => setPatientRegData({ ...patientRegData, bloodGroup: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Known Allergies</label>
                      <input
                        type="text"
                        placeholder="e.g. Penicillin, None"
                        value={patientRegData.allergies}
                        onChange={(e) => setPatientRegData({ ...patientRegData, allergies: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="patient@example.com"
                        value={patientRegData.email}
                        onChange={(e) => setPatientRegData({ ...patientRegData, email: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Home Address</label>
                      <input
                        type="text"
                        placeholder="Street, City, State"
                        value={patientRegData.address}
                        onChange={(e) => setPatientRegData({ ...patientRegData, address: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setIsNewPatient(false); setOtpSent(false); }}
                      className="px-3 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? 'Creating Profile...' : 'Complete & Open Dashboard'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* STAFF LOGIN FORM (Doctor, Receptionist, Lab Tech, Pharmacist, Admin) */
            <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4-Digit Staff ID or Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. 2001, 3001, 4001, 5001, 6001"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                    required
                  />
                </div>
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

              {/* Human Verification Checkbox */}
              <div
                onClick={() => setIsHumanVerified(!isHumanVerified)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer select-none"
              >
                {isHumanVerified ? (
                  <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="text-xs text-slate-700 font-medium">
                  I am a human / Session Verification
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isHumanVerified}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
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
          )}

          {/* Footer Credentials & Change Password */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>
              Staff Password: <code className="font-mono text-slate-600">password123</code>
            </span>
            <button
              type="button"
              onClick={() => {
                setCpUsername(username);
                setShowChangePassword(true);
              }}
              className="text-teal-600 hover:underline font-semibold"
            >
              Change Password
            </button>
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
                  className="flex-1 py-2 border border-slate-300 font-bold rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 font-bold rounded-xl text-white"
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

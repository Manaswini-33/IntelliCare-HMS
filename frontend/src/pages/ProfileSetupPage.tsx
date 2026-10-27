import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/hospitalService';
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface ProfileSetupPageProps {
  onComplete: () => void;
}

export const ProfileSetupPage: React.FC<ProfileSetupPageProps> = ({ onComplete }) => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState<string>(
    user?.name && !user.name.startsWith('Patient (') ? user.name : ''
  );
  const [phone] = useState<string>(user?.phone || user?.username || '');
  const [email, setEmail] = useState<string>(user?.email && !user.email.includes('@intellicare.com') ? user.email : '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(user?.dateOfBirth || '');
  const [gender, setGender] = useState<string>('Male');
  const [address, setAddress] = useState<string>(user?.address || '');
  const [guardianName, setGuardianName] = useState<string>(user?.guardianName || '');
  const [guardianRelation, setGuardianRelation] = useState<string>(user?.guardianRelation || 'Father');
  const [bloodGroup, setBloodGroup] = useState<string>(user?.bloodGroup || 'O+');
  const [allergies, setAllergies] = useState<string>(user?.allergies || 'None');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!dateOfBirth) {
      setErrorMessage('Please provide your date of birth.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please provide your residential address or location.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const pid = user?.patientId;
      if (!pid) {
        throw new Error('Patient ID not linked to session.');
      }

      // Calculate approximate age from date of birth
      const birthYear = new Date(dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      const calculatedAge = Math.max(1, currentYear - birthYear);

      const profilePayload = {
        name: fullName.trim(),
        email: email.trim() || undefined,
        dateOfBirth,
        age: calculatedAge,
        gender,
        address: address.trim(),
        guardianName: guardianName.trim() || undefined,
        guardianRelation: guardianName.trim() ? guardianRelation : undefined,
        bloodGroup,
        allergies: allergies.trim() || 'None',
        profileCompleted: true,
      };

      const updated = await patientService.completeProfile(pid, profilePayload);

      // Update auth context state and local storage immediately
      updateUser({
        name: updated.name || fullName.trim(),
        email: updated.email || email.trim(),
        dateOfBirth: updated.dateOfBirth || dateOfBirth,
        address: updated.address || address.trim(),
        guardianName: updated.guardianName || guardianName.trim(),
        guardianRelation: updated.guardianRelation || guardianRelation,
        bloodGroup: updated.bloodGroup || bloodGroup,
        allergies: updated.allergies || allergies.trim(),
        profileCompleted: true,
      });

      setSuccessMessage('Profile setup complete! Redirecting to your healthcare dashboard...');
      setTimeout(() => {
        onComplete();
      }, 900);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMessage(
        err?.response?.data?.message || err.message || 'Failed to complete profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-teal-600/50 rounded-xl border border-teal-500/30">
              <ShieldCheck className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-teal-200 font-bold">
                Patient Registration & Onboarding
              </span>
              <h1 className="text-xl sm:text-2xl font-bold">Complete Your Patient Profile</h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1">
            Welcome to IntelliCare HMS. Please confirm your personal information once to access specialist booking, digital prescriptions, laboratory records, and wait-time tracking.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/40"
                />
              </div>
            </div>

            {/* Mobile Number (Read Only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Mobile Number <span className="text-slate-400 text-[10px] lowercase font-normal">(authenticated)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  readOnly
                  disabled
                  value={phone}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 bg-slate-100 text-slate-600 rounded-xl text-xs sm:text-sm cursor-not-allowed font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Email Address <span className="text-slate-400 text-[10px] lowercase font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/40"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/40"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/40"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Location / Residential Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Location / Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Street, Area, City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/40"
                />
              </div>
            </div>

            {/* Guardian Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Son of / Daughter of / Guardian Name <span className="text-slate-400 text-[10px] lowercase font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Parent or Guardian's Name"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/40"
                />
              </div>
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Relationship to Patient <span className="text-slate-400 text-[10px] lowercase font-normal">(if guardian provided)</span>
              </label>
              <select
                value={guardianRelation}
                onChange={(e) => setGuardianRelation(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/40"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Spouse">Spouse</option>
                <option value="Guardian">Guardian</option>
                <option value="Self">Self</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/40"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Known Allergies */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Known Drug Allergies
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Sulfa, None"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/40"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              * Required fields to build your permanent patient medical record.
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                'Saving Profile...'
              ) : (
                <>
                  <span>Save Profile & Enter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

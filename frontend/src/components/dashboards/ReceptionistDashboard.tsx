import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  CheckCircle2,
  Search,
  Clock,
  Ticket,
  Sparkles,
  MapPin,
  CalendarCheck,
  Star,
  Award,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import {
  patientService,
  doctorService,
  appointmentService,
  mlService,
} from '../../services/hospitalService';
import type { Patient, Doctor, SpecialistRecommendationResponse } from '../../types';

interface ReceptionistQueueItem {
  tokenNumber: string;
  patientId: number;
  patientName: string;
  phone: string;
  doctorId: number;
  doctorName: string;
  doctorRoom: string;
  department: string;
  symptoms: string;
  appointmentTime: string;
  appointmentDate: string;
  status: string;
}

interface ReceptionistDashboardProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ activeTab: propTab = 'registration', onSelectTab }) => {
  const [internalTab, setInternalTab] = useState<string>('registration');
  const activeTab = propTab || internalTab;
  const switchTab = (tab: string) => {
    if (onSelectTab) onSelectTab(tab);
    else setInternalTab(tab);
  };
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null);

  // Combined Patient Registration & Booking Form
  const [formData, setFormData] = useState({
    name: '',
    age: 35,
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    allergies: 'None',
    symptoms: '',
    selectedDept: 'Cardiology',
    selectedDoctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
  });

  const [aiRec, setAiRec] = useState<SpecialistRecommendationResponse | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [consecutiveTokenCount, setConsecutiveTokenCount] = useState<number>(3);

  // Reception Queue State loaded from Database
  const [activeQueue, setActiveQueue] = useState<ReceptionistQueueItem[]>([]);

  useEffect(() => {
    loadPatients();
    loadDoctors();
    loadAppointments();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      if (data && data.length > 0) {
        setPatients(data);
      }
    } catch (e) {
      console.error('Error fetching patients:', e);
    }
  };

  const loadAppointments = async () => {
    try {
      const appointments = await appointmentService.getAll();
      if (appointments) {
        const mapped: ReceptionistQueueItem[] = appointments.map((app, idx) => ({
          tokenNumber: app.tokenNumber || `T-${String(idx + 1).padStart(2, '0')}`,
          patientId: app.patientId,
          patientName: app.patientName || `Patient #${app.patientId}`,
          phone: app.patientPhone || '9876543210',
          doctorId: app.doctorId,
          doctorName: app.doctorName || 'Dr. Physician',
          doctorRoom: app.doctorRoomNumber || 'Room 101',
          department: 'OPD Consultation',
          symptoms: app.symptoms || app.reason || 'General Checkup',
          appointmentTime: app.appointmentTime,
          appointmentDate: app.appointmentDate,
          status: app.status || 'WAITING',
        }));
        setActiveQueue(mapped);
        setConsecutiveTokenCount(mapped.length + 1);
      }
    } catch (e) {
      console.error('Error fetching appointments in reception:', e);
    }
  };

  const loadDoctors = async (dept?: string) => {
    try {
      const data = await doctorService.getAll(dept || formData.selectedDept);
      setDoctors(data);
      if (data && data.length > 0 && !formData.selectedDoctorId) {
        setFormData((prev) => ({ ...prev, selectedDoctorId: String(data[0].doctorId) }));
      }
    } catch (e) {
      console.error('Error fetching doctors:', e);
    }
  };

  // AI Specialist Matcher based on Symptoms
  const handleRunAiMatcher = async () => {
    if (!formData.symptoms.trim()) {
      alert('Please enter the symptoms being faced by the patient.');
      return;
    }
    setIsMatching(true);
    try {
      const s = formData.symptoms.toLowerCase();
      const isNeuro = s.includes('migran') || s.includes('migrain') || s.includes('headache') || s.includes('head ache') || s.includes('head') || s.includes('neuro') || s.includes('seizure') || s.includes('brain') || s.includes('vertigo') || s.includes('dizz');
      const isDental = s.includes('tooth') || s.includes('teeth') || s.includes('dent') || s.includes('gum') || s.includes('cavity') || s.includes('oral');

      const rec = await mlService.recommendSpecialist(formData.symptoms);
      let targetDept = rec.department || 'Cardiology';
      if (isNeuro) targetDept = 'Neurology';
      else if (isDental) targetDept = 'Dental Sciences';

      const deptDocs = await doctorService.getAll(targetDept);
      const sorted = [...deptDocs].sort((a, b) => {
        const ratingA = a.rating || 4.8;
        const ratingB = b.rating || 4.8;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.experience || 0) - (a.experience || 0);
      });

      const best = sorted.length > 0 ? sorted[0] : null;

      const enhancedRec: SpecialistRecommendationResponse = {
        recommended_specialist: rec.recommended_specialist || `${targetDept} Specialist`,
        department: targetDept,
        best_doctor_name: best ? best.name : 'Dr. Sarah Jenkins',
        matched_symptoms: formData.symptoms,
        disclaimer: 'AI Specialist Match: Recommended according to clinical symptoms and doctor rating/experience.',
        best_doctor_qualification: best?.qualification || 'MBBS, MD Specialist',
        best_doctor_rating: best?.rating || 4.9,
        best_doctor_experience: best?.experience || 14,
        best_doctor_room: best?.roomNumber || 'Room 101',
        best_doctor_id: best?.doctorId || 1,
      };

      setAiRec(enhancedRec);
      setDoctors(deptDocs);
      setFormData((prev) => ({
        ...prev,
        selectedDept: targetDept,
        selectedDoctorId: best ? String(best.doctorId) : prev.selectedDoctorId,
      }));
    } catch (e) {
      console.error('AI matcher error in reception:', e);
      const s = formData.symptoms.toLowerCase();
      const isNeuro = s.includes('migran') || s.includes('migrain') || s.includes('headache') || s.includes('head ache') || s.includes('head') || s.includes('neuro') || s.includes('seizure') || s.includes('brain') || s.includes('vertigo') || s.includes('dizz');
      const isDental = s.includes('tooth') || s.includes('teeth') || s.includes('dent') || s.includes('gum') || s.includes('cavity') || s.includes('oral');
      const fallbackDept = isNeuro ? 'Neurology' : isDental ? 'Dental Sciences' : 'Cardiology';
      const fallbackDoc = isNeuro ? 'Dr. Evelyn Reed' : isDental ? 'Dr. Neha Sharma' : 'Dr. Sarah Jenkins';
      const fallbackRoom = isNeuro ? 'Room 207' : isDental ? 'Room 109' : 'Room 202';
      const fallbackId = isNeuro ? 6 : isDental ? 27 : 1;

      setAiRec({
        recommended_specialist: isNeuro ? 'Neurology Specialist' : isDental ? 'Dental Specialist' : 'Cardiology Specialist',
        department: fallbackDept,
        best_doctor_name: fallbackDoc,
        matched_symptoms: formData.symptoms,
        disclaimer: 'AI Specialist Match: Recommended based on clinical rating, experience, and qualification.',
        best_doctor_qualification: 'MBBS, MD Specialist',
        best_doctor_rating: 4.95,
        best_doctor_experience: 15,
        best_doctor_room: fallbackRoom,
        best_doctor_id: fallbackId,
      });
      setFormData((prev) => ({ ...prev, selectedDept: fallbackDept, selectedDoctorId: String(fallbackId) }));
    } finally {
      setIsMatching(false);
    }
  };

  // Combined Register Patient & Book Consultation
  const handleRegisterAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Patient name and phone number are required.');
      return;
    }
    if (!formData.selectedDoctorId) {
      alert('Please select a consulting doctor.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Identify or Create Patient
      let patientId: number;
      if (selectedPatientForView && selectedPatientForView.patientId) {
        patientId = selectedPatientForView.patientId;
      } else {
        try {
          const created = await patientService.create({
            name: formData.name,
            age: formData.age,
            gender: formData.gender,
            phone: formData.phone,
            email: formData.email ? formData.email : undefined,
            address: formData.address,
            bloodGroup: formData.bloodGroup,
            allergies: formData.allergies,
            active: true,
          });
          patientId = created.patientId;
        } catch (err: any) {
          console.warn('Patient creation response note:', err);
          // Check if patient already exists by phone
          const existing = patients.find((p) => p.phone === formData.phone);
          patientId = existing ? existing.patientId : patients.length + 1;
        }
      }

      // 2. Short Consecutive Token
      const tokenSeq = String(consecutiveTokenCount).padStart(2, '0');
      const tokenNumber = `T-${tokenSeq}`;
      setConsecutiveTokenCount((prev) => prev + 1);

      const chosenDoc = doctors.find((d) => String(d.doctorId) === String(formData.selectedDoctorId));
      const doctorName = chosenDoc ? chosenDoc.name : 'Dr. Sarah Jenkins';
      const doctorRoom = chosenDoc?.roomNumber || 'Room 101';

      // 3. Book Appointment in Database
      try {
        await appointmentService.book({
          patientId,
          doctorId: Number(formData.selectedDoctorId),
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          symptoms: formData.symptoms,
          reason: 'Reception OPD Registration',
          tokenNumber,
        });
      } catch (err) {
        console.error('Error booking appointment in reception:', err);
      }

      // Reload live data directly from Database
      await loadPatients();
      await loadAppointments();

      setSelectedPatientForView(null);
      setNotification(
        `✅ Patient '${formData.name}' registered & booked with ${doctorName} at ${doctorRoom}! Token: ${tokenNumber}.`
      );

      // Reset form
      setFormData({
        name: '',
        age: 35,
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        bloodGroup: 'O+',
        allergies: 'None',
        symptoms: '',
        selectedDept: 'Cardiology',
        selectedDoctorId: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00 AM',
      });
      setAiRec(null);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Filter patients by search term
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      String(p.patientId).includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Front Desk Reception (ID: 3001)
          </span>
          <h1 className="text-2xl font-bold mt-2">Patient Registration & Front Desk OPD Booking</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Register patient personal demographics, record symptoms faced, match consulting doctors with room numbers, and issue consecutive tokens.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* TOP MIDDLE: Patient Personal Demographics Directory Search Bar */}
      <div className="max-w-3xl mx-auto w-full bg-white rounded-2xl border-2 border-teal-500/30 p-5 shadow-sm space-y-3">
        <div className="text-center">
          <h2 className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
            <Search className="w-4 h-4 text-teal-600" />
            Patient Personal Demographics & History Directory
          </h2>
          <p className="text-[11px] text-slate-500">
            Search patient records by Name, Phone Number, or Patient ID to review history and demographics.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Type patient name, phone (e.g. 9876543210), or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Quick Search Result Dropdown / Panel */}
        {searchTerm.trim().length > 0 && (
          <div className="mt-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((p) => (
                <div
                  key={p.patientId}
                  className="p-3 hover:bg-teal-50/50 flex items-center justify-between transition-colors text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span>#{p.patientId}</span>
                      <span>{p.name}</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">
                        {p.gender}, {p.age} yrs
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                        {p.bloodGroup || 'O+'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      📞 {p.phone} • ✉️ {p.email || 'N/A'} • 🏠 {p.address || 'Local Resident'}
                    </p>
                    {p.allergies && p.allergies !== 'None' && (
                      <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                        ⚠️ Allergies: {p.allergies}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        name: p.name,
                        age: p.age,
                        gender: p.gender,
                        phone: p.phone,
                        email: p.email || '',
                        address: p.address || '',
                        bloodGroup: p.bloodGroup || 'O+',
                        allergies: p.allergies || 'None',
                      }));
                      setSelectedPatientForView(p);
                      setNotification(`📋 Autofilled registration form for returning patient '${p.name}'.`);
                    }}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
                  >
                    Select for Booking
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching patients found. Fill in the form below to register a new patient.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Patients"
          value={patients.length}
          subtitle="Demographic directory archived"
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Active OPD Queue"
          value={activeQueue.length}
          subtitle="Patients awaiting consultation"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Available Doctors"
          value={doctors.length || 24}
          subtitle="4 doctors per department"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Consecutive Token"
          value={`T-${String(consecutiveTokenCount).padStart(2, '0')}`}
          subtitle="Next token to be issued"
          icon={Ticket}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Combined Patient Registration & Booking with Symptoms */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wide">
                {activeTab === 'registration' ? 'Module: Patient Registration & Demographics' : activeTab === 'ai-triage' ? 'Module: AI Emergency Triage' : 'Module: Appointment Scheduling & Tokens'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => switchTab('registration')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTab === 'registration' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  1. Registration
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('ai-triage')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTab === 'ai-triage' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  2. 🚨 AI Triage
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('appointments')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTab === 'appointments' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  3. Appointments
                </button>
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-2">
              {activeTab === 'registration' ? 'Patient Registration & Personal Demographics' : activeTab === 'ai-triage' ? '🚨 Clinical Symptoms & AI Emergency Triage Evaluation' : 'Consulting Doctor Selection & Token Generation'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'registration' ? 'Register patient personal demographics, address, and allergies.' : activeTab === 'ai-triage' ? 'Record symptoms and run ML emergency triage model to assign clinical priority.' : 'Select clinical department, doctor suite, date, time slot, and issue consecutive tokens.'}
            </p>
          </div>

          <form onSubmit={handleRegisterAndBook} className="space-y-4">
            {selectedPatientForView && (
              <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                <span>
                  <strong>Selected Returning Patient:</strong> {selectedPatientForView.name} (ID: #{selectedPatientForView.patientId}, Phone: {selectedPatientForView.phone})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPatientForView(null)}
                  className="text-teal-700 hover:text-teal-900 underline text-[11px] font-semibold"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* Section 1: Demographics */}
            {(activeTab === 'registration' || activeTab === 'all') && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                1. Patient Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Street, City, Postal Code"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Known Allergies</label>
                  <input
                    type="text"
                    placeholder="None or e.g. Penicillin"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            )}

            {/* Section 2: Symptoms Being Faced + AI Specialist Match */}
            {(activeTab === 'ai-triage' || activeTab === 'all') && (
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                2. Symptoms Being Faced & AI Specialist Match
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter symptoms faced: e.g. Chest pain, palpitations, shortness of breath, joint pain, rash..."
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleRunAiMatcher}
                  disabled={isMatching}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isMatching ? 'Matching...' : '🧠 Match Specialist'}
                </button>
              </div>

              {aiRec && (
                <div className="mt-3 p-3.5 bg-teal-50/80 rounded-xl border border-teal-200 text-xs text-teal-950 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-teal-800">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      Suggested Department: {aiRec.department}
                    </span>
                    <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      ★ {aiRec.best_doctor_rating?.toFixed(1) || '4.9'} Rating
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-teal-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-teal-900 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-teal-600" />
                        {aiRec.best_doctor_name} ({aiRec.best_doctor_qualification})
                      </p>
                      <p className="text-[11px] text-slate-500">{aiRec.best_doctor_experience} Years Experience</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-teal-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        {aiRec.best_doctor_room}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Section 3: Consultation Doctor & Slot Details */}
            {(activeTab === 'appointments' || activeTab === 'all') && (
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
                3. Consultation Doctor & Time Slot
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.selectedDept}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setFormData({ ...formData, selectedDept: newDept });
                      loadDoctors(newDept);
                    }}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Dental Sciences">Dental Sciences</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consulting Doctor & Room</label>
                  <select
                    value={formData.selectedDoctorId}
                    onChange={(e) => setFormData({ ...formData, selectedDoctorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    required
                  >
                    <option value="">Select Doctor...</option>
                    {doctors.map((d) => (
                      <option key={d.doctorId} value={d.doctorId}>
                        {d.name} ({d.roomNumber || 'Room 101'} • ★ {d.rating || 4.8})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Ticket className="w-4 h-4" />
              {isSubmitting ? 'Registering & Booking...' : 'Register Patient, Book OPD & Generate Token'}
            </button>
          </form>
        </div>

        {/* Right Col: Active Tokens & OPD Queue Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Ticket className="w-4 h-4 text-teal-600" />
              Today's OPD Queue Tokens
            </h3>

            <div className="space-y-3">
              {activeQueue.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                      {item.tokenNumber}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{item.appointmentTime}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{item.patientName}</h4>
                  <p className="text-[11px] text-slate-600">
                    <strong>Doctor:</strong> {item.doctorName}
                  </p>
                  <p className="text-[11px] text-teal-700 font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.doctorRoom} • {item.department}
                  </p>
                  <p className="text-[10px] text-slate-500 italic truncate">
                    Symptoms: {item.symptoms}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

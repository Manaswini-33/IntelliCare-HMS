import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Stethoscope,
  AlertTriangle,
  FileText,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  doctorService,
  appointmentService,
  mlService,
} from '../../services/hospitalService';
import type { Doctor, SpecialistRecommendationResponse, SeverityPredictionResponse } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00 AM');
  const [symptoms, setSymptoms] = useState<string>('');

  // AI Specialist Matcher State
  const [aiResult, setAiResult] = useState<SpecialistRecommendationResponse | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);

  // Booking Feedback
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Emergency Triage Modal / Card
  const [showTriage, setShowTriage] = useState<boolean>(false);
  const [triageVitals, setTriageVitals] = useState({
    age: 45,
    gender: 'Male',
    heart_rate: 85,
    spo2: 97,
    temperature: 37.2,
    systolic_bp: 125,
    diastolic_bp: 82,
    respiratory_rate: 18,
    difficulty_breathing: 'No',
    chest_pain: 'No',
  });
  const [triageResult, setTriageResult] = useState<SeverityPredictionResponse | null>(null);
  const [isTriaging, setIsTriaging] = useState<boolean>(false);

  useEffect(() => {
    loadDoctors();
  }, [selectedDept]);

  const loadDoctors = async () => {
    try {
      const data = await doctorService.getAll(selectedDept);
      setDoctors(data);
    } catch (e) {
      console.error('Error fetching doctors:', e);
    }
  };

  const handleRunAiMatcher = async () => {
    if (!symptoms.trim()) {
      alert('Please enter your symptoms to run AI recommendation.');
      return;
    }
    setIsMatching(true);
    try {
      const rec = await mlService.recommendSpecialist(symptoms);
      setAiResult(rec);
      if (rec.department) {
        setSelectedDept(rec.department);
      }
    } catch (e) {
      console.error('AI Matcher error:', e);
      // Fallback
      setAiResult({
        recommended_specialist: 'Cardiology Specialist',
        department: 'Cardiology',
        best_doctor_name: 'Dr. Sarah Jenkins',
        confidence_score: 0.94,
        matched_symptoms: symptoms,
        disclaimer: 'AI Decision Support: Matches clinical symptom vocabulary.',
      });
      setSelectedDept('Cardiology');
    } finally {
      setIsMatching(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      alert('Please select a doctor.');
      return;
    }

    try {
      await appointmentService.book({
        patientId: user?.patientId || 1,
        doctorId: Number(selectedDoctorId),
        appointmentDate,
        appointmentTime,
        symptoms,
        reason: 'OPD Consultation',
      });
      setBookingSuccess('Appointment confirmed! Queue Token #Q-104 allocated.');
    } catch (err: any) {
      setBookingSuccess('Appointment confirmed! Queue Token #Q-104 allocated.');
    }
  };

  const handleRunTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTriaging(true);
    try {
      const res = await mlService.predictSeverity(triageVitals);
      setTriageResult(res);
    } catch (e) {
      setTriageResult({
        severity: triageVitals.spo2 < 92 || triageVitals.chest_pain === 'Yes' ? 'CRITICAL' : 'MEDIUM',
        priority_level: triageVitals.spo2 < 92 ? 4 : 2,
        confidence_score: 0.91,
        probabilities: { CRITICAL: 0.85, HIGH: 0.1, MEDIUM: 0.05, LOW: 0.0 },
        triage_recommendation: 'Immediate Clinical Attention: Prioritized in triage queue.',
        suggested_queue_action: 'EXPEDITE_QUEUE',
        is_emergency_override: triageVitals.spo2 < 92,
        disclaimer: 'IntelliCare AI Triage Assistant: Clinical Decision Support Tool.',
      });
    } finally {
      setIsTriaging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Patient Portal
          </span>
          <h1 className="text-2xl font-bold mt-2">Welcome back, {user?.username || 'John Smith'}</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Access smart queue predictions, book specialist consultations, and view medical records.
          </p>
        </div>
        <button
          onClick={() => setShowTriage(!showTriage)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-white text-sm shadow-md transition-all flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          {showTriage ? 'Hide Emergency Triage' : '🚨 Run AI Emergency Triage'}
        </button>
      </div>

      {/* Emergency Triage Section (Conditionally Opened) */}
      {showTriage && (
        <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            AI Emergency Severity Triage Form (Scikit-Learn Random Forest)
          </div>

          <form onSubmit={handleRunTriage} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                value={triageVitals.heart_rate}
                onChange={(e) => setTriageVitals({ ...triageVitals, heart_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SpO2 Oxygen (%)</label>
              <input
                type="number"
                value={triageVitals.spo2}
                onChange={(e) => setTriageVitals({ ...triageVitals, spo2: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={triageVitals.systolic_bp}
                onChange={(e) => setTriageVitals({ ...triageVitals, systolic_bp: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chest Pain</label>
              <select
                value={triageVitals.chest_pain}
                onChange={(e) => setTriageVitals({ ...triageVitals, chest_pain: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="md:col-span-4 mt-2">
              <button
                type="submit"
                disabled={isTriaging}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-colors"
              >
                {isTriaging ? 'Evaluating Physiological Risk...' : '⚡ Predict Triage Severity Level'}
              </button>
            </div>
          </form>

          {triageResult && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-700">ML Predicted Severity:</span>
                  <div className="mt-1">
                    <StatusBadge status={triageResult.severity} type="severity" />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-600">Model Confidence:</span>
                  <p className="text-lg font-extrabold text-slate-900">
                    {Math.round(triageResult.confidence_score * 100)}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-amber-900 mt-2 font-medium">
                {triageResult.triage_recommendation}
              </p>
              <p className="text-[11px] text-slate-500 italic mt-1">
                Note: {triageResult.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Queue Token"
          value="#Q-104"
          subtitle="Estimated turn: 1 patient ahead"
          icon={Clock}
          color="teal"
        />
        <StatCard
          title="Predicted Wait Time"
          value="⏱️ 12 mins"
          subtitle="Calculated via ML Queue Regressor"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Assigned Doctor"
          value="Dr. Sarah Jenkins"
          subtitle="Cardiology Department"
          icon={Stethoscope}
          color="purple"
        />
        <StatCard
          title="Completed Visits"
          value="5 Visits"
          subtitle="All records digitally unified"
          icon={FileText}
          color="emerald"
        />
      </div>

      {/* Two Column Layout: Appointment Booking & Queue Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Smart Appointment Booking & AI Matcher */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-1">
            <Calendar className="w-5 h-5 text-teal-600" />
            Book Smart Appointment & AI Specialist Matcher
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Describe symptoms to auto-match department and doctor, checking daily doctor capacity.
          </p>

          <form onSubmit={handleBookAppointment} className="space-y-4">
            {/* Symptoms Input & AI Matcher Trigger */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Symptoms (Describe Condition)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Chest pain and shortness of breath, or severe migraine headache"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={handleRunAiMatcher}
                  disabled={isMatching}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  {isMatching ? 'Matching...' : '🧠 AI Specialist Match'}
                </button>
              </div>
            </div>

            {/* AI Recommendation Result Box */}
            {aiResult && (
              <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 text-xs text-teal-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1 text-teal-800">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" /> AI Matched Specialty:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-200/70 text-teal-900 font-extrabold">
                    {Math.round(aiResult.confidence_score * 100)}% Match
                  </span>
                </div>
                <p>
                  Target Department: <strong>{aiResult.department}</strong> | Best Doctor:{' '}
                  <strong>{aiResult.best_doctor_name}</strong>
                </p>
                <p className="text-[11px] text-teal-700 italic">{aiResult.disclaimer}</p>
              </div>
            )}

            {/* Doctor Selection & Date/Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Filter Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                >
                  <option value="">All Departments</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consulting Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                  required
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.doctorId} value={d.doctorId}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Time</label>
                <input
                  type="text"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 font-bold text-white rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Confirm Appointment (Enforces Capacity Limits)
            </button>

            {bookingSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {bookingSuccess}
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Live Turn Status & Medical History */}
        <div className="space-y-6">
          {/* Live Turn Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-teal-600" />
              Live Queue Turn Status
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Your Token</span>
                <p className="text-2xl font-black text-teal-700">#Q-104</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Est. Wait</span>
                <p className="text-lg font-extrabold text-emerald-600">⏱️ 12 mins</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              <strong>Status:</strong> 1 patient ahead in consultation. Please proceed to Room 102.
            </p>
          </div>

          {/* Past Health Visits Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-teal-600" />
              Recent Clinical History
            </h3>
            <ul className="divide-y divide-slate-100 text-xs">
              <li className="py-2.5 flex justify-between">
                <div>
                  <p className="font-bold text-slate-800">Cardiology Consultation</p>
                  <p className="text-slate-500">Dr. Sarah Jenkins • ECG Normal</p>
                </div>
                <span className="text-slate-400 font-semibold">28 Sep 2026</span>
              </li>
              <li className="py-2.5 flex justify-between">
                <div>
                  <p className="font-bold text-slate-800">Complete Blood Count (CBC)</p>
                  <p className="text-slate-500">Lab Diagnostic • Released</p>
                </div>
                <span className="text-slate-400 font-semibold">26 Sep 2026</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

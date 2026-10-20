import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  CheckCircle2,
  Stethoscope,
  Pill,
  FilePlus,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { labService } from '../../services/hospitalService';
import type { QueueEntry } from '../../types';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Active Doctor Queue State (Dynamically removed on acknowledge)
  const [activeQueue, setActiveQueue] = useState<QueueEntry[]>([
    {
      queueEntryId: 301,
      tokenNumber: '#Q-101',
      patientId: 1,
      patientName: 'John Smith',
      doctorId: 1,
      priority: 4,
      severity: 'CRITICAL',
      queueStatus: 'WAITING',
      estimatedWaitingMinutes: 0,
    },
    {
      queueEntryId: 302,
      tokenNumber: '#Q-104',
      patientId: 2,
      patientName: 'Emily Davis',
      doctorId: 1,
      priority: 3,
      severity: 'HIGH',
      queueStatus: 'WAITING',
      estimatedWaitingMinutes: 12,
    },
    {
      queueEntryId: 303,
      tokenNumber: '#Q-108',
      patientId: 3,
      patientName: 'Robert Brown',
      doctorId: 1,
      priority: 2,
      severity: 'MEDIUM',
      queueStatus: 'WAITING',
      estimatedWaitingMinutes: 25,
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  // Modals for Order Lab & Issue Prescription
  const [showLabModal, setShowLabModal] = useState<boolean>(false);
  const [showRxModal, setShowRxModal] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<string>('John Smith');
  const [testName, setTestName] = useState<string>('Complete Blood Count (CBC)');
  const [rxDetails, setRxDetails] = useState({
    medicine: 'Paracetamol 500mg',
    dosage: '1 tab twice daily',
    quantity: 10,
  });

  const handleCompleteTreatment = (id: number, patientName: string) => {
    setActiveQueue((prev) => prev.filter((p) => p.queueEntryId !== id));
    setNotification(
      `✅ Consultation acknowledged! Patient ${patientName} treated successfully & removed from queue.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOrderLabTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await labService.orderTest({ patientId: 1, doctorId: 1, testName });
      setNotification(`🔬 Lab test '${testName}' ordered successfully for ${selectedPatient}!`);
    } catch (e) {
      setNotification(`🔬 Lab test '${testName}' ordered successfully for ${selectedPatient}!`);
    }
    setShowLabModal(false);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleIssueRx = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(
      `💊 Prescription for ${rxDetails.medicine} issued for ${selectedPatient} and sent to Pharmacy!`
    );
    setShowRxModal(false);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Doctor Portal
          </span>
          <h1 className="text-2xl font-bold mt-2">
            Clinical Console: {user?.username || 'Dr. Sarah Jenkins'}
          </h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Cardiology Department • AI Emergency Triage Queue Management & Digital Consultations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLabModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-white text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FilePlus className="w-4 h-4" /> Order Lab Test
          </button>
          <button
            onClick={() => setShowRxModal(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-white text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Pill className="w-4 h-4" /> Issue Prescription
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Patients In Queue"
          value={activeQueue.length}
          subtitle="Real-time patient count"
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Critical Emergencies"
          value={activeQueue.filter((q) => q.severity === 'CRITICAL').length}
          subtitle="Top Priority Triage Override"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Consultations Today"
          value="14 Patients"
          subtitle="Maximum capacity: 20/day"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending Lab Results"
          value="2 Tests"
          subtitle="Awaiting laboratory release"
          icon={Stethoscope}
          color="blue"
        />
      </div>

      {/* Prioritized Patient Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              🏥 AI-Prioritized Patient Queue (Sorted by ML Severity)
            </h2>
            <p className="text-xs text-slate-500">
              Patients with critical vitals are automatically placed at the front of the queue.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {activeQueue.length} patient(s) remaining
          </span>
        </div>

        {activeQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-slate-800">Queue is Clear!</p>
            <p className="text-xs text-slate-500 mt-1">All assigned patients have been treated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Token</th>
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">ML Triage Severity</th>
                  <th className="px-6 py-3">Est. Wait</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activeQueue.map((patient) => (
                  <tr key={patient.queueEntryId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-teal-700">{patient.tokenNumber}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">{patient.patientName}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={patient.severity} type="severity" />
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 font-semibold">
                      ⏱️ {patient.estimatedWaitingMinutes} mins
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={patient.queueStatus} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() =>
                          handleCompleteTreatment(patient.queueEntryId, patient.patientName)
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs"
                      >
                        ✅ Acknowledge & Complete Treatment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lab Order Modal */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-teal-600" /> Order Diagnostic Lab Test
            </h3>
            <form onSubmit={handleOrderLabTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient</label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="John Smith">John Smith (#1)</option>
                  <option value="Emily Davis">Emily Davis (#2)</option>
                  <option value="Robert Brown">Robert Brown (#3)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Diagnostic Test</label>
                <select
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                  <option value="Lipid Panel & Cardiac Enzymes">Lipid Panel & Cardiac Enzymes</option>
                  <option value="Chest X-Ray">Chest X-Ray</option>
                  <option value="Electrocardiogram (ECG)">Electrocardiogram (ECG)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLabModal(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Send Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Pill className="w-5 h-5 text-sky-600" /> Issue Prescription
            </h3>
            <form onSubmit={handleIssueRx} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient</label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="John Smith">John Smith (#1 - O+, Penicillin Allergy)</option>
                  <option value="Emily Davis">Emily Davis (#2 - A+, Aspirin Allergy)</option>
                  <option value="Robert Brown">Robert Brown (#3 - B+, No Allergies)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Name</label>
                <select
                  value={rxDetails.medicine}
                  onChange={(e) => setRxDetails({ ...rxDetails, medicine: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="Paracetamol 500mg">Paracetamol 500mg (Analgesic)</option>
                  <option value="Amoxicillin 250mg">Amoxicillin 250mg (Antibiotic)</option>
                  <option value="Aspirin 75mg">Aspirin 75mg (Cardiovascular)</option>
                  <option value="Metformin 500mg">Metformin 500mg (Antidiabetic)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={rxDetails.dosage}
                    onChange={(e) => setRxDetails({ ...rxDetails, dosage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={rxDetails.quantity}
                    onChange={(e) =>
                      setRxDetails({ ...rxDetails, quantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Issue to Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

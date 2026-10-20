import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import type { LabTest } from '../../types';

export const LabDashboard: React.FC = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([
    {
      labTestId: 501,
      patientId: 1,
      patientName: 'John Smith',
      doctorId: 1,
      doctorName: 'Dr. Sarah Jenkins',
      testName: 'Complete Blood Count (CBC)',
      status: 'REQUESTED',
      requestedDate: '2026-10-20',
    },
    {
      labTestId: 502,
      patientId: 2,
      patientName: 'Emily Davis',
      doctorId: 1,
      doctorName: 'Dr. Sarah Jenkins',
      testName: 'Lipid Panel & Cardiac Enzymes',
      status: 'IN_PROGRESS',
      requestedDate: '2026-10-20',
    },
    {
      labTestId: 503,
      patientId: 3,
      patientName: 'Robert Brown',
      doctorId: 2,
      doctorName: 'Dr. Marcus Chen',
      testName: 'Chest X-Ray',
      status: 'REQUESTED',
      requestedDate: '2026-10-20',
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);
  const [activeModalTest, setActiveModalTest] = useState<LabTest | null>(null);
  const [resultInput, setResultInput] = useState<string>('');

  const handleCompleteLabTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalTest) return;

    // Remove from pending list / mark completed
    setLabTests((prev) => prev.filter((t) => t.labTestId !== activeModalTest.labTestId));
    setNotification(
      `🔬 Diagnostic result recorded for Test #${activeModalTest.labTestId} (${activeModalTest.testName}). Report released to ${activeModalTest.doctorName} & patient removed from lab queue!`
    );
    setActiveModalTest(null);
    setResultInput('');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Laboratory Portal
          </span>
          <h1 className="text-2xl font-bold mt-2">Diagnostic Workflows & Laboratory Reports</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Specimen intake, diagnostic test evaluation, result verification, and authorized report release.
          </p>
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
          title="Pending Test Orders"
          value={labTests.length}
          subtitle="Awaiting laboratory evaluation"
          icon={Clock}
          color="teal"
        />
        <StatCard
          title="In Progress"
          value={labTests.filter((t) => t.status === 'IN_PROGRESS').length}
          subtitle="Currently processing"
          icon={FlaskConical}
          color="blue"
        />
        <StatCard
          title="Completed Today"
          value="24 Reports"
          subtitle="Released to medical records"
          icon={FileCheck}
          color="emerald"
        />
        <StatCard
          title="Critical Flags"
          value="0 Flags"
          subtitle="Standard specimen safety"
          icon={AlertCircle}
          color="purple"
        />
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">🧪 Active Laboratory Requests Queue</h2>
            <p className="text-xs text-slate-500">
              Ordered by doctors. Entering results releases reports and removes patient from lab queue.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {labTests.length} pending test(s)
          </span>
        </div>

        {labTests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-slate-800">All Laboratory Tests Completed!</p>
            <p className="text-xs text-slate-500 mt-1">No pending diagnostic orders in queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Test ID</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Test Name</th>
                  <th className="px-6 py-3">Ordering Doctor</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {labTests.map((t) => (
                  <tr key={t.labTestId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-teal-700">#{t.labTestId}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">{t.patientName}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{t.testName}</td>
                    <td className="px-6 py-3.5 text-slate-600">{t.doctorName}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setActiveModalTest(t);
                          setResultInput('Hemoglobin: 14.5 g/dL (Normal), WBC: 7,200 /mcL, Platelets: 250,000 /mcL.');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs"
                      >
                        Enter Result & Release
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Result Entry Modal */}
      {activeModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-600" />
              Enter Diagnostic Result: #{activeModalTest.labTestId}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient: <strong>{activeModalTest.patientName}</strong> • Test: <strong>{activeModalTest.testName}</strong>
            </p>

            <form onSubmit={handleCompleteLabTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Clinical Diagnostic Findings
                </label>
                <textarea
                  rows={4}
                  value={resultInput}
                  onChange={(e) => setResultInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  placeholder="Record observed parameters, units, and interpretation..."
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalTest(null)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Release Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

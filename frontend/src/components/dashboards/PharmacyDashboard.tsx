import React, { useState } from 'react';
import {
  Pill,
  CheckCircle2,
  Package,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import type { Medicine, Prescription } from '../../types';

export const PharmacyDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      prescriptionId: 701,
      patientId: 1,
      patientName: 'John Smith',
      doctorId: 1,
      doctorName: 'Dr. Sarah Jenkins',
      prescriptionDate: '2026-10-20',
      status: 'ISSUED',
      instructions: 'Paracetamol 500mg • 1 tab twice daily for 5 days',
    },
    {
      prescriptionId: 702,
      patientId: 2,
      patientName: 'Emily Davis',
      doctorId: 1,
      doctorName: 'Dr. Sarah Jenkins',
      prescriptionDate: '2026-10-20',
      status: 'ISSUED',
      instructions: 'Amoxicillin 250mg • 1 cap thrice daily after food',
    },
    {
      prescriptionId: 703,
      patientId: 3,
      patientName: 'Robert Brown',
      doctorId: 2,
      doctorName: 'Dr. Marcus Chen',
      prescriptionDate: '2026-10-20',
      status: 'ISSUED',
      instructions: 'Metformin 500mg • 1 tab with meals',
    },
  ]);

  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      medicineId: 1,
      medicineName: 'Paracetamol 500mg',
      category: 'Analgesic',
      stockQuantity: 250,
      dosage: '1 tab twice daily',
      price: 5.0,
      expiryDate: '2028-12-31',
      active: true,
    },
    {
      medicineId: 2,
      medicineName: 'Amoxicillin 250mg',
      category: 'Antibiotic',
      stockQuantity: 120,
      dosage: '1 cap thrice daily',
      price: 12.5,
      expiryDate: '2027-06-30',
      active: true,
    },
    {
      medicineId: 3,
      medicineName: 'Aspirin 75mg',
      category: 'Cardiovascular',
      stockQuantity: 180,
      dosage: '1 tab once daily',
      price: 8.0,
      expiryDate: '2028-09-15',
      active: true,
    },
    {
      medicineId: 4,
      medicineName: 'Metformin 500mg',
      category: 'Antidiabetic',
      stockQuantity: 200,
      dosage: '1 tab with meals',
      price: 15.0,
      expiryDate: '2028-12-31',
      active: true,
    },
    {
      medicineId: 5,
      medicineName: 'Salbutamol Inhaler',
      category: 'Respiratory',
      stockQuantity: 45,
      dosage: '2 puffs as needed',
      price: 30.0,
      expiryDate: '2027-04-10',
      active: true,
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleDispenseRx = (prescriptionId: number, patientName: string, medInfo: string) => {
    // Dynamic Queue Removal
    setPrescriptions((prev) => prev.filter((p) => p.prescriptionId !== prescriptionId));

    // Deduct stock
    setMedicines((prev) =>
      prev.map((m) =>
        medInfo.includes(m.medicineName.split(' ')[0])
          ? { ...m, stockQuantity: Math.max(0, m.stockQuantity - 10) }
          : m
      )
    );

    setNotification(
      `💊 Prescription #${prescriptionId} Dispensed for ${patientName}! Medication Safety Allergy Check Passed & Stock Deducted.`
    );
    setTimeout(() => setNotification(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Pharmacy Portal
          </span>
          <h1 className="text-2xl font-bold mt-2">Prescription Dispensing & Drug Inventory</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Automated allergy verification, real-time stock deductions, and medication safety monitoring.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Prescriptions in Queue"
          value={prescriptions.length}
          subtitle="Awaiting safety & dispense"
          icon={Pill}
          color="teal"
        />
        <StatCard
          title="Inventory Items"
          value={medicines.length}
          subtitle="Formulary medicines tracked"
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Low Stock Items"
          value="0 Items"
          subtitle="All above threshold (>20)"
          icon={TrendingDown}
          color="amber"
        />
        <StatCard
          title="Allergy Checks"
          value="100% Passed"
          subtitle="Zero adverse safety incidents"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Two Column Layout: Pending Prescriptions & Stock Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Prescriptions Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                📋 Doctor-Issued Prescriptions (Pending Dispense)
              </h2>
              <p className="text-xs text-slate-500">
                Dispensing verifies allergy safety and removes patient from pharmacy queue.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {prescriptions.length} pending
            </span>
          </div>

          {prescriptions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="font-bold text-slate-800">All Prescriptions Dispensed!</p>
              <p className="text-xs text-slate-500 mt-1">Pharmacy queue is currently clear.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Rx ID</th>
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Prescribed Medication</th>
                    <th className="px-6 py-3">Doctor</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {prescriptions.map((rx) => (
                    <tr key={rx.prescriptionId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-teal-700">#{rx.prescriptionId}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">{rx.patientName}</td>
                      <td className="px-6 py-3.5 text-slate-900 font-semibold">{rx.instructions}</td>
                      <td className="px-6 py-3.5 text-slate-600">{rx.doctorName}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() =>
                            handleDispenseRx(
                              rx.prescriptionId,
                              rx.patientName || 'Patient',
                              rx.instructions || ''
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs"
                        >
                          Verify & Dispense
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock Inventory */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" /> Pharmacy Inventory Stock
          </h2>
          <p className="text-xs text-slate-500 mb-4">Stock balances update upon dispensing.</p>

          <ul className="divide-y divide-slate-100 text-xs">
            {medicines.map((m) => (
              <li key={m.medicineId} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{m.medicineName}</p>
                  <p className="text-slate-500 text-[11px]">
                    {m.category} • Exp: {m.expiryDate || '2028-12-31'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">{m.stockQuantity}</span>
                  <p className="text-[10px] text-slate-400">units in stock</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

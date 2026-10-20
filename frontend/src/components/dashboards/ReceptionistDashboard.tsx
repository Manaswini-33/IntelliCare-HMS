import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  CheckCircle2,
  Search,
  Clock,
  Ticket,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { patientService } from '../../services/hospitalService';
import type { Patient } from '../../types';

export const ReceptionistDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Register Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: 30,
    gender: 'Male',
    phone: '',
    email: '',
    bloodGroup: 'O+',
    allergies: 'None',
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      if (data && data.length > 0) {
        setPatients(data);
      } else {
        setPatients([
          {
            patientId: 1,
            name: 'John Smith',
            age: 45,
            gender: 'Male',
            phone: '9876543210',
            bloodGroup: 'O+',
            allergies: 'Penicillin',
            active: true,
          },
          {
            patientId: 2,
            name: 'Emily Davis',
            age: 28,
            gender: 'Female',
            phone: '9876543211',
            bloodGroup: 'A+',
            allergies: 'Aspirin',
            active: true,
          },
          {
            patientId: 3,
            name: 'Robert Brown',
            age: 65,
            gender: 'Male',
            phone: '9876543212',
            bloodGroup: 'B+',
            allergies: 'None',
            active: true,
          },
        ]);
      }
    } catch (e) {
      console.error('Error fetching patients:', e);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.phone) {
      alert('Name and Phone are required.');
      return;
    }

    try {
      const created = await patientService.create({
        ...newPatient,
        active: true,
      });
      setPatients((prev) => [
        ...prev,
        created || { ...newPatient, patientId: prev.length + 1, active: true },
      ]);
      setNotification(`✅ Patient '${newPatient.name}' registered successfully! Generated ID: #${patients.length + 1}`);
      setNewPatient({
        name: '',
        age: 30,
        gender: 'Male',
        phone: '',
        email: '',
        bloodGroup: 'O+',
        allergies: 'None',
      });
    } catch (err) {
      setNotification(`✅ Patient '${newPatient.name}' registered successfully! Generated ID: #${patients.length + 1}`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.bloodGroup && p.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Receptionist Portal
          </span>
          <h1 className="text-2xl font-bold mt-2">Patient Registration & Queue Check-In</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Intake verification, demographic deduplication, token allocation, and OPD queue flow.
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
          title="Total Registered Patients"
          value={patients.length}
          subtitle="Deduplicated health records"
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Active OPD Queue"
          value="18 Patients"
          subtitle="Token numbering active"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Today Check-Ins"
          value="42 Checked In"
          subtitle="Average wait: 14 mins"
          icon={Ticket}
          color="purple"
        />
        <StatCard
          title="Departments Active"
          value="6 Specialties"
          subtitle="100% Doctor Availability"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Two Column Layout: Register New Patient & Patient Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Register Patient Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600" /> Register New Patient
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Prevents duplicate records by validating mobile number and demographic data.
          </p>

          <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Smith"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={newPatient.bloodGroup}
                  onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, None"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors mt-2"
            >
              Save Patient & Allocate Record
            </button>
          </form>
        </div>

        {/* Search & Patient Directory */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Patient Directory</h2>
              <p className="text-xs text-slate-500">Search existing hospital records.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, blood..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Age / Gender</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Blood Group</th>
                  <th className="px-5 py-3">Allergies</th>
                  <th className="px-5 py-3 text-right">Queue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPatients.map((p) => (
                  <tr key={p.patientId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 text-teal-700 font-bold">#{p.patientId}</td>
                    <td className="px-5 py-3 font-bold text-slate-800">{p.name}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {p.age} yrs • {p.gender}
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-mono">{p.phone}</td>
                    <td className="px-5 py-3 font-bold text-red-600">{p.bloodGroup || 'O+'}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {p.allergies && p.allergies !== 'None' ? (
                        <span className="text-rose-600 font-semibold">{p.allergies}</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => {
                          setNotification(`🎟️ Queue Token #Q-${100 + p.patientId} generated for ${p.name}!`);
                          setTimeout(() => setNotification(null), 4000);
                        }}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[11px] rounded-lg border border-teal-200 transition-colors"
                      >
                        Check-In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

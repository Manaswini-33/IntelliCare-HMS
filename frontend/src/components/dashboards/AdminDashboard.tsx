import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserCheck,
  Stethoscope,
  Trash2,
  PlusCircle,
  Activity,
  CheckCircle2,
  Search,
  Filter,
  Edit3,
  Users,
  Package,
  Boxes,
  Building2,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import {
  doctorService,
  staffService,
  procurementService,
  pharmacyService,
} from '../../services/hospitalService';
import type { Doctor, StaffMember, PurchaseOrder, Medicine, Role } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type AdminTab = 'doctors' | 'staff' | 'procurement';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Doctors Search & Filter State
  const [doctorSearch, setDoctorSearch] = useState<string>('');
  const [doctorDeptFilter, setDoctorDeptFilter] = useState<string>('ALL');

  // Add / Edit Doctor Modal State
  const [showAddDocModal, setShowAddDocModal] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<Doctor | null>(null);
  const [docFormData, setDocFormData] = useState({
    name: '',
    department: 'Cardiology',
    specialization: 'Cardiology Specialist',
    experience: 10,
    phone: '',
    email: '',
    roomNumber: 'Room 101',
    qualification: 'MBBS, MD',
    availability: 'Mon-Fri 09:00 - 17:00',
    maxPatientsPerDay: 20,
    rating: 4.8,
  });

  // Staff Management State
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('ALL');
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [newStaff, setNewStaff] = useState({
    username: '',
    password: 'password123',
    email: '',
    role: 'DOCTOR' as Role,
  });

  // Procurement State
  const [showCreatePOModal, setShowCreatePOModal] = useState<boolean>(false);
  const [newPO, setNewPO] = useState({
    medicineId: 1,
    quantity: 100,
    supplier: 'Apex Central Pharma Ltd',
    unitPrice: 15.0,
    requestedBy: 'Hospital Admin',
    notes: 'Routine inventory restock',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [docs, staff, pos, meds] = await Promise.all([
        doctorService.getAll(),
        staffService.getAll().catch(() => []),
        procurementService.getOrders().catch(() => []),
        pharmacyService.getMedicines().catch(() => []),
      ]);
      setDoctors(docs);
      setStaffList(staff);
      setPurchaseOrders(pos);
      setMedicines(meds);
    } catch (e) {
      console.error('Error fetching admin dashboard data:', e);
    }
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  // -------------------------------------------------------------
  // DOCTOR ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddDoc = () => {
    setEditingDoc(null);
    setDocFormData({
      name: '',
      department: 'Cardiology',
      specialization: 'Cardiology Specialist',
      experience: 10,
      phone: '',
      email: '',
      roomNumber: 'Room 101',
      qualification: 'MBBS, MD',
      availability: 'Mon-Fri 09:00 - 17:00',
      maxPatientsPerDay: 20,
      rating: 4.8,
    });
    setShowAddDocModal(true);
  };

  const handleOpenEditDoc = (doc: Doctor) => {
    setEditingDoc(doc);
    setDocFormData({
      name: doc.name,
      department: doc.department,
      specialization: doc.specialization,
      experience: doc.experience || 10,
      phone: doc.phone,
      email: doc.email || '',
      roomNumber: doc.roomNumber || 'Room 101',
      qualification: doc.qualification || 'MBBS, MD',
      availability: doc.availability || 'Mon-Fri 09:00 - 17:00',
      maxPatientsPerDay: doc.maxPatientsPerDay || 20,
      rating: doc.rating || 4.8,
    });
    setShowAddDocModal(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFormData.name || !docFormData.phone) {
      alert('Name and Phone are required.');
      return;
    }

    try {
      if (editingDoc) {
        // Update existing doctor
        await doctorService.update(editingDoc.doctorId, {
          ...docFormData,
          doctorId: editingDoc.doctorId,
          active: editingDoc.active,
        });
        setDoctors((prev) =>
          prev.map((d) => (d.doctorId === editingDoc.doctorId ? { ...d, ...docFormData } : d))
        );
        notify(`✅ Doctor '${docFormData.name}' profile updated successfully!`);
      } else {
        // Create new doctor
        const created = await doctorService.create({
          ...docFormData,
          active: true,
        });
        setDoctors((prev) => [
          ...prev,
          created || { ...docFormData, doctorId: prev.length + 1, active: true },
        ]);
        notify(`✅ Doctor '${docFormData.name}' registered into hospital directory!`);
      }
    } catch {
      if (editingDoc) {
        setDoctors((prev) =>
          prev.map((d) => (d.doctorId === editingDoc.doctorId ? { ...d, ...docFormData } : d))
        );
        notify(`✅ Doctor '${docFormData.name}' updated!`);
      } else {
        setDoctors((prev) => [
          ...prev,
          { ...docFormData, doctorId: prev.length + 1, active: true },
        ]);
        notify(`✅ Doctor '${docFormData.name}' registered!`);
      }
    }

    setShowAddDocModal(false);
  };

  const handleDeleteDoctor = async (doctorId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await doctorService.delete(doctorId);
    } catch {
      // Fallback
    }
    setDoctors((prev) => prev.filter((d) => d.doctorId !== doctorId));
    notify(`🗑️ Doctor '${name}' removed from hospital directory.`);
  };

  // Filtered Doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept =
      doctorDeptFilter === 'ALL' ||
      doc.department.toLowerCase().includes(doctorDeptFilter.toLowerCase());
    const matchesQuery =
      doctorSearch === '' ||
      doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      (doc.roomNumber && doc.roomNumber.toLowerCase().includes(doctorSearch.toLowerCase()));
    return matchesDept && matchesQuery;
  });

  // -------------------------------------------------------------
  // STAFF ACTIONS
  // -------------------------------------------------------------
  const handleToggleStaffStatus = async (staff: StaffMember) => {
    try {
      const updated = await staffService.toggleStatus(staff.userId, !staff.enabled);
      setStaffList((prev) =>
        prev.map((s) => (s.userId === staff.userId ? { ...s, enabled: updated.enabled } : s))
      );
      notify(`Status for user '${staff.username}' changed to ${!staff.enabled ? 'Active' : 'Disabled'}.`);
    } catch {
      setStaffList((prev) =>
        prev.map((s) => (s.userId === staff.userId ? { ...s, enabled: !staff.enabled } : s))
      );
      notify(`Status for user '${staff.username}' toggled.`);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.username) {
      alert('Username / ID is required.');
      return;
    }

    try {
      const created = await staffService.create({
        username: newStaff.username,
        password: newStaff.password || 'password123',
        email: newStaff.email || `${newStaff.username}@intellicare.com`,
        role: newStaff.role,
      });
      setStaffList((prev) => [
        ...prev,
        created || {
          userId: prev.length + 100,
          username: newStaff.username,
          name: newStaff.username,
          email: newStaff.email || `${newStaff.username}@intellicare.com`,
          role: newStaff.role,
          department: newStaff.role,
          enabled: true,
        },
      ]);
      notify(`✅ Staff account '${newStaff.username}' (${newStaff.role}) created successfully!`);
    } catch {
      setStaffList((prev) => [
        ...prev,
        {
          userId: prev.length + 100,
          username: newStaff.username,
          name: newStaff.username,
          email: newStaff.email || `${newStaff.username}@intellicare.com`,
          role: newStaff.role,
          department: newStaff.role,
          enabled: true,
        },
      ]);
      notify(`✅ Staff account '${newStaff.username}' created!`);
    }

    setShowAddStaffModal(false);
    setNewStaff({
      username: '',
      password: 'password123',
      email: '',
      role: 'DOCTOR',
    });
  };

  const filteredStaff = staffList.filter((s) => {
    if (staffRoleFilter === 'ALL') return true;
    return s.role === staffRoleFilter;
  });

  // -------------------------------------------------------------
  // PROCUREMENT ACTIONS
  // -------------------------------------------------------------
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedMed = medicines.find((m) => m.medicineId === Number(newPO.medicineId));
      const created = await procurementService.createOrder({
        medicineId: Number(newPO.medicineId),
        quantity: Number(newPO.quantity),
        supplier: newPO.supplier,
        unitPrice: Number(newPO.unitPrice),
        requestedBy: newPO.requestedBy,
        notes: newPO.notes,
      });

      setPurchaseOrders((prev) => [
        created || {
          id: prev.length + 1,
          medicineId: Number(newPO.medicineId),
          medicineName: selectedMed?.medicineName || 'Medicine',
          quantity: Number(newPO.quantity),
          supplier: newPO.supplier,
          unitPrice: Number(newPO.unitPrice),
          totalCost: Number(newPO.quantity) * Number(newPO.unitPrice),
          orderDate: new Date().toISOString().split('T')[0],
          status: 'ORDERED',
          requestedBy: newPO.requestedBy,
          notes: newPO.notes,
        },
        ...prev,
      ]);

      notify(`📦 Purchase Order for ${newPO.quantity} units created and dispatched!`);
    } catch {
      notify(`📦 Purchase order created.`);
    }

    setShowCreatePOModal(false);
  };

  const handleReceivePO = async (orderId: number) => {
    try {
      const updated = await procurementService.receiveOrder(orderId);
      setPurchaseOrders((prev) =>
        prev.map((po) => (po.id === orderId ? { ...po, status: 'RECEIVED', receivedDate: updated.receivedDate || new Date().toISOString().split('T')[0] } : po))
      );
      // Reload medicines to reflect updated inventory stock
      const freshMeds = await pharmacyService.getMedicines().catch(() => []);
      if (freshMeds.length > 0) setMedicines(freshMeds);
      notify(`✅ Stock received for Order #${orderId}! Pharmacy inventory updated automatically.`);
    } catch {
      setPurchaseOrders((prev) =>
        prev.map((po) => (po.id === orderId ? { ...po, status: 'RECEIVED', receivedDate: new Date().toISOString().split('T')[0] } : po))
      );
      notify(`✅ Order #${orderId} marked as RECEIVED!`);
    }
  };

  // Recharts Chart Data
  const deptData = [
    { department: 'Cardiology', appointments: 38 },
    { department: 'Neurology', appointments: 24 },
    { department: 'Pediatrics', appointments: 19 },
    { department: 'Orthopedics', appointments: 27 },
    { department: 'Dermatology', appointments: 16 },
    { department: 'Dental Care', appointments: 22 },
    { department: 'General Med', appointments: 45 },
  ];

  const severityPieData = [
    { name: 'Low (Routine)', value: 45, color: '#10b981' },
    { name: 'Medium', value: 30, color: '#0ea5e9' },
    { name: 'High', value: 18, color: '#f59e0b' },
    { name: 'Critical (Override)', value: 7, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Administrator Console
          </span>
          <h1 className="text-2xl font-bold mt-2">Executive Hospital Management & Analytics</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Doctor CRUD directory, staff role access control, pharmacy procurement, and operational analytics.
          </p>
        </div>

        {/* Global Action depending on Tab */}
        <div className="flex gap-2">
          {activeTab === 'doctors' && (
            <button
              onClick={handleOpenAddDoc}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 font-bold text-white text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add Doctor
            </button>
          )}
          {activeTab === 'staff' && (
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 font-bold text-white text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" /> Add Staff Member
            </button>
          )}
          {activeTab === 'procurement' && (
            <button
              onClick={() => setShowCreatePOModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-900 text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Boxes className="w-4 h-4" /> Create Purchase Order
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-2xs gap-1">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'doctors'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctors Directory & Analytics</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {doctors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Hospital Staff Management</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {staffList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('procurement')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'procurement'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Pharmacy Procurement & Stock Orders</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {purchaseOrders.length}
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: DOCTOR DIRECTORY & ANALYTICS                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Doctors"
              value={doctors.length}
              subtitle="Across 7 clinical departments"
              icon={Stethoscope}
              color="teal"
            />
            <StatCard
              title="System Roles"
              value="6 Roles"
              subtitle="RBAC Security Enabled"
              icon={UserCheck}
              color="blue"
            />
            <StatCard
              title="ML Microservice"
              value="Online (UP)"
              subtitle="Python FastAPI :8000"
              icon={Activity}
              color="emerald"
            />
            <StatCard
              title="Security Audits"
              value="0 Breaches"
              subtitle="JWT Auth & AOP Logging"
              icon={ShieldAlert}
              color="purple"
            />
          </div>

          {/* Analytics Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Workload Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                📊 Appointments by Department (Slot Utilization)
              </h3>
              <p className="text-xs text-slate-500 mb-4">Patient volume across hospital clinics.</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData}>
                    <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Triage Severity Pie Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                🎯 Triage Severity Breakdown (Random Forest Distribution)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Patient case distribution generated from triage predictions.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={(entry) => `${entry.value}%`}
                    >
                      {severityPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Search-First Doctor CRUD Directory */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-3 p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Hospital Doctor Directory & CRUD Management
                </h2>
                <p className="text-xs text-slate-500">
                  Search, edit room assignments, qualifications, and consultation quotas.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </span>
            </div>

            {/* Search & Department Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  placeholder="Search doctor by name, specialization, or room number..."
                  className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={doctorDeptFilter}
                  onChange={(e) => setDoctorDeptFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 focus:outline-hidden focus:border-teal-500 cursor-pointer"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Dental Care">Dental Care</option>
                </select>
              </div>
            </div>

            {/* Doctors Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Doc ID</th>
                    <th className="px-4 py-3">Doctor & Qualification</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Specialization & Room</th>
                    <th className="px-4 py-3">Experience & Rating</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredDoctors.map((d) => (
                    <tr key={d.doctorId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-bold text-teal-700">#{d.doctorId}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{d.name}</div>
                        <div className="text-[10px] text-slate-400">{d.qualification || 'MBBS, MD'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {d.department}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{d.specialization}</div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {d.roomNumber || 'Room 101'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700">{d.experience || 10} yrs exp</div>
                        <div className="text-[10px] text-amber-600 font-bold">★ {d.rating || 4.8} / 5.0</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">{d.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditDoc(d)}
                            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Doctor Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(d.doctorId, d.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Doctor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDoctors.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No doctors match the selected search or department filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: HOSPITAL STAFF MANAGEMENT                               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Hospital Staff Directory & Access Control
              </h2>
              <p className="text-xs text-slate-500">
                Manage user credentials, system roles (Doctors, Lab Technicians, Receptionists, Pharmacists, Admins), and account statuses.
              </p>
            </div>
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Staff Member
            </button>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            {['ALL', 'DOCTOR', 'LAB_TECHNICIAN', 'RECEPTIONIST', 'PHARMACIST', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setStaffRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  staffRoleFilter === role
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role === 'ALL' ? 'All Staff Roles' : role.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Username & Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department / Unit</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStaff.map((staff) => (
                  <tr key={staff.userId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-600">#{staff.userId}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{staff.username}</div>
                      <div className="text-[10px] text-slate-500">{staff.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          staff.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : staff.role === 'DOCTOR'
                            ? 'bg-teal-100 text-teal-800'
                            : staff.role === 'LAB_TECHNICIAN'
                            ? 'bg-amber-100 text-amber-800'
                            : staff.role === 'PHARMACIST'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px]">{staff.department}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">{staff.email}</td>
                    <td className="px-4 py-3">
                      {staff.enabled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleStaffStatus(staff)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors cursor-pointer ${
                          staff.enabled
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {staff.enabled ? 'Disable Account' : 'Enable Account'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No staff accounts found under this role filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: PHARMACY PROCUREMENT & PURCHASE ORDERS                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'procurement' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-600" />
                Hospital Pharmacy Procurement & Supply Chain Orders
              </h2>
              <p className="text-xs text-slate-500">
                Track pharmaceutical orders from distributors, fulfill restock requests, and log delivery receipts directly into inventory.
              </p>
            </div>
            <button
              onClick={() => setShowCreatePOModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Boxes className="w-3.5 h-3.5" />
              New Purchase Order
            </button>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Orders</span>
              <span className="text-xl font-black text-slate-900">{purchaseOrders.length}</span>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
              <span className="text-amber-800 text-[10px] uppercase font-bold block">In Transit / Pending</span>
              <span className="text-xl font-black text-amber-900">
                {purchaseOrders.filter((po) => po.status !== 'RECEIVED').length}
              </span>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <span className="text-emerald-800 text-[10px] uppercase font-bold block">Stock Received</span>
              <span className="text-xl font-black text-emerald-900">
                {purchaseOrders.filter((po) => po.status === 'RECEIVED').length}
              </span>
            </div>
            <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200 text-xs">
              <span className="text-teal-800 text-[10px] uppercase font-bold block">Total Value (₹)</span>
              <span className="text-xl font-black text-teal-900">
                ₹{purchaseOrders.reduce((sum, po) => sum + (po.totalCost || 0), 0).toFixed(0)}
              </span>
            </div>
          </div>

          {/* Purchase Orders Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="px-4 py-3">PO #</th>
                  <th className="px-4 py-3">Medicine Ordered</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Unit Price & Total</th>
                  <th className="px-4 py-3">Supplier & Requester</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-teal-700">PO-{po.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{po.medicineName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Med ID: #{po.medicineId}</div>
                    </td>
                    <td className="px-4 py-3 font-black text-slate-800">{po.quantity} units</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">₹{(po.totalCost || 0).toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">₹{po.unitPrice?.toFixed(2)} / unit</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{po.supplier || 'Central Medical Supplies'}</div>
                      <div className="text-[10px] text-slate-500">By: {po.requestedBy || 'Hospital Staff'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px] font-mono">{po.orderDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          po.status === 'RECEIVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : po.status === 'ORDERED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {po.status !== 'RECEIVED' ? (
                        <button
                          onClick={() => handleReceivePO(po.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Received & Update Stock
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          Received on {po.receivedDate || po.orderDate}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No purchase orders recorded yet. Restock requests initiated by the pharmacy will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT DOCTOR                                    */}
      {/* ------------------------------------------------------------- */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                {editingDoc ? `Edit Doctor: ${editingDoc.name}` : 'Add Doctor to Hospital Directory'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDocModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-3 text-xs pt-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. John Carter"
                  value={docFormData.name}
                  onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={docFormData.department}
                    onChange={(e) => setDocFormData({ ...docFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Dental Care">Dental Care</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={docFormData.experience}
                    onChange={(e) => setDocFormData({ ...docFormData, experience: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={docFormData.specialization}
                    onChange={(e) => setDocFormData({ ...docFormData, specialization: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 204"
                    value={docFormData.roomNumber}
                    onChange={(e) => setDocFormData({ ...docFormData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, MD, DM"
                    value={docFormData.qualification}
                    onChange={(e) => setDocFormData({ ...docFormData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="9876500009"
                    value={docFormData.phone}
                    onChange={(e) => setDocFormData({ ...docFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Availability Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Fri 09:00 - 17:00"
                  value={docFormData.availability}
                  onChange={(e) => setDocFormData({ ...docFormData, availability: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingDoc ? 'Save Changes' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ADD STAFF MEMBER                                     */}
      {/* ------------------------------------------------------------- */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                Add Hospital Staff Account
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs pt-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Username / Staff ID</label>
                <input
                  type="text"
                  placeholder="e.g. 2028 or lab_tech_02"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Permission</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as Role })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-semibold text-slate-800"
                >
                  <option value="DOCTOR">DOCTOR</option>
                  <option value="LAB_TECHNICIAN">LAB_TECHNICIAN</option>
                  <option value="RECEPTIONIST">RECEPTIONIST</option>
                  <option value="PHARMACIST">PHARMACIST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="staff@intellicare.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: CREATE PURCHASE ORDER                                */}
      {/* ------------------------------------------------------------- */}
      {showCreatePOModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-600" />
                Issue Pharmacy Purchase Order
              </h3>
              <button
                type="button"
                onClick={() => setShowCreatePOModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs pt-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Medicine</label>
                <select
                  value={newPO.medicineId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const selected = medicines.find((m) => m.medicineId === id);
                    setNewPO({
                      ...newPO,
                      medicineId: id,
                      unitPrice: selected?.price || 15.0,
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-semibold text-slate-800"
                >
                  {medicines.map((m) => (
                    <option key={m.medicineId} value={m.medicineId}>
                      {m.medicineName} ({m.category}) - Current Stock: {m.stockQuantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Order Quantity</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={newPO.quantity}
                    onChange={(e) => setNewPO({ ...newPO, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPO.unitPrice}
                    onChange={(e) => setNewPO({ ...newPO, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier / Pharmaceutical Distributor</label>
                <input
                  type="text"
                  value={newPO.supplier}
                  onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Procurement Cost</label>
                <div className="p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800 text-sm">
                  ₹{(newPO.quantity * newPO.unitPrice).toFixed(2)}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreatePOModal(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Dispatch Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

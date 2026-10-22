import React, { useState, useEffect } from 'react';
import {
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
  AlertTriangle,
  Package,
  ShoppingCart,
  Building2,
  Star,
  Check,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { doctorService } from '../../services/hospitalService';
import type { Doctor } from '../../types';
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

interface StaffMember {
  id: string;
  name: string;
  role: 'RECEPTIONIST' | 'LAB_TECHNICIAN' | 'PHARMACIST';
  department: string;
  phone: string;
  email: string;
  shift: string;
  station: string;
  active: boolean;
}

interface SupplyRequest {
  id: number;
  medicineId: number;
  medicineName: string;
  category: string;
  currentStock: number;
  requestedUnits: number;
  urgency: 'CRITICAL' | 'HIGH';
  status: 'PENDING' | 'ORDERED' | 'RECEIVED';
  requestedAt: string;
  poNumber?: string;
}

interface HospitalEquipment {
  id: string;
  name: string;
  department: string;
  serialNumber: string;
  quantity: number;
  status: 'OPERATIONAL' | 'ORDER_REQUIRED' | 'ORDERED' | 'MAINTENANCE';
  lastService: string;
  vendor: string;
}

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: '3001',
    name: 'Alice Cooper',
    role: 'RECEPTIONIST',
    department: 'Front Desk & OPD Registration',
    phone: '9876503001',
    email: 'receptionist.3001@intellicare.com',
    shift: 'Morning (08:00 - 16:00)',
    station: 'OPD Counter 1',
    active: true,
  },
  {
    id: '3002',
    name: 'David Reynolds',
    role: 'RECEPTIONIST',
    department: 'Emergency & Triage Desk',
    phone: '9876503002',
    email: 'receptionist.3002@intellicare.com',
    shift: 'Evening (16:00 - 00:00)',
    station: 'ER Triage Desk',
    active: true,
  },
  {
    id: '4001',
    name: 'Mark Robinson',
    role: 'LAB_TECHNICIAN',
    department: 'Pathology & Biochemistry',
    phone: '9876504001',
    email: 'labtech.4001@intellicare.com',
    shift: 'General (09:00 - 17:00)',
    station: 'Main Diagnostic Lab 105',
    active: true,
  },
  {
    id: '4002',
    name: 'Clara Oswald',
    role: 'LAB_TECHNICIAN',
    department: 'Microbiology & Imaging',
    phone: '9876504002',
    email: 'labtech.4002@intellicare.com',
    shift: 'Rotational (24/7 Coverage)',
    station: 'Imaging & Blood Lab 106',
    active: true,
  },
  {
    id: '5001',
    name: 'Frank Wright',
    role: 'PHARMACIST',
    department: 'Central Pharmacy & Dispensing',
    phone: '9876505001',
    email: 'pharmacist.5001@intellicare.com',
    shift: 'Full Day (08:00 - 20:00)',
    station: 'Pharmacy Dispense Unit 1',
    active: true,
  },
  {
    id: '5002',
    name: 'Hannah Abbott',
    role: 'PHARMACIST',
    department: 'Inpatient Ward Pharmacy',
    phone: '9876505002',
    email: 'pharmacist.5002@intellicare.com',
    shift: 'Night (20:00 - 08:00)',
    station: 'IPD Pharmacy Unit 2',
    active: true,
  },
];

const DEFAULT_EQUIPMENT: HospitalEquipment[] = [
  {
    id: 'EQ-DENT-01',
    name: 'Dental Ergonomic Treatment Unit & LED Chair',
    department: 'Dentistry',
    serialNumber: 'SN-DT-2024-001',
    quantity: 3,
    status: 'OPERATIONAL',
    lastService: '2026-09-15',
    vendor: 'Dentsply Sirona Medical',
  },
  {
    id: 'EQ-DENT-02',
    name: 'Digital Panoramic Dental OPG & CBCT X-Ray Scanner',
    department: 'Dentistry',
    serialNumber: 'SN-CBCT-2023-88',
    quantity: 1,
    status: 'ORDER_REQUIRED',
    lastService: '2026-08-20',
    vendor: 'Carestream Dental Imaging',
  },
  {
    id: 'EQ-STER-03',
    name: 'Class-B Pre-Vacuum Steam Autoclave Sterilizer (24L)',
    department: 'Dentistry & Surgery',
    serialNumber: 'SN-AUTO-771',
    quantity: 4,
    status: 'OPERATIONAL',
    lastService: '2026-10-01',
    vendor: 'Tuttnauer Sterilization',
  },
  {
    id: 'EQ-CARD-04',
    name: '12-Lead Multi-Channel ECG Diagnostic Station',
    department: 'Cardiology',
    serialNumber: 'SN-ECG-9902',
    quantity: 5,
    status: 'OPERATIONAL',
    lastService: '2026-09-10',
    vendor: 'Philips Healthcare',
  },
  {
    id: 'EQ-ICU-05',
    name: 'ICU Multi-Parameter Vital Signs Monitor',
    department: 'ICU & Emergency',
    serialNumber: 'SN-VM-5541',
    quantity: 8,
    status: 'OPERATIONAL',
    lastService: '2026-09-28',
    vendor: 'Mindray Medical',
  },
  {
    id: 'EQ-INF-06',
    name: 'Automated Syringe Infusion Pump (Dual Channel)',
    department: 'General Medicine / IPD',
    serialNumber: 'SN-PUMP-3310',
    quantity: 2,
    status: 'ORDER_REQUIRED',
    lastService: '2026-07-12',
    vendor: 'B. Braun Medical Systems',
  },
  {
    id: 'EQ-LAB-07',
    name: 'Fully Automated Clinical Biochemistry Analyzer',
    department: 'Pathology Lab',
    serialNumber: 'SN-BIO-1044',
    quantity: 2,
    status: 'OPERATIONAL',
    lastService: '2026-09-25',
    vendor: 'Roche Diagnostics',
  },
];

export const AdminDashboard: React.FC = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'doctors' | 'staff' | 'procurement' | 'analytics'>('doctors');

  // Doctors State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [doctorSearch, setDoctorSearch] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Doctor Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // New Doctor Form
  const [newDoc, setNewDoc] = useState({
    name: '',
    department: 'Cardiology',
    specialization: 'Cardiology Specialist',
    experience: 10,
    phone: '',
    email: '',
    roomNumber: 'Room 105',
    qualification: 'MBBS, MD',
    rating: 4.8,
    maxPatientsPerDay: 25,
  });

  // Staff State (Receptionists, Lab Techs, Pharmacists)
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('hospital_staff_directory');
    return saved ? JSON.parse(saved) : DEFAULT_STAFF;
  });
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All');
  const [staffSearch, setStaffSearch] = useState<string>('');
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    name: '',
    role: 'RECEPTIONIST',
    department: 'Front Desk & OPD Registration',
    phone: '',
    email: '',
    shift: 'Morning (08:00 - 16:00)',
    station: 'OPD Counter',
  });

  // Procurement & Pharmacy Restock State
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>(() => {
    const saved = localStorage.getItem('hospital_supply_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 101,
        medicineId: 15,
        medicineName: 'Amoxicillin-Clavulanate 625mg',
        category: 'Antibiotics',
        currentStock: 12,
        requestedUnits: 150,
        urgency: 'HIGH',
        status: 'PENDING',
        requestedAt: '2026-10-22',
      },
      {
        id: 102,
        medicineId: 9,
        medicineName: 'Salbutamol Inhaler (Asthalin)',
        category: 'Respiratory / Asthma',
        currentStock: 0,
        requestedUnits: 200,
        urgency: 'CRITICAL',
        status: 'PENDING',
        requestedAt: '2026-10-22',
      },
      {
        id: 103,
        medicineId: 21,
        medicineName: 'Ketorolac Tromethamine 10mg DT',
        category: 'Dentistry & Pain Relief',
        currentStock: 5,
        requestedUnits: 120,
        urgency: 'HIGH',
        status: 'ORDERED',
        requestedAt: '2026-10-21',
        poNumber: 'PO-DENT-8841',
      },
    ];
  });

  // Hospital Equipment State
  const [equipmentList, setEquipmentList] = useState<HospitalEquipment[]>(() => {
    const saved = localStorage.getItem('hospital_equipment_inventory');
    return saved ? JSON.parse(saved) : DEFAULT_EQUIPMENT;
  });
  const [showOrderEquipmentModal, setShowOrderEquipmentModal] = useState<boolean>(false);
  const [newEquipmentOrder, setNewEquipmentOrder] = useState({
    name: '',
    department: 'Dentistry',
    quantity: 1,
    vendor: 'Dentsply Sirona Medical',
    notes: 'Urgent hospital OPD clinic requirement',
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (e) {
      console.error('Error fetching doctors:', e);
    }
  };

  // Persist staff changes
  const saveStaffList = (updated: StaffMember[]) => {
    setStaffList(updated);
    localStorage.setItem('hospital_staff_directory', JSON.stringify(updated));
  };

  // Persist supply requests
  const saveSupplyRequests = (updated: SupplyRequest[]) => {
    setSupplyRequests(updated);
    localStorage.setItem('hospital_supply_requests', JSON.stringify(updated));
  };

  // Persist equipment changes
  const saveEquipmentList = (updated: HospitalEquipment[]) => {
    setEquipmentList(updated);
    localStorage.setItem('hospital_equipment_inventory', JSON.stringify(updated));
  };

  // Add Doctor Handler
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.phone) {
      alert('Name and Phone are required.');
      return;
    }

    try {
      const created = await doctorService.create({
        ...newDoc,
        active: true,
      });
      setDoctors((prev) => [
        ...prev,
        created || { ...newDoc, doctorId: prev.length + 1, active: true },
      ]);
      setNotification(`✅ Doctor '${newDoc.name}' registered into hospital system successfully!`);
    } catch {
      setDoctors((prev) => [
        ...prev,
        { ...newDoc, doctorId: prev.length + 1, active: true },
      ]);
      setNotification(`✅ Doctor '${newDoc.name}' registered into hospital system successfully!`);
    }

    setShowAddModal(false);
    setNewDoc({
      name: '',
      department: 'Cardiology',
      specialization: 'Cardiology Specialist',
      experience: 10,
      phone: '',
      email: '',
      roomNumber: 'Room 105',
      qualification: 'MBBS, MD',
      rating: 4.8,
      maxPatientsPerDay: 25,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Edit Doctor Handler
  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    try {
      await doctorService.update(editingDoctor.doctorId, editingDoctor);
      setDoctors((prev) =>
        prev.map((d) => (d.doctorId === editingDoctor.doctorId ? editingDoctor : d))
      );
      setNotification(`✅ Updated details for '${editingDoctor.name}' successfully!`);
    } catch {
      setDoctors((prev) =>
        prev.map((d) => (d.doctorId === editingDoctor.doctorId ? editingDoctor : d))
      );
      setNotification(`✅ Updated details for '${editingDoctor.name}' locally!`);
    }

    setEditingDoctor(null);
    setTimeout(() => setNotification(null), 4000);
  };

  // Delete Doctor
  const handleDeleteDoctor = async (doctorId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await doctorService.delete(doctorId);
    } catch {
      // Fallback
    }
    setDoctors((prev) => prev.filter((d) => d.doctorId !== doctorId));
    setNotification(`🗑️ Doctor '${name}' removed from hospital directory.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Staff Handlers
  const handleSaveStaffEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    const updated = staffList.map((s) => (s.id === editingStaff.id ? editingStaff : s));
    saveStaffList(updated);
    setEditingStaff(null);
    setNotification(`✅ Staff member '${editingStaff.name}' details updated!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.phone) {
      alert('Staff name and contact phone are required.');
      return;
    }
    const nextCode =
      newStaff.role === 'RECEPTIONIST'
        ? `300${staffList.filter((s) => s.role === 'RECEPTIONIST').length + 3}`
        : newStaff.role === 'LAB_TECHNICIAN'
        ? `400${staffList.filter((s) => s.role === 'LAB_TECHNICIAN').length + 3}`
        : `500${staffList.filter((s) => s.role === 'PHARMACIST').length + 3}`;

    const member: StaffMember = {
      id: nextCode,
      name: newStaff.name || '',
      role: (newStaff.role as any) || 'RECEPTIONIST',
      department: newStaff.department || 'Hospital Clinic',
      phone: newStaff.phone || '',
      email: newStaff.email || `${nextCode.toLowerCase()}@intellicare.com`,
      shift: newStaff.shift || 'General (09:00 - 17:00)',
      station: newStaff.station || 'Front Desk',
      active: true,
    };

    saveStaffList([...staffList, member]);
    setShowAddStaffModal(false);
    setNewStaff({
      name: '',
      role: 'RECEPTIONIST',
      department: 'Front Desk & OPD Registration',
      phone: '',
      email: '',
      shift: 'Morning (08:00 - 16:00)',
      station: 'OPD Counter',
    });
    setNotification(`✅ Added new staff member '${member.name}' (ID: ${member.id})!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove staff member ${name} (ID: ${id})?`)) return;
    const updated = staffList.filter((s) => s.id !== id);
    saveStaffList(updated);
    setNotification(`🗑️ Staff member '${name}' removed from directory.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Procurement Handlers
  const handlePlaceOrder = (req: SupplyRequest) => {
    const poNum = `PO-MED-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = supplyRequests.map((r) =>
      r.id === req.id
        ? { ...r, status: 'ORDERED' as const, poNumber: poNum }
        : r
    );
    saveSupplyRequests(updated);
    setNotification(`📦 Purchase Order #${poNum} placed for ${req.requestedUnits} units of "${req.medicineName}".`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleMarkReceived = (req: SupplyRequest) => {
    const updated = supplyRequests.map((r) =>
      r.id === req.id ? { ...r, status: 'RECEIVED' as const, currentStock: r.currentStock + r.requestedUnits } : r
    );
    saveSupplyRequests(updated);
    setNotification(`✅ Consignment received! ${req.requestedUnits} units added to hospital inventory for "${req.medicineName}".`);
    setTimeout(() => setNotification(null), 5000);
  };

  // Equipment Order Handler
  const handleOrderEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipmentOrder.name) return;

    const newEq: HospitalEquipment = {
      id: `EQ-${newEquipmentOrder.department.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: newEquipmentOrder.name,
      department: newEquipmentOrder.department,
      serialNumber: `SN-PROC-${Date.now().toString().slice(-6)}`,
      quantity: newEquipmentOrder.quantity,
      status: 'ORDERED',
      lastService: new Date().toISOString().split('T')[0],
      vendor: newEquipmentOrder.vendor,
    };

    saveEquipmentList([newEq, ...equipmentList]);
    setShowOrderEquipmentModal(false);
    setNewEquipmentOrder({
      name: '',
      department: 'Dentistry',
      quantity: 1,
      vendor: 'Dentsply Sirona Medical',
      notes: 'Urgent hospital OPD clinic requirement',
    });
    setNotification(`🛒 Purchase order initiated for equipment: "${newEq.name}" (${newEq.id})!`);
    setTimeout(() => setNotification(null), 5000);
  };

  // Filtered Doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept =
      selectedDept === 'All' || doc.department.toLowerCase() === selectedDept.toLowerCase();
    const query = doctorSearch.toLowerCase();
    const matchesSearch =
      !doctorSearch ||
      doc.name.toLowerCase().includes(query) ||
      doc.specialization.toLowerCase().includes(query) ||
      (doc.roomNumber && doc.roomNumber.toLowerCase().includes(query)) ||
      (doc.qualification && doc.qualification.toLowerCase().includes(query)) ||
      (doc.phone && doc.phone.includes(query));
    return matchesDept && matchesSearch;
  });

  // Filtered Staff
  const filteredStaff = staffList.filter((s) => {
    const matchesRole = staffRoleFilter === 'All' || s.role === staffRoleFilter;
    const query = staffSearch.toLowerCase();
    const matchesSearch =
      !staffSearch ||
      s.name.toLowerCase().includes(query) ||
      s.id.includes(query) ||
      s.department.toLowerCase().includes(query) ||
      s.station.toLowerCase().includes(query) ||
      s.phone.includes(query);
    return matchesRole && matchesSearch;
  });

  // Department Analytics Data (including Dentistry)
  const deptData = [
    { department: 'Cardiology', appointments: 38 },
    { department: 'Neurology', appointments: 24 },
    { department: 'Pediatrics', appointments: 19 },
    { department: 'Orthopedics', appointments: 27 },
    { department: 'Dermatology', appointments: 16 },
    { department: 'General Med', appointments: 45 },
    { department: 'Dentistry', appointments: 22 },
  ];

  const severityPieData = [
    { name: 'Low (Routine)', value: 45, color: '#10b981' },
    { name: 'Medium', value: 30, color: '#0ea5e9' },
    { name: 'High', value: 18, color: '#f59e0b' },
    { name: 'Critical (Override)', value: 7, color: '#ef4444' },
  ];

  const pendingAlertsCount = supplyRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
              Administrator Central Console
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-900">
              Credential: 6001
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Executive Hospital Operations & Staff Administration</h1>
          <p className="text-sm text-teal-100/90 mt-1 max-w-2xl">
            Departmental doctor directories, clinical staff access (Reception, Lab, Pharmacy), pharmacy restock orders & medical equipment procurement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeTab === 'doctors' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 font-bold text-white text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Add Doctor
            </button>
          )}
          {activeTab === 'staff' && (
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 font-bold text-white text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Add Staff Member
            </button>
          )}
          {activeTab === 'procurement' && (
            <button
              onClick={() => setShowOrderEquipmentModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-900 text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ShoppingCart className="w-4 h-4" /> Procure Equipment
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

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'doctors'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          👨‍⚕️ Doctors Directory ({doctors.length})
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          👥 Clinical Staff ({staffList.length})
        </button>

        <button
          onClick={() => setActiveTab('procurement')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap relative ${
            activeTab === 'procurement'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          📦 Pharmacy Restock & Equipment Orders
          {pendingAlertsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
              {pendingAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          📊 Hospital Analytics & Triage
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hospital Doctors"
          value={`${doctors.length} Doctors`}
          subtitle="7 Specialty Departments (inc. Dentistry)"
          icon={Stethoscope}
          color="teal"
        />
        <StatCard
          title="Clinical & Front Staff"
          value={`${staffList.length} Staff`}
          subtitle="Reception, Lab Technicians, Pharmacy"
          icon={UserCheck}
          color="blue"
        />
        <StatCard
          title="Pharmacy Stock Alerts"
          value={`${pendingAlertsCount} Pending`}
          subtitle={pendingAlertsCount > 0 ? 'Urgent supplier PO required' : 'Inventory normal'}
          icon={AlertTriangle}
          color={pendingAlertsCount > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="ML Microservice"
          value="Online (UP)"
          subtitle="Triage & Queues :8000"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DOCTORS DIRECTORY WITH SEARCH & DEPT FILTER */}
      {/* ======================================================== */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          {/* Search & Department Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Department Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Filter Dept:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Departments (7)</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Dentistry">🦷 Dentistry</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by doctor name, specialization, room, or qualification..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="text-xs font-semibold text-slate-500 text-right">
              Showing <span className="font-bold text-teal-700">{filteredDoctors.length}</span> of {doctors.length} doctors
            </div>
          </div>

          {/* Doctors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">👨‍⚕️ Clinical Doctor Directory & Profile Information</h2>
                <p className="text-xs text-slate-500">
                  Search, view, and edit qualification, contact numbers, room assignments, and rating.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Doc ID</th>
                    <th className="px-5 py-3">Doctor & Qualification</th>
                    <th className="px-5 py-3">Department & Room</th>
                    <th className="px-5 py-3">Specialization</th>
                    <th className="px-5 py-3">Experience</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        No doctors match the selected department or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredDoctors.map((d) => (
                      <tr key={d.doctorId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-teal-700">#{d.doctorId}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{d.name}</div>
                          <div className="text-[11px] text-teal-600 font-medium">{d.qualification || 'MBBS, MD'}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                              d.department === 'Dentistry'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {d.department === 'Dentistry' ? '🦷 Dentistry' : d.department}
                          </span>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{d.roomNumber || 'Room 101'}</div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{d.specialization}</td>
                        <td className="px-5 py-3.5 text-slate-600">{d.experience || 10} yrs</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {d.rating ? d.rating.toFixed(2) : '4.85'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">{d.phone}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingDoctor({ ...d })}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit Doctor Info"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoctor(d.doctorId, d.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Doctor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CLINICAL & OPERATIONAL STAFF DIRECTORY */}
      {/* ======================================================== */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Staff Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Filter Role:</span>
              <select
                value={staffRoleFilter}
                onChange={(e) => setStaffRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Staff Roles ({staffList.length})</option>
                <option value="RECEPTIONIST">📋 Receptionists ({staffList.filter((s) => s.role === 'RECEPTIONIST').length})</option>
                <option value="LAB_TECHNICIAN">🔬 Lab Technicians ({staffList.filter((s) => s.role === 'LAB_TECHNICIAN').length})</option>
                <option value="PHARMACIST">💊 Pharmacists ({staffList.filter((s) => s.role === 'PHARMACIST').length})</option>
              </select>
            </div>

            {/* Staff Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, ID code, counter, or phone..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="text-xs font-semibold text-slate-500 text-right">
              Showing <span className="font-bold text-teal-700">{filteredStaff.length}</span> of {staffList.length} staff
            </div>
          </div>

          {/* Staff Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">👥 Clinical & Operational Staff Directory</h2>
                <p className="text-xs text-slate-500">
                  Manage Receptionists, Lab Technicians, and Pharmacists credentials, assignments, and contact details.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Login ID</th>
                    <th className="px-5 py-3">Staff Name</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Department & Station</th>
                    <th className="px-5 py-3">Shift Timing</th>
                    <th className="px-5 py-3">Phone & Email</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No staff members match the selected role or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-bold font-mono text-teal-700">#{s.id}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-emerald-600 font-medium">Active Hospital Personnel</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              s.role === 'RECEPTIONIST'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : s.role === 'LAB_TECHNICIAN'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {s.role === 'RECEPTIONIST' && '📋 Receptionist'}
                            {s.role === 'LAB_TECHNICIAN' && '🔬 Lab Tech'}
                            {s.role === 'PHARMACIST' && '💊 Pharmacist'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-800">{s.department}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{s.station}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono text-[11px]">{s.shift}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-slate-800">{s.phone}</div>
                          <div className="text-[11px] text-slate-500">{s.email}</div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingStaff({ ...s })}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit Staff Info"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(s.id, s.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Staff"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PHARMACY RESTOCK & HOSPITAL EQUIPMENT ORDERS */}
      {/* ======================================================== */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          {/* Section 1: Pharmacy Out-of-Stock Alert Messages */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-amber-50/40 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Pharmacy Out-of-Stock Alerts & Restock Requisitions
                </h3>
                <p className="text-xs text-slate-500">
                  Transmitted directly by pharmacists when medications are depleted or at critically low thresholds.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                {pendingAlertsCount} Actionable Requests
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Medication Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Current Stock</th>
                    <th className="px-5 py-3">Order Qty</th>
                    <th className="px-5 py-3">Urgency</th>
                    <th className="px-5 py-3">Status / PO #</th>
                    <th className="px-5 py-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {supplyRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{req.medicineName}</div>
                        <div className="text-[11px] text-slate-500">Req Date: {req.requestedAt}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{req.category}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`font-mono font-bold ${
                            req.currentStock === 0 ? 'text-red-600' : 'text-amber-600'
                          }`}
                        >
                          {req.currentStock} units
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800 font-mono">+{req.requestedUnits} units</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            req.urgency === 'CRITICAL'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {req.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            ⏳ Awaiting Order
                          </span>
                        )}
                        {req.status === 'ORDERED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            🚚 {req.poNumber || 'Ordered'}
                          </span>
                        )}
                        {req.status === 'RECEIVED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ✅ Stock Replenished
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.status === 'PENDING' && (
                          <button
                            onClick={() => handlePlaceOrder(req)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs ml-auto transition-all"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Order Restock
                          </button>
                        )}
                        {req.status === 'ORDERED' && (
                          <button
                            onClick={() => handleMarkReceived(req)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs ml-auto transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark Received
                          </button>
                        )}
                        {req.status === 'RECEIVED' && (
                          <span className="text-emerald-700 font-bold text-xs flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Hospital Medical Equipment Procurement Console */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  Hospital Equipment & Clinical Infrastructure Inventory
                </h3>
                <p className="text-xs text-slate-500">
                  Procure machinery, specialized dental units, radiology scanners, sterilizers, and monitor stations.
                </p>
              </div>
              <button
                onClick={() => setShowOrderEquipmentModal(true)}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" /> New Equipment Order
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Equipment Code</th>
                    <th className="px-5 py-3">Equipment Name</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Vendor / Manufacturer</th>
                    <th className="px-5 py-3">Active Units</th>
                    <th className="px-5 py-3">Operating Status</th>
                    <th className="px-5 py-3 text-right">Quick Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {equipmentList.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold font-mono text-teal-700">{eq.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{eq.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">SN: {eq.serialNumber}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800">
                          {eq.department}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{eq.vendor}</td>
                      <td className="px-5 py-3.5 font-bold font-mono text-slate-800">{eq.quantity} units</td>
                      <td className="px-5 py-3.5">
                        {eq.status === 'OPERATIONAL' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✅ Operational
                          </span>
                        )}
                        {eq.status === 'ORDER_REQUIRED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            ⚠️ Low Stock / Order Required
                          </span>
                        )}
                        {eq.status === 'ORDERED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            🚚 PO Sent (In Transit)
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            const updated = equipmentList.map((item) =>
                              item.id === eq.id
                                ? { ...item, status: 'ORDERED' as const, quantity: item.quantity + 1 }
                                : item
                            );
                            saveEquipmentList(updated);
                            setNotification(`🛒 Procurement PO placed for additional unit of ${eq.name}!`);
                            setTimeout(() => setNotification(null), 4000);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-all ml-auto"
                        >
                          + Order +1 Unit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: HOSPITAL ANALYTICS & TRIAGE WORKLOAD */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Workload Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              📊 Appointments by Department (Including Dentistry)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Daily patient consult workload across clinics.</p>
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
              🎯 Triage Severity Breakdown (Emergency Priority Distribution)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient triage classifications dynamically calculated by AI.
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
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NEW DOCTOR */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-teal-600" /> Add Doctor to Hospital Directory
            </h3>

            <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. John Carter"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newDoc.department}
                    onChange={(e) => setNewDoc({ ...newDoc, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Dentistry">🦷 Dentistry</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Assignment</label>
                  <input
                    type="text"
                    value={newDoc.roomNumber}
                    onChange={(e) => setNewDoc({ ...newDoc, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={newDoc.specialization}
                    onChange={(e) => setNewDoc({ ...newDoc, specialization: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={newDoc.experience}
                    onChange={(e) => setNewDoc({ ...newDoc, experience: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Medical Qualification</label>
                  <input
                    type="text"
                    value={newDoc.qualification}
                    onChange={(e) => setNewDoc({ ...newDoc, qualification: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    placeholder="e.g. MBBS, MD, DM"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Doctor Rating (out of 5)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    value={newDoc.rating}
                    onChange={(e) => setNewDoc({ ...newDoc, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="9876500028"
                    value={newDoc.phone}
                    onChange={(e) => setNewDoc({ ...newDoc, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="doctor@intellicare.com"
                    value={newDoc.email}
                    onChange={(e) => setNewDoc({ ...newDoc, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT DOCTOR DETAILS */}
      {/* ======================================================== */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-teal-600" /> Edit Doctor Profile & Assignments
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Updating Doctor ID #{editingDoctor.doctorId} across hospital consultation schedules.
            </p>

            <form onSubmit={handleUpdateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Doctor Name</label>
                <input
                  type="text"
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={editingDoctor.department}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Dentistry">🦷 Dentistry</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consultation Room</label>
                  <input
                    type="text"
                    value={editingDoctor.roomNumber || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={editingDoctor.specialization}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={editingDoctor.experience || 10}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, experience: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Degrees & Qualification</label>
                  <input
                    type="text"
                    value={editingDoctor.qualification || ''}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, qualification: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="5"
                    value={editingDoctor.rating || 4.8}
                    onChange={(e) =>
                      setEditingDoctor({ ...editingDoctor, rating: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editingDoctor.phone}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingDoctor.email || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT CLINICAL STAFF DETAILS */}
      {/* ======================================================== */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-teal-600" /> Edit Staff Details (ID: {editingStaff.id})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update contact information, shift timings, and station assignments.
            </p>

            <form onSubmit={handleSaveStaffEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Member Name</label>
                <input
                  type="text"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="LAB_TECHNICIAN">Lab Technician</option>
                    <option value="PHARMACIST">Pharmacist</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Station / Counter</label>
                  <input
                    type="text"
                    value={editingStaff.station}
                    onChange={(e) => setEditingStaff({ ...editingStaff, station: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Unit</label>
                <input
                  type="text"
                  value={editingStaff.department}
                  onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift Timing</label>
                <input
                  type="text"
                  value={editingStaff.shift}
                  onChange={(e) => setEditingStaff({ ...editingStaff, shift: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editingStaff.phone}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD STAFF MEMBER */}
      {/* ======================================================== */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-teal-600" /> Register Clinical / Front Desk Staff
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a new Receptionist, Lab Technician, or Pharmacist to the hospital workforce.
            </p>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rachel Adams"
                  value={newStaff.name || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Staff Role</label>
                  <select
                    value={newStaff.role || 'RECEPTIONIST'}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="RECEPTIONIST">Receptionist (300x)</option>
                    <option value="LAB_TECHNICIAN">Lab Technician (400x)</option>
                    <option value="PHARMACIST">Pharmacist (500x)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Station</label>
                  <input
                    type="text"
                    placeholder="e.g. OPD Counter 3"
                    value={newStaff.station || ''}
                    onChange={(e) => setNewStaff({ ...newStaff, station: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Unit</label>
                <input
                  type="text"
                  placeholder="e.g. Front Desk & Patient Care"
                  value={newStaff.department || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift Timing</label>
                <input
                  type="text"
                  placeholder="e.g. Morning (08:00 - 16:00)"
                  value={newStaff.shift || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="9876503009"
                    value={newStaff.phone || ''}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="staff@intellicare.com"
                    value={newStaff.email || ''}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PROCURE HOSPITAL EQUIPMENT */}
      {/* ======================================================== */}
      {showOrderEquipmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" /> Procure Hospital Machinery & Equipment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit capital equipment order to approved medical device manufacturers.
            </p>

            <form onSubmit={handleOrderEquipment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Equipment Name / Model</label>
                <input
                  type="text"
                  placeholder="e.g. Digital Dental RVG Sensor Unit"
                  value={newEquipmentOrder.name}
                  onChange={(e) => setNewEquipmentOrder({ ...newEquipmentOrder, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newEquipmentOrder.department}
                    onChange={(e) =>
                      setNewEquipmentOrder({ ...newEquipmentOrder, department: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="Dentistry">Dentistry</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="ICU & Emergency">ICU & Emergency</option>
                    <option value="Pathology Lab">Pathology Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Units Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newEquipmentOrder.quantity}
                    onChange={(e) =>
                      setNewEquipmentOrder({ ...newEquipmentOrder, quantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Approved Vendor / Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g. Dentsply Sirona / Philips Healthcare"
                  value={newEquipmentOrder.vendor}
                  onChange={(e) => setNewEquipmentOrder({ ...newEquipmentOrder, vendor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Procurement Notes / Specification</label>
                <textarea
                  rows={2}
                  value={newEquipmentOrder.notes}
                  onChange={(e) => setNewEquipmentOrder({ ...newEquipmentOrder, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOrderEquipmentModal(false)}
                  className="flex-1 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

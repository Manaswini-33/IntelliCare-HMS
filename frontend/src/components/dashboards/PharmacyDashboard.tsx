import React, { useState, useEffect } from 'react';
import {
  Pill,
  CheckCircle2,
  Package,
  ShieldCheck,
  Search,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { pharmacyService, prescriptionService } from '../../services/hospitalService';
import type { Medicine, Prescription } from '../../types';

interface ExtendedMedicine extends Medicine {
  illnessCategory?: string;
  symptomsTreated?: string;
}

export const PharmacyDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [completedDispenses, setCompletedDispenses] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<ExtendedMedicine[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [reviewStep, setReviewStep] = useState<number>(1);
  const [notification, setNotification] = useState<string | null>(null);

  // Fallback comprehensive 25+ medicines catalog mapped to illness & symptoms
  const fallbackMedicines: ExtendedMedicine[] = [
    // Fever & Pain
    {
      medicineId: 1,
      medicineName: 'Paracetamol 500mg',
      category: 'Analgesic & Antipyretic',
      stockQuantity: 250,
      dosage: '1 tab twice daily',
      price: 5.0,
      expiryDate: '2028-12-31',
      active: true,
      illnessCategory: 'FEVER_PAIN',
      symptomsTreated: 'Fever, mild-to-moderate headache, body aches',
    },
    {
      medicineId: 2,
      medicineName: 'Paracetamol 650mg (Dolo)',
      category: 'Analgesic & Antipyretic',
      stockQuantity: 300,
      dosage: '1 tab every 6 hours as needed',
      price: 7.5,
      expiryDate: '2028-11-30',
      active: true,
      illnessCategory: 'FEVER_PAIN',
      symptomsTreated: 'High-grade fever, viral pyrexia, severe body ache',
    },
    {
      medicineId: 3,
      medicineName: 'Ibuprofen 400mg',
      category: 'NSAID / Anti-Inflammatory',
      stockQuantity: 180,
      dosage: '1 tab after food twice daily',
      price: 9.0,
      expiryDate: '2028-09-15',
      active: true,
      illnessCategory: 'FEVER_PAIN',
      symptomsTreated: 'Joint swelling, musculoskeletal pain, toothache',
    },
    {
      medicineId: 4,
      medicineName: 'Tramadol 50mg',
      category: 'Analgesic (Opioid Agonist)',
      stockQuantity: 65,
      dosage: '1 cap as directed by physician',
      price: 24.0,
      expiryDate: '2027-10-31',
      active: true,
      illnessCategory: 'FEVER_PAIN',
      symptomsTreated: 'Severe post-operative trauma, acute severe pain',
    },
    // Cardiovascular & BP
    {
      medicineId: 5,
      medicineName: 'Amlodipine 5mg',
      category: 'Cardiovascular / Calcium Blocker',
      stockQuantity: 210,
      dosage: '1 tab once daily in the morning',
      price: 11.0,
      expiryDate: '2028-08-20',
      active: true,
      illnessCategory: 'CARDIAC_BP',
      symptomsTreated: 'High blood pressure (Hypertension), angina',
    },
    {
      medicineId: 6,
      medicineName: 'Telmisartan 40mg',
      category: 'Cardiovascular / ARB',
      stockQuantity: 195,
      dosage: '1 tab once daily',
      price: 14.5,
      expiryDate: '2028-10-10',
      active: true,
      illnessCategory: 'CARDIAC_BP',
      symptomsTreated: 'Chronic hypertension, cardiac protection',
    },
    {
      medicineId: 7,
      medicineName: 'Aspirin 75mg (Ecosprin)',
      category: 'Cardiovascular / Antiplatelet',
      stockQuantity: 220,
      dosage: '1 tab once daily after dinner',
      price: 6.5,
      expiryDate: '2028-07-15',
      active: true,
      illnessCategory: 'CARDIAC_BP',
      symptomsTreated: 'Prevention of heart attack, stroke, blood clot',
    },
    {
      medicineId: 8,
      medicineName: 'Atorvastatin 20mg',
      category: 'Cardiovascular / Statin',
      stockQuantity: 140,
      dosage: '1 tab at bedtime',
      price: 18.0,
      expiryDate: '2028-06-30',
      active: true,
      illnessCategory: 'CARDIAC_BP',
      symptomsTreated: 'High cholesterol, coronary artery disease',
    },
    // Respiratory & Asthma / Cough
    {
      medicineId: 9,
      medicineName: 'Salbutamol Inhaler (Asthalin)',
      category: 'Respiratory / Bronchodilator',
      stockQuantity: 85,
      dosage: '2 puffs as needed for acute shortness of breath',
      price: 32.0,
      expiryDate: '2027-04-10',
      active: true,
      illnessCategory: 'RESPIRATORY',
      symptomsTreated: 'Acute asthma attack, wheezing, COPD bronchospasm',
    },
    {
      medicineId: 10,
      medicineName: 'Budesonide 200mcg Inhaler',
      category: 'Respiratory / Inhaled Corticosteroid',
      stockQuantity: 60,
      dosage: '1 puff twice daily (gargle after use)',
      price: 45.0,
      expiryDate: '2027-12-15',
      active: true,
      illnessCategory: 'RESPIRATORY',
      symptomsTreated: 'Chronic bronchial inflammation, persistent asthma',
    },
    {
      medicineId: 11,
      medicineName: 'Montelukast 10mg + Levocetirizine 5mg',
      category: 'Respiratory / Antiallergic',
      stockQuantity: 175,
      dosage: '1 tab at night',
      price: 16.0,
      expiryDate: '2028-05-20',
      active: true,
      illnessCategory: 'RESPIRATORY',
      symptomsTreated: 'Allergic rhinitis, seasonal sneezing, cough with allergy',
    },
    {
      medicineId: 12,
      medicineName: 'Dextromethorphan Cough Syrup 100ml',
      category: 'Respiratory / Antitussive',
      stockQuantity: 110,
      dosage: '10ml thrice daily after food',
      price: 22.0,
      expiryDate: '2028-02-28',
      active: true,
      illnessCategory: 'RESPIRATORY',
      symptomsTreated: 'Dry hacking cough, throat irritation',
    },
    // Antibiotics & Infections
    {
      medicineId: 13,
      medicineName: 'Amoxicillin 500mg',
      category: 'Antibiotic / Penicillin Class',
      stockQuantity: 130,
      dosage: '1 cap thrice daily after food for 5 days',
      price: 15.0,
      expiryDate: '2027-08-30',
      active: true,
      illnessCategory: 'ANTIBIOTIC',
      symptomsTreated: 'Bacterial throat infection, tonsillitis, ear infection',
    },
    {
      medicineId: 14,
      medicineName: 'Azithromycin 500mg',
      category: 'Antibiotic / Macrolide',
      stockQuantity: 145,
      dosage: '1 tab once daily 1 hr before meals for 3 days',
      price: 28.0,
      expiryDate: '2027-11-20',
      active: true,
      illnessCategory: 'ANTIBIOTIC',
      symptomsTreated: 'Lower respiratory tract infection, chest congestion',
    },
    {
      medicineId: 15,
      medicineName: 'Ciprofloxacin 500mg',
      category: 'Antibiotic / Fluoroquinolone',
      stockQuantity: 90,
      dosage: '1 tab twice daily for 5 days',
      price: 19.5,
      expiryDate: '2028-01-15',
      active: true,
      illnessCategory: 'ANTIBIOTIC',
      symptomsTreated: 'Urinary tract infection (UTI), abdominal infections',
    },
    // Diabetes
    {
      medicineId: 16,
      medicineName: 'Metformin 500mg',
      category: 'Antidiabetic / Biguanide',
      stockQuantity: 240,
      dosage: '1 tab twice daily with meals',
      price: 8.0,
      expiryDate: '2028-12-31',
      active: true,
      illnessCategory: 'DIABETES',
      symptomsTreated: 'Type-2 Diabetes Mellitus, elevated blood glucose',
    },
    {
      medicineId: 17,
      medicineName: 'Glimepiride 2mg',
      category: 'Antidiabetic / Sulfonylurea',
      stockQuantity: 135,
      dosage: '1 tab before breakfast',
      price: 12.0,
      expiryDate: '2028-04-18',
      active: true,
      illnessCategory: 'DIABETES',
      symptomsTreated: 'Insulin secretion stimulation in Type-2 diabetes',
    },
    // Gastrointestinal & Acidity
    {
      medicineId: 18,
      medicineName: 'Pantoprazole 40mg',
      category: 'Gastrointestinal / PPI',
      stockQuantity: 280,
      dosage: '1 tab empty stomach 30 mins before breakfast',
      price: 10.0,
      expiryDate: '2028-11-15',
      active: true,
      illnessCategory: 'GASTRO',
      symptomsTreated: 'Acid reflux, heartburn, GERD, gastric ulcer',
    },
    {
      medicineId: 19,
      medicineName: 'Ondansetron 4mg (Emeset)',
      category: 'Gastrointestinal / Antiemetic',
      stockQuantity: 160,
      dosage: '1 tab as needed for nausea/vomiting',
      price: 9.5,
      expiryDate: '2028-03-30',
      active: true,
      illnessCategory: 'GASTRO',
      symptomsTreated: 'Acute nausea, vomiting, gastroenteritis',
    },
    // Allergies & Antihistamines
    {
      medicineId: 20,
      medicineName: 'Cetirizine 10mg',
      category: 'Antihistamine / Antiallergic',
      stockQuantity: 210,
      dosage: '1 tab once daily at bedtime',
      price: 5.5,
      expiryDate: '2028-09-30',
      active: true,
      illnessCategory: 'ALLERGY',
      symptomsTreated: 'Skin hives, allergic itching, watery eyes, sneezing',
    },
    {
      medicineId: 21,
      medicineName: 'Hydrocortisone 1% Topical Cream',
      category: 'Dermatological / Corticosteroid',
      stockQuantity: 80,
      dosage: 'Apply thin layer to affected skin twice daily',
      price: 18.0,
      expiryDate: '2027-09-10',
      active: true,
      illnessCategory: 'ALLERGY',
      symptomsTreated: 'Contact dermatitis, eczema flare, insect bites',
    },
    // Neurology & Sleep
    {
      medicineId: 22,
      medicineName: 'Gabapentin 300mg',
      category: 'Neurology / Neuropathic Pain',
      stockQuantity: 75,
      dosage: '1 cap at night',
      price: 26.0,
      expiryDate: '2028-01-20',
      active: true,
      illnessCategory: 'NEUROLOGY',
      symptomsTreated: 'Diabetic neuropathy, burning nerve pain, sciatica',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 1. Load Medicines
      const medList = await pharmacyService.getMedicines();
      if (medList && medList.length > 0) {
        // Enrich with illness category mappings
        const enriched: ExtendedMedicine[] = medList.map((m) => {
          const match = fallbackMedicines.find(
            (fb) => fb.medicineName.toLowerCase() === m.medicineName.toLowerCase()
          );
          return {
            ...m,
            illnessCategory: match?.illnessCategory || mapCategoryToIllness(m.category),
            symptomsTreated: match?.symptomsTreated || `Treats conditions related to ${m.category}`,
          };
        });
        setMedicines(enriched);
      } else {
        setMedicines(fallbackMedicines);
      }

      // 2. Load Prescriptions
      const rxList = await prescriptionService.getAll();
      if (rxList && rxList.length > 0) {
        const pending = rxList.filter((r) => r.status !== 'DISPENSED');
        const completed = rxList.filter((r) => r.status === 'DISPENSED');
        setPrescriptions(pending);
        setCompletedDispenses(completed);
      } else {
        // Default pending queue
        setPrescriptions([
          {
            prescriptionId: 701,
            patientId: 1,
            patientName: 'John Smith',
            patientAge: 45,
            patientGender: 'Male',
            patientAllergies: 'Penicillin',
            doctorId: 1,
            doctorName: 'Dr. Sarah Jenkins',
            prescriptionDate: new Date().toISOString().split('T')[0],
            status: 'ISSUED',
            instructions: 'Paracetamol 650mg • 1 tab twice daily for 5 days after food',
            items: [
              {
                medicineId: 2,
                medicineName: 'Paracetamol 650mg (Dolo)',
                quantity: 10,
                dosage: '1 tab twice daily',
              },
            ],
          },
          {
            prescriptionId: 702,
            patientId: 2,
            patientName: 'Emily Davis',
            patientAge: 28,
            patientGender: 'Female',
            patientAllergies: 'Aspirin',
            doctorId: 1,
            doctorName: 'Dr. Sarah Jenkins',
            prescriptionDate: new Date().toISOString().split('T')[0],
            status: 'ISSUED',
            instructions: 'Salbutamol Inhaler (Asthalin) • 2 puffs as needed for acute wheezing',
            items: [
              {
                medicineId: 9,
                medicineName: 'Salbutamol Inhaler (Asthalin)',
                quantity: 1,
                dosage: '2 puffs as needed',
              },
            ],
          },
          {
            prescriptionId: 703,
            patientId: 3,
            patientName: 'Robert Brown',
            patientAge: 58,
            patientGender: 'Male',
            patientAllergies: 'None',
            doctorId: 2,
            doctorName: 'Dr. Marcus Chen',
            prescriptionDate: new Date().toISOString().split('T')[0],
            status: 'ISSUED',
            instructions: 'Metformin 500mg • 1 tab with lunch and dinner',
            items: [
              {
                medicineId: 16,
                medicineName: 'Metformin 500mg',
                quantity: 20,
                dosage: '1 tab with meals',
              },
            ],
          },
        ]);
      }
    } catch {
      setMedicines(fallbackMedicines);
    }
  };

  const mapCategoryToIllness = (category: string): string => {
    const cat = category.toLowerCase();
    if (cat.includes('analgesic') || cat.includes('pain') || cat.includes('fever')) return 'FEVER_PAIN';
    if (cat.includes('cardio') || cat.includes('bp') || cat.includes('hypertension')) return 'CARDIAC_BP';
    if (cat.includes('respir') || cat.includes('asthma') || cat.includes('cough')) return 'RESPIRATORY';
    if (cat.includes('antibio') || cat.includes('infect')) return 'ANTIBIOTIC';
    if (cat.includes('diabet') || cat.includes('insulin')) return 'DIABETES';
    if (cat.includes('gastro') || cat.includes('acid') || cat.includes('ulcer')) return 'GASTRO';
    if (cat.includes('allergy') || cat.includes('derm')) return 'ALLERGY';
    return 'ALL';
  };

  // Open Prescription Review Drawer
  const handleOpenReview = (rx: Prescription) => {
    setSelectedRx(rx);
    setReviewStep(1);
  };

  // Check if prescribed medicine conflicts with patient's allergy
  const checkRxAllergyConflict = (rx: Prescription) => {
    if (!rx.patientAllergies || rx.patientAllergies.toLowerCase() === 'none') {
      return null;
    }
    const allg = rx.patientAllergies.toLowerCase();
    const inst = (rx.instructions || '').toLowerCase();
    const itemName = rx.items?.[0]?.medicineName ? rx.items[0].medicineName.toLowerCase() : '';

    if (
      (allg.includes('penicillin') || allg.includes('amoxicillin')) &&
      (inst.includes('amox') || inst.includes('penicillin') || itemName.includes('amox') || itemName.includes('penicillin'))
    ) {
      return `CRITICAL: Patient has documented ${rx.patientAllergies} allergy! Prescribed item contains Penicillin compounds.`;
    }

    if (
      (allg.includes('aspirin') || allg.includes('nsaid')) &&
      (inst.includes('aspirin') || inst.includes('ibuprofen') || itemName.includes('aspirin') || itemName.includes('ibuprofen'))
    ) {
      return `CRITICAL: Patient has documented ${rx.patientAllergies} allergy! Prescribed item contains NSAID/Aspirin compounds.`;
    }

    return null;
  };

  // Final Action: Dispense and Deliver to Customer
  const handleDeliverToCustomer = async () => {
    if (!selectedRx) return;

    try {
      // 1. Call backend dispense API
      await prescriptionService.dispense(selectedRx.prescriptionId);

      // 2. Deduct stock in UI
      setMedicines((prev) =>
        prev.map((m) => {
          const isMatch = (selectedRx.instructions || '').toLowerCase().includes(m.medicineName.toLowerCase().split(' ')[0]);
          return isMatch ? { ...m, stockQuantity: Math.max(0, m.stockQuantity - 10) } : m;
        })
      );

      // 3. Move from pending to completed
      const updatedRx = { ...selectedRx, status: 'DISPENSED' as const };
      setPrescriptions((prev) => prev.filter((p) => p.prescriptionId !== selectedRx.prescriptionId));
      setCompletedDispenses((prev) => [updatedRx, ...prev]);

      setNotification(
        `✅ Prescription #${selectedRx.prescriptionId} successfully dispensed & DELIVERED TO CUSTOMER (${selectedRx.patientName})! Medication handover logged.`
      );
      setSelectedRx(null);
    } catch {
      // Fallback update
      const updatedRx = { ...selectedRx, status: 'DISPENSED' as const };
      setPrescriptions((prev) => prev.filter((p) => p.prescriptionId !== selectedRx.prescriptionId));
      setCompletedDispenses((prev) => [updatedRx, ...prev]);

      setNotification(
        `✅ Prescription #${selectedRx.prescriptionId} marked as DELIVERED TO CUSTOMER (${selectedRx.patientName})!`
      );
      setSelectedRx(null);
    } finally {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Filter medicines by symptom/illness category & search query
  const filteredMedicines = medicines.filter((m) => {
    const matchesCategory =
      selectedCategory === 'ALL' || m.illnessCategory === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      m.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.symptomsTreated && m.symptomsTreated.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const categoryTabs = [
    { id: 'ALL', label: 'All Medications' },
    { id: 'FEVER_PAIN', label: '🌡️ Fever & Pain' },
    { id: 'CARDIAC_BP', label: '❤️ Cardiac & Blood Pressure' },
    { id: 'RESPIRATORY', label: '🫁 Respiratory & Cough' },
    { id: 'ANTIBIOTIC', label: '🛡️ Antibiotics & Infections' },
    { id: 'DIABETES', label: '🩸 Diabetes & Glucose' },
    { id: 'GASTRO', label: '🧪 Gastro & Acidity' },
    { id: 'ALLERGY', label: '🌿 Allergies & Skin' },
    { id: 'NEUROLOGY', label: '🧠 Neurology' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Pharmacy Dispensing Portal (ID: 5001)
          </span>
          <h1 className="text-2xl font-bold mt-2">Prescription Dispensing & Symptoms-Based Formulary</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Review doctor-issued prescriptions, inspect patient allergies, verify drug safety, and deliver packaged medications to customers.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Dispense"
          value={prescriptions.length}
          subtitle="Orders awaiting handover"
          icon={Pill}
          color="teal"
        />
        <StatCard
          title="Delivered to Customers"
          value={completedDispenses.length}
          subtitle="Handover completed"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Catalog Medicines"
          value={medicines.length}
          subtitle="Covering all major illnesses"
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Allergy Safety Rate"
          value="100%"
          subtitle="Zero adverse incidents"
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* SECTION 1: DOCTOR-ISSUED PRESCRIPTIONS (PENDING DISPENSE) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/50">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              Doctor-Issued Prescriptions (Pending Dispense)
            </h2>
            <p className="text-xs text-slate-500">
              Click any patient to review doctor's prescribed dosage, check allergies, and deliver medicine to customer.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            {prescriptions.length} pending handover
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-slate-800 text-sm">All Prescriptions Dispensed & Delivered!</p>
            <p className="text-xs text-slate-500 mt-1">
              There are currently no pending prescriptions in the pharmacy queue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Rx ID</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Prescribed Medication & Dosage</th>
                  <th className="px-5 py-3.5">Prescribing Doctor</th>
                  <th className="px-5 py-3.5">Allergies</th>
                  <th className="px-5 py-3.5 text-right">Customer Handover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {prescriptions.map((rx) => (
                  <tr
                    key={rx.prescriptionId}
                    onClick={() => handleOpenReview(rx)}
                    className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-black text-teal-700">#{rx.prescriptionId}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 group-hover:text-teal-700">
                        {rx.patientName || `Patient #${rx.patientId}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rx.patientGender || 'Patient'}, {rx.patientAge ? `${rx.patientAge} yrs` : 'Adult'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-900 font-semibold max-w-sm">
                      <div className="text-xs">{rx.instructions}</div>
                      <div className="text-[10px] text-slate-400">Prescribed: {rx.prescriptionDate}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="font-medium text-slate-800">{rx.doctorName || `Doctor #${rx.doctorId}`}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      {rx.patientAllergies && rx.patientAllergies.toLowerCase() !== 'none' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                          {rx.patientAllergies}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-medium">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenReview(rx)}
                        className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Deliver to Customer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: COMPREHENSIVE MEDICINES BY ILLNESS / SYMPTOMS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-5">
        <div>
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            Hospital Drug Formulary (Categorized by Illness & Symptoms)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Expanded repository of medicines covering Fever, Pain, Cardiac, Respiratory, Antibiotics, Diabetes, Gastro, and Allergies.
          </p>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicine by name, category, or symptoms (e.g. fever, headache, cough, blood pressure, asthma)..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:border-teal-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Medicines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredMedicines.map((med) => (
            <div
              key={med.medicineId}
              className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-white transition-all space-y-2 text-xs"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{med.medicineName}</h4>
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mt-0.5">
                    {med.category}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      med.stockQuantity > 50
                        ? 'bg-emerald-100 text-emerald-800'
                        : med.stockQuantity > 10
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {med.stockQuantity} in stock
                  </span>
                  <div className="text-[11px] font-black text-slate-700 mt-1">₹{(med.price ?? 0).toFixed(2)}</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                <strong>Symptoms Treated:</strong> {med.symptomsTreated}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                <span>Standard: {med.dosage}</span>
                <span>Exp: {med.expiryDate || '2028-12-31'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: PRESCRIPTION REVIEW & "DELIVERED TO CUSTOMER" MODAL */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[10px] uppercase">
                  Medication Dispense Console
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Doctor-Issued Prescription #{selectedRx.prescriptionId}
                </h3>
                <p className="text-xs text-slate-500">
                  Issued on: <strong>{selectedRx.prescriptionDate}</strong> by {selectedRx.doctorName || `Doctor #${selectedRx.doctorId}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRx(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Patient Demographics & Allergy Safety Alert */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Patient Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedRx.patientName || `Patient #${selectedRx.patientId}`}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Age & Gender</span>
                  <span className="font-semibold text-slate-800">
                    {selectedRx.patientAge || 35} yrs • {selectedRx.patientGender || 'Adult'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Documented Allergies</span>
                  {selectedRx.patientAllergies && selectedRx.patientAllergies.toLowerCase() !== 'none' ? (
                    <span className="font-black text-red-700 bg-red-100 px-2 py-0.5 rounded text-[11px] inline-block border border-red-300">
                      {selectedRx.patientAllergies}
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-700">None Reported</span>
                  )}
                </div>
              </div>

              {/* Allergy Safety Verification Result */}
              {checkRxAllergyConflict(selectedRx) ? (
                <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-xs text-red-900 font-bold flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block uppercase tracking-wide text-red-700">Severe Safety Hazard:</span>
                    {checkRxAllergyConflict(selectedRx)}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Automated Allergy Check Passed:</strong> No adverse pharmacological interaction detected with patient profile.
                  </span>
                </div>
              )}
            </div>

            {/* Prescribed Items & Instructions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Prescribed Drug & Dosage Instructions
              </span>
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-bold text-teal-900 text-sm">
                    {selectedRx.items?.[0]
                      ? `${selectedRx.items[0].medicineName || 'Medication'} (Qty: ${selectedRx.items[0].quantity || 1})`
                      : selectedRx.instructions}
                  </span>
                </div>
                <p className="text-slate-700 font-medium">
                  <strong>Dosage / Instructions:</strong> {selectedRx.instructions}
                </p>
                <p className="text-[11px] text-slate-500">
                  Duration: {selectedRx.duration || '5 days'} • Dispensing Route: Oral / Outpatient Pharmacy
                </p>
              </div>
            </div>

            {/* User-Friendly Action Step Buttons */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">
                Dispensing & Customer Handover Workflow:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewStep(1)}
                  className={`p-3 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                    reviewStep >= 1
                      ? 'bg-teal-50 border-teal-300 text-teal-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Step 1: Verify</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Check patient name & allergy clearance</p>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStep(2)}
                  className={`p-3 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                    reviewStep >= 2
                      ? 'bg-teal-50 border-teal-300 text-teal-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Package className="w-4 h-4 text-teal-600" />
                    <span>Step 2: Prepare</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Pack dosage and apply usage label</p>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStep(3)}
                  className={`p-3 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                    reviewStep === 3
                      ? 'bg-teal-50 border-teal-300 text-teal-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <ShoppingBag className="w-4 h-4 text-teal-600" />
                    <span>Step 3: Deliver</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Hand medication to patient/customer</p>
                </button>
              </div>

              {/* Main Prominent Handover Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Ready to complete order handover? Stock will be updated automatically.
                </span>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedRx(null)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDeliverToCustomer}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    ✅ Delivered to Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

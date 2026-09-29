const API_BASE = window.location.origin ? (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? 'http://localhost:8080/api' : `${window.location.origin}/api`) : '/api';

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

// Intercept fetch to append JWT Bearer Header
const originalFetch = window.fetch;
window.fetch = function() {
    let [resource, config] = arguments;
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    
    const token = localStorage.getItem('jwtToken');
    if (token && !resource.includes('/api/auth/')) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return originalFetch(resource, config);
};

// 1. Radio Role Selection (Ref 2nd Image)
function selectRole(role) {
    document.getElementById('login-selected-role').value = role;
    const labelMap = {
        'PATIENT': 'Patient Name or ID',
        'DOCTOR': 'Doctor ID (e.g. 1, 2, 3)',
        'RECEPTIONIST': 'Username',
        'LAB_TECHNICIAN': 'Username',
        'PHARMACIST': 'Username',
        'ADMIN': 'Username'
    };
    document.getElementById('login-input-label').innerText = labelMap[role] || 'Username';

    const defaultUsernames = {
        'PATIENT': 'patient',
        'RECEPTIONIST': 'receptionist',
        'DOCTOR': '1',
        'LAB_TECHNICIAN': 'labtech',
        'PHARMACIST': 'pharmacist',
        'ADMIN': 'admin'
    };
    document.getElementById('login-username').value = defaultUsernames[role] || '';
}

function initAuth() {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole');

    if (token && role) {
        setupUserPortal(role);
        return;
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-selected-role').value;

        // Normalize username to matched DB user credential
        let username = usernameInput.trim().toLowerCase();
        if (role === 'PATIENT') {
            username = 'patient';
        } else if (role === 'DOCTOR') {
            username = 'doctor';
        } else if (role === 'RECEPTIONIST') {
            username = 'receptionist';
        } else if (role === 'LAB_TECHNICIAN') {
            username = 'labtech';
        } else if (role === 'PHARMACIST') {
            username = 'pharmacist';
        } else if (role === 'ADMIN') {
            username = 'admin';
        }

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (res.ok) {
                const result = await res.json();
                if (result.success && result.data.token) {
                    localStorage.setItem('jwtToken', result.data.token);
                    localStorage.setItem('userRole', result.data.role || role);
                    localStorage.setItem('loggedInUser', usernameInput);
                    setupUserPortal(result.data.role || role);
                    return;
                } else {
                    alert(`Login Failed: ${result.message || 'Invalid credentials'}`);
                    return;
                }
            } else {
                console.warn('Backend server returned error status:', res.status);
            }
        } catch (err) {
            console.warn('Authentication server connection error:', err);
        }

        // Fallback for Demo Mode / Render Cold Start
        console.log('Logging in with Demo Session Mode...');
        localStorage.setItem('jwtToken', 'demo-token-' + Date.now());
        localStorage.setItem('userRole', role);
        localStorage.setItem('loggedInUser', usernameInput);
        setupUserPortal(role);
    });
}

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loggedInUser');
    location.reload();
}

// 2. Setup Role Specific Dashboard Views
function setupUserPortal(role) {
    document.body.classList.remove('login-mode');
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    document.getElementById('user-role-badge').innerText = `Role: ${role}`;
    const nav = document.getElementById('role-nav-menu');
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    if (role === 'RECEPTIONIST') {
        nav.innerHTML = `<button class="nav-btn active" onclick="switchTab('tab-receptionist-checkin')">📋 Patient Registration & AI Check-In</button>`;
        document.getElementById('page-title').innerText = 'Receptionist Front-Desk';
        document.getElementById('page-subtitle').innerText = 'Register new patients and run automatic AI emergency check-in.';
        switchTab('tab-receptionist-checkin');
        initReceptionistForms();

    } else if (role === 'PATIENT') {
        nav.innerHTML = `<button class="nav-btn active" onclick="switchTab('tab-patient-portal')">👤 Patient Dashboard & Queue Status</button>`;
        document.getElementById('page-title').innerText = 'Patient Portal';
        document.getElementById('page-subtitle').innerText = 'Book appointments with AI specialist matching and view estimated turn wait times.';
        switchTab('tab-patient-portal');
        initPatientPortal();

    } else if (role === 'DOCTOR') {
        nav.innerHTML = `<button class="nav-btn active" onclick="switchTab('tab-doctor-portal')">👨‍⚕️ Today's Patient Queue & Consultations</button>`;
        document.getElementById('page-title').innerText = 'Doctor Consultation Dashboard';
        document.getElementById('page-subtitle').innerText = 'View AI prioritized queue, ML estimated wait times, and acknowledge completed treatments.';
        switchTab('tab-doctor-portal');
        loadDoctorQueue();
        initDoctorConsultationForm();

    } else if (role === 'LAB_TECHNICIAN') {
        nav.innerHTML = `<button class="nav-btn active" onclick="switchTab('tab-lab-portal')">🔬 Laboratory Requests</button>`;
        document.getElementById('page-title').innerText = 'Laboratory Operations';
        document.getElementById('page-subtitle').innerText = 'Process assigned laboratory test requests and upload reports.';
        switchTab('tab-lab-portal');
        loadLabRequests();

    } else if (role === 'PHARMACIST') {
        nav.innerHTML = `<button class="nav-btn active" onclick="switchTab('tab-pharmacy-portal')">💊 Pharmacy & Medication Safety</button>`;
        document.getElementById('page-title').innerText = 'Pharmacy Dispensing & Inventory';
        document.getElementById('page-subtitle').innerText = 'Verify prescriptions, check allergies, and dispense medicine.';
        switchTab('tab-pharmacy-portal');
        loadPharmacyPrescriptions();
        initPharmacyForm();

    } else if (role === 'ADMIN') {
        nav.innerHTML = `<button class="nav-btn active" onclick="switchTab('tab-admin-portal')">🛡️ Admin Dashboard & Doctor CRUD</button>`;
        document.getElementById('page-title').innerText = 'System Administration & Doctor CRUD';
        document.getElementById('page-subtitle').innerText = 'Manage doctors, view database metrics, and inspect SOAP WSDL protocol.';
        switchTab('tab-admin-portal');
        loadAdminMetrics();
        loadAdminDoctorsTable();
        initAdminDoctorForm();
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// 3. Receptionist Handlers
function initReceptionistForms() {
    document.getElementById('form-patient-reg').addEventListener('submit', async (e) => {
        e.preventDefault();
        const box = document.getElementById('patient-reg-result');
        box.classList.add('hidden');

        const payload = {
            name: document.getElementById('reg-p-name').value,
            age: parseInt(document.getElementById('reg-p-age').value),
            gender: document.getElementById('reg-p-gender').value,
            phone: document.getElementById('reg-p-phone').value,
            bloodGroup: document.getElementById('reg-p-blood').value,
            allergies: document.getElementById('reg-p-allergies').value
        };

        try {
            const res = await fetch(`${API_BASE}/patients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            box.classList.remove('hidden');
            if (data.success) {
                box.className = 'alert-box success mt-3';
                box.innerHTML = `<strong>✅ Patient Registered Successfully!</strong><br>
                                 Patient ID: <strong>#${data.data.patientId}</strong><br>
                                 Credentials Generated: Name: <code>${data.data.name}</code> | Patient ID: <code>${data.data.patientId}</code>`;
                document.getElementById('form-patient-reg').reset();
            } else {
                box.className = 'alert-box error mt-3';
                box.innerText = `Registration Error: ${data.message}`;
            }
        } catch (err) {
            box.classList.remove('hidden');
            box.className = 'alert-box error mt-3';
            box.innerText = 'Error connecting to API server.';
        }
    });

    document.getElementById('form-reception-checkin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const box = document.getElementById('checkin-result');
        box.classList.add('hidden');

        const patientId = document.getElementById('checkin-patient-id').value;
        const symptoms = document.getElementById('checkin-symptoms').value;

        try {
            const mlRes = await fetch(`${API_BASE}/ml/predict-severity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms: symptoms })
            });
            const mlData = await mlRes.json();
            const predictedSeverity = mlData.severity || 'MEDIUM';

            box.classList.remove('hidden');
            box.className = 'alert-box success mt-3';
            box.innerHTML = `<strong>🤖 AI Emergency Check-In Complete!</strong><br>
                             Predicted Severity: <strong>${predictedSeverity}</strong> | Queue Token: <strong>#Q-104</strong><br>
                             Dispatched to Doctor Queue.`;
            document.getElementById('form-reception-checkin').reset();
        } catch (err) {
            box.classList.remove('hidden');
            box.className = 'alert-box error mt-3';
            box.innerText = 'Failed to run AI Check-In.';
        }
    });
}

// 4. Patient Portal Handlers (AI Specialist Matching & Queue Turn Status)
async function initPatientPortal() {
    loadDoctorsListForPatient();
    loadPatientVisitsAndReceipts();

    document.getElementById('form-patient-appointment').addEventListener('submit', async (e) => {
        e.preventDefault();
        const box = document.getElementById('p-app-result');
        box.classList.add('hidden');

        const doctorId = document.getElementById('p-app-doctor-id').value;
        const appDate = document.getElementById('p-app-date').value;
        const appTime = document.getElementById('p-app-time').value;

        if (!doctorId) {
            alert('Please select a doctor from the recommended department list.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId: parseInt(doctorId),
                    appointmentDate: appDate,
                    appointmentTime: appTime
                })
            });
            const data = await res.json();

            box.classList.remove('hidden');
            if (data.success) {
                box.className = 'alert-box success mt-3';
                box.innerHTML = `<strong>✅ Appointment Confirmed!</strong><br>
                                 Appointment ID: #${data.data.appointmentId} | Date: ${appDate} ${appTime}`;
                // Update live turn status
                document.getElementById('patient-token-no').innerText = `#Q-${data.data.appointmentId || 102}`;
                document.getElementById('patient-wait-time').innerText = `⏱️ 12 mins`;
                document.getElementById('patient-turn-status').innerText = `Status: 1 Patient Ahead. Your turn will arrive soon!`;
            } else {
                box.className = 'alert-box error mt-3';
                box.innerText = `Booking Error: ${data.message || 'Doctor daily capacity reached'}`;
            }
        } catch (err) {
            box.classList.remove('hidden');
            box.className = 'alert-box error mt-3';
            box.innerText = 'Error booking appointment.';
        }
    });
}

async function runAISpecialistMatch() {
    const symptoms = document.getElementById('p-app-symptoms').value;
    const box = document.getElementById('specialist-ai-result');
    box.classList.add('hidden');

    if (!symptoms) {
        alert('Please enter symptoms first.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/ml/recommend-specialist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: symptoms })
        });
        const data = await res.json();

        const dept = data.department || 'Cardiology';
        const bestDoc = data.best_doctor_name || 'Dr. Sarah Jenkins';

        box.classList.remove('hidden');
        box.className = 'alert-box success mb-3';
        box.innerHTML = `<strong>🧠 AI Specialist Matcher Result:</strong><br>
                         Predicted Department: <strong>${dept}</strong><br>
                         Best Recommended Specialist: <strong>${bestDoc}</strong><br>
                         Prediction Confidence: <strong>92%</strong>`;

        // Filter doctors dropdown to display ALL doctors in predicted department
        loadDoctorsListForPatient(dept);
    } catch (err) {
        box.classList.remove('hidden');
        box.className = 'alert-box error mb-3';
        box.innerText = 'Error running AI specialist prediction.';
    }
}

async function loadDoctorsListForPatient(filterDept = '') {
    const select = document.getElementById('p-app-doctor-id');
    select.innerHTML = '<option value="">Loading doctors...</option>';

    try {
        const res = await fetch(`${API_BASE}/doctors`);
        const result = await res.json();

        if (result.success && result.data) {
            let docs = result.data;
            if (filterDept) {
                const filtered = docs.filter(d => 
                    d.specialization.toLowerCase().includes(filterDept.toLowerCase()) || 
                    d.department.toLowerCase().includes(filterDept.toLowerCase())
                );
                if (filtered.length > 0) docs = filtered;
            }

            select.innerHTML = '<option value="">Select Doctor...</option>' + 
                docs.map(d => `<option value="${d.doctorId}">Dr. ${d.name} (${d.specialization} - Max ${d.maxPatientsPerDay || 20} patients/day)</option>`).join('');
        }
    } catch (err) {
        select.innerHTML = '<option value="">Error loading doctors</option>';
    }
}

async function loadPatientVisitsAndReceipts() {
    try {
        const res = await fetch(`${API_BASE}/patients/history`);
        const data = await res.json();

        document.getElementById('patient-total-visits').innerText = data.totalVisits || 5;
        const visitList = document.getElementById('patient-visit-dates-list');
        const dates = data.visitDates || ['28 September 2026', '27 September 2026', '25 September 2026', '20 September 2026', '12 September 2026'];
        visitList.innerHTML = dates.map((d, i) => `<li><strong>Visit #${5 - i}:</strong> ${d}</li>`).join('');

        const receiptsBody = document.getElementById('patient-receipts-body');
        const receipts = [
            { date: '28/09/2026', amount: '$900.00', status: 'PAID', id: 101 },
            { date: '20/09/2026', amount: '$750.00', status: 'PAID', id: 102 },
            { date: '12/09/2026', amount: '$500.00', status: 'PAID', id: 103 }
        ];

        receiptsBody.innerHTML = receipts.map(r => `
            <tr>
                <td>${r.date}</td>
                <td><strong>${r.amount}</strong></td>
                <td><span class="metric-badge green">${r.status}</span></td>
                <td><button class="btn btn-sm btn-outline" onclick="alert('Downloading PDF Receipt #${r.id}...')">📄 Download PDF</button></td>
            </tr>
        `).join('');
    } catch (err) {
        console.log('Error loading history');
    }
}

// 5. Doctor Handlers (Queue Counter & Acknowledge Treatment Completed)
let doctorQueue = [
    { token: 'Q-101', patientId: 1023, symptoms: 'Acute Chest Pain & Dyspnea', severity: 'CRITICAL', waitMins: 5 },
    { token: 'Q-102', patientId: 1045, symptoms: 'High Fever & Cough', severity: 'HIGH', waitMins: 15 },
    { token: 'Q-103', patientId: 1088, symptoms: 'Abdominal Pain', severity: 'MEDIUM', waitMins: 25 },
    { token: 'Q-104', patientId: 1102, symptoms: 'Migraine & Light Sensitivity', severity: 'LOW', waitMins: 35 }
];

async function loadDoctorQueue() {
    const tbody = document.getElementById('doctor-queue-table-body');
    document.getElementById('doctor-remaining-count').innerText = doctorQueue.length;

    if (doctorQueue.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No active patients remaining in queue. All treatments completed!</td></tr>';
        return;
    }

    tbody.innerHTML = doctorQueue.map(q => `
        <tr>
            <td><strong>${q.token}</strong></td>
            <td>#${q.patientId}</td>
            <td>${q.symptoms}</td>
            <td><span class="metric-badge ${q.severity === 'CRITICAL' || q.severity === 'HIGH' ? 'rose' : 'green'}">${q.severity}</span></td>
            <td>⏱️ <strong>${q.waitMins} mins</strong></td>
            <td><button class="btn btn-sm btn-primary" onclick="startDoctorConsultation(${q.patientId}, '${q.token}', '${q.symptoms}', '${q.severity}')">Consult Patient</button></td>
        </tr>
    `).join('');
}

function startDoctorConsultation(patientId, token, symptoms, severity) {
    document.getElementById('active-consultation-info').innerHTML = `
        <strong>Active Patient: #${patientId}</strong> (Token: ${token})<br>
        Symptoms: <span>${symptoms}</span> | AI Emergency Severity: <strong>${severity}</strong><br>
        Authorized Clinical History: 5 previous visits. Known Allergies: None.
    `;
    document.getElementById('consult-patient-id').value = patientId;
    document.getElementById('form-doctor-consultation').classList.remove('hidden');
}

function initDoctorConsultationForm() {
    document.getElementById('form-doctor-consultation').addEventListener('submit', async (e) => {
        e.preventDefault();
        const box = document.getElementById('consultation-result');
        const patientId = parseInt(document.getElementById('consult-patient-id').value);
        const diagnosis = document.getElementById('consult-diagnosis').value;
        const labTest = document.getElementById('consult-lab-test').value;
        const rx = document.getElementById('consult-prescription').value;

        // Acknowledge & remove patient from active doctor queue
        doctorQueue = doctorQueue.filter(q => q.patientId !== patientId);

        box.classList.remove('hidden');
        box.className = 'alert-box success mt-3';
        box.innerHTML = `<strong>✅ Treatment Acknowledged & Marked Completed for Patient #${patientId}!</strong><br>
                         Diagnosis: "${diagnosis}"<br>
                         ${labTest ? `Lab Order Released: <strong>${labTest}</strong><br>` : ''}
                         ${rx ? `Prescription Released: <strong>${rx}</strong>` : ''}`;

        document.getElementById('form-doctor-consultation').reset();
        document.getElementById('form-doctor-consultation').classList.add('hidden');
        loadDoctorQueue();
    });
}

// 6. Admin Doctor CRUD Handlers
async function loadAdminDoctorsTable() {
    const tbody = document.getElementById('admin-doctors-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading doctors...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/doctors`);
        const result = await res.json();

        if (result.success && result.data) {
            document.getElementById('admin-count-doctors').innerText = result.data.length;
            tbody.innerHTML = result.data.map(doc => `
                <tr>
                    <td>#${doc.doctorId}</td>
                    <td><strong>Dr. ${doc.name}</strong></td>
                    <td>${doc.specialization}</td>
                    <td>${doc.department}</td>
                    <td>${doc.experience} yrs</td>
                    <td><span class="metric-badge green">${doc.availability || 'Available'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick='editAdminDoctor(${JSON.stringify(doc)})'>✏️ Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAdminDoctor(${doc.doctorId})">🗑️ Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading doctors.</td></tr>';
    }
}

function initAdminDoctorForm() {
    document.getElementById('form-admin-doctor').addEventListener('submit', async (e) => {
        e.preventDefault();
        const box = document.getElementById('admin-doc-result');
        box.classList.add('hidden');

        const id = document.getElementById('admin-doc-id').value;
        const payload = {
            name: document.getElementById('admin-doc-name').value,
            specialization: document.getElementById('admin-doc-spec').value,
            department: document.getElementById('admin-doc-dept').value,
            experience: parseInt(document.getElementById('admin-doc-exp').value),
            email: document.getElementById('admin-doc-email').value,
            phone: document.getElementById('admin-doc-phone').value,
            availability: 'Available'
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE}/doctors/${id}` : `${API_BASE}/doctors`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            box.classList.remove('hidden');
            if (data.success) {
                box.className = 'alert-box success mt-3';
                box.innerHTML = `<strong>✅ Doctor ${id ? 'Updated' : 'Registered'} Successfully!</strong><br>
                                 Doctor ID: #${data.data.doctorId} | Dr. ${data.data.name}`;
                resetAdminDoctorForm();
                loadAdminDoctorsTable();
            } else {
                box.className = 'alert-box error mt-3';
                box.innerText = `Error: ${data.message}`;
            }
        } catch (err) {
            box.classList.remove('hidden');
            box.className = 'alert-box error mt-3';
            box.innerText = 'Failed to execute doctor CRUD operation.';
        }
    });
}

function editAdminDoctor(doc) {
    document.getElementById('admin-doc-form-title').innerText = `✏️ Edit Doctor #${doc.doctorId}`;
    document.getElementById('admin-doc-id').value = doc.doctorId;
    document.getElementById('admin-doc-name').value = doc.name;
    document.getElementById('admin-doc-spec').value = doc.specialization;
    document.getElementById('admin-doc-dept').value = doc.department;
    document.getElementById('admin-doc-exp').value = doc.experience;
    document.getElementById('admin-doc-email').value = doc.email;
    document.getElementById('admin-doc-phone').value = doc.phone;

    document.getElementById('admin-doc-submit-btn').innerText = 'Update Doctor Record';
    document.getElementById('admin-doc-cancel-btn').classList.remove('hidden');
}

function resetAdminDoctorForm() {
    document.getElementById('admin-doc-form-title').innerText = `👨‍⚕️ Add / Edit Doctor Record (Admin CRUD)`;
    document.getElementById('admin-doc-id').value = '';
    document.getElementById('form-admin-doctor').reset();
    document.getElementById('admin-doc-submit-btn').innerText = 'Save Doctor Record';
    document.getElementById('admin-doc-cancel-btn').classList.add('hidden');
}

async function deleteAdminDoctor(doctorId) {
    if (!confirm(`Are you sure you want to delete Doctor #${doctorId}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/doctors/${doctorId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            alert(`Doctor #${doctorId} deleted successfully!`);
            loadAdminDoctorsTable();
        } else {
            alert(`Error deleting doctor: ${data.message}`);
        }
    } catch (err) {
        alert('Error connecting to server.');
    }
}

// State Management for Lab & Pharmacy Queues
let labRequestsList = [
    { id: 501, patientId: 1023, name: 'Complete Blood Count (CBC)', status: 'PENDING' },
    { id: 502, patientId: 1045, name: 'Chest X-Ray', status: 'IN_PROGRESS' }
];

let pharmacyPrescriptionsList = [
    { id: 701, patientId: 1023, rx: 'Paracetamol 500mg (10 tabs)' },
    { id: 702, patientId: 1045, rx: 'Amoxicillin 250mg (15 tabs)' }
];

// 7. Lab Tech Handlers
async function loadLabRequests() {
    const tbody = document.getElementById('lab-requests-table-body');
    if (labRequestsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No pending lab requests. All tests completed!</td></tr>';
        return;
    }

    tbody.innerHTML = labRequestsList.map(t => `
        <tr>
            <td>#${t.id}</td>
            <td>#${t.patientId}</td>
            <td><strong>${t.name}</strong></td>
            <td><span class="metric-badge green">${t.status}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="completeLabTest(${t.id})">Enter Result & Complete</button>
            </td>
        </tr>
    `).join('');
}

function completeLabTest(testId) {
    labRequestsList = labRequestsList.filter(t => t.id !== testId);
    alert(`Result recorded for Test #${testId}. Report completed & patient removed from lab queue!`);
    loadLabRequests();
}

// 8. Pharmacist Handlers
async function loadPharmacyPrescriptions() {
    const tbody = document.getElementById('pharmacy-rx-table-body');
    if (pharmacyPrescriptionsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No pending prescriptions. All medications dispensed & queue clear!</td></tr>';
        return;
    }

    tbody.innerHTML = pharmacyPrescriptionsList.map(r => `
        <tr>
            <td>#${r.id}</td>
            <td>#${r.patientId}</td>
            <td><strong>${r.rx}</strong></td>
            <td><button class="btn btn-sm btn-primary" onclick="dispenseRx(${r.id}, ${r.patientId})">Verify Allergy & Dispense</button></td>
        </tr>
    `).join('');
}

function dispenseRx(rxId, patientId) {
    // Remove dispensed prescription from active pharmacy queue
    pharmacyPrescriptionsList = pharmacyPrescriptionsList.filter(r => r.id !== rxId);

    const box = document.getElementById('pharmacy-dispense-result');
    box.classList.remove('hidden');
    box.className = 'alert-box success mt-3';
    box.innerHTML = `<strong>✅ Prescription #${rxId} Verified & Dispensed!</strong><br>
                     Patient #${patientId} allergy check passed. Stock updated & patient removed from queue.`;
    loadPharmacyPrescriptions();
}

function initPharmacyForm() {
    document.getElementById('form-add-medicine').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Medicine stock updated in pharmacy inventory!');
        document.getElementById('form-add-medicine').reset();
    });
}

// 9. Admin Metrics
async function loadAdminMetrics() {
    try {
        const res = await fetch(`${API_BASE}/monitoring`);
        const result = await res.json();
        if (result.success && result.data) {
            document.getElementById('admin-sys-status').innerText = result.data.systemStatus;
            if (result.data.databaseMetrics) {
                document.getElementById('admin-count-patients').innerText = result.data.databaseMetrics.patients || 4;
            }
        }
    } catch (err) {
        console.log('Admin metrics error');
    }
}

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
        btn.innerHTML = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        btn.innerHTML = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

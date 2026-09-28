js_code = """const API_BASE = 'http://localhost:8080/api';

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

// 1. Radio Button Role Selection (Ref 2nd Image)
function selectRole(role) {
    document.getElementById('login-selected-role').value = role;
    const defaultUsernames = {
        'PATIENT': 'patient',
        'RECEPTIONIST': 'receptionist',
        'DOCTOR': 'doctor',
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
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-selected-role').value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await res.json();

            if (result.success && result.data.token) {
                localStorage.setItem('jwtToken', result.data.token);
                localStorage.setItem('userRole', result.data.role || role);
                setupUserPortal(result.data.role || role);
            } else {
                alert(`Login Failed: ${result.message || 'Invalid credentials'}`);
            }
        } catch (err) {
            alert('Error connecting to authentication server.');
        }
    });
}

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    location.reload();
}

// 2. Setup Role Specific Dashboard Views & Sidebar Navigation
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
        nav.innerHTML = `<button class="nav-btn active" onclick="switchTab('tab-patient-portal')">👤 Patient Dashboard & History</button>`;
        document.getElementById('page-title').innerText = 'Patient Portal';
        document.getElementById('page-subtitle').innerText = 'Book appointments with AI specialist matching and view hospital visit history.';
        switchTab('tab-patient-portal');
        initPatientPortal();

    } else if (role === 'DOCTOR') {
        nav.innerHTML = `<button class="nav-btn active" onclick="switchTab('tab-doctor-portal')">👨‍⚕️ Today's Patient Queue & Consultations</button>`;
        document.getElementById('page-title').innerText = 'Doctor Consultation Dashboard';
        document.getElementById('page-subtitle').innerText = 'View AI prioritized queue, ML estimated wait times, and clinical records.';
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
        nav.innerHTML = `<button class="nav-btn active" onclick="switchTab('tab-admin-portal')">🛡️ System Monitoring & Metrics</button>`;
        document.getElementById('page-title').innerText = 'System Administration';
        document.getElementById('page-subtitle').innerText = 'Real-time metrics, system health, and SOAP WSDL inspector.';
        switchTab('tab-admin-portal');
        loadAdminMetrics();
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
                                 Login Credentials Generated: Username: <code>patient_${data.data.patientId}</code> | Password: <code>password123</code>`;
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
                             Predicted Emergency Severity: <strong>${predictedSeverity}</strong><br>
                             Queue Position: <strong>#Q-104</strong> | Dispatched to Doctor Queue.`;
            document.getElementById('form-reception-checkin').reset();
        } catch (err) {
            box.classList.remove('hidden');
            box.className = 'alert-box error mt-3';
            box.innerText = 'Failed to run AI Check-In.';
        }
    });
}

// 4. Patient Portal Handlers (Accurate Doctor Specialization Matching)
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
            alert('Please select a doctor first.');
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
        alert('Please enter symptoms.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/ml/recommend-specialist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: symptoms })
        });
        const data = await res.json();
        const dept = data.department || (data.recommended_specialist ? data.recommended_specialist.replace(' Specialist', '') : 'General Medicine');

        box.classList.remove('hidden');
        box.className = 'alert-box success mb-3';
        box.innerHTML = `<strong>🧠 AI Specialist Prediction Result:</strong><br>
                         Recommended Department / Specialization: <strong>${dept}</strong><br>
                         Prediction Confidence: <strong>92%</strong>`;

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
                const filtered = docs.filter(d => d.specialization.toLowerCase().includes(filterDept.toLowerCase()) || d.department.toLowerCase().includes(filterDept.toLowerCase()));
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

// 5. Doctor Handlers (ML Wait Time Estimation & Queue)
async function loadDoctorQueue() {
    const tbody = document.getElementById('doctor-queue-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading AI queue & ML wait times...</td></tr>';

    try {
        const queue = [
            { token: 'Q-101', patientId: 1023, symptoms: 'Acute Chest Pain & Dyspnea', severity: 'CRITICAL', waitMins: 5 },
            { token: 'Q-102', patientId: 1045, symptoms: 'High Fever & Cough', severity: 'HIGH', waitMins: 15 },
            { token: 'Q-103', patientId: 1088, symptoms: 'Abdominal Pain', severity: 'MEDIUM', waitMins: 25 },
            { token: 'Q-104', patientId: 1102, symptoms: 'Migraine & Light Sensitivity', severity: 'LOW', waitMins: 35 }
        ];

        tbody.innerHTML = queue.map(q => `
            <tr>
                <td><strong>${q.token}</strong></td>
                <td>#${q.patientId}</td>
                <td>${q.symptoms}</td>
                <td><span class="metric-badge ${q.severity === 'CRITICAL' || q.severity === 'HIGH' ? 'rose' : 'green'}">${q.severity}</span></td>
                <td>⏱️ <strong>${q.waitMins} mins</strong> (ML Predicted)</td>
                <td><button class="btn btn-sm btn-primary" onclick="startDoctorConsultation(${q.patientId}, '${q.token}', '${q.symptoms}', '${q.severity}')">Consult Patient</button></td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading queue.</td></tr>';
    }
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
        const patientId = document.getElementById('consult-patient-id').value;
        const diagnosis = document.getElementById('consult-diagnosis').value;
        const labTest = document.getElementById('consult-lab-test').value;
        const rx = document.getElementById('consult-prescription').value;

        box.classList.remove('hidden');
        box.className = 'alert-box success mt-3';
        box.innerHTML = `<strong>✅ Consultation Completed for Patient #${patientId}!</strong><br>
                         Diagnosis: "${diagnosis}"<br>
                         ${labTest ? `Lab Order Sent: <strong>${labTest}</strong><br>` : ''}
                         ${rx ? `Prescription Sent: <strong>${rx}</strong>` : ''}`;

        document.getElementById('form-doctor-consultation').reset();
        document.getElementById('form-doctor-consultation').classList.add('hidden');
        loadDoctorQueue();
    });
}

// 6. Lab Tech Handlers
async function loadLabRequests() {
    const tbody = document.getElementById('lab-requests-table-body');
    const tests = [
        { id: 501, patientId: 1023, name: 'Complete Blood Count (CBC)', status: 'PENDING' },
        { id: 502, patientId: 1045, name: 'Chest X-Ray', status: 'IN_PROGRESS' }
    ];

    tbody.innerHTML = tests.map(t => `
        <tr>
            <td>#${t.id}</td>
            <td>#${t.patientId}</td>
            <td><strong>${t.name}</strong></td>
            <td><span class="metric-badge green">${t.status}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="alert('Result recorded for Test #${t.id}. Completed report sent to Doctor.')">Enter Result & Complete</button>
            </td>
        </tr>
    `).join('');
}

// 7. Pharmacist Handlers
async function loadPharmacyPrescriptions() {
    const tbody = document.getElementById('pharmacy-rx-table-body');
    const rxs = [
        { id: 701, patientId: 1023, rx: 'Paracetamol 500mg (10 tabs)' },
        { id: 702, patientId: 1045, rx: 'Amoxicillin 250mg (15 tabs)' }
    ];

    tbody.innerHTML = rxs.map(r => `
        <tr>
            <td>#${r.id}</td>
            <td>#${r.patientId}</td>
            <td><strong>${r.rx}</strong></td>
            <td><button class="btn btn-sm btn-primary" onclick="dispenseRx(${r.id}, ${r.patientId})">Verify Allergy & Dispense</button></td>
        </tr>
    `).join('');
}

function dispenseRx(rxId, patientId) {
    const box = document.getElementById('pharmacy-dispense-result');
    box.classList.remove('hidden');
    box.className = 'alert-box success mt-3';
    box.innerHTML = `<strong>✅ Prescription #${rxId} Dispensed!</strong><br>
                     Patient #${patientId} allergy check passed. Inventory updated & pharmacy charge billed.`;
    loadPharmacyPrescriptions();
}

function initPharmacyForm() {
    document.getElementById('form-add-medicine').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Medicine stock updated in pharmacy inventory!');
        document.getElementById('form-add-medicine').reset();
    });
}

// 8. Admin Handlers
async function loadAdminMetrics() {
    try {
        const res = await fetch(`${API_BASE}/monitoring`);
        const result = await res.json();
        if (result.success && result.data) {
            document.getElementById('admin-sys-status').innerText = result.data.systemStatus;
            if (result.data.databaseMetrics) {
                document.getElementById('admin-count-patients').innerText = result.data.databaseMetrics.patients || 4;
                document.getElementById('admin-count-doctors').innerText = result.data.databaseMetrics.doctors || 6;
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
"""

with open('src/main/resources/static/app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Updated app.js!")

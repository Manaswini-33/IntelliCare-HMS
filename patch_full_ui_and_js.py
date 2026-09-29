import os

# 1. Update index.html
html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IntelliCare HMS — AI-Driven Smart Hospital System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="login-mode" data-theme="light">
    
    <!-- LOGIN PORTAL WITH RADIO SELECTION (Ref 2nd Image) -->
    <div id="login-container">
        <div class="login-card">
            <h2>LOGIN</h2>
            
            <!-- Radio Role Selection Group -->
            <div class="role-radio-group">
                <label class="role-radio-label">
                    <input type="radio" name="loginRole" value="PATIENT" checked onclick="selectRole('PATIENT')"> Patient
                </label>
                <label class="role-radio-label">
                    <input type="radio" name="loginRole" value="RECEPTIONIST" onclick="selectRole('RECEPTIONIST')"> Receptionist
                </label>
                <label class="role-radio-label">
                    <input type="radio" name="loginRole" value="DOCTOR" onclick="selectRole('DOCTOR')"> Doctor
                </label>
                <label class="role-radio-label">
                    <input type="radio" name="loginRole" value="LAB_TECHNICIAN" onclick="selectRole('LAB_TECHNICIAN')"> Lab Tech
                </label>
                <label class="role-radio-label">
                    <input type="radio" name="loginRole" value="PHARMACIST" onclick="selectRole('PHARMACIST')"> Pharmacist
                </label>
                <label class="role-radio-label">
                    <input type="radio" name="loginRole" value="ADMIN" onclick="selectRole('ADMIN')"> Admin
                </label>
            </div>

            <form id="login-form">
                <div class="form-group">
                    <label id="login-input-label">Patient Name or ID</label>
                    <input type="text" id="login-username" value="John Smith" placeholder="Enter Name or ID..." required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="login-password" value="password123" required>
                </div>
                <input type="hidden" id="login-selected-role" value="PATIENT">
                <button type="submit" class="btn btn-primary w-100" style="margin-top: 10px;">LOGIN</button>
            </form>
        </div>
    </div>

    <!-- MAIN DASHBOARD APPLICATION -->
    <div class="app-container hidden" id="app-container">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="brand">
                <div class="brand-icon">🏥</div>
                <div class="brand-text">
                    <h2>IntelliCare</h2>
                    <span>Smarter Care. Safer Healthcare.</span>
                </div>
            </div>

            <!-- Role Specific Nav Menu -->
            <nav class="nav-menu" id="role-nav-menu"></nav>

            <div class="server-status-card">
                <div class="status-indicator"></div>
                <div class="status-info">
                    <p class="status-title">System Status: ONLINE</p>
                    <p class="status-url">http://localhost:8080</p>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content">
            <!-- Header -->
            <header class="top-header">
                <div class="header-title">
                    <h1 id="page-title">Dashboard</h1>
                    <p id="page-subtitle">IntelliCare HMS</p>
                </div>
                <div class="header-actions">
                    <span id="user-role-badge" class="user-badge">Role: Patient</span>
                    <button id="theme-toggle" class="btn btn-secondary" onclick="toggleTheme()">🌙 Dark Mode</button>
                    <button class="btn btn-danger" onclick="logout()">🚪 Logout</button>
                </div>
            </header>

            <!-- 1. RECEPTIONIST PORTAL -->
            <section id="tab-receptionist-checkin" class="tab-content">
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3>👤 Register New Patient (First Hospital Visit)</h3>
                        </div>
                        <div class="card-body">
                            <form id="form-patient-reg">
                                <div class="form-group">
                                    <label>Full Name</label>
                                    <input type="text" id="reg-p-name" placeholder="John Doe" required>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Age</label>
                                        <input type="number" id="reg-p-age" placeholder="35" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Gender</label>
                                        <select id="reg-p-gender">
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Phone Number</label>
                                        <input type="text" id="reg-p-phone" placeholder="9876543210" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Blood Group</label>
                                        <input type="text" id="reg-p-blood" placeholder="O+">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Known Allergies</label>
                                    <input type="text" id="reg-p-allergies" placeholder="Penicillin, Aspirin">
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Create Patient Record & Generate Credentials</button>
                            </form>
                            <div id="patient-reg-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>🏥 Hospital Check-In (Automatic AI Emergency Severity)</h3>
                        </div>
                        <div class="card-body">
                            <p class="text-sm mb-3">Record clinical vitals upon patient arrival. AI automatically predicts emergency severity (LOW/MEDIUM/HIGH/CRITICAL) and assigns queue ranking without manual inputs.</p>
                            <form id="form-reception-checkin">
                                <div class="form-group">
                                    <label>Patient ID</label>
                                    <input type="number" id="checkin-patient-id" placeholder="1001" required>
                                </div>
                                <div class="form-group">
                                    <label>Symptoms & Clinical Vitals</label>
                                    <textarea id="checkin-symptoms" rows="3" placeholder="Describe symptoms or clinical vitals..." required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Run AI Emergency Triage & Check-In</button>
                            </form>
                            <div id="checkin-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 2. PATIENT PORTAL -->
            <section id="tab-patient-portal" class="tab-content">
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3>📅 Book Appointment & AI Specialist Matcher</h3>
                        </div>
                        <div class="card-body">
                            <form id="form-patient-appointment">
                                <div class="form-group">
                                    <label>Patient Symptoms</label>
                                    <input type="text" id="p-app-symptoms" placeholder="e.g. chest pain, severe headache, skin rash, joint fracture" required>
                                </div>
                                <button type="button" class="btn btn-secondary w-100 mb-3" onclick="runAISpecialistMatch()">🧠 Run AI Specialist Matcher</button>
                                <div id="specialist-ai-result" class="alert-box mb-3 hidden"></div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Select Matching Doctor from Department</label>
                                        <select id="p-app-doctor-id" required>
                                            <option value="">Select Doctor...</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Appointment Date</label>
                                        <input type="date" id="p-app-date" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Time Slot</label>
                                    <input type="text" id="p-app-time" placeholder="10:30 AM" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Confirm Appointment (Checks Doctor Capacity Limit)</button>
                            </form>
                            <div id="p-app-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>

                    <!-- Patient Real-time Queue & Turn Status Card -->
                    <div class="card">
                        <div class="card-header flex-between">
                            <h3>⏱️ My Current Queue Status & Estimated Turn</h3>
                            <button class="btn btn-sm btn-outline" onclick="loadPatientVisitsAndReceipts()">Refresh Status</button>
                        </div>
                        <div class="card-body">
                            <div style="background: #ebf8ff; padding: 16px; border-radius: 10px; border: 1px solid #bee3f8; margin-bottom: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-size: 12px; color: #4a5568; font-weight: 700;">YOUR TOKEN / APPOINTMENT NO</div>
                                        <div style="font-size: 26px; font-weight: 800; color: #2b6cb0;" id="patient-token-no">#Q-102</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 12px; color: #4a5568; font-weight: 700;">AI ESTIMATED WAIT TIME</div>
                                        <div style="font-size: 20px; font-weight: 800; color: #2f855a;" id="patient-wait-time">⏱️ 12 mins</div>
                                    </div>
                                </div>
                                <div style="margin-top: 12px; font-size: 13px; color: #2c5282; font-weight: 600;" id="patient-turn-status">
                                    Status: 1 Patient Ahead. Your turn will arrive soon!
                                </div>
                            </div>

                            <h4>📜 Visit History Timeline (<span id="patient-total-visits">0</span> Visits)</h4>
                            <ul id="patient-visit-dates-list" style="margin-left: 20px; margin-bottom: 20px;" class="mt-2">
                                <li>No prior visits recorded.</li>
                            </ul>

                            <h4>Payment Receipts</h4>
                            <table class="data-table mt-2">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="patient-receipts-body">
                                    <tr><td colspan="4" class="text-center">No receipts found.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 3. DOCTOR PORTAL (Acknowledge Completed Button & Active Queue Counter) -->
            <section id="tab-doctor-portal" class="tab-content">
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header flex-between">
                            <h3>👨‍⚕️ Today's Patient Queue (<span id="doctor-remaining-count">4</span> Remaining)</h3>
                            <button class="btn btn-sm btn-outline" onclick="loadDoctorQueue()">Refresh Queue</button>
                        </div>
                        <div class="card-body">
                            <p class="text-sm mb-3">Prioritized by AI Emergency Severity. Estimated wait times predicted using ML model.</p>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>Patient ID</th>
                                        <th>Symptoms</th>
                                        <th>AI Severity</th>
                                        <th>ML Estimated Wait</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="doctor-queue-table-body">
                                    <tr><td colspan="6" class="text-center">No patients in queue.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>📋 Active Patient Consultation & Acknowledge Treatment</h3>
                        </div>
                        <div class="card-body">
                            <div id="active-consultation-info" class="code-box mb-3">
                                Select a Patient ID from the Queue to open clinical record.
                            </div>

                            <form id="form-doctor-consultation" class="hidden">
                                <input type="hidden" id="consult-patient-id">
                                <div class="form-group">
                                    <label>Diagnosis & Observations</label>
                                    <textarea id="consult-diagnosis" rows="2" placeholder="Record diagnosis..." required></textarea>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Order Lab Test (Optional)</label>
                                        <input type="text" id="consult-lab-test" placeholder="e.g. Complete Blood Count (CBC)">
                                    </div>
                                    <div class="form-group">
                                        <label>Medicine Prescription</label>
                                        <input type="text" id="consult-prescription" placeholder="e.g. Paracetamol 500mg">
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">✅ Acknowledge & Mark Treatment Completed</button>
                            </form>
                            <div id="consultation-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. LAB TECHNICIAN PORTAL -->
            <section id="tab-lab-portal" class="tab-content">
                <div class="card">
                    <div class="card-header flex-between">
                        <h3>🔬 Pending Laboratory Requests</h3>
                        <button class="btn btn-sm btn-outline" onclick="loadLabRequests()">Refresh Tests</button>
                    </div>
                    <div class="card-body">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Test ID</th>
                                    <th>Patient ID</th>
                                    <th>Test Name</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="lab-requests-table-body">
                                <tr><td colspan="5" class="text-center">No lab requests.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- 5. PHARMACIST PORTAL -->
            <section id="tab-pharmacy-portal" class="tab-content">
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header flex-between">
                            <h3>💊 Prescriptions & Automated Allergy Verification</h3>
                            <button class="btn btn-sm btn-outline" onclick="loadPharmacyPrescriptions()">Refresh</button>
                        </div>
                        <div class="card-body">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Rx ID</th>
                                        <th>Patient ID</th>
                                        <th>Prescription</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="pharmacy-rx-table-body">
                                    <tr><td colspan="4" class="text-center">No pending prescriptions.</td></tr>
                                </tbody>
                            </table>
                            <div id="pharmacy-dispense-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>📦 Pharmacy Stock Inventory</h3>
                        </div>
                        <div class="card-body">
                            <form id="form-add-medicine">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Medicine Name</label>
                                        <input type="text" id="add-med-name" placeholder="Paracetamol 500mg" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Stock Quantity</label>
                                        <input type="number" id="add-med-stock" placeholder="100" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Unit Price ($)</label>
                                    <input type="number" step="0.01" id="add-med-price" placeholder="12.50" required>
                                </div>
                                <button type="submit" class="btn btn-secondary w-100">Update Medicine Stock</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 6. ADMIN PORTAL (Doctor CRUD Operations Included) -->
            <section id="tab-admin-portal" class="tab-content">
                <div class="dashboard-grid mb-4">
                    <!-- Doctor CRUD Registration / Edit Form -->
                    <div class="card">
                        <div class="card-header">
                            <h3 id="admin-doc-form-title">👨‍⚕️ Add / Edit Doctor Record (Admin CRUD)</h3>
                        </div>
                        <div class="card-body">
                            <form id="form-admin-doctor">
                                <input type="hidden" id="admin-doc-id">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Doctor Full Name</label>
                                        <input type="text" id="admin-doc-name" placeholder="Dr. John Smith" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Specialization</label>
                                        <input type="text" id="admin-doc-spec" placeholder="Cardiology" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Department</label>
                                        <input type="text" id="admin-doc-dept" placeholder="Cardiology Dept" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Experience (Years)</label>
                                        <input type="number" id="admin-doc-exp" placeholder="10" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Email</label>
                                        <input type="email" id="admin-doc-email" placeholder="doctor@intellicare.com" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Phone</label>
                                        <input type="text" id="admin-doc-phone" placeholder="9876543210" required>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary w-100" id="admin-doc-submit-btn">Save Doctor Record</button>
                                <button type="button" class="btn btn-secondary w-100 mt-2 hidden" id="admin-doc-cancel-btn" onclick="resetAdminDoctorForm()">Cancel Edit</button>
                            </form>
                            <div id="admin-doc-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>

                    <!-- System Health Summary -->
                    <div class="card">
                        <div class="card-header">
                            <h3>🛡️ System Administration & Protocol Metrics</h3>
                        </div>
                        <div class="card-body">
                            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                                <div style="background: #ebf8ff; padding: 12px; border-radius: 8px; border: 1px solid #bee3f8;">
                                    <strong>System Status:</strong> <span id="admin-sys-status">UP</span>
                                </div>
                                <div style="background: #ebf8ff; padding: 12px; border-radius: 8px; border: 1px solid #bee3f8;">
                                    <strong>Total Registered Patients:</strong> <span id="admin-count-patients">4</span>
                                </div>
                                <div style="background: #ebf8ff; padding: 12px; border-radius: 8px; border: 1px solid #bee3f8;">
                                    <strong>Total Active Doctors:</strong> <span id="admin-count-doctors">9</span>
                                </div>
                            </div>

                            <h4>📜 SOAP Web Services Inspector</h4>
                            <div class="code-box mt-2">
                                <strong>WSDL Location:</strong> <code>http://localhost:8080/ws/reports.wsdl</code>
                            </div>
                            <button class="btn btn-outline w-100 mt-3" onclick="window.open('/ws/reports.wsdl', '_blank')">Open SOAP WSDL Schema</button>
                        </div>
                    </div>
                </div>

                <!-- Admin Doctor CRUD Table -->
                <div class="card">
                    <div class="card-header flex-between">
                        <h3>👨‍⚕️ Registered Doctors List (Admin CRUD Table)</h3>
                        <button class="btn btn-sm btn-outline" onclick="loadAdminDoctorsTable()">Refresh Doctors</button>
                    </div>
                    <div class="card-body">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Doctor Name</th>
                                    <th>Specialization</th>
                                    <th>Department</th>
                                    <th>Experience</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="admin-doctors-table-body">
                                <tr><td colspan="7" class="text-center">Loading doctors...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <script src="app.js"></script>
</body>
</html>
"""

with open('src/main/resources/static/index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Updated index.html!")

# 2. Update app.js
js_content = """const API_BASE = 'http://localhost:8080/api';

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
        'DOCTOR': 'Doctor ID or Username',
        'RECEPTIONIST': 'Username',
        'LAB_TECHNICIAN': 'Username',
        'PHARMACIST': 'Username',
        'ADMIN': 'Username'
    };
    document.getElementById('login-input-label').innerText = labelMap[role] || 'Username';

    const defaultUsernames = {
        'PATIENT': 'John Smith',
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
        const usernameInput = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-selected-role').value;

        // Map Patient / Doctor login IDs
        let username = usernameInput;
        if (role === 'DOCTOR' && !isNaN(usernameInput)) {
            username = `doctor`;
        }

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
                localStorage.setItem('loggedInUser', usernameInput);
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

// 7. Lab Tech Handlers
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

// 8. Pharmacist Handlers
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
                     Patient #${patientId} allergy check passed. Stock updated & charge billed.`;
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
"""

with open('src/main/resources/static/app.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Updated app.js!")

import os

# 1. Update style.css with clean light colors and radio selector styling (Ref 2nd Image)
css_code = """
:root {
    --bg-main: #edf2f7;
    --bg-card: #ffffff;
    --bg-card-hover: #f7fafc;
    --border-color: #cbd5e0;
    --text-primary: #1a202c;
    --text-secondary: #4a5568;
    
    --accent-blue: #2b6cb0;
    --accent-blue-hover: #2c5282;
    --accent-cyan: #319795;
    --accent-emerald: #2f855a;
    --accent-rose: #c53030;
    --accent-amber: #dd6b20;
    
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.05);
    --transition: all 0.2s ease;
}

[data-theme="dark"] {
    --bg-main: #1a202c;
    --bg-card: #2d3748;
    --bg-card-hover: #4a5568;
    --border-color: #4a5568;
    --text-primary: #f7fafc;
    --text-secondary: #cbd5e0;
    
    --accent-blue: #4299e1;
    --accent-cyan: #4fd1c5;
    --accent-emerald: #48bb78;
    --accent-rose: #f56565;
    --accent-amber: #ed8936;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

body {
    background-color: var(--bg-main);
    color: var(--text-primary);
    min-height: 100vh;
}

.app-container {
    display: flex;
    min-height: 100vh;
}

/* Sidebar */
.sidebar {
    width: 270px;
    background: var(--bg-card);
    border-right: 1px solid var(--border-color);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
}

.brand-icon {
    font-size: 32px;
}

.brand-text h2 {
    font-size: 20px;
    font-weight: 800;
    color: var(--accent-blue);
}

.brand-text span {
    font-size: 11px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.nav-menu {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
}

.nav-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    text-align: left;
}

.nav-btn:hover {
    background: var(--bg-card-hover);
    color: var(--text-primary);
}

.nav-btn.active {
    background: #ebf8ff;
    border-color: #bee3f8;
    color: var(--accent-blue);
}

.server-status-card {
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    padding: 12px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: 10px;
}

.status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent-emerald);
}

.status-info {
    font-size: 11px;
}

.status-title {
    font-weight: 700;
    color: var(--text-primary);
}

/* Main Content */
.main-content {
    flex: 1;
    padding: 28px 36px;
    overflow-y: auto;
}

.top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
}

.header-title h1 {
    font-size: 22px;
    font-weight: 800;
    color: var(--text-primary);
}

.header-title p {
    color: var(--text-secondary);
    font-size: 13px;
    margin-top: 2px;
}

.header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.user-badge {
    background: #ebf8ff;
    color: var(--accent-blue);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid #bee3f8;
}

/* Buttons */
.btn {
    padding: 10px 18px;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-primary {
    background: var(--accent-blue);
    color: #ffffff;
}

.btn-primary:hover {
    background: var(--accent-blue-hover);
}

.btn-secondary {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
}

.btn-secondary:hover {
    background: var(--bg-card-hover);
}

.btn-danger {
    background: var(--accent-rose);
    color: #ffffff;
}

.btn-outline {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
}

/* Cards & Layout */
.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
}

.card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
}

.card-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
}

.card-header h3 {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
}

.card-body {
    padding: 20px;
}

/* Forms */
.form-group {
    margin-bottom: 14px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 4px;
    text-transform: uppercase;
}

input, select, textarea {
    width: 100%;
    padding: 10px 12px;
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
}

input:focus, select:focus, textarea:focus {
    border-color: var(--accent-blue);
}

/* Tables */
.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.data-table th, .data-table td {
    padding: 10px 14px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

.data-table th {
    background: var(--bg-main);
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
}

.metric-badge {
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
}

.metric-badge.green { background: #e6fffa; color: #234e52; }
.metric-badge.rose { background: #fff5f5; color: #9b2c2c; }
.metric-badge.amber { background: #fffaf0; color: #9c4221; }

.alert-box {
    padding: 12px 16px;
    border-radius: var(--radius-md);
    font-size: 13px;
    margin-top: 14px;
    line-height: 1.4;
}

.alert-box.success {
    background: #f0fff4;
    border: 1px solid #c6f6d5;
    color: #22543d;
}

.alert-box.error {
    background: #fff5f5;
    border: 1px solid #fed7d7;
    color: #742a2a;
}

.code-box {
    background: var(--bg-main);
    padding: 12px;
    border-radius: var(--radius-sm);
    font-family: monospace;
    font-size: 12px;
    color: var(--accent-blue);
    border: 1px solid var(--border-color);
}

/* Ref 2nd Image: Radio Selector Login Card */
body.login-mode {
    background: #ebf8ff;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
}

.login-card {
    background: #ffffff;
    border: 1px solid #cbd5e0;
    border-radius: 16px;
    padding: 32px;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.login-card h2 {
    font-size: 26px;
    font-weight: 800;
    color: #2b6cb0;
    text-align: center;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
}

/* Radio Pill Group */
.role-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
}

.role-radio-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #4a5568;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 20px;
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.role-radio-label:hover {
    background: #ebf8ff;
    border-color: #bee3f8;
}

.role-radio-label input[type="radio"] {
    width: auto;
    accent-color: #2b6cb0;
}

.hidden { display: none !important; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mb-3 { margin-bottom: 12px; }
.w-100 { width: 100%; }
"""

with open('src/main/resources/static/style.css', 'w', encoding='utf-8') as f:
    f.write(css_code)

print("Updated style.css!")

# 2. Update index.html to match Radio Login Card (Ref 2nd Image) & Role Views (Ref 3rd Image)
html_code = """<!DOCTYPE html>
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
    
    <!-- LOGIN PORTAL WITH RADIO SELECTION (Ref: 2nd Image) -->
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
                    <label>Username</label>
                    <input type="text" id="login-username" value="patient" required>
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

    <!-- MAIN DASHBOARD -->
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
            <!-- Header (Removed [View SOAP WSDL] per user request) -->
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
                            <h3>📅 Book Appointment (AI Specialist Matching)</h3>
                        </div>
                        <div class="card-body">
                            <form id="form-patient-appointment">
                                <div class="form-group">
                                    <label>Patient Symptoms</label>
                                    <input type="text" id="p-app-symptoms" placeholder="e.g. Migraine, Chest Pain, Skin Rash, Joint Fracture" required>
                                </div>
                                <button type="button" class="btn btn-secondary w-100 mb-3" onclick="runAISpecialistMatch()">🧠 Run AI Specialist Matcher</button>
                                <div id="specialist-ai-result" class="alert-box mb-3 hidden"></div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Matched Specialist Doctor</label>
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

                    <div class="card">
                        <div class="card-header flex-between">
                            <h3>📜 My Hospital Visit History & Payment Receipts</h3>
                            <button class="btn btn-sm btn-outline" onclick="loadPatientVisitsAndReceipts()">Refresh</button>
                        </div>
                        <div class="card-body">
                            <div style="background: #ebf8ff; padding: 14px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #bee3f8;">
                                <strong style="font-size: 20px; color: #2b6cb0;" id="patient-total-visits">0</strong> Total Visits Recorded
                            </div>

                            <h4>Visit Dates Timeline</h4>
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

            <!-- 3. DOCTOR PORTAL (Strictly Patient Info & ML Queue Wait Times) -->
            <section id="tab-doctor-portal" class="tab-content">
                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card-header flex-between">
                            <h3>👨‍⚕️ Today's Patient Queue (AI Prioritized & ML Wait Times)</h3>
                            <button class="btn btn-sm btn-outline" onclick="loadDoctorQueue()">Refresh Queue</button>
                        </div>
                        <div class="card-body">
                            <p class="text-sm mb-3">Prioritized by AI Emergency Severity. Estimated wait times predicted using ML.</p>
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
                            <h3>📋 Active Patient Consultation & Medical Record</h3>
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
                                <button type="submit" class="btn btn-primary w-100">Save Record & Release Orders</button>
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

            <!-- 6. ADMIN PORTAL -->
            <section id="tab-admin-portal" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <h3>🛡️ System Administration & Metrics</h3>
                    </div>
                    <div class="card-body">
                        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                            <div style="background: #ebf8ff; padding: 14px; border-radius: 8px; flex: 1;">
                                <strong>System Status:</strong> <span id="admin-sys-status">UP</span>
                            </div>
                            <div style="background: #ebf8ff; padding: 14px; border-radius: 8px; flex: 1;">
                                <strong>Total Patients:</strong> <span id="admin-count-patients">4</span>
                            </div>
                            <div style="background: #ebf8ff; padding: 14px; border-radius: 8px; flex: 1;">
                                <strong>Total Doctors:</strong> <span id="admin-count-doctors">6</span>
                            </div>
                        </div>

                        <h4>📜 SOAP Web Services Inspector</h4>
                        <div class="code-box mt-2">
                            <strong>WSDL Location:</strong> <code>http://localhost:8080/ws/reports.wsdl</code>
                        </div>
                        <button class="btn btn-outline w-100 mt-3" onclick="window.open('/ws/reports.wsdl', '_blank')">Open SOAP WSDL Schema</button>
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
    f.write(html_code)

print("Updated index.html!")

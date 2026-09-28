# Create complete index.html without any priority dropdowns and with strict role-based views
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
    
    <!-- Login Portal -->
    <div id="login-container" class="login-container">
        <div class="login-box card">
            <div class="brand text-center mb-4">
                <div class="brand-icon" style="font-size: 3rem; margin: 0 auto;">🏥</div>
                <h2>IntelliCare HMS</h2>
                <p>AI-Driven Smart Hospital Management System</p>
            </div>
            
            <div class="login-portals" id="portal-buttons">
                <button class="btn btn-outline w-100 mb-2" onclick="showLoginForm('PATIENT')">👤 Patient Portal</button>
                <button class="btn btn-outline w-100 mb-2" onclick="showLoginForm('RECEPTIONIST')">📋 Receptionist Portal</button>
                <button class="btn btn-outline w-100 mb-2" onclick="showLoginForm('DOCTOR')">👨‍⚕️ Doctor Portal</button>
                <button class="btn btn-outline w-100 mb-2" onclick="showLoginForm('LAB_TECHNICIAN')">🔬 Lab Technician Portal</button>
                <button class="btn btn-outline w-100 mb-2" onclick="showLoginForm('PHARMACIST')">💊 Pharmacist Portal</button>
                <button class="btn btn-outline w-100 mb-2" onclick="showLoginForm('ADMIN')">🛡️ Admin Portal</button>
            </div>

            <form id="login-form" class="hidden mt-4">
                <h4 id="login-title" class="mb-3">Login</h4>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="login-username" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="login-password" required value="password123">
                </div>
                <input type="hidden" id="login-role">
                <button type="submit" class="btn btn-primary w-100">Login to Dashboard</button>
                <button type="button" class="btn btn-secondary w-100 mt-2" onclick="hideLoginForm()">Back</button>
            </form>
        </div>
    </div>

    <!-- Main Dashboard Application Container -->
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
            <nav class="nav-menu" id="role-nav-menu">
                <!-- Navigation buttons will be rendered dynamically by role -->
            </nav>

            <div class="server-status-card">
                <div class="status-indicator online"></div>
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
                    <p id="page-subtitle">Welcome to IntelliCare Smart Hospital Management</p>
                </div>
                <div class="header-actions">
                    <span id="user-role-badge" class="user-badge">Role: Patient</span>
                    <button id="theme-toggle" class="btn btn-secondary" onclick="toggleTheme()">🌙 Dark Mode</button>
                    <button class="btn btn-danger" onclick="logout()">🚪 Logout</button>
                </div>
            </header>

            <!-- SECTION 1: RECEPTIONIST PORTAL -->
            <section id="tab-receptionist-checkin" class="tab-content">
                <div class="dashboard-grid">
                    <!-- Register Patient -->
                    <div class="card">
                        <div class="card-header">
                            <h3>👤 Register New Patient (First Visit Credentials Generation)</h3>
                        </div>
                        <div class="card-body">
                            <form id="form-patient-reg">
                                <div class="form-group">
                                    <label>Full Name</label>
                                    <input type="text" id="reg-p-name" placeholder="e.g. John Doe" required>
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
                                            <option value="Other">Other</option>
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
                                    <label>Known Allergies (Crucial for Medication Safety)</label>
                                    <input type="text" id="reg-p-allergies" placeholder="e.g. Penicillin, Aspirin">
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Create Patient Record & Generate Login Credentials</button>
                            </form>
                            <div id="patient-reg-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>

                    <!-- Hospital Check-In & Automatic AI Emergency Severity -->
                    <div class="card">
                        <div class="card-header">
                            <h3>🏥 Hospital Check-In (Automatic AI Emergency Severity Prediction)</h3>
                        </div>
                        <div class="card-body">
                            <p class="text-sm mb-3">Record clinical data upon arrival. The ML model automatically predicts emergency severity (LOW/MEDIUM/HIGH/CRITICAL) and assigns queue tokens. <strong>No manual priority selection allowed.</strong></p>
                            <form id="form-reception-checkin">
                                <div class="form-group">
                                    <label>Patient ID</label>
                                    <input type="number" id="checkin-patient-id" placeholder="1001" required>
                                </div>
                                <div class="form-group">
                                    <label>Symptoms & Clinical Vitals</label>
                                    <textarea id="checkin-symptoms" rows="3" placeholder="Describe symptoms, blood pressure, heart rate, or pain level..." required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Run AI Emergency Model & Check-In Patient</button>
                            </form>
                            <div id="checkin-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SECTION 2: PATIENT PORTAL -->
            <section id="tab-patient-portal" class="tab-content">
                <div class="dashboard-grid">
                    <!-- Book Appointment with AI Specialist Recommendation -->
                    <div class="card">
                        <div class="card-header">
                            <h3>📅 Book Appointment & AI Specialist Recommendation</h3>
                        </div>
                        <div class="card-body">
                            <form id="form-patient-appointment">
                                <div class="form-group">
                                    <label>Symptoms Description</label>
                                    <input type="text" id="p-app-symptoms" placeholder="e.g. severe chest pain, shortness of breath" required>
                                </div>
                                <button type="button" class="btn btn-secondary w-100 mb-3" onclick="runAISpecialistMatch()">🧠 Run AI Specialist Matcher</button>
                                <div id="specialist-ai-result" class="alert-box mb-3 hidden"></div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Select Recommended Doctor</label>
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
                                <button type="submit" class="btn btn-primary w-100">Confirm Appointment (Checks Daily Capacity)</button>
                            </form>
                            <div id="p-app-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>

                    <!-- Visit History & Receipts -->
                    <div class="card">
                        <div class="card-header flex-between">
                            <h3>📜 My Hospital Visit History & Payment Receipts</h3>
                            <button class="btn btn-sm btn-outline" onclick="loadPatientVisitsAndReceipts()">Refresh</button>
                        </div>
                        <div class="card-body">
                            <div class="metric-card cyan mb-3">
                                <div class="metric-header"><span>Total Hospital Visits</span></div>
                                <div class="metric-value" id="patient-total-visits">0</div>
                                <div class="metric-sub">Chronological History Linked to Patient ID</div>
                            </div>

                            <h4>Visit Dates Timeline</h4>
                            <ul id="patient-visit-dates-list" style="margin-left: 20px; margin-bottom: 20px;" class="mt-2">
                                <li>No prior visits recorded.</li>
                            </ul>

                            <h4>Payment Receipts & History</h4>
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

            <!-- SECTION 3: DOCTOR PORTAL -->
            <section id="tab-doctor-portal" class="tab-content">
                <div class="dashboard-grid">
                    <!-- Today's Prioritized Queue -->
                    <div class="card">
                        <div class="card-header flex-between">
                            <h3>👨‍⚕️ Today's Patient Queue (AI Severity Prioritized)</h3>
                            <button class="btn btn-sm btn-outline" onclick="loadDoctorQueue()">Refresh Queue</button>
                        </div>
                        <div class="card-body">
                            <p class="text-sm mb-3">Patients are automatically prioritized by AI Emergency Level: <strong>CRITICAL > HIGH > MEDIUM > LOW</strong>.</p>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>Patient ID</th>
                                        <th>Symptoms</th>
                                        <th>AI Severity Level</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="doctor-queue-table-body">
                                    <tr><td colspan="5" class="text-center">No active patients in queue.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Consultation, Diagnosis, Lab & Prescription -->
                    <div class="card">
                        <div class="card-header">
                            <h3>📋 Active Consultation & Clinical Workflow</h3>
                        </div>
                        <div class="card-body">
                            <div id="active-consultation-info" class="code-box mb-3">
                                Select a Patient ID from the Queue to begin consultation.
                            </div>

                            <form id="form-doctor-consultation" class="hidden">
                                <input type="hidden" id="consult-patient-id">
                                <div class="form-group">
                                    <label>Clinical Observations & Diagnosis</label>
                                    <textarea id="consult-diagnosis" rows="2" placeholder="Record diagnosis details..." required></textarea>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Order Lab Test (Optional)</label>
                                        <input type="text" id="consult-lab-test" placeholder="e.g. Complete Blood Count (CBC)">
                                    </div>
                                    <div class="form-group">
                                        <label>Medicine Prescription</label>
                                        <input type="text" id="consult-prescription" placeholder="e.g. Paracetamol 500mg (10 tabs)">
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Complete Consultation & Send Orders</button>
                            </form>
                            <div id="consultation-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SECTION 4: LAB TECHNICIAN PORTAL -->
            <section id="tab-lab-portal" class="tab-content">
                <div class="card">
                    <div class="card-header flex-between">
                        <h3>🔬 Pending Laboratory Requests</h3>
                        <button class="btn btn-sm btn-outline" onclick="loadLabRequests()">Refresh Tests</button>
                    </div>
                    <div class="card-body">
                        <p class="text-sm mb-3">Independent Lab Technician Dashboard. Enters test results for authorized doctor review.</p>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Test ID</th>
                                    <th>Patient ID</th>
                                    <th>Test Name</th>
                                    <th>Status</th>
                                    <th>Enter Test Result</th>
                                </tr>
                            </thead>
                            <tbody id="lab-requests-table-body">
                                <tr><td colspan="5" class="text-center">No pending lab requests.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- SECTION 5: PHARMACIST PORTAL -->
            <section id="tab-pharmacy-portal" class="tab-content">
                <div class="dashboard-grid">
                    <!-- Prescriptions & Dispensing -->
                    <div class="card">
                        <div class="card-header flex-between">
                            <h3>💊 Pending Prescriptions & Medication Safety Verification</h3>
                            <button class="btn btn-sm btn-outline" onclick="loadPharmacyPrescriptions()">Refresh</button>
                        </div>
                        <div class="card-body">
                            <p class="text-sm mb-3">Pharmacist Dashboard. Performs automated patient allergy check & stock verification before dispensing.</p>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Rx ID</th>
                                        <th>Patient ID</th>
                                        <th>Prescribed Medicine</th>
                                        <th>Dispense Action</th>
                                    </tr>
                                </thead>
                                <tbody id="pharmacy-rx-table-body">
                                    <tr><td colspan="4" class="text-center">No pending prescriptions.</td></tr>
                                </tbody>
                            </table>
                            <div id="pharmacy-dispense-result" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>

                    <!-- Medicine Stock Inventory -->
                    <div class="card">
                        <div class="card-header">
                            <h3>📦 Pharmacy Medicine Stock Inventory</h3>
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
                                <button type="submit" class="btn btn-secondary w-100">Update Stock Inventory</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SECTION 6: ADMIN PORTAL -->
            <section id="tab-admin-portal" class="tab-content">
                <div class="metrics-grid">
                    <div class="metric-card cyan">
                        <div class="metric-header"><span>System Status</span><span class="metric-badge green">ONLINE</span></div>
                        <div class="metric-value" id="admin-sys-status">UP</div>
                        <div class="metric-sub" id="admin-uptime">Uptime: 0s</div>
                    </div>
                    <div class="metric-card indigo">
                        <div class="metric-header"><span>Total Patients</span></div>
                        <div class="metric-value" id="admin-count-patients">0</div>
                        <div class="metric-sub">Registered Records</div>
                    </div>
                    <div class="metric-card emerald">
                        <div class="metric-header"><span>Total Doctors</span></div>
                        <div class="metric-value" id="admin-count-doctors">0</div>
                        <div class="metric-sub">Active Specialists</div>
                    </div>
                </div>

                <div class="card mt-4">
                    <div class="card-header">
                        <h3>📜 SOAP Web Services Inspector</h3>
                    </div>
                    <div class="card-body">
                        <p class="text-sm">Spring Web Services WSDL protocol endpoint generating clinical and billing reports:</p>
                        <div class="code-box mt-2">
                            <strong>Endpoint URL:</strong> <code>http://localhost:8080/ws</code><br>
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
    f.write(html_content)

print("Updated index.html successfully.")

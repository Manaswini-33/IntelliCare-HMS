const API_BASE = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initForms();
    loadDashboardMetrics();
    loadDoctorsList();
});

// Tab Navigation
function initTabs() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            // Update title
            const titles = {
                'overview': ['System Overview & Monitoring', 'Real-time metrics, system health, and academic module inspector'],
                'patients-doctors': ['Patient & Doctor Management', 'Register patients, manage doctors, and run rule-based doctor recommendation'],
                'appointments': ['Smart Queue & Emergency Management', 'Book appointments with queue estimation and trigger emergency priority override'],
                'pharmacy-lab': ['Medical Records, Lab & Pharmacy', 'Issue prescriptions with automated Medication Safety & Allergy validation'],
                'billing-reports': ['Billing & SOAP Web Services', 'Generate total patient bills, track payments, and inspect SOAP WSDL protocol']
            };

            if (titles[targetTab]) {
                document.getElementById('page-title').innerText = titles[targetTab][0];
                document.getElementById('page-subtitle').innerText = titles[targetTab][1];
            }

            refreshCurrentTab();
        });
    });
}

function refreshCurrentTab() {
    loadDashboardMetrics();
    loadDoctorsList();
}

// 1. Dashboard Metrics
async function loadDashboardMetrics() {
    try {
        const res = await fetch(`${API_BASE}/monitoring`);
        const result = await res.json();

        if (result.success && result.data) {
            const data = result.data;
            document.getElementById('sys-status').innerText = data.systemStatus;
            document.getElementById('sys-uptime').innerText = `Uptime: ${data.uptimeSeconds}s`;
            
            document.getElementById('mem-used').innerText = `${data.usedMemoryMB} / ${data.totalMemoryMB} MB`;
            const memPercent = Math.round((data.usedMemoryMB / data.totalMemoryMB) * 100);
            document.getElementById('mem-fill').style.width = `${memPercent}%`;

            if (data.databaseMetrics) {
                document.getElementById('count-patients').innerText = data.databaseMetrics.patients || 0;
                document.getElementById('count-doctors').innerText = data.databaseMetrics.doctors || 0;
                document.getElementById('count-appointments').innerText = data.databaseMetrics.appointments || 0;
            }
        }
    } catch (err) {
        console.error('Error fetching metrics:', err);
    }
}

// 2. Load Doctors List
async function loadDoctorsList() {
    const tbody = document.getElementById('doctors-table-body');
    try {
        const res = await fetch(`${API_BASE}/doctors`);
        const result = await res.json();

        if (result.success && result.data) {
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No doctors registered yet. Add one via API or form.</td></tr>';
                return;
            }

            tbody.innerHTML = result.data.map(doc => `
                <tr>
                    <td>#${doc.doctorId}</td>
                    <td><strong>${doc.name}</strong></td>
                    <td>${doc.specialization}</td>
                    <td>${doc.department}</td>
                    <td>${doc.phone}</td>
                    <td><span class="metric-badge green">${doc.availability || 'Available'}</span></td>
                </tr>
            `).join('');
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to connect to server API.</td></tr>';
    }
}

// 3. Form Event Handlers
function initForms() {
    // Patient Form
    document.getElementById('form-patient').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('p-name').value,
            age: parseInt(document.getElementById('p-age').value),
            gender: document.getElementById('p-gender').value,
            phone: document.getElementById('p-phone').value,
            bloodGroup: document.getElementById('p-blood').value,
            allergies: document.getElementById('p-allergies').value
        };

        try {
            const res = await fetch(`${API_BASE}/patients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert(`Patient Registered Successfully! ID: #${data.data.patientId}`);
                document.getElementById('form-patient').reset();
                loadDashboardMetrics();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            alert('Failed to connect to API server.');
        }
    });

    // Appointment Form
    document.getElementById('form-appointment').addEventListener('submit', async (e) => {
        e.preventDefault();
        const box = document.getElementById('booking-result');
        box.classList.add('hidden');

        const payload = {
            patientId: parseInt(document.getElementById('app-patient-id').value),
            doctorId: parseInt(document.getElementById('app-doctor-id').value),
            appointmentDate: document.getElementById('app-date').value,
            appointmentTime: document.getElementById('app-time').value,
            priority: parseInt(document.getElementById('app-priority').value)
        };

        try {
            const res = await fetch(`${API_BASE}/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            box.classList.remove('hidden');
            if (data.success) {
                box.className = 'alert-box success mt-3';
                box.innerHTML = `<strong>Appointment Confirmed!</strong><br>
                                 Queue Position: <strong>#${data.data.queuePosition}</strong> | 
                                 Estimated Wait Time: <strong>${data.data.estimatedWaitingTime} mins</strong>`;
                loadDashboardMetrics();
            } else {
                box.className = 'alert-box error mt-3';
                box.innerText = `Booking Error: ${data.message}`;
            }
        } catch (err) {
            box.classList.remove('hidden');
            box.className = 'alert-box error mt-3';
            box.innerText = 'Failed to connect to API server.';
        }
    });

    // Emergency Form
    document.getElementById('form-emergency').addEventListener('submit', async (e) => {
        e.preventDefault();
        const patientId = document.getElementById('emg-patient-id').value;
        const severity = document.getElementById('emg-severity').value;
        const description = document.getElementById('emg-description').value;

        try {
            const res = await fetch(`${API_BASE}/emergencies?patientId=${patientId}&severity=${severity}&description=${encodeURIComponent(description)}`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                alert(`🚨 EMERGENCY OVERRIDE TRIGGERED!\nCase ID: #${data.data.emergencyId}\nPriority Level: ${data.data.priority}\nStatus: ${data.data.status}`);
                document.getElementById('form-emergency').reset();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            alert('Failed to connect to Emergency API.');
        }
    });

    // Prescription Form (Medication Safety Validation)
    document.getElementById('form-prescription').addEventListener('submit', async (e) => {
        e.preventDefault();
        const rxBox = document.getElementById('rx-result');
        rxBox.classList.add('hidden');

        const payload = {
            patientId: parseInt(document.getElementById('rx-patient-id').value),
            doctorId: parseInt(document.getElementById('rx-doctor-id').value),
            items: [
                {
                    medicineId: parseInt(document.getElementById('rx-med-id').value),
                    quantity: parseInt(document.getElementById('rx-qty').value),
                    dosage: document.getElementById('rx-dosage').value
                }
            ],
            duration: "5 days",
            instructions: "Take after meals"
        };

        try {
            const res = await fetch(`${API_BASE}/prescriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            rxBox.classList.remove('hidden');
            if (data.success) {
                rxBox.className = 'alert-box success mt-3';
                rxBox.innerHTML = `<strong>✅ Prescription Issued Safely!</strong><br>
                                   Prescription ID: #${data.data.prescriptionId}. Allergy & stock checks passed!`;
            } else {
                rxBox.className = 'alert-box error mt-3';
                rxBox.innerHTML = `<strong>🛑 MEDICATION SAFETY REJECTION!</strong><br>${data.message}`;
            }
        } catch (err) {
            rxBox.classList.remove('hidden');
            rxBox.className = 'alert-box error mt-3';
            rxBox.innerText = 'Failed to connect to Pharmacy API.';
        }
    });

    // Add Medicine Form
    document.getElementById('form-medicine').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            medicineName: document.getElementById('med-name').value,
            category: document.getElementById('med-category').value,
            stockQuantity: parseInt(document.getElementById('med-stock').value),
            price: parseFloat(document.getElementById('med-price').value)
        };

        try {
            const res = await fetch(`${API_BASE}/medicines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert(`Medicine Added! ID: #${data.data.medicineId}`);
                document.getElementById('form-medicine').reset();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            alert('Failed to connect to Pharmacy API.');
        }
    });

    // Bill Form
    document.getElementById('form-bill').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            patientId: parseInt(document.getElementById('bill-patient-id').value),
            consultationFee: parseFloat(document.getElementById('bill-consult').value || 0),
            laboratoryFee: parseFloat(document.getElementById('bill-lab').value || 0),
            pharmacyFee: parseFloat(document.getElementById('bill-pharmacy').value || 0)
        };

        try {
            const res = await fetch(`${API_BASE}/billing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert(`Bill Generated! Bill ID: #${data.data.billId}\nTotal Amount: $${data.data.totalAmount.toFixed(2)}\nStatus: ${data.data.paymentStatus}`);
                document.getElementById('form-bill').reset();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            alert('Failed to connect to Billing API.');
        }
    });
}

// Doctor Recommendation
async function recommendDoctors() {
    const symptoms = document.getElementById('symptoms-input').value;
    const list = document.getElementById('doctor-recommendations-list');
    list.innerHTML = '<p class="text-sm">Running rule-based doctor matching...</p>';

    try {
        const res = await fetch(`${API_BASE}/doctors/recommend?symptoms=${encodeURIComponent(symptoms)}`);
        const data = await res.json();

        if (data.success && data.data) {
            if (data.data.length === 0) {
                list.innerHTML = '<p class="text-sm">No matching doctors found.</p>';
                return;
            }

            list.innerHTML = data.data.map(doc => `
                <div class="code-box mt-2">
                    <strong>Dr. ${doc.name}</strong> (#${doc.doctorId})<br>
                    Specialization: <span>${doc.specialization}</span> (${doc.department})<br>
                    Experience: ${doc.experience} years | Status: ${doc.availability}
                </div>
            `).join('');
        }
    } catch (err) {
        list.innerHTML = '<p class="text-sm text-danger">Error matching doctor specialization.</p>';
    }
}

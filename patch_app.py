import re

app_js_file = 'src/main/resources/static/app.js'
with open(app_js_file, 'r', encoding='utf-8') as f:
    content = f.read()

auth_logic = """
// Authentication & Portals
function showLoginForm(role) {
    document.getElementById('portal-buttons').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('login-role').value = role;
    const titles = {
        'USER': 'User / Patient Login',
        'EMPLOYEE': 'Doctor / Employee Login',
        'ADMIN': 'Admin Portal Login'
    };
    document.getElementById('login-title').innerText = titles[role];
}

function hideLoginForm() {
    document.getElementById('portal-buttons').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
}

function configurePortal(role, username) {
    document.body.classList.remove('login-mode');
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Default: hide all tabs from sidebar
    const tabs = document.querySelectorAll('.nav-btn');
    tabs.forEach(t => t.style.display = 'none');
    
    // Activate specific tabs based on role
    if (role === 'USER') {
        document.querySelector('[data-tab="appointments"]').style.display = 'flex';
        document.querySelector('[data-tab="appointments"]').click();
    } else if (role === 'EMPLOYEE') {
        document.querySelector('[data-tab="patients-doctors"]').style.display = 'flex';
        document.querySelector('[data-tab="appointments"]').style.display = 'flex';
        document.querySelector('[data-tab="pharmacy-lab"]').style.display = 'flex';
        document.querySelector('[data-tab="patients-doctors"]').click();
    } else if (role === 'ADMIN') {
        tabs.forEach(t => t.style.display = 'flex');
        document.querySelector('[data-tab="overview"]').click();
    }
}

// ML Model Functions
async function testMLSeverity() {
    const box = document.getElementById('ml-result-box');
    box.className = 'alert-box success mt-3';
    box.innerHTML = '<i>Connecting to Python ML Service for Severity Prediction...</i>';
    box.classList.remove('hidden');
    try {
        const res = await fetch(`${API_BASE}/ml/predict-severity`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                heartRate: 120, spO2: 85, temperature: 39.0,
                systolicBP: 160, diastolicBP: 95, respiratoryRate: 30
            })
        });
        const data = await res.json();
        box.innerHTML = `<strong>Severity Prediction:</strong> ${data.predictedSeverity} (Confidence: ${(data.confidence * 100).toFixed(2)}%)`;
    } catch(err) {
        box.className = 'alert-box error mt-3';
        box.innerHTML = 'Failed to connect to ML Service.';
    }
}

async function testMLSpecialist() {
    const box = document.getElementById('ml-result-box');
    box.className = 'alert-box success mt-3';
    box.innerHTML = '<i>Connecting to Python ML Service for Specialist Recommendation...</i>';
    box.classList.remove('hidden');
    try {
        const res = await fetch(`${API_BASE}/ml/recommend-specialist?symptoms=severe chest pain and shortness of breath`);
        const data = await res.json();
        box.innerHTML = `<strong>Recommended Department:</strong> ${data.recommendedDepartment} (Confidence: ${(data.confidence * 100).toFixed(2)}%)`;
    } catch(err) {
        box.className = 'alert-box error mt-3';
        box.innerHTML = 'Failed to connect to ML Service.';
    }
}

async function testMLWaitTime() {
    const box = document.getElementById('ml-result-box');
    box.className = 'alert-box success mt-3';
    box.innerHTML = '<i>Connecting to Python ML Service for Wait Time Prediction...</i>';
    box.classList.remove('hidden');
    try {
        const res = await fetch(`${API_BASE}/ml/predict-wait-time?queuePosition=5&priority=2&doctorsAvailable=2`);
        const data = await res.json();
        box.innerHTML = `<strong>Estimated Wait Time:</strong> ${data.estimatedWaitTimeMinutes} minutes`;
    } catch(err) {
        box.className = 'alert-box error mt-3';
        box.innerHTML = 'Failed to connect to ML Service.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Override DOMContentLoaded from before
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const role = document.getElementById('login-role').value;
        const username = document.getElementById('login-username').value;
        configurePortal(role, username);
    });
});
"""

content = content + '\n' + auth_logic

with open(app_js_file, 'w', encoding='utf-8') as f:
    f.write(content)

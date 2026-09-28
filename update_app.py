import re

file_path = 'src/main/resources/static/app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the fake auth logic with real auth logic
new_auth_logic = """
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

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    location.reload();
}

// Intercept fetch to add Bearer token
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

function configurePortal(role, username) {
    document.body.classList.remove('login-mode');
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Add logout button to header if it doesn't exist
    if (!document.getElementById('logout-btn')) {
        const headerActions = document.querySelector('.header-actions');
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'btn btn-danger';
        logoutBtn.innerText = '🚪 Logout';
        logoutBtn.onclick = logout;
        headerActions.appendChild(logoutBtn);
    }
    
    // Default: hide all tabs from sidebar
    const tabs = document.querySelectorAll('.nav-btn');
    tabs.forEach(t => t.style.display = 'none');
    
    // Backend role dictates visibility
    if (role === 'PATIENT') {
        document.querySelector('[data-tab="appointments"]').style.display = 'flex';
        document.querySelector('[data-tab="appointments"]').click();
    } else if (['DOCTOR', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN'].includes(role)) {
        document.querySelector('[data-tab="patients-doctors"]').style.display = 'flex';
        document.querySelector('[data-tab="appointments"]').style.display = 'flex';
        document.querySelector('[data-tab="pharmacy-lab"]').style.display = 'flex';
        document.querySelector('[data-tab="patients-doctors"]').click();
    } else if (role === 'ADMIN') {
        tabs.forEach(t => t.style.display = 'flex');
        document.querySelector('[data-tab="overview"]').click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole');
    if (token && role) {
        configurePortal(role, "User");
        initTabs();
        initForms();
        loadDashboardMetrics();
        loadDoctorsList();
        return;
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await res.json();
            
            if (result.success && result.data.token) {
                localStorage.setItem('jwtToken', result.data.token);
                localStorage.setItem('userRole', result.data.role);
                configurePortal(result.data.role, username);
                initTabs();
                initForms();
                loadDashboardMetrics();
                loadDoctorsList();
            } else {
                alert(`Login Failed: ${result.message || 'Invalid credentials'}`);
            }
        } catch(err) {
            alert('Error connecting to authentication server.');
        }
    });
});
"""

# We need to replace the old auth logic starting from "// Authentication & Portals" to the end
# Since we injected it last time, we can just find where it starts
content = re.sub(r'// Authentication & Portals.*', new_auth_logic, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

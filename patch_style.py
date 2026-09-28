import re

# 1. Update style.css to ensure light mode is clean, attractive, and default
css_code = """
:root {
    /* Default Light Theme - Soft, Clean, Hospital Professional */
    --bg-main: #f4f6f9;
    --bg-card: #ffffff;
    --bg-card-hover: #f8fafc;
    --border-color: #e2e8f0;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    
    --accent-blue: #2563eb;
    --accent-cyan: #0284c7;
    --accent-indigo: #4f46e5;
    --accent-emerald: #059669;
    --accent-rose: #dc2626;
    --accent-amber: #d97706;
    
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    
    --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.05);
    --transition: all 0.25s ease;
}

[data-theme="dark"] {
    --bg-main: #0f172a;
    --bg-card: #1e293b;
    --bg-card-hover: #334155;
    --border-color: #334155;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    
    --accent-blue: #3b82f6;
    --accent-cyan: #06b6d4;
    --accent-indigo: #6366f1;
    --accent-emerald: #10b981;
    --accent-rose: #f43f5e;
    --accent-amber: #f59e0b;
    
    --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.4);
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
    overflow-x: hidden;
}

.app-container {
    display: flex;
    min-height: 100vh;
}

/* Sidebar */
.sidebar {
    width: 280px;
    background: var(--bg-card);
    border-right: 1px solid var(--border-color);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: var(--shadow-md);
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
}

.brand-icon {
    font-size: 28px;
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
    margin-top: 24px;
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
    background: rgba(37, 99, 235, 0.08);
    border-color: rgba(37, 99, 235, 0.2);
    color: var(--accent-blue);
}

.server-status-card {
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    padding: 14px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: 12px;
}

.status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent-emerald);
    box-shadow: 0 0 8px var(--accent-emerald);
}

.status-info {
    font-size: 12px;
}

.status-title {
    font-weight: 700;
    color: var(--text-primary);
}

.status-url {
    color: var(--text-secondary);
    font-size: 11px;
}

/* Main Content */
.main-content {
    flex: 1;
    padding: 32px 40px;
    overflow-y: auto;
}

.top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
}

.header-title h1 {
    font-size: 24px;
    font-weight: 800;
    color: var(--text-primary);
}

.header-title p {
    color: var(--text-secondary);
    font-size: 14px;
    margin-top: 4px;
}

.header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.user-badge {
    background: rgba(37, 99, 235, 0.1);
    color: var(--accent-blue);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-primary {
    background: var(--accent-blue);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-primary:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
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

.btn-danger:hover {
    background: #b91c1c;
}

.btn-outline {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.btn-outline:hover {
    color: var(--text-primary);
    border-color: var(--accent-blue);
}

/* Cards & Layout */
.tab-content {
    display: none;
    animation: fadeIn 0.25s ease;
}

.tab-content.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
}

.metric-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    padding: 20px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
}

.metric-card.cyan { border-top: 4px solid var(--accent-cyan); }
.metric-card.indigo { border-top: 4px solid var(--accent-indigo); }
.metric-card.emerald { border-top: 4px solid var(--accent-emerald); }
.metric-card.rose { border-top: 4px solid var(--accent-rose); }

.metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
}

.metric-badge.green {
    background: rgba(5, 150, 105, 0.15);
    color: var(--accent-emerald);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
}

.metric-value {
    font-size: 32px;
    font-weight: 800;
    margin: 12px 0 4px 0;
    color: var(--text-primary);
}

.metric-sub {
    font-size: 12px;
    color: var(--text-secondary);
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 24px;
}

.card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
}

.card-header {
    padding: 18px 24px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-card);
}

.card-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
}

.card-body {
    padding: 24px;
}

/* Forms */
.form-group {
    margin-bottom: 16px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

input, select, textarea {
    width: 100%;
    padding: 10px 14px;
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
    transition: var(--transition);
}

input:focus, select:focus, textarea:focus {
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

/* Tables */
.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.data-table th, .data-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

.data-table th {
    background: var(--bg-main);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
}

.alert-box {
    padding: 14px 18px;
    border-radius: var(--radius-md);
    font-size: 13px;
    margin-top: 16px;
    line-height: 1.5;
}

.alert-box.success {
    background: rgba(5, 150, 105, 0.1);
    border: 1px solid rgba(5, 150, 105, 0.3);
    color: #047857;
}

.alert-box.error {
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.3);
    color: #b91c1c;
}

.code-box {
    background: var(--bg-main);
    padding: 14px;
    border-radius: var(--radius-sm);
    font-family: monospace;
    font-size: 13px;
    color: var(--accent-blue);
    border: 1px solid var(--border-color);
}

.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 24px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 24px; }
.w-100 { width: 100%; }
.hidden { display: none !important; }
.text-center { text-align: center; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }

/* Login Portal */
body.login-mode {
    background: linear-gradient(135deg, #e0f2fe, #f4f6f9);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
}

.login-container {
    width: 100%;
    max-width: 440px;
    padding: 20px;
}

.login-box {
    padding: 32px;
    border-radius: var(--radius-lg);
    background: #ffffff;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}
"""

with open('src/main/resources/static/style.css', 'w', encoding='utf-8') as f:
    f.write(css_code)

print("Updated style.css successfully.")

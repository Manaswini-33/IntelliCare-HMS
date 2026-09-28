import os
import re

html_path = 'src/main/resources/static/index.html'
css_path = 'src/main/resources/static/style.css'
js_path = 'src/main/resources/static/app.js'

# Update CSS
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

new_root = """:root {
    /* Default Light Theme - Soft, Clean, Attractive */
    --bg-main: #f8fafc;
    --bg-card: #ffffff;
    --bg-card-hover: #f1f5f9;
    --border-color: #e2e8f0;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    
    --accent-cyan: #0ea5e9;
    --accent-indigo: #4f46e5;
    --accent-emerald: #059669;
    --accent-rose: #e11d48;
    --accent-amber: #d97706;
    
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    
    --shadow-md: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    --transition: all 0.25s ease;
}

[data-theme="dark"] {
    /* Soft Dark Theme - Attractive Slate */
    --bg-main: #0f172a;
    --bg-card: #1e293b;
    --bg-card-hover: #334155;
    --border-color: #334155;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    
    --accent-cyan: #06b6d4;
    --accent-indigo: #6366f1;
    --accent-emerald: #10b981;
    --accent-rose: #f43f5e;
    --accent-amber: #f59e0b;
    
    --shadow-md: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
}
"""

css_content = re.sub(r':root\s*\{.*?\n\}', new_root, css_content, flags=re.DOTALL)
# Also fix sidebar background in light theme
css_content = css_content.replace('background: rgba(15, 23, 42, 0.95);', 'background: var(--bg-card);')
css_content = css_content.replace('background: rgba(15, 23, 42, 0.5);', 'background: var(--bg-main);')
css_content = css_content.replace('color: #fff;', 'color: #ffffff;')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

# Update HTML
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

toggle_html = """<button id="theme-toggle" class="btn btn-secondary" onclick="toggleTheme()">🌙 Dark Mode</button>
                    <button class="btn btn-secondary" onclick="refreshCurrentTab()">🔄 Refresh Data</button>"""
html_content = html_content.replace('<button class="btn btn-secondary" onclick="refreshCurrentTab()">🔄 Refresh Data</button>', toggle_html)
html_content = html_content.replace('<body class="login-mode">', '<body class="login-mode" data-theme="light">')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

# Update JS
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

theme_js = """
// Theme Toggle Logic
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

// Load saved theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        if (savedTheme === 'dark') {
            btn.innerHTML = '☀️ Light Mode';
        } else {
            btn.innerHTML = '🌙 Dark Mode';
        }
    }
});

"""

if 'toggleTheme()' not in js_content:
    with open(js_path, 'a', encoding='utf-8') as f:
        f.write(theme_js)

import re

html_file = 'src/main/resources/static/index.html'
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

login_html = """
    <!-- Login Portal -->
    <div id="login-container" class="login-container">
        <div class="login-box card">
            <div class="brand text-center mb-4">
                <div class="brand-icon" style="font-size: 3rem; margin: 0 auto;">🏥</div>
                <h2>IntelliCare</h2>
                <p>Select your portal to login</p>
            </div>
            
            <div class="login-portals" id="portal-buttons">
                <button class="btn btn-outline w-100 mb-2" onclick="showLoginForm('USER')">👤 User / Patient Portal</button>
                <button class="btn btn-outline w-100 mb-2" onclick="showLoginForm('EMPLOYEE')">👨‍⚕️ Doctor / Employee Portal</button>
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
                <button type="submit" class="btn btn-primary w-100">Login</button>
                <button type="button" class="btn btn-secondary w-100 mt-2" onclick="hideLoginForm()">Back</button>
            </form>
        </div>
    </div>
"""

content = content.replace('<div class="app-container">', login_html + '\n    <div class="app-container hidden" id="app-container">')
content = content.replace('<body>', '<body class="login-mode">')
content = content.replace('id="tab-overview" class="tab-content active"', 'id="tab-overview" class="tab-content"') # make active dynamically

ml_buttons_html = """
                    <!-- ML Model Controls -->
                    <div class="card warning-border mb-4">
                        <div class="card-header">
                            <h3>🧠 AI & Machine Learning Controls</h3>
                        </div>
                        <div class="card-body">
                            <p class="text-sm mb-3">Run Python ML models to predict severity, recommend specialists, and estimate wait times.</p>
                            <div class="dashboard-grid">
                                <button class="btn btn-secondary" onclick="testMLSeverity()">Predict Severity (Emergency)</button>
                                <button class="btn btn-secondary" onclick="testMLSpecialist()">Recommend Specialist</button>
                                <button class="btn btn-secondary" onclick="testMLWaitTime()">Predict Wait Time</button>
                            </div>
                            <div id="ml-result-box" class="alert-box mt-3 hidden"></div>
                        </div>
                    </div>
"""
content = content.replace('<!-- Tab 1: System Overview & Monitoring -->', '<!-- Tab 1: System Overview & Monitoring -->\n' + ml_buttons_html)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(content)

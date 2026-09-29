import re

app_js = 'src/main/resources/static/app.js'
with open(app_js, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix default username for Patient
content = content.replace("'PATIENT': 'John Smith'", "'PATIENT': 'patient'")

# Fix username mapping in initAuth
old_mapping = """        // Map Patient / Doctor login IDs
        let username = usernameInput;
        if (role === 'DOCTOR' && !isNaN(usernameInput)) {
            username = `doctor`;
        }"""

new_mapping = """        // Normalize username to matched DB user credential
        let username = usernameInput.trim().toLowerCase();
        if (role === 'PATIENT') {
            username = 'patient';
        } else if (role === 'DOCTOR') {
            username = 'doctor';
        } else if (role === 'RECEPTIONIST') {
            username = 'receptionist';
        } else if (role === 'LAB_TECHNICIAN') {
            username = 'labtech';
        } else if (role === 'PHARMACIST') {
            username = 'pharmacist';
        } else if (role === 'ADMIN') {
            username = 'admin';
        }"""

content = content.replace(old_mapping, new_mapping)

with open(app_js, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated app.js login normalization successfully!")

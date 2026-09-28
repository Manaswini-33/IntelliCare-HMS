import re

css_file = 'src/main/resources/static/style.css'
with open(css_file, 'r', encoding='utf-8') as f:
    content = f.read()

css_logic = """
/* Login Portal Styles */
body.login-mode {
    background-color: var(--slate-50);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
}
.login-container {
    width: 100%;
    max-width: 400px;
}
.login-box {
    padding: 2rem;
}
"""

content = content + '\n' + css_logic

with open(css_file, 'w', encoding='utf-8') as f:
    f.write(content)

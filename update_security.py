import re

file_path = 'src/main/java/com/hospital/management/security/SecurityConfig.java'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the permitAll list
new_matchers = """                        .requestMatchers(
                                "/api/auth/**",
                                "/api/ml/**",
                                "/ws/**",
                                "/ws",
                                "/api/monitoring",
                                "/h2-console/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/",
                                "/index.html",
                                "/style.css",
                                "/app.js",
                                "/favicon.ico"
                        ).permitAll()"""

content = re.sub(r'\.requestMatchers\([\s\S]*?\.permitAll\(\)', new_matchers, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

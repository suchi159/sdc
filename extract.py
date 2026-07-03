import re

with open('candidate.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove other main sections
html = re.sub(r'<main id="cand-auth-view".*?</main>', '', html, flags=re.DOTALL)
html = re.sub(r'<main id="cand-home".*?</main>', '', html, flags=re.DOTALL)
html = re.sub(r'<main id="cand-practice".*?</main>', '', html, flags=re.DOTALL)
html = re.sub(r'<main id="cand-profile".*?</main>', '', html, flags=re.DOTALL)
html = re.sub(r'<main id="cand-certs".*?</main>', '', html, flags=re.DOTALL)

# Remove bottom nav
html = re.sub(r'<nav class="bottom-nav.*?</nav>', '', html, flags=re.DOTALL)

# Make cand-learn active
html = html.replace('id="cand-learn" class="view-panel" tabindex="-1"', 'id="cand-learn" class="view-panel active"')

# Update title
html = html.replace('<title>Candidate Portal</title>', '<title>Learning Material</title>')

# Add dummy elements to prevent JS crashes
dummy_elements = """
<div style="display:none;">
    <div id="login-main-title"></div>
    <div id="dash-countdown"></div>
    <div id="dash-date-display"></div>
</div>
"""
html = html.replace('</body>', dummy_elements + '</body>')

with open('learning_material.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Created learning_material.html")

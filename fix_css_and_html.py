import re

# 1. Update candidate.css
with open('candidate.css', 'r') as f:
    css = f.read()

# Make secondary color same as primary for a single accent color
css = re.sub(r'--sec:\s*#[0-9a-fA-F]+;', '--sec: var(--pri);', css)
css = re.sub(r'--sec-ct:\s*#[0-9a-fA-F]+;', '--sec-ct: var(--pri-ct);', css)

# Fix Font to Roboto (like v3.css)
css = re.sub(r'--font:\s*[^;]+;', '--font: "Roboto", system-ui, -apple-system, sans-serif;', css)

with open('candidate.css', 'w') as f:
    f.write(css)

# 2. Update candidate.html
with open('candidate.html', 'r') as f:
    html = f.read()

# Replace fonts in <link> tags
html = html.replace('family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;800&family=Georgia', 'family=Roboto:wght@400;500;700&family=JetBrains+Mono:wght@400;600;800')

# Replace SVG logos with material icons
svg_linkedin = r'<svg width="18" height="18" viewBox="0 0 24 24" fill="#0077B5"[^>]*>.*?</svg>'
html = re.sub(svg_linkedin, '<i class="material-icons" style="color: #0077B5; font-size: 18px;">work</i>', html, flags=re.DOTALL)

svg_linkedin_white = r'<svg width="18" height="18" viewBox="0 0 24 24" fill="white"[^>]*>.*?</svg>'
html = re.sub(svg_linkedin_white, '<i class="material-icons" style="color: white; font-size: 18px;">work</i>', html, flags=re.DOTALL)

svg_google = r'<svg viewBox="0 0 24 24" width="20" height="20" fill="none"[^>]*>.*?</svg>'
html = re.sub(svg_google, '<i class="material-icons" style="font-size: 20px;">account_circle</i>', html, flags=re.DOTALL)

svg_apple = r'<svg viewBox="0 0 165\.521 165\.521" width="20" height="20" fill="white"[^>]*>.*?</svg>'
html = re.sub(svg_apple, '<i class="material-icons" style="color: white; font-size: 20px;">devices</i>', html, flags=re.DOTALL)

svg_linkedin_big = r'<svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5"[^>]*>.*?</svg>'
html = re.sub(svg_linkedin_big, '<i class="material-icons" style="color: #0077B5; font-size: 20px;">work</i>', html, flags=re.DOTALL)

with open('candidate.html', 'w') as f:
    f.write(html)
print("Updated candidate.css and candidate.html")

import os
import glob
import re

css_files = glob.glob('*.css')
html_files = glob.glob('*.html')

for fpath in css_files:
    with open(fpath, 'r') as f:
        css = f.read()
    
    # Unify accent colors
    css = re.sub(r'--sec:\s*#[0-9a-fA-F]+;', '--sec: var(--pri);', css)
    css = re.sub(r'--sec-ct:\s*#[0-9a-fA-F]+;', '--sec-ct: var(--pri-ct);', css)
    
    # Change fonts to Roboto
    css = re.sub(r'--font:\s*[^;]+;', '--font: "Roboto", system-ui, -apple-system, sans-serif;', css)
    
    with open(fpath, 'w') as f:
        f.write(css)

for fpath in html_files:
    with open(fpath, 'r') as f:
        html = f.read()
    
    # Fix fonts in Google Fonts links
    html = re.sub(r'family=Inter:[^&]*&?', 'family=Roboto:wght@400;500;700&', html)
    html = re.sub(r'family=Georgia&?', '', html)
    
    # Replace any known social SVGs with Material Icons
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

    with open(fpath, 'w') as f:
        f.write(html)

print("Processed all HTML and CSS files.")

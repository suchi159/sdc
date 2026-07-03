import os
import re
import glob

BASE_DIR = '/Users/suchi/Documents/Data proctor'

# Find all HTML files
html_files = glob.glob(os.path.join(BASE_DIR, '*.html'))

processed_count = 0
skipped_count = 0

for file_path in html_files:
    file_name = os.path.basename(file_path)
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
        
    original_html = html
    modified = False
    
    # 1. Update class names to include M3 tokens (if not already present)
    if 'class="global-header"' in html and 'md-top-app-bar' not in html:
        html = re.sub(r'class="global-header"', 'class="global-header md-top-app-bar"', html)
        modified = True
        
    if 'class="sidebar"' in html and 'md-navigation-drawer' not in html:
        html = re.sub(r'class="sidebar"', 'class="sidebar md-navigation-drawer"', html)
        modified = True
        
    if 'class="main-content"' in html and 'md-main-content' not in html:
        html = re.sub(r'class="main-content"', 'class="main-content md-main-content"', html)
        modified = True
    
    # 2. Inject structural wrappers if standard components exist
    has_header = bool(re.search(r'<header[^>]*class="[^"]*global-header[^"]*"[^>]*>', html))
    has_sidebar = bool(re.search(r'<aside[^>]*class="[^"]*sidebar[^"]*"[^>]*>', html))
    
    # Wrap sidebar and main-content in app-body if they exist and app-body is missing
    if has_sidebar and 'class="app-body"' not in html:
        sidebar_match = re.search(r'<aside[^>]*class="[^"]*sidebar[^"]*"[^>]*>', html)
        if sidebar_match:
            html = html[:sidebar_match.start()] + '<div class="app-body">\n' + html[sidebar_match.start():]
            # Replace the last </body> with </div></body> to close app-body
            html = re.sub(r'</body>', '</div>\n</body>', html)
            modified = True
            
    # Wrap the entire layout in app-layout if header exists and app-layout is missing
    # Important: Do this AFTER injecting app-body so that the closing </div> structure remains sound
    if has_header and 'class="app-layout"' not in html:
        header_match = re.search(r'<header[^>]*class="[^"]*global-header[^"]*"[^>]*>', html)
        if header_match:
            html = html[:header_match.start()] + '<div class="app-layout">\n' + html[header_match.start():]
            # Replace the last </body> with </div></body> to close app-layout
            html = re.sub(r'</body>', '</div>\n</body>', html)
            modified = True

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"[OK] Refactored: {file_name}")
        processed_count += 1
    else:
        print(f"[SKIP] No standard layout structures found (or already processed): {file_name}")
        skipped_count += 1

print(f"\\n--- Migration Complete ---")
print(f"Files updated: {processed_count}")
print(f"Files skipped: {skipped_count}")

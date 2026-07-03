import os
import re

BASE_DIR = '/Users/suchi/Documents/Data proctor'

# 1. Update design_system.css
css_path = os.path.join(BASE_DIR, 'design_system.css')
with open(css_path, 'r') as f:
    css_content = f.read()

m3_light_tokens = """
  /* ==========================================================================
     M3 COLOR SYSTEM - LIGHT MODE
     ========================================================================== */
  --md-sys-color-primary: #0061a4; 
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #d1e4ff;
  --md-sys-color-on-primary-container: #001d36;

  --md-sys-color-secondary: #535f70;
  --md-sys-color-on-secondary: #ffffff;
  --md-sys-color-secondary-container: #d7e3f7;
  --md-sys-color-on-secondary-container: #101c2b;

  --md-sys-color-tertiary: #6b5778;
  --md-sys-color-on-tertiary: #ffffff;
  --md-sys-color-tertiary-container: #f2daff;
  --md-sys-color-on-tertiary-container: #251431;

  --md-sys-color-error: #ba1a1a;
  --md-sys-color-on-error: #ffffff;
  --md-sys-color-error-container: #ffdad6;
  --md-sys-color-on-error-container: #410002;

  --md-sys-color-background: #fdfcff;
  --md-sys-color-on-background: #1a1c1e;
  
  --md-sys-color-surface: #fdfcff;
  --md-sys-color-on-surface: #1a1c1e;
  --md-sys-color-surface-variant: #dfe2eb;
  --md-sys-color-on-surface-variant: #43474e;
  
  --md-sys-color-surface-container-lowest: #ffffff;
  --md-sys-color-surface-container-low: #f7f6fa;
  --md-sys-color-surface-container: #f1f0f4;
  --md-sys-color-surface-container-high: #ebeaef;
  --md-sys-color-surface-container-highest: #e6e5e9;

  --md-sys-color-outline: #73777f;
  --md-sys-color-outline-variant: #c3c7cf;

  /* ==========================================================================
     M3 TYPOGRAPHY
     ========================================================================== */
  --md-sys-typescale-display-large: 400 57px/64px 'Inter', sans-serif;
  --md-sys-typescale-headline-large: 400 32px/40px 'Inter', sans-serif;
  --md-sys-typescale-title-large: 400 22px/28px 'Inter', sans-serif;
  --md-sys-typescale-label-large: 500 14px/20px 'Inter', sans-serif;
  --md-sys-typescale-body-large: 400 16px/24px 'Inter', sans-serif;

  /* ==========================================================================
     M3 SHAPE & ELEVATION
     ========================================================================== */
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-full: 9999px;

  --md-sys-elevation-level0: none;
  --md-sys-elevation-level1: 0px 1px 2px 0px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15);
  --md-sys-elevation-level2: 0px 1px 2px 0px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15);
  --md-sys-elevation-level3: 0px 1px 3px 0px rgba(0,0,0,0.3), 0px 4px 8px 3px rgba(0,0,0,0.15);
  --md-sys-elevation-level4: 0px 2px 3px 0px rgba(0,0,0,0.3), 0px 6px 10px 4px rgba(0,0,0,0.15);
  --md-sys-elevation-level5: 0px 4px 4px 0px rgba(0,0,0,0.3), 0px 8px 12px 6px rgba(0,0,0,0.15);
  
  --md-sys-spacing-standard: 24px;
"""

m3_dark_tokens = """
  --md-sys-color-primary: #9ecaff;
  --md-sys-color-on-primary: #003258;
  --md-sys-color-primary-container: #00497d;
  --md-sys-color-on-primary-container: #d1e4ff;

  --md-sys-color-secondary: #bbc7db;
  --md-sys-color-on-secondary: #253140;
  --md-sys-color-secondary-container: #3b4858;
  --md-sys-color-on-secondary-container: #d7e3f7;

  --md-sys-color-tertiary: #d6b8ff;
  --md-sys-color-on-tertiary: #3b2948;
  --md-sys-color-tertiary-container: #523f5f;
  --md-sys-color-on-tertiary-container: #f2daff;

  --md-sys-color-error: #ffb4ab;
  --md-sys-color-on-error: #690005;
  --md-sys-color-error-container: #93000a;
  --md-sys-color-on-error-container: #ffdad6;

  --md-sys-color-background: #1a1c1e;
  --md-sys-color-on-background: #e2e2e6;
  
  --md-sys-color-surface: #1a1c1e;
  --md-sys-color-on-surface: #e2e2e6;
  --md-sys-color-surface-variant: #43474e;
  --md-sys-color-on-surface-variant: #c3c7cf;

  --md-sys-color-surface-container-lowest: #0f0f11;
  --md-sys-color-surface-container-low: #1a1c1e;
  --md-sys-color-surface-container: #1e2022;
  --md-sys-color-surface-container-high: #2b2d30;
  --md-sys-color-surface-container-highest: #36383b;

  --md-sys-color-outline: #8d9199;
  --md-sys-color-outline-variant: #43474e;
"""

# Map existing legacy tokens to M3 tokens to preserve styles
legacy_mapping = """
  --pri: var(--md-sys-color-primary);
  --pri-dk: var(--md-sys-color-primary-container);
  --pri-text: var(--md-sys-color-primary);
  --pri-con: var(--md-sys-color-primary-container);
  --on-pri: var(--md-sys-color-on-primary);
  
  --sec: var(--md-sys-color-secondary);
  --ter: var(--md-sys-color-tertiary);
  --err: var(--md-sys-color-error);
  --suc: #146c2e;
  --wrn: #7d5700;
  --inf: #00639b;
  
  --sur: var(--md-sys-color-surface);
  --sur-var: var(--md-sys-color-surface-variant);
  --out: var(--md-sys-color-outline);
  --out-var: var(--md-sys-color-outline-variant);
  
  --on-sur: var(--md-sys-color-on-surface);
  --on-sur-var: var(--md-sys-color-on-surface-variant);
  
  --surface: var(--md-sys-color-surface);
  --surface-bg: var(--md-sys-color-surface-container);
  --surface-light: var(--md-sys-color-surface-container-low);
  --surface-hover: var(--md-sys-color-surface-variant);
  --bg: var(--md-sys-color-background);
  --border: var(--md-sys-color-outline-variant);
  --border-light: var(--md-sys-color-outline-variant);
  --border-color: var(--md-sys-color-outline);
  --text-primary: var(--md-sys-color-on-surface);
  --text-secondary: var(--md-sys-color-on-surface-variant);
  --text-tertiary: var(--md-sys-color-outline);
  
  --radius-sm: var(--md-sys-shape-corner-small);
  --radius-md: var(--md-sys-shape-corner-medium);
  --radius-lg: var(--md-sys-shape-corner-large);
"""

# inject tokens into :root
if '--md-sys-color-primary' not in css_content:
    root_pattern = r'(:root\s*\{)'
    css_content = re.sub(root_pattern, r'\1\n' + m3_light_tokens + legacy_mapping, css_content, count=1)
    
    # inject into [data-t="dark"]
    dark_pattern = r'(\[data-t="dark"\]\s*\{)'
    css_content = re.sub(dark_pattern, r'\1\n' + m3_dark_tokens, css_content, count=1)
    
    # add structural M3 CSS classes
    m3_layout_css = """
/* ==========================================================================
   M3 GLOBAL LAYOUT BOILERPLATE
   ========================================================================== */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
  overflow: hidden;
}

.md-top-app-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 var(--md-sys-spacing-standard);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  z-index: 1000;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.md-navigation-drawer {
  width: 280px;
  background-color: var(--md-sys-color-surface-container-low);
  border-right: 1px solid var(--md-sys-color-outline-variant);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);
  overflow-y: auto;
}

.md-navigation-drawer.md-rail {
  width: 80px;
}

.md-main-content {
  flex: 1;
  padding: var(--md-sys-spacing-standard);
  overflow-y: auto;
  background-color: var(--md-sys-color-background);
}

.md-content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--md-sys-spacing-standard);
}

.md-card {
  background-color: var(--md-sys-color-surface-container-lowest);
  border-radius: var(--md-sys-shape-corner-medium);
  padding: var(--md-sys-spacing-standard);
}
.md-card-elevated {
  box-shadow: var(--md-sys-elevation-level1);
  border: none;
}
.md-card-outlined {
  border: 1px solid var(--md-sys-color-outline-variant);
}

.md-title-large { font: var(--md-sys-typescale-title-large); }
.md-title-medium { font: var(--md-sys-typescale-label-large); }
.md-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border: none;
  border-radius: var(--md-sys-shape-corner-large);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--md-sys-elevation-level3);
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.md-fab:hover { box-shadow: var(--md-sys-elevation-level4); }
"""
    css_content += m3_layout_css
    
    with open(css_path, 'w') as f:
        f.write(css_content)
    print("Updated design_system.css with M3 tokens.")

# 2. Refactor HTML files to use the new boilerplate classes
html_files = [
    'super_admin_3005.html',
    'admin_portal.html',
    'online_proctor.html'
]

for file_name in html_files:
    file_path = os.path.join(BASE_DIR, file_name)
    if not os.path.exists(file_path):
        print(f"Skipping {file_name}, does not exist.")
        continue
        
    with open(file_path, 'r') as f:
        html = f.read()
        
    # Replace the legacy classes with new M3 classes, preserving functionality
    html = re.sub(r'class="global-header"', 'class="global-header md-top-app-bar"', html)
    html = re.sub(r'class="sidebar"', 'class="sidebar md-navigation-drawer"', html)
    html = re.sub(r'class="main-content"', 'class="main-content md-main-content"', html)
    
    # Wrap sidebar and main-content in app-body if not already
    if 'class="app-body"' not in html:
        # Find where sidebar starts
        sidebar_match = re.search(r'<aside[^>]*class="[^"]*sidebar[^"]*"[^>]*>', html)
        if sidebar_match:
            html = html[:sidebar_match.start()] + '<div class="app-body">\n' + html[sidebar_match.start():]
            
            # Find the end of main-content to close app-body
            # This is tricky with regex, instead we will just replace the end body tag
            html = re.sub(r'</body>', '</div>\n</body>', html)
            
            # Wrap everything from header to end of app-body in app-layout
            header_match = re.search(r'<header[^>]*class="[^"]*global-header[^"]*"[^>]*>', html)
            if header_match:
                html = html[:header_match.start()] + '<div class="app-layout">\n' + html[header_match.start():]
                html = re.sub(r'</body>', '</div>\n</body>', html)

    with open(file_path, 'w') as f:
        f.write(html)
    print(f"Updated {file_name} with M3 boilerplate wrappers.")

print("Migration script completed.")

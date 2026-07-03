import os
import re

BASE_DIR = '/Users/suchi/Documents/Data proctor'
css_path = os.path.join(BASE_DIR, 'design_system.css')

with open(css_path, 'r') as f:
    css_content = f.read()

m3_light_tokens = """  /* ==========================================================================
     M3 COLOR SYSTEM - LIGHT MODE (MEDIUM CONTRAST)
     ========================================================================== */
  
  /* Unified Accent Color */
  --md-sys-color-primary: #006492; /* Stays identical in Dark Mode */
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #4696c8;
  --md-sys-color-on-primary-container: #000000;

  /* Secondary (MC: Tone 30) */
  --md-sys-color-secondary: #3b4858;
  --md-sys-color-on-secondary: #ffffff;
  --md-sys-color-secondary-container: #707e90;
  --md-sys-color-on-secondary-container: #000000;

  /* Tertiary (MC: Tone 30) */
  --md-sys-color-tertiary: #523f5f;
  --md-sys-color-on-tertiary: #ffffff;
  --md-sys-color-tertiary-container: #887496;
  --md-sys-color-on-tertiary-container: #000000;

  /* Error (MC: Tone 30) */
  --md-sys-color-error: #8c0009;
  --md-sys-color-on-error: #ffffff;
  --md-sys-color-error-container: #da342e;
  --md-sys-color-on-error-container: #000000;

  /* Background & Surfaces (MC shifts for higher contrast) */
  --md-sys-color-background: #fdfcff;
  --md-sys-color-on-background: #1a1c1e;
  
  --md-sys-color-surface: #fdfcff;
  --md-sys-color-on-surface: #1a1c1e;
  --md-sys-color-surface-variant: #dfe2eb;
  --md-sys-color-on-surface-variant: #3f434a;
  
  --md-sys-color-surface-container-lowest: #ffffff;
  --md-sys-color-surface-container-low: #f7f6fa;
  --md-sys-color-surface-container: #f1f0f4;
  --md-sys-color-surface-container-high: #ebeaef;
  --md-sys-color-surface-container-highest: #e6e5e9;

  /* Outlines */
  --md-sys-color-outline: #5c6068;
  --md-sys-color-outline-variant: #787c84;"""

m3_dark_tokens = """[data-t="dark"] {
  /* ==========================================================================
     M3 COLOR SYSTEM - DARK MODE (MEDIUM CONTRAST)
     ========================================================================== */
  /* Unified Accent Color */
  --md-sys-color-primary: #006492; /* Identical to Light Mode */
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #4696c8;
  --md-sys-color-on-primary-container: #000000;

  /* Secondary (MC: Tone 85) */
  --md-sys-color-secondary: #cdd9ed;
  --md-sys-color-on-secondary: #001328;
  --md-sys-color-secondary-container: #919fb2;
  --md-sys-color-on-secondary-container: #000000;

  /* Tertiary (MC: Tone 85) */
  --md-sys-color-tertiary: #e9ccff;
  --md-sys-color-on-tertiary: #2a143b;
  --md-sys-color-tertiary-container: #aa94b8;
  --md-sys-color-on-tertiary-container: #000000;

  /* Error (MC: Tone 85) */
  --md-sys-color-error: #ffbab1;
  --md-sys-color-on-error: #370001;
  --md-sys-color-error-container: #ff5449;
  --md-sys-color-on-error-container: #000000;

  /* Background & Surfaces */
  --md-sys-color-background: #1a1c1e;
  --md-sys-color-on-background: #fdfcff;
  
  --md-sys-color-surface: #1a1c1e;
  --md-sys-color-on-surface: #fdfcff;
  --md-sys-color-surface-variant: #43474e;
  --md-sys-color-on-surface-variant: #e1e5ee;

  --md-sys-color-surface-container-lowest: #0f0f11;
  --md-sys-color-surface-container-low: #1a1c1e;
  --md-sys-color-surface-container: #1e2022;
  --md-sys-color-surface-container-high: #2b2d30;
  --md-sys-color-surface-container-highest: #36383b;

  /* Outlines */
  --md-sys-color-outline: #a7abb4;
  --md-sys-color-outline-variant: #878b94;"""

# Replace Light Mode block
pattern_light = r'(/\* ==========================================================================.*?M3 COLOR SYSTEM - LIGHT MODE.*?\*/.*?)--md-sys-color-outline-variant:.*?;'
css_content = re.sub(pattern_light, m3_light_tokens, css_content, flags=re.DOTALL)

# Replace Dark Mode block
pattern_dark = r'\[data-t="dark"\]\s*\{.*?(?=--md-sys-color-outline-variant:.*?;\s*})--md-sys-color-outline-variant:.*?;'
css_content = re.sub(pattern_dark, m3_dark_tokens, css_content, flags=re.DOTALL)

with open(css_path, 'w') as f:
    f.write(css_content)

print("Updated design_system.css with M3 Medium Contrast tokens.")

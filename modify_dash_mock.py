import sys
import re
import random

filename = "/Users/suchi/Documents/Data proctor/classroom-proctor.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Dashboard Card + Associated Organization
org_pattern = r'<h3 style="font-size:16px; margin-bottom:16px; display:flex; align-items:center; gap:8px;"><i class="material-icons-outlined" style="color:var\(--brand-primary\);">corporate_fare</i> Organization</h3>'
org_replacement = """<h3 style="font-size:16px; margin-bottom:16px; display:flex; align-items:center; gap:8px;"><i class="material-icons-outlined" style="color:var(--brand-primary);">corporate_fare</i> Associated Organization</h3>"""
content = re.sub(org_pattern, org_replacement, content)

kpi_pattern = r'(<p style="color:var\(--text-secondary\); margin-top:4px;">Here is what\'s happening at SecureProctor University today.</p>\n\s*</div>)'
proctor_id_card = r"""\1
<div style="margin-left:auto; display:flex; gap:24px; align-items:center; background:var(--bg-color); border:1px solid var(--border-light); padding:16px 24px; border-radius:12px; box-shadow:var(--shadow-sm);">
    <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:40px; height:40px; border-radius:50%; background:rgba(0,99,155,0.1); display:flex; align-items:center; justify-content:center; color:var(--brand-primary);">
            <i class="material-icons-outlined">badge</i>
        </div>
        <div>
            <div style="font-size:12px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">SDC Proctor ID</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-primary); font-family:var(--font-mono);">PR-A7X92BQ</div>
        </div>
    </div>
    <div style="width:1px; height:32px; background:var(--border-light);"></div>
    <div>
        <div style="font-size:12px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">Valid up to</div>
        <div style="font-size:14px; font-weight:600; color:var(--text-primary);">June 25, 2029</div>
    </div>
    <button class="btn btn-secondary" disabled style="opacity:0.6; cursor:not-allowed;">Renewal</button>
</div>
"""
content = re.sub(kpi_pattern, proctor_id_card, content)


# 2. Remove "Active Live Class" dropdown from view-monitoring
drop_pattern = r'<select class="btn btn-secondary" id="monitor-session-select" onchange="v3App\.renderMonitoring\(\)" style="background:var\(--bg-color\);">.*?<!-- Options populated by JS -->\s*</select>'
content = re.sub(drop_pattern, "", content, flags=re.DOTALL)


# 3. Realistic learning progress in MOCK_API_DATA
# We need to replace "learningProgress":100 with realistic numbers where examStatus is "in_progress"
def replace_progress(match):
    val = random.choice([25, 33, 45, 60, 75, 80, 90, 100])
    return f'"learningProgress":{val}'

# In JSON format, it appears as "learningProgress":100
content = re.sub(r'"learningProgress":100', replace_progress, content)


# 4. Fix Toast Text Contrast
toast_css_pattern = r'(\.toast \{.*?background: var\(--surface-color\);.*?\n)'
toast_css_replacement = r'\1  color: var(--text-primary);\n'
# Let's ensure we just replace it forcefully
# We will use string replace for the specific block
old_toast = """.toast {
  background: var(--surface-color);
  border-left: 4px solid var(--brand-primary);
  box-shadow: var(--shadow-md);
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}"""

new_toast = """.toast {
  background: #2D3748; /* Dark background for contrast */
  color: #FFFFFF; /* White text for contrast */
  border-left: 4px solid var(--brand-primary);
  box-shadow: var(--shadow-lg);
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 9999;
}"""

content = content.replace(old_toast, new_toast)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Dashboard, Monitoring dropdown, Toast CSS, and Mock data updated.")

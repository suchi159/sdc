import sys
import re

filename = "/Users/suchi/Documents/Data proctor/classroom-proctor.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

back_pattern = r'<button class="icon-button" onclick="v3App.switchView\(\'sessions\'\)"><i class="material-icons-outlined">arrow_back</i></button>'
back_repl = r'<button class="btn btn-secondary" onclick="v3App.switchView(\'sessions\')" style="display:flex; align-items:center; gap:4px; padding:6px 12px; font-size:13px; margin-right:8px;"><i class="material-icons-outlined" style="font-size:16px;">arrow_back</i> Back to Classes</button>'
content = re.sub(back_pattern, back_repl, content)

mat_pattern = r'<div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; position:relative;">'
mat_repl = r'<div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; position:relative; box-shadow:var(--shadow-md); transition:transform 0.2s; border:1px solid var(--border-light);" onmouseover="this.style.transform=\'translateY(-4px)\'" onmouseout="this.style.transform=\'translateY(0)\'">'

content = re.sub(mat_pattern, mat_repl, content)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Navigation and Learning Materials UX updated.")

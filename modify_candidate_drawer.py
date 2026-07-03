import sys
import re

filename = "/Users/suchi/Documents/Data proctor/classroom-proctor.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the signature and add the logic inside candidate block
drawer_func_pattern = r'toggleRetakeFields\(isChecked\) \{\n.*?\n  \}\n\n  openFormDrawer\(type\) \{'
drawer_func_repl = """toggleRetakeFields(isChecked) {
      const el = document.getElementById('retake-options');
      if (el) {
          el.style.display = isChecked ? 'block' : 'none';
      }
  }

  openFormDrawer(type, contextId = null) {"""

content = re.sub(drawer_func_pattern, drawer_func_repl, content, flags=re.DOTALL)


# 2. Add ID to the "Add to Class" form group and add the contextId logic
candidate_pattern = r'(<div class="form-group mb-4">\s*<label[^>]*>Add to Class</label>\s*<select id="ac-class" style="\$\{inputStyle\}">.*?</div>\s*`;\s*this\.searchDirectory\(\'\'\);)'
candidate_repl = r"""<div class="form-group mb-4" id="ac-class-group">
          <label style="display:block; margin-bottom:8px; font-size:13px; font-weight:600;">Add to Class</label>
          <select id="ac-class" style="${inputStyle}">
            <option value="">— No class yet —</option>
            ${classOpts}
          </select>
        </div>
      `;
      this.searchDirectory('');
      if (contextId) {
          const grp = document.getElementById('ac-class-group');
          if (grp) grp.style.display = 'none';
          document.getElementById('ac-class').value = contextId;
      }"""

content = re.sub(candidate_pattern, candidate_repl, content, flags=re.DOTALL)

# 3. Update the button in openSessionDetail
btn_pattern = r'<button class="btn btn-secondary" onclick="v3App\.openFormDrawer\(\'candidate\'\)"><i class="material-icons-outlined">person_add</i> Add Candidate</button>'
btn_repl = r'<button class="btn btn-secondary" onclick="v3App.openFormDrawer(\'candidate\', \'${id}\')"><i class="material-icons-outlined">person_add</i> Add Candidate</button>'
content = re.sub(btn_pattern, btn_repl, content)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Add candidate drawer logic updated.")

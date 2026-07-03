import sys
import re

filename = "/Users/suchi/Documents/Data proctor/classroom-proctor.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# Exam Setup Modal Replacement
session_pattern = r"\} else if \(type === 'session'\) \{.*?(?=      \} else \{)"
session_replacement = """} else if (type === 'session') {
      document.getElementById('drawer-title').textContent = 'Add Class';
      content.innerHTML = `
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom: 4px; font-size:13px; font-weight:600;">Class Name</label>
          <input type="text" id="form-s-name" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. Final Exams - Batch A">
        </div>
        
        <div class="form-group mb-4" id="assessment-section" style="padding:16px; border:1px solid var(--border-light); border-radius:8px; background:var(--brand-active);">
            <h4 style="margin:0 0 12px 0; font-size:14px;">Exam Assessment</h4>
            <label style="display:block; margin-bottom:4px; font-size:12px; font-weight:600;">Select Assessment</label>
            <select id="form-s-assessment" style="width:100%; padding:10px; border-radius:6px; margin-bottom:12px; border:1px solid var(--border-color); background:var(--bg-color);" onchange="document.getElementById('mock-vouchers-avail').innerText = this.value ? Math.floor(Math.random() * 50) + 10 : '--';">
                <option value="">Select Assessment...</option>
                <option value="ServSafe Food Handler">ServSafe Food Handler</option>
                <option value="Food Protection Manager">Food Protection Manager</option>
                <option value="HACCP Certification">HACCP Certification</option>
                <option value="Allergen Awareness">Allergen Awareness</option>
            </select>
            <div style="font-size:13px; font-weight:600;">
                Voucher Codes Available: <span id="mock-vouchers-avail" style="color:var(--brand-primary);">--</span>
            </div>
        </div>

        <div style="display:flex; gap:16px; margin-bottom:16px;">
          <div class="form-group" style="flex:1">
            <label style="display:block; margin-bottom: 4px; font-size:13px; font-weight:600;">Subject Duration (mins)</label>
            <input type="number" id="form-s-dur" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. 120" value="120">
          </div>
        </div>
        <div class="form-group mb-4">
          <label style="display:block; margin-bottom:12px; font-size:13px; font-weight:600; border-bottom:1px solid var(--border-light); padding-bottom:8px;">Exam Setup</label>
          <div style="display:flex; gap:16px; margin-bottom:16px;">
            <div style="flex:1">
              <label style="display:block; margin-bottom:4px; font-size:12px;">Date</label>
              <input type="date" id="form-s-date" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
            </div>
            <div style="flex:1">
              <label style="display:block; margin-bottom:4px; font-size:12px;">Time</label>
              <input type="time" id="form-s-time" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);">
            </div>
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block; margin-bottom:4px; font-size:12px;">Location</label>
            <input type="text" id="form-s-loc" style="width:100%; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color);" placeholder="e.g. Room 101 or Online">
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <label style="font-size:12px; font-weight:600;">Allow Retake</label>
            <label class="switch">
              <input type="checkbox" id="form-s-retake" onchange="v3App.toggleRetakeFields(this.checked)">
              <span class="switch-slider"></span>
            </label>
          </div>
          <div id="retake-options" style="display:none; margin-bottom:12px; padding:12px; background:rgba(0,0,0,0.02); border-radius:6px; border:1px dashed var(--border-color);">
            <label style="display:block; margin-bottom:4px; font-size:12px;">Max Retake Attempts</label>
            <input type="number" id="form-s-retake-max" style="width:100%; padding:8px; border-radius:4px; border:1px solid var(--border-color); margin-bottom:8px;" value="1">
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <label style="font-size:12px; font-weight:600;">Allow Online Exam</label>
            <label class="switch">
              <input type="checkbox" id="form-s-online">
              <span class="switch-slider"></span>
            </label>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <label style="font-size:12px; font-weight:600;">Sponsored by Organization</label>
            <label class="switch">
              <input type="checkbox" id="form-s-sponsor">
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>
      `;
      document.getElementById('drawer-action-btn').textContent = 'Add Class';
      document.getElementById('drawer-action-btn').onclick = () => {
        const name = document.getElementById('form-s-name').value;
        const assessment = document.getElementById('form-s-assessment').value;
        if (!name) { this.showToast('Class name is required.', 'error'); return; }
        if (!assessment) { this.showToast('Please select an assessment.', 'error'); return; }

        const date = document.getElementById('form-s-date').value || new Date().toISOString().split('T')[0];
        const time = document.getElementById('form-s-time').value || "09:00";
        
        const newSession = {
            id: 'sess_' + Date.now(),
            name: name,
            organization: 'SafeFood AI',
            examDate: date + 'T' + time + ':00Z',
            startTime: time,
            duration: parseInt(document.getElementById('form-s-dur').value || 120),
            status: 'draft',
            allowRetake: document.getElementById('form-s-retake').checked,
            maxRetakeAttempts: document.getElementById('form-s-retake').checked ? parseInt(document.getElementById('form-s-retake-max').value || 0) : 0,
            retakeWindow: 0,
            createdAt: new Date().toISOString(),
            createdBy: 'usr_001',
            candidateCount: 0,
            vouchersAssigned: 0,
            vouchersUsed: 0,
            vouchersAvailable: parseInt(document.getElementById('mock-vouchers-avail').innerText) || 0,
            activityLog: [{
                ts: new Date().toISOString(),
                by: 'Dr. Sarah Jenkins',
                action: 'Created draft',
                detail: 'Draft session created'
            }]
        };
        
        this.state.sessions.unshift(newSession);
        
        if (this.currentView === 'sessions') {
            this.renderSessionsList();
        }
        
        this.closeDrawer();
        this.showToast('New class created and saved as draft.', 'success');
      };"""

content = re.sub(session_pattern, session_replacement, content, flags=re.DOTALL)

# Let's define the toggleRetakeFields function
toggle_retake_func = """
  toggleRetakeFields(isChecked) {
      const el = document.getElementById('retake-options');
      if (el) {
          el.style.display = isChecked ? 'block' : 'none';
      }
  }

  openFormDrawer"""

content = content.replace("  openFormDrawer", toggle_retake_func)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Exam setup modified")

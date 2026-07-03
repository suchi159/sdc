import sys
import re

filename = "/Users/suchi/Documents/Data proctor/classroom-proctor.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# Replace Step 1 content
# The section starts with <div class="view-step" id="view-reg-0"> and ends with id="btn-reg-0" ... </button>\n</div>
reg_0_pattern = r'(<div class="view-step" id="view-reg-0">.*?</button>\n</div>)'
reg_0_replacement = """<div class="view-step" id="view-reg-0">
<div class="wizard-progress">
<div class="wizard-dot active"></div>
<div class="wizard-dot"></div>
<div class="wizard-dot"></div>
<div class="wizard-dot"></div>
</div>
<h3 style="margin:0 0 16px 0; font-size:18px;">Step 1: Proctor Application</h3>
<p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">Please provide your details.</p>
<div class="inp-group">
<label for="input-reg-name">Full Name</label>
<input id="input-reg-name" placeholder="e.g. John Doe" type="text" oninput="v3App.checkRegStep0()"/>
</div>
<div class="inp-group">
<label for="input-reg-email">Email Address</label>
<input id="input-reg-email" placeholder="e.g. john@example.com" type="email" oninput="v3App.checkRegStep0()"/>
</div>
<button class="btn btn-primary btn-full" disabled id="btn-reg-0" onclick="v3App.authNextStep(1)">Submit &amp; Continue</button>
</div>"""

content = re.sub(reg_0_pattern, reg_0_replacement, content, flags=re.DOTALL)

# Add checkRegStep0 function script inside if it doesn't exist. Actually it's better to just write the script inline or remove the disabled attribute dynamically.
# Let's remove the "disabled" logic from the HTML, and just let them click it or add a simple inline script:
reg_0_replacement = """<div class="view-step" id="view-reg-0">
<div class="wizard-progress">
<div class="wizard-dot active"></div>
<div class="wizard-dot"></div>
<div class="wizard-dot"></div>
<div class="wizard-dot"></div>
</div>
<h3 style="margin:0 0 16px 0; font-size:18px;">Step 1: Proctor Application</h3>
<p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">Please provide your details.</p>
<div class="inp-group">
<label for="input-reg-name">Full Name</label>
<input id="input-reg-name" placeholder="e.g. John Doe" type="text" oninput="document.getElementById('btn-reg-0').disabled = !(this.value && document.getElementById('input-reg-email').value);"/>
</div>
<div class="inp-group">
<label for="input-reg-email">Email Address</label>
<input id="input-reg-email" placeholder="e.g. john@example.com" type="email" oninput="document.getElementById('btn-reg-0').disabled = !(this.value && document.getElementById('input-reg-name').value);"/>
</div>
<button class="btn btn-primary btn-full" disabled id="btn-reg-0" onclick="v3App.authNextStep(1)">Submit &amp; Continue</button>
</div>"""

content = re.sub(reg_0_pattern, reg_0_replacement, content, flags=re.DOTALL)

# Update Step 5 (Success)
success_pattern = r'(<div class="view-step" id="view-reg-success" style="text-align:center;">.*?</button>\n</div>)'
success_replacement = """<div class="view-step" id="view-reg-success" style="text-align:center;">
<i class="material-icons-outlined" style="font-size:64px; color:var(--status-success); margin-bottom:16px;">verified</i>
<h3 style="margin:0 0 8px 0; font-size:20px;">Certification Approved</h3>
<div style="font-size:24px; font-weight:700; color:var(--brand-primary); margin:16px 0; padding:12px; border:2px dashed var(--brand-primary); border-radius:8px; display:inline-block;">SDC-ID: PR-A7X92BQ</div>
<p style="font-size:14px; color:var(--text-secondary); margin-bottom:32px;">Congratulations! You are now a certified SecureProctor. Your profile has been updated with your renewal date.</p>
<button class="btn btn-primary btn-full" onclick="v3App.completeAuth()">Go to Dashboard</button>
</div>"""

content = re.sub(success_pattern, success_replacement, content, flags=re.DOTALL)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Registration steps updated.")

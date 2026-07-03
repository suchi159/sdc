import sys
import re

filename = "/Users/suchi/Documents/Data proctor/candidate.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# The regex should capture from `<form id="login-form"` up to the end of the `.voucher-cta-group` block.
pattern = re.compile(r'(<form id="login-form".*?</div>\s*</div>\s*</div>)', re.DOTALL)

replacement = """<div class="login-tabs" style="display:flex; border-bottom:1px solid var(--border-light); margin-bottom:24px;">
  <button type="button" id="tab-email-login" class="badge" onclick="switchLoginTab('email')" style="flex:1; background:var(--brand-active); color:var(--brand-primary); padding:12px; border-radius:0; border-bottom:2px solid var(--brand-primary); font-size:14px; cursor:pointer;">Sign in with Email</button>
  <button type="button" id="tab-voucher-login" class="badge" onclick="switchLoginTab('voucher')" style="flex:1; background:transparent; color:var(--text-secondary); padding:12px; border-radius:0; border-bottom:2px solid transparent; font-size:14px; cursor:pointer;">Sign in with Voucher</button>
</div>

<!-- Email Login Form -->
<form id="login-form" novalidate="" onsubmit="handleLogin(event)">
<div class="inp-group">
<label class="inp-label" for="login-email">Email Address</label>
<div class="inp-wrapper">
<i aria-hidden="true" class="material-icons inp-icon">mail</i>
<input aria-describedby="email-error" class="inp" id="login-email" placeholder="Email address" required="" type="email" value="alex.scott@sdc.edu"/>
</div>
<span class="form-error" id="email-error" role="alert">Please enter a valid email.</span>
</div>
<div class="inp-group">
<label class="inp-label" for="login-pass">Password</label>
<div class="inp-wrapper">
<i aria-hidden="true" class="material-icons inp-icon">lock</i>
<input aria-describedby="pass-error" class="inp" id="login-pass" placeholder="••••••••" required="" type="password" value="candidate123"/>
</div>
<span class="form-error" id="pass-error" role="alert">Password is required.</span>
</div>
<div style="text-align:right; margin:-6px 0 14px;">
<a class="btn-text" href="#" onclick="handleForgotPassword(event)" style="font-size:13px; font-weight:600; display:inline;">Forgot password?</a>
</div>
<button class="btn-primary" id="login-btn" style="width: 100%" type="submit">
<span>Sign In</span>
<i aria-hidden="true" class="material-icons">arrow_forward</i>
</button>
<p style="text-align:center; margin-top:18px; font-size:14px; color:var(--on-sur-var, var(--text-secondary));">
New candidate? <a class="btn-text" href="#" onclick="handleCandidateSignup(event)" style="font-weight:600; display:inline;">Create an account</a>
</p>
</form>

<!-- Voucher Login Form -->
<form id="voucher-login-form" novalidate="" onsubmit="handleUnifiedVoucherLogin(event)" style="display:none;">
<p style="font-size:13px; color:var(--on-sur-var); margin-bottom:16px; line-height:1.5;">
  Enter your voucher code to automatically unlock your learning material or access your exam.
</p>
<div class="inp-group">
<label class="inp-label" for="unified-voucher-code">Voucher Code</label>
<div class="inp-wrapper">
<i aria-hidden="true" class="material-icons inp-icon">vpn_key</i>
<input aria-describedby="voucher-error" class="inp" id="unified-voucher-code" placeholder="e.g. LM-123 or EXAM-456" required="" type="text"/>
</div>
<span class="form-error" id="voucher-error" role="alert" style="display:none; color:var(--status-error); margin-top:4px;">Please enter a valid voucher code.</span>
</div>
<button class="btn-primary" id="voucher-login-btn" style="width: 100%; margin-top:12px;" type="submit">
<span>Continue</span>
<i aria-hidden="true" class="material-icons">arrow_forward</i>
</button>
</form>"""

content = pattern.sub(replacement, content, count=1)

# Now append the new JS logic before the closing </body> tag
js_logic = """
<script>
function switchLoginTab(mode) {
  const emailForm = document.getElementById('login-form');
  const voucherForm = document.getElementById('voucher-login-form');
  const emailTab = document.getElementById('tab-email-login');
  const voucherTab = document.getElementById('tab-voucher-login');
  
  if (mode === 'email') {
    emailForm.style.display = 'block';
    voucherForm.style.display = 'none';
    
    emailTab.style.background = 'var(--brand-active)';
    emailTab.style.color = 'var(--brand-primary)';
    emailTab.style.borderBottom = '2px solid var(--brand-primary)';
    
    voucherTab.style.background = 'transparent';
    voucherTab.style.color = 'var(--text-secondary)';
    voucherTab.style.borderBottom = '2px solid transparent';
  } else {
    emailForm.style.display = 'none';
    voucherForm.style.display = 'block';
    
    voucherTab.style.background = 'var(--brand-active)';
    voucherTab.style.color = 'var(--brand-primary)';
    voucherTab.style.borderBottom = '2px solid var(--brand-primary)';
    
    emailTab.style.background = 'transparent';
    emailTab.style.color = 'var(--text-secondary)';
    emailTab.style.borderBottom = '2px solid transparent';
  }
}

function handleUnifiedVoucherLogin(e) {
  e.preventDefault();
  const code = document.getElementById('unified-voucher-code').value.trim();
  const errorEl = document.getElementById('voucher-error');
  if (!code) {
    errorEl.style.display = 'block';
    errorEl.innerText = 'Please enter a valid voucher code.';
    return;
  }
  errorEl.style.display = 'none';
  
  // Smart Routing Mock Logic
  if (code.toUpperCase().startsWith('LM-')) {
    // Show a success message for learning material
    alert('Learning Material Voucher detected! Redirecting to Learning Hub...');
    // In actual implementation, we would call the backend and redirect
  } else {
    // Assume exam voucher
    alert('Exam Voucher detected! Booting secure exam environment...');
    // In actual implementation, redirect to exam flow
  }
}
</script>
</body>
"""

content = content.replace("</body>", js_logic)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Implementation of Unified Voucher Sign In Tab complete.")

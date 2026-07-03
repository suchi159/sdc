import sys
import re

filename = "/Users/suchi/Documents/Data proctor/candidate.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# I will replace the two separate blocks with a single "clubbed" block.
# Let's locate the start of the first block and the end of the second block.

pattern = re.compile(
    r'(<!-- Pre-login: redeem a Learning Material voucher \(no account/exam needed\) -->.*?</div>\s*</div>\s*)<!-- Pre-login: sign in with an exam voucher code \(purchased online or assigned\) -->.*?</div>\s*</div>',
    re.DOTALL
)

def replacer(match):
    # We will just extract the buttons and panels and wrap them in a single container.
    # Actually it might be easier to use string replacement since I know the exact HTML.
    return match.group(0)

# Let's be precise.
old_html = """<!-- Pre-login: redeem a Learning Material voucher (no account/exam needed) -->
<div class="lm-voucher-block" style="margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--out-var);">
<button class="mdbtn btn-tonal" id="lm-voucher-toggle" onclick="toggleVoucherRedeem()" style="width:100%; justify-content:center; gap:8px;" type="button">
<i class="material-icons" style="font-size:18px;">redeem</i>
<span>Have a learning material voucher?</span>
</button>
<div id="lm-voucher-panel" style="display:none; margin-top:14px;">
<p style="font-size:13px; color:var(--on-sur-var); margin-bottom:12px; line-height:1.5;">
                Enter your voucher code to ask your proctor to unlock your learning material — no exam booking required.
              </p>
<div class="inp-group">
<label class="inp-label" for="lm-voucher-code">Voucher code</label>
<div class="inp-wrapper">
<i aria-hidden="true" class="material-icons inp-icon">confirmation_number</i>
<input class="inp" id="lm-voucher-code" placeholder="e.g. LM-2026-7F3A" type="text"/>
</div>
</div>
<div id="lm-voucher-status" style="margin:6px 0 12px; display:none;"></div>
<button class="btn-primary" id="lm-voucher-btn" onclick="requestVoucherRedeem()" style="width:100%;" type="button">
<i class="material-icons" style="font-size:18px;">send</i>
<span>Request redemption</span>
</button>
</div>
</div>
<!-- Pre-login: sign in with an exam voucher code (purchased online or assigned) -->
<div class="exam-voucher-block" style="margin-top: 14px; padding-top: 18px; border-top: 1px solid var(--out-var);">
<button class="mdbtn btn-tonal" id="exam-voucher-toggle" onclick="toggleVoucherLogin()" style="width:100%; justify-content:center; gap:8px;" type="button">
<i class="material-icons" style="font-size:18px;">vpn_key</i>
<span>Have an exam voucher? Sign in with it</span>
</button>
<div id="exam-voucher-panel" style="display:none; margin-top:14px;">
<p style="font-size:13px; color:var(--on-sur-var); margin-bottom:12px; line-height:1.5;">
                Enter the exam voucher code you purchased online or received from your school. We'll sign you in and unlock your exam — no separate account needed.
              </p>
<div class="inp-group">
<label class="inp-label" for="exam-voucher-code">Exam voucher code</label>
<div class="inp-wrapper">
<i aria-hidden="true" class="material-icons inp-icon">vpn_key</i>
<input class="inp" id="exam-voucher-code" placeholder="e.g. VCH-W0001" type="text" onkeydown="if(event.key==='Enter'){event.preventDefault();handleVoucherLogin();}"/>
</div>
</div>
<div id="exam-voucher-login-status" style="margin:6px 0 12px; display:none;"></div>
<button class="btn-primary" id="exam-voucher-login-btn" onclick="handleVoucherLogin()" style="width:100%;" type="button">
<i class="material-icons" style="font-size:18px;">login</i>
<span>Sign In with Voucher</span>
</button>
</div>
</div>"""

new_html = """<!-- Pre-login: Voucher CTAs clubbed together -->
<div class="voucher-cta-group" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--out-var); display:flex; flex-direction:column; gap:12px;">
  <!-- Learning Material Voucher -->
  <div class="lm-voucher-block">
    <button class="mdbtn btn-tonal" id="lm-voucher-toggle" onclick="toggleVoucherRedeem()" style="width:100%; justify-content:center; gap:8px;" type="button">
      <i class="material-icons" style="font-size:18px;">redeem</i>
      <span>Have a learning material voucher?</span>
    </button>
    <div id="lm-voucher-panel" style="display:none; margin-top:14px; padding:16px; background:var(--sur-container); border-radius:8px;">
      <p style="font-size:13px; color:var(--on-sur-var); margin-bottom:12px; line-height:1.5;">
        Enter your voucher code to ask your proctor to unlock your learning material — no exam booking required.
      </p>
      <div class="inp-group">
        <label class="inp-label" for="lm-voucher-code">Voucher code</label>
        <div class="inp-wrapper">
          <i aria-hidden="true" class="material-icons inp-icon">confirmation_number</i>
          <input class="inp" id="lm-voucher-code" placeholder="e.g. LM-2026-7F3A" type="text"/>
        </div>
      </div>
      <div id="lm-voucher-status" style="margin:6px 0 12px; display:none;"></div>
      <button class="btn-primary" id="lm-voucher-btn" onclick="requestVoucherRedeem()" style="width:100%;" type="button">
        <i class="material-icons" style="font-size:18px;">send</i>
        <span>Request redemption</span>
      </button>
    </div>
  </div>

  <!-- Exam Voucher -->
  <div class="exam-voucher-block">
    <button class="mdbtn btn-tonal" id="exam-voucher-toggle" onclick="toggleVoucherLogin()" style="width:100%; justify-content:center; gap:8px;" type="button">
      <i class="material-icons" style="font-size:18px;">vpn_key</i>
      <span>Have an exam voucher? Sign in with it</span>
    </button>
    <div id="exam-voucher-panel" style="display:none; margin-top:14px; padding:16px; background:var(--sur-container); border-radius:8px;">
      <p style="font-size:13px; color:var(--on-sur-var); margin-bottom:12px; line-height:1.5;">
        Enter the exam voucher code you purchased online or received from your school. We'll sign you in and unlock your exam — no separate account needed.
      </p>
      <div class="inp-group">
        <label class="inp-label" for="exam-voucher-code">Exam voucher code</label>
        <div class="inp-wrapper">
          <i aria-hidden="true" class="material-icons inp-icon">vpn_key</i>
          <input class="inp" id="exam-voucher-code" placeholder="e.g. VCH-W0001" type="text" onkeydown="if(event.key==='Enter'){event.preventDefault();handleVoucherLogin();}"/>
        </div>
      </div>
      <div id="exam-voucher-login-status" style="margin:6px 0 12px; display:none;"></div>
      <button class="btn-primary" id="exam-voucher-login-btn" onclick="handleVoucherLogin()" style="width:100%;" type="button">
        <i class="material-icons" style="font-size:18px;">login</i>
        <span>Sign In with Voucher</span>
      </button>
    </div>
  </div>
</div>"""

if old_html in content:
    content = content.replace(old_html, new_html)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    print("Clubbed the CTAs successfully.")
else:
    print("Could not find the exact old HTML block. Attempting regex...")
    # fallback if spacing is different
    # just create a simple fallback later if needed
    pass

import os

file_path = '/Users/suchi/Documents/Data proctor/classroom-proctor.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace onclick
old_btn = '''<button class="btn btn-secondary" style="border-color:var(--status-error); color:var(--status-error);" onclick="v3App.showToast(\'Voucher Request Sent\', \'success\')">Request Vouchers for Materials</button>'''
new_btn = '''<button class="btn btn-secondary" style="border-color:var(--status-error); color:var(--status-error);" onclick="document.getElementById(\'request-vouchers-modal\').classList.add(\'open\')">Request Vouchers for Materials</button>'''

content = content.replace(old_btn, new_btn)

# Insert modal
modal_html = """
  <!-- Request Vouchers Modal -->
  <div class="batch-modal-overlay" id="request-vouchers-modal" onclick="if(event.target === this) this.classList.remove('open')">
    <div class="batch-modal-content" style="max-width:400px; border-radius:12px; padding:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="font-size:20px; font-weight:600; margin:0; color:var(--text-primary);">Request Vouchers</h2>
        <button style="background:none; border:none; color:var(--text-secondary); cursor:pointer;" onclick="document.getElementById('request-vouchers-modal').classList.remove('open')">
          <i class="material-icons">close</i>
        </button>
      </div>
      <div>
        <label style="display:block; font-size:13px; font-weight:600; margin-bottom:8px; color:var(--text-secondary);">Certification Type</label>
        <select id="req-cert-type" style="width:100%; padding:10px; border:1px solid var(--border-color); background:var(--bg-color); border-radius:6px; color:var(--text-primary); margin-bottom:16px;">
            <option value="Food Handling Cert">Food Handling Cert</option>
            <option value="Professional Chef">Professional Chef</option>
            <option value="Restaurant Manager">Restaurant Manager</option>
        </select>
        
        <label style="display:block; font-size:13px; font-weight:600; margin-bottom:8px; color:var(--text-secondary);">Quantity Needed</label>
        <input type="number" id="req-qty" value="10" min="1" style="width:100%; padding:10px; border:1px solid var(--border-color); background:var(--bg-color); border-radius:6px; color:var(--text-primary); margin-bottom:24px;">
        
        <button class="btn btn-primary" style="width:100%; padding:12px; font-size:14px; display:flex; justify-content:center; gap:8px;" onclick="submitProctorVoucherRequest()">
          <i class="material-icons-outlined" style="font-size:18px;">send</i> Send Request to Org Admin
        </button>
      </div>
    </div>
  </div>

  <!-- Redeem Voucher Modal -->
"""

content = content.replace("  <!-- Redeem Voucher Modal -->", modal_html)

# Insert submitProctorVoucherRequest script at the bottom before </body>
script_html = """
<script>
function submitProctorVoucherRequest() {
    const cert = document.getElementById('req-cert-type').value;
    const qty = parseInt(document.getElementById('req-qty').value);
    
    const reqs = JSON.parse(localStorage.getItem('org_proctor_requests') || '[]');
    reqs.unshift({
        id: 'PR_' + Math.floor(Math.random() * 10000),
        proctorName: 'Dr. Sarah Jenkins',
        cert: cert,
        qty: qty,
        date: new Date().toLocaleDateString(),
        status: 'PENDING'
    });
    localStorage.setItem('org_proctor_requests', JSON.stringify(reqs));
    
    document.getElementById('request-vouchers-modal').classList.remove('open');
    if (typeof v3App !== 'undefined') {
        v3App.showToast('Voucher Request Sent to Org Admin', 'success');
    } else {
        alert('Voucher Request Sent to Org Admin');
    }
}
</script>
</body>
"""

content = content.replace("</body>", script_html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated classroom-proctor.html successfully")

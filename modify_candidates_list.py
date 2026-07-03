import sys
import re

filename = "/Users/suchi/Documents/Data proctor/classroom-proctor.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

unassigned_pattern = r'voucherHtml = `<span style="color:var\(--status-warning\); font-size:12px; font-weight:600;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">warning</i> not assigned</span>`;'
unassigned_repl = r'voucherHtml = `<span style="color:var(--status-warning); font-size:12px; font-weight:600;"><i class="material-icons-outlined" style="font-size:14px; vertical-align:middle;">warning</i> not assigned</span> <button class="btn btn-secondary" style="padding:2px 8px; font-size:11px; margin-left:8px;" onclick="event.stopPropagation(); v3App.openRedeemVoucherModal(\'${c.id}\')">Redeem Voucher Code</button>`;'

pending_pattern = r'voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span class="font-mono" style="background:var\(--border-light\); padding:4px 8px; border-radius:4px; font-size:12px;">\$\{c.voucherCode \|\| \'PENDING\'\}</span><span class="badge badge-warning">Pending</span></div>`;'
pending_repl = r'voucherHtml = `<div style="display:flex; align-items:center; gap:8px;"><span class="font-mono" style="background:var(--border-light); padding:4px 8px; border-radius:4px; font-size:12px;">${c.voucherCode || \'PENDING\'}</span><span class="badge badge-warning">Pending</span> <button class="btn btn-secondary" style="padding:2px 8px; font-size:11px;" onclick="event.stopPropagation(); v3App.openRedeemVoucherModal(\'${c.id}\')">Redeem Voucher Code</button></div>`;'

content = re.sub(unassigned_pattern, unassigned_repl, content)
content = re.sub(pending_pattern, pending_repl, content)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Student List / Voucher Status updated.")

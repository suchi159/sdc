import sys
import re

filename = "/Users/suchi/Documents/Data proctor/classroom-proctor.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    r'\bAssign Voucher\b': 'Assign Voucher Code',
    r'\bAssign Vouchers\b': 'Assign Voucher Codes',
    r'\bassign vouchers\b': 'assign voucher codes',
    r'\bRequest Vouchers\b': 'Request Voucher Codes',
    r'\bRequest vouchers\b': 'Request voucher codes',
    r'\bvouchers available\b': 'voucher codes available',
    r'\bVouchers Available\b': 'Voucher Codes Available',
    r'\bRedeem Voucher\b': 'Redeem Voucher Code',
    r'\bVoucher assigned\b': 'Voucher Code assigned',
    r'\bVoucher Assigned\b': 'Voucher Code Assigned',
    r'\bVoucher Status\b': 'Voucher Code Status',
    r'\bPending Voucher\b': 'Pending Voucher Code',
    r'\bUnassigned Voucher\b': 'Unassigned Voucher Code',
    r'\bVoucher Request\b': 'Voucher Code Request',
    r'\bNumber of Vouchers Needed\b': 'Number of Voucher Codes Needed',
    r'\bvouchers assigned\b': 'voucher codes assigned',
    r'\bVouchers assigned\b': 'Voucher codes assigned',
    r'\bVouchers Used\b': 'Voucher Codes Used',
    r'\bVouchers assigned to\b': 'Voucher codes assigned to'
}

for pattern, repl in replacements.items():
    content = re.sub(pattern, repl, content)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Voucher terminology updated.")

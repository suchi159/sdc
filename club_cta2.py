import sys
import re

filename = "/Users/suchi/Documents/Data proctor/candidate.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(
    r'(<!-- Pre-login: redeem a Learning Material voucher \(no account/exam needed\) -->.*?<div class="lm-voucher-block" style="margin-top: 20px; padding-top: 18px; border-top: 1px solid var\(--out-var\);">)(.*?)<!-- Pre-login: sign in with an exam voucher code \(purchased online or assigned\) -->.*?<div class="exam-voucher-block" style="margin-top: 14px; padding-top: 18px; border-top: 1px solid var\(--out-var\);">',
    re.DOTALL
)

def replacer(match):
    # match.group(1) is the start of the first block including the comment and div tag.
    # We want to replace the div tag with a clubbed div tag, and remove the second block's border and margin.
    
    # We'll just replace both blocks entirely using regex.
    pass

# Simpler regex replacement
# Remove border-top and margin-top from exam-voucher-block
content = re.sub(
    r'<div class="exam-voucher-block" style="margin-top: 14px; padding-top: 18px; border-top: 1px solid var\(--out-var\);">',
    r'<div class="exam-voucher-block" style="margin-top: 12px;">',
    content
)

# Optional: wrap them in a single border if we want.
content = re.sub(
    r'<!-- Pre-login: redeem a Learning Material voucher \(no account/exam needed\) -->\s*<div class="lm-voucher-block" style="margin-top: 20px; padding-top: 18px; border-top: 1px solid var\(--out-var\);">',
    r'<!-- Pre-login: Voucher CTAs clubbed -->\n<div class="voucher-cta-group" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--out-var); display:flex; flex-direction:column; gap:12px;">\n<div class="lm-voucher-block">',
    content
)

# Find the end of exam-voucher-block and add the closing div for voucher-cta-group
# exam-voucher-block ends with:
# <span>Sign In with Voucher</span>
# </button>
# </div>
# </div>

# Let's just do a string replacement for the end of the exam-voucher-block
end_block = """<span>Sign In with Voucher</span>
</button>
</div>
</div>"""

if end_block in content:
    content = content.replace(end_block, end_block + "\n</div>")

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced via regex.")

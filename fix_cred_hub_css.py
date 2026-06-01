import re

with open('candidate.css', 'r') as f:
    css = f.read()

# Enhance status box to be a grid of distinct cards
status_box_old = r'\.cred-status-box\s*\{[^}]*\}'
status_box_new = r'''.cred-status-box {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}'''
css = re.sub(status_box_old, status_box_new, css)

status_item_old = r'\.cred-status-item\s*\{[^}]*\}'
status_item_new = r'''.cred-status-item {
  background: var(--sur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 8px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.cred-status-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}'''
css = re.sub(status_item_old, status_item_new, css)

status_divider_old = r'\.cred-status-divider\s*\{[^}]*\}'
status_divider_new = r'''.cred-status-divider {
  display: none;
}'''
css = re.sub(status_divider_old, status_divider_new, css)

# Enhance action buttons
action_stack_old = r'\.cred-action-stack\s*\{[^}]*\}'
action_stack_new = r'''.cred-action-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}'''
css = re.sub(action_stack_old, action_stack_new, css)

action_btn_old = r'\.cred-action-btn\s*\{[^}]*\}'
action_btn_new = r'''.cred-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: var(--sur);
  color: var(--on-sur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.cred-action-btn:hover {
  background: var(--sur-var);
  border-color: var(--pri);
  color: var(--pri);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}'''
css = re.sub(action_btn_old, action_btn_new, css)

linkedin_btn_old = r'\.cred-linkedin-btn\s*\{[^}]*\}'
linkedin_btn_new = r'''.cred-linkedin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  background: linear-gradient(135deg, #0077B5, #005885);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 119, 181, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.cred-linkedin-btn:hover {
  background: linear-gradient(135deg, #005885, #003a5c);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 119, 181, 0.4);
}'''
css = re.sub(linkedin_btn_old, linkedin_btn_new, css)

# Enhance Wallet Chips
wallet_chip_old = r'\.cred-wallet-chip\s*\{[^}]*\}'
wallet_chip_new = r'''.cred-wallet-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  color: white;
}
.cred-wallet-chip:hover {
  opacity: 0.95;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}'''
css = re.sub(wallet_chip_old, wallet_chip_new, css)

# Enhance Left Column Background
hub_left_old = r'\.cred-hub-left\s*\{[^}]*\}'
hub_left_new = r'''.cred-hub-left {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--glass-border);
  padding: 32px;
  overflow-y: auto;
  gap: 24px;
  background: radial-gradient(circle at top left, var(--sur), var(--md-bg));
  align-items: center;
}'''
css = re.sub(hub_left_old, hub_left_new, css)

hub_right_old = r'\.cred-hub-right\s*\{[^}]*\}'
hub_right_new = r'''.cred-hub-right {
  display: flex;
  flex-direction: column;
  padding: 32px;
  gap: 24px;
  overflow-y: auto;
  background: var(--sur);
}'''
css = re.sub(hub_right_old, hub_right_new, css)

# Enhance the copy verify bar
verify_bar_old = r'\.cred-verify-bar\s*\{[^}]*\}'
verify_bar_new = r'''.cred-verify-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--sur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
  border-radius: 12px;
  padding: 8px 8px 8px 16px;
  width: 100%;
  max-width: 440px;
}'''
css = re.sub(verify_bar_old, verify_bar_new, css)

copy_btn_old = r'\.cred-copy-btn\s*\{[^}]*\}'
copy_btn_new = r'''.cred-copy-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--pri);
  color: var(--on-pri);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.cred-copy-btn:hover {
  opacity: 0.9;
  transform: scale(1.02);
}'''
css = re.sub(copy_btn_old, copy_btn_new, css)

# Segment toggle enhancement
seg_toggle_old = r'\.cred-seg-toggle\s*\{[^}]*\}'
seg_toggle_new = r'''.cred-seg-toggle {
  display: flex;
  background: var(--sur-var);
  border: 1px solid var(--glass-border);
  border-radius: 100px;
  padding: 4px;
  gap: 4px;
  width: 100%;
  max-width: 440px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}'''
css = re.sub(seg_toggle_old, seg_toggle_new, css)

seg_btn_old = r'\.cred-seg-btn\s*\{[^}]*\}'
seg_btn_new = r'''.cred-seg-btn {
  flex: 1;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--on-sur-var);
  background: transparent;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.cred-seg-btn:hover {
  color: var(--on-sur);
}
.cred-seg-btn.active {
  background: var(--sur);
  color: var(--pri);
  box-shadow: var(--shadow-sm);
}'''
css = re.sub(seg_btn_old, seg_btn_new, css)

with open('candidate.css', 'w') as f:
    f.write(css)

print("Updated candidate.css")

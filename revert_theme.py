import re

with open('index.css', 'r') as f:
    css = f.read()

# Revert colors for Light Mode
css = css.replace('--pri: #0f172a;', '--pri: #f9ad00;')
css = css.replace('--pri-dk: #1e293b;', '--pri-dk: #7a4e00;')
css = css.replace('--pri-con: #f1f5f9;', '--pri-con: #fff8e6;')
css = css.replace('--pri-con-ct: #0f172a;', '--pri-con-ct: #7a4e00;')
css = css.replace('--sec: #334155;', '--sec: #6750a4;')
css = css.replace('--sidebar-active-bg: rgba(15, 23, 42, 0.1);', '--sidebar-active-bg: rgba(249, 173, 0, 0.15);')
css = css.replace('--sidebar-active-text: #0f172a;', '--sidebar-active-text: #f9ad00;')

# Revert colors for Dark Mode
css = css.replace('--pri: #e2e8f0;', '--pri: #ffb951;')
css = css.replace('--pri-dk: #f8fafc;', '--pri-dk: #ffedaa;')
css = css.replace('--pri-con: #1e293b;', '--pri-con: #ffedaa;')
css = css.replace('--pri-con-ct: #e2e8f0;', '--pri-con-ct: #1c1100;')
css = css.replace('--sec: #94a3b8;', '--sec: #cbb9f9;')
css = css.replace('--sidebar-active-bg: rgba(226, 232, 240, 0.1);', '--sidebar-active-bg: rgba(255, 185, 81, 0.15);')
css = css.replace('--sidebar-active-text: #e2e8f0;', '--sidebar-active-text: #ffb951;')

# Revert borders and shadows
css = css.replace('--glass-border: rgba(0, 0, 0, 0.1);', '--glass-border: rgba(93, 89, 98, 0.25);')
css = css.replace('--glass-border: rgba(255, 255, 255, 0.1);', '--glass-border: rgba(167, 163, 176, 0.2);')

# We replaced shadow-sm for both light and dark with 'none'. Let's restore them (first match light, second dark).
# Light mode:
css = css.replace('--shadow-sm: none;', '--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);', 1)
# Dark mode:
css = css.replace('--shadow-sm: none;', '--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);', 1)

# Change border-radius: 4px; back to border-radius: 16px; (the dominant original value)
css = css.replace('border-radius: 4px;', 'border-radius: 16px;')

with open('index.css', 'w') as f:
    f.write(css)

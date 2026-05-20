import re

with open('index.css', 'r') as f:
    css = f.read()

# Update colors for Light Mode (Slate / Navy professional look instead of orange/purple)
css = css.replace('--pri: #f9ad00;', '--pri: #0f172a;')
css = css.replace('--pri-dk: #7a4e00;', '--pri-dk: #1e293b;')
css = css.replace('--pri-con: #fff8e6;', '--pri-con: #f1f5f9;')
css = css.replace('--pri-con-ct: #7a4e00;', '--pri-con-ct: #0f172a;')
css = css.replace('--sec: #6750a4;', '--sec: #334155;')
css = css.replace('--sidebar-active-bg: rgba(249, 173, 0, 0.15);', '--sidebar-active-bg: rgba(15, 23, 42, 0.1);')
css = css.replace('--sidebar-active-text: #f9ad00;', '--sidebar-active-text: #0f172a;')

# Update colors for Dark Mode
css = css.replace('--pri: #ffb951;', '--pri: #e2e8f0;')
css = css.replace('--pri-dk: #ffedaa;', '--pri-dk: #f8fafc;')
css = css.replace('--pri-con: #ffedaa;', '--pri-con: #1e293b;')
css = css.replace('--pri-con-ct: #1c1100;', '--pri-con-ct: #e2e8f0;')
css = css.replace('--sec: #cbb9f9;', '--sec: #94a3b8;')
css = css.replace('--sidebar-active-bg: rgba(255, 185, 81, 0.15);', '--sidebar-active-bg: rgba(226, 232, 240, 0.1);')
css = css.replace('--sidebar-active-text: #ffb951;', '--sidebar-active-text: #e2e8f0;')

# Change border radius and border colors for cards
css = re.sub(r'border-radius:\s*(12|16|24|28)px;', 'border-radius: 4px;', css)
css = css.replace('--glass-border: rgba(93, 89, 98, 0.25);', '--glass-border: rgba(0, 0, 0, 0.1);')
css = css.replace('--glass-border: rgba(167, 163, 176, 0.2);', '--glass-border: rgba(255, 255, 255, 0.1);')

# Also fix shadow to be slightly lighter if they want a light border / flat look
css = css.replace('--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);', '--shadow-sm: none;')
css = css.replace('--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);', '--shadow-sm: none;')

with open('index.css', 'w') as f:
    f.write(css)

import re
import os

tokens_file = '/Users/suchi/Desktop/Data proctor/design_system_tokens.md'
target_css_files = [
    '/Users/suchi/Desktop/Data proctor/index.css',
    '/Users/suchi/Desktop/Proctor Training/index.css'
]

with open(tokens_file, 'r') as f:
    tokens_content = f.read()

# Extract Light Mode (:root)
root_match = re.search(r':root\s*\{([^}]*)\}', tokens_content)
light_tokens = root_match.group(1).strip() if root_match else None

# Extract Dark Mode (html[data-t="dark"])
dark_match = re.search(r'html\[data-t="dark"\]\s*\{([^}]*)\}', tokens_content)
dark_tokens = dark_match.group(1).strip() if dark_match else None

if not light_tokens or not dark_tokens:
    print("Failed to extract tokens from markdown.")
    exit(1)

def replace_css_tokens(css_content, block_selector, new_inner):
    # Regex to find the block_selector { ... }
    # We need to preserve the opening and closing braces
    pattern = re.compile(re.escape(block_selector) + r'\s*\{[^}]*\}', re.DOTALL)
    replacement = f"{block_selector} {{\n{new_inner}\n}}"
    
    # Wait, the original css has other variables inside :root like --font, --font-mono, --md-bg, etc.
    # If we just replace the whole block, we lose those.
    # Let's read the new variables and update them individually.
    return css_content

def update_vars(css_content, block_selector, new_inner):
    # Extract existing block
    pattern = re.compile(re.escape(block_selector) + r'\s*\{([^}]*)\}', re.DOTALL)
    match = pattern.search(css_content)
    if not match:
        return css_content
        
    existing_inner = match.group(1)
    
    # Parse new tokens
    new_vars = {}
    for line in new_inner.split('\n'):
        line = line.strip()
        if line.startswith('--'):
            key = line.split(':')[0].strip()
            val = line.split(':')[1].split(';')[0].strip()
            new_vars[key] = val
            
    # Apply to existing block
    updated_inner = existing_inner
    for k, v in new_vars.items():
        # Find the line with this key and replace its value
        # regex to match `--key: old_value;`
        var_pattern = re.compile(re.escape(k) + r'\s*:[^;]+;')
        if var_pattern.search(updated_inner):
            updated_inner = var_pattern.sub(f"{k}: {v};", updated_inner)
        else:
            # If the variable doesn't exist, we could append it, but we assume it does
            pass
            
    # Also update sidebar-active-bg and sidebar-active-text since those were modified by previous theme
    # The amber theme values should be:
    # --sidebar-active-bg: rgba(249, 173, 0, 0.15);
    # --sidebar-active-text: #f9ad00;
    if block_selector == ':root':
        updated_inner = re.sub(r'--sidebar-active-bg\s*:[^;]+;', '--sidebar-active-bg: rgba(249, 173, 0, 0.15);', updated_inner)
        updated_inner = re.sub(r'--sidebar-active-text\s*:[^;]+;', '--sidebar-active-text: #f9ad00;', updated_inner)
            
    # Reconstruct
    return css_content[:match.start(1)] + updated_inner + css_content[match.end(1):]


for css_file in target_css_files:
    if not os.path.exists(css_file):
        continue
    with open(css_file, 'r') as f:
        css = f.read()
        
    css = update_vars(css, ':root', light_tokens)
    css = update_vars(css, 'html[data-t="dark"]', dark_tokens)
    
    with open(css_file, 'w') as f:
        f.write(css)
        
print("Successfully applied tokens to CSS files.")

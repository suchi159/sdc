import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Revert let to const
content = content.replace('let CANDIDATES = [', 'const CANDIDATES = [', 1)

# Remove the dynamic scenario manager block at the end of the file
pattern = re.compile(r'\n// --------------------------------------------------------------------------\n// DYNAMIC SCENARIO MANAGER\n// --------------------------------------------------------------------------\nconst SCENARIOS = \{.*', re.DOTALL)
new_content = pattern.sub('', content)

with open('index.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully reverted scenario manager from index.js")

import os
import glob

files = glob.glob('*.html') + glob.glob('*.js')
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    if "'unsafe-eval'" in content:
        # Remove 'unsafe-eval' with leading/trailing spaces as needed
        content = content.replace(" 'unsafe-eval'", "")
        content = content.replace("'unsafe-eval' ", "")
        content = content.replace("'unsafe-eval'", "")
        with open(f, 'w') as file:
            file.write(content)
        print(f"Fixed {f}")

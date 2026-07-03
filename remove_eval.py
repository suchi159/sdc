import os, glob, re

for f in glob.glob("**/*.html", recursive=True):
    try:
        with open(f, "r") as file:
            content = file.read()
            
        if "unsafe-eval" in content:
            # Remove all instances of unsafe-eval
            new_content = re.sub(r"\'unsafe-eval\'\s*", "", content)
            if new_content != content:
                with open(f, "w") as file:
                    file.write(new_content)
                print(f"Removed unsafe-eval from {f}")
    except Exception as e:
        pass

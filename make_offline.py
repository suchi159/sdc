import os
import re

directories_to_scan = ['.', './Proctor_Prototype']
extensions = ['.html', '.js']

# We just want to remove the http://localhost:PORT/ prefix for absolute URLs
# like http://localhost:3009/admin_portal.html -> admin_portal.html
# and http://localhost:3003/?view=learning -> index.html?view=learning (wait, what is the default for 3003?)

for d in directories_to_scan:
    for filename in os.listdir(d):
        if any(filename.endswith(ext) for ext in extensions):
            filepath = os.path.join(d, filename)
            if not os.path.isfile(filepath): continue
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Replacing specific known localhost links to make it fully offline
            
            # General localhost links with files
            new_content = re.sub(r'http://localhost:\d+/(.*?\.html)', r'\1', content)
            
            # Root links
            # Usually root points to index.html or landing_page.html depending on the port.
            # Let's just point root localhost links to index.html to be safe
            # e.g., http://localhost:3009/ -> index.html (or admin_portal.html for 3009)
            new_content = new_content.replace('http://localhost:3009/', 'admin_portal.html')
            new_content = new_content.replace('http://localhost:3002/', 'online_proctor.html')
            new_content = new_content.replace('http://localhost:3001/', 'secure_exam.html')
            new_content = new_content.replace('http://localhost:3003/', 'index.html')
            new_content = new_content.replace('http://localhost:3005', 'super_admin_3005.html')
            new_content = new_content.replace('http://localhost:8888', 'index.html')
            new_content = new_content.replace('http://localhost:3000', 'index.html')
            new_content = new_content.replace('http://localhost:3007/v3', 'v3.html')
            new_content = new_content.replace('http://localhost:3007/api/', 'data/') # Though API data fetch will still fail if file://
            
            # Clean up remaining bare http://localhost:PORT
            new_content = re.sub(r'http://localhost:\d+', 'index.html', new_content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")

print("Done making files offline.")

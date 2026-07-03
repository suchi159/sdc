import glob
from bs4 import BeautifulSoup
import uuid

files = ["central_hub.html", "candidate.html", "online_proctor.html"]

for f in files:
    try:
        with open(f, "r") as file:
            content = file.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        modified = False
        
        for tag in ['input', 'select', 'textarea']:
            for el in soup.find_all(tag):
                # Fix missing id/name
                if not el.get('id') and not el.get('name'):
                    el['id'] = f"input-{uuid.uuid4().hex[:8]}"
                    modified = True
                    
                # Fix missing label
                # Axe rule: must have an associated label or aria-label or aria-labelledby or title
                if not el.get('aria-label') and not el.get('aria-labelledby') and not el.get('title'):
                    # Check if it has a label wrapper
                    parent_label = el.find_parent('label')
                    # Check if there is a label with for=id
                    id_val = el.get('id')
                    has_label = False
                    if parent_label:
                        has_label = True
                    elif id_val:
                        label = soup.find('label', {'for': id_val})
                        if label:
                            has_label = True
                            
                    if not has_label:
                        # Give it an aria-label
                        # Use placeholder as aria-label if present, else fallback
                        ph = el.get('placeholder')
                        if ph:
                            el['aria-label'] = ph
                        else:
                            el['aria-label'] = f"{tag} field"
                        modified = True
                        
        if modified:
            with open(f, "w") as file:
                file.write(str(soup))
            print(f"Fixed inputs in {f}")
    except Exception as e:
        print(f"Error on {f}: {e}")

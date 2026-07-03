import glob
from bs4 import BeautifulSoup
import uuid

for f in glob.glob("**/*.html", recursive=True):
    try:
        with open(f, "r") as file:
            content = file.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        modified = False
        
        for label in soup.find_all('label'):
            # If it has 'for' or wraps an input/select/textarea, it's fine
            if label.get('for'):
                continue
            if label.find('input') or label.find('select') or label.find('textarea'):
                continue
                
            # It's an orphaned label. Let's see if the next sibling or parent's sibling is an input
            # Typically: <div class="inp-group"><label>Email</label><input type="email"></div>
            # Or <label>Email</label><input type="email">
            
            # Find the closest next sibling that is an input, select, or textarea
            curr = label.find_next_sibling()
            target_input = None
            
            while curr:
                if curr.name in ['input', 'select', 'textarea']:
                    target_input = curr
                    break
                elif curr.find(['input', 'select', 'textarea']):
                    target_input = curr.find(['input', 'select', 'textarea'])
                    break
                curr = curr.find_next_sibling()
                
            if target_input:
                if not target_input.get('id'):
                    target_input['id'] = f"input-{uuid.uuid4().hex[:8]}"
                label['for'] = target_input['id']
                modified = True
            else:
                # If no input is found, change it to a div to avoid the error
                label.name = 'div'
                if not label.get('class'):
                    label['class'] = 'label-text'
                elif isinstance(label['class'], list) and 'label-text' not in label['class']:
                    label['class'].append('label-text')
                modified = True
                
        if modified:
            with open(f, "w") as file:
                file.write(str(soup))
            print(f"Fixed labels in {f}")
    except Exception as e:
        print(f"Error on {f}: {e}")

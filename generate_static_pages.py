import re
from bs4 import BeautifulSoup

def generate_pages():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    
    # Find all panel sections
    panels = soup.find_all('div', class_=re.compile(r'\bpanel-section\b'))
    
    panel_map = {
        'dashboard-panel': 'dashboard.html',
        'live-panel': 'live_monitoring.html',
        'incidents-panel': 'incidents.html',
        'reports-panel': 'reports_analytics.html',
        'calendar-panel': 'calendar_sessions.html',
        'settings-panel': 'settings.html',
        'candidates-panel': 'candidates.html',
        'flags-panel': 'flags.html',
        'earnings-panel': 'earnings.html'
    }

    print(f"Found {len(panels)} panels to separate.")

    for panel in panels:
        panel_id = panel.get('id')
        if panel_id not in panel_map:
            continue
            
        filename = panel_map[panel_id]
        print(f"Generating {filename} for {panel_id}...")
        
        # Create a fresh copy of the soup for each page
        page_soup = BeautifulSoup(html, 'html.parser')
        
        # Update sidebar navigation active states
        nav_buttons = page_soup.find_all('button', class_='nav-item')
        for btn in nav_buttons:
            if btn.get('data-target') == panel_id:
                if 'active' not in btn.get('class', []):
                    btn['class'] = btn.get('class', []) + ['active']
            else:
                if 'active' in btn.get('class', []):
                    btn['class'].remove('active')
        
        # Hide all panels except the target one
        page_panels = page_soup.find_all('div', class_=re.compile(r'\bpanel-section\b'))
        for p in page_panels:
            if p.get('id') == panel_id:
                if 'active' not in p.get('class', []):
                    p['class'] = p.get('class', []) + ['active']
                p['style'] = 'display: block;' # ensure it's visible
            else:
                if 'active' in p.get('class', []):
                    p['class'].remove('active')
                p['style'] = 'display: none;' # hide the others
                
        # Write the new HTML file
        with open(filename, 'w', encoding='utf-8') as out_f:
            out_f.write(str(page_soup))

if __name__ == '__main__':
    generate_pages()
    print("Static pages successfully generated in the folder.")

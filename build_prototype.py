import os
import base64
import json
import re

def get_base64_image(filepath):
    if not os.path.exists(filepath):
        print(f"Warning: Image {filepath} not found.")
        return filepath
    with open(filepath, "rb") as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')
    ext = os.path.splitext(filepath)[1][1:]
    mime = f"image/{ext}" if ext != "jpg" else "image/jpeg"
    return f"data:{mime};base64,{encoded}"

def main():
    print("Building standalone prototype...")
    
    with open("v3.html", "r", encoding="utf-8") as f:
        html_content = f.read()
        
    # Inline CSS
    css_files = ["index.css", "v3.css"]
    for css in css_files:
        if os.path.exists(css):
            with open(css, "r", encoding="utf-8") as f:
                css_content = f.read()
            html_content = html_content.replace(f'<link rel="stylesheet" href="{css}">', f"<style>{css_content}</style>")
    
    # Base64 Images in HTML tags
    images = re.findall(r'<img[^>]+src="([^">]+)"', html_content)
    for img in set(images):
        if not img.startswith("http") and not img.startswith("data:"):
            local_file = img.lstrip('/')
            if os.path.exists(local_file):
                b64 = get_base64_image(local_file)
                html_content = html_content.replace(f'src="{img}"', f'src="{b64}"')
                
    # Base64 Images in CSS / Inline Styles
    css_urls = re.findall(r'url\([\'"]?([^)\'"]+)[\'"]?\)', html_content)
    for url in set(css_urls):
        if not url.startswith("http") and not url.startswith("data:"):
            local_file = url.lstrip('/')
            if os.path.exists(local_file):
                b64 = get_base64_image(local_file)
                html_content = html_content.replace(url, b64)
            
    # Read JS
    if os.path.exists("v3.js"):
        with open("v3.js", "r", encoding="utf-8") as f:
            js_content = f.read()
            
        # Base64 Images inside JS strings
        js_images = re.findall(r'[\'"]/?([a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|gif|svg))[\'"]', js_content)
        for img_name in set(js_images):
            if os.path.exists(img_name):
                b64 = get_base64_image(img_name)
                js_content = js_content.replace(f"'/{img_name}'", f"'{b64}'")
                js_content = js_content.replace(f"'{img_name}'", f"'{b64}'")
                js_content = js_content.replace(f'"/{img_name}"', f'"{b64}"')
                js_content = js_content.replace(f'"{img_name}"', f'"{b64}"')
            
        # Read JSON Data
        data_map = {}
        for endpoint, file in [
            ('/api/dashboard', 'dashboard.json'), # doesn't exist, will mock
            ('/api/candidates', 'candidates.json'),
            ('/api/sessions', 'sessions.json'),
            ('/api/modules', 'modules.json'),
            ('/api/earnings', 'earnings.json'),
            ('/api/reports', 'reports.json'),
            ('/api/settings', 'settings.json') # might not exist
        ]:
            filepath = os.path.join('data', file)
            if os.path.exists(filepath):
                with open(filepath, 'r') as f:
                    try:
                        data_map[endpoint] = json.load(f)
                    except:
                        data_map[endpoint] = {}
            else:
                data_map[endpoint] = {}
                
        # Convert to JSON string
        json_str = json.dumps(data_map, separators=(',', ':'))
        
        # Base64 Images inside the JSON data (like /thumb_food_safety.png)
        json_images = re.findall(r'"/?([a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|gif|svg))"', json_str)
        for img_name in set(json_images):
            if os.path.exists(img_name):
                b64 = get_base64_image(img_name)
                json_str = json_str.replace(f'"/{img_name}"', f'"{b64}"')
                json_str = json_str.replace(f'"{img_name}"', f'"{b64}"')
                
        # Mock fetchData
        js_data_injection = f"const MOCK_API_DATA = {json_str};\n"
        
        # Replace the fetch logic in v3.js
        fetch_replacement = """
    try {
      this.state.dashboard = MOCK_API_DATA['/api/dashboard'] || {};
      this.state.candidates = MOCK_API_DATA['/api/candidates'] || [];
      if (Array.isArray(this.state.candidates)) {
        this.state.candidates.forEach(cand => {
          let vStatus = (cand.voucherStatus || '').toLowerCase();
          let isUnassigned = vStatus === 'not_assigned' || vStatus === 'unassigned' || vStatus === '';
          if (!cand.voucherCode && !isUnassigned) cand.voucherCode = 'VOUCH-' + Math.floor(Math.random()*9000+1000);
          if (!cand.sessionName) cand.sessionName = 'Data Science 101 Bootcamp';
          if (cand.readHours === undefined) cand.readHours = Math.floor(Math.random() * 20);
          if (cand.totalHours === undefined) cand.totalHours = 20;
          if (!cand.pastSessions && Math.random() > 0.5) cand.pastSessions = [{ name: 'Midterm Evaluation', score: '88%', certLink: '#' }];
        });
      }
      this.state.sessions = MOCK_API_DATA['/api/sessions'] || [];
      this.state.materials = MOCK_API_DATA['/api/modules'] || [];
      this.state.earnings = MOCK_API_DATA['/api/earnings'] || {};
      this.state.reports = MOCK_API_DATA['/api/reports'] || {};
      this.state.settings = MOCK_API_DATA['/api/settings'] || {};
      
      this.state.incidents = this.state.dashboard?.pendingIncidents || [];
      
      const badge = document.getElementById('notif-badge');
      if (badge) {
        if (this.state.incidents.length > 0) {
          badge.style.display = 'flex';
          badge.textContent = this.state.incidents.length;
        } else {
          badge.style.display = 'none';
        }
      }
      
      this.renderDashboard();
      
      document.getElementById('loading-overlay').style.display = 'none';
    } catch (err) {
      console.error(err);
      this.showToast('Failed to load data', 'error');
    }
        """
        
        # We need to replace the body of fetchData.
        # Find 'async fetchData() {' and replace until 'this.renderDashboard();'
        
        # Replace fetchData manually by finding its bounds
        start_idx = js_content.find("async fetchData() {")
        if start_idx != -1:
            end_idx = js_content.find("  switchView(viewId) {", start_idx)
            if end_idx != -1:
                # The end of fetchData is just before switchView
                original_fetch_data = js_content[start_idx:end_idx]
                new_fetch_data = f"async fetchData() {{\n{fetch_replacement}\n  }},\n\n"
                js_content = js_content.replace(original_fetch_data, new_fetch_data)
            else:
                print("Warning: Could not find end of fetchData")
        else:
            print("Warning: Could not find start of fetchData")

            
        js_content = js_data_injection + js_content
        
        # Replace v3.js link in HTML without using regex replacement string
        js_link_pattern = re.compile(r'<script src="v3\.js[^"]*"></script>')
        match = js_link_pattern.search(html_content)
        if match:
            html_content = html_content[:match.start()] + f"<script>{js_content}</script>" + html_content[match.end():]
        else:
            print("Warning: Could not find <script src=\"v3.js...\"> in HTML")
        
    with open("prototype_v3.html", "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print("Created prototype_v3.html successfully!")

if __name__ == "__main__":
    main()

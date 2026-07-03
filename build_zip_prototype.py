import os
import shutil
import json
import zipfile

def main():
    print("Building prototype folder...")
    
    out_dir = "Proctor_Prototype"
    if os.path.exists(out_dir):
        shutil.rmtree(out_dir)
    os.makedirs(out_dir)
    
    # Files to copy directly
    files_to_copy = [
        "v3.html", "v3.css", "index.css", "candidate.css", 
        "learning_material.html"
    ]
    
    # Include all images
    images = [f for f in os.listdir('.') if os.path.isfile(f) and f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp'))]
    files_to_copy.extend(images)
    
    for f in files_to_copy:
        if os.path.exists(f):
            shutil.copy(f, os.path.join(out_dir, f))
            
    # Read and modify v3.js to inject Mock Data
    if os.path.exists("v3.js"):
        with open("v3.js", "r", encoding="utf-8") as f:
            js_content = f.read()
            
        data_map = {}
        for endpoint, file in [
            ('/api/candidates', 'candidates.json'),
            ('/api/sessions', 'sessions.json'),
            ('/api/modules', 'modules.json'),
            ('/api/earnings', 'earnings.json'),
            ('/api/reports', 'reports.json')
        ]:
            filepath = os.path.join('data', file)
            if os.path.exists(filepath):
                with open(filepath, 'r') as df:
                    try:
                        data_map[endpoint] = json.load(df)
                    except:
                        data_map[endpoint] = {}
            else:
                data_map[endpoint] = {}
                
        json_str = json.dumps(data_map, separators=(',', ':'))
        js_data_injection = f"const MOCK_API_DATA = {json_str};\n"
        
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
        
        start_idx = js_content.find("async fetchData() {")
        if start_idx != -1:
            end_idx = js_content.find("  switchView(viewId) {", start_idx)
            if end_idx != -1:
                original_fetch_data = js_content[start_idx:end_idx]
                new_fetch_data = f"async fetchData() {{\n{fetch_replacement}\n  }},\n\n"
                js_content = js_content.replace(original_fetch_data, new_fetch_data)
        
        js_content = js_data_injection + js_content
        
        with open(os.path.join(out_dir, "v3.js"), "w", encoding="utf-8") as f:
            f.write(js_content)
            
    # Zip the folder
    zip_filename = "Proctor_Prototype.zip"
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(out_dir):
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, out_dir)
                zipf.write(filepath, arcname)
                
    print(f"Successfully created {zip_filename}!")

if __name__ == "__main__":
    main()

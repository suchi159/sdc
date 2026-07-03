import os
import base64
import json
import re

def get_base64_image(filepath):
    if not os.path.exists(filepath):
        return filepath
    with open(filepath, "rb") as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')
    ext = os.path.splitext(filepath)[1][1:].lower()
    mime = f"image/{ext}" if ext != "jpg" else "image/jpeg"
    return f"data:{mime};base64,{encoded}"

def build_dashboard():
    """Mirror start.js handleDashboardStats so the standalone build has the same
    dashboard data the live server computes (KPIs, upcoming classes, incidents)."""
    def load(name):
        path = os.path.join('data', name)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return None

    sessions = load('sessions.json') or []
    candidates = load('candidates.json') or []
    incidents = load('incidents.json') or {}

    live = [s for s in sessions if s.get('status') == 'live']
    upcoming = sorted(
        [s for s in sessions if s.get('status') == 'upcoming'],
        key=lambda s: s.get('examDate', '')
    )
    pending_incidents = (
        [f for f in incidents.get('aiFlags', []) if f.get('status') == 'pending'] +
        [f for f in incidents.get('flaggedCases', []) if f.get('status') == 'open'] +
        [r for r in incidents.get('retakeRequests', []) if r.get('status') == 'pending']
    )
    total_vouchers = sum(s.get('vouchersAvailable', 0) for s in sessions)
    used_vouchers = sum(s.get('vouchersUsed', 0) for s in sessions)

    return {
        'activeLiveSessions': len(live),
        'upcomingExams7Days': len(upcoming),
        'pendingIncidentCount': len(pending_incidents),
        'voucherBalance': {'available': total_vouchers, 'used': used_vouchers},
        'liveSessions': [{
            'id': s.get('id'), 'name': s.get('name'),
            'candidateCount': s.get('candidateCount'),
        } for s in live],
        'upcomingSessions': [{
            'id': s.get('id'), 'name': s.get('name'), 'examDate': s.get('examDate'),
            'candidateCount': s.get('candidateCount'), 'status': s.get('status'),
        } for s in upcoming[:5]],
        'pendingIncidents': [{
            'id': i.get('id'),
            'candidateName': i.get('candidateName'),
            'type': i.get('alertType') or i.get('reason') or 'Manual Flag',
            'timestamp': i.get('timestamp') or i.get('flaggedAt') or i.get('requestedAt'),
        } for i in pending_incidents[:5]],
    }


def build_learning_material():
    print("Building standalone learning_material.html...")
    with open("learning_material.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    if os.path.exists("candidate.css"):
        with open("candidate.css", "r", encoding="utf-8") as f:
            css = f.read()
        html = re.sub(r'<link[^>]+href="candidate\.css[^"]*"[^>]*>', f"<style>{css}</style>", html)

    # Base64 images
    images = [f for f in os.listdir('.') if os.path.isfile(f) and f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp'))]
    for img in images:
        try:
            b64 = get_base64_image(img)
            html = html.replace(f'src="{img}"', f'src="{b64}"')
            html = html.replace(f'src="/{img}"', f'src="{b64}"')
            html = html.replace(f"'{img}'", f"'{b64}'")
        except:
            pass
            
    return html

def main():
    print("Building client prototype...")
    
    lm_html = build_learning_material()
    with open("client_prototype_learning_material.html", "w", encoding="utf-8") as f:
        f.write(lm_html)
        
    lm_b64 = base64.b64encode(lm_html.encode('utf-8')).decode('utf-8')
    lm_data_uri = f"data:text/html;base64,{lm_b64}"
    
    with open("v3.html", "r", encoding="utf-8") as f:
        html_content = f.read()
        
    # Inline CSS. The <link> tags use varied attribute order / self-closing
    # syntax (e.g. <link href="v3.css" rel="stylesheet"/>), so match the local
    # stylesheet by href with a regex rather than an exact string.
    for css in ["design_system.css", "index.css", "v3.css"]:
        if os.path.exists(css):
            with open(css, "r", encoding="utf-8") as f:
                css_content = f.read()
            pattern = re.compile(r'<link[^>]*href="' + re.escape(css) + r'"[^>]*/?>')
            if pattern.search(html_content):
                html_content = pattern.sub(lambda m: f"<style>{css_content}</style>", html_content, count=1)
            else:
                # Stylesheet linked but tag not found in expected form — leave a
                # marker so a broken build is obvious rather than silently external.
                print(f"  WARNING: could not find <link> for {css} to inline")
    
    # Replace images in HTML
    images = re.findall(r'<img[^>]+src="([^">]+)"', html_content)
    for img in set(images):
        if not img.startswith("http") and not img.startswith("data:"):
            local_file = img.lstrip('/')
            if os.path.exists(local_file):
                b64 = get_base64_image(local_file)
                html_content = html_content.replace(f'src="{img}"', f'src="{b64}"')

    # Read JS
    if os.path.exists("v3.js"):
        with open("v3.js", "r", encoding="utf-8") as f:
            js_content = f.read()
            
        # Replace learning_material.html with the data URI in JS
        js_content = js_content.replace('learning_material.html', lm_data_uri)
            
        # Mock Data
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

        # Synthesize /api/dashboard the same way start.js (handleDashboardStats)
        # does, so the standalone prototype shows real KPIs instead of zeros and
        # a "Failed to load data" toast.
        data_map['/api/dashboard'] = build_dashboard()

        json_str = json.dumps(data_map, separators=(',', ':'))
        
        # Images in JSON
        json_images = re.findall(r'"/?([a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|gif|svg))"', json_str)
        for img_name in set(json_images):
            if os.path.exists(img_name):
                b64 = get_base64_image(img_name)
                json_str = json_str.replace(f'"/{img_name}"', f'"{b64}"')
                json_str = json_str.replace(f'"{img_name}"', f'"{b64}"')
                
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
      const _lo = document.getElementById('loading-overlay');
      if (_lo) _lo.style.display = 'none';
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
        
        js_link_pattern = re.compile(r'<script src="v3\.js[^"]*"></script>')
        match = js_link_pattern.search(html_content)
        if match:
            html_content = html_content[:match.start()] + f"<script>{js_content}</script>" + html_content[match.end():]
        
    with open("classroom-proctor.html", "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print("Created classroom-proctor.html successfully!")

if __name__ == "__main__":
    main()

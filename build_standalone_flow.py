import os
import re
import json
import base64

DEST_DIR = "/Users/suchi/Desktop"

def get_base64(filepath):
    with open(filepath, "rb") as img_file:
        encoded = base64.b64encode(img_file.read()).decode('utf-8')
        ext = filepath.split('.')[-1].lower()
        mime = "image/jpeg" if ext in ["jpg", "jpeg"] else f"image/{ext}"
        if ext == "svg": mime = "image/svg+xml"
        return f"data:{mime};base64,{encoded}"

def inline_assets(html_content, base_dir):
    def replace_css(match):
        href = match.group(1)
        if not href.startswith('http'):
            css_path = os.path.join(base_dir, href)
            if os.path.exists(css_path):
                with open(css_path, 'r', encoding='utf-8') as f:
                    css_content = f.read()
                return f"<style>\n/* Inlined {href} */\n{css_content}\n</style>"
        return match.group(0)
    
    html_content = re.sub(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>', replace_css, html_content)
    
    def replace_js(match):
        src = match.group(1)
        if not src.startswith('http'):
            js_path = os.path.join(base_dir, src)
            if os.path.exists(js_path):
                with open(js_path, 'r', encoding='utf-8') as f:
                    js_content = f.read()
                return f"<script>\n/* Inlined {src} */\n{js_content}\n</script>"
        return match.group(0)
        
    html_content = re.sub(r'<script[^>]+src="([^"]+)"[^>]*>[\s\S]*?</script>', replace_js, html_content)
    
    images = []
    for root, dirs, files in os.walk(base_dir):
        if any(ignored in root for ignored in ['Offline_Ecosystem', 'Proctor_Prototype', '.git', 'node_modules']):
            continue
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp')):
                images.append(os.path.join(root, file))
                
    b64_map = {}
    for img in images:
        try:
            b64 = get_base64(img)
            b64_map[os.path.relpath(img, base_dir)] = b64
            b64_map[os.path.basename(img)] = b64
        except:
            pass
            
    for img_name, b64 in b64_map.items():
        html_content = html_content.replace(f'"{img_name}"', f'"{b64}"')
        html_content = html_content.replace(f"'{img_name}'", f"'{b64}'")
        
    return html_content

def build():
    print("Building standalone monolithic HTML flow...")
    
    data_map = {}
    if os.path.exists('data'):
        for f in os.listdir('data'):
            if f.endswith('.json'):
                key = f"/api/{f.replace('.json', '')}"
                with open(os.path.join('data', f), 'r', encoding='utf-8') as df:
                    try: data_map[key] = json.load(df)
                    except: pass
                        
    if '/api/dashboard' not in data_map: data_map['/api/dashboard'] = {"pendingIncidents": []}
    if '/api/reports' not in data_map: data_map['/api/reports'] = {}
    if '/api/settings' not in data_map: data_map['/api/settings'] = {}
        
    mock_db_json = json.dumps(data_map, separators=(',', ':'))
    
    mock_script = f"""
// Embedded Offline API
(function() {{
  const MOCK_DB = {mock_db_json};
  const origFetch = window.fetch;
  window.fetch = async function(url, options) {{
    let urlStr = (typeof url === 'string' ? url : url.url).split('?')[0];
    let key = urlStr;
    if (urlStr.includes('/api/')) {{ key = '/api/' + urlStr.split('/api/')[1]; }}
    else if (urlStr.includes('data/')) {{ key = '/api/' + urlStr.split('data/')[1].replace('.json', ''); }}
    
    let candMatch = key.match(/^\\/api\\/candidates\\/(.+)$/);
    if (candMatch) {{
      let cands = MOCK_DB['/api/candidates'] || [];
      let cand = cands.find(c => c.id == candMatch[1] || c.candidateId == candMatch[1]) || cands[0] || {{}};
      return new Response(JSON.stringify(cand), {{ status: 200, headers: {{'Content-Type': 'application/json'}} }});
    }}
    if (key.match(/^\\/api\\/vouchers\\/(.+)\\/(activate|redeem)$/)) {{
      return new Response(JSON.stringify({{success: true}}), {{ status: 200, headers: {{'Content-Type': 'application/json'}} }});
    }}
    if (key.match(/^\\/api\\/vouchers\\/web-purchase$/) || key.match(/^\\/api\\/bundles\\/purchase$/)) {{
      return new Response(JSON.stringify({{success: true, code: "MOCK-VOUCHER"}}), {{ status: 200, headers: {{'Content-Type': 'application/json'}} }});
    }}
    if (MOCK_DB[key]) {{
      return new Response(JSON.stringify(MOCK_DB[key]), {{ status: 200, headers: {{'Content-Type': 'application/json'}} }});
    }}
    if (key.startsWith('/api/')) {{
      return new Response(JSON.stringify({{}}), {{ status: 200, headers: {{'Content-Type': 'application/json'}} }});
    }}
    return origFetch(url, options);
  }};
}})();
"""
    
    files_to_build = {
        "central_hub.html": "central_hub_standalone.html",
        "admin_portal.html": "org_admin_standalone.html",
        "super_admin_3005.html": "super_admin_standalone.html",
        "secure_exam.html": "candidate_standalone.html",
        "classroom-proctor.html": "inclass_proctor_standalone.html"
    }

    for src_file, dest_file in files_to_build.items():
        if not os.path.exists(src_file):
            print(f"Skipping {src_file} - not found.")
            continue
            
        with open(src_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = inline_assets(content, '.')
        
        # Rewrite links to point to the standalone equivalents
        link_replacements = {
            'href="http://localhost:8888"': 'href="central_hub_standalone.html"',
            'href="central_hub.html"': 'href="central_hub_standalone.html"',
            'href="http://localhost:3009"': 'href="org_admin_standalone.html"',
            'href="admin_portal.html"': 'href="org_admin_standalone.html"',
            'href="http://localhost:3005"': 'href="super_admin_standalone.html"',
            'href="super_admin_3005.html"': 'href="super_admin_standalone.html"',
            'href="http://localhost:3001"': 'href="candidate_standalone.html"',
            'href="secure_exam.html"': 'href="candidate_standalone.html"',
            'href="candidate.html"': 'href="candidate_standalone.html"',
            'href="http://localhost:3002"': 'href="inclass_proctor_standalone.html"',
            'href="http://localhost:3007/v3"': 'href="inclass_proctor_standalone.html"',
            'href="classroom-proctor.html"': 'href="inclass_proctor_standalone.html"',
            'href="online_proctor.html"': 'href="inclass_proctor_standalone.html"',
            'href="v3.html"': 'href="inclass_proctor_standalone.html"',
            'window.location.href=\'super_admin_3005.html\'': 'window.location.href=\'super_admin_standalone.html\''
        }
        
        for old, new in link_replacements.items():
            content = content.replace(old, new)
            # also handle trailing slashes for absolute
            if 'localhost' in old:
                content = content.replace(old + '/"', new)
        
        # Inject Mock API script
        inject_str = f'<script>\n{mock_script}\n</script>'
        if '<head>' in content:
            content = content.replace('<head>', f'<head>\n    {inject_str}', 1)
        else:
            content = inject_str + "\n" + content
            
        dest_path = os.path.join(DEST_DIR, dest_file)
        with open(dest_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Created {dest_file} -> {dest_path} ({os.path.getsize(dest_path)} bytes)")

if __name__ == '__main__':
    build()

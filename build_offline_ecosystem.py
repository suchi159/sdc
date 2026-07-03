import os
import shutil
import json
import re
import zipfile

OUT_DIR = "Offline_Ecosystem"

def build():
    print("Building Offline Ecosystem...")
    if os.path.exists(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    os.makedirs(OUT_DIR)
    
    # 1. Build MOCK_DB from data folder
    data_map = {}
    if os.path.exists('data'):
        for f in os.listdir('data'):
            if f.endswith('.json'):
                key = f"/api/{f.replace('.json', '')}"
                filepath = os.path.join('data', f)
                with open(filepath, 'r', encoding='utf-8') as df:
                    try:
                        data_map[key] = json.load(df)
                    except:
                        data_map[key] = {}
                        
    # Additional hardcoded fallbacks if files are missing
    if '/api/dashboard' not in data_map:
        data_map['/api/dashboard'] = {"pendingIncidents": []}
    if '/api/reports' not in data_map:
        data_map['/api/reports'] = {}
    if '/api/settings' not in data_map:
        data_map['/api/settings'] = {}
        
    mock_db_json = json.dumps(data_map, separators=(',', ':'))
    
    mock_script = f"""
// Offline Mock API Injector
(function() {{
  const MOCK_DB = {mock_db_json};
  const origFetch = window.fetch;
  
  window.fetch = async function(url, options) {{
    let urlStr = (typeof url === 'string' ? url : url.url).split('?')[0];
    let key = urlStr;
    
    // Normalize path
    if (urlStr.includes('/api/')) {{
      key = '/api/' + urlStr.split('/api/')[1];
    }} else if (urlStr.includes('data/')) {{
      let base = urlStr.split('data/')[1].replace('.json', '');
      key = '/api/' + base;
    }}
    
    // Check dynamic endpoints
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
    
    // Exact match
    if (MOCK_DB[key]) {{
      return new Response(JSON.stringify(MOCK_DB[key]), {{ status: 200, headers: {{'Content-Type': 'application/json'}} }});
    }}
    
    // Default fallback for /api
    if (key.startsWith('/api/')) {{
      console.warn("Mocking missing API endpoint: " + key);
      return new Response(JSON.stringify({{}}), {{ status: 200, headers: {{'Content-Type': 'application/json'}} }});
    }}
    
    return origFetch(url, options);
  }};
  console.log("Offline Mock API initialized!");
}})();
"""
    
    with open(os.path.join(OUT_DIR, "offline_mock_api.js"), "w", encoding="utf-8") as f:
        f.write(mock_script)
        
    # 2. Copy and process all files
    extensions = ('.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp')
    
    # We only want to copy top-level files or specific subdirs, to avoid recursion or pulling in node_modules
    files_to_copy = []
    for root, dirs, files in os.walk('.'):
        if any(ignored in root for ignored in ['Offline_Ecosystem', 'Proctor_Prototype', '.git', 'node_modules', 'versions']):
            continue
        for file in files:
            if file.lower().endswith(extensions):
                files_to_copy.append(os.path.join(root, file))
                
    for filepath in files_to_copy:
        rel_path = os.path.relpath(filepath, '.')
        dest_path = os.path.join(OUT_DIR, rel_path)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        
        if dest_path.endswith('.html'):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Replace absolute localhost links to relative
            content = re.sub(r'http://localhost:\d+/(.*?\.html)', r'\1', content)
            content = content.replace('http://localhost:3009/', 'admin_portal.html')
            content = content.replace('http://localhost:3002/', 'online_proctor.html')
            content = content.replace('http://localhost:3001/', 'secure_exam.html')
            content = content.replace('http://localhost:3003/', 'candidate.html')
            content = content.replace('http://localhost:3005', 'super_admin_3005.html')
            content = content.replace('http://localhost:8888', 'central_hub.html')
            content = content.replace('http://localhost:3007/v3', 'v3.html')
            content = re.sub(r'http://localhost:\d+/?', 'central_hub.html', content)
            
            # Inject offline_mock_api.js into <head>
            # Determine path to root
            depth = rel_path.count(os.sep)
            prefix = "../" * depth if depth > 0 else ""
            mock_src = f'{prefix}offline_mock_api.js'
            
            inject_str = f'<script src="{mock_src}"></script>'
            if '<head>' in content:
                content = content.replace('<head>', f'<head>\n    {inject_str}', 1)
            else:
                content = inject_str + "\n" + content
                
            with open(dest_path, 'w', encoding='utf-8') as f:
                f.write(content)
        else:
            shutil.copy2(filepath, dest_path)
            
    # Zip it up
    zip_filename = "Offline_Ecosystem.zip"
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(OUT_DIR):
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, OUT_DIR)
                zipf.write(filepath, arcname)
                
    print(f"Successfully created {zip_filename}!")

if __name__ == '__main__':
    build()

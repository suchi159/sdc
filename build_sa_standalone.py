import os
import base64
import re

def get_base64(filepath):
    with open(filepath, "rb") as img_file:
        encoded = base64.b64encode(img_file.read()).decode('utf-8')
        ext = filepath.split('.')[-1].lower()
        mime = "image/jpeg" if ext in ["jpg", "jpeg"] else f"image/{ext}"
        if ext == "svg": mime = "image/svg+xml"
        return f"data:{mime};base64,{encoded}"

def inline_file(match):
    tag = match.group(0)
    
    # Inline CSS
    if '<link' in tag and 'rel="stylesheet"' in tag:
        href_match = re.search(r'href="([^"]+)"', tag)
        if href_match:
            href = href_match.group(1)
            # Only inline local CSS
            if not href.startswith('http'):
                if os.path.exists(href):
                    with open(href, 'r', encoding='utf-8') as f:
                        css_content = f.read()
                    return f"<style>\n/* Inlined from {href} */\n{css_content}\n</style>"
    
    # Inline JS
    if '<script' in tag and 'src=' in tag:
        src_match = re.search(r'src="([^"]+)"', tag)
        if src_match:
            src = src_match.group(1)
            # Only inline local JS
            if not src.startswith('http'):
                if os.path.exists(src):
                    with open(src, 'r', encoding='utf-8') as f:
                        js_content = f.read()
                    return f"<script>\n/* Inlined from {src} */\n{js_content}\n</script>"
                    
    return tag

def build():
    html_file = 'super_admin_3005.html'
    out_file = 'super_admin_standalone.html'
    
    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Replace links and scripts with inlined content
    html = re.sub(r'<link[^>]+rel="stylesheet"[^>]*>', inline_file, html)
    html = re.sub(r'<script[^>]+src="[^"]+"[^>]*>[\s\S]*?</script>', inline_file, html)
    
    # Base64 images
    images = [f for f in os.listdir('.') if os.path.isfile(f) and f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp'))]
    b64_map = {}
    for img in images:
        try:
            b64_map[img] = get_base64(img)
        except Exception as e:
            print(f"Error encoding {img}: {e}")
            
    for img, b64 in b64_map.items():
        html = html.replace(img, b64)
        
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(html)
        
    print(f"Successfully built {out_file}")

if __name__ == '__main__':
    build()

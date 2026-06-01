import os
import base64

def get_base64(filepath):
    with open(filepath, "rb") as img_file:
        encoded = base64.b64encode(img_file.read()).decode('utf-8')
        ext = filepath.split('.')[-1].lower()
        mime = "image/jpeg" if ext in ["jpg", "jpeg"] else f"image/{ext}"
        return f"data:{mime};base64,{encoded}"

def build_standalone(html_file, css_file, js_file, output_file):
    with open(html_file, "r") as f:
        html = f.read()
    with open(css_file, "r") as f:
        css = f.read()
    with open(js_file, "r") as f:
        js = f.read()

    # Find all images
    images = [f for f in os.listdir('.') if os.path.isfile(f) and f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp'))]
    
    b64_map = {}
    for img in images:
        try:
            b64_map[img] = get_base64(img)
        except:
            pass

    # Replace filenames with base64 data URIs
    for img, b64 in b64_map.items():
        css = css.replace(img, b64)
        js = js.replace(img, b64)
        html = html.replace(img, b64)

    # We know the specific link and script tags to replace
    css_target = f'<link rel="stylesheet" href="{css_file}'
    js_target = f'<script src="{js_file}'

    # Manual replacement for CSS
    start_css = html.find(css_target)
    if start_css != -1:
        end_css = html.find('>', start_css) + 1
        html = html[:start_css] + f"<style>\n{css}\n</style>" + html[end_css:]

    # Manual replacement for JS
    start_js = html.find(js_target)
    if start_js != -1:
        end_js = html.find('</script>', start_js) + 9
        html = html[:start_js] + f"<script>\n{js}\n</script>" + html[end_js:]

    with open(output_file, "w") as f:
        f.write(html)
    print(f"Built {output_file}")

build_standalone("candidate.html", "candidate.css", "candidate.js", "/Users/suchi/Desktop/Standalone_Student_Portal.html")
build_standalone("index.html", "index.css", "index.js", "/Users/suchi/Desktop/Standalone_Proctor_Dashboard.html")

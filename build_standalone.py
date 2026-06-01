import re

with open("candidate.html", "r") as f:
    html = f.read()

with open("candidate.css", "r") as f:
    css = f.read()

with open("candidate.js", "r") as f:
    js = f.read()

html = re.sub(r'<link rel="stylesheet" href="candidate\.css[^>]*>', f"<style>\n{css}\n</style>", html)

auto_start = """
<script>
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const auth = document.getElementById("cand-auth-view");
        const home = document.getElementById("cand-home");
        const learn = document.getElementById("cand-learn");
        const nav = document.getElementById("main-nav");
        const header = document.getElementById("main-header");
        
        if(auth) auth.classList.remove("active");
        if(home) home.classList.remove("active");
        if(learn) {
            learn.classList.add("active");
            learn.style.paddingTop = "24px";
            learn.style.paddingBottom = "24px";
        }
        
        if(nav) nav.style.display = "none";
        if(header) header.style.display = "none";
    }, 100);
});
</script>
"""

html = re.sub(r'<script src="candidate\.js[^>]*></script>', f"<script>\n{js}\n</script>\n{auto_start}", html)

with open("/Users/suchi/Desktop/Standalone_Learning_Module.html", "w") as f:
    f.write(html)

print("Standalone HTML updated!")

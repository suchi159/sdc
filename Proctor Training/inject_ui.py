import re
import os

# Paths
main_html_path = '/Users/suchi/Desktop/Data proctor/index.html'
main_js_path = '/Users/suchi/Desktop/Data proctor/index.js'
training_html_path = '/Users/suchi/Desktop/Proctor Training/index.html'
training_js_path = '/Users/suchi/Desktop/Proctor Training/training.js'

with open(main_html_path, 'r', encoding='utf-8') as f:
    main_html = f.read()

# Extract the shell from main_html
# We want from `<div id="main-view" class="view-panel active">` up to `<div class="view-container">`
# Actually main_view in index.html is `<div id="main-view" class="view-panel">` but it gets "active" class via JS. We can just hardcode active.
# Let's extract the header and sidebar parts using regex or string splitting.
start_str = '<!-- ==================== MAIN DASHBOARD LAYOUT ===================='
end_str = '<!-- ==================== VIEW PANELS CONTAINER ===================='

if start_str in main_html and end_str in main_html:
    shell_top = main_html[main_html.find(start_str):main_html.find(end_str) + len(end_str)]
else:
    print("Could not find shell boundaries in index.html")
    exit(1)

# Modify sidebar links to point back to port 3001
# Since we're in 3003, clicking a sidebar link should just take us to `http://localhost:3001/`
shell_top = re.sub(r'data-target="[a-zA-Z0-9-]*"', r'onclick="window.location.href=\'http://localhost:3001/\'"', shell_top)

# Get the learning layout from training_html
with open(training_html_path, 'r', encoding='utf-8') as f:
    training_html = f.read()

# The training HTML has its own `<head>` and `<style>`. Let's extract the `<style>` block.
style_match = re.search(r'<style>.*?</style>', training_html, re.DOTALL)
style_block = style_match.group(0) if style_match else ""

# Extract the body content of training_html, specifically the `.learning-layout` and `.certification-overlay`
learning_match = re.search(r'<div class="learning-layout">.*?</div>\s*<!-- Certification Overlay -->\s*<div class="certification-overlay".*?</div>', training_html, re.DOTALL)
learning_html = learning_match.group(0) if learning_match else ""

# Wait, learning_layout has height 100vh. If we put it in view-container, we should remove the 100vh and let it fill.
# Let's update the style block to make learning-layout fit the view-container
style_block = style_block.replace('height: 100vh;', 'height: 100%; border-radius: 12px; border: 1px solid var(--out-var);')

# Construct the new index.html for Proctor Training
new_training_html = f"""<!DOCTYPE html>
<html lang="en" data-t="light">
<head>
  <meta charset="UTF-8">
  <title>Proctor Learning & Certification Center</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined">
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <link rel="stylesheet" href="index.css">
  {style_block}
</head>
<body>
{shell_top.replace('class="view-panel"', 'class="view-panel active"')}
  <div class="view-container" style="padding: 24px; height: calc(100vh - 64px);">
    {learning_html}
  </div>
</main>
</div>
</div>
<script src="training.js"></script>
</body>
</html>
"""

with open(training_html_path, 'w', encoding='utf-8') as f:
    f.write(new_training_html)


# Now extract micro-interactions from index.js
with open(main_js_path, 'r', encoding='utf-8') as f:
    main_js = f.read()

def extract_function(func_name, code):
    # Very crude regex to extract a function block
    pattern = re.compile(r'function ' + func_name + r'\s*\([^)]*\)\s*\{.*?^\}', re.MULTILINE | re.DOTALL)
    match = pattern.search(code)
    if match:
        return match.group(0)
    return ""

pushToast_code = extract_function('pushToast', main_js)
toggleTheme_code = extract_function('toggleTheme', main_js)
initClock_code = extract_function('initClock', main_js)
clearAllNotifications_code = extract_function('clearAllNotifications', main_js)
toggleTelemetryDropdown_code = extract_function('toggleTelemetryDropdown', main_js)

# Also need the initialization logic for the theme and clock
init_logic = """
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("proctor_theme")) {
    const theme = localStorage.getItem("proctor_theme");
    document.documentElement.setAttribute("data-t", theme);
    const btnIcon = document.getElementById("theme-btn-icon");
    if (btnIcon) btnIcon.textContent = theme === "light" ? "dark_mode" : "light_mode";
  }
  
  const themeSwitchBtn = document.getElementById("theme-switcher-btn");
  if (themeSwitchBtn) {
    themeSwitchBtn.addEventListener("click", toggleTheme);
  }
  
  initClock();
});
"""

# Append these to training.js and replace alerts
with open(training_js_path, 'r', encoding='utf-8') as f:
    training_js = f.read()

# Replace alerts
training_js = training_js.replace("alert('Warning Sent!');", "pushToast('Warning Sent', 'You successfully issued a warning to the demo candidate.', 'warning');")
training_js = training_js.replace("alert('Snoozed alert');", "pushToast('Alert Snoozed', 'The simulated alert was temporarily snoozed.', 'info');")

# Append functions
training_js += "\n\n/* MICRO INTERACTIONS FROM MAIN APP */\n"
training_js += pushToast_code + "\n\n"
training_js += toggleTheme_code + "\n\n"
training_js += initClock_code + "\n\n"
training_js += init_logic + "\n"

# Add a function to override changeTelemetryState since it's hardcoded in the HTML
training_js += """
function changeTelemetryState(stateName) {
  document.getElementById("telemetry-badge-text").textContent = stateName;
  document.getElementById("telemetry-dropdown-menu").classList.add("hidden");
  pushToast("State Changed", `System shifted to ${stateName}`, "info");
}
function toggleTelemetryDropdown(event) {
  const dropdown = document.getElementById("telemetry-dropdown-menu");
  dropdown.classList.toggle("hidden");
}
"""

with open(training_js_path, 'w', encoding='utf-8') as f:
    f.write(training_js)

print("Successfully injected UI shell and micro interactions.")

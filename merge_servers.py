import re

# Read both files
with open('/Users/suchi/Desktop/Proctor Training/start.js', 'r') as f:
    pt_start = f.read()

with open('/Users/suchi/Desktop/Data proctor/start.js', 'r') as f:
    dp_start = f.read()

# Extract Data Helpers and Handlers from pt_start
match = re.search(r'(// ============================================================================\n// DATA HELPERS\n// ============================================================================.*?)(// ============================================================================\n// HTTP SERVER\n// ============================================================================)', pt_start, re.DOTALL)
if not match:
    print("Could not find DATA HELPERS in pt_start")
    exit(1)

data_helpers_and_handlers = match.group(1)

# Extract the API routing block from pt_start
api_match = re.search(r'(  // CORS preflight.*?  // ---- API ROUTES ----.*?    \}\n  \})', pt_start, re.DOTALL)
if not api_match:
    print("Could not find API ROUTES in pt_start")
    exit(1)

api_routing = api_match.group(1)

# Now inject these into dp_start
if "require('url')" not in dp_start:
    dp_start = dp_start.replace("const path = require('path');", "const path = require('path');\nconst url = require('url');")

if "const DATA_DIR" not in dp_start:
    dp_start = dp_start.replace("const BASE_DIR = __dirname;", "const BASE_DIR = __dirname;\nconst DATA_DIR = path.join(BASE_DIR, 'data');")

# Inject data_helpers_and_handlers right before requestHandler
dp_start = dp_start.replace("const requestHandler = (req, res) => {", data_helpers_and_handlers + "\nconst requestHandler = async (req, res) => {")

setup_code = """
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query = parsed.query;
"""

new_api_code = setup_code + "\n" + api_routing + "\n"

dp_start = dp_start.replace("let reqUrl = req.url;", new_api_code + "\n  let reqUrl = pathname;")

new_routing_code = """
  if (port === 3002) {
    defaultHtml = 'online_proctor.html';
  } else if (port === 3003 || port === 3004) {
    defaultHtml = 'candidate.html';
  } else if (port === 3005) {
"""

dp_start = dp_start.replace("""  if (port === 3002 || port === 3003 || port === 3004) {
    defaultHtml = 'candidate.html';
  } else if (port === 3005) {""", new_routing_code)

dp_start = re.sub(r'  // Clean query strings.*?  }', '', dp_start, flags=re.DOTALL)

with open('/Users/suchi/Desktop/Data proctor/start.js', 'w') as f:
    f.write(dp_start)

print("start.js merged successfully.")

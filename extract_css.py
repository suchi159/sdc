import json

found = False
with open('/Users/suchi/.gemini/antigravity-ide/brain/9f8f4dc9-d1ae-46f0-af87-a024bfa84091/.system_generated/logs/transcript.jsonl', 'r') as f:
    for line in f:
        data = json.loads(line)
        if 'super_admin_3005.css' in line:
            # check tool calls
            if 'tool_calls' in data:
                for tc in data['tool_calls']:
                    if tc['name'] == 'write_to_file' and 'super_admin_3005.css' in tc['args'].get('TargetFile', ''):
                        print("FOUND write_to_file!")
                        with open('super_admin_3005.css.bak', 'w') as out:
                            out.write(tc['args']['CodeContent'])
                        found = True
                        
if not found:
    print("Not found in write_to_file.")

import sys
import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_drawer_code = """  // Draw wireframe video replay capture loop inside drawer SVG
  const container = document.getElementById("drawer-recorded-canvas");
  
  if (DRAWER_CANVAS_LOOP) clearInterval(DRAWER_CANVAS_LOOP);

  let loopTimer = 0;
  const w = 340;
  const h = 200;
  const headX = w / 2;
  const headY = h / 2 - 10;
  
  let gazeLines = "";
  if (inc.rule.includes("Gaze")) {
    gazeLines = `
      <path d="M${headX-10},${headY-2} L${w-20},${headY-30} M${headX+10},${headY-2} L${w-20},${headY-30}" stroke="rgba(239, 68, 68, 0.4)" stroke-width="1" />
    `;
  }
  
  const svgStr = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="${w-20}" height="${h-20}" stroke="rgba(255,255,255,0.06)" stroke-width="1" fill="none" />
      
      <!-- Shoulders -->
      <path d="M${headX-50},${h} Q${headX-35},${headY+50} ${headX-20},${headY+30} L${headX+20},${headY+30} Q${headX+35},${headY+50} ${headX+50},${h}" stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none" />
      
      <!-- Head and Eyes Group -->
      <g id="drawer-head-group">
        <circle cx="${headX}" cy="${headY}" r="26" stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none" />
        <circle cx="${headX-10}" cy="${headY-2}" r="3" fill="rgba(255,255,255,0.8)" />
        <circle cx="${headX+10}" cy="${headY-2}" r="3" fill="rgba(255,255,255,0.8)" />
        <circle id="drawer-pupil-l" cx="${headX-10}" cy="${headY-2}" r="1.2" fill="#000" />
        <circle id="drawer-pupil-r" cx="${headX+10}" cy="${headY-2}" r="1.2" fill="#000" />
      </g>
      
      <!-- Gaze lines if applicable -->
      ${gazeLines}
      
      <!-- Bounding Box -->
      <rect id="drawer-bbox" x="${headX-42}" y="${headY-42}" width="84" height="84" stroke="var(--err)" stroke-width="1" fill="none" />
    </svg>
  `;
  container.innerHTML = svgStr;

  DRAWER_CANVAS_LOOP = setInterval(() => {
    loopTimer += 0.05;
    if (!document.getElementById("drawer-recorded-canvas")) {
      clearInterval(DRAWER_CANVAS_LOOP);
      return;
    }
    
    const headGroup = document.getElementById("drawer-head-group");
    const bbox = document.getElementById("drawer-bbox");
    const pl = document.getElementById("drawer-pupil-l");
    const pr = document.getElementById("drawer-pupil-r");
    
    if (headGroup && bbox) {
      const offsetX = Math.sin(loopTimer) * 14;
      headGroup.setAttribute('transform', `translate(${offsetX}, 0)`);
      bbox.setAttribute('x', headX - 42 + offsetX);
      
      if (inc.rule.includes("Gaze")) {
        pl.setAttribute('cx', headX - 10 + 2.5);
        pr.setAttribute('cx', headX + 10 + 2.5);
      }
    }
  }, 50);"""

# Replace the block from `const canvas = document.getElementById("drawer-recorded-canvas");`
# up to `  }, 50);`
pattern = re.compile(r'  // Draw wireframe video replay capture loop inside drawer canvas\n  const canvas = document\.getElementById\("drawer-recorded-canvas"\);.*?  \}, 50\);', re.DOTALL)

if pattern.search(content):
    new_content = pattern.sub(new_drawer_code, content)
    with open('index.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced drawer functions.")
else:
    print("Failed to find the drawer functions block.")

import sys
import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new replacement code
new_code = """function renderCameraGrid() {
  const gridContainer = document.getElementById("live-camera-grid");
  if (!gridContainer) return;

  gridContainer.innerHTML = "";

  const activeFeedsCount = Math.min(ACTIVE_GRID_SIZE, CANDIDATES.length);
  const activeFeedsEl = document.getElementById("val-active-feeds");
  if (activeFeedsEl) activeFeedsEl.textContent = activeFeedsCount;

  for (let i = 0; i < activeFeedsCount; i++) {
    const c = CANDIDATES[i];

    const card = document.createElement("div");
    card.className = `candidate-card ${c.status === 'danger' ? 'danger' : (c.status === 'warning' ? 'warning' : '')}`;
    card.id = `card-${c.id}`;
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      if (e.target.closest(".candidate-actions-overlay")) return;
      openSupervisorPanel(c.id);
    });

    card.innerHTML = `
      <div class="candidate-header-overlay">
        <span class="candidate-name-badge">${c.name}</span>
        <span class="candidate-status-tag ${c.status === 'danger' ? 'danger' : (c.status === 'warning' ? 'warning' : 'clear')}" id="status-tag-${c.id}">
          ${c.status === 'danger' ? 'critical' : (c.status === 'warning' ? 'warning' : 'clear')}
        </span>
      </div>
      <div id="svg-container-${c.id}" style="width: 100%; height: 100%; background: ${THEME === 'dark' ? '#141416' : '#2d2d35'}; position: relative; overflow: hidden;"></div>
      <div class="candidate-actions-overlay" style="display: flex; gap: 4px; justify-content: center; width: 100%; padding: 8px;">
        <button class="mdbtn btn-tonal action-btn" onclick="openSupervisorPanel('${c.id}')" style="min-height: 28px; font-size: 10px; padding: 2px 8px; flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 2px;" aria-label="Take custom action">
          <i class="material-icons" style="font-size: 14px;">explore</i> Act
        </button>
        <button class="mdbtn btn-outlined action-btn" onclick="quickSnoozeCandidate('${c.id}')" style="min-height: 28px; font-size: 10px; padding: 2px 8px; flex: 1; color: var(--pri); border-color: var(--pri); display: inline-flex; align-items: center; justify-content: center; gap: 2px;" aria-label="Snooze candidate warnings">
          <i class="material-icons" style="font-size: 14px;">schedule</i> Snooze
        </button>
        <button class="mdbtn btn-filled action-btn" onclick="quickResolveCandidate('${c.id}')" style="min-height: 28px; font-size: 10px; padding: 2px 8px; flex: 1; background: var(--suc); border-color: var(--suc); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 2px;" aria-label="Resolve candidate incident">
          <i class="material-icons" style="font-size: 14px;">check_circle</i> Solve
        </button>
      </div>
    `;

    gridContainer.appendChild(card);
    launchCandidateCanvasLoop(c);
  }

  updateIncidentCounter();
}

function launchCandidateCanvasLoop(c) {
  const container = document.getElementById(`svg-container-${c.id}`);
  if (!container) return;

  const w = 320;
  const h = 200;
  
  const boxColor = c.status === "danger" ? "var(--err)" : (c.status === "warning" ? "var(--wrn)" : "var(--suc)");
  const strokeColor = THEME === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)";
  const wireColor = "rgba(255,255,255,0.2)";

  const hX = w / 2;
  const hY = h / 2 - 12;

  let secondaryBody = "";
  if (c.id === "CAN-754" && c.status === "danger") {
    secondaryBody = `
      <circle cx="${hX - 48}" cy="${hY + 12}" r="24" stroke="rgba(239, 68, 68, 0.4)" stroke-width="1.5" fill="none" />
      <rect x="${hX - 48 - 28}" y="${hY + 12 - 28}" width="56" height="56" stroke="var(--err)" stroke-width="1.5" fill="none" />
      <text x="${hX - 48 - 28}" y="${hY + 12 - 32}" fill="var(--err)" style="font-family:'JetBrains Mono';font-size:9px;font-weight:bold;">UNREG. PROFILE</text>
    `;
  }
  
  let alertBanner = "";
  if (c.status !== "clear") {
    const ruleText = c.status === "danger" ? "CRITICAL: MULTIPLE PROFILES DETECTED" : "WARNING: GAZE DEVIATION LIMIT EXCEEDED";
    alertBanner = `
      <rect x="0" y="${h - 24}" width="${w}" height="24" fill="rgba(0,0,0,0.5)" />
      <text x="10" y="${h - 7}" fill="${boxColor}" style="font-family:'Inter';font-size:10px;font-weight:bold;">${ruleText}</text>
    `;
  }

  const boxW = 86;
  const boxH = 92;
  const boxX = hX - boxW / 2;
  const boxY = hY - boxH / 2 - 4;

  const svgStr = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,${h*0.3} L${w},${h*0.3} M${w*0.25},0 L${w*0.25},${h*0.3} M${w*0.75},0 L${w*0.75},${h*0.3}" stroke="${strokeColor}" stroke-width="1.5" />
      <path d="M${hX-60},${h} Q${hX-45},${hY+50} ${hX-25},${hY+32} L${hX+25},${hY+32} Q${hX+45},${hY+50} ${hX+60},${h} Z" stroke="${wireColor}" stroke-width="2" fill="none" />
      <path d="M${hX-12},${hY+20} L${hX-12},${hY+35} M${hX+12},${hY+20} L${hX+12},${hY+35}" stroke="${wireColor}" stroke-width="2" />
      <circle cx="${hX}" cy="${hY}" r="28" stroke="${wireColor}" stroke-width="2" fill="none" />
      
      <path d="M${hX-28},${hY} L${hX+28},${hY} M${hX},${hY-28} L${hX},${hY+28}" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
      <circle cx="${hX-10}" cy="${hY-2}" r="4" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx="${hX+10}" cy="${hY-2}" r="4" fill="rgba(255, 255, 255, 0.8)" />
      
      <circle id="pupil-l-${c.id}" cx="${hX-10}" cy="${hY-2}" r="1.8" fill="#000" />
      <circle id="pupil-r-${c.id}" cx="${hX+10}" cy="${hY-2}" r="1.8" fill="#000" />
      
      <path d="M${hX-6},${hY+12} Q${hX},${hY+16} ${hX+6},${hY+12}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="none" />
      
      ${secondaryBody}
      
      <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" stroke="${boxColor}" stroke-width="1.5" fill="none" />
      <text x="${boxX + 4}" y="${boxY + 14}" fill="${boxColor}" style="font-family:'JetBrains Mono';font-size:9px;font-weight:bold;">ID: ${c.id}</text>
      
      <g fill="${boxColor}">
        <circle cx="${hX-10}" cy="${hY-2}" r="1.5" />
        <circle cx="${hX+10}" cy="${hY-2}" r="1.5" />
        <circle cx="${hX}" cy="${hY+5}" r="1.5" />
        <circle cx="${hX-8}" cy="${hY+13}" r="1.5" />
        <circle cx="${hX+8}" cy="${hY+13}" r="1.5" />
        <circle cx="${hX-20}" cy="${hY-8}" r="1.5" />
        <circle cx="${hX+20}" cy="${hY-8}" r="1.5" />
        <circle cx="${hX}" cy="${hY+24}" r="1.5" />
      </g>
      
      ${alertBanner}
      
      <rect x="10" y="${h-35}" width="60" height="4" fill="rgba(255, 255, 255, 0.15)" />
      <rect id="audio-${c.id}" x="10" y="${h-35}" width="20" height="4" fill="var(--suc)" />
    </svg>
  `;

  container.innerHTML = svgStr;
  
  if (CANVAS_LOOPS[c.id]) {
    clearInterval(CANVAS_LOOPS[c.id]);
  }
  
  c.pulse = 0;
  
  CANVAS_LOOPS[c.id] = setInterval(() => {
    if (!document.getElementById(`svg-container-${c.id}`)) {
      clearInterval(CANVAS_LOOPS[c.id]);
      return;
    }
    
    c.pulse += 0.5;
    
    if (Math.random() > 0.95) {
      if (c.id === "CAN-183" && c.status === "warning") {
        c.eyes.x = 24; c.eyes.y = -2;
      } else {
        c.eyes.x = (Math.random() - 0.5) * 12;
        c.eyes.y = (Math.random() - 0.5) * 6;
      }
      
      const pl = document.getElementById(`pupil-l-${c.id}`);
      const pr = document.getElementById(`pupil-r-${c.id}`);
      if (pl && pr) {
        pl.setAttribute('cx', hX - 10 + (c.eyes.x * 0.15));
        pl.setAttribute('cy', hY - 2 + (c.eyes.y * 0.15));
        pr.setAttribute('cx', hX + 10 + (c.eyes.x * 0.15));
        pr.setAttribute('cy', hY - 2 + (c.eyes.y * 0.15));
      }
    }
    
    const audioBar = document.getElementById(`audio-${c.id}`);
    if (audioBar) {
      let aud = 20 + (Math.random() - 0.5) * 30;
      aud = Math.max(2, Math.min(60, aud));
      audioBar.setAttribute('width', aud);
      audioBar.setAttribute('fill', aud > 40 ? "var(--err)" : "var(--suc)");
    }
  }, 100);
}"""

# Use regex to find and replace the functions
pattern = re.compile(r'function renderCameraGrid\(\) \{.*?\n\}\n\nfunction launchCandidateCanvasLoop\(c\) \{.*?\n\}\n', re.DOTALL)
if pattern.search(content):
    new_content = pattern.sub(new_code + "\n", content)
    with open('index.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced functions.")
else:
    print("Failed to find the functions block.")

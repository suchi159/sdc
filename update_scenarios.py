import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Change const CANDIDATES to let CANDIDATES
content = re.sub(r'const CANDIDATES = \[', r'let CANDIDATES = [', content, count=1)

# Now, we want to append the SCENARIOS data and loadScenario function at the end of the file.
scenarios_code = """
// --------------------------------------------------------------------------
// DYNAMIC SCENARIO MANAGER
// --------------------------------------------------------------------------
const SCENARIOS = {
  cs_midterm: {
    candidates: [
      { id: "CAN-092", name: "Alex Rivera", exam: "CS101 Midterm", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 15, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" },
      { id: "CAN-183", name: "Beatrice Vance", exam: "CS101 Midterm", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 20, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" },
      { id: "CAN-754", name: "Clara Oswald", exam: "ECON202 Final", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 10, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" },
      { id: "CAN-442", name: "David Miller", exam: "MGT300 Midterm", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 12, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" },
      { id: "CAN-891", name: "Elena Rostova", exam: "CS101 Midterm", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 14, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" },
      { id: "CAN-302", name: "Frank Wright", exam: "ECON202 Final", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 8, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" }
    ],
    incidents: [
      { id: "INC-8812", name: "Clara Oswald", exam: "ECON202 Final", rule: "Multiple Persons Detected", time: "06:40:12", severity: "high", status: "Flagged", confidence: 96, notes: "AI identified secondary human skeletal profile in background. Action pending." },
      { id: "INC-8809", name: "Beatrice Vance", exam: "CS101 Midterm", rule: "Gaze Deviation (Excessive)", time: "06:38:45", severity: "medium", status: "In Review", confidence: 88, notes: "Candidate repeatedly looking away from primary screen boundary box for intervals > 8s." },
      { id: "INC-8794", name: "Frank Wright", exam: "ECON202 Final", rule: "Suspicious Voice Frequency", time: "06:21:30", severity: "medium", status: "Resolved", confidence: 74, notes: "Audio threshold limit exceeded. Confirmed as background traffic noise; dismissed by Sarah Jenkins." }
    ],
    shifts: [
      { date: "2026-05-19", type: "session", exam: "CS101 Midterm", start: "09:00", end: "12:00" },
      { date: "2026-05-19", type: "session", exam: "ECON202 Final", start: "14:00", end: "16:00" },
      { date: "2026-05-20", type: "available", exam: "", start: "10:00", end: "17:00" },
      { date: "2026-05-22", type: "blocked", exam: "", start: "08:00", end: "13:00" }
    ]
  },
  med_board: {
    candidates: [
      { id: "MED-001", name: "Dr. Aris Thorne", exam: "USMLE Step 1", status: "danger", warnings: 2, x: 0, y: 0, pulse: 0, audio: 45, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" },
      { id: "MED-002", name: "Dr. Bell Cranel", exam: "USMLE Step 1", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 12, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Suspended" },
      { id: "MED-003", name: "Chloe Price", exam: "Nursing Board", status: "warning", warnings: 1, x: 0, y: 0, pulse: 0, audio: 25, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" },
      { id: "MED-004", name: "Derek Hale", exam: "USMLE Step 2", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 15, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" }
    ],
    incidents: [
      { id: "INC-9901", name: "Dr. Aris Thorne", exam: "USMLE Step 1", rule: "Unauthorized Device (Mobile Phone)", time: "14:22:10", severity: "high", status: "Flagged", confidence: 99, notes: "Object recognized as smartphone entering frame." },
      { id: "INC-9902", name: "Chloe Price", exam: "Nursing Board", rule: "Secondary Voice Heard", time: "14:15:00", severity: "medium", status: "In Review", confidence: 85, notes: "Background whispering detected matching secondary vocal profile." }
    ],
    shifts: [
      { date: "2026-05-19", type: "session", exam: "USMLE Step 1", start: "08:00", end: "16:00" },
      { date: "2026-05-20", type: "session", exam: "Nursing Board", start: "09:00", end: "14:00" }
    ]
  },
  corp_comp: {
    candidates: [
      { id: "EMP-102", name: "John Smith", exam: "Anti-Bribery Training", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 10, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" },
      { id: "EMP-103", name: "Jane Doe", exam: "Data Privacy 2026", status: "clear", warnings: 0, x: 0, y: 0, pulse: 0, audio: 12, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" },
      { id: "EMP-104", name: "Bob Vance", exam: "Ethics Certification", status: "warning", warnings: 1, x: 0, y: 0, pulse: 0, audio: 18, eyes: { x: 0, y: 0 }, stateTimer: 0, actionStatus: "Monitored" }
    ],
    incidents: [
      { id: "INC-7701", name: "Bob Vance", exam: "Ethics Certification", rule: "Candidate Left Camera View", time: "09:12:00", severity: "medium", status: "Resolved", confidence: 95, notes: "Candidate stood up to stretch. Dismissed." }
    ],
    shifts: [
      { date: "2026-05-19", type: "session", exam: "Corporate Compliance", start: "09:00", end: "17:00" }
    ]
  }
};

function loadScenario(scenarioName) {
  const scenario = SCENARIOS[scenarioName];
  if (!scenario) return;

  // Clear existing animation loops
  Object.keys(CANVAS_LOOPS).forEach(key => clearInterval(CANVAS_LOOPS[key]));
  
  // Replace global data
  CANDIDATES = JSON.parse(JSON.stringify(scenario.candidates));
  INCIDENTS = JSON.parse(JSON.stringify(scenario.incidents));
  SHIFTS = JSON.parse(JSON.stringify(scenario.shifts));
  
  // Re-render all views
  initCanvasVideoSimulations();
  renderDashboardCharts();
  renderIncidentTable();
  renderCalendar();
  renderAgendaList();
  
  pushToast("Scenario Loaded", `Loaded data for ${scenarioName} use case.`, "success");
}
"""

with open('index.js', 'w', encoding='utf-8') as f:
    f.write(content + "\n" + scenarios_code)

print("Scenarios injected into index.js")

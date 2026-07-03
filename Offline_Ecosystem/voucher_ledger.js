// voucher_ledger.js

// Mock Data
const vouchers = [
  { id: 'v_8F3K9A', hash: '8F3K9A-2938-XCV', course: 'Food Safety L1', student: 'Alicia Keys', proctorId: 'VPC-102', status: 'Available', expiry: '2026-12-01T00:00:00Z', activeTest: false },
  { id: 'v_4H7M2B', hash: '4H7M2B-7821-WER', course: 'HACCP Advanced', student: 'John Legend', proctorId: 'VPC-105', status: 'Bound', expiry: '2026-11-15T00:00:00Z', activeTest: true },
  { id: 'v_1P9L5C', hash: '1P9L5C-5541-QAS', course: 'Food Safety L1', student: 'Unassigned', proctorId: 'VPC-110', status: 'Available', expiry: '2026-10-20T00:00:00Z', activeTest: false },
  { id: 'v_9T2N8D', hash: '9T2N8D-1192-ZXC', course: 'HACCP Advanced', student: 'Emma Stone', proctorId: 'VPC-102', status: 'Redeemed', expiry: '2026-05-18T00:00:00Z', activeTest: false },
  { id: 'v_3C6X1E', hash: '3C6X1E-9932-TYU', course: 'Food Safety L1', student: 'Tom Hanks', proctorId: 'VPC-108', status: 'Revoked', expiry: '2026-08-30T00:00:00Z', activeTest: false },
  { id: 'v_5V8R7F', hash: '5V8R7F-4481-IOP', course: 'HACCP Advanced', student: 'Zendaya', proctorId: 'VPC-105', status: 'Bound', expiry: '2026-11-25T00:00:00Z', activeTest: true },
  { id: 'v_7B4Q9G', hash: '7B4Q9G-6623-HJK', course: 'Food Safety L1', student: 'Unassigned', proctorId: 'Unassigned', status: 'Available', expiry: '2027-01-10T00:00:00Z', activeTest: false }
];

const proctorRequests = [
  { id: 1, proctor: 'VPC-102 (Sarah Jenkins)', amount: 50, reason: 'Upcoming large on-site class next week.' },
  { id: 2, proctor: 'VPC-105 (Michael Chang)', amount: 20, reason: 'Emergency stock for weekend online exams.' },
  { id: 3, proctor: 'VPC-110 (David Oyelowo)', amount: 100, reason: 'New regional franchise onboarding.' }
];

// DOM Elements
const tbody = document.getElementById('ledgerTableBody');
const searchInput = document.getElementById('globalSearch');
const courseFilter = document.getElementById('courseFilter');
const statusFilter = document.getElementById('statusFilter');
const actionPanel = document.getElementById('actionPanel');
const selectedCountEl = document.getElementById('selectedCount');
const selectAllCb = document.getElementById('selectAllCheckbox');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const revokeSelectedBtn = document.getElementById('revokeSelectedBtn');
const revokeModal = document.getElementById('revokeModal');
const cancelRevokeBtn = document.getElementById('cancelRevokeBtn');
const confirmRevokeBtn = document.getElementById('confirmRevokeBtn');
const revokeModalText = document.getElementById('revokeModalText');
const defensiveWarning = document.getElementById('defensiveWarning');
const activeExamsCountEl = document.getElementById('activeExamsCount');
const requestList = document.getElementById('requestList');
const themeToggleBtn = document.getElementById('themeToggleBtn');

let selectedIds = new Set();

// Format Date
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Render Table
function renderTable() {
  const query = searchInput.value.toLowerCase();
  const course = courseFilter.value;
  const status = statusFilter.value;

  const filtered = vouchers.filter(v => {
    const matchesSearch = v.hash.toLowerCase().includes(query) || 
                          v.student.toLowerCase().includes(query) || 
                          v.proctorId.toLowerCase().includes(query);
    const matchesCourse = course ? v.course === course : true;
    const matchesStatus = status ? v.status === status : true;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  tbody.innerHTML = '';
  filtered.forEach((v, index) => {
    const isSelected = selectedIds.has(v.id);
    const tr = document.createElement('tr');
    if (isSelected) tr.classList.add('selected');

    let statusClass = 'status-available';
    if (v.status === 'Bound') statusClass = 'status-bound';
    if (v.status === 'Redeemed') statusClass = 'status-redeemed';
    if (v.status === 'Revoked') statusClass = 'status-revoked';

    const statusLabels = { 'Available': 'Not Assigned', 'Bound': 'Assigned' };
    const statusLabel = statusLabels[v.status] || v.status;

    tr.style.animationDelay = `${index * 0.05}s`;
    tr.innerHTML = `
      <td><input type="checkbox" class="row-checkbox" data-id="${v.id}" ${isSelected ? 'checked' : ''}></td>
      <td class="hash-key">${v.hash}</td>
      <td><span class="badge badge-active">${v.course}</span></td>
      <td><a href="#">${v.student}</a></td>
      <td><a href="#">${v.proctorId}</a></td>
      <td><span class="status-indicator ${statusClass}">${statusLabel}</span></td>
      <td>${formatDate(v.expiry)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Attach checkbox listeners
  document.querySelectorAll('.row-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      if (e.target.checked) selectedIds.add(id);
      else selectedIds.delete(id);
      updateActionPanel();
      renderTable(); // re-render to highlight row
    });
  });

  // Sync select all
  selectAllCb.checked = filtered.length > 0 && Array.from(document.querySelectorAll('.row-checkbox')).every(cb => cb.checked);
}

// Render Requests
function renderRequests() {
  requestList.innerHTML = '';
  proctorRequests.forEach((r, index) => {
    const li = document.createElement('li');
    li.className = 'request-item';
    li.style.animation = `fadeInRow 0.4s ease forwards ${index * 0.1}s`;
    li.style.opacity = '0';
    li.innerHTML = `
      <h4>${r.proctor}</h4>
      <p>${r.reason}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="req-amount">${r.amount} Vouchers Requested</span>
        <button class="btn-primary btn-small" onclick="releaseVouchers(${r.id})">Release Codes</button>
      </div>
    `;
    requestList.appendChild(li);
  });
}

window.releaseVouchers = function(id) {
  alert(`Released vouchers for request ID: ${id}. The bulk storage has been updated.`);
  const idx = proctorRequests.findIndex(r => r.id === id);
  if (idx > -1) proctorRequests.splice(idx, 1);
  renderRequests();
}

// Action Panel Logic
function updateActionPanel() {
  if (selectedIds.size > 0) {
    actionPanel.classList.remove('hidden');
    selectedCountEl.textContent = selectedIds.size;
  } else {
    actionPanel.classList.add('hidden');
  }
}

// Event Listeners
searchInput.addEventListener('input', renderTable);
courseFilter.addEventListener('change', renderTable);
statusFilter.addEventListener('change', renderTable);

selectAllCb.addEventListener('change', (e) => {
  const checkboxes = document.querySelectorAll('.row-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = e.target.checked;
    const id = cb.getAttribute('data-id');
    if (e.target.checked) selectedIds.add(id);
    else selectedIds.delete(id);
  });
  updateActionPanel();
  renderTable();
});

clearSelectionBtn.addEventListener('click', () => {
  selectedIds.clear();
  updateActionPanel();
  renderTable();
});

// Revoke Logic (Defensive Architecture)
revokeSelectedBtn.addEventListener('click', () => {
  let activeExams = 0;
  selectedIds.forEach(id => {
    const v = vouchers.find(x => x.id === id);
    if (v && v.activeTest) activeExams++;
  });

  revokeModalText.textContent = `You are about to revoke ${selectedIds.size} vouchers. This action will wipe database strings and candidates will lose access.`;
  
  if (activeExams > 0) {
    defensiveWarning.classList.remove('hidden');
    activeExamsCountEl.textContent = activeExams;
  } else {
    defensiveWarning.classList.add('hidden');
  }

  revokeModal.classList.remove('hidden');
});

cancelRevokeBtn.addEventListener('click', () => {
  revokeModal.classList.add('hidden');
});

confirmRevokeBtn.addEventListener('click', () => {
  selectedIds.forEach(id => {
    const v = vouchers.find(x => x.id === id);
    if (v) {
      v.status = 'Revoked';
      v.activeTest = false;
    }
  });
  selectedIds.clear();
  updateActionPanel();
  revokeModal.classList.add('hidden');
  renderTable();
});

// Theme Toggle
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-t');
    html.setAttribute('data-t', currentTheme === 'dark' ? 'light' : 'dark');
  });
}

// Live Clock Logic for Topbar
function startLiveClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;
  
  function updateTime() {
    const now = new Date();
    // Format: DD/MM/YYYY, HH:MM:SS
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const time = now.toLocaleTimeString('en-GB'); // 24-hour format
    clockEl.textContent = `${day}/${month}/${year}, ${time}`;
  }
  
  updateTime();
  setInterval(updateTime, 1000);
}

// Init
renderTable();
renderRequests();
startLiveClock();

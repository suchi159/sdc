document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('globalThemeToggle');
    const profileBtn = document.getElementById('profileDropdownBtn');
    const profileMenu = document.getElementById('profileDropdown');
    
    // Theme Toggle — attribute-driven so CSS ([data-t="dark"]) owns every token.
    const htmlEl = document.documentElement;
    const applyTheme = (t) => {
      htmlEl.setAttribute('data-t', t);
      if (themeBtn) {
        themeBtn.innerHTML = t === 'dark'
          ? '<i class="material-icons">light_mode</i>'
          : '<i class="material-icons">dark_mode</i>';
      }
    };
    // Apply saved preference (or whatever the page already declared) on load.
    applyTheme(localStorage.getItem('sdc_theme') || htmlEl.getAttribute('data-t') || 'light');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-t') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('sdc_theme', next);
        applyTheme(next);
      });
    }

    // Profile Dropdown Toggle
    if (profileBtn && profileMenu) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('show');
      });
      document.addEventListener('click', (e) => {
        if (!profileMenu.contains(e.target)) {
          profileMenu.classList.remove('show');
        }
      });
    }
});

// Account switcher used by the profile dropdown across portals (demo):
// updates the topbar profile to the chosen account and closes the menu.
window.v3SwitchAccount = function (btn) {
  var trig = document.getElementById('profileDropdownBtn');
  if (trig) {
    var n = trig.querySelector('.name'), e = trig.querySelector('.email'), img = trig.querySelector('img');
    if (n) n.textContent = btn.dataset.name;
    if (e) e.textContent = btn.dataset.email;
    if (img && btn.dataset.avatar) img.src = btn.dataset.avatar;
  }
  var menu = document.getElementById('profileDropdown');
  if (menu) menu.classList.remove('show');
  var toast = window.pushToast || (window.app && window.app.showToast);
  if (toast) { try { toast('Switched to ' + btn.dataset.name, 'success'); } catch (_) {} }
};

// Shared logout for portals that load global_nav.js but don't define their own
// handleLogout (super admin, org admin, voucher ledger, v3 proctor). Returns the
// user to that portal's login screen with the demo credentials pre-filled so they
// can sign straight back in. Portals that DO define handleLogout (candidate,
// online proctor) keep their own — the guard below skips this definition there.
if (typeof window.handleLogout !== 'function') {
  window.handleLogout = function () {
    // Close the profile dropdown if it's open.
    var menu = document.getElementById('profileDropdown');
    if (menu) menu.classList.remove('show');

    var fill = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.value = val;
    };

    // 1) Super Admin portal — sa-login-overlay (password "admin" for demo).
    var saOverlay = document.getElementById('sa-login-overlay');
    if (saOverlay) {
      fill('sa-login-email', 's.jenkins@sdc.edu');
      fill('sa-login-pass', 'admin');
      var saErr = document.getElementById('sa-login-error');
      if (saErr) saErr.style.display = 'none';
      saOverlay.style.display = 'flex';
      saOverlay.style.opacity = '1';
      saOverlay.style.transform = 'none';
      window.scrollTo(0, 0);
      return;
    }

    // 2) Organization Admin portal — org-auth-overlay.
    var orgOverlay = document.getElementById('org-auth-overlay');
    if (orgOverlay) {
      fill('org-login-email', 's.jenkins@sdc.edu');
      fill('org-login-pass', 'admin123');
      orgOverlay.style.display = 'flex';
      window.scrollTo(0, 0);
      return;
    }

    // 3) v3 proctor portal — auth-overlay (hidden via .fade-out once signed in).
    var v3Overlay = document.getElementById('auth-overlay');
    if (v3Overlay) {
      fill('login-email', 'sarah.jenkins@secureproctor.ai');
      fill('login-password', 'password123');
      var loginView = document.getElementById('view-login');
      if (loginView) {
        document.querySelectorAll('#auth-overlay .view-step').forEach(function (el) {
          el.classList.remove('active');
        });
        loginView.classList.add('active');
      }
      v3Overlay.classList.remove('fade-out');
      window.scrollTo(0, 0);
      return;
    }

    // 4) Portals without their own login gate (e.g. voucher ledger) — send the
    //    user to the org admin login screen.
    window.location.href = 'admin_portal.html';
  };
}

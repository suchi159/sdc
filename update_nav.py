import os, glob, re

for f in glob.glob("**/*.html", recursive=True):
    if "versions/" in f: continue
    try:
        with open(f, "r") as file:
            content = file.read()
            
        modified = False
        
        # 1. Replace the profile-trigger button
        # Old:
        # <button class="profile-trigger" id="profileDropdownBtn">
        # <img src="..." alt="...">
        # <i class="material-icons">arrow_drop_down</i>
        # </button>
        
        pattern_trigger = r'<button class="profile-trigger" id="profileDropdownBtn">\s*<img[^>]*>\s*<i[^>]*>arrow_drop_down</i>\s*</button>'
        
        new_trigger = '''<button class="profile-trigger" id="profileDropdownBtn" style="display: flex; align-items: center; gap: 12px; background: transparent; border: none; cursor: pointer; text-align: left; padding: 4px; border-radius: 8px;">
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" alt="Profile" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
          <div style="display: flex; flex-direction: column;">
            <span class="name" style="font-size: 14px; font-weight: 600; color: var(--on-sur, var(--text-primary));">Dr. Sarah Jenkins</span>
            <span class="email" style="font-size: 11px; color: var(--on-sur-var, var(--text-secondary));">s.jenkins@sdc.edu</span>
          </div>
          <i class="material-icons" style="color: var(--on-sur-var, var(--text-secondary));">arrow_drop_down</i>
        </button>'''
        
        if re.search(pattern_trigger, content):
            content = re.sub(pattern_trigger, new_trigger, content)
            modified = True
            
        # 2. Replace the dropdown-menu
        pattern_menu = r'<div class="dropdown-menu" id="profileDropdown">.*?</div>\s*</div>\s*</div>\s*</header>'
        
        new_menu = '''<div class="dropdown-menu" id="profileDropdown">
          <button class="dropdown-item">
            <i class="material-icons">switch_account</i>
            Switch Account
          </button>
          <button class="dropdown-item">
            <i class="material-icons">person_add</i>
            Add New Account
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" style="color: #ef4444;" onclick="handleLogout()">
            <i class="material-icons">logout</i>
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>'''
        
        if re.search(pattern_menu, content, flags=re.DOTALL):
            content = re.sub(pattern_menu, new_menu, content, flags=re.DOTALL)
            modified = True
            
        # 3. Remove logout from bottom side nav
        pattern_logout_btn = r'<!-- Logout ghost button at bottom of nav -->\s*<button[^>]*class="nav-logout-btn"[^>]*>.*?</button>'
        pattern_logout_btn_2 = r'<button[^>]*class="nav-logout-btn"[^>]*>.*?</button>'
        
        if re.search(pattern_logout_btn, content, flags=re.DOTALL):
            content = re.sub(pattern_logout_btn, "", content, flags=re.DOTALL)
            modified = True
        elif re.search(pattern_logout_btn_2, content, flags=re.DOTALL):
            content = re.sub(pattern_logout_btn_2, "", content, flags=re.DOTALL)
            modified = True
            
        if modified:
            with open(f, "w") as file:
                file.write(content)
            print(f"Updated {f}")
    except Exception as e:
        print(f"Error on {f}: {e}")

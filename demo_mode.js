/* ============================================================================
   SDC DEMO MODE — global LIVE / DAY ZERO switch (shared across all portals)
   ----------------------------------------------------------------------------
   The Central Hub passes ?mode=dayzero on its portal links. Each portal loads
   this file early; it reads & persists the mode (per-origin) and, in DAY ZERO,
   renders the empty / first-run state NON-DESTRUCTIVELY:
     • localStorage data reads return [] (the real saved data is left intact)
     • /api/* and /data/*.json GETs return [] (auth calls pass through)
   "Exit to Live" restores the populated portals. Default everywhere is LIVE.
   ============================================================================ */
(function () {
  // localStorage data keys used by the portals (super admin, org admin, etc.)
  var DATA_KEYS = [
    'sdc_organizations', 'sdc_vreq_v3', 'sdc_oreq_v3', 'sdc_online_service_requests',
    'sdc_wp_v3', 'sdc_ownership_transfers', 'sdc_discount_codes', 'sdc_org_invoices'
  ];

  var mode;
  try {
    var q = new URLSearchParams(location.search).get('mode');
    if (q === 'dayzero' || q === 'live') localStorage.setItem('sdc_demo_mode', q);
    mode = localStorage.getItem('sdc_demo_mode') || 'live';
  } catch (e) { mode = 'live'; }
  window.SDC_DEMO_MODE = mode;
  if (mode !== 'dayzero') return;

  // 1) Data-key reads return empty arrays, and data-key writes are ignored, so
  //    Day Zero is fully non-destructive — the real populated (Live) data is kept.
  try {
    var _get = Storage.prototype.getItem;
    Storage.prototype.getItem = function (k) {
      if (DATA_KEYS.indexOf(k) !== -1) return '[]';
      return _get.call(this, k);
    };
    var _set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (DATA_KEYS.indexOf(k) !== -1) return;
      return _set.call(this, k, v);
    };
  } catch (e) {}

  // 2) Intercept ALL data calls so API-driven portals show a first-run state
  //    AND never persist their (empty) state back to the server in Day Zero:
  //      • GET  -> empty list  []
  //      • POST/PUT/PATCH/DELETE -> fake success, NOT forwarded (no file writes)
  //    Auth calls (/api/auth/*) pass straight through so login still works.
  if (window.fetch) {
    var _fetch = window.fetch;
    window.fetch = function (input, init) {
      var url = (typeof input === 'string') ? input : (input && input.url) || '';
      var isData = (/\/api\//.test(url) && !/\/api\/auth\//.test(url)) || /\/data\/[^?]*\.json/.test(url);
      if (isData) {
        var method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
        var body = (method === 'GET') ? '[]' : '{"success":true,"dayZero":true}';
        return Promise.resolve(new Response(body, {
          status: 200, headers: { 'Content-Type': 'application/json' }
        }));
      }
      return _fetch.apply(this, arguments);
    };
  }

  // 3) Persistent "DAY ZERO" banner with an Exit-to-Live control.
  function addBanner() {
    if (document.getElementById('sdc-dayzero-banner')) return;
    var bar = document.createElement('div');
    bar.id = 'sdc-dayzero-banner';
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#1c1b1f;color:#ffedaa;' +
      'font:600 13px/1 Inter,system-ui,-apple-system,sans-serif;padding:9px 16px;display:flex;align-items:center;' +
      'justify-content:center;gap:14px;box-shadow:0 2px 10px rgba(0,0,0,.25);';
    bar.innerHTML =
      '<span style="display:inline-flex;align-items:center;gap:7px;">' +
        '<span style="width:8px;height:8px;border-radius:50%;background:#f9ad00;display:inline-block;"></span>' +
        'DAY&nbsp;ZERO MODE — fresh first-run state, no demo data</span>' +
      '<button id="sdc-exit-dayzero" style="background:#f9ad00;color:#000;border:none;border-radius:9999px;' +
        'padding:5px 14px;font:700 12px Inter,system-ui;cursor:pointer;">Exit to Live</button>';
    document.body.appendChild(bar);
    var pad = parseInt(getComputedStyle(document.body).paddingTop) || 0;
    document.body.style.paddingTop = (pad + 36) + 'px';
    document.getElementById('sdc-exit-dayzero').onclick = function () {
      try { localStorage.setItem('sdc_demo_mode', 'live'); } catch (e) {}
      location.href = location.origin + location.pathname;
    };
  }
  if (document.body) addBanner();
  else document.addEventListener('DOMContentLoaded', addBanner);
})();

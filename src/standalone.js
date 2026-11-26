/* ---------- the installed app ----------
   Everything here runs only in the standalone build (STANDALONE is true): the log lives on the phone,
   backups are files, the Android back button closes what is open, and a service worker keeps it working offline. */
const inApp = () => {
  try { return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: minimal-ui)').matches || navigator.standalone === true; }
  catch (e) { return false; }
};
let storageFail = false;
function storageTrouble() {
  if (storageFail) return;
  storageFail = true;
  setTimeout(() => { toast('Plates could not save on this phone. Storage may be full or blocked.'); render(); }, 0);
}

/* A short vibration confirms a logged set without looking; a longer one says rest is over. */
function buzz(pattern) {
  if (!STANDALONE || !S.meta || S.meta.settings.haptic === false) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* not allowed here */ }
}

/* ----- backups ----- */
function backupInfo() {
  const b = ls.get('local:backup'), at = (b && b.at) || 0;
  let since = 0, oldest = Infinity;
  S.sessions.forEach(s => { if (s.ts > at) { since++; if (s.ts < oldest) oldest = s.ts; } });
  const days = since ? (Date.now() - oldest) / 864e5 : 0;
  return { at, since, due: since >= 3 || (since >= 1 && days >= 7) };
}
function fmtAgo(ms) {
  const d = Math.round(daysApart(todayStr(), todayStr(new Date(ms))));
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 14 ? d + ' days ago' : 'on ' + fmtDate(todayStr(new Date(ms)));
}
function backupLine(b) {
  return b.at ? 'Last backup ' + fmtAgo(b.at) + (b.since ? ', ' + plural(b.since, 'workout') + ' since.' : '.') : 'No backup yet.';
}
function backupText() {
  return JSON.stringify({
    app: 'plates', v: 1, exported: new Date().toISOString(), build: BUILD, meta: S.meta, programs: S.programs,
    sessions: S.sessions.map(s => { const d = Object.assign({ id: s.id }, encSession(s)); if (!s.bad) d.chk = sessionChk(s.entries); return d; }),
    active: S.active || null
  });
}
function backupName(ext) { return 'plates-backup-' + todayStr() + '.' + ext; }
function markBackedUp() { ls.set('local:backup', { at: Date.now(), n: S.sessions.length }); render(); renderSheet(true); }
function saveBlob(filename, text) {
  try {
    const type = /\.csv$/.test(filename) ? 'text/csv' : /\.txt$/.test(filename) ? 'text/plain' : 'application/json';
    const url = URL.createObjectURL(new Blob([text], { type })), a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast('Saved ' + filename + ' to your downloads');
    return true;
  } catch (e) { toast('That file could not be saved'); return false; }
}
/* Android only shares a few file types, and plain text is one of them, so a shared backup is the same content in a .txt file. */
function shareFile() {
  try {
    const f = new File([backupText()], backupName('txt'), { type: 'text/plain' });
    return navigator.share && navigator.canShare && navigator.canShare({ files: [f] }) ? f : null;
  } catch (e) { return null; }
}
let pendingRestore = null;
const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
function okProgram(p) {
  return isObj(p) && Array.isArray(p.days) && p.days.length > 0 &&
    p.days.every(d => isObj(d) && typeof d.id === 'string' && typeof d.name === 'string' && Array.isArray(d.items) && d.items.every(it => isObj(it) && typeof it.ex === 'string')) &&
    (p.wave == null || (Array.isArray(p.wave) && p.wave.every(r => isObj(r) && Array.isArray(r.top) && Array.isArray(r.back))));
}
function parseBackup(text) {
  try { return parseBackupNow(text); } catch (e) { return { err: 'That file is not a Plates backup.' }; }
}
function parseBackupNow(text) {
  const no = { err: 'That file is not a Plates backup.' };
  let o;
  try { o = JSON.parse(text); } catch (e) { return no; }
  if (!isObj(o) || !isObj(o.meta) || !Array.isArray(o.sessions)) return no;
  const sessions = [], seen = new Set();
  let bad = 0;
  o.sessions.forEach(d => {
    if (!isObj(d) || typeof d.id !== 'string' || !d.id || seen.has(d.id)) return;
    if (Array.isArray(d.entries) && !d.entries.every(isObj)) return;
    seen.add(d.id);
    const s = decSession(d.id, d);
    if (!s.date) return;
    if (s.bad) bad++;
    sessions.push(s);
  });
  const programs = {};
  if (isObj(o.programs)) Object.keys(o.programs).forEach(id => {
    const p = o.programs[id];
    if (okProgram(p)) { programs[id] = clone(p); programs[id].id = id; }
  });
  const meta = normMeta(clone(o.meta));
  Object.keys(meta.maxes).forEach(k => { const v = Number(meta.maxes[k]); if (Number.isFinite(v) && v > 0) meta.maxes[k] = v; else delete meta.maxes[k]; });
  { const b = Number(meta.bodyweight); meta.bodyweight = Number.isFinite(b) && b > 0 ? b : null; }
  if (!isObj(meta.custom)) meta.custom = {};
  if (!isObj(meta.notes)) meta.notes = {};
  ['wave', 'week', 'day'].forEach(k => { const v = Number(meta.pos[k]); meta.pos[k] = Number.isFinite(v) && v >= (k === 'day' ? 0 : 1) ? Math.floor(v) : (k === 'day' ? 0 : 1); });
  if (!programs[meta.programId] && !TEMPLATES[meta.programId]) meta.programId = 'ppl-ptc';
  const active = isObj(o.active) && Array.isArray(o.active.entries) && o.active.entries.every(e => isObj(e) && Array.isArray(e.sets)) && o.active.id ? clone(o.active) : null;
  return { meta, programs, sessions, active, bad, exported: typeof o.exported === 'string' ? o.exported : '' };
}
function applyRestore() {
  const r = pendingRestore;
  pendingRestore = null;
  if (!r) return;
  S.meta = r.meta; S.programs = r.programs; S.sessions = r.sessions; S.active = r.active; S.edit = null; S.crash = '';
  sortSessions();
  S.first = false; S.loaded = true;
  S.ui.logger = false; S.ui.mode = 'live'; S.ui.sheets = []; S.ui.tab = 'today';
  const ok = ['meta', 'active', 'programs', 'sessions'].map(cacheWrite).every(Boolean);
  ls.set('local:backup', { at: Date.now(), n: S.sessions.length });
  stopTimer();
  renderSheet(); render();
  if (ok) toast('Restored ' + plural(S.sessions.length, 'workout') + (r.bad ? '. ' + r.bad + ' did not pass the check, so look ' + (r.bad === 1 ? 'it' : 'them') + ' over in History.' : ''));
  syncHistory();
}

/* ----- rescue screen ----- */
function crashed(e) {
  const msg = String((e && e.message) || e || 'unknown error').slice(0, 200);
  if (S.crash) return;   // the rescue screen itself is plain text and buttons
  S.crash = msg;
  ls.set('ui', { logger: false });
  try { renderNow(); } catch (e2) { const m = $('#main'); if (m) m.textContent = 'Plates could not start. Your log is still stored on this phone.'; }
}
function viewCrash() {
  return '<section class="hero"><div class="hero-top"><span class="wordmark">Plates</span></div><h1 class="hero-day" style="font-size:64px;line-height:.9">A screen failed to open</h1>' +
    '<p class="hero-note">Your log is still stored on this phone. Reload first. If this comes back, save the raw data file and send it to Claude so it can be repaired.</p></section>' +
    '<section class="block stack"><button class="btn btn-pri btn-block" data-a="reloadApp">Reload</button><button class="btn btn-block" data-a="rawSave">Save the raw data file</button>' +
    '<button class="btn btn-block" data-a="restorePick">Restore from a backup</button><button class="btn btn-block btn-danger" data-a="eraseAsk">Erase the log on this phone</button>' +
    '<p class="tiny muted">Build ' + esc(BUILD) + (BUILD_ID ? ' (' + BUILD_ID + ')' : '') + '. ' + esc(S.crash) + '</p></section>';
}
function rawDump() {
  const out = { app: 'plates-raw', exported: new Date().toISOString(), build: BUILD, keys: {} };
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(LSP) === 0) out.keys[k] = localStorage.getItem(k); } } catch (e) { out.error = String(e); }
  return JSON.stringify(out);
}

/* ----- installing and updating ----- */
let installEvt = null, swReg = null, updateReady = false, updating = false;
function installCard() {
  if (!STANDALONE || inApp() || ls.get('hideInstall')) return '';
  if (ls.get('installed') && !installEvt) {
    return '<div class="card callout"><div class="grow"><strong>Plates is installed</strong><div class="small muted">Open it from your home screen for the full-screen app.</div></div><button class="btn btn-sm btn-quiet" data-a="hideInstall">Hide</button></div>';
  }
  return '<div class="card callout"><div class="grow"><strong>Install Plates</strong><div class="small muted">Adds it to your home screen. It opens full screen and works with no signal.</div></div><button class="btn btn-pri btn-sm" data-a="install">Install</button></div>';
}
function updateCard() {
  if (!updateReady) return '';
  return '<div class="card callout"><div class="grow"><strong>Update ready</strong><div class="small muted">A newer version of Plates is downloaded.</div></div><button class="btn btn-pri btn-sm" data-a="updateNow">Update</button></div>';
}
window.addEventListener('beforeinstallprompt', ev => {
  if (!STANDALONE) return;
  ev.preventDefault();
  installEvt = ev;
  ls.del('installed');   // the browser only offers this when the app is not installed
  if (S.loaded) render();
});
window.addEventListener('appinstalled', () => {
  if (!STANDALONE) return;
  installEvt = null;
  ls.set('installed', 1);
  render();
  toast('Installed. Open Plates from your home screen.');
});
function watchWorker(w) {
  if (!w) return;
  w.addEventListener('statechange', () => {
    if (w.state === 'installed' && navigator.serviceWorker.controller) { updateReady = true; if (!isTyping()) render(); }
  });
}
let lastUpdateCheck = 0;
function initStandalone() {
  try { document.documentElement.classList.add('app'); } catch (e) { /* cosmetic */ }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      swReg = reg;
      if (reg.waiting && navigator.serviceWorker.controller) { updateReady = true; render(); }
      watchWorker(reg.installing);
      reg.addEventListener('updatefound', () => watchWorker(reg.installing));
    }).catch(() => { /* still works online without it */ });
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (updating) location.reload(); });
  }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* optional */ }
  const main = $('#main');
  if (main) main.addEventListener('scroll', paintTheme, { passive: true });
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintTheme); } catch (e) { /* older browsers */ }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !swReg || Date.now() - lastUpdateCheck < 30 * 60000) return;
    lastUpdateCheck = Date.now();
    try { swReg.update().catch(() => {}); } catch (e) { /* offline */ }
  });
  window.addEventListener('storage', ev => {
    // The same log open in a second window: pick up what it saved, unless something is being worked on here.
    if (!ev.key || ev.key.indexOf(LSP + 'local:') !== 0 || S.ui.logger || S.ui.sheets.length || isTyping()) return;
    if (cacheRead('local')) { S.first = false; render(); }
  });
}
function bootStandalone() {
  S.uid = 'local';
  try { localStorage.setItem(LSP + 'probe', '1'); localStorage.removeItem(LSP + 'probe'); } catch (e) { storageFail = true; }
  try { if (!cacheRead('local')) S.first = true; }
  catch (e) { S.meta = null; S.programs = {}; S.sessions = []; S.active = null; S.crash = 'stored log could not be read: ' + String((e && e.message) || e).slice(0, 160); }
  S.loaded = true; S.stuck = false; cloud.tried = true; S.status = 'local';
  const h = (location.hash || '').slice(1);
  if (['today', 'program', 'history', 'progress'].includes(h)) S.ui.tab = h;
  const ui = ls.get('ui');
  if (ui && ui.logger && S.active) { S.ui.logger = true; S.ui.mode = 'live'; keepAwake(true); }
  uiSaved = !!(ui && ui.logger);
  const t = ls.get('timer');
  if (t && t.endsAt > Date.now()) S.timer = t;
  histDepth = (history.state && history.state.d) || 0;
  histBase = Math.max(0, uiDepth() - histDepth);
  render();
  setInterval(tick, 250);
  initStandalone();
  syncHistory();
}
/* Reopening the app mid-workout goes straight back to the workout. */
let uiSaved = false;
function rememberUi() {
  const on = !!(S.ui.logger && S.ui.mode !== 'edit' && S.active);
  if (on !== uiSaved) { uiSaved = on; ls.set('ui', { logger: on }); }
}

/* ----- status bar colour follows whatever is at the top of the screen ----- */
let themeRaf = 0;
function paintTheme() {
  if (!STANDALONE || themeRaf) return;
  themeRaf = requestAnimationFrame(() => {
    themeRaf = 0;
    const meta = $('#theme');
    if (!meta || S.ui.sheets.length) return;
    let el = document.elementFromPoint(Math.floor(innerWidth / 2), 1) || document.body, c = '';
    while (el) {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(bg)) { c = bg; break; }
      el = el.parentElement;
    }
    if (c && meta.getAttribute('content') !== c) meta.setAttribute('content', c);
  });
}

/* ----- the Android back button -----
   Each open layer (a tab other than Today, the workout screen, each sheet) is one step of browser history, so Back closes
   the top one and, from Today with nothing open, leaves the app. A step is only added during a tap, and one per tap:
   Chrome skips history entries a page adds on its own. Layers that have no step yet are counted in histBase. */
let histDepth = 0, histBase = 0, histBusy = false;
function uiDepth() {
  if (!S.loaded || !S.meta) return S.ui.sheets.length;
  return (S.ui.tab !== 'today' ? 1 : 0) + (S.ui.logger && curWorkout() ? 1 : 0) + S.ui.sheets.length;
}
function popLayer() {
  if (S.ui.sheets.length) { S.ui.sheets.pop(); return false; }
  if (S.ui.logger && curWorkout()) {
    if (S.ui.mode === 'edit') { S.edit = null; S.ui.mode = 'live'; }
    S.ui.logger = false; keepAwake(false);
    return true;
  }
  S.ui.tab = 'today';
  return true;
}
function histWant() {
  let want = uiDepth() - histBase;
  if (want < 0) { histBase += want; want = 0; }
  return want;
}
function histPush() {
  try { history.pushState({ d: histDepth + 1 }, ''); histDepth++; return true; } catch (e) { return false; }
}
let histTries = 0;
function syncHistory() {
  if (!STANDALONE || histBusy) return;
  histDepth = (history.state && history.state.d) || 0;   // where this window really is, so going back can never overshoot
  let want = histWant();
  const tapped = !navigator.userActivation || navigator.userActivation.isActive;
  if (want > histDepth) {
    if (!tapped) return;
    histBase += want - histDepth - 1;
    if (!histPush()) histBase++;
  } else if (want < histDepth) {
    if (histTries >= 2) return;   // history is not responding: leave the extra steps, Back will use them up
    const n = histDepth - want;
    histBusy = true; histTries++;
    try { history.go(-n); } catch (e) { histBusy = false; }
    setTimeout(() => { if (histBusy) { histBusy = false; syncHistory(); } }, 700);
  } else if (histBase > 0 && tapped) {
    if (histPush()) histBase--;
  }
}
window.addEventListener('popstate', ev => {
  if (!STANDALONE) return;
  if (histBusy) { histBusy = false; histTries = 0; syncHistory(); return; }
  histDepth = (ev.state && ev.state.d) || 0;
  histTries = 0;
  let want = histWant(), full = false;
  if (want > histDepth) {
    while (want > histDepth && uiDepth() > 0) { if (popLayer()) full = true; want = histWant(); }
    renderSheet(true);
    if (full) render(); else paintTheme();
  } else if (want < histDepth) syncHistory();
});

/* ----- actions ----- */
Object.assign(A, {
  dataSheet() {
    openSheet(() => {
      const b = backupInfo(), n = S.sessions.length, share = !!shareFile();
      let body = '<p>Your log is saved on this phone, inside Plates. Nothing is sent anywhere unless you back it up or copy it.</p>';
      if (storageFail) body += '<p class="notice">This browser is not letting Plates save, so changes will be lost when it closes. Check that site data is allowed for this page.</p>';
      body += '<p class="small muted">' + plural(n, 'workout') + ' saved. ' + backupLine(b) + '</p><div class="stack">' +
        (share ? '<button class="btn btn-pri btn-block" data-a="backupShare">Back up to Drive or another app</button>' : '') +
        '<button class="btn btn-block' + (share ? '' : ' btn-pri') + '" data-a="backupSave">Save a backup file on this phone</button>' +
        '<button class="btn btn-block" data-a="restorePick">Restore from a backup</button>' +
        (n ? '<button class="btn btn-block" data-a="copyLast">Copy the last workout for a check-in</button>' : '') + '</div>' +
        '<p class="tiny muted">A backup is one small file with your workouts, maxes, program and settings. Restoring it on any phone brings everything back.</p>';
      return { title: 'Your log', body };
    });
  },
  backupShare() {
    const f = shareFile();
    if (!f) { A.backupSave(); return; }
    navigator.share({ files: [f], title: 'Plates backup' }).then(() => { markBackedUp(); toast('Backup shared'); }, e => { if (!e || e.name !== 'AbortError') A.backupSave(); });
  },
  backupSave() { if (saveBlob(backupName('json'), backupText())) markBackedUp(); },
  copyLast() { if (S.sessions[0]) copyText(sessionText(S.sessions[0]), 'Workout copied'); },
  reloadApp() { ls.set('ui', { logger: false }); location.reload(); },
  rawSave() { saveBlob('plates-raw-' + todayStr() + '.json', rawDump()); },
  eraseAsk() { confirmSheet('Erase the log on this phone?', 'Every workout, max and setting stored in Plates on this phone is removed. Save the raw data file first if you have no backup. This can\'t be undone.', 'Erase everything', 'eraseNow', true); },
  eraseNow() {
    try { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(LSP) === 0) ks.push(k); } ks.forEach(k => localStorage.removeItem(k)); } catch (e) { /* nothing stored */ }
    location.reload();
  },
  restorePick() {
    if (S.active && !S.crash) { toast('Finish or discard the workout in progress first'); return; }
    const el = $('#restore-file');
    if (!el) return;
    el.value = '';
    el.click();
  },
  restoreNow() { applyRestore(); },
  install() {
    if (!installEvt) { A.installHelp(); return; }
    const ev = installEvt;
    installEvt = null;
    try {
      ev.prompt();
      ev.userChoice.then(c => { if (c && c.outcome === 'accepted') ls.set('installed', 1); render(); }, () => render());
    } catch (e) { A.installHelp(); }
  },
  installHelp() {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    openSheet(() => ({
      title: 'Install Plates',
      body: ios
        ? '<ol class="steps"><li>Open this page in Safari.</li><li>Tap the Share button.</li><li>Tap Add to Home Screen, then Add.</li></ol>'
        : '<ol class="steps"><li>Open this page in Chrome. If it opened inside another app, use that app\'s menu to open it in Chrome.</li><li>Tap the three-dot menu at the top right.</li><li>Tap Add to Home screen, then Install.</li></ol><p class="small muted">Already installed? Open Plates from your home screen instead.</p>'
    }));
  },
  hideInstall() { ls.set('hideInstall', 1); render(); },
  updateNow() {
    updating = true;
    if (swReg && swReg.waiting) { swReg.waiting.postMessage('skip'); setTimeout(() => location.reload(), 4000); }
    else location.reload();
  }
});
Object.assign(I, {
  haptic(el, final) { if (final) { S.meta.settings.haptic = el.checked; saveMeta(); if (el.checked) buzz(18); } },
  restoreFile(el, final) {
    if (!final) return;
    const f = el.files && el.files[0];
    if (!f) return;
    if (f.size > 20e6) { toast('That file is too big to be a Plates backup'); return; }
    const read = f.text ? f.text() : new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = rej; fr.readAsText(f); });
    read.then(text => {
      const r = parseBackup(text);
      if (r.err) { toast(r.err); return; }
      if (S.active && !S.crash) { toast('Finish or discard the workout in progress first'); return; }
      pendingRestore = r;
      if (!S.meta) { applyRestore(); return; }   // first run: nothing here to replace
      const when = /^\d{4}-\d{2}-\d{2}/.test(r.exported) ? ', saved ' + fmtDate(todayStr(new Date(r.exported))) : '';
      openSheet(() => ({
        title: 'Replace the log on this phone?',
        body: '<p>The backup has ' + plural(r.sessions.length, 'workout') + when + '. This phone has ' + plural(S.sessions.length, 'workout') + '. Restoring replaces everything here with the backup.</p>',
        foot: '<button class="btn" data-a="closeSheet">Cancel</button><button class="btn btn-danger" data-a="restoreNow">Replace with backup</button>'
      }));
      syncHistory();
    }, () => toast('That file could not be read'));
  }
});

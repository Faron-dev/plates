/* ---------- rest timer ---------- */
let actx = null, beep = null;
function unlockAudio() {
  if (!S.meta || !S.meta.settings.sound) return;
  try {
    if (!actx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; actx = new AC(); }
    if (actx.state === 'suspended') actx.resume();
  } catch (e) { actx = null; }
}
function cancelBeep() {
  if (!beep) return;
  try { beep.o.stop(); } catch (e) { /* not started */ }
  try { beep.g.disconnect(); } catch (e) { /* already gone */ }
  beep = null;
}
function armBeep(sec) {
  cancelBeep();
  if (!actx || !S.meta || !S.meta.settings.sound) return;
  try {
    const t0 = actx.currentTime + Math.max(0, sec), g = actx.createGain(), o = actx.createOscillator();
    g.gain.value = 0; g.connect(actx.destination);
    o.type = 'square'; o.frequency.value = 880; o.connect(g);
    [0, 0.22, 0.44].forEach(d => { g.gain.setValueAtTime(0.16, t0 + d); g.gain.setValueAtTime(0, t0 + d + 0.12); });
    o.start(t0); o.stop(t0 + 0.7);
    beep = { o, g };
  } catch (e) { beep = null; }
}
function startTimer(sec, label) {
  if (!(sec > 0)) return;
  S.timer = { endsAt: Date.now() + sec * 1000, total: sec, label: label || '', over: 0 };
  ls.set('timer', S.timer);
  armBeep(sec); paintTimer();
}
function adjustTimer(d) {
  const t = S.timer;
  if (!t.endsAt) return;
  t.endsAt = Math.max(Date.now(), t.endsAt + d * 1000);
  t.total = Math.max(1, t.total + d);
  t.over = 0;
  ls.set('timer', t);
  armBeep((t.endsAt - Date.now()) / 1000); paintTimer();
}
function stopTimer() {
  S.timer = { endsAt: 0, total: 0, label: '', over: 0 };
  ls.del('timer');
  cancelBeep(); paintTimer();
}
function paintTimer() {
  const el = $('#timerbar');
  if (!el) return;
  const t = S.timer;
  if (!t.endsAt || !S.meta) { if (el.className) el.className = ''; return; }
  const left = (t.endsAt - Date.now()) / 1000, over = left <= 0;
  const cls = 'on' + (over ? ' over' : '');
  if (el.className !== cls) el.className = cls;
  $('#t-num').textContent = over ? 'Go' : fmtClock(Math.ceil(left));
  $('#t-fill').style.width = over ? '100%' : Math.max(0, Math.min(100, (1 - left / t.total) * 100)).toFixed(1) + '%';
  const docked = S.ui.logger && S.ui.mode !== 'edit' && !!S.active;
  $('#t-lab').textContent = docked ? (over ? 'Rest is over' : 'Rest') : over ? (t.label ? t.label.replace(/^Next: /, '') : 'Rest is over') : (t.label || 'Rest');
}
function tick() {
  const now = Date.now(), t = S.timer;
  if (t.endsAt) {
    if (!t.over && now >= t.endsAt) { t.over = now; if (STANDALONE) buzz([220, 120, 220]); else { try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) { /* not allowed here */ } } }
    if (t.over && now - t.over > 12000) stopTimer(); else paintTimer();
  }
  const c = $('#lg-clock');
  if (c && S.active && S.ui.mode !== 'edit') { const txt = fmtClock((now - S.active.startedAt) / 1000); if (c.textContent !== txt) c.textContent = txt; }
}

/* ---------- events ---------- */
document.addEventListener('click', ev => {
  const el = ev.target.closest ? ev.target.closest('[data-a]') : null;
  if (!el || el.disabled) { if (STANDALONE) syncHistory(); return; }
  const fn = A[el.dataset.a];
  if (!fn) return;
  unlockAudio();
  fn(el, ev);
  if (STANDALONE) syncHistory();
});
document.addEventListener('input', ev => { const el = ev.target, k = el.dataset && el.dataset.i; if (k && I[k]) I[k](el, false); });
document.addEventListener('change', ev => { const el = ev.target, k = el.dataset && el.dataset.i; if (k && I[k]) I[k](el, true); });
document.addEventListener('toggle', ev => {
  const el = ev.target;
  if (!el.dataset) return;
  if (el.dataset.fold === 'vol') S.ui.volOpen = el.open;
  else if (el.dataset.fold === 'day') S.ui.openDays[el.dataset.d] = el.open;
}, true);
document.addEventListener('focusin', ev => {
  const el = ev.target;
  if (el.classList && el.classList.contains('in') && el.tagName === 'INPUT' && el.select) { try { el.select(); } catch (e) { /* fine */ } }
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && S.ui.sheets.length) { closeSheet(); if (STANDALONE) syncHistory(); return; }
  const el = ev.target;
  if (ev.key === 'Enter' && el.dataset && (el.dataset.i === 'w' || el.dataset.i === 'r')) {
    ev.preventDefault();
    if (el.dataset.i === 'w') { const r = $('#r-' + el.dataset.k + '-' + el.dataset.s); if (r) r.focus(); } else el.blur();
  }
});
window.addEventListener('hashchange', () => {
  const h = (location.hash || '').slice(1);
  if (['today', 'program', 'history', 'progress'].includes(h) && h !== S.ui.tab) { S.ui.tab = h; render(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (lazyTimer) { clearTimeout(lazyTimer); lazyTimer = null; pump(); } }
  else if (S.ui.logger && S.ui.mode !== 'edit' && S.active) keepAwake(true);
});
/* While the keypad is up, hide the next-set bar so the list keeps its room. */
const typingIn = el => !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.type !== 'checkbox' && !!el.closest && !!el.closest('#main');
document.addEventListener('focusin', ev => { if (typingIn(ev.target)) $('#app').classList.add('typing'); });
document.addEventListener('focusout', () => { setTimeout(() => { if (!typingIn(document.activeElement)) $('#app').classList.remove('typing'); }, 60); });

/* ---------- start ---------- */
$('#tabs').innerHTML = [['today', 'Today'], ['program', 'Program'], ['history', 'History'], ['progress', 'Progress']].map(a => '<button data-a="tab" data-tab="' + a[0] + '">' + IC[a[0]] + '<span>' + a[1] + '</span></button>').join('');
function boot(hot) {
  hot = hot || {};
  if (STANDALONE) { bootStandalone(); return; }
  S.uid = ls.get('lastUid') || 'local';
  if (S.uid !== 'local') (ls.get(S.uid + ':outbox') || []).forEach(a => outbox.set(a[0], a[1]));
  S.loaded = cacheRead(S.uid);
  const h = (location.hash || '').slice(1), tabs = ['today', 'program', 'history', 'progress'];
  if (tabs.includes(h)) S.ui.tab = h; else if (tabs.includes(hot.tab)) S.ui.tab = hot.tab;
  if (hot.logger && S.active) { S.ui.logger = true; keepAwake(true); }
  const t = ls.get('timer');
  if (t && t.endsAt > Date.now()) S.timer = t;
  render();
  setTimeout(() => { if (!S.loaded) { S.stuck = true; render(); } }, 10000);
  connect().catch(() => { cloud.tried = true; if (!S.loaded) S.stuck = true; refreshStatus(); render(); });
  setInterval(tick, 250);
}
let booted = false;
function bootOnce(hot) { if (booted) return; booted = true; boot(hot); }
(function () {
  let hot = null;
  try { hot = (window.claude && window.claude.hot) || null; } catch (e) { hot = null; }
  try { if (hot && hot.snapshot) hot.snapshot(() => ({ tab: S.ui.tab, logger: S.ui.logger && S.ui.mode !== 'edit' })); } catch (e) { /* no viewer */ }
  try {
    if (hot && hot.ready) { hot.ready(bootOnce); setTimeout(() => bootOnce({}), 1500); }
    else bootOnce((hot && hot.data) || {});
  } catch (e) { bootOnce({}); }
})();

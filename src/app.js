/* ---------- state ---------- */
const BUILD = '3, Nov 20';
const DEFAULT_SETTINGS = { restMain: 180, restPair: 60, restPairMain: 90, restSingle: 120, sound: true, bar: 45, cap: 10, quickRpe: 9, awake: true, haptic: true };
const S = {
  loaded: false,          // something real to show: cache, saved data, or a confirmed first run
  first: false,           // confirmed that nothing is saved yet
  stuck: false,           // could not reach saved data and nothing is cached
  status: 'connecting',   // connecting | saved | saving | offline | local
  uid: 'local',
  meta: null, programs: {}, sessions: [], active: null, edit: null,
  ui: { tab: 'today', logger: false, mode: 'live', sheets: [], progEx: '', volKey: '', openDays: {}, volOpen: false, draft: null },
  timer: { endsAt: 0, total: 0, label: '', over: 0 }
};
const touched = { meta: false, active: false, programs: new Set(), sessions: new Set() };
const $ = sel => document.querySelector(sel);

function newMeta() {
  return { v: 1, programId: 'ppl-ptc', pos: { wave: 1, week: 1, day: 0 }, maxes: {}, bodyweight: null, settings: { ...DEFAULT_SETTINGS }, custom: {}, notes: {}, dismissed: [], updatedAt: Date.now() };
}
function normMeta(m) {
  const b = newMeta();
  m = m || {};
  return {
    ...b, ...m,
    pos: { ...b.pos, ...(m.pos || {}) }, maxes: { ...(m.maxes || {}) }, settings: { ...b.settings, ...(m.settings || {}) },
    custom: { ...(m.custom || {}) }, notes: { ...(m.notes || {}) }, dismissed: Array.isArray(m.dismissed) ? m.dismissed.slice() : []
  };
}
function sortSessions() { S.sessions.sort((a, b) => (b.ts - a.ts) || (a.id < b.id ? 1 : -1)); }
function prog() {
  const id = S.meta ? S.meta.programId : 'ppl-ptc';
  return S.programs[id] || TEMPLATES[id] || TEMPLATES['ppl-ptc'];
}
function ownProg() {
  const p = prog();
  if (!S.programs[p.id]) S.programs[p.id] = clone(p);
  return S.programs[p.id];
}
function weeksIn(p) { return (p.wave && p.wave.length) || 1; }

/* ---------- storage on this device ---------- */
const LSP = 'plates1:';
const ls = {
  get(k) { try { const v = localStorage.getItem(LSP + k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(LSP + k, JSON.stringify(v)); return true; } catch (e) { if (STANDALONE) storageTrouble(); return false; } },
  del(k) { try { localStorage.removeItem(LSP + k); } catch (e) { /* same */ } }
};
function cacheWrite(part) {
  const k = S.uid + ':' + part;
  if (part === 'meta') return ls.set(k, S.meta);
  if (part === 'active') return ls.set(k, S.active);
  if (part === 'programs') return ls.set(k, S.programs);
  if (part === 'sessions') return ls.set(k, S.sessions.map(s => [s.id, encSession(s)]));
  return false;
}
function cacheRead(uid) {
  const meta = ls.get(uid + ':meta');
  if (!meta) return false;
  S.meta = normMeta(meta);
  S.active = ls.get(uid + ':active') || null;
  S.programs = ls.get(uid + ':programs') || {};
  S.sessions = (ls.get(uid + ':sessions') || []).map(a => decSession(a[0], a[1]));
  sortSessions();
  return true;
}

/* ---------- saved data in the account ---------- */
const cloud = { db: null, dl: null, root: '', tried: false, pulled: false };
const outbox = new Map();
const inflight = new Set();
let retryTimer = null, retryN = 0, lazyTimer = null;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function docPath(kind, id) {
  const r = 'data/users/' + S.uid;
  if (kind === 'meta') return r + '/meta';
  if (kind === 'active') return r + '/active';
  return r + '/meta/' + (kind === 'program' ? 'programs/' : 'sessions/') + id;
}
function saveOutbox() { if (S.uid !== 'local') ls.set(S.uid + ':outbox', [...outbox]); }
function queue(kind, id, data, lazy) {
  if (S.uid === 'local') return;
  outbox.set(docPath(kind, id), data === null ? { del: 1 } : { data: clone(data) });
  saveOutbox();
  if (lazy) {
    clearTimeout(lazyTimer);
    lazyTimer = setTimeout(() => { lazyTimer = null; pump(); }, 1500);
    refreshStatus();
  } else pump();
}
function pump() {
  refreshStatus();
  if (!cloud.db) return;
  outbox.forEach((job, path) => {
    if (inflight.has(path)) return;
    inflight.add(path);
    let p;
    try { const ref = cloud.db.doc(path); p = job.del ? ref.delete() : ref.set(job.data); }
    catch (e) { p = Promise.reject({ code: 'invalid_argument', message: String((e && e.message) || e) }); }
    Promise.resolve(p).then(() => {
      inflight.delete(path);
      if (outbox.get(path) === job) outbox.delete(path);
      retryN = 0; cloud.failing = false; cloud.lastOk = Date.now();
      saveOutbox();
      if (outbox.has(path)) pump(); else { refreshStatus(); if (!cloud.pulled) pull(null, true); else if (remoteNewer) pullAgain(); }
    }, err => {
      inflight.delete(path);
      const code = err && err.code;
      if (code === 'invalid_argument' || code === 'transform_error') {
        if (outbox.get(path) === job) outbox.delete(path);
        saveOutbox();
        toast('One change could not be saved to your account. It is still on this device.');
        refreshStatus();
        return;
      }
      if (code === 'quota_exceeded') toast('Storage for this page is full. Delete old workouts to keep saving.');
      if (code === 'revoked' || code === 'not_granted' || code === 'capability_disabled' || code === 'capability_removed') { cloud.db = null; refreshStatus(); return; }
      cloud.failing = true;
      refreshStatus();
      if (!retryTimer) {
        const wait = Math.min(30000, 2000 * Math.pow(2, retryN++)) + Math.random() * 500;
        retryTimer = setTimeout(() => { retryTimer = null; pump(); }, wait);
      }
    });
  });
}
function refreshStatus() {
  let s;
  if (S.uid === 'local') s = cloud.tried ? 'local' : 'connecting';
  else if (!cloud.db || !cloud.pulled) s = cloud.tried ? 'offline' : 'connecting';
  else if (outbox.size) s = cloud.failing ? 'offline' : 'saving';
  else s = 'saved';
  if (s !== S.status) { S.status = s; paintStatus(); }
}
const STATUS_TEXT = { connecting: 'Connecting', saved: 'Saved', saving: 'Saving', offline: 'Not synced', local: 'This device only' };
function paintStatus() {
  if (STANDALONE) return;   // the installed app's chip shows backup state and is drawn with the screen
  document.querySelectorAll('.sync').forEach(el => {
    el.dataset.s = S.status;
    const t = el.querySelector('span');
    if (t) t.textContent = STATUS_TEXT[S.status];
  });
}
function syncChip() {
  if (STANDALONE) {
    const due = backupInfo().due, s = storageFail ? 'fail' : due ? 'due' : 'phone';
    return '<button class="sync" data-a="dataSheet" data-s="' + s + '"><i></i><span>' + (storageFail ? 'Not saving' : due ? 'Back up' : 'On this phone') + '</span></button>';
  }
  return '<button class="sync" data-a="syncInfo" data-s="' + S.status + '"><i></i><span>' + STATUS_TEXT[S.status] + '</span></button>';
}

async function waitForClaude(ms) {
  const ok = () => window.claude && typeof window.claude.use === 'function';
  const t0 = Date.now();
  while (!ok() && Date.now() - t0 < ms) await sleep(100);
  return ok() ? window.claude : null;
}
async function connect() {
  const c = await waitForClaude(1500);
  let db = null, uid = null;
  if (c) {
    const get = n => Promise.resolve().then(() => c.use(n)).catch(() => null);
    const r = await Promise.all([get('db'), get('user'), get('downloads')]);
    db = r[0]; cloud.dl = r[2] || null;
    try { uid = r[1] ? await r[1].id() : null; } catch (e) { uid = null; }
  }
  cloud.tried = true;
  if (!db || !uid) {
    if (!S.loaded) {
      // Nothing saved in the account can be reached from this view, and nothing is cached: keep data on this device.
      S.uid = 'local';
      if (!cacheRead('local')) S.first = true;
      S.loaded = true; S.stuck = false;
    }
    refreshStatus(); render();
    return;
  }
  let carry = null;
  if (uid !== S.uid) {
    if (S.uid === 'local' && S.meta) carry = { meta: S.meta, programs: S.programs, sessions: S.sessions, active: S.active };
    S.uid = uid;
    ls.set('lastUid', uid);
    outbox.clear();
    (ls.get(uid + ':outbox') || []).forEach(a => outbox.set(a[0], a[1]));
    S.meta = null; S.programs = {}; S.sessions = []; S.active = null; S.first = false;
    touched.meta = false; touched.active = false; touched.programs.clear(); touched.sessions.clear();
    S.loaded = cacheRead(uid);
    render();
  }
  cloud.db = db; cloud.root = 'data/users/' + uid;
  pump();
  const t0 = Date.now();
  while (outbox.size && Date.now() - t0 < 4000) await sleep(150);
  await pull(carry);
}
let metaUnsub = null, remoteNewer = false, pulling = false;
const isTyping = () => { const a = document.activeElement; return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); };
/* Another device, or Claude during a check-in, can change the saved log. Watch one document and reload when it moves on. */
function watchMeta() {
  if (metaUnsub || !cloud.db) return;
  try {
    metaUnsub = cloud.db.doc(cloud.root + '/meta').onSnapshot(snap => {
      if (!snap || !snap.exists || (snap.metadata && (snap.metadata.hasPendingWrites || snap.metadata.fromCache))) return;
      const d = snap.data();
      if (!d || (S.meta && !(d.updatedAt > S.meta.updatedAt))) return;
      remoteNewer = true;
      pullAgain();
    }, () => { metaUnsub = null; });
  } catch (e) { metaUnsub = null; }
}
async function pullAgain() {
  if (pulling || !remoteNewer || outbox.size || inflight.size) return;   // changes made here go out first, and win
  pulling = true; remoteNewer = false;
  try {
    touched.meta = false; touched.programs.clear(); touched.sessions.clear();
    touched.active = !!(S.ui.logger && S.active && S.ui.mode !== 'edit');   // never replace a workout that is open on this screen
    await pull(null, true);
  } finally { pulling = false; }
}
async function pull(carry, quiet) {
  const db = cloud.db, root = cloud.root;
  if (!db || cloud.loading) return;
  cloud.loading = true;
  try { await pullNow(db, root, carry, quiet); } finally { cloud.loading = false; }
}
async function pullNow(db, root, carry, quiet) {
  const metaRef = db.doc(root + '/meta');
  const load = () => Promise.all([
    metaRef.get(), db.doc(root + '/active').get(),
    metaRef.collection('programs').limit(200).get(),
    metaRef.collection('sessions').orderBy('ts', 'desc').limit(1000).get()
  ]);
  let res = null;
  try { res = await load(); }
  catch (e) {
    const code = e && e.code;
    if (code === 'not_granted' || code === 'revoked' || code === 'capability_disabled' || code === 'capability_removed') {
      cloud.db = null;
      if (!S.loaded) { S.uid = 'local'; outbox.clear(); if (!cacheRead('local')) S.first = true; S.loaded = true; S.stuck = false; }
      refreshStatus(); render();
      return;
    }
    if (!code || code === 'unavailable') { await sleep(500 + Math.random() * 700); try { res = await load(); } catch (e2) { res = null; } }
  }
  if (!res) {
    if (!S.loaded) S.stuck = true;
    refreshStatus();
    if (!quiet) render();
    if (!cloud.pulled && !cloud.again) cloud.again = setTimeout(() => { cloud.again = null; if (!cloud.pulled) pull(carry, true); }, 15000);
    return;
  }
  const pend = p => outbox.has(p);
  const m = res[0], a = res[1];
  const hadCloud = m.exists;
  if (!touched.meta && !pend(docPath('meta'))) {
    if (m.exists) S.meta = normMeta(clone(m.data()));
    else if (S.meta) queue('meta', null, S.meta);
  }
  if (!touched.active && !pend(docPath('active'))) {
    const ad = a.exists ? a.data() : null;
    S.active = ad && Array.isArray(ad.entries) ? clone(ad) : null;
  }
  const progs = {};
  res[2].docs.forEach(d => { progs[d.id] = clone(d.data()); progs[d.id].id = d.id; });
  Object.keys(S.programs).forEach(id => { if (touched.programs.has(id) || pend(docPath('program', id))) progs[id] = S.programs[id]; });
  S.programs = progs;
  const keep = S.sessions.filter(s => touched.sessions.has(s.id) || pend(docPath('session', s.id)));
  const keepIds = new Set(keep.map(s => s.id));
  S.sessions = res[3].docs.filter(d => !keepIds.has(d.id) && !touched.sessions.has(d.id) && !pend(docPath('session', d.id))).map(d => decSession(d.id, d.data())).concat(keep);
  sortSessions();
  if (!hadCloud && !S.meta && carry) {
    // First visit with saved-data access after using this device only: move that log into the account.
    S.meta = carry.meta; S.programs = carry.programs; S.sessions = carry.sessions; S.active = carry.active;
    queue('meta', null, S.meta);
    Object.keys(S.programs).forEach(id => queue('program', id, S.programs[id]));
    S.sessions.forEach(s => queue('session', s.id, encSession(s)));
    if (S.active) queue('active', null, S.active);
  }
  cloud.pulled = true; cloud.lastOk = Date.now();
  S.first = !S.meta;
  S.loaded = true; S.stuck = false;
  ['meta', 'active', 'programs', 'sessions'].forEach(cacheWrite);
  refreshStatus();
  if (!(quiet && isTyping())) render();
  watchMeta();
}

function saveMeta() { S.meta.updatedAt = Date.now(); touched.meta = true; cacheWrite('meta'); queue('meta', null, S.meta); }
function saveActive(now) {
  touched.active = true;
  if (S.active) S.active.updatedAt = Date.now();
  cacheWrite('active');
  queue('active', null, S.active || { none: true, updatedAt: Date.now() }, !now);
}
function saveProgram(p) { p.updatedAt = Date.now(); S.programs[p.id] = p; touched.programs.add(p.id); cacheWrite('programs'); queue('program', p.id, p); saveMeta(); }
function saveSession(s) {
  touched.sessions.add(s.id);
  const i = S.sessions.findIndex(x => x.id === s.id);
  if (i >= 0) S.sessions[i] = s; else S.sessions.push(s);
  sortSessions();
  cacheWrite('sessions');
  queue('session', s.id, encSession(s));
  saveMeta();
}
function deleteSession(id) {
  touched.sessions.add(id);
  S.sessions = S.sessions.filter(s => s.id !== id);
  cacheWrite('sessions');
  queue('session', id, null);
  saveMeta();
}

/* ---------- history lookups ---------- */
function findPrev(exId, dayId, skipId) {
  let same = null, any = null;
  for (const s of S.sessions) {
    if (s.id === skipId) continue;
    const e = s.entries.find(x => x.ex === exId && x.sets.some(isHard));
    if (!e) continue;
    if (!any) any = { s, e };
    if (s.dayId === dayId) { same = { s, e }; break; }
  }
  return { same, any };
}
function daysApart(a, b) { return Math.abs(new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / 864e5; }
/* The session to compare against: the last time on this same day if that is recent, otherwise the most recent anywhere. */
function refFor(exId, dayId) {
  const pv = findPrev(exId, dayId);
  const useSame = !!pv.same && (!pv.any || daysApart(pv.any.s.date, pv.same.s.date) <= 10);
  return { same: pv.same, any: pv.any, ref: useSame ? pv.same : pv.any, kind: useSame ? 'same' : 'any' };
}
function workingWeight(e) {
  const count = new Map();
  e.sets.filter(isHard).forEach(x => count.set(x.w, (count.get(x.w) || 0) + 1));
  let best = null, n = 0;
  count.forEach((c, w) => { if (c > n || (c === n && w > best)) { best = w; n = c; } });
  return best;
}
function setsBrief(exId, e) {
  const out = [];
  let lastW = null;
  e.sets.filter(isHard).forEach(x => {
    if (x.w === lastW) out[out.length - 1] += ', ' + trimNum(x.r);
    else { out.push(fmtW(exId, x.w) + ' × ' + trimNum(x.r)); lastW = x.w; }
  });
  return out.join('; ');
}
function bestBefore(exId, skipId) {
  let best = 0;
  for (const s of S.sessions) {
    if (s.id === skipId) continue;
    for (const e of s.entries) if (e.ex === exId) { const b = bestOfEntry(e, s.bw || S.meta.bodyweight); if (b && b.v > best) best = b.v; }
  }
  return best;
}
function isDone(wave, week, dayId) {
  return S.sessions.some(s => s.programId === S.meta.programId && s.wave === wave && s.week === week && s.dayId === dayId);
}
function advanceFrom(pos) {
  const p = prog(), W = weeksIn(p), D = p.days.length;
  for (let k = pos.week; k <= W; k++) for (let d = (k === pos.week ? pos.day : 0); d < D; d++) {
    if (!isDone(pos.wave, k, p.days[d].id)) return { wave: pos.wave, week: k, day: d };
  }
  return { wave: pos.wave, week: W + 1, day: 0 };
}
/* Sets planned in this week's finished workouts that were not done, net of any made up since. */
function owedList() {
  const pos = S.meta.pos, planned = {}, from = {}, done = {};
  S.sessions.forEach(s => {
    if (s.programId !== S.meta.programId || s.wave !== pos.wave || s.week !== pos.week || s.src === 'sheet') return;
    s.entries.forEach(e => {
      const key = e.for || e.ex;
      if (e.plan && !e.opt && !e.extra) { planned[key] = (planned[key] || 0) + e.plan; (from[key] = from[key] || []).includes(s.day) || from[key].push(s.day); }
      done[key] = (done[key] || 0) + hardSets(e);
    });
  });
  const w = S.active;
  if (w && w.wave === pos.wave && w.week === pos.week) w.entries.forEach(e => {
    if (!e.extra) return;
    const key = e.for || e.ex;
    done[key] = (done[key] || 0) + e.sets.filter(x => x.done && isHard(x)).length;
  });
  const out = [];
  Object.keys(planned).forEach(k => {
    const owe = planned[k] - (done[k] || 0);
    if (owe > 0 && !S.meta.dismissed.includes(pos.wave + '-' + pos.week + '-' + k)) out.push({ ex: k, sets: owe, days: from[k] });
  });
  return out;
}
function waveReview() {
  const p = prog(), W = weeksIn(p), wave = S.meta.pos.wave, out = [], seen = new Set();
  p.days.forEach(d => d.items.forEach(it => {
    if (!it.wave || seen.has(it.ex)) return;
    seen.add(it.ex);
    const cur = S.meta.maxes[it.ex];
    if (!cur) return;
    let target = p.wave[W - 1].back[1];
    if (it.cap) target = Math.min(target, it.cap);
    let pct = 0, why = 'No week ' + W + ' back-off set logged, so it stays.';
    for (const s of S.sessions) {
      if (s.programId !== p.id || s.wave !== wave || s.week !== W) continue;
      const e = s.entries.find(x => (x.for || x.ex) === it.ex && x.sets.some(y => y.t === 'B'));
      if (!e) continue;
      const b = e.sets.find(y => y.t === 'B'), diff = b.r - target;
      pct = diff >= 2 ? 4 : diff >= 0 ? 2 : 0;
      why = 'First back-off set: ' + trimNum(b.r) + ' reps against a target of about ' + target + '.';
      break;
    }
    out.push({ ex: it.ex, cur, pct, next: round5(cur * (1 + pct / 100)), why });
  }));
  return out;
}

/* ---------- workouts ---------- */
function curWorkout() { return S.ui.mode === 'edit' ? S.edit : S.active; }
function mkSet(t, w, r, extra) {
  return Object.assign({ t, w: w == null ? '' : w, r: r == null ? '' : r, rpe: '', done: false }, extra || {});
}
function stamp(ms) {
  const d = new Date(ms);
  return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '-' + pad2(d.getHours()) + pad2(d.getMinutes());
}
function prefillWeight(exId, dayId) {
  const ref = refFor(exId, dayId).ref;
  if (!ref) return '';
  const w = workingWeight(ref.e);
  return w == null ? '' : w;
}
function buildEntry(w, p, it, week) {
  const e = {
    key: 'e' + (++w.n), ex: it.ex, for: it.ex, pair: it.pair || '', lo: it.lo || null, hi: it.hi || null, wave: !!it.wave, opt: !!it.opt,
    extra: false, skipped: false, note: '', tip: it.note || '', alt: (it.alt || []).slice(), rest: it.rest || null, back: it.back == null ? null : it.back, cap: it.cap || null, sets: []
  };
  if (it.wave) fillWaveSets(e, p, week);
  else {
    const pw = prefillWeight(it.ex, w.dayId);
    for (let i = 0; i < it.sets; i++) e.sets.push(mkSet('', pw, ''));
    e.plan = it.sets;
  }
  return e;
}
function fillWaveSets(e, p, week) {
  const it = { ex: e.ex, back: e.back == null ? undefined : e.back, cap: e.cap || undefined };
  const wp = wavePlan(p, it, week, S.meta), backs = e.back == null ? 3 : e.back;
  // Keep what is already done; rebuild the sets still to do from the current max.
  const done = e.sets.filter(x => x.done), of = t => done.filter(x => x.t === t);
  const out = of('W');
  const topDone = of('T').length > 0;
  if (wp && !topDone) wp.warm.slice(out.length).forEach(x => out.push(mkSet('W', x.w, x.r, { tw: x.w, tr: x.r })));
  out.push(...of('T'));
  if (!topDone) out.push(wp ? mkSet('T', wp.top.w, wp.top.r, { tw: wp.top.w, tr: wp.top.r }) : mkSet('T', '', ''));
  out.push(...of('B'));
  for (let i = of('B').length; i < backs; i++) out.push(wp ? mkSet('B', wp.back.w, '', { tw: wp.back.w, tr: wp.back.r, about: 1 }) : mkSet('B', '', ''));
  out.push(...done.filter(x => x.t !== 'W' && x.t !== 'T' && x.t !== 'B'));
  e.sets = out;
  e.pct = wp ? [wp.top.pct, wp.back.pct] : null;
  e.plan = 1 + backs;
}
function buildWorkout(dayIdx, week, wave) {
  const p = prog(), d = p.days[dayIdx], now = Date.now();
  const w = { id: stamp(now) + '-' + d.id, startedAt: now, programId: p.id, program: p.name, wave, week, dayId: d.id, day: d.name, bw: S.meta.bodyweight || null, note: '', n: 0, entries: [] };
  d.items.forEach(it => w.entries.push(buildEntry(w, p, it, week)));
  return w;
}
function groupsOf(w) {
  const out = [];
  let cur = null;
  w.entries.forEach(e => {
    const g = /^[A-Za-z]+/.exec(e.pair || ''), letter = g ? g[0].toUpperCase() : '';
    if (cur && letter && cur.letter === letter) cur.entries.push(e);
    else { cur = { letter, entries: [e] }; out.push(cur); }
  });
  return out;
}
function nextSetRef(w) {
  for (const g of groupsOf(w)) {
    const es = g.entries.filter(e => !e.skipped);
    for (const e of es) for (let i = 0; i < e.sets.length; i++) if (e.sets[i].t === 'W' && !e.sets[i].done) return { e, i };
    const idx = es.map(e => e.sets.map((s, i) => i).filter(i => e.sets[i].t !== 'W'));
    const max = Math.max(0, ...idx.map(a => a.length));
    for (let k = 0; k < max; k++) for (let j = 0; j < es.length; j++) {
      const i = idx[j][k];
      if (i != null && !es[j].sets[i].done) return { e: es[j], i };
    }
  }
  return null;
}
function restFor(w, e, s) {
  const st = S.meta.settings;
  if (s.t === 'W') return 0;
  const g = groupsOf(w).find(x => x.entries.includes(e));
  const live = g ? g.entries.filter(x => !x.skipped) : [e];
  if (live.length > 1) return live.some(x => x.wave) ? st.restPairMain : st.restPair;
  if (e.wave) return e.rest || st.restMain;
  return Object.keys(exInfo(e.ex).m || {}).length > 1 ? st.restMain : st.restSingle;
}
function workoutCounts(w) {
  let done = 0, total = 0;
  w.entries.forEach(e => { if (e.skipped) return; e.sets.forEach(x => { if (!isHard(x)) return; total++; if (x.done) done++; }); });
  return { done, total };
}
function workoutVolume(w) {
  const plan = {}, done = {};
  w.entries.forEach(e => {
    if (e.skipped) return;
    addVolume(plan, e.ex, e.sets.filter(isHard).length);
    addVolume(done, e.ex, e.sets.filter(x => isHard(x) && x.done).length);
  });
  return { plan, done };
}
function toSession(w) {
  const editing = !!w.sessionId;
  return {
    id: w.sessionId || w.id, ts: w.startedAt, date: w.keepDate || todayStr(new Date(w.startedAt)),
    mins: editing ? (w.keepMins == null ? null : w.keepMins) : Math.max(1, Math.round((Date.now() - w.startedAt) / 60000)),
    programId: w.programId, program: w.program, wave: w.wave, week: w.week, dayId: w.dayId, day: w.day,
    note: (w.note || '').trim(), bw: w.bw == null ? null : w.bw, src: w.src || '',
    entries: w.entries.map(e => ({
      ex: e.ex, for: e.for && e.for !== e.ex ? e.for : '', pair: e.pair || '', plan: e.extra ? null : (e.plan == null ? null : e.plan), lo: e.lo, hi: e.hi,
      wave: !!e.wave, opt: !!e.opt, extra: !!e.extra, skipped: !!e.skipped, cut: !!e.cut, note: (e.note || '').trim(),
      sets: e.sets.filter(x => x.done && num(x.r) != null).map(x => ({ t: x.t, w: num(x.w) || 0, r: num(x.r) || 0, rpe: num(x.rpe) }))
    })).filter(e => e.sets.length || (e.plan && !e.extra))
  };
}
function fromSession(s) {
  let n = 0;
  return {
    id: s.id, sessionId: s.id, startedAt: s.ts, keepDate: s.date, keepMins: s.mins, programId: s.programId, program: s.program, wave: s.wave, week: s.week,
    dayId: s.dayId, day: s.day, bw: s.bw, note: s.note || '', src: s.src || '', n: s.entries.length,
    entries: s.entries.map(e => ({
      key: 'e' + (++n), ex: e.ex, for: e.for || e.ex, pair: e.pair, lo: e.lo, hi: e.hi, wave: e.wave, opt: e.opt, extra: e.extra, skipped: e.skipped,
      note: e.note || '', tip: '', alt: [], rest: null, plan: e.plan, cut: !!e.cut,
      sets: e.sets.map(x => ({ t: x.t, w: x.w, r: x.r, rpe: x.rpe == null ? '' : x.rpe, done: true }))
    }))
  };
}
function touchWorkout(now) { if (S.ui.mode !== 'edit') saveActive(now); }
function retargetActive() {
  const w = S.active;
  if (!w) return;
  const p = prog();
  w.bw = S.meta.bodyweight || w.bw;
  w.entries.forEach(e => { if (e.wave && !e.skipped) fillWaveSets(e, p, w.week); });
  saveActive(true);
}

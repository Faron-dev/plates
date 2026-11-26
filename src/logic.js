/* ---------- small utilities ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const num = v => { if (v === '' || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
const pad2 = n => String(n).padStart(2, '0');
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function todayStr(d = new Date()) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function fmtDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  return DOW[new Date(y, m - 1, d).getDay()] + ' ' + MON[m - 1] + ' ' + d;
}
function fmtShort(str) { if (!str) return ''; const p = str.split('-').map(Number); return MON[p[1] - 1] + ' ' + p[2]; }
function fmtMins(m) {
  if (m == null) return '';
  m = Math.round(m);
  if (m < 60) return m + ' min';
  return Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '');
}
function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return (h ? h + ':' + pad2(m) : m) + ':' + pad2(s);
}
function trimNum(n) { return String(Math.round(n * 100) / 100); }
function plural(n, one, many) { return trimNum(n) + ' ' + (n === 1 ? one : (many || one + 's')); }

/* ---------- exercises ---------- */
function exInfo(id) {
  return EX[id] || (S.meta && S.meta.custom && S.meta.custom[id]) || { n: id || 'Exercise', g: 'Other', load: 'stack', m: {} };
}
function exName(id) { return exInfo(id).n; }
function fmtW(exId, w) {
  const L = exInfo(exId).load;
  if (w == null || w === '') return (L === 'bw' || L === 'added') ? 'BW' : '?';
  if (L === 'added' || L === 'bw') return w > 0 ? '+' + trimNum(w) : w < 0 ? '−' + trimNum(-w) : 'BW';
  return trimNum(w);
}
function fmtSet(exId, s) { return fmtW(exId, s.w) + ' × ' + trimNum(s.r) + (s.rpe ? ' @' + trimNum(s.rpe) : ''); }
const SET_LABEL = { W: 'W', T: 'Top', B: 'Bk', D: 'Dr' };
const SET_WORD = { W: 'Warm-up', T: 'Top', B: 'Back-off', D: 'Drop' };

/* ---------- loads ---------- */
/* Nearest 5 lb, ties to the even multiple (so 277.5 gives 280 and 52.5 gives 50), matching the loads already in use. */
function round5(x) {
  const q = x / 5, f = Math.floor(q), d = q - f;
  let r;
  if (Math.abs(d - 0.5) < 1e-9) r = (((f % 2) + 2) % 2 === 0) ? f : f + 1;
  else r = Math.round(q);
  return (r * 5) || 0;
}
function waveLoad(exId, pct, max, bw) {
  const exact = pct / 100 * max;
  if (exInfo(exId).body) {
    let added = round5(exact - (bw || 0));
    if (added === -5) added = 0;
    return { w: added, exact, total: (bw || 0) + added };
  }
  const w = round5(exact);
  return { w, exact, total: w };
}
/* Targets for one wave lift in a given week (1-based). Returns null when no max is set. */
function wavePlan(program, item, week, meta) {
  const max = meta.maxes && meta.maxes[item.ex];
  if (!max) return null;
  const rows = program.wave && program.wave.length ? program.wave : TEMPLATES['ppl-ptc'].wave;
  const wk = rows[Math.min(Math.max(week, 1), rows.length) - 1];
  const bw = meta.bodyweight || 0;
  const top = waveLoad(item.ex, wk.top[0], max, bw);
  let topReps = wk.top[1];
  const dev = (top.total - top.exact) / top.exact * 100;
  if (dev <= -1.95) topReps += 1; else if (dev >= 1.95) topReps = Math.max(1, topReps - 1);
  const back = waveLoad(item.ex, wk.back[0], max, bw);
  let backReps = wk.back[1];
  if (item.cap) backReps = Math.min(backReps, item.cap);
  return {
    top: { w: top.w, r: topReps, pct: wk.top[0] },
    back: { w: back.w, r: backReps, pct: wk.back[0], sets: item.back != null ? item.back : 3 },
    warm: (wk.warm || []).map(a => ({ w: waveLoad(item.ex, a.p, max, bw).w, r: a.r, pct: a.p }))
  };
}
function effW(exId, w, bw) { return exInfo(exId).body ? (bw || 0) + (w || 0) : (w || 0); }
/* Epley, counting reps left in the tank from RPE. */
function e1rm(w, r, rpe) {
  if (!(w > 0) || !(r > 0)) return 0;
  const eff = r + (rpe ? Math.max(0, 10 - rpe) : 0);
  return eff <= 1 ? w : w * (1 + eff / 30);
}
const PLATES = [45, 35, 25, 10, 5, 2.5];
function platesFor(total, bar) {
  let side = (total - bar) / 2;
  if (!(side >= 0)) return null;
  const out = [];
  for (const p of PLATES) while (side >= p - 1e-9) { out.push(p); side -= p; }
  return { plates: out, rest: Math.round(side * 200) / 100 };
}
function platesLine(total, bar) {
  const pf = platesFor(total, bar);
  if (!pf) return 'Lighter than the ' + bar + ' lb bar';
  let t = pf.plates.length ? pf.plates.join(' + ') + ' a side' : 'Empty bar';
  if (pf.rest > 0) t += ', ' + trimNum(pf.rest) + ' lb short';
  return t;
}
function barSvg(total, bar, mono) {
  const pf = platesFor(total, bar);
  if (!pf) return '';
  const HH = { 45: 66, 35: 58, 25: 48, 10: 36, 5: 28, 2.5: 22 }, WW = { 45: 15, 35: 13, 25: 11, 10: 9, 5: 7, 2.5: 6 };
  const col = p => mono ? 'currentColor' : 'var(--p' + (p === 2.5 ? 2 : p) + ')';
  const steel = mono ? 'currentColor' : 'var(--steel)';
  const cx = 164, cy = 36, half = 40;
  let s = '<rect x="' + (cx - half) + '" y="' + (cy - 3) + '" width="' + (half * 2) + '" height="6" fill="' + steel + '"/>';
  for (const dir of [-1, 1]) {
    let x = cx + dir * half;
    s += '<rect x="' + (dir > 0 ? x : x - 7) + '" y="' + (cy - 9) + '" width="7" height="18" rx="2" fill="' + steel + '"/>';
    x += dir * 9;
    for (const p of pf.plates) {
      const w = WW[p], h = HH[p];
      s += '<rect x="' + (dir > 0 ? x : x - w) + '" y="' + (cy - h / 2) + '" width="' + w + '" height="' + h + '" rx="2.5" fill="' + col(p) + '"/>';
      x += dir * (w + 2);
    }
    s += '<rect x="' + (dir > 0 ? x : x - 12) + '" y="' + (cy - 4) + '" width="12" height="8" rx="1.5" fill="' + steel + '"/>';
  }
  return '<svg class="barviz" viewBox="0 0 328 72" role="img" aria-label="Bar loaded to ' + trimNum(total) + ' pounds">' + s + '</svg>';
}

/* ---------- sets and sessions ---------- */
/* Stored sets are short strings: "T:335x1@8" (W warm-up, T top, B back-off, D drop; plain is a work set). */
function encSet(s) { return (s.t ? s.t + ':' : '') + trimNum(s.w || 0) + 'x' + trimNum(s.r || 0) + (s.rpe ? '@' + trimNum(s.rpe) : ''); }
function decSet(str) {
  const m = /^(?:([WTBD]):)?(-?\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)(?:@(\d+(?:\.\d+)?))?$/.exec(String(str));
  return m ? { t: m[1] || '', w: Number(m[2]), r: Number(m[3]), rpe: m[4] ? Number(m[4]) : null } : null;
}
/* Sessions written from outside the app can carry chk: sets, total reps, total weight and total RPE x 2. */
function sessionChk(entries) {
  let n = 0, r = 0, w = 0, p = 0;
  entries.forEach(e => e.sets.forEach(x => { n++; r += x.r; w += x.w; p += (x.rpe || 0) * 2; }));
  return n + '-' + trimNum(r) + '-' + trimNum(w) + '-' + trimNum(p);
}
function decSession(id, d) {
  const s = decSessionRaw(id, d);
  if (d && d.chk && d.chk !== sessionChk(s.entries)) s.bad = true;
  return s;
}
function decSessionRaw(id, d) {
  d = d || {};
  return {
    id, ts: d.ts || 0, date: d.date || '', mins: d.mins == null ? null : d.mins,
    programId: d.programId || '', program: d.program || '', wave: d.wave == null ? null : d.wave, week: d.week == null ? null : d.week,
    dayId: d.dayId || '', day: d.day || '', note: d.note || '', bw: d.bw == null ? null : d.bw, src: d.src || '',
    entries: (Array.isArray(d.entries) ? d.entries : []).map(e => ({
      ex: e.ex, for: e.for || '', pair: e.pair || '', plan: e.plan == null ? null : e.plan, lo: e.lo == null ? null : e.lo, hi: e.hi == null ? null : e.hi,
      wave: !!e.wave, opt: !!e.opt, extra: !!e.extra, skipped: !!e.skipped, cut: !!e.cut, note: e.note || '',
      sets: (Array.isArray(e.sets) ? e.sets : []).map(decSet).filter(Boolean)
    })).filter(e => e.ex)
  };
}
function encSession(s) {
  const d = { v: 1, ts: s.ts, date: s.date, programId: s.programId, program: s.program, wave: s.wave, week: s.week, dayId: s.dayId, day: s.day };
  if (s.mins != null) d.mins = s.mins;
  if (s.bw != null) d.bw = s.bw;
  if (s.note) d.note = s.note;
  if (s.src) d.src = s.src;
  if (s.bad) d.chk = 'failed';   // keeps a failed check visible after a reload
  d.entries = s.entries.map(e => {
    const o = { ex: e.ex, name: exName(e.ex) };
    if (e.for && e.for !== e.ex) o.for = e.for;
    if (e.pair) o.pair = e.pair;
    if (e.plan != null) o.plan = e.plan;
    if (e.lo != null) o.lo = e.lo;
    if (e.hi != null) o.hi = e.hi;
    if (e.wave) o.wave = true;
    if (e.opt) o.opt = true;
    if (e.extra) o.extra = true;
    if (e.skipped) o.skipped = true;
    if (e.cut) o.cut = true;
    if (e.note) o.note = e.note;
    o.sets = e.sets.map(encSet);
    return o;
  });
  return d;
}
const isHard = s => s.t !== 'W' && s.t !== 'D';
function hardSets(e) { return e.sets.filter(isHard).length; }
function addVolume(tot, exId, n) {
  const m = exInfo(exId).m || {};
  for (const k in m) tot[k] = (tot[k] || 0) + m[k] * n;
  return tot;
}
/* Best estimated max in one exercise entry. Epley drifts high on long sets, so a set of 10 or fewer
   effective reps (reps plus reps in reserve) is used whenever the entry has one. */
function bestOfEntry(e, bw) {
  let best = null, low = null;
  for (const s of e.sets) {
    if (!isHard(s)) continue;
    const v = e1rm(effW(e.ex, s.w, bw), s.r, s.rpe);
    if (!best || v > best.v || (v === best.v && s.r > best.s.r)) best = { v, s };
    if (s.r + (s.rpe ? Math.max(0, 10 - s.rpe) : 0) <= 10 && (!low || v > low.v)) low = { v, s };
  }
  return low && low.v > 0 ? low : best;
}
function sessionStats(s) {
  let sets = 0, lifted = 0;
  for (const e of s.entries) for (const x of e.sets) { if (isHard(x)) sets++; if (x.w > 0) lifted += x.w * x.r; }
  return { sets, lifted };
}
function sessionText(s) {
  const head = [s.wave != null ? 'Wave ' + s.wave : '', s.week != null ? 'Wk ' + s.week : '', s.day].filter(Boolean).join(', ');
  const lines = [head + ' (' + fmtDate(s.date) + (s.mins != null ? ', ' + fmtMins(s.mins) : '') + ')'];
  for (const e of s.entries) {
    if (!e.sets.length) continue;
    const swap = e.for && e.for !== e.ex ? ' [in place of ' + exName(e.for) + ']' : '';
    lines.push(exName(e.ex) + swap + ': ' + e.sets.map(x => (x.t ? SET_WORD[x.t] + ' ' : '') + fmtSet(e.ex, x)).join(', '));
    if (e.note) lines.push('  Note: ' + e.note);
  }
  const missed = s.entries.filter(e => e.plan && !e.opt && hardSets(e) < e.plan).map(e => exName(e.for || e.ex) + ' (' + (e.plan - hardSets(e)) + ' of ' + e.plan + ' sets)');
  if (missed.length) lines.push('Not done: ' + missed.join('; '));
  if (s.note) lines.push('Notes: ' + s.note);
  return lines.join('\n');
}

/* ---------- program maths ---------- */
function itemSets(it) { return it.wave ? 1 + (it.back != null ? it.back : 3) : (it.sets || 0); }
function programVolume(p) {
  const rows = {};
  for (const d of p.days) {
    const day = {};
    for (const it of d.items) if (!it.opt) addVolume(day, it.ex, itemSets(it));
    for (const k in day) {
      const r = rows[k] || (rows[k] = { weekly: 0, max: 0, maxDay: '', days: 0 });
      r.weekly += day[k]; r.days++;
      if (day[k] > r.max) { r.max = day[k]; r.maxDay = d.name; }
    }
  }
  return rows;
}
function itemPlanText(p, it, week, meta) {
  if (it.wave) {
    const wp = wavePlan(p, it, week, meta);
    const b = it.back != null ? it.back : 3;
    if (!wp) return 'Wave lift. Set a max to get loads.';
    return 'Top ' + fmtW(it.ex, wp.top.w) + ' × ' + wp.top.r + ', then ' + b + ' × ' + fmtW(it.ex, wp.back.w) + ' for about ' + wp.back.r;
  }
  return esc(it.sets) + ' × ' + esc(it.lo) + '–' + esc(it.hi);
}

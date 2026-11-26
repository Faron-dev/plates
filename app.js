"use strict";
const STANDALONE = true, BUILD_ID = "1d7df10a87";
/* ---------- reference data: muscles, exercises, built-in program ---------- */
const MUSCLES = [
  ['biceps', 'Biceps'], ['calves', 'Calves'], ['sideDelts', 'Lateral delts'], ['rearDelts', 'Rear delts'], ['abs', 'Abs'],
  ['quads', 'Quads'], ['glutes', 'Glutes'], ['pecs', 'Pecs'], ['frontDelts', 'Front delts'], ['lats', 'Lats'],
  ['triceps', 'Triceps'], ['hams', 'Hamstrings'], ['erectors', 'Erectors'], ['traps', 'Traps']
];
const MUSCLE_NAME = Object.fromEntries(MUSCLES);

/* load: bar = barbell (plate math), db = dumbbells (per hand), stack = machine or cable,
   added = bodyweight plus or minus added weight, bw = bodyweight only.
   m = share of a hard set each muscle gets (1, .75, .5 or .25), following the program write-up's counting. */
const EX = {
  'deadlift': { n: 'Deadlift (Barbell)', g: 'Pull', load: 'bar', m: { erectors: 1, quads: .5, calves: .5 } },
  'pullup': { n: 'Pull-Up (Weighted)', g: 'Pull', load: 'added', body: 1, m: { lats: 1, biceps: 1 } },
  'assisted-pullup': { n: 'Pull-Up (Assisted)', g: 'Pull', load: 'added', body: 1, m: { lats: 1, biceps: 1 } },
  'chinup': { n: 'Chin-Up', g: 'Pull', load: 'added', body: 1, m: { lats: 1, biceps: 1 } },
  'pulldown-underhand': { n: 'Underhand Lat Pulldown', g: 'Pull', load: 'stack', m: { lats: 1, biceps: 1 } },
  'pulldown': { n: 'Lat Pulldown', g: 'Pull', load: 'stack', m: { lats: 1, biceps: 1 } },
  'pulldown-single': { n: 'Lat Pulldown (Single Arm)', g: 'Pull', load: 'stack', m: { lats: 1, biceps: 1 } },
  'pullover-cable': { n: 'Pullover (Cable)', g: 'Pull', load: 'stack', m: { lats: 1 } },
  'row-chest': { n: 'Chest Supported Row (Machine)', g: 'Pull', load: 'stack', m: { rearDelts: 1, traps: 1, biceps: .5 } },
  'row-wide': { n: 'Seated Wide-Grip Row (Cable)', g: 'Pull', load: 'stack', m: { rearDelts: 1, traps: 1, biceps: .5 } },
  'row-seated': { n: 'Seated Row (Cable, D-handles)', g: 'Pull', load: 'stack', m: { rearDelts: 1, traps: 1, biceps: .5 } },
  'row-db': { n: 'Single-Arm Row (Dumbbell)', g: 'Pull', load: 'db', m: { rearDelts: 1, traps: 1, biceps: .5 } },
  'row-meadow': { n: 'Single-Arm Row (Meadow Row)', g: 'Pull', load: 'stack', m: { rearDelts: 1, traps: 1, biceps: .5 } },
  'reverse-pec-deck': { n: 'Reverse Pec Deck', g: 'Pull', load: 'stack', m: { rearDelts: 1 } },
  'rear-delt-fly': { n: 'Rear Delt Fly (Dumbbell)', g: 'Pull', load: 'db', m: { rearDelts: 1 } },
  'face-pull': { n: 'Face Pull', g: 'Pull', load: 'stack', m: { rearDelts: 1 } },
  'shrug-db': { n: 'Shrug (Dumbbell)', g: 'Pull', load: 'db', m: { traps: 1 } },
  'shrug-bb': { n: 'Shrug (Barbell)', g: 'Pull', load: 'bar', m: { traps: 1 } },
  'back-extension': { n: 'Back Extension (Weighted)', g: 'Pull', load: 'added', m: { erectors: 1, glutes: .5, hams: .5 } },
  'preacher-curl': { n: 'Preacher Curl (Dumbbell)', g: 'Pull', load: 'db', m: { biceps: 1 } },
  'incline-curl': { n: 'Incline Curl (Dumbbell)', g: 'Pull', load: 'db', m: { biceps: 1 } },
  'hammer-curl': { n: 'Hammer Curl', g: 'Pull', load: 'db', m: { biceps: 1 } },
  'db-curl': { n: 'Bicep Curl (Dumbbell)', g: 'Pull', load: 'db', m: { biceps: 1 } },
  'bayesian-curl': { n: 'Bayesian Curl (Cable)', g: 'Pull', load: 'stack', m: { biceps: 1 } },

  'bench-db': { n: 'Bench Press (Dumbbell)', g: 'Push', load: 'db', m: { pecs: 1, frontDelts: 1, triceps: .25 } },
  'bench-bb': { n: 'Bench Press (Barbell)', g: 'Push', load: 'bar', m: { pecs: 1, frontDelts: 1, triceps: .5 } },
  'incline-bench-db': { n: 'Incline Bench Press (Dumbbell)', g: 'Push', load: 'db', m: { pecs: 1, frontDelts: 1, triceps: .25 } },
  'ohp': { n: 'Overhead Press (Barbell)', g: 'Push', load: 'bar', m: { frontDelts: 1, sideDelts: .5, triceps: .5 } },
  'db-shoulder-press': { n: 'Seated Shoulder Press (Dumbbell)', g: 'Push', load: 'db', m: { frontDelts: 1, sideDelts: .5, triceps: .25 } },
  'cable-fly': { n: 'Chest Fly (Cable)', g: 'Push', load: 'stack', m: { pecs: 1 } },
  'incline-cable-fly': { n: 'Incline Chest Fly (Cable)', g: 'Push', load: 'stack', m: { pecs: 1 } },
  'machine-fly': { n: 'Chest Fly (Machine)', g: 'Push', load: 'stack', m: { pecs: 1 } },
  'pec-deck': { n: 'Pec Deck (Machine)', g: 'Push', load: 'stack', m: { pecs: 1 } },
  'lateral-raise-db': { n: 'Lateral Raise (Dumbbell)', g: 'Push', load: 'db', m: { sideDelts: 1 } },
  'lateral-raise-cable': { n: 'Lateral Raise (Cable)', g: 'Push', load: 'stack', m: { sideDelts: 1 } },
  'pushdown-rope': { n: 'Tricep Pushdown (Rope)', g: 'Push', load: 'stack', m: { triceps: 1 } },
  'pushdown-v': { n: 'Tricep Pushdown (V-Handle)', g: 'Push', load: 'stack', m: { triceps: 1 } },
  'pushdown-bar': { n: 'Tricep Pushdown (Straight Bar)', g: 'Push', load: 'stack', m: { triceps: 1 } },
  'french-press': { n: 'French Press', g: 'Push', load: 'stack', m: { triceps: 1 } },
  'skull-crusher': { n: 'Skull Crusher', g: 'Push', load: 'stack', m: { triceps: 1 } },

  'squat': { n: 'Squat (Barbell)', g: 'Legs', load: 'bar', m: { quads: 1, glutes: 1, erectors: .5 } },
  'rdl': { n: 'Romanian Deadlift (Barbell)', g: 'Legs', load: 'bar', m: { hams: 1, glutes: 1, erectors: .5 } },
  'leg-press': { n: 'Leg Press', g: 'Legs', load: 'stack', m: { quads: 1, glutes: 1 } },
  'split-squat-smith': { n: 'Split Squat (Smith Machine)', g: 'Legs', load: 'stack', m: { quads: 1, glutes: 1 } },
  'bulgarian-split-squat': { n: 'Bulgarian Split Squat (Dumbbell)', g: 'Legs', load: 'db', m: { quads: 1, glutes: 1 } },
  'leg-extension': { n: 'Leg Extension', g: 'Legs', load: 'stack', m: { quads: 1 } },
  'leg-curl': { n: 'Leg Curl', g: 'Legs', load: 'stack', m: { hams: 1 } },
  'ghr': { n: 'Glute Ham Raise (Weighted)', g: 'Legs', load: 'added', m: { hams: 1 } },
  'calf-standing': { n: 'Standing Calf Raise', g: 'Legs', load: 'stack', m: { calves: 1 } },
  'calf-seated': { n: 'Seated Calf Raise', g: 'Legs', load: 'stack', m: { calves: 1 } },

  'crunch-weighted': { n: 'Abs Crunch (Weighted)', g: 'Abs', load: 'added', m: { abs: 1 } },
  'reverse-crunch': { n: 'Reverse Crunch', g: 'Abs', load: 'bw', m: { abs: 1 } },
  'dragon-flag': { n: 'Upright Dragon Flag', g: 'Abs', load: 'bw', m: { abs: 1 } },
  'hanging-leg-raise': { n: 'Hanging Leg Raise', g: 'Abs', load: 'bw', m: { abs: 1 } }
};

/* Built-in program. A program saved to the account under the same id replaces it. */
const TEMPLATES = {
  'ppl-ptc': {
    id: 'ppl-ptc',
    name: 'PPL Powerbuilder PTC',
    about: 'Six days: pull, push and legs, twice. Main lifts run a 3-week wave by percent of max. Everything else goes to about RPE 9 inside a rep range, with one weight for all sets.',
    priority: ['sideDelts', 'rearDelts', 'biceps', 'abs', 'calves'],
    wave: [
      { top: [80, 5], back: [70, 10], warm: [{ p: 50, r: 5 }, { p: 65, r: 3 }] },
      { top: [85, 3], back: [75, 8], warm: [{ p: 50, r: 5 }, { p: 65, r: 3 }, { p: 75, r: 1 }] },
      { top: [90, 1], back: [80, 6], warm: [{ p: 50, r: 5 }, { p: 65, r: 3 }, { p: 75, r: 1 }] }
    ],
    days: [
      { id: 'pull1', name: 'Pull 1', focus: 'Deadlift', items: [
        { ex: 'deadlift', pair: 'A1', wave: 1, back: 2, cap: 8, note: 'Straps if grip limits. Stop the back-offs about 3 reps short.' },
        { ex: 'lateral-raise-cable', pair: 'A2', sets: 3, lo: 12, hi: 20, alt: ['lateral-raise-db'], note: 'Between deadlift sets.' },
        { ex: 'pulldown-underhand', pair: 'B1', sets: 3, lo: 8, hi: 12, alt: ['pulldown'] },
        { ex: 'calf-standing', pair: 'B2', sets: 4, lo: 10, hi: 15 },
        { ex: 'row-chest', pair: 'C1', sets: 3, lo: 8, hi: 12 },
        { ex: 'preacher-curl', pair: 'C2', sets: 3, lo: 10, hi: 15 },
        { ex: 'reverse-pec-deck', pair: 'D', sets: 3, lo: 12, hi: 20 }
      ] },
      { id: 'push1', name: 'Push 1', focus: 'Bench press', items: [
        { ex: 'bench-db', pair: 'A1', wave: 1, note: 'Nearest dumbbell pair.' },
        { ex: 'hammer-curl', pair: 'A2', sets: 3, lo: 10, hi: 15 },
        { ex: 'lateral-raise-db', pair: 'B1', sets: 4, lo: 12, hi: 20 },
        { ex: 'french-press', pair: 'B2', sets: 3, lo: 10, hi: 15 },
        { ex: 'cable-fly', pair: 'C1', sets: 3, lo: 10, hi: 15, alt: ['pec-deck'] },
        { ex: 'crunch-weighted', pair: 'C2', sets: 3, lo: 10, hi: 15, note: 'Decline bench.' },
        { ex: 'rear-delt-fly', pair: 'D', sets: 3, lo: 12, hi: 20, alt: ['face-pull'] }
      ] },
      { id: 'legs1', name: 'Legs 1', focus: 'Squat', items: [
        { ex: 'squat', pair: 'A', wave: 1, rest: 240, note: 'No pair. Rest 3 to 5 minutes.' },
        { ex: 'rdl', pair: 'B1', sets: 3, lo: 8, hi: 12, alt: ['ghr'], note: '45 lb plates, straps.' },
        { ex: 'leg-extension', pair: 'B2', sets: 3, lo: 10, hi: 15, note: 'Lean back about 45°.' },
        { ex: 'leg-curl', pair: 'C1', sets: 3, lo: 10, hi: 15, note: 'Seated if possible.' },
        { ex: 'calf-standing', pair: 'C2', sets: 4, lo: 10, hi: 15 },
        { ex: 'reverse-crunch', pair: 'D', sets: 4, lo: 10, hi: 15, alt: ['dragon-flag', 'hanging-leg-raise'] }
      ] },
      { id: 'pull2', name: 'Pull 2', focus: 'Weighted pull-up', items: [
        { ex: 'pullup', pair: 'A1', wave: 1 },
        { ex: 'lateral-raise-cable', pair: 'A2', sets: 3, lo: 12, hi: 20, alt: ['lateral-raise-db'] },
        { ex: 'pulldown-single', pair: 'B1', sets: 3, lo: 8, hi: 12, alt: ['pulldown'], note: 'Weight is per arm.' },
        { ex: 'crunch-weighted', pair: 'B2', sets: 3, lo: 10, hi: 15, note: 'Decline bench.' },
        { ex: 'row-wide', pair: 'C1', sets: 3, lo: 8, hi: 12, alt: ['row-chest', 'row-db'], note: 'Chest-supported row if the lower back is tired.' },
        { ex: 'calf-standing', pair: 'C2', sets: 4, lo: 10, hi: 15 },
        { ex: 'reverse-pec-deck', pair: 'D', sets: 3, lo: 12, hi: 20 }
      ] },
      { id: 'push2', name: 'Push 2', focus: 'Overhead press', items: [
        { ex: 'ohp', pair: 'A1', wave: 1 },
        { ex: 'incline-curl', pair: 'A2', sets: 3, lo: 10, hi: 15 },
        { ex: 'lateral-raise-db', pair: 'B1', sets: 4, lo: 12, hi: 20 },
        { ex: 'pushdown-rope', pair: 'B2', sets: 3, lo: 10, hi: 15 },
        { ex: 'incline-bench-db', pair: 'C', sets: 3, lo: 8, hi: 12 },
        { ex: 'machine-fly', pair: 'D', sets: 2, lo: 10, hi: 15, alt: ['cable-fly'] }
      ] },
      { id: 'legs2', name: 'Legs 2', focus: 'Leg press', items: [
        { ex: 'leg-press', pair: 'A1', sets: 3, lo: 10, hi: 15 },
        { ex: 'calf-seated', pair: 'A2', sets: 4, lo: 10, hi: 20, alt: ['calf-standing'], note: 'Standing if there is no machine.' },
        { ex: 'split-squat-smith', pair: 'B1', sets: 3, lo: 8, hi: 12, note: 'Each leg.' },
        { ex: 'reverse-crunch', pair: 'B2', sets: 4, lo: 10, hi: 15, alt: ['hanging-leg-raise', 'dragon-flag'] },
        { ex: 'leg-curl', pair: 'C1', sets: 3, lo: 10, hi: 15, alt: ['ghr'] },
        { ex: 'leg-extension', pair: 'C2', sets: 2, lo: 10, hi: 15 },
        { ex: 'shrug-db', pair: 'D', sets: 3, lo: 10, hi: 15, opt: 1, note: 'Optional.' }
      ] }
    ]
  }
};

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

/* ---------- icons ---------- */
const svg = (d, extra) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + d + '</svg>';
const IC = {
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', ' style="stroke-width:3"'),
  back: svg('<path d="M15 5l-7 7 7 7"/>', ' style="stroke-width:2.5"'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  up: svg('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  down: svg('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  edit: svg('<path d="M4 20h4L19 9l-4-4L4 16v4z"/>'),
  trash: svg('<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>'),
  timer: svg('<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M9.5 3h5"/>'),
  today: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>'),
  program: svg('<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01" style="stroke-width:3"/>'),
  history: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  progress: svg('<path d="M4 19h16"/><path d="M5 15l4.5-5 3.5 3L19 6"/>')
};

/* ---------- shell ---------- */
let lastKey = '';
/* In the installed app a screen that fails to draw must never lock the log away, so it falls back to a rescue screen. */
function render() {
  if (!STANDALONE) { renderNow(); return; }
  try { renderNow(); } catch (e) { crashed(e); }
}
function renderNow() {
  const main = $('#main'), top = $('#top'), tabs = $('#tabs');
  if (!main) return;
  if (STANDALONE && S.crash) { top.innerHTML = ''; top.hidden = true; tabs.hidden = true; main.innerHTML = viewCrash(); main.scrollTop = 0; lastKey = 'crash'; paintTheme(); return; }
  let key, topHtml = '', html;
  if (!S.loaded) { key = 'load'; html = S.stuck ? viewStuck() : viewLoading(); }
  else if (!S.meta) { key = 'first'; html = viewFirstRun(); }
  else if (S.ui.logger && curWorkout()) { key = 'logger'; topHtml = loggerHead(); html = viewLogger(); }
  else {
    S.ui.logger = false;
    key = S.ui.tab;
    if (key === 'program') { topHtml = bar('Program'); html = viewProgram(); }
    else if (key === 'history') { topHtml = bar('History'); html = viewHistory(); }
    else if (key === 'progress') { topHtml = bar('Progress'); html = viewProgress(); }
    else { key = 'today'; html = viewToday(); }
  }
  const keep = main.scrollTop;
  top.innerHTML = topHtml;
  top.hidden = !topHtml;
  main.innerHTML = html;
  tabs.hidden = !(S.loaded && S.meta) || key === 'logger';
  tabs.querySelectorAll('button').forEach(b => { if (b.dataset.tab === S.ui.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  main.scrollTop = key === lastKey ? keep : 0;
  lastKey = key;
  paintDock();
  if (STANDALONE) { rememberUi(); paintTheme(); }
}
function bar(title) { return '<div class="bar"><h1>' + esc(title) + '</h1>' + syncChip() + '</div>'; }
function viewLoading() { return '<div class="load"><div class="wordmark">Plates</div><p class="muted">Loading your log</p></div>'; }
function viewStuck() {
  return '<div class="load"><div class="wordmark">Plates</div><p>Your saved log can\'t be reached right now. Check your connection, then try again.</p><button class="btn btn-pri" data-a="retry">Try again</button></div>';
}
function waveLifts(p) {
  const seen = new Set(), out = [];
  p.days.forEach(d => d.items.forEach(it => { if (it.wave && !seen.has(it.ex)) { seen.add(it.ex); out.push(it); } }));
  return out;
}
function maxFields() {
  const p = prog();
  let h = '<div class="kv">';
  waveLifts(p).forEach(it => {
    const body = exInfo(it.ex).body;
    h += '<label for="mx-' + it.ex + '">' + esc(exName(it.ex)) + (body ? '<br><span class="tiny muted">Total: bodyweight plus added weight</span>' : exInfo(it.ex).load === 'db' ? '<br><span class="tiny muted">Each hand</span>' : '') + '</label>' +
      '<input class="in" id="mx-' + it.ex + '" type="text" inputmode="decimal" autocomplete="off" placeholder="lb" value="' + esc(S.meta && S.meta.maxes[it.ex] || '') + '">';
  });
  h += '<label for="mx-bw">Bodyweight</label><input class="in" id="mx-bw" type="text" inputmode="decimal" autocomplete="off" placeholder="lb" value="' + esc(S.meta && S.meta.bodyweight || '') + '"></div>';
  return h;
}
function viewFirstRun() {
  const local = S.status === 'local' && !STANDALONE;
  return '<section class="hero"><div class="hero-top"><span class="wordmark">Plates</span>' + (STANDALONE ? '' : syncChip()) + '</div><h1 class="hero-day">Set up</h1>' +
    '<p class="hero-note">Enter a max for each main lift and your bodyweight. Loads for ' + esc(prog().name) + ' come from these, and you can change them any time.</p></section>' +
    '<section class="block stack">' + (local ? '<p class="notice">Your saved log can\'t be reached from this view, so anything you enter here stays on this device.</p>' : '') +
    '<div class="card stack">' + maxFields() + '<button class="btn btn-pri btn-block" data-a="firstSave">Save and start</button></div>' +
    (STANDALONE ? '<div class="card stack"><p class="small muted">Used Plates before? Bring your whole log in from a backup file.</p><button class="btn btn-block" data-a="restorePick">Restore from a backup</button></div>' + installCard() : '') + '</section>';
}

/* ---------- today ---------- */
function heroLift(p, day, week) {
  const it = day.items.find(x => x.wave) || day.items[0];
  if (!it) return '<p class="hero-note">No exercises on this day yet. Add some under Program.</p>';
  const info = exInfo(it.ex), barLb = S.meta.settings.bar;
  if (it.wave) {
    const wp = wavePlan(p, it, week, S.meta);
    if (!wp) return '<div class="hero-lift"><p class="hero-note">Set a max for ' + esc(info.n) + ' to get today\'s loads.</p><div><button class="btn btn-sm" data-a="maxes">Set maxes</button></div></div>';
    const unit = info.load === 'db' ? 'lb each hand' : info.load === 'added' ? (wp.top.w > 0 ? 'lb added' : wp.top.w < 0 ? 'lb assist' : '') : 'lb';
    return '<div class="hero-lift"><div class="hero-load"><span class="num">' + fmtW(it.ex, wp.top.w) + '</span><span class="x">× ' + wp.top.r + '</span><span class="lbl">' + unit + '</span></div>' +
      '<p class="hero-note">' + esc(info.n) + ' top set at ' + wp.top.pct + '%. Then ' + plural(wp.back.sets, 'back-off set') + ' at ' + fmtW(it.ex, wp.back.w) + ' for about ' + wp.back.r + '.</p>' +
      (info.load === 'bar' ? barSvg(wp.top.w, barLb, true) + '<p class="plates-line">' + platesLine(wp.top.w, barLb) + '</p>' : '') + '</div>';
  }
  const ref = refFor(it.ex, day.id).ref;
  return '<div class="hero-lift"><div class="hero-load"><span class="num">' + it.sets + ' × ' + it.lo + '–' + it.hi + '</span></div>' +
    '<p class="hero-note">' + esc(info.n) + ' first.' + (ref ? ' Last time: ' + setsBrief(it.ex, ref.e) + '.' : '') + '</p></div>';
}
function waveGrid(p) {
  const pos = S.meta.pos, W = weeksIn(p);
  let h = '<div class="wgrid" style="--days:' + p.days.length + '"><div></div>' + p.days.map(d => '<div class="gh">' + esc(d.name) + '</div>').join('');
  for (let k = 1; k <= W; k++) {
    const row = p.wave && p.wave[k - 1];
    h += '<div class="gw">Week ' + k + (row ? '<span>' + row.top[0] + '% × ' + row.top[1] + '</span>' : '') + '</div>';
    p.days.forEach((d, i) => {
      const done = isDone(pos.wave, k, d.id);
      const live = S.active && S.active.programId === p.id && S.active.wave === pos.wave && S.active.week === k && S.active.dayId === d.id;
      const next = !done && !live && pos.week === k && pos.day === i;
      h += '<button class="cell' + (done ? ' done' : '') + (next ? ' next' : '') + (live ? ' live' : '') + '" data-a="cell" data-w="' + k + '" data-d="' + i + '" aria-label="' + esc(d.name) + ', week ' + k + (done ? ', done' : live ? ', in progress' : next ? ', next' : '') + '">' + (done ? IC.check : live ? IC.timer : next ? 'Next' : '') + '</button>';
    });
  }
  return h + '</div>';
}
function owedBlock(inLogger) {
  const owed = owedList();
  if (!owed.length) return '';
  let h = '<div class="list">';
  owed.forEach(o => {
    h += '<div><div class="grow"><strong>' + esc(exName(o.ex)) + '</strong><div class="small muted">' + plural(o.sets, 'set') + ' from ' + esc(o.days.join(', ')) + '</div></div>' +
      (inLogger ? '<button class="btn btn-sm" data-a="addOwed" data-ex="' + esc(o.ex) + '" data-n="' + o.sets + '">Add</button>' : '') +
      '<button class="btn btn-sm btn-quiet" data-a="dropOwed" data-ex="' + esc(o.ex) + '">Let go</button></div>';
  });
  return h + '</div>';
}
function viewToday() {
  const p = prog(), pos = S.meta.pos, W = weeksIn(p), live = S.active;
  let hero = '<section class="hero"><div class="hero-top"><span class="wordmark">Plates</span>' + syncChip() + '</div>';
  if (live) {
    const c = workoutCounts(live), d = p.days.find(x => x.id === live.dayId);
    hero += '<p class="hero-ctx">In progress, wave ' + live.wave + ', week ' + live.week + '</p><h1 class="hero-day">' + esc(live.day) + '</h1>' +
      (d && live.programId === p.id ? heroLift(p, d, live.week) : '') +
      '<button class="btn btn-inv btn-big" data-a="resume">Resume workout</button><p class="hero-sub">' + c.done + ' of ' + c.total + ' sets done.</p>';
  } else if (pos.week > W) {
    const rv = waveReview();
    hero += '<p class="hero-ctx">Wave ' + pos.wave + ' is finished</p><h1 class="hero-day">Wave ' + (pos.wave + 1) + '</h1><div class="hero-lift">' +
      (rv.length ? rv.map(r => '<p class="hero-note"><strong>' + esc(exName(r.ex)) + ': ' + trimNum(r.cur) + (r.next !== r.cur ? ' to ' + trimNum(r.next) + ' (+' + r.pct + '%)' : ', no change') + '.</strong> ' + esc(r.why) + '</p>').join('') : '<p class="hero-note">No maxes to update.</p>') +
      '</div><button class="btn btn-inv btn-big" data-a="newWave">Start wave ' + (pos.wave + 1) + '</button>' +
      '<p class="hero-sub">These become your new maxes. <button class="linkish" data-a="maxes">Edit maxes instead</button></p>';
  } else {
    const d = p.days[Math.min(pos.day, p.days.length - 1)];
    const sets = d.items.reduce((n, it) => n + (it.opt ? 0 : itemSets(it)), 0);
    const last = S.sessions.find(s => s.dayId === d.id);
    hero += '<p class="hero-ctx">Wave ' + pos.wave + ', week ' + pos.week + ' of ' + W + '</p><h1 class="hero-day">' + esc(d.name) + '</h1>' + heroLift(p, d, pos.week) +
      '<button class="btn btn-inv btn-big" data-a="start">Start ' + esc(d.name) + '</button>' +
      '<p class="hero-sub">' + plural(d.items.length, 'exercise') + ', ' + sets + ' hard sets.' + (last ? ' Last ' + esc(d.name) + ' was ' + fmtDate(last.date) + '.' : '') +
      ' <button class="linkish" data-a="skipDay">Skip this day</button></p>';
  }
  hero += '</section>';
  let h = hero;
  if (STANDALONE) { const cards = updateCard() + installCard(); if (cards) h += '<section class="block stack">' + cards + '</section>'; }
  const owed = owedBlock(false);
  if (owed) h += '<section class="block"><h2>Owed from this week</h2>' + owed + '</section>';
  h += '<section class="block"><h2>Wave ' + pos.wave + '<small>tap a square to see or start that workout</small></h2>' + waveGrid(p) + '</section>';
  const s = S.sessions[0];
  if (s) {
    const st = sessionStats(s);
    h += '<section class="block"><h2>Last workout</h2><div class="list"><button data-a="session" data-id="' + esc(s.id) + '"><div class="grow"><strong>' + esc(s.day || 'Workout') + '</strong>' +
      '<div class="small muted">' + fmtDate(s.date) + '</div></div><div class="small muted" style="text-align:right">' + (s.entries.length ? st.sets + ' sets' : 'not logged here') + (s.mins != null ? '<br>' + fmtMins(s.mins) : '') + '</div></button></div></section>';
  }
  return h;
}

/* ---------- workout logger ---------- */
function loggerHead() {
  const w = curWorkout(), edit = S.ui.mode === 'edit';
  return '<div class="lg-head"><button class="icon-btn" data-a="closeLogger" aria-label="' + (edit ? 'Close without saving' : 'Back to today') + '">' + IC.back + '</button>' +
    '<div class="lg-title"><strong>' + esc(w.day || 'Workout') + '</strong><span>' + (edit ? 'Editing ' + fmtDate(w.keepDate) : 'Wave ' + w.wave + ', week ' + w.week) + '</span></div>' +
    (edit ? '' : '<button class="icon-btn" data-a="manualTimer" aria-label="Start a rest timer">' + IC.timer + '</button><div class="lg-clock" id="lg-clock">' + fmtClock((Date.now() - w.startedAt) / 1000) + '</div>') +
    '<button class="btn btn-pri btn-sm" data-a="' + (edit ? 'saveEdit' : 'finish') + '">' + (edit ? 'Save' : 'Finish') + '</button></div>';
}
function rpeOptions(v) {
  let h = '<option value="">–</option>';
  for (let r = 6; r <= 10; r += 0.5) h += '<option value="' + r + '"' + (Number(v) === r && v !== '' ? ' selected' : '') + '>' + r + '</option>';
  return h;
}
function setRow(e, i, isNext) {
  const s = e.sets[i], info = exInfo(e.ex), id = e.key + '-' + i;
  const lab = s.t ? SET_LABEL[s.t] : String(e.sets.slice(0, i + 1).filter(x => !x.t).length);
  const bwish = info.load === 'bw' || info.load === 'added';
  const rph = s.tr ? (s.about ? '≈' + s.tr : String(s.tr)) : (e.lo && e.hi ? e.lo + '–' + e.hi : 'reps');
  const wv = (bwish && Number(s.w) === 0) ? '' : s.w;
  const d = ' data-k="' + e.key + '" data-s="' + i + '"';
  return '<div class="set' + (s.done ? ' done' : '') + (isNext ? ' next' : '') + '" id="set-' + id + '">' +
    (s.t === 'T' || s.t === 'B' || (e.wave && s.t === 'W' && s.tw != null) ? '<span class="set-lab" title="' + SET_WORD[s.t] + '">' + lab + '</span>'
      : '<button class="set-lab tap" data-a="setType"' + d + ' aria-label="' + (s.t ? SET_WORD[s.t] : 'Normal') + ' set. Tap to change the type">' + lab + '</button>') +
    '<input class="in" id="w-' + id + '" type="text" inputmode="decimal" autocomplete="off" aria-label="Weight" placeholder="' + (bwish ? 'BW' : 'lb') + '" value="' + esc(wv) + '" data-i="w"' + d + '>' +
    '<input class="in" id="r-' + id + '" type="text" inputmode="numeric" autocomplete="off" aria-label="Reps" placeholder="' + esc(rph) + '" value="' + esc(s.r) + '" data-i="r"' + d + '>' +
    '<select class="in" id="p-' + id + '" aria-label="RPE" data-i="rpe"' + d + '>' + rpeOptions(s.rpe) + '</select>' +
    '<button class="check" data-a="toggleSet"' + d + ' aria-pressed="' + (s.done ? 'true' : 'false') + '" aria-label="' + (s.done ? 'Undo this set' : 'Mark set done') + '">' + IC.check + '</button></div>';
}
function entryViz(e) {
  const info = exInfo(e.ex), barLb = S.meta.settings.bar;
  if (S.ui.mode === 'edit' || info.load !== 'bar' || e.skipped) return '';
  const s = e.sets.find(x => !x.done && num(x.w) != null);
  if (!s || num(s.w) < barLb) return '';
  return barSvg(num(s.w), barLb, false) + '<p class="plates-line tiny">' + trimNum(num(s.w)) + ' lb: ' + platesLine(num(s.w), barLb) + '</p>';
}
function entryInfo(w, e) {
  if (S.ui.mode === 'edit') return '';
  const rf = refFor(e.ex, w.dayId), lines = [];
  if (!rf.ref) return '<span class="muted">No history for this one yet.</span>';
  const same = rf.kind === 'same', other = same ? rf.any : rf.same;
  const lead = (x, isSame) => isSame ? 'Last ' + esc(w.day) + ', ' + fmtShort(x.s.date) : 'Most recent, ' + esc(x.s.day) + ' ' + fmtShort(x.s.date);
  lines.push('<span>' + lead(rf.ref, same) + ': ' + setsBrief(e.ex, rf.ref.e) + '</span>');
  if (other && other.s.id !== rf.ref.s.id) lines.push('<span class="muted">' + lead(other, !same) + ': ' + setsBrief(e.ex, other.e) + '</span>');
  if (!e.wave) {
    const ww = workingWeight(rf.ref.e), first = rf.ref.e.sets.find(x => isHard(x) && x.w === ww) || rf.ref.e.sets.find(isHard);
    if (e.hi && first.r >= e.hi) lines.push('<span class="up">' + fmtW(e.ex, first.w) + ' went for ' + trimNum(first.r) + ' last time, the top of the range. Go up one step in weight.</span>');
    else lines.push('<span class="beat">To beat on set 1: ' + fmtW(e.ex, first.w) + ' \u00d7 ' + trimNum(first.r) + '</span>');
  }
  return lines.join('');
}
function entryCard(w, e, nx) {
  const info = exInfo(e.ex), hard = e.sets.filter(isHard).length, edit = S.ui.mode === 'edit';
  let plan;
  if (e.wave) plan = e.pct ? 'Top set at ' + e.pct[0] + '%, back-offs at ' + e.pct[1] + '%' : (edit ? 'Wave lift' : 'Wave lift. Set a max to get loads.');
  else plan = e.lo && e.hi ? hard + ' × ' + esc(e.lo) + '–' + esc(e.hi) : plural(hard, 'set');
  if (info.load === 'db') plan += ', lb each hand';
  if (e.for && e.for !== e.ex) plan += '. In place of ' + esc(exName(e.for));
  if (e.extra) plan += '. Added';
  if (e.skipped) plan += '. Skipped';
  const last = e.sets[e.sets.length - 1];
  let h = '<article class="ex' + (e.skipped ? ' skipped' : '') + '" id="ex-' + e.key + '"><header class="ex-head">' +
    (e.pair ? '<span class="pair">' + esc(e.pair) + '</span>' : '') +
    '<div class="ex-name"><h3>' + esc(info.n) + '</h3><p class="ex-plan">' + plan + '</p></div>' +
    '<button class="icon-btn" data-a="exMenu" data-k="' + e.key + '" aria-label="Options for ' + esc(info.n) + '">' + IC.more + '</button></header>';
  const infoHtml = e.skipped ? '' : entryInfo(w, e);
  const std = S.meta.notes && S.meta.notes[e.ex];
  if (infoHtml || e.tip || e.note || std) h += '<div class="ex-info">' + infoHtml + (e.tip ? '<span class="ex-note">' + esc(e.tip) + '</span>' : '') + (std ? '<span class="ex-note">Setup: ' + esc(std) + '</span>' : '') + (e.note ? '<span class="ex-note">Today: ' + esc(e.note) + '</span>' : '') + '</div>';
  if (e.skipped) return h + '<div class="ex-foot"><button class="btn btn-sm" data-a="unskip" data-k="' + e.key + '">Do it after all</button></div></article>';
  h += '<div id="viz-' + e.key + '">' + entryViz(e) + '</div>';
  h += '<div class="sets"><div class="set-h"><span>Set</span><span>' + (info.load === 'added' ? 'Added lb' : 'lb') + '</span><span>Reps</span><span>RPE</span><span></span></div>';
  e.sets.forEach((s, i) => { h += setRow(e, i, !!nx && nx.e === e && nx.i === i); });
  h += '</div>' + verdictHtml(w, e) + '<div class="ex-foot"><button class="btn btn-sm btn-quiet" data-a="addSet" data-k="' + e.key + '">Add set</button>' +
    (edit ? '' : e.sets.some(x => x.done) ? (e.wave ? '' : '<button class="btn btn-sm btn-quiet" data-a="addDrop" data-k="' + e.key + '">Add drop set</button>')
      : (!e.wave && !e.sets.some(x => x.t === 'W') ? '<button class="btn btn-sm btn-quiet" data-a="addWarm" data-k="' + e.key + '">Add warm-up</button>' : '')) +
    (last && !last.done && e.sets.length > 1 ? '<button class="btn btn-sm btn-quiet" data-a="rmSet" data-k="' + e.key + '">Remove last set</button>' : '') + '</div></article>';
  return h;
}
function volFold(w) {
  const v = workoutVolume(w), cap = S.meta.settings.cap;
  const keys = Object.keys(v.plan).filter(k => v.plan[k] > 0).sort((a, b) => v.plan[b] - v.plan[a]);
  if (!keys.length) return '';
  const over = keys.filter(k => v.plan[k] > cap);
  return '<details class="fold" data-fold="vol"' + (S.ui.volOpen ? ' open' : '') + '><summary><span>Sets per muscle today</span>' +
    '<span class="' + (over.length ? 'chip over' : 'small muted') + '">' + (over.length ? over.length + ' over ' + cap : 'none over ' + cap) + '</span></summary><div class="fold-body">' +
    '<div class="chips">' + keys.map(k => '<span class="chip' + (v.plan[k] > cap ? ' over' : '') + '">' + esc(MUSCLE_NAME[k] || k) + ' <b>' + trimNum(v.done[k] || 0) + '</b> of ' + trimNum(v.plan[k]) + '</span>').join('') + '</div>' +
    (over.length ? '<p class="small" style="margin-top:10px">Past about ' + cap + ' hard sets for one muscle in a session, extra sets add little. Move them to another day.</p>' : '') + '</div></details>';
}
function viewLogger() {
  const w = curWorkout(), edit = S.ui.mode === 'edit', nx = edit ? null : nextSetRef(w);
  let h = '<div class="lg-body">';
  if (!edit) {
    if (!S.meta.seenTips) h += '<div class="notice calm stack"><span><strong>Three shortcuts.</strong> Tap a tick or Log set with the reps empty and pick your reps from the grid. Tap a set number to make it a warm-up or a drop set. The three dots hold swaps, notes and do later.</span><span><button class="btn btn-sm" data-a="gotTips">Got it</button></span></div>';
    const owed = owedBlock(true);
    if (owed) h += '<div class="stack"><p class="small" style="font-weight:600;padding:0 4px">Owed from earlier this week</p>' + owed + '</div>';
    h += volFold(w);
  } else {
    h += '<label class="field"><span>Date of this workout</span><input type="date" id="edit-date" data-i="editDate" value="' + esc(w.keepDate || '') + '"></label>';
  }
  groupsOf(w).forEach(g => {
    const liveN = g.entries.filter(e => !e.skipped).length;
    h += '<div class="grp">';
    if (liveN > 1 && !edit) h += '<p class="grp-tip">Pair ' + esc(g.letter) + ': alternate these, about ' + fmtClock(g.entries.some(e => e.wave) ? S.meta.settings.restPairMain : S.meta.settings.restPair) + ' between them.</p>';
    g.entries.forEach(e => { h += entryCard(w, e, nx); });
    h += '</div>';
  });
  h += '<button class="btn btn-block" data-a="addExercise">Add an exercise</button>' + (edit ? '' : '<button class="btn btn-block" data-a="copyActive">Copy this workout so far</button>') +
    '<label class="field"><span>Workout notes</span><textarea class="note" id="wnote" data-i="wnote" placeholder="Swaps, how it felt, anything to remember">' + esc(w.note || '') + '</textarea></label>';
  if (!edit) h += '<button class="btn btn-quiet btn-danger" data-a="discard">Discard this workout</button>';
  return h + '</div>';
}

/* ---------- program ---------- */
function volRows(rows, scaleMax, cap, priority) {
  const pr = priority || [];
  const order = rows.slice().sort((a, b) => {
    const pa = pr.indexOf(a.k), pb = pr.indexOf(b.k);
    if ((pa >= 0) !== (pb >= 0)) return pa >= 0 ? -1 : 1;
    if (pa >= 0) return pa - pb;
    return (b.plan || b.done) - (a.plan || a.done);
  });
  const pc = v => Math.min(100, v / scaleMax * 100).toFixed(1) + '%';
  let h = '<div class="vol">';
  order.forEach(r => {
    h += '<div class="vn">' + esc(MUSCLE_NAME[r.k] || r.k) + '</div><div class="vt" style="--cap:' + pc(cap) + '"><div class="vf' + (pr.includes(r.k) ? ' pri' : '') + '" style="width:' + pc(r.done) + '"></div>' +
      (r.plan != null ? '<div class="vp" style="left:' + pc(r.plan) + '"></div>' : '') +
      (r.max > 0 ? '<div class="vd' + (r.max > cap ? ' over' : '') + '" style="left:' + pc(r.max) + '"></div>' : '') + '</div>' +
      '<div class="vv">' + trimNum(r.done) + (r.plan != null ? '<span> / ' + trimNum(r.plan) + '</span>' : '') + '</div>';
  });
  return h + '</div>';
}
function loadsTable(p) {
  const lifts = waveLifts(p), W = weeksIn(p), pos = S.meta.pos;
  if (!lifts.length) return '<p class="muted small">This program has no percent-based lifts.</p>';
  let h = '<div class="scroll-x"><table class="tbl"><thead><tr><th>Lift and max</th>';
  for (let k = 1; k <= W; k++) h += '<th>Week ' + k + '</th>';
  h += '</tr></thead><tbody>';
  lifts.forEach(it => {
    const max = S.meta.maxes[it.ex];
    h += '<tr><td><strong>' + esc(exName(it.ex).replace(/\s*\(.*\)$/, '')) + '</strong><br><span class="muted">' + (max ? trimNum(max) + (exInfo(it.ex).body ? ' total' : '') : 'no max') + '</span></td>';
    for (let k = 1; k <= W; k++) {
      const wp = wavePlan(p, it, k, S.meta);
      h += '<td' + (k === pos.week ? ' style="font-weight:700"' : '') + '>' + (wp ? fmtW(it.ex, wp.top.w) + ' × ' + wp.top.r + '<br><span class="muted">' + fmtW(it.ex, wp.back.w) + ' × ≈' + wp.back.r + '</span>' : '–') + '</td>';
    }
    h += '</tr>';
  });
  return h + '</tbody></table></div><p class="tiny muted" style="margin-top:6px">Top set, then the back-off weight and rep target. Rounded to 5 lb.</p>';
}
function viewProgram() {
  const p = prog(), pos = S.meta.pos, W = weeksIn(p), st = S.meta.settings;
  let h = '<section class="block"><h2>' + esc(p.name) + '</h2><p class="small muted" style="max-width:60ch">' + esc(p.about || '') + '</p></section>';
  h += '<section class="block"><h2>Where you are</h2><div class="card stack">' +
    '<div class="spread"><span>Wave</span><span class="stepper"><button data-a="posWave" data-d="-1" aria-label="Previous wave">−</button><output>' + pos.wave + '</output><button data-a="posWave" data-d="1" aria-label="Next wave">+</button></span></div>' +
    '<div class="spread"><span>Week</span><span class="seg">' + Array.from({ length: W }, (_, i) => '<button data-a="posWeek" data-w="' + (i + 1) + '" aria-pressed="' + (pos.week === i + 1) + '">' + (i + 1) + '</button>').join('') + '</span></div>' +
    '<label class="field"><span>Next workout</span><select id="pos-day" data-i="posDay">' + p.days.map((d, i) => '<option value="' + i + '"' + (i === pos.day ? ' selected' : '') + '>' + esc(d.name) + '</option>').join('') + '</select></label></div></section>';
  h += '<section class="block"><h2>Maxes and loads</h2><div class="card stack">' + loadsTable(p) + '<button class="btn" data-a="maxes">Edit maxes and bodyweight</button></div></section>';
  h += '<section class="block"><h2>Days</h2><div class="stack">';
  p.days.forEach((d, i) => {
    const sets = d.items.reduce((n, it) => n + (it.opt ? 0 : itemSets(it)), 0);
    h += '<details class="fold" data-fold="day" data-d="' + i + '"' + (S.ui.openDays[i] ? ' open' : '') + '><summary><span>' + esc(d.name) + (d.focus ? ' <span class="muted small" style="font-weight:400">' + esc(d.focus) + '</span>' : '') + '</span><span class="muted small" style="font-weight:400">' + sets + ' sets</span></summary><div class="fold-body">';
    d.items.forEach(it => {
      h += '<div class="item">' + (it.pair ? '<span class="pair">' + esc(it.pair) + '</span>' : '') + '<div class="grow"><strong style="font-weight:600">' + esc(exName(it.ex)) + '</strong><div class="small muted">' + itemPlanText(p, it, Math.min(pos.week, W), S.meta) + (it.opt ? ', optional' : '') + '</div></div></div>';
    });
    h += '<button class="btn btn-sm" style="margin-top:8px" data-a="editDay" data-d="' + i + '">Edit ' + esc(d.name) + '</button></div></details>';
  });
  h += '</div></section>';
  const pv = programVolume(p), rows = Object.keys(pv).map(k => ({ k, done: pv[k].weekly, max: pv[k].max }));
  const top = Math.max(12, ...rows.map(r => r.done));
  h += '<section class="block"><h2>Planned sets per muscle<small>each week</small></h2><div class="card">' + volRows(rows, top, st.cap, p.priority) +
    '<div class="legend"><span><i class="lg-bar"></i>hard sets a week</span><span><i class="lg-dot"></i>most in one session</span><span>dashed line: ' + st.cap + ' sets, the per-session limit</span></div></div></section>';
  h += '<section class="block"><h2>Workout settings</h2><div class="card"><div class="kv">' +
    [['restMain', 'Rest after a main lift set, seconds'], ['restPairMain', 'Rest inside a pair with a main lift, seconds'], ['restPair', 'Rest inside any other pair, seconds'], ['restSingle', 'Rest after an unpaired isolation set, seconds'], ['bar', 'Bar weight, lb'], ['cap', 'Hard sets per muscle per session before a warning']]
      .map(a => '<label for="st-' + a[0] + '">' + a[1] + '</label><input class="in" id="st-' + a[0] + '" type="text" inputmode="numeric" autocomplete="off" value="' + esc(st[a[0]]) + '" data-i="setting" data-key="' + a[0] + '">').join('') +
    '</div><label class="checkline" style="margin-top:8px"><input type="checkbox" id="st-sound" data-i="sound"' + (st.sound ? ' checked' : '') + '><span>Beep when rest is over</span></label>' +
    '<label class="checkline"><input type="checkbox" id="st-awake" data-i="awake"' + (st.awake ? ' checked' : '') + '><span>Keep the screen awake during a workout' + (wakeState === 'no' ? (STANDALONE ? '. Not available in this browser.' : '. Not available in this view.') : '') + '</span></label>' +
    (STANDALONE && navigator.vibrate ? '<label class="checkline"><input type="checkbox" id="st-haptic" data-i="haptic"' + (st.haptic !== false ? ' checked' : '') + '><span>Vibrate when a set is logged and when rest is over</span></label>' : '') +
    '<label class="field" style="margin-top:4px"><span>RPE filled in when you log a set with two taps</span><select id="st-qrpe" data-i="quickRpe">' + [0, 8, 8.5, 9, 9.5, 10].map(v => '<option value="' + v + '"' + (Number(st.quickRpe) === v ? ' selected' : '') + '>' + (v || 'None') + '</option>').join('') + '</select></label></div></section>';
  if (STANDALONE) {
    const b = backupInfo();
    h += '<section class="block"><h2>Your data</h2><div class="card stack"><p class="small muted">Plates build ' + BUILD + (BUILD_ID ? ' (' + BUILD_ID + ')' : '') + '. Your log is saved on this phone. ' + backupLine(b) + '</p>' +
      '<div class="rowx" style="flex-wrap:wrap"><button class="btn btn-sm" data-a="dataSheet">Back up or restore</button><button class="btn btn-sm" data-a="copyAll">Copy everything as text</button><button class="btn btn-sm" data-a="dlCsv">Download sets as CSV</button></div>' +
      (updateReady ? '<div class="spread"><span class="small">A newer version of Plates is downloaded.</span><button class="btn btn-sm btn-pri" data-a="updateNow">Update</button></div>' : '') + '</div></section>';
    return h;
  }
  h += '<section class="block"><h2>Your data</h2><div class="card stack"><p class="small muted">' + 'Plates build ' + BUILD + '. ' + (S.uid === 'local' ? 'Saved on this device only.' : 'Saved to your account and readable by Claude, so a check-in can start from what you logged here.') + '</p>' +
    '<div class="rowx" style="flex-wrap:wrap"><button class="btn btn-sm" data-a="copyAll">Copy everything as text</button>' + (cloud.dl ? '<button class="btn btn-sm" data-a="dlCsv">Download sets as CSV</button><button class="btn btn-sm" data-a="dlJson">Download backup</button>' : '') + '</div></div></section>';
  return h;
}

/* ---------- history ---------- */
function viewHistory() {
  if (!S.sessions.length) return '<div class="empty"><h2>Nothing logged yet</h2><p class="muted">Finish a workout and it shows up here.</p><div><button class="btn btn-pri" data-a="tab" data-tab="today">Go to today</button></div></div>';
  let h = '<section class="block"><div class="list">';
  S.sessions.forEach(s => {
    const st = sessionStats(s);
    h += '<button data-a="session" data-id="' + esc(s.id) + '"><div class="grow"><strong>' + esc(s.day || 'Workout') + '</strong>' + (s.bad ? ' <span class="tag" style="background:var(--warn-bg);color:var(--warn)">check</span>' : '') + '<div class="small muted">' + fmtDate(s.date) + (s.wave != null ? ', wave ' + s.wave + ' week ' + s.week : '') + '</div></div>' +
      '<div class="small muted" style="text-align:right;flex:none">' + (s.entries.length ? st.sets + ' sets' : 'not logged here') + (s.mins != null ? '<br>' + fmtMins(s.mins) : '') + '</div></button>';
  });
  return h + '</div></section>';
}

/* ---------- progress ---------- */
function exHistory(exId) {
  const pts = [];
  for (let i = S.sessions.length - 1; i >= 0; i--) {
    const s = S.sessions[i], e = s.entries.find(x => x.ex === exId && x.sets.some(isHard));
    if (!e) continue;
    const b = bestOfEntry(e, s.bw || S.meta.bodyweight);
    pts.push({ s, e, v: b ? b.v : 0, set: b ? b.s : null, reps: Math.max(...e.sets.filter(isHard).map(x => x.r)) });
  }
  return pts;
}
function lineChart(vals, first, last) {
  const Wd = 328, H = 150, L = 36, R = 46, T = 14, B = 24, n = vals.length;
  const lo0 = Math.min(...vals), hi0 = Math.max(...vals), padv = (hi0 - lo0) * 0.18 || Math.max(1, hi0 * 0.05);
  const lo = lo0 - padv, hi = hi0 + padv;
  const x = i => n === 1 ? L + (Wd - L - R) / 2 : L + i * (Wd - L - R) / (n - 1);
  const y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  const pts = vals.map((v, i) => x(i).toFixed(1) + ' ' + y(v).toFixed(1));
  let s = '<line class="grid" x1="' + L + '" x2="' + (Wd - R) + '" y1="' + y(hi0).toFixed(1) + '" y2="' + y(hi0).toFixed(1) + '"/><text x="' + (L - 6) + '" y="' + (y(hi0) + 4).toFixed(1) + '" text-anchor="end">' + Math.round(hi0) + '</text>';
  if (hi0 !== lo0) s += '<line class="grid" x1="' + L + '" x2="' + (Wd - R) + '" y1="' + y(lo0).toFixed(1) + '" y2="' + y(lo0).toFixed(1) + '"/><text x="' + (L - 6) + '" y="' + (y(lo0) + 4).toFixed(1) + '" text-anchor="end">' + Math.round(lo0) + '</text>';
  if (n > 1) s += '<path class="ar" d="M' + pts.join(' L') + ' L' + x(n - 1).toFixed(1) + ' ' + (H - B) + ' L' + x(0).toFixed(1) + ' ' + (H - B) + ' Z"/><path class="ln" d="M' + pts.join(' L') + '"/>';
  vals.forEach((v, i) => { s += '<circle class="' + (i === n - 1 ? 'end' : 'pt') + '" cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="' + (i === n - 1 ? 5 : 3) + '"/>'; });
  s += '<text class="val" x="' + (x(n - 1) + 9).toFixed(1) + '" y="' + (y(vals[n - 1]) + 5).toFixed(1) + '">' + Math.round(vals[n - 1]) + '</text>';
  s += '<text x="' + L + '" y="' + (H - 6) + '">' + esc(first) + '</text>' + (n > 1 ? '<text x="' + (Wd - R) + '" y="' + (H - 6) + '" text-anchor="end">' + esc(last) + '</text>' : '');
  return '<svg class="chart" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="Trend from ' + Math.round(vals[0]) + ' to ' + Math.round(vals[n - 1]) + '">' + s + '</svg>';
}
function weekKeys() {
  const seen = new Set(), out = [];
  S.sessions.forEach(s => { if (s.wave == null || s.programId !== S.meta.programId) return; const k = s.wave + '-' + s.week; if (!seen.has(k)) { seen.add(k); out.push(k); } });
  return out;
}
function viewProgress() {
  const p = prog();
  const used = new Set();
  S.sessions.forEach(s => s.entries.forEach(e => { if (e.sets.some(isHard)) used.add(e.ex); }));
  if (!used.size) return '<div class="empty"><h2>No lifts to chart yet</h2><p class="muted">Charts and weekly sets per muscle appear once you have finished a workout.</p></div>';
  const mains = waveLifts(p).map(it => it.ex).filter(x => used.has(x));
  const rest = [...used].filter(x => !mains.includes(x)).sort((a, b) => exName(a).localeCompare(exName(b)));
  const all = mains.concat(rest);
  if (!all.includes(S.ui.progEx)) S.ui.progEx = all[0];
  const ex = S.ui.progEx, info = exInfo(ex), pts = exHistory(ex);
  const byMax = pts.some(q => q.v > 0), vals = pts.map(q => byMax ? q.v : q.reps);
  const best = Math.max(...vals), lastPt = pts[pts.length - 1];
  let h = '<section class="block stack"><label class="field"><span>Lift</span><select id="prog-ex" data-i="progEx">' +
    (mains.length ? '<optgroup label="Main lifts">' + mains.map(x => '<option value="' + esc(x) + '"' + (x === ex ? ' selected' : '') + '>' + esc(exName(x)) + '</option>').join('') + '</optgroup>' : '') +
    '<optgroup label="Everything else">' + rest.map(x => '<option value="' + esc(x) + '"' + (x === ex ? ' selected' : '') + '>' + esc(exName(x)) + '</option>').join('') + '</optgroup></select></label>';
  h += '<div class="card stack"><div class="big-stat"><div><span class="num">' + Math.round(best) + '</span><span>' + (byMax ? 'best estimated max, lb' : 'most reps in a set') + '</span></div>' +
    '<div><span class="num">' + Math.round(vals[vals.length - 1]) + '</span><span>latest, ' + fmtShort(lastPt.s.date) + '</span></div><div><span class="num">' + pts.length + '</span><span>' + (pts.length === 1 ? 'session' : 'sessions') + '</span></div></div>' +
    lineChart(vals, fmtShort(pts[0].s.date), fmtShort(lastPt.s.date)) +
    '<p class="tiny muted">' + (byMax ? 'Estimated max is the best set of each session by the Epley formula, counting the reps left in the tank from RPE' + (info.body ? ', with bodyweight included' : '') + '. Sets past 10 reps are left out when a shorter set is there to use.' : 'No weight logged for this one, so the chart shows the most reps in a set.') + '</p></div>';
  h += '<div class="card"><table class="tbl"><thead><tr><th>Date</th><th>Day</th><th>Sets</th></tr></thead><tbody>' +
    pts.slice(-6).reverse().map(q => '<tr><td style="white-space:nowrap">' + fmtShort(q.s.date) + '</td><td style="white-space:nowrap">' + esc(q.s.day) + '</td><td>' + setsBrief(ex, q.e) + '</td></tr>').join('') + '</tbody></table></div></section>';

  const keys = weekKeys();
  if (keys.length) {
    if (!keys.includes(S.ui.volKey)) S.ui.volKey = keys.includes(S.meta.pos.wave + '-' + S.meta.pos.week) ? S.meta.pos.wave + '-' + S.meta.pos.week : keys[0];
    const wv = S.ui.volKey.split('-').map(Number), tot = {}, mx = {};
    S.sessions.forEach(s => {
      if (s.programId !== S.meta.programId || s.wave !== wv[0] || s.week !== wv[1]) return;
      const one = {};
      s.entries.forEach(e => addVolume(one, e.ex, hardSets(e)));
      Object.keys(one).forEach(k => { tot[k] = (tot[k] || 0) + one[k]; mx[k] = Math.max(mx[k] || 0, one[k]); });
    });
    const pv = programVolume(p), ks = MUSCLES.map(m => m[0]).filter(k => tot[k] || pv[k]);
    const rows = ks.map(k => ({ k, done: tot[k] || 0, plan: pv[k] ? pv[k].weekly : 0, max: mx[k] || 0 }));
    const top = Math.max(12, ...rows.map(r => Math.max(r.done, r.plan)));
    h += '<section class="block stack"><h2 style="margin-bottom:0">Hard sets per muscle</h2><label class="field"><span>Week</span><select id="vol-week" data-i="volKey">' +
      keys.slice(0, 16).map(k => { const a = k.split('-'); return '<option value="' + k + '"' + (k === S.ui.volKey ? ' selected' : '') + '>Wave ' + a[0] + ', week ' + a[1] + '</option>'; }).join('') + '</select></label>' +
      '<div class="card">' + volRows(rows, top, S.meta.settings.cap, p.priority) +
      '<div class="legend"><span><i class="lg-bar"></i>done</span><span><i class="lg-plan"></i>planned</span><span><i class="lg-dot"></i>most in one session</span><span>dashed line: ' + S.meta.settings.cap + ' sets, the per-session limit</span></div>' +
      '<p class="tiny muted" style="margin-top:8px">Sets are counted per muscle, in full, half or quarter shares, the way the program write-up counts them. Warm-ups and drop sets are left out.</p></div></section>';
  }
  return h;
}

/* ---------- sheets ---------- */
function openSheet(fn) { S.ui.sheets.push(fn); renderSheet(); }
function closeSheet(all) { if (all) S.ui.sheets = []; else S.ui.sheets.pop(); renderSheet(true); }
function renderSheet(still) {
  const el = $('#sheet'), fn = S.ui.sheets[S.ui.sheets.length - 1];
  if (!fn) { el.className = ''; el.innerHTML = ''; return; }
  const v = fn(), sb = el.querySelector('.sh-body'), keep = still && sb ? sb.scrollTop : 0;
  el.className = 'on' + (still ? ' still' : '');
  el.innerHTML = '<button class="scrim" data-a="closeSheet" aria-label="Close"></button><div class="panel" role="dialog" aria-modal="true" aria-label="' + esc(v.title) + '">' +
    '<div class="sh-head"><h2>' + esc(v.title) + '</h2><button class="icon-btn" data-a="closeSheet" aria-label="Close">' + IC.close + '</button></div>' +
    '<div class="sh-body">' + v.body + '</div>' + (v.foot ? '<div class="sh-foot">' + v.foot + '</div>' : '') + '</div>';
  if (keep) el.querySelector('.sh-body').scrollTop = keep;
}
function confirmSheet(title, text, yesLabel, yesAction, danger) {
  openSheet(() => ({
    title, body: '<p>' + esc(text) + '</p>',
    foot: '<button class="btn" data-a="closeSheet">Cancel</button><button class="btn ' + (danger ? 'btn-danger' : 'btn-pri') + '" data-a="' + yesAction + '">' + esc(yesLabel) + '</button>'
  }));
}
let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.innerHTML = '<div role="status">' + esc(msg) + '</div>';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.innerHTML = ''; }, 3200);
}
function copyText(text, okMsg) {
  const fallback = () => openSheet(() => ({ title: 'Copy this', body: '<p class="small muted">Copying was blocked here. Select the text and copy it.</p><textarea class="note" style="min-height:260px" readonly>' + esc(text) + '</textarea>' }));
  try { navigator.clipboard.writeText(text).then(() => toast(okMsg || 'Copied'), fallback); } catch (e) { fallback(); }
}
function parseField(v) {
  const t = String(v == null ? '' : v).trim().replace(',', '.').replace('−', '-');
  if (t === '') return '';
  const n = Number(t);
  return Number.isFinite(n) ? n : '';
}
function findEntry(key) { const w = curWorkout(); return w ? w.entries.find(e => e.key === key) : null; }

/* ---------- exercise picker ---------- */
function muscleLine(info) {
  return Object.keys(info.m || {}).map(k => MUSCLE_NAME[k] || k).join(', ');
}
function pickList() {
  const pk = S.ui.pick, q = pk.q.trim().toLowerCase(), all = Object.assign({}, EX, S.meta.custom);
  const row = id => '<button data-a="pick" data-ex="' + esc(id) + '"><span>' + esc(exName(id)) + '</span><span class="tiny muted" style="text-align:right">' + esc(muscleLine(exInfo(id))) + '</span></button>';
  let h = '';
  if (!q && pk.first && pk.first.length) h += '<div class="ph">Listed swaps</div>' + pk.first.map(row).join('');
  const groups = {};
  Object.keys(all).forEach(id => { const inf = all[id]; if (q && !inf.n.toLowerCase().includes(q)) return; (groups[inf.g || 'Other'] = groups[inf.g || 'Other'] || []).push(id); });
  ['Pull', 'Push', 'Legs', 'Abs', 'Custom', 'Other'].forEach(g => {
    if (!groups[g]) return;
    h += '<div class="ph">' + g + '</div>' + groups[g].sort((a, b) => exName(a).localeCompare(exName(b))).map(row).join('');
  });
  if (q && !Object.keys(all).some(id => all[id].n.toLowerCase() === q)) h += '<button data-a="newEx"><span>Create “' + esc(pk.q.trim()) + '”</span><span class="tiny muted">new exercise</span></button>';
  return h || '<p class="muted small">No match.</p>';
}
function pickerSheet(opts) {
  S.ui.pick = Object.assign({ q: '' }, opts);
  openSheet(() => ({
    title: opts.title,
    body: '<label class="field"><span>Search</span><input type="search" id="pick-q" data-i="pickQ" autocomplete="off" placeholder="Type a name" value="' + esc(S.ui.pick.q) + '"></label>' +
      (opts.remember ? '<label class="checkline"><input type="checkbox" id="pick-remember"><span>Also make it the default in the program</span></label>' : '') +
      '<div class="pick" id="pick-list">' + pickList() + '</div>'
  }));
}

/* ---------- day editor ---------- */
function dayEditorSheet() {
  const dr = S.ui.draft, d = dr.day, p = prog(), wk = Math.min(S.meta.pos.week, weeksIn(p));
  let body = '<div class="fields"><label class="field"><span>Day name</span><input type="text" id="de-name" data-i="deName" value="' + esc(d.name) + '"></label>' +
    '<label class="field"><span>Main lift or focus</span><input type="text" id="de-focus" data-i="deFocus" value="' + esc(d.focus || '') + '"></label></div><div>';
  d.items.forEach((it, n) => {
    body += '<div class="item">' + (it.pair ? '<span class="pair">' + esc(it.pair) + '</span>' : '') + '<div class="grow"><strong style="font-weight:600">' + esc(exName(it.ex)) + '</strong><div class="small muted">' + itemPlanText(p, it, wk, S.meta) + (it.opt ? ', optional' : '') + '</div></div>' +
      '<div class="item-acts"><button class="icon-btn" data-a="diUp" data-n="' + n + '" aria-label="Move up"' + (n === 0 ? ' disabled' : '') + '>' + IC.up + '</button>' +
      '<button class="icon-btn" data-a="diDown" data-n="' + n + '" aria-label="Move down"' + (n === d.items.length - 1 ? ' disabled' : '') + '>' + IC.down + '</button>' +
      '<button class="icon-btn" data-a="diEdit" data-n="' + n + '" aria-label="Edit">' + IC.edit + '</button>' +
      '<button class="icon-btn" data-a="diDel" data-n="' + n + '" aria-label="Remove">' + IC.trash + '</button></div></div>';
  });
  body += '</div><button class="btn btn-block" data-a="diAdd">Add an exercise</button><p class="tiny muted">Changes apply from the next time you start this day.</p>';
  return { title: 'Edit ' + (d.name || 'day'), body, foot: '<button class="btn" data-a="closeSheet">Cancel</button><button class="btn btn-pri" data-a="saveDay">Save day</button>' };
}
function itemEditorSheet() {
  const it = S.ui.draft.day.items[S.ui.draft.n];
  let body = '<button class="btn btn-block" data-a="iePick" style="justify-content:space-between"><span>' + esc(exName(it.ex)) + '</span><span class="small muted">Change</span></button>' +
    '<div class="spread"><span>Loading</span><span class="seg"><button data-a="ieKind" data-v="0" aria-pressed="' + !it.wave + '">Rep range</button><button data-a="ieKind" data-v="1" aria-pressed="' + !!it.wave + '">Wave lift</button></span></div><div class="fields">';
  if (it.wave) {
    body += '<label class="field"><span>Back-off sets</span><input type="text" inputmode="numeric" id="ie-back" value="' + esc(it.back == null ? 3 : it.back) + '"></label>' +
      '<label class="field"><span>Cap back-off reps at</span><input type="text" inputmode="numeric" id="ie-cap" placeholder="no cap" value="' + esc(it.cap || '') + '"></label>' +
      '<label class="field"><span>Rest, seconds</span><input type="text" inputmode="numeric" id="ie-rest" placeholder="default" value="' + esc(it.rest || '') + '"></label>';
  } else {
    body += '<label class="field"><span>Sets</span><input type="text" inputmode="numeric" id="ie-sets" value="' + esc(it.sets || 3) + '"></label><span></span>' +
      '<label class="field"><span>Reps from</span><input type="text" inputmode="numeric" id="ie-lo" value="' + esc(it.lo || '') + '"></label>' +
      '<label class="field"><span>Reps to</span><input type="text" inputmode="numeric" id="ie-hi" value="' + esc(it.hi || '') + '"></label>';
  }
  body += '<label class="field"><span>Pair label</span><input type="text" id="ie-pair" placeholder="B1" value="' + esc(it.pair || '') + '"></label><span class="tiny muted" style="align-self:end;padding-bottom:6px">Same letter means alternate: B1 with B2.</span>' +
    '<label class="field wide"><span>Note</span><input type="text" id="ie-note" value="' + esc(it.note || '') + '"></label></div>' +
    '<label class="checkline"><input type="checkbox" id="ie-opt"' + (it.opt ? ' checked' : '') + '><span>Optional. Skipping it is never counted as owed.</span></label>';
  return { title: 'Exercise settings', body, foot: '<button class="btn btn-pri" data-a="ieDone">Done</button>' };
}
function readItemFields() {
  const it = S.ui.draft.day.items[S.ui.draft.n], g = id => { const el = $('#' + id); return el ? el.value : null; };
  const int = (id, min, max) => { const v = parseField(g(id)); return v === '' ? null : Math.max(min, Math.min(max, Math.round(v))); };
  if (g('ie-pair') != null) it.pair = g('ie-pair').trim().slice(0, 4);
  if (g('ie-note') != null) { const n = g('ie-note').trim(); if (n) it.note = n; else delete it.note; }
  if ($('#ie-opt')) { if ($('#ie-opt').checked) it.opt = 1; else delete it.opt; }
  if (it.wave) {
    if (g('ie-back') != null) { const b = int('ie-back', 0, 8); it.back = b == null ? 3 : b; }
    if (g('ie-cap') != null) { const c = int('ie-cap', 1, 50); if (c) it.cap = c; else delete it.cap; }
    if (g('ie-rest') != null) { const r = int('ie-rest', 15, 900); if (r) it.rest = r; else delete it.rest; }
  } else {
    if (g('ie-sets') != null) it.sets = int('ie-sets', 1, 12) || 3;
    if (g('ie-lo') != null) it.lo = int('ie-lo', 1, 100) || 8;
    if (g('ie-hi') != null) it.hi = Math.max(it.lo, int('ie-hi', 1, 100) || 12);
  }
}

/* ---------- actions (clicks) ---------- */
const A = {
  closeSheet() { closeSheet(); },
  tab(el) { S.ui.tab = el.dataset.tab; if (STANDALONE) { render(); return; } try { history.replaceState(null, '', '#' + S.ui.tab); } catch (e) { try { location.hash = S.ui.tab; } catch (e2) { /* stay on the tab without a hash */ } } render(); },
  retry() { cloud.tried = false; S.stuck = false; refreshStatus(); render(); connect().catch(() => { cloud.tried = true; if (!S.loaded) S.stuck = true; refreshStatus(); render(); }); },
  syncInfo() {
    const text = {
      connecting: 'Connecting to your saved log.',
      saved: 'Everything is saved to your account. It opens the same on any device.',
      saving: 'Saving your latest changes.',
      offline: 'Your account can\'t be reached right now. Changes are kept on this device and sent when the connection is back.',
      local: 'This view can\'t reach your account\'s saved data, so this log lives on this device only. Open the page from your artifacts to use your saved log.'
    }[S.status];
    const when = cloud.lastOk && S.uid !== 'local' ? '<p class="small muted">Last in step with your account at ' + new Date(cloud.lastOk).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '.</p>' : '';
    openSheet(() => ({ title: STATUS_TEXT[S.status], body: '<p>' + text + '</p>' + when, foot: (S.status === 'offline' || S.status === 'local') ? '<button class="btn btn-pri" data-a="retryClose">Try again</button>' : '' }));
  },
  retryClose() { closeSheet(true); A.retry(); },

  /* setup and maxes */
  firstSave() {
    S.meta = newMeta();
    readMaxFields();
    S.first = false;
    saveMeta(); render();
  },
  maxes() {
    openSheet(() => ({ title: 'Maxes and bodyweight', body: '<p class="small muted">Loads are a percent of these, rounded to 5 lb. The pull-up max is your bodyweight plus the weight you add.</p>' + maxFields(), foot: '<button class="btn" data-a="closeSheet">Cancel</button><button class="btn btn-pri" data-a="saveMaxes">Save</button>' }));
  },
  saveMaxes() { readMaxFields(); saveMeta(); retargetActive(); closeSheet(true); render(); toast('Maxes saved'); },
  applyMax(el) {
    S.meta.maxes[el.dataset.ex] = Number(el.dataset.v);
    saveMeta(); retargetActive();
    el.disabled = true; el.textContent = 'Max set to ' + el.dataset.v;
    render();
  },
  newWave() {
    waveReview().forEach(r => { S.meta.maxes[r.ex] = r.next; });
    S.meta.pos = { wave: S.meta.pos.wave + 1, week: 1, day: 0 };
    saveMeta(); render(); toast('Wave ' + S.meta.pos.wave + ' started');
  },

  /* position */
  posWave(el) { S.meta.pos.wave = Math.max(1, S.meta.pos.wave + Number(el.dataset.d)); saveMeta(); render(); },
  posWeek(el) { S.meta.pos.week = Number(el.dataset.w); saveMeta(); render(); },
  skipDay() {
    const p = prog(), pos = S.meta.pos;
    if (pos.day + 1 < p.days.length) pos.day++; else { pos.week++; pos.day = 0; }
    saveMeta(); render();
    toast(pos.week > weeksIn(p) ? 'That was the last day of the wave' : 'Skipped. Next up: ' + p.days[pos.day].name);
  },
  makeNext(el) { S.meta.pos.week = Number(el.dataset.w); S.meta.pos.day = Number(el.dataset.d); saveMeta(); closeSheet(true); render(); },
  cell(el) {
    const k = Number(el.dataset.w), i = Number(el.dataset.d);
    openSheet(() => {
      const p = prog(), d = p.days[i], pos = S.meta.pos;
      const sess = S.sessions.filter(s => s.programId === S.meta.programId && s.wave === pos.wave && s.week === k && s.dayId === d.id);
      let body = '';
      if (sess.length) body += '<div class="list">' + sess.map(s => '<button data-a="session" data-id="' + esc(s.id) + '"><div class="grow"><strong>Done ' + fmtDate(s.date) + '</strong><div class="small muted">' + sessionStats(s).sets + ' hard sets' + (s.mins != null ? ', ' + fmtMins(s.mins) : '') + '</div></div><span class="small muted">View</span></button>').join('') + '</div>';
      body += '<div>' + d.items.map(it => '<div class="item">' + (it.pair ? '<span class="pair">' + esc(it.pair) + '</span>' : '') + '<div class="grow"><strong style="font-weight:600">' + esc(exName(it.ex)) + '</strong><div class="small muted">' + itemPlanText(p, it, k, S.meta) + (it.opt ? ', optional' : '') + '</div></div></div>').join('') + '</div>';
      if (!sess.length && !S.active) body += '<div><button class="linkish" data-a="markDone" data-w="' + k + '" data-d="' + i + '">Mark as done without logging it here</button></div>';
      const foot = S.active ? '<button class="btn btn-pri" data-a="resume">Resume ' + esc(S.active.day) + '</button>'
        : '<button class="btn" data-a="makeNext" data-w="' + k + '" data-d="' + i + '">Make it next</button><button class="btn btn-pri" data-a="startDay" data-w="' + k + '" data-d="' + i + '">Start now</button>';
      return { title: d.name + ', week ' + k, body, foot };
    });
  },

  /* workout */
  start() { const pos = S.meta.pos; A.startDay({ dataset: { w: pos.week, d: pos.day } }); },
  startDay(el) {
    if (S.active) { toast('Finish or discard the workout in progress first'); return; }
    S.active = buildWorkout(Number(el.dataset.d), Number(el.dataset.w), S.meta.pos.wave);
    saveActive(true);
    S.ui.sheets = []; renderSheet();
    S.ui.logger = true; S.ui.mode = 'live';
    keepAwake(true);
    render();
  },
  resume() { S.ui.sheets = []; renderSheet(); S.ui.mode = 'live'; S.ui.logger = true; keepAwake(true); render(); },
  closeLogger() {
    if (S.ui.mode === 'edit') { S.edit = null; S.ui.mode = 'live'; }
    S.ui.logger = false; keepAwake(false); render();
  },
  toggleSet(el) {
    const e = findEntry(el.dataset.k), i = Number(el.dataset.s), s = e && e.sets[i];
    if (!s) return;
    if (s.done) { s.done = false; touchWorkout(true); render(); return; }
    if (s.r === '') {
      if (s.tr && !s.about) s.r = s.tr;
      else { openQuick(e.key, i); return; }
    }
    if (s.w === '') {
      const L = exInfo(e.ex).load;
      if (L === 'bw' || L === 'added') s.w = 0;
      else { const f = $('#w-' + e.key + '-' + i); if (f) f.focus(); toast('Enter the weight first'); return; }
    }
    completeSet(e, i);
  },
  addSet(el) {
    const e = findEntry(el.dataset.k), last = e.sets[e.sets.length - 1];
    e.sets.push(mkSet(last && last.t === 'B' ? 'B' : '', last ? last.w : '', '', last && last.t === 'B' ? { tw: last.tw, tr: last.tr, about: 1 } : null));
    touchWorkout(true); render();
  },
  rmSet(el) {
    const e = findEntry(el.dataset.k), last = e.sets[e.sets.length - 1];
    if (last && !last.done && e.sets.length > 1) { e.sets.pop(); touchWorkout(true); render(); }
  },
  exMenu(el) {
    const key = el.dataset.k;
    openSheet(() => {
      const e = findEntry(key);
      if (!e) return { title: 'Exercise', body: '' };
      const info = exInfo(e.ex), k = ' data-k="' + key + '"';
      let body = '<div class="pick"><button data-a="swap"' + k + '><span>Swap for another exercise</span></button><button data-a="noteEntry"' + k + '><span>' + (e.note || (S.meta.notes && S.meta.notes[e.ex]) ? 'Edit note' : 'Add a note') + '</span></button>' +
        '<button data-a="exRecent"' + k + '><span>Recent sessions</span></button>';
      if (info.load === 'bar') body += '<button data-a="plates"' + k + '><span>Plate math</span></button>';
      if (S.ui.mode !== 'edit') {
        const g = groupsOf(curWorkout()).find(x => x.entries.includes(e));
        body += '<button data-a="later"' + k + '><span>' + (g && g.entries.length > 1 ? 'Do this pair later' : 'Do this later') + '</span></button>';
        body += '<button data-a="' + (e.skipped ? 'unskip' : 'skip') + '"' + k + '><span>' + (e.skipped ? 'Do it after all' : 'Skip today') + '</span></button>';
      }
      if (e.extra || S.ui.mode === 'edit') body += '<button data-a="removeEntry"' + k + '><span style="color:var(--bad)">Remove from this workout</span></button>';
      return { title: info.n, body: body + '</div>' };
    });
  },
  swap(el) {
    const key = el.dataset.k, e0 = findEntry(key), live = S.ui.mode !== 'edit';
    closeSheet();
    const first = [e0.for].concat(e0.alt || []).filter((x, n, a) => x && x !== e0.ex && a.indexOf(x) === n);
    pickerSheet({
      title: 'Swap ' + exName(e0.ex), first, remember: live && !e0.extra,
      onPick(id, remember) {
        const w = curWorkout(), e = findEntry(key);
        if (!e || id === e.ex) return;
        e.ex = id;
        if (e.wave) fillWaveSets(e, prog(), w.week);
        else if (live) { const pw = prefillWeight(id, w.dayId); e.sets.forEach(x => { if (!x.done) x.w = pw; }); }
        if (remember) {
          const p = ownProg(), d = p.days.find(x => x.id === w.dayId), it = d && d.items.find(x => x.ex === e.for);
          if (it) { it.alt = [it.ex].concat((it.alt || []).filter(a => a !== id)); it.ex = id; e.alt = it.alt.slice(); e.for = id; saveProgram(p); }
        }
        touchWorkout(true); render();
      }
    });
  },
  pick(el) {
    const pk = S.ui.pick, rem = $('#pick-remember'), remember = !!(rem && rem.checked);
    closeSheet();
    if (pk && pk.onPick) pk.onPick(el.dataset.ex, remember);
  },
  newEx() {
    const name = S.ui.pick.q.trim();
    openSheet(() => ({
      title: 'New exercise',
      body: '<label class="field"><span>Name</span><input type="text" id="nx-name" value="' + esc(name) + '"></label>' +
        '<label class="field"><span>Main muscle</span><select id="nx-m"><option value="">Not counted</option>' + MUSCLES.map(m => '<option value="' + m[0] + '">' + m[1] + '</option>').join('') + '</select></label>' +
        '<label class="field"><span>Loaded with</span><select id="nx-load"><option value="stack">Machine, cable or other</option><option value="db">Dumbbells</option><option value="bar">Barbell</option><option value="added">Bodyweight plus added weight</option><option value="bw">Bodyweight only</option></select></label>',
      foot: '<button class="btn" data-a="closeSheet">Cancel</button><button class="btn btn-pri" data-a="saveNewEx">Add exercise</button>'
    }));
  },
  saveNewEx() {
    const name = ($('#nx-name').value || '').trim();
    if (!name) { toast('Give it a name'); return; }
    const m = $('#nx-m').value, id = 'c-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) + '-' + Date.now().toString(36).slice(-4);
    S.meta.custom[id] = { n: name, g: 'Custom', load: $('#nx-load').value, m: m ? { [m]: 1 } : {} };
    saveMeta();
    const pk = S.ui.pick;
    closeSheet(); closeSheet();
    if (pk && pk.onPick) pk.onPick(id, false);
  },
  noteEntry(el) {
    const key = el.dataset.k;
    closeSheet();
    openSheet(() => {
      const e = findEntry(key), std = (S.meta.notes && S.meta.notes[e.ex]) || '';
      return {
        title: 'Note for ' + exName(e.ex),
        body: '<textarea class="note" id="en-text" placeholder="Machine setting, grip, what limited the set">' + esc(e.note || std) + '</textarea>' +
          '<label class="checkline"><input type="checkbox" id="en-keep"' + (!e.note && std ? ' checked' : '') + '><span>Show this every time I do this exercise</span></label>',
        foot: '<button class="btn btn-pri" data-a="saveNote" data-k="' + key + '">Save note</button>'
      };
    });
  },
  saveNote(el) {
    const e = findEntry(el.dataset.k), text = ($('#en-text').value || '').trim(), keep = $('#en-keep') && $('#en-keep').checked;
    if (keep) {
      if (text) S.meta.notes[e.ex] = text; else delete S.meta.notes[e.ex];
      e.note = '';
      saveMeta();
    } else e.note = text;
    touchWorkout(true); closeSheet(true); render();
    toast(keep ? (text ? 'Saved. It will show every time.' : 'Standing note removed') : 'Note saved for today');
  },
  exRecent(el) {
    const e = findEntry(el.dataset.k), ex = e.ex;
    closeSheet();
    openSheet(() => {
      const pts = exHistory(ex).slice(-8).reverse();
      return { title: exName(ex), body: pts.length ? '<table class="tbl"><thead><tr><th>Date</th><th>Day</th><th>Sets</th></tr></thead><tbody>' + pts.map(q => '<tr><td style="white-space:nowrap">' + fmtShort(q.s.date) + '</td><td style="white-space:nowrap">' + esc(q.s.day) + '</td><td>' + q.e.sets.filter(isHard).map(x => fmtSet(ex, x)).join(', ') + '</td></tr>').join('') + '</tbody></table>' : '<p class="muted">No history for this one yet.</p>' };
    });
  },
  plates(el) {
    const e = findEntry(el.dataset.k), s = e.sets.find(x => !x.done && num(x.w) != null) || e.sets.find(x => num(x.w) != null);
    S.ui.plateW = s ? num(s.w) : S.meta.settings.bar;
    closeSheet();
    openSheet(() => ({ title: 'Plate math', body: '<label class="field"><span>Total weight, lb</span><input type="text" inputmode="decimal" id="pl-w" data-i="plateW" value="' + esc(S.ui.plateW) + '"></label><div id="pl-out">' + platesOut() + '</div>' }));
  },
  skip(el) { const e = findEntry(el.dataset.k); e.skipped = true; closeSheet(true); touchWorkout(true); render(); },
  unskip(el) { const e = findEntry(el.dataset.k); e.skipped = false; closeSheet(true); touchWorkout(true); render(); },
  removeEntry(el) { const w = curWorkout(); w.entries = w.entries.filter(e => e.key !== el.dataset.k); closeSheet(true); touchWorkout(true); render(); },
  addExercise() {
    pickerSheet({
      title: 'Add an exercise',
      onPick(id) {
        const w = curWorkout(), pw = S.ui.mode === 'edit' ? '' : prefillWeight(id, w.dayId);
        w.entries.push({ key: 'e' + (++w.n), ex: id, for: id, pair: '', lo: null, hi: null, wave: false, opt: false, extra: true, skipped: false, note: '', tip: '', alt: [], rest: null, plan: null, sets: [mkSet('', pw, ''), mkSet('', pw, ''), mkSet('', pw, '')] });
        touchWorkout(true); render();
        const el = $('#ex-e' + w.n);
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' });
      }
    });
  },
  addOwed(el) {
    const w = S.active, ex = el.dataset.ex, n = Number(el.dataset.n) || 1;
    let it = null;
    prog().days.forEach(d => d.items.forEach(x => { if (!it && x.ex === ex && !x.wave) it = x; }));
    const pw = prefillWeight(ex, w.dayId), sets = [];
    for (let i = 0; i < n; i++) sets.push(mkSet('', pw, ''));
    w.entries.push({ key: 'e' + (++w.n), ex, for: ex, pair: '', lo: it ? it.lo : null, hi: it ? it.hi : null, wave: false, opt: false, extra: true, skipped: false, note: '', tip: 'Made up from earlier this week.', alt: it ? (it.alt || []).slice() : [], rest: null, plan: null, sets });
    saveActive(true); render();
    toast(exName(ex) + ' added at the end');
  },
  dropOwed(el) { const pos = S.meta.pos; S.meta.dismissed.push(pos.wave + '-' + pos.week + '-' + el.dataset.ex); S.meta.dismissed = S.meta.dismissed.slice(-60); saveMeta(); render(); },
  discard() { confirmSheet('Discard this workout?', 'Everything logged in it is removed. This can\'t be undone.', 'Discard', 'discardNow', true); },
  discardNow() { S.active = null; saveActive(true); stopTimer(); keepAwake(false); S.ui.logger = false; closeSheet(true); render(); toast('Workout discarded'); },
  finish() {
    const w = S.active;
    if (!w.entries.some(e => e.sets.some(x => x.done))) {
      openSheet(() => ({ title: 'Nothing logged yet', body: '<p>No sets are ticked. Keep going, or discard this workout.</p>', foot: '<button class="btn" data-a="closeSheet">Keep going</button><button class="btn btn-danger" data-a="discardNow">Discard</button>' }));
      return;
    }
    const left = e => e.plan - (e.skipped ? 0 : e.sets.filter(x => x.done && isHard(x)).length);
    const missing = w.entries.filter(e => !e.opt && !e.extra && e.plan && left(e) > 0);
    let typed = 0;
    w.entries.forEach(e => { if (!e.skipped) e.sets.forEach(x => { if (!x.done && x.r !== '') typed++; }); });
    let body = missing.length ? '<p>These are short of the plan. They show as owed for the rest of this week.</p><div class="list">' + missing.map(e => '<div><div class="grow"><strong>' + esc(exName(e.ex)) + '</strong><div class="small muted">' + left(e) + ' of ' + e.plan + ' sets not done</div></div></div>').join('') + '</div>' : '<p>Every planned set is done.</p>';
    if (typed) body += '<p class="notice">' + plural(typed, 'set has', 'sets have') + ' reps typed in but no tick. Unticked sets are not saved.</p>';
    openSheet(() => ({ title: 'Finish ' + w.day + '?', body, foot: '<button class="btn" data-a="closeSheet">Keep going</button><button class="btn btn-pri" data-a="finishNow">Finish workout</button>' }));
  },
  finishNow() {
    const w = S.active;
    if (!w) return;
    const s = toSession(w), bw = s.bw || S.meta.bodyweight, prs = [], sugg = [];
    s.entries.forEach(e => {
      const b = bestOfEntry(e, bw);
      if (b && b.v > 0) { const before = bestBefore(e.ex, s.id); if (before > 0 && b.v > before + 0.01) prs.push({ ex: e.ex, v: b.v, before, set: b.s }); }
      if (e.wave) {
        const cur = S.meta.maxes[e.ex], top = e.sets.find(x => x.t === 'T');
        if (cur && top && top.rpe) { const est = Math.floor(e1rm(effW(e.ex, top.w, bw), top.r, top.rpe) / 5) * 5; if (est >= cur * 1.03 || est <= cur * 0.95) sugg.push({ ex: e.ex, cur, est }); }
      }
    });
    saveSession(s);
    S.active = null; saveActive(true);
    const pos = S.meta.pos, p = prog();
    if (s.programId === S.meta.programId && s.wave === pos.wave && pos.week <= weeksIn(p)) S.meta.pos = advanceFrom(pos);
    saveMeta(); stopTimer(); keepAwake(false);
    S.ui.logger = false; S.ui.sheets = [];
    const st = sessionStats(s), np = S.meta.pos;
    openSheet(() => {
      let body = '<div class="big-stat"><div><span class="num">' + st.sets + '</span><span>hard sets</span></div><div><span class="num">' + fmtMins(s.mins) + '</span><span>start to finish</span></div><div><span class="num">' + Math.round(st.lifted / 1000 * 10) / 10 + 'k</span><span>lb moved</span></div></div>';
      if (prs.length) body += '<div><p style="font-weight:600;margin-bottom:6px">New bests</p><div class="list">' + prs.map(r => '<div><div class="grow"><strong>' + esc(exName(r.ex)) + '</strong><div class="small muted">' + fmtSet(r.ex, r.set) + '. Estimated max ' + Math.round(r.v) + ', was ' + Math.round(r.before) + '</div></div><span class="tag pr">Best</span></div>').join('') + '</div></div>';
      if (sugg.length) body += '<div><p style="font-weight:600;margin-bottom:6px">Your max may be off</p><div class="list">' + sugg.map(r => '<div><div class="grow"><strong>' + esc(exName(r.ex)) + '</strong><div class="small muted">The top set points to about ' + r.est + '. The max in use is ' + trimNum(r.cur) + '.</div></div><button class="btn btn-sm" data-a="applyMax" data-ex="' + esc(r.ex) + '" data-v="' + r.est + '">Use ' + r.est + '</button></div>').join('') + '</div></div>';
      body += '<p class="muted">' + (np.week > weeksIn(p) ? 'That finishes the wave. Review your maxes on the Today screen.' : 'Next up: ' + esc(p.days[np.day].name) + ', week ' + np.week + '.') + '</p>';
      if (STANDALONE) { const b = backupInfo(); if (b.due) body += '<div class="spread"><span class="small muted">' + plural(b.since, 'workout') + ' since your last backup.</span><button class="btn btn-sm" data-a="dataSheet">Back up</button></div>'; }
      return { title: s.day + ' saved', body, foot: '<button class="btn" data-a="copySession" data-id="' + esc(s.id) + '">Copy summary</button><button class="btn btn-pri" data-a="closeSheet">Done</button>' };
    });
    render();
  },
  manualTimer() { if (S.timer.endsAt) stopTimer(); else startTimer(S.meta.settings.restSingle, 'Rest'); },
  tAdj(el) { adjustTimer(Number(el.dataset.d)); },
  tStop() { stopTimer(); },

  /* history */
  session(el) {
    const id = el.dataset.id;
    openSheet(() => {
      const s = S.sessions.find(x => x.id === id);
      if (!s) return { title: 'Workout', body: '<p>This workout is no longer here.</p>' };
      const st = sessionStats(s);
      let body = '<p class="small muted">' + fmtDate(s.date) + (s.wave != null ? ', wave ' + s.wave + ' week ' + s.week : '') + '. ' + st.sets + ' hard sets' + (s.mins != null ? ' in ' + fmtMins(s.mins) : '') + '.' + (s.src === 'sheet' ? ' Brought in from your Training Log sheet.' : '') + '</p>';
      if (s.bad) body += '<p class="notice">This workout was brought in from outside the app and its numbers fail their check. Compare it with the Training Log sheet.</p>';
      if (s.note) body += '<p class="notice calm">' + esc(s.note) + '</p>';
      body += '<div>' + s.entries.map(e => '<div class="sess-ex"><h4>' + esc(exName(e.ex)) + (e.for && e.for !== e.ex ? ' <span class="tag">for ' + esc(exName(e.for)) + '</span>' : '') + '</h4><p>' +
        (e.sets.length ? e.sets.map(x => (x.t ? '<span class="tag">' + SET_WORD[x.t] + '</span> ' : '') + fmtSet(e.ex, x)).join(', ') : '<span class="muted">Not done' + (e.plan ? ', ' + plural(e.plan, 'set') + ' planned' : '') + '</span>') + '</p>' +
        (e.note ? '<p class="small muted">Note: ' + esc(e.note) + '</p>' : '') + '</div>').join('') + '</div>';
      return { title: s.day || 'Workout', body, foot: '<button class="btn" data-a="copySession" data-id="' + esc(id) + '">Copy</button><button class="btn" data-a="editSession" data-id="' + esc(id) + '">Edit</button><button class="btn btn-danger" data-a="askDelete" data-id="' + esc(id) + '">Delete</button>' };
    });
  },
  copyActive() { if (S.active) copyText('In progress. ' + sessionText(toSession(S.active)), 'Workout so far copied'); },
  copySession(el) { const s = S.sessions.find(x => x.id === el.dataset.id); if (s) copyText(sessionText(s), 'Workout copied'); },
  editSession(el) {
    const s = S.sessions.find(x => x.id === el.dataset.id);
    if (!s) return;
    S.edit = fromSession(s);
    S.ui.mode = 'edit'; S.ui.logger = true; S.ui.sheets = []; renderSheet(); render();
  },
  saveEdit() {
    const s = toSession(S.edit);
    saveSession(s);
    S.edit = null; S.ui.mode = 'live'; S.ui.logger = false;
    render(); toast('Workout updated');
  },
  askDelete(el) { S.ui.delId = el.dataset.id; confirmSheet('Delete this workout?', 'It is removed from your history and charts. This can\'t be undone.', 'Delete', 'deleteNow', true); },
  deleteNow() { deleteSession(S.ui.delId); closeSheet(true); render(); toast('Workout deleted'); },

  /* program editing */
  editDay(el) { const i = Number(el.dataset.d); S.ui.draft = { i, n: 0, day: clone(prog().days[i]) }; openSheet(dayEditorSheet); },
  diUp(el) { const a = S.ui.draft.day.items, n = Number(el.dataset.n); if (n > 0) { a.splice(n - 1, 0, a.splice(n, 1)[0]); renderSheet(true); } },
  diDown(el) { const a = S.ui.draft.day.items, n = Number(el.dataset.n); if (n < a.length - 1) { a.splice(n + 1, 0, a.splice(n, 1)[0]); renderSheet(true); } },
  diDel(el) { S.ui.draft.day.items.splice(Number(el.dataset.n), 1); renderSheet(true); },
  diEdit(el) { S.ui.draft.n = Number(el.dataset.n); openSheet(itemEditorSheet); },
  diAdd() {
    pickerSheet({ title: 'Add to ' + S.ui.draft.day.name, onPick(id) { const a = S.ui.draft.day.items; a.push({ ex: id, pair: '', sets: 3, lo: 10, hi: 15 }); S.ui.draft.n = a.length - 1; renderSheet(true); openSheet(itemEditorSheet); } });
  },
  iePick() {
    readItemFields();
    pickerSheet({ title: 'Choose the exercise', onPick(id) { S.ui.draft.day.items[S.ui.draft.n].ex = id; renderSheet(true); } });
  },
  ieKind(el) {
    readItemFields();
    const it = S.ui.draft.day.items[S.ui.draft.n];
    if (el.dataset.v === '1') { it.wave = 1; if (it.back == null) it.back = 3; delete it.sets; delete it.lo; delete it.hi; }
    else { delete it.wave; delete it.back; delete it.cap; delete it.rest; it.sets = it.sets || 3; it.lo = it.lo || 8; it.hi = it.hi || 12; }
    renderSheet(true);
  },
  ieDone() { readItemFields(); closeSheet(); },
  saveDay() {
    const dr = S.ui.draft, p = ownProg();
    dr.day.name = (dr.day.name || '').trim() || 'Day ' + (dr.i + 1);
    p.days[dr.i] = dr.day;
    saveProgram(p);
    S.ui.draft = null;
    closeSheet(true); render(); toast('Day saved');
  },

  /* export */
  copyAll() { copyText(S.sessions.slice().reverse().map(sessionText).join('\n\n'), plural(S.sessions.length, 'workout') + ' copied'); },
  dlCsv() {
    const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = ['date,wave,week,day,exercise,set_type,weight_lb,reps,rpe'];
    S.sessions.slice().reverse().forEach(s => s.entries.forEach(e => e.sets.forEach(x => rows.push([s.date, s.wave, s.week, q(s.day), q(exName(e.ex)), SET_WORD[x.t] || 'Work', x.w, x.r, x.rpe == null ? '' : x.rpe].join(',')))));
    saveFile('plates-sets.csv', rows.join('\n'));
  },
  dlJson() {
    saveFile('plates-backup.json', JSON.stringify({ exported: new Date().toISOString(), meta: S.meta, programs: S.programs, sessions: S.sessions.map(s => Object.assign({ id: s.id }, encSession(s))) }, null, 1));
  }
};
function saveFile(filename, data) {
  if (STANDALONE) { saveBlob(filename, data); return; }
  if (!cloud.dl) { toast('Downloads are not available in this view'); return; }
  cloud.dl.save({ filename, data }).then(() => toast('Saved ' + filename), e => { if (!e || e.code !== 'declined') toast('That file could not be saved here'); });
}
function readMaxFields() {
  waveLifts(prog()).forEach(it => {
    const el = $('#mx-' + it.ex);
    if (!el) return;
    const v = parseField(el.value);
    if (v !== '' && v > 0) S.meta.maxes[it.ex] = v; else delete S.meta.maxes[it.ex];
  });
  const b = $('#mx-bw');
  if (b) { const v = parseField(b.value); S.meta.bodyweight = v !== '' && v > 0 ? v : null; }
}
function platesOut() {
  const w = num(S.ui.plateW), barLb = S.meta.settings.bar;
  if (w == null) return '<p class="muted">Enter a weight.</p>';
  return barSvg(w, barLb, false) + '<p class="plates-line" style="margin-top:8px">' + platesLine(w, barLb) + '</p><p class="tiny muted">With a ' + barLb + ' lb bar.</p>';
}

/* ---------- inputs ---------- */
const I = {
  w(el, final) {
    const e = findEntry(el.dataset.k), i = Number(el.dataset.s), s = e && e.sets[i];
    if (!s) return;
    applyWeight(e, i, parseField(el.value));
    for (let j = i + 1; j < e.sets.length; j++) { const f = $('#w-' + e.key + '-' + j); if (f && !e.sets[j].done) f.value = e.sets[j].w; }
    touchWorkout(false);
    if (final) { const z = $('#viz-' + e.key); if (z) z.innerHTML = entryViz(e); paintNext(); }
  },
  r(el) { const e = findEntry(el.dataset.k), s = e && e.sets[Number(el.dataset.s)]; if (s) { s.r = parseField(el.value); touchWorkout(false); } },
  rpe(el) { const e = findEntry(el.dataset.k), s = e && e.sets[Number(el.dataset.s)]; if (s) { s.rpe = parseField(el.value); touchWorkout(false); } },
  editDate(el, final) {
    const w = S.edit, m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(el.value || '');
    if (!final || !w || !m) return;
    w.keepDate = el.value;
    w.startedAt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12).getTime();
  },
  wnote(el) { const w = curWorkout(); if (w) { w.note = el.value; touchWorkout(false); } },
  pickQ(el) { S.ui.pick.q = el.value; const l = $('#pick-list'); if (l) l.innerHTML = pickList(); },
  plateW(el) { S.ui.plateW = parseField(el.value); const o = $('#pl-out'); if (o) o.innerHTML = platesOut(); },
  deName(el) { S.ui.draft.day.name = el.value; },
  deFocus(el) { S.ui.draft.day.focus = el.value; },
  setting(el, final) {
    if (!final) return;
    const k = el.dataset.key, v = parseField(el.value), lim = { bar: [0, 100], cap: [1, 40] }[k] || [10, 900];
    if (v === '') { el.value = S.meta.settings[k]; return; }
    S.meta.settings[k] = Math.max(lim[0], Math.min(lim[1], Math.round(v)));
    el.value = S.meta.settings[k];
    saveMeta();
    if (k === 'bar' || k === 'cap') render();
  },
  sound(el, final) { if (final) { S.meta.settings.sound = el.checked; saveMeta(); } },
  posDay(el, final) { if (final) { S.meta.pos.day = Number(el.value); saveMeta(); render(); } },
  progEx(el, final) { if (final) { S.ui.progEx = el.value; render(); } },
  volKey(el, final) { if (final) { S.ui.volKey = el.value; render(); } }
};

/* ---------- finishing a set ---------- */
function applyWeight(e, i, v) {
  const s = e.sets[i], old = s.w;
  s.w = v;
  for (let j = i + 1; j < e.sets.length; j++) {
    const x = e.sets[j];
    if (!x.done && x.t === s.t && (x.w === '' || x.w === old)) x.w = v;
  }
}
function completeSet(e, i) {
  const w = curWorkout(), s = e.sets[i];
  s.done = true;
  buzz(18);
  touchWorkout(true);
  if (S.ui.mode !== 'edit') {
    const nx = nextSetRef(w), rest = restFor(w, e, s);
    if (nx && rest > 0) startTimer(rest, 'Next: ' + exName(nx.e.ex));
    else if (!nx) { stopTimer(); toast('Last set done. Finish when you are ready.'); }
  }
  render();
  const n = document.querySelector('.set.next');
  if (n && n.scrollIntoView) n.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function setTitle(e, i) {
  const s = e.sets[i], total = e.sets.filter(x => x.t === s.t).length, k = e.sets.slice(0, i + 1).filter(x => x.t === s.t).length;
  if (s.t === 'T') return 'Top set';
  if (s.t === 'W') return 'Warm-up ' + k + ' of ' + total;
  if (s.t === 'B') return 'Back-off ' + k + ' of ' + total;
  if (s.t === 'D') return 'Drop set';
  return 'Set ' + k + ' of ' + total;
}
function setLoadText(e, s) {
  const info = exInfo(e.ex), bwish = info.load === 'bw' || info.load === 'added', w = num(s.w), r = num(s.r);
  let t = w == null ? (bwish ? 'BW' : '') : fmtW(e.ex, w) + (bwish ? '' : ' lb');
  if (r != null) t += (t ? ' × ' : '') + trimNum(r);
  else if (s.tr) t += s.about ? ' for about ' + s.tr : ' × ' + s.tr;
  else if (e.lo && e.hi) t += (t ? ', ' : '') + e.lo + '–' + e.hi + ' reps';
  return t;
}

/* ---------- the bar that always shows the next set ---------- */
function paintNext() {
  const el = $('#nextbar');
  if (!el) return;
  const w = S.active, on = S.loaded && S.meta && S.ui.logger && S.ui.mode !== 'edit' && w;
  if (!on) { el.hidden = true; return; }
  const nx = nextSetRef(w), b = $('#nx-btn');
  el.hidden = false;
  if (!nx) {
    $('#nx-ex').textContent = 'All sets done';
    $('#nx-sub').textContent = plural(workoutCounts(w).done, 'hard set') + ' logged';
    b.textContent = 'Finish'; b.dataset.a = 'finish';
    return;
  }
  $('#nx-ex').textContent = (nx.e.pair ? nx.e.pair + '  ' : '') + exName(nx.e.ex);
  $('#nx-sub').textContent = setTitle(nx.e, nx.i) + ', ' + setLoadText(nx.e, nx.e.sets[nx.i]);
  b.textContent = 'Log set'; b.dataset.a = 'logNext';
}
function paintDock() { paintNext(); paintTimer(); }

/* ---------- two-tap logging ---------- */
/* The matching set from the session this exercise is compared against. Wave lifts change load each week, so they use the plan instead. */
function quickLast(e, i) {
  const w = curWorkout(), s = e.sets[i];
  if (S.ui.mode === 'edit' || e.wave) return null;
  const rf = refFor(e.ex, w.dayId);
  if (!rf.ref) return null;
  const same = rf.ref.e.sets.filter(x => x.t === s.t), cur = num(s.w);
  const atW = cur == null ? [] : same.filter(x => x.w === cur);
  if (atW.length) {   // same weight as today: compare like with like
    const posW = e.sets.slice(0, i + 1).filter(x => x.t === s.t && num(x.w) === cur).length - 1;
    return atW[Math.min(posW, atW.length - 1)];
  }
  const pos = e.sets.slice(0, i + 1).filter(x => x.t === s.t).length - 1;
  if (same[pos]) return same[pos];
  if (!isHard(s)) return null;
  const ww = workingWeight(rf.ref.e);
  return rf.ref.e.sets.find(x => isHard(x) && x.w === ww) || null;
}
function openQuick(key, i) {
  const e = findEntry(key), s = e && e.sets[i];
  if (!s) return;
  const preset = (!e.wave && isHard(s) && S.ui.mode !== 'edit' && S.meta.settings.quickRpe) ? S.meta.settings.quickRpe : '';
  S.ui.quick = { key, i, rpe: s.rpe !== '' ? s.rpe : preset };
  openSheet(quickSheet);
}
function quickSheet() {
  const q = S.ui.quick, e = findEntry(q.key), s = e && e.sets[q.i];
  if (!s) return { title: 'Set', body: '' };
  const info = exInfo(e.ex), last = quickLast(e, q.i), bwish = info.load === 'bw' || info.load === 'added';
  const lo = s.tr || e.lo || 8, hi = s.tr || e.hi || 12, exp = last ? last.r : (s.tr || Math.round((lo + hi) / 2));
  const mark = last ? last.r : (s.tr || null);
  const start = Math.max(1, Math.min(lo, exp) - 4);
  let n = Math.max(hi, exp) + 4 - start + 1;
  n = Math.max(12, Math.min(30, Math.ceil(n / 6) * 6));
  let grid = '';
  for (let v = start; v < start + n; v++) grid += '<button class="rp' + (v >= lo && v <= hi ? ' in' : '') + (v === mark ? ' last' : '') + '" data-a="qkReps" data-v="' + v + '"' + (v === mark ? ' aria-label="' + v + (last ? ', same as last time' : ', the plan') + '"' : '') + '>' + v + '</button>';
  let ctx = setTitle(e, q.i) + '. ';
  if (last) ctx += 'Last time ' + fmtW(e.ex, last.w) + ' × ' + trimNum(last.r) + ', shown in yellow.';
  else if (s.tr) ctx += (s.about ? 'Aim for about ' + s.tr : 'The plan is ' + s.tr) + ', shown in yellow.';
  else if (e.lo && e.hi) ctx += 'Range ' + e.lo + ' to ' + e.hi + '.';
  const wv = (bwish && Number(s.w) === 0) ? '' : s.w;
  const body = '<p class="small muted">' + esc(ctx) + '</p>' +
    '<div class="qrow"><span class="qlab">' + (info.load === 'added' ? 'Added weight, lb' : info.load === 'db' ? 'Weight, lb each hand' : 'Weight, lb') + '</span><div class="wrow">' +
    '<button class="btn" data-a="qkStep" data-d="-1" aria-label="Less weight">−</button>' +
    '<input class="in" id="qk-w" type="text" inputmode="decimal" autocomplete="off" aria-label="Weight" placeholder="' + (bwish ? 'BW' : 'lb') + '" value="' + esc(wv) + '" data-i="quickW">' +
    '<button class="btn" data-a="qkStep" data-d="1" aria-label="More weight">+</button></div></div>' +
    '<div class="qrow"><span class="qlab">RPE</span><div class="rchips">' + [7, 7.5, 8, 8.5, 9, 9.5, 10].map(v => '<button class="rchip" data-a="qkRpe" data-v="' + v + '" aria-pressed="' + (q.rpe !== '' && Number(q.rpe) === v) + '">' + v + '</button>').join('') + '</div></div>' +
    '<div class="qrow"><span class="qlab">Reps. Tap the number to log the set.</span><div class="rgrid">' + grid + '</div></div>';
  return { title: info.n, body };
}
A.logNext = function () {
  const w = S.active, nx = w && nextSetRef(w);
  if (!nx) return;
  const s = nx.e.sets[nx.i];
  if (s.t === 'W' && s.r !== '' && (s.w !== '' || exInfo(nx.e.ex).load === 'bw' || exInfo(nx.e.ex).load === 'added')) {
    if (s.w === '') s.w = 0;
    const said = setTitle(nx.e, nx.i) + ' done';
    completeSet(nx.e, nx.i);
    toast(said);
  } else openQuick(nx.e.key, nx.i);
};
A.qkStep = function (el) {
  const q = S.ui.quick, e = findEntry(q.key), s = e && e.sets[q.i];
  if (!s) return;
  const info = exInfo(e.ex), cur = num(s.w) || 0;
  const step = (info.load === 'db' || info.load === 'stack') && Math.abs(cur) < 30 ? 2.5 : 5;
  const v = Math.round((cur + step * Number(el.dataset.d)) * 100) / 100;
  applyWeight(e, q.i, v);
  touchWorkout(false);
  const f = $('#qk-w');
  if (f) f.value = ((info.load === 'bw' || info.load === 'added') && v === 0) ? '' : v;
};
A.qkRpe = function (el) {
  const q = S.ui.quick, v = Number(el.dataset.v);
  q.rpe = (q.rpe !== '' && Number(q.rpe) === v) ? '' : v;
  document.querySelectorAll('.rchip').forEach(b => b.setAttribute('aria-pressed', String(q.rpe !== '' && Number(b.dataset.v) === Number(q.rpe))));
};
A.qkReps = function (el) {
  const q = S.ui.quick, e = findEntry(q.key), s = e && e.sets[q.i];
  if (!s) return;
  if (s.w === '') {
    const L = exInfo(e.ex).load;
    if (L === 'bw' || L === 'added') applyWeight(e, q.i, 0);
    else { toast('Set the weight first'); const f = $('#qk-w'); if (f) f.focus(); return; }
  }
  s.r = Number(el.dataset.v);
  s.rpe = q.rpe === '' ? '' : Number(q.rpe);
  closeSheet(true);
  completeSet(e, q.i);
};
I.quickW = function (el) {
  const q = S.ui.quick, e = findEntry(q.key);
  if (!e || !e.sets[q.i]) return;
  applyWeight(e, q.i, parseField(el.value));
  touchWorkout(false);
};

/* ---------- set types ---------- */
A.setType = function (el) {
  const e = findEntry(el.dataset.k), s = e && e.sets[Number(el.dataset.s)];
  if (!s || s.t === 'T' || s.t === 'B' || (e.wave && s.t === 'W' && s.tw != null)) return;
  s.t = s.t === '' ? 'W' : s.t === 'W' ? 'D' : '';
  touchWorkout(true); render();
  toast(s.t === 'W' ? 'Warm-up: not counted as a hard set' : s.t === 'D' ? 'Drop set: not counted as a hard set' : 'Back to a normal set');
};
A.addDrop = function (el) {
  const e = findEntry(el.dataset.k);
  if (!e) return;
  let at = -1;
  e.sets.forEach((x, j) => { if (x.done) at = j; });
  e.sets.splice(at >= 0 ? at + 1 : e.sets.length, 0, mkSet('D', '', ''));
  touchWorkout(true); render();
};

/* ---------- calls the session guide makes after set 1 ---------- */
function canBonus(w, e) {
  const pr = prog().priority || [], m = exInfo(e.ex).m || {}, cap = S.meta.settings.cap, v = workoutVolume(w).plan;
  const mine = Object.keys(m).filter(x => pr.includes(x) && m[x] >= 1);
  return mine.length > 0 && mine.every(x => (v[x] || 0) + 1 <= cap);
}
function verdictHtml(w, e) {
  if (S.ui.mode === 'edit' || e.skipped) return '';
  const k = ' data-k="' + e.key + '"';
  if (e.wave) {
    const top = e.sets.find(x => x.t === 'T'), left = e.sets.filter(x => x.t === 'B' && !x.done).length, max = S.meta.maxes[e.ex];
    if (!top || !top.done || !left || !max || !(num(top.rpe) >= 9.5)) return '';
    const bw = w.bw || S.meta.bodyweight;
    return '<p class="verdict down">That top set was a grind. If you are under-recovered, swap the back-offs for 3 to 5 fast sets of 1 to 5 reps at ' + fmtW(e.ex, waveLoad(e.ex, 60, max, bw).w) + ' to ' + fmtW(e.ex, waveLoad(e.ex, 70, max, bw).w) + '.</p>';
  }
  const hard = e.sets.filter(isHard), first = hard[0];
  if (!first || !first.done) return '';
  const rf = refFor(e.ex, w.dayId);
  if (!rf.ref) return '';
  const ww = workingWeight(rf.ref.e), old = rf.ref.e.sets.find(x => isHard(x) && x.w === ww) || rf.ref.e.sets.find(isHard);
  const cw = num(first.w) || 0, cr = num(first.r) || 0, left = hard.filter(x => !x.done).length;
  if (!old || cw !== old.w) return '';
  if (cr > old.r) {
    let h = '<p class="verdict up">Set 1 beat last time: ' + trimNum(cr) + ' reps against ' + trimNum(old.r) + ' at ' + fmtW(e.ex, cw) + '.';
    if (!e.bonus && canBonus(w, e)) h += ' This is priority work and the muscle is still under ' + S.meta.settings.cap + ' sets today, so a set can go on. <button class="linkish" data-a="bonusSet"' + k + '>Add a set</button>';
    return h + '</p>';
  }
  if (cr < old.r && left > 0 && !e.cut) {
    return '<p class="verdict down">Set 1 came in under last time: ' + trimNum(cr) + ' reps against ' + trimNum(old.r) + ' at ' + fmtW(e.ex, cw) + '. If recovery is the likely cause, drop the remaining sets. If the order or setup changed, carry on. <button class="linkish" data-a="cutRest"' + k + '>Drop the rest</button></p>';
  }
  return '';
}
A.bonusSet = function (el) {
  const e = findEntry(el.dataset.k);
  if (!e) return;
  const first = e.sets.find(isHard);
  e.sets.push(mkSet('', first ? first.w : '', ''));
  e.bonus = true;
  touchWorkout(true); render();
};
A.cutRest = function (el) {
  const e = findEntry(el.dataset.k);
  if (!e) return;
  e.sets = e.sets.filter(x => x.done);
  e.plan = e.sets.filter(isHard).length;
  e.cut = true;
  touchWorkout(true); render();
  toast('Remaining sets dropped for today');
};

/* ---------- order ---------- */
A.later = function (el) {
  const w = S.active, g = w && groupsOf(w).find(x => x.entries.some(e => e.key === el.dataset.k));
  if (!g) return;
  w.entries = w.entries.filter(e => !g.entries.includes(e)).concat(g.entries);
  closeSheet(true);
  saveActive(true); render();
  toast((g.entries.length > 1 ? 'Pair ' + g.letter : exName(g.entries[0].ex)) + ' moved to the end');
};

/* ---------- keep the screen awake while a workout is open ---------- */
let wakeLock = null, wakeState = '';
function keepAwake(on) {
  if (!on) {
    try { if (wakeLock) wakeLock.release(); } catch (e) { /* already released */ }
    wakeLock = null;
    return;
  }
  if (wakeLock || !S.meta || !S.meta.settings.awake) return;
  try {
    if (!navigator.wakeLock || !navigator.wakeLock.request) { wakeState = 'no'; return; }
    navigator.wakeLock.request('screen').then(l => {
      wakeLock = l; wakeState = 'on';
      l.addEventListener('release', () => { if (wakeLock === l) wakeLock = null; });
    }, () => { wakeState = 'no'; wakeLock = null; });
  } catch (e) { wakeState = 'no'; wakeLock = null; }
}
I.awake = function (el, final) {
  if (!final) return;
  S.meta.settings.awake = el.checked;
  saveMeta();
  keepAwake(el.checked && S.ui.logger && S.ui.mode !== 'edit' && !!S.active);
};
I.quickRpe = function (el, final) {
  if (!final) return;
  S.meta.settings.quickRpe = Number(el.value) || 0;
  saveMeta();
};

/* ---------- small helpers for the gym floor ---------- */
A.addWarm = function (el) {
  const e = findEntry(el.dataset.k);
  if (!e) return;
  const first = e.sets.find(isHard), w = first ? num(first.w) : null;
  let half = '';
  if (w != null && w > 0) { const step = w / 2 < 30 ? 2.5 : 5; half = Math.round(w / 2 / step) * step; }
  e.sets.unshift(mkSet('W', half, 12, { tw: half, tr: 12 }));
  touchWorkout(true); render();
};
A.gotTips = function () { S.meta.seenTips = true; saveMeta(); render(); };
A.markDone = function (el) {
  const p = prog(), k = Number(el.dataset.w), d = p.days[Number(el.dataset.d)], now = Date.now(), pos = S.meta.pos;
  saveSession({
    id: stamp(now) + '-' + d.id + '-x', ts: now, date: todayStr(), mins: null, programId: p.id, program: p.name, wave: pos.wave, week: k,
    dayId: d.id, day: d.name, note: 'Done outside Plates and not logged here.', bw: null, src: 'stub', entries: []
  });
  if (pos.week <= weeksIn(p)) S.meta.pos = advanceFrom(pos);
  saveMeta();
  closeSheet(true); render();
  toast(d.name + ', week ' + k + ' marked done');
};

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

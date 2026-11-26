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

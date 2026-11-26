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

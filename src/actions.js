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

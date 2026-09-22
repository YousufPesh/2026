'use strict';
const $ = id => document.getElementById(id);
const announce = m => { $('live').textContent = m; };
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

/* ================= presenter notes ================= */
$('notes-on').addEventListener('change', e => {
  document.querySelectorAll('.pnote').forEach(p => { p.hidden = !e.target.checked; });
});

/* ================= 01 · architecture stack ================= */
const LAYERS = [
  { key: 'people', name: 'People', tag: 'one interface', chips: ['Students', 'Faculty', 'Advisors', 'Staff', 'Leadership'] },
  { key: 'campusmind', name: 'CampusMind', tag: '3,000+ connectors', chips: ['Recruitment', 'Retention', 'Student success', 'AI Studio', 'Marketplace'] },
  { boundary: 'No institutional data crosses this line' },
  { key: 'agents', name: 'Fabric data agents', tag: 'read only', chips: ['Housing', 'Finance', 'Academic', 'Advising', 'Enrollment'] },
  { key: 'fabriciq', name: 'Fabric IQ', tag: 'preview', core: true, chips: ['Ontology', 'Semantic models', 'Certified metrics'] },
  { key: 'onelake', name: 'OneLake', tag: 'you own this', chips: ['raw → cleaned → certified', 'Full lineage', 'Open Delta'] },
  { key: 'sources', name: 'Source systems', tag: 'nothing replaced', chips: ['SIS', 'LMS', 'CRM', 'Finance', 'Housing', 'Advising'] }
];
const stack = $('stack');
LAYERS.forEach((L, i) => {
  if (L.boundary) {
    const b = document.createElement('div');
    b.className = 'boundary';
    b.textContent = L.boundary;
    stack.appendChild(b);
    return;
  }
  if (i > 0 && !LAYERS[i - 1].boundary) {
    const f = document.createElement('div');
    f.className = 'flow-mark';
    f.setAttribute('aria-hidden', 'true');
    f.innerHTML = '<span class="flow-down">↓</span><span class="flow-up">↑</span>';
    stack.appendChild(f);
  }
  const d = document.createElement('div');
  d.className = 'layer' + (L.core ? ' is-core' : '');
  d.dataset.layer = L.key;
  d.innerHTML = '<span class="layer-rail"></span>' +
    '<span class="layer-head"><span class="layer-name"></span><span class="layer-tag"></span></span>' +
    '<span class="layer-chips"></span>';
  d.querySelector('.layer-name').textContent = L.name;
  d.querySelector('.layer-tag').textContent = L.tag;
  d.querySelector('.layer-chips').innerHTML = L.chips.map(c => `<span>${c}</span>`).join('');
  stack.appendChild(d);
});
const spine = document.createElement('div');
spine.className = 'spine';
spine.textContent = 'Entra identity · row & column security · Purview · audit trail';
stack.appendChild(spine);

const TRACE = [
  ['[data-layer=people]', 'down', 'An advisor asks.'],
  ['[data-layer=campusmind]', 'down', 'Routed by role.'],
  ['.boundary', 'down', 'The question crosses. Data never crosses back.'],
  ['[data-layer=agents]', 'down', 'Read-only query, run as that person.'],
  ['[data-layer=fabriciq]', 'down', 'Words resolved. Number certified.'],
  ['[data-layer=onelake]', 'down', 'One governed copy.'],
  ['[data-layer=sources]', 'down', 'Nothing was replaced.'],
  ['[data-layer=fabriciq]', 'up', 'Only the answer comes back.'],
  ['[data-layer=campusmind]', 'up', 'Same permissions.'],
  ['[data-layer=people]', 'up', 'An answer no single system could give.']
];
let tTimer = null, tStep = 0;
const playBtn = $('trace-play'), cap = $('trace-caption');
function clearMarks() {
  document.querySelectorAll('.is-lit,.is-answer').forEach(e => e.classList.remove('is-lit', 'is-answer'));
  document.querySelectorAll('.flow-down,.flow-up').forEach(e => e.classList.remove('is-on'));
}
function stepTrace() {
  clearMarks();
  const [sel, dir, text] = TRACE[tStep];
  const node = document.querySelector(sel);
  if (node) node.classList.add(dir === 'down' ? 'is-lit' : 'is-answer');
  document.querySelectorAll(dir === 'down' ? '.flow-down' : '.flow-up').forEach(f => f.classList.add('is-on'));
  cap.textContent = text;
  tStep++;
  if (tStep < TRACE.length) {
    tTimer = setTimeout(stepTrace, REDUCED ? 2400 : 1400);
  } else {
    tTimer = setTimeout(() => {
      clearMarks();
      cap.textContent = '';
      playBtn.disabled = false;
      playBtn.textContent = '▶ Trace again';
    }, 2600);
  }
}
playBtn.addEventListener('click', () => {
  if (tTimer) clearTimeout(tTimer);
  clearMarks();
  tStep = 0;
  playBtn.disabled = true;
  playBtn.textContent = 'Tracing…';
  stepTrace();
});

/* ================= 02 · connection networks ================= */
const SRC = 13;
function drawDirect(u) {
  const svg = $('net-direct');
  svg.textContent = '';
  const srcY = i => 14 + i * (212 / (SRC - 1));
  const useY = i => u === 1 ? 120 : 14 + i * (212 / (u - 1));
  const g = el('g', {});
  for (let s = 0; s < SRC; s++) for (let k = 0; k < u; k++)
    g.appendChild(el('line', { x1: 22, y1: srcY(s), x2: 178, y2: useY(k), class: 'net-line' }));
  svg.appendChild(g);
  for (let s = 0; s < SRC; s++) svg.appendChild(el('circle', { cx: 22, cy: srcY(s), r: 4, class: 'net-src' }));
  for (let k = 0; k < u; k++) svg.appendChild(el('circle', { cx: 178, cy: useY(k), r: 4, class: 'net-use' }));
}
function drawLayer(u) {
  const svg = $('net-layer');
  svg.textContent = '';
  const srcY = i => 14 + i * (212 / (SRC - 1));
  const useY = i => u === 1 ? 120 : 14 + i * (212 / (u - 1));
  for (let s = 0; s < SRC; s++) svg.appendChild(el('line', { x1: 22, y1: srcY(s), x2: 100, y2: 120, class: 'net-line-hub' }));
  for (let k = 0; k < u; k++) svg.appendChild(el('line', { x1: 100, y1: 120, x2: 178, y2: useY(k), class: 'net-line-hub' }));
  for (let s = 0; s < SRC; s++) svg.appendChild(el('circle', { cx: 22, cy: srcY(s), r: 4, class: 'net-src' }));
  for (let k = 0; k < u; k++) svg.appendChild(el('circle', { cx: 178, cy: useY(k), r: 4, class: 'net-use' }));
  svg.appendChild(el('rect', { x: 88, y: 100, width: 24, height: 40, rx: 5, class: 'net-hub' }));
}
function renderNets() {
  const u = Number($('usecases').value);
  const direct = SRC * u, layered = SRC + u;
  $('usecases-value').textContent = u;
  $('net-direct-n').textContent = direct.toLocaleString();
  $('net-layer-n').textContent = layered.toLocaleString();
  $('net-direct-card').classList.toggle('is-heavy', direct > layered);
  drawDirect(u);
  drawLayer(u);
  announce(`${u} use cases. ${direct} point-to-point connections against ${layered} through one layer.`);
}
$('usecases').addEventListener('input', renderNets);

/* ================= 03 · the systems ================= */
const SYSTEMS = ['Student information', 'Learning management', 'Student financials', 'Financial aid', 'Student success', 'Admissions CRM', 'Housing', 'Engagement', 'Career services', 'Accessibility', 'International', 'Facilities & IT', 'Advancement'];
$('sys-field').innerHTML = SYSTEMS.map(s => `<div class="sys-tile">${s}</div>`).join('');
document.querySelectorAll('[data-sysview]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-sysview]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  const linked = b.dataset.sysview === 'layer';
  $('sys-field').classList.toggle('is-linked', linked);
  $('sys-bar').hidden = !linked;
  $('sys-caption').textContent = linked
    ? 'One definition of a student · permissions applied once'
    : 'Thirteen contracts · thirteen logins · thirteen definitions of a student';
  announce($('sys-caption').textContent);
}));

/* ================= dot grid helper ================= */
function buildDots(node, total) {
  node.textContent = '';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < total; i++) frag.appendChild(document.createElement('span'));
  node.appendChild(frag);
  return [...node.children];
}

/* ================= 04 · rows vs people ================= */
const EX = {
  events: {
    total: 1200, raw: '1,200', rawCap: 'rows in the table', onto: '398', ontoCap: 'actual students',
    pathA: {
      label: 'ASK THE SOURCE SYSTEM',
      q: 'How many event registrations do we have?',
      chain: [{ n: 'Engagement platform', sub: 'event_registrations' }],
      answer: '1,200', unit: 'rows returned',
      verdict: 'One table. It cannot tell a student from a staff member.'
    },
    pathB: {
      label: 'ASK THE ONTOLOGY',
      q: 'How many students actually attended?',
      chain: [
        { iq: true, n: 'Fabric IQ', sub: 'attendee_type = Student' },
        { split: [{ n: 'Engagement platform', sub: 'who registered' }, { n: 'Student information system', sub: 'who is a student' }] },
        { join: true, n: 'Joined, then filtered', sub: 'registrations → students' }
      ],
      answer: '398', unit: 'students', good: true,
      verdict: 'Two systems. One definition. One answer.'
    },
    steps: [
      { n: 601, cls: 'd-grey', label: '601 faculty & staff' },
      { n: 201, cls: 'd-hollow', label: '201 never showed up' }
    ],
    legend: [['', 'attended'], ['d-grey', 'faculty & staff'], ['d-hollow', 'no-show']],
    rel: '<code>Event Registration</code> → <code>Student</code> only when <code>attendee_type</code> is Student.'
  },
  housing: {
    total: 148, raw: '148', rawCap: 'assignment records', onto: '115', ontoCap: 'people living there',
    pathA: {
      label: 'ASK THE SOURCE SYSTEM',
      q: 'How many housing assignments in Kestrel Hall?',
      chain: [{ n: 'Housing system', sub: 'housing_assignments' }],
      answer: '148', unit: 'records returned',
      verdict: 'One table. A record is not a person in a bed.'
    },
    pathB: {
      label: 'ASK THE ONTOLOGY',
      q: 'How many students currently reside in Kestrel Hall?',
      chain: [
        { iq: true, n: 'Fabric IQ', sub: 'resides_in, not has_assignment_in' },
        { split: [{ n: 'Housing system', sub: 'checked in, not out' }, { n: 'Student information system', sub: 'still enrolled' }] },
        { join: true, n: 'One relationship applied', sub: 'current residents only' }
      ],
      answer: '115', unit: 'people', good: true,
      verdict: 'Same system. Two relationships. The ontology names which one you meant.'
    },
    steps: [
      { n: 15, cls: 'd-grey', label: '15 never checked in' },
      { n: 11, cls: 'd-hollow', label: '11 checked out' },
      { n: 7, cls: 'd-gold', label: '7 duplicate records' }
    ],
    legend: [['', 'resides_in'], ['d-grey', 'never checked in'], ['d-hollow', 'checked out'], ['d-gold', 'duplicate record']],
    rel: '<code>resides_in</code> vs <code>has_assignment_in</code> — two relationships, two correct numbers.'
  }
};
/* --- routing: where each number came from --- */
const MSG = '<span class="pmsg" aria-hidden="true">✉</span>';
function pathNode(cfg) {
  const d = document.createElement('div');
  d.className = 'pnode' + (cfg.iq ? ' is-iq' : '') + (cfg.join ? ' is-join' : '');
  d.innerHTML = '<span class="pn-name"></span><span class="pn-sub"></span>' + MSG;
  d.querySelector('.pn-name').textContent = cfg.n;
  d.querySelector('.pn-sub').textContent = cfg.sub || '';
  return d;
}
function wire() {
  const w = document.createElement('div');
  w.className = 'pwire';
  w.setAttribute('aria-hidden', 'true');
  w.textContent = '↓';
  return w;
}
function buildPath(p) {
  const box = document.createElement('div');
  box.className = 'path' + (p.good ? ' is-good' : '');
  const head = document.createElement('div');
  head.className = 'path-head';
  head.innerHTML = '<span class="path-label"></span><strong class="path-answer">—</strong>';
  head.querySelector('.path-label').textContent = p.label;
  box.appendChild(head);

  const ask = document.createElement('div');
  ask.className = 'pnode is-ask';
  ask.innerHTML = '<span class="pn-name"></span>' + MSG;
  ask.querySelector('.pn-name').textContent = '“' + p.q + '”';
  box.appendChild(ask);

  p.chain.forEach(step => {
    box.appendChild(wire());
    if (step.split) {
      const g = document.createElement('div');
      g.className = 'psplit';
      step.split.forEach(s => g.appendChild(pathNode(s)));
      box.appendChild(g);
    } else {
      box.appendChild(pathNode(step));
    }
  });

  const back = document.createElement('div');
  back.className = 'pwire is-back';
  back.setAttribute('aria-hidden', 'true');
  back.textContent = '↑';
  box.appendChild(back);

  const out = document.createElement('div');
  out.className = 'pout';
  out.innerHTML = '<strong></strong><span></span>';
  out.querySelector('strong').textContent = p.answer;
  out.querySelector('span').textContent = p.unit;
  box.appendChild(out);

  const v = document.createElement('p');
  v.className = 'path-verdict';
  v.textContent = p.verdict;
  box.appendChild(v);
  return box;
}
function renderPaths(e) {
  const wrap = $('paths');
  wrap.innerHTML = '';
  wrap.appendChild(buildPath(e.pathA));
  wrap.appendChild(buildPath(e.pathB));
  wrap.querySelectorAll('.path-answer').forEach(a => { a.textContent = '—'; });
}
let pTimer = null;
function stopPaths() {
  if (pTimer) { clearTimeout(pTimer); pTimer = null; }
  document.querySelectorAll('.pnode,.pwire,.pout').forEach(n => n.classList.remove('is-on', 'is-done'));
}
function playPaths() {
  stopPaths();
  const btn = $('paths-play');
  btn.disabled = true;
  btn.textContent = 'Asking…';
  const boxes = [...document.querySelectorAll('.path')];
  let bi = 0;
  const runBox = () => {
    if (bi >= boxes.length) {
      btn.disabled = false;
      btn.textContent = '▶ Ask again';
      return;
    }
    const box = boxes[bi];
    const seq = [...box.querySelectorAll('.pnode,.pwire,.pout')];
    const answerEl = box.querySelector('.path-answer');
    const outEl = box.querySelector('.pout strong');
    let si = 0;
    const step = () => {
      if (si > 0) seq[si - 1].classList.add('is-done');
      if (si >= seq.length) {
        seq.forEach(n => n.classList.remove('is-on'));
        answerEl.textContent = outEl.textContent;
        announce(box.querySelector('.path-verdict').textContent);
        bi++;
        pTimer = setTimeout(runBox, REDUCED ? 1800 : 900);
        return;
      }
      seq.forEach(n => n.classList.remove('is-on'));
      seq[si].classList.add('is-on');
      si++;
      pTimer = setTimeout(step, REDUCED ? 1500 : 780);
    };
    step();
  };
  runBox();
}
$('paths-play').addEventListener('click', playPaths);

let exKey = 'events', dotCells = [], dTimer = null;
function renderExample(key) {
  exKey = key;
  const e = EX[key];
  if (dTimer) clearTimeout(dTimer);
  stopPaths();
  renderPaths(e);
  $('paths-play').disabled = false;
  $('paths-play').textContent = '▶ Ask both';
  $('raw-value').textContent = e.raw;
  $('raw-caption').textContent = e.rawCap;
  $('onto-value').textContent = e.onto;
  $('onto-caption').textContent = e.ontoCap;
  $('relationship-text').innerHTML = e.rel;
  $('dot-legend').innerHTML = e.legend.map(l => `<span><i class="${l[0]}" style="${l[0] ? '' : 'background:#087985'}"></i>${l[1]}</span>`).join('');
  dotCells = buildDots($('dots'), e.total);
  $('dots-alt').textContent = `${e.raw} ${e.rawCap}, of which ${e.onto} are ${e.ontoCap}.`;
  $('dots-play').disabled = false;
  $('dots-play').textContent = '▶ Show the gap';
  announce(`${e.raw} ${e.rawCap} against ${e.onto} ${e.ontoCap}.`);
}
$('dots-play').addEventListener('click', () => {
  const e = EX[exKey];
  dotCells.forEach(c => { c.className = ''; });
  $('raw-value').textContent = e.raw;
  $('raw-caption').textContent = e.rawCap;
  $('dots-play').disabled = true;
  let cursor = e.total, si = 0;
  const run = () => {
    if (si >= e.steps.length) {
      $('dots-play').disabled = false;
      $('dots-play').textContent = '▶ Again';
      return;
    }
    const s = e.steps[si];
    for (let i = cursor - s.n; i < cursor; i++) dotCells[i].className = s.cls;
    cursor -= s.n;
    $('raw-value').textContent = cursor.toLocaleString();
    $('raw-caption').textContent = 'minus ' + s.label;
    announce(s.label);
    si++;
    dTimer = setTimeout(run, REDUCED ? 2200 : 1300);
  };
  dTimer = setTimeout(run, 400);
});
document.querySelectorAll('[data-example]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-example]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  renderExample(b.dataset.example);
}));

/* ================= 05 + 07 · questions ================= */
const THREADS = {
  opener: [
    { step: 'ASK FIRST', q: 'How many campus event registrations do we have on record?', expect: '1,200' },
    { step: 'THEN ASK', q: 'How many students actually attended a campus event this term?', expect: '398' }
  ],
  finance: [
    { step: 'BEAT 1 · ~2 MIN', q: 'Which students are within one term of a degree but will be stopped from registering, and what is actually stopping each one?', expect: '25 students, named' },
    { step: 'BEAT 2 · EXPECT A REFUSAL', q: 'Which of those students were flagged, assigned to someone, and never actually reached?', expect: 'It declines' },
    { step: 'BEAT 3', q: 'How many of those 25 students have a financial aid advising case?', expect: 'Zero' },
    { step: 'BEAT 4', q: 'Have those 25 students made any payments this term, do they have financial aid on file, and what would it cost to clear all of their balances?', expect: '$80,500' }
  ],
  housing: [
    { step: 'BEAT 1', q: 'How many students currently reside in Kestrel Hall, and how many hold a housing assignment record there?', expect: '115 vs 148' },
    { step: 'BEAT 2', q: 'If Kestrel Hall goes offline for renovation in Fall 2027, how many current residents would need rehousing?', expect: '92, not 115' },
    { step: 'BEAT 3', q: 'For each accommodation requirement held by Kestrel residents, how many suitable vacant beds exist in the other halls?', expect: '−4 accessible beds' }
  ]
};
const STUDENT_Q = [
  { step: 'AS THE STUDENT', q: 'Do I have a financial hold on my student account for Fall 2026, and what is my balance?', expect: '$4,800 · hold' },
  { step: 'THEN', q: 'What financial aid do I have on file for Fall 2026, and what is its status?', expect: '$15,000 pending' },
  { step: 'THEN', q: 'Show me everything I have going on this term: my courses, my housing, my meal plan, my clubs, and anything open with my advisor.', expect: '6 systems, 1 answer' }
];
function qcard(item) {
  const n = document.createElement('article');
  n.className = 'qcard';
  n.innerHTML = '<div class="qcard-top"><span class="qcard-step"></span><button class="copy" type="button">Copy</button></div><p class="qcard-q"></p><span class="qcard-expect"></span>';
  n.querySelector('.qcard-step').textContent = item.step;
  n.querySelector('.qcard-q').textContent = '“' + item.q + '”';
  n.querySelector('.qcard-expect').textContent = item.expect;
  n.querySelector('.copy').dataset.copy = item.q;
  return n;
}
function renderThread(key) {
  const w = $('thread-questions');
  w.innerHTML = '';
  THREADS[key].forEach(i => w.appendChild(qcard(i)));
  announce(`${THREADS[key].length} questions ready.`);
}
document.querySelectorAll('[data-thread]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-thread]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  renderThread(b.dataset.thread);
}));
STUDENT_Q.forEach(i => $('student-questions').appendChild(qcard(i)));

/* ================= 06 · who sees what ================= */
const ROLES = {
  student: { n: 1, label: 'row reachable of 1,000', note: 'Their own record. Nothing else exists.' },
  advisor: { n: 118, label: 'rows reachable of 1,000', note: 'Their caseload. Not the institution.' },
  provost: { n: 1000, label: 'rows reachable of 1,000', note: 'Full cohort. Still read only.' }
};
const rlsCells = buildDots($('rls-dots'), 1000);
function renderRole(key) {
  const r = ROLES[key];
  rlsCells.forEach((c, i) => { c.className = i < r.n ? '' : 'd-off'; });
  $('rls-count').textContent = r.n.toLocaleString();
  $('rls-label').textContent = r.label;
  $('rls-note').textContent = r.note;
  $('rls-alt').textContent = `${r.n} of 1,000 student rows reachable. ${r.note}`;
  announce(`${r.n} of 1,000 rows reachable. ${r.note}`);
}
document.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-role]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  renderRole(b.dataset.role);
}));

/* ================= copy ================= */
function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    return true;
  } catch (e) { return false; }
}
document.addEventListener('click', ev => {
  const btn = ev.target.closest('.copy');
  if (!btn) return;
  const text = btn.dataset.copy || '';
  const done = () => {
    btn.textContent = 'Copied';
    btn.setAttribute('data-done', '');
    announce('Copied.');
    setTimeout(() => { btn.textContent = 'Copy'; btn.removeAttribute('data-done'); }, 1500);
  };
  const fail = () => { btn.textContent = 'Select it'; setTimeout(() => { btn.textContent = 'Copy'; }, 2200); };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => { if (fallbackCopy(text)) done(); else fail(); });
    } else if (fallbackCopy(text)) done(); else fail();
  } catch (e) { if (fallbackCopy(text)) done(); else fail(); }
});

/* ================= section nav ================= */
$('section-jump').addEventListener('change', e => {
  history.pushState(null, '', '#' + e.target.value);
  document.getElementById(e.target.value).scrollIntoView();
});
let pending = false;
window.addEventListener('scroll', () => {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    const line = document.querySelector('.section-nav').getBoundingClientRect().height + 60;
    let id = 'architecture';
    document.querySelectorAll('main section').forEach(s => { if (s.getBoundingClientRect().top <= line) id = s.id; });
    $('section-jump').value = id;
  });
}, { passive: true });

/* ================= init ================= */
renderNets();
renderExample('events');
renderThread('opener');
renderRole('student');

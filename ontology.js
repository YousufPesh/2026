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

/* ================= 05 · agents ================= */
/* Two production data agents, each with a chat link, a saved conversation
   and the questions to paste in. */
const AGENTS = [
  {
    label: 'Leadership',
    name: 'Leadership Agent',
    url: 'https://app.mind-platform.ai/chat/agent_id/assist4bbbe03c89544ae99a9fe9535e53a865',
    thread: 'https://app.mind-platform.ai/chat/agent_id/assist4bbbe03c89544ae99a9fe9535e53a865?thread=conv_0fbd0ac49100348400ambIg5HD4djvmC1FfBkNCScQFR38lP9B',
    threadLabel: 'Student success · “Where should our advisors focus?”',
    questions: [
      { q: 'Give me list of students who are at high risk?' },
      { q: 'Which program are we seeing the most students at risk?' },
      { q: 'Which advisors are supporting those students?' },
      { q: 'Show me a few students who are struggling with missing assignments.' },
      { q: 'What’s going on with this student?' }
    ]
  },
  {
    label: 'Student Success',
    name: 'Student Success Assistant',
    url: 'https://app.mind-platform.ai/chat/agent_id/assistd6135354c82740beac248877a1a0d553',
    thread: 'https://app.mind-platform.ai/chat/agent_id/assistd6135354c82740beac248877a1a0d553?thread=conv_067473e3b607e03b006u0VammER0FtUKouZQCf3eNgLQvbzTum',
    threadLabel: 'One student · “What does my record show?”',
    questions: [
      { q: 'Tell me about my meal plan this term.' },
      { q: 'What financial aid do I have on file for Fall 2026, and what is its current status?' },
      { q: 'Do I have anything that could stop me from registering, and what does my record show about it?' },
      { q: 'What courses am I enrolled in this term, and how many credits do I have remaining toward my degree?' }
    ]
  }
];
function qcard(item) {
  const n = document.createElement('article');
  n.className = 'qcard';
  n.innerHTML = '<div class="qcard-top"><span class="qcard-step"></span><button class="copy" type="button">Copy</button></div><p class="qcard-q"></p><span class="qcard-expect"></span><p class="qcard-note" hidden></p>';
  n.querySelector('.qcard-step').textContent = item.step || '';
  n.querySelector('.qcard-q').textContent = '“' + item.q + '”';
  n.querySelector('.qcard-expect').textContent = item.expect;
  n.querySelector('.copy').dataset.copy = item.q;
  /* What the agent said it could not prove. Shown with the Notes toggle. */
  if (item.note) {
    const note = n.querySelector('.qcard-note');
    note.textContent = item.note;
    note.classList.add('pnote');
    note.hidden = !$('notes-on').checked;
  }
  return n;
}
/* Two agents, each with its own links and questions. No picker, no state. */
AGENTS.forEach(agent => {
  const box = document.createElement("section");
  box.className = "agent-block";

  const h = document.createElement("h3");
  h.textContent = agent.name;
  box.appendChild(h);

  const links = document.createElement("p");
  links.className = "agent-open";
  const open = document.createElement("a");
  open.id = "";
  open.className = "agent-primary";
  open.href = agent.url;
  open.target = "_blank";
  open.rel = "noopener";
  open.textContent = "Open the agent";
  links.appendChild(open);
  if (agent.thread) {
    const t = document.createElement("a");
    t.className = "agent-thread";
    t.href = agent.thread;
    t.target = "_blank";
    t.rel = "noopener";
    t.textContent = "Open previous chat";
    links.appendChild(t);
  }
  box.appendChild(links);

  agent.questions.forEach(i => box.appendChild(qcard(i)));
  document.getElementById("agent-list").appendChild(box);
});

/* ================= 04 · who sees what ================= */
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
    document.querySelectorAll('main > section').forEach(s => { if (s.getBoundingClientRect().top <= line) id = s.id; });
    $('section-jump').value = id;
  });
}, { passive: true });

/* ================= init ================= */
renderNets();
renderRole('student');

/* ================= 06 · work iq ================= */
const WORKIQ = {
  name: 'Work Briefing',
  url: 'https://dev.campusmind.ai/chat/agent_id/assistfdf0ebc2fddb48ae8eba6d51572e1325',
  thread: 'https://dev.campusmind.ai/chat/agent_id/assistfdf0ebc2fddb48ae8eba6d51572e1325?thread=conv_0d8e82afd132d7b000WCDuP5ckccircYbtHuY6l8z5yMmGJuZX',
  questions: [
    { q: 'What is still open from my recent email threads about students who cannot register?' },
    { q: 'Which students have been named in those threads, and what was said about each one?' },
    { q: 'Has anyone actually contacted those students, or have we only discussed them between ourselves?' },
    { q: 'What did we agree to do, and has anyone confirmed it was done?' },
    { q: 'Give me a short briefing I can send to the registrar based on those threads.' }
  ]
};

/* 25 blocked students: 5 were named in an email, 0 were written to. */
const WIQ_TOTAL = 25, WIQ_TALKED = 5, WIQ_CONTACTED = 0;
const wiqCells = buildDots($('wiq-grid'), WIQ_TOTAL);
let wiqTimer = null;

function resetWiq() {
  if (wiqTimer) clearTimeout(wiqTimer);
  wiqCells.forEach(c => { c.className = 'w-record'; });
  $('wiq-a').textContent = WIQ_TOTAL;
  $('wiq-b').textContent = '—';
  $('wiq-c').textContent = '—';
  $('wiq-caption').textContent = '';
  $('wiq-alt').textContent = `${WIQ_TOTAL} students blocked from registering.`;
}
const WIQ_STEPS = [
  { b: null, c: null, text: 'Twenty-five students cannot register. That much is in the record.' },
  { b: WIQ_TALKED, c: null, text: 'Five of them were named in an email between two administrators.' },
  { b: WIQ_TALKED, c: WIQ_CONTACTED, text: 'None of the twenty-five were written to.' }
];
$('wiq-play').addEventListener('click', () => {
  resetWiq();
  const btn = $('wiq-play');
  btn.disabled = true;
  btn.textContent = 'Following…';
  let i = 0;
  const step = () => {
    const s = WIQ_STEPS[i];
    if (s.b !== null) wiqCells.forEach((c, n) => { c.className = n < s.b ? 'w-talked' : 'w-record'; });
    $('wiq-b').textContent = s.b === null ? '—' : s.b;
    $('wiq-c').textContent = s.c === null ? '—' : s.c;
    $('wiq-caption').textContent = s.text;
    $('wiq-alt').textContent = s.text;
    announce(s.text);
    i++;
    if (i < WIQ_STEPS.length) wiqTimer = setTimeout(step, REDUCED ? 2600 : 1600);
    else {
      btn.disabled = false;
      btn.textContent = '▶ Follow them again';
    }
  };
  step();
});
resetWiq();

(function renderWorkIq() {
  const box = document.createElement('section');
  box.className = 'agent-block';
  const h = document.createElement('h3');
  h.textContent = WORKIQ.name;
  box.appendChild(h);
  const links = document.createElement('p');
  links.className = 'agent-open';
  const open = document.createElement('a');
  open.className = 'agent-primary';
  open.href = WORKIQ.url;
  open.target = '_blank';
  open.rel = 'noopener';
  open.textContent = 'Open the agent';
  links.appendChild(open);
  const t = document.createElement('a');
  t.className = 'agent-thread';
  t.href = WORKIQ.thread;
  t.target = '_blank';
  t.rel = 'noopener';
  t.textContent = 'Open previous chat';
  links.appendChild(t);
  box.appendChild(links);
  WORKIQ.questions.forEach(i => box.appendChild(qcard(i)));
  $('workiq-agent').appendChild(box);
})();

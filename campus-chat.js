'use strict';
const $ = id => document.getElementById(id);
const announce = m => { $('live-region').textContent = m; };
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pause = REDUCED ? 2200 : 1100;

/* ================= presenter notes ================= */
$('notes-on').addEventListener('change', e => {
  document.querySelectorAll('.pnote').forEach(p => { p.hidden = !e.target.checked; });
});
function pressGroup(selector, onPick) {
  document.querySelectorAll(selector).forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll(selector).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    onPick(b);
  }));
}
function buildDots(node, total) {
  node.textContent = '';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < total; i++) frag.appendChild(document.createElement('span'));
  node.appendChild(frag);
  return [...node.children];
}

/* ================= 01 · everyone, or nobody ================= */
const POPULATION = 1000;
/* Roughly what share of a campus would buy a $20/month seat themselves. */
const SELF_FUNDED = 0.11;
const accessCells = buildDots($('access-dots'), POPULATION);

function showAccess(kind) {
  const covered = kind === 'site' ? POPULATION : Math.round(POPULATION * SELF_FUNDED);
  accessCells.forEach((c, i) => { c.className = i < covered ? 'd-on' : 'd-off'; });
  $('access-covered').textContent = covered.toLocaleString();
  $('access-left').textContent = (POPULATION - covered).toLocaleString();
  $('access-left-label').textContent = kind === 'site' ? 'left out' : 'priced out';
  $('access-note').textContent = kind === 'site'
    ? 'One licence. Every student, every member of staff, the same tools.'
    : 'Access tracks who can spend $20 a month. That is not a policy anyone chose.';
  $('access-alt').textContent = `${covered} of ${POPULATION} people have access.`;
  announce($('access-note').textContent);
}
pressGroup('[data-access]', b => showAccess(b.dataset.access));
showAccess('individual');

/* ================= 02 · every model ================= */
const MODELS = [
  { name: 'GPT-4o', house: 'OpenAI' },
  { name: 'Claude Opus 4.8', house: 'Anthropic' },
  { name: 'Gemini', house: 'Google' },
  { name: 'DeepSeek', house: 'DeepSeek' },
  { name: 'Llama', house: 'Meta · open' },
  { name: 'Mistral', house: 'Mistral · open' },
  { name: 'Sonar', house: 'Perplexity' },
  { name: 'and the next one', house: 'added, not renegotiated' }
];
$('model-wall').innerHTML = MODELS.map((m, i) =>
  `<div class="model${i === MODELS.length - 1 ? ' is-next' : ''}"><strong>${m.name}</strong><span>${m.house}</span></div>`
).join('');

/* ================= shared thread rendering ================= */
function bubble(msg) {
  const el = document.createElement('div');
  el.className = 'msg is-' + msg.from;
  const who = msg.from === 'ai' ? msg.model : msg.who;
  el.innerHTML = `<span class="msg-who"></span><p class="msg-body"></p>`;
  el.querySelector('.msg-who').textContent = who;
  el.querySelector('.msg-body').textContent = msg.text;
  if (msg.from === 'ai') el.querySelector('.msg-who').classList.add('is-model');
  return el;
}
function playThread(node, messages, done) {
  node.innerHTML = '';
  let i = 0;
  const step = () => {
    node.appendChild(bubble(messages[i]));
    announce(messages[i].text);
    i++;
    if (i < messages.length) setTimeout(step, pause);
    else if (done) done();
  };
  step();
}

/* ================= 03 · switch mid-thread ================= */
const SWITCH_THREAD = [
  { from: 'you', who: 'You', text: 'Write a 500-word essay about the weather in Chicago.' },
  { from: 'ai', model: 'GPT-4o', text: 'Chicago has a humid continental climate with four distinct seasons…' },
  { from: 'you', who: 'You', text: '@Claude-Opus-4.8 tighten this and check the temperature claims.' },
  { from: 'ai', model: 'Claude Opus 4.8', text: 'Trimmed to 380 words. Two figures were off — spring highs are upper 50s, not upper 60s.' }
];
$('switch-play').addEventListener('click', () => {
  const b = $('switch-play');
  b.disabled = true;
  b.textContent = 'Playing…';
  playThread($('switch-thread'), SWITCH_THREAD, () => {
    b.disabled = false;
    b.textContent = '▶ Play it again';
    $('switch-note').textContent = 'Two models, one thread. The second one could read everything the first wrote.';
  });
});
playThread($('switch-thread'), SWITCH_THREAD.slice(0, 2));

/* ================= 04 · bring people in ================= */
const PEOPLE = [
  { initials: 'AC', name: 'Admin CB', tag: 'HOST' },
  { initials: 'JK', name: 'Jazil Kalim', tag: '' }
];
const ROOM_THREAD = [
  { from: 'you', who: 'Admin CB', text: 'Drafting the weather article — join me.' },
  { from: 'you', who: 'Jazil Kalim', text: 'Here. Ask it for the seasonal averages first.' },
  { from: 'ai', model: 'GPT-4o', text: 'Spring 45–58°F, summer 70–84°F, autumn 48–65°F, winter 20–34°F.' }
];
function renderRoom(n) {
  $('room-people').innerHTML = PEOPLE.slice(0, n).map(p =>
    `<span class="person"><i>${p.initials}</i>${p.name}${p.tag ? `<b>${p.tag}</b>` : ''}</span>`
  ).join('');
  $('room-count').textContent = n === 1 ? '1 participant' : `${n} participants active`;
  $('room').classList.toggle('is-shared', n > 1);
}
$('invite-play').addEventListener('click', () => {
  const b = $('invite-play');
  b.disabled = true;
  b.textContent = 'Inviting…';
  renderRoom(2);
  announce('Jazil Kalim joined the session.');
  playThread($('room-thread'), ROOM_THREAD, () => {
    b.disabled = false;
    b.textContent = '▶ Play it again';
  });
});
renderRoom(1);
playThread($('room-thread'), ROOM_THREAD.slice(0, 1));

/* ================= 05 · message mode ================= */
const MODE_THREAD = {
  human: [
    { from: 'you', who: 'Admin CB', text: 'Before we ask it — do we want the essay or the data table?' },
    { from: 'you', who: 'Jazil Kalim', text: 'Table. The essay reads like filler.' },
    { from: 'you', who: 'Admin CB', text: 'Agreed. Table it is.' }
  ],
  ai: [
    { from: 'you', who: 'Admin CB', text: 'Before we ask it — do we want the essay or the data table?' },
    { from: 'you', who: 'Jazil Kalim', text: 'Table. The essay reads like filler.' },
    { from: 'you', who: 'Admin CB', text: 'Agreed. Table it is.' },
    { from: 'ai', model: 'Claude Opus 4.8', text: 'Understood — a table, not an essay. Here are the seasonal averages you agreed on…' }
  ]
};
function showMode(kind) {
  const node = $('mode-thread');
  node.innerHTML = '';
  MODE_THREAD[kind].forEach(m => node.appendChild(bubble(m)));
  node.classList.toggle('is-quiet', kind === 'human');
  $('mode-note').textContent = kind === 'human'
    ? 'The AI is off. Three people talking, and it is still listening for later.'
    : 'Switched back on, it answers from everything said while it was quiet.';
  announce($('mode-note').textContent);
}
pressGroup('[data-mode]', b => showMode(b.dataset.mode));
showMode('ai');

/* ================= 06 · one place ================= */
const TOOLS = [
  ['Web search', 'current information, cited'],
  ['YouTube', 'ask about a lecture recording'],
  ['File attachments', 'PDFs, slides, spreadsheets'],
  ['Code interpreter', 'run it, do not guess it'],
  ['Coach', 'help shaping the question'],
  ['Export', 'take the thread with you']
];
$('tool-grid').innerHTML = TOOLS.map(([t, s]) => `<div class="tool"><strong>${t}</strong><span>${s}</span></div>`).join('');
$('msg-actions').innerHTML = ['Copy', 'Retry', 'Branch', 'Feedback'].map(a => `<span class="gchip">${a}</span>`).join('');

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
    let id = 'everyone';
    document.querySelectorAll('main section').forEach(s => { if (s.getBoundingClientRect().top <= line) id = s.id; });
    $('section-jump').value = id;
  });
}, { passive: true });

'use strict';
const $ = id => document.getElementById(id);
const announce = m => { $('live-region').textContent = m; };
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const BEAT = 850;

$('notes-on').addEventListener('change', e => {
  document.querySelectorAll('.pnote').forEach(p => { p.hidden = !e.target.checked; });
});
function make(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
/* Plays a table of steps one beat apart. With reduced motion, every step lands at once. */
function player(steps, apply, reset) {
  let timers = [];
  return () => {
    timers.forEach(clearTimeout);
    timers = [];
    reset();
    if (REDUCED) {
      steps.forEach(apply);
      return;
    }
    steps.forEach((s, i) => timers.push(setTimeout(() => apply(s, i), (i + 1) * BEAT)));
  };
}
function wire(svg, from, to, color) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', from[0]);
  line.setAttribute('y1', from[1]);
  line.setAttribute('x2', to[0]);
  line.setAttribute('y2', to[1]);
  if (color) line.style.stroke = color;
  svg.appendChild(line);
  return line;
}
function place(node, [x, y]) {
  node.style.setProperty('--x', x);
  node.style.setProperty('--y', y);
}
/* Chat text is an array of strings and one-item arrays; a one-item array is an @ or / token. */
function chatText(p, parts) {
  parts.forEach(part => p.append(Array.isArray(part) ? make('span', 'mention', part[0]) : part));
  return p;
}

/* ================= 01 · one campus ================= */
const OFFICES = [
  { name: 'Biology', how: 'Team chat plan', c: '#7b5bd6', apart: [33, 14, -4], together: [20, 15] },
  { name: 'Nursing', how: 'Paid on a personal card', c: '#e06a2c', apart: [75, 26, 3], together: [17, 66] },
  { name: 'Business', how: 'Separate pilot license', c: '#3f6fd8', apart: [36, 48, 1.5], together: [80, 15] },
  { name: 'Advising', how: 'Free tier', c: '#2e9e6b', apart: [73, 63, -2], together: [83, 66] },
  { name: 'Library', how: 'Browser add-on', c: '#c8423a', apart: [40, 86, 2], together: [50, 89] }
];
const HUB_AT = [50, 45];
const CONNECT = {
  apart: { heading: 'Every office bought its own AI.', button: 'Connect them', chip: '🔒 OWN LOGIN', tally: [`${OFFICES.length} contracts`, `${OFFICES.length} logins`, '0 audit trails'] },
  together: { heading: 'Your campus, connected.', button: 'Show before', chip: '✓ CONNECTED', tally: ['1 contract', '1 login', '1 audit trail'] }
};
OFFICES.forEach(o => {
  const card = make('div', 'office');
  card.style.setProperty('--c', o.c);
  ['ax', 'ay', 'ar'].forEach((k, i) => card.style.setProperty('--' + k, o.apart[i]));
  card.style.setProperty('--tx', o.together[0]);
  card.style.setProperty('--ty', o.together[1]);
  card.append(make('strong', '', o.name), make('span', 'office-how', o.how), make('span', 'office-chip'));
  $('office-stage').appendChild(card);
  wire($('office-wires'), HUB_AT, o.together);
});
function showCampus(state) {
  const s = CONNECT[state];
  $('office-stage').dataset.state = state;
  $('connect-heading').textContent = s.heading;
  $('connect-play').textContent = s.button;
  $('connect-play').setAttribute('aria-pressed', String(state === 'together'));
  document.querySelectorAll('.office-chip').forEach(c => { c.textContent = s.chip; });
  $('office-tally').textContent = '';
  s.tally.forEach(t => $('office-tally').appendChild(make('span', '', t)));
  $('office-tally').classList.toggle('is-one', state === 'together');
  return s;
}
$('connect-play').addEventListener('click', () => {
  const s = showCampus($('office-stage').dataset.state === 'apart' ? 'together' : 'apart');
  announce(s.heading + ' ' + s.tally.join(', ') + '.');
});
showCampus('apart');

/* ================= 02 · one box ================= */
/* Counts are from the live model picker on 26 September 2026. */
const PROVIDERS = [
  { name: 'OpenAI', letter: 'O', c: '#10a37f', count: 14, pick: 'GPT-5.4' },
  { name: 'Anthropic', letter: 'A', c: '#c2643b', count: 5, pick: 'Claude Opus 5' },
  { name: 'Google', letter: 'G', c: '#3f7be0', count: 5, pick: 'Gemini 3.5 Flash' },
  { name: 'xAI', letter: 'X', c: '#1d1d1f', count: 2, pick: 'Grok 4.6' },
  { name: 'DeepSeek', letter: 'D', c: '#4d5fe0', count: 2, pick: 'DeepSeek V4 Pro' },
  { name: 'Alibaba Qwen', letter: 'Q', c: '#e8892b', count: 2, pick: 'Qwen3 235B' },
  { name: 'Moonshot AI', letter: 'M', c: '#6f4bd8', count: 1, pick: 'Kimi K2.6' },
  { name: 'MiniMax', letter: 'M', c: '#d6456a', count: 1, pick: 'MiniMax M3' },
  { name: 'Z.ai', letter: 'Z', c: '#2d6a74', count: 1, pick: 'GLM 5.3' }
];
const SKILLS = [
  { name: 'xlsx', does: 'Build or read a spreadsheet' },
  { name: 'pptx', does: 'Make a slide deck' },
  { name: 'citations', does: 'APA, MLA, or Chicago' },
  { name: 'voice', does: 'Write in your institution’s voice' }
];
/* The Agents tab lists whatever is switched on in the marketplace below. */
const MARKET = [
  { name: 'Educause Info', by: 'CampusMind', letter: 'E', c: '#087985', on: true },
  { name: 'Financial Aid Agent', by: 'Student financial services', letter: '$', c: '#2e9e6b' },
  { name: 'IT Help Agent', by: 'Campus IT', letter: 'IT', c: '#3f6fd8' },
  { name: 'Library Agent', by: 'University library', letter: 'L', c: '#c8423a' }
];
/* Scene 01's hub rings itself with the first seven providers. They render here because PROVIDERS is declared here. */
PROVIDERS.slice(0, 7).forEach((p, i, ring) => {
  const angle = (i / ring.length) * 2 * Math.PI - Math.PI / 2;
  const dot = make('span', 'orbit-dot', p.letter);
  dot.style.setProperty('--c', p.c);
  dot.style.setProperty('--d', i);
  place(dot, [50 + 62 * Math.cos(angle), 50 + 62 * Math.sin(angle)]);
  $('office-hub').appendChild(dot);
});
const modelCount = PROVIDERS.reduce((n, p) => n + p.count, 0);
const TABS = {
  Models: {
    head: `${modelCount} MODELS · ${PROVIDERS.length} PROVIDERS`,
    grid: true,
    rows: () => PROVIDERS.map(p => ({ letter: p.letter, c: p.c, name: p.name, sub: p.pick, count: p.count + (p.count === 1 ? ' model' : ' models'), answer: p.pick }))
  },
  Agents: {
    head: 'FROM THE AGENT MARKETPLACE',
    rows: () => MARKET.filter(a => a.on).map(a => ({ letter: a.letter, c: a.c, name: a.name, sub: 'by ' + a.by, count: 'AGENT', answer: a.name }))
  },
  Skills: {
    head: 'TYPE / AND A SKILL NAME',
    rows: () => SKILLS.map(s => ({ letter: '/', c: '#a67312', name: '/' + s.name, sub: s.does, skill: s.name }))
  }
};
let tab = 'Models';
let answering = 'Auto';
let skill = null;
function pickRow(r) {
  const b = make('button', 'pick');
  b.type = 'button';
  b.style.setProperty('--c', r.c);
  b.setAttribute('aria-pressed', String(r.answer ? r.answer === answering : r.skill === skill));
  const name = make('span', 'pick-name', r.name);
  name.appendChild(make('small', '', r.sub));
  b.append(make('span', 'pick-letter', r.letter), name);
  if (r.count !== undefined) b.appendChild(make('span', 'pick-count', String(r.count)));
  b.addEventListener('click', () => {
    if (r.answer) {
      answering = r.answer;
      skill = null;
    } else {
      skill = r.skill;
    }
    renderBox();
    $('picker-list').querySelector('[aria-pressed=true]').focus();
    announce(r.answer ? 'Answering with ' + r.answer + '.' : '/' + r.skill + ' added to the message.');
  });
  return b;
}
function renderBox() {
  const t = TABS[tab];
  $('picker-tabs').querySelectorAll('[role=tab]').forEach(b => {
    const on = b.dataset.tab === tab;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
  });
  $('picker-list').setAttribute('aria-labelledby', 'tab-' + tab);
  $('picker-head').textContent = t.head;
  $('picker-list').classList.toggle('is-grid', !!t.grid);
  $('picker-list').textContent = '';
  t.rows().forEach(r => $('picker-list').appendChild(pickRow(r)));
  $('answering').textContent = answering;
  $('composer-model').textContent = answering;
  const text = $('composer-text');
  text.textContent = '';
  if (skill) chatText(text, [['/' + skill], ' ']);
  else text.appendChild(make('span', 'placeholder', 'Ask anything. Type @ to pick a model or agent, or / for prompts and skills.'));
}
Object.keys(TABS).forEach(name => {
  const b = make('button', '', name);
  b.type = 'button';
  b.setAttribute('role', 'tab');
  b.setAttribute('aria-controls', 'picker-list');
  b.dataset.tab = name;
  b.id = 'tab-' + name;
  b.addEventListener('click', () => { tab = name; renderBox(); });
  $('picker-tabs').appendChild(b);
});
$('picker-tabs').addEventListener('keydown', e => {
  const names = Object.keys(TABS);
  const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!step) return;
  tab = names[(names.indexOf(tab) + step + names.length) % names.length];
  renderBox();
  $('picker-tabs').querySelector('[aria-selected=true]').focus();
});
renderBox();

/* ================= 03 · marketplace ================= */
function renderMyChat() {
  $('my-agents').textContent = '';
  MARKET.filter(a => a.on).forEach(a => $('my-agents').appendChild(make('span', 'gchip is-agent', '@' + a.name)));
  if (tab === 'Agents') renderBox();
}
MARKET.forEach(a => {
  const card = make('div', 'stall' + (a.on ? ' is-on' : ''));
  const icon = card.appendChild(make('span', 'pick-letter', a.letter));
  icon.style.setProperty('--c', a.c);
  card.append(make('strong', '', a.name), make('span', 'stall-by', 'by ' + a.by));
  const btn = card.appendChild(make('button', 'add'));
  btn.type = 'button';
  const sync = () => {
    btn.textContent = a.on ? 'Added' : 'Add';
    btn.appendChild(make('span', 'sr-only', ' ' + a.name));
    btn.setAttribute('aria-pressed', String(!!a.on));
    card.classList.toggle('is-on', !!a.on);
  };
  btn.addEventListener('click', () => {
    a.on = !a.on;
    sync();
    renderMyChat();
    announce(a.name + (a.on ? ' added to your chat.' : ' removed from your chat.'));
  });
  sync();
  $('market-grid').appendChild(card);
});
renderMyChat();

/* ================= 04 · ask the conference ================= */
const ANSWER = {
  q: 'Which AI teaching sessions are on Wednesday?',
  lead: 'Three on Wednesday, September 30.',
  sources: [
    { kind: 'MCP server', name: 'Session schedule' },
    { kind: 'Knowledge base', name: 'Speaker bios' },
    { kind: 'API', name: 'Room map' },
    { kind: 'Web crawler', name: 'Conference site', live: true }
  ],
  sessions: [
    { at: '10:00', title: 'AI tutors in intro chemistry', who: 'R. Okafor · Lakeview University', room: 'Hall B' },
    { at: '13:30', title: 'Grading with guardrails', who: 'M. Lindqvist · Northgate College', room: 'Room 204' },
    { at: '15:30', title: 'Faculty prompts that work', who: 'T. Reyes · Pinecrest State', room: 'Hall B' }
  ]
};
$('answer-q').textContent = ANSWER.q;
ANSWER.sources.forEach(s => {
  const chip = make('span', 'source');
  chip.append(make('em', '', s.kind), s.name);
  if (s.live) chip.appendChild(make('i', 'live-dot'));
  $('answer-sources').appendChild(chip);
});
ANSWER.sessions.forEach(s => {
  const li = make('li', 'slot');
  const what = make('span');
  what.append(make('b', '', s.title), make('small', '', s.who));
  li.append(make('time', '', s.at), what, make('span', 'slot-room', s.room));
  $('answer-agenda').appendChild(li);
});
const ANSWER_STEPS = [
  ...ANSWER.sources.map((s, i) => ['.source', i]),
  ...ANSWER.sessions.map((s, i) => ['.slot', i])
];
const playAnswer = player(ANSWER_STEPS, ([sel, i]) => {
  $('answer-app').querySelectorAll(sel)[i].classList.add(sel === '.source' ? 'is-lit' : 'is-in');
  if (sel === '.slot' && i === 0) $('answer-lead').textContent = ANSWER.lead;
  if (sel === '.slot' && i === ANSWER.sessions.length - 1) announce(ANSWER.lead + ' Sources: ' + ANSWER.sources.map(s => s.name).join(', ') + '.');
}, () => {
  $('answer-app').querySelectorAll('.is-lit,.is-in').forEach(n => n.classList.remove('is-lit', 'is-in'));
  $('answer-lead').textContent = '';
});
$('answer-play').addEventListener('click', playAnswer);

/* ================= 05 · group chat ================= */
const PEOPLE = {
  Sam: { letter: 'S', c: '#023347' },
  Priya: { letter: 'P', c: '#7b5bd6' },
  'Educause Info': { letter: 'E', c: '#087985' },
  'GPT-5.4': { letter: 'O', c: '#10a37f' }
};
const TURNS = [
  { kind: 'person', who: 'Sam', how: ['@ agent'], text: [['@Educause Info'], ' which AI sessions are on Wednesday?'] },
  { kind: 'agent', who: 'Educause Info', text: ['Three. 10:00 and 15:30 in Hall B, 13:30 in Room 204.'] },
  { kind: 'event', text: 'Sam added Priya', joins: 'Priya' },
  { kind: 'person', who: 'Priya', how: ['@ agent'], text: [['@Educause Info'], ' which one suits faculty new to AI?'] },
  { kind: 'agent', who: 'Educause Info', text: ['Faculty prompts that work, 15:30 in Hall B.'] },
  { kind: 'person', who: 'Sam', how: ['@ model', '/ skill'], text: [['@GPT-5.4'], ' ', ['/xlsx'], ' put our Wednesday in a sheet'] },
  { kind: 'model', who: 'GPT-5.4', text: ['Here is the plan for both of you.'], file: 'wednesday-plan.xlsx' }
];
function avatar(name) {
  const a = make('i', 'avatar', PEOPLE[name].letter);
  a.style.background = PEOPLE[name].c;
  a.title = name;
  return a;
}
function turnRow(t) {
  if (t.kind === 'event') {
    const li = make('li', 'event');
    li.appendChild(make('span', '', t.text));
    return li;
  }
  const li = make('li', 'msg is-' + t.kind);
  const body = make('div');
  const who = make('span', 'msg-who');
  who.appendChild(make('b', '', t.who));
  (t.how || []).forEach(h => who.appendChild(make('span', 'how', h)));
  body.append(who, chatText(make('p', 'msg-text'), t.text));
  if (t.file) body.appendChild(make('span', 'file', t.file));
  li.append(avatar(t.who), body);
  return li;
}
const playTogether = player(TURNS, t => {
  $('thread').appendChild(turnRow(t));
  if (t.joins) $('room-people').appendChild(avatar(t.joins));
  announce(t.kind === 'event' ? t.text : t.who + ': ' + t.text.map(p => Array.isArray(p) ? p[0] : p).join(''));
}, () => {
  $('thread').textContent = '';
  $('room-people').textContent = '';
  $('room-people').append(avatar('Sam'), avatar('Educause Info'));
});
$('together-play').addEventListener('click', playTogether);

/* ================= 06 · agents calling agents ================= */
const ORCH = {
  ask: 'Plan my Wednesday around the AI sessions.',
  hub: [50, 24],
  agents: [
    { name: 'Educause Info', job: 'which sessions', c: '#087985', at: [17, 74] },
    { name: 'Calendar Agent', job: 'when you are free', c: '#a67312', at: [50, 82] },
    { name: 'Venue Agent', job: 'how far to walk', c: '#6f4bd8', at: [83, 74] }
  ],
  /* Each line of the plan is keyed to the agent that supplied it. */
  plan: [
    { at: '10:00', what: 'AI tutors in intro chemistry · Hall B', from: 0 },
    { at: '12:00', what: 'Lunch · your calendar is clear', from: 1 },
    { at: '13:20', what: 'Walk to Room 204 · 6 min', from: 2 },
    { at: '13:30', what: 'Grading with guardrails · Room 204', from: 0 }
  ]
};
$('orch-ask').textContent = ORCH.ask;
const orchParts = ORCH.agents.map(a => {
  const node = make('div', 'node');
  node.style.setProperty('--c', a.c);
  place(node, a.at);
  node.append(make('b', '', a.name), make('small', '', a.job));
  $('orch-stage').appendChild(node);
  return { node, line: wire($('orch-wires'), ORCH.hub, a.at, a.c) };
});
ORCH.plan.forEach(p => {
  const li = make('li');
  li.dataset.from = p.from;
  const dot = li.appendChild(make('i'));
  dot.style.setProperty('--c', ORCH.agents[p.from].c);
  li.append(make('time', '', p.at), make('span', '', p.what));
  $('orch-plan').appendChild(li);
});
const ORCH_STEPS = [-1, ...ORCH.agents.map((a, i) => i)];
const playOrch = player(ORCH_STEPS, i => {
  if (i < 0) {
    $('orch-hub').classList.add('is-lit');
    return;
  }
  orchParts[i].node.classList.add('is-lit');
  orchParts[i].line.classList.add('is-lit');
  $('orch-plan').querySelectorAll(`[data-from="${i}"]`).forEach(n => n.classList.add('is-in'));
  if (i === ORCH.agents.length - 1) announce('One plan from three agents.');
}, () => {
  $('orchestrate').querySelectorAll('.is-lit,.is-in').forEach(n => n.classList.remove('is-lit', 'is-in'));
});
$('orch-play').addEventListener('click', playOrch);

/* ================= 08 · try it ================= */
const QUESTIONS = [
  'What happens on each day of the conference?',
  'Which sessions on Wednesday, September 30 cover AI in teaching and learning?',
  'Who is presenting on student success, and from which organization?',
  'Build me a one-day agenda around cybersecurity sessions.'
];
QUESTIONS.forEach(q => {
  const li = document.createElement('li');
  const copy = make('button', 'try-copy', 'Copy');
  copy.type = 'button';
  copy.setAttribute('aria-label', 'Copy: ' + q);
  li.append(make('span', '', q), copy);
  $('try-list').appendChild(li);
});
/* Copy a question so it can be pasted straight into the live chat. */
function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch (error) {
    return false;
  }
}
document.addEventListener('click', event => {
  const button = event.target.closest('.try-copy');
  if (!button) return;
  const text = button.closest('li').querySelector('span').textContent.trim();
  const done = () => {
    button.textContent = 'Copied';
    button.setAttribute('data-done', '');
    announce('Question copied.');
    setTimeout(() => {
      button.textContent = 'Copy';
      button.removeAttribute('data-done');
    }, 1600);
  };
  const fail = () => {
    button.textContent = 'Select it';
    setTimeout(() => { button.textContent = 'Copy'; }, 2200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => { if (fallbackCopy(text)) done(); else fail(); });
  } else if (fallbackCopy(text)) {
    done();
  } else {
    fail();
  }
});

/* ================= scene entrances ================= */
/* A scene plays its animation the first time it scrolls into view. */
const ON_ENTER = { answer: playAnswer, together: playTogether, orchestrate: playOrch };
if (!REDUCED) document.documentElement.classList.add('js-motion');
const seen = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('is-in');
  seen.unobserve(e.target);
  if (ON_ENTER[e.target.id]) ON_ENTER[e.target.id]();
}), { threshold: 0.3 });
document.querySelectorAll('.scene').forEach(s => seen.observe(s));

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
    let id = 'connect';
    document.querySelectorAll('main section').forEach(s => { if (s.getBoundingClientRect().top <= line) id = s.id; });
    $('section-jump').value = id;
  });
}, { passive: true });

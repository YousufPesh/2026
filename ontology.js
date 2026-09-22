'use strict';
const $ = id => document.getElementById(id);
const announce = msg => { $('live').textContent = msg; };
const SOURCES = 13;

/* ---------- 01 · connection maths ---------- */
const usecases = $('usecases');
function renderLayer() {
  const u = Number(usecases.value);
  const direct = SOURCES * u;
  const layered = SOURCES + u;
  $('usecases-value').textContent = u === 1 ? '1 use case' : u + ' use cases';
  $('direct-count').textContent = direct.toLocaleString();
  $('layer-count').textContent = layered.toLocaleString();
  $('direct-note').textContent = `${SOURCES} source systems × ${u} use case${u === 1 ? '' : 's'}.`;
  $('layer-note').textContent = `${SOURCES} systems into the layer, plus ${u} use case${u === 1 ? '' : 's'} reading from it.`;
  $('direct-col').classList.toggle('is-heavy', direct > layered);
  $('layer-verdict').textContent = u === 1
    ? 'At one use case the direct route is one connection cheaper. Move the slider.'
    : `At ${u} use cases the direct route costs ${(direct - layered).toLocaleString()} more connections — every one of them a separate credential, contract and point of failure.`;
}
usecases.addEventListener('input', renderLayer);

/* ---------- 02 · source domains ---------- */
const DOMAINS = [
  ['Student information', 'Banner, Ellucian Colleague, Workday Student, PeopleSoft', 'Students, terms, sections, enrollments, degree progress, program history'],
  ['Learning management', 'Canvas, Blackboard, Moodle, D2L', 'Assignments, submissions, grades, attendance, LMS activity'],
  ['Student financials', 'Banner Finance, Workday, TouchNet', 'Student accounts, balances, holds, payments'],
  ['Financial aid', 'PowerFAIDS, Banner Financial Aid', 'Aid awards, verification status, scholarships'],
  ['Student success', 'EAB Navigate, Starfish, Civitas', 'Advising cases, appointments, alerts, interventions, risk'],
  ['Admissions CRM', 'Slate, Salesforce Education Cloud, TargetX', 'Prospects, applications, application events'],
  ['Housing', 'StarRez, Adirondack', 'Residence halls, housing assignments, meal plans'],
  ['Engagement', 'Anthology Engage, Presence, CampusGroups', 'Clubs, memberships, campus events, registrations'],
  ['Career services', 'Handshake, Symplicity', 'Internships, career appointments'],
  ['Accessibility', 'AIM, Accommodate', 'Approved accommodations'],
  ['International', 'Terra Dotta, SEVIS', 'Visa type, expiry, SEVIS status'],
  ['Facilities and IT', 'ServiceNow, TMA', 'Assets, work orders, service requests, helpdesk tickets'],
  ['Advancement', "Raiser's Edge, Ellucian Advance", 'Alumni, gifts']
];
const chipWrap = $('domain-chips');
DOMAINS.forEach((d, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = d[0];
  b.setAttribute('aria-pressed', String(i === 0));
  b.addEventListener('click', () => {
    [...chipWrap.children].forEach(el => el.setAttribute('aria-pressed', String(el === b)));
    $('domain-system').textContent = d[1];
    $('domain-holds').textContent = d[2];
    announce(`${d[0]}: ${d[1]}. Holds ${d[2]}.`);
  });
  chipWrap.appendChild(b);
});

/* ---------- 03 · the same question, two answers ---------- */
const EXAMPLES = {
  events: {
    kicker: 'EVENT ATTENDANCE',
    raw: '1,200', rawCap: 'event registrations on record',
    onto: '398', ontoCap: 'students who actually attended',
    gap: 'A 3× gap, invisible in the raw table.',
    reasons: [
      '<strong>601</strong> of the 1,200 registrations are faculty and staff, not students.',
      'Of the 599 student registrations, <strong>201</strong> did not show up.'
    ],
    rel: '<code>Event Registration</code> links to <code>Student</code> <strong>only</strong> when <code>attendee_type</code> is Student, through a dedicated mapping table.',
    takeaway: 'Both numbers are correct. They answer different questions. Your engagement report has been using the first one.'
  },
  housing: {
    kicker: 'WHO LIVES IN A HALL',
    raw: '148', rawCap: 'housing assignment records',
    onto: '115', ontoCap: 'people actually living there',
    gap: 'A 33-person gap between the system of record and the building.',
    reasons: [
      '<strong>15</strong> were assigned and never checked in.',
      '<strong>11</strong> checked out while the record stayed open.',
      '<strong>7</strong> changed rooms mid-semester, so they hold two open records each.'
    ],
    rel: '<code>resides_in</code> means checked in and not checked out. <code>has_assignment_in</code> means holding a record of any kind. Two named relationships between the same two entities — and the ontology tells you which question each one answers.',
    takeaway: 'The housing office reports 148 because that is what its system holds. 115 people sleep there. The ontology names both instead of picking one.'
  }
};
function renderExample(key) {
  const e = EXAMPLES[key];
  $('ex-kicker').textContent = e.kicker;
  $('raw-value').textContent = e.raw;
  $('raw-caption').textContent = e.rawCap;
  $('onto-value').textContent = e.onto;
  $('onto-caption').textContent = e.ontoCap;
  $('gap-line').textContent = e.gap;
  $('reason-list').innerHTML = e.reasons.map(r => `<li>${r}</li>`).join('');
  $('relationship-text').innerHTML = e.rel;
  $('ex-takeaway').textContent = e.takeaway;
  announce(`${e.kicker}. ${e.raw} ${e.rawCap} against ${e.onto} ${e.ontoCap}. ${e.takeaway}`);
}
document.querySelectorAll('[data-example]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-example]').forEach(el => el.setAttribute('aria-pressed', String(el === b)));
  renderExample(b.dataset.example);
}));

/* ---------- 04 · question threads ---------- */
const THREADS = {
  opener: {
    intro: 'Thirty seconds, and the fastest way to make a room understand why a semantic layer exists. Run it before any other thread.',
    questions: [
      {
        step: 'ASK FIRST',
        q: 'How many campus event registrations do we have on record?',
        expect: '1,200 registrations.',
        say: 'This is the number your engagement report uses. It counts rows in a table.'
      },
      {
        step: 'THEN ASK',
        q: 'How many students actually attended a campus event this term?',
        expect: '398 students. The gap comes from two independent errors, and both are invisible in the raw table.',
        say: 'Both numbers are correct. They answer different questions. The first counts rows. The second counts students who walked through a door.'
      }
    ]
  },
  finance: {
    intro: 'One term from a degree, blocked by money. Four questions, one population the whole way through — each answer should change how the room feels about the previous one.',
    questions: [
      {
        step: 'BEAT 1 · ~2 MIN',
        q: 'Which students are within one term of a degree but will be stopped from registering, and what is actually stopping each one?',
        expect: '25 students, named, with the specific blocker for each. It resolves what “within one term of a degree” means against a definition this institution owns.',
        say: 'It is crossing four systems that have never been joined. Degree progress from the SIS. Holds from the bursar. Balances from student accounts. Risk context from advising. No one person here has access to all four.'
      },
      {
        step: 'BEAT 2 · ~30 SEC · EXPECT A REFUSAL',
        q: 'Which of those students were flagged, assigned to someone, and never actually reached?',
        expect: 'It declines — and explains which relationship does not exist, then offers a proxy definition with the caveat attached.',
        say: 'It did not guess. Every CIO in the room fears confident wrongness. You cannot argue them out of it. You can only show them a system that declines when it cannot prove an answer.'
      },
      {
        step: 'BEAT 3 · ~1 MIN',
        q: 'How many of those 25 students have a financial aid advising case?',
        expect: 'Zero.',
        say: 'The institution carries dozens of open financial aid cases. None of them are these people. Nobody is doing anything wrong — nobody can see across the systems.'
      },
      {
        step: 'BEAT 4 · ~1.5 MIN',
        q: 'Have those 25 students made any payments this term, do they have financial aid on file, and what would it cost to clear all of their balances?',
        expect: 'All 25 made a payment this term. They are not delinquent, they are short. $80,500 total, median balance $2,500.',
        say: 'Eighty thousand dollars. To keep twenty-five students who are one term from a degree, at an institution that will spend considerably more than that recruiting their replacements.'
      }
    ]
  },
  housing: {
    intro: 'A smaller, separate build — four entities and six relationships. The cleanest ontology story in the set, because every relationship is a phrase a housing director says out loud.',
    questions: [
      {
        step: 'BEAT 1',
        q: 'How many students currently reside in Kestrel Hall, and how many hold a housing assignment record there?',
        expect: '115 current residents. 148 assignment records, belonging to 141 distinct people.',
        say: 'Both numbers are correct. The ontology does not hide the disagreement — it names both relationships and tells you which is which.'
      },
      {
        step: 'BEAT 2',
        q: 'If Kestrel Hall goes offline for renovation in Fall 2027, how many current residents would need rehousing?',
        expect: '92 — not 115, because 14 of the current residents graduate before Fall 2027 and are not displaced at all.',
        say: 'A planner with a spreadsheet counts residents. This counted residents who will still be here. That difference is fourteen people, and it came from degree progress — which is not a housing system at all.'
      },
      {
        step: 'BEAT 3',
        q: 'For each accommodation requirement held by Kestrel residents, how many suitable vacant beds exist in the other halls?',
        expect: 'Four constraints are comfortable. Accessible Bathroom is a hard blocker: 7 students, 3 vacant beds elsewhere, a gap of −4.',
        say: 'This is the relationship no analyst would think to write. Room satisfies Accommodation — not a foreign key, a statement about what a room is capable of. Without it, four students find out in August.'
      }
    ]
  }
};

const STUDENT_QUESTIONS = [
  {
    step: 'ASK AS THE STUDENT',
    q: 'Do I have a financial hold on my student account for Fall 2026, and what is my balance?',
    expect: 'Hold flag Yes, balance $4,800, and what she can do about it.',
    say: 'Today she gets this from a red banner that says “hold, contact the bursar.” It does not say why, how much, or what would clear it.'
  },
  {
    step: 'THEN ASK',
    q: 'What courses am I enrolled in for Fall 2026?',
    expect: 'Her three courses for the term.',
    say: 'Ask this one on its own first — it keeps the next answer complete.'
  },
  {
    step: 'THEN ASK',
    q: 'Show me everything I have going on this term: my courses, my housing, my meal plan, my clubs, and anything open with my advisor.',
    expect: 'Residence hall and room, meal plan and dining balance, club memberships, advising appointments with outcomes, and an open tutoring case.',
    say: 'Six logins, six passwords, six interfaces — and no student has ever seen all of it on one screen. This is one question.'
  }
];

function qcard(item) {
  const el = document.createElement('article');
  el.className = 'qcard';
  el.innerHTML =
    `<div class="qcard-top"><span class="qcard-step"></span><button class="copy" type="button">Copy</button></div>` +
    `<p class="qcard-q"></p>` +
    `<p class="qcard-expect"><b>EXPECT</b><span></span></p>` +
    `<p class="qcard-say"><b>SAY WHILE IT RUNS</b><span></span></p>`;
  el.querySelector('.qcard-step').textContent = item.step;
  el.querySelector('.qcard-q').textContent = '“' + item.q + '”';
  el.querySelector('.qcard-expect span').textContent = item.expect;
  el.querySelector('.qcard-say span').textContent = item.say;
  el.querySelector('.copy').dataset.copy = item.q;
  return el;
}

function renderThread(key) {
  const t = THREADS[key];
  $('thread-intro').textContent = t.intro;
  const wrap = $('thread-questions');
  wrap.innerHTML = '';
  t.questions.forEach(item => wrap.appendChild(qcard(item)));
  announce(`${t.questions.length} questions loaded for this thread.`);
}
document.querySelectorAll('[data-thread]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-thread]').forEach(el => el.setAttribute('aria-pressed', String(el === b)));
  renderThread(b.dataset.thread);
}));

STUDENT_QUESTIONS.forEach(item => $('student-questions').appendChild(qcard(item)));

/* ---------- copy to clipboard ---------- */
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
  } catch (e) { return false; }
}
document.addEventListener('click', event => {
  const btn = event.target.closest('.copy');
  if (!btn) return;
  const text = btn.dataset.copy || '';
  const done = () => {
    btn.textContent = 'Copied';
    btn.setAttribute('data-done', '');
    announce('Copied to clipboard.');
    setTimeout(() => { btn.textContent = 'Copy'; btn.removeAttribute('data-done'); }, 1600);
  };
  const fail = () => { btn.textContent = 'Select manually'; setTimeout(() => { btn.textContent = 'Copy'; }, 2400); };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => { fallbackCopy(text) ? done() : fail(); });
    } else {
      fallbackCopy(text) ? done() : fail();
    }
  } catch (e) { fallbackCopy(text) ? done() : fail(); }
});

/* ---------- section nav ---------- */
$('section-jump').addEventListener('change', e => {
  const id = e.target.value;
  history.pushState(null, '', '#' + id);
  document.getElementById(id).scrollIntoView();
});
let scrollPending = false;
window.addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    scrollPending = false;
    const line = document.querySelector('.section-nav').getBoundingClientRect().height + 70;
    let id = 'layer';
    document.querySelectorAll('main section').forEach(s => { if (s.getBoundingClientRect().top <= line) id = s.id; });
    $('section-jump').value = id;
  });
}, { passive: true });

/* ---------- init ---------- */
renderLayer();
renderExample('events');
renderThread('opener');

/* ---------- 01 · architecture stack ---------- */
const LAYERS = {
  people: {
    kicker: 'LAYER 1 · PEOPLE',
    title: 'One interface, not six portals.',
    body: 'Everyone who needs an answer asks in the same place, in plain language. What they are allowed to see is decided underneath, not by which portal they happened to log into.',
    points: ['Students · Faculty · Advisors · Staff · Leadership', 'The same question from an advisor and a provost reaches different rows.'],
    say: 'Today the answer to this question lives in four systems, and the person who needs it has a login to two of them.'
  },
  campusmind: {
    kicker: 'LAYER 2 · CAMPUSMIND',
    title: 'The agents people actually talk to.',
    body: 'Recruitment, Retention and Student Success agents, plus AI Studio for building your own and a marketplace for the rest. Each agent sees only what the person’s role allows.',
    points: ['Recruitment agent · Retention agent · Student success agent', 'AI Studio · Agent marketplace', '3,000+ connectors, so an answer can become an action.'],
    say: 'This is the layer your staff and students see. Everything below it is the reason it can be trusted.',
    link: '#campusmind', linkText: 'See the CampusMind handoff →'
  },
  agents: {
    kicker: 'LAYER 3 · FABRIC DATA AGENTS',
    title: 'Read-only, and running as the person asking.',
    body: 'A data agent per domain. It generates a query, shows you the query it generated, and executes it under the identity of whoever asked — never under a service account with more reach.',
    points: ['Housing · Finance · Academic · Advising · Enrollment', 'Read only. The agent has no path to write.', 'The generated query is shown, not hidden.'],
    say: 'It generated a read-only query, and it ran as me. If I could not see those rows in the source system, I cannot see them here either.',
    link: '#ask', linkText: 'Ask the data agent →'
  },
  fabriciq: {
    kicker: 'LAYER 4 · FABRIC IQ',
    title: 'What your words mean, and one definition of every number.',
    body: 'The ontology holds entities and the relationships between them — Student resides_in Hall, Room satisfies Accommodation. The semantic model holds certified metrics, so retention, occupancy and aid mean one thing across the institution.',
    points: ['Ontology — entities and relationships, written down once and owned.', 'Semantic models — certified metrics: retention, occupancy, aid.', 'Fabric IQ is currently in preview.'],
    say: 'This is the layer that turns a question in English into a question about your institution. Without it, the agent is guessing what you meant by a student.',
    link: '#meaning', linkText: 'See what the ontology adds →'
  },
  onelake: {
    kicker: 'LAYER 5 · ONELAKE FOUNDATION',
    title: 'One governed lake. One copy. You own it.',
    body: 'Data lands raw, is cleaned, and is certified — with full lineage back to the system it came from. Open Delta format, in your own tenant, with no duplication.',
    points: ['raw → cleaned → certified', 'Full lineage back to source.', 'Open Delta format in your own tenant — one copy, no duplication.'],
    say: 'This sits in your tenant, in an open format. If you walked away from every vendor in this diagram tomorrow, the data is still yours and still readable.'
  },
  sources: {
    kicker: 'LAYER 6 · SOURCE SYSTEMS',
    title: 'Nothing is replaced. They stay where they are.',
    body: 'The systems your institution already runs keep running. The layer above reads from them — it does not ask you to migrate off them.',
    points: ['SIS · Banner, Workday', 'LMS · Canvas, Blackboard', 'CRM · Slate, Salesforce', 'Finance · TouchNet  ·  Housing · StarRez  ·  Advising · Navigate'],
    say: 'Nothing here is a rip-and-replace. Every system on this list keeps doing its job. We are reading from them, not moving off them.',
    link: '#sources', linkText: 'See where the data lives →'
  }
};

const stack = $('stack');
const detail = $('layer-detail');
const layerButtons = [...document.querySelectorAll('.layer')];

function openLayer(key) {
  const d = LAYERS[key];
  layerButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.layer === key)));
  $('detail-kicker').textContent = d.kicker;
  $('detail-title').textContent = d.title;
  $('detail-body').textContent = d.body;
  $('detail-points').innerHTML = d.points.map(p => `<li>${p}</li>`).join('');
  $('detail-say').textContent = d.say;
  $('detail-copy').dataset.copy = d.say;
  const link = $('detail-link');
  if (d.link) { link.href = d.link; link.textContent = d.linkText; link.hidden = false; }
  else link.hidden = true;
  detail.hidden = false;
  $('detail-title').scrollIntoView({ block: 'nearest' });
}
layerButtons.forEach(b => {
  b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', () => {
    if (b.getAttribute('aria-pressed') === 'true') { closeDetail(); return; }
    stopTrace();
    openLayer(b.dataset.layer);
  });
});
function closeDetail() {
  detail.hidden = true;
  layerButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
}
$('detail-close').addEventListener('click', closeDetail);

/* the trace */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TRACE = [
  { sel: '[data-layer=people]', dir: 'down', text: 'An advisor asks a question in plain language. One interface, not six portals.' },
  { sel: '[data-layer=campusmind]', dir: 'down', text: 'CampusMind routes it to the right agent — scoped to what this person’s role allows.' },
  { sel: '.boundary', dir: 'down', text: 'The question crosses the trust boundary. Institutional data never crosses back up past this line.' },
  { sel: '[data-layer=agents]', dir: 'down', text: 'A Fabric data agent generates a read-only query, and runs it as the person asking.' },
  { sel: '[data-layer=fabriciq]', dir: 'down', text: 'Fabric IQ resolves what the words mean, and which certified number answers them.' },
  { sel: '[data-layer=onelake]', dir: 'down', text: 'The query reads certified tables in one governed lake — one copy, full lineage to source.' },
  { sel: '[data-layer=sources]', dir: 'down', text: 'Which were fed from the systems you already run. Nothing was replaced.' },
  { sel: '[data-layer=fabriciq]', dir: 'up', text: 'Only the answer comes back — one number, with the definition behind it.' },
  { sel: '[data-layer=campusmind]', dir: 'up', text: 'Back through CampusMind, still under the same permissions.' },
  { sel: '[data-layer=people]', dir: 'up', text: 'The advisor gets an answer no single system on this campus could have given them.' }
];
let traceTimer = null, traceStep = 0;
const playBtn = $('trace-play'), resetBtn = $('trace-reset'), caption = $('trace-caption');

function clearMarks() {
  document.querySelectorAll('.is-lit,.is-answer').forEach(el => el.classList.remove('is-lit', 'is-answer'));
  document.querySelectorAll('.flow-down,.flow-up').forEach(el => el.classList.remove('is-on'));
}
function stopTrace() {
  if (traceTimer) { clearTimeout(traceTimer); traceTimer = null; }
  clearMarks();
  playBtn.disabled = false;
  playBtn.textContent = '▶ Trace a question';
  caption.classList.remove('is-live');
}
function stepTrace() {
  clearMarks();
  const s = TRACE[traceStep];
  const el = document.querySelector(s.sel);
  if (el) el.classList.add(s.dir === 'down' ? 'is-lit' : 'is-answer');
  document.querySelectorAll(s.dir === 'down' ? '.flow-down' : '.flow-up').forEach(f => f.classList.add('is-on'));
  caption.textContent = (traceStep + 1) + '/' + TRACE.length + ' · ' + s.text;
  caption.classList.add('is-live');
  traceStep++;
  if (traceStep < TRACE.length) {
    traceTimer = setTimeout(stepTrace, REDUCED ? 2600 : 1500);
  } else {
    traceTimer = setTimeout(function () {
      clearMarks();
      caption.textContent = 'A question travels all the way down. Only the answer comes back. Select any layer to open it.';
      caption.classList.remove('is-live');
      playBtn.disabled = false;
      playBtn.textContent = '▶ Trace it again';
      resetBtn.hidden = true;
    }, 2600);
  }
}
playBtn.addEventListener('click', function () {
  closeDetail();
  stopTrace();
  traceStep = 0;
  playBtn.disabled = true;
  playBtn.textContent = 'Tracing…';
  resetBtn.hidden = false;
  stepTrace();
});
resetBtn.addEventListener('click', function () {
  stopTrace();
  resetBtn.hidden = true;
  caption.textContent = 'Select any layer to open it, or trace a question through all six.';
});

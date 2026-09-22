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

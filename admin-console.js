'use strict';
const $ = id => document.getElementById(id);
const announce = m => { $('live').textContent = m; };
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = n => '$' + Math.round(n).toLocaleString();

/* ================= presenter notes ================= */
$('notes-on').addEventListener('change', e => {
  document.querySelectorAll('.pnote').forEach(p => { p.hidden = !e.target.checked; });
});

function chips(host, items, onPick, startIndex) {
  items.forEach((item, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.label;
    b.setAttribute('aria-pressed', String(i === (startIndex || 0)));
    b.addEventListener('click', () => {
      [...host.children].forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
      onPick(item, i);
    });
    host.appendChild(b);
  });
}
function buildDots(node, total) {
  node.textContent = '';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < total; i++) frag.appendChild(document.createElement('span'));
  node.appendChild(frag);
  return [...node.children];
}

/* ================= 01 · the runaway bill ================= */
const SEATS = 600;
const BURN_CAP = 12000;
const burnCells = buildDots($('burn-dots'), SEATS);
let burnTimer = null;

function resetBurn() {
  if (burnTimer) clearTimeout(burnTimer);
  burnCells.forEach(c => { c.className = 'd-normal'; });
  $('burn-fill').style.width = '0%';
  $('burn-fill').classList.remove('is-over');
  $('burn-cap').hidden = true;
  $('burn-spend').textContent = '$0';
  $('burn-top').textContent = '0%';
  $('burn-caption').textContent = '';
  $('burn-alt').textContent = `${SEATS} accounts, nothing spent yet.`;
}
const BURN_STEPS = [
  { spend: 2600, heavy: 0, runaway: 0, text: 'Week one. Normal use across 600 accounts.' },
  { spend: 5200, heavy: 18, runaway: 0, text: 'Week two. A few accounts are running long jobs.' },
  { spend: 9800, heavy: 18, runaway: 3, text: 'Week three. Three accounts start looping.' },
  { spend: 19400, heavy: 18, runaway: 3, text: 'Week four. Those three are now most of the bill.' }
];
function playBurn() {
  resetBurn();
  const btn = $('burn-play');
  btn.disabled = true;
  btn.textContent = 'Running…';
  let i = 0;
  const step = () => {
    const s = BURN_STEPS[i];
    burnCells.forEach((c, n) => {
      c.className = n < s.runaway ? 'd-runaway' : n < s.runaway + s.heavy ? 'd-heavy' : 'd-normal';
    });
    const pct = Math.min(100, (s.spend / BURN_CAP) * 100);
    $('burn-fill').style.width = pct + '%';
    $('burn-fill').classList.toggle('is-over', s.spend > BURN_CAP);
    $('burn-spend').textContent = money(s.spend);
    const topShare = s.runaway ? Math.round(((s.spend - 5200) / s.spend) * 100) : 0;
    $('burn-top').textContent = topShare + '%';
    $('burn-caption').textContent = s.text;
    $('burn-alt').textContent = `${money(s.spend)} spent. ${topShare}% of it from ${s.runaway} accounts.`;
    announce(s.text);
    i++;
    if (i < BURN_STEPS.length) {
      burnTimer = setTimeout(step, REDUCED ? 2600 : 1500);
    } else {
      burnTimer = setTimeout(() => {
        $('burn-cap').hidden = false;
        $('burn-caption').textContent = 'A cap would have stopped this on day nine.';
        btn.disabled = false;
        btn.textContent = '▶ Run it again';
      }, REDUCED ? 2600 : 1600);
    }
  };
  step();
}
$('burn-play').addEventListener('click', playBurn);
resetBurn();

/* ================= 02 · where the cap sits ================= */
const SCOPES = [
  { key: 'tenant', label: 'Tenant', caption: 'One ceiling for the whole institution. Protects the invoice, nothing else.' },
  { key: 'group', label: 'Group', caption: 'A department carries its own allowance. One faculty cannot spend another’s.' },
  { key: 'user', label: 'User', caption: 'Every person gets a monthly allowance you can raise, lower or replenish.' },
  { key: 'agent', label: 'Agent', caption: 'A published agent spends from its own budget, not from whoever opened it.' }
];
buildDots($('nest-dots'), 24);
chips($('scope-picker'), SCOPES, s => showScope(s.key), 0);
function showScope(key) {
  document.querySelectorAll('.nest-ring').forEach(r => r.classList.toggle('is-on', r.dataset.scope === key));
  const s = SCOPES.find(x => x.key === key);
  $('scope-caption').textContent = s.caption;
  announce(`${s.label}. ${s.caption}`);
}
showScope('tenant');

/* ================= 03 · enforcement mode ================= */
const MODES = [
  { key: 'user', label: 'User only', checks: ['user'] },
  { key: 'group', label: 'Group only', checks: ['group'] },
  { key: 'both', label: 'Both', checks: ['user', 'group'], rec: true },
  { key: 'tenant', label: 'Tenant cap only', checks: ['tenant'] }
];
const STATE_KEYS = [
  { key: 'user', label: 'User budget' },
  { key: 'group', label: 'Group budget' },
  { key: 'tenant', label: 'Tenant cap' }
];
let mode = 'both';
const STATES = ['ok', 'warn', 'out'];
const STATE_WORD = { ok: 'healthy', warn: 'near limit', out: 'exhausted' };
const budgetState = { user: 'ok', group: 'out', tenant: 'ok' };

STATE_KEYS.forEach(s => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'switch';
  b.dataset.state = s.key;
  b.addEventListener('click', () => {
    budgetState[s.key] = STATES[(STATES.indexOf(budgetState[s.key]) + 1) % STATES.length];
    renderSwitches(); renderVerdict();
  });
  $('state-toggles').appendChild(b);
});
const nameOf = k => STATE_KEYS.find(s => s.key === k).label.toLowerCase();
function renderSwitches() {
  [...$('state-toggles').children].forEach(b => {
    const k = b.dataset.state;
    const v = budgetState[k];
    b.dataset.level = v;
    b.setAttribute('aria-pressed', String(v !== 'out'));
    b.innerHTML = `<span class="sw-l">${STATE_KEYS.find(s => s.key === k).label}</span><span class="sw-v">${STATE_WORD[v]}</span>`;
  });
}
function renderVerdict() {
  const m = MODES.find(x => x.key === mode);
  const out = m.checks.filter(c => budgetState[c] === 'out');
  const warn = m.checks.filter(c => budgetState[c] === 'warn');
  const level = out.length ? 'blocked' : warn.length ? 'warned' : 'allowed';

  $('verdict').classList.toggle('is-blocked', level === 'blocked');
  $('verdict').classList.toggle('is-warned', level === 'warned');
  $('verdict-word').textContent = level === 'blocked' ? 'BLOCKED' : level === 'warned' ? 'WARNED' : 'ALLOWED';

  let why;
  if (level === 'blocked') why = `${out.map(nameOf).join(' and ')} exhausted`;
  else if (level === 'warned') why = `${warn.map(nameOf).join(' and ')} near the limit · the request still goes through`;
  else why = `${m.checks.map(nameOf).join(' and ')} checked, all clear`;

  const ignored = STATE_KEYS.filter(s => !m.checks.includes(s.key) && budgetState[s.key] === 'out');
  if (ignored.length && level !== 'blocked') why += ` · ${ignored.map(i => i.label.toLowerCase()).join(' and ')} exhausted but not checked in this mode`;

  $('verdict-why').textContent = why;
  announce(`${$('verdict-word').textContent}. ${why}`);
}
chips($('mode-picker'), MODES, m => { mode = m.key; renderVerdict(); }, 2);
renderSwitches();
renderVerdict();

/* ================= 04 · the public agent ================= */
const AGENT_BUDGET = 400;
const ORG_BUDGET = 12000;
let agentCap = false, floodTimer = null;
const floodCells = buildDots($('flood'), 200);

function resetFlood() {
  if (floodTimer) clearTimeout(floodTimer);
  floodCells.forEach(c => { c.className = ''; });
  setPools(0, 0);
  $('flood-verdict').textContent = agentCap
    ? 'The agent has its own budget. Send the traffic.'
    : 'No agent cap. Every request is charged to the organisation.';
}
function setPools(agentSpent, orgSpent) {
  const a = agentCap ? Math.min(100, (agentSpent / AGENT_BUDGET) * 100) : 0;
  const o = Math.min(100, (orgSpent / ORG_BUDGET) * 100);
  $('pool-agent').style.width = a + '%';
  $('pool-org').style.width = o + '%';
  $('pool-agent').classList.toggle('is-full', a >= 100);
  $('pool-org').classList.toggle('is-full', o >= 100);
  $('pool-agent-n').textContent = agentCap ? `${money(agentSpent)} of ${money(AGENT_BUDGET)}` : 'not set';
  $('pool-org-n').textContent = `${money(orgSpent)} of ${money(ORG_BUDGET)}`;
}
function playFlood() {
  resetFlood();
  const btn = $('flood-play');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  let i = 0;
  const total = floodCells.length;
  const step = () => {
    const shown = Math.min(total, i * 25);
    for (let n = 0; n < shown; n++) {
      const spentByHere = (n + 1) * 8;
      floodCells[n].className = agentCap && spentByHere > AGENT_BUDGET ? 'is-rejected' : 'is-charged';
    }
    const requested = shown * 8;
    const agentSpent = agentCap ? Math.min(AGENT_BUDGET, requested) : 0;
    const orgSpent = agentCap ? 0 : requested;
    setPools(agentSpent, orgSpent);
    i++;
    if (shown < total) {
      floodTimer = setTimeout(step, REDUCED ? 700 : 340);
    } else {
      btn.disabled = false;
      btn.textContent = '▶ Send again';
      $('flood-verdict').textContent = agentCap
        ? `Agent budget exhausted at ${money(AGENT_BUDGET)}. The widget stops. Nobody else is affected.`
        : `${money(requested)} charged to the organisation. Every staff and student allowance is now smaller.`;
      announce($('flood-verdict').textContent);
    }
  };
  step();
}
$('flood-play').addEventListener('click', playFlood);
document.querySelectorAll('[data-agentcap]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-agentcap]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  agentCap = b.dataset.agentcap === 'on';
  resetFlood();
}));
resetFlood();

/* ================= 05 · who spent what ================= */
const PERIODS = {
  now: {
    label: 'This month', total: 9840, remaining: 2160, near: 7, over: 3, resets: 'Oct 1',
    people: [['Runaway script account', 3120], ['R. Okafor · Research', 910], ['A. Delgado · Library', 640], ['M. Haddad · Admissions', 470], ['Everyone else', 4700]],
    groups: [['Research', 4380], ['Admissions', 2010], ['Student Affairs', 1620], ['Library', 1180], ['Facilities', 650]]
  },
  last: {
    label: 'Last month', total: 6120, remaining: 5880, near: 2, over: 0, resets: 'Sep 1',
    people: [['R. Okafor · Research', 820], ['A. Delgado · Library', 590], ['M. Haddad · Admissions', 430], ['S. Whitfield · Research', 390], ['Everyone else', 3890]],
    groups: [['Research', 2240], ['Admissions', 1490], ['Student Affairs', 1180], ['Library', 830], ['Facilities', 380]]
  }
};
function bars(node, rows) {
  const max = Math.max(...rows.map(r => r[1]));
  node.innerHTML = rows.map(([name, value]) => `<div class="bar"><span class="bar-l">${name}</span><span class="bar-track"><i style="width:${(value / max) * 100}%"></i></span><b>${money(value)}</b></div>`).join('');
}
function showPeriod(key) {
  const p = PERIODS[key];
  $('stat-row').innerHTML = [
    ['Total org spend', money(p.total), '', ''],
    ['Remaining budget', money(p.remaining), `resets ${p.resets}`, ''],
    ['Users near limit', p.near, 'warned, not blocked', p.near ? 'is-warn' : ''],
    ['Over limit', p.over, 'blocked', p.over ? 'is-over' : '']
  ].map(([l, v, sub, cls]) => `<div class="stat ${cls}"><strong>${v}</strong><span>${l}</span>${sub ? `<i>${sub}</i>` : ''}</div>`).join('');
  bars($('bars-people'), p.people);
  bars($('bars-groups'), p.groups);
  announce(`${p.label}. ${money(p.total)} total.`);
}
chips($('period-picker'), [{ label: 'This month', key: 'now' }, { label: 'Last month', key: 'last' }], p => showPeriod(p.key), 0);
showPeriod('now');

/* ================= 06 · roles & permissions ================= */
const CAPS = ['Open agent chat', 'Attach files', 'Web search', 'Code interpreter', 'Build agents', 'Publish publicly', 'See other users’ spend', 'Set budgets', 'Manage roles', 'Change branding'];
const ROLES = [
  { label: 'Student', on: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0], caption: 'Can use the platform. Cannot build, publish, or see anyone else.' },
  { label: 'Professor', on: [1, 1, 1, 1, 1, 0, 0, 0, 0, 0], caption: 'Can build agents for a course. Publishing and budgets stay with admins.' },
  { label: 'Admin', on: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], caption: 'Everything, including who else gets what.' }
];
function showRole(i) {
  const r = ROLES[i];
  $('perm-grid').innerHTML = CAPS.map((c, n) => `<div class="perm${r.on[n] ? ' is-on' : ''}"><span class="perm-tick" aria-hidden="true">${r.on[n] ? '✓' : '—'}</span>${c}</div>`).join('');
  $('perm-caption').textContent = r.caption;
  announce(`${r.label}. ${r.on.filter(Boolean).length} of ${CAPS.length} capabilities. ${r.caption}`);
}
chips($('role-picker'), ROLES, (r, i) => showRole(i), 0);
showRole(0);

/* ================= 07 · make it yours ================= */
const ACCENTS = ['#087985', '#5b3fb5', '#a8432c', '#1d6b3f', '#0b4d63'];
ACCENTS.forEach((hex, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'swatch';
  b.style.background = hex;
  b.setAttribute('aria-label', 'Accent ' + (i + 1));
  b.setAttribute('aria-pressed', String(i === 0));
  b.addEventListener('click', () => {
    [...$('swatches').children].forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
    $('preview').style.setProperty('--brand', hex);
    announce('Accent changed.');
  });
  $('swatches').appendChild(b);
});
$('preview').style.setProperty('--brand', ACCENTS[0]);
$('brand-name').addEventListener('input', e => {
  const v = e.target.value.trim() || 'Your institution';
  $('preview-name').textContent = v;
  $('preview-mark').textContent = v.charAt(0).toUpperCase();
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
    let id = 'runaway';
    document.querySelectorAll('main section').forEach(s => { if (s.getBoundingClientRect().top <= line) id = s.id; });
    $('section-jump').value = id;
  });
}, { passive: true });

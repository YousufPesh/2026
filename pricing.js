'use strict';

/* =========================================================================
   ALL PRICES LIVE IN THIS BLOCK.

   Each offering carries its own price list for on-tenant and hosted, and
   declares which shared questions its flow needs. Nothing is asked that
   the current selection does not use.

   ASSUMPTIONS, all flagged in the notes at the bottom of the page:
   - Infrastructure figures are MONTHLY. Licence figures are ANNUAL.
   - Licence and infrastructure pro-rate by term. A conversation or page
     tier is the volume for the whole term, so it does not pro-rate.
   - Onboarding is one-off and never pro-rates.
   ========================================================================= */

function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

const SIZES = {
  s: { label: 'Small', detail: 'up to 2,000 users', users: 2000 },
  m: { label: 'Mid', detail: 'up to 5,000 users', users: 5000 },
  l: { label: 'Large', detail: '10,000+ users', users: 10000 }
};

const TERMS = {
  '3': { label: '3 months', months: 3 },
  '6': { label: '6 months', months: 6 },
  '12': { label: '12 months', months: 12 }
};

const CONV_TIERS = [10000, 50000, 100000];

/* Hosted conversation bundles, shared by AI Studio, Recruitment, Retention. */
const HOSTED_CONV = { 10000: 3000, 50000: 12500, 100000: 27000 };
/* Running out mid-term: another 10,000 conversations. */
const CONV_TOPUP = { pages: 10000, price: 5000 };
/* On-tenant conversations run on your own AI spend. */
const TENANT_CONV_RATE = 1200 / 10000;   /* $1,200 per 10,000 = $0.12 */

const ACCESS = {
  tenant: { licenceMonthly: 3500, infraMonthly: 1000, onboarding: 5000, perPage: 0.15, includedPagesMonthly: 0 },
  saas: { licenceMonthly: 2500, infraMonthly: 1000, onboarding: 2500, includedPagesMonthly: 3000 },
  /* ASSUMPTION: rates as given were not monotonic ($0.35 at 10,000+ but
     $0.40 at 50,000+). Ordered here so more volume is always a better rate. */
  bundles: [
    { pages: 5000, rate: 0.45 },
    { pages: 10000, rate: 0.45 },
    { pages: 25000, rate: 0.45 },
    { pages: 50000, rate: 0.40 },
    { pages: 100000, rate: 0.35 },
    { pages: 1000000, rate: 0.35 }
  ],
  overage: { perPage: 0.50, minBlock: 1000, minCharge: 500 },
  customConnector: { simple: 5000, complex: 12000 }
};

const OFFERINGS = [
  {
    id: 'llmchat',
    name: 'LLM Chat',
    tagline: 'Every leading model, for everyone on campus',
    badge: 'BASE',
    excludes: ['aistudio'],
    needs: ['deployment', 'size', 'term'],
    includes: ['All frontier + open models', 'File attachments', 'Web search & code interpreter', 'Coach mode', 'Group chats', 'Cost controls'],
    from: 20000,
    price: {
      tenant: { onboarding: 5000, licence: { s: 20000, m: 25000, l: 30000 }, infraMonthly: { s: 1000, m: 2000, l: 3000 } },
      /* ASSUMPTION: hosted 100k extrapolated at the same $0.20 a conversation. */
      saas: { onboarding: 3000, licence: { s: 20000, m: 25000, l: 30000 }, conv: { 10000: 2000, 50000: 10000, 100000: 20000 } }
    },
    questions: [{ id: 'conv', type: 'tier', label: 'Conversations for the term', tiers: CONV_TIERS, def: '10000' }]
  },
  {
    id: 'aistudio',
    name: 'AI Studio + Agent Marketplace',
    tagline: 'Build, connect and govern your own agents',
    badge: 'INCLUDES LLM CHAT',
    excludes: ['llmchat'],
    needs: ['deployment', 'size', 'term'],
    includes: ['Everything in LLM Chat', 'Custom agents and knowledge bases', 'MCP, APIs, webhooks, crawlers', 'Orchestrator and sub-agents', 'Drag-and-drop workflows', 'Guardrails, RBAC, observability', '1,000 conversations a month included'],
    from: 50000,
    includedConvMonthly: 1000,
    price: {
      /* ASSUMPTION: onboarding not specified, taken from LLM Chat. */
      tenant: { onboarding: 5000, licence: { s: 50000, m: 70000, l: 100000 }, infraMonthly: { s: 2000, m: 3000, l: 4000 } },
      saas: { onboarding: 3000, licence: { s: 50000, m: 70000, l: 100000 }, conv: HOSTED_CONV }
    },
    questions: [{ id: 'conv', type: 'tier', label: 'Conversations for the term', tiers: CONV_TIERS, def: '10000' }]
  },
  {
    id: 'recruitment',
    name: 'Recruitment',
    tagline: 'Answer prospective students before they drift',
    badge: 'STANDALONE',
    needs: ['deployment', 'term'],
    includes: ['Orchestrator + program specialists', 'Website widget', 'CRM handoff with transcript', 'Human review queue'],
    from: 20000,
    price: {
      /* ASSUMPTION: onboarding not specified, left at zero. */
      tenant: { onboarding: 0, licence: 20000, infraMonthly: 1500 },
      saas: { onboarding: 0, licence: 20000, conv: HOSTED_CONV }
    },
    questions: [{ id: 'conv', type: 'tier', label: 'Conversations for the term', tiers: CONV_TIERS, def: '10000' }]
  },
  {
    id: 'retention',
    name: 'Retention',
    tagline: 'Turn early signals into coordinated outreach',
    badge: 'STANDALONE',
    needs: ['deployment', 'term'],
    includes: ['Signal rules you configure', 'Weights and action thresholds', 'Outreach spacing rules', 'Advisor context handoff'],
    from: 20000,
    price: {
      tenant: { onboarding: 0, licence: 20000, infraMonthly: 1500 },
      saas: { onboarding: 0, licence: 20000, conv: HOSTED_CONV }
    },
    questions: [{ id: 'conv', type: 'tier', label: 'Conversations for the term', tiers: CONV_TIERS, def: '10000' }]
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    tagline: 'Audit and remediate course materials at volume',
    badge: 'STANDALONE',
    needs: ['deployment', 'term'],
    ownPricing: true,
    includes: ['Audit and issue report', 'AI remediation with human review', 'Tag editor and revalidation', 'Course and department views'],
    from: ACCESS.tenant.licenceMonthly * 12,
    questions: [
      {
        id: 'integrations', type: 'multi', label: 'Integrations needed',
        options: [
          { v: 'sharepoint', l: 'SharePoint', add: 0, note: 'out of the box' },
          { v: 'canvas', l: 'Canvas', add: 0, note: 'out of the box' },
          { v: 'brightspace', l: 'Brightspace', add: 0, note: 'out of the box' },
          { v: 'blackboard', l: 'Blackboard', add: 0, note: 'out of the box' }
        ],
        def: ['canvas']
      },
      { id: 'customCount', type: 'slider', label: 'Custom connectors', min: 0, max: 6, step: 1, def: 0, note: 'built on request' },
      {
        id: 'customComplexity', type: 'single', label: 'How involved are they?',
        options: [
          { v: 'simple', l: 'Straightforward', note: fmt(ACCESS.customConnector.simple) + ' each' },
          { v: 'complex', l: 'Complex', note: fmt(ACCESS.customConnector.complex) + ' each' }
        ],
        def: 'simple'
      },
      {
        id: 'bundle', type: 'tier', label: 'Pages for the term, bought up front',
        tiers: ACCESS.bundles.map(b => b.pages), def: '25000'
      }
    ]
  },
  {
    id: 'fabric',
    name: 'Fabric + Ontology',
    tagline: 'One governed layer under every use case',
    badge: 'ADD-ON',
    needs: ['term'],
    includes: ['Discovery and source mapping', 'Medallion pipeline into OneLake', 'Ontology and semantic model', 'Row and column security, Purview'],
    from: 50000,
    price: {
      tenant: { onboarding: 0, licence: 50000, infraMonthly: 1500 },
      saas: { onboarding: 0, licence: 50000, infraMonthly: 1500 }
    },
    perSystem: 2500,
    includedSystems: 4,
    questions: [{ id: 'systems', type: 'slider', label: 'Source systems to bring in', min: 2, max: 20, step: 1, def: 4, note: 'first 4 included' }]
  }
];

const SHARED = {
  deployment: {
    id: 'deployment', type: 'single', label: 'Where should it run?',
    options: [
      { v: 'tenant', l: 'Your own tenant', note: 'you carry the cloud bill' },
      { v: 'saas', l: 'Hosted by CampusMind', note: 'one number, we run it' }
    ],
    def: 'tenant'
  },
  size: {
    id: 'size', type: 'single', label: 'How big is your institution?',
    options: Object.keys(SIZES).map(k => ({ v: k, l: SIZES[k].label, note: SIZES[k].detail })),
    def: 'm'
  },
  term: {
    id: 'term', type: 'single', label: 'Agreement period',
    options: Object.keys(TERMS).map(k => ({ v: k, l: TERMS[k].label })),
    def: '12'
  }
};

/* ========================== end of price block ========================== */

const $ = id => document.getElementById(id);
const announce = m => { $('live').textContent = m; };
function offering(id) { return OFFERINGS.find(o => o.id === id); }

const OFFERING_ICONS = {
  llmchat: '<path d="M21 13a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',
  aistudio: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  recruitment: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2"/>',
  retention: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M7 12h3l1-2 2 4 1-2h3"/>',
  accessibility: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  fabric: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>'
};
function offeringIcon(id) {
  return `<span class="offer-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${OFFERING_ICONS[id] || OFFERING_ICONS.llmchat}</svg></span>`;
}

const state = { picked: [], answers: {} };
function seedDefaults() {
  Object.values(SHARED).forEach(q => { state.answers[q.id] = q.def; });
  OFFERINGS.forEach(o => (o.questions || []).forEach(q => {
    state.answers[o.id + '.' + q.id] = Array.isArray(q.def) ? [...q.def] : q.def;
  }));
}
seedDefaults();

/* which shared questions does the current selection actually use */
function neededShared() {
  const set = new Set();
  state.picked.forEach(id => (offering(id).needs || []).forEach(n => set.add(n)));
  return ['deployment', 'size', 'term'].filter(k => set.has(k));
}
function deployment() { return state.answers.deployment === 'saas' ? 'saas' : 'tenant'; }
function months() { return TERMS[state.answers.term].months; }
function proRata() { return months() / 12; }

/* ---------------- offering cards ---------------- */
function renderOfferings() {
  $('offer-grid').innerHTML = OFFERINGS.map(o => {
    const on = state.picked.includes(o.id);
    return `<button type="button" class="offer" data-offer="${o.id}" aria-pressed="${on}">
      ${offeringIcon(o.id)}
      <span class="offer-top"><span class="offer-badge">${o.badge}</span><span class="offer-tick" aria-hidden="true">${on ? '✓' : ''}</span></span>
      <strong>${o.name}</strong>
      <span class="offer-tag">${o.tagline}</span>
      <span class="offer-price">from ${fmt(o.from)}<i> / yr</i></span>
    </button>`;
  }).join('');
}
$('offer-grid').addEventListener('click', ev => {
  const b = ev.target.closest('[data-offer]');
  if (!b) return;
  const id = b.dataset.offer, o = offering(id);
  if (state.picked.includes(id)) {
    state.picked = state.picked.filter(x => x !== id);
  } else {
    state.picked.push(id);
    (o.excludes || []).forEach(x => { state.picked = state.picked.filter(y => y !== x); });
  }
  renderAll();
  announce(`${o.name} ${state.picked.includes(id) ? 'added' : 'removed'}.`);
});

/* ---------------- question rendering ---------------- */
function questionHTML(q, key) {
  const val = state.answers[key];
  let body = '';
  if (q.type === 'single') {
    body = `<div class="opts" role="radiogroup" aria-label="${q.label}">` + q.options.map(o =>
      `<button type="button" class="opt" role="radio" data-key="${key}" data-val="${o.v}" aria-checked="${val === o.v}">
        <span class="opt-l">${o.l}</span>${o.note ? `<span class="opt-n">${o.note}</span>` : ''}<span class="control-mark" aria-hidden="true">•</span>
      </button>`).join('') + '</div>';
  } else if (q.type === 'multi') {
    body = `<div class="opts" role="group" aria-label="${q.label}">` + q.options.map(o =>
      `<button type="button" class="opt" data-key="${key}" data-val="${o.v}" data-multi="1" aria-pressed="${val.includes(o.v)}">
        <span class="opt-l">${o.l}</span><span class="opt-n${o.add ? ' is-paid' : ''}">${o.add ? '+' + fmt(o.add) + ' · ' + o.note : o.note}</span><span class="control-mark" aria-hidden="true">✓</span>
      </button>`).join('') + '</div>';
  } else if (q.type === 'tier') {
    const oid = key.split('.')[0];
    body = `<div class="opts is-tiers" role="radiogroup" aria-label="${q.label}">` + q.tiers.map(t => {
      const cost = tierCost(oid, t);
      return `<button type="button" class="opt" role="radio" data-key="${key}" data-val="${t}" aria-checked="${String(val) === String(t)}">
        <span class="opt-l">${t.toLocaleString()}</span><span class="opt-n">${cost === null ? 'included' : fmt(cost)}</span><span class="control-mark" aria-hidden="true">•</span>
      </button>`;
    }).join('') + '</div>';
  } else if (q.type === 'slider') {
    body = `<div class="range-row">
        <input type="range" id="r-${key}" data-key="${key}" min="${q.min}" max="${q.max}" step="${q.step}" value="${val}" aria-label="${q.label}">
        <output for="r-${key}">${Number(val).toLocaleString()}${q.unit || ''}</output>
      </div>`;
  }
  return `<div class="qblock"><span class="qlabel">${q.label}${q.note ? ` <i>${q.note}</i>` : ''}</span>${body}</div>`;
}

function renderAbout() {
  const needed = neededShared();
  $('about').hidden = needed.length === 0;
  $('about-questions').innerHTML = needed.map(k => questionHTML(SHARED[k], k)).join('');
}

function renderDetail() {
  const picked = OFFERINGS.filter(o => state.picked.includes(o.id) && (o.questions || []).length);
  $('detail').hidden = picked.length === 0;
  $('detail-questions').innerHTML = picked.map(o =>
    `<div class="qgroup"><h3>${o.name}</h3>` +
    `<p class="qgroup-inc">${o.includes.map(i => `<span>${i}</span>`).join('')}</p>` +
    o.questions.map(q => questionHTML(q, o.id + '.' + q.id)).join('') + '</div>'
  ).join('');
}

document.addEventListener('click', ev => {
  const b = ev.target.closest('.opt');
  if (!b) return;
  const key = b.dataset.key, v = b.dataset.val;
  if (b.dataset.multi) {
    const arr = state.answers[key];
    state.answers[key] = arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
  } else {
    state.answers[key] = v;
  }
  renderAll();
});
document.addEventListener('input', ev => {
  const r = ev.target;
  if (r.type !== 'range' || !r.dataset.key) return;
  state.answers[r.dataset.key] = Number(r.value);
  const out = r.parentElement.querySelector('output');
  if (out) out.textContent = Number(r.value).toLocaleString();
  renderAll();
});

/* ---------------- the maths ---------------- */
function tierCost(oid, tier) {
  const o = offering(oid);
  const dep = deployment();
  if (o.id === 'accessibility') {
    const plan = ACCESS[dep];
    const bundle = ACCESS.bundles.find(b => b.pages === Number(tier));
    const included = plan.includedPagesMonthly * months();
    const chargeable = Math.max(0, Number(tier) - included);
    if (!chargeable) return null;
    return chargeable * (dep === 'saas' ? bundle.rate : plan.perPage);
  }
  const plan = o.price && o.price[dep];
  if (!plan) return null;
  const included = (o.includedConvMonthly || 0) * months();
  const chargeable = Math.max(0, Number(tier) - included);
  if (!chargeable) return null;
  if (plan.conv) {
    const exact = plan.conv[tier];
    if (exact !== undefined) return exact;
    return Number(tier) * (HOSTED_CONV[10000] / 10000);
  }
  return chargeable * TENANT_CONV_RATE;
}

function accessibilityQuote() {
  const dep = deployment();
  const plan = ACCESS[dep];
  const pages = Number(state.answers['accessibility.bundle']);
  const lic = plan.licenceMonthly * months();
  const inf = plan.infraMonthly * months();
  const use = tierCost('accessibility', pages) || 0;
  const items = ['onboarding'];
  let oneOff = plan.onboarding;
  const n = state.answers['accessibility.customCount'];
  if (n > 0) {
    oneOff += n * ACCESS.customConnector[state.answers['accessibility.customComplexity']];
    items.push(`${n} custom connector${n > 1 ? 's' : ''}`);
  }
  return { lic, inf, use, oneOff, items, pages, included: plan.includedPagesMonthly * months() };
}

function offeringQuote(o) {
  if (o.ownPricing) return accessibilityQuote();
  const dep = deployment();
  const plan = o.price[dep];
  const size = state.answers.size;
  const licYear = typeof plan.licence === 'object' ? plan.licence[size] : plan.licence;
  const lic = licYear * proRata();
  const inf = plan.infraMonthly
    ? (typeof plan.infraMonthly === 'object' ? plan.infraMonthly[size] : plan.infraMonthly) * months()
    : 0;
  const items = [];
  let oneOff = plan.onboarding || 0;
  if (oneOff) items.push('onboarding');
  let use = 0;
  const q = (o.questions || []).find(x => x.type === 'tier');
  if (q) use = tierCost(o.id, Number(state.answers[o.id + '.' + q.id])) || 0;
  if (o.id === 'fabric') {
    const extra = Math.max(0, state.answers['fabric.systems'] - o.includedSystems);
    if (extra) { oneOff += extra * o.perSystem; items.push(`${extra} extra source system${extra > 1 ? 's' : ''}`); }
  }
  return { lic, inf, use, oneOff, items };
}

function calculate() {
  const rows = [];
  let license = 0, infra = 0, ai = 0, oneOff = 0;
  state.picked.forEach(id => {
    const o = offering(id);
    const q = offeringQuote(o);
    license += q.lic; infra += q.inf; ai += q.use; oneOff += q.oneOff;
    rows.push({ name: o.name, lic: q.lic, inf: q.inf, use: q.use, add: { total: q.oneOff, items: q.items } });
  });
  return { rows, license, infra, ai, oneOff, total: license + infra + ai + oneOff };
}

/* ---------------- tier visibility ---------------- */
function renderTiers() {
  const picked = OFFERINGS.filter(o => state.picked.includes(o.id) && (o.questions || []).some(q => q.type === 'tier'));
  $('usage').hidden = picked.length === 0;
  if (!picked.length) { $('tier-grid').innerHTML = ''; return; }
  const dep = deployment();
  $('tier-grid').innerHTML = picked.map(o => {
    const q = o.questions.find(x => x.type === 'tier');
    const unit = o.id === 'accessibility' ? 'pages' : 'conversations';
    const chosen = String(state.answers[o.id + '.' + q.id]);
    const max = Math.max(...q.tiers.map(t => tierCost(o.id, t) || 0)) || 1;
    return `<div class="tier-card"><h3>${o.name}</h3>` + q.tiers.map(t => {
      const c = tierCost(o.id, t);
      const on = String(t) === chosen;
      return `<div class="tier-row${on ? ' is-on' : ''}">
        <span class="tier-bar"><i style="width:${Math.max(2, ((c || 0) / max) * 100)}%"></i></span>
        <span class="tier-n">${t.toLocaleString()} ${unit}</span>
        <strong>${c === null ? 'included' : fmt(c)}</strong>
      </div>`;
    }).join('') + `<p class="tier-note">${dep === 'saas' ? 'Hosted bundle, bought up front.' : 'On your own AI spend.'}</p></div>`;
  }).join('');
}

/* ---------------- quote ---------------- */
function renderQuote(q) {
  if (!state.picked.length) {
    $('quote-table').innerHTML = '<p class="empty">Pick at least one product above.</p>';
    $('quote-assumptions').textContent = '';
    return;
  }
  let html = '<table><thead><tr><th>Product</th><th>Licence</th><th>Infra</th><th>Usage</th><th>One-off</th></tr></thead><tbody>';
  q.rows.forEach(r => {
    html += `<tr><td class="lab">${r.name}${r.add.items.length ? `<span class="row-note">${r.add.items.join(' · ')}</span>` : ''}</td>` +
      `<td class="n">${fmt(r.lic)}</td><td class="n">${r.inf ? fmt(r.inf) : '—'}</td>` +
      `<td class="n">${r.use ? fmt(r.use) : '—'}</td><td class="n">${r.add.total ? fmt(r.add.total) : '—'}</td></tr>`;
  });
  html += `</tbody><tfoot><tr><td class="lab">${TERMS[state.answers.term].label} total</td><td class="n">${fmt(q.license)}</td><td class="n">${q.infra ? fmt(q.infra) : '—'}</td><td class="n">${fmt(q.ai)}</td><td class="n">${fmt(q.oneOff)}</td></tr></tfoot></table>`;
  $('quote-table').innerHTML = html;

  const a = [];
  const needed = neededShared();
  if (needed.includes('size')) a.push(`${SIZES[state.answers.size].label} institution, ${SIZES[state.answers.size].detail}.`);
  a.push(deployment() === 'saas' ? 'Hosted by CampusMind.' : 'Your own tenant, so infrastructure is your cloud spend.');
  a.push(`${TERMS[state.answers.term].label} agreement. Licence and infrastructure pro-rate by term; onboarding does not.`);
  if (state.picked.includes('accessibility')) {
    const v = accessibilityQuote();
    a.push(v.included
      ? `Accessibility: ${v.included.toLocaleString()} pages carried by the hosting, the rest prepaid. Extra pages are $${ACCESS.overage.perPage.toFixed(2)}, minimum ${fmt(ACCESS.overage.minCharge)} per ${ACCESS.overage.minBlock.toLocaleString()}.`
      : `Accessibility: pages run on your own AI spend at $${ACCESS.tenant.perPage.toFixed(2)}.`);
  }
  if (state.picked.includes('aistudio')) a.push(`AI Studio carries 1,000 conversations a month. Running out mid-term adds ${CONV_TOPUP.pages.toLocaleString()} for ${fmt(CONV_TOPUP.price)}.`);
  a.push('Indicative only. Usage is billed on what you actually use.');
  $('quote-assumptions').textContent = a.join(' ');
}

function renderTotalBar(q) {
  $('tb-total').textContent = state.picked.length ? fmt(q.total) : '$0';
  $('tb-label').textContent = state.picked.length ? `${TERMS[state.answers.term].label}, all in` : 'Nothing selected';
  $('tb-detail').innerHTML = state.picked.length
    ? `<span><i>Licence</i>${fmt(q.license)}</span><span><i>Infrastructure</i>${q.infra ? fmt(q.infra) : '—'}</span><span><i>Usage</i>${fmt(q.ai)}</span><span><i>One-off</i>${fmt(q.oneOff)}</span>`
    : '<span>Pick a product to see a number.</span>';
}
$('tb-toggle').addEventListener('click', () => {
  const open = $('tb-detail').hidden;
  $('tb-detail').hidden = !open;
  $('tb-toggle').setAttribute('aria-expanded', String(open));
});

/* ---------------- copy + reset ---------------- */
$('copy-quote').addEventListener('click', () => {
  const q = calculate();
  const lines = ['CampusMind — indicative quote', ''];
  if (neededShared().includes('size')) lines.push(`Institution: ${SIZES[state.answers.size].label}, ${SIZES[state.answers.size].detail}`);
  lines.push(`Deployment: ${deployment() === 'saas' ? 'Hosted by CampusMind' : 'Your own tenant'}`);
  lines.push(`Term: ${TERMS[state.answers.term].label}`);
  lines.push('');
  q.rows.forEach(r => {
    lines.push(r.name);
    lines.push(`  Licence      ${fmt(r.lic)}`);
    if (r.inf) lines.push(`  Infra        ${fmt(r.inf)}`);
    if (r.use) lines.push(`  Usage        ${fmt(r.use)}`);
    if (r.add.total) lines.push(`  One-off      ${fmt(r.add.total)}  (${r.add.items.join(', ')})`);
  });
  lines.push('');
  lines.push(`TOTAL (${TERMS[state.answers.term].label}): ${fmt(q.total)}`);
  lines.push('');
  lines.push('Indicative only, not a contract.');
  const btn = $('copy-quote');
  const done = () => { btn.textContent = 'Copied'; announce('Quote copied.'); setTimeout(() => { btn.textContent = 'Copy quote'; }, 1600); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(lines.join('\n')).then(done, done);
  else done();
});

$('reset-all').addEventListener('click', () => {
  state.picked = [];
  seedDefaults();
  renderAll();
  announce('Reset.');
});

/* ---------------- render ---------------- */
function renderAll() {
  renderOfferings();
  renderAbout();
  renderDetail();
  renderTiers();
  const q = calculate();
  renderQuote(q);
  renderTotalBar(q);
}
renderAll();

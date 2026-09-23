'use strict';

/* =========================================================================
   ALL TUNABLE NUMBERS LIVE IN THIS BLOCK.
   Every figure below is a ballpark from the pricing conversation and is
   meant to be argued with. Change a number here and the whole page follows.
   ========================================================================= */

const SIZES = {
  s: { label: 'Under 2,000', population: 1500, infraMult: 0.75 },
  m: { label: '2,000 – 10,000', population: 5000, infraMult: 1.0 },
  l: { label: '10,000 – 25,000', population: 16000, infraMult: 1.4 },
  x: { label: '25,000+', population: 32000, infraMult: 1.9 }
};

/* Cost to serve one conversation, by how much work it does.
   Calibrated so a 5,000-student school at default adoption lands near
   $1,000/month of AI usage, which buys roughly 1,000 conversations. */
const CONV_COST = {
  simple: { label: 'Simple chat', cost: 0.35, note: 'a question and an answer' },
  prompt: { label: 'Prompt-based', cost: 0.60, note: 'a configured persona or template' },
  knowledge: { label: 'Knowledge base', cost: 1.40, note: 'retrieves from your documents' },
  tool: { label: 'Tool-calling', cost: 2.80, note: 'reaches into a live system' },
  agentic: { label: 'Multi-step agent', cost: 5.60, note: 'plans, calls several tools, checks itself' }
};

const FRONTIER_MULT = 1.8;   /* enabling top-tier models */
/* Hosted by us: the infrastructure line is folded into the licence and
   carries our margin, so hosted is always dearer than running it yourself. */
const SAAS_HOSTING_MARGIN = 1.25;
const MULTIYEAR_DISCOUNT = 0.10; /* 24-month commitment, on licence only */
const PILOT_PRICE = 10000;       /* 3 months, flat, any single product */

const CUSTOM_INTEGRATION = { simple: 5000, complex: 8000 };

const FABRIC = { license: 50000, perSystem: 2500, includedSystems: 4 };

/* -------------------------------------------------------------------------
   ACCESSIBILITY prices differently from everything else, so it has its own
   block. Monthly figures, because that is how it was quoted.

   On tenant  : $3,500 licence + $1,000 infrastructure a month, $5,000 to
                onboard, and pages run on your own AI spend at $0.15.
   Hosted     : $2,500 licence + $1,000 infrastructure a month, which carries
                3,000 pages, $2,500 to onboard. Pages beyond that come from a
                prepaid bundle, or cost $0.50 each with a $500 minimum.

   ASSUMPTION — the bundle rates as given were not monotonic ($0.35 at
   10,000+ but $0.40 at 50,000+, which prices volume upwards). They are
   ordered here so a bigger commitment is always a better rate. Confirm.
   ------------------------------------------------------------------------- */
const ACCESS = {
  tenant: { licenceMonthly: 3500, infraMonthly: 1000, onboarding: 5000, perPage: 0.15, includedPagesMonthly: 0 },
  saas: { licenceMonthly: 2500, infraMonthly: 1000, onboarding: 2500, includedPagesMonthly: 3000 },
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
    includes: ['All frontier + open models', 'File attachments', 'Web search & code interpreter', 'Coach mode', 'Group chats', 'Cost controls per user and group'],
    license: 20000,
    infra: 12000,
    convMix: { simple: 0.55, prompt: 0.35, knowledge: 0.10 },
    questions: [
      {
        id: 'models', type: 'multi', label: 'Which model providers?',
        options: [
          { v: 'openai', l: 'OpenAI', add: 0, note: 'included' },
          { v: 'anthropic', l: 'Anthropic', add: 0, note: 'included' },
          { v: 'google', l: 'Google Gemini', add: 3000, note: '+ GCP footprint' },
          { v: 'oss', l: 'Open source (Llama, Mistral)', add: 0, note: 'included' },
          { v: 'sonar', l: 'Perplexity Sonar', add: 2000, note: '+ connector' }
        ],
        def: ['openai', 'anthropic', 'oss']
      },
      {
        id: 'frontier', type: 'single', label: 'Frontier models enabled?',
        options: [
          { v: 'yes', l: 'Yes, best available', note: 'higher AI cost per conversation' },
          { v: 'no', l: 'Cap at mid-tier', note: 'cheaper, still capable' }
        ],
        def: 'yes'
      },
      { id: 'adoption', type: 'slider', label: 'Share of people active each month', min: 5, max: 60, step: 5, def: 10, unit: '%' },
      { id: 'convs', type: 'slider', label: 'Conversations per active person each month', min: 1, max: 30, step: 1, def: 2 }
    ]
  },
  {
    id: 'agents',
    name: 'Agent Marketplace + AI Studio',
    tagline: 'Build, connect and govern your own agents',
    requires: 'llmchat',
    topUp: true,
    includes: ['Custom agents with knowledge bases', 'MCP servers, APIs, webhooks, crawlers', 'Orchestrator and sub-agents', 'Drag-and-drop workflows', 'Guardrails and role-based access', 'Traceability and observability', 'Voice: speech-to-speech and dictation', '3–5 agents built by our team'],
    license: 35000,
    infra: 13000,
    convMix: { knowledge: 0.35, tool: 0.45, agentic: 0.20 },
    questions: [
      { id: 'agentCount', type: 'slider', label: 'Agents in year one', min: 3, max: 25, step: 1, def: 5, unit: '', note: 'first 5 built by us' },
      {
        id: 'connectors', type: 'multi', label: 'Systems to connect',
        options: [
          { v: 'canvas', l: 'Canvas', add: 0, note: 'out of the box' },
          { v: 'slate', l: 'Slate', add: 0, note: 'out of the box' },
          { v: 'sharepoint', l: 'SharePoint', add: 0, note: 'out of the box' },
          { v: 'banner', l: 'Banner / Ellucian', add: 5000, note: 'custom' },
          { v: 'workday', l: 'Workday', add: 5000, note: 'custom' },
          { v: 'servicenow', l: 'ServiceNow', add: 5000, note: 'custom' },
          { v: 'other', l: 'Something we have not seen', add: 8000, note: 'scoped on a call' }
        ],
        def: ['canvas', 'sharepoint']
      },
      { id: 'agentAdoption', type: 'slider', label: 'Share of people using agents monthly', min: 2, max: 60, step: 2, def: 8, unit: '%' },
      { id: 'agentConvs', type: 'slider', label: 'Agent conversations per active person each month', min: 1, max: 20, step: 1, def: 1 }
    ]
  },
  {
    id: 'recruitment',
    name: 'Recruitment',
    tagline: 'Answer prospective students before they drift',
    standalone: true,
    includes: ['Orchestrator + program specialists', 'Website widget', 'CRM handoff with full transcript', 'Human review queue', 'Guardrails and escalation rules'],
    license: 20000,
    infra: 6000,
    convMix: { knowledge: 0.45, tool: 0.40, agentic: 0.15 },
    questions: [
      {
        id: 'crm', type: 'single', label: 'Where do leads land?',
        options: [
          { v: 'slate', l: 'Slate', add: 0, note: 'out of the box' },
          { v: 'salesforce', l: 'Salesforce Education Cloud', add: 0, note: 'out of the box' },
          { v: 'targetx', l: 'TargetX', add: 5000, note: 'custom' },
          { v: 'none', l: 'Something else', add: 5000, note: 'scoped on a call' }
        ],
        def: 'slate'
      },
      {
        id: 'channels', type: 'multi', label: 'Channels',
        options: [
          { v: 'web', l: 'Website widget', add: 0, note: 'included' },
          { v: 'email', l: 'Email', add: 0, note: 'included' },
          { v: 'sms', l: 'SMS', add: 4000, note: '+ gateway' },
          { v: 'whatsapp', l: 'WhatsApp', add: 4000, note: '+ gateway' }
        ],
        def: ['web']
      },
      { id: 'inquiries', type: 'slider', label: 'Prospect conversations each month', min: 100, max: 6000, step: 100, def: 300 }
    ]
  },
  {
    id: 'retention',
    name: 'Retention',
    tagline: 'Turn early signals into coordinated outreach',
    standalone: true,
    includes: ['Signal rules you configure', 'Weights and action thresholds', 'Outreach spacing rules', 'Advisor context handoff', 'Full contact history'],
    license: 20000,
    infra: 6000,
    convMix: { knowledge: 0.40, tool: 0.40, agentic: 0.20 },
    questions: [
      {
        id: 'signals', type: 'multi', label: 'Signal sources',
        options: [
          { v: 'sis', l: 'SIS (grades, registration)', add: 0, note: 'included' },
          { v: 'lms', l: 'LMS (activity, submissions)', add: 0, note: 'included' },
          { v: 'success', l: 'Success platform (Navigate, Starfish)', add: 0, note: 'included' },
          { v: 'finance', l: 'Bursar / financial holds', add: 5000, note: 'custom' },
          { v: 'engagement', l: 'Engagement / clubs', add: 5000, note: 'custom' }
        ],
        def: ['sis', 'lms']
      },
      { id: 'monitored', type: 'slider', label: 'Students monitored', min: 500, max: 40000, step: 500, def: 5000 },
      {
        id: 'outreach', type: 'multi', label: 'Outreach channels',
        options: [
          { v: 'email', l: 'Email', add: 0, note: 'included' },
          { v: 'portal', l: 'Student portal', add: 0, note: 'included' },
          { v: 'sms', l: 'SMS', add: 4000, note: '+ gateway' }
        ],
        def: ['email']
      }
    ]
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    tagline: 'Audit and remediate course materials at volume',
    standalone: true,
    volumeBased: true,
    includes: ['Audit and issue report', 'AI remediation with human review', 'Tag editor and revalidation', 'Course and department views'],
    license: ACCESS.tenant.licenceMonthly * 12,
    infra: ACCESS.tenant.infraMonthly * 12,
    ownPricing: true,
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
        id: 'bundle', type: 'single', label: 'Pages a year, bought up front',
        options: ACCESS.bundles.map(b => ({
          v: String(b.pages),
          l: b.pages.toLocaleString() + ' pages',
          note: '$' + b.rate.toFixed(2) + ' a page'
        })),
        def: '25000'
      }
    ]
  },
  {
    id: 'fabric',
    name: 'Fabric + Ontology',
    tagline: 'One governed layer under every use case',
    addOn: true,
    includes: ['Discovery and source mapping', 'Medallion pipeline into OneLake', 'Ontology and semantic model', 'Row and column security, Purview', 'Data agents over the layer'],
    license: FABRIC.license,
    infra: 18000,
    questions: [
      { id: 'systems', type: 'slider', label: 'Source systems to bring in', min: 2, max: 20, step: 1, def: 4, note: 'first 4 included' }
    ]
  }
];

const ABOUT_QUESTIONS = [
  {
    id: 'size', type: 'single', label: 'How big is your institution?',
    options: Object.keys(SIZES).map(k => ({ v: k, l: SIZES[k].label })),
    def: 'm'
  },
  {
    id: 'deployment', type: 'single', label: 'Where should it run?',
    options: [
      { v: 'tenant', l: 'Our own tenant', note: 'you own the data and the Azure bill' },
      { v: 'saas', l: 'Hosted by CampusMind', note: 'one number, we run it' }
    ],
    def: 'tenant'
  },
  {
    id: 'term', type: 'single', label: 'How long?',
    options: [
      { v: 'pilot', l: '3-month pilot', note: 'flat ' + fmt(PILOT_PRICE) },
      { v: 'year', l: '12 months', note: 'standard' },
      { v: 'multi', l: '24 months', note: Math.round(MULTIYEAR_DISCOUNT * 100) + '% off licence' }
    ],
    def: 'year'
  }
];

/* ========================== end of tunable block ========================== */

const $ = id => document.getElementById(id);
const announce = m => { $('live').textContent = m; };
function fmt(n) { return '$' + Math.round(n).toLocaleString(); }
function offering(id) { return OFFERINGS.find(o => o.id === id); }

const OFFERING_ICONS = {
  llmchat: '<path d="M21 13a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',
  agents: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  recruitment: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2"/>',
  retention: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M7 12h3l1-2 2 4 1-2h3"/>',
  accessibility: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  fabric: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>'
};
function offeringIcon(id) {
  return `<span class="offer-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${OFFERING_ICONS[id] || OFFERING_ICONS.llmchat}</svg></span>`;
}

const state = { picked: [], answers: {} };

/* seed defaults */
ABOUT_QUESTIONS.forEach(q => { state.answers[q.id] = Array.isArray(q.def) ? [...q.def] : q.def; });
OFFERINGS.forEach(o => o.questions.forEach(q => {
  state.answers[o.id + '.' + q.id] = Array.isArray(q.def) ? [...q.def] : q.def;
}));

/* ---------------- offering cards ---------------- */
function renderOfferings() {
  $('offer-grid').innerHTML = OFFERINGS.map(o => {
    const on = state.picked.includes(o.id);
    const badge = o.addOn ? 'ADD-ON' : o.topUp ? 'TOP-UP' : o.standalone ? 'STANDALONE' : 'BASE';
    return `<button type="button" class="offer" data-offer="${o.id}" aria-pressed="${on}">
      ${offeringIcon(o.id)}
      <span class="offer-top"><span class="offer-badge">${badge}</span><span class="offer-tick" aria-hidden="true">${on ? '✓' : ''}</span></span>
      <strong>${o.name}</strong>
      <span class="offer-tag">${o.tagline}</span>
      <span class="offer-price">${o.topUp ? '+ ' : ''}${fmt(o.license)}<i> licence / yr</i></span>
    </button>`;
  }).join('');
}
$('offer-grid').addEventListener('click', ev => {
  const b = ev.target.closest('[data-offer]');
  if (!b) return;
  const id = b.dataset.offer;
  const o = offering(id);
  if (state.picked.includes(id)) {
    state.picked = state.picked.filter(x => x !== id);
    /* dropping LLM Chat drops anything that needs it */
    OFFERINGS.filter(x => x.requires === id).forEach(x => {
      state.picked = state.picked.filter(y => y !== x.id);
    });
  } else {
    state.picked.push(id);
    if (o.requires && !state.picked.includes(o.requires)) state.picked.push(o.requires);
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
  } else if (q.type === 'slider') {
    body = `<div class="range-row">
        <input type="range" id="r-${key}" data-key="${key}" min="${q.min}" max="${q.max}" step="${q.step}" value="${val}" aria-label="${q.label}">
        <output for="r-${key}">${Number(val).toLocaleString()}${q.unit || ''}</output>
      </div>`;
  }
  return `<div class="qblock"><span class="qlabel">${q.label}${q.note ? ` <i>${q.note}</i>` : ''}</span>${body}</div>`;
}

function renderAbout() {
  $('about-questions').innerHTML = ABOUT_QUESTIONS.map(q => questionHTML(q, q.id)).join('');
}

function renderDetail() {
  const picked = OFFERINGS.filter(o => state.picked.includes(o.id));
  $('detail').hidden = picked.length === 0;
  if (state.answers.term === 'pilot') {
    $('detail-questions').innerHTML = `<p class="pilot-note">A 3-month pilot is a flat ${fmt(PILOT_PRICE)} for one product, run on our hosted environment. The questions below still shape the full-term number.</p>` +
      picked.map(groupHTML).join('');
    return;
  }
  $('detail-questions').innerHTML = picked.map(groupHTML).join('');
}
function groupHTML(o) {
  return `<div class="qgroup"><h3>${o.name}</h3>` +
    `<p class="qgroup-inc">${o.includes.map(i => `<span>${i}</span>`).join('')}</p>` +
    o.questions.map(q => questionHTML(q, o.id + '.' + q.id)).join('') + '</div>';
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
  const q = findQuestion(r.dataset.key);
  if (out) out.textContent = Number(r.value).toLocaleString() + ((q && q.unit) || '');
  calcAndRenderQuote();
});
function findQuestion(key) {
  if (!key.includes('.')) return ABOUT_QUESTIONS.find(q => q.id === key);
  const [oid, qid] = key.split('.');
  const o = offering(oid);
  return o && o.questions.find(q => q.id === qid);
}

/* ---------------- the maths ---------------- */
function addOnsFor(o) {
  let total = 0;
  const items = [];
  o.questions.forEach(q => {
    const val = state.answers[o.id + '.' + q.id];
    if (q.type === 'multi') {
      q.options.filter(op => op.add && val.includes(op.v)).forEach(op => { total += op.add; items.push(op.l); });
    } else if (q.type === 'single') {
      const op = q.options.find(x => x.v === val);
      if (op && op.add) { total += op.add; items.push(op.l); }
    }
  });
  if (o.id === 'agents') {
    const extra = Math.max(0, state.answers['agents.agentCount'] - 5);
    if (extra) { total += extra * 4000; items.push(`${extra} extra agent${extra > 1 ? 's' : ''}`); }
  }
  if (o.id === 'fabric') {
    const extra = Math.max(0, state.answers['fabric.systems'] - FABRIC.includedSystems);
    if (extra) { total += extra * FABRIC.perSystem; items.push(`${extra} extra source system${extra > 1 ? 's' : ''}`); }
  }
  return { total, items };
}

function blendedConvCost(mix, frontier) {
  let c = 0;
  for (const k in mix) c += CONV_COST[k].cost * mix[k];
  return c * (frontier ? FRONTIER_MULT : 1);
}

function aiCostFor(o, size) {
  const frontier = state.answers['llmchat.frontier'] === 'yes' && state.picked.includes('llmchat');
  const pop = SIZES[size].population;
  if (o.id === 'llmchat') {
    const active = pop * (state.answers['llmchat.adoption'] / 100);
    const convs = active * state.answers['llmchat.convs'] * 12;
    return convs * blendedConvCost(o.convMix, frontier);
  }
  if (o.id === 'agents') {
    const active = pop * (state.answers['agents.agentAdoption'] / 100);
    const convs = active * state.answers['agents.agentConvs'] * 12;
    return convs * blendedConvCost(o.convMix, frontier);
  }
  if (o.id === 'recruitment') {
    return state.answers['recruitment.inquiries'] * 12 * blendedConvCost(o.convMix, frontier);
  }
  if (o.id === 'retention') {
    /* outreach is generated per monitored student, not per conversation */
    return state.answers['retention.monitored'] * 0.5 * blendedConvCost(o.convMix, frontier);
  }
  return 0;
}

function accessibilityQuote() {
  const saas = state.answers.deployment === 'saas';
  const plan = saas ? ACCESS.saas : ACCESS.tenant;
  const pages = Number(state.answers['accessibility.bundle']);
  const bundle = ACCESS.bundles.find(b => b.pages === pages) || ACCESS.bundles[0];

  const lic = plan.licenceMonthly * 12;
  const inf = plan.infraMonthly * 12;
  const includedPages = plan.includedPagesMonthly * 12;

  let use, rate, chargeable;
  if (saas) {
    chargeable = Math.max(0, pages - includedPages);
    rate = bundle.rate;
    use = chargeable * rate;
  } else {
    chargeable = pages;
    rate = plan.perPage;
    use = pages * rate;
  }

  const items = [];
  let oneOff = plan.onboarding;
  items.push('onboarding');

  const customCount = state.answers['accessibility.customCount'];
  if (customCount > 0) {
    const each = ACCESS.customConnector[state.answers['accessibility.customComplexity']];
    oneOff += customCount * each;
    items.push(`${customCount} custom connector${customCount > 1 ? 's' : ''}`);
  }

  return { lic, inf, use, oneOff, items, pages, rate, chargeable, includedPages, saas, onboarding: plan.onboarding };
}

function calculate() {
  const size = state.answers.size;
  const saas = state.answers.deployment === 'saas';
  const multi = state.answers.term === 'multi';
  const rows = [];
  let license = 0, infra = 0, ai = 0, oneOff = 0;

  state.picked.forEach(id => {
    const o = offering(id);

    /* Accessibility carries its own price list and ignores the shared
       size, hosting-margin and multi-year rules. */
    if (o.ownPricing) {
      const a = accessibilityQuote();
      let lic = a.lic;
      if (multi) lic *= (1 - MULTIYEAR_DISCOUNT);
      license += lic;
      infra += a.inf;
      ai += a.use;
      oneOff += a.oneOff;
      rows.push({ name: o.name, lic, inf: a.inf, use: a.use, add: { total: a.oneOff, items: a.items } });
      return;
    }

    const hosting = o.infra * SIZES[size].infraMult;
    let lic = o.license;
    if (multi) lic *= (1 - MULTIYEAR_DISCOUNT);
    if (saas) lic += hosting * SAAS_HOSTING_MARGIN;
    license += lic;

    const inf = saas ? 0 : hosting;
    infra += inf;

    const use = aiCostFor(o, size);
    ai += use;

    const add = addOnsFor(o);
    oneOff += add.total;

    rows.push({ name: o.name, lic, inf, use, add });
  });

  const total = license + infra + ai + oneOff;
  return { rows, license, infra, ai, oneOff, total, saas, multi, size };
}

/* ---------------- quote rendering ---------------- */
function renderQuote(q) {
  if (!state.picked.length) {
    $('quote-table').innerHTML = '<p class="empty">Pick at least one product above.</p>';
    $('quote-assumptions').textContent = '';
    return;
  }
  const pilot = state.answers.term === 'pilot';
  let html = '<table><thead><tr><th>Product</th><th>Licence</th><th>Infra</th><th>Usage</th><th>One-off</th></tr></thead><tbody>';
  q.rows.forEach(r => {
    html += `<tr><td class="lab">${r.name}${r.add.items.length ? `<span class="row-note">${r.add.items.join(' · ')}</span>` : ''}</td>` +
      `<td class="n">${fmt(r.lic)}</td><td class="n">${r.inf ? fmt(r.inf) : '—'}</td>` +
      `<td class="n">${r.use ? fmt(r.use) : '—'}</td><td class="n">${r.add.total ? fmt(r.add.total) : '—'}</td></tr>`;
  });
  html += `</tbody><tfoot><tr><td class="lab">Year one</td><td class="n">${fmt(q.license)}</td><td class="n">${q.infra ? fmt(q.infra) : 'included'}</td><td class="n">${fmt(q.ai)}</td><td class="n">${fmt(q.oneOff)}</td></tr></tfoot></table>`;
  if (pilot) html += `<p class="pilot-banner">3-month pilot: <strong>${fmt(PILOT_PRICE)}</strong> flat. The table above is what a full 12 months would look like after it.</p>`;
  $('quote-table').innerHTML = html;

  const a = [];
  a.push(`${SIZES[q.size].label} students, modelled as ${SIZES[q.size].population.toLocaleString()} people.`);
  const sharedPicked = state.picked.some(id => !offering(id).ownPricing);
  if (sharedPicked) a.push(q.saas ? 'Hosted by CampusMind, so infrastructure is inside the licence.' : 'Your own tenant, so the infrastructure line is your cloud spend.');
  if (q.multi) a.push(`24-month term, ${Math.round(MULTIYEAR_DISCOUNT * 100)}% off licence.`);
  if (state.picked.includes('llmchat') && state.answers['llmchat.frontier'] === 'yes') a.push(`Frontier models on, so AI usage carries a ${FRONTIER_MULT}× multiplier.`);
  if (state.picked.includes('accessibility')) {
    const v = accessibilityQuote();
    a.push(`Accessibility: ${fmt(v.lic / 12)} licence and ${fmt(v.inf / 12)} infrastructure a month, ${fmt(v.onboarding)} to onboard.`);
    a.push(v.saas
      ? `${v.pages.toLocaleString()} pages a year, ${v.includedPages.toLocaleString()} carried by the hosting, ${v.chargeable.toLocaleString()} prepaid at $${v.rate.toFixed(2)} a page. Pages beyond the bundle are $${ACCESS.overage.perPage.toFixed(2)}, minimum ${fmt(ACCESS.overage.minCharge)} per ${ACCESS.overage.minBlock.toLocaleString()}.`
      : `${v.pages.toLocaleString()} pages a year at $${v.rate.toFixed(2)} a page, running on your own AI spend.`);
  }
  a.push('Usage is an estimate, is billed on what you actually use, and is capped by your own controls.');
  $('quote-assumptions').textContent = a.join(' ');
}

function renderTotalBar(q) {
  const pilot = state.answers.term === 'pilot';
  $('tb-total').textContent = state.picked.length ? fmt(pilot ? PILOT_PRICE : q.total) : '$0';
  $('tb-label').textContent = pilot ? '3-month pilot, flat' : 'Year one, all in';
  $('tb-detail').innerHTML = state.picked.length
    ? `<span><i>Licence</i>${fmt(q.license)}</span><span><i>Infrastructure</i>${q.infra ? fmt(q.infra) : 'included'}</span><span><i>Usage</i>${fmt(q.ai)}</span><span><i>One-off</i>${fmt(q.oneOff)}</span>`
    : '<span>Nothing selected yet.</span>';
}
$('tb-toggle').addEventListener('click', () => {
  const open = $('tb-detail').hidden;
  $('tb-detail').hidden = !open;
  $('tb-toggle').setAttribute('aria-expanded', String(open));
});

/* ---------------- what does the budget buy ---------------- */
function renderBuy() {
  const budget = Number($('aibudget').value);
  const frontier = state.picked.includes('llmchat') && state.answers['llmchat.frontier'] === 'yes';
  $('aibudget-value').textContent = fmt(budget);
  const max = budget / (CONV_COST.simple.cost * (frontier ? FRONTIER_MULT : 1));
  $('buy-grid').innerHTML = Object.keys(CONV_COST).map(k => {
    const c = CONV_COST[k];
    const each = c.cost * (frontier ? FRONTIER_MULT : 1);
    const n = Math.round(budget / each);
    return `<div class="buy">
      <div class="buy-bar"><span style="width:${Math.max(2, (n / max) * 100)}%"></span></div>
      <strong>${n.toLocaleString()}</strong>
      <span class="buy-l">${c.label}</span>
      <span class="buy-n">${c.note}</span>
    </div>`;
  }).join('');
  const pop = SIZES[state.answers.size].population;
  const simpleN = Math.round(budget / (CONV_COST.prompt.cost * (frontier ? FRONTIER_MULT : 1)));
  $('usage-assumption').textContent = `At ${SIZES[state.answers.size].label} students, ${fmt(budget)} a year is about ${Math.round(simpleN / 12).toLocaleString()} prompt-based conversations a month, or roughly ${(simpleN / pop).toFixed(1)} per person per year. Frontier models ${frontier ? 'are on' : 'are capped'}.`;
}
$('aibudget').addEventListener('input', renderBuy);

/* ---------------- copy + reset ---------------- */
$('copy-quote').addEventListener('click', () => {
  const q = calculate();
  const pilot = state.answers.term === 'pilot';
  const lines = ['CampusMind — indicative quote', ''];
  lines.push(`Institution: ${SIZES[q.size].label} students`);
  lines.push(`Deployment: ${q.saas ? 'Hosted by CampusMind' : 'Your own tenant'}`);
  lines.push(`Term: ${state.answers.term === 'multi' ? '24 months' : pilot ? '3-month pilot' : '12 months'}`);
  lines.push('');
  q.rows.forEach(r => {
    lines.push(`${r.name}`);
    lines.push(`  Licence      ${fmt(r.lic)}`);
    if (r.inf) lines.push(`  Infra        ${fmt(r.inf)}`);
    if (r.use) lines.push(`  Usage        ${fmt(r.use)}`);
    if (r.add.total) lines.push(`  One-off      ${fmt(r.add.total)}  (${r.add.items.join(', ')})`);
  });
  lines.push('');
  lines.push(pilot ? `3-MONTH PILOT: ${fmt(PILOT_PRICE)} flat` : `YEAR ONE TOTAL: ${fmt(q.total)}`);
  lines.push('');
  lines.push('Indicative only, not a contract. AI usage is billed on actual use.');
  const text = lines.join('\n');
  const btn = $('copy-quote');
  const done = () => { btn.textContent = 'Copied'; announce('Quote copied.'); setTimeout(() => { btn.textContent = 'Copy quote'; }, 1600); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
  else done();
});

$('reset-all').addEventListener('click', () => {
  state.picked = [];
  ABOUT_QUESTIONS.forEach(q => { state.answers[q.id] = Array.isArray(q.def) ? [...q.def] : q.def; });
  OFFERINGS.forEach(o => o.questions.forEach(q => {
    state.answers[o.id + '.' + q.id] = Array.isArray(q.def) ? [...q.def] : q.def;
  }));
  renderAll();
  announce('Reset.');
});

/* ---------------- render loop ---------------- */
function calcAndRenderQuote() {
  const q = calculate();
  renderQuote(q);
  renderTotalBar(q);
  renderBuy();
}
function renderAll() {
  renderOfferings();
  renderAbout();
  renderDetail();
  calcAndRenderQuote();
}
renderAll();

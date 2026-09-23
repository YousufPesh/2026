'use strict';
const $ = (id) => document.getElementById(id);
const announce = (msg) => { $('live').textContent = msg; };
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PROVIDERS = [
  { name: 'OpenAI', mark: 'O', models: [
    ['GPT-3.5 Turbo', 'gpt-3.5-turbo', ['Microsoft Azure']],
    ['GPT-4', 'gpt-4', ['Microsoft Azure']],
    ['GPT-4o', 'gpt-4o', ['Microsoft Azure']],
    ['GPT-4o mini', 'gpt-4o-mini', ['Microsoft Azure']],
    ['o1', '200k context', ['Microsoft Azure']],
    ['GPT-4.1', 'gpt-4.1', ['Azure AI Foundry']],
    ['GPT-4.1 mini', 'gpt-4.1-mini', ['Azure AI Foundry']]
  ] },
  { name: 'Anthropic', mark: 'A', models: [
    ['Claude Opus 4.5', '200k context', ['Azure AI Foundry']],
    ['Claude Opus 4.7', '200k context', ['Azure AI Foundry']],
    ['Claude Opus 4.8', '200k context', ['Azure AI Foundry']],
    ['Claude Sonnet 4.6', '200k context', ['Azure AI Foundry']]
  ] },
  { name: 'DeepSeek', mark: 'D', models: [
    ['DeepSeek V4 Pro', '', ['Azure AI Foundry']]
  ] },
  { name: 'Moonshot AI', mark: 'M', models: [
    ['Kimi K2.5', '', ['Azure AI Foundry']],
    ['Kimi K2.6', '', ['Azure AI Foundry']]
  ] },
  { name: 'xAI', mark: 'X', models: [
    ['Grok 4.1 Fast Reasoning', '', ['Azure AI Foundry']],
    ['Grok 4.3', '', ['Azure AI Foundry']]
  ] },
  { name: 'Google', mark: 'G', models: [
    ['Gemini 3.1 Flash Lite', '1049k context', ['Google AI']],
    ['Gemini 3.1 Pro Preview', '1049k context', ['Google AI', 'Google Vertex AI']],
    ['Gemini 3.5 Flash', '1049k context', ['Google AI', 'Google Vertex AI']],
    ['Gemini 3.5 Flash Lite', '1049k context', ['Google AI']],
    ['Gemini 3.8 Flash', '1049k context', ['Google AI']]
  ] },
  { name: 'Alibaba Qwen', mark: 'Q', models: [
    ['Qwen3 235B A22B Instruct', '', ['Google Vertex AI']],
    ['Qwen3 Next 80B A3B Instruct', '', ['Google Vertex AI']]
  ] }
];

/* ---------- 02 · the shelf ---------- */
const tabWrap = $('provider-tabs');
const maxModels = Math.max(...PROVIDERS.map((p) => p.models.length));
const tabs = PROVIDERS.map((p, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.role = 'tab';
  b.id = 'provider-tab-' + i;
  b.setAttribute('aria-selected', String(i === 0));
  b.setAttribute('aria-controls', 'provider-panel');
  b.tabIndex = i === 0 ? 0 : -1;
  b.innerHTML = '<span class="mark" aria-hidden="true"></span><span class="tab-name"></span><span class="tab-n"></span><span class="tab-bar" aria-hidden="true"></span>';
  b.querySelector('.mark').textContent = p.mark;
  b.querySelector('.tab-name').textContent = p.name;
  b.querySelector('.tab-n').textContent = p.models.length;
  b.querySelector('.tab-bar').style.width = (p.models.length / maxModels * 100) + '%';
  b.addEventListener('click', () => selectProvider(i));
  tabWrap.appendChild(b);
  return b;
});

function modelRow(m) {
  const li = document.createElement('li');
  li.innerHTML = '<div><strong></strong><span class="row-sub"></span></div><span class="hosts"></span>';
  li.querySelector('strong').textContent = m[0];
  li.querySelector('.row-sub').textContent = m[1];
  m[2].forEach((h) => {
    const s = document.createElement('span');
    s.className = 'host';
    s.textContent = h;
    li.querySelector('.hosts').appendChild(s);
  });
  return li;
}

function selectProvider(i, focus) {
  const p = PROVIDERS[i];
  tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
  $('provider-panel').setAttribute('aria-labelledby', tabs[i].id);
  $('provider-panel-title').textContent = p.name;
  const rows = $('model-rows');
  rows.innerHTML = '';
  p.models.forEach((m) => rows.appendChild(modelRow(m)));
  if (focus) tabs[i].focus();
  announce(`${p.name}: ${p.models.length} model${p.models.length === 1 ? '' : 's'}.`);
}

tabWrap.addEventListener('keydown', (e) => {
  const cur = tabs.indexOf(document.activeElement);
  if (cur < 0) return;
  let next = cur;
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (cur + 1) % tabs.length;
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (cur - 1 + tabs.length) % tabs.length;
  if (e.key === 'Home') next = 0;
  if (e.key === 'End') next = tabs.length - 1;
  if (next === cur) return;
  e.preventDefault();
  selectProvider(next, true);
});

const modelTotal = PROVIDERS.reduce((n, p) => n + p.models.length, 0);
$('model-count').textContent = modelTotal;
$('provider-count').textContent = PROVIDERS.length;
selectProvider(0);

/* ---------- run 3 step 1 · what the leadership question can reach ---------- */
// One entity vocabulary. For leadership every entity is either counted in aggregate or out of scope; none is named.
const ENTITIES = ['Student', 'Enrollment', 'Course Section', 'Term', 'Grade', 'Program', 'Advising Case', 'Financial Aid Award', 'Housing Assignment', 'Account Balance', 'Cohort', 'Retention Outcome'];
const COUNTED = ['Student', 'Enrollment', 'Course Section', 'Term', 'Grade', 'Program', 'Cohort', 'Retention Outcome'];
(() => {
  const wrap = $('entities');
  ENTITIES.forEach((e) => {
    const c = document.createElement('code');
    c.className = COUNTED.includes(e) ? 'k-counted' : 'k-locked';
    c.textContent = e;
    wrap.appendChild(c);
  });
  const reach = `${COUNTED.length} counted, ${ENTITIES.length - COUNTED.length} locked. No student is named.`;
  $('reach').textContent = reach;
  wrap.setAttribute('aria-label', 'Entities the provost\'s question can reach. ' + reach);
})();

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

document.addEventListener('click', (event) => {
  const btn = event.target.closest('.copy');
  if (!btn) return;
  const text = btn.dataset.copy || '';
  const label = btn.querySelector('.copy-label') || btn;
  const done = () => {
    label.textContent = 'Copied';
    btn.setAttribute('data-done', '');
    announce('Copied to clipboard.');
    setTimeout(() => { label.textContent = 'Copy'; btn.removeAttribute('data-done'); }, 1600);
  };
  const fail = () => { label.textContent = 'Select manually'; setTimeout(() => { label.textContent = 'Copy'; }, 2400); };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => { fallbackCopy(text) ? done() : fail(); });
    } else {
      fallbackCopy(text) ? done() : fail();
    }
  } catch (e) { fallbackCopy(text) ? done() : fail(); }
});

/* ---------- the agent reaching out ---------- */
const beatLine = (el) => [...el.children].map((c) => c.textContent.trim()).filter(Boolean).join(' · ');

document.querySelectorAll('.reach-out').forEach((fig) => {
  const beats = [...fig.querySelectorAll('[data-beat]')];
  const btn = fig.querySelector('.ro-play');
  const caption = fig.querySelector('.ro-caption');
  const resting = caption.textContent;
  let timer = null;

  function step(i) {
    const beat = beats[i];
    const last = i === beats.length - 1;
    beat.classList.add(last ? 'is-answer' : 'is-lit');
    caption.textContent = `${i + 1}/${beats.length} · ${beatLine(beat)}`;
    if (!last) { timer = setTimeout(() => step(i + 1), REDUCED ? 2000 : 850); return; }
    timer = setTimeout(() => {
      timer = null;
      caption.textContent = resting;
      btn.disabled = false;
      btn.textContent = '▶ Show the reach again';
    }, REDUCED ? 2600 : 1600);
  }

  btn.addEventListener('click', () => {
    if (timer) { clearTimeout(timer); timer = null; }
    beats.forEach((b) => b.classList.remove('is-lit', 'is-answer'));
    btn.disabled = true;
    step(0);
  });
});

/* ---------- section nav ---------- */
$('section-jump').addEventListener('change', (e) => {
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
    let id = 'student';
    document.querySelectorAll('main section').forEach((s) => { if (s.getBoundingClientRect().top <= line) id = s.id; });
    $('section-jump').value = id;
  });
}, { passive: true });

if ('ResizeObserver' in window) {
  new ResizeObserver((entries) => {
    document.documentElement.style.setProperty('--section-nav-height', Math.ceil(entries[0].target.getBoundingClientRect().height) + 12 + 'px');
  }).observe(document.querySelector('.section-nav'));
}

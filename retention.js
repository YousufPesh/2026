'use strict';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const stages = {
  signals: {
    label: 'Observe student signals',
    title: 'See what changed across the student journey',
    summary: 'Signals are observable events—a missed assignment, a falling grade, or fewer logins. They are reasons to look closer, not conclusions about a student.'
  },
  model: {
    label: 'Decide when to respond',
    title: 'Turn signals into a clear support decision',
    summary: 'Your institution decides when a signal becomes active, how much it contributes, and what response the student’s total should start.'
  },
  outreach: {
    label: 'Automate + coordinate',
    title: 'Start outreach without losing the human handoff',
    summary: 'The selected response can start a configured message while the same alert and contact history stay visible to advisors.'
  },
  advisor: {
    label: 'Advisor context',
    title: 'Bring the score and the student story together',
    summary: 'The advisor sees more than a number: the contributing signals, prior outreach, the student response, and the next time-sensitive barrier.'
  },
  intervention: {
    label: 'Early intervention',
    title: 'Move from early identification to timely support',
    summary: 'The goal is not a score. It is an earlier, better-informed conversation that connects a student with the right support.'
  }
};

const stageAliases = { triggers: 'model', points: 'model', thresholds: 'model' };

const state = {
  observedDays: 6,
  triggerThreshold: 5,
  weights: [10, 20, 20],
  advisorThreshold: 70,
  contactGap: 2
};

let opener = null;
let expanded = false;
let wireFrame;

function engagementActive() {
  return state.observedDays >= state.triggerThreshold;
}

function contributions() {
  return [state.weights[0], state.weights[1], engagementActive() ? state.weights[2] : 0];
}

function score() {
  return contributions().reduce((total, value) => total + value, 0);
}

function riskFor(value = score()) {
  if (value >= 90) return { key: 'urgent', name: 'Urgent', action: 'Dean / advisor escalation' };
  if (value >= state.advisorThreshold) return { key: 'high', name: 'High', action: 'Advisor escalation / meeting' };
  if (value >= 50) return { key: 'elevated', name: 'Elevated', action: 'Automated check-in' };
  if (value >= 30) return { key: 'emerging', name: 'Emerging', action: 'Early nudge' };
  return { key: 'watch', name: 'Watch', action: 'Monitor; no outreach' };
}

function updateText(selector, value) {
  $$(selector).forEach(element => {
    element.textContent = value;
  });
}

function render() {
  const isActive = engagementActive();
  const parts = contributions();
  const total = score();
  const risk = riskFor(total);

  $('#mini-trigger-rule').textContent = `${state.observedDays} ${isActive ? '≥' : '<'} ${state.triggerThreshold}`;
  $('#trigger-value').textContent = `${state.triggerThreshold} days`;
  $('#trigger-result').classList.toggle('is-active', isActive);
  $('#trigger-result').classList.toggle('is-inactive', !isActive);
  $('#trigger-result-title').textContent = isActive ? 'Signal active' : 'Not active yet';
  $('#trigger-result-copy').textContent = isActive
    ? `${state.observedDays} observed days meets your ${state.triggerThreshold}-day rule.`
    : `${state.observedDays} observed days does not yet meet your ${state.triggerThreshold}-day rule.`;

  state.weights.forEach((weight, index) => {
    const active = index !== 2 || isActive;
    const contribution = parts[index];
    $(`[data-weight-output="${index}"]`).textContent = `${weight} points`;
    $(`[data-weight-fill="${index}"]`).style.width = `${active ? weight / 30 * 100 : 0}%`;
    $(`[data-weight-row="${index}"]`).classList.toggle('is-inactive', !active);
    $$(`[data-advisor-points="${index}"]`).forEach(element => {
      element.textContent = `+${contribution}`;
    });
  });

  $('#engagement-trigger-state').textContent = isActive ? 'Active trigger' : 'Inactive trigger · adds 0';
  $('[data-advisor-signal="2"]').classList.toggle('is-inactive', !isActive);

  updateText('.js-score', total);
  updateText('.js-risk', risk.name);
  updateText('.js-action', risk.action);
  $('#flow-model').textContent = `${total} points → ${risk.action}`;

  $$('.js-score-strip').forEach(strip => {
    strip.setAttribute('aria-label', `${parts.join(' plus ')} equals ${total} points`);
    [...strip.children].forEach((segment, index) => {
      segment.textContent = parts[index];
      segment.style.flexGrow = Math.max(parts[index], 0.5);
      segment.classList.toggle('is-zero', parts[index] === 0);
    });
  });

  $('#advisor-threshold-value').textContent = `${state.advisorThreshold} points`;
  $('#high-range').textContent = `${state.advisorThreshold}–89`;
  $('#elevated-range').textContent = `50–${state.advisorThreshold - 1}`;
  $$('[data-risk-band]').forEach(element => {
    const current = element.dataset.riskBand === risk.key;
    element.classList.toggle('highlight', current);
    if (current) element.setAttribute('aria-current', 'true');
    else element.removeAttribute('aria-current');
  });
  $('#threshold-feedback').textContent = `${total} points is ${risk.name.toLowerCase()} risk and starts: ${risk.action.toLowerCase()}.`;

  $('#contact-gap-value').textContent = `${state.contactGap} ${state.contactGap === 1 ? 'day' : 'days'}`;
  $('#contact-status').textContent = `Wait ${state.contactGap === 1 ? 'one day' : `${state.contactGap} days`}, then check for a reply or advisor action.`;
  $('#flow-outreach').textContent = risk.key === 'watch'
    ? 'Monitor now; coordinate when needed'
    : `${risk.action} + shared history`;
}

function announce(message) {
  $('#announcement').textContent = message;
}

function positionStack() {
  const canvas = $('.workflow-canvas');
  const height = innerWidth < 650 ? 310 : innerWidth < 1050 ? 325 : 340;
  $$('.workflow-node').forEach(element => {
    element.style.setProperty('--fold-x', `${(canvas.clientWidth - element.offsetWidth) / 2 - element.offsetLeft}px`);
    element.style.setProperty('--fold-y', `${(height - element.offsetHeight) / 2 + 17 - element.offsetTop}px`);
  });
}

function drawWires() {
  positionStack();
  const canvas = $('.workflow-canvas');
  const base = canvas.getBoundingClientRect();
  const nodes = $$('.workflow-node').map(element => element.getBoundingClientRect());
  $('.workflow-wires').setAttribute('viewBox', `0 0 ${base.width} ${base.height}`);
  for (let index = 0; index < nodes.length - 1; index += 1) {
    const from = nodes[index];
    const to = nodes[index + 1];
    const horizontal = to.left >= from.right + 6;
    const startX = (horizontal ? from.right : from.left + from.width / 2) - base.left;
    const startY = (horizontal ? from.top + from.height / 2 : from.top) - base.top;
    const endX = (horizontal ? to.left : to.left + to.width / 2) - base.left;
    const endY = (horizontal ? to.top + to.height / 2 : to.bottom) - base.top;
    $(`#wire-${index}`).setAttribute('d', `M ${startX + (horizontal ? 3 : 0)} ${startY - (horizontal ? 0 : 4)} L ${endX - (horizontal ? 4 : 0)} ${endY + (horizontal ? 0 : 8)}`);
  }
}

function setExpanded(value, { focus = false } = {}) {
  expanded = value;
  positionStack();
  const canvas = $('.workflow-canvas');
  canvas.classList.toggle('is-collapsed', !value);
  $$('.workflow-node').forEach(element => {
    element.tabIndex = value ? 0 : -1;
    element.setAttribute('aria-hidden', String(!value));
  });
  $('.stack-cover').hidden = value;
  $('#replay').innerHTML = value ? 'Collapse layers <span aria-hidden="true">↙</span>' : 'Expand layers <span aria-hidden="true">↗</span>';
  $('#replay').setAttribute('aria-expanded', String(value));
  $('#replay').setAttribute('aria-label', value ? 'Collapse retention flow' : 'Expand retention flow');
  $('#flow-instruction').textContent = value ? 'Select any stage' : 'Expand the flow';
  cancelAnimationFrame(wireFrame);
  const end = performance.now() + 1000;
  function frame() {
    drawWires();
    if (performance.now() < end) wireFrame = requestAnimationFrame(frame);
  }
  frame();
  if (focus) $('#replay').focus({ preventScroll: true });
}

function openStage(id) {
  id = stageAliases[id] || id;
  if (!stages[id]) return;
  if (!expanded) setExpanded(true);
  opener = $(`[data-stage="${id}"]`);
  $$('[data-panel]').forEach(element => {
    element.hidden = element.dataset.panel !== id;
  });
  $$('[data-stage]').forEach(element => {
    element.setAttribute('aria-expanded', String(element === opener));
    if (element === opener) element.setAttribute('aria-current', 'step');
    else element.removeAttribute('aria-current');
  });
  const stageKeys = Object.keys(stages);
  $('#panel-kicker').textContent = `0${stageKeys.indexOf(id) + 1} / ${stages[id].label}`;
  $('#panel-title').textContent = stages[id].title;
  $('#panel-summary').textContent = stages[id].summary;
  if (!$('#step-panel').open) $('#step-panel').showModal();
  $('.step-popup-body').scrollTop = 0;
  $('#panel-title').focus({ preventScroll: true });
  history.replaceState(null, '', `#${id}`);
}

$$('[data-stage]').forEach((element, index) => {
  element.style.setProperty('--i', index);
  element.addEventListener('click', () => openStage(element.dataset.stage));
});

$('#trigger-threshold').addEventListener('input', event => {
  state.triggerThreshold = Number(event.target.value);
  render();
  announce(engagementActive() ? 'The engagement signal is active and contributes points.' : 'The engagement signal is not active and contributes zero points.');
});

$$('[data-weight]').forEach(input => {
  input.addEventListener('input', event => {
    const index = Number(event.target.dataset.weight);
    state.weights[index] = Number(event.target.value);
    render();
    announce(`The example total is now ${score()} points, ${riskFor().name.toLowerCase()} risk.`);
  });
});

$('#advisor-threshold').addEventListener('input', event => {
  state.advisorThreshold = Number(event.target.value);
  render();
  announce(`Advisor-led escalation now begins at ${state.advisorThreshold} points.`);
});

$('#contact-gap').addEventListener('input', event => {
  state.contactGap = Number(event.target.value);
  render();
  announce(`Automated messages are now spaced at least ${state.contactGap} ${state.contactGap === 1 ? 'day' : 'days'} apart.`);
});

$('#close-step').addEventListener('click', () => $('#step-panel').close());
$('#step-panel').addEventListener('close', () => {
  $$('[data-stage]').forEach(element => {
    element.setAttribute('aria-expanded', 'false');
    element.removeAttribute('aria-current');
  });
  history.replaceState(null, '', '#flow');
  opener?.focus({ preventScroll: true });
});
$('#step-panel').addEventListener('click', event => {
  if (event.target !== $('#step-panel')) return;
  const bounds = event.target.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.target.close();
});

$('#replay').addEventListener('click', () => setExpanded(!expanded));
$('#expand-cover').addEventListener('click', () => setExpanded(true, { focus: true }));
new ResizeObserver(drawWires).observe($('.workflow-canvas'));
window.addEventListener('hashchange', () => {
  const id = stageAliases[location.hash.slice(1)] || location.hash.slice(1);
  if (stages[id]) openStage(id);
  else if ($('#step-panel').open) $('#step-panel').close();
});

render();
setExpanded(false);
const initialStage = stageAliases[location.hash.slice(1)] || location.hash.slice(1);
if (stages[initialStage]) openStage(initialStage);

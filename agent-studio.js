const ideas = {
  learning: {
    title: 'Guide a classroom assignment',
    description: 'Help students find a useful next step without doing the work for them.',
    symbol: 'A',
    trigger: 'Assignment question',
    agent: 'Learning agent',
    logic: 'Choose a next step',
    action: 'Return guidance',
    result: 'Useful next step',
    scope: 'classroom'
  },
  event: {
    title: 'Support a campus event',
    description: 'Help attendees find timely information before, during, and after the event.',
    symbol: 'E',
    trigger: 'Attendee request',
    agent: 'Event agent',
    logic: 'Route the request',
    action: 'Send event info',
    result: 'Helpful response',
    scope: 'group'
  },
  work: {
    title: 'Handle recurring work',
    description: 'Create a dependable workflow for a task your team repeats.',
    symbol: 'W',
    trigger: 'Schedule or app',
    agent: 'Work agent',
    logic: 'Apply your rules',
    action: 'Complete the action',
    result: 'Task completed',
    scope: 'group'
  }
};

const tabs = [...document.querySelectorAll('[role="tab"][data-idea]')];
const fields = {
  title: document.querySelector('#purpose-title'),
  description: document.querySelector('#purpose-description'),
  symbol: document.querySelector('#purpose-symbol'),
  trigger: document.querySelector('#trigger-example'),
  agent: document.querySelector('#agent-example'),
  logic: document.querySelector('#logic-example'),
  action: document.querySelector('#action-example'),
  result: document.querySelector('#result-example')
};
const panel = document.querySelector('#agent-flow');
const status = document.querySelector('#idea-status');

function selectIdea(tab, announce = true) {
  const idea = ideas[tab.dataset.idea];
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  Object.entries(fields).forEach(([key, element]) => { element.textContent = idea[key]; });
  document.querySelectorAll('[data-scope]').forEach((scope) => {
    scope.classList.toggle('is-active', scope.dataset.scope === idea.scope);
  });
  panel.setAttribute('aria-labelledby', tab.id);
  if (announce) status.textContent = `${tab.textContent.trim()} example selected. ${idea.title}.`;
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectIdea(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    tabs[next].focus();
    selectIdea(tabs[next]);
  });
});

selectIdea(tabs[0], false);

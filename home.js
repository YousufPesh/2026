'use strict';

/* Every live link the Labs point at, grouped the way the demo runs.
   Add a link here and it appears in the launcher. */
const DEMO_GROUPS = [
  {
    name: 'Campus Chat',
    links: [
      ['Collaborative thread', 'https://app.mind-platform.ai/chat?c=conv_9qQFuG37PeArQHukx5oBtm']
    ]
  },
  {
    name: 'Campus Chat Plus',
    links: [
      ['Educause info thread', 'https://app.mind-platform.ai/chat?c=conv_LBaBpZ85WjCwt1m9q8ctPE']
    ]
  },
  {
    name: 'Data Bridge',
    links: [
      ['Leadership Agent', 'https://app.mind-platform.ai/chat/agent_id/assist4bbbe03c89544ae99a9fe9535e53a865?thread=conv_0fbd0ac49100348400ambIg5HD4djvmC1FfBkNCScQFR38lP9B'],
      ['Student Success Assistant', 'https://app.mind-platform.ai/chat/agent_id/assistd6135354c82740beac248877a1a0d553?thread=conv_067473e3b607e03b006u0VammER0FtUKouZQCf3eNgLQvbzTum'],
      ['Work Briefing', 'https://dev.campusmind.ai/chat/agent_id/assistfdf0ebc2fddb48ae8eba6d51572e1325?thread=conv_0d8e82afd132d7b000WCDuP5ckccircYbtHuY6l8z5yMmGJuZX'],
      ['Data agent in Fabric', 'https://app.fabric.microsoft.com/groups/643a7b0e-d2c5-4676-9113-a2c08cdd42fe/aiskills/09f8b5bb-5773-4716-a283-1408d8543e7d?experience=fabric-developer&clientSideAuth=0']
    ]
  },
  {
    name: 'Admin Console',
    links: [
      ['Budget & cost controls', 'https://admin.mind-platform.ai']
    ]
  },
  {
    name: 'Teaching Assistant',
    links: [
      ['Introduction to European Art', 'https://app.mind-platform.ai/chat/vta_id/assist4f12281159c342beb4092e78c5bd7f21'],
      ['Machine Learning Operations', 'https://app.mind-platform.ai/vta?vta_id=assist690ab9e1b9f9407a9c1c92c8699468ce&tab=course'],
      ['Time Series Analysis', 'https://app.mind-platform.ai/vta?vta_id=assist762cd1e903384bd7a85916d7baccf64f&tab=course']
    ]
  }
];

const groupsHost = document.getElementById('launch-groups');
const note = document.getElementById('launcher-note');

/* Browsers only allow several tabs from one gesture once pop-ups are allowed,
   so count what actually opened and say so rather than failing silently. */
function openMany(links, label) {
  let opened = 0;
  links.forEach(([, url]) => {
    const w = window.open(url, '_blank', 'noopener');
    if (w) opened++;
  });
  if (opened === links.length) {
    note.textContent = `Opened ${opened} tab${opened === 1 ? '' : 's'} for ${label}.`;
    note.classList.remove('is-warn');
  } else {
    note.textContent = `Only ${opened} of ${links.length} opened. Allow pop-ups for this site, then try again.`;
    note.classList.add('is-warn');
  }
}

DEMO_GROUPS.forEach(group => {
  const box = document.createElement('div');
  box.className = 'launch-group';

  const head = document.createElement('div');
  head.className = 'launch-group-head';
  const h = document.createElement('h3');
  h.textContent = group.name;
  head.appendChild(h);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'launch-some';
  btn.textContent = group.links.length === 1 ? 'Open' : `Open ${group.links.length}`;
  btn.addEventListener('click', () => openMany(group.links, group.name));
  head.appendChild(btn);
  box.appendChild(head);

  const list = document.createElement('ul');
  group.links.forEach(([label, url]) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = label;
    li.appendChild(a);
    list.appendChild(li);
  });
  box.appendChild(list);
  groupsHost.appendChild(box);
});

document.getElementById('launch-all').addEventListener('click', () => {
  openMany(DEMO_GROUPS.flatMap(g => g.links), 'the whole demo');
});

'use strict';

/* The booth setup sequence, in the order you want the tabs across the
   monitors. Add a link here and it appears in the launcher, numbered. */
const DEMO_LINKS = [
  ['Gmail', 'Sign in first', 'https://mail.google.com/mail/u/0/?service=mail&flowName=GlifWebSignIn&flowEntry=AccountChooser&ec=asw-gmail-globalnav-signin#inbox'],
  ['CampusMind', 'The chat everyone sees', 'https://app.mind-platform.ai/chat'],
  ['Admin dashboard', 'Budgets, roles, branding', 'https://admin.mind-platform.ai'],
  ['Fabric ontology', 'The graph view', 'https://app.fabric.microsoft.com/groups/643a7b0e-d2c5-4676-9113-a2c08cdd42fe/ontologies/fd3aefe7-1258-42f6-a02f-ea324df0e283?experience=fabric-developer&clientSideAuth=0'],
  ['Canvas', 'Teaching Assistant inside the LMS', 'https://classbuddy.instructure.com/courses/281/external_tools/482'],
  ['Transfer Articulation', 'Posted in Teams', 'https://teams.microsoft.com/l/message/19:cbdaeacf-4f3f-4aa8-945a-e218c5ec401f_dddb5e80-623d-41f2-ae5c-226659018b4e@unq.gbl.spaces/1790060365891?context=%7B%22contextType%22%3A%22chat%22%7D'],
  ['Calendly', 'Book a follow-up', 'https://calendly.com/santosh-kumar-royalcyber/educause-2026?month=2026-09&date=2026-09-29']
];

const host = document.getElementById('launch-list');
const note = document.getElementById('launcher-note');
const DEFAULT_NOTE = 'Allow pop-ups for this site once, then Open everything puts them across your monitors in this order.';

/* Browsers only allow several tabs from one gesture once pop-ups are allowed,
   so count what actually opened rather than failing silently. */
function openMany(links, label) {
  let opened = 0;
  links.forEach(([, , url]) => { if (window.open(url, '_blank', 'noopener')) opened++; });
  if (opened === links.length) {
    note.textContent = `Opened ${opened} tab${opened === 1 ? '' : 's'}${label ? ' · ' + label : ''}.`;
    note.classList.remove('is-warn');
  } else {
    note.textContent = `Only ${opened} of ${links.length} opened. Allow pop-ups for this site, then try again.`;
    note.classList.add('is-warn');
  }
}

DEMO_LINKS.forEach((item, i) => {
  const [name, what, url] = item;
  const row = document.createElement('div');
  row.className = 'launch-row';
  row.innerHTML =
    '<span class="launch-n"></span>' +
    '<span class="launch-name"><strong></strong><i></i></span>' +
    '<button type="button" class="launch-one">Open</button>';
  row.querySelector('.launch-n').textContent = String(i + 1).padStart(2, '0');
  row.querySelector('.launch-name strong').textContent = name;
  row.querySelector('.launch-name i').textContent = what;
  row.querySelector('.launch-one').addEventListener('click', () => openMany([item], name));
  host.appendChild(row);
});

document.getElementById('launch-all').addEventListener('click', () => {
  openMany(DEMO_LINKS, 'left to right');
});
note.textContent = DEFAULT_NOTE;

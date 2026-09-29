'use strict';

/* The booth setup sequence, in the order you want the tabs across the
   monitors. Add a link here and it appears in the launcher, numbered. */
const DEMO_LINKS = [
  ['CampusMind', 'The chat everyone sees', 'https://app.mind-platform.ai/chat'],
  ['Admin dashboard', 'Budgets, roles, branding', 'https://admin.mind-platform.ai'],
  ['Fabric ontology', 'The graph view', 'https://app.fabric.microsoft.com/groups/643a7b0e-d2c5-4676-9113-a2c08cdd42fe/ontologies/fd3aefe7-1258-42f6-a02f-ea324df0e283?experience=fabric-developer&clientSideAuth=0'],
  ['Canvas', 'Teaching Assistant inside the LMS', 'https://classbuddy.instructure.com/courses/281/external_tools/482', { user: 'admincb@royalcyber.com', pass: 'Cyber@2025' }],
  ['Calendly', 'Book a follow-up', 'https://calendly.com/santosh-kumar-royalcyber/educause-2026?month=2026-09&date=2026-09-29'],
  ['Transfer Articulation', 'Credit transfer demo', 'https://merritt-nursing.nicehill-947d3a93.eastus.azurecontainerapps.io/', null, [
    ['Laney College transcript', '/assets/transfer/transcript-laney-college.pdf'],
    ['City College SF transcript', '/assets/transfer/transcript-city-college-sf.pdf'],
    ['ATI TEAS VI score report', '/assets/transfer/ati-teas-vi-score-report.pdf']
  ]],
  ['Gmail', 'Inbox', 'https://mail.google.com/mail/u/0/?service=mail&flowName=GlifWebSignIn&flowEntry=AccountChooser&ec=asw-gmail-globalnav-signin#inbox', { user: 'classbuddydemo@gmail.com', pass: 'classbuddy11@@', note: 'Duo approval goes to Jazil' }]
];

function copyText(text, btn) {
  const done = () => {
    btn.setAttribute('data-done', '');
    setTimeout(() => btn.removeAttribute('data-done'), 1400);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, done);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }
}

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
  const [name, what, url, creds, files] = item;
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

  /* A sign-in you would otherwise retype on every monitor. */
  if (creds) {
    const bar = document.createElement('div');
    bar.className = 'launch-creds';
    [['user', creds.user], ['pass', creds.pass]].forEach(([kind, value]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cred';
      b.innerHTML = '<i></i><span></span>';
      b.querySelector('i').textContent = kind === 'user' ? 'user' : 'pass';
      b.querySelector('span').textContent = value;
      b.addEventListener('click', () => copyText(value, b));
      bar.appendChild(b);
    });
    if (creds.note) {
      const n = document.createElement('span');
      n.className = 'cred-note';
      n.textContent = creds.note;
      bar.appendChild(n);
    }
    row.appendChild(bar);
  }

  /* Files the demo needs to hand to the app. */
  if (files) {
    const bar = document.createElement('div');
    bar.className = 'launch-files';
    files.forEach(([label, href]) => {
      const a = document.createElement('a');
      a.className = 'file';
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.download = '';
      a.textContent = label;
      bar.appendChild(a);
    });
    row.appendChild(bar);
  }

  host.appendChild(row);
});

document.getElementById('launch-all').addEventListener('click', () => {
  openMany(DEMO_LINKS, 'left to right');
});
note.textContent = DEFAULT_NOTE;

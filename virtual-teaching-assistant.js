const tabList = document.querySelector('.lms-tabs');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const status = document.getElementById('platform-status');

function selectPlatform(nextTab, announce = true) {
  tabs.forEach((tab) => {
    const selected = tab === nextTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  panels.forEach((panel) => {
    panel.hidden = panel.getAttribute('aria-labelledby') !== nextTab.id;
  });
  if (announce) status.textContent = `${nextTab.textContent.trim()} course view selected.`;
}

tabs.forEach((tab) => tab.addEventListener('click', () => selectPlatform(tab)));

tabList.addEventListener('keydown', (event) => {
  const currentIndex = tabs.indexOf(document.activeElement);
  if (currentIndex < 0) return;
  let nextIndex = currentIndex;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  if (event.key === 'Home') nextIndex = 0;
  if (event.key === 'End') nextIndex = tabs.length - 1;
  if (nextIndex === currentIndex) return;
  event.preventDefault();
  tabs[nextIndex].focus();
  selectPlatform(tabs[nextIndex]);
});

/* Copy a question so it can be pasted straight into the live course. */
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
  } catch (error) {
    return false;
  }
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('.try-copy');
  if (!button) return;
  const text = button.closest('li').querySelector('span').textContent.trim();
  const done = () => {
    button.textContent = 'Copied';
    button.setAttribute('data-done', '');
    if (status) status.textContent = 'Question copied.';
    setTimeout(() => {
      button.textContent = 'Copy';
      button.removeAttribute('data-done');
    }, 1600);
  };
  const fail = () => {
    button.textContent = 'Select it';
    setTimeout(() => { button.textContent = 'Copy'; }, 2200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => { if (fallbackCopy(text)) done(); else fail(); });
  } else if (fallbackCopy(text)) {
    done();
  } else {
    fail();
  }
});

/* Live courses the presenter can open, with the questions to paste into each.
   Add a course by adding an entry here; the picker builds itself. */
const LIVE_COURSES = [
  {
    name: 'Introduction to European Art',
    url: 'https://app.mind-platform.ai/chat/vta_id/assist4f12281159c342beb4092e78c5bd7f21',
    questions: [
      'Trace the development of Egyptian tomb types — how do we get from early tombs to the pyramids?',
      'Explain the research paper — what can I choose, what must it cover, and what’s due when?',
      'How is my grade calculated, and what happens if I fail a quiz or submit the paper late?',
      'What is style analysis, and which specific elements should I discuss when analysing an Egyptian work?'
    ]
  },
  {
    name: 'Machine Learning Operations',
    url: 'https://app.mind-platform.ai/vta?vta_id=assist690ab9e1b9f9407a9c1c92c8699468ce&tab=course',
    questions: [
      'What is a feature store, and what problem does it actually solve? Give sources',
      'What does Assignment 1 require, and is there an alternative to DP-SGD?',
      'What do I need to know about the Final Project — deliverables, deadline and presentations?',
      'Explain the main sources of bias in machine learning and how fairness is measured.'
    ]
  },
  {
    name: 'Time Series Analysis',
    url: 'https://app.mind-platform.ai/vta?vta_id=assist762cd1e903384bd7a85916d7baccf64f&tab=course',
    questions: [
      'What’s due in Week 4, and which data files do I need for the I-80 traffic assignment?',
      'When is each assignment due, and what does each one cover?',
      'How do I use the ACF and PACF to decide between an AR, MA or ARMA model?',
      'When should I use a GARCH model instead of ARIMA?'
    ]
  }
];

const coursePicker = document.getElementById('course-picker');
const courseLink = document.getElementById('course-link');
const courseQuestions = document.getElementById('course-questions');

function showCourse(index) {
  const course = LIVE_COURSES[index];
  [...coursePicker.children].forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === index));
  });
  courseLink.href = course.url;
  courseLink.textContent = course.name;
  courseQuestions.innerHTML = '';
  course.questions.forEach((question) => {
    const item = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = question;
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'try-copy';
    copy.textContent = 'Copy';
    item.append(text, copy);
    courseQuestions.appendChild(item);
  });
  if (status) status.textContent = `${course.name} selected.`;
}

LIVE_COURSES.forEach((course, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'course-chip';
  button.textContent = course.name;
  button.setAttribute('aria-pressed', String(index === 0));
  button.addEventListener('click', () => showCourse(index));
  coursePicker.appendChild(button);
});

showCourse(0);

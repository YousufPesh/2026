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

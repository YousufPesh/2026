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

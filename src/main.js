import { ChevronDown, FolderKanban, Home, createIcons } from 'https://esm.sh/lucide@latest';

createIcons({
  icons: {
    ChevronDown,
    FolderKanban,
    Home,
  },
});

const projectGroup = document.querySelector('.nav-group');
const projectToggle = document.querySelector('.nav-toggle');
const navItems = document.querySelectorAll('.nav-menu > .nav-item');
const subItems = document.querySelectorAll('.sub-item');

projectToggle?.addEventListener('click', () => {
  const collapsed = projectGroup.classList.toggle('is-collapsed');
  projectToggle.setAttribute('aria-expanded', String(!collapsed));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('is-active'));
  projectToggle.classList.add('is-active');
});

navItems.forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(navItem => navItem.classList.remove('is-active'));
    item.classList.add('is-active');
  });
});

subItems.forEach(item => {
  item.addEventListener('click', () => {
    subItems.forEach(subItem => subItem.classList.remove('is-selected'));
    item.classList.add('is-selected');
    document.querySelectorAll('.nav-item').forEach(navItem => navItem.classList.remove('is-active'));
    projectToggle?.classList.add('is-active');
  });
});

const comparison = document.querySelector('[data-compare]');

function setReveal(clientX) {
  if (!comparison) return;
  const rect = comparison.getBoundingClientRect();
  const ratio = (clientX - rect.left) / rect.width;
  const clamped = Math.max(0.04, Math.min(0.96, ratio));
  comparison.style.setProperty('--reveal', `${clamped * 100}%`);
}

comparison?.addEventListener('pointermove', event => {
  setReveal(event.clientX);
});

comparison?.addEventListener('pointerdown', event => {
  comparison.setPointerCapture(event.pointerId);
  setReveal(event.clientX);
});

comparison?.addEventListener('pointerup', event => {
  if (comparison.hasPointerCapture(event.pointerId)) {
    comparison.releasePointerCapture(event.pointerId);
  }
});

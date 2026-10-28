'use strict';

// Edit this data to update the content of each project's detail dialog.
const projects = {
  labtrack: {
    eyebrow: 'WEB DEVELOPMENT · FRONT-END & UI/UX',
    title: 'LabTrack — Inventory Management System',
    summary: 'A web-based system for managing equipment inventory and reservation requests. I worked on the front-end implementation and helped shape an interface that would feel clear and usable across devices.',
    details: [
      'Implemented front-end screens using HTML, CSS, and JavaScript.',
      'Worked on equipment tracking and reservation/request management features.',
      'Led the UI/UX design direction, prioritizing a clean and responsive experience.'
    ],
    tags: ['HTML', 'CSS', 'JavaScript', 'UI/UX', 'Responsive design']
  },
  acnesight: {
    eyebrow: 'COMPUTER VISION · RESEARCH PROTOTYPE',
    title: 'AcneSight — Acne Lesion Detection & Classification',
    summary: 'An ongoing Computer Engineering project investigating AI-assisted identification and classification of acne vulgaris lesions. The project uses object detection and image classification approaches.',
    details: [
      'Worked with YOLO26 and ResNet models for lesion detection and classification experiments.',
      'Used Roboflow within the image-data workflow.',
      'Explored model integration and deployment considerations for Raspberry Pi hardware.',
      'This is an academic prototype in development, not a clinical diagnostic service.'
    ],
    tags: ['YOLO26', 'ResNet', 'Roboflow', 'Raspberry Pi', 'Python']
  },
  netwatch: {
    eyebrow: 'NETWORKING · PERSONAL LEARNING PROJECT',
    title: 'NetWatch — Network Monitoring Lab',
    summary: 'A personal, hands-on learning project to better understand everyday network diagnostics. Its early exercises focus on connectivity checks, gateway reachability, DNS lookup, and a planned Python-based monitoring engine.',
    details: [
      'Practiced interpreting ping responses and basic latency / packet-loss readings.',
      'Verified gateway connectivity, internet reachability, and DNS resolution.',
      'Working toward a simple Python monitoring engine as the next development phase.',
      'Work in progress: the dashboard graphic on this portfolio is illustrative.'
    ],
    tags: ['Networking fundamentals', 'Ping', 'DNS', 'Python', 'In progress']
  }
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

// Cache elements queried by multiple features instead of repeatedly searching the DOM.
const root = document.documentElement;
const themeToggle = $('#themeToggle');
const menuToggle = $('#menuToggle');
const navLinks = $('#navLinks');
const navAnchors = $$('.nav-links a', navLinks);
const progress = $('#scrollProgress');
const filters = $$('.filter');
const cards = $$('.project-card');
const projectDialog = $('#projectDialog');
const commandDialog = $('#commandDialog');
const commandInput = $('#commandInput');
const commandResults = $('#commandResults');

// THEME — the small script in <head> already applied the saved theme before paint.
function updateThemeLabel() {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
  themeToggle.title = `Switch to ${next} theme`;
}
updateThemeLabel();

themeToggle.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  updateThemeLabel();
  try { localStorage.setItem('am-theme', root.dataset.theme); }
  catch { /* Local storage is optional. */ }
});

// MOBILE NAVIGATION
function closeMenu() {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
}
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});
navAnchors.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.navbar') && navLinks.classList.contains('open')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
});

// SCROLL PROGRESS — one compositor-friendly transform per animation frame.
let scrollQueued = false;
function updateScrollProgress() {
  const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
  const fraction = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  progress.style.transform = `scaleX(${fraction})`;
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(updateScrollProgress);
}, { passive: true });
window.addEventListener('resize', updateScrollProgress, { passive: true });
updateScrollProgress();

// REVEAL — content is visible even when JavaScript/IntersectionObserver is unavailable.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -15px 0px' });
  $$('.reveal').forEach(element => revealObserver.observe(element));
}

// PROJECT FILTERS — cache cards and attach one listener to the filter group.
$('.filter-controls').addEventListener('click', event => {
  const selected = event.target.closest('.filter');
  if (!selected) return;

  filters.forEach(filter => {
    const active = filter === selected;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });

  const category = selected.dataset.filter;
  cards.forEach(card => {
    card.hidden = category !== 'all' && card.dataset.category !== category;
  });
});

// PROJECT DETAILS — all user-facing copy uses textContent (never innerHTML).
function showProject(key) {
  const project = projects[key];
  if (!project) return;

  $('#dialogEyebrow').textContent = project.eyebrow;
  $('#dialogTitle').textContent = project.title;
  $('#dialogSummary').textContent = project.summary;

  const details = project.details.map(line => {
    const item = document.createElement('li');
    item.textContent = line;
    return item;
  });
  const tags = project.tags.map(tag => {
    const item = document.createElement('span');
    item.textContent = tag;
    return item;
  });
  $('#dialogDetails').replaceChildren(...details);
  $('#dialogTags').replaceChildren(...tags);
  projectDialog.showModal();
}

// Event delegation also supports new cards added later without extra listeners.
$('.project-grid').addEventListener('click', event => {
  const card = event.target.closest('.project-card');
  if (card && !card.hidden) showProject(card.dataset.project);
});
$('.project-grid').addEventListener('keydown', event => {
  const card = event.target.closest('.project-card');
  if (!card || card.hidden || event.target !== card) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    showProject(card.dataset.project);
  }
});
$('#closeProjectDialog').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', event => {
  if (event.target === projectDialog) projectDialog.close();
});

// QUICK NAVIGATION (Ctrl/Cmd + K)
const commands = [
  { label: 'About me', href: '#about', icon: '◉', keywords: 'introduction biography' },
  { label: 'Projects', href: '#projects', icon: '◇', keywords: 'labtrack acnesight netwatch work' },
  { label: 'Experience', href: '#experience', icon: '▤', keywords: 'solarwinds graphic design robotics education' },
  { label: 'Toolkit & skills', href: '#toolkit', icon: '⌘', keywords: 'skills python cisco networking tools' },
  { label: 'Certifications', href: '#certifications', icon: '✧', keywords: 'huawei ai course awards' },
  { label: 'Get in touch', href: '#contact', icon: '↗', keywords: 'contact email linkedin' }
];

let filteredCommands = commands;
let selectedResultIndex = 0;

function selectCommand(index) {
  if (!filteredCommands.length) return;
  selectedResultIndex = (index + filteredCommands.length) % filteredCommands.length;
  $$('.command-result', commandResults).forEach((option, i) => {
    const selected = i === selectedResultIndex;
    option.classList.toggle('is-selected', selected);
    option.setAttribute('aria-selected', String(selected));
  });
  commandInput.setAttribute('aria-activedescendant', `command-option-${selectedResultIndex}`);
  $(`#command-option-${selectedResultIndex}`, commandResults)?.scrollIntoView({ block: 'nearest' });
}

function renderCommands() {
  const query = commandInput.value.trim().toLowerCase();
  filteredCommands = commands.filter(item =>
    `${item.label} ${item.keywords}`.toLowerCase().includes(query)
  );
  selectedResultIndex = 0;
  commandInput.removeAttribute('aria-activedescendant');

  if (!filteredCommands.length) {
    const empty = document.createElement('p');
    empty.className = 'command-empty';
    empty.textContent = 'No matches found.';
    commandResults.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  filteredCommands.forEach((item, index) => {
    const option = document.createElement('div');
    option.id = `command-option-${index}`;
    option.className = 'command-result';
    option.dataset.index = String(index);
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');

    const icon = document.createElement('span');
    icon.textContent = item.icon;
    icon.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.textContent = item.label;
    text.className = 'command-label';
    const hint = document.createElement('small');
    hint.textContent = '↵';
    hint.setAttribute('aria-hidden', 'true');

    option.append(icon, text, hint);
    fragment.append(option);
  });
  commandResults.replaceChildren(fragment);
  selectCommand(0);
}

function navigateCommand(item) {
  if (!item) return;
  commandDialog.close();
  const section = $(item.href);
  // Setting the hash also supports back/forward navigation.
  window.location.hash = item.href;
  section?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  });
}

function openCommandDialog() {
  if (projectDialog.open) projectDialog.close();
  commandInput.value = '';
  commandDialog.showModal();
  commandInput.setAttribute('aria-expanded', 'true');
  renderCommands();
  commandInput.focus();
}

$('#commandTrigger').addEventListener('click', openCommandDialog);
commandDialog.addEventListener('close', () => {
  commandInput.setAttribute('aria-expanded', 'false');
});
commandInput.addEventListener('input', renderCommands);
commandInput.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectCommand(selectedResultIndex + 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectCommand(selectedResultIndex - 1);
  } else if (event.key === 'Enter' && filteredCommands.length) {
    event.preventDefault();
    navigateCommand(filteredCommands[selectedResultIndex]);
  }
});
commandResults.addEventListener('click', event => {
  const option = event.target.closest('[data-index]');
  if (option) navigateCommand(filteredCommands[Number(option.dataset.index)]);
});
commandDialog.addEventListener('click', event => {
  if (event.target === commandDialog) commandDialog.close();
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (commandDialog.open) commandDialog.close();
    else openCommandDialog();
  }
});

// COPY EMAIL + FEEDBACK
const toast = $('#toast');
let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}
$('#copyEmail').addEventListener('click', async event => {
  const email = event.currentTarget.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    showToast('Email address copied!');
  } catch {
    showToast(`Email: ${email}`);
  }
});

$('#year').textContent = new Date().getFullYear();

// ACTIVE NAV SECTION — compute links once; update when an observed section enters view.
if ('IntersectionObserver' in window) {
  const sections = navAnchors.map(link => $(link.hash)).filter(Boolean);
  const navObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navAnchors.forEach(link => {
        link.classList.toggle('is-active', link.hash === `#${entry.target.id}`);
      });
    }
  }, { rootMargin: '-25% 0px -65% 0px' });
  sections.forEach(section => navObserver.observe(section));
}

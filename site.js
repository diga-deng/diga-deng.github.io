(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const header = document.querySelector('.masthead');
  const menu = document.querySelector('.menu-toggle');
  const theme = document.querySelector('.theme-toggle');
  const links = [...document.querySelectorAll('.section-nav a')];
  const sections = [...document.querySelectorAll('main > section')];

  function closeMenu() {
    header.classList.remove('menu-open');
    menu.setAttribute('aria-expanded', 'false');
  }
  menu.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) {
      closeMenu();
      menu.focus();
    }
  });
  function updateThemeButton() {
    const dark = root.dataset.theme === 'dark';
    theme.setAttribute('aria-pressed', String(dark));
    theme.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    theme.title = theme.getAttribute('aria-label');
    document.querySelector('meta[name="theme-color"]').content = dark ? '#18151e' : '#fbfaff';
  }
  updateThemeButton();
  theme.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('peijia-theme', next); } catch (_) { /* Theme still works without storage. */ }
    updateThemeButton();
  });

  const filterGroup = document.querySelector('.project-filters');
  const filters = [...document.querySelectorAll('[data-project-filter]')];
  const projects = [...document.querySelectorAll('.project')];
  function filterProjects(mode) {
    projects.forEach(project => { project.hidden = mode === 'selected' && project.dataset.selected !== 'true'; });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.projectFilter === mode)));
    scheduleActiveSection();
  }
  filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.projectFilter)));
  filterGroup.hidden = false;

  // Always expose an incoming deep link, even when its project is filtered out.
  function revealHashTarget() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (!target) return;
    const project = target.closest('.project');
    if (project && project.hidden) {
      filterProjects('all');
      target.scrollIntoView({ block: 'start' });
    }
    if (target.id === 'leave-message') target.open = true;
  }
  window.addEventListener('hashchange', revealHashTarget);
  revealHashTarget();

  // Use document positions to keep the highlighted section stable for long sections.
  let scheduled = false;
  function updateActiveSection() {
    scheduled = false;
    const top = header.getBoundingClientRect().height + 50;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= top) active = section;
    }
    if (Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 4) {
      active = sections[sections.length - 1];
    }
    links.forEach(link => {
      const current = link.hash === `#${active.id}`;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleActiveSection() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updateActiveSection);
    }
  }
  links.forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('scroll', scheduleActiveSection, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) closeMenu();
    scheduleActiveSection();
  });
  window.addEventListener('load', scheduleActiveSection);
  window.addEventListener('pageshow', scheduleActiveSection);
  scheduleActiveSection();

  // Carry the selected startup into the existing contact forms without replacing a visitor's message.
  document.querySelectorAll('[data-startup-select]').forEach(select => {
    const form = select.form;
    const subject = form.querySelector('input[name="_subject"]');
    const defaultSubject = subject.value;
    function updateSubject() {
      const kind = form.id === 'coffee-form' ? 'Coffee Chat' : 'Message';
      subject.value = select.value === 'General conversation'
        ? defaultSubject
        : `[Startup: ${select.value}] ${kind} for Peijia`;
    }
    select.addEventListener('change', updateSubject);
    form.addEventListener('reset', () => window.setTimeout(updateSubject, 0));
    window.addEventListener('pageshow', updateSubject);
    updateSubject();
  });
  document.querySelectorAll('[data-startup-interest]').forEach(link => {
    link.addEventListener('click', () => {
      const message = link.hash === '#leave-message';
      const select = document.getElementById(message ? 'message-interest' : 'coffee-interest');
      if (![...select.options].some(option => option.value === link.dataset.startupInterest)) return;
      select.value = link.dataset.startupInterest;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      if (message) document.getElementById('leave-message').open = true;
    });
  });
})();

/* ==========================================================================
   shared.js — site-wide behaviors. Loaded on every page.
   Page-specific files (about-us.js, events.js) handle only their own logic.
   ========================================================================== */

(() => {
  'use strict';

  /* ---------- Scroll reveal ---------------------------------------------- */
  const revealables = document.querySelectorAll('.reveal');
  if (revealables.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealables.forEach((el, i) => {
      // Auto-stagger siblings inside the same parent unless index is preset.
      if (!el.style.getPropertyValue('--reveal-index')) {
        const siblings = Array.from(el.parentElement?.children || []);
        const idx = siblings.filter(s => s.classList.contains('reveal')).indexOf(el);
        el.style.setProperty('--reveal-index', Math.max(idx, 0));
      }
      io.observe(el);
    });
  }

  /* ---------- Navbar: scroll state + mobile toggle ----------------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = nav.querySelector('.nav__toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      // Close on link click (mobile)
      nav.querySelectorAll('.nav__links a').forEach((a) => {
        a.addEventListener('click', () => nav.classList.remove('is-open'));
      });
    }

    // Mark current page in nav
    // Links have no ".html" ("societies", "./" for home); old addresses may.
    const pageName = (path) =>
      (path.split(/[?#]/)[0].split('/').pop() || 'index').replace(/\.html$/, '');
    const here = pageName(location.pathname);
    nav.querySelectorAll('.nav__links a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('#') && pageName(href) === here) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---------- Smooth-scroll for same-page anchors ------------------------ */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- Footer year ------------------------------------------------ */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

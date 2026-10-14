/* ============================================
   IEEE KLETU Student Branch — Main Scripts
   ============================================ */

(function () {
  'use strict';

  // --- Clean address bar ---
  // Pages are served with or without ".html". Old links and bookmarks still
  // end in ".html", so show the clean address without reloading the page.
  (function cleanAddress() {
    if (!/^https?:$/.test(location.protocol) || !window.history || !history.replaceState) return;
    var path = location.pathname;
    var clean = path.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (clean !== path) {
      history.replaceState(history.state, '', clean + location.search + location.hash);
    }
  })();

  // --- Scroll Reveal (IntersectionObserver) ---
  function initRevealAnimations() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Navbar Scroll Behavior ---
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    var scrollThreshold = 60;
    var ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > scrollThreshold) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile Menu Toggle ---
  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    var isOpen = false;

    function toggleMenu() {
      isOpen = !isOpen;
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      // Collapse any open mobile dropdowns
      mobileMenu.querySelectorAll('[data-mobile-dropdown].is-open').forEach(function (item) {
        item.classList.remove('is-open');
        var trig = item.querySelector('[data-mobile-dropdown-trigger]');
        if (trig) trig.setAttribute('aria-expanded', 'false');
      });
    }

    hamburger.addEventListener('click', toggleMenu);

    // Close when a leaf link (real URL) is clicked; ignore dropdown trigger buttons.
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // --- Desktop Navbar Dropdowns ---
  function initNavDropdowns() {
    var items = document.querySelectorAll('[data-dropdown]');
    if (!items.length) return;

    function closeAll(except) {
      items.forEach(function (item) {
        if (item === except) return;
        item.classList.remove('is-open');
        var trig = item.querySelector('[data-dropdown-trigger]');
        if (trig) trig.setAttribute('aria-expanded', 'false');
      });
    }

    items.forEach(function (item) {
      var trigger = item.querySelector('[data-dropdown-trigger]');
      if (!trigger) return;

      // Click: toggle
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !item.classList.contains('is-open');
        closeAll(item);
        item.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', String(open));
      });

      // Hover: open on desktop (hover-capable devices only)
      if (window.matchMedia('(hover: hover)').matches) {
        item.addEventListener('mouseenter', function () {
          closeAll(item);
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        });
        item.addEventListener('mouseleave', function () {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        });
      }

      // Keyboard: Escape closes, Arrow Down moves focus into panel
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.blur();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          var firstLink = item.querySelector('[data-dropdown-panel] a');
          if (firstLink) firstLink.focus();
        }
      });
    });

    // Click outside closes all
    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-dropdown]')) closeAll(null);
    });
  }

  // --- Mobile Menu Dropdowns (accordion) ---
  function initMobileDropdowns() {
    var items = document.querySelectorAll('[data-mobile-dropdown]');
    if (!items.length) return;

    items.forEach(function (item) {
      var trigger = item.querySelector('[data-mobile-dropdown-trigger]');
      if (!trigger) return;

      trigger.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        // Close siblings for a cleaner single-open accordion
        items.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('is-open');
            var t = other.querySelector('[data-mobile-dropdown-trigger]');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', String(open));
      });
    });
  }

  // --- Animated Counters ---
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1800;
    var startTime = null;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutExpo(progress);
      var currentValue = Math.floor(easedProgress * target);

      el.textContent = currentValue;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    window.requestAnimationFrame(step);
  }

  // --- Smooth Scroll for Anchor Links ---
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href === '#') { e.preventDefault(); return; }

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        var navbarHeight = 80;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });

        // Update URL hash without jumping
        history.pushState(null, '', href);
      });
    });
  }

  // --- Active Nav Link Highlighting ---
  function initActiveNavHighlight() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.navbar__links a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              var isActive = link.getAttribute('href') === '#' + id;
              link.style.color = isActive ? 'var(--text-primary)' : '';
              link.style.fontWeight = isActive ? '600' : '';
            });
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '-80px 0px -60% 0px',
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // --- Chapters Carousel ---
  function initChaptersCarousel() {
    var carousels = document.querySelectorAll('[data-carousel]');
    if (!carousels.length) return;

    carousels.forEach(function (carousel) {
      var track = carousel.querySelector('[data-carousel-track]');
      var prev = carousel.querySelector('[data-carousel-prev]');
      var next = carousel.querySelector('[data-carousel-next]');
      if (!track || !prev || !next) return;

      function getStep() {
        var card = track.querySelector('.chapter-card');
        if (!card) return 300;
        var styles = window.getComputedStyle(track);
        var gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
        return card.getBoundingClientRect().width + gap;
      }

      function updateButtons() {
        var max = track.scrollWidth - track.clientWidth - 1;
        prev.disabled = track.scrollLeft <= 0;
        next.disabled = track.scrollLeft >= max;
      }

      prev.addEventListener('click', function () {
        track.scrollBy({ left: -getStep(), behavior: 'smooth' });
      });
      next.addEventListener('click', function () {
        track.scrollBy({ left: getStep(), behavior: 'smooth' });
      });

      track.addEventListener('scroll', updateButtons, { passive: true });
      window.addEventListener('resize', updateButtons);
      updateButtons();
    });
  }

  // --- Society Tabs ---
  function initSocietyTabs() {
    var tabs = document.querySelectorAll('.society-tab');
    var contents = document.querySelectorAll('.society-content');
    var selects = document.querySelectorAll('.society-select');
    
    if ((!tabs.length && !selects.length) || !contents.length) return;

    function switchSociety(targetId) {
      // Update buttons
      tabs.forEach(function (t) {
        if (t.getAttribute('data-society') === targetId) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });

      // Update select values to keep in sync
      selects.forEach(function(s) {
        s.value = targetId;
      });

      // Update contents
      contents.forEach(function (c) { c.classList.remove('active'); });
      var targetContent = document.getElementById('society-' + targetId);
      if (targetContent) {
        targetContent.classList.add('active');
        // Retrigger reveal animations for newly shown elements
        var reveals = targetContent.querySelectorAll('.reveal');
        reveals.forEach(function(r) {
          r.classList.remove('revealed');
          setTimeout(function() {
            r.classList.add('revealed');
          }, 50);
        });
      }
    }
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchSociety(tab.getAttribute('data-society'));
      });
    });

    selects.forEach(function(select) {
      select.addEventListener('change', function(e) {
        switchSociety(e.target.value);
      });
    });

    // Check URL query param or hash on load
    var urlParams = new URLSearchParams(window.location.search);
    var initTab = urlParams.get('tab') || urlParams.get('society');
    if (!initTab && window.location.hash) {
      var hash = window.location.hash.substring(1);
      if (hash.startsWith('society-')) {
        initTab = hash.substring(8);
      } else {
        initTab = hash;
      }
    }
    if (initTab) {
      var hasTab = Array.from(tabs).some(function(t) {
        return t.getAttribute('data-society') === initTab;
      });
      if (hasTab) {
        switchSociety(initTab);
      }
    }
  }

  // --- Contact Form (placeholder handler) ---
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('button[type="submit"]');
      var originalHTML = btn.innerHTML;

      btn.innerHTML = 'Sent successfully';
      btn.style.background = '#34a853';
      btn.disabled = true;

      setTimeout(function () {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 2500);
    });
  }

  // --- Init All ---
  function init() {
    initRevealAnimations();
    initNavbar();
    initNavDropdowns();
    initMobileMenu();
    initMobileDropdowns();
    initCounters();
    initSmoothScroll();
    initActiveNavHighlight();
    initChaptersCarousel();
    initContactForm();
    initSocietyTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

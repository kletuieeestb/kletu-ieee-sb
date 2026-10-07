/* ==========================================================================
   event-gallery.js — photos on event detail pages.

   Two jobs:
     1. Carousel galleries ([data-event-gallery]): arrow buttons, dots or a
        "3 / 12" counter, and keyboard support on top of a scroll-snap track.
        The track already swipes and scrolls without this file.
     2. The full-size viewer: any link marked [data-lightbox] opens its photo
        over the page. Photos that share a data-lightbox value (one gallery)
        can be stepped through with the arrows, the keyboard or a swipe.
        Without this file the links simply open the image.

   Loaded only on generated pages that contain photos or galleries.
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------- carousel */

  function initCarousel(root) {
    var track = root.querySelector('[data-gallery-track]');
    if (!track) return;

    var slides = Array.prototype.slice.call(
      track.querySelectorAll('.event-gallery__slide')
    );
    if (slides.length < 2) return;

    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-gallery-dot]'));
    var counter = root.querySelector('[data-gallery-count]');
    var prevBtn = root.querySelector('[data-gallery-prev]');
    var nextBtn = root.querySelector('[data-gallery-next]');
    var current = 0;

    function setActive(index) {
      current = Math.max(0, Math.min(index, slides.length - 1));
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
        dot.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
      if (counter) counter.textContent = (current + 1) + ' / ' + slides.length;
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === slides.length - 1;
    }

    function goTo(index) {
      var target = slides[Math.max(0, Math.min(index, slides.length - 1))];
      if (!target) return;
      // scrollLeft rather than scrollIntoView: scrollIntoView would also scroll
      // the page vertically to bring the gallery into view.
      track.scrollTo({
        left: target.offsetLeft - track.offsetLeft,
        behavior: 'smooth'
      });
      setActive(index);
    }

    // Keep the dots in sync when the user swipes or scrolls the track directly.
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setActive(slides.indexOf(entry.target));
            }
          });
        },
        { root: track, threshold: 0.6 }
      );
      slides.forEach(function (slide) { observer.observe(slide); });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () { goTo(current - 1); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () { goTo(current + 1); });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () { goTo(index); });
    });

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(current - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(current + 1);
      }
    });

    root.setAttribute('tabindex', '0');
    setActive(0);
  }

  /* -------------------------------------------------------- full-size view */

  var viewer = null;

  function buildViewer() {
    var root = document.createElement('div');
    root.className = 'event-lightbox';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Photo viewer');
    root.innerHTML =
      '<div class="event-lightbox__bar">' +
        '<span class="event-lightbox__count" aria-live="polite"></span>' +
        '<button type="button" class="event-lightbox__button" data-viewer-close aria-label="Close photo viewer">' +
          '<i class="ph ph-x" aria-hidden="true"></i>' +
        '</button>' +
      '</div>' +
      '<div class="event-lightbox__stage">' +
        '<button type="button" class="event-lightbox__button event-lightbox__nav event-lightbox__nav--prev" data-viewer-prev aria-label="Previous photo">' +
          '<i class="ph ph-caret-left" aria-hidden="true"></i>' +
        '</button>' +
        '<img class="event-lightbox__image" alt="">' +
        '<button type="button" class="event-lightbox__button event-lightbox__nav event-lightbox__nav--next" data-viewer-next aria-label="Next photo">' +
          '<i class="ph ph-caret-right" aria-hidden="true"></i>' +
        '</button>' +
      '</div>' +
      '<p class="event-lightbox__caption"></p>';
    document.body.appendChild(root);

    var state = {
      root: root,
      image: root.querySelector('.event-lightbox__image'),
      caption: root.querySelector('.event-lightbox__caption'),
      count: root.querySelector('.event-lightbox__count'),
      closeBtn: root.querySelector('[data-viewer-close]'),
      prevBtn: root.querySelector('[data-viewer-prev]'),
      nextBtn: root.querySelector('[data-viewer-next]'),
      items: [],
      index: 0,
      opener: null
    };

    state.image.addEventListener('load', function () {
      state.image.classList.remove('is-loading');
    });

    state.closeBtn.addEventListener('click', closeViewer);
    state.prevBtn.addEventListener('click', function () { show(state.index - 1); });
    state.nextBtn.addEventListener('click', function () { show(state.index + 1); });

    // A tap on the dark area around the photo closes the viewer.
    root.querySelector('.event-lightbox__stage').addEventListener('click', function (event) {
      if (event.target === event.currentTarget) closeViewer();
    });

    root.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeViewer();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        show(state.index - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        show(state.index + 1);
      } else if (event.key === 'Tab') {
        // Keep keyboard focus inside the viewer while it is open.
        var focusable = Array.prototype.filter.call(
          root.querySelectorAll('button'),
          function (button) { return !button.hidden; }
        );
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    // Swipe left or right to change photo.
    var startX = null;
    var startY = null;
    root.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse') return;
      startX = event.clientX;
      startY = event.clientY;
    });
    root.addEventListener('pointerup', function (event) {
      if (startX === null) return;
      var dx = event.clientX - startX;
      var dy = event.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        show(state.index + (dx < 0 ? 1 : -1));
      }
    });
    root.addEventListener('pointercancel', function () { startX = null; });

    return state;
  }

  function preload(item) {
    if (item) new Image().src = item.href;
  }

  function show(index) {
    var items = viewer.items;
    if (index < 0 || index >= items.length) return;
    viewer.index = index;

    var item = items[index];
    if (viewer.image.getAttribute('src') !== item.href) {
      viewer.image.classList.add('is-loading');
      viewer.image.src = item.href;
    }
    viewer.image.alt = item.alt;
    viewer.caption.textContent = item.caption;

    var many = items.length > 1;
    viewer.count.textContent = many ? (index + 1) + ' / ' + items.length : '';
    viewer.prevBtn.hidden = !many;
    viewer.nextBtn.hidden = !many;
    viewer.prevBtn.disabled = index === 0;
    viewer.nextBtn.disabled = index === items.length - 1;

    preload(items[index + 1]);
    preload(items[index - 1]);
  }

  function openViewer(link) {
    if (!viewer) viewer = buildViewer();

    var group = link.getAttribute('data-lightbox');
    var links = Array.prototype.filter.call(
      document.querySelectorAll('[data-lightbox]'),
      function (candidate) { return candidate.getAttribute('data-lightbox') === group; }
    );

    viewer.items = links.map(function (candidate) {
      var img = candidate.querySelector('img');
      return {
        href: candidate.getAttribute('href'),
        alt: img ? img.getAttribute('alt') || '' : '',
        caption: candidate.getAttribute('data-caption') || ''
      };
    });
    viewer.opener = link;

    show(Math.max(0, links.indexOf(link)));
    document.documentElement.classList.add('event-lightbox-open');
    viewer.root.classList.add('is-open');
    viewer.closeBtn.focus();
  }

  function closeViewer() {
    if (!viewer || !viewer.root.classList.contains('is-open')) return;
    viewer.root.classList.remove('is-open');
    document.documentElement.classList.remove('event-lightbox-open');
    if (viewer.opener) viewer.opener.focus();
  }

  function initViewer() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[data-lightbox]');
      if (!link) return;
      // Let people open the photo in a new tab the usual way.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      openViewer(link);
    });
  }

  /* ------------------------------------------------------------------ init */

  function init() {
    var galleries = document.querySelectorAll('[data-event-gallery]');
    Array.prototype.forEach.call(galleries, initCarousel);
    initViewer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

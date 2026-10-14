/* ==========================================================================
   events.js — Event filtering, searching, sorting, and slider logic
   ========================================================================== */

(function () {
  'use strict';

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  var FALLBACK_IMAGE = 'assets/images/logo.webp';

  function parseDate(value) {
    if (!value) return new Date(0);
    var parts = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (parts) {
      return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
    }
    var d = new Date(value);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildCard(event, index) {
    var date = parseDate(event.date);
    var day = String(date.getDate()).padStart(2, '0');
    var month = MONTHS[date.getMonth()] || '';
    var year = date.getFullYear();
    var iso = event.date || '';
    var detail = event.detailUrl || ('events/' + event.slug);

    var categoryHtml = event.category
      ? '<span class="event-card__category">' + escapeHtml(event.category) + '</span>'
      : '';

    var societyHtml = event.society
      ? '<span class="event-card__society-tag">' + escapeHtml(event.society) + '</span>'
      : '';

    var card = document.createElement('article');
    card.className = 'event-card';
    card.style.setProperty('--card-index', String(index));

    card.innerHTML =
      '<a href="' + escapeHtml(detail) + '" class="event-card__link" aria-label="Read about ' + escapeHtml(event.title) + '">' +
        '<div class="event-card__media">' +
          '<img src="' + escapeHtml(event.image || FALLBACK_IMAGE) + '" alt="' + escapeHtml(event.title) + '" ' +
            'onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\';this.classList.add(\'event-card__media-img--placeholder\');">' +
          '<time class="event-card__date" datetime="' + escapeHtml(iso) + '">' +
            '<span class="event-card__date-day">' + day + '</span>' +
            '<span class="event-card__date-month">' + month + ' ' + year + '</span>' +
          '</time>' +
          categoryHtml +
        '</div>' +
        '<div class="event-card__body">' +
          societyHtml +
          '<h3 class="event-card__title">' + escapeHtml(event.title) + '</h3>' +
          '<p class="event-card__description">' + escapeHtml(event.description || '') + '</p>' +
          '<span class="event-card__cta">' +
            'Learn more' +
            '<i class="ph ph-arrow-right" aria-hidden="true"></i>' +
          '</span>' +
        '</div>' +
      '</a>';

    return card;
  }

  function revealCards(root) {
    var cards = root.querySelectorAll('.event-card');
    if (!cards.length || !('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(function (c) { io.observe(c); });
  }

  /* ==========================================================================
     Events Hero Slider
     ========================================================================== */

  function initEventsSlider(allEvents) {
    var sliderContainer = document.querySelector('[data-slider-container]');
    var dotsContainer = document.querySelector('[data-slider-dots]');
    var prevBtn = document.querySelector('[data-slider-prev]');
    var nextBtn = document.querySelector('[data-slider-next]');

    if (!sliderContainer) return;

    var slidesData = allEvents.filter(function (e) { return e.slider === true; });
    slidesData.sort(function (a, b) {
      return parseDate(b.date).getTime() - parseDate(a.date).getTime();
    });

    if (slidesData.length === 0 && allEvents.length > 0) {
      slidesData = allEvents.slice(0, 3);
    }

    if (slidesData.length === 0) {
      sliderContainer.innerHTML =
        '<div class="events-slide active">' +
          '<div class="events-slide__bg events-slide__bg--fallback"></div>' +
          '<div class="events-slide__content container">' +
            '<span class="events-slide__eyebrow">IEEE KLETU Events</span>' +
            '<h2 class="events-slide__title">No events to showcase</h2>' +
          '</div>' +
        '</div>';
      if (dotsContainer) dotsContainer.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }

    var slidesHtml = '';
    var dotsHtml = '';

    slidesData.forEach(function (ev, idx) {
      var activeClass = idx === 0 ? ' active' : '';
      var detail = ev.detailUrl || ('events/' + ev.slug);

      slidesHtml +=
        '<div class="events-slide' + activeClass + '" data-slide-index="' + idx + '">' +
          '<div class="events-slide__bg" style="background-image: url(\'' + escapeHtml(ev.image || FALLBACK_IMAGE) + '\');"></div>' +
          '<div class="events-slide__overlay"></div>' +
          '<div class="events-slide__content container">' +
            '<span class="events-slide__eyebrow">' + escapeHtml(ev.society || 'IEEE KLETU') + ' &bull; ' + escapeHtml(ev.category || 'Event') + '</span>' +
            '<h2 class="events-slide__title">' + escapeHtml(ev.title) + '</h2>' +
            '<p class="events-slide__lead">' + escapeHtml(ev.description || '') + '</p>' +
            '<a href="' + escapeHtml(detail) + '" class="btn btn--primary events-slide__btn">' +
              'View details' +
              '<i class="ph ph-arrow-right" aria-hidden="true"></i>' +
            '</a>' +
          '</div>' +
        '</div>';

      dotsHtml +=
        '<button class="slider-dot' + activeClass + '" data-slide-to="' + idx + '" aria-label="Go to slide ' + (idx + 1) + '"></button>';
    });

    sliderContainer.innerHTML = slidesHtml;
    if (dotsContainer) dotsContainer.innerHTML = dotsHtml;

    if (slidesData.length <= 1) {
      if (dotsContainer) dotsContainer.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }

    var currentIndex = 0;
    var totalSlides = slidesData.length;
    var autoplayTimer = null;

    function goToSlide(newIndex) {
      var slides = sliderContainer.querySelectorAll('.events-slide');
      var dots = dotsContainer ? dotsContainer.querySelectorAll('.slider-dot') : [];

      if (slides[currentIndex]) slides[currentIndex].classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

      currentIndex = (newIndex + totalSlides) % totalSlides;

      if (slides[currentIndex]) slides[currentIndex].classList.add('active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(function () {
        goToSlide(currentIndex + 1);
      }, 6000);
    }

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(currentIndex - 1);
        startAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(currentIndex + 1);
        startAutoplay();
      });
    }

    if (dotsContainer) {
      dotsContainer.addEventListener('click', function (e) {
        var dot = e.target.closest('[data-slide-to]');
        if (dot) {
          var targetIdx = parseInt(dot.getAttribute('data-slide-to'), 10);
          if (!isNaN(targetIdx)) {
            goToSlide(targetIdx);
            startAutoplay();
          }
        }
      });
    }

    startAutoplay();
  }

  /* ==========================================================================
     Events Search & Filtering Engine
     ========================================================================== */

  function initEventsApp() {
    var allEvents = Array.isArray(window.EVENTS) ? window.EVENTS : [];
    
    // Sort all events by date desc by default
    allEvents.sort(function (a, b) {
      return parseDate(b.date).getTime() - parseDate(a.date).getTime();
    });

    initEventsSlider(allEvents);

    var eventsContainer = document.getElementById('eventsContainer') || document.querySelector('[data-events-target]');
    var searchInput = document.getElementById('eventsSearch');
    var societySelect = document.getElementById('societyFilter');
    var yearSelect = document.getElementById('yearFilter');
    var sortSelect = document.getElementById('sortOrder');
    var countEl = document.getElementById('eventsCount') || document.querySelector('[data-events-count]');
    var emptyEl = document.getElementById('eventsEmpty') || document.querySelector('[data-events-empty]');
    var categoryPills = document.querySelectorAll('[data-society-pill]');

    if (!eventsContainer) return;

    // Populate Year Filter Dynamically
    if (yearSelect && yearSelect.options.length <= 1) {
      var yearsSet = {};
      allEvents.forEach(function (e) {
        var y = parseDate(e.date).getFullYear();
        if (y > 1970) yearsSet[y] = true;
      });
      var sortedYears = Object.keys(yearsSet).map(Number).sort(function (a, b) { return b - a; });
      sortedYears.forEach(function (yr) {
        var opt = document.createElement('option');
        opt.value = String(yr);
        opt.textContent = String(yr);
        yearSelect.appendChild(opt);
      });
    }

    function filterAndRender() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var selectedYear = yearSelect ? yearSelect.value.trim() : 'all';
      var selectedSort = sortSelect ? sortSelect.value.trim() : 'newest';

      var selectedSociety = 'all';
      var activePill = document.querySelector('[data-society-pill].active');
      if (activePill) {
        selectedSociety = activePill.getAttribute('data-society-pill').toLowerCase();
      }

      var filtered = allEvents.filter(function (e) {
        // Query search
        if (query) {
          var titleMatch = (e.title || '').toLowerCase().indexOf(query) !== -1;
          var descMatch = (e.description || '').toLowerCase().indexOf(query) !== -1;
          var catMatch = (e.category || '').toLowerCase().indexOf(query) !== -1;
          var socMatch = (e.society || '').toLowerCase().indexOf(query) !== -1;
          if (!titleMatch && !descMatch && !catMatch && !socMatch) {
            return false;
          }
        }

        // Society pill filter
        if (selectedSociety !== 'all') {
          var eSoc = (e.society || '').toLowerCase();
          if (eSoc.indexOf(selectedSociety) === -1 && selectedSociety.indexOf(eSoc) === -1) {
            return false;
          }
        }

        // Year filter
        if (selectedYear !== 'all') {
          var eYear = String(parseDate(e.date).getFullYear());
          if (eYear !== selectedYear) {
            return false;
          }
        }

        return true;
      });

      // Sorting
      filtered.sort(function (a, b) {
        var ad = parseDate(a.date).getTime();
        var bd = parseDate(b.date).getTime();
        return selectedSort === 'oldest' ? (ad - bd) : (bd - ad);
      });

      // Render Cards
      eventsContainer.innerHTML = '';

      if (filtered.length === 0) {
        if (emptyEl) emptyEl.hidden = false;
        if (countEl) countEl.textContent = '0 events found';
      } else {
        if (emptyEl) emptyEl.hidden = true;
        if (countEl) {
          countEl.textContent = filtered.length + ' event' + (filtered.length === 1 ? '' : 's');
        }

        filtered.forEach(function (ev, i) {
          eventsContainer.appendChild(buildCard(ev, i));
        });

        revealCards(eventsContainer);
      }
    }

    // Attach Event Listeners
    if (searchInput) searchInput.addEventListener('input', filterAndRender);
    if (yearSelect) yearSelect.addEventListener('change', filterAndRender);
    if (sortSelect) sortSelect.addEventListener('change', filterAndRender);

    if (categoryPills.length) {
      categoryPills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          categoryPills.forEach(function (p) { p.classList.remove('active'); });
          pill.classList.add('active');
          filterAndRender();
        });
      });
    }

    // Initial render
    filterAndRender();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventsApp);
  } else {
    initEventsApp();
  }

})();

/* ==========================================================================
   chapters-slider.js — dynamic common hero slider for societies.html and
   affinity-groups.html. Cycles chapters automatically every 1 second.
   ========================================================================== */

(function () {
  'use strict';

  var FALLBACK_IMAGE = 'assets/images/logo.webp';

  var CHAPTERS = [
    {
      id: 'cass',
      abbr: 'CASS',
      title: 'Circuits & Systems Society',
      logo: 'assets/images/CASS.webp',
      desc: 'Focusing on the design, analysis, and implementation of analog, digital, sensor interface, and neuromorphic circuit processing.',
      type: 'society',
      slug: 'societies#cass'
    },
    {
      id: 'ceda',
      abbr: 'CEDA',
      title: 'Council on Electronic Design Automation',
      logo: 'assets/images/CEDA.webp',
      desc: 'Exploring computer-aided design (CAD) algorithms, SoC architecture, logic synthesis, hardware security, and VLSI chip systems.',
      type: 'society',
      slug: 'societies#ceda'
    },
    {
      id: 'pes',
      abbr: 'PES',
      title: 'Power & Energy Society',
      logo: 'assets/images/PES.webp',
      desc: 'Providing scientific and engineering insights on grid modernization, renewable energy integration, and sustainable transmission solutions.',
      type: 'society',
      slug: 'societies#pes'
    },
    {
      id: 'cs',
      abbr: 'CS',
      title: 'Computer Society',
      logo: 'assets/images/CS.webp',
      desc: 'The oldest and largest technical society in IEEE, focused on software engineering, machine learning, cybersecurity, and computer systems.',
      type: 'society',
      slug: 'societies#cs'
    },
    {
      id: 'pels',
      abbr: 'PELS',
      title: 'Power Electronics Society',
      logo: 'assets/images/PELS.webp',
      desc: 'Advancing power conversion technologies critical to EV drivetrains, solar inverters, smart grids, and high-efficiency electrical systems.',
      type: 'society',
      slug: 'societies#pels'
    },
    {
      id: 'ras',
      abbr: 'RAS',
      title: 'Robotics & Automation Society',
      logo: 'assets/images/RAS.webp',
      desc: 'Fostering hands-on development in autonomous robotics, mechanical engineering, control systems, and computer vision.',
      type: 'society',
      slug: 'societies#ras'
    },
    {
      id: 'embs',
      abbr: 'EMBS',
      title: 'Engineering in Medicine & Biology Society',
      logo: 'assets/images/EMBS.webp',
      desc: 'Advancing healthcare and biomedical engineering through medical technology, bio-instrumentation, neural engineering, and health informatics.',
      type: 'society',
      slug: 'societies#embs'
    },
    {
      id: 'wie',
      abbr: 'WIE',
      title: 'Women in Engineering',
      logo: 'assets/images/WIE.webp',
      desc: 'Promoting gender equity, professional mentoring, and career development to support and inspire women engineers globally.',
      type: 'group',
      slug: 'affinity-groups#wie'
    }
  ];

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initChaptersSlider() {
    var sliderContainer = document.querySelector('[data-slider-container]');
    var dotsContainer = document.querySelector('[data-slider-dots]');

    if (!sliderContainer) return;

    // Detect Page Context
    var isAffinityPage = !!document.querySelector('.ag-list');
    var isSocietiesPage = !!document.querySelector('.societies-list');

    var slidesData = CHAPTERS.slice();

    // Reorder data based on page context
    if (isAffinityPage) {
      // Find WIE and move to index 0
      var wieIndex = -1;
      for (var i = 0; i < slidesData.length; i++) {
        if (slidesData[i].id === 'wie') {
          wieIndex = i;
          break;
        }
      }
      if (wieIndex !== -1) {
        var wie = slidesData.splice(wieIndex, 1)[0];
        slidesData.unshift(wie); // Place first
      }
    } else {
      // For societies page or others, keep societies first and WIE last
      var wieIndex = -1;
      for (var i = 0; i < slidesData.length; i++) {
        if (slidesData[i].id === 'wie') {
          wieIndex = i;
          break;
        }
      }
      if (wieIndex !== -1 && wieIndex !== slidesData.length - 1) {
        var wie = slidesData.splice(wieIndex, 1)[0];
        slidesData.push(wie); // Place last
      }
    }

    var slidesHtml = '';
    var dotsHtml = '';

    slidesData.forEach(function (ch, idx) {
      var activeClass = idx === 0 ? ' active' : '';
      
      // Determine Relative Link
      var linkPath = ch.slug;
      if (isAffinityPage && ch.type === 'group') {
        linkPath = '#' + ch.id;
      } else if (isSocietiesPage && ch.type === 'society') {
        linkPath = '#' + ch.id;
      }

      var eyebrowText = ch.type === 'group' ? 'IEEE Affinity Group' : 'IEEE Technical Chapter';
      var logoSrc = ch.logo || FALLBACK_IMAGE;

      slidesHtml +=
        '<div class="chapters-slide' + activeClass + '" data-slide-index="' + idx + '">' +
          '<div class="chapters-slide__grid container">' +
            '<div class="chapters-slide__text">' +
              '<span class="chapters-slide__eyebrow">' + eyebrowText + ' &middot; ' + ch.abbr + '</span>' +
              '<h2 class="chapters-slide__title">' + escapeHtml(ch.title) + '</h2>' +
              '<p class="chapters-slide__lead">' + escapeHtml(ch.desc) + '</p>' +
              '<div class="chapters-slide__actions">' +
                '<a href="' + escapeHtml(linkPath) + '" class="btn btn--ghost">Explore section <i class="ph ph-arrow-right"></i></a>' +
              '</div>' +
            '</div>' +
            '<div class="chapters-slide__media">' +
              '<div class="chapters-slide__logo-ring">' +
                '<img src="' + escapeHtml(logoSrc) + '" alt="' + escapeHtml(ch.title) + ' logo" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\';">' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      dotsHtml += '<button class="slider-dot' + (idx === 0 ? ' active' : '') + '" data-dot-index="' + idx + '" aria-label="Go to slide ' + (idx + 1) + '"></button>';
    });

    sliderContainer.innerHTML = slidesHtml;
    if (dotsContainer) {
      dotsContainer.innerHTML = dotsHtml;
    }

    // Active Slide Handlers
    var currentSlide = 0;
    var totalSlides = slidesData.length;
    var autoplayInterval = null;

    function showSlide(index) {
      if (index < 0) index = totalSlides - 1;
      else if (index >= totalSlides) index = 0;

      var slides = sliderContainer.querySelectorAll('.chapters-slide');
      var dots = dotsContainer ? dotsContainer.querySelectorAll('.slider-dot') : [];

      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === index);
      });

      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === index);
      });

      currentSlide = index;
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayInterval = setInterval(nextSlide, 2500); // 2500ms (2.5 seconds) cycle
    }

    function stopAutoplay() {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    }

    // Allow user to click pagination dots to pause and jump slides
    if (dotsContainer) {
      dotsContainer.addEventListener('click', function (e) {
        var dot = e.target.closest('.slider-dot');
        if (!dot) return;
        var idx = parseInt(dot.getAttribute('data-dot-index'), 10);
        showSlide(idx);
        startAutoplay(); // reset interval
      });
    }

    // Pause autoplay on mouse enter
    sliderContainer.addEventListener('mouseenter', stopAutoplay);
    sliderContainer.addEventListener('mouseleave', startAutoplay);

    // Initial Trigger
    startAutoplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChaptersSlider);
  } else {
    initChaptersSlider();
  }
})();

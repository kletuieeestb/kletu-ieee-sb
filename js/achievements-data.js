/* ==========================================================================
   achievements-data.js — single source of truth for every achievement.

   HOW TO ADD A NEW ACHIEVEMENT:

     1. Drop the achievement images into: assets/achievements/
        Each achievement needs:
          - cardImage    → 4:3 image shown on the achievements grid card
          - detailImage  → wide banner image (16:9 or similar) for detail page
          - sliderImage  → optional background slider image (16:9, dark overlays)

     2. Copy achievements/_template.html to achievements/<slug>.html, then fill
        in the long-form detailed story there. Keep filename matching the slug.

     3. Append a new object to the ACHIEVEMENTS array below.
          - slug         → kebab-case id (must match detail page filename)
          - title        → title on cards, slider, and detail pages
          - date         → "YYYY-MM-DD"
          - cardImage    → path to card image
          - detailImage  → path to detail image
          - sliderImage  → path to slider image (can be same as detailImage or omitted)
          - slider       → boolean (true/false) to highlight in Hero Slider
          - description  → 1–2 line summary for card and slider caption
          - category     → short label ("Award", "Competition", "Research", …)
          - priority     → integer. Higher = shown first in listings.

   ========================================================================== */

(function () {
  'use strict';

  var ACHIEVEMENTS = [
    {
      slug: 'event-of-the-month-may-2026',
      title: 'NKSS Event of the Month - May 2026 Winner',
      date: '2026-05-27',
      cardImage: 'assets/achievements/event-of-the-month.webp',
      detailImage: 'assets/achievements/event-of-the-month-may-2026-detail.png',
      sliderImage: 'assets/achievements/event-of-the-month-may-2026-slider.png',
      slider: true,
      description: '',
      category: 'Award',
      priority: 1
    }
  ];

  // Post-process to resolve full paths and fallbacks
  ACHIEVEMENTS.forEach(function (ach) {
    if (!ach.detailUrl && ach.slug) {
      ach.detailUrl = 'achievements/' + ach.slug;
    }
    if (typeof ach.priority !== 'number') ach.priority = 0;
    if (!ach.category) ach.category = 'General';
    
    // Image fallbacks if someone forgets to define them
    var fallback = 'assets/images/logo.webp';
    if (!ach.cardImage) ach.cardImage = fallback;
    if (!ach.detailImage) ach.detailImage = ach.cardImage;
    if (!ach.sliderImage) ach.sliderImage = ach.detailImage;
  });

  // Expose to window context
  window.ACHIEVEMENTS = ACHIEVEMENTS;
})();

/* ==========================================================================
   events-data.js

   GENERATED FILE - do not edit by hand.

   The IEEE Student Branch CMS is the single source of truth for events. This
   file is rewritten in full every time an event is published or unpublished.
   To add, change or remove an event, use the CMS at the admin portal; any
   manual edit here is overwritten on the next publish.

   Each entry carries only structured fields, so every card renders identically
   regardless of what the article body contains.
   ========================================================================== */

(function () {
  'use strict';

  var EVENTS = [

  ];

  EVENTS.forEach(function (ev) {
    if (!ev.detailUrl) ev.detailUrl = 'events/' + ev.slug;
    if (typeof ev.priority !== 'number') ev.priority = 0;
    if (!ev.category) ev.category = '';
  });

  window.EVENTS = EVENTS;
})();

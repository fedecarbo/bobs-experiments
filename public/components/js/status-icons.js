/**
 * Status Icons Component
 * Single source of truth for status icon SVGs
 *
 * Usage:
 *   StatusIcons.get('empty')    // Returns SVG string for empty circle
 *   StatusIcons.get('complete') // Returns SVG string for blue checkmark
 *   StatusIcons.get('warning')  // Returns SVG string for orange arrow
 */
(function() {
  'use strict';

  var StatusIcons = {
    // Base icon definitions by visual appearance
    icons: {
      // Empty circle - light blue fill
      empty: '<svg class="task-list__status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#bbd4ea"/></svg>',

      // Complete - blue circle with white checkmark
      complete: '<svg class="task-list__status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1d70b8"/><path d="M7.5 12l3 3 6-6" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',

      // Warning - orange circle with white arrow
      warning: '<svg class="task-list__status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#f47738"/><path stroke-linecap="round" stroke-linejoin="round" stroke="#ffffff" stroke-width="2" fill="none" d="M13 16 8 12m0 0 5-4M8 12h9"/></svg>',

      // No review needed - mid grey circle with white checkmark (GOV.UK mid-grey #b1b4b6)
      noReview: '<svg class="task-list__status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#b1b4b6"/><path d="M7.5 12l3 3 6-6" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    },

    /**
     * Get an icon by name
     * @param {string} name - Icon name: 'empty', 'complete', or 'warning'
     * @returns {string} SVG string
     */
    get: function(name) {
      return this.icons[name] || this.icons.empty;
    }
  };

  // Export for use by other components
  window.StatusIcons = StatusIcons;
})();

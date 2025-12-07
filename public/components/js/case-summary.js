/**
 * Case Summary JS
 * Handles the proposal description toggle
 */

(function() {
  'use strict';

  function initCaseSummary() {
    const toggle = document.querySelector('.case-summary__toggle');
    const description = document.getElementById('proposal-description');

    if (!toggle || !description) return;

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      description.classList.toggle('is-visible');
      toggle.textContent = isExpanded ? 'Show proposal description' : 'Hide proposal description';
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCaseSummary);
  } else {
    initCaseSummary();
  }
})();

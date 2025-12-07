/**
 * Sidebar JS
 * Progress bar updates and current page highlighting
 */

(function() {
  'use strict';

  // SVG icons for status indicators
  var icons = {
    notReviewed: '<svg class="task-list__status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#bbd4ea" aria-hidden="true"><circle cx="12" cy="12" r="11"/></svg>',
    agreed: '<svg class="task-list__status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1d70b8"/><path d="M7.5 12l3 3 6-6" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    returned: '<svg class="task-list__status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#f47738"/><path stroke-linecap="round" stroke-linejoin="round" stroke="#ffffff" stroke-width="2" fill="none" d="M13 16 8 12m0 0 5-4M8 12h9"/></svg>'
  };

  /**
   * Update the progress bar display
   * @param {number} completed - Number of completed items
   * @param {number} total - Total number of items
   */
  function updateProgressBar(completed, total) {
    var progressFill = document.getElementById('progress-fill');
    var progressCount = document.getElementById('progress-count');
    var progressBar = document.querySelector('.sidebar-progress');

    if (!progressFill || !progressCount || !progressBar) return;

    var percentage = (completed / total) * 100;
    progressFill.style.width = percentage + '%';
    progressCount.textContent = completed;
    progressBar.setAttribute('aria-valuenow', completed);
  }

  /**
   * Get sidebar item element by section name
   * @param {string} sectionName - The section identifier
   * @returns {Element|null}
   */
  function getSidebarItem(sectionName) {
    return document.querySelector('.task-list__item[data-section="' + sectionName + '"]');
  }

  /**
   * Update sidebar item status
   * @param {string} sectionName - The section identifier
   * @param {string} status - Status: 'not-reviewed', 'agreed', or 'returned'
   */
  function updateSidebarStatus(sectionName, status) {
    var item = getSidebarItem(sectionName);
    if (!item) return;

    // Remove all status classes
    item.classList.remove('task-list__item--not-reviewed', 'task-list__item--agreed', 'task-list__item--returned');

    // Add new status class and icon
    var statusEl = item.querySelector('.task-list__status');
    if (status === 'agreed') {
      item.classList.add('task-list__item--agreed');
      statusEl.innerHTML = icons.agreed;
    } else if (status === 'returned') {
      item.classList.add('task-list__item--returned');
      statusEl.innerHTML = icons.returned;
    } else {
      item.classList.add('task-list__item--not-reviewed');
      statusEl.innerHTML = icons.notReviewed;
    }
  }

  /**
   * Highlight current page in sidebar (for multi-page navigation)
   */
  function highlightCurrentPage() {
    var currentPath = window.location.pathname;
    var links = document.querySelectorAll('.task-list__link');

    links.forEach(function(link) {
      var href = link.getAttribute('href');
      // Skip anchor links (single-page navigation)
      if (href && href.startsWith('#')) return;

      // Check if this link matches current page
      if (href && currentPath.endsWith(href)) {
        link.closest('.task-list__item').classList.add('task-list__item--current');
      }
    });
  }

  // Initialize when DOM is ready
  function init() {
    highlightCurrentPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export functions for use by other components
  window.SidebarUtils = {
    updateProgressBar: updateProgressBar,
    getSidebarItem: getSidebarItem,
    updateSidebarStatus: updateSidebarStatus,
    icons: icons
  };
})();

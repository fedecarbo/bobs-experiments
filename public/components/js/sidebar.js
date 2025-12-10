/**
 * Sidebar JS
 * Progress bar updates and current page highlighting
 *
 * Requires: status-icons.js to be loaded first
 */

(function() {
  'use strict';

  // Map Review workflow terminology to base icons
  // Uses StatusIcons component for actual SVG strings
  var icons = {
    notReviewed: function() { return window.StatusIcons.get('empty'); },
    agreed: function() { return window.StatusIcons.get('complete'); },
    returned: function() { return window.StatusIcons.get('warning'); }
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
      statusEl.innerHTML = icons.agreed();
    } else if (status === 'returned') {
      item.classList.add('task-list__item--returned');
      statusEl.innerHTML = icons.returned();
    } else {
      item.classList.add('task-list__item--not-reviewed');
      statusEl.innerHTML = icons.notReviewed();
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

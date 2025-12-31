/**
 * Assessment Controls JS
 * Handles task completion and sidebar status updates
 */

(function() {
  'use strict';

  // Storage key for assessment state
  var STORAGE_KEY = 'bops-assessment-state';

  // SVG icons for status indicators - matching Review sidebar style
  var icons = {
    notStarted: '<svg class="task-list__status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#bbd4ea"/></svg>',
    completed: '<svg class="task-list__status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1d70b8"/><path d="M7.5 12l3 3 6-6" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /**
   * Get assessment state from localStorage
   */
  function getState() {
    try {
      var state = localStorage.getItem(STORAGE_KEY);
      return state ? JSON.parse(state) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Save assessment state to localStorage
   */
  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save assessment state');
    }
  }

  /**
   * Mark a task as completed
   */
  function markTaskComplete(taskId) {
    var state = getState();
    state[taskId] = 'completed';
    saveState(state);
    updateSidebarFromState();
    updateProgressBar();
  }


  /**
   * Get task status
   */
  function getTaskStatus(taskId) {
    var state = getState();
    return state[taskId] || 'not-started';
  }

  /**
   * Update sidebar item status
   */
  function updateSidebarItem(taskId, status) {
    var item = document.querySelector('.task-list__item[data-section="' + taskId + '"]');
    if (!item) return;

    // Remove all status classes
    item.classList.remove('task-list__item--not-started', 'task-list__item--completed');

    // Add new status class and icon
    var statusEl = item.querySelector('.task-list__status');
    if (status === 'completed') {
      item.classList.add('task-list__item--completed');
      if (statusEl) statusEl.innerHTML = icons.completed;
    } else {
      item.classList.add('task-list__item--not-started');
      if (statusEl) statusEl.innerHTML = icons.notStarted;
    }
  }

  /**
   * Update all sidebar items from saved state
   */
  function updateSidebarFromState() {
    var state = getState();
    var items = document.querySelectorAll('.task-list__item[data-section]');

    items.forEach(function(item) {
      var taskId = item.getAttribute('data-section');
      var status = state[taskId] || 'not-started';

      // Don't override current page highlighting, but do update completed status
      if (!item.classList.contains('task-list__item--current')) {
        updateSidebarItem(taskId, status);
      } else if (status === 'completed') {
        // Add completed class and icon even if current
        item.classList.remove('task-list__item--not-started');
        item.classList.add('task-list__item--completed');
        var statusEl = item.querySelector('.task-list__status');
        if (statusEl) statusEl.innerHTML = icons.completed;
      }
    });
  }

  /**
   * Update progress bar based on completed tasks
   */
  function updateProgressBar() {
    var state = getState();
    var items = document.querySelectorAll('.task-list__item[data-section]');
    var total = items.length;
    var completed = 0;

    items.forEach(function(item) {
      var taskId = item.getAttribute('data-section');
      if (state[taskId] === 'completed') {
        completed++;
      }
    });

    var progressFill = document.getElementById('progress-fill');
    var progressCount = document.getElementById('progress-count');
    var progressBar = document.querySelector('.sidebar-progress');

    if (progressFill) {
      var percentage = total > 0 ? (completed / total) * 100 : 0;
      progressFill.style.width = percentage + '%';
    }
    if (progressCount) {
      progressCount.textContent = completed;
    }
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', completed);
    }
  }

  /**
   * Get current task ID from page
   */
  function getCurrentTaskId() {
    var currentItem = document.querySelector('.task-list__item--current');
    return currentItem ? currentItem.getAttribute('data-section') : null;
  }

  /**
   * Bind form handlers (separated for reinit after dynamic content load)
   */
  function bindFormHandlers() {
    // Handle "Save and mark as complete" button - just mark complete, no navigation
    var completeBtn = document.querySelector('[data-action="complete"]');
    if (completeBtn) {
      // Remove existing listener by cloning
      var newBtn = completeBtn.cloneNode(true);
      completeBtn.parentNode.replaceChild(newBtn, completeBtn);
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        var taskId = getCurrentTaskId();
        if (taskId) {
          markTaskComplete(taskId);
        }
      });
    }

    // Handle form submission with complete action - just mark complete, no navigation
    var form = document.querySelector('#main-content form');
    if (form) {
      // Remove existing listener by cloning
      var newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var taskId = getCurrentTaskId();
        if (taskId) {
          markTaskComplete(taskId);
        }
      });
    }
  }

  /**
   * Initialize assessment controls
   */
  function init() {
    // Update sidebar from saved state
    updateSidebarFromState();
    updateProgressBar();
    bindFormHandlers();

    // Bind reset demo link
    var resetLink = document.getElementById('reset-demo');
    if (resetLink) {
      resetLink.addEventListener('click', function(e) {
        e.preventDefault();
        resetState();
        location.reload();
      });
    }
  }

  /**
   * Reinitialize after dynamic content load
   */
  function reinit() {
    updateSidebarFromState();
    updateProgressBar();
    bindFormHandlers();
  }

  /**
   * Reset all assessment state (useful for testing)
   */
  function resetState() {
    localStorage.removeItem(STORAGE_KEY);
    updateSidebarFromState();
    updateProgressBar();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export functions for use by other components
  window.AssessmentUtils = {
    markTaskComplete: markTaskComplete,
    getTaskStatus: getTaskStatus,
    updateProgressBar: updateProgressBar,
    resetState: resetState,
    getState: getState,
    reinit: reinit
  };
})();

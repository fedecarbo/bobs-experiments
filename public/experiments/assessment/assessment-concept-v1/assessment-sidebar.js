/**
 * Assessment Sidebar Component
 * Renders the sidebar from a single source of truth
 *
 * Requires: status-icons.js to be loaded first
 */
(function() {
  'use strict';

  // Map Assessment workflow terminology to base icons
  var statusToIcon = {
    'not-started': 'empty',
    'completed': 'complete'
  };

  var AssessmentSidebar = {
    // Task groups configuration - edit this to change sidebar structure
    taskGroups: [
      {
        name: 'Check application',
        tasks: [
          { id: 'check-application-details', name: 'Check application details', href: 'check-application-details.html' },
          { id: 'check-consultees-consulted', name: 'Check consultees consulted', href: 'check-consultees-consulted.html' },
          { id: 'check-site-history', name: 'Check site history', href: 'check-site-history.html' }
        ]
      },
      {
        name: 'Additional services',
        tasks: [
          { id: 'site-visit', name: 'Site visit', href: 'site-visit.html' },
          { id: 'meeting', name: 'Meeting', href: 'meeting.html' }
        ]
      },
      {
        name: 'Assessment summaries',
        tasks: [
          { id: 'site-description', name: 'Site description', href: 'site-description.html' },
          { id: 'planning-considerations-and-advice', name: 'Planning considerations and advice', href: 'planning-considerations-and-advice.html' },
          { id: 'suggest-heads-of-terms', name: 'Suggest heads of terms', href: 'suggest-heads-of-terms.html' },
          { id: 'summary-of-advice', name: 'Summary of advice', href: 'summary-of-advice.html' }
        ]
      },
      {
        name: 'Complete assessment',
        tasks: [
          { id: 'choose-application-type', name: 'Choose application type', href: 'choose-application-type.html' },
          { id: 'check-and-add-requirements', name: 'Check and add requirements', href: 'check-and-add-requirements.html' },
          { id: 'review-and-submit-pre-application', name: 'Review and submit pre-application', href: 'review-and-submit-pre-application.html' }
        ]
      }
    ],

    /**
     * Get total number of tasks
     */
    getTotalTasks: function() {
      return this.taskGroups.reduce(function(total, group) {
        return total + group.tasks.length;
      }, 0);
    },

    /**
     * Get current page section ID from URL
     */
    getCurrentSection: function() {
      var filename = window.location.pathname.split('/').pop().replace('.html', '');
      // Map index to null (no task selected on landing page)
      if (filename === 'index' || filename === '') {
        return null;
      }
      return filename;
    },

    /**
     * Render the status icon SVG
     * @param {string} status - Status: 'not-started' or 'completed'
     */
    renderStatusIcon: function(status) {
      var iconName = statusToIcon[status] || 'empty';
      return window.StatusIcons.get(iconName);
    },

    /**
     * Render a single task item
     */
    renderTaskItem: function(task, isCurrent) {
      var status = task.status || 'not-started';
      var statusClass = 'task-list__item--' + status;
      var linkContent =
        '<span class="task-list__status" aria-hidden="true">' +
          this.renderStatusIcon(status) +
        '</span>' +
        '<span class="task-list__name">' + task.name + '</span>';

      var itemHtml = '<li class="task-list__item ' + statusClass;
      if (isCurrent) {
        itemHtml += ' task-list__item--current';
      }
      itemHtml += '" data-section="' + task.id + '">';

      if (isCurrent) {
        // Current page - render as span (not clickable)
        itemHtml += '<span class="task-list__link">' + linkContent + '</span>';
      } else {
        // Other pages - render as link
        itemHtml += '<a href="' + task.href + '" class="task-list__link govuk-service-navigation__link">' + linkContent + '</a>';
      }

      itemHtml += '</li>';
      return itemHtml;
    },

    /**
     * Render a task group with heading and items
     */
    renderTaskGroup: function(group, currentSection) {
      var self = this;
      var html = '<h3 class="task-list__group-heading">' + group.name + '</h3>';
      html += '<ul class="task-list__items">';

      group.tasks.forEach(function(task) {
        var isCurrent = task.id === currentSection;
        html += self.renderTaskItem(task, isCurrent);
      });

      html += '</ul>';
      return html;
    },

    /**
     * Render the progress bar
     */
    renderProgressBar: function() {
      var total = this.getTotalTasks();
      return '<div class="sidebar-progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + total + '" aria-label="Assessment progress">' +
        '<div class="sidebar-progress__label">' +
          '<span class="govuk-body-s govuk-!-margin-bottom-0">Assessment progress</span>' +
          '<span class="govuk-body-s govuk-!-margin-bottom-0"><strong id="progress-count">0</strong> of <strong>' + total + '</strong></span>' +
        '</div>' +
        '<div class="sidebar-progress__bar">' +
          '<div class="sidebar-progress__fill" id="progress-fill"></div>' +
        '</div>' +
      '</div>';
    },

    /**
     * Render the task list navigation
     */
    renderTaskList: function() {
      var self = this;
      var currentSection = this.getCurrentSection();

      var html = '<nav class="task-list" aria-label="Assess the application">' +
        '<div class="task-list__header">' +
          '<h2 class="govuk-heading-s task-list__heading">Assess the application</h2>' +
        '</div>';

      this.taskGroups.forEach(function(group) {
        html += self.renderTaskGroup(group, currentSection);
      });

      html += '</nav>';
      return html;
    },

    /**
     * Render the complete sidebar
     */
    render: function() {
      return this.renderTaskList();
    },

    /**
     * Initialize - inject sidebar into placeholder
     */
    init: function() {
      var sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.innerHTML = this.render();
      }
    },

    /**
     * Re-render sidebar (useful after navigation)
     */
    refresh: function() {
      this.init();
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      AssessmentSidebar.init();
    });
  } else {
    AssessmentSidebar.init();
  }

  // Export for external use
  window.AssessmentSidebar = AssessmentSidebar;

})();

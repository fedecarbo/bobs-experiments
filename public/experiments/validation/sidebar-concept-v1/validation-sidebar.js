/**
 * Validation Sidebar Component
 * Renders the sidebar from a single source of truth
 */
(function() {
  'use strict';

  var ValidationSidebar = {
    // Task groups configuration - edit this to change sidebar structure
    taskGroups: [
      {
        name: 'Documents',
        tasks: [
          { id: 'process-documents', name: 'Process submitted documents', href: 'process-documents.html' },
          { id: 'check-documents', name: 'Check and request documents', href: 'check-documents.html' }
        ]
      },
      {
        name: 'Other',
        tasks: [
          { id: 'application-type', name: 'Application type', href: 'application-type.html' },
          { id: 'site-address', name: 'Site address', href: 'site-address.html' },
          { id: 'description', name: 'Description of proposal', href: 'description.html' },
          { id: 'site-constraints', name: 'Site constraints', href: 'site-constraints.html' },
          { id: 'applicant-agent', name: 'Applicant and agent', href: 'applicant-agent.html' },
          { id: 'fee', name: 'Fee', href: 'fee.html' },
          { id: 'validation-decision', name: 'Validation decision', href: 'validation-decision.html' }
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
     */
    renderStatusIcon: function() {
      return '<svg class="task-list__status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="11"/>' +
      '</svg>';
    },

    /**
     * Render a single task item
     */
    renderTaskItem: function(task, isCurrent) {
      var statusClass = 'task-list__item--not-started';
      var linkContent =
        '<span class="task-list__status" aria-hidden="true">' +
          this.renderStatusIcon() +
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
      return '<div class="sidebar-progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + total + '" aria-label="Validation progress">' +
        '<div class="sidebar-progress__label">' +
          '<span class="govuk-body-s govuk-!-margin-bottom-0">Validation progress</span>' +
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

      var html = '<nav class="task-list" aria-label="Validation tasks">' +
        '<div class="task-list__header">' +
          '<h2 class="govuk-heading-s task-list__heading">Validation tasks</h2>' +
          '<a href="#" class="govuk-link task-list__reset" id="reset-demo">Reset</a>' +
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
      return this.renderProgressBar() + this.renderTaskList();
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
      ValidationSidebar.init();
    });
  } else {
    ValidationSidebar.init();
  }

  // Export for external use
  window.ValidationSidebar = ValidationSidebar;

})();

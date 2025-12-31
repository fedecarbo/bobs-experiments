/**
 * Pre-application Report Sidebar Component
 * Renders the sidebar from a single source of truth
 *
 * Requires: status-icons.js to be loaded first
 */
(function() {
  'use strict';

  // Map status to base icons
  var statusToIcon = {
    'not-started': 'empty',
    'completed': 'complete'
  };

  var ReportSidebar = {
    // Task groups configuration - edit this to change sidebar structure
    taskGroups: [
      {
        name: 'Planning advice',
        tasks: [
          { id: 'affordable-housing-and-viability', name: 'Affordable housing and viability', href: 'affordable-housing-and-viability.html' },
          { id: 'design-and-conservation', name: 'Design and conservation', href: 'design-and-conservation.html' },
          { id: 'land-use', name: 'Land use', href: 'land-use.html' },
          { id: 'add-new-consideration', name: 'Add new consideration', href: 'add-new-consideration.html' }
        ]
      }
    ],

    /**
     * Get current page section ID from URL
     */
    getCurrentSection: function() {
      var filename = window.location.pathname.split('/').pop().replace('.html', '');
      if (filename === 'index' || filename === '') {
        return null;
      }
      return filename;
    },

    /**
     * Render the status icon SVG
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
        itemHtml += '<span class="task-list__link">' + linkContent + '</span>';
      } else {
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
     * Render the task list navigation
     */
    renderTaskList: function() {
      var self = this;
      var currentSection = this.getCurrentSection();

      var html = '<nav class="task-list" aria-label="Pre-application report tasks">' +
        '<div class="task-list__header">' +
          '<h2 class="govuk-heading-s task-list__heading">Pre-application report</h2>' +
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
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ReportSidebar.init();
    });
  } else {
    ReportSidebar.init();
  }

  // Export for external use
  window.ReportSidebar = ReportSidebar;

})();

/**
 * Content Loader for Validation Workflow
 * Handles SPA-like navigation while maintaining multi-page fallback
 */
(function() {
  'use strict';

  var ContentLoader = {
    // Configuration
    config: {
      mainContentSelector: '.main-content-wrapper',
      sidebarLinkSelector: '.task-list__link[href]',
      transitionDuration: 150
    },

    // State
    isLoading: false,
    cache: {},

    /**
     * Initialize the content loader
     */
    init: function() {
      // Check if browser supports required APIs
      if (!this.supportsFeatures()) {
        console.log('ContentLoader: Browser does not support required features, using fallback navigation');
        return;
      }

      this.bindSidebarLinks();
      this.bindMainContentLinks();
      this.bindPopState();
      this.storeInitialState();
    },

    /**
     * Check for required browser features
     */
    supportsFeatures: function() {
      return 'fetch' in window &&
             'DOMParser' in window &&
             'pushState' in history;
    },

    /**
     * Bind click handlers to sidebar links
     */
    bindSidebarLinks: function() {
      var self = this;
      document.querySelectorAll(this.config.sidebarLinkSelector).forEach(function(link) {
        link.addEventListener('click', function(e) {
          self.handleLinkClick(e);
        });
      });
    },

    /**
     * Bind click handlers to links within main content (using delegation)
     */
    bindMainContentLinks: function() {
      var self = this;
      var mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.addEventListener('click', function(e) {
          var link = e.target.closest('a[href$=".html"]');
          if (link && self.isInternalLink(link)) {
            self.handleLinkClick(e);
          }
        });
      }
    },

    /**
     * Check if link is internal to this experiment
     */
    isInternalLink: function(link) {
      var href = link.getAttribute('href');
      // Only handle relative .html links within same directory
      return href &&
             href.endsWith('.html') &&
             !href.startsWith('http') &&
             !href.startsWith('/');
    },

    /**
     * Handle intercepted link click
     */
    handleLinkClick: function(e) {
      var link = e.target.closest('a[href]');
      if (!link || this.isLoading) return;

      var href = link.getAttribute('href');
      if (!href || !href.endsWith('.html')) return;

      // Don't intercept if it's an external link
      if (!this.isInternalLink(link)) return;

      e.preventDefault();
      this.navigateTo(href, true);
    },

    /**
     * Navigate to a new page
     */
    navigateTo: function(url, pushState) {
      var self = this;
      if (this.isLoading) return;

      this.isLoading = true;
      var mainContent = document.getElementById('main-content');
      var wrapper = mainContent.querySelector(this.config.mainContentSelector);

      // Fade out current content
      wrapper.style.opacity = '0';
      wrapper.style.transition = 'opacity ' + this.config.transitionDuration + 'ms ease';

      setTimeout(function() {
        self.fetchContent(url).then(function(newContent) {
          if (newContent) {
            // Replace content
            wrapper.innerHTML = newContent.innerHTML;

            // Update URL
            if (pushState) {
              history.pushState({ url: url }, '', url);
            }

            // Update page title
            self.updatePageTitle(url);

            // Update sidebar highlighting
            self.updateSidebarCurrent(url);

            // Reinitialize components
            self.reinitializeComponents();

            // Fade in new content
            wrapper.style.opacity = '1';

            // Scroll main content to top
            mainContent.scrollTop = 0;

            // Focus management for accessibility
            mainContent.focus();
          }
          self.isLoading = false;
        }).catch(function(error) {
          console.error('ContentLoader: Navigation failed', error);
          // Fallback to regular navigation
          window.location.href = url;
        });
      }, this.config.transitionDuration);
    },

    /**
     * Fetch and parse content from URL
     */
    fetchContent: function(url) {
      var self = this;

      // Check cache first
      if (this.cache[url]) {
        return Promise.resolve(this.cache[url].cloneNode(true));
      }

      return fetch(url)
        .then(function(response) {
          if (!response.ok) {
            throw new Error('HTTP ' + response.status);
          }
          return response.text();
        })
        .then(function(html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var content = doc.querySelector(self.config.mainContentSelector);

          if (content) {
            // Cache the content
            self.cache[url] = content.cloneNode(true);
          }

          return content;
        });
    },

    /**
     * Store initial state for back button support
     */
    storeInitialState: function() {
      var currentPage = window.location.pathname.split('/').pop() || 'index.html';
      history.replaceState({ url: currentPage }, '', currentPage);
    },

    /**
     * Handle browser back/forward navigation
     */
    bindPopState: function() {
      var self = this;
      window.addEventListener('popstate', function(e) {
        var url = e.state ? e.state.url : null;
        if (url) {
          self.navigateTo(url, false);
        }
      });
    },

    /**
     * Update sidebar to show current page
     */
    updateSidebarCurrent: function(url) {
      // Re-render the sidebar with the new current page
      // The ValidationSidebar component handles current page detection automatically
      if (window.ValidationSidebar) {
        window.ValidationSidebar.refresh();
        // Rebind click handlers to new sidebar links
        this.bindSidebarLinks();
      }
    },

    /**
     * Update the page title based on URL
     */
    updatePageTitle: function(url) {
      var filename = url.split('/').pop().replace('.html', '');
      var titleMap = {
        'index': 'Validation Sidebar Concept v1',
        'process-documents': 'Process submitted documents - Validation',
        'check-documents': 'Check and request documents - Validation',
        'application-type': 'Application type - Validation',
        'site-address': 'Site address - Validation',
        'description': 'Description of proposal - Validation',
        'site-constraints': 'Site constraints - Validation',
        'documents': 'Documents - Validation',
        'applicant-agent': 'Applicant and agent - Validation',
        'fee': 'Fee - Validation',
        'validation-decision': 'Validation decision - Validation'
      };

      var title = titleMap[filename] || 'Validation';
      document.title = title + ' - BOPS Experiments';
    },

    /**
     * Reinitialize GOV.UK Frontend and custom components
     */
    reinitializeComponents: function() {
      var mainContent = document.getElementById('main-content');

      // Reinitialize GOV.UK Frontend components in new content
      if (window.GOVUKFrontend) {
        // Initialize specific components that might be in the new content
        var components = ['Radios', 'Checkboxes', 'Button', 'CharacterCount', 'ErrorSummary'];

        components.forEach(function(componentName) {
          var moduleName = 'govuk-' + componentName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase();
          // Fix the module name format
          moduleName = 'govuk-' + componentName.replace(/([A-Z])/g, function(match) {
            return '-' + match.toLowerCase();
          }).replace(/^-/, '').toLowerCase();

          var elements = mainContent.querySelectorAll('[data-module="' + moduleName + '"]');
          elements.forEach(function(element) {
            if (window.GOVUKFrontend[componentName]) {
              try {
                new window.GOVUKFrontend[componentName](element);
              } catch (e) {
                // Component may already be initialized
              }
            }
          });
        });
      }

      // Reinitialize validation controls
      if (window.ValidationUtils && window.ValidationUtils.reinit) {
        window.ValidationUtils.reinit();
      }
    },

    /**
     * Clear the content cache (useful after state changes)
     */
    clearCache: function() {
      this.cache = {};
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ContentLoader.init();
    });
  } else {
    ContentLoader.init();
  }

  // Export for external use
  window.ContentLoader = ContentLoader;

})();

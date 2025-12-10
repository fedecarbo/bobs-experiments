/**
 * Review Controls JS
 * Button toggle states, comments, save/undo, status updates
 */

(function() {
  'use strict';

  /**
   * Save review status to Supabase
   * Routes to admin or guest table based on mode
   * @param {Element} control - The review control element
   * @param {string} status - 'agreed' or 'returned'
   * @param {string} comments - Optional comments
   */
  async function saveToDatabase(control, status, comments) {
    if (!window.SupabaseClient || !window.ReviewRenderer) return;

    var reportId = window.ReviewRenderer.getReportId();
    if (!reportId) {
      console.warn('No report ID available for saving');
      return;
    }

    var sectionKey = control.dataset.section;
    var mode = window.ReviewRenderer.getMode();
    var user = window.ReviewRenderer.getUser();
    var success;

    if (mode === 'guest' && user) {
      // Save to guest review_sessions table
      success = await window.SupabaseClient.updateGuestReview(
        reportId,
        user,
        sectionKey,
        status,
        comments || null
      );
    } else {
      // Admin mode - save to main report_sections table
      success = await window.SupabaseClient.updateSectionReview(
        reportId,
        sectionKey,
        status,
        comments || null
      );
    }

    if (success) {
      console.log('Saved review for section:', sectionKey, status, '(mode:', mode, ')');
    }
  }

  /**
   * Reset review status in Supabase
   * Routes to admin or guest table based on mode
   * @param {Element} control - The review control element
   */
  async function resetInDatabase(control) {
    if (!window.SupabaseClient || !window.ReviewRenderer) return;

    var reportId = window.ReviewRenderer.getReportId();
    if (!reportId) return;

    var sectionKey = control.dataset.section;
    var mode = window.ReviewRenderer.getMode();
    var user = window.ReviewRenderer.getUser();
    var success;

    if (mode === 'guest' && user) {
      // Delete from guest review_sessions table
      success = await window.SupabaseClient.resetGuestReview(reportId, user, sectionKey);
    } else {
      // Admin mode - reset in main report_sections table
      success = await window.SupabaseClient.resetSectionReview(reportId, sectionKey);
    }

    if (success) {
      console.log('Reset review for section:', sectionKey, '(mode:', mode, ')');
    }
  }

  function initReviewControls() {
    var reviewControls = document.querySelectorAll('.app-review-controls');
    var totalSections = reviewControls.length;

    /**
     * Count reviewed sections and update progress
     */
    function updateProgress() {
      var reviewedCount = document.querySelectorAll('.app-review-controls[data-status]').length;
      if (window.SidebarUtils) {
        window.SidebarUtils.updateProgressBar(reviewedCount, totalSections);
      }
    }

    /**
     * Get section tag element
     * @param {string} sectionName - The section identifier
     * @returns {Element|null}
     */
    function getSectionTag(sectionName) {
      return document.querySelector('[data-section-tag="' + sectionName + '"]');
    }

    /**
     * Update status for a section (both tag and sidebar)
     * @param {Element} control - The review control element
     * @param {string} action - 'agree' or 'return'
     */
    function updateStatus(control, action) {
      var section = control.dataset.section;
      var statusEl = getSectionTag(section);

      if (action === 'agree') {
        control.dataset.status = 'agreed';
        // Update section tag
        if (statusEl) {
          statusEl.className = 'govuk-tag govuk-tag--green app-review-tag';
          statusEl.textContent = 'Agreed';
        }
        // Update sidebar
        if (window.SidebarUtils) {
          window.SidebarUtils.updateSidebarStatus(section, 'agreed');
        }
      } else if (action === 'return') {
        control.dataset.status = 'returned';
        // Update section tag
        if (statusEl) {
          statusEl.className = 'govuk-tag govuk-tag--orange app-review-tag';
          statusEl.textContent = 'Returned for comments';
        }
        // Update sidebar
        if (window.SidebarUtils) {
          window.SidebarUtils.updateSidebarStatus(section, 'returned');
        }
      }
    }

    /**
     * Reset status for a section
     * @param {Element} control - The review control element
     */
    function resetStatus(control) {
      var section = control.dataset.section;
      var statusEl = getSectionTag(section);

      control.removeAttribute('data-status');
      // Reset section tag
      if (statusEl) {
        statusEl.className = 'govuk-tag govuk-tag--grey app-review-tag';
        statusEl.textContent = 'Not reviewed';
      }
      // Reset sidebar
      if (window.SidebarUtils) {
        window.SidebarUtils.updateSidebarStatus(section, 'not-reviewed');
      }
    }

    // Set up button click handlers for each control
    reviewControls.forEach(function(control) {
      var buttons = control.querySelectorAll('.app-review-button');
      var commentsSection = control.querySelector('.app-review-comments');

      buttons.forEach(function(button) {
        button.addEventListener('click', function() {
          var action = this.dataset.action;

          // Handle edit action separately (it's a link, not a toggle)
          if (action === 'edit') {
            return;
          }

          // Reset all buttons in this group
          buttons.forEach(function(btn) {
            if (btn.dataset.action !== 'edit') {
              btn.setAttribute('aria-pressed', 'false');
            }
          });

          // Toggle current button
          var wasPressed = this.getAttribute('aria-pressed') === 'true';
          if (!wasPressed) {
            this.setAttribute('aria-pressed', 'true');
          }

          // Show/hide comments
          if (action === 'return' && !wasPressed) {
            commentsSection.removeAttribute('hidden');
          } else {
            commentsSection.setAttribute('hidden', '');
          }

          // Update status (only for agree; return status is set on save comment)
          if (!wasPressed && action === 'agree') {
            updateStatus(control, action);
            updateProgress();
            saveToDatabase(control, 'agreed');
          } else if (wasPressed) {
            // If unpressing, reset to not reviewed
            resetStatus(control);
            updateProgress();
            resetInDatabase(control);
          }
        });
      });
    });

    // Save comment buttons
    document.querySelectorAll('.app-save-comment').forEach(function(button) {
      button.addEventListener('click', function() {
        var control = this.closest('.app-review-controls');
        var commentsSection = control.querySelector('.app-review-comments');
        var textarea = commentsSection.querySelector('.govuk-textarea');
        var savedState = this.parentElement.querySelector('.app-review-comments__saved-state');
        var comments = textarea.value;

        // Update status to "Returned for comments"
        updateStatus(control, 'return');
        updateProgress();

        // Save to database
        saveToDatabase(control, 'returned', comments);

        // Disable textarea and show saved state
        textarea.setAttribute('readonly', '');
        commentsSection.classList.add('app-review-comments--saved');
        savedState.classList.add('visible');
      });
    });

    // Undo comment buttons
    document.querySelectorAll('.app-undo-comment').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var control = this.closest('.app-review-controls');
        var commentsSection = control.querySelector('.app-review-comments');
        var textarea = commentsSection.querySelector('.govuk-textarea');
        var savedState = this.closest('.app-review-comments__saved-state');

        // Re-enable textarea and hide saved state
        textarea.removeAttribute('readonly');
        commentsSection.classList.remove('app-review-comments--saved');
        savedState.classList.remove('visible');

        // Reset status to not reviewed
        resetStatus(control);
        updateProgress();

        // Reset in database
        resetInDatabase(control);
      });
    });

    // Submit review button
    var submitButton = document.getElementById('submit-review');
    if (submitButton) {
      submitButton.addEventListener('click', function() {
        alert('Review submitted successfully!');
      });
    }

    // Handle Edit links - add reportId dynamically on click
    // (reportId isn't available until after async data load)
    document.querySelectorAll('.app-review-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (!href) return;

        // Get current query params and add reportId
        var queryString = window.location.search;
        var params = new URLSearchParams(queryString);

        // Get reportId from ReviewRenderer (available after data loads)
        var reportId = window.ReviewRenderer ? window.ReviewRenderer.getReportId() : null;
        if (reportId) {
          params.set('reportId', reportId);
        }

        var newQueryString = params.toString();
        var newHref = href + (newQueryString ? '?' + newQueryString : '');

        // Navigate to the new URL
        e.preventDefault();
        window.location.href = newHref;
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReviewControls);
  } else {
    initReviewControls();
  }
})();

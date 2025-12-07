/**
 * Review Page Renderer
 * Populates the page with data from Supabase
 */

(function() {
  'use strict';

  // Current application data (stored for reference)
  var currentData = null;
  var currentReport = null;
  var currentMode = 'admin'; // 'admin' or 'guest'
  var currentUser = null; // Guest reviewer name

  /**
   * Get report ID from current data
   */
  function getReportId() {
    if (currentReport) {
      return currentReport.id;
    }
    return null;
  }

  /**
   * Get current data
   */
  function getCurrentData() {
    return currentData;
  }

  /**
   * Get current mode
   */
  function getMode() {
    return currentMode;
  }

  /**
   * Get current user (for guest mode)
   */
  function getUser() {
    return currentUser;
  }

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  /**
   * Render the case summary header
   */
  function renderCaseSummary(data) {
    var refEl = document.querySelector('.case-summary__reference');
    var addressEl = document.querySelector('.case-summary__address');
    var descriptionEl = document.querySelector('#proposal-description p');

    if (refEl) refEl.textContent = data.reference;
    if (addressEl) addressEl.textContent = data.address;
    if (descriptionEl) descriptionEl.textContent = data.proposal_description;

    // Also update the details list at top of main content
    var detailsAddress = document.querySelector('.app-details-list .govuk-body-s:first-child strong');
    var detailsRef = document.querySelector('.app-details-list .govuk-body-s:nth-child(2) strong');
    if (detailsAddress) detailsAddress.textContent = data.address;
    if (detailsRef) detailsRef.textContent = data.reference;
  }

  /**
   * Render officer contact details
   */
  function renderOfficerDetails(report) {
    var officer = report.case_officers;
    if (!officer) return;

    // Find the officer contact details section
    var section = document.querySelector('#officer-contact-details');
    if (!section) return;

    var summaryList = section.nextElementSibling;
    while (summaryList && !summaryList.classList.contains('govuk-summary-list')) {
      summaryList = summaryList.nextElementSibling;
    }
    if (!summaryList) return;

    var rows = summaryList.querySelectorAll('.govuk-summary-list__row');
    if (rows[0]) {
      var nameCell = rows[0].querySelector('.govuk-summary-list__value');
      if (nameCell) nameCell.textContent = officer.name;
    }
    if (rows[1]) {
      var emailCell = rows[1].querySelector('.govuk-summary-list__value a');
      if (emailCell) {
        emailCell.textContent = officer.email;
        emailCell.href = 'mailto:' + officer.email;
      }
    }

    // Update details list
    var detailsOfficer = document.querySelector('.app-details-list .govuk-body-s:nth-child(3) strong');
    if (detailsOfficer) detailsOfficer.textContent = officer.name;
  }

  /**
   * Render the outcome banner
   */
  function renderOutcome(report) {
    var banner = document.querySelector('.govuk-notification-banner--success');
    if (!banner) return;

    var headingEl = banner.querySelector('.govuk-notification-banner__heading');
    var descEl = banner.querySelector('.govuk-notification-banner__content .govuk-body');

    if (headingEl) {
      var outcomeText = {
        'likely_supported': 'Likely to be supported',
        'needs_changes': 'Likely to be supported with changes',
        'likely_refused': 'Unlikely to be supported'
      };
      headingEl.textContent = outcomeText[report.outcome] || report.outcome;
    }

    if (descEl) descEl.textContent = report.outcome_description;
  }

  /**
   * Render proposal description (with officer's suggested version)
   */
  function renderProposalDescription(data, report) {
    var section = document.querySelector('#description-of-your-proposal');
    if (!section) return;

    // Find the paragraph after the section header
    var sectionHeader = section.nextElementSibling;
    while (sectionHeader && !sectionHeader.classList.contains('app-section-header')) {
      sectionHeader = sectionHeader.nextElementSibling;
    }

    var descPara = sectionHeader ? sectionHeader.nextElementSibling : null;
    if (descPara && descPara.classList.contains('govuk-body')) {
      // Use officer's suggested description if available, otherwise applicant's
      descPara.textContent = report.suggested_description || data.proposal_description;
    }

    // Show/hide the "officer updated" inset text
    var insetText = document.querySelector('#description-of-your-proposal ~ .app-section-header ~ .govuk-inset-text');
    if (insetText) {
      insetText.style.display = report.suggested_description ? 'block' : 'none';
    }
  }

  /**
   * Render application events table
   */
  function renderApplicationEvents(events) {
    if (!events || events.length === 0) return;

    var section = document.querySelector('#your-pre-application-details');
    if (!section) return;

    var table = document.querySelector('#your-pre-application-details ~ .app-section-header ~ table');
    if (!table) return;

    var tbody = table.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = events.map(function(e) {
      return '<tr class="govuk-table__row">' +
        '<td class="govuk-table__cell">' + escapeHtml(e.event_name) + '</td>' +
        '<td class="govuk-table__cell">' + (e.event_date ? formatDate(e.event_date) : '-') + '</td>' +
        '</tr>';
    }).join('');
  }

  /**
   * Render site constraints table
   */
  function renderSiteConstraints(constraints) {
    if (!constraints || constraints.length === 0) return;

    var section = document.querySelector('#site-constraints');
    if (!section) return;

    var table = document.querySelector('#site-constraints ~ .app-section-header ~ table');
    if (!table) return;

    var tbody = table.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = constraints.map(function(c) {
      return '<tr class="govuk-table__row">' +
        '<td class="govuk-table__cell">' + escapeHtml(c.category) + '</td>' +
        '<td class="govuk-table__cell">' + escapeHtml(c.constraint_name) + '</td>' +
        '</tr>';
    }).join('');
  }

  /**
   * Render site history cards
   */
  function renderSiteHistory(history) {
    console.log('renderSiteHistory called with:', history ? history.length : 0, 'items');
    if (!history || history.length === 0) return;

    // Add cards to the dedicated container
    var cardsContainer = document.getElementById('site-history-cards');
    console.log('site-history-cards container:', cardsContainer);
    if (!cardsContainer) return;

    cardsContainer.innerHTML = '';

    history.forEach(function(h) {
      var decisionClass = h.decision === 'permitted' ? 'govuk-tag--green' : 'govuk-tag--red';
      var decisionText = h.decision === 'permitted' ? 'Permitted' : 'Refused';

      var card = document.createElement('div');
      card.className = 'govuk-summary-card';
      card.innerHTML =
        '<div class="govuk-summary-card__title-wrapper">' +
          '<h3 class="govuk-summary-card__title">' + escapeHtml(h.historic_reference) + '</h3>' +
        '</div>' +
        '<div class="govuk-summary-card__content">' +
          '<dl class="govuk-summary-list">' +
            '<div class="govuk-summary-list__row">' +
              '<dt class="govuk-summary-list__key">Decision</dt>' +
              '<dd class="govuk-summary-list__value"><strong class="govuk-tag ' + decisionClass + '">' + decisionText + '</strong></dd>' +
            '</div>' +
            '<div class="govuk-summary-list__row">' +
              '<dt class="govuk-summary-list__key">Decision date</dt>' +
              '<dd class="govuk-summary-list__value">' + formatDate(h.decision_date) + '</dd>' +
            '</div>' +
            '<div class="govuk-summary-list__row">' +
              '<dt class="govuk-summary-list__key">Description</dt>' +
              '<dd class="govuk-summary-list__value">' + escapeHtml(h.description) + '</dd>' +
            '</div>' +
          '</dl>' +
        '</div>';

      cardsContainer.appendChild(card);
      console.log('Site history card added for:', h.historic_reference);
    });
    console.log('renderSiteHistory complete, cards in container:', cardsContainer.children.length);
  }

  /**
   * Render site and surroundings description
   */
  function renderSiteDescription(report) {
    if (!report.site_description) return;

    var reviewControls = document.querySelector('.app-review-controls[data-section="site-and-surroundings"]');
    if (!reviewControls) return;

    var parent = reviewControls.parentNode;

    // Remove existing paragraphs for this section
    var toRemove = [];
    var sibling = document.querySelector('#site-and-surroundings');
    if (sibling) sibling = sibling.nextElementSibling; // skip to section header
    if (sibling) sibling = sibling.nextElementSibling; // skip section header

    while (sibling && sibling !== reviewControls) {
      if (sibling.tagName === 'P' && sibling.classList.contains('govuk-body')) {
        toRemove.push(sibling);
      }
      sibling = sibling.nextElementSibling;
    }
    toRemove.forEach(function(el) { el.remove(); });

    // Split into paragraphs and add
    var paragraphs = report.site_description.split('\n\n');
    paragraphs.forEach(function(text, i) {
      var p = document.createElement('p');
      p.className = 'govuk-body' + (i === 0 ? ' app-section-content' : '');
      p.textContent = text;
      parent.insertBefore(p, reviewControls);
    });
  }

  /**
   * Render planning considerations
   */
  function renderPlanningConsiderations(considerations) {
    console.log('renderPlanningConsiderations called with:', considerations ? considerations.length : 0, 'items');
    if (!considerations || considerations.length === 0) return;

    // Sort by display order
    considerations.sort(function(a, b) {
      return (a.display_order || 0) - (b.display_order || 0);
    });

    // Update summary table
    var tableBody = document.querySelector('#planning-considerations-and-advice ~ .app-section-header ~ .app-section-content table tbody');
    console.log('Planning considerations table body:', tableBody);
    if (tableBody) {
      tableBody.innerHTML = considerations.map(function(c) {
        var statusTag = getStatusTag(c.status);
        return '<tr class="govuk-table__row">' +
          '<td class="govuk-table__cell">' + escapeHtml(c.category) + '</td>' +
          '<td class="govuk-table__cell">' + escapeHtml(c.element) + '</td>' +
          '<td class="govuk-table__cell">' + statusTag + '</td>' +
          '</tr>';
      }).join('');
    }

    // Add cards to the dedicated container
    var cardsContainer = document.getElementById('planning-considerations-cards');
    console.log('planning-considerations-cards container:', cardsContainer);
    if (!cardsContainer) return;

    cardsContainer.innerHTML = '';
    console.log('About to create', considerations.length, 'cards');
    console.log('Container reference (before loop):', cardsContainer);
    console.log('Container ID:', cardsContainer.id);
    console.log('Container parent:', cardsContainer.parentElement);

    considerations.forEach(function(c) {
      var statusClass = '';
      var statusText = c.status;
      if (c.status === 'supported') {
        statusClass = 'govuk-tag--green';
        statusText = 'Supported';
      } else if (c.status === 'needs_changes') {
        statusClass = 'govuk-tag--yellow';
        statusText = 'Needs changes';
      } else if (c.status === 'does_not_comply') {
        statusClass = 'govuk-tag--red';
        statusText = 'Does not comply';
      }

      // Build images HTML if image_urls exist
      var imagesHtml = '';
      if (c.image_urls && c.image_urls.length > 0) {
        imagesHtml = '<div class="app-consideration-images">' +
          c.image_urls.map(function(url) {
            return '<a href="' + escapeHtml(url) + '" class="app-consideration-image" target="_blank">' +
              '<img src="' + escapeHtml(url) + '" alt="Supporting image" loading="lazy">' +
            '</a>';
          }).join('') +
        '</div>';
      }

      var card = document.createElement('div');
      card.className = 'govuk-summary-card';
      card.innerHTML =
        '<div class="govuk-summary-card__title-wrapper">' +
          '<h4 class="govuk-summary-card__title">' + escapeHtml(c.category) + ': ' + escapeHtml(c.element) + '</h4>' +
          '<div class="govuk-summary-card__actions">' +
            '<strong class="govuk-tag ' + statusClass + '">' + statusText + '</strong>' +
          '</div>' +
        '</div>' +
        '<div class="govuk-summary-card__content">' +
          '<p class="govuk-body"><strong>Relevant policies:</strong> ' + escapeHtml(c.relevant_policies || '') + '</p>' +
          '<p class="govuk-body">' + escapeHtml(c.assessment || '') + '</p>' +
          imagesHtml +
        '</div>';

      cardsContainer.appendChild(card);
      console.log('Card added for:', c.category, '-', c.element);
    });
    console.log('renderPlanningConsiderations complete, cards in container:', cardsContainer.children.length);
    console.log('Same container check:', cardsContainer === document.getElementById('planning-considerations-cards'));
    console.log('Fresh getElementById children:', document.getElementById('planning-considerations-cards').children.length);
  }

  /**
   * Render summary of advice
   */
  function renderSummaryOfAdvice(report) {
    if (!report.summary_of_advice) return;

    var reviewControls = document.querySelector('.app-review-controls[data-section="summary-of-advice"]');
    if (!reviewControls) return;

    // Find the main paragraph (after the intro paragraph)
    var paragraphs = [];
    var sibling = document.querySelector('#summary-of-advice');
    if (sibling) sibling = sibling.nextElementSibling;
    while (sibling && sibling !== reviewControls) {
      if (sibling.tagName === 'P' && sibling.classList.contains('govuk-body')) {
        paragraphs.push(sibling);
      }
      sibling = sibling.nextElementSibling;
    }

    // Update the second paragraph (the actual summary, not the intro)
    if (paragraphs.length >= 2) {
      paragraphs[1].textContent = report.summary_of_advice;
    }
  }

  /**
   * Render relevant policies list
   */
  function renderPolicies(policies) {
    if (!policies || policies.length === 0) return;

    var list = document.querySelector('#relevant-policies-and-guidance ~ .app-section-header ~ p ~ ul');
    if (!list) return;

    list.innerHTML = policies.map(function(p) {
      return '<li><a href="' + escapeHtml(p.url || '#') + '" class="govuk-link">' +
        escapeHtml(p.policy_code) + ': ' + escapeHtml(p.policy_name) + '</a></li>';
    }).join('');
  }

  /**
   * Render requirements section
   */
  function renderRequirements(requirements) {
    if (!requirements || requirements.length === 0) return;

    // Group by category
    var grouped = {};
    requirements.forEach(function(r) {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r);
    });

    var reviewControls = document.querySelector('.app-review-controls[data-section="requirements"]');
    if (!reviewControls) return;

    // Remove only the requirement cards (those immediately before the review controls)
    // Walk backwards from reviewControls and remove summary cards until we hit a non-card element
    var sibling = reviewControls.previousElementSibling;
    while (sibling && sibling.classList.contains('govuk-summary-card')) {
      var toRemove = sibling;
      sibling = sibling.previousElementSibling;
      toRemove.remove();
    }

    // Add cards for each category
    Object.keys(grouped).forEach(function(category) {
      var card = document.createElement('div');
      card.className = 'govuk-summary-card';

      var rows = grouped[category].map(function(r) {
        var guidanceHtml = '';
        if (r.guidance_points && r.guidance_points.length > 0) {
          guidanceHtml = '<p class="govuk-body govuk-!-margin-bottom-0">Make sure you:</p>' +
            '<ul class="govuk-list govuk-list--bullet">' +
            r.guidance_points.map(function(point) {
              return '<li>' + escapeHtml(point) + '</li>';
            }).join('') +
            '</ul>';
        }

        return '<div class="govuk-summary-list__row">' +
          '<dt class="govuk-summary-list__key">' + escapeHtml(r.requirement_name) + '</dt>' +
          '<dd class="govuk-summary-list__value">' +
            '<p class="govuk-body">' + escapeHtml(r.description || '') + '</p>' +
            guidanceHtml +
          '</dd>' +
        '</div>';
      }).join('');

      card.innerHTML =
        '<div class="govuk-summary-card__title-wrapper">' +
          '<h3 class="govuk-summary-card__title">' + escapeHtml(category) + '</h3>' +
        '</div>' +
        '<div class="govuk-summary-card__content">' +
          '<dl class="govuk-summary-list">' + rows + '</dl>' +
        '</div>';

      reviewControls.parentNode.insertBefore(card, reviewControls);
    });
  }

  /**
   * Restore section review states from database
   * @param {Array} sections - Array of section objects with review status
   * @param {number} totalSections - Total number of sections (for progress bar)
   */
  function restoreReviewStates(sections, totalSections) {
    var reviewedCount = 0;

    sections.forEach(function(section) {
      var control = document.querySelector('.app-review-controls[data-section="' + section.section_key + '"]');
      if (!control) return;

      if (section.review_status === 'not_reviewed') return;

      reviewedCount++;

      // Set the data-status attribute
      control.dataset.status = section.review_status;

      // Update button states
      var action = section.review_status === 'agreed' ? 'agree' : 'return';
      var button = control.querySelector('[data-action="' + action + '"]');
      if (button) {
        button.setAttribute('aria-pressed', 'true');
      }

      // Update section tag
      var tag = document.querySelector('[data-section-tag="' + section.section_key + '"]');
      if (tag) {
        if (section.review_status === 'agreed') {
          tag.className = 'govuk-tag govuk-tag--green app-review-tag';
          tag.textContent = 'Agreed';
        } else if (section.review_status === 'returned') {
          tag.className = 'govuk-tag govuk-tag--orange app-review-tag';
          tag.textContent = 'Returned for comments';
        }
      }

      // Update sidebar
      if (window.SidebarUtils) {
        var sidebarStatus = section.review_status === 'agreed' ? 'agreed' : 'returned';
        window.SidebarUtils.updateSidebarStatus(section.section_key, sidebarStatus);
      }

      // Show comments if returned
      if (section.review_status === 'returned') {
        var commentsSection = control.querySelector('.app-review-comments');
        var textarea = control.querySelector('.govuk-textarea');
        if (commentsSection) {
          commentsSection.removeAttribute('hidden');
          if (textarea && section.review_comments) {
            textarea.value = section.review_comments;
            textarea.setAttribute('readonly', '');
          }
          commentsSection.classList.add('app-review-comments--saved');
          var savedState = commentsSection.querySelector('.app-review-comments__saved-state');
          if (savedState) savedState.classList.add('visible');
        }
      }
    });

    // Update progress bar using the passed total (handles guest mode where sections array only has reviewed items)
    if (window.SidebarUtils) {
      var total = totalSections || sections.length;
      window.SidebarUtils.updateProgressBar(reviewedCount, total);
    }
  }

  // ============================================
  // MAIN RENDER FUNCTION
  // ============================================

  /**
   * Main render function - loads and renders all data
   * @param {string} reference - Application reference
   * @param {string} mode - 'admin' or 'guest'
   * @param {string} user - Guest reviewer name (only for guest mode)
   */
  async function renderPage(reference, mode, user) {
    // Store mode and user
    currentMode = mode || 'admin';
    currentUser = user || null;

    console.log('Render mode:', currentMode, 'User:', currentUser);

    // Show loading state
    document.body.classList.add('loading');

    try {
      // Load data from Supabase
      var data = await window.SupabaseClient.loadApplication(reference);
      if (!data) {
        console.error('Application not found:', reference);
        alert('Application not found: ' + reference);
        return;
      }

      if (!data.reports || data.reports.length === 0) {
        console.error('No report found for application:', reference);
        alert('No report found for application: ' + reference);
        return;
      }

      currentData = data;
      currentReport = data.reports[0];

      // Render all sections
      renderCaseSummary(data);
      renderOfficerDetails(currentReport);
      renderOutcome(currentReport);
      renderApplicationEvents(data.application_events);
      renderProposalDescription(data, currentReport);
      renderSiteConstraints(data.site_constraints);
      renderSiteHistory(data.site_history);
      renderSiteDescription(currentReport);
      renderPlanningConsiderations(currentReport.planning_considerations);
      renderSummaryOfAdvice(currentReport);
      renderPolicies(currentReport.relevant_policies);
      renderRequirements(currentReport.requirements);

      // Restore review states based on mode
      var totalSections = currentReport.report_sections ? currentReport.report_sections.length : 0;

      if (currentMode === 'guest' && currentUser) {
        // Load guest-specific review states
        var guestReviews = await window.SupabaseClient.loadGuestReviews(currentReport.id, currentUser);
        if (guestReviews && guestReviews.length > 0) {
          restoreReviewStates(guestReviews, totalSections);
        } else {
          // No reviews yet, show all as not reviewed
          if (window.SidebarUtils) {
            window.SidebarUtils.updateProgressBar(0, totalSections);
          }
        }
      } else {
        // Admin mode - use main report_sections
        if (currentReport.report_sections) {
          restoreReviewStates(currentReport.report_sections, totalSections);
        }
      }

      console.log('Page rendered successfully for:', reference);

    } catch (err) {
      console.error('Error rendering page:', err);
      alert('Error loading data: ' + err.message);
    } finally {
      document.body.classList.remove('loading');
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(dateString) {
    if (!dateString) return '-';
    var date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function getStatusTag(status) {
    var tags = {
      'supported': '<strong class="govuk-tag govuk-tag--green">Supported</strong>',
      'needs_changes': '<strong class="govuk-tag govuk-tag--yellow">Needs changes</strong>',
      'does_not_comply': '<strong class="govuk-tag govuk-tag--red">Does not comply</strong>'
    };
    return tags[status] || status;
  }

  // ============================================
  // EXPORT
  // ============================================

  window.ReviewRenderer = {
    renderPage: renderPage,
    getReportId: getReportId,
    getCurrentData: getCurrentData,
    getMode: getMode,
    getUser: getUser
  };

})();

/**
 * Snippet Drawer Component JavaScript
 * Right-side sliding drawer for displaying and inserting assessment snippets
 * from similar applications
 */

(function() {
  'use strict';

  // ============================================
  // STATE
  // ============================================

  var state = {
    isOpen: false,
    snippets: [],
    filteredSnippets: [],
    searchQuery: '',
    activeTab: 'nearby', // 'nearby', 'similar', 'all'
    considerationFilter: '',
    distanceFilter: '',
    targetTextarea: null,
    triggerElement: null,
    focusableElements: [],
    firstFocusable: null,
    lastFocusable: null,
    currentPageConsideration: '' // Auto-detected from page
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================

  var elements = {
    drawer: null,
    backdrop: null,
    closeButton: null,
    content: null,
    searchInput: null,
    tabButtons: null,
    considerationSelect: null,
    distanceSelect: null,
    resultsCount: null
  };

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Get DOM elements
    elements.drawer = document.getElementById('snippet-drawer');
    elements.backdrop = document.getElementById('snippet-drawer-backdrop');
    elements.closeButton = document.getElementById('snippet-drawer-close');
    elements.content = document.getElementById('snippet-drawer-content');
    elements.searchInput = document.getElementById('snippet-search-input');
    elements.tabButtons = document.querySelectorAll('#snippet-drawer .drawer__tab');
    elements.considerationSelect = document.getElementById('filter-consideration');
    elements.distanceSelect = document.getElementById('filter-distance');
    elements.resultsCount = document.getElementById('snippet-results-count');

    if (!elements.drawer || !elements.backdrop) {
      // Drawer elements not found - likely not on this page
      return;
    }

    // Detect current page consideration type
    detectPageConsideration();

    // Load mock data
    if (window.MOCK_SNIPPETS) {
      state.snippets = window.MOCK_SNIPPETS;
    }

    // Set up event listeners
    setupEventListeners();
  }

  function detectPageConsideration() {
    // Detect consideration type from URL or page content
    var path = window.location.pathname;

    if (path.includes('affordable-housing')) {
      state.currentPageConsideration = 'affordable-housing-and-viability';
    } else if (path.includes('design-and-conservation')) {
      state.currentPageConsideration = 'design-and-conservation';
    } else if (path.includes('land-use')) {
      state.currentPageConsideration = 'land-use';
    }
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  function setupEventListeners() {
    // Open buttons (there may be multiple on a page)
    var openButtons = document.querySelectorAll('[data-open-snippet-drawer]');
    openButtons.forEach(function(button) {
      button.addEventListener('click', handleOpenClick);
    });

    // Close button
    if (elements.closeButton) {
      elements.closeButton.addEventListener('click', handleCloseClick);
    }

    // Backdrop click
    if (elements.backdrop) {
      elements.backdrop.addEventListener('click', handleBackdropClick);
    }

    // Search input
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', debounce(handleSearchInput, 200));
    }

    // Tab buttons
    if (elements.tabButtons) {
      elements.tabButtons.forEach(function(button) {
        button.addEventListener('click', handleTabClick);
      });
    }

    // Filter selects
    if (elements.considerationSelect) {
      elements.considerationSelect.addEventListener('change', handleFilterChange);
    }
    if (elements.distanceSelect) {
      elements.distanceSelect.addEventListener('change', handleFilterChange);
    }

    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
  }

  function handleOpenClick(event) {
    event.preventDefault();
    state.triggerElement = event.currentTarget;

    // Get target textarea ID from data attribute
    var textareaId = event.currentTarget.getAttribute('data-textarea-id');
    if (textareaId) {
      state.targetTextarea = document.getElementById(textareaId);
    }

    openDrawer();
  }

  function handleCloseClick(event) {
    event.preventDefault();
    closeDrawer();
  }

  function handleBackdropClick() {
    closeDrawer();
  }

  function handleKeyDown(event) {
    if (!state.isOpen) return;

    // Escape key closes drawer
    if (event.key === 'Escape' || event.keyCode === 27) {
      event.preventDefault();
      closeDrawer();
      return;
    }

    // Tab key for focus trap
    if (event.key === 'Tab' || event.keyCode === 9) {
      handleTabKey(event);
    }
  }

  function handleTabKey(event) {
    if (!state.firstFocusable || !state.lastFocusable) return;

    if (event.shiftKey) {
      // Shift + Tab (backwards)
      if (document.activeElement === state.firstFocusable) {
        event.preventDefault();
        state.lastFocusable.focus();
      }
    } else {
      // Tab (forwards)
      if (document.activeElement === state.lastFocusable) {
        event.preventDefault();
        state.firstFocusable.focus();
      }
    }
  }

  function handleSearchInput(event) {
    state.searchQuery = event.target.value.toLowerCase().trim();
    filterAndRenderSnippets();
  }

  function handleTabClick(event) {
    var tab = event.target.getAttribute('data-tab');
    if (!tab || tab === state.activeTab) return;

    // Update state
    state.activeTab = tab;

    // Update UI - remove active class from all tabs
    if (elements.tabButtons) {
      elements.tabButtons.forEach(function(button) {
        button.classList.remove('drawer__tab--active');
        button.setAttribute('aria-selected', 'false');
      });
    }

    // Add active class to clicked tab
    event.target.classList.add('drawer__tab--active');
    event.target.setAttribute('aria-selected', 'true');

    // Re-render snippets
    filterAndRenderSnippets();
  }

  function handleFilterChange() {
    state.considerationFilter = elements.considerationSelect ? elements.considerationSelect.value : '';
    state.distanceFilter = elements.distanceSelect ? elements.distanceSelect.value : '';
    filterAndRenderSnippets();
  }

  // ============================================
  // DRAWER OPEN/CLOSE
  // ============================================

  function openDrawer() {
    if (state.isOpen) return;

    // Reset filters
    state.searchQuery = '';
    state.activeTab = 'nearby';
    state.considerationFilter = state.currentPageConsideration || '';
    state.distanceFilter = '';

    // Reset UI
    if (elements.searchInput) {
      elements.searchInput.value = '';
    }
    if (elements.considerationSelect) {
      elements.considerationSelect.value = state.currentPageConsideration || '';
    }
    if (elements.distanceSelect) {
      elements.distanceSelect.value = '';
    }

    // Reset tab UI
    if (elements.tabButtons) {
      elements.tabButtons.forEach(function(button) {
        var tab = button.getAttribute('data-tab');
        if (tab === 'nearby') {
          button.classList.add('drawer__tab--active');
          button.setAttribute('aria-selected', 'true');
        } else {
          button.classList.remove('drawer__tab--active');
          button.setAttribute('aria-selected', 'false');
        }
      });
    }

    // Add open classes
    elements.drawer.classList.add('is-open');
    elements.backdrop.classList.add('is-visible');

    // Prevent body scroll
    document.body.classList.add('drawer-open');

    // Set ARIA attributes
    elements.drawer.setAttribute('aria-hidden', 'false');

    // Update state
    state.isOpen = true;

    // Render snippets
    filterAndRenderSnippets();

    // Set up focus trap
    setupFocusTrap();

    // Focus the search input
    if (elements.searchInput) {
      elements.searchInput.focus();
    } else if (elements.closeButton) {
      elements.closeButton.focus();
    }
  }

  function closeDrawer() {
    if (!state.isOpen) return;

    // Remove open classes
    elements.drawer.classList.remove('is-open');
    elements.backdrop.classList.remove('is-visible');

    // Restore body scroll
    document.body.classList.remove('drawer-open');

    // Set ARIA attributes
    elements.drawer.setAttribute('aria-hidden', 'true');

    // Update state
    state.isOpen = false;

    // Release focus trap
    releaseFocusTrap();

    // Restore focus to trigger element
    if (state.triggerElement) {
      state.triggerElement.focus();
      state.triggerElement = null;
    }
  }

  // ============================================
  // FOCUS TRAP
  // ============================================

  function setupFocusTrap() {
    state.focusableElements = elements.drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (state.focusableElements.length === 0) return;

    state.firstFocusable = state.focusableElements[0];
    state.lastFocusable = state.focusableElements[state.focusableElements.length - 1];
  }

  function releaseFocusTrap() {
    state.focusableElements = [];
    state.firstFocusable = null;
    state.lastFocusable = null;
  }

  // ============================================
  // FILTERING
  // ============================================

  function filterAndRenderSnippets() {
    var filtered = state.snippets.slice();

    // Filter by tab
    if (state.activeTab === 'nearby') {
      // Within 500m, sorted by distance
      filtered = filtered.filter(function(s) {
        return s.distanceMeters <= 500;
      });
      filtered.sort(function(a, b) {
        return a.distanceMeters - b.distanceMeters;
      });
    } else if (state.activeTab === 'similar') {
      // Same proposal type as current (householder), sorted by date
      // For now, just sort by date (most recent first)
      filtered.sort(function(a, b) {
        return new Date(b.decisionDate) - new Date(a.decisionDate);
      });
    } else {
      // 'all' - show everything, sorted by distance then date
      filtered.sort(function(a, b) {
        if (a.distanceMeters !== b.distanceMeters) {
          return a.distanceMeters - b.distanceMeters;
        }
        return new Date(b.decisionDate) - new Date(a.decisionDate);
      });
    }

    // Filter by consideration type
    if (state.considerationFilter) {
      filtered = filtered.filter(function(s) {
        return s.considerationType === state.considerationFilter;
      });
    }

    // Filter by distance
    if (state.distanceFilter) {
      var maxDistance = parseInt(state.distanceFilter, 10);
      filtered = filtered.filter(function(s) {
        return s.distanceMeters <= maxDistance;
      });
    }

    // Filter by search query
    if (state.searchQuery) {
      filtered = filtered.filter(function(s) {
        var searchText = [
          s.applicationReference,
          s.address,
          s.considerationTitle,
          s.adviceText,
          s.policyReferences.join(' ')
        ].join(' ').toLowerCase();

        return searchText.includes(state.searchQuery);
      });
    }

    state.filteredSnippets = filtered;
    renderSnippets();
  }

  // ============================================
  // RENDERING
  // ============================================

  function renderSnippets() {
    if (!elements.content) return;

    // Clear existing content
    elements.content.innerHTML = '';

    // Update results count
    updateResultsCount();

    // Check if we have filtered snippets
    if (!state.filteredSnippets || state.filteredSnippets.length === 0) {
      if (state.searchQuery || state.considerationFilter || state.distanceFilter) {
        renderNoResults();
      } else {
        renderEmptyState();
      }
      return;
    }

    // Create snippet list
    var list = document.createElement('ul');
    list.className = 'snippet-list';
    list.setAttribute('role', 'list');

    // Render each filtered snippet
    state.filteredSnippets.forEach(function(snippet) {
      var item = createSnippetCard(snippet);
      list.appendChild(item);
    });

    elements.content.appendChild(list);

    // Update focus trap after content changes
    setupFocusTrap();
  }

  function createSnippetCard(snippet) {
    var li = document.createElement('li');
    li.className = 'snippet-item';

    var html = '';

    // Header: reference, distance, date
    html += '<div class="snippet-item__header">';
    html += '<span class="snippet-item__reference">' + escapeHtml(snippet.applicationReference) + '</span>';
    html += '<div class="snippet-item__meta">';
    html += '<span class="snippet-item__distance">';
    html += '<svg class="snippet-item__distance-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>';
    html += formatDistance(snippet.distanceMeters);
    html += '</span>';
    html += '<span class="snippet-item__date">' + formatDate(snippet.decisionDate) + '</span>';
    html += '</div>';
    html += '</div>';

    // Address
    html += '<p class="snippet-item__address">' + escapeHtml(snippet.address) + '</p>';

    // Consideration type
    html += '<div class="snippet-item__consideration">';
    html += '<span class="snippet-item__consideration-tag">' + escapeHtml(snippet.considerationTitle) + '</span>';
    html += '</div>';

    // Preview text
    html += '<div class="snippet-item__preview">';
    html += '<p class="snippet-item__preview-text">' + escapeHtml(truncateText(snippet.adviceText, 200)) + '</p>';
    html += '</div>';

    // Actions
    html += '<div class="snippet-item__actions">';
    html += '<button type="button" class="govuk-button govuk-button--secondary snippet-item__insert-button">Insert</button>';
    html += '</div>';

    li.innerHTML = html;

    // Add click handler to insert button
    var insertBtn = li.querySelector('.snippet-item__insert-button');
    if (insertBtn) {
      insertBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        insertSnippet(snippet);
      });
    }

    return li;
  }

  function renderEmptyState() {
    var emptyState = document.createElement('div');
    emptyState.className = 'snippet-drawer__empty-state';
    emptyState.innerHTML = '' +
      '<svg class="snippet-drawer__empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '<path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>' +
      '</svg>' +
      '<p>No snippets available for this tab.</p>' +
      '<p>Try the "All" tab to see all available snippets.</p>';
    elements.content.appendChild(emptyState);
  }

  function renderNoResults() {
    var noResults = document.createElement('div');
    noResults.className = 'snippet-drawer__empty-state';
    noResults.innerHTML = '' +
      '<svg class="snippet-drawer__empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '<circle cx="11" cy="11" r="8"/>' +
      '<path d="M21 21l-4.35-4.35"/>' +
      '</svg>' +
      '<p>No snippets match your search.</p>' +
      '<p>Try adjusting your filters or search terms.</p>';
    elements.content.appendChild(noResults);
  }

  function updateResultsCount() {
    if (!elements.resultsCount) return;

    var count = state.filteredSnippets.length;
    var text = count === 1 ? '1 result' : count + ' results';
    elements.resultsCount.textContent = text;
  }

  // ============================================
  // TEXT INSERTION
  // ============================================

  function insertSnippet(snippet) {
    if (!state.targetTextarea) {
      console.warn('No target textarea found');
      closeDrawer();
      return;
    }

    var textToInsert = snippet.adviceText;

    // Get current cursor position
    var startPos = state.targetTextarea.selectionStart;
    var endPos = state.targetTextarea.selectionEnd;
    var currentValue = state.targetTextarea.value;

    // Add spacing if inserting into existing text
    if (currentValue.length > 0 && startPos > 0) {
      // Check if we need to add a newline before
      var charBefore = currentValue.charAt(startPos - 1);
      if (charBefore !== '\n' && charBefore !== '') {
        textToInsert = '\n\n' + textToInsert;
      }
    }

    // Insert text at cursor position
    var newValue = currentValue.substring(0, startPos) + textToInsert + currentValue.substring(endPos);
    state.targetTextarea.value = newValue;

    // Move cursor to end of inserted text
    var newCursorPos = startPos + textToInsert.length;
    state.targetTextarea.setSelectionRange(newCursorPos, newCursorPos);

    // Dispatch input event to trigger any listeners
    var inputEvent = new Event('input', { bubbles: true });
    state.targetTextarea.dispatchEvent(inputEvent);

    // Add attachment to composer (if attachments container exists)
    addAttachment(snippet);

    // Emit custom event
    var event = new CustomEvent('snippet-inserted', {
      detail: snippet,
      bubbles: true
    });
    document.dispatchEvent(event);

    // Close drawer
    closeDrawer();

    // Focus the textarea
    state.targetTextarea.focus();
  }

  function addAttachment(snippet) {
    var attachmentsContainer = document.getElementById('composer-attachments');
    if (!attachmentsContainer) return;

    // Show the attachments container
    attachmentsContainer.classList.add('has-items');

    // Create attachment element
    var attachment = document.createElement('div');
    attachment.className = 'advice-composer__attachment';
    attachment.setAttribute('data-snippet-id', snippet.id);

    attachment.innerHTML = '' +
      '<svg class="advice-composer__attachment-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />' +
      '</svg>' +
      '<span class="advice-composer__attachment-text">' +
      '<span class="advice-composer__attachment-ref">' + escapeHtml(snippet.applicationReference) + '</span>' +
      ' - ' + escapeHtml(snippet.considerationTitle) +
      '</span>' +
      '<button type="button" class="advice-composer__attachment-remove" aria-label="Remove attachment">' +
      '<svg class="advice-composer__attachment-remove-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />' +
      '</svg>' +
      '</button>';

    // Add remove handler
    var removeBtn = attachment.querySelector('.advice-composer__attachment-remove');
    removeBtn.addEventListener('click', function() {
      attachment.remove();
      // Hide container if no more attachments
      if (attachmentsContainer.children.length === 0) {
        attachmentsContainer.classList.remove('has-items');
      }
    });

    attachmentsContainer.appendChild(attachment);
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDistance(meters) {
    if (meters < 1000) {
      return meters + 'm';
    }
    return (meters / 1000).toFixed(1) + 'km';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var date = new Date(dateStr);
    var year = date.getFullYear();
    return year.toString();
  }

  function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  // ============================================
  // PUBLIC API
  // ============================================

  window.SnippetDrawer = {
    init: init,
    open: openDrawer,
    close: closeDrawer,
    setSnippets: function(snippets) {
      state.snippets = snippets || [];
      if (state.isOpen) {
        filterAndRenderSnippets();
      }
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

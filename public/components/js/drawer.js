/**
 * Drawer Component JavaScript
 * Right-side sliding drawer with policy display functionality
 */

(function() {
  'use strict';

  // ============================================
  // STATE
  // ============================================

  var state = {
    isOpen: false,
    policies: [],
    filteredPolicies: [],
    searchQuery: '',
    activeTab: 'relevant', // 'relevant' or 'all'
    triggerElement: null, // Store the element that opened the drawer for focus restoration
    focusableElements: [],
    firstFocusable: null,
    lastFocusable: null
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================

  var elements = {
    drawer: null,
    backdrop: null,
    closeButton: null,
    content: null,
    openButton: null,
    searchInput: null,
    tabButtons: null
  };

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Get DOM elements
    elements.drawer = document.getElementById('policy-drawer');
    elements.backdrop = document.getElementById('drawer-backdrop');
    elements.closeButton = document.getElementById('drawer-close-button');
    elements.content = document.getElementById('drawer-content');
    elements.openButton = document.getElementById('open-drawer-button');
    elements.searchInput = document.getElementById('drawer-search-input');
    elements.tabButtons = document.querySelectorAll('.drawer__tab');

    if (!elements.drawer || !elements.backdrop) {
      console.warn('Drawer elements not found');
      return;
    }

    // Set up event listeners
    setupEventListeners();
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  function setupEventListeners() {
    // Open button
    if (elements.openButton) {
      elements.openButton.addEventListener('click', handleOpenClick);
    }

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
      elements.searchInput.addEventListener('input', handleSearchInput);
    }

    // Tab buttons
    if (elements.tabButtons) {
      elements.tabButtons.forEach(function(button) {
        button.addEventListener('click', handleTabClick);
      });
    }

    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
  }

  function handleOpenClick(event) {
    event.preventDefault();
    state.triggerElement = event.target;
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
    state.searchQuery = event.target.value.toLowerCase();
    filterAndRenderPolicies();
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

    // Re-render policies
    filterAndRenderPolicies();
  }

  // ============================================
  // DRAWER OPEN/CLOSE
  // ============================================

  function openDrawer(policies) {
    if (state.isOpen) return;

    // Store policies if provided
    if (policies) {
      state.policies = policies;
    }

    // Reset search and tab
    state.searchQuery = '';
    state.activeTab = 'relevant';
    if (elements.searchInput) {
      elements.searchInput.value = '';
    }

    // Reset tab UI
    if (elements.tabButtons) {
      elements.tabButtons.forEach(function(button) {
        var tab = button.getAttribute('data-tab');
        if (tab === 'relevant') {
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

    // Render policies
    filterAndRenderPolicies();

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
    // Get all focusable elements within the drawer
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
  // POLICY RENDERING
  // ============================================

  function filterAndRenderPolicies() {
    // Start with all policies or filter by tab
    var tabFilteredPolicies = state.policies;

    // Filter by active tab
    // Note: For now, both tabs show all policies since sample data doesn't have an 'isRelevant' flag
    // When real data is available, add: if (state.activeTab === 'relevant') { filter by policy.isRelevant }
    if (state.activeTab === 'relevant') {
      // Future: filter by policy.isRelevant or similar flag
      tabFilteredPolicies = state.policies.filter(function(policy) {
        return policy.isRelevant !== false; // For now, show all unless explicitly marked as not relevant
      });
    }

    // Filter policies based on search query
    if (!state.searchQuery) {
      state.filteredPolicies = tabFilteredPolicies;
    } else {
      state.filteredPolicies = tabFilteredPolicies.filter(function(policy) {
        var searchText = [
          policy.reference,
          policy.name,
          policy.title,
          policy.summary,
          policy.description,
          policy.category,
          policy.type
        ].join(' ').toLowerCase();

        return searchText.includes(state.searchQuery);
      });
    }

    renderPolicies();
  }

  function renderPolicies() {
    if (!elements.content) return;

    // Clear existing content
    elements.content.innerHTML = '';

    // Check if we have filtered policies
    if (!state.filteredPolicies || state.filteredPolicies.length === 0) {
      if (state.searchQuery) {
        renderNoResults();
      } else {
        renderEmptyState();
      }
      return;
    }

    // Create policy list
    var list = document.createElement('ul');
    list.className = 'policy-list';
    list.setAttribute('role', 'list');

    // Render each filtered policy
    state.filteredPolicies.forEach(function(policy) {
      var item = createPolicyItem(policy);
      list.appendChild(item);
    });

    elements.content.appendChild(list);
  }

  function createPolicyItem(policy) {
    var li = document.createElement('li');
    li.className = 'policy-item';

    var html = '';

    // Policy reference (if available) - using GDS grey tag
    if (policy.reference) {
      html += '<div class="policy-item__header">';
      html += '<strong class="govuk-tag govuk-tag--grey">' + escapeHtml(policy.reference) + '</strong>';
      html += '</div>';
    }

    // Policy name/title
    if (policy.name || policy.title) {
      html += '<h3 class="policy-item__name">' + escapeHtml(policy.name || policy.title) + '</h3>';
    }

    // Policy summary/description
    if (policy.summary || policy.description) {
      html += '<p class="policy-item__summary">' + escapeHtml(policy.summary || policy.description) + '</p>';
    }

    // Policy category (if available)
    if (policy.category || policy.type) {
      html += '<div class="policy-item__category">Category: ' + escapeHtml(policy.category || policy.type) + '</div>';
    }

    // Policy URL link (placeholder)
    html += '<p class="policy-item__link"><a href="#" class="govuk-link">View full policy</a></p>';

    // Insert text button
    html += '<button type="button" class="govuk-button govuk-button--secondary govuk-!-margin-top-2" style="font-size: 16px;">Insert text</button>';

    li.innerHTML = html;

    // Add click handler to add button
    var addBtn = li.querySelector('button');
    if (addBtn) {
      addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        addPolicyAsChip(policy);
      });
    }

    return li;
  }

  function addPolicyAsChip(policy) {
    // Get the active textarea
    var activeTextarea = document.activeElement;

    // If no textarea is focused, try to find the most recent advice textarea
    if (!activeTextarea || activeTextarea.tagName !== 'TEXTAREA') {
      activeTextarea = document.querySelector('textarea[data-field="advice"]:not([hidden])');
    }

    // Insert text into advice textarea
    if (activeTextarea) {
      var textToInsert = policy.summary || policy.description || '';

      // Get current cursor position
      var startPos = activeTextarea.selectionStart;
      var endPos = activeTextarea.selectionEnd;
      var currentValue = activeTextarea.value;

      // Insert text at cursor position
      var newValue = currentValue.substring(0, startPos) + textToInsert + currentValue.substring(endPos);
      activeTextarea.value = newValue;

      // Move cursor to end of inserted text
      var newCursorPos = startPos + textToInsert.length;
      activeTextarea.setSelectionRange(newCursorPos, newCursorPos);

      // Focus the textarea
      activeTextarea.focus();
    }

    // Emit custom event to add policy chip
    var event = new CustomEvent('policy-selected', {
      detail: policy,
      bubbles: true
    });
    document.dispatchEvent(event);

    // Close drawer
    closeDrawer();

    // Show feedback
    var policyName = policy.name || policy.title || policy.reference || 'Policy';
    console.log('Added policy to selection:', policyName);
  }

  function renderEmptyState() {
    var emptyState = document.createElement('div');
    emptyState.className = 'drawer__empty-state';
    emptyState.innerHTML = '<p>No relevant policies found for this application.</p>';
    elements.content.appendChild(emptyState);
  }

  function renderNoResults() {
    var noResults = document.createElement('div');
    noResults.className = 'drawer__empty-state';
    noResults.innerHTML = '<p>No policies match your search.</p>';
    elements.content.appendChild(noResults);
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

  // ============================================
  // PUBLIC API
  // ============================================

  window.PolicyDrawer = {
    init: init,
    open: openDrawer,
    close: closeDrawer,
    setPolicies: function(policies) {
      state.policies = policies || [];
      state.filteredPolicies = policies || [];
      if (state.isOpen) {
        filterAndRenderPolicies();
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

/**
 * Planning Considerations and Advice
 * Handles creation and management of planning considerations for Assessment workflow
 */

(function() {
  'use strict';

  console.log('Planning considerations JS loaded');

  // ============================================
  // CONFIGURATION
  // ============================================

  // TODO: In production, get reportId from URL params or application context
  // For prototype: Using hardcoded test reportId
  var TEST_REPORT_ID = 'f7d8e2c1-4b3a-5c6d-7e8f-9a0b1c2d3e4f'; // Replace with actual reportId from your Supabase

  var existingConsiderations = []; // Stores loaded considerations
  var currentCategories = []; // Track categories that have been created
  var selectedPoliciesByCategory = {}; // Track selected policies per category: { "Design": [policy1, policy2], ... }
  var currentOpenCategory = null; // Track which category's form is currently open

  // Predefined policy areas for autocomplete
  var POLICY_AREAS = [
    'Affordable housing and viability',
    'Community Infrastructure Levy',
    'Design and conservation',
    'Energy, sustainable development implications and air quality',
    'Fire safety',
    'Flood risk and water management',
    'Housing Quality',
    'Land Use',
    'National legislation',
    'Neighbour amenity',
    'Parking and highways',
    'Trees and landscaping'
  ];

  // Predefined policy references for autocomplete
  var POLICY_REFERENCES = [
    { reference: 'P13', name: 'Design of Places', summary: 'Development must be of high quality design that responds positively to local character and contributes to creating attractive, safe and accessible places.' },
    { reference: 'P14', name: 'Extensions and alterations', summary: 'Extensions and alterations should be subordinate to the original building, respect its character and not harm the amenity of neighbouring properties.' },
    { reference: 'P15', name: 'Residential design', summary: 'New residential development should provide adequate internal space, natural light, privacy and outdoor amenity space for future occupiers.' },
    { reference: 'P19', name: 'Listed buildings and structures', summary: 'Development affecting listed buildings must preserve or enhance their significance. Harmful alterations will be refused unless there is clear justification.' },
    { reference: 'P20', name: 'Conservation areas', summary: 'Development in conservation areas must preserve or enhance the character and appearance of the area. New buildings should respect the existing scale, form and materials.' },
    { reference: 'P30', name: 'Office and business development', summary: 'New office development should be located in town centres and contribute to economic growth while respecting the character of the surrounding area.' },
    { reference: 'P35', name: 'Town and local centres', summary: 'Development in town centres should support their vitality and viability, providing active frontages and contributing to a mix of uses.' },
    { reference: 'P50', name: 'Highways impacts', summary: 'Development must not have an unacceptable impact on highway safety or result in severe residual cumulative impacts on the road network.' },
    { reference: 'P54', name: 'Car Parking', summary: 'Car parking provision should be in accordance with adopted standards and not exceed maximum levels. Cycle parking must be provided to encourage sustainable travel.' },
    { reference: 'P56', name: 'Protection of amenity', summary: 'Development must not cause unacceptable harm to the amenity of existing or future occupiers through loss of light, privacy, outlook or increased noise and disturbance.' },
    { reference: 'P68', name: 'Reducing flood risk', summary: 'Development must not increase flood risk and should incorporate sustainable drainage systems. Flood risk assessments are required in flood zones.' }
  ];

  var highlightedIndex = -1; // Track highlighted item in dropdown
  var policyHighlightedIndex = -1; // Track highlighted item in policy references dropdown
  var selectedSnippetsByCategory = {}; // Track selected snippets per category

  // Hardcoded similar application snippets for prototype
  var SIMILAR_SNIPPETS = {
    'Design': [
      {
        id: 'snippet-design-1',
        element: 'Single storey rear extension',
        status: 'supported',
        assessment: 'The proposed single storey rear extension is considered acceptable in design terms. The extension would be subordinate to the main dwelling and would not be visible from the public realm. The proposed materials (matching brick and plain clay tiles) are appropriate and would respect the character of the existing building. The design follows established guidance for domestic extensions.',
        sourceRef: 'APP-2024-1234',
        sourceAddress: '12 High Street',
        sourceOutcome: 'Approved'
      },
      {
        id: 'snippet-design-2',
        element: 'Two storey side extension',
        status: 'supported',
        assessment: 'The two storey side extension is set back from the front elevation and set down from the main ridge, which helps to maintain the visual hierarchy of the original dwelling. The extension would appear subordinate and would not result in a terracing effect with the neighbouring property at No. 15.',
        sourceRef: 'APP-2024-0987',
        sourceAddress: '8 High Street',
        sourceOutcome: 'Approved'
      },
      {
        id: 'snippet-design-3',
        element: 'Rear dormer extension',
        status: 'needs_changes',
        assessment: 'The proposed rear dormer is of an excessive size that would dominate the rear roof slope. To be acceptable, the dormer should be reduced in width to leave a minimum 500mm gap to the party wall and reduced in height to sit below the main ridge line. The materials should be amended to standing seam metal cladding rather than uPVC.',
        sourceRef: 'APP-2023-2345',
        sourceAddress: '15 Park Road',
        sourceOutcome: 'Approved with conditions'
      }
    ],
    'Design and conservation': [
      {
        id: 'snippet-conservation-1',
        element: 'Replacement windows in conservation area',
        status: 'supported',
        assessment: 'The proposed timber sliding sash windows would preserve the character of this locally listed building within the conservation area. The windows follow the traditional proportions and detailing of the originals and would be an improvement on the existing uPVC units which currently detract from the building\'s significance.',
        sourceRef: 'APP-2024-0456',
        sourceAddress: '23 Church Lane',
        sourceOutcome: 'Approved'
      }
    ],
    'Neighbour amenity': [
      {
        id: 'snippet-amenity-1',
        element: 'Impact on daylight to neighbouring windows',
        status: 'supported',
        assessment: 'A daylight and sunlight assessment has been submitted which demonstrates that all neighbouring windows would retain adequate daylight following the development. The BRE guidelines would be met in full and no unacceptable impact on residential amenity would result.',
        sourceRef: 'APP-2024-1122',
        sourceAddress: '34 Mill Lane',
        sourceOutcome: 'Approved'
      },
      {
        id: 'snippet-amenity-2',
        element: 'Overlooking from first floor windows',
        status: 'needs_changes',
        assessment: 'The proposed first floor side-facing window would result in direct overlooking of the private garden at No. 42, which currently enjoys a high level of privacy. It is recommended that this window be fitted with obscure glazing and fixed shut, or omitted from the scheme entirely.',
        sourceRef: 'APP-2024-0789',
        sourceAddress: '40 Station Road',
        sourceOutcome: 'Approved with conditions'
      }
    ],
    'Privacy': [
      {
        id: 'snippet-privacy-1',
        element: 'Windows in rear elevation',
        status: 'supported',
        assessment: 'The proposed rear-facing windows are located over 21 metres from the rear elevation of properties on Green Lane, which exceeds the minimum separation distance for direct overlooking. No unacceptable loss of privacy would result.',
        sourceRef: 'APP-2024-0333',
        sourceAddress: '7 Oak Avenue',
        sourceOutcome: 'Approved'
      }
    ],
    'Parking and highways': [
      {
        id: 'snippet-parking-1',
        element: 'Off-street parking provision',
        status: 'supported',
        assessment: 'The development would retain two off-street parking spaces which is considered acceptable for a dwelling of this size in a location with good public transport accessibility (PTAL 4). The proposal would not result in unacceptable additional pressure on on-street parking.',
        sourceRef: 'APP-2024-0555',
        sourceAddress: '19 Manor Way',
        sourceOutcome: 'Approved'
      }
    ],
    'Trees and landscaping': [
      {
        id: 'snippet-trees-1',
        element: 'Impact on protected oak tree',
        status: 'needs_changes',
        assessment: 'The proposed foundations would encroach within the root protection area of the TPO oak tree (T1). A revised foundation design using pile and beam construction is required to avoid damage to the tree\'s root system. A tree protection plan and arboricultural method statement should be secured by condition.',
        sourceRef: 'APP-2023-1888',
        sourceAddress: '5 Woodland Close',
        sourceOutcome: 'Approved with conditions'
      }
    ]
  };

  // ============================================
  // INITIALIZATION
  // ============================================

  document.addEventListener('DOMContentLoaded', function() {
    console.log('Planning considerations page loaded');

    // Set up event listeners
    setupEventListeners();

    // Set up autocomplete for policy area input
    setupAutocomplete();

    // Load existing considerations from database
    loadExistingConsiderations();

    // Add sample considerations for prototype
    addSampleConsiderations();
  });

  function setupEventListeners() {
    // Add consideration submit button
    var submitBtn = document.getElementById('add-consideration-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', handleCreateConsideration);
    }
  }

  // ============================================
  // AUTOCOMPLETE FOR POLICY AREA
  // ============================================

  function setupAutocomplete() {
    var input = document.getElementById('policy-area-input');
    var dropdown = document.getElementById('policy-area-dropdown');

    if (!input || !dropdown) return;

    // Show dropdown on focus
    input.addEventListener('focus', function() {
      showDropdown(input, dropdown, input.value);
    });

    // Filter on input
    input.addEventListener('input', function() {
      highlightedIndex = -1;
      showDropdown(input, dropdown, input.value);
    });

    // Keyboard navigation
    input.addEventListener('keydown', function(e) {
      var items = dropdown.querySelectorAll('.autocomplete-dropdown__item:not(.autocomplete-dropdown__item--no-results)');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (highlightedIndex < items.length - 1) {
          highlightedIndex++;
          updateHighlight(dropdown);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (highlightedIndex > 0) {
          highlightedIndex--;
          updateHighlight(dropdown);
        }
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
          e.preventDefault();
          selectItem(input, dropdown, items[highlightedIndex].textContent);
        }
      } else if (e.key === 'Escape') {
        hideDropdown(input, dropdown);
      }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        hideDropdown(input, dropdown);
      }
    });
  }

  function showDropdown(input, dropdown, filterValue) {
    var filter = filterValue.toLowerCase().trim();
    var filteredAreas = POLICY_AREAS.filter(function(area) {
      return area.toLowerCase().includes(filter);
    });

    // Build dropdown HTML
    var html = '';
    if (filteredAreas.length > 0) {
      filteredAreas.forEach(function(area, index) {
        var highlightClass = index === highlightedIndex ? ' autocomplete-dropdown__item--highlighted' : '';
        html += '<div class="autocomplete-dropdown__item' + highlightClass + '" role="option" data-index="' + index + '">' + escapeHtml(area) + '</div>';
      });
    } else if (filter === '') {
      // Show all options when input is empty
      POLICY_AREAS.forEach(function(area, index) {
        var highlightClass = index === highlightedIndex ? ' autocomplete-dropdown__item--highlighted' : '';
        html += '<div class="autocomplete-dropdown__item' + highlightClass + '" role="option" data-index="' + index + '">' + escapeHtml(area) + '</div>';
      });
    } else {
      html = '<div class="autocomplete-dropdown__item autocomplete-dropdown__item--no-results">No matching policy areas</div>';
    }

    dropdown.innerHTML = html;
    dropdown.classList.add('is-visible');
    input.setAttribute('aria-expanded', 'true');

    // Add click handlers to items
    var items = dropdown.querySelectorAll('.autocomplete-dropdown__item:not(.autocomplete-dropdown__item--no-results)');
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        selectItem(input, dropdown, item.textContent);
      });
    });
  }

  function hideDropdown(input, dropdown) {
    dropdown.classList.remove('is-visible');
    input.setAttribute('aria-expanded', 'false');
    highlightedIndex = -1;
  }

  function selectItem(input, dropdown, value) {
    input.value = value;
    hideDropdown(input, dropdown);
    input.focus();

    // Show snippet preview for the selected policy area
    showAddConsiderationSnippets(value);
  }

  function updateHighlight(dropdown) {
    var items = dropdown.querySelectorAll('.autocomplete-dropdown__item');
    items.forEach(function(item, index) {
      if (index === highlightedIndex) {
        item.classList.add('autocomplete-dropdown__item--highlighted');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('autocomplete-dropdown__item--highlighted');
      }
    });
  }

  // ============================================
  // POLICY REFERENCES AUTOCOMPLETE
  // ============================================

  function setupPolicyRefsAutocomplete(category, container) {
    var input = container.querySelector('#policy-refs-' + category);
    var dropdown = container.querySelector('#policy-refs-dropdown-' + category);

    if (!input || !dropdown) return;

    // Show dropdown on focus
    input.addEventListener('focus', function() {
      showPolicyRefsDropdown(input, dropdown, input.value, category);
    });

    // Filter on input
    input.addEventListener('input', function() {
      policyHighlightedIndex = -1;
      showPolicyRefsDropdown(input, dropdown, input.value, category);
    });

    // Keyboard navigation
    input.addEventListener('keydown', function(e) {
      var items = dropdown.querySelectorAll('.autocomplete-dropdown__item:not(.autocomplete-dropdown__item--no-results)');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (policyHighlightedIndex < items.length - 1) {
          policyHighlightedIndex++;
          updatePolicyHighlight(dropdown);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (policyHighlightedIndex > 0) {
          policyHighlightedIndex--;
          updatePolicyHighlight(dropdown);
        }
      } else if (e.key === 'Enter') {
        if (policyHighlightedIndex >= 0 && items[policyHighlightedIndex]) {
          e.preventDefault();
          var policyRef = items[policyHighlightedIndex].getAttribute('data-reference');
          var policyName = items[policyHighlightedIndex].getAttribute('data-name');
          selectPolicyRef(input, dropdown, category, policyRef, policyName);
        }
      } else if (e.key === 'Escape') {
        hidePolicyRefsDropdown(input, dropdown);
      }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        hidePolicyRefsDropdown(input, dropdown);
      }
    });
  }

  function showPolicyRefsDropdown(input, dropdown, filterValue, category) {
    var filter = filterValue.toLowerCase().trim();
    var filteredPolicies = POLICY_REFERENCES.filter(function(policy) {
      var searchText = policy.reference + ' ' + policy.name;
      return searchText.toLowerCase().includes(filter);
    });

    // Build dropdown HTML
    var html = '';
    if (filteredPolicies.length > 0) {
      filteredPolicies.forEach(function(policy, index) {
        var highlightClass = index === policyHighlightedIndex ? ' autocomplete-dropdown__item--highlighted' : '';
        html += '<div class="autocomplete-dropdown__item' + highlightClass + '" role="option" data-index="' + index + '" data-reference="' + escapeHtml(policy.reference) + '" data-name="' + escapeHtml(policy.name) + '">' + escapeHtml(policy.reference) + ' - ' + escapeHtml(policy.name) + '</div>';
      });
    } else if (filter === '') {
      // Show all options when input is empty
      POLICY_REFERENCES.forEach(function(policy, index) {
        var highlightClass = index === policyHighlightedIndex ? ' autocomplete-dropdown__item--highlighted' : '';
        html += '<div class="autocomplete-dropdown__item' + highlightClass + '" role="option" data-index="' + index + '" data-reference="' + escapeHtml(policy.reference) + '" data-name="' + escapeHtml(policy.name) + '">' + escapeHtml(policy.reference) + ' - ' + escapeHtml(policy.name) + '</div>';
      });
    } else {
      html = '<div class="autocomplete-dropdown__item autocomplete-dropdown__item--no-results">No matching policies</div>';
    }

    dropdown.innerHTML = html;
    dropdown.classList.add('is-visible');
    input.setAttribute('aria-expanded', 'true');

    // Add click handlers to items
    var items = dropdown.querySelectorAll('.autocomplete-dropdown__item:not(.autocomplete-dropdown__item--no-results)');
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        var policyRef = item.getAttribute('data-reference');
        var policyName = item.getAttribute('data-name');
        selectPolicyRef(input, dropdown, category, policyRef, policyName);
      });
    });
  }

  function hidePolicyRefsDropdown(input, dropdown) {
    dropdown.classList.remove('is-visible');
    input.setAttribute('aria-expanded', 'false');
    policyHighlightedIndex = -1;
  }

  function selectPolicyRef(input, dropdown, category, reference, name) {
    // Find the full policy object to get the summary
    var fullPolicy = POLICY_REFERENCES.find(function(p) {
      return p.reference === reference;
    });

    // Add to selected policies for this category
    var policy = { reference: reference, name: name, summary: fullPolicy ? fullPolicy.summary : '' };
    addPolicyChip(category, policy);

    // Add policy title and summary to the Advice textarea
    addPolicyToAdviceEditor(category, policy);

    // Clear the input
    input.value = '';
    hidePolicyRefsDropdown(input, dropdown);
    input.focus();
  }

  function addPolicyToAdviceEditor(category, policy) {
    var editor = document.getElementById('advice-' + category);
    if (!editor) return;

    // Create the policy content block
    var policyBlock = document.createElement('div');
    policyBlock.className = 'policy-block';

    // Policy title in bold
    var title = document.createElement('p');
    var strong = document.createElement('strong');
    strong.textContent = policy.reference + ' - ' + policy.name;
    title.appendChild(strong);
    policyBlock.appendChild(title);

    // Policy summary (not bold, editable)
    if (policy.summary) {
      var summary = document.createElement('p');
      summary.textContent = policy.summary;
      policyBlock.appendChild(summary);
    }

    // Add spacing after the block
    var spacer = document.createElement('p');
    spacer.innerHTML = '<br>';

    // Append to editor
    editor.appendChild(policyBlock);
    editor.appendChild(spacer);

    // Move cursor to end
    var range = document.createRange();
    var selection = window.getSelection();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function updatePolicyHighlight(dropdown) {
    var items = dropdown.querySelectorAll('.autocomplete-dropdown__item');
    items.forEach(function(item, index) {
      if (index === policyHighlightedIndex) {
        item.classList.add('autocomplete-dropdown__item--highlighted');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('autocomplete-dropdown__item--highlighted');
      }
    });
  }

  // ============================================
  // LOAD EXISTING DATA
  // ============================================

  async function loadExistingConsiderations() {
    if (!window.SupabaseClient) {
      console.error('Supabase client not available');
      return;
    }

    console.log('Loading existing considerations for report:', TEST_REPORT_ID);
    var considerations = await window.SupabaseClient.loadPlanningConsiderations(TEST_REPORT_ID);

    if (considerations && considerations.length > 0) {
      console.log('Loaded', considerations.length, 'considerations');
      existingConsiderations = considerations;

      // Group by category
      var grouped = groupByCategory(considerations);

      // Render each category container
      Object.keys(grouped).forEach(function(category) {
        currentCategories.push(category);
        renderConsiderationContainer(category, grouped[category]);
      });
    } else {
      console.log('No existing considerations found');
    }
  }

  function groupByCategory(considerations) {
    var grouped = {};
    considerations.forEach(function(item) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }

  // ============================================
  // SAMPLE DATA FOR PROTOTYPE
  // ============================================

  function addSampleConsiderations() {
    // Sample considerations with advice items
    var sampleData = [
      {
        category: 'Design and conservation',
        adviceItems: [
          {
            element: 'Windows',
            status: 'needs_changes',
            relevant_policies: 'P13: Design of Places\nP20: Conservation areas',
            assessment: 'P13 - Design of Places\n\nDevelopment must be of high quality design that responds positively to local character and contributes to creating attractive, safe and accessible places.\n\nP20 - Conservation areas\n\nDevelopment in conservation areas must preserve or enhance the character or appearance of the area.'
          },
          {
            element: 'Doors',
            status: 'supported',
            relevant_policies: 'P19: Listed buildings and structures',
            assessment: 'P19 - Listed buildings and structures\n\nDevelopment affecting a listed building or its setting must preserve or enhance its special architectural or historic interest.'
          }
        ]
      }
    ];

    // Render each sample consideration
    sampleData.forEach(function(data) {
      // Add category to tracking array
      if (!currentCategories.includes(data.category)) {
        currentCategories.push(data.category);
      }

      // Render the consideration container with advice items
      renderConsiderationContainer(data.category, data.adviceItems);
    });
  }

  // ============================================
  // ADD CONSIDERATION FORM
  // ============================================

  function handleCreateConsideration() {
    var policyAreaInput = document.getElementById('policy-area-input');
    var policyArea = policyAreaInput.value.trim();

    // Validation
    if (!policyArea) {
      alert('Please enter a policy area');
      return;
    }

    // Check if category already exists
    if (currentCategories.includes(policyArea)) {
      alert('This consideration already exists. Please add advice to the existing consideration below.');
      resetAddConsiderationForm();
      return;
    }

    // Gather selected snippets to add as initial advice items
    var initialAdviceItems = [];
    var snippets = SIMILAR_SNIPPETS[policyArea] || [];

    pendingSnippetSelections.forEach(function(snippetId) {
      var snippet = snippets.find(function(s) { return s.id === snippetId; });
      if (snippet) {
        initialAdviceItems.push({
          element: snippet.element,
          status: snippet.status,
          assessment: snippet.assessment,
          sourceRef: snippet.sourceRef,
          sourceAddress: snippet.sourceAddress
        });
      }
    });

    // Create the consideration container with initial advice items
    currentCategories.push(policyArea);
    renderConsiderationContainer(policyArea, initialAdviceItems);

    // Setup edit handlers for any advice items with attribution
    if (initialAdviceItems.length > 0) {
      var container = document.querySelector('.consideration-container[data-category="' + policyArea + '"]');
      if (container) {
        var adviceItemsContainer = container.querySelector('.advice-items');
        if (adviceItemsContainer) {
          setupAttributionEditHandlers(adviceItemsContainer);
        }
      }
    }

    resetAddConsiderationForm();
  }

  function resetAddConsiderationForm() {
    // Clear the input
    var policyAreaInput = document.getElementById('policy-area-input');
    if (policyAreaInput) {
      policyAreaInput.value = '';
    }

    // Clear the snippet preview
    clearAddConsiderationSnippets();

    // Close the details element
    var details = document.getElementById('add-consideration-details');
    if (details) {
      details.removeAttribute('open');
    }
  }

  // ============================================
  // RENDER CONSIDERATION CONTAINER
  // ============================================

  function renderConsiderationContainer(category, adviceItems) {
    var container = document.getElementById('considerations-container');
    if (!container) return;

    // Create consideration container
    var considerationDiv = document.createElement('div');
    considerationDiv.className = 'consideration-container govuk-!-margin-bottom-8';
    considerationDiv.setAttribute('data-category', category);

    // Container content - Grey header section
    var html = '<div class="consideration-container__header">';
    html += '<h2 class="consideration-container__title">' + escapeHtml(category) + '</h2>';
    html += '<a href="#" class="govuk-link consideration-container__remove" data-remove-category="' + escapeHtml(category) + '">Remove</a>';
    html += '</div>';

    // White content section
    html += '<div class="consideration-container__content">';

    // Advice items container
    html += '<div class="advice-items" data-category="' + escapeHtml(category) + '">';

    // Render existing advice items
    adviceItems.forEach(function(advice) {
      html += renderAdviceItemHtml(advice);
    });

    html += '</div>'; // End advice-items

    // Add advice details component
    html += '<details class="govuk-details govuk-!-margin-top-4" data-category="' + escapeHtml(category) + '">';
    html += '<summary class="govuk-details__summary">';
    html += '<span class="govuk-details__summary-text">Add advice</span>';
    html += '</summary>';
    html += '<div class="govuk-details__text">';
    html += renderAdviceFormHtml(category);
    html += '</div>';
    html += '</details>';

    html += '</div>'; // End consideration-container__content

    considerationDiv.innerHTML = html;
    container.appendChild(considerationDiv);

    // Add event listeners to form buttons
    var saveBtn = considerationDiv.querySelector('[data-save-advice]');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        handleSaveAdvice(category);
      });
    }

    // Add event listeners to rich text editor toolbar buttons
    var toolbarButtons = considerationDiv.querySelectorAll('[data-command]');
    toolbarButtons.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var command = btn.getAttribute('data-command');
        document.execCommand(command, false, null);

        // Refocus the editor
        var editor = considerationDiv.querySelector('.rte-editor');
        if (editor) {
          editor.focus();
        }
      });
    });

    // Add event listener to "Insert policy" button
    var insertPolicyBtn = considerationDiv.querySelector('[data-add-policy]');
    if (insertPolicyBtn) {
      insertPolicyBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Track which category's form is currently open
        currentOpenCategory = category;

        // Load policies and open the drawer
        if (window.PolicyDrawer && window.samplePolicies) {
          window.PolicyDrawer.setPolicies(window.samplePolicies);
          window.PolicyDrawer.open();
        } else if (window.PolicyDrawer) {
          // Fallback: just open the drawer (policies may already be loaded)
          window.PolicyDrawer.open();
        }
      });
    }

    // Add event listener to "Remove" link
    var removeBtn = considerationDiv.querySelector('[data-remove-category]');
    if (removeBtn) {
      removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        removeConsideration(category);
      });
    }

    // Set up policy references autocomplete
    setupPolicyRefsAutocomplete(category, considerationDiv);

    // Re-initialize GOV.UK components for new buttons
    if (window.GOVUKFrontend) {
      window.GOVUKFrontend.initAll();
    }
  }

  function removeConsideration(category) {
    // Remove from DOM
    var container = document.querySelector('.consideration-container[data-category="' + category + '"]');
    if (container) {
      container.remove();
    }

    // Remove from tracking arrays
    var index = currentCategories.indexOf(category);
    if (index > -1) {
      currentCategories.splice(index, 1);
    }

    // Clear any selected policies for this category
    delete selectedPoliciesByCategory[category];
  }

  // ============================================
  // SNIPPET PREVIEW PANEL (in Add Consideration form)
  // ============================================

  var pendingSnippetSelections = []; // Track selected snippets before consideration is created

  function showAddConsiderationSnippets(category) {
    var container = document.getElementById('add-consideration-snippets');
    if (!container) return;

    // Clear any previous snippets
    container.innerHTML = '';
    pendingSnippetSelections = [];

    var snippets = SIMILAR_SNIPPETS[category];
    if (!snippets || snippets.length === 0) {
      return;
    }

    // Render the snippet preview panel
    var html = '<div class="snippet-preview snippet-preview--in-form">';
    html += '<div class="snippet-preview__header">';
    html += '<h3 class="snippet-preview__title">Similar assessments (' + snippets.length + ' found)</h3>';
    html += '<p class="govuk-hint">Select assessments to add when you create this consideration</p>';
    html += '</div>';
    html += '<div class="snippet-preview__list">';

    snippets.forEach(function(snippet) {
      html += renderSnippetItemHtml(snippet, category);
    });

    html += '</div>';
    html += '</div>';

    container.innerHTML = html;

    // Set up event handlers for the snippet checkboxes
    setupAddConsiderationSnippetHandlers(container, category);
  }

  function setupAddConsiderationSnippetHandlers(container, category) {
    // Checkbox change handlers
    var checkboxes = container.querySelectorAll('[data-snippet-checkbox]');
    checkboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        updatePendingSnippetSelections(container);
      });
    });

    // Expand/collapse handlers
    var expandButtons = container.querySelectorAll('[data-expand-snippet]');
    expandButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var snippetId = btn.getAttribute('data-expand-snippet');
        toggleSnippetExpand(snippetId, btn);
      });
    });
  }

  function updatePendingSnippetSelections(container) {
    var checkboxes = container.querySelectorAll('[data-snippet-checkbox]:checked');
    pendingSnippetSelections = [];
    checkboxes.forEach(function(checkbox) {
      pendingSnippetSelections.push(checkbox.getAttribute('data-snippet-checkbox'));
    });
  }

  function clearAddConsiderationSnippets() {
    var container = document.getElementById('add-consideration-snippets');
    if (container) {
      container.innerHTML = '';
    }
    pendingSnippetSelections = [];
  }

  function renderSnippetPreviewHtml(category) {
    var snippets = SIMILAR_SNIPPETS[category];
    if (!snippets || snippets.length === 0) {
      return '';
    }

    var html = '<div class="snippet-preview" data-category="' + escapeHtml(category) + '">';
    html += '<div class="snippet-preview__header">';
    html += '<h3 class="snippet-preview__title">Similar assessments (' + snippets.length + ' found)</h3>';
    html += '</div>';
    html += '<div class="snippet-preview__list">';

    snippets.forEach(function(snippet) {
      html += renderSnippetItemHtml(snippet, category);
    });

    html += '</div>';
    html += '<div class="snippet-preview__actions">';
    html += '<button type="button" class="govuk-button govuk-button--secondary" data-add-snippets="' + escapeHtml(category) + '" disabled>Add selected</button>';
    html += '</div>';
    html += '</div>';

    return html;
  }

  function renderSnippetItemHtml(snippet, category) {
    var truncatedText = truncateText(snippet.assessment, 80);
    var isExpanded = false;

    var statusClass = '';
    var statusText = '';
    if (snippet.status === 'supported') {
      statusClass = 'govuk-tag--green';
      statusText = 'Complies';
    } else if (snippet.status === 'needs_changes') {
      statusClass = 'govuk-tag--yellow';
      statusText = 'Needs changes';
    } else if (snippet.status === 'does_not_comply') {
      statusClass = 'govuk-tag--red';
      statusText = 'Does not comply';
    }

    var html = '<div class="snippet-preview__item" data-snippet-id="' + escapeHtml(snippet.id) + '">';

    // Checkbox and title row
    html += '<div class="snippet-preview__item-header">';
    html += '<div class="govuk-checkboxes__item snippet-preview__checkbox">';
    html += '<input class="govuk-checkboxes__input" id="snippet-' + escapeHtml(snippet.id) + '" type="checkbox" data-snippet-checkbox="' + escapeHtml(snippet.id) + '" data-category="' + escapeHtml(category) + '">';
    html += '<label class="govuk-label govuk-checkboxes__label" for="snippet-' + escapeHtml(snippet.id) + '">';
    html += '<span class="snippet-preview__element">' + escapeHtml(snippet.element) + '</span>';
    html += '</label>';
    html += '</div>';
    html += '<strong class="govuk-tag ' + statusClass + ' snippet-preview__status">' + statusText + '</strong>';
    html += '</div>';

    // Assessment text (truncated by default)
    html += '<div class="snippet-preview__text-container">';
    html += '<p class="snippet-preview__text snippet-preview__text--truncated" data-full-text="' + escapeHtml(snippet.assessment) + '">"' + escapeHtml(truncatedText) + '"</p>';
    html += '<button type="button" class="govuk-link snippet-preview__expand" data-expand-snippet="' + escapeHtml(snippet.id) + '">Show more</button>';
    html += '</div>';

    // Source metadata
    html += '<p class="snippet-preview__meta">';
    html += '<span class="snippet-preview__source-ref">' + escapeHtml(snippet.sourceRef) + '</span>';
    html += '<span class="snippet-preview__separator">·</span>';
    html += '<span class="snippet-preview__source-address">' + escapeHtml(snippet.sourceAddress) + '</span>';
    html += '<span class="snippet-preview__separator">·</span>';
    html += '<span class="snippet-preview__source-outcome">' + escapeHtml(snippet.sourceOutcome) + '</span>';
    html += '</p>';

    html += '</div>';

    return html;
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + '...';
  }

  function setupSnippetEventHandlers(category, container) {
    // Checkbox change handlers
    var checkboxes = container.querySelectorAll('[data-snippet-checkbox]');
    checkboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        handleSnippetCheckboxChange(category, container);
      });
    });

    // Expand/collapse handlers
    var expandButtons = container.querySelectorAll('[data-expand-snippet]');
    expandButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var snippetId = btn.getAttribute('data-expand-snippet');
        toggleSnippetExpand(snippetId, btn);
      });
    });

    // Add selected button handler
    var addBtn = container.querySelector('[data-add-snippets]');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        addSelectedSnippets(category, container);
      });
    }
  }

  function handleSnippetCheckboxChange(category, container) {
    var checkboxes = container.querySelectorAll('[data-snippet-checkbox]:checked');
    var addBtn = container.querySelector('[data-add-snippets]');

    if (addBtn) {
      addBtn.disabled = checkboxes.length === 0;
    }

    // Update selected snippets tracking
    selectedSnippetsByCategory[category] = [];
    checkboxes.forEach(function(checkbox) {
      var snippetId = checkbox.getAttribute('data-snippet-checkbox');
      selectedSnippetsByCategory[category].push(snippetId);
    });
  }

  function toggleSnippetExpand(snippetId, btn) {
    var item = btn.closest('.snippet-preview__item');
    var textEl = item.querySelector('.snippet-preview__text');
    var fullText = textEl.getAttribute('data-full-text');

    if (textEl.classList.contains('snippet-preview__text--truncated')) {
      // Expand
      textEl.textContent = '"' + fullText + '"';
      textEl.classList.remove('snippet-preview__text--truncated');
      textEl.classList.add('snippet-preview__text--expanded');
      btn.textContent = 'Show less';
    } else {
      // Collapse
      textEl.textContent = '"' + truncateText(fullText, 80) + '"';
      textEl.classList.remove('snippet-preview__text--expanded');
      textEl.classList.add('snippet-preview__text--truncated');
      btn.textContent = 'Show more';
    }
  }

  function addSelectedSnippets(category, container) {
    var selectedIds = selectedSnippetsByCategory[category] || [];
    if (selectedIds.length === 0) return;

    var snippets = SIMILAR_SNIPPETS[category] || [];
    var adviceItemsContainer = container.querySelector('.advice-items[data-category="' + category + '"]');

    selectedIds.forEach(function(snippetId) {
      var snippet = snippets.find(function(s) { return s.id === snippetId; });
      if (!snippet) return;

      // Create advice item with attribution
      var adviceData = {
        element: snippet.element,
        status: snippet.status,
        assessment: snippet.assessment,
        sourceRef: snippet.sourceRef,
        sourceAddress: snippet.sourceAddress
      };

      // Add to DOM
      var adviceHtml = renderAdviceItemHtml(adviceData);
      adviceItemsContainer.insertAdjacentHTML('beforeend', adviceHtml);

      // Remove snippet from preview panel
      var snippetItem = container.querySelector('.snippet-preview__item[data-snippet-id="' + snippetId + '"]');
      if (snippetItem) {
        snippetItem.remove();
      }
    });

    // Clear selection state
    selectedSnippetsByCategory[category] = [];

    // Update snippet count or hide panel if empty
    var remainingItems = container.querySelectorAll('.snippet-preview__item');
    if (remainingItems.length === 0) {
      var previewPanel = container.querySelector('.snippet-preview');
      if (previewPanel) {
        previewPanel.remove();
      }
    } else {
      // Update count in header
      var header = container.querySelector('.snippet-preview__title');
      if (header) {
        header.textContent = 'Similar assessments (' + remainingItems.length + ' found)';
      }
      // Disable add button
      var addBtn = container.querySelector('[data-add-snippets]');
      if (addBtn) {
        addBtn.disabled = true;
      }
    }

    // Setup edit handlers for attribution fade
    setupAttributionEditHandlers(adviceItemsContainer);
  }

  function setupAttributionEditHandlers(container) {
    var editableCards = container.querySelectorAll('.advice-item--editable');
    editableCards.forEach(function(card) {
      var contentArea = card.querySelector('.advice-item__content');
      if (contentArea && !contentArea.hasAttribute('data-edit-handler-attached')) {
        contentArea.setAttribute('data-edit-handler-attached', 'true');
        contentArea.addEventListener('input', function() {
          // Mark as edited and hide attribution
          card.classList.add('advice-item--edited');
          var attribution = card.querySelector('.snippet-attribution');
          if (attribution) {
            attribution.style.display = 'none';
          }
        });
      }
    });
  }

  function renderAdviceFormHtml(category) {
    return `
      <div class="govuk-form-group">
        <label class="govuk-label" for="element-${escapeHtml(category)}">
          Enter element of proposal
        </label>
        <input class="govuk-input" id="element-${escapeHtml(category)}" type="text" data-field="element">
      </div>

      <div class="govuk-form-group">
        <label class="govuk-label" for="policy-refs-${escapeHtml(category)}">
          Enter policy references
        </label>
        <div id="policy-refs-hint-${escapeHtml(category)}" class="govuk-hint">
          Start typing to find an existing policy reference
        </div>
        <div class="autocomplete-wrapper">
          <input class="govuk-input" id="policy-refs-${escapeHtml(category)}" type="text" data-field="policy-refs" aria-describedby="policy-refs-hint-${escapeHtml(category)}" autocomplete="off" aria-autocomplete="list" aria-controls="policy-refs-dropdown-${escapeHtml(category)}" aria-expanded="false">
          <div id="policy-refs-dropdown-${escapeHtml(category)}" class="autocomplete-dropdown" role="listbox" data-policy-dropdown="${escapeHtml(category)}"></div>
        </div>
        <div class="policy-chips" data-chips-for="${escapeHtml(category)}"></div>
      </div>

      <div class="govuk-form-group">
        <fieldset class="govuk-fieldset">
          <legend class="govuk-fieldset__legend">
            Status
          </legend>
          <div class="govuk-radios" data-module="govuk-radios">
            <div class="govuk-radios__item">
              <input class="govuk-radios__input" id="status-complies-${escapeHtml(category)}" name="status-${escapeHtml(category)}" type="radio" value="supported" data-field="status">
              <label class="govuk-label govuk-radios__label" for="status-complies-${escapeHtml(category)}">
                Complies
              </label>
            </div>
            <div class="govuk-radios__item">
              <input class="govuk-radios__input" id="status-needs-changes-${escapeHtml(category)}" name="status-${escapeHtml(category)}" type="radio" value="needs_changes" data-field="status">
              <label class="govuk-label govuk-radios__label" for="status-needs-changes-${escapeHtml(category)}">
                Needs changes
              </label>
            </div>
            <div class="govuk-radios__item">
              <input class="govuk-radios__input" id="status-does-not-comply-${escapeHtml(category)}" name="status-${escapeHtml(category)}" type="radio" value="does_not_comply" data-field="status">
              <label class="govuk-label govuk-radios__label" for="status-does-not-comply-${escapeHtml(category)}">
                Does not comply
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      <div class="govuk-form-group">
        <label class="govuk-label">
          Advice
        </label>
        <div class="rte-container">
          <div class="rte-toolbar">
            <button type="button" class="rte-toolbar__button" data-command="bold" data-category="${escapeHtml(category)}" aria-label="Bold">
              <strong>B</strong>
            </button>
            <button type="button" class="rte-toolbar__button" data-command="italic" data-category="${escapeHtml(category)}" aria-label="Italic">
              <em>I</em>
            </button>
            <button type="button" class="rte-toolbar__button" data-command="underline" data-category="${escapeHtml(category)}" aria-label="Underline">
              <u>U</u>
            </button>
            <button type="button" class="rte-toolbar__button" data-command="createLink" data-category="${escapeHtml(category)}" aria-label="Insert link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </button>
            <div class="rte-toolbar__separator"></div>
            <button type="button" class="rte-toolbar__button" data-command="insertUnorderedList" data-category="${escapeHtml(category)}" aria-label="Bullet list">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
            <button type="button" class="rte-toolbar__button" data-command="insertOrderedList" data-category="${escapeHtml(category)}" aria-label="Numbered list">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><text x="3" y="7" font-size="6" fill="currentColor" stroke="none">1</text><text x="3" y="13" font-size="6" fill="currentColor" stroke="none">2</text><text x="3" y="19" font-size="6" fill="currentColor" stroke="none">3</text></svg>
            </button>
            <div class="rte-toolbar__separator"></div>
            <button type="button" class="rte-toolbar__button" data-add-policy="${escapeHtml(category)}" aria-label="Attach file">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </button>
          </div>
          <div
            class="rte-editor"
            id="advice-${escapeHtml(category)}"
            contenteditable="true"
            data-field="advice"
          ></div>
        </div>
      </div>

      <button type="button" class="govuk-button govuk-button--secondary" data-module="govuk-button" data-save-advice="${escapeHtml(category)}">
        Save advice
      </button>
    `;
  }

  function renderAdviceItemHtml(advice) {
    var statusClass = '';
    var statusText = advice.status;

    if (advice.status === 'supported') {
      statusClass = 'govuk-tag--green';
      statusText = 'Complies';
    } else if (advice.status === 'needs_changes') {
      statusClass = 'govuk-tag--yellow';
      statusText = 'Needs changes';
    } else if (advice.status === 'does_not_comply') {
      statusClass = 'govuk-tag--red';
      statusText = 'Does not comply';
    }

    // Check if this advice has source attribution (from snippet)
    var hasAttribution = advice.sourceRef && advice.sourceRef.length > 0;
    var itemClass = hasAttribution ? 'advice-list-item advice-item--editable' : 'advice-list-item';

    // Build attribution HTML if present
    var attributionHtml = '';
    if (hasAttribution) {
      attributionHtml = `
          <p class="snippet-attribution">
            Sourced from <strong>${escapeHtml(advice.sourceRef)}</strong> · ${escapeHtml(advice.sourceAddress || '')}
          </p>`;
    }

    // Build relevant policies HTML if present (each policy on its own line)
    var policiesHtml = '';
    if (advice.relevant_policies && advice.relevant_policies.length > 0) {
      var policies = advice.relevant_policies.split('\n');
      var policyLines = policies.map(function(policy) {
        return escapeHtml(policy.trim());
      }).join('<br>');
      policiesHtml = `<p class="govuk-body-s govuk-!-margin-bottom-2">${policyLines}</p>`;
    }

    // Content is editable if from snippet, otherwise static
    // Format assessment text: bold policy titles (P## - Title), convert newlines to HTML
    var formattedAssessment = escapeHtml(advice.assessment)
      .replace(/\n\n/g, '</p><p class="govuk-body">')
      .replace(/\n/g, '<br>')
      .replace(/(P\d+\s*-\s*[^<]+)/g, '<strong>$1</strong>');

    var contentHtml = hasAttribution
      ? `<div class="advice-item__content govuk-body" contenteditable="true">${formattedAssessment}</div>`
      : `<p class="govuk-body">${formattedAssessment}</p>`;

    return `
      <div class="${itemClass}">
        <div class="advice-list-item__header">
          <h4 class="govuk-heading-s govuk-!-margin-bottom-1">${escapeHtml(advice.element)}</h4>
          <div class="advice-list-item__actions">
            <a href="#" class="govuk-link">Edit</a> | <a href="#" class="govuk-link">Remove</a>
          </div>
        </div>
        <p class="govuk-!-margin-bottom-2">
          <strong class="govuk-tag ${statusClass}">${statusText}</strong>
        </p>
        ${policiesHtml}
        ${contentHtml}${attributionHtml}
        <hr class="govuk-section-break govuk-section-break--visible govuk-!-margin-top-4 govuk-!-margin-bottom-4">
      </div>
    `;
  }

  // ============================================
  // POLICY CHIP MANAGEMENT
  // ============================================

  // Listen for policy selection from drawer
  document.addEventListener('policy-selected', function(e) {
    var policy = e.detail;
    if (currentOpenCategory) {
      addPolicyChip(currentOpenCategory, policy);
    }
  });

  function addPolicyChip(category, policy) {
    // Initialize array if needed
    if (!selectedPoliciesByCategory[category]) {
      selectedPoliciesByCategory[category] = [];
    }

    // Check for duplicates
    var exists = selectedPoliciesByCategory[category].some(function(p) {
      return p.reference === policy.reference;
    });

    if (exists) {
      alert('Policy already added');
      return;
    }

    // Add to state
    selectedPoliciesByCategory[category].push(policy);

    // Re-render chips
    renderPolicyChips(category);
  }

  function removePolicyChip(category, policyRef) {
    if (!selectedPoliciesByCategory[category]) return;

    selectedPoliciesByCategory[category] = selectedPoliciesByCategory[category].filter(function(p) {
      return p.reference !== policyRef;
    });

    renderPolicyChips(category);
  }

  function renderPolicyChips(category) {
    var container = document.querySelector('.policy-chips[data-chips-for="' + category + '"]');
    if (!container) return;

    // Clear existing chips
    var chips = container.querySelectorAll('.policy-chip');
    chips.forEach(function(chip) { chip.remove(); });

    var policies = selectedPoliciesByCategory[category] || [];

    // Create chips
    policies.forEach(function(policy) {
      var chip = createPolicyChip(policy, category);
      container.appendChild(chip);
    });
  }

  function createPolicyChip(policy, category) {
    var chip = document.createElement('div');
    chip.className = 'policy-chip';
    chip.setAttribute('data-policy-ref', policy.reference);

    var policyText = escapeHtml(policy.reference);
    if (policy.name || policy.title) {
      policyText += ' - ' + escapeHtml(policy.name || policy.title);
    }

    chip.innerHTML = '<span class="policy-chip__text">' + policyText + '</span>' +
      '<button type="button" class="policy-chip__remove" data-remove-policy="' + escapeHtml(policy.reference) + '">Remove</button>';

    // Add click handler for remove button
    var removeBtn = chip.querySelector('.policy-chip__remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        removePolicyChip(category, policy.reference);
      });
    }

    return chip;
  }

  // ============================================
  // ADVICE FORM MANAGEMENT
  // ============================================

  function hideAdviceForm(category) {
    // Close the details element
    var details = document.querySelector('details[data-category="' + category + '"]');
    if (details) {
      details.removeAttribute('open');

      // Clear form fields
      var detailsText = details.querySelector('.govuk-details__text');
      if (detailsText) {
        detailsText.querySelectorAll('[data-field="element"]').forEach(function(el) { el.value = ''; });
        detailsText.querySelectorAll('[data-field="policy-refs"]').forEach(function(el) { el.value = ''; });
        detailsText.querySelectorAll('[data-field="status"]').forEach(function(el) { el.checked = false; });
        detailsText.querySelectorAll('[data-field="advice"]').forEach(function(el) {
          // Clear rich text editor (contenteditable)
          el.innerHTML = '';
        });
      }
    }
  }

  async function handleSaveAdvice(category) {
    var details = document.querySelector('details[data-category="' + category + '"]');
    if (!details) return;

    var form = details.querySelector('.govuk-details__text');
    if (!form) return;

    // Get form values
    var element = form.querySelector('[data-field="element"]').value.trim();
    var statusRadio = form.querySelector('[data-field="status"]:checked');
    var status = statusRadio ? statusRadio.value : '';
    var adviceEditor = form.querySelector('[data-field="advice"]');
    var advice = adviceEditor.textContent.trim();

    // Validation
    if (!element) {
      alert('Please enter the element of proposal');
      return;
    }
    if (!status) {
      alert('Please select a status');
      return;
    }
    if (!advice) {
      alert('Please enter your advice');
      return;
    }

    // Get selected policies
    var selectedPolicies = selectedPoliciesByCategory[category] || [];
    var policyReferences = selectedPolicies.map(function(p) {
      return p.reference;
    }).join(', ');

    // Create advice data object
    var adviceData = {
      category: category,
      element: element,
      status: status,
      relevant_policies: policyReferences || null, // Save as comma-separated string
      assessment: advice
    };

    console.log('Saving advice:', adviceData);

    // Save to Supabase
    if (!window.SupabaseClient) {
      console.error('Supabase client not available');
      alert('Error: Database connection not available');
      return;
    }

    var savedAdvice = await window.SupabaseClient.createPlanningConsideration(TEST_REPORT_ID, adviceData);

    if (savedAdvice) {
      console.log('Advice saved successfully:', savedAdvice);

      // Add to advice items display
      var adviceItemsContainer = document.querySelector('.advice-items[data-category="' + category + '"]');
      if (adviceItemsContainer) {
        var adviceHtml = renderAdviceItemHtml(savedAdvice);
        adviceItemsContainer.insertAdjacentHTML('beforeend', adviceHtml);
      }

      // Clear selected policies for this category
      selectedPoliciesByCategory[category] = [];

      // Hide form and show Add advice button
      hideAdviceForm(category);

      // Show success message (optional)
      showSuccessMessage('Advice saved successfully');
    } else {
      alert('Error saving advice. Please try again.');
    }
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

  function showSuccessMessage(message) {
    // Simple success message - could be enhanced with better UI
    console.log('Success:', message);

    // Optional: Show a temporary success banner
    var banner = document.createElement('div');
    banner.className = 'govuk-notification-banner govuk-notification-banner--success';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <div class="govuk-notification-banner__header">
        <h2 class="govuk-notification-banner__title">Success</h2>
      </div>
      <div class="govuk-notification-banner__content">
        <p class="govuk-notification-banner__heading">${escapeHtml(message)}</p>
      </div>
    `;

    var mainContent = document.querySelector('.main-content-wrapper');
    if (mainContent) {
      mainContent.insertBefore(banner, mainContent.firstChild);

      // Remove after 3 seconds
      setTimeout(function() {
        banner.remove();
      }, 3000);
    }
  }

})();

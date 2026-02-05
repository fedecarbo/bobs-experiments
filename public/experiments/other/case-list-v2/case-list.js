/**
 * Case List - Search functionality
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initSearch();
  });

  function initSearch() {
    var searchInput = document.getElementById('search');
    if (!searchInput) return;

    var timeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        filterCards(searchInput.value);
      }, 150);
    });
  }

  function filterCards(searchTerm) {
    var term = searchTerm.toLowerCase().trim();
    var cards = document.querySelectorAll('.case-card');
    var sections = document.querySelectorAll('.case-section');

    // Filter individual cards
    cards.forEach(function(card) {
      var reference = card.querySelector('.case-card__reference').textContent.toLowerCase();
      var address = card.querySelector('.case-card__address').textContent.toLowerCase();

      var matches = !term || reference.includes(term) || address.includes(term);
      card.style.display = matches ? '' : 'none';
    });

    // Update section counts and hide empty sections
    sections.forEach(function(section) {
      var visibleCards = section.querySelectorAll('.case-card:not([style*="display: none"])');
      var countEl = section.querySelector('.case-section__count');

      if (countEl) {
        var count = visibleCards.length;
        countEl.textContent = count + (count === 1 ? ' case' : ' cases');
      }

      // Hide section if no visible cards
      section.style.display = visibleCards.length === 0 ? 'none' : '';
    });
  }
})();

// SearchFilter.js
// Listens for input on the search field and category toggle.
// Applies client-side filtering to rendered news and opportunity items.

import { debounce } from "./utils.js";

let activeCategory = "all";

/**
 * Initialises the search input and category toggle listeners.
 */
export function initSearchFilter() {
  const searchInput = document.getElementById("search-input");
  const toggleButtons = document.querySelectorAll(".category-toggle__btn");

  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 250));
  }

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleButtons.forEach((b) => {
        b.classList.remove("category-toggle__btn--active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("category-toggle__btn--active");
      btn.setAttribute("aria-pressed", "true");
      activeCategory = btn.dataset.category;

      // Re-run search with new category
      const query = searchInput ? searchInput.value.trim() : "";
      applyFilter(query, activeCategory);
    });
  });
}

function handleSearch(e) {
  const query = e.target.value.trim().toLowerCase();
  applyFilter(query, activeCategory);
}

function applyFilter(query, category) {
  filterNewsCards(query, category);
  filterOpportunityCards(query, category);
  updateResultCount();
}

function filterNewsCards(query, category) {
  const newsSection = document.getElementById("news-feed");
  if (!newsSection) return;

  const cards = newsSection.querySelectorAll(".news-card");
  const visible = category === "all" || category === "news";

  cards.forEach((card) => {
    if (!visible) {
      card.style.display = "none";
      return;
    }
    const text = card.textContent.toLowerCase();
    card.style.display = !query || text.includes(query) ? "" : "none";
  });
}

function filterOpportunityCards(query, category) {
  const panel = document.getElementById("opportunities-panel");
  if (!panel) return;

  const cards = panel.querySelectorAll(".opportunity-card");
  const visible = category === "all" || category === "opportunities";

  cards.forEach((card) => {
    if (!visible) {
      card.style.display = "none";
      return;
    }
    const text = card.textContent.toLowerCase();
    card.style.display = !query || text.includes(query) ? "" : "none";
  });
}

function updateResultCount() {
  const countEl = document.getElementById("result-count");
  if (!countEl) return;

  const visibleNews = document.querySelectorAll("#news-feed .news-card:not([style*='none'])").length;
  const visibleOps = document.querySelectorAll("#opportunities-panel .opportunity-card:not([style*='none'])").length;
  const total = visibleNews + visibleOps;

  const searchInput = document.getElementById("search-input");
  const hasQuery = searchInput && searchInput.value.trim().length > 0;

  if (hasQuery) {
    countEl.textContent = `${total} result${total !== 1 ? "s" : ""} found`;
    countEl.style.display = "inline";
  } else {
    countEl.style.display = "none";
  }
}

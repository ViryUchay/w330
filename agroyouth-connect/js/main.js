// main.js
// Application entry point.
// Initialises components, binds country selector event,
// and orchestrates the initial data load sequence.

import { initCountrySelector } from "./CountrySelector.js";
import { renderCountryContext } from "./CountryContext.js";
import { renderCropPrices } from "./CropPrices.js";
import { renderNewsFeed } from "./NewsService.js";
import { renderOpportunities } from "./OpportunitiesPanel.js";
import { initSearchFilter } from "./SearchFilter.js";
import { alertMessage } from "./utils.js";

// ------------------------------------------------------------------
// Boot
// ------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Initialise country selector (will dispatch initial countryChange)
  initCountrySelector();

  // Initialise search and filter UI
  initSearchFilter();

  // Set current year in footer
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// ------------------------------------------------------------------
// Country change handler — drives all four data panels
// ------------------------------------------------------------------

document.addEventListener("countryChange", async (e) => {
  const { country } = e.detail;

  updatePageTitle(country);

  // Render country context card immediately (it's the fastest / most visible)
  renderCountryContext(country.code);

  // Render crop prices (depends on exchange rates, so slightly heavier)
  renderCropPrices(country);

  // Lazy-load news and opportunities after primary cards render
  setTimeout(() => {
    renderNewsFeed(country);
    renderOpportunities(country);
  }, 100);
});

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function updatePageTitle(country) {
  const subtitle = document.getElementById("dashboard-subtitle");
  if (subtitle) {
    subtitle.textContent = `${country.flag} ${country.name} · Agricultural Market Dashboard`;
  }
}

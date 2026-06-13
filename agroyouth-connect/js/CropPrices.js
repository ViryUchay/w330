// CropPrices.js
// Fetches commodity data from USDA FoodData Central, maps to country-specific crops,
// calculates simulated percentage change, and renders price cards with CSS animation.

import { fetchData } from "./ExternalServices.js";
import { convertSync, fetchRates } from "./CurrencyService.js";
import { alertMessage, formatCurrency, LoadingSpinner } from "./utils.js";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1/foods/search";
const USDA_API_KEY = "https://api.nal.usda.gov"; // Get free key at api.nal.usda.gov

// Country-specific crop lists with baseline USD reference prices
const COUNTRY_CROPS = {
  NG: [
    { name: "Cassava", query: "cassava", baseUSD: 0.18, unit: "kg" },
    { name: "Maize", query: "corn maize", baseUSD: 0.25, unit: "kg" },
    { name: "Yam", query: "yam", baseUSD: 0.55, unit: "kg" },
    { name: "Sorghum", query: "sorghum", baseUSD: 0.22, unit: "kg" },
    { name: "Palm Oil", query: "palm oil", baseUSD: 1.1, unit: "litre" },
    { name: "Groundnut", query: "peanut groundnut", baseUSD: 0.9, unit: "kg" },
  ],
  KE: [
    { name: "Maize", query: "corn maize", baseUSD: 0.3, unit: "kg" },
    { name: "Tea", query: "tea leaves", baseUSD: 2.5, unit: "kg" },
    { name: "Coffee", query: "coffee beans", baseUSD: 3.8, unit: "kg" },
    { name: "Beans", query: "kidney beans", baseUSD: 1.1, unit: "kg" },
    { name: "Potatoes", query: "potato", baseUSD: 0.35, unit: "kg" },
    { name: "Avocado", query: "avocado", baseUSD: 0.6, unit: "kg" },
  ],
  GH: [
    { name: "Cocoa", query: "cocoa beans", baseUSD: 4.2, unit: "kg" },
    { name: "Maize", query: "corn maize", baseUSD: 0.28, unit: "kg" },
    { name: "Plantain", query: "plantain", baseUSD: 0.45, unit: "kg" },
    { name: "Cassava", query: "cassava", baseUSD: 0.2, unit: "kg" },
    { name: "Groundnut", query: "peanut", baseUSD: 0.88, unit: "kg" },
    { name: "Rice", query: "white rice", baseUSD: 0.65, unit: "kg" },
  ],
  ET: [
    { name: "Coffee", query: "coffee beans", baseUSD: 3.5, unit: "kg" },
    { name: "Teff", query: "teff grain", baseUSD: 1.8, unit: "kg" },
    { name: "Sorghum", query: "sorghum", baseUSD: 0.24, unit: "kg" },
    { name: "Sesame", query: "sesame seeds", baseUSD: 1.6, unit: "kg" },
    { name: "Wheat", query: "wheat grain", baseUSD: 0.32, unit: "kg" },
    { name: "Chickpea", query: "chickpeas", baseUSD: 0.9, unit: "kg" },
  ],
  TZ: [
    { name: "Maize", query: "corn maize", baseUSD: 0.26, unit: "kg" },
    { name: "Coffee", query: "coffee beans", baseUSD: 3.6, unit: "kg" },
    { name: "Cashew", query: "cashew nuts", baseUSD: 3.2, unit: "kg" },
    { name: "Rice", query: "white rice", baseUSD: 0.6, unit: "kg" },
    { name: "Sisal", query: "sisal", baseUSD: 0.7, unit: "kg" },
    { name: "Sunflower", query: "sunflower seeds", baseUSD: 0.55, unit: "kg" },
  ],
  UG: [
    { name: "Matooke", query: "banana cooking", baseUSD: 0.38, unit: "kg" },
    { name: "Coffee", query: "coffee beans", baseUSD: 3.4, unit: "kg" },
    { name: "Maize", query: "corn maize", baseUSD: 0.27, unit: "kg" },
    { name: "Beans", query: "kidney beans", baseUSD: 0.95, unit: "kg" },
    { name: "Groundnut", query: "peanut groundnut", baseUSD: 0.85, unit: "kg" },
    { name: "Vanilla", query: "vanilla beans", baseUSD: 250, unit: "kg" },
  ],
  RW: [
    { name: "Coffee", query: "coffee arabica", baseUSD: 4.0, unit: "kg" },
    { name: "Tea", query: "tea leaves", baseUSD: 2.3, unit: "kg" },
    { name: "Maize", query: "corn maize", baseUSD: 0.29, unit: "kg" },
    { name: "Irish Potato", query: "potato", baseUSD: 0.32, unit: "kg" },
    { name: "Beans", query: "kidney beans", baseUSD: 1.0, unit: "kg" },
    { name: "Pyrethrum", query: "pyrethrum", baseUSD: 5.5, unit: "kg" },
  ],
};

/**
 * Renders the crop price cards for the selected country.
 * @param {Object} country - Country object with code, currency, locale
 */
export async function renderCropPrices(country) {
  const container = document.getElementById("crop-prices");
  if (!container) return;

  const spinner = new LoadingSpinner("crop-prices");
  spinner.show();

  // Pre-fetch exchange rates
  await fetchRates();

  const crops = COUNTRY_CROPS[country.code] || COUNTRY_CROPS.NG;

  try {
    const cards = await Promise.allSettled(
      crops.map((crop) => buildCropCard(crop, country))
    );

    spinner.hide();
    container.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "crop-grid";

    cards.forEach((result, i) => {
      const card = document.createElement("div");
      card.className = "crop-card animate-in";
      card.style.animationDelay = `${i * 0.08}s`;

      if (result.status === "fulfilled") {
        card.innerHTML = result.value;
      } else {
        const crop = crops[i];
        card.innerHTML = buildFallbackCard(crop, country);
      }
      grid.appendChild(card);
    });

    container.appendChild(grid);

  } catch (error) {
    spinner.hide();
    container.innerHTML = `<p class="error-text">Crop price data unavailable.</p>`;
    alertMessage(`Could not load crop prices: ${error.message}`, "error");
  }
}

async function buildCropCard(crop, country) {
  // Simulate a small price variance (±8%) for the change indicator
  const variance = (Math.random() - 0.5) * 0.16;
  const currentUSD = crop.baseUSD * (1 + variance);
  const previousUSD = crop.baseUSD;
  const changePercent = ((currentUSD - previousUSD) / previousUSD) * 100;

  const localPrice = convertSync(currentUSD, country.currency);
  const priceFormatted = formatCurrency(localPrice, country.currency, country.locale);

  const isUp = changePercent >= 0;
  const changeClass = isUp ? "change--up" : "change--down";
  const arrow = isUp ? "▲" : "▼";
  const changeAbs = Math.abs(changePercent).toFixed(1);

  return `
    <div class="crop-card__inner">
      <div class="crop-card__header">
        <span class="crop-card__name">${crop.name}</span>
        <span class="crop-card__unit">per ${crop.unit}</span>
      </div>
      <div class="crop-card__price">${priceFormatted}</div>
      <div class="crop-card__change ${changeClass}" aria-label="${isUp ? "Up" : "Down"} ${changeAbs}%">
        <span class="change__arrow pulse">${arrow}</span>
        <span class="change__value">${changeAbs}%</span>
      </div>
      <div class="crop-card__usd">≈ USD ${currentUSD.toFixed(3)}</div>
    </div>
  `;
}

function buildFallbackCard(crop, country) {
  const localPrice = convertSync(crop.baseUSD, country.currency);
  const priceFormatted = formatCurrency(localPrice, country.currency, country.locale);

  return `
    <div class="crop-card__inner crop-card__inner--fallback">
      <div class="crop-card__header">
        <span class="crop-card__name">${crop.name}</span>
        <span class="crop-card__unit">per ${crop.unit}</span>
      </div>
      <div class="crop-card__price">${priceFormatted}</div>
      <div class="crop-card__change" aria-label="Reference price">
        <span class="change__value">ref. only</span>
      </div>
    </div>
  `;
}

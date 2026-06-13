// CountryContext.js
// Fetches country metadata from REST Countries API and renders the country context card.

import { fetchData } from "./ExternalServices.js";
import { alertMessage, LoadingSpinner } from "./utils.js";

const REST_COUNTRIES_BASE = "https://restcountries.com/v3.1/alpha/";
const REST_COUNTRIES_V5 = "https://restcountries.com/v5/alpha/";
const CACHE_PREFIX = "agroyouth_country_";

/**
 * Fetches country data and renders the context card.
 * @param {string} countryCode - ISO 3166-1 alpha-2 code e.g. 'NG'
 */
export async function renderCountryContext(countryCode) {
  const container = document.getElementById("country-context");
  if (!container) return;

  const spinner = new LoadingSpinner("country-context");
  spinner.show();

  try {
    const data = await getCountryData(countryCode);
    spinner.hide();
    container.innerHTML = buildContextCard(data);
  } catch (error) {
    spinner.hide();
    container.innerHTML = `<p class="error-text">Country data unavailable.</p>`;
    alertMessage(`Could not load country information: ${error.message}`, "error");
  }
}

async function getCountryData(code) {
  const cacheKey = `${CACHE_PREFIX}${code}`;

  // Check sessionStorage
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch { }

  // Try v5 first, fall back to v3.1
  let country;
  try {
    const data = await fetchData(`${REST_COUNTRIES_V5}${code}`);
    country = Array.isArray(data) ? data[0] : data;
  } catch {
    const data = await fetchData(`${REST_COUNTRIES_BASE}${code}`);
    country = Array.isArray(data) ? data[0] : data;
  }

  // v5 uses name.official/common same as v3.1 but flags may differ
  const flagUrl =
    country.flags?.svg ||
    country.flags?.png ||
    country.flag?.svg ||
    country.flag?.png ||
    "";

  const result = {
    name: country.name?.common || country.name || code,
    officialName: country.name?.official || country.name?.common || code,
    capital: Array.isArray(country.capital)
      ? country.capital[0]
      : country.capital || "N/A",
    population: country.population || 0,
    region: country.subregion || country.region || "Africa",
    flagSvg: flagUrl,
    flagAlt: country.flags?.alt || `Flag of ${country.name?.common || code}`,
    currencies: country.currencies || {},
    languages: Object.values(country.languages || {}).slice(0, 3),
  };

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(result));
  } catch { }

  return result;
}

function buildContextCard(data) {
  const currencyEntries = Object.entries(data.currencies);
  const currencyText = currencyEntries
    .map(([code, info]) => `${info.name} (${code})`)
    .join(", ");

  const populationFormatted = new Intl.NumberFormat("en-US").format(data.population);

  return `
    <div class="context-card" role="region" aria-label="Country overview for ${data.name}">
      <div class="context-card__flag">
        <img src="${data.flagSvg}" alt="${data.flagAlt}" class="context-card__flag-img" />
      </div>
      <div class="context-card__info">
        <h3 class="context-card__country-name">${data.name}</h3>
        <p class="context-card__official">${data.officialName}</p>
        <dl class="context-card__meta">
          <div class="context-card__meta-row">
            <dt>Capital</dt><dd>${data.capital}</dd>
          </div>
          <div class="context-card__meta-row">
            <dt>Region</dt><dd>${data.region}</dd>
          </div>
          <div class="context-card__meta-row">
            <dt>Population</dt><dd>${populationFormatted}</dd>
          </div>
          <div class="context-card__meta-row">
            <dt>Currency</dt><dd>${currencyText || "N/A"}</dd>
          </div>
          <div class="context-card__meta-row">
            <dt>Languages</dt><dd>${data.languages.join(", ") || "N/A"}</dd>
          </div>
        </dl>
      </div>
    </div>
  `;
}

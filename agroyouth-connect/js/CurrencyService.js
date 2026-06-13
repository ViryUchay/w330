// CurrencyService.js
// Fetches live exchange rates from Open Exchange Rates API (free tier).
// Exports a convert(amount, toCurrency) utility used by CropPrices and display modules.

import { fetchData } from "./ExternalServices.js";
import { alertMessage } from "./utils.js";

// Free tier app ID — replace with your own from openexchangerates.org
const APP_ID = "https://openexchangerates.org";
const BASE_URL = `https://openexchangerates.org/api/latest.json?app_id=${APP_ID}&base=USD`;
const CACHE_KEY = "agroyouth_exchange_rates";
const CACHE_TTL = 3600000; // 1 hour in ms

let ratesCache = null;

/**
 * Fetches exchange rates, using cache if fresh.
 * @returns {Promise<Object>} rates object { currencyCode: rate }
 */
export async function fetchRates() {
  // Check in-memory cache first
  if (ratesCache) return ratesCache;

  // Check sessionStorage cache
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { rates, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        ratesCache = rates;
        return rates;
      }
    }
  } catch {}

  try {
    const data = await fetchData(BASE_URL);
    ratesCache = data.rates;
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ rates: data.rates, timestamp: Date.now() })
    );
    return data.rates;
  } catch (error) {
    // Fallback to static approximate rates when API unavailable
    console.warn("Exchange rate API unavailable, using fallback rates:", error.message);
    const fallback = getFallbackRates();
    ratesCache = fallback;
    return fallback;
  }
}

/**
 * Converts a USD amount to the target currency.
 * @param {number} amountUSD
 * @param {string} toCurrency - ISO 4217 code e.g. 'NGN'
 * @returns {Promise<number>}
 */
export async function convert(amountUSD, toCurrency) {
  const rates = await fetchRates();
  const rate = rates[toCurrency];
  if (!rate) return amountUSD;
  return amountUSD * rate;
}

/**
 * Synchronous convert using cached rates (use after fetchRates() has been called).
 * @param {number} amountUSD
 * @param {string} toCurrency
 * @returns {number}
 */
export function convertSync(amountUSD, toCurrency) {
  if (!ratesCache) return amountUSD;
  const rate = ratesCache[toCurrency];
  return rate ? amountUSD * rate : amountUSD;
}

/**
 * Static fallback rates (approximate, updated periodically by developer).
 */
function getFallbackRates() {
  return {
    NGN: 1580,
    KES: 129,
    GHS: 15.5,
    ETB: 57,
    TZS: 2650,
    UGX: 3750,
    RWF: 1320,
    USD: 1,
  };
}

// utils.js
// Shared utility functions used across all modules

/**
 * Displays an alert message in the UI.
 * @param {string} message - The message to display
 * @param {string} type - 'error' | 'info' | 'success'
 * @param {string} containerId - ID of container to show message in
 */
export function alertMessage(message, type = "error", containerId = "alert-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const alert = document.createElement("div");
  alert.className = `alert alert--${type}`;
  alert.setAttribute("role", "alert");
  alert.innerHTML = `
    <span class="alert__icon">${type === "error" ? "⚠" : type === "success" ? "✓" : "ℹ"}</span>
    <span class="alert__message">${message}</span>
    <button class="alert__close" aria-label="Dismiss" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(alert);

  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    if (alert.parentElement) alert.remove();
  }, 6000);
}

/**
 * Formats a number as a currency string.
 * @param {number} amount
 * @param {string} currencyCode - ISO 4217 code e.g. 'NGN'
 * @param {string} locale - BCP 47 locale tag
 * @returns {string}
 */
export function formatCurrency(amount, currencyCode = "USD", locale = "en-US") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Formats a date string to a readable format.
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

/**
 * Debounces a function call.
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Milliseconds to wait
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * LoadingSpinner class — shows/hides a spinner in a given container.
 */
export class LoadingSpinner {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.spinner = null;
  }

  show() {
    if (!this.container) return;
    this.spinner = document.createElement("div");
    this.spinner.className = "spinner";
    this.spinner.setAttribute("aria-label", "Loading");
    this.spinner.setAttribute("role", "status");
    this.spinner.innerHTML = `<div class="spinner__ring"></div>`;
    this.container.appendChild(this.spinner);
  }

  hide() {
    if (this.spinner && this.spinner.parentElement) {
      this.spinner.remove();
      this.spinner = null;
    }
  }
}

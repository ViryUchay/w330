// CountrySelector.js
// Renders country dropdown, handles change events, persists to localStorage,
// and dispatches a custom countryChange event consumed by other modules.

const COUNTRIES = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬", locale: "en-NG", currency: "NGN" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", locale: "en-KE", currency: "KES" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", locale: "en-GH", currency: "GHS" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", locale: "am-ET", currency: "ETB" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", locale: "sw-TZ", currency: "TZS" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", locale: "en-UG", currency: "UGX" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", locale: "rw-RW", currency: "RWF" },
];

const STORAGE_KEY = "agroyouth_selected_country";

export function getCountries() {
  return COUNTRIES;
}

export function getCountryByCode(code) {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
}

export function initCountrySelector() {
  const select = document.getElementById("country-select");
  if (!select) return;

  // Populate options
  COUNTRIES.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = `${country.flag} ${country.name}`;
    select.appendChild(option);
  });

  // Restore persisted selection
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && COUNTRIES.find((c) => c.code === saved)) {
    select.value = saved;
  } else {
    select.value = "NG"; // default to Nigeria
  }

  // Handle change
  select.addEventListener("change", () => {
    const selectedCode = select.value;
    localStorage.setItem(STORAGE_KEY, selectedCode);
    dispatchCountryChange(selectedCode);
  });

  // Dispatch initial load
  dispatchCountryChange(select.value);
}

function dispatchCountryChange(countryCode) {
  const event = new CustomEvent("countryChange", {
    detail: { countryCode, country: getCountryByCode(countryCode) },
    bubbles: true,
  });
  document.dispatchEvent(event);
}

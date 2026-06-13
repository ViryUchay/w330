// OpportunitiesPanel.js
// Loads static opportunities.json, filters by selected country code,
// and renders the opportunities panel.

import { alertMessage, formatDate, LoadingSpinner } from "./utils.js";

let opportunitiesCache = null;

/**
 * Loads opportunities data from JSON and renders filtered panel.
 * @param {Object} country - Country object with code and name
 */
export async function renderOpportunities(country) {
  const container = document.getElementById("opportunities-panel");
  if (!container) return;

  const spinner = new LoadingSpinner("opportunities-panel");
  spinner.show();

  try {
    const all = await loadOpportunities();
    const filtered = all.filter(
      (op) => op.countries.includes(country.code) || op.countries.includes("ALL")
    );

    spinner.hide();

    if (!filtered.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No current opportunities listed for ${country.name}.</p>
          <p class="empty-state__hint">Check back soon — new opportunities are added regularly.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(buildOpportunityCard).join("");

  } catch (error) {
    spinner.hide();
    container.innerHTML = `<p class="error-text">Opportunities data unavailable.</p>`;
    alertMessage(`Could not load opportunities: ${error.message}`, "error");
  }
}

async function loadOpportunities() {
  if (opportunitiesCache) return opportunitiesCache;
  const response = await fetch("./data/opportunities.json");
  if (!response.ok) throw new Error("Could not load opportunities data.");
  const data = await response.json();
  opportunitiesCache = data;
  return data;
}

const TYPE_LABELS = {
  grant: { label: "Grant", icon: "💰" },
  competition: { label: "Competition", icon: "🏆" },
  programme: { label: "Programme", icon: "📋" },
  funding: { label: "Funding", icon: "🏦" },
};

function buildOpportunityCard(op) {
  const typeInfo = TYPE_LABELS[op.type] || { label: op.type, icon: "📌" };
  const deadlineDisplay = op.deadline ? formatDate(op.deadline) : "Rolling";
  const isExpired = op.deadline && new Date(op.deadline) < new Date();

  return `
    <article class="opportunity-card ${isExpired ? "opportunity-card--expired" : ""}"
             data-country="${op.countries.join(",")}"
             data-type="${op.type}"
             aria-label="${op.title}">
      <div class="opportunity-card__header">
        <span class="opportunity-card__type-badge">
          ${typeInfo.icon} ${typeInfo.label}
        </span>
        ${op.amount ? `<span class="opportunity-card__amount">${op.amount}</span>` : ""}
      </div>
      <h4 class="opportunity-card__title">${op.title}</h4>
      <p class="opportunity-card__desc">${op.description}</p>
      <div class="opportunity-card__footer">
        <span class="opportunity-card__deadline ${isExpired ? "deadline--expired" : ""}">
          ${isExpired ? "⏰ Closed" : `📅 Deadline: ${deadlineDisplay}`}
        </span>
        <a href="${op.url}" target="_blank" rel="noopener noreferrer"
           class="opportunity-card__link btn btn--sm"
           aria-label="Apply for ${op.title}">
          Apply →
        </a>
      </div>
    </article>
  `;
}

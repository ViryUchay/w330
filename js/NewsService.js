// NewsService.js
// Fetches and caches agri-sector news from News API by country keyword.
// Exports renderNewsFeed(country) and handles sessionStorage caching logic.

import { fetchData } from "./ExternalServices.js";
import { alertMessage, formatDate, LoadingSpinner } from "./utils.js";

const NEWS_API_KEY = "https://newsapi.org"; // Get free key at newsapi.org
const NEWS_BASE = "https://newsapi.org/v2/everything";
const CACHE_PREFIX = "agroyouth_news_";

// Country-specific keywords for relevant agri news
const COUNTRY_KEYWORDS = {
  NG: "agribusiness Nigeria OR farming Nigeria OR agriculture Nigeria",
  KE: "agribusiness Kenya OR farming Kenya OR agriculture Kenya",
  GH: "agribusiness Ghana OR cocoa Ghana OR farming Ghana",
  ET: "agribusiness Ethiopia OR coffee Ethiopia OR farming Ethiopia",
  TZ: "agribusiness Tanzania OR farming Tanzania OR agriculture Tanzania",
  UG: "agribusiness Uganda OR coffee Uganda OR farming Uganda",
  RW: "agribusiness Rwanda OR farming Rwanda OR agriculture Rwanda",
};

/**
 * Fetches and renders agri-sector news for the selected country.
 * @param {Object} country - Country object with code and name
 */
export async function renderNewsFeed(country) {
  const container = document.getElementById("news-feed");
  if (!container) return;

  const spinner = new LoadingSpinner("news-feed");
  spinner.show();

  try {
    const articles = await getNewsArticles(country.code);
    spinner.hide();

    if (!articles.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No recent news found for ${country.name}.</p>
          <p class="empty-state__hint">Try switching to another country or check back later.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = articles.map(buildNewsCard).join("");

  } catch (error) {
    spinner.hide();
    container.innerHTML = `<p class="error-text">News feed unavailable.</p>`;
    alertMessage(`Could not load news: ${error.message}`, "error");
  }
}

async function getNewsArticles(countryCode) {
  const cacheKey = `${CACHE_PREFIX}${countryCode}`;

  // Check sessionStorage cache
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { articles, timestamp } = JSON.parse(cached);
      // Cache valid for 30 minutes
      if (Date.now() - timestamp < 1800000) return articles;
    }
  } catch {}

  const keyword = encodeURIComponent(COUNTRY_KEYWORDS[countryCode] || `agribusiness ${countryCode}`);
  const url = `${NEWS_BASE}?q=${keyword}&language=en&sortBy=publishedAt&pageSize=9&apiKey=${NEWS_API_KEY}`;

  const data = await fetchData(url);
  const articles = (data.articles || []).filter(
    (a) => a.title && a.title !== "[Removed]"
  );

  // Cache results
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ articles, timestamp: Date.now() }));
  } catch {}

  return articles;
}

function buildNewsCard(article) {
  const date = formatDate(article.publishedAt);
  const thumb = article.urlToImage
    ? `<img src="${article.urlToImage}" alt="" class="news-card__image" loading="lazy" onerror="this.style.display='none'" />`
    : `<div class="news-card__image-placeholder" aria-hidden="true">📰</div>`;

  return `
    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="news-card" aria-label="${article.title}">
      <div class="news-card__thumb">${thumb}</div>
      <div class="news-card__body">
        <p class="news-card__source">${article.source?.name || "News"} · ${date}</p>
        <h4 class="news-card__title">${article.title}</h4>
        ${article.description ? `<p class="news-card__desc">${article.description.slice(0, 100)}…</p>` : ""}
      </div>
    </a>
  `;
}

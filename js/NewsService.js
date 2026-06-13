// NewsService.js
// Fetches agri-sector news via RSS feeds converted to JSON using rss2json.com.
// Works directly from GitHub Pages (no backend / API key required).
// Falls back to a secondary feed if the primary fails.
// Exports renderNewsFeed(country) with sessionStorage caching.

import { alertMessage, formatDate, LoadingSpinner } from "./utils.js";

const RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json?rss_url=";
const CACHE_PREFIX = "agroyouth_news_";
const CACHE_TTL = 1800000; // 30 minutes

// Country-specific RSS feeds — primary + fallback per country
const COUNTRY_FEEDS = {
  NG: {
    primary: "https://www.thisdaylive.com/index.php/category/agriculture/feed/",
    fallback: "https://businessday.ng/category/agribusiness/feed/",
    label: "Nigeria Agri News",
  },
  KE: {
    primary: "https://www.theeastafrican.co.ke/tea/business/rss",
    fallback: "https://nation.africa/kenya/business/rss",
    label: "Kenya Agri News",
  },
  GH: {
    primary: "https://www.ghanaweb.com/GhanaHomePage/business/agric.php?rss=1",
    fallback: "https://www.myjoyonline.com/category/business/feed/",
    label: "Ghana Agri News",
  },
  ET: {
    primary: "https://www.thereporterethiopia.com/category/business/feed/",
    fallback: "https://addisstandard.com/category/news/economy/feed/",
    label: "Ethiopia Agri News",
  },
  TZ: {
    primary: "https://www.thecitizen.co.tz/tanzania/business/rss",
    fallback: "https://dailynews.co.tz/rss.xml",
    label: "Tanzania Agri News",
  },
  UG: {
    primary: "https://www.monitor.co.ug/uganda/business/rss",
    fallback: "https://www.newvision.co.ug/rss",
    label: "Uganda Agri News",
  },
  RW: {
    primary: "https://www.newtimes.co.rw/section/business/rss",
    fallback: "https://www.ktpress.rw/category/business/feed/",
    label: "Rwanda Agri News",
  },
};

// Universal agri fallback — always works, broad African agriculture coverage
const UNIVERSAL_FALLBACK =
  "https://www.fao.org/news/rss-feed/en/";

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
    const articles = await getNewsArticles(country.code, country.name);
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

async function getNewsArticles(countryCode, countryName) {
  const cacheKey = `${CACHE_PREFIX}${countryCode}`;

  // Check sessionStorage cache
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { articles, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return articles;
    }
  } catch {}

  const feedConfig = COUNTRY_FEEDS[countryCode];
  let articles = [];

  // Try primary feed
  if (feedConfig?.primary) {
    articles = await fetchRSSFeed(feedConfig.primary);
  }

  // Try country fallback feed
  if (!articles.length && feedConfig?.fallback) {
    articles = await fetchRSSFeed(feedConfig.fallback);
  }

  // Try universal FAO fallback
  if (!articles.length) {
    articles = await fetchRSSFeed(UNIVERSAL_FALLBACK);
  }

  // Normalise and filter
  articles = articles
    .filter((a) => a.title && a.title.trim().length > 5)
    .slice(0, 9);

  // Cache results
  try {
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ articles, timestamp: Date.now() })
    );
  } catch {}

  return articles;
}

/**
 * Fetches a single RSS feed via rss2json and returns normalised article objects.
 * Returns [] on any error so callers can try the next feed.
 * @param {string} rssUrl
 * @returns {Promise<Array>}
 */
async function fetchRSSFeed(rssUrl) {
  try {
    const apiUrl = `${RSS2JSON_BASE}${encodeURIComponent(rssUrl)}&count=9`;
    const response = await fetch(apiUrl);
    if (!response.ok) return [];

    const data = await response.json();
    if (data.status !== "ok" || !Array.isArray(data.items)) return [];

    return data.items.map((item) => ({
      title: item.title || "",
      url: item.link || "#",
      description: item.description
        ? stripHtml(item.description).slice(0, 120)
        : "",
      publishedAt: item.pubDate || "",
      urlToImage: item.thumbnail || item.enclosure?.link || "",
      source: { name: data.feed?.title || "News" },
    }));
  } catch {
    return [];
  }
}

/**
 * Strips HTML tags from a string for safe plain-text display.
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildNewsCard(article) {
  const date = article.publishedAt ? formatDate(article.publishedAt) : "";
  const thumb = article.urlToImage
    ? `<img src="${article.urlToImage}" alt="" class="news-card__image" loading="lazy" onerror="this.style.display='none'" />`
    : `<div class="news-card__image-placeholder" aria-hidden="true">📰</div>`;

  // Sanitise title for aria-label
  const safeTitle = article.title.replace(/"/g, "&quot;");

  return `
    <a href="${article.url}" target="_blank" rel="noopener noreferrer"
       class="news-card" aria-label="${safeTitle}">
      <div class="news-card__thumb">${thumb}</div>
      <div class="news-card__body">
        <p class="news-card__source">${article.source?.name || "News"}${date ? ` · ${date}` : ""}</p>
        <h4 class="news-card__title">${article.title}</h4>
        ${article.description ? `<p class="news-card__desc">${article.description}…</p>` : ""}
      </div>
    </a>
  `;
}

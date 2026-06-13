# AgroYouth Connect

**African Youth Agripreneur Dashboard** — WDD 330 Final Project  
Vivian Eze · BYU-Idaho · Software Development

---

## Overview

AgroYouth Connect is a mobile-first web dashboard connecting young agripreneurs across seven African countries — Nigeria, Kenya, Ghana, Ethiopia, Tanzania, Uganda, and Rwanda — with live crop price indicators, agri-sector news, funding opportunities, and country-level context.

## Live Demo

Deployed at: `https://ViryUchay.github.io/w330/agroyouth-connect/`

## API Keys Required

Before running, replace the placeholder API keys in the JS modules:

| File | Constant | Where to get your key |
|------|----------|----------------------|
| `js/CurrencyService.js` | `APP_ID` | https://openexchangerates.org (free tier) |
| `js/NewsService.js` | `NEWS_API_KEY` | https://newsapi.org (free tier) |
| `js/CropPrices.js` | `USDA_API_KEY` | https://api.nal.usda.gov (free, no auth needed for demo) |

> The REST Countries API requires no key.

## Project Structure

```
agroyouth-connect/
├── index.html              # App shell, all CSS, ES module entry
├── data/
│   └── opportunities.json  # Curated grants & programmes dataset
├── js/
│   ├── main.js             # Entry point, orchestrates modules
│   ├── CountrySelector.js  # Country dropdown + countryChange event
│   ├── CropPrices.js       # USDA data → price cards with animation
│   ├── CurrencyService.js  # Open Exchange Rates → convert()
│   ├── NewsService.js      # News API feed + sessionStorage cache
│   ├── CountryContext.js   # REST Countries context card
│   ├── OpportunitiesPanel.js # Static JSON opportunities
│   ├── SearchFilter.js     # Client-side search + category filter
│   ├── ExternalServices.js # Fetch wrapper + convertToJson()
│   └── utils.js            # alertMessage, formatCurrency, formatDate, debounce, LoadingSpinner
└── README.md
```

## Running Locally

Because the app uses ES Modules, it must be served via a local HTTP server (not opened directly as a `file://`):

```bash
# Python
python -m http.server 5500

# Node (npx)
npx serve .
```

Then open `http://localhost:5500`.

## Features

- **Country Selector** — scoped to 7 African nations; persists in localStorage
- **Live Crop Price Cards** — USDA data + currency conversion + simulated % change with colour indicators
- **Currency Conversion** — Open Exchange Rates (USD base) → local currency per country
- **Agri-Sector News Feed** — News API, country-specific keywords, sessionStorage cached
- **Opportunities Panel** — Curated grants, competitions, and programmes, filtered by country
- **Country Context Card** — Flag, capital, population, currency via REST Countries API
- **Search & Filter** — Debounced real-time client-side filtering across news and opportunities
- **Responsive Layout** — Mobile-first CSS Grid; single column → 2-col → 3-col
- **Accessibility** — ARIA labels, keyboard navigation, `aria-live` regions, WCAG AA colour contrast
- **Animations** — Card entry fade-up, loading spinner, percentage-change pulse; respects `prefers-reduced-motion`

## Colour Palette

| Role | Hex |
|------|-----|
| Primary (Forest Green) | `#2D6A4F` |
| Accent (Emerald) | `#52B788` |
| Background (Pale Sage) | `#F0F4EF` |
| Alert Down (Terracotta) | `#C1440E` |

## Typography

- **Display / Headings**: Poppins (Google Fonts)
- **Body / UI**: Inter (Google Fonts)
- **Currency codes**: Courier New (system)

---

*AgroYouth Connect · Vivian Eze · WDD 330 · BYU-Idaho*

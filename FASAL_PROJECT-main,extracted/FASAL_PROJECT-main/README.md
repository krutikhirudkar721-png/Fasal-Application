# FASAL — Crop Diversification Recommendation System

An AI-assisted platform that recommends crop diversification strategies from
soil, climate, and market data — in **English, Hindi, and Marathi**.

## What's inside
```
agri-ai/
├── frontend/
│   └── index.html              # Self-contained React app (open directly in a browser)
├── backend/
│   ├── index.php                # Front controller / router
│   ├── .htaccess                # Apache clean-URL + gzip + hardening
│   ├── composer.json
│   ├── config/
│   │   ├── app.php               # CORS, cache, rate limiter, response helpers
│   │   ├── database.php          # Pooled PDO connection factory
│   │   └── i18n.php              # Server-side translation strings
│   ├── classes/
│   │   ├── CropRecommendationEngine.php  # Core AI scoring model
│   │   ├── SoilAnalyzer.php              # Soil test interpretation
│   │   └── MarketAnalyzer.php            # Price trend + forecast
│   ├── api/
│   │   ├── recommend.php
│   │   ├── soil_analysis.php
│   │   ├── market_demand.php
│   │   ├── profit_estimate.php
│   │   └── seasonal_calendar.php
│   └── sql/
│       └── schema.sql            # MySQL schema + seed data (10 crops)
└── README.md
```

## Frontend

`frontend/index.html` is a **single-file React app** (React 18 + Tailwind +
Recharts via CDN, no build step) so it runs anywhere immediately — open it in
a browser, or embed it in a WebView for a React Native shell.

- **Languages**: English, Hindi (हिंदी), Marathi (मराठी) — toggle top-right,
  every string including chart labels and month names is translated.
- **Sections**: Hero → AI Recommendation Engine (live sliders, instant
  scoring) → Soil Health radar → Market Demand trend lines → Seasonal
  Calendar (sow/tend/harvest by month) → About/features.
- **Design**: an "ecological field" visual language — soil-brown and
  monsoon-green palette, furrow-striped dividers, a hand-tuned circular
  match-score gauge, Fraunces + Hind type pairing (Hind renders Devanagari
  and Latin consistently across all three languages).
- Currently runs the scoring model client-side (mirrors the PHP engine
  exactly) for instant feedback; swap `runEngine()` for a `fetch()` call to
  `/api/recommend` to use the live backend.

### Wiring the frontend to the real API
Replace the `runEngine(field)` call in `EngineSection` with:
```js
const res = await fetch("https://your-domain.com/api/recommend", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ph: field.ph, n: field.n, p: field.p, k: field.k,
    rainfall: field.rainfall, irrigation: field.irrigation,
    season: field.season, budget: field.budget,
    land_size: field.landSize, region: field.location,
  }),
});
const { data } = await res.json();
```

### React Native
The same component tree ports to React Native with minimal changes:
swap `<div>`/`<svg>` primitives for `<View>`/`react-native-svg`, replace
Tailwind classes with `StyleSheet` (or `nativewind`, which accepts the same
class names), and swap Recharts for `victory-native`. The AI scoring logic
(`scoreCrop`, `runEngine`) is plain JS and ports unchanged.

## Backend (PHP + MySQL)

### Setup
```bash
cd backend
composer install          # no runtime deps beyond core PHP extensions
mysql -u root -p < sql/schema.sql
cp .env.example .env      # set DB_HOST, DB_NAME, DB_USER, DB_PASS
```
Point Apache/Nginx document root at `backend/` (`.htaccess` included for
Apache; Nginx snippet below).

### API reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/recommend` | POST | Ranked crop recommendations (the AI engine) |
| `/api/soil-analysis` | POST | NPK/pH → health index + guidance |
| `/api/market-demand` | GET | Price trend, volatility, next-season forecast |
| `/api/profit-estimate` | POST | Standalone what-if profit calculator |
| `/api/seasonal-calendar` | GET | Sow/tend/harvest month windows |

All responses: `{"success": true, "data": ...}` or
`{"success": false, "error": "..."}`. Pass `?lang=hi|mr|en` or an
`Accept-Language` header for localized messages.

**Example:**
```bash
curl -X POST https://your-domain.com/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"ph":6.6,"n":60,"p":40,"k":35,"rainfall":650,
       "irrigation":"partial","season":"kharif","budget":16000,"region":"Nagpur"}'
```

### The AI recommendation model
`CropRecommendationEngine.php` is a transparent, explainable weighted
scoring model — not a black box — so every recommendation can be justified
to a farmer or extension officer:

```
composite = 0.28·soil_fit + 0.24·climate_fit + 0.14·season_fit
          + 0.18·demand   + 0.08·affordability + 0.08·(1 − risk)
```

Each factor is independently computed (pH/NPK distance, rainfall vs. crop
water need adjusted for irrigation access, season match, 6-season market
demand growth, budget vs. required input cost, and a composite risk score).
Weights live in one `const` array for easy tuning, and the whole class is
designed to be replaced by a trained ML model (e.g. served from a Python
microservice) behind the same `recommend()` signature — nothing else in the
app would need to change.

## Handling heavy traffic

This backend is built to survive bursty load (e.g. an entire village
checking recommendations during sowing week) without a rewrite:

1. **Persistent DB connections** (`PDO::ATTR_PERSISTENT`) avoid a fresh
   TCP+auth handshake per request under PHP-FPM.
2. **Response caching** (`Cache` class) — APCu in-process cache by default,
   file-cache fallback for shared hosting, swappable for Redis/Memcached by
   editing one class. Recommendation results are cached 10 min keyed by the
   exact input hash; market data 30 min.
3. **Sliding-window rate limiting** per API key/IP protects the CPU-heavy
   `/recommend` endpoint from abuse while staying generous for real usage.
4. **Stateless PHP-FPM workers** — horizontally scalable behind a load
   balancer; no server-side session state.
5. **Gzip on JSON responses** (`.htaccess`) — meaningfully smaller payloads
   on rural mobile data.
6. **Indexes** on `crops.active`, `market_prices(crop_key, region)`, and
   `recommendation_history(farmer_id, created_at)` keep queries fast as the
   dataset grows.

For very large scale, put a CDN/edge cache in front of the read-only GET
endpoints (`market-demand`, `seasonal-calendar`), move `Cache` to Redis, and
run PHP-FPM behind Nginx with `worker_connections` tuned for your expected
concurrency — the code doesn't need to change, just the infrastructure it
runs on.

### Nginx snippet
```nginx
location /api/ {
    try_files $uri $uri/ /index.php?$query_string;
}
location ~ \.php$ {
    fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    fastcgi_index index.php;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
gzip on;
gzip_types application/json;
```

## Disclaimer
This is a decision-support tool. Recommendations are estimates based on
generalized agronomic and market data — always validate with a local Krishi
Vigyan Kendra or agricultural extension officer before large investment
decisions. This note is shown in-app (all three languages) on the About
section.

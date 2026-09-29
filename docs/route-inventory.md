# Route Inventory — Recall Lens V0

**Audit date:** 2026-09-30  
**Production URL:** https://recall-lens-v0.vercel.app/  
**Repository:** https://github.com/PavithraMohan-Hub/Recall-Lens-V0.git

---

## Static Client Routes (Single-Page Application)

The application is a single-page application (SPA). All views are rendered client-side via `app.js` tab-switching logic. There are no server-rendered page routes beyond `/`.

| Route | Type | Rendered via | Description | Status |
|-------|------|-------------|-------------|--------|
| `/` | Static HTML | `index.html` | Root — loads Overview tab by default | ✅ Live |
| `/#overview` | SPA hash | `app.js` `switchView()` | Overview: hero, workbench, opportunity map, ranked clusters | ✅ Live |
| `/#evidence` | SPA hash | `app.js` `switchView()` | Evidence explorer: filter, search, card detail | ✅ Live |
| `/#pipeline` | SPA hash | `app.js` `switchView()` | Method: pipeline diagram, methodology cards, formula, limitations | ✅ Live |

### Navigation Structure

```
Topbar nav:
├── Overview    → #overview  (default active tab)
├── Evidence explorer → #evidence
└── Method      → #pipeline
```

---

## Server-Side API Routes (Vercel Serverless Functions)

| Route | Method | File | Purpose | Auth Required | Status |
|-------|--------|------|---------|---------------|--------|
| `/api/analyze` | POST | `api/analyze.js` | AI coding of evidence records via OpenAI | None (but requires OPENAI_API_KEY env var) | ✅ Deployed |
| `/api/ingest` | POST | `api/ingest.js` | Fetches and extracts content from public URLs | None | ✅ Deployed |

### API Behavior

- `GET /api/analyze` → HTTP 405 (Method Not Allowed) — Confirmed in production
- `POST /api/analyze` without `OPENAI_API_KEY` → HTTP 503 with error JSON
- `POST /api/analyze` with key → JSON-structured evidence records via OpenAI Responses API
- `POST /api/ingest` with valid public URLs → extracted text records
- `POST /api/ingest` with disallowed hosts → HTTP 422 rejection

---

## Static Asset Routes

| Asset | URL | Loads in Production |
|-------|-----|---------------------|
| `app.css` | `/app.css` | ✅ Confirmed |
| `app.js` | `/app.js` | ✅ Confirmed |
| `seed-data.js` | `/seed-data.js` | ✅ Confirmed |

---

## Vercel Rewrite Rules (vercel.json)

Only `/` is rewritten to `index.html`. Deep links like `/evidence` or `/pipeline` are NOT rewritten and will return 404 if accessed directly as full paths. All in-app navigation uses hash anchors (#overview, #evidence, #pipeline), which avoids this issue. No nested URL routes exist.

---

## Routes NOT Present

| Route | Status | Note |
|-------|--------|------|
| `/admin` | Not present | No admin panel |
| `/login` | Not present | No authentication layer |
| `/api/delete` | Not present | No data deletion endpoint |
| `localhost:*` | Not referenced | No localhost references in production |

---

## Route Comparison: Code vs. Production

| Route in Code | Reachable in Production | Notes |
|---------------|-------------------------|-------|
| `/` → Overview | ✅ Yes | Loads correctly |
| `#overview` tab | ✅ Yes | Client-side |
| `#evidence` tab | ✅ Yes | Client-side |
| `#pipeline` tab | ✅ Yes | Client-side |
| `POST /api/analyze` | ✅ Yes | Serverless function |
| `POST /api/ingest` | ✅ Yes | Serverless function |

**All coded routes are reachable in production. No orphaned routes exist.**

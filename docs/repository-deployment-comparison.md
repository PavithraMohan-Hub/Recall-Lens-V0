# Repository-to-Deployment Comparison — Recall Lens V0

**Audit date:** 2026-09-30  
**Production URL:** https://recall-lens-v0.vercel.app/  
**GitHub:** https://github.com/PavithraMohan-Hub/Recall-Lens-V0.git  
**Production commit SHA:** 8d20f03 (Initial commit — pushed 2026-09-30)

---

## 1. Branch and Deployment Configuration

| Check | Status | Notes |
|-------|--------|-------|
| Default branch | `master` | Single branch repository |
| Production branch | `master` | Vercel deploys from `master` |
| Preview environments | None configured | No separate preview branches |
| Repository-to-deployment match | ✅ Verified | HTML served matches local `index.html` exactly |

---

## 2. Code vs. Deployed Content

The following files were compared between local repository and live production:

| File | Local SHA | Production Response | Match |
|------|-----------|---------------------|-------|
| `index.html` | Committed | HTTP 200 — content matches | ✅ |
| `app.css` | Committed | HTTP 200 — asset loads | ✅ |
| `app.js` | Committed | HTTP 200 — asset loads | ✅ |
| `seed-data.js` | Committed | HTTP 200 — asset loads | ✅ |
| `api/analyze.js` | Committed | HTTP 405 on GET (correct) | ✅ |
| `api/ingest.js` | Committed | Deployed as serverless function | ✅ |
| `vercel.json` | Committed | Rewrites/headers applied | ✅ |

---

## 3. Environment Variables

| Variable | Required | Configured in Vercel | Client-side Exposure | Status |
|----------|----------|----------------------|----------------------|--------|
| `OPENAI_API_KEY` | For live AI mode | **Unknown** (no way to verify from outside) | ❌ Not exposed in client JS | ⚠️ Unverifiable |
| `OPENAI_MODEL` | Optional | Optional | ❌ Not exposed | ✅ |

**Key finding:** The `OPENAI_API_KEY` is correctly referenced only as `process.env.OPENAI_API_KEY` inside `api/analyze.js` (a server-side Vercel function). It is never placed in `app.js` or `index.html`. The API returns HTTP 503 when the key is absent. This means the live AI mode may be unconfigured on the production deployment — the fallback local coder activates instead.

> **Risk:** If OPENAI_API_KEY is not set in Vercel project settings, Journey 5 (AI Workflow Testability) partially fails because the server-side AI analysis is unavailable. The local fallback coder still runs, but it is deterministic rule-based coding, not live AI.

---

## 4. Security Checks

| Check | Status | Notes |
|-------|--------|-------|
| `.env` file committed | ✅ PASS | `.gitignore` correctly excludes `.env` and `.env.local` |
| `.env.example` committed | ✅ PASS | Contains only placeholder value, no secrets |
| API keys in client JS | ✅ PASS | No keys in `app.js` or `index.html` |
| API keys in `seed-data.js` | ✅ PASS | No secrets in seed data |
| Secrets in repository | ✅ PASS | Repository is clean |
| `node_modules` committed | ✅ PASS | Excluded by `.gitignore` |
| Build artifacts committed | ✅ PASS | No `.vercel/` or build output committed |

---

## 5. Static vs. Runtime Variable Separation

| Variable type | Location | Correctly separated |
|---------------|----------|---------------------|
| Server secrets (`OPENAI_API_KEY`) | Vercel env → `process.env` in serverless function | ✅ Yes |
| Client configuration | None — no client-side env vars | ✅ Yes |
| Seed data | `seed-data.js` loaded as browser script | ✅ Yes — no secrets |

---

## 6. Localhost Reference Check

Searched all project files for `localhost` references:

- `README.md`: Contains `npx vercel dev` instruction — this is development-only documentation, not a hardcoded URL
- `api/analyze.js`: References `https://api.openai.com` — external production URL ✅
- `api/ingest.js`: Uses `URL` constructor on user-supplied values — no hardcoded localhost ✅
- `app.js`: No localhost references ✅
- `vercel.json`: No localhost references ✅

**Result: No localhost references in production code paths.**

---

## 7. Test / Mock / Placeholder Data

| Check | Status | Notes |
|-------|--------|-------|
| Seed data labeled as demo | ✅ PASS | Status bar shows "Demo ready"; dataset caption reads "Seeded public evidence" |
| Seed evidence has real source URLs | ✅ PASS | All 22 records link to real Reddit, Google Photos Community threads |
| Seed data presented as real evidence | ⚠️ PARTIAL | Source URLs are real and publicly accessible, but the label "Seeded public evidence" may not be prominent enough for evaluators unfamiliar with the project |
| Synthetic data masquerading as real | ✅ PASS | No fabricated sources detected |

---

## 8. Build and Rebuild Verification

| Check | Status | Notes |
|-------|--------|-------|
| No build step required | ✅ | This is a no-framework static site; no `npm run build` needed |
| Can be rebuilt from repository | ✅ | `npm run check` validates JS; `npx vercel dev` runs locally |
| README setup instructions | ✅ | README has clear Deploy to Vercel steps |
| No undocumented prerequisites | ✅ | Only requires `OPENAI_API_KEY` in Vercel env |

---

## 9. GitHub Actions / Scheduled Workflows

| Check | Status | Notes |
|-------|--------|-------|
| GitHub Actions workflows | ❌ None configured | No `.github/workflows/` directory |
| Vercel automatic deployments | ✅ Configured by Vercel | Vercel auto-deploys on `master` push |
| Scheduled workflows | ❌ None | Not applicable for this project type |

---

## 10. Summary

| Category | Result |
|----------|--------|
| Deployment matches intended repository | ✅ Yes |
| Correct branch deployed | ✅ Yes (master) |
| Environment variables correctly separated | ✅ Yes |
| No secrets in repository | ✅ Yes |
| No localhost in production code | ✅ Yes |
| Seed data appropriately labeled | ⚠️ Partial (could be more prominent) |
| README and setup instructions adequate | ✅ Yes |
| Can be rebuilt from repo | ✅ Yes |

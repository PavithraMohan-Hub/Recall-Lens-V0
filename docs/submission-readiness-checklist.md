# Submission Readiness Checklist — Recall Lens V0

**Audit date:** 2026-09-30  
**Submission deadline:** 2026-10-07T16:00 IST  
**Production URL:** https://recall-lens-v0.vercel.app/

---

## Pre-Submission Checklist

### CRITICAL — Must complete before submission

- [x] Production URL loads without errors (HTTP 200)
- [x] No Vercel password protection or auth wall blocking public access
- [x] No credentials, API keys, or `.env` files committed to repository
- [x] Evidence records link to real public sources (not fabricated)
- [x] Seeded data is clearly labeled as demo evidence
- [x] No raw PII visible in the application
- [x] Private solution ideas are not on the public dashboard
- [x] Application correctly identifies retrieval episodes (not generic reviews)
- [x] Scope gate rejects off-topic complaints (backup/sync/deletion)
- [x] No population-prevalence claims made
- [x] Scoring formula is visible and explained
- [x] Limitations are documented
- [x] Mobile viewport renders correctly (responsive design present)
- [ ] **OPENAI_API_KEY is configured in Vercel project environment variables**
- [ ] **AI analyze workflow tested end-to-end with live API key**
- [ ] **Correct OpenAI model name verified (not `gpt-5-mini` which may not exist)**

### HIGH PRIORITY — Strongly recommended

- [ ] Method tab displays AI model name used
- [ ] Method tab includes a Privacy section
- [ ] AI mode is clearly distinguished from local fallback in the UI
- [ ] Corpus has sufficient depth (currently 22 records — consider expanding to 30+)
- [ ] "Reload public demo" button successfully reloads seed evidence

### MEDIUM PRIORITY — Good to have

- [ ] OG meta tags added for social sharing
- [ ] Favicon added
- [ ] Deep link `/evidence` handled (currently returns 404 — hash-based routing works)
- [ ] Source type and opportunity filters confirmed to populate correctly after JS load

---

## Repository Checklist

- [x] Repository is public at https://github.com/PavithraMohan-Hub/Recall-Lens-V0.git
- [x] README.md is present and has deployment instructions
- [x] METHODOLOGY.md is present with full workflow explanation
- [x] `.env.example` shows required environment variables
- [x] `.gitignore` excludes `.env`, `node_modules`, `.vercel`
- [x] No `node_modules` committed
- [x] No build artifacts committed
- [x] No secrets or API keys in any committed file
- [ ] `docs/` folder with audit evidence committed to repository

---

## Vercel Deployment Checklist

- [x] Project deployed to Vercel
- [x] Production URL is live and publicly accessible
- [x] `vercel.json` with security headers deployed
- [x] `api/analyze.js` serverless function deployed
- [x] `api/ingest.js` serverless function deployed
- [ ] `OPENAI_API_KEY` environment variable set in Vercel project settings
- [ ] `OPENAI_MODEL` environment variable set (recommended: `gpt-4o-mini`)
- [ ] Redeployment triggered after environment variable changes

---

## Evaluator Journey Quick-Test (Run manually in browser)

Open https://recall-lens-v0.vercel.app/ in a fresh browser window and verify:

- [ ] Hero headline visible: "Turn noisy feedback into *retrieval evidence.*"
- [ ] "Demo ready" or "AI ready" status shows in top-right
- [ ] Click "Evidence explorer" → evidence list loads with 22 records
- [ ] Search for "yellow" → E-001 record appears
- [ ] Click E-001 card → detail panel opens showing remembered, forgotten, source, confidence
- [ ] Source link in E-001 opens https://support.google.com/photos/thread/373711674/
- [ ] Filter by "In scope" → only in-scope records shown
- [ ] Click "Overview" → opportunity map and ranked table visible
- [ ] Click "Method" → 5-step pipeline diagram and formula visible
- [ ] Click "Analyze evidence" → workbench opens
- [ ] Paste sample text → click "Analyze with AI" → result produced (AI or fallback)
- [ ] Click "Export" → popover shows JSON / CSV / Research memo options
- [ ] Resize to 375px width → layout remains usable

---

## Final Answer

> Is https://recall-lens-v0.vercel.app/ ready to be submitted as the publicly testable AI-Powered Discovery Engine for the NextLeap graduation project?

## READY AFTER TARGETED FIXES

**Weighted Score: 86.2 / 100**

| Finding severity | Count |
|-----------------|-------|
| P0 (blockers) | 0 |
| P1 (high) | 3 |
| P2 (medium) | 3 |
| P3 (low) | 4 |
| P4 (informational) | 2 |

### Top 5 Fixes

| # | Fix | Effort | Priority |
|---|-----|--------|---------|
| 1 | Verify OpenAI model name (`gpt-5-mini` → `gpt-4o-mini` or current) | 15 min | P4 |
| 2 | Configure `OPENAI_API_KEY` + `OPENAI_MODEL` in Vercel env and redeploy | 30 min | P1 |
| 3 | Add AI model name disclosure to Method tab | 30 min | P1 |
| 4 | Add Privacy card to Method tab | 20 min | P2 |
| 5 | Expand seed corpus from 22 to 30+ real public records | 2–4 hrs | P1 |

### Current production URL
**Should remain live.** The demo works correctly in fallback mode. Apply fixes incrementally.

### Recommended submission sequence
1. Fix model name → configure Vercel env → redeploy (Day 1, 1 hour)
2. Add Method tab disclosures → commit → push → auto-redeploy (Day 1, 1 hour)
3. Expand corpus → commit → push (Day 2–3)
4. Run full manual browser verification (Day 6)
5. Submit on Day 7 (October 7)

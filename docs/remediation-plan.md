# Remediation Plan — Recall Lens V0

**Audit date:** 2026-09-30  
**Submission deadline:** 2026-10-07T16:00 IST  
**Time available:** ~7 days

---

## Top 5 Fixes Required

### Fix 1 — Verify and Configure `OPENAI_API_KEY` in Vercel (P1-01)

**Problem:** If `OPENAI_API_KEY` is not set in the Vercel project's Environment Variables, the `/api/analyze` endpoint returns HTTP 503 and the app silently falls back to the local deterministic coder. Evaluators testing the AI workflow may not realize they are not getting live AI output.

**Fix:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your OpenAI secret key (value starts with `sk-`)
3. Add `OPENAI_MODEL` = `gpt-4o-mini` (or verified current model name — see Fix 2)
4. Redeploy (trigger via push or manual redeploy in Vercel)

**Also in `app.js`:** After the AI call returns, surface the `mode` field from the response in the UI so evaluators can see whether the result was "AI-coded with gpt-4o-mini" or "local fallback".

**Estimated effort:** 30 minutes  
**Impact:** High — directly affects AI workflow claim

---

### Fix 2 — Verify OpenAI Model Name (P4-01)

**Problem:** `.env.example` and `api/analyze.js` reference `gpt-5-mini`. As of mid-2026, this model may not exist or may have a different name. The correct model for cost-efficient structured output is likely `gpt-4o-mini`.

**Fix:**
1. Check OpenAI's model list at https://platform.openai.com/docs/models
2. Update `.env.example` to use the verified model name
3. Update Vercel `OPENAI_MODEL` environment variable accordingly

**Estimated effort:** 15 minutes  
**Impact:** High — incorrect model name causes API failures and no AI output

---

### Fix 3 — Add AI Model Name to Method Tab UI (P1-02)

**Problem:** The Method tab documents the AI pipeline stages but does not state which AI model performs the coding. Evaluators assessing AI use cannot verify the model without reading the source code.

**Fix:** Add one line to the "AI code" step or a new method card:

```html
<!-- In the pipeline-flow section, or in a new method card -->
<div class="method-card">
  <span class="method-icon blue-bg">🤖</span>
  <h3>AI model</h3>
  <p>Evidence is coded using <strong>GPT-4o mini</strong> via OpenAI's structured output API. 
     The model receives explicit instructions and a JSON schema. 
     It cannot invent cues, demographics, or outcomes not present in the evidence text.</p>
</div>
```

**Estimated effort:** 30 minutes  
**Impact:** Medium — improves evaluator confidence in AI transparency

---

### Fix 4 — Expand the Seed Corpus (P1-03)

**Problem:** The current seed corpus has 22 evidence records. While the application is designed to accept new evidence via the workbench, the demo corpus alone may appear thin for a graduation-level research project.

**Fix options (choose one or combine):**
- **Option A:** Add 10–20 more real public evidence records to `seed-data.js`, targeting diversity in: sourceType (add App Store, editorial), failure modes, opportunity clusters, and date range (2020–2026)
- **Option B:** Pre-populate with an additional "expanded demo" JSON dataset that can be loaded via the "Reload public demo" button
- **Option C:** Add a visible corpus stats panel: "22 records across 5 opportunity areas, sourced from Reddit (13), Support forums (6), YouTube (1), Editorial (2)"

**Estimated effort:** 2–4 hours for Option A (finding and coding real records)  
**Impact:** Medium — strengthens evidence depth claim

---

### Fix 5 — Add Privacy Section to Method Tab UI (P2-01)

**Problem:** The Method tab does not include a Privacy section. METHODOLOGY.md covers it but evaluators reviewing the live app will not see it.

**Fix:** Add a privacy card to the method-grid:

```html
<article class="method-card">
  <span class="method-icon green-bg">🔒</span>
  <h3>Privacy</h3>
  <p>Only publicly posted content from public forums, support threads, and review pages is included. 
     No names, profile identifiers, or contact details are stored. 
     Evidence excerpts are kept short; full post text is not reproduced.</p>
</article>
```

**Estimated effort:** 20 minutes  
**Impact:** Medium — addresses audit criterion directly

---

## Recommended Remediation Order

| Order | Fix | Effort | Priority |
|-------|-----|--------|---------|
| 1 | Fix 2: Verify model name | 15 min | P4 but blocks Fix 1 |
| 2 | Fix 1: Configure OPENAI_API_KEY in Vercel + surface mode in UI | 30 min | P1 |
| 3 | Fix 3: Add model name to Method tab | 30 min | P1 |
| 4 | Fix 5: Add privacy card to Method tab | 20 min | P2 |
| 5 | Fix 4: Expand seed corpus | 2–4 hours | P1 |

**Total minimum effort for P1+P2 fixes: ~1.5 hours**  
**Total with corpus expansion: ~3.5–5.5 hours**

---

## Secondary Improvements (P3 — Optional)

| Improvement | Effort | Notes |
|-------------|--------|-------|
| Add OG/Twitter meta tags | 20 min | Better social sharing preview |
| Add favicon | 10 min | Cosmetic but professional |
| Add vercel.json rewrite for `/evidence` → `/#evidence` | 15 min | Better deep-link handling |
| Make status indicator show "AI ready" vs "Demo mode" based on API key availability | 1 hour | Requires server-side probe or config flag |

---

## Should the Production URL Remain Live?

**Yes.** The current production URL at https://recall-lens-v0.vercel.app/ is:
- Publicly accessible
- Functionally complete (demo mode works without OPENAI_API_KEY)
- Correctly implementing the scope gate, evidence coding, and opportunity comparison
- Safe (no credentials, no PII, no admin exposure)

The URL should remain live during remediation. Apply fixes incrementally and push to `master`; Vercel will auto-redeploy.

---

## Post-Fix Verification Checklist

After applying fixes, verify:

- [ ] `POST /api/analyze` with sample text returns HTTP 200 with AI-coded records
- [ ] Response `mode` field shows `AI-coded with gpt-4o-mini` (or configured model)
- [ ] Method tab shows AI model name
- [ ] Method tab shows Privacy card
- [ ] Corpus has ≥30 records
- [ ] "Demo ready" or "AI ready" status correctly reflects key presence
- [ ] All source links in seed data open valid pages
- [ ] Export (JSON, CSV, memo) produces correct files

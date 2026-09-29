# Audit Scorecard — Recall Lens V0

**Audit date:** 2026-09-30  
**Production URL:** https://recall-lens-v0.vercel.app/  
**Scoring:** Weighted out of 100

---

## Weighted Score Summary

| Category | Weight | Score | Weighted |
|----------|--------|-------|---------|
| Public access & deployment | 10% | 95/100 | 9.5 |
| Landing-page comprehension (Journey 1) | 10% | 92/100 | 9.2 |
| Evidence exploration (Journey 2) | 15% | 88/100 | 13.2 |
| Problem-cluster comparison (Journey 3) | 15% | 90/100 | 13.5 |
| Methodology validation (Journey 4) | 15% | 80/100 | 12.0 |
| AI workflow testability (Journey 5) | 20% | 72/100 | 14.4 |
| Repository-to-deployment consistency | 10% | 94/100 | 9.4 |
| Research integrity & hard-fail checks | 5% | 100/100 | 5.0 |

**TOTAL WEIGHTED SCORE: 86.2 / 100**

---

## Finding Counts

| Priority | Count | Description |
|----------|-------|-------------|
| P0 (Submission blockers) | 0 | None — no hard-fail conditions triggered |
| P1 (High priority) | 3 | AI transparency, model disclosure, corpus size |
| P2 (Medium priority) | 3 | Privacy section missing from UI, deep-link 404, JS hydration |
| P3 (Low priority) | 4 | OG tags, favicon, status ambiguity, no CI/CD |
| P4 (Informational) | 2 | Model name verification, Responses API stability |
| **Total** | **12** | |

---

## Journey Pass/Fail

| Journey | Verdict | Score |
|---------|---------|-------|
| Journey 1: Landing-page comprehension | ✅ PASS | 92/100 |
| Journey 2: Evidence exploration | ✅ PASS | 88/100 |
| Journey 3: Problem-cluster comparison | ✅ PASS | 90/100 |
| Journey 4: Methodology validation | ✅ PASS with minor gaps | 80/100 |
| Journey 5: AI workflow testability | ✅ PASS (with caveat) | 72/100 |
| Journey 6: Public access | ✅ PASS | 95/100 |

---

## Hard-Fail Assessment

| Hard-Fail Condition | Result |
|---------------------|--------|
| Production URL does not load | ✅ PASS |
| Public evaluator cannot access | ✅ PASS |
| No testable AI workflow | ✅ PASS |
| Evidence fabricated/misattributed | ✅ PASS |
| Synthetic data as real evidence | ✅ PASS |
| Important findings lack source links | ✅ PASS |
| Raw PII visible | ✅ PASS |
| Private solution ideas publicly visible | ✅ PASS |
| Only sentiment reported | ✅ PASS |
| Backup/sync complaints dominate | ✅ PASS |
| Admin operations publicly accessible | ✅ PASS |
| Credentials in repository | ✅ PASS |
| Core experience unusable on mobile | ✅ PASS |
| Deployment ≠ intended repository version | ✅ PASS |

**0 hard-fail conditions triggered.**

---

## Recall Lens-Specific Criteria

| Criterion | Score |
|-----------|-------|
| 1. Real evidence or labeled demo | 95/100 |
| 2. Identifies retrieval episodes | 95/100 |
| 3. Separates incomplete-memory retrieval | 98/100 |
| 4. Extracts what users remember | 95/100 |
| 5. Extracts what users have forgotten | 95/100 |
| 6. Captures initial queries | 90/100 |
| 7. Captures query reformulation | 85/100 |
| 8. Identifies retrieval failure points | 95/100 |
| 9. Captures workarounds and abandonment | 95/100 |
| 10. Groups episodes into clusters | 90/100 |
| 11. Allows cluster comparison | 90/100 |
| 12. Links findings to evidence | 95/100 |
| 13. Communicates confidence/limitations | 90/100 |
| 14. Avoids population-prevalence claims | 98/100 |
| 15. Keeps solution concepts private | 100/100 |

**Recall Lens-Specific Average: 93.5/100**

---

## Verdict

> **READY AFTER TARGETED FIXES**

**Weighted Score: 86.2 / 100**  
**P0 findings: 0** | **P1 findings: 3** | **P2 findings: 3** | **P3 findings: 4** | **P4 findings: 2**

The application is structurally sound and meets all hard-fail requirements. The three P1 issues (AI mode transparency, model disclosure, corpus size) should be addressed before submission to maximize evaluator confidence in the AI workflow claim.

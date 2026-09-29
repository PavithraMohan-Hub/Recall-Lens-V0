# Methodology and submission narrative

## One-line value proposition

Recall Lens turns scattered public conversations into a scoped, traceable map of incomplete-memory photo-retrieval problems, enabling PMs to compare opportunities without confusing search failures with backup or deletion issues.

## Workflow

1. **Collect** — public discussions, app reviews, support threads, comments, and primary research are normalized into one evidence record.
2. **De-duplicate** — exact and near-duplicate items are collapsed; the original source URL remains attached.
3. **Scope gate** — each item is marked `in scope`, `adjacent`, or `out of scope`. In-scope evidence must include a remembered visual item, incomplete or uncertain cues, and a retrieval attempt or barrier.
4. **AI coding** — the engine extracts what the user remembered, what was missing or uncertain, how they searched, where the journey broke, the workaround, outcome, effort, severity, and confidence.
5. **Human review** — low-confidence, contradictory, and high-severity records enter a review queue.
6. **Synthesis** — evidence is clustered into problem families and cue gaps. Counterevidence and successful retrievals remain visible.
7. **Compare** — opportunity areas are compared using evidence volume, source diversity, effort, severity, abandonment, and confidence. Scores prioritize research attention; they are not population estimates.
8. **Export** — evidence, coded records, and a concise research memo can be exported for triangulation with surveys and interviews.

## Coding schema

| Dimension | Purpose |
| --- | --- |
| Scope | Prevent generic Google Photos complaints from contaminating the research question |
| Media type | Identify whether screenshots, documents, people photos, videos, or places behave differently |
| Remembered cues | Capture the cues people naturally retain: object, person, place, event, purpose, visual appearance, relative time, text, or source |
| Forgotten/uncertain cues | Capture missing date, exact wording, location, account, sender, source app, or person identity |
| Query behaviour | Observe natural-language, keyword, date, person, OCR, album, scrolling, and cross-app strategies |
| Failure mode | Distinguish vocabulary mismatch, wrong metadata, overload, indexing gap, cross-account uncertainty, or system inconsistency |
| Outcome | Success, partial success, abandonment, or unresolved |
| Impact | Directional effort, severity, and abandonment signals |
| Confidence | Indicates extraction quality and the strength of supporting evidence |

## Opportunity score

The demo score is intentionally transparent:

`30% evidence breadth + 20% source diversity + 20% severity + 15% effort + 10% abandonment + 5% confidence`

Each component is normalized to 0–100. This score ranks areas for deeper validation; it does not claim market prevalence. Survey reach/frequency and interview depth should replace the directional proxies in the final impact model.

## Why this goes beyond sentiment analysis

Sentiment cannot reveal whether a user remembers a yellow sticky note but not its text, remembers an event but not the date, or is unsure which account or app contains a screenshot. Recall Lens preserves the memory cue, missing cue, retrieval sequence, system response, workaround, outcome, and evidence trail for each incident.

## One-slide explanation

**Title:** The discovery engine converts noisy public feedback into comparable retrieval opportunities

- **Inputs:** public discussions, support threads, app reviews, comments, survey verbatims, and interview notes.
- **AI pipeline:** normalize → de-duplicate → scope gate → structured coding → confidence review → clustering.
- **Outputs:** cue-gap map, failure taxonomy, behaviour patterns, ranked opportunity areas, counterevidence, and traceable evidence cards.
- **Human control:** every insight links to evidence; low-confidence and high-severity records require review.
- **Decision use:** findings guide target-segment hypotheses, interview sampling, root-cause exploration, and opportunity sizing—not solution selection.

## Limitations

- Public posters are self-selected and skew toward problems.
- Source availability and platform moderation affect coverage.
- Evidence counts do not equal affected-user percentages.
- AI coding can misclassify ambiguous stories; confidence and human review are required.
- Some search failures reflect indexing, account, backup, or regional feature availability rather than incomplete memory.
- The seeded corpus is a demonstrator, not the final sample. Add broader source and time coverage before making prevalence claims.

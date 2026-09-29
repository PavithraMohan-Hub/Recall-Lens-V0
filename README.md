# Recall Lens — AI-powered discovery engine

Recall Lens is a public, evaluator-friendly research tool for the Google Photos incomplete-memory retrieval problem. It converts public feedback and research notes into traceable evidence, rejects off-scope complaints, extracts memory and behaviour signals, compares opportunity areas, and preserves links back to source evidence.

## What the public demo proves

- A seeded corpus of public Reddit, Google Photos Community, support, and editorial test evidence.
- A scope gate that separates incomplete-memory retrieval from backup, deletion, storage, editing, and generic performance complaints.
- Structured coding of remembered cues, forgotten cues, query behaviour, failure mode, workaround, outcome, effort, severity, and confidence.
- Opportunity comparison using evidence breadth, source diversity, severity, effort, abandonment, and research confidence.
- Filters and evidence drill-down so every insight can be audited.
- JSON, CSV, and Markdown exports for downstream synthesis and deck creation.
- Live AI analysis of pasted/uploaded research when `OPENAI_API_KEY` is configured on Vercel.

## Deploy to Vercel

1. Put this folder in a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the framework preset as **Other** and deploy from the repository root.
4. In **Project Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` — server-side secret; never place it in `app.js` or the browser.
   - `OPENAI_MODEL` — optional; defaults to `gpt-5-mini`.
5. Redeploy after adding the environment variable.
6. Test with **Analyze with AI**. The key remains inside the Vercel function.

The seeded demo and deterministic coding work without any key. Live AI mode is used for new raw evidence and adds emergent themes and research memos.

## Accepted input

- Paste one feedback item per line.
- Upload `.csv`, `.json`, or `.txt` files.
- Import a batch of public URLs from the supported host allowlist.

Recommended CSV columns: `text`, `source`, `url`, `date`, and `sourceType`. Only `text` is required.

## Local check

```bash
npm run check
npx vercel dev
```

Open the URL printed by Vercel. The demo has no build dependencies.

## Research integrity

- Treat counts as directional evidence, not population prevalence.
- Do not infer demographics that users did not disclose.
- Keep short evidence excerpts and source links; avoid reproducing entire posts.
- Manually review low-confidence and high-severity items.
- Keep survey/interview findings separate from public-source findings until triangulation.

See [METHODOLOGY.md](./METHODOLOGY.md) for the full workflow and deck-ready explanation.

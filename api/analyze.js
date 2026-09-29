const recordSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "source", "sourceType", "url", "date", "text", "scope", "mediaType", "remembered", "forgotten", "queryBehavior", "failureMode", "opportunity", "workaround", "outcome", "effort", "severity", "abandoned", "confidence", "relevanceReason"],
  properties: {
    id: { type: "string" },
    source: { type: "string" },
    sourceType: { type: "string" },
    url: { type: "string" },
    date: { type: "string" },
    text: { type: "string" },
    scope: { type: "string", enum: ["in_scope", "adjacent", "out_of_scope"] },
    mediaType: { type: "string" },
    remembered: { type: "array", items: { type: "string" } },
    forgotten: { type: "array", items: { type: "string" } },
    queryBehavior: { type: "string" },
    failureMode: { type: "string" },
    opportunity: { type: "string" },
    workaround: { type: "string" },
    outcome: { type: "string" },
    effort: { type: "integer", minimum: 1, maximum: 5 },
    severity: { type: "integer", minimum: 1, maximum: 5 },
    abandoned: { type: "boolean" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    relevanceReason: { type: "string" }
  }
};

const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["records", "memo"],
  properties: {
    records: { type: "array", items: recordSchema },
    memo: { type: "string" }
  }
};

function outputText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "Live AI analysis is not configured on this deployment." });

  const records = Array.isArray(req.body?.records) ? req.body.records.slice(0, 80) : [];
  if (!records.length) return res.status(400).json({ error: "Provide at least one evidence record." });
  const serialized = JSON.stringify(records);
  if (serialized.length > 180000) return res.status(413).json({ error: "This batch is too large. Analyze fewer or shorter records." });

  const instructions = `You are a rigorous product discovery research coder studying one narrow problem: a user remembers that a photo, video, screenshot, document, receipt, ticket, meme, or other visual item exists, but cannot precisely describe it when starting retrieval.

Your job is to convert each supplied evidence item into one auditable research record. Do not invent demographics, frequency, emotion, intent, or outcomes. Use "not stated" when evidence is missing.

SCOPE GATE
- in_scope: the story contains a remembered visual item or cue, incomplete/uncertain memory or weak query language, and a retrieval attempt or barrier.
- adjacent: retrieval is affected, but incomplete memory is not clearly described (for example general latency, interface friction, indexing delay, or generic poor search).
- out_of_scope: deletion, backup, sync, storage, missing files, editing, sharing, privacy, or general app complaints without an incomplete-memory retrieval episode.

CODING RULES
1. Preserve id, source, sourceType, url, date, and evidence text. Shorten extremely long imported page text to a concise evidence note without adding claims.
2. remembered: the actual cues retained, such as person, place, object, event, purpose, visual appearance, relative time, visible text, sender/source, or a related anchor item.
3. forgotten: missing or uncertain date, exact wording, location, person identity, source app, account, sender, album, or file type.
4. queryBehavior: the observed retrieval action, not an idealized action.
5. failureMode: a concise snake_case label. Reuse labels across similar incidents.
6. opportunity: a problem-oriented family, never a feature or solution. Prefer stable labels such as Descriptive cue translation; Temporal uncertainty recovery; Episodic clue composition; Screenshot and document cue recovery; Person-identity recovery; Anchor-based retrieval; Result-set completeness and refinement; Query repair and cue elicitation; Cross-surface retrieval confidence; Excluded: availability and backup.
7. effort and severity are directional 1–5 judgments grounded only in the text. Mark confidence lower when details are sparse.
8. Keep successful cases and counterevidence. Do not treat every item as a failure.
9. The memo must state sample size, top patterns, contradictions/counterevidence, unknowns, and the next research question. Explicitly state that public-source counts are not prevalence.
10. Return exactly one coded record for every input record, in the same order.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        store: false,
        instructions,
        input: [{ role: "user", content: [{ type: "input_text", text: `Code these evidence records:\n${serialized}` }] }],
        text: {
          format: {
            type: "json_schema",
            name: "retrieval_discovery_coding",
            description: "Structured, auditable coding of incomplete-memory visual retrieval evidence.",
            strict: true,
            schema: outputSchema
          }
        }
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      const message = payload?.error?.message || "The AI provider rejected the request.";
      return res.status(response.status).json({ error: message });
    }
    const text = outputText(payload);
    if (!text) return res.status(502).json({ error: "The AI response did not include structured output." });
    const parsed = JSON.parse(text);
    return res.status(200).json({ ...parsed, mode: `AI-coded with ${process.env.OPENAI_MODEL || "gpt-5-mini"}` });
  } catch (error) {
    return res.status(500).json({ error: error.message || "AI analysis failed." });
  }
}

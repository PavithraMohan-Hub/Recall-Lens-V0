(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const titleCase = (value = "") => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);

  const state = {
    records: clone(window.SEED_EVIDENCE || []),
    selectedId: null,
    inputMode: "paste",
    uploadedRecords: [],
    lastMemo: "",
    analysisMode: "seeded demo"
  };

  const opportunityColors = ["#1a73e8", "#7c4dff", "#00a896", "#ea4335", "#f29900", "#5f6caf", "#00897b", "#9c27b0"];

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function setStatus(text, working = false) {
    $("#engineStatus").textContent = text;
    const dot = $(".status-dot i");
    dot.style.background = working ? "#fbbc04" : "#34a853";
    dot.style.boxShadow = working ? "0 0 0 4px #fef7e0" : "0 0 0 4px #e6f4ea";
  }

  function switchView(viewId) {
    $$(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
    $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.tab === viewId));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (viewId === "evidence") renderEvidence();
  }

  function inScope(records = state.records) {
    return records.filter((record) => record.scope === "in_scope");
  }

  function summarizeOpportunities(records = state.records) {
    const core = inScope(records);
    const grouped = new Map();
    core.forEach((record) => {
      const key = record.opportunity || "Unclassified opportunity";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(record);
    });
    const maxCount = Math.max(1, ...[...grouped.values()].map((items) => items.length));
    return [...grouped.entries()].map(([name, items]) => {
      const sources = new Set(items.map((item) => item.sourceType || item.source)).size;
      const avgSeverity = items.reduce((sum, item) => sum + Number(item.severity || 0), 0) / items.length;
      const avgEffort = items.reduce((sum, item) => sum + Number(item.effort || 0), 0) / items.length;
      const abandonment = items.filter((item) => item.abandoned).length / items.length;
      const confidence = items.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / items.length;
      const evidenceBreadth = (items.length / maxCount) * 100;
      const sourceDiversity = clamp((sources / 4) * 100, 0, 100);
      const score = Math.round(
        evidenceBreadth * .30 +
        sourceDiversity * .20 +
        (avgSeverity / 5 * 100) * .20 +
        (avgEffort / 5 * 100) * .15 +
        (abandonment * 100) * .10 +
        (confidence * 100) * .05
      );
      return { name, items, count: items.length, sources, avgSeverity, avgEffort, abandonment, confidence, evidenceBreadth, sourceDiversity, score };
    }).sort((a, b) => b.score - a.score);
  }

  function renderMetrics() {
    const total = state.records.length;
    const core = inScope();
    const excluded = state.records.filter((r) => r.scope === "out_of_scope").length;
    const review = state.records.filter((r) => Number(r.confidence) < .8 || (Number(r.severity) >= 5 && r.scope !== "out_of_scope")).length;
    const sourceTypes = new Set(state.records.map((r) => r.sourceType || r.source)).size;
    const cards = [
      { label: "Evidence records", value: total, note: `${sourceTypes} source types in this working set`, cls: "blue-card" },
      { label: "Core retrieval incidents", value: core.length, note: `${excluded} off-scope records rejected`, cls: "green-card" },
      { label: "Opportunity areas", value: summarizeOpportunities().length, note: "Compared with a transparent score", cls: "purple-card" },
      { label: "Manual review queue", value: review, note: "Low confidence or high-severity items", cls: "red-card" }
    ];
    $("#metricGrid").innerHTML = cards.map((card) => `<article class="metric-card ${card.cls}"><span>${escapeHtml(card.label)}</span><strong>${card.value}</strong><small>${escapeHtml(card.note)}</small></article>`).join("");
  }

  function renderOpportunityMap() {
    const opportunities = summarizeOpportunities().slice(0, 8);
    const map = $("#opportunityMap");
    map.innerHTML = opportunities.map((opportunity, index) => {
      const impact = ((opportunity.avgSeverity + opportunity.avgEffort) / 10) * 100;
      const left = 12 + opportunity.evidenceBreadth * .76;
      const bottom = 10 + impact * .76;
      const size = clamp(47 + opportunity.count * 10, 58, 96);
      const shortName = opportunity.name.replace(" and ", " + ").replace(" retrieval", "");
      return `<button class="bubble" data-opportunity="${escapeHtml(opportunity.name)}" style="left:${left}%;bottom:${bottom}%;width:${size}px;height:${size}px;background:${opportunityColors[index % opportunityColors.length]}" title="${escapeHtml(opportunity.name)} — score ${opportunity.score}">${escapeHtml(shortName)}<small>${opportunity.count} records</small></button>`;
    }).join("");
    $$(".bubble", map).forEach((bubble) => bubble.addEventListener("click", () => {
      switchView("evidence");
      $("#opportunityFilter").value = bubble.dataset.opportunity;
      renderEvidence();
    }));
  }

  function cueCounts(field) {
    const counts = new Map();
    inScope().forEach((record) => (record[field] || []).forEach((cue) => {
      const normalized = String(cue).trim().toLowerCase();
      if (normalized && normalized !== "unspecified") counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  function renderCueChart() {
    const remembered = cueCounts("remembered");
    const forgotten = cueCounts("forgotten");
    const max = Math.max(1, ...remembered.map(([, c]) => c), ...forgotten.map(([, c]) => c));
    const rows = (items, cls = "") => items.map(([label, count]) => `<div class="cue-row ${cls}"><span>${escapeHtml(titleCase(label))}</span><div class="cue-track"><i style="width:${count / max * 100}%"></i></div><b>${count}</b></div>`).join("");
    $("#cueChart").innerHTML = `<div class="cue-subhead">Remembered cues</div>${rows(remembered)}<div class="cue-subhead">Forgotten or uncertain</div>${rows(forgotten, "forgotten")}`;
  }

  function renderOpportunityTable() {
    const body = $("#opportunityTable");
    const opportunities = summarizeOpportunities();
    body.innerHTML = opportunities.map((item) => `<tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${item.count}</td>
      <td>${item.sources}</td>
      <td>${item.avgEffort.toFixed(1)} / 5</td>
      <td>${Math.round(item.abandonment * 100)}%</td>
      <td>${Math.round(item.confidence * 100)}%</td>
      <td><span class="score-pill">${item.score}</span></td>
    </tr>`).join("");
  }

  function refreshDashboard() {
    renderMetrics();
    renderOpportunityMap();
    renderCueChart();
    renderOpportunityTable();
    populateFilters();
    $("#datasetCaption").textContent = `${state.records.length} evidence records • ${state.analysisMode} • directional, not prevalence`;
  }

  function populateFilters() {
    const sourceFilter = $("#sourceFilter");
    const opportunityFilter = $("#opportunityFilter");
    const sourceValue = sourceFilter.value;
    const opportunityValue = opportunityFilter.value;
    const sources = [...new Set(state.records.map((r) => r.sourceType).filter(Boolean))].sort();
    const opportunities = [...new Set(state.records.map((r) => r.opportunity).filter(Boolean))].sort();
    sourceFilter.innerHTML = `<option value="all">All source types</option>${sources.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
    opportunityFilter.innerHTML = `<option value="all">All opportunities</option>${opportunities.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
    if (sources.includes(sourceValue)) sourceFilter.value = sourceValue;
    if (opportunities.includes(opportunityValue)) opportunityFilter.value = opportunityValue;
  }

  function filteredRecords() {
    const query = $("#evidenceSearch").value.trim().toLowerCase();
    const scope = $("#scopeFilter").value;
    const source = $("#sourceFilter").value;
    const opportunity = $("#opportunityFilter").value;
    return state.records.filter((record) => {
      if (scope !== "all" && record.scope !== scope) return false;
      if (source !== "all" && record.sourceType !== source) return false;
      if (opportunity !== "all" && record.opportunity !== opportunity) return false;
      if (!query) return true;
      const haystack = [record.text, record.source, record.sourceType, record.opportunity, record.queryBehavior, record.failureMode, record.workaround, ...(record.remembered || []), ...(record.forgotten || [])].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }

  function renderEvidence() {
    const records = filteredRecords();
    $("#resultCount").textContent = `${records.length} record${records.length === 1 ? "" : "s"}`;
    $("#evidenceList").innerHTML = records.length ? records.map((record) => `<article class="evidence-card ${record.id === state.selectedId ? "selected" : ""}" data-id="${escapeHtml(record.id)}" tabindex="0">
      <div class="evidence-meta"><span class="scope-pill ${escapeHtml(record.scope)}">${escapeHtml(record.scope.replaceAll("_", " "))}</span><span>${escapeHtml(record.source)}</span><span>•</span><span>${escapeHtml(record.date || "Undated")}</span></div>
      <p>${escapeHtml(record.text)}</p>
      <div class="evidence-tags"><span class="tag">${escapeHtml(record.opportunity || "Unclassified")}</span><span class="tag">${escapeHtml(window.FAILURE_LABELS?.[record.failureMode] || titleCase(record.failureMode))}</span><span class="tag">${Math.round(Number(record.confidence || 0) * 100)}% confidence</span></div>
    </article>`).join("") : `<div class="empty-state"><span>⌕</span><h3>No evidence matches</h3><p>Try widening the scope or clearing a filter.</p></div>`;
    $$(".evidence-card").forEach((card) => {
      const select = () => selectEvidence(card.dataset.id);
      card.addEventListener("click", select);
      card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") select(); });
    });
    if (state.selectedId && !records.some((record) => record.id === state.selectedId)) {
      state.selectedId = null;
      $("#detailPanel").innerHTML = `<div class="empty-state"><span>⌕</span><h3>Select an evidence card</h3><p>The extracted cue, behaviour, failure, impact, and source trail will appear here.</p></div>`;
    }
  }

  function selectEvidence(id) {
    const record = state.records.find((item) => item.id === id);
    if (!record) return;
    state.selectedId = id;
    $$(".evidence-card").forEach((card) => card.classList.toggle("selected", card.dataset.id === id));
    const safeUrl = /^https?:\/\//i.test(record.url || "") ? record.url : "";
    $("#detailPanel").innerHTML = `
      <div class="detail-source"><span>${escapeHtml(record.id)} • ${escapeHtml(record.sourceType || "Source")}</span><span>${escapeHtml(record.date || "Undated")}</span></div>
      <h2 class="detail-title">${escapeHtml(record.opportunity || "Unclassified evidence")}</h2>
      <span class="scope-pill ${escapeHtml(record.scope)}">${escapeHtml(record.scope.replaceAll("_", " "))}</span>
      <blockquote class="detail-quote">${escapeHtml(record.text)}</blockquote>
      <div class="detail-section cue-pair">
        <div class="cue-box remember"><strong>Remembered</strong><ul>${(record.remembered || []).map((cue) => `<li>+ ${escapeHtml(cue)}</li>`).join("")}</ul></div>
        <div class="cue-box forget"><strong>Forgotten / uncertain</strong><ul>${(record.forgotten || []).map((cue) => `<li>− ${escapeHtml(cue)}</li>`).join("")}</ul></div>
      </div>
      <div class="detail-section"><h4>Observed behaviour</h4><p>${escapeHtml(record.queryBehavior || "Not stated")}</p></div>
      <div class="detail-section"><h4>Failure and workaround</h4><p><strong>${escapeHtml(window.FAILURE_LABELS?.[record.failureMode] || titleCase(record.failureMode))}</strong> — ${escapeHtml(record.workaround || "No workaround stated")}</p></div>
      <div class="detail-section"><h4>Why it is classified this way</h4><p>${escapeHtml(record.relevanceReason || "Requires manual review")}</p></div>
      <div class="detail-section impact-row">
        <div class="impact-cell"><strong>${Number(record.effort || 0)}/5</strong><small>effort</small></div>
        <div class="impact-cell"><strong>${Number(record.severity || 0)}/5</strong><small>severity</small></div>
        <div class="impact-cell"><strong>${Math.round(Number(record.confidence || 0) * 100)}%</strong><small>confidence</small></div>
      </div>
      ${safeUrl ? `<a class="button secondary source-link" href="${escapeHtml(safeUrl)}" target="_blank" rel="noreferrer">Open public source ↗</a>` : ""}`;
  }

  function parseCsv(text) {
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
    if (!lines.length) return [];
    const parseLine = (line) => {
      const cells = [];
      let current = "";
      let quoted = false;
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"') { current += '"'; i += 1; }
        else if (char === '"') quoted = !quoted;
        else if (char === "," && !quoted) { cells.push(current.trim()); current = ""; }
        else current += char;
      }
      cells.push(current.trim());
      return cells;
    };
    const headers = parseLine(lines.shift()).map((header) => header.toLowerCase().replace(/\s+/g, ""));
    return lines.map((line, index) => {
      const cells = parseLine(line);
      const row = Object.fromEntries(headers.map((header, i) => [header, cells[i] || ""]));
      return { id: `U-${String(index + 1).padStart(3, "0")}`, text: row.text || row.feedback || row.comment || row.review || cells[0], source: row.source || "Uploaded file", url: row.url || "", date: row.date || "", sourceType: row.sourcetype || row.platform || "Uploaded research" };
    }).filter((row) => row.text);
  }

  async function readUpload(file) {
    const text = await file.text();
    const name = file.name.toLowerCase();
    if (name.endsWith(".json")) {
      const parsed = JSON.parse(text);
      const rows = Array.isArray(parsed) ? parsed : parsed.records || parsed.data || [];
      return rows.map((row, index) => ({ id: row.id || `U-${String(index + 1).padStart(3, "0")}`, text: row.text || row.feedback || row.comment || row.review || "", source: row.source || "Uploaded JSON", url: row.url || "", date: row.date || "", sourceType: row.sourceType || row.platform || "Uploaded research" })).filter((row) => row.text);
    }
    if (name.endsWith(".csv")) return parseCsv(text);
    return text.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => ({ id: `U-${String(index + 1).padStart(3, "0")}`, text: line.trim(), source: file.name, url: "", date: "", sourceType: "Uploaded research" }));
  }

  function recordsFromPaste() {
    return $("#rawInput").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((text, index) => ({ id: `P-${String(index + 1).padStart(3, "0")}`, text, source: "Pasted research", url: "", date: new Date().toISOString().slice(0, 10), sourceType: "Primary or pasted research" }));
  }

  async function recordsFromUrls() {
    const urls = $("#urlInput").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!urls.length) return [];
    const response = await fetch("/api/ingest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not import the URLs");
    return data.records || [];
  }

  function localCode(records) {
    const cueRules = [
      ["person", /\b(person|friend|mother|father|daughter|son|wife|husband|kid|child|baby|family|face|dog|cat|pet)\b/i],
      ["place", /\b(place|cafe|restaurant|beach|hotel|trip|travel|goa|city|location|mountain|home|house)\b/i],
      ["object", /\b(object|bike|car|medicine|tablet|ticket|receipt|dress|shirt|note|food|window|document)\b/i],
      ["visible text", /\b(text|word|written|screenshot|document|receipt|ticket|slide)\b/i],
      ["event", /\b(event|birthday|wedding|graduation|festival|party|trip|vacation)\b/i],
      ["visual appearance", /\b(color|yellow|red|blue|small|large|blurry|looked|wearing|background|shape)\b/i],
      ["purpose", /\b(needed|show|buy|doctor|medicine|proof|remember|sent|shared)\b/i],
      ["approximate time", /\b(last year|years ago|old|recent|summer|winter|month|week|day)\b/i]
    ];
    return records.map((raw, index) => {
      const text = raw.text || "";
      const lower = text.toLowerCase();
      const deletion = /delete|deleted|trash|restore|recover|backup|backed up|sync|missing from account|storage full/.test(lower);
      const retrieval = /find|search|look for|looking for|scroll|retrieve|locate|remember|can't find|cannot find|show me/.test(lower);
      const uncertainty = /don't remember|do not remember|can't remember|cannot remember|not sure|roughly|around|old|years ago|last year|which app|which account|vague|somewhere/.test(lower);
      const cues = cueRules.filter(([, regex]) => regex.test(text)).map(([label]) => label);
      const forgotten = [];
      if (/date|when|year|month|day/.test(lower) || uncertainty) forgotten.push("exact date");
      if (/where|location|place/.test(lower) || uncertainty) forgotten.push("exact location");
      if (/word|text|called|name/.test(lower) || uncertainty) forgotten.push("exact wording");
      if (/app|account|sent|shared|download/.test(lower)) forgotten.push("source or account");
      if (!forgotten.length) forgotten.push("metadata not stated");
      let opportunity = "Query repair and cue elicitation";
      let failureMode = "no_recovery_path";
      let mediaType = "Photo or video";
      if (/screenshot|receipt|ticket|document|text|slide/.test(lower)) { opportunity = "Screenshot and document cue recovery"; failureMode = "hidden_query_syntax"; mediaType = "Screenshot or document"; }
      else if (/person|friend|daughter|son|family|face|dog|cat|pet/.test(lower)) { opportunity = "Person-identity recovery"; failureMode = "entity_recognition_gap"; mediaType = "People or pet media"; }
      else if (/date|when|year|month|day|summer|winter|years ago|last year/.test(lower)) { opportunity = "Temporal uncertainty recovery"; failureMode = "metadata_uncertainty"; }
      else if (/similar|related|another photo|nearby|before|after/.test(lower)) { opportunity = "Anchor-based retrieval"; failureMode = "metadata_uncertainty"; }
      else if (cues.length >= 3) { opportunity = "Episodic clue composition"; failureMode = "episodic_cue_mismatch"; }
      else if (cues.includes("object") || cues.includes("visual appearance") || cues.includes("place")) { opportunity = "Descriptive cue translation"; failureMode = "vocabulary_mismatch"; }
      const scope = deletion ? "out_of_scope" : retrieval && (uncertainty || cues.length > 0) ? "in_scope" : "adjacent";
      return {
        ...raw,
        id: raw.id || `N-${String(index + 1).padStart(3, "0")}`,
        scope,
        mediaType,
        remembered: cues.length ? cues : ["target exists"],
        forgotten: [...new Set(forgotten)],
        queryBehavior: /scroll/.test(lower) ? "Manual timeline scrolling" : /search|find|locate/.test(lower) ? "Search with remembered clues" : "Retrieval attempt not fully stated",
        failureMode: deletion ? "backup_or_sync_state" : failureMode,
        opportunity: deletion ? "Excluded: availability and backup" : opportunity,
        workaround: /scroll/.test(lower) ? "Scroll the timeline" : "Try another cue or surface",
        outcome: /found|success|worked/.test(lower) ? "success" : "unresolved",
        effort: /hours|forever|endless|many times|repeated/.test(lower) ? 5 : /scroll|multiple|again|retry/.test(lower) ? 4 : 3,
        severity: /important|urgent|devastated|critical|medicine|proof/.test(lower) ? 5 : /frustrat|annoy|hard|cannot|can't/.test(lower) ? 4 : 3,
        abandoned: /gave up|give up|stopped|abandon/.test(lower),
        confidence: scope === "in_scope" ? .71 : .83,
        relevanceReason: deletion ? "The story concerns content availability, deletion, backup, or sync rather than incomplete-memory retrieval." : scope === "in_scope" ? "The story combines a remembered target or cue with uncertainty and a retrieval barrier." : "The record affects retrieval but does not clearly describe an incomplete-memory episode."
      };
    });
  }

  async function analyze() {
    const button = $("#analyzeButton");
    let rawRecords = [];
    try {
      if (state.inputMode === "paste") rawRecords = recordsFromPaste();
      else if (state.inputMode === "upload") rawRecords = state.uploadedRecords;
      else rawRecords = await recordsFromUrls();
      if (!rawRecords.length) { showToast("Add at least one feedback item first"); return; }
      button.disabled = true;
      button.innerHTML = "<span>✦</span> Coding evidence…";
      setStatus("Analyzing", true);
      let coded;
      let mode = "transparent local coder";
      try {
        const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ records: rawRecords.slice(0, 80) }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "AI analysis unavailable");
        coded = data.records;
        state.lastMemo = data.memo || "";
        mode = data.mode || "AI-coded";
      } catch (error) {
        coded = localCode(rawRecords);
        showToast("Server AI is not configured; used the transparent local coder");
      }
      state.records = coded;
      state.analysisMode = mode;
      state.selectedId = null;
      refreshDashboard();
      setStatus("Analysis ready");
      switchView("overview");
      $("#findings-title").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      showToast(error.message || "Could not analyze this input");
      setStatus("Demo ready");
    } finally {
      button.disabled = false;
      button.innerHTML = "<span>✦</span> Analyze with AI";
    }
  }

  function researchMemo() {
    if (state.lastMemo) return state.lastMemo;
    const core = inScope();
    const opportunities = summarizeOpportunities();
    const top = opportunities.slice(0, 3);
    const remembered = cueCounts("remembered").slice(0, 3).map(([cue, count]) => `${cue} (${count})`).join(", ");
    const forgotten = cueCounts("forgotten").slice(0, 3).map(([cue, count]) => `${cue} (${count})`).join(", ");
    return `RECALL LENS — RESEARCH MEMO\n\nWorking set: ${state.records.length} records; ${core.length} core incomplete-memory retrieval incidents. Public-source counts are directional and are not prevalence estimates.\n\nStrongest remembered cues: ${remembered || "insufficient evidence"}.\nMost common missing or uncertain cues: ${forgotten || "insufficient evidence"}.\n\nPriority areas for deeper validation:\n${top.map((item, index) => `${index + 1}. ${item.name} — score ${item.score}; ${item.count} evidence records; ${item.sources} source types; average effort ${item.avgEffort.toFixed(1)}/5.`).join("\n")}\n\nInterpretation: The current evidence suggests that retrieval breaks when natural autobiographical or visual cues do not map to indexed metadata, and when the interface gives users no clear way to add or repair a clue. The next research step is to validate reach, frequency, and segment concentration through the survey, then use interviews and live retrieval tasks to expose root causes.\n\nLimitations: self-selected public posters, incomplete source coverage, no population denominator, and AI coding uncertainty. Review low-confidence and high-severity records manually.`;
  }

  function workflowText() {
    return `THE DISCOVERY ENGINE CONVERTS NOISY PUBLIC FEEDBACK INTO COMPARABLE RETRIEVAL OPPORTUNITIES\n\nInputs: Public discussions, support threads, app reviews, comments, survey verbatims, and interview notes.\n\nAI pipeline: Collect → normalize and de-duplicate → scope gate → structured behavioural coding → confidence review → clustering and comparison.\n\nThe scope gate retains only incomplete-memory retrieval evidence and separates backup, deletion, storage, and generic performance issues.\n\nOutputs: Cue-gap map, retrieval-failure taxonomy, behaviour patterns, ranked opportunity areas, counterevidence, and traceable evidence cards.\n\nHuman control: Every insight links to evidence; low-confidence, contradictory, and high-severity records require review.\n\nDecision use: Findings guide target-segment hypotheses, interview sampling, root-cause exploration, and opportunity sizing. The score prioritizes research attention—it does not select a solution.`;
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function csvEscape(value) {
    const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
  }

  function exportCsv() {
    const fields = ["id", "source", "sourceType", "date", "url", "text", "scope", "mediaType", "remembered", "forgotten", "queryBehavior", "failureMode", "opportunity", "workaround", "outcome", "effort", "severity", "abandoned", "confidence", "relevanceReason"];
    const rows = [fields.join(","), ...state.records.map((record) => fields.map((field) => csvEscape(record[field])).join(","))];
    download("recall-lens-evidence.csv", rows.join("\n"), "text/csv;charset=utf-8");
  }

  function exportJson() {
    const payload = { exportedAt: new Date().toISOString(), mode: state.analysisMode, note: "Directional discovery evidence; not prevalence.", opportunities: summarizeOpportunities().map(({ items, ...summary }) => summary), records: state.records };
    download("recall-lens-findings.json", JSON.stringify(payload, null, 2), "application/json");
  }

  async function copyText(text, success) {
    try { await navigator.clipboard.writeText(text); showToast(success); }
    catch { download("recall-lens-note.txt", text, "text/plain"); showToast("Clipboard unavailable; downloaded as text"); }
  }

  function loadDemo() {
    state.records = clone(window.SEED_EVIDENCE || []);
    state.analysisMode = "seeded public demo";
    state.selectedId = null;
    state.lastMemo = "";
    refreshDashboard();
    renderEvidence();
    setStatus("Demo ready");
    showToast("Public evidence demo reloaded");
  }

  function bindEvents() {
    $$(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.tab)));
    $$('[data-jump="evidence"]').forEach((button) => button.addEventListener("click", () => switchView("evidence")));
    $("#openWorkbench").addEventListener("click", () => $("#workbench").scrollIntoView({ behavior: "smooth", block: "start" }));
    $("#loadDemo").addEventListener("click", loadDemo);
    $$("[data-input-tab]").forEach((button) => button.addEventListener("click", () => {
      state.inputMode = button.dataset.inputTab;
      $$("[data-input-tab]").forEach((item) => item.classList.toggle("active", item === button));
      $$("[data-input-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.inputPanel === state.inputMode));
    }));
    $("#fileInput").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        state.uploadedRecords = await readUpload(file);
        $("#fileFeedback").textContent = `${file.name}: ${state.uploadedRecords.length} usable records ready`;
        showToast(`${state.uploadedRecords.length} records loaded`);
      } catch (error) {
        state.uploadedRecords = [];
        $("#fileFeedback").textContent = `Could not read ${file.name}: ${error.message}`;
      }
    });
    $("#clearInput").addEventListener("click", () => {
      $("#rawInput").value = "";
      $("#urlInput").value = "";
      $("#fileInput").value = "";
      $("#fileFeedback").textContent = "";
      state.uploadedRecords = [];
    });
    $("#analyzeButton").addEventListener("click", analyze);
    ["#evidenceSearch", "#scopeFilter", "#sourceFilter", "#opportunityFilter"].forEach((selector) => $(selector).addEventListener(selector === "#evidenceSearch" ? "input" : "change", renderEvidence));
    $("#exportCsv").addEventListener("click", exportCsv);
    $("#exportJson").addEventListener("click", exportJson);
    $("#copyMemo").addEventListener("click", () => copyText(researchMemo(), "Research memo copied"));
    $("#copyWorkflow").addEventListener("click", () => copyText(workflowText(), "One-slide workflow copied"));
    const popover = $("#exportPopover");
    $("#exportMenuButton").addEventListener("click", (event) => { event.stopPropagation(); popover.hidden = !popover.hidden; });
    document.addEventListener("click", () => { popover.hidden = true; });
    popover.addEventListener("click", (event) => event.stopPropagation());
    $$('[data-export]').forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.export === "json") exportJson();
      if (button.dataset.export === "csv") exportCsv();
      if (button.dataset.export === "memo") copyText(researchMemo(), "Research memo copied");
      popover.hidden = true;
    }));
  }

  bindEvents();
  refreshDashboard();
  renderEvidence();
})();

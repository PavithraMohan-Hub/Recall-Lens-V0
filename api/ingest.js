const allowedHosts = [
  "reddit.com", "www.reddit.com", "old.reddit.com",
  "support.google.com", "play.google.com",
  "apps.apple.com", "youtube.com", "www.youtube.com", "youtu.be",
  "theverge.com", "www.theverge.com", "wired.com", "www.wired.com",
  "techradar.com", "www.techradar.com"
];

function isAllowed(url) {
  return url.protocol === "https:" && allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function extract(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/<[^>]+>/g, " ");
  const description = html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)["']/i)?.[1]
    || "";
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(`${title}. ${description}. ${body}`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 9000);
}

function sourceType(hostname) {
  if (hostname.includes("reddit")) return "Reddit";
  if (hostname === "support.google.com") return "Support forum";
  if (hostname === "play.google.com") return "Google Play review page";
  if (hostname === "apps.apple.com") return "App Store review page";
  if (hostname.includes("youtube") || hostname === "youtu.be") return "YouTube";
  return "Public article or forum";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const inputs = Array.isArray(req.body?.urls) ? req.body.urls.slice(0, 10) : [];
  if (!inputs.length) return res.status(400).json({ error: "Provide at least one public URL." });

  const records = [];
  const errors = [];
  for (let index = 0; index < inputs.length; index += 1) {
    try {
      const url = new URL(inputs[index]);
      if (!isAllowed(url)) throw new Error("Host is not on the public-source allowlist");
      const response = await fetch(url.toString(), {
        redirect: "follow",
        headers: { "User-Agent": "RecallLensResearch/1.0 (+public product research demo)", "Accept": "text/html,application/xhtml+xml" },
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) throw new Error(`Source returned ${response.status}`);
      const length = Number(response.headers.get("content-length") || 0);
      if (length > 2000000) throw new Error("Page is too large to import safely");
      const html = (await response.text()).slice(0, 1200000);
      const text = extract(html);
      if (text.length < 40) throw new Error("No readable public text was found");
      records.push({
        id: `W-${String(index + 1).padStart(3, "0")}`,
        text,
        source: url.hostname,
        sourceType: sourceType(url.hostname),
        url: url.toString(),
        date: ""
      });
    } catch (error) {
      errors.push({ url: String(inputs[index]), error: error.message });
    }
  }
  if (!records.length) return res.status(422).json({ error: errors[0]?.error || "No URLs could be imported.", errors });
  return res.status(200).json({ records, errors });
}

import "server-only";

// Jedan poziv Claude-u (Messages API) preko ANTHROPIC_API_KEY — koriste ga
// AI uvoz proizvoda (aiImport.ts) i prevod recenzija (sourceReviews.ts).

const MODEL = "claude-sonnet-5-5";

export async function callClaude(
  prompt: string,
  opts: { maxTokens?: number; timeoutMs?: number } = {}
): Promise<{ ok: true; text: string; truncated: boolean } | { ok: false; error: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY nije postavljen." };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 45000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        // Dovoljno prostora za CIJELU stranicu (naslov + svi blokovi) —
        // premalo ovdje znači da Claude prekine odgovor NA POLA RIJEČI
        // (viđeno uživo: "1x Cr" umjesto "1x Crawly Crab igračka"), što
        // pokvari baš zadnji dio stranice bez ikakve vidljive greške.
        max_tokens: opts.maxTokens ?? 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      const msg = json?.error?.message || `HTTP ${res.status}`;
      return { ok: false, error: msg };
    }
    const text = (json.content ?? [])
      .filter((b: { type?: string }) => b.type === "text")
      .map((b: { text?: string }) => b.text ?? "")
      .join("\n");
    if (!text.trim()) return { ok: false, error: "Claude je vratio prazan odgovor." };
    return { ok: true, text, truncated: json.stop_reason === "max_tokens" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: /abort/i.test(msg) ? "Claude ne odgovara (timeout)." : msg };
  } finally {
    clearTimeout(timer);
  }
}

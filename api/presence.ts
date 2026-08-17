/**
 * Live-viewer presence, for Vercel.
 *
 * Vercel functions are stateless — instances are created, reused and discarded
 * per request, so a module-level counter would report a different (and wrong)
 * number depending on which instance answered. Presence therefore lives in a
 * Redis sorted set: member = tab id, score = last-seen epoch ms.
 *
 *   ZADD              presence <now> <id>          record this beat
 *   ZREMRANGEBYSCORE  presence 0 <now - WINDOW>    evict anyone gone quiet
 *   ZCARD             presence                     whoever is left is online
 *
 * The window is deliberately longer than the client's 20s heartbeat so one
 * dropped request does not make somebody vanish and reappear.
 *
 * Talks to Upstash over its REST API with plain fetch, so this file needs no
 * dependencies and runs on the edge runtime. Vercel's own KV integration sets
 * KV_REST_API_*; a direct Upstash integration sets UPSTASH_REDIS_REST_*. Both
 * are accepted. With neither set the endpoint reports itself unconfigured and
 * the UI simply shows no number.
 */

export const config = { runtime: "edge" };

const WINDOW_MS = 45_000;
const KEY = "rasta:presence";

const REST_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const REST_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      // A count seconds out of date is useless, and this is per-visitor state.
      "cache-control": "no-store, max-age=0",
    },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  if (!REST_URL || !REST_TOKEN) {
    // 200 rather than 500: an unprovisioned store is a deployment state, not a
    // failure the browser should retry against or log noisily.
    return json({ online: null, reason: "presence store not configured" });
  }

  let id = "";
  try {
    const body = (await request.json()) as { id?: unknown };
    if (typeof body?.id === "string") id = body.id.slice(0, 64);
  } catch {
    // fall through to the guard below
  }
  if (!id) return json({ error: "missing id" }, 400);

  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  try {
    // One pipelined round trip rather than three separate ones.
    const response = await fetch(`${REST_URL}/pipeline`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${REST_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify([
        ["ZADD", KEY, String(now), id],
        ["ZREMRANGEBYSCORE", KEY, "0", String(cutoff)],
        ["ZCARD", KEY],
        // Belt and braces: if every client disappears the key expires by itself
        // rather than lingering as an empty set.
        ["EXPIRE", KEY, "120"],
      ]),
    });

    if (!response.ok) return json({ online: null }, 200);

    const results = (await response.json()) as Array<{ result?: unknown }>;
    const card = results?.[2]?.result;
    const online = typeof card === "number" ? card : Number(card);

    return json({ online: Number.isFinite(online) ? online : null });
  } catch {
    return json({ online: null }, 200);
  }
}

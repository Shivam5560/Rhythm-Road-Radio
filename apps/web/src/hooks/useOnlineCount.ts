import { useEffect, useRef, useState } from "react";

const HEARTBEAT_MS = 20_000;
const ENDPOINT = "/api/presence";

/**
 * Live count of people currently on the page.
 *
 * Presence is a heartbeat, not a connection: every client pings `/api/presence`
 * with a stable per-tab id, and the server keeps a sorted set scored by last-seen
 * timestamp, dropping anything older than its window. That survives Vercel's
 * stateless functions, which cannot hold a connection or a counter in memory —
 * each request may land on a different instance.
 *
 * Returns `null` until the first successful reply, and stays `null` for good if
 * the endpoint is missing or the store is not configured. The caller must render
 * nothing in that case: a fabricated or stale "online" number is worse than no
 * number at all, so there is deliberately no fallback value here.
 */
export function useOnlineCount(): number | null {
  const [online, setOnline] = useState<number | null>(null);
  const sessionId = useRef<string>("");

  if (!sessionId.current) {
    // One id per tab. sessionStorage (not localStorage) so two tabs count as
    // two people, which is what "online now" should mean, and so the id dies
    // with the tab rather than lingering across visits.
    const existing = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("rasta:sid") : null;
    const id = existing ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
    if (!existing && typeof sessionStorage !== "undefined") sessionStorage.setItem("rasta:sid", id);
    sessionId.current = id;
  }

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const beat = async () => {
      // A backgrounded tab stops beating, so it ages out of the window on its
      // own — otherwise every abandoned tab would inflate the count forever.
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: sessionId.current }),
        });
        if (!response.ok) return;
        const data: unknown = await response.json();
        const count = (data as { online?: unknown })?.online;
        if (!cancelled && typeof count === "number" && Number.isFinite(count)) {
          setOnline(Math.max(1, Math.floor(count)));
        }
      } catch {
        // Offline, blocked, or no endpoint deployed — stay silent and keep the
        // last known value rather than flashing the pill in and out.
      }
    };

    void beat();
    timer = window.setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", beat);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, []);

  return online;
}

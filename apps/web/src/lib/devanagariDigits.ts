const DEVANAGARI = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/**
 * Rewrites ASCII digits into Devanagari ones so the chrome never mixes scripts.
 * The page is set entirely in Devanagari; a Latin "04:12" in the player was the
 * last thing breaking that, and a single script is what makes the type read as
 * deliberate rather than defaulted.
 *
 * Only 0-9 are touched — separators like ":" and "/" pass through untouched, so
 * this is safe to wrap around already-formatted output such as formatTime().
 */
export function toDevanagariDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => DEVANAGARI[Number(digit)]);
}

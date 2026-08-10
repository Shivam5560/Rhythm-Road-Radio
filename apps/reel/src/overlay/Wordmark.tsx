import { shirorekhaClip } from "../lib/reveal";

export interface WordmarkProps {
  progress: number;
  displayFamily: string;
  bodyFamily: string;
  fontSize: number;
}

/** `रास्ता रेडियो`, matching the site's `.brand-mark` treatment. */
export function Wordmark({ progress, displayFamily, bodyFamily, fontSize }: WordmarkProps) {
  const clip = shirorekhaClip(progress);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        clipPath: `inset(0 ${clip.right}% ${clip.bottom}% 0)`,
        color: "#fff4e8",
      }}
    >
      <span style={{ fontFamily: displayFamily, fontSize }}>रास्ता</span>
      <span style={{ fontFamily: bodyFamily, fontSize: fontSize * 0.42, fontWeight: 700, letterSpacing: 1 }}>
        रेडियो
      </span>
    </div>
  );
}

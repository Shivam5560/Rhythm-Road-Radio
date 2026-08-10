import { shirorekhaClip, wordStagger } from "../lib/reveal";

export interface HindiHeroProps {
  text: string;
  /** 0..1 through the reveal. */
  progress: number;
  fontFamily: string;
  fontSize: number;
  width: number;
  color?: string;
}

export function HindiHero({ text, progress, fontFamily, fontSize, width, color = "#fff4e8" }: HindiHeroProps) {
  const clip = shirorekhaClip(progress);
  const words = text.split(" ");

  return (
    <div
      style={{
        width,
        clipPath: `inset(0 ${clip.right}% ${clip.bottom}% 0)`,
        fontFamily,
        fontSize,
        lineHeight: 1.08,
        color,
        textShadow: "0 4px 28px rgba(0,0,0,.45)",
        display: "flex",
        flexWrap: "wrap",
        columnGap: "0.28em",
      }}
    >
      {words.map((word, i) => {
        const t = wordStagger(i, words.length, progress);
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              transform: `translateY(${(1 - t) * -0.14 * fontSize}px)`,
              opacity: 0.35 + t * 0.65,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

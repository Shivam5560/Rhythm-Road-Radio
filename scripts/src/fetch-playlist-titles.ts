import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const playlistUrl = process.argv[2];
const outputPath = process.argv[3];

if (!playlistUrl || !outputPath) {
  console.error("Usage: tsx src/fetch-playlist-titles.ts <playlist-url> <output-json-path>");
  process.exit(1);
}

const result = spawnSync("yt-dlp", ["--flat-playlist", "-J", playlistUrl], {
  encoding: "utf-8",
  maxBuffer: 1024 * 1024 * 64,
});

if (result.status !== 0) {
  console.error(result.stderr || "yt-dlp failed. Is it installed? Try: pip install yt-dlp");
  process.exit(1);
}

type YtDlpEntry = { id: string; title: string; channel?: string; uploader?: string };
const parsed = JSON.parse(result.stdout) as { entries: YtDlpEntry[] };

const tracks = parsed.entries.map((entry) => ({
  videoId: entry.id,
  rawTitle: entry.title,
  rawChannel: entry.channel ?? entry.uploader ?? "",
}));

writeFileSync(outputPath, JSON.stringify(tracks, null, 2), "utf-8");
console.log(`Wrote ${tracks.length} tracks to ${outputPath}`);

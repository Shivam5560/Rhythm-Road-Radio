import { createRoot } from "react-dom/client";
import "./index.css";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";

function Harness() {
  const player = useYouTubePlayer("PLfcRxVaMQ7ZM", {});
  return (
    <div style={{ color: "#fff4e8", padding: 24, fontFamily: "sans-serif" }}>
      <p>{player.title || "(loading…)"} — {player.artist}</p>
      <p>{player.isPlaying ? "playing" : "paused"} · shuffle: {player.shuffled ? "on" : "off"}</p>
      <button onClick={player.play}>play</button>
      <button onClick={player.pause}>pause</button>
      <button onClick={player.previous}>prev</button>
      <button onClick={player.next}>next</button>
      <button onClick={player.toggleShuffle}>toggle shuffle</button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Harness />);

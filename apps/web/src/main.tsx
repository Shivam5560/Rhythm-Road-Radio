import { createRoot } from "react-dom/client";
import "./index.css";
import { IndianPlaylist } from "./components/mockups/indian-playlist/IndianPlaylist";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(
  <>
    <IndianPlaylist />
    <Analytics />
  </>
);

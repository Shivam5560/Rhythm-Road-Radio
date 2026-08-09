import { createRoot } from "react-dom/client";
import "./index.css";
import { IndianPlaylist } from "./components/mockups/indian-playlist/IndianPlaylist";

createRoot(document.getElementById("root")!).render(<IndianPlaylist />);

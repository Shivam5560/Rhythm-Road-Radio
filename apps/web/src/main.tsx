import { createRoot } from "react-dom/client";
import "./index.css";

function BootPlaceholder() {
  return (
    <div style={{ color: "#fff4e8", padding: 24, fontFamily: "sans-serif" }}>
      रास्ता रेडियो — scaffold booted
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<BootPlaceholder />);

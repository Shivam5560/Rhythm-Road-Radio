import { X } from "lucide-react";
import type { TrackMap } from "../../../lib/trackMetadata";
import { toDevanagariDigits } from "../../../lib/devanagariDigits";

export function PlaylistSheet({
  open,
  onClose,
  queueIds,
  trackMap,
  currentVideoId,
  onSelect,
  heading,
}: {
  open: boolean;
  onClose: () => void;
  queueIds: string[];
  trackMap: TrackMap;
  currentVideoId: string | null;
  onSelect: (index: number) => void;
  heading: string;
}) {
  if (!open) return null;
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{heading}</h2>
          <button className="sheet-close" aria-label="सूची बंद करें" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="sheet-list">
          {queueIds.length === 0 && <p className="sheet-empty">प्लेलिस्ट लोड हो रही है…</p>}
          {queueIds.map((id, index) => {
            const info = trackMap[id];
            const active = id === currentVideoId;
            return (
              <button
                key={`${id}-${index}`}
                className={`sheet-row ${active ? "sheet-row-active" : ""}`}
                onClick={() => onSelect(index)}
              >
                <span className="sheet-row-index">{toDevanagariDigits(String(index + 1).padStart(2, "0"))}</span>
                <span className="sheet-row-copy">
                  <strong>{info?.title ?? "—"}</strong>
                  <small>{info?.artist ?? ""}</small>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

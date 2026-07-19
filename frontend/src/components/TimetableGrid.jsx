import { useState, useMemo } from "react";
import BASE_URL from "../api";
import EditSlotModal from "./EditSlotModal";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const times = ["8-9","9-10","10-11","11-12","12-1","1-2","2-3","3-4","4-5","5-6"];
const dayColors = {
  Mon: { bg: "#eff6ff", color: "#1d4ed8" }, Tue: { bg: "#f5f3ff", color: "#6d28d9" },
  Wed: { bg: "#ecfdf5", color: "#065f46" }, Thu: { bg: "#fffbeb", color: "#92400e" },
  Fri: { bg: "#fff1f2", color: "#9f1239" }, Sat: { bg: "#f1f5f9", color: "#475569" },
};
const subBatchStyles = {
  A1: { card: { background: "#f0fdf4", border: "1px solid #86efac" }, dot: { background: "#4ade80" }, badge: { background: "#dcfce7", color: "#166534" } },
  A2: { card: { background: "#f5f3ff", border: "1px solid #c4b5fd" }, dot: { background: "#a78bfa" }, badge: { background: "#ede9fe", color: "#5b21b6" } },
  B1: { card: { background: "#fff7ed", border: "1px solid #fdba74" }, dot: { background: "#fb923c" }, badge: { background: "#ffedd5", color: "#9a3412" } },
  B2: { card: { background: "#fdf4ff", border: "1px solid #e879f9" }, dot: { background: "#d946ef" }, badge: { background: "#fae8ff", color: "#86198f" } },
  ALL: { card: { background: "#f0f9ff", border: "1px solid #7dd3fc" }, dot: { background: "#38bdf8" }, badge: { background: "#e0f2fe", color: "#075985" } },
};

// Assign each slot in a day to the earliest non-overlapping "track" (lane)
function assignTracks(daySlots) {
  const sorted = [...daySlots].sort((a, b) => times.indexOf(a.time) - times.indexOf(b.time));
  const tracks = [];
  sorted.forEach((slot) => {
    const startIdx = times.indexOf(slot.time);
    if (startIdx === -1) return;
    const duration = Math.max(1, Math.min(parseInt(slot.duration) || 1, times.length - startIdx));
    const endIdx = startIdx + duration;

    let track = tracks.find((t) => t[t.length - 1].endIdx <= startIdx);
    if (!track) {
      track = [];
      tracks.push(track);
    }
    track.push({ slot, startIdx, endIdx });
  });
  return tracks;
}

function SlotCard({ slot, refresh, onAdd }) {
  const [hoverAdd, setHoverAdd] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${BASE_URL}/api/slots/${slot._id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) refresh();
      else alert(data.error || "Delete error");
    } catch { alert("Server error"); }
  };

  const key = subBatchStyles[slot.subBatch] ? slot.subBatch : "ALL";
  const style = subBatchStyles[key];

  return (
    <div style={{ ...style.card, borderRadius: 8, padding: "5px 7px", boxShadow: "0 1px 2px rgba(0,0,0,.04)", fontFamily: "'DM Sans', sans-serif", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box", position: "relative" }}>

      {/* Small add button — always available, even when cell is filled */}
      <button
        onClick={(e) => { e.stopPropagation(); onAdd(); }}
        onMouseEnter={() => setHoverAdd(true)} onMouseLeave={() => setHoverAdd(false)}
        title="Add another entry at this time"
        style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", border: "none", background: hoverAdd ? "#1e293b" : "rgba(30,41,59,.15)", color: hoverAdd ? "#fff" : "#1e293b", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, padding: 0, transition: "all .15s ease", zIndex: 2 }}>
        +
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, paddingRight: 18 }}>
        <span style={{ ...style.dot, width: 6, height: 6, borderRadius: "50%", flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: "#1e293b", fontFamily: "'DM Mono', monospace" }}>
          {slot.subject_acronym || slot.subject}
        </span>
        {parseInt(slot.duration) > 1 && (
          <span style={{ marginLeft: "auto", fontSize: 8, fontWeight: 700, color: "#0f766e", background: "#ccfbf1", padding: "1px 5px", borderRadius: 20 }}>
            {slot.duration}HR
          </span>
        )}
      </div>

      <div style={{ paddingLeft: 11, display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#475569", fontWeight: 600 }}>{slot.batch}</span>
          {slot.subBatch && (
            <span style={{ ...style.badge, fontSize: 8, fontWeight: 600, padding: "1px 5px", borderRadius: 20 }}>{slot.subBatch}</span>
          )}
        </div>
        <span style={{ fontSize: 9, color: "#475569" }}>
          {slot.faculty_acronym ? `[${slot.faculty_acronym}]` : slot.faculty}
        </span>
        <span style={{ fontSize: 9, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>
          {slot.room_number || "—"}
        </span>
      </div>

      <button onClick={handleDelete}
        style={{ marginTop: 4, fontSize: 9, padding: "3px 6px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", width: "100%" }}>
        Remove
      </button>
    </div>
  );
}

function AddButton({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{ fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: hover ? "#b45309" : "#94a3b8", background: hover ? "#fffbeb" : "transparent", border: `1px dashed ${hover ? "#fde68a" : "#e2e8f0"}`, borderRadius: 6, padding: "3px 6px", cursor: "pointer", width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, transition: "all .15s ease", boxSizing: "border-box" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ fontSize: 13 }}>+</span> Add</span>
    </button>
  );
}

export default function TimetableGrid({ batch, year, slots = [], refresh }) {
  const [addTarget, setAddTarget] = useState(null); // { day, time }

  const batchSlots = useMemo(() => slots.filter((s) => s.batch === batch), [slots, batch]);

  const dayTracks = useMemo(() => {
    const map = {};
    days.forEach((day) => {
      const daySlots = batchSlots.filter((s) => s.day === day);
      map[day] = assignTracks(daySlots);
    });
    return map;
  }, [batchSlots]);

  const ROW_HEIGHT = 95;

  return (
    <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,.06)", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ minWidth: 1020 }}>

        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", background: "#1e293b" }}>
          <div style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", borderRight: "1px solid #334155", fontWeight: 500 }}>Day</div>
          {times.map((t) => (
            <div key={t} style={{ padding: "11px 6px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#cbd5e1", letterSpacing: ".06em", borderRight: "1px solid #334155", fontWeight: 500, textAlign: "center", whiteSpace: "nowrap" }}>{t}</div>
          ))}
        </div>

        {/* Day blocks */}
        {days.map((day, dayIdx) => {
          const tracks = dayTracks[day];
          const trackCount = Math.max(1, tracks.length);

          return (
            <div key={day} style={{ display: "grid", gridTemplateColumns: "80px repeat(10, 1fr)", background: dayIdx % 2 === 0 ? "#ffffff" : "rgba(248,250,252,.6)" }}>

              {/* Day label spans all tracks for this day */}
              <div style={{ gridColumn: "1", gridRow: `1 / span ${trackCount}`, padding: 10, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start" }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 7, fontFamily: "'DM Mono', monospace", background: dayColors[day]?.bg, color: dayColors[day]?.color, display: "inline-block" }}>{day}</span>
              </div>

              {Array.from({ length: trackCount }).map((_, trackIdx) => {
                const track = tracks[trackIdx] || [];
                const covered = new Set();
                track.forEach(({ startIdx, endIdx }) => {
                  for (let i = startIdx; i < endIdx; i++) covered.add(i);
                });

                return times.map((time, colIdx) => {
                  const placed = track.find((t) => t.startIdx === colIdx);

                  if (placed) {
                    const span = placed.endIdx - placed.startIdx;
                    return (
                      <div key={time} style={{ gridColumn: `${colIdx + 2} / span ${span}`, gridRow: trackIdx + 1, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", minHeight: ROW_HEIGHT, padding: 4, boxSizing: "border-box" }}>
                        <SlotCard slot={placed.slot} refresh={refresh} onAdd={() => setAddTarget({ day, time })} />
                      </div>
                    );
                  }
                  if (covered.has(colIdx)) return null; // part of another slot's span in this track

                  return (
                    <div key={time} style={{ gridColumn: colIdx + 2, gridRow: trackIdx + 1, borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", minHeight: ROW_HEIGHT, padding: 4, boxSizing: "border-box" }}>
                      <AddButton onClick={() => setAddTarget({ day, time })} />
                    </div>
                  );
                });
              })}
            </div>
          );
        })}
      </div>

      {addTarget && (
        <EditSlotModal
          day={addTarget.day}
          time={addTarget.time}
          batch={batch}
          year={year}
          slots={batchSlots.filter((s) => s.day === addTarget.day && s.time === addTarget.time)}
          onClose={() => setAddTarget(null)}
          refresh={refresh}
        />
      )}
    </div>
  );
}
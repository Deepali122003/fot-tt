import BASE_URL from "../api";
import { useState } from "react";
import EditSlotModal from "./EditSlotModal";

const subBatchStyles = {
  A1: { card: { background: "#f0fdf4", border: "1px solid #86efac" }, dot: { background: "#4ade80" }, badge: { background: "#dcfce7", color: "#166534" } },
  A2: { card: { background: "#f5f3ff", border: "1px solid #c4b5fd" }, dot: { background: "#a78bfa" }, badge: { background: "#ede9fe", color: "#5b21b6" } },
  B1: { card: { background: "#fff7ed", border: "1px solid #fdba74" }, dot: { background: "#fb923c" }, badge: { background: "#ffedd5", color: "#9a3412" } },
  B2: { card: { background: "#fdf4ff", border: "1px solid #e879f9" }, dot: { background: "#d946ef" }, badge: { background: "#fae8ff", color: "#86198f" } },
  ALL: { card: { background: "#f0f9ff", border: "1px solid #7dd3fc" }, dot: { background: "#38bdf8" }, badge: { background: "#e0f2fe", color: "#075985" } },
};

export default function SlotCell({ day, time, batch, year, slots = [], refresh }) {
  const [open, setOpen] = useState(false);
  const [hoverAdd, setHoverAdd] = useState(false);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/slots/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) refresh();
      else alert(data.error || "Delete error");
    } catch { alert("Server error"); }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 4, padding: 5 }}>
      {slots.map((slot) => {
        const key = subBatchStyles[slot.subBatch] ? slot.subBatch : "ALL";
        const style = subBatchStyles[key];
        return (
          <div key={slot._id} style={{ ...style.card, borderRadius: 8, padding: "5px 7px", boxShadow: "0 1px 2px rgba(0,0,0,.04)", fontFamily: "'DM Sans', sans-serif" }}>

            {/* Subject Acronym as main label */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <span style={{ ...style.dot, width: 6, height: 6, borderRadius: "50%", flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: "#1e293b", fontFamily: "'DM Mono', monospace" }}>
                {slot.subject_acronym || slot.subject}
              </span>
            </div>

            {/* Meta */}
            <div style={{ paddingLeft: 11, display: "flex", flexDirection: "column", gap: 1 }}>
              
              {/* Section + SubBatch */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 9, color: "#475569", fontWeight: 600 }}>{slot.batch}</span>
                {slot.subBatch && (
                  <span style={{ ...style.badge, fontSize: 8, fontWeight: 600, padding: "1px 5px", borderRadius: 20 }}>{slot.subBatch}</span>
                )}
              </div>
              {/* Faculty acronym */}
              <span style={{ fontSize: 9, color: "#475569" }}>
                {slot.faculty_acronym ? `[${slot.faculty_acronym}]` : slot.faculty}
              </span>
              {/* Room */}
              <span style={{ fontSize: 9, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>
                {slot.room_number || "—"}
              </span>
            </div>

            <button onClick={(e) => { e.stopPropagation(); handleDelete(slot._id); }}
              style={{ marginTop: 4, fontSize: 9, padding: "3px 6px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", width: "100%" }}>
              Remove
            </button>
          </div>
        );
      })}

      <button onMouseEnter={() => setHoverAdd(true)} onMouseLeave={() => setHoverAdd(false)}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        style={{ marginTop: "auto", fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: hoverAdd ? "#b45309" : "#94a3b8", background: hoverAdd ? "#fffbeb" : "transparent", border: `1px dashed ${hoverAdd ? "#fde68a" : "#e2e8f0"}`, borderRadius: 6, padding: "3px 6px", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, transition: "all .15s ease" }}>
        <span style={{ fontSize: 13 }}>+</span> Add
      </button>

      {open && <EditSlotModal day={day} time={time} batch={batch} year={year} slots={slots} onClose={() => setOpen(false)} refresh={refresh} />}
    </div>
  );
}
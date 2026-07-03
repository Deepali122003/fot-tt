import BASE_URL from "../api";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function EditSlotModal({ day, time, batch, year, slots = [], onClose, refresh }) {
  const [form, setForm] = useState({ subject: "", subject_acronym: "", faculty: "", room: "", subBatch: "" });
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/faculties`).then(r => r.json()).then(d => setFaculties(Array.isArray(d) ? d : [])).catch(console.error);
    fetch(`${BASE_URL}/api/rooms`).then(r => r.json()).then(d => setRooms(Array.isArray(d) ? d : [])).catch(console.error);
  }, []);

  const batchPrefix = batch?.match(/[A-Za-z]+$/)?.[0]?.toUpperCase() || "A";
  const subBatchOptions = [`${batchPrefix}1`, `${batchPrefix}2`];

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleAdd = async () => {
    if (!form.subject.trim() || !form.faculty.trim()) return alert("Subject and Faculty are required");
    if (!form.subject_acronym.trim()) return alert("Subject Acronym is required");
    const newSlot = {
      subject: form.subject.trim(),
      subject_acronym: form.subject_acronym.trim().toUpperCase(),
      faculty: form.faculty.trim(),
      room_id: form.room?.trim() || null,
      subBatch: form.subBatch?.trim() || null,
      day, time, batch, year,
    };
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/slots`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to add slot"); return; }
      setForm({ subject: "", subject_acronym: "", faculty: "", room: "", subBatch: "" });
      refresh(); onClose();
    } catch { alert("Server error"); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/slots/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); alert(d.error || "Delete failed"); return; }
      refresh();
    } catch { alert("Delete error"); }
  };

  const sel = { width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 13px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box", appearance: "none", cursor: "pointer" };
  const inp = { width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 13px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 };
  const Wrap = ({ children }) => <div style={{ position: "relative" }}>{children}<span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: 11 }}>▾</span></div>;

  return createPortal(
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)", fontFamily: "'DM Sans', sans-serif" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{`@keyframes esSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.es-box{animation:esSlideUp .2s ease}`}</style>

      <div className="es-box" style={{ background: "#fff", width: 480, maxWidth: "calc(100vw - 32px)", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,.3)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "#1e293b", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Edit Slot</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              {day} · {time}
              <span style={{ fontSize: 11, fontWeight: 600, background: "#fbbf24", color: "#0f172a", padding: "2px 8px", borderRadius: 20 }}>{batch}</span>
              {year && <span style={{ fontSize: 11, fontWeight: 600, background: "#334155", color: "#cbd5e1", padding: "2px 8px", borderRadius: 20 }}>Year {year}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 22 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>

          {/* Existing entries */}
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>Existing Entries</div>
          <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 2 }}>
            {slots.length === 0 ? <p style={{ fontSize: 12, color: "#94a3b8" }}>No slots assigned yet.</p> : slots.map((s) => (
              <div key={s._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "8px 12px", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#334155" }}>
                  <strong>{s.subject_acronym || s.subject}</strong>
                  {" "}{s.batch}{s.subBatch ? ` ${s.subBatch}` : ""}
                  {s.faculty_acronym ? ` [${s.faculty_acronym}]` : ` · ${s.faculty}`}
                  {s.room_number ? ` (${s.room_number})` : ""}
                </span>
                <button onClick={() => handleDelete(s._id)} style={{ fontSize: 11, fontWeight: 600, color: "#f43f5e", background: "transparent", border: "none", cursor: "pointer", padding: "3px 8px", borderRadius: 8 }}>Remove</button>
              </div>
            ))}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "16px 0" }} />
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>Add New Entry</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            {/* Subject Name */}
            <div>
              <label style={lbl}>Subject Name</label>
              <input style={inp} placeholder="e.g. Data Structures" value={form.subject} onChange={(e) => handleChange("subject", e.target.value)} />
            </div>

            {/* Subject Acronym */}
            <div>
              <label style={lbl}>Subject Acronym *</label>
              <input style={inp} placeholder="e.g. DS" value={form.subject_acronym} onChange={(e) => handleChange("subject_acronym", e.target.value.toUpperCase())} maxLength={8} />
            </div>

            {/* Faculty */}
            <div>
              <label style={lbl}>Faculty</label>
              <Wrap><select style={sel} value={form.faculty} onChange={(e) => handleChange("faculty", e.target.value)}>
                <option value="">— Select —</option>
                {faculties.map((f) => <option key={f._id} value={f.name}>{f.name}{f.acronym ? ` [${f.acronym}]` : ""}</option>)}
              </select></Wrap>
            </div>

            {/* Sub-Batch */}
            <div>
              <label style={lbl}>Sub-Batch</label>
              <Wrap><select style={sel} value={form.subBatch} onChange={(e) => handleChange("subBatch", e.target.value)}>
                <option value="">ALL</option>
                {subBatchOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select></Wrap>
            </div>

            {/* Room */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={lbl}>Room / Lab</label>
              <Wrap><select style={sel} value={form.room} onChange={(e) => handleChange("room", e.target.value)}>
                <option value="">— Select Room —</option>
                {rooms.map((r) => <option key={r._id} value={r.room_number}>{r.room_number}{r.building ? ` · ${r.building}` : ""}{r.capacity ? ` (cap: ${r.capacity})` : ""}</option>)}
              </select></Wrap>
            </div>

          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button onClick={handleAdd} disabled={loading} style={{ flex: 1, background: "#1e293b", color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              {loading ? "Adding…" : "Add Slot"}
            </button>
            <button onClick={onClose} style={{ padding: "11px 20px", border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
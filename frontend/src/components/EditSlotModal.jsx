import BASE_URL from "../api";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function EditSlotModal({ day, time, batch, slots = [], onClose, refresh }) {
  const [form, setForm] = useState({ subject: "", faculty: "", room: "", subBatch: "" });
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/faculties`)
      .then((res) => res.json())
      .then((data) => setFaculties(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch faculties", err));

    fetch(`${BASE_URL}/api/rooms`)
      .then((res) => res.json())
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch rooms", err));
  }, []);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleAdd = async () => {
    if (!form.subject.trim() || !form.faculty.trim()) {
      alert("Subject and Faculty are required");
      return;
    }
    const newSlot = {
      subject: form.subject.trim(),
      faculty: form.faculty.trim(),
      room_id: form.room?.trim() || null,
      subBatch: form.subBatch?.trim() || null,
      day, time, batch,
    };
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to add slot");
        return;
      }
      setForm({ subject: "", faculty: "", room: "", subBatch: "" });
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/slots/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Delete failed");
        return;
      }
      refresh();
    } catch (err) {
      console.error(err);
      alert("Delete error");
    }
  };

  const selectStyle = {
    width: "100%", border: "1px solid #e2e8f0", borderRadius: 12,
    padding: "9px 13px", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    color: "#1e293b", background: "#f8fafc", outline: "none",
    boxSizing: "border-box", appearance: "none", cursor: "pointer",
  };

  const inputStyle = {
    width: "100%", border: "1px solid #e2e8f0", borderRadius: 12,
    padding: "9px 13px", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box",
  };

  return createPortal(
    <div
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)",
        fontFamily: "'DM Sans', sans-serif",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes esSlideUp { from { transform:translateY(20px);opacity:0; } to { transform:translateY(0);opacity:1; } }
        .es-box { animation: esSlideUp .2s ease; }
        .es-input:focus,.es-select:focus { border-color:#fbbf24!important; box-shadow:0 0 0 3px rgba(251,191,36,.15)!important; background:#fff!important; }
      `}</style>

      <div className="es-box" style={{
        background: "#fff", width: 460, maxWidth: "calc(100vw - 32px)",
        borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,.3)", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ background: "#1e293b", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
              Edit Slot
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              {day} · {time}
              <span style={{ fontSize: 11, fontWeight: 600, background: "#fbbf24", color: "#0f172a", padding: "2px 8px", borderRadius: 20 }}>
                {batch}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 22 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>

          {/* Existing entries */}
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>
            Existing Entries
          </div>
          <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 2 }}>
            {slots.length === 0 ? (
              <p style={{ fontSize: 12, color: "#94a3b8" }}>No slots assigned yet.</p>
            ) : (
              slots.map((s) => (
                <div key={s._id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: 12, padding: "8px 12px", marginBottom: 6,
                }}>
                  <span style={{ fontSize: 11, color: "#334155" }}>
                    <strong>{s.subject}</strong>{" · "}{s.subBatch || "ALL"}{" · "}{s.faculty}{" · "}{s.room_number || s.lab_number || "—"}
                  </span>
                  <button onClick={() => handleDelete(s._id)}
                    style={{ fontSize: 11, fontWeight: 600, color: "#f43f5e", background: "transparent", border: "none", cursor: "pointer", padding: "3px 8px", borderRadius: 8 }}>
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "16px 0" }} />

          {/* Add new entry */}
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>
            Add New Entry
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            {/* Subject */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Subject</label>
              <input className="es-input" style={inputStyle} placeholder="e.g. Data Structures"
                value={form.subject} onChange={(e) => handleChange("subject", e.target.value)} />
            </div>

            {/* Faculty dropdown */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Faculty</label>
              <div style={{ position: "relative" }}>
                <select className="es-select" style={selectStyle}
                  value={form.faculty} onChange={(e) => handleChange("faculty", e.target.value)}>
                  <option value="">— Select —</option>
                  {faculties.map((f) => (
                    <option key={f._id} value={f.name}>{f.name}</option>
                  ))}
                </select>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: 11 }}>▾</span>
              </div>
            </div>

            {/* Sub-Batch dropdown */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Sub-Batch</label>
              <div style={{ position: "relative" }}>
                <select className="es-select" style={selectStyle}
                  value={form.subBatch} onChange={(e) => handleChange("subBatch", e.target.value)}>
                  <option value="">ALL</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                </select>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: 11 }}>▾</span>
              </div>
            </div>

            {/* Room dropdown */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 }}>Room / Lab</label>
              <div style={{ position: "relative" }}>
                <select className="es-select" style={selectStyle}
                  value={form.room} onChange={(e) => handleChange("room", e.target.value)}>
                  <option value="">— Select Room —</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r.room_number}>
                      {r.room_number}{r.building ? ` · ${r.building}` : ""}{r.capacity ? ` (cap: ${r.capacity})` : ""}
                    </option>
                  ))}
                </select>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: 11 }}>▾</span>
              </div>
            </div>

          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button onClick={handleAdd} disabled={loading}
              style={{ flex: 1, background: "#1e293b", color: "#fff", border: "none", borderRadius: 12, padding: "11px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              {loading ? "Adding…" : "Add Slot"}
            </button>
            <button onClick={onClose}
              style={{ padding: "11px 20px", border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
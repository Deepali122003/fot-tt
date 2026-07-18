import BASE_URL from "../api";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// ── Reusable Autocomplete Component ──
function AutoComplete({ label, placeholder, value, onChange, items, filterFn, renderItem, getValue }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim() === "" ? items : items.filter(item => filterFn(item, query));

  const inp = { width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 13px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5 };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={lbl}>{label}</label>
      <input
        style={inp}
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(""); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,.12)", zIndex: 999, maxHeight: 180, overflowY: "auto", marginTop: 4 }}>
          {filtered.map((item, i) => (
            <div key={i}
              onMouseDown={(e) => { e.preventDefault(); const val = getValue(item); setQuery(val); onChange(val); setOpen(false); }}
              style={{ padding: "9px 13px", fontSize: 12, cursor: "pointer", color: "#1e293b", borderBottom: "1px solid #f1f5f9" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditSlotModal({ day, time, batch, year, slots = [], onClose, refresh }) {
  const [form, setForm] = useState({ subject: "", subject_acronym: "", faculty: "", room: "", subBatch: "" , duration : 1});
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/faculties`).then(r => r.json()).then(d => setFaculties(Array.isArray(d) ? d : [])).catch(console.error);
    fetch(`${BASE_URL}/api/rooms`).then(r => r.json()).then(d => setRooms(Array.isArray(d) ? d : [])).catch(console.error);
    fetch(`${BASE_URL}/api/subjects`).then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : [])).catch(console.error);
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
      duration: form.duration,
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
      setForm({ subject: "", subject_acronym: "", faculty: "", room: "", subBatch: "" , duration : 1});
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

            {/* Subject Autocomplete */}
            <div style={{ gridColumn: "span 2" }}>
              <AutoComplete
                label="Subject *"
                placeholder="Search by name or code…"
                value={form.subject}
                onChange={(val) => {
                  const found = subjects.find(s => s.title === val);
                  setForm(prev => ({
                    ...prev,
                    subject: val,
                    subject_acronym: found ? found.code : prev.subject_acronym
                  }));
                }}
                items={subjects}
                filterFn={(item, q) =>
                  item.title.toLowerCase().includes(q.toLowerCase()) ||
                  item.code.toLowerCase().includes(q.toLowerCase())
                }
                renderItem={(item) => (
                  <span><strong>[{item.code}]</strong> {item.title}</span>
                )}
                getValue={(item) => item.title}
              />
            </div>

            {/* Subject Acronym (auto-filled, editable) */}
            <div>
              <label style={lbl}>Subject Code *</label>
              <input style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "9px 13px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box" }}
                placeholder="e.g. DS" value={form.subject_acronym}
                onChange={(e) => handleChange("subject_acronym", e.target.value.toUpperCase())} maxLength={8} />
            </div>

            {/* Faculty Autocomplete */}
            <div>
              <AutoComplete
                label="Faculty *"
                placeholder="Search by name or acronym…"
                value={form.faculty}
                onChange={(val) => handleChange("faculty", val)}
                items={faculties}
                filterFn={(item, q) =>
                  item.name.toLowerCase().includes(q.toLowerCase()) ||
                  (item.acronym || "").toLowerCase().includes(q.toLowerCase())
                }
                renderItem={(item) => (
                  <span><strong>{item.name}</strong>{item.acronym ? ` (${item.acronym})` : ""}</span>
                )}
                getValue={(item) => item.name}
              />
            </div>

            {/* Sub-Batch */}
            <div>
              <label style={lbl}>Sub-Batch</label>
              <Wrap><select style={sel} value={form.subBatch} onChange={(e) => handleChange("subBatch", e.target.value)}>
                <option value="">ALL</option>
                {subBatchOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select></Wrap>
            </div>

            
            {/* Room Autocomplete */}
              <div style={{ gridColumn: "span 2" }}>
                <AutoComplete
                  label="Room / Lab"
                  placeholder="Search by room number or building…"
                  value={form.room}
                  onChange={(val) => handleChange("room", val)}
                  items={rooms}
                  filterFn={(item, q) =>
                    item.room_number.toLowerCase().includes(q.toLowerCase()) ||
                    (item.building || "").toLowerCase().includes(q.toLowerCase())
                  }
                  renderItem={(item) => (
                    <span><strong>{item.room_number}</strong>{item.building ? ` · ${item.building}` : ""}{item.capacity ? ` (cap: ${item.capacity})` : ""}</span>
                  )}
                  getValue={(item) => item.room_number}
                />
              </div>

            {/* Extend to next hour */}
            <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12 }}>
              <input
                type="checkbox"
                id="extend"
                checked={form.duration === 2}
                onChange={(e) => handleChange("duration", e.target.checked ? 2 : 1)}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#1e293b" }}
              />
              <label htmlFor="extend" style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Extend to next hour <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>(2-hour slot)</span>
              </label>
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
import { useEffect, useState } from "react";
import BASE_URL from "../api";

const inputStyle = {
  width: "100%", border: "1px solid #e2e8f0", borderRadius: 12,
  padding: "9px 13px", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
  color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box",
};

const btnPrimary = {
  background: "#1e293b", color: "#fff", border: "none", borderRadius: 12,
  padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif", marginTop: 16,
};

const btnDelete = {
  fontSize: 11, fontWeight: 600, color: "#f43f5e", background: "#fff1f2",
  border: "1px solid #fecdd3", borderRadius: 8, padding: "5px 12px", cursor: "pointer",
};

export default function AdminPage() {
  const [tab, setTab] = useState("faculty");

  // Faculty state
  const [faculties, setFaculties] = useState([]);
  const [fForm, setFForm] = useState({ name: "", department: "", email: "" });
  const [fLoading, setFLoading] = useState(false);

  // Room state
  const [rooms, setRooms] = useState([]);
  const [rForm, setRForm] = useState({ room_number: "", capacity: "", building: "" });
  const [rLoading, setRLoading] = useState(false);

  const fetchFaculties = async () => {
    const res = await fetch(`${BASE_URL}/api/faculties`);
    const data = await res.json();
    setFaculties(data);
  };

  const fetchRooms = async () => {
    const res = await fetch(`${BASE_URL}/api/rooms`);
    const data = await res.json();
    setRooms(data);
  };

  useEffect(() => { fetchFaculties(); fetchRooms(); }, []);

  const handleAddFaculty = async () => {
    if (!fForm.name.trim()) return alert("Faculty name is required");
    setFLoading(true);
    await fetch(`${BASE_URL}/api/faculties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fForm),
    });
    setFForm({ name: "", department: "", email: "" });
    fetchFaculties();
    setFLoading(false);
  };

  const handleDeleteFaculty = async (id) => {
    if (!confirm("Delete this faculty?")) return;
    await fetch(`${BASE_URL}/api/faculties/${id}`, { method: "DELETE" });
    fetchFaculties();
  };

  const handleAddRoom = async () => {
    if (!rForm.room_number.trim()) return alert("Room number is required");
    setRLoading(true);
    await fetch(`${BASE_URL}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rForm),
    });
    setRForm({ room_number: "", capacity: "", building: "" });
    fetchRooms();
    setRLoading(false);
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm("Delete this room?")) return;
    await fetch(`${BASE_URL}/api/rooms/${id}`, { method: "DELETE" });
    fetchRooms();
  };

  const tabStyle = (t) => ({
    padding: "9px 22px", borderRadius: 10, border: "none", cursor: "pointer",
    fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    background: tab === t ? "#1e293b" : "transparent",
    color: tab === t ? "#fff" : "#64748b",
    transition: "all .15s ease",
  });

  return (
    <div style={{ padding: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Admin</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Manage faculties and rooms</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#f1f5f9", padding: 4, borderRadius: 14, width: "fit-content", marginBottom: 28 }}>
        <button style={tabStyle("faculty")} onClick={() => setTab("faculty")}>Faculty</button>
        <button style={tabStyle("room")} onClick={() => setTab("room")}>Rooms</button>
      </div>

      {/* ── FACULTY TAB ── */}
      {tab === "faculty" && (
        <>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Add Faculty</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Name *</label>
                <input style={inputStyle} placeholder="e.g. Dr. Sharma" value={fForm.name} onChange={(e) => setFForm({ ...fForm, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Department</label>
                <input style={inputStyle} placeholder="e.g. CSE" value={fForm.department} onChange={(e) => setFForm({ ...fForm, department: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Email</label>
                <input style={inputStyle} placeholder="e.g. sharma@college.edu" value={fForm.email} onChange={(e) => setFForm({ ...fForm, email: e.target.value })} />
              </div>
            </div>
            <button style={btnPrimary} onClick={handleAddFaculty} disabled={fLoading}>
              {fLoading ? "Adding…" : "Add Faculty"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faculties.length === 0 && <p style={{ color: "#94a3b8", fontSize: 13 }}>No faculties yet.</p>}
            {faculties.map((f) => (
              <div key={f._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{f.department} · {f.email}</div>
                </div>
                <button style={btnDelete} onClick={() => handleDeleteFaculty(f._id)}>Delete</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── ROOM TAB ── */}
      {tab === "room" && (
        <>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Add Room</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Room Number *</label>
                <input style={inputStyle} placeholder="e.g. 213" value={rForm.room_number} onChange={(e) => setRForm({ ...rForm, room_number: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Capacity</label>
                <input style={inputStyle} placeholder="e.g. 60" value={rForm.capacity} onChange={(e) => setRForm({ ...rForm, capacity: e.target.value })} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Building</label>
                <input style={inputStyle} placeholder="e.g. Main Block" value={rForm.building} onChange={(e) => setRForm({ ...rForm, building: e.target.value })} />
              </div>
            </div>
            <button style={btnPrimary} onClick={handleAddRoom} disabled={rLoading}>
              {rLoading ? "Adding…" : "Add Room"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rooms.length === 0 && <p style={{ color: "#94a3b8", fontSize: 13 }}>No rooms yet.</p>}
            {rooms.map((r) => (
              <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>Room {r.room_number}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>Capacity: {r.capacity} · {r.building || "Main Block"}</div>
                </div>
                <button style={btnDelete} onClick={() => handleDeleteRoom(r._id)}>Delete</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
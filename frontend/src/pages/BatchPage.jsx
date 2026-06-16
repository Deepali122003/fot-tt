import { useEffect, useState } from "react";
import BASE_URL from "../api";

const inputStyle = {
  width: "100%", border: "1px solid #e2e8f0", borderRadius: 12,
  padding: "9px 13px", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
  color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box",
};

export default function BatchPage() {
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({ name: "", year: "", semester: "", department: "", batch_size: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBatches = async () => {
    const res = await fetch(`${BASE_URL}/api/batches`);
    const data = await res.json();
    setBatches(data);
  };

  useEffect(() => { fetchBatches(); }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) return alert("Batch name is required");
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add batch");
      setForm({ name: "", year: "", semester: "", department: "", batch_size: "" });
      fetchBatches();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this batch?")) return;
    await fetch(`${BASE_URL}/api/batches/${id}`, { method: "DELETE" });
    fetchBatches();
  };

  return (
    <div style={{ padding: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Batches</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Manage all batches</p>
      </div>

      {/* Form */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, marginBottom: 32, boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Add New Batch</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 5 }}>Batch Name *</label>
            <input style={inputStyle} placeholder="e.g. CSE-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 5 }}>Department</label>
            <input style={inputStyle} placeholder="e.g. CSE" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 5 }}>Year</label>
            <input style={inputStyle} placeholder="e.g. 2" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 5 }}>Semester</label>
            <input style={inputStyle} placeholder="e.g. 4" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 5 }}>Batch Size</label>
            <input style={inputStyle} placeholder="e.g. 60" value={form.batch_size} onChange={(e) => setForm({ ...form, batch_size: e.target.value })} />
          </div>
        </div>
        {error && <div style={{ color: "#be123c", fontSize: 12, marginTop: 10 }}>{error}</div>}
        <button onClick={handleAdd} disabled={loading}
          style={{ marginTop: 16, background: "#1e293b", color: "#fff", border: "none", borderRadius: 12, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          {loading ? "Adding…" : "Add Batch"}
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {batches.length === 0 && <p style={{ color: "#94a3b8", fontSize: 13 }}>No batches yet.</p>}
        {batches.map((b) => (
          <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{b.name}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
                {b.department} · Year {b.year} · Sem {b.semester} · {b.batch_size} students
              </div>
            </div>
            <button onClick={() => handleDelete(b._id)}
              style={{ fontSize: 11, fontWeight: 600, color: "#f43f5e", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
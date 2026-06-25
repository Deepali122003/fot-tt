import BASE_URL from "../api";
import { useEffect, useState } from "react";
import TimetableGrid from "../components/TimetableGrid";

export default function MasterPage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [slots, setSlots] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBatches = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/batches`);
      if (!res.ok) throw new Error("Failed to fetch batches");
      const data = await res.json();
      setBatches(data);
      if (data.length > 0) {
        setSelectedBatch((prev) => prev || data[0].name?.trim());
        setSelectedYear((prev) => prev || data[0].year?.toString() || "");
      }
    } catch (err) {
      setError("Failed to load batches");
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/faculties`);
      const data = await res.json();
      setFaculties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch faculties", err);
    }
  };

  const fetchSlots = async (batch, year) => {
    if (!batch) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${BASE_URL}/api/slots?batch=${batch}`);
      if (!res.ok) throw new Error("Failed to fetch slots");
      const data = await res.json();
      const filtered = year
        ? data.filter((s) => !s.year || s.year === year.toString())
        : data;
      setSlots(Array.isArray(filtered) ? filtered : []);
    } catch (err) {
      setSlots([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatches(); fetchFaculties(); }, []);
  useEffect(() => {
    if (selectedBatch) fetchSlots(selectedBatch, selectedYear);
  }, [selectedBatch, selectedYear]);

  const uniqueBatchNames = [...new Set(batches.map((b) => b.name?.trim()).filter(Boolean))];
  const yearsForBatch = [
    ...new Set(
      batches
        .filter((b) => b.name?.trim() === selectedBatch)
        .map((b) => b.year?.toString())
        .filter(Boolean)
    ),
  ].sort();

  // Faculty acronym table — only faculties that appear in current slots
  const facultiesInBatch = faculties.filter((f) =>
    slots.some((s) => s.faculty === f.name)
  );

  const selectStyle = {
    appearance: "none", background: "#ffffff", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "9px 36px 9px 14px", fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", color: "#1e293b", cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,.06)", outline: "none",
  };

  return (
    <div style={{ padding: "24px", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Master Timetable</h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Manage all class slots across batches</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Batch */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>Batch</span>
            <div style={{ position: "relative" }}>
              <select value={selectedBatch} onChange={(e) => {
                setSelectedBatch(e.target.value);
                const firstYear = batches.find((b) => b.name?.trim() === e.target.value)?.year?.toString() || "";
                setSelectedYear(firstYear);
              }} style={selectStyle}>
                {uniqueBatchNames.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: 12 }}>▾</span>
            </div>
          </div>

          {/* Year */}
          {yearsForBatch.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>Year</span>
              <div style={{ position: "relative" }}>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={selectStyle}>
                  <option value="">All Years</option>
                  {yearsForBatch.map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", fontSize: 12 }}>▾</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13, padding: "12px 0" }}>
          <div style={{ width: 16, height: 16, border: "2px solid #fbbf24", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          Loading schedule…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", fontSize: 13, padding: "10px 16px", borderRadius: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Timetable Grid */}
      {!loading && selectedBatch && (
        <TimetableGrid
          batch={selectedBatch}
          year={selectedYear}
          slots={slots}
          refresh={() => fetchSlots(selectedBatch, selectedYear)}
        />
      )}

      {/* Faculty Acronym Table */}
      {!loading && facultiesInBatch.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
            Faculty Acronyms — {selectedBatch}{selectedYear ? ` · Year ${selectedYear}` : ""}
          </div>
          <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Sans', sans-serif", width: "auto", minWidth: 400 }}>
              <thead>
                <tr style={{ background: "#1e293b" }}>
                  <th style={{ padding: "9px 20px", textAlign: "left", color: "#94a3b8", fontSize: 9, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: ".08em", borderRight: "1px solid #334155", fontWeight: 500 }}>Acronym</th>
                  <th style={{ padding: "9px 20px", textAlign: "left", color: "#94a3b8", fontSize: 9, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: ".08em", borderRight: "1px solid #334155", fontWeight: 500 }}>Faculty Name</th>
                  <th style={{ padding: "9px 20px", textAlign: "left", color: "#94a3b8", fontSize: 9, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 500 }}>Department</th>
                </tr>
              </thead>
              <tbody>
                {facultiesInBatch.map((f, i) => (
                  <tr key={f._id} style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                    <td style={{ padding: "9px 20px", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontWeight: 700, fontSize: 12, background: "#1e293b", color: "#fbbf24", padding: "3px 9px", borderRadius: 6, fontFamily: "'DM Mono', monospace" }}>
                        {f.acronym || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "9px 20px", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontWeight: 600, color: "#1e293b" }}>
                      {f.name}
                    </td>
                    <td style={{ padding: "9px 20px", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                      {f.department || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
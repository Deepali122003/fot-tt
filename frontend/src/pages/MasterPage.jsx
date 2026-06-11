import BASE_URL from "../api";
import { useEffect, useState } from "react";
import TimetableGrid from "../components/TimetableGrid";

export default function MasterPage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //  Fetch batches
  const fetchBatches = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/batches`);
      if (!res.ok) throw new Error("Failed to fetch batches");

      const data = await res.json();
      const batchNames = data.map((b) => b.name?.trim()).filter(Boolean);

      setBatches(batchNames);

      if (batchNames.length > 0) {
        setSelectedBatch((prev) => prev || batchNames[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load batches");
    }
  };

  //  Fetch slots
  const fetchSlots = async (batch) => {
    if (!batch) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${BASE_URL}/api/slots?batch=${batch}`);

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.error || "Failed to fetch slots");
      }

      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSlots([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  //  Initial load
  useEffect(() => { fetchBatches(); }, []);

  // Load slots when batch changes
  useEffect(() => {
    if (selectedBatch) fetchSlots(selectedBatch);
  }, [selectedBatch]);

  return (
    <div style={{ padding: "24px", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Master Timetable
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            Manage all class slots across batches
          </p>
        </div>

        {/* ── Batch Selector ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>
            Batch
          </span>
          <div style={{ position: "relative" }}>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              style={{
                appearance: "none",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "9px 36px 9px 14px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                color: "#1e293b",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,.06)",
                outline: "none",
              }}
            >
              {batches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <span style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              color: "#94a3b8", pointerEvents: "none", fontSize: 12,
            }}>▾</span>
          </div>
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13, padding: "12px 0" }}>
          <div style={{
            width: 16, height: 16,
            border: "2px solid #fbbf24",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }} />
          Loading schedule…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Error State ── */}
      {error && (
        <div style={{
          background: "#fff1f2", border: "1px solid #fecdd3",
          color: "#be123c", fontSize: 13, padding: "10px 16px",
          borderRadius: 12, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* ── Timetable Grid ── */}
      {!loading && selectedBatch && (
        <TimetableGrid
          batch={selectedBatch}
          slots={slots}
          refresh={() => fetchSlots(selectedBatch)}
        />
      )}
    </div>
  );
}

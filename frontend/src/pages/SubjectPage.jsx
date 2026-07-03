import BASE_URL from "../api";
import { useEffect, useState } from "react";

export default function SubjectPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/slots`)
      .then(r => r.json())
      .then(data => { setSlots(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Build unique subjects grouped by year
  // Key: year → Map of subject_acronym → subject name
  const subjectsByYear = {};
  slots.forEach((s) => {
    const year = s.year || "Unknown";
    if (!subjectsByYear[year]) subjectsByYear[year] = {};
    const acronym = s.subject_acronym || s.subject;
    if (acronym && !subjectsByYear[year][acronym]) {
      subjectsByYear[year][acronym] = s.subject || acronym;
    }
  });

  const years = Object.keys(subjectsByYear).sort();

  const yearColors = {
    "1": { bg: "#eff6ff", color: "#1d4ed8", header: "#1d4ed8" },
    "2": { bg: "#f5f3ff", color: "#6d28d9", header: "#6d28d9" },
    "3": { bg: "#ecfdf5", color: "#065f46", header: "#065f46" },
    "4": { bg: "#fffbeb", color: "#92400e", header: "#92400e" },
    "Unknown": { bg: "#f1f5f9", color: "#475569", header: "#475569" },
  };

  return (
    <div style={{ padding: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Subject List</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>All subjects grouped by year</p>
      </div>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13 }}>
          <div style={{ width: 16, height: 16, border: "2px solid #fbbf24", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          Loading…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && years.length === 0 && (
        <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "32px 0" }}>No subjects found. Add slots first.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {years.map((year) => {
          const subjects = subjectsByYear[year];
          const acronyms = Object.keys(subjects).sort();
          const colors = yearColors[year] || yearColors["Unknown"];

          return (
            <div key={year}>
              {/* Year Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#1e293b", color: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>
                  Y{year}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                    {year === "Unknown" ? "Year Unknown" : `Year ${year}`}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {acronyms.length} subject{acronyms.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Subject Table */}
              <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  <thead>
                    <tr style={{ background: "#1e293b" }}>
                      <th style={{ padding: "10px 20px", textAlign: "left", color: "#94a3b8", fontSize: 9, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: ".08em", borderRight: "1px solid #334155", fontWeight: 500, width: 120 }}>Acronym</th>
                      <th style={{ padding: "10px 20px", textAlign: "left", color: "#94a3b8", fontSize: 9, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 500 }}>Subject Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acronyms.map((acronym, i) => (
                      <tr key={acronym} style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                        <td style={{ padding: "10px 20px", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                          <span style={{ fontWeight: 700, fontSize: 12, background: colors.bg, color: colors.color, padding: "3px 10px", borderRadius: 6, fontFamily: "'DM Mono', monospace" }}>
                            {acronym}
                          </span>
                        </td>
                        <td style={{ padding: "10px 20px", borderBottom: "1px solid #e2e8f0", fontWeight: 500, color: "#1e293b" }}>
                          {subjects[acronym]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
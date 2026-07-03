import BASE_URL from "../api";
import { useEffect, useState } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const timeSlots = [
  "8-9", "9-10", "10-11", "11-12",
  "12-1", "1-2", "2-3", "3-4", "4-5", "5-6"
];

const dayColors = {
  Mon: { bg: "#eff6ff", color: "#1d4ed8" },
  Tue: { bg: "#f5f3ff", color: "#6d28d9" },
  Wed: { bg: "#ecfdf5", color: "#065f46" },
  Thu: { bg: "#fffbeb", color: "#92400e" },
  Fri: { bg: "#fff1f2", color: "#9f1239" },
  Sat: { bg: "#f1f5f9", color: "#475569" },
};

export default function RoomPage() {
  const [slots, setSlots] = useState([]);

  //  Fetch slots
  useEffect(() => {
    fetch(`${BASE_URL}/api/slots`)
      .then((res) => res.json())
      .then((data) => setSlots(data))
      .catch((err) => console.error(err));
  }, []);

  // Extract unique rooms/labs
  const rooms = [
  ...new Set(
    slots
      .map((s) => s.room_number || s.room_id || s.lab_id)
      .filter(Boolean)
  )
];

  return (
    <div style={{ padding: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>
          Room Timetable
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          Room &amp; lab occupancy schedule
        </p>
      </div>

      {rooms.length === 0 && (
        <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
          No room data available.
        </p>
      )}

      {/* ── Per-Room Block ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        {rooms.map((room) => {
          const count = slots.filter(
            (s) => s.room_number === room || s.room_id === room || s.lab_id === room
          ).length;

          return (
            <div key={room}>

              {/* Room name row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "#1e293b", color: "#ffffff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {/* Room icon */}
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Room {room}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {count} slot{count !== 1 ? "s" : ""} booked
                  </div>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11, tableLayout: "fixed", minWidth: 820 }}>
                  <thead>
                    <tr style={{ background: "#1e293b" }}>
                      <th style={{ padding: "10px 12px", textAlign: "left", width: 72, fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", borderRight: "1px solid #334155" }}>
                        Day
                      </th>
                      {timeSlots.map((t) => (
                        <th key={t} style={{ padding: "10px 6px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#cbd5e1", letterSpacing: ".06em", borderRight: "1px solid #334155", fontWeight: 500 }}>
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {days.map((day, i) => (
                      <tr key={day} style={{ background: i % 2 === 0 ? "#ffffff" : "rgba(248,250,252,.6)" }}>
                        <td style={{ padding: "10px 10px", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "3px 7px",
                            borderRadius: 7, fontFamily: "'DM Mono', monospace",
                            background: dayColors[day]?.bg, color: dayColors[day]?.color,
                          }}>
                            {day}
                          </span>
                        </td>

                        {timeSlots.map((time) => {
                          const filtered = slots.filter(
                            (s) =>
                              (s.room_number === room ||
                                s.room_id === room ||
                                s.lab_id === room) &&
                              s.day === day &&
                              s.time === time
                          );

                          return (
                            <td key={time} style={{ borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: 5, verticalAlign: "top", minHeight: 54 }}>
                              {filtered.map((s) => (
                                <div key={s._id} style={{
                                  background: "#f0f9ff", border: "1px solid #7dd3fc",
                                  borderRadius: 8, padding: "5px 7px", marginBottom: 3,
                                }}>
                                  <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {s.subject_acronym || s.subject} ({s.batch}{s.year ? ` Y${s.year}` : ""})
                                  </div>
                                  <div style={{ fontSize: 9, color: "#0369a1", fontWeight: 600, marginTop: 1 }}>
                                    Sub: {s.subBatch || "ALL"}
                                  </div>
                                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>
                                    {s.faculty}
                                  </div>
                                </div>
                              ))}
                            </td>
                          );
                        })}
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
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import MasterPage from "./pages/MasterPage";
import FacultyPage from "./pages/FacultyPage";
import RoomPage from "./pages/RoomPage";
import BatchPage from "./pages/BatchPage";
import AdminPage from "./pages/AdminPage";
import SubjectPage from "./pages/SubjectPage";

function NavBar() {
  const location = useLocation();

  const navItems = [
    { path: "/",         label: "Master",   icon: "⊞" },
    { path: "/faculty",  label: "Faculty",  icon: "◈" },
    { path: "/room",     label: "Room",     icon: "⬜" },
    { path: "/batches",  label: "Batches",  icon: "🎓" },
    { path: "/subjects", label: "Subjects", icon: "📚" },
    { path: "/admin",    label: "Admin",    icon: "⚙" },
  ];

  return (
    <nav style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "4px", borderRadius: "14px", flexWrap: "wrap" }}>
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 22px", borderRadius: "10px", textDecoration: "none",
            fontWeight: "600", fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
            background: active ? "#1e293b" : "transparent",
            color: active ? "#ffffff" : "#64748b",
            boxShadow: active ? "0 2px 8px rgba(30,41,59,.25)" : "none",
            transition: "all .15s ease",
          }}>
            <span style={{ fontSize: "15px", lineHeight: 1 }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif" }}>
        <header style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,.06)", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 36, height: 36, background: "#1e293b", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fbbf24", fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>TT</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.1, color: "#1e293b" }}>Timetable Management</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 2 }}>Academic Scheduler</div>
              </div>
            </div>
            <NavBar />
          </div>
        </header>

        <main style={{ maxWidth: "1280px", margin: "24px auto", padding: "0 16px" }}>
          <div style={{ background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,.05)", overflowX: "auto" }}>
            <Routes>
              <Route path="/"         element={<MasterPage />} />
              <Route path="/faculty"  element={<FacultyPage />} />
              <Route path="/room"     element={<RoomPage />} />
              <Route path="/batches"  element={<BatchPage />} />
              <Route path="/subjects" element={<SubjectPage />} />
              <Route path="/admin"    element={<AdminPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
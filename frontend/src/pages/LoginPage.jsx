import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email has been sent.");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 380,
          background: "#fff",
          padding: 35,
          borderRadius: 18,
          boxShadow: "0 8px 25px rgba(0,0,0,.08)",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            background: "#1e293b",
            color: "#fbbf24",
            margin: "0 auto 20px",
            borderRadius: 14,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          TT
        </div>

        <h2
          style={{
            textAlign: "center",
            marginBottom: 5,
            color: "#1e293b",
          }}
        >
          Timetable Management
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: 30,
          }}
        >
          Sign in to continue
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#1e293b",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            marginTop: 10,
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
          }}
        >
          <button
            type="button"
            onClick={handleForgotPassword}
            style={{
              border: "none",
              background: "none",
              color: "#2563eb",
              cursor: "pointer",
            }}
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 18,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};
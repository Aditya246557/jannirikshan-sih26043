import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({
        email: email.trim(),
        password
      });

      console.log("LOGIN SUCCESSFUL:", data);

      const role = String(data?.role || data?.data?.role || "").toUpperCase();

      switch (role) {
        case "ADMIN":
        case "GOVERNMENT":
        case "OFFICER":
          navigate("/admin", { replace: true });
          break;
        case "UNIVERSITY":
          navigate("/university", { replace: true });
          break;
        case "FACULTY":
          navigate("/faculty", { replace: true });
          break;
        case "STUDENT":
          navigate("/student", { replace: true });
          break;
        case "INDUSTRY":
          navigate("/industry", { replace: true });
          break;
        case "CITIZEN":
        default:
          navigate("/citizen", { replace: true });
          break;
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const rolePills = [
    { label: "Citizen", color: "#FFD21F", bg: "rgba(255, 210, 31, 0.12)" },
    { label: "Government", color: "#38BDF8", bg: "rgba(56, 189, 248, 0.12)" },
    { label: "University", color: "#FF4FA3", bg: "rgba(255, 79, 163, 0.12)" },
    { label: "Faculty", color: "#34D399", bg: "rgba(52, 211, 153, 0.12)" },
    { label: "Student", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)" },
    { label: "Industry", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.12)" }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top left, rgba(56, 189, 248, 0.07) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(255, 210, 31, 0.05) 0%, transparent 50%), #07080A",
      color: "#F5F5F2",
      fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      boxSizing: "border-box"
    }}>

      {/* MAIN CONTAINER */}
      <div style={{
        maxWidth: "1040px",
        width: "100%",
        background: "#111315",
        border: "1px solid rgba(255, 255, 255, 0.09)",
        borderRadius: "24px",
        boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 210, 31, 0.03)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        overflow: "hidden"
      }}>

        {/* LEFT PANEL: DIGITAL CIVIC ECOSYSTEM */}
        <div style={{
          background: "linear-gradient(170deg, #16181B 0%, #0E1012 100%)",
          padding: "44px 38px",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative"
        }}>
          
          {/* Top Brand Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #FFD21F 0%, #F59E0B 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "19px",
                boxShadow: "0 0 16px rgba(255, 210, 31, 0.4)"
              }}>
                🌐
              </div>
              <div>
                <span style={{ fontSize: "17px", fontWeight: 900, letterSpacing: "0.04em", color: "#F5F5F2" }}>
                  SOCIO-SPHERE
                </span>
                <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#FFD21F", letterSpacing: "0.08em" }}>
                  SIH26043 • NATIONAL CIVIC INNOVATION GRID
                </div>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "#8F9499", margin: "14px 0 0", lineHeight: 1.5 }}>
              A unified national platform empowering citizens, governments, researchers, and industries to solve grassroots challenges collaboratively.
            </p>
          </div>

          {/* Center: Civic Ecosystem Diagram */}
          <div style={{ margin: "24px 0", textAlign: "center" }}>
            <svg viewBox="0 0 400 240" style={{ width: "100%", height: "auto", maxHeight: "230px", display: "block" }}>
              <defs>
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFD21F" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FFD21F" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="lineGradCyan" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFD21F" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
                <linearGradient id="lineGradPink" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#FF4FA3" />
                </linearGradient>
                <linearGradient id="lineGradGreen" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF4FA3" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>

              {/* Central Background Glow */}
              <circle cx="200" cy="120" r="85" fill="url(#centerGlow)" />

              {/* Connecting Pathway Lines */}
              <path d="M 70 60 Q 130 90 200 120" stroke="url(#lineGradCyan)" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.7" />
              <path d="M 330 60 Q 270 90 200 120" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.7" />
              <path d="M 340 180 Q 270 150 200 120" stroke="url(#lineGradGreen)" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.7" />
              <path d="M 60 180 Q 130 150 200 120" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.7" />
              <path d="M 200 35 L 200 120" stroke="#FF4FA3" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.6" />
              <path d="M 200 205 L 200 120" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.6" />

              {/* Central Engine Node */}
              <circle cx="200" cy="120" r="32" fill="#17191C" stroke="#FFD21F" strokeWidth="2.5" />
              <text x="200" y="116" fill="#FFD21F" fontSize="9" fontWeight="900" textAnchor="middle">SOCIO</text>
              <text x="200" y="128" fill="#F5F5F2" fontSize="9" fontWeight="900" textAnchor="middle">SPHERE</text>

              {/* Node 1: Citizen GPS */}
              <g transform="translate(70, 60)">
                <circle cx="0" cy="0" r="20" fill="#1D2023" stroke="#FFD21F" strokeWidth="2" />
                <text x="0" y="4" fontSize="13" textAnchor="middle">📍</text>
                <text x="0" y="32" fill="#FFD21F" fontSize="8.5" fontWeight="800" textAnchor="middle">Citizen GPS</text>
              </g>

              {/* Node 2: Govt AI Audit */}
              <g transform="translate(330, 60)">
                <circle cx="0" cy="0" r="20" fill="#1D2023" stroke="#38BDF8" strokeWidth="2" />
                <text x="0" y="4" fontSize="13" textAnchor="middle">⚖️</text>
                <text x="0" y="32" fill="#38BDF8" fontSize="8.5" fontWeight="800" textAnchor="middle">Govt Audit</text>
              </g>

              {/* Node 3: University R&D */}
              <g transform="translate(200, 35)">
                <circle cx="0" cy="0" r="18" fill="#1D2023" stroke="#FF4FA3" strokeWidth="2" />
                <text x="0" y="4" fontSize="11" textAnchor="middle">🏛️</text>
                <text x="0" y="-22" fill="#FF4FA3" fontSize="8.5" fontWeight="800" textAnchor="middle">Univ R&D</text>
              </g>

              {/* Node 4: Faculty Review */}
              <g transform="translate(340, 180)">
                <circle cx="0" cy="0" r="20" fill="#1D2023" stroke="#34D399" strokeWidth="2" />
                <text x="0" y="4" fontSize="13" textAnchor="middle">👩‍🏫</text>
                <text x="0" y="32" fill="#34D399" fontSize="8.5" fontWeight="800" textAnchor="middle">Faculty Gate</text>
              </g>

              {/* Node 5: Student Sprint */}
              <g transform="translate(200, 205)">
                <circle cx="0" cy="0" r="18" fill="#1D2023" stroke="#F59E0B" strokeWidth="2" />
                <text x="0" y="4" fontSize="11" textAnchor="middle">👨‍🎓</text>
                <text x="0" y="30" fill="#F59E0B" fontSize="8.5" fontWeight="800" textAnchor="middle">Student Lead</text>
              </g>

              {/* Node 6: Industry CSR */}
              <g transform="translate(60, 180)">
                <circle cx="0" cy="0" r="20" fill="#1D2023" stroke="#8B5CF6" strokeWidth="2" />
                <text x="0" y="4" fontSize="13" textAnchor="middle">💎</text>
                <text x="0" y="32" fill="#8B5CF6" fontSize="8.5" fontWeight="800" textAnchor="middle">Industry CSR</text>
              </g>
            </svg>
          </div>

          {/* Bottom Statement */}
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "18px" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#F5F5F2", marginBottom: "4px" }}>
              "From grassroots problems to engineered solutions."
            </div>
            <div style={{ fontSize: "11px", color: "#8F9499", lineHeight: 1.45 }}>
              Connecting citizens, government oversight, university innovation cells, and CSR funding for measurable national impact.
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: AUTHENTICATION FORM */}
        <div style={{ padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          
          <div style={{ marginBottom: "26px" }}>
            <span style={{ fontSize: "10px", fontWeight: 900, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              SECURE PORTAL ACCESS
            </span>
            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "4px 0 6px" }}>
              Welcome back
            </h1>
            <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
              Sign in to your SOCIO-SPHERE command center.
            </p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div style={{
              background: "rgba(255, 92, 92, 0.12)",
              border: "1px solid rgba(255, 92, 92, 0.35)",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "18px",
              color: "#FF7B7B",
              fontSize: "12.5px",
              fontWeight: 650,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span>⚠️</span>
              <span style={{ flex: 1 }}>{error}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#8F9499", marginBottom: "6px" }}>
                Official Email Address
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "12px", fontSize: "14px", color: "#8F9499" }}>
                  ✉️
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@domain.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 40px",
                    background: "#17191C",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "#F5F5F2",
                    fontSize: "13px",
                    fontWeight: 600,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#FFD21F")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label htmlFor="password" style={{ fontSize: "11.5px", fontWeight: 800, color: "#8F9499" }}>
                  Password
                </label>
                <span style={{ fontSize: "11px", color: "#8F9499" }}>
                  Demo: <code style={{ color: "#FFD21F" }}>Password@123</code>
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "12px", fontSize: "14px", color: "#8F9499" }}>
                  🔒
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 42px 12px 40px",
                    background: "#17191C",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    color: "#F5F5F2",
                    fontSize: "13px",
                    fontWeight: 600,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#FFD21F")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "10px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#8F9499"
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#FFD21F",
                color: "#0B0D0F",
                border: "none",
                borderRadius: "10px",
                padding: "13px 20px",
                fontSize: "14px",
                fontWeight: 900,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "6px",
                boxShadow: "0 0 20px rgba(255, 210, 31, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "transform 0.15s ease"
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #0B0D0F", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  Authenticating...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* ONE PLATFORM • SIX ROLES */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              One platform. Six stakeholder roles.
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {rolePills.map((r) => (
                <span
                  key={r.label}
                  style={{
                    background: r.bg,
                    color: r.color,
                    border: `1px solid ${r.color}33`,
                    fontSize: "10.5px",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "6px"
                  }}
                >
                  ● {r.label}
                </span>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontSize: "12px", color: "#8F9499" }}>
            <span>
              New citizen? <Link to="/register" style={{ color: "#FFD21F", fontWeight: 800, textDecoration: "none" }}>Register here</Link>
            </span>
            <Link to="/explore" style={{ color: "#8F9499", textDecoration: "none" }}>
              Explore Map ↗
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
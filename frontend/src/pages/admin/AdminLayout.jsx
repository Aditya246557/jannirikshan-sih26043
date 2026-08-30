import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";

const navItems = [
  { to: "/admin", label: "National Dashboard", icon: "📊", end: true },
  { to: "/admin/complaints", label: "Moderation Queue", icon: "🛡️" },
  { to: "/admin/users", label: "Institutional Directory", icon: "🏛️" },
  { to: "/admin/audit", label: "Audit & Compliance", icon: "📜" },
  { to: "/admin/analytics", label: "National Analytics", icon: "📈" }
];

export default function AdminLayout() {
  const { user, logout, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    notificationService.getUnreadCount()
      .then((res) => {
        if (res?.unreadCount !== undefined) setUnreadCount(res.unreadCount);
      })
      .catch(() => {});
  }, []);

  const loadNotifications = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && user) {
      try {
        const res = await notificationService.getMyNotifications(0, 5);
        setNotifications(res?.content || []);
      } catch (e) {}
    }
  };

  const handleDemoSwitch = async (roleKey) => {
    const demoAccounts = {
      CITIZEN: { email: "citizen@sih.gov.in", password: "Password@123", path: "/citizen" },
      ADMIN: { email: "admin@sih.gov.in", password: "Password@123", path: "/admin" },
      UNIVERSITY: { email: "iitb@sih.gov.in", password: "Password@123", path: "/university" },
      FACULTY: { email: "faculty@iitb.ac.in", password: "Password@123", path: "/faculty" },
      STUDENT: { email: "student@iitb.ac.in", password: "Password@123", path: "/student" },
      INDUSTRY: { email: "csr@tata.com", password: "Password@123", path: "/industry" }
    };

    const target = demoAccounts[roleKey];
    if (target) {
      await switchDemoUser(target);
      setDemoOpen(false);
      navigate(target.path);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0D0F", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          width: "260px",
          background: "#111315",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 95,
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.3)"
        }}
      >
        {/* BRAND */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
              color: "#0B0D0F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 900,
              boxShadow: "0 0 16px rgba(56, 189, 248, 0.4)"
            }}>
              ⚖️
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2", letterSpacing: "0.02em" }}>
                JanNirikshan
              </div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8", letterSpacing: "0.08em" }}>
                SIH26043 • GOVT ADMIN
              </div>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav style={{ flex: 1, padding: "18px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", padding: "0 10px 8px", letterSpacing: "0.08em" }}>
            GOVERNANCE PORTAL
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: isActive ? 800 : 600,
                color: isActive ? "#38BDF8" : "#8F9499",
                background: isActive ? "#1D2023" : "transparent",
                border: isActive ? "1px solid rgba(56, 189, 248, 0.35)" : "1px solid transparent",
                transition: "all 0.16s ease"
              })}
            >
              <span style={{ fontSize: "15px" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </NavLink>
          ))}

          <div style={{ margin: "14px 0 6px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }} />

          <Link
            to="/explore"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
              color: "#8F9499"
            }}
          >
            <span style={{ fontSize: "15px" }}>🗺️</span>
            <span>Public Repository</span>
          </Link>
        </nav>

        {/* SIDEBAR FOOTPRINT WIDGET */}
        <div style={{ padding: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", background: "#111315" }}>
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "14px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                NATIONAL OVERSIGHT
              </span>
              <span style={{ fontSize: "10px", background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", padding: "2px 6px", borderRadius: "999px", fontWeight: 800 }}>
                100% AUDITED ✓
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <small style={{ fontSize: "10px", color: "#8F9499", display: "block" }}>AI Matching</small>
                <strong style={{ fontSize: "14px", color: "#38BDF8" }}>Active (85%)</strong>
              </div>
              <div>
                <small style={{ fontSize: "10px", color: "#8F9499", display: "block" }}>Audit Trail</small>
                <strong style={{ fontSize: "14px", color: "#A8E063" }}>Tamper-Evident</strong>
              </div>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN WRAPPER */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#0B0D0F" }}>
        
        {/* TOP HEADER */}
        <header style={{
          background: "#111315",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "12px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 80
        }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Government of India • SIH26043
            </div>
            <div style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2" }}>
              National Governance & Moderation Command Center
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* 1-Click Role Switcher */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setDemoOpen(!demoOpen)}
                style={{
                  background: "#17191C",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  color: "#38BDF8",
                  borderRadius: "999px",
                  padding: "5px 14px",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                ⚡ Role: Govt Admin ▼
              </button>

              {demoOpen && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "38px",
                  background: "#17191C",
                  borderRadius: "14px",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.5)",
                  width: "250px",
                  padding: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  zIndex: 100
                }}>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", padding: "6px 8px" }}>
                    Switch Demo Persona
                  </div>
                  {[
                    { key: "CITIZEN", label: "Citizen (Rahul Sharma)", desc: "Submit challenges & GPS evidence" },
                    { key: "ADMIN", label: "Govt Admin (Director Varma)", desc: "Verify, deduplicate & assign" },
                    { key: "UNIVERSITY", label: "University (IIT Bombay)", desc: "Accept challenge & build project" },
                    { key: "FACULTY", label: "Faculty Mentor (Prof. Sharma)", desc: "Approve milestones & student team" },
                    { key: "STUDENT", label: "Student Lead (Aarav Patel)", desc: "Kanban task sprint board" },
                    { key: "INDUSTRY", label: "Industry CSR (Tata Trust)", desc: "Pledge CSR grants & funding" }
                  ].map((r) => (
                    <button
                      key={r.key}
                      onClick={() => handleDemoSwitch(r.key)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: r.key === "ADMIN" ? "rgba(56, 189, 248, 0.12)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "block",
                        marginBottom: "3px"
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: 750, color: r.key === "ADMIN" ? "#38BDF8" : "#F5F5F2" }}>{r.label}</div>
                      <div style={{ fontSize: "10px", color: "#8F9499" }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={loadNotifications}
                style={{
                  background: "#17191C",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "15px",
                  color: "#F5F5F2"
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    background: "#38BDF8",
                    color: "#0B0D0F",
                    fontSize: "9px",
                    fontWeight: 900,
                    borderRadius: "999px",
                    padding: "1px 5px"
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Admin User Card */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "4px 10px"
            }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#38BDF8",
                color: "#0B0D0F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 900
              }}>
                {(user?.name || "Admin").charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#F5F5F2" }}>{user?.name || "Director R.K. Varma"}</div>
                <div style={{ fontSize: "10px", color: "#38BDF8", fontWeight: 750 }}>Govt Administrator</div>
              </div>
              <button
                type="button"
                onClick={logout}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#FF5C5C",
                  fontSize: "11px",
                  fontWeight: 750,
                  cursor: "pointer",
                  marginLeft: "4px"
                }}
              >
                Logout
              </button>
            </div>

          </div>
        </header>

        {/* MAIN OUTLET */}
        <main style={{ flex: 1, padding: "26px 30px 60px", maxWidth: "1440px", width: "100%", boxSizing: "border-box" }}>
          <Outlet />
        </main>
      </div>

    </div>
  );
}

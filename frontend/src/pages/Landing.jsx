import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import impactService from "../services/impactService";
import complaintService from "../services/complaintService";

export default function Landing() {
  const { user, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const [impact, setImpact] = useState(null);
  const [recentChallenges, setRecentChallenges] = useState([]);

  useEffect(() => {
    impactService.getSummary().then(setImpact).catch(() => {});
    complaintService.getPublic().then((res) => {
      const list = Array.isArray(res) ? res : res?.content || res?.data?.content || res?.data || [];
      setRecentChallenges(list.slice(0, 3));
    }).catch(() => {});
  }, []);

  const handleQuickDemo = async (roleKey) => {
    const accounts = {
      CITIZEN: { email: "citizen@sih.gov.in", password: "Password@123", path: "/citizen" },
      ADMIN: { email: "admin@sih.gov.in", password: "Password@123", path: "/admin" },
      UNIVERSITY: { email: "iitb@sih.gov.in", password: "Password@123", path: "/university" },
      FACULTY: { email: "faculty@iitb.ac.in", password: "Password@123", path: "/faculty" },
      STUDENT: { email: "student@iitb.ac.in", password: "Password@123", path: "/student" },
      INDUSTRY: { email: "csr@tata.com", password: "Password@123", path: "/industry" }
    };
    const target = accounts[roleKey];
    if (target) {
      await switchDemoUser(target);
      navigate(target.path);
    }
  };

  const roleCards = [
    { key: "CITIZEN", label: "Citizen", color: "#FFD21F", bg: "rgba(255, 210, 31, 0.12)", icon: "📍", desc: "Report local issues with live GPS & photo/video verification", path: "/citizen" },
    { key: "ADMIN", label: "Govt Admin", color: "#38BDF8", bg: "rgba(56, 189, 248, 0.12)", icon: "⚖️", desc: "Audit complaints, inspect AI duplicates, assign to universities", path: "/admin" },
    { key: "UNIVERSITY", label: "University", color: "#FF4FA3", bg: "rgba(255, 79, 163, 0.12)", icon: "🏛️", desc: "Accept challenges, assign faculty mentors & launch R&D labs", path: "/university" },
    { key: "FACULTY", label: "Faculty Mentor", color: "#34D399", bg: "rgba(52, 211, 153, 0.12)", icon: "👩‍🏫", desc: "Supervise student teams, evaluate deliverables & gate stages", path: "/faculty" },
    { key: "STUDENT", label: "Student Lead", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)", icon: "👨‍🎓", desc: "Build engineering prototypes, manage Kanban & submit GitHub", path: "/student" },
    { key: "INDUSTRY", label: "Industry CSR", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.12)", icon: "💎", desc: "Browse high-impact projects, pledge grants & track milestones", path: "/industry" }
  ];

  return (
    <div style={{ background: "#07080A", color: "#F5F5F2", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* TOP NAVIGATION BAR */}
      <header style={{
        background: "rgba(17, 19, 21, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "14px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #FFD21F 0%, #F59E0B 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 0 16px rgba(255, 210, 31, 0.4)"
          }}>
            🌐
          </div>
          <div>
            <span style={{ fontSize: "17px", fontWeight: 900, letterSpacing: "0.03em", color: "#F5F5F2" }}>
              SOCIO-SPHERE
            </span>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#FFD21F", letterSpacing: "0.08em" }}>
              SIH26043 • NATIONAL CIVIC INNOVATION GRID
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            to="/explore"
            style={{
              color: "#8F9499",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            🗺️ Explore Map
          </Link>

          <Link
            to="/login"
            style={{
              background: "#1D2023",
              color: "#F5F5F2",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              padding: "8px 18px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "12.5px",
              fontWeight: 750
            }}
          >
            Sign In
          </Link>

          <Link
            to="/register"
            style={{
              background: "#FFD21F",
              color: "#0B0D0F",
              padding: "8px 18px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "12.5px",
              fontWeight: 900,
              boxShadow: "0 0 14px rgba(255, 210, 31, 0.35)"
            }}
          >
            Register →
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section style={{
        position: "relative",
        padding: "80px 24px 60px",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 10%, rgba(56, 189, 248, 0.12) 0%, rgba(255, 210, 31, 0.04) 50%, transparent 80%)"
      }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255, 210, 31, 0.1)",
            border: "1px solid rgba(255, 210, 31, 0.35)",
            borderRadius: "999px",
            padding: "6px 18px",
            fontSize: "11.5px",
            fontWeight: 800,
            color: "#FFD21F",
            marginBottom: "20px",
            letterSpacing: "0.06em"
          }}>
            🇮🇳 SMART INDIA HACKATHON 2026 (SIH26043) • NATIONAL CIVIC INNOVATION GRID
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 4.5vw, 54px)",
            fontWeight: 900,
            lineHeight: 1.15,
            margin: "0 0 18px",
            letterSpacing: "-0.03em"
          }}>
            Report Societal Challenges. <br />
            <span style={{
              background: "linear-gradient(90deg, #FFD21F 0%, #38BDF8 50%, #34D399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Connect with Universities. Build Solutions. Measure Impact.
            </span>
          </h1>

          <p style={{ fontSize: "16px", color: "#8F9499", maxWidth: "800px", margin: "0 auto 34px", lineHeight: 1.6 }}>
            A national civic-tech platform bridging citizens, government administrators, university innovation cells, student engineering teams, and corporate CSR sponsors into a unified, transparent problem-solving pipeline.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
            <Link
              to="/citizen/report"
              style={{
                background: "#FFD21F",
                color: "#0B0D0F",
                padding: "14px 32px",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "14.5px",
                fontWeight: 900,
                boxShadow: "0 0 24px rgba(255, 210, 31, 0.4)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              📢 Report a Challenge
            </Link>

            <Link
              to="/explore"
              style={{
                background: "#17191C",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#F5F5F2",
                padding: "14px 28px",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "14.5px",
                fontWeight: 750,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              🗺️ Explore Challenges Map
            </Link>
          </div>

          {/* DIGITAL CIVIC ECOSYSTEM VISUAL STORY */}
          <div style={{
            background: "#111315",
            border: "1px solid rgba(255, 255, 255, 0.09)",
            borderRadius: "22px",
            padding: "36px 28px",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
            maxWidth: "940px",
            margin: "0 auto"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              NATIONAL CIVIC INNOVATION PIPELINE
            </div>
            <div style={{ fontSize: "16px", fontWeight: 850, color: "#F5F5F2", marginBottom: "20px" }}>
              "From grassroots problems to engineered solutions."
            </div>

            <svg viewBox="0 0 800 160" style={{ width: "100%", height: "auto", display: "block" }}>
              <defs>
                <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFD21F" />
                  <stop offset="20%" stopColor="#38BDF8" />
                  <stop offset="40%" stopColor="#FF4FA3" />
                  <stop offset="60%" stopColor="#34D399" />
                  <stop offset="80%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>

              {/* Connected Line */}
              <line x1="60" y1="70" x2="740" y2="70" stroke="url(#pathGrad)" strokeWidth="3" strokeDasharray="4 4" opacity="0.6" />

              {/* Node 1: Citizen */}
              <g transform="translate(60, 70)">
                <circle cx="0" cy="0" r="24" fill="#17191C" stroke="#FFD21F" strokeWidth="2.5" />
                <text x="0" y="5" fontSize="15" textAnchor="middle">📍</text>
                <text x="0" y="42" fill="#FFD21F" fontSize="10.5" fontWeight="800" textAnchor="middle">Citizen GPS</text>
                <text x="0" y="55" fill="#8F9499" fontSize="8.5" textAnchor="middle">Report Issue</text>
              </g>

              {/* Node 2: Govt Admin */}
              <g transform="translate(196, 70)">
                <circle cx="0" cy="0" r="24" fill="#17191C" stroke="#38BDF8" strokeWidth="2.5" />
                <text x="0" y="5" fontSize="15" textAnchor="middle">⚖️</text>
                <text x="0" y="42" fill="#38BDF8" fontSize="10.5" fontWeight="800" textAnchor="middle">Govt Audit</text>
                <text x="0" y="55" fill="#8F9499" fontSize="8.5" textAnchor="middle">AI Duplicate Check</text>
              </g>

              {/* Node 3: University */}
              <g transform="translate(332, 70)">
                <circle cx="0" cy="0" r="24" fill="#17191C" stroke="#FF4FA3" strokeWidth="2.5" />
                <text x="0" y="5" fontSize="15" textAnchor="middle">🏛️</text>
                <text x="0" y="42" fill="#FF4FA3" fontSize="10.5" fontWeight="800" textAnchor="middle">University R&D</text>
                <text x="0" y="55" fill="#8F9499" fontSize="8.5" textAnchor="middle">Launch Project</text>
              </g>

              {/* Node 4: Faculty */}
              <g transform="translate(468, 70)">
                <circle cx="0" cy="0" r="24" fill="#17191C" stroke="#34D399" strokeWidth="2.5" />
                <text x="0" y="5" fontSize="15" textAnchor="middle">👩‍🏫</text>
                <text x="0" y="42" fill="#34D399" fontSize="10.5" fontWeight="800" textAnchor="middle">Faculty Mentor</text>
                <text x="0" y="55" fill="#8F9499" fontSize="8.5" textAnchor="middle">Milestone Gate</text>
              </g>

              {/* Node 5: Student */}
              <g transform="translate(604, 70)">
                <circle cx="0" cy="0" r="24" fill="#17191C" stroke="#F59E0B" strokeWidth="2.5" />
                <text x="0" y="5" fontSize="15" textAnchor="middle">👨‍🎓</text>
                <text x="0" y="42" fill="#F59E0B" fontSize="10.5" fontWeight="800" textAnchor="middle">Student Lead</text>
                <text x="0" y="55" fill="#8F9499" fontSize="8.5" textAnchor="middle">Build Prototype</text>
              </g>

              {/* Node 6: Industry */}
              <g transform="translate(740, 70)">
                <circle cx="0" cy="0" r="24" fill="#17191C" stroke="#8B5CF6" strokeWidth="2.5" />
                <text x="0" y="5" fontSize="15" textAnchor="middle">💎</text>
                <text x="0" y="42" fill="#8B5CF6" fontSize="10.5" fontWeight="800" textAnchor="middle">Industry CSR</text>
                <text x="0" y="55" fill="#8F9499" fontSize="8.5" textAnchor="middle">Fund Grant</text>
              </g>
            </svg>

            <p style={{ fontSize: "12.5px", color: "#8F9499", margin: "24px 0 0", lineHeight: 1.5 }}>
              Connect citizens, government, universities, innovators and industry to solve real-world challenges together.
            </p>
          </div>
        </div>
      </section>

      {/* 1-CLICK INTERACTIVE ROLE EXPLORATION STATION */}
      <section style={{ maxWidth: "1240px", margin: "0 auto 60px", padding: "0 24px" }}>
        <div style={{
          background: "#111315",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "22px",
          padding: "36px 32px",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.5)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              INSTANT 1-CLICK PROTOTYPE EVALUATION
            </span>
            <h2 style={{ fontSize: "24px", margin: "4px 0 0", color: "#F5F5F2", fontWeight: 850 }}>
              Experience All Six Portal Stakeholder Workflows
            </h2>
            <p style={{ fontSize: "13px", color: "#8F9499", margin: "6px 0 0" }}>
              Click any card below to launch the authentic role session instantly without manual credentials.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "14px"
          }}>
            {roleCards.map((rc) => (
              <div
                key={rc.key}
                onClick={() => handleQuickDemo(rc.key)}
                style={{
                  background: "#17191C",
                  border: `1px solid ${rc.color}33`,
                  borderRadius: "16px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "transform 0.15s ease, border-color 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = rc.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = `${rc.color}33`;
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "24px" }}>{rc.icon}</span>
                    <span style={{
                      background: rc.bg,
                      color: rc.color,
                      fontSize: "10.5px",
                      fontWeight: 850,
                      padding: "3px 8px",
                      borderRadius: "6px"
                    }}>
                      {rc.label}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 6px" }}>
                    {rc.label} Portal
                  </h3>
                  <p style={{ fontSize: "12px", color: "#8F9499", margin: 0, lineHeight: 1.45 }}>
                    {rc.desc}
                  </p>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "#8F9499" }}>Launch Workspace</span>
                  <span style={{ fontSize: "13px", fontWeight: 900, color: rc.color }}>Open →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NATIONAL IMPACT METRICS STRIP */}
      <section style={{ maxWidth: "1240px", margin: "0 auto 60px", padding: "0 24px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px"
        }}>
          {[
            { label: "Grassroots Challenges", val: impact?.totalChallenges || "22", icon: "📢", color: "#FFD21F" },
            { label: "University R&D Cells", val: impact?.activeUniversities || "18", icon: "🏛️", color: "#FF4FA3" },
            { label: "Engineering Prototypes", val: impact?.activeProjects || "14", icon: "🔬", color: "#34D399" },
            { label: "CSR Capital Pledged", val: "₹" + Number(impact?.totalCsrFunded || 12000000).toLocaleString(), icon: "💎", color: "#8B5CF6" }
          ].map((m) => (
            <div
              key={m.label}
              style={{
                background: "#111315",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}
            >
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#17191C",
                border: `1px solid ${m.color}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>
                {m.icon}
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#F5F5F2" }}>
                  {m.val}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#8F9499" }}>
                  {m.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: "#111315",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "40px 24px",
        textAlign: "center",
        fontSize: "12px",
        color: "#8F9499"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#F5F5F2", marginBottom: "8px" }}>
            SOCIO-SPHERE • National Civic Innovation & Problem-Solving Grid
          </div>
          <p style={{ margin: "0 0 16px" }}>
            Built for Smart India Hackathon 2026 (SIH26043) by Team Advanced Agentic Coding.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <Link to="/explore" style={{ color: "#8F9499", textDecoration: "none" }}>Map</Link>
            <Link to="/login" style={{ color: "#8F9499", textDecoration: "none" }}>Sign In</Link>
            <Link to="/register" style={{ color: "#8F9499", textDecoration: "none" }}>Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

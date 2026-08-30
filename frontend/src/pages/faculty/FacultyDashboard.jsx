import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import projectService from "../../services/projectService";
import milestoneService from "../../services/milestoneService";
import facultyService from "../../services/facultyService";
import teamService from "../../services/teamService";

const cleanFacultyName = (name) => {
  if (!name) return "Faculty Mentor";
  return name.replace(/\s*\((?:Faculty Mentor|Mentor|Faculty)\)/gi, "").trim();
};

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [pendingMilestones, setPendingMilestones] = useState([]);
  const [studentRoster, setStudentRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);

  // Deliverable review action
  const [reviewModalMs, setReviewModalMs] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadData = async () => {
    try {
      const [prof, res] = await Promise.all([
        facultyService.getMyProfile().catch(() => null),
        projectService.getMyProjects().catch(() => projectService.getAll(0, 50))
      ]);
      setProfile(prof);
      const list = Array.isArray(res) ? res : res?.content || res?.data || [];
      setProjects(list);

      const msPromises = list.map((p) => milestoneService.getByProject(p.id).catch(() => []));
      const teamPromises = list.map(async (p) => {
        try {
          const teamsRes = await teamService.getForProject(p.id);
          const teams = Array.isArray(teamsRes) ? teamsRes : teamsRes?.data || [];
          const membersPromises = teams.map(async (t) => {
            const memRes = await teamService.getMembers(t.id);
            return Array.isArray(memRes) ? memRes : memRes?.data || [];
          });
          const membersNested = await Promise.all(membersPromises);
          return membersNested.flat();
        } catch (err) {
          return [];
        }
      });

      const [allMsResults, allTeamResults] = await Promise.all([
        Promise.all(msPromises),
        Promise.all(teamPromises)
      ]);

      const pending = [];
      allMsResults.forEach((msGroup, idx) => {
        const msArr = Array.isArray(msGroup) ? msGroup : msGroup?.data || [];
        msArr.forEach((m) => {
          if (["IN_PROGRESS", "SUBMITTED", "PENDING_REVIEW"].includes(m.status)) {
            pending.push({ ...m, projectTitle: list[idx]?.title, projectId: list[idx]?.id });
          }
        });
      });
      setPendingMilestones(pending);

      const uniqueMembers = [];
      const seenStudentIds = new Set();
      allTeamResults.flat().forEach((m) => {
        const sId = m.student?.id || m.studentId;
        if (sId && !seenStudentIds.has(sId)) {
          seenStudentIds.add(sId);
          uniqueMembers.push(m);
        }
      });
      setStudentRoster(uniqueMembers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDemoSwitch = async (roleKey) => {
    const demoAccounts = {
      CITIZEN: { email: "citizen@sih.gov.in", password: "Password@123", path: "/citizen" },
      ADMIN: { email: "admin@sih.gov.in", password: "Password@123", path: "/admin" },
      UNIVERSITY_IITB: { email: "iitb@sih.gov.in", password: "Password@123", path: "/university" },
      UNIVERSITY_IITM: { email: "iitm@sih.gov.in", password: "Password@123", path: "/university" },
      UNIVERSITY_BHU: { email: "bhu@sih.gov.in", password: "Password@123", path: "/university" },
      UNIVERSITY_BITS: { email: "bits@sih.gov.in", password: "Password@123", path: "/university" },
      FACULTY_IITB: { email: "faculty@iitb.ac.in", password: "Password@123", path: "/faculty" },
      FACULTY_IITM: { email: "faculty@iitm.ac.in", password: "Password@123", path: "/faculty" },
      FACULTY_BHU: { email: "faculty@bhu.ac.in", password: "Password@123", path: "/faculty" },
      FACULTY_BITS: { email: "faculty@bits.ac.in", password: "Password@123", path: "/faculty" },
      STUDENT_IITB: { email: "student@iitb.ac.in", password: "Password@123", path: "/student" },
      STUDENT_IITM: { email: "student@iitm.ac.in", password: "Password@123", path: "/student" },
      STUDENT_BHU: { email: "student@bhu.ac.in", password: "Password@123", path: "/student" },
      STUDENT_BITS: { email: "student@bits.ac.in", password: "Password@123", path: "/student" },
      INDUSTRY: { email: "csr@tata.com", password: "Password@123", path: "/industry" }
    };
    const target = demoAccounts[roleKey];
    if (target) {
      await switchDemoUser(target);
      setDemoOpen(false);
      navigate(target.path);
      setTimeout(() => loadData(), 200);
    }
  };

  const handleApproveMilestone = async (e) => {
    e.preventDefault();
    if (!reviewModalMs) return;
    setReviewLoading(true);
    try {
      await milestoneService.reviewDeliverables(reviewModalMs.id, "APPROVED", reviewFeedback || "Deliverables verified and accepted by Faculty Mentor.");
      alert("Milestone deliverables approved! Engineering stage advanced.");
      setReviewModalMs(null);
      loadData();
    } catch (err) {
      alert("Review failed: " + err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const totalBudget = projects.reduce((acc, p) => acc + (p.estimatedCost || 0), 0);
  const avgProgress = projects.length ? Math.round(projects.reduce((acc, p) => acc + (p.progressPercentage || 0), 0) / projects.length) : 0;
  const prototypeCount = projects.filter((p) => ["DEVELOPMENT", "PROTOTYPE", "TESTING", "PILOT"].includes(p.stage)).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0D0F", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* LEFT SIDEBAR (Emerald Green Accent) */}
      <aside style={{
        width: "260px",
        background: "#111315",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 95
      }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
              color: "#0B0D0F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 900,
              boxShadow: "0 0 16px rgba(52, 211, 153, 0.4)"
            }}>
              🔬
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2", letterSpacing: "0.02em" }}>
                JanNirikshan
              </div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#34D399", letterSpacing: "0.08em" }}>
                SIH26043 • FACULTY
              </div>
            </div>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "18px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", padding: "0 10px 8px", letterSpacing: "0.08em" }}>
            MENTORSHIP CELL
          </div>

          <Link
            to="/faculty"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 800,
              color: "#34D399",
              background: "#1D2023",
              border: "1px solid rgba(52, 211, 153, 0.35)"
            }}
          >
            <span>🔬</span>
            <span>Mentorship Workspace</span>
          </Link>

          <Link
            to="/faculty/reviews"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 650,
              color: "#8F9499"
            }}
          >
            <span>🔍</span>
            <span>Milestone Reviews</span>
          </Link>

          <Link
            to="/faculty/team"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 650,
              color: "#8F9499"
            }}
          >
            <span>👥</span>
            <span>Team & Performance</span>
          </Link>

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
            <span>🗺️</span>
            <span>National Repository</span>
          </Link>
        </nav>

        {/* SIDEBAR FOOTPRINT */}
        <div style={{ padding: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", background: "#111315" }}>
          <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SUPERVISION GATE</span>
              <span style={{ fontSize: "10px", background: "rgba(52, 211, 153, 0.15)", color: "#34D399", padding: "2px 6px", borderRadius: "999px", fontWeight: 800 }}>
                100% GATED ✓
              </span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#F5F5F2" }}>
              {projects.length} Supervised Teams
            </div>
            <div style={{ fontSize: "10.5px", color: "#34D399", marginTop: "2px" }}>
              Milestone Review SLA: 24 Hours
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        
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
              Academic Mentorship Cell • SIH26043
            </div>
            <div style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2" }}>
              Faculty Mentorship & Deliverable Review Workspace
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
                  border: "1px solid rgba(52, 211, 153, 0.35)",
                  color: "#34D399",
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
                ⚡ Role: Faculty Mentor ▼
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
                    { key: "ADMIN", label: "Govt Admin (Director Varma)", desc: "Verify, deduplicate & AI assign" },
                    { key: "UNIVERSITY_IITB", label: "🏛️ IIT Bombay", desc: "IIT Bombay Innovation Cell" },
                    { key: "UNIVERSITY_IITM", label: "🏛️ IIT Madras", desc: "IIT Madras Research Park" },
                    { key: "UNIVERSITY_BHU", label: "🏛️ IIT (BHU) Varanasi", desc: "IIT (BHU) Centre of Excellence" },
                    { key: "UNIVERSITY_BITS", label: "🏛️ BITS Pilani", desc: "BITS Pilani Innovation Hub" },
                    { key: "FACULTY_IITB", label: "🎓 Prof. Ananya (IITB)", desc: "IIT Bombay Faculty Mentor" },
                    { key: "FACULTY_IITM", label: "🎓 Dr. K. Ramesh (IITM)", desc: "IIT Madras Faculty Mentor" },
                    { key: "FACULTY_BHU", label: "🎓 Dr. S.K. Mishra (BHU)", desc: "IIT BHU Faculty Mentor" },
                    { key: "FACULTY_BITS", label: "🎓 Dr. Rajesh Gupta (BITS)", desc: "BITS Pilani Faculty Mentor" },
                    { key: "STUDENT_IITB", label: "🚀 Aarav Patel (IITB)", desc: "IIT Bombay Student Lead" },
                    { key: "STUDENT_IITM", label: "🚀 Sneha Reddy (IITM)", desc: "IIT Madras Student Lead" },
                    { key: "STUDENT_BHU", label: "🚀 Rohan Verma (BHU)", desc: "IIT BHU Student Lead" },
                    { key: "STUDENT_BITS", label: "🚀 Vikram Deshmukh (BITS)", desc: "BITS Pilani Student Lead" },
                    { key: "INDUSTRY", label: "Industry CSR (Tata Trust)", desc: "Pledge CSR grants & funding" }
                  ].map((r) => (
                    <button
                      key={r.key}
                      onClick={() => handleDemoSwitch(r.key)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 8px",
                        borderRadius: "8px",
                        background: (user?.email === "faculty@iitb.ac.in" && r.key === "FACULTY_IITB") ||
                                    (user?.email === "faculty@iitm.ac.in" && r.key === "FACULTY_IITM") ||
                                    (user?.email === "faculty@bhu.ac.in" && r.key === "FACULTY_BHU") ||
                                    (user?.email === "faculty@bits.ac.in" && r.key === "FACULTY_BITS")
                                      ? "rgba(52, 211, 153, 0.15)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "block",
                        marginBottom: "2px"
                      }}
                    >
                      <div style={{ fontSize: "11.5px", fontWeight: 750, color: (user?.email === "faculty@iitb.ac.in" && r.key === "FACULTY_IITB") ||
                                    (user?.email === "faculty@iitm.ac.in" && r.key === "FACULTY_IITM") ||
                                    (user?.email === "faculty@bhu.ac.in" && r.key === "FACULTY_BHU") ||
                                    (user?.email === "faculty@bits.ac.in" && r.key === "FACULTY_BITS") ? "#34D399" : "#F5F5F2" }}>{r.label}</div>
                      <div style={{ fontSize: "9.5px", color: "#8F9499" }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Faculty User Card */}
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
                background: "#34D399",
                color: "#0B0D0F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 900
              }}>
                👩‍🏫
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#F5F5F2" }}>
                  {cleanFacultyName(profile?.user?.name || user?.name)}
                </div>
                <div style={{ fontSize: "10px", color: "#34D399", fontWeight: 750 }}>
                  Faculty Mentor • {profile?.university?.name || (user?.email?.includes("bits") ? "BITS Pilani" : user?.email?.includes("iitm") ? "IIT Madras" : user?.email?.includes("bhu") ? "IIT BHU Varanasi" : "IIT Bombay")}
                </div>
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

        {/* MAIN DASHBOARD CONTENT */}
        <main style={{ flex: 1, padding: "26px 30px 60px", maxWidth: "1400px", width: "100%", boxSizing: "border-box" }}>
          
          {/* HERO */}
          <section style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "24px 28px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  ACADEMIC FACULTY RESEARCH CELL
                </span>
                <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(52, 211, 153, 0.15)", color: "#34D399", padding: "2px 8px", borderRadius: "999px" }}>
                  ✓ Chief Mentor
                </span>
              </div>

              <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
                {cleanFacultyName(profile?.user?.name || user?.name)} ({profile?.university?.name || (user?.email?.includes("bits") ? "BITS Pilani" : user?.email?.includes("iitm") ? "IIT Madras" : user?.email?.includes("bhu") ? "IIT BHU Varanasi" : "IIT Bombay")} Mentor)
              </h1>
              <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
                {profile?.designation ? `${profile.designation} • ${profile.department?.name || profile.specialization || "Research & Mentorship"}` : "Supervise student innovation teams, evaluate milestone deliverables, gate phase transitions, and validate community impact."}
              </p>
            </div>

            <div style={{ background: "#1D2023", padding: "12px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "right" }}>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SUPERVISED BUDGET</div>
              <div style={{ fontSize: "20px", fontWeight: 900, color: "#34D399", marginTop: "2px" }}>
                ₹{(totalBudget / 100000).toFixed(1)} Lakhs
              </div>
            </div>
          </section>

          {/* 4 KPI CARDS */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SUPERVISED PROJECTS</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#34D399", marginTop: "2px" }}>{projects.length}</div>
              <span style={{ fontSize: "10.5px", color: "#34D399" }}>Active Student Teams</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>AVERAGE SPRINT PROGRESS</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>{avgProgress}%</div>
              <span style={{ fontSize: "10.5px", color: "#38BDF8" }}>Milestone Velocity</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>WORKING PROTOTYPES</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#A8E063", marginTop: "2px" }}>{prototypeCount || 1}</div>
              <span style={{ fontSize: "10.5px", color: "#A8E063" }}>Bench Validation Passed</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>PENDING REVIEWS</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#F5C400", marginTop: "2px" }}>1</div>
              <span style={{ fontSize: "10.5px", color: "#F5C400" }}>Milestone Deliverable Gate</span>
            </div>
          </section>

          {/* MAIN GRID: DELIVERABLE REVIEW QUEUE + SUPERVISED PROJECTS */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: "20px" }}>
            
            {/* Left: Supervised Projects Health Matrix */}
            <div style={{
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    TEAM SUPERVISION MATRIX
                  </span>
                  <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 850 }}>
                    Active Mentored Projects ({projects.length})
                  </h2>
                </div>
              </div>

              {projects.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#8F9499" }}>
                  No active projects currently under faculty mentorship.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        background: "#1D2023",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "14px",
                        padding: "18px 20px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "9.5px", background: "rgba(52, 211, 153, 0.15)", color: "#34D399", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                              STAGE: {p.stage}
                            </span>
                            <span style={{ fontSize: "9.5px", background: "#17191C", color: "#FFD21F", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                              ORIGINATING CHALLENGE #{p.complaint?.id || p.complaintId}
                            </span>
                            {p.complaint?.aiDetectedClass && p.complaint.aiDetectedClass !== "NO_SUPPORTED_DEFECT" && (
                              <span style={{ fontSize: "9.5px", background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                                🤖 {p.complaint.aiDetectedClass.replace(/_/g, " ").toUpperCase()} ({p.complaint.aiConfidence ? `${p.complaint.aiConfidence}%` : "AI Verified"})
                              </span>
                            )}
                          </div>
                          <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 4px" }}>
                            {p.title}
                          </h3>
                          {p.complaint?.description && (
                            <p style={{ fontSize: "12px", color: "#8F9499", margin: "0 0 8px", lineHeight: 1.4 }}>
                              {p.complaint.description}
                            </p>
                          )}
                        </div>

                        <span style={{ fontSize: "13px", fontWeight: 900, color: "#34D399" }}>
                          {p.progressPercentage || 10}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden", margin: "8px 0 10px" }}>
                        <div style={{ width: `${p.progressPercentage || 10}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #38bdf8)" }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px", color: "#8F9499", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                          <span>🏛️ {p.university?.name || profile?.university?.name || "Academic Institution"}</span>
                          <span>👩‍🏫 Mentor: <strong style={{ color: "#34D399" }}>{cleanFacultyName(p.facultyMentor?.user?.name || profile?.user?.name || user?.name)}</strong></span>
                          <span>💰 Budget: <strong style={{ color: "#F5F5F2" }}>₹{Number(p.estimatedCost || 400000).toLocaleString()}</strong></span>
                          {p.complaint?.category && (
                            <span>Domain: <strong style={{ color: "#38BDF8" }}>{p.complaint.category}</strong></span>
                          )}
                          {p.complaint?.aiRecommendedDepartment && (
                            <span>Dept: <strong style={{ color: "#F5F5F2" }}>{p.complaint.aiRecommendedDepartment}</strong></span>
                          )}
                        </div>

                        <Link
                          to={`/projects/${p.id}`}
                          style={{
                            background: "#34D399",
                            color: "#0B0D0F",
                            padding: "6px 16px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 900,
                            textDecoration: "none",
                            boxShadow: "0 0 12px rgba(52, 211, 153, 0.3)"
                          }}
                        >
                          Open Sprint Workspace →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Milestone Deliverable Review Gate */}
            <div style={{
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
            }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                PHASE GATE EVALUATION
              </span>
              <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 14px", fontWeight: 850 }}>
                Pending Deliverable Gates
              </h2>

              {pendingMilestones.length === 0 ? (
                <div style={{ background: "#1D2023", borderRadius: "12px", padding: "20px", textAlign: "center", color: "#8F9499" }}>
                  <div style={{ fontSize: "12px", color: "#A8E063", fontWeight: 750 }}>✓ All Milestone Gates Up-to-Date</div>
                  <div style={{ fontSize: "11px", marginTop: "4px" }}>No student deliverable submissions currently awaiting faculty review.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {pendingMilestones.slice(0, 3).map((m) => (
                    <div key={m.id} style={{ background: "#1D2023", border: "1px solid rgba(52, 211, 153, 0.3)", borderRadius: "14px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "9.5px", fontWeight: 800, background: "rgba(245, 196, 0, 0.15)", color: "#F5C400", padding: "2px 6px", borderRadius: "4px" }}>
                          {m.status || "IN_PROGRESS"}
                        </span>
                        <span style={{ fontSize: "9.5px", color: "#8F9499" }}>Milestone #{m.id}</span>
                      </div>
                      <h3 style={{ fontSize: "13.5px", fontWeight: 850, color: "#F5F5F2", margin: "4px 0" }}>
                        {m.title}
                      </h3>
                      <p style={{ fontSize: "11.5px", color: "#8F9499", margin: "0 0 8px" }}>
                        Project: {m.projectTitle || `Project #${m.projectId}`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setReviewModalMs(m)}
                        style={{
                          width: "100%",
                          background: "#34D399",
                          color: "#0B0D0F",
                          border: "none",
                          padding: "7px 12px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 900,
                          cursor: "pointer",
                          boxShadow: "0 0 12px rgba(52, 211, 153, 0.35)"
                        }}
                      >
                        🔍 Evaluate & Approve Deliverable →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: "16px", background: "#1D2023", borderRadius: "12px", padding: "14px" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>
                  SUPERVISED STUDENT ROSTER ({studentRoster.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px", fontSize: "12px" }}>
                  {studentRoster.length === 0 ? (
                    <div style={{ color: "#8F9499", fontSize: "11.5px" }}>No student team members assigned yet.</div>
                  ) : (
                    studentRoster.map((m, idx) => {
                      const rawName = m.student?.user?.name || "Student Lead";
                      const cleanStudentName = rawName.replace(/\s*\((?:Student Lead|Student)\)/gi, "").trim();
                      const roleLabel = m.roleInTeam || m.role || "Team Lead";
                      return (
                        <div key={m.id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#F5F5F2" }}>
                            👨‍🎓 {cleanStudentName} ({roleLabel})
                          </span>
                          <span style={{ color: "#34D399", fontWeight: 750, fontSize: "11px" }}>Active</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* DELIVERABLE APPROVAL MODAL */}
      {reviewModalMs && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(52, 211, 153, 0.35)",
            borderRadius: "20px",
            maxWidth: "540px",
            width: "100%",
            padding: "26px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7)"
          }}>
            <h3 style={{ fontSize: "17px", color: "#F5F5F2", margin: "0 0 10px", fontWeight: 900 }}>
              🔬 Faculty Deliverable Evaluation Gate
            </h3>
            <p style={{ fontSize: "12.5px", color: "#8F9499", margin: "0 0 14px" }}>
              Evaluating deliverables for: <strong>{reviewModalMs.title}</strong>
            </p>

            <form onSubmit={handleApproveMilestone} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  Faculty Evaluation Feedback & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Bench results verified with >95% adsorption efficiency. Approved for next phase..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#1D2023",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#F5F5F2",
                    fontSize: "12.5px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setReviewModalMs(null)}
                  style={{ background: "#1D2023", border: "none", color: "#8F9499", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  style={{
                    background: "#34D399",
                    color: "#0B0D0F",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 0 16px rgba(52, 211, 153, 0.4)"
                  }}
                >
                  {reviewLoading ? "Evaluating..." : "✓ Approve & Advance Milestone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

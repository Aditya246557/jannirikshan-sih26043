import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import studentService from "../../services/studentService";
import projectService from "../../services/projectService";
import taskService from "../../services/taskService";
import milestoneService from "../../services/milestoneService";

export default function StudentSkills() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);

  // Edit Skills Modal
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [linkedinInput, setLinkedinInput] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [sProfile, prjs] = await Promise.all([
        studentService.getMyProfile().catch(() => null),
        projectService.getMyProjects().catch(() => [])
      ]);
      setStudent(sProfile);
      setSkillsInput(sProfile?.skills || "Embedded C, IoT Telemetry, Python, React, Circuit Design, LoRaWAN");
      setGithubInput(sProfile?.githubUrl || "https://github.com/sih2026/arsenic-filter-iot");
      setLinkedinInput(sProfile?.linkedinUrl || "https://linkedin.com/in/student-lead-iitb");

      const pList = Array.isArray(prjs) ? prjs : prjs?.content || prjs?.data || [];
      setProjects(pList);

      if (pList.length > 0) {
        const [t, ms] = await Promise.all([
          taskService.getByProject(pList[0].id).catch(() => []),
          milestoneService.getByProject(pList[0].id).catch(() => [])
        ]);
        setTasks(Array.isArray(t) ? t : t?.data || []);
        setMilestones(Array.isArray(ms) ? ms : ms?.data || []);
      }
    } catch (e) {
      console.error("Student skills load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSkills = async (e) => {
    e.preventDefault();
    try {
      await studentService.updateProfile({
        skills: skillsInput,
        githubUrl: githubInput,
        linkedinUrl: linkedinInput
      });
      alert("Innovation profile & technical skills updated successfully!");
      setShowSkillModal(false);
      loadData();
    } catch (err) {
      alert("Update failed: " + err.message);
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

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED" || t.status === "DONE").length;
  const approvedMilestones = milestones.filter((m) => m.status === "APPROVED").length;

  const skillsList = (student?.skills || skillsInput)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0D0F", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* SIDEBAR (Amber Accent) */}
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
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              color: "#0B0D0F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 900,
              boxShadow: "0 0 16px rgba(245, 158, 11, 0.4)"
            }}>
              👨‍🎓
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2" }}>JanNirikshan</div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#F59E0B", letterSpacing: "0.08em" }}>
                SIH26043 • STUDENT
              </div>
            </div>
          </Link>
        </div>

        <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link to="/student" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
            <span>📊</span>
            <span>Sprint Board</span>
          </Link>

          <Link to="/student/workspace" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 750 }}>
            <span>⚡</span>
            <span>Innovation Workspace</span>
          </Link>

          <Link to="/student/profile/skills" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#F5F5F2", background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>
            <span>⭐</span>
            <span>Skills & Contribution</span>
          </Link>

          <Link to="/explore" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
            <span>🗺️</span>
            <span>National Challenges</span>
          </Link>
        </nav>

        {/* DEMO SWITCHER */}
        <div style={{ padding: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <button
            onClick={() => setDemoOpen(!demoOpen)}
            style={{
              width: "100%",
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "#F59E0B",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>⚡ Demo Switcher</span>
            <span>{demoOpen ? "▲" : "▼"}</span>
          </button>

          {demoOpen && (
            <div style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              {["CITIZEN", "ADMIN", "UNIVERSITY", "FACULTY", "STUDENT", "INDUSTRY"].map((r) => (
                <button
                  key={r}
                  onClick={() => handleDemoSwitch(r)}
                  style={{
                    background: r === "STUDENT" ? "rgba(245, 158, 11, 0.2)" : "#1D2023",
                    border: r === "STUDENT" ? "1px solid #F59E0B" : "1px solid rgba(255, 255, 255, 0.05)",
                    color: r === "STUDENT" ? "#F59E0B" : "#B7BCC2",
                    borderRadius: "4px",
                    padding: "4px",
                    fontSize: "9.5px",
                    fontWeight: 750,
                    cursor: "pointer"
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEW */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        
        {/* TOP BAR */}
        <header style={{
          height: "64px",
          background: "#111315",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 90
        }}>
          <div>
            <span style={{ fontSize: "11px", color: "#8F9499" }}>Student R&D Hub / </span>
            <span style={{ fontSize: "11px", color: "#F59E0B", fontWeight: 800 }}>Skills & Contribution</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "12.5px", color: "#F5F5F2", fontWeight: 750 }}>
              {student?.user?.name || user?.name || "Student Lead"} • {student?.university?.name || (user?.email?.includes("bits") ? "BITS Pilani" : user?.email?.includes("iitm") ? "IIT Madras" : user?.email?.includes("bhu") ? "IIT BHU Varanasi" : "IIT Bombay")}
            </span>
            <button
              onClick={() => logout().then(() => navigate("/login"))}
              style={{
                background: "#1D2023",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#8F9499",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* BODY */}
        <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          
          {/* PROFILE HERO CARD */}
          <div style={{
            background: "#111315",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "28px 32px",
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{
                width: "68px",
                height: "68px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                color: "#0B0D0F",
                boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)"
              }}>
                👨‍🎓
              </div>
              <div>
                <span style={{ fontSize: "10.5px", fontWeight: 850, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  VERIFIED STUDENT INNOVATOR • LEAD ENGINEER
                </span>
                <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 6px" }}>
                  {user?.name || "Rohan Sharma"}
                </h1>
                <div style={{ fontSize: "12.5px", color: "#8F9499" }}>
                  Roll No: <strong style={{ color: "#F5F5F2" }}>{student?.rollNumber || "2023BTECE042"}</strong> • Degree: <strong style={{ color: "#F5F5F2" }}>{student?.degree || "B.Tech Electronics & Communication"}</strong> • Sem: <strong style={{ color: "#F5F5F2" }}>{student?.semester || 6}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSkillModal(true)}
              style={{
                background: "#1D2023",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#F59E0B",
                padding: "9px 18px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              ✏️ Edit Skills & Links
            </button>
          </div>

          {/* 4 CONTRIBUTION STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>TASKS COMPLETED</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#34D399", marginTop: "2px" }}>{completedTasks}</div>
              <span style={{ fontSize: "11px", color: "#34D399" }}>Verified Code & Tests</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>GATED MILESTONES</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F59E0B", marginTop: "2px" }}>{approvedMilestones}</div>
              <span style={{ fontSize: "11px", color: "#F59E0B" }}>Faculty Verified</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>ACTIVE PROJECTS</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>{projects.length || 1}</div>
              <span style={{ fontSize: "11px", color: "#38BDF8" }}>R&D Prototypes</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>COMMUNITY FOOTPRINT</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#FF4FA3", marginTop: "2px" }}>98/100</div>
              <span style={{ fontSize: "11px", color: "#FF4FA3" }}>Top Innovator Percentile</span>
            </div>
          </div>

          {/* 2-COLUMN SECTION: SKILLS INVENTORY & ACHIEVEMENTS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            
            {/* TECHNICAL SKILLS */}
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "18px", padding: "26px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 16px" }}>
                Technical Competencies & Skills
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                {skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "rgba(245, 158, 11, 0.12)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      color: "#F59E0B",
                      fontSize: "12px",
                      fontWeight: 800,
                      padding: "6px 12px",
                      borderRadius: "8px"
                    }}
                  >
                    ⚡ {skill}
                  </span>
                ))}
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>DEVELOPER PROFILES</div>
                {student?.githubUrl && (
                  <a href={student.githubUrl} target="_blank" rel="noreferrer" style={{ color: "#38BDF8", fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                    📦 GitHub: {student.githubUrl} ↗
                  </a>
                )}
                {student?.linkedinUrl && (
                  <a href={student.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: "#38BDF8", fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                    🔗 LinkedIn: {student.linkedinUrl} ↗
                  </a>
                )}
              </div>
            </div>

            {/* VERIFIED INNOVATION ACHIEVEMENTS */}
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "18px", padding: "26px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 16px" }}>
                Innovation Achievements & Credentials
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ background: "#17191C", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ fontSize: "24px" }}>🏆</div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#F5F5F2" }}>Smart India Hackathon Finalist</div>
                    <div style={{ fontSize: "11.5px", color: "#8F9499" }}>National Civic Innovation Category (SIH26043)</div>
                  </div>
                </div>

                <div style={{ background: "#17191C", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ fontSize: "24px" }}>🔬</div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#F5F5F2" }}>Embedded Sensor Node Architecture Certified</div>
                    <div style={{ fontSize: "11.5px", color: "#8F9499" }}>IIT Bombay Center for IoT & Telemetry Systems</div>
                  </div>
                </div>

                <div style={{ background: "#17191C", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ fontSize: "24px" }}>💎</div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#F5F5F2" }}>CSR Impact Grant Recipient</div>
                    <div style={{ fontSize: "11.5px", color: "#8F9499" }}>Tata Trust Civic Infrastructure R&D Grant (₹5,00,000)</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* EDIT SKILLS MODAL */}
      {showSkillModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "560px", background: "#111315", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "20px", padding: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#F59E0B", textTransform: "uppercase" }}>INNOVATION PROFILE</span>
                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 0" }}>
                  Update Technical Skills & Repositories
                </h2>
              </div>
              <button onClick={() => setShowSkillModal(false)} style={{ background: "none", border: "none", color: "#8F9499", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleSaveSkills} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Skills (Comma-separated) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="Embedded C, IoT Telemetry, Python, React, Circuit Design, LoRaWAN"
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  GitHub Profile or Repository URL
                </label>
                <input
                  type="url"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  placeholder="https://github.com/username"
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedinInput}
                  onChange={(e) => setLinkedinInput(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.12)", color: "#F5F5F2", padding: "9px 18px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 750, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#F59E0B", border: "none", color: "#0B0D0F", padding: "9px 20px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 850, cursor: "pointer", boxShadow: "0 0 16px rgba(245,158,11,0.35)" }}
                >
                  Save Profile →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


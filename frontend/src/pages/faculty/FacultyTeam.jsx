import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import projectService from "../../services/projectService";
import taskService from "../../services/taskService";
import milestoneService from "../../services/milestoneService";
import facultyService from "../../services/facultyService";

const cleanFacultyName = (name) => {
  if (!name) return "Faculty Mentor";
  return name.replace(/\s*\((?:Faculty Mentor|Mentor|Faculty)\)/gi, "").trim();
};

export default function FacultyTeam() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prof, res] = await Promise.all([
        facultyService.getMyProfile().catch(() => null),
        projectService.getMyProjects().catch(() => projectService.getAll(0, 20))
      ]);
      setProfile(prof);
      const pList = Array.isArray(res) ? res : res?.content || res?.data || [];
      setProjects(pList);

      const taskPromises = pList.map((p) =>
        taskService.getByProject(p.id).then((t) => {
          const list = Array.isArray(t) ? t : t?.data || [];
          return list.map((item) => ({ ...item, projectTitle: p.title, projectId: p.id }));
        }).catch(() => [])
      );

      const msPromises = pList.map((p) =>
        milestoneService.getByProject(p.id).then((ms) => {
          const list = Array.isArray(ms) ? ms : ms?.data || [];
          return list.map((item) => ({ ...item, projectTitle: p.title, projectId: p.id }));
        }).catch(() => [])
      );

      const [taskRes, msRes] = await Promise.all([
        Promise.all(taskPromises),
        Promise.all(msPromises)
      ]);

      setTasks(taskRes.flat());
      setMilestones(msRes.flat());
    } catch (e) {
      console.error("Faculty team load error:", e);
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

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED" || t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 100;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0D0F", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* SIDEBAR (Emerald Green Accent) */}
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
              👩‍🏫
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2" }}>SOCIO-SPHERE</div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#34D399", letterSpacing: "0.08em" }}>
                SIH26043 • FACULTY
              </div>
            </div>
          </Link>
        </div>

        <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link to="/faculty" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
            <span>📊</span>
            <span>Mentorship Dashboard</span>
          </Link>

          <Link to="/faculty/reviews" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 750 }}>
            <span>🔍</span>
            <span>Milestone Reviews</span>
          </Link>

          <Link to="/faculty/team" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#F5F5F2", background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.3)", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>
            <span>👥</span>
            <span>Team & Performance</span>
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
              color: "#34D399",
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
                    background: r === "FACULTY" ? "rgba(52, 211, 153, 0.2)" : "#1D2023",
                    border: r === "FACULTY" ? "1px solid #34D399" : "1px solid rgba(255, 255, 255, 0.05)",
                    color: r === "FACULTY" ? "#34D399" : "#B7BCC2",
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
            <span style={{ fontSize: "11px", color: "#8F9499" }}>Faculty Mentorship Hub / </span>
            <span style={{ fontSize: "11px", color: "#34D399", fontWeight: 800 }}>Team & Performance</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "12.5px", color: "#F5F5F2", fontWeight: 750 }}>
              {cleanFacultyName(profile?.user?.name || user?.name)} • {profile?.university?.name || (user?.email?.includes("bits") ? "BITS Pilani" : user?.email?.includes("iitm") ? "IIT Madras" : user?.email?.includes("bhu") ? "IIT BHU Varanasi" : "IIT Bombay")}
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
          
          {/* HERO BANNER */}
          <div style={{
            background: "#111315",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "26px 30px",
            marginBottom: "24px"
          }}>
            <div style={{ fontSize: "10.5px", fontWeight: 850, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              TEAM CAPACITY & VELOCITY AUDIT
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "0 0 6px" }}>
              Student Engineering Team & Sprint Performance
            </h1>
            <p style={{ fontSize: "13px", color: "#8F9499", margin: 0, maxWidth: "720px" }}>
              Track student task distribution, sprint throughput, milestone contributions, and technical competencies across all supervised project squads.
            </p>
          </div>

          {/* 4 SUMMARY STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SUPERVISED PROJECTS</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F5F5F2", marginTop: "2px" }}>{projects.length}</div>
              <span style={{ fontSize: "11px", color: "#34D399" }}>Active R&D Teams</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SPRINT TASKS RECORDED</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>{totalTasks}</div>
              <span style={{ fontSize: "11px", color: "#38BDF8" }}>Kanban Work Items</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>TASKS COMPLETED</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#34D399", marginTop: "2px" }}>{completedTasks}</div>
              <span style={{ fontSize: "11px", color: "#34D399" }}>{taskCompletionRate}% Velocity</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>ACTIVE SPRINT WORKLOAD</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F59E0B", marginTop: "2px" }}>{inProgressTasks}</div>
              <span style={{ fontSize: "11px", color: "#F59E0B" }}>In Development</span>
            </div>
          </div>

          {/* SUPERVISED PROJECTS & TEAMS */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: 0 }}>
                Supervised Engineering Project Teams ({projects.length})
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
              {projects.map((p) => {
                const pTasks = tasks.filter((t) => t.projectId === p.id);
                const pCompleted = pTasks.filter((t) => t.status === "COMPLETED" || t.status === "DONE").length;
                const pMilestones = milestones.filter((m) => m.projectId === p.id);
                const pApprovedMs = pMilestones.filter((m) => m.status === "APPROVED").length;

                return (
                  <div key={p.id} style={{
                    background: "#111315",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px"
                  }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ background: "rgba(52, 211, 153, 0.12)", color: "#34D399", fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px" }}>
                          {p.stage || "PROTOTYPE"}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "#8F9499" }}>Project #{p.id}</span>
                      </div>

                      <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 6px" }}>
                        {p.title}
                      </h3>

                      <p style={{ fontSize: "12.5px", color: "#8F9499", margin: "0 0 14px", lineHeight: 1.5 }}>
                        {p.objective || p.solutionDescription}
                      </p>

                      {/* TEAM COMPOSITION */}
                      <div style={{ background: "#17191C", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.05)", marginBottom: "12px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "6px" }}>ASSIGNED STUDENT TEAM</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#0B0D0F", fontWeight: 850 }}>
                            🎓
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 750, color: "#F5F5F2" }}>
                              {p.studentLead?.name || "Student Lead (student@iitb.ac.in)"}
                            </div>
                            <div style={{ fontSize: "11px", color: "#F59E0B" }}>Lead Firmware & Hardware Engineer</div>
                          </div>
                        </div>
                      </div>

                      {/* SPRINT PROGRESS BAR */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "#8F9499", marginBottom: "4px" }}>
                          <span>Sprint Progress</span>
                          <span style={{ color: "#34D399", fontWeight: 800 }}>{pTasks.length ? Math.round((pCompleted / pTasks.length) * 100) : p.progressPercentage || 75}%</span>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "#1D2023", borderRadius: "999px", overflow: "hidden" }}>
                          <div style={{ width: `${pTasks.length ? Math.round((pCompleted / pTasks.length) * 100) : p.progressPercentage || 75}%`, height: "100%", background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)" }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11.5px", color: "#B7BCC2" }}>
                        Milestones: <strong style={{ color: "#34D399" }}>{pApprovedMs}/{pMilestones.length || 3} Gated</strong>
                      </span>
                      <Link
                        to={`/projects/${p.id}`}
                        style={{
                          background: "#1D2023",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "#F5F5F2",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: 800,
                          textDecoration: "none"
                        }}
                      >
                        Inspect Workspace →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SPRINT TASK DISTRIBUTION */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: 0 }}>
                Live Sprint Tasks & Activity Feed ({tasks.length})
              </h2>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", overflow: "hidden" }}>
              {tasks.length === 0 ? (
                <div style={{ padding: "36px", textAlign: "center", color: "#8F9499" }}>
                  No active sprint tasks registered yet.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#17191C", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#8F9499", fontSize: "11px", textTransform: "uppercase" }}>
                      <th style={{ padding: "14px 20px" }}>Task Title</th>
                      <th style={{ padding: "14px 20px" }}>Project</th>
                      <th style={{ padding: "14px 20px" }}>Priority</th>
                      <th style={{ padding: "14px 20px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "14px 20px", fontWeight: 750, color: "#F5F5F2" }}>{t.title}</td>
                        <td style={{ padding: "14px 20px", color: "#38BDF8" }}>{t.projectTitle}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            background: t.priority === "HIGH" ? "rgba(255, 92, 92, 0.12)" : "rgba(245, 158, 11, 0.12)",
                            color: t.priority === "HIGH" ? "#FF5C5C" : "#F59E0B",
                            fontSize: "11px",
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: "4px"
                          }}>
                            {t.priority || "MEDIUM"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            background: (t.status === "COMPLETED" || t.status === "DONE") ? "rgba(52, 211, 153, 0.12)" : "rgba(56, 189, 248, 0.12)",
                            color: (t.status === "COMPLETED" || t.status === "DONE") ? "#34D399" : "#38BDF8",
                            fontSize: "11px",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "6px"
                          }}>
                            {t.status || "TODO"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}


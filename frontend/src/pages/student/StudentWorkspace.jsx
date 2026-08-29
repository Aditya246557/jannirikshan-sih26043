import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import projectService from "../../services/projectService";
import milestoneService from "../../services/milestoneService";
import taskService from "../../services/taskService";
import evidenceService from "../../services/evidenceService";

export default function StudentWorkspace() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectEvidence, setProjectEvidence] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  // Deliverable Submission Modal
  const [showDelivModal, setShowDelivModal] = useState(false);
  const [delivForm, setDelivForm] = useState({
    milestoneId: "",
    deliverables: "GitHub: https://github.com/sih2026/arsenic-filter-iot\nFirmware v1.3 build release and bench calibration report",
    submissionNotes: "Completed bench sensor validation and telemetry uplink integration."
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await projectService.getMyProjects().catch(() => projectService.getAll(0, 20));
      const list = Array.isArray(res) ? res : res?.content || res?.data || [];
      setProjects(list);

      const active = list[0] || null;
      setSelectedProject(active);

      if (active?.id) {
        const [ms, t, ev] = await Promise.all([
          milestoneService.getByProject(active.id).catch(() => []),
          taskService.getByProject(active.id).catch(() => []),
          evidenceService.getForProject(active.id).catch(() => [])
        ]);
        const msList = Array.isArray(ms) ? ms : ms?.data || [];
        setMilestones(msList);
        setTasks(Array.isArray(t) ? t : t?.data || []);
        setProjectEvidence(Array.isArray(ev) ? ev : ev?.data || []);
        const actionable = msList.find((m) => m.status !== "APPROVED");
        if (actionable) {
          setDelivForm((prev) => ({ ...prev, milestoneId: actionable.id }));
        } else if (msList.length > 0) {
          setDelivForm((prev) => ({ ...prev, milestoneId: "" }));
        }
      }
    } catch (e) {
      console.error("Student workspace error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectProject = async (prj) => {
    setSelectedProject(prj);
    if (prj?.id) {
      try {
        const [ms, t, ev] = await Promise.all([
          milestoneService.getByProject(prj.id).catch(() => []),
          taskService.getByProject(prj.id).catch(() => []),
          evidenceService.getForProject(prj.id).catch(() => [])
        ]);
        const msList = Array.isArray(ms) ? ms : ms?.data || [];
        setMilestones(msList);
        setTasks(Array.isArray(t) ? t : t?.data || []);
        setProjectEvidence(Array.isArray(ev) ? ev : ev?.data || []);
        const actionable = msList.find((m) => m.status !== "APPROVED");
        if (actionable) {
          setDelivForm((prev) => ({ ...prev, milestoneId: actionable.id }));
        } else if (msList.length > 0) {
          setDelivForm((prev) => ({ ...prev, milestoneId: "" }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleOpenDeliverableModal = () => {
    const actionable = milestones.find((m) => m.status !== "APPROVED");
    if (!actionable) {
      alert("All project milestones have already been approved by the Faculty Mentor!");
      return;
    }
    setDelivForm((prev) => ({
      ...prev,
      milestoneId: actionable.id
    }));
    setShowDelivModal(true);
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!delivForm.milestoneId) {
      alert("Please select a target milestone.");
      return;
    }
    const target = milestones.find((m) => String(m.id) === String(delivForm.milestoneId));
    const targetOrder = target?.milestoneOrder || "";
    try {
      await milestoneService.submitDeliverables(
        delivForm.milestoneId,
        delivForm.deliverables,
        delivForm.submissionNotes
      );
      alert(`Milestone M${targetOrder} submitted successfully for Faculty Review.`);
      setShowDelivModal(false);
      loadData();
    } catch (err) {
      alert("Submission failed: " + (err.response?.data?.message || err.message));
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
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2" }}>SOCIO-SPHERE</div>
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

          <Link to="/student/workspace" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#F5F5F2", background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>
            <span>⚡</span>
            <span>Innovation Workspace</span>
          </Link>

          <Link to="/student/profile/skills" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
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
            <span style={{ fontSize: "11px", color: "#F59E0B", fontWeight: 800 }}>Innovation Workspace</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "12.5px", color: "#F5F5F2", fontWeight: 750 }}>
              {user?.name || "Student Lead"} • {user?.email?.includes("bits") ? "BITS Pilani" : user?.email?.includes("iitm") ? "IIT Madras" : user?.email?.includes("bhu") ? "IIT BHU Varanasi" : "IIT Bombay"}
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
          
          {/* PROJECT HEADER CARD */}
          {selectedProject && (
            <div style={{
              background: "#111315",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              padding: "26px 30px",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "10.5px", fontWeight: 850, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    ENGINEERING WORKSPACE • PROJECT #{selectedProject.id}
                  </span>
                  <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "4px 0 6px" }}>
                    {selectedProject.title}
                  </h1>
                  <div style={{ fontSize: "12.5px", color: "#8F9499" }}>
                    Institution: <strong style={{ color: "#F5F5F2" }}>{selectedProject.university?.name || "IIT Bombay"}</strong> • Mentor: <strong style={{ color: "#34D399" }}>{selectedProject.facultyMentor?.user?.name || selectedProject.facultyMentor?.name || "Faculty Mentor"}</strong>
                  </div>
                </div>

                <button
                  onClick={handleOpenDeliverableModal}
                  style={{
                    background: "#F59E0B",
                    color: "#0B0D0F",
                    border: "none",
                    padding: "9px 18px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 850,
                    cursor: "pointer",
                    boxShadow: "0 0 16px rgba(245, 158, 11, 0.35)"
                  }}
                >
                  + Submit Deliverable
                </button>
              </div>

              {/* STAGE PIPELINE */}
              <div style={{ display: "flex", gap: "8px", marginTop: "16px", background: "#17191C", padding: "8px 12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                {["RESEARCH", "DEVELOPMENT", "PROTOTYPE", "TESTING", "PILOT", "IMPACT"].map((st) => (
                  <div key={st} style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "6px",
                    borderRadius: "6px",
                    background: (selectedProject.stage === st) ? "rgba(245, 158, 11, 0.2)" : "transparent",
                    color: (selectedProject.stage === st) ? "#F59E0B" : "#8F9499",
                    fontWeight: (selectedProject.stage === st) ? 850 : 700,
                    fontSize: "11px"
                  }}>
                    {st}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WORKSPACE NAVIGATION TABS */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px", overflowX: "auto" }}>
            {[
              { key: "OVERVIEW", label: "Overview" },
              { key: "PROBLEM", label: "Problem Analysis" },
              { key: "SOLUTION", label: "Solution Design" },
              { key: "ARCHITECTURE", label: "System Architecture" },
              { key: "PROTOTYPE", label: "Prototype & Hardware" },
              { key: "TESTING", label: "Testing & Validation" },
              { key: "DOCUMENTATION", label: "Docs & Repository" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: activeTab === tab.key ? "rgba(245, 158, 11, 0.15)" : "#111315",
                  border: activeTab === tab.key ? "1px solid #F59E0B" : "1px solid rgba(255, 255, 255, 0.08)",
                  color: activeTab === tab.key ? "#F59E0B" : "#8F9499",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}
          {activeTab === "OVERVIEW" && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 10px" }}>Project Scope & Objective</h3>
                  <p style={{ fontSize: "13.5px", color: "#B7BCC2", lineHeight: 1.6, margin: "0 0 14px" }}>
                    {selectedProject?.objective || "Develop robust scalable prototype addressing civic challenge."}
                  </p>
                  <div style={{ fontSize: "13px", color: "#8F9499" }}>
                    Technology Stack: <strong style={{ color: "#F5F5F2" }}>{selectedProject?.technologyStack || "Embedded IoT, Python, React, Cloud Telemetry"}</strong>
                  </div>
                </div>

                {/* SPRINT METRICS */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SPRINT TASKS</span>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>{completedTasks}/{tasks.length || 6}</div>
                    <span style={{ fontSize: "11px", color: "#38BDF8" }}>Tasks Completed</span>
                  </div>

                  <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>GATED MILESTONES</span>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#34D399", marginTop: "2px" }}>{approvedMilestones}/{milestones.length || 3}</div>
                    <span style={{ fontSize: "11px", color: "#34D399" }}>Faculty Approved</span>
                  </div>
                </div>
              </div>

              {/* SIDEBAR INFO */}
              <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 14px" }}>Active Milestones</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {milestones.map((m) => (
                    <div key={m.id} style={{ background: "#17191C", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                        <span style={{ color: "#F59E0B", fontWeight: 800 }}>M{m.milestoneOrder || 1}</span>
                        <span style={{ color: m.status === "APPROVED" ? "#34D399" : "#8F9499" }}>{m.status}</span>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 750, color: "#F5F5F2" }}>{m.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "PROBLEM" && (
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "28px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 12px" }}>Original Civic Challenge Decomposition</h3>
              <p style={{ fontSize: "13.5px", color: "#B7BCC2", lineHeight: 1.6, margin: "0 0 20px" }}>
                {selectedProject?.complaint?.description || "Civic issue requiring hardware IoT monitoring and filtration automation."}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                <div style={{ background: "#17191C", padding: "14px", borderRadius: "10px" }}>
                  <span style={{ fontSize: "11px", color: "#8F9499" }}>PRIORITY</span>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#FF5C5C", marginTop: "2px" }}>{selectedProject?.complaint?.priority || "HIGH"}</div>
                </div>
                <div style={{ background: "#17191C", padding: "14px", borderRadius: "10px" }}>
                  <span style={{ fontSize: "11px", color: "#8F9499" }}>CATEGORY</span>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#38BDF8", marginTop: "2px" }}>{selectedProject?.complaint?.category || "Water Infrastructure"}</div>
                </div>
                <div style={{ background: "#17191C", padding: "14px", borderRadius: "10px" }}>
                  <span style={{ fontSize: "11px", color: "#8F9499" }}>LOCATION</span>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#F59E0B", marginTop: "2px" }}>
                    📍 {selectedProject?.complaint?.address || selectedProject?.complaint?.district || selectedProject?.complaint?.villageCity || "Field Location"}
                  </div>
                </div>
              </div>

              {/* Citizen Field Survey Evidence */}
              <div style={{ background: "#17191C", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 850, color: "#F59E0B", textTransform: "uppercase", marginBottom: "10px" }}>
                  📷 Citizen Survey Evidence ({projectEvidence.length})
                </div>

                {projectEvidence.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "#8F9499", fontStyle: "italic" }}>
                    No multimedia attachments uploaded for this problem statement.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                    {projectEvidence.map((ev) => (
                      <div key={ev.id} style={{ background: "#111315", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", padding: "6px" }}>
                        {ev.contentType?.startsWith("image/") || ev.fileUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                          <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer">
                            <img src={ev.fileUrl} alt="Evidence" style={{ width: "100%", height: "75px", objectFit: "cover", borderRadius: "6px" }} />
                          </a>
                        ) : (
                          <div style={{ height: "75px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>📄</div>
                        )}
                        <div style={{ fontSize: "9.5px", color: "#F5F5F2", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ev.originalFileName || `Evidence #${ev.id}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "SOLUTION" && (
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "28px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 12px" }}>Proposed Engineering Methodology</h3>
              <p style={{ fontSize: "13.5px", color: "#B7BCC2", lineHeight: 1.6, margin: "0 0 20px" }}>
                {selectedProject?.solutionDescription || "Embedded sensor node with LoRaWAN telemetry transmitting continuous filtration health to national grid."}
              </p>
              <div style={{ background: "#17191C", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#34D399", textTransform: "uppercase" }}>EXPECTED SOCIAL IMPACT</span>
                <p style={{ fontSize: "13px", color: "#F5F5F2", margin: "6px 0 0", lineHeight: 1.6 }}>
                  {selectedProject?.complaint?.expectedImpact || "Elimination of arsenic contaminant exposure, continuous water quality telemetry, and automated maintenance dispatch."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "ARCHITECTURE" && (
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "28px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 12px" }}>System Block Architecture & Telemetry Pipeline</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div style={{ background: "#17191C", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 850, color: "#F59E0B", marginBottom: "8px" }}>1. SENSING LAYER</div>
                  <p style={{ fontSize: "12.5px", color: "#B7BCC2", margin: 0, lineHeight: 1.5 }}>
                    Optical spectrometer probe + TDS sensor connected to ESP32 microcontroller over I2C/SPI bus.
                  </p>
                </div>

                <div style={{ background: "#17191C", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 850, color: "#38BDF8", marginBottom: "8px" }}>2. EDGE TELEMETRY</div>
                  <p style={{ fontSize: "12.5px", color: "#B7BCC2", margin: 0, lineHeight: 1.5 }}>
                    SX1276 LoRaWAN radio broadcasting packets every 60 seconds with AES-128 payload encryption.
                  </p>
                </div>

                <div style={{ background: "#17191C", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 850, color: "#34D399", marginBottom: "8px" }}>3. CLOUD INGESTION</div>
                  <p style={{ fontSize: "12.5px", color: "#B7BCC2", margin: 0, lineHeight: 1.5 }}>
                    Spring Boot microservice logging readings to PostgreSQL and triggering automated municipal alerts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "PROTOTYPE" && (
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "28px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 12px" }}>Prototype Version History & Bench Observations</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                <div style={{ background: "#17191C", padding: "16px", borderRadius: "12px", border: "1px solid rgba(52, 211, 153, 0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 850, color: "#34D399" }}>Prototype v1.3 (Current Benchmark)</span>
                    <span style={{ background: "rgba(52, 211, 153, 0.12)", color: "#34D399", fontSize: "11px", padding: "2px 8px", borderRadius: "4px" }}>VALIDATED</span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#B7BCC2", margin: 0 }}>
                    Integrated custom PCB with optical flow meter. Successfully filtered 500L bench fluid with ±0.01 ppm sensor precision.
                  </p>
                </div>

                <div style={{ background: "#17191C", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#F5F5F2" }}>Prototype v1.0 (Breadboard Concept)</span>
                    <span style={{ background: "rgba(255, 255, 255, 0.05)", color: "#8F9499", fontSize: "11px", padding: "2px 8px", borderRadius: "4px" }}>ARCHIVED</span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#8F9499", margin: 0 }}>
                    Initial proof of concept using breadboard wiring and manual spectrometer readings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "TESTING" && (
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "28px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 12px" }}>Quality Assurance & Sensor Calibration Suite</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", marginTop: "14px" }}>
                <thead>
                  <tr style={{ background: "#17191C", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#8F9499", fontSize: "11px", textTransform: "uppercase" }}>
                    <th style={{ padding: "12px 16px" }}>Test Case</th>
                    <th style={{ padding: "12px 16px" }}>Target Specification</th>
                    <th style={{ padding: "12px 16px" }}>Observed Metric</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "12px 16px", color: "#F5F5F2", fontWeight: 750 }}>TC-01: Arsenic Sensor Resolution</td>
                    <td style={{ padding: "12px 16px", color: "#8F9499" }}>&lt; 0.02 ppm error margin</td>
                    <td style={{ padding: "12px 16px", color: "#34D399" }}>±0.008 ppm (PASSED)</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ color: "#34D399", fontWeight: 800 }}>PASS</span></td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "12px 16px", color: "#F5F5F2", fontWeight: 750 }}>TC-02: LoRa Telemetry Range</td>
                    <td style={{ padding: "12px 16px", color: "#8F9499" }}>&gt; 2.5 km line-of-sight</td>
                    <td style={{ padding: "12px 16px", color: "#34D399" }}>3.8 km confirmed (PASSED)</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ color: "#34D399", fontWeight: 800 }}>PASS</span></td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "12px 16px", color: "#F5F5F2", fontWeight: 750 }}>TC-03: Continuous Flow Stress</td>
                    <td style={{ padding: "12px 16px", color: "#8F9499" }}>72 hrs without leak</td>
                    <td style={{ padding: "12px 16px", color: "#34D399" }}>96 hrs sustained (PASSED)</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ color: "#34D399", fontWeight: 800 }}>PASS</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "DOCUMENTATION" && (
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "28px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 12px" }}>Repository & Engineering Deliverables</h3>
              <div style={{ background: "#17191C", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", marginBottom: "6px" }}>CODE REPOSITORY</div>
                <a href="https://github.com/sih2026/arsenic-filter-iot" target="_blank" rel="noreferrer" style={{ color: "#38BDF8", fontSize: "14px", fontWeight: 750, textDecoration: "none" }}>
                  📦 https://github.com/sih2026/arsenic-filter-iot ↗
                </a>
              </div>
              <div style={{ fontSize: "13px", color: "#8F9499", lineHeight: 1.6 }}>
                Technical design reports, CAD enclosures (.STL/.STEP), firmware source code (.C/.CPP), and PCB schematics are automatically committed to the project artifact ledger.
              </div>
            </div>
          )}

        </main>
      </div>

      {/* SUBMIT DELIVERABLE MODAL */}
      {showDelivModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "600px", background: "#111315", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "20px", padding: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#F59E0B", textTransform: "uppercase" }}>SUBMIT DELIVERABLES</span>
                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 0" }}>
                  Milestone Deliverable & Code Submission
                </h2>
              </div>
              <button onClick={() => setShowDelivModal(false)} style={{ background: "none", border: "none", color: "#8F9499", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleSubmitDeliverable} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Target Milestone *
                </label>
                <select
                  required
                  value={delivForm.milestoneId}
                  onChange={(e) => setDelivForm({ ...delivForm, milestoneId: e.target.value })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                >
                  {milestones.filter((m) => m.status !== "APPROVED").map((m) => (
                    <option key={m.id} value={m.id}>M{m.milestoneOrder || 1}: {m.title} ({m.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Deliverables & GitHub Repository Link *
                </label>
                <textarea
                  rows={3}
                  required
                  value={delivForm.deliverables}
                  onChange={(e) => setDelivForm({ ...delivForm, deliverables: e.target.value })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Submission Notes for Faculty Mentor
                </label>
                <textarea
                  rows={3}
                  value={delivForm.submissionNotes}
                  onChange={(e) => setDelivForm({ ...delivForm, submissionNotes: e.target.value })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  type="button"
                  onClick={() => setShowDelivModal(false)}
                  style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.12)", color: "#F5F5F2", padding: "9px 18px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 750, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#F59E0B", border: "none", color: "#0B0D0F", padding: "9px 20px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 850, cursor: "pointer", boxShadow: "0 0 16px rgba(245,158,11,0.35)" }}
                >
                  Submit for Review →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


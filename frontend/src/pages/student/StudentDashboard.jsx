import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import projectService from "../../services/projectService";
import taskService from "../../services/taskService";
import milestoneService from "../../services/milestoneService";
import studentService from "../../services/studentService";
import TaskBoard from "../../components/project/TaskBoard";

const cleanStudentName = (name) => {
  if (!name) return "Student Lead";
  return name.replace(/\s*\((?:Student Lead|Student)\)/gi, "").trim();
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPrio, setTaskPrio] = useState("MEDIUM");

  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [delivDesc, setDelivDesc] = useState("");
  const [githubUrl, setGithubUrl] = useState("https://github.com/sih2026/arsenic-filter-iot");
  const [delivLoading, setDelivLoading] = useState(false);

  const loadData = async () => {
    try {
      const [prof, res] = await Promise.all([
        studentService.getMyProfile().catch(() => null),
        projectService.getMyProjects().catch(() => projectService.getAll(0, 50))
      ]);
      setProfile(prof);
      const list = Array.isArray(res) ? res : res?.content || res?.data || [];
      setProjects(list);
      const activePrj = list[0] || null;
      setSelectedProject(activePrj);
      if (activePrj?.id) {
        const [t, ms] = await Promise.all([
          taskService.getByProject(activePrj.id),
          milestoneService.getByProject(activePrj.id)
        ]);
        setTasks(Array.isArray(t) ? t : t?.data || []);
        setMilestones(Array.isArray(ms) ? ms : ms?.data || []);
      }
    } catch (e) {
      console.error("Student dashboard error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (prj) => {
    setSelectedProject(prj);
    if (prj?.id) {
      try {
        const [t, ms] = await Promise.all([
          taskService.getByProject(prj.id),
          milestoneService.getByProject(prj.id)
        ]);
        setTasks(Array.isArray(t) ? t : t?.data || []);
        setMilestones(Array.isArray(ms) ? ms : ms?.data || []);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await taskService.create({
        projectId: selectedProject.id,
        title: taskTitle,
        description: taskDesc,
        priority: taskPrio,
        status: "TODO"
      });
      setShowTaskModal(false);
      setTaskTitle("");
      setTaskDesc("");
      const t = await taskService.getByProject(selectedProject.id);
      setTasks(Array.isArray(t) ? t : t?.data || []);
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    const targetMs = milestones.find((m) => m.status !== "APPROVED");
    if (!targetMs) {
      alert("All milestones for this project have already been approved by the Faculty Mentor!");
      return;
    }
    setDelivLoading(true);
    try {
      await milestoneService.submitDeliverables(targetMs.id, [
        {
          fileName: "Phase_" + (targetMs.milestoneOrder || 1) + "_Deliverables_Report.pdf",
          fileUrl: githubUrl,
          fileType: "application/pdf",
          description: delivDesc || ("Deliverables for " + targetMs.title)
        }
      ]);
      alert(`Milestone M${targetMs.milestoneOrder} deliverables submitted for Faculty Mentor review!`);
      setShowDeliverableModal(false);
      handleSelectProject(selectedProject);
    } catch (err) {
      alert("Submission failed: " + (err.response?.data?.message || err.message));
    } finally {
      setDelivLoading(false);
    }
  };

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

  const completedTasksCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0D0F", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* LEFT SIDEBAR (Orange Accent) */}
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
              background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
              color: "#0B0D0F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 900,
              boxShadow: "0 0 16px rgba(245, 158, 11, 0.4)"
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2", letterSpacing: "0.02em" }}>
                SOCIO-SPHERE
              </div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#F59E0B", letterSpacing: "0.08em" }}>
                SIH26043 • STUDENT
              </div>
            </div>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "18px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", padding: "0 10px 8px", letterSpacing: "0.08em" }}>
            ENGINEERING SPRINT
          </div>

          <Link
            to="/student"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 800,
              color: "#F59E0B",
              background: "#1D2023",
              border: "1px solid rgba(245, 158, 11, 0.35)"
            }}
          >
            <span>⚡</span>
            <span>Sprint & Kanban Board</span>
          </Link>

          <Link
            to="/student/workspace"
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
            <span>🛠️</span>
            <span>Innovation Workspace</span>
          </Link>

          <Link
            to="/student/profile/skills"
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
            <span>⭐</span>
            <span>Skills & Contribution</span>
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
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SPRINT VELOCITY</span>
              <span style={{ fontSize: "10px", background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", padding: "2px 6px", borderRadius: "999px", fontWeight: 800 }}>
                ACTIVE ✓
              </span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#F5F5F2" }}>
              {completedTasksCount} / {tasks.length} Tasks Done
            </div>
            <div style={{ fontSize: "10.5px", color: "#F59E0B", marginTop: "2px" }}>
              Sprint Completion: {tasks.length ? Math.round((completedTasksCount / tasks.length) * 100) : 0}%
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
              Student Engineering Sprint • SIH26043
            </div>
            <div style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2" }}>
              Agile Kanban Sprint & Prototype Development Workspace
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
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  color: "#F59E0B",
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
                ⚡ Role: Student Lead ▼
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
                        background: (user?.email === "student@iitb.ac.in" && r.key === "STUDENT_IITB") ||
                                    (user?.email === "student@iitm.ac.in" && r.key === "STUDENT_IITM") ||
                                    (user?.email === "student@bhu.ac.in" && r.key === "STUDENT_BHU") ||
                                    (user?.email === "student@bits.ac.in" && r.key === "STUDENT_BITS")
                                      ? "rgba(245, 158, 11, 0.15)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "block",
                        marginBottom: "2px"
                      }}
                    >
                      <div style={{ fontSize: "11.5px", fontWeight: 750, color: (user?.email === "student@iitb.ac.in" && r.key === "STUDENT_IITB") ||
                                    (user?.email === "student@iitm.ac.in" && r.key === "STUDENT_IITM") ||
                                    (user?.email === "student@bhu.ac.in" && r.key === "STUDENT_BHU") ||
                                    (user?.email === "student@bits.ac.in" && r.key === "STUDENT_BITS") ? "#F59E0B" : "#F5F5F2" }}>{r.label}</div>
                      <div style={{ fontSize: "9.5px", color: "#8F9499" }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Student User Card */}
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
                background: "#F59E0B",
                color: "#0B0D0F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 900
              }}>
                👨‍🎓
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#F5F5F2" }}>
                  {cleanStudentName(profile?.user?.name || user?.name)}
                </div>
                <div style={{ fontSize: "10px", color: "#F59E0B", fontWeight: 750 }}>
                  Student Lead • {profile?.university?.name || (user?.email?.includes("bits") ? "BITS Pilani" : user?.email?.includes("iitm") ? "IIT Madras" : user?.email?.includes("bhu") ? "IIT BHU Varanasi" : "IIT Bombay")}
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
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  STUDENT INNOVATION SPRINT CELL
                </span>
                <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", padding: "2px 8px", borderRadius: "999px" }}>
                  ✓ Sprint Active
                </span>
              </div>

              <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
                {cleanStudentName(profile?.user?.name || user?.name)} ({profile?.university?.name || (user?.email?.includes("bits") ? "BITS Pilani" : user?.email?.includes("iitm") ? "IIT Madras" : user?.email?.includes("bhu") ? "IIT BHU Varanasi" : "IIT Bombay")} Lead)
              </h1>
              <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
                {profile?.department?.name ? `${profile.department.name} • Prototype Sprint Team` : "Build engineering prototypes, progress backlog tasks on the Kanban board, and submit milestone deliverables for faculty gate review."}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShowTaskModal(true)}
                style={{
                  background: "#F59E0B",
                  color: "#0B0D0F",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 0 16px rgba(245, 158, 11, 0.35)"
                }}
              >
                + Create Sprint Task
              </button>

              <button
                type="button"
                onClick={() => setShowDeliverableModal(true)}
                style={{
                  background: "#1D2023",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  color: "#F59E0B",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                📤 Submit Deliverables
              </button>
            </div>
          </section>

          {/* 4 KPI CARDS */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SPRINT TASKS</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#F59E0B", marginTop: "2px" }}>{tasks.length}</div>
              <span style={{ fontSize: "10.5px", color: "#F59E0B" }}>Active Backlog</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>TASKS COMPLETED</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#A8E063", marginTop: "2px" }}>{completedTasksCount}</div>
              <span style={{ fontSize: "10.5px", color: "#A8E063" }}>Tested & Verified</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>MILESTONE DELIVERABLES</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>
                {milestones.length || 3}
              </div>
              <span style={{ fontSize: "10.5px", color: "#38BDF8" }}>Faculty Phase Gates</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>PROJECT STAGE</span>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#c084fc", marginTop: "4px" }}>
                {selectedProject?.stage || "RESEARCH"}
              </div>
              <span style={{ fontSize: "10.5px", color: "#c084fc" }}>Active Phase</span>
            </div>
          </section>

          {/* ACTIVE PROJECT BANNER & SELECTOR */}
          {selectedProject && (
            <section style={{
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "20px 24px",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: "280px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "9.5px", background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                      ACTIVE SPRINT • PROJECT #{selectedProject.id}
                    </span>
                    <span style={{ fontSize: "9.5px", background: "#1D2023", color: "#38BDF8", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                      STAGE: {selectedProject.stage}
                    </span>
                    {selectedProject.complaint?.aiDetectedClass && selectedProject.complaint.aiDetectedClass !== "NO_SUPPORTED_DEFECT" && (
                      <span style={{ fontSize: "9.5px", background: "rgba(52, 211, 153, 0.15)", color: "#34D399", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                        🤖 {selectedProject.complaint.aiDetectedClass.replace(/_/g, " ").toUpperCase()} ({selectedProject.complaint.aiConfidence ? `${selectedProject.complaint.aiConfidence}%` : "AI Verified"})
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 6px", fontWeight: 850 }}>
                    {selectedProject.title}
                  </h2>

                  {selectedProject.complaint?.description && (
                    <p style={{ fontSize: "12px", color: "#8F9499", margin: "0 0 10px", lineHeight: 1.4 }}>
                      {selectedProject.complaint.description}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", fontSize: "11.5px", color: "#8F9499" }}>
                    <span>🏛️ {selectedProject.university?.name || profile?.university?.name || "Academic Institution"}</span>
                    <span>👩‍🏫 Mentor: <strong style={{ color: "#34D399" }}>{selectedProject.facultyMentor?.user?.name || "Faculty Supervisor"}</strong></span>
                    <span>💰 Budget: <strong style={{ color: "#F5F5F2" }}>₹{Number(selectedProject.estimatedCost || 400000).toLocaleString()}</strong></span>
                    {selectedProject.complaint?.address && (
                      <span>📍 {selectedProject.complaint.address}</span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/projects/${selectedProject.id}`}
                  style={{
                    background: "#F59E0B",
                    color: "#0B0D0F",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 900,
                    textDecoration: "none",
                    boxShadow: "0 0 14px rgba(245, 158, 11, 0.3)"
                  }}
                >
                  Full Project Case File →
                </Link>
              </div>

              {/* Progress Bar */}
              <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden", margin: "14px 0 4px" }}>
                <div style={{ width: `${selectedProject.progressPercentage || 10}%`, height: "100%", background: "linear-gradient(90deg, #f59e0b, #38bdf8)" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#8F9499", textAlign: "right" }}>
                Overall Sprint Progress: {selectedProject.progressPercentage || 10}%
              </div>
            </section>
          )}

          {/* KANBAN BOARD */}
          <section>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              SPRINT TASK BOARD
            </div>
            <TaskBoard tasks={tasks} onTaskUpdated={() => handleSelectProject(selectedProject)} />
          </section>

        </main>
      </div>

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
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
            border: "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: "20px",
            maxWidth: "500px",
            width: "100%",
            padding: "24px"
          }}>
            <h3 style={{ fontSize: "17px", color: "#F5F5F2", margin: "0 0 14px", fontWeight: 900 }}>
              + Create Sprint Task
            </h3>

            <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Task Title (e.g. Solder ESP32 Spectrometer Board)"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                style={{ padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px" }}
              />

              <textarea
                rows={3}
                placeholder="Task description / technical requirements..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                style={{ padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px" }}
              />

              <select
                value={taskPrio}
                onChange={(e) => setTaskPrio(e.target.value)}
                style={{ padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px" }}
              >
                <option value="HIGH">🔴 High Priority</option>
                <option value="MEDIUM">🟡 Medium Priority</option>
                <option value="LOW">🟢 Low Priority</option>
              </select>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowTaskModal(false)} style={{ background: "#1D2023", border: "none", color: "#8F9499", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: "#F59E0B", color: "#0B0D0F", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: 900, cursor: "pointer" }}>
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT DELIVERABLES MODAL */}
      {showDeliverableModal && (
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
            border: "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: "20px",
            maxWidth: "540px",
            width: "100%",
            padding: "24px"
          }}>
            <h3 style={{ fontSize: "17px", color: "#F5F5F2", margin: "0 0 4px", fontWeight: 900 }}>
              📤 Submit Milestone Deliverables
            </h3>
            {(() => {
              const activeMs = milestones.find((m) => m.status !== "APPROVED");
              return activeMs ? (
                <div style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 800, marginBottom: "12px" }}>
                  Target: M{activeMs.milestoneOrder}: {activeMs.title} ({activeMs.status})
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#34D399", fontWeight: 800, marginBottom: "12px" }}>
                  ✓ All project milestones have been approved.
                </div>
              );
            })()}
            <p style={{ fontSize: "12px", color: "#8F9499", margin: "0 0 14px" }}>
              Submit research documentation, CAD schematics, and test logs for Faculty Mentor approval.
            </p>

            <form onSubmit={handleSubmitDeliverable} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  Repository / Deliverable URL
                </label>
                <input
                  type="text"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  Technical Summary / Test Results
                </label>
                <textarea
                  rows={3}
                  placeholder="Completed lab bench adsorption trials with 98% arsenic removal efficiency..."
                  value={delivDesc}
                  onChange={(e) => setDelivDesc(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowDeliverableModal(false)} style={{ background: "#1D2023", border: "none", color: "#8F9499", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={delivLoading} style={{ background: "#F59E0B", color: "#0B0D0F", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: 900, cursor: "pointer" }}>
                  {delivLoading ? "Submitting..." : "✓ Submit for Faculty Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

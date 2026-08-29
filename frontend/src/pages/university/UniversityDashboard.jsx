import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import universityService from "../../services/universityService";
import projectService from "../../services/projectService";
import evidenceService from "../../services/evidenceService";
import industryService from "../../services/industryService";

export default function UniversityDashboard() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [projects, setProjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [industryOffers, setIndustryOffers] = useState([]);
  const [offerActionLoading, setOfferActionLoading] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [modalEvidence, setModalEvidence] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [demoOpen, setDemoOpen] = useState(false);

  const loadData = async () => {
    try {
      const p = await universityService.getMyProfile();
      setProfile(p);
      if (p?.id) {
        const [ass, prjs, facs, offers] = await Promise.all([
          universityService.getAssignedChallenges(p.id),
          projectService.getByUniversity(p.id),
          universityService.getFaculty(p.id),
          industryService.getUniversityPartnerships(p.id).catch(() => [])
        ]);
        setAssigned(Array.isArray(ass) ? ass : ass?.data || []);
        setProjects(Array.isArray(prjs) ? prjs : prjs?.data || prjs?.content || []);
        setFacultyList(Array.isArray(facs) ? facs : facs?.data || []);
        setIndustryOffers(Array.isArray(offers) ? offers : offers?.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAcceptModal = async (challenge) => {
    setSelectedChallenge(challenge);
    setModalEvidence([]);
    try {
      const ev = await evidenceService.getForComplaint(challenge.id);
      setModalEvidence(Array.isArray(ev) ? ev : ev?.data || []);
    } catch (e) {
      console.warn("Evidence load error:", e);
    }
  };

  const handleAccept = async (e) => {
    e.preventDefault();
    if (!selectedChallenge) return;
    try {
      await universityService.acceptChallenge(
        selectedChallenge.id,
        selectedFacultyId ? Number(selectedFacultyId) : (facultyList[0]?.id || 1)
      );

      let targetProject = null;
      try {
        targetProject = await projectService.getByChallenge(selectedChallenge.id);
      } catch (_) {
        targetProject = null;
      }

      if (!targetProject || !targetProject.id) {
        try {
          targetProject = await projectService.create({
            complaintId: selectedChallenge.id,
            universityId: profile?.id || 1,
            facultyMentorId: selectedFacultyId ? Number(selectedFacultyId) : (facultyList[0]?.id || 1),
            title: selectedChallenge.title,
            objective: "Develop robust scalable prototype addressing: " + selectedChallenge.title,
            solutionDescription: selectedChallenge.expectedImpact || selectedChallenge.description || "Collaborative engineering solution",
            technologyStack: "Embedded IoT, Python, React, Cloud Telemetry",
            estimatedCost: 400000,
            timelineMonths: 6
          });
        } catch (createErr) {
          console.warn("Project creation check:", createErr);
          try {
            targetProject = await projectService.getByChallenge(selectedChallenge.id);
          } catch (_) {}
        }
      }

      setSelectedChallenge(null);
      await loadData();

      if (targetProject?.id) {
        navigate("/projects/" + targetProject.id);
      }
    } catch (err) {
      console.error("Accept challenge error:", err);
      alert("Note on acceptance: " + (err.message || "Updated successfully"));
      setSelectedChallenge(null);
      await loadData();
    }
  };

  const handleAcceptIndustryOffer = async (offerId) => {
    setOfferActionLoading(true);
    setOfferSuccessMsg("");
    try {
      await industryService.acceptOffer(offerId);
      setOfferSuccessMsg("✓ Industry collaboration offer ACCEPTED! CSR funding has been successfully committed to project ledger.");
      await loadData();
      setTimeout(() => setOfferSuccessMsg(""), 5000);
    } catch (err) {
      alert("Failed to accept offer: " + (err?.response?.data?.message || err.message));
    } finally {
      setOfferActionLoading(false);
    }
  };

  const handleRejectIndustryOffer = async (offerId) => {
    const reason = window.prompt("Please state the reason for declining this industry offer (optional):", "Current research sprint fully allocated");
    if (reason === null) return;
    setOfferActionLoading(true);
    setOfferSuccessMsg("");
    try {
      await industryService.rejectOffer(offerId, reason);
      setOfferSuccessMsg("Collaboration offer has been DECLINED. Project ledger and budget remain unchanged.");
      await loadData();
      setTimeout(() => setOfferSuccessMsg(""), 5000);
    } catch (err) {
      alert("Failed to decline offer: " + (err?.response?.data?.message || err.message));
    } finally {
      setOfferActionLoading(false);
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
      FACULTY: { email: "faculty@iitb.ac.in", password: "Password@123", path: "/faculty" },
      STUDENT: { email: "student@iitb.ac.in", password: "Password@123", path: "/student" },
      INDUSTRY: { email: "csr@tata.com", password: "Password@123", path: "/industry" }
    };
    const target = demoAccounts[roleKey];
    if (target) {
      await switchDemoUser(target);
      setDemoOpen(false);
      navigate(target.path);
      // Reload current university profile and assigned challenges for the newly switched user
      setTimeout(() => loadData(), 200);
    }
  };

  const totalBudget = projects.reduce((acc, p) => acc + (p.estimatedCost || 0), 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0D0F", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* LEFT SIDEBAR (Pink Accent) */}
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
              background: "linear-gradient(135deg, #ec4899 0%, #ff4fa3 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 900,
              boxShadow: "0 0 16px rgba(255, 79, 163, 0.4)"
            }}>
              🏛️
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2", letterSpacing: "0.02em" }}>
                SOCIO-SPHERE
              </div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#FF4FA3", letterSpacing: "0.08em" }}>
                SIH26043 • UNIVERSITY
              </div>
            </div>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "18px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", padding: "0 10px 8px", letterSpacing: "0.08em" }}>
            INNOVATION CELL
          </div>

          <Link
            to="/university"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 800,
              color: "#FF4FA3",
              background: "#1D2023",
              border: "1px solid rgba(255, 79, 163, 0.35)"
            }}
          >
            <span>📊</span>
            <span>R&D Command Center</span>
          </Link>

          <Link
            to="/university/proposals"
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
            <span>📜</span>
            <span>Research Proposals</span>
          </Link>

          <Link
            to="/university/resources"
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
            <span>🔬</span>
            <span>Lab & Resources</span>
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
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>LAB CAPACITY</span>
              <span style={{ fontSize: "10px", background: "rgba(255, 79, 163, 0.15)", color: "#FF4FA3", padding: "2px 6px", borderRadius: "999px", fontWeight: 800 }}>
                ACTIVE ✓
              </span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#F5F5F2" }}>
              {projects.length} / {profile?.capacity || 20} Projects
            </div>
            <div style={{ fontSize: "10.5px", color: "#FF4FA3", marginTop: "2px" }}>
              Capacity Utilization: {Math.round((projects.length / (profile?.capacity || 20)) * 100)}%
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
              Government of India • SIH26043
            </div>
            <div style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2" }}>
              University Innovation & R&D Command Center
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
                  border: "1px solid rgba(255, 79, 163, 0.35)",
                  color: "#FF4FA3",
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
                ⚡ Role: University ▼
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
                        padding: "6px 8px",
                        borderRadius: "8px",
                        background: (user?.email === "iitb@sih.gov.in" && r.key === "UNIVERSITY_IITB") ||
                                    (user?.email === "iitm@sih.gov.in" && r.key === "UNIVERSITY_IITM") ||
                                    (user?.email === "bhu@sih.gov.in" && r.key === "UNIVERSITY_BHU") ||
                                    (user?.email === "bits@sih.gov.in" && r.key === "UNIVERSITY_BITS")
                                      ? "rgba(255, 79, 163, 0.15)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "block",
                        marginBottom: "2px"
                      }}
                    >
                      <div style={{ fontSize: "11.5px", fontWeight: 750, color: (user?.email === "iitb@sih.gov.in" && r.key === "UNIVERSITY_IITB") ||
                                    (user?.email === "iitm@sih.gov.in" && r.key === "UNIVERSITY_IITM") ||
                                    (user?.email === "bhu@sih.gov.in" && r.key === "UNIVERSITY_BHU") ||
                                    (user?.email === "bits@sih.gov.in" && r.key === "UNIVERSITY_BITS") ? "#FF4FA3" : "#F5F5F2" }}>{r.label}</div>
                      <div style={{ fontSize: "9.5px", color: "#8F9499" }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* University User Card */}
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
                background: "#FF4FA3",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 900
              }}>
                🏛️
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#F5F5F2" }}>{profile?.name || "IIT Bombay"}</div>
                <div style={{ fontSize: "10px", color: "#FF4FA3", fontWeight: 750 }}>Innovation Cell</div>
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
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#FF4FA3", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  INSTITUTIONAL INNOVATION CELL
                </span>
                <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(255, 79, 163, 0.15)", color: "#FF4FA3", padding: "2px 8px", borderRadius: "999px" }}>
                  ✓ Premier R&D Node
                </span>
              </div>

              <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
                {profile?.name || "IIT Bombay Innovation Cell"}
              </h1>
              <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
                Review societal challenges matched by Government AI, assign faculty mentors, and build working prototypes.
              </p>
            </div>

            <div style={{ background: "#1D2023", padding: "12px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "right" }}>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>ACTIVE R&D BUDGET</div>
              <div style={{ fontSize: "20px", fontWeight: 900, color: "#FF4FA3", marginTop: "2px" }}>
                ₹{(totalBudget / 100000).toFixed(1)} Lakhs
              </div>
            </div>
          </section>

          {/* 4 KPI CARDS */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>ASSIGNED INBOX</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#FF4FA3", marginTop: "2px" }}>{assigned.length}</div>
              <span style={{ fontSize: "10.5px", color: "#FF4FA3" }}>Pending Cell Acceptance</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>ACTIVE R&D PROJECTS</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>{projects.length}</div>
              <span style={{ fontSize: "10.5px", color: "#38BDF8" }}>Engineering Sprints</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>FACULTY MENTORS</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#A8E063", marginTop: "2px" }}>{facultyList.length || 3}</div>
              <span style={{ fontSize: "10.5px", color: "#A8E063" }}>Supervising Teams</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>PROTOTYPES READY</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#F5C400", marginTop: "2px" }}>
                {projects.filter((p) => ["PROTOTYPE", "TESTING", "PILOT"].includes(p.stage)).length || 1}
              </div>
              <span style={{ fontSize: "10.5px", color: "#F5C400" }}>Field Validation</span>
            </div>
          </section>

          {/* MAIN 2-COL GRID: ASSIGNED CHALLENGES + ACTIVE PROJECTS */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.4fr)", gap: "20px" }}>
            
            {/* Left: Assigned Challenges Queue */}
            <div style={{
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#FF4FA3", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    INCOMING DISPATCH
                  </span>
                  <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 850 }}>
                    Assigned Challenges ({assigned.length})
                  </h2>
                </div>
              </div>

              {assigned.length === 0 ? (
                <div style={{ background: "#1D2023", borderRadius: "12px", padding: "30px 20px", textAlign: "center", color: "#8F9499", border: "1px dashed rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: "32px", display: "block", marginBottom: "6px" }}>📬</span>
                  <div style={{ fontSize: "13px", fontWeight: 750, color: "#F5F5F2" }}>No Pending Challenge Assignments</div>
                  <p style={{ fontSize: "11px", color: "#8F9499", margin: "4px 0 0" }}>New problem statements will arrive as government authorities audit citizen submissions.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {assigned.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: "#1D2023",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "14px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "9.5px", fontWeight: 800, background: "#17191C", color: "#FF4FA3", padding: "2px 6px", borderRadius: "4px" }}>
                              {c.category}
                            </span>
                            <span style={{ fontSize: "9.5px", fontWeight: 800, color: c.priority === "CRITICAL" ? "#FF5C5C" : "#F5C400" }}>
                              ● {c.priority}
                            </span>
                          </div>
                          <h3 style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2", margin: 0 }}>
                            {c.title}
                          </h3>
                        </div>
                      </div>

                      <p style={{ fontSize: "12px", color: "#8F9499", margin: 0, lineHeight: 1.4 }}>
                        {c.description}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", marginTop: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#8F9499" }}>
                          📍 {c.district || c.villageCity || c.address || "Field Location"} • 👥 {c.affectedPopulation || 1000}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenAcceptModal(c)}
                          style={{
                            background: "#FF4FA3",
                            color: "#fff",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 900,
                            cursor: "pointer",
                            boxShadow: "0 0 12px rgba(255, 79, 163, 0.35)"
                          }}
                        >
                          ✓ Accept & Launch Project →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Active R&D Projects Stream */}
            <div style={{
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#FF4FA3", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    R&D SPRINT PIPELINE
                  </span>
                  <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 850 }}>
                    Active Innovation Projects ({projects.length})
                  </h2>
                </div>
              </div>

              {projects.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#8F9499" }}>
                  No active projects currently underway.
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
                        padding: "16px 18px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "#FF4FA3", fontWeight: 800, marginBottom: "2px" }}>
                            PROJECT #{p.id} • STAGE: {p.stage}
                          </div>
                          <h3 style={{ fontSize: "15px", fontWeight: 850, color: "#F5F5F2", margin: 0 }}>
                            {p.title}
                          </h3>
                        </div>

                        <span style={{ fontSize: "12px", fontWeight: 900, color: "#38BDF8" }}>
                          {p.progressPercentage || 70}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden", margin: "8px 0 10px" }}>
                        <div style={{ width: `${p.progressPercentage || 70}%`, height: "100%", background: "linear-gradient(90deg, #ec4899, #38bdf8)" }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#8F9499" }}>
                        <div>
                          <span>Budget: <strong style={{ color: "#F5F5F2" }}>₹{Number(p.estimatedCost || 400000).toLocaleString()}</strong></span>
                          <span style={{ marginLeft: "10px" }}>Mentor: <strong style={{ color: "#FF4FA3" }}>{p.facultyMentor?.user?.name || p.facultyMentor?.name || "Prof. Sharma"}</strong></span>
                        </div>

                        <Link
                          to={`/projects/${p.id}`}
                          style={{
                            background: "#FF4FA3",
                            color: "#fff",
                            padding: "5px 12px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 800,
                            textDecoration: "none"
                          }}
                        >
                          Workspace →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* INDUSTRY COLLABORATION & CSR OFFERS SECTION */}
          <div style={{
            marginTop: "24px",
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#38EF7D", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  CORPORATE PARTNERSHIP & CSR LEDGER
                </span>
                <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 850 }}>
                  Industry Collaboration & CSR Offers ({industryOffers.length})
                </h2>
              </div>

              {offerSuccessMsg && (
                <div style={{
                  background: "rgba(56, 239, 125, 0.15)",
                  border: "1px solid rgba(56, 239, 125, 0.4)",
                  color: "#38EF7D",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 750
                }}>
                  {offerSuccessMsg}
                </div>
              )}
            </div>

            {industryOffers.length === 0 ? (
              <div style={{ background: "#1D2023", borderRadius: "12px", padding: "30px 20px", textAlign: "center", color: "#8F9499", border: "1px dashed rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: "32px", display: "block", marginBottom: "6px" }}>🤝</span>
                <div style={{ fontSize: "13px", fontWeight: 750, color: "#F5F5F2" }}>No Industry Offers Yet</div>
                <p style={{ fontSize: "11px", color: "#8F9499", margin: "4px 0 0" }}>Corporate CSR partners and enterprises browsing university challenges will submit funding and mentorship proposals here.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
                {industryOffers.map((offer) => {
                  const isOffered = offer.status === "OFFERED";
                  const isAccepted = offer.status === "ACCEPTED" || offer.status === "ACTIVE";
                  const isRejected = offer.status === "REJECTED";

                  return (
                    <div
                      key={offer.id}
                      style={{
                        background: "#1D2023",
                        border: isOffered
                          ? "1px solid rgba(245, 196, 0, 0.35)"
                          : isAccepted
                          ? "1px solid rgba(56, 239, 125, 0.35)"
                          : "1px solid rgba(255, 92, 92, 0.25)",
                        borderRadius: "14px",
                        padding: "18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: 850, color: "#F5F5F2" }}>
                            {offer.industry?.companyName || "Industry Partner"}
                          </div>
                          <div style={{ fontSize: "11px", color: "#8F9499" }}>
                            {offer.industry?.industryDomain || "Corporate CSR"} • Project #{offer.project?.id || offer.challenge?.id || "N/A"}
                          </div>
                        </div>

                        <span style={{
                          fontSize: "10px",
                          fontWeight: 850,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: isOffered ? "rgba(245, 196, 0, 0.15)" : isAccepted ? "rgba(56, 239, 125, 0.15)" : "rgba(255, 92, 92, 0.15)",
                          color: isOffered ? "#F5C400" : isAccepted ? "#38EF7D" : "#FF5C5C",
                          border: `1px solid ${isOffered ? "rgba(245, 196, 0, 0.4)" : isAccepted ? "rgba(56, 239, 125, 0.4)" : "rgba(255, 92, 92, 0.4)"}`
                        }}>
                          {isOffered ? "⏳ PENDING REVIEW" : isAccepted ? "✓ ACCEPTED & FUNDED" : "✕ DECLINED"}
                        </span>
                      </div>

                      {offer.project?.title && (
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#FF4FA3", background: "rgba(255,79,163,0.08)", padding: "4px 8px", borderRadius: "6px" }}>
                          Target: {offer.project.title}
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#17191C", padding: "8px 12px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "11px", color: "#8F9499" }}>Offered Grant:</span>
                        <span style={{ fontSize: "14px", fontWeight: 900, color: "#38EF7D" }}>
                          ₹{Number(offer.fundingAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {offer.proposalDetails && (
                        <p style={{ fontSize: "11.5px", color: "#B8BDB5", margin: 0, lineHeight: 1.4 }}>
                          {offer.proposalDetails}
                        </p>
                      )}

                      {offer.mentorshipScope && (
                        <div style={{ fontSize: "11px", color: "#8F9499" }}>
                          <strong style={{ color: "#F5F5F2" }}>Mentorship:</strong> {offer.mentorshipScope}
                        </div>
                      )}

                      {offer.technologyResourcesOffered && (
                        <div style={{ fontSize: "11px", color: "#8F9499" }}>
                          <strong style={{ color: "#F5F5F2" }}>Resources:</strong> {offer.technologyResourcesOffered}
                        </div>
                      )}

                      {isOffered && (
                        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                          <button
                            type="button"
                            disabled={offerActionLoading}
                            onClick={() => handleAcceptIndustryOffer(offer.id)}
                            style={{
                              flex: 1,
                              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                              color: "#fff",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "11.5px",
                              fontWeight: 850,
                              cursor: offerActionLoading ? "not-allowed" : "pointer",
                              boxShadow: "0 0 12px rgba(56, 239, 125, 0.35)"
                            }}
                          >
                            ✓ Accept & Commit Funding
                          </button>

                          <button
                            type="button"
                            disabled={offerActionLoading}
                            onClick={() => handleRejectIndustryOffer(offer.id)}
                            style={{
                              background: "#2C1D24",
                              color: "#FF5C5C",
                              border: "1px solid rgba(255, 92, 92, 0.35)",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              cursor: offerActionLoading ? "not-allowed" : "pointer"
                            }}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ACCEPT & LAUNCH PROJECT MODAL */}
      {selectedChallenge && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.85)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 79, 163, 0.35)",
            borderRadius: "20px",
            maxWidth: "600px",
            width: "100%",
            padding: "26px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7)"
          }}>
            <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "0 0 8px", fontWeight: 900 }}>
              🚀 Launch Engineering Project
            </h2>
            <p style={{ fontSize: "12px", color: "#8F9499", margin: "0 0 14px" }}>
              Accepting <strong>{selectedChallenge.title}</strong> will initialize an R&D milestone sprint and assign a Faculty Mentor.
            </p>

            {/* Challenge Details Card */}
            <div style={{ background: "#1D2023", borderRadius: "12px", padding: "12px 14px", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#FF4FA3", textTransform: "uppercase", marginBottom: "4px" }}>
                Problem Statement #{selectedChallenge.id}
              </div>
              <p style={{ fontSize: "12px", color: "#F5F5F2", margin: "0 0 6px", lineHeight: 1.4 }}>
                {selectedChallenge.description}
              </p>
              <div style={{ fontSize: "11px", color: "#8F9499" }}>
                📍 {selectedChallenge.address || selectedChallenge.district || selectedChallenge.villageCity || "Field Location"} • Priority: {selectedChallenge.priority}
              </div>
            </div>

            {/* Evidence Attachments */}
            {modalEvidence.length > 0 && (
              <div style={{ background: "#1D2023", borderRadius: "12px", padding: "12px 14px", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#FF4FA3", textTransform: "uppercase", marginBottom: "8px" }}>
                  📷 Citizen Survey Evidence ({modalEvidence.length})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "8px" }}>
                  {modalEvidence.map((ev) => (
                    <div key={ev.id} style={{ background: "#17191C", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {ev.contentType?.startsWith("image/") || ev.fileUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                        <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer">
                          <img src={ev.fileUrl} alt="Evidence" style={{ width: "100%", height: "65px", objectFit: "cover" }} />
                        </a>
                      ) : (
                        <div style={{ height: "65px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📄</div>
                      )}
                      <div style={{ fontSize: "9px", color: "#8F9499", padding: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ev.originalFileName || `Evidence #${ev.id}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAccept} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  Select Faculty Research Mentor *
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "#1D2023",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#F5F5F2",
                    fontSize: "12.5px"
                  }}
                >
                  <option value="">-- Assign Lead Faculty Mentor --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.user?.name || f.name || "Prof. Sharma"} ({f.department?.name || f.department || f.specialization || "Engineering Lab"})</option>
                  ))}
                  {facultyList.length === 0 && (
                    <option value="" disabled>No faculty members registered for this institution</option>
                  )}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedChallenge(null)}
                  style={{ background: "#1D2023", border: "none", color: "#8F9499", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#FF4FA3",
                    color: "#fff",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 0 16px rgba(255, 79, 163, 0.4)"
                  }}
                >
                  ✓ Confirm & Initialize Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import universityService from "../../services/universityService";
import proposalService from "../../services/proposalService";

export default function UniversityProposals() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [assignedChallenges, setAssignedChallenges] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);

  // Create Proposal Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [form, setForm] = useState({
    title: "",
    abstractText: "",
    proposedSolution: "",
    methodology: "",
    estimatedBudget: 450000,
    estimatedTimelineMonths: 6,
    facultyMentorId: "",
    status: "SUBMITTED"
  });

  // Selected Proposal for Details Drawer
  const [selectedProposal, setSelectedProposal] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await universityService.getMyProfile();
      setProfile(p);
      if (p?.id) {
        const [props, chs, facs] = await Promise.all([
          proposalService.getByUniversity(p.id).catch(() => []),
          universityService.getAssignedChallenges(p.id).catch(() => []),
          universityService.getFaculty(p.id).catch(() => [])
        ]);
        setProposals(Array.isArray(props) ? props : []);
        setAssignedChallenges(Array.isArray(chs) ? chs : chs?.data || []);
        setFacultyList(Array.isArray(facs) ? facs : facs?.data || []);
      }
    } catch (e) {
      console.error("Proposals load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = (challenge) => {
    setSelectedChallenge(challenge);
    setForm({
      title: "R&D Proposal: " + (challenge?.title || "Community Innovation"),
      abstractText: challenge?.description || "",
      proposedSolution: challenge?.expectedImpact || "Deploy robust, scalable embedded IoT hardware to address civic failure points.",
      methodology: "Phase 1: Field Scoping & Baseline Metrics\nPhase 2: Embedded Hardware Architecture & Firmware\nPhase 3: Pilot Validation & Telemetry Testing",
      estimatedBudget: 450000,
      estimatedTimelineMonths: 6,
      facultyMentorId: facultyList[0]?.id || "",
      status: "SUBMITTED"
    });
    setShowModal(true);
  };

  const handleSaveProposal = async (statusMode) => {
    if (!profile?.id || !selectedChallenge?.id) return;
    try {
      await proposalService.create({
        complaintId: selectedChallenge.id,
        universityId: profile.id,
        facultyMentorId: form.facultyMentorId ? Number(form.facultyMentorId) : null,
        title: form.title,
        abstractText: form.abstractText,
        proposedSolution: form.proposedSolution,
        methodology: form.methodology,
        estimatedBudget: Number(form.estimatedBudget) || 450000,
        estimatedTimelineMonths: Number(form.estimatedTimelineMonths) || 6,
        status: statusMode
      });
      alert(statusMode === "DRAFT" ? "Proposal draft saved!" : "Research proposal submitted successfully!");
      setShowModal(false);
      loadData();
    } catch (err) {
      alert("Submission failed: " + err.message);
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

  const draftCount = proposals.filter((p) => p.status === "DRAFT").length;
  const submittedCount = proposals.filter((p) => ["SUBMITTED", "UNDER_REVIEW"].includes(p.status)).length;
  const approvedCount = proposals.filter((p) => p.status === "APPROVED").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0D0F", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* SIDEBAR (Pink Accent) */}
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
              background: "linear-gradient(135deg, #FF4FA3 0%, #DB2777 100%)",
              color: "#0B0D0F",
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
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2" }}>SOCIO-SPHERE</div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#FF4FA3", letterSpacing: "0.08em" }}>
                SIH26043 • UNIVERSITY
              </div>
            </div>
          </Link>
        </div>

        <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link to="/university" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
            <span>📊</span>
            <span>R&D Command Center</span>
          </Link>

          <Link to="/university/proposals" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#F5F5F2", background: "rgba(255, 79, 163, 0.12)", border: "1px solid rgba(255, 79, 163, 0.3)", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>
            <span>📝</span>
            <span>Research Proposals</span>
          </Link>

          <Link to="/university/resources" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
            <span>🔬</span>
            <span>Innovation Labs & Resources</span>
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
              color: "#FF4FA3",
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
                    background: r === "UNIVERSITY" ? "rgba(255, 79, 163, 0.2)" : "#1D2023",
                    border: r === "UNIVERSITY" ? "1px solid #FF4FA3" : "1px solid rgba(255, 255, 255, 0.05)",
                    color: r === "UNIVERSITY" ? "#FF4FA3" : "#B7BCC2",
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
            <span style={{ fontSize: "11px", color: "#8F9499" }}>University R&D Center / </span>
            <span style={{ fontSize: "11px", color: "#FF4FA3", fontWeight: 800 }}>Research Proposals</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "12.5px", color: "#F5F5F2", fontWeight: 750 }}>
              {profile?.name || "IIT Bombay Innovation Cell"}
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
            <div style={{ fontSize: "10.5px", fontWeight: 850, color: "#FF4FA3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              RESEARCH & SOLUTION PROPOSALS
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "0 0 6px" }}>
              Transform Assigned Civic Challenges into Engineering Solutions
            </h1>
            <p style={{ fontSize: "13px", color: "#8F9499", margin: 0, maxWidth: "720px" }}>
              Draft detailed technical architectures, outline methodologies, assign faculty mentors, and submit proposals for government and CSR funding.
            </p>
          </div>

          {/* 4 SUMMARY STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>TOTAL PROPOSALS</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F5F5F2", marginTop: "2px" }}>{proposals.length}</div>
              <span style={{ fontSize: "11px", color: "#FF4FA3" }}>Institutional Repository</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SUBMITTED / IN REVIEW</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>{submittedCount}</div>
              <span style={{ fontSize: "11px", color: "#38BDF8" }}>Active Review Pipeline</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>APPROVED SOLUTIONS</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#34D399", marginTop: "2px" }}>{approvedCount}</div>
              <span style={{ fontSize: "11px", color: "#34D399" }}>R&D Projects Launched</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>DRAFT PROPOSALS</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F59E0B", marginTop: "2px" }}>{draftCount}</div>
              <span style={{ fontSize: "11px", color: "#F59E0B" }}>Work in Progress</span>
            </div>
          </div>

          {/* ASSIGNED CHALLENGES READY FOR PROPOSALS */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: 0 }}>
                Assigned Challenges Ready for Solution Proposals ({assignedChallenges.length})
              </h2>
            </div>

            {assignedChallenges.length === 0 ? (
              <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "36px", textAlign: "center", color: "#8F9499" }}>
                No newly assigned challenges pending proposals.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
                {assignedChallenges.map((ch) => (
                  <div key={ch.id} style={{
                    background: "#111315",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px"
                  }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ background: "rgba(255, 79, 163, 0.12)", color: "#FF4FA3", fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px" }}>
                          {ch.category || "Civic Issue"}
                        </span>
                        <span style={{ fontSize: "11px", color: "#8F9499" }}>Challenge #{ch.id}</span>
                      </div>
                      <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#F5F5F2", margin: "0 0 6px" }}>
                        {ch.title}
                      </h3>
                      <p style={{ fontSize: "12.5px", color: "#8F9499", margin: "0 0 10px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {ch.description}
                      </p>
                      <div style={{ fontSize: "11.5px", color: "#B7BCC2" }}>
                        📍 {ch.district ? `${ch.district}, ${ch.state || ""}` : "District Area"}
                      </div>
                    </div>

                    <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11.5px", color: "#38BDF8", fontWeight: 700 }}>
                        Status: {ch.status || "ASSIGNED"}
                      </span>
                      <button
                        onClick={() => handleOpenCreate(ch)}
                        style={{
                          background: "#FF4FA3",
                          color: "#0B0D0F",
                          border: "none",
                          padding: "7px 14px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 850,
                          cursor: "pointer",
                          boxShadow: "0 0 12px rgba(255, 79, 163, 0.35)"
                        }}
                      >
                        + Create Proposal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EXISTING PROPOSALS LIST */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: 0 }}>
                Existing Solution Proposals ({proposals.length})
              </h2>
            </div>

            {proposals.length === 0 ? (
              <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "36px", textAlign: "center", color: "#8F9499" }}>
                <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>📝</span>
                <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: "0 0 4px" }}>No Proposals Drafted Yet</h3>
                <p style={{ fontSize: "12.5px", margin: 0 }}>Select an assigned challenge above to create a structured research proposal.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
                {proposals.map((prop) => (
                  <div key={prop.id} style={{
                    background: "#111315",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px"
                  }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{
                          background: prop.status === "APPROVED" ? "rgba(52, 211, 153, 0.12)" : "rgba(255, 79, 163, 0.12)",
                          color: prop.status === "APPROVED" ? "#34D399" : "#FF4FA3",
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "6px"
                        }}>
                          {prop.status || "SUBMITTED"}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "#8F9499" }}>Proposal #{prop.id}</span>
                      </div>
                      <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#F5F5F2", margin: "0 0 6px" }}>
                        {prop.title}
                      </h3>
                      <p style={{ fontSize: "12.5px", color: "#8F9499", margin: "0 0 10px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {prop.abstractText || prop.proposedSolution}
                      </p>
                      <div style={{ fontSize: "11.5px", color: "#B7BCC2" }}>
                        Budget: ₹{Number(prop.estimatedBudget || 450000).toLocaleString()} • Timeline: {prop.estimatedTimelineMonths || 6} Months
                      </div>
                    </div>

                    <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11.5px", color: "#8F9499" }}>
                        Mentor: {prop.facultyMentor?.user?.name || prop.facultyMentor?.name || "Assigned Faculty"}
                      </span>
                      <button
                        onClick={() => setSelectedProposal(prop)}
                        style={{
                          background: "#1D2023",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "#F5F5F2",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: 800,
                          cursor: "pointer"
                        }}
                      >
                        View Case File →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* CREATE PROPOSAL MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "760px", maxHeight: "90vh", overflowY: "auto", background: "#111315", border: "1px solid rgba(255, 79, 163, 0.3)", borderRadius: "20px", padding: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#FF4FA3", textTransform: "uppercase" }}>NEW RESEARCH PROPOSAL</span>
                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 0" }}>
                  {selectedChallenge?.title}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#8F9499", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveProposal("SUBMITTED"); }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Proposal Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Problem Analysis & Abstract *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.abstractText}
                  onChange={(e) => setForm({ ...form, abstractText: e.target.value })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Proposed Technical Solution & Approach *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.proposedSolution}
                  onChange={(e) => setForm({ ...form, proposedSolution: e.target.value })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Engineering Methodology & Milestones
                </label>
                <textarea
                  rows={3}
                  value={form.methodology}
                  onChange={(e) => setForm({ ...form, methodology: e.target.value })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                    Estimated Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={form.estimatedBudget}
                    onChange={(e) => setForm({ ...form, estimatedBudget: e.target.value })}
                    style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                    Timeline (Months)
                  </label>
                  <input
                    type="number"
                    value={form.estimatedTimelineMonths}
                    onChange={(e) => setForm({ ...form, estimatedTimelineMonths: e.target.value })}
                    style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                    Faculty Mentor
                  </label>
                  <select
                    value={form.facultyMentorId}
                    onChange={(e) => setForm({ ...form, facultyMentorId: e.target.value })}
                    style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                  >
                    <option value="">Select Faculty Mentor</option>
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>{f.name || `Dr. Faculty #${f.id}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  type="button"
                  onClick={() => handleSaveProposal("DRAFT")}
                  style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.12)", color: "#F5F5F2", padding: "9px 18px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 750, cursor: "pointer" }}
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  style={{ background: "#FF4FA3", border: "none", color: "#0B0D0F", padding: "9px 20px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 850, cursor: "pointer", boxShadow: "0 0 16px rgba(255,79,163,0.35)" }}
                >
                  Submit Proposal →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROPOSAL DETAILS DRAWER */}
      {selectedProposal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", maxWidth: "600px", height: "100%", background: "#111315", borderLeft: "1px solid rgba(255, 79, 163, 0.3)", padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
                <div>
                  <span style={{ background: "rgba(255, 79, 163, 0.12)", color: "#FF4FA3", fontSize: "11px", fontWeight: 850, padding: "3px 8px", borderRadius: "6px" }}>
                    {selectedProposal.status || "SUBMITTED"}
                  </span>
                  <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#F5F5F2", margin: "6px 0 0" }}>
                    {selectedProposal.title}
                  </h2>
                </div>
                <button onClick={() => setSelectedProposal(null)} style={{ background: "none", border: "none", color: "#8F9499", fontSize: "20px", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "4px" }}>ABSTRACT & SCOPE</div>
                  <p style={{ fontSize: "13px", color: "#F5F5F2", margin: 0, lineHeight: 1.6 }}>{selectedProposal.abstractText}</p>
                </div>

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "4px" }}>PROPOSED TECHNICAL SOLUTION</div>
                  <p style={{ fontSize: "13px", color: "#F5F5F2", margin: 0, lineHeight: 1.6 }}>{selectedProposal.proposedSolution}</p>
                </div>

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "4px" }}>ENGINEERING METHODOLOGY</div>
                  <p style={{ fontSize: "13px", color: "#F5F5F2", margin: 0, lineHeight: 1.6, whiteSpace: "pre-line" }}>{selectedProposal.methodology}</p>
                </div>

                <div style={{ background: "#17191C", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <span style={{ fontSize: "10.5px", color: "#8F9499" }}>ESTIMATED BUDGET</span>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#34D399" }}>₹{Number(selectedProposal.estimatedBudget || 450000).toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "10.5px", color: "#8F9499" }}>TIMELINE</span>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#38BDF8" }}>{selectedProposal.estimatedTimelineMonths || 6} Months</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedProposal(null)}
                style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.12)", color: "#F5F5F2", padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 750, cursor: "pointer" }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import projectService from "../../services/projectService";
import milestoneService from "../../services/milestoneService";
import facultyService from "../../services/facultyService";

const cleanFacultyName = (name) => {
  if (!name) return "Faculty Mentor";
  return name.replace(/\s*\((?:Faculty Mentor|Mentor|Faculty)\)/gi, "").trim();
};

export default function FacultyReviews() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allMilestones, setAllMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);

  // Review Drawer State
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

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

      // Load milestones for each project
      const msPromises = pList.map((p) =>
        milestoneService.getByProject(p.id).then((ms) => {
          const list = Array.isArray(ms) ? ms : ms?.data || [];
          return list.map((m) => ({ ...m, projectTitle: p.title, projectId: p.id }));
        }).catch(() => [])
      );

      const msResults = await Promise.all(msPromises);
      setAllMilestones(msResults.flat());
    } catch (e) {
      console.error("Faculty reviews load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReview = (ms) => {
    setSelectedMilestone(ms);
    setFeedback(ms.facultyFeedback || "");
  };

  const handleReviewAction = async (statusDecision) => {
    if (!selectedMilestone) return;
    setReviewLoading(true);
    try {
      const isApproved = statusDecision === "APPROVED";
      await milestoneService.reviewMilestone(
        selectedMilestone.id,
        isApproved,
        feedback || (isApproved ? "Milestone deliverables verified and accepted by Faculty Mentor." : "Changes requested by Faculty Mentor.")
      );
      alert(`Milestone status updated to: ${statusDecision}`);
      setSelectedMilestone(null);
      loadData();
    } catch (err) {
      alert("Review action failed: " + err.message);
    } finally {
      setReviewLoading(false);
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

  const pendingCount = allMilestones.filter((m) => ["SUBMITTED_FOR_REVIEW", "IN_PROGRESS"].includes(m.status)).length;
  const approvedCount = allMilestones.filter((m) => m.status === "APPROVED").length;
  const reworkCount = allMilestones.filter((m) => m.status === "REWORK_REQUIRED").length;

  const filteredMilestones = filterStatus === "ALL"
    ? allMilestones
    : allMilestones.filter((m) => m.status === filterStatus);

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
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2" }}>JanNirikshan</div>
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

          <Link to="/faculty/reviews" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#F5F5F2", background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.3)", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>
            <span>🔍</span>
            <span>Milestone Reviews</span>
          </Link>

          <Link to="/faculty/team" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
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
            <span style={{ fontSize: "11px", color: "#34D399", fontWeight: 800 }}>Research & Milestone Review</span>
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
              RESEARCH & MILESTONE AUDIT CENTER
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "0 0 6px" }}>
              Deliverable Verification & Engineering Gating
            </h1>
            <p style={{ fontSize: "13px", color: "#8F9499", margin: 0, maxWidth: "720px" }}>
              Inspect submitted technical artifacts, GitHub repositories, and prototype telemetry to approve stage advancement or request engineering rework.
            </p>
          </div>

          {/* 4 SUMMARY STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>TOTAL MILESTONES</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F5F5F2", marginTop: "2px" }}>{allMilestones.length}</div>
              <span style={{ fontSize: "11px", color: "#34D399" }}>Across Supervised Projects</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>PENDING VERIFICATION</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F59E0B", marginTop: "2px" }}>{pendingCount}</div>
              <span style={{ fontSize: "11px", color: "#F59E0B" }}>Requires Faculty Action</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>APPROVED & GATED</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#34D399", marginTop: "2px" }}>{approvedCount}</div>
              <span style={{ fontSize: "11px", color: "#34D399" }}>Stages Verified</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>REWORK REQUESTED</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#FF5C5C", marginTop: "2px" }}>{reworkCount}</div>
              <span style={{ fontSize: "11px", color: "#FF5C5C" }}>Under Student Revision</span>
            </div>
          </div>

          {/* FILTER BUTTONS */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {[
              { key: "ALL", label: "All Milestones" },
              { key: "SUBMITTED_FOR_REVIEW", label: "Pending Review" },
              { key: "APPROVED", label: "Approved" },
              { key: "IN_PROGRESS", label: "In Progress" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                style={{
                  background: filterStatus === tab.key ? "rgba(52, 211, 153, 0.15)" : "#111315",
                  border: filterStatus === tab.key ? "1px solid #34D399" : "1px solid rgba(255, 255, 255, 0.08)",
                  color: filterStatus === tab.key ? "#34D399" : "#8F9499",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* REVIEWS TABLE */}
          <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", overflow: "hidden" }}>
            {filteredMilestones.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#8F9499" }}>
                No milestones matching the selected filter.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#17191C", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#8F9499", fontSize: "11px", textTransform: "uppercase" }}>
                    <th style={{ padding: "14px 20px" }}>Project</th>
                    <th style={{ padding: "14px 20px" }}>Milestone Order & Title</th>
                    <th style={{ padding: "14px 20px" }}>Target Date</th>
                    <th style={{ padding: "14px 20px" }}>Deliverable Artifacts</th>
                    <th style={{ padding: "14px 20px" }}>Status</th>
                    <th style={{ padding: "14px 20px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMilestones.map((m) => (
                    <tr key={m.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "14px 20px", fontWeight: 750, color: "#38BDF8" }}>
                        <Link to={`/projects/${m.projectId}`} style={{ color: "#38BDF8", textDecoration: "none" }}>
                          {m.projectTitle}
                        </Link>
                      </td>
                      <td style={{ padding: "14px 20px", color: "#F5F5F2", fontWeight: 700 }}>
                        M{m.milestoneOrder || 1}: {m.title}
                      </td>
                      <td style={{ padding: "14px 20px", color: "#8F9499" }}>
                        {m.targetDate || "Q3 Timeline"}
                      </td>
                      <td style={{ padding: "14px 20px", color: "#B7BCC2", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.deliverables || "Awaiting code submission"}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          background: m.status === "APPROVED" ? "rgba(52, 211, 153, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          color: m.status === "APPROVED" ? "#34D399" : "#F59E0B",
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "6px"
                        }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <button
                          onClick={() => handleOpenReview(m)}
                          style={{
                            background: "#34D399",
                            color: "#0B0D0F",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 850,
                            cursor: "pointer",
                            boxShadow: "0 0 10px rgba(52, 211, 153, 0.3)"
                          }}
                        >
                          Review Deliverable →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </main>
      </div>

      {/* REVIEW DRAWER */}
      {selectedMilestone && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", maxWidth: "620px", height: "100%", background: "#111315", borderLeft: "1px solid rgba(52, 211, 153, 0.3)", padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
                <div>
                  <span style={{ background: "rgba(52, 211, 153, 0.12)", color: "#34D399", fontSize: "11px", fontWeight: 850, padding: "3px 8px", borderRadius: "6px" }}>
                    MILESTONE AUDIT #{selectedMilestone.id}
                  </span>
                  <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#F5F5F2", margin: "6px 0 0" }}>
                    {selectedMilestone.title}
                  </h2>
                </div>
                <button onClick={() => setSelectedMilestone(null)} style={{ background: "none", border: "none", color: "#8F9499", fontSize: "20px", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "4px" }}>PROJECT CONTEXT</div>
                  <div style={{ fontSize: "13.5px", color: "#38BDF8", fontWeight: 750 }}>{selectedMilestone.projectTitle}</div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "4px" }}>MILESTONE TARGET SPECIFICATION</div>
                  <p style={{ fontSize: "13px", color: "#F5F5F2", margin: 0, lineHeight: 1.6 }}>{selectedMilestone.description || "Complete hardware bench testing and submit firmware repository."}</p>
                </div>

                <div style={{ background: "#17191C", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#34D399", textTransform: "uppercase", marginBottom: "6px" }}>SUBMITTED DELIVERABLES & CODE ARTIFACTS</div>
                  <p style={{ fontSize: "13px", color: "#F5F5F2", margin: "0 0 10px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {selectedMilestone.deliverablesJson || selectedMilestone.deliverables || "GitHub: https://github.com/sih2026/arsenic-filter-iot\nFirmware v1.2 tested with ±0.01 ppm sensor accuracy."}
                  </p>
                  {(selectedMilestone.studentSubmissionNotes || selectedMilestone.submissionNotes) && (
                    <div style={{ fontSize: "12px", color: "#8F9499", fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px" }}>
                      Note from Student Lead: {selectedMilestone.studentSubmissionNotes || selectedMilestone.submissionNotes}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                    Faculty Evaluation & Technical Feedback *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide technical feedback, verification notes, or revision recommendations..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => handleReviewAction("REWORK_REQUIRED")}
                style={{ background: "#1D2023", border: "1px solid #FF5C5C", color: "#FF5C5C", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 750, cursor: "pointer" }}
              >
                Request Rework
              </button>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  style={{ background: "#17191C", border: "1px solid rgba(255,255,255,0.1)", color: "#8F9499", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={reviewLoading}
                  onClick={() => handleReviewAction("APPROVED")}
                  style={{ background: "#34D399", border: "none", color: "#0B0D0F", padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 850, cursor: "pointer", boxShadow: "0 0 16px rgba(52, 211, 153, 0.35)" }}
                >
                  {reviewLoading ? "Processing..." : "Approve & Advance →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


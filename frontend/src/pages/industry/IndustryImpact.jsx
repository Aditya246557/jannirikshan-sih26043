import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import industryService from "../../services/industryService";
import projectService from "../../services/projectService";
import impactService from "../../services/impactService";

export const getSponsorName = (partnership) => {
  if (!partnership) return "Tata CSR Innovation Trust";
  return (
    partnership.industry?.companyName ||
    partnership.industry?.user?.name ||
    partnership.industry?.name ||
    partnership.sponsorName ||
    partnership.sponsor?.name ||
    partnership.companyName ||
    "Tata CSR Innovation Trust"
  );
};

export default function IndustryImpact() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [impactSummary, setImpactSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prof, comms, prjs, imp] = await Promise.all([
        industryService.getMyProfile().catch(() => null),
        industryService.getMyCommitments().catch(() => []),
        projectService.getAll(0, 20).catch(() => []),
        impactService.getSummary().catch(() => null)
      ]);
      setProfile(prof);
      setCommitments(Array.isArray(comms) ? comms : comms?.data || []);
      const pList = Array.isArray(prjs) ? prjs : prjs?.content || prjs?.data || [];
      setProjects(pList);
      setImpactSummary(imp);
    } catch (e) {
      console.error("Industry impact load error:", e);
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

  const totalCommitted = commitments.reduce((acc, c) => acc + (c.fundingAmount || 0), 0);

  const formatProposalDetails = (c) => {
    if (!c) return "";
    const sponsor = getSponsorName(c);
    if (c.proposalDetails) {
      let text = c.proposalDetails.replace(/\?/g, "₹").replace(/Rs\./g, "₹");
      // If text has dangling with or missing partner
      if (text.endsWith(" with") || text.endsWith(" by") || text.includes(" with ?")) {
        text = text.replace(/ with \?/, ` with ${sponsor}`).replace(/ with$/, ` with ${sponsor}`).replace(/ by$/, ` by ${sponsor}`);
      }
      return text;
    }
    const typeLabel = c.partnershipType === "CSR_SPONSORSHIP" ? "Direct CSR Grant" :
                      c.partnershipType === "MSME_COMMERCIALIZATION" ? "MSME Commercialization & Pilot Rights agreement" :
                      c.partnershipType === "LAB_EQUIPMENT_GRANT" ? "Testing Equipment & Cloud Credits grant" :
                      c.partnershipType;
    return `${typeLabel} committed for Project #${c.project?.id || 47} with ${sponsor}`;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0D0F", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* SIDEBAR (Violet Accent) */}
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
              background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
              color: "#0B0D0F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 900,
              boxShadow: "0 0 16px rgba(139, 92, 246, 0.4)"
            }}>
              💎
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2" }}>JanNirikshan</div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#8B5CF6", letterSpacing: "0.08em" }}>
                SIH26043 • INDUSTRY CSR
              </div>
            </div>
          </Link>
        </div>

        <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link to="/industry" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
            <span>📊</span>
            <span>CSR Overview</span>
          </Link>

          <Link to="/industry/partnerships" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 750 }}>
            <span>🤝</span>
            <span>Partnership Hub</span>
          </Link>

          <Link to="/industry/impact" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#F5F5F2", background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.3)", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>
            <span>📈</span>
            <span>Impact & Deployment</span>
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
              color: "#8B5CF6",
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
                    background: r === "INDUSTRY" ? "rgba(139, 92, 246, 0.2)" : "#1D2023",
                    border: r === "INDUSTRY" ? "1px solid #8B5CF6" : "1px solid rgba(255, 255, 255, 0.05)",
                    color: r === "INDUSTRY" ? "#8B5CF6" : "#B7BCC2",
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
            <span style={{ fontSize: "11px", color: "#8F9499" }}>Industry CSR Command Center / </span>
            <span style={{ fontSize: "11px", color: "#8B5CF6", fontWeight: 800 }}>Impact & Deployment Tracker</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "12.5px", color: "#F5F5F2", fontWeight: 750 }}>
              {profile?.companyName || "Tata CSR Trust"}
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
            <div style={{ fontSize: "10.5px", fontWeight: 850, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              COMMUNITY IMPACT TELEMETRY & FIELD VERIFICATION
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "0 0 6px" }}>
              Real-World Outcomes of Industry-Backed Projects
            </h1>
            <p style={{ fontSize: "13px", color: "#8F9499", margin: 0, maxWidth: "720px" }}>
              Monitor continuous field telemetry, quantify before-and-after baseline improvements, and audit stage advancement from pilot prototypes to national deployments.
            </p>
          </div>

          {/* 4 SUMMARY STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>CSR CAPITAL DEPLOYED</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#34D399", marginTop: "2px" }}>₹{totalCommitted.toLocaleString()}</div>
              <span style={{ fontSize: "11px", color: "#34D399" }}>Direct R&D Grants</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>CITIZENS IMPACTED</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>15,000+</div>
              <span style={{ fontSize: "11px", color: "#38BDF8" }}>Verified Beneficiaries</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>ACTIVE PILOT DEPLOYMENTS</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#8B5CF6", marginTop: "2px" }}>{commitments.length || 1}</div>
              <span style={{ fontSize: "11px", color: "#8B5CF6" }}>Municipal Nodes Live</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SOCIAL ROI MULTIPLIER</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F59E0B", marginTop: "2px" }}>4.8x</div>
              <span style={{ fontSize: "11px", color: "#F59E0B" }}>Community Value Index</span>
            </div>
          </div>

          {/* BEFORE / AFTER TELEMETRY COMPARISON */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: 0 }}>
                Verified Baseline Telemetry & Civic Improvements
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "22px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#FF5C5C", textTransform: "uppercase" }}>
                  {commitments[0]?.project?.title?.toLowerCase().includes("road") || commitments[0]?.challenge?.category?.toLowerCase().includes("road")
                    ? "PAVEMENT QUALITY & IRI"
                    : "CIVIC DEFECT RESOLUTION"}
                </span>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#F5F5F2", margin: "6px 0 14px" }}>
                  {commitments[0]?.project?.title?.toLowerCase().includes("road")
                    ? "International Roughness Index (IRI)"
                    : "Baseline Defect Metric"}
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#17191C", padding: "12px 16px", borderRadius: "10px" }}>
                  <div>
                    <span style={{ fontSize: "10.5px", color: "#8F9499" }}>BEFORE (FIELD AUDIT)</span>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#FF5C5C" }}>
                      {commitments[0]?.project?.title?.toLowerCase().includes("road") ? "5.8 m/km (Severe)" : "Critical Defect"}
                    </div>
                  </div>
                  <span style={{ fontSize: "18px" }}>➔</span>
                  <div>
                    <span style={{ fontSize: "10.5px", color: "#8F9499" }}>AFTER (DEPLOYMENT)</span>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#34D399" }}>
                      {commitments[0]?.project?.title?.toLowerCase().includes("road") ? "1.2 m/km (Smooth)" : "Verified Safe"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "22px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase" }}>MUNICIPAL SERVICE LEVEL</span>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#F5F5F2", margin: "6px 0 14px" }}>Failure Resolution Turnaround</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#17191C", padding: "12px 16px", borderRadius: "10px" }}>
                  <div>
                    <span style={{ fontSize: "10.5px", color: "#8F9499" }}>BEFORE (MANUAL)</span>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#FF5C5C" }}>14 Days Delay</div>
                  </div>
                  <span style={{ fontSize: "18px" }}>➔</span>
                  <div>
                    <span style={{ fontSize: "10.5px", color: "#8F9499" }}>AFTER (TELEMETRY)</span>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#34D399" }}>24 Hours Auto</div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "22px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#34D399", textTransform: "uppercase" }}>COMMUNITY RELIABILITY</span>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#F5F5F2", margin: "6px 0 14px" }}>Infrastructure Integrity</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#17191C", padding: "12px 16px", borderRadius: "10px" }}>
                  <div>
                    <span style={{ fontSize: "10.5px", color: "#8F9499" }}>BEFORE</span>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#FF5C5C" }}>Frequent Hazard</div>
                  </div>
                  <span style={{ fontSize: "18px" }}>➔</span>
                  <div>
                    <span style={{ fontSize: "10.5px", color: "#8F9499" }}>AFTER</span>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#34D399" }}>99.8% Defect-Free</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUPPORTED PROJECTS IMPACT DIRECTORY */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: 0 }}>
                Industry Supported Projects & Deployment Milestones ({commitments.length})
              </h2>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", overflow: "hidden" }}>
              {commitments.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#8F9499" }}>
                  No CSR commitments registered yet. Browse the Partnership Hub to sponsor a project.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#17191C", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#8F9499", fontSize: "11px", textTransform: "uppercase" }}>
                      <th style={{ padding: "14px 20px" }}>Project & Challenge</th>
                      <th style={{ padding: "14px 20px" }}>Model</th>
                      <th style={{ padding: "14px 20px" }}>Committed Funding / Support</th>
                      <th style={{ padding: "14px 20px" }}>Partnership Status</th>
                      <th style={{ padding: "14px 20px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commitments.map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "14px 20px", fontWeight: 750, color: "#F5F5F2" }}>
                          <div style={{ color: "#38BDF8" }}>{c.project?.title || "Community Civic Solution"}</div>
                          <div style={{ fontSize: "11px", color: "#8F9499" }}>Challenge #{c.challenge?.id || (c.project?.complaint?.id || "N/A")}</div>
                        </td>
                        <td style={{ padding: "14px 20px", color: "#8B5CF6" }}>
                          {c.partnershipType === "CSR_SPONSORSHIP" ? "Direct CSR Grant" :
                           c.partnershipType === "MSME_COMMERCIALIZATION" ? "MSME Commercialization & Pilot" :
                           c.partnershipType === "LAB_EQUIPMENT_GRANT" ? "Testing Equipment & Cloud" :
                           c.partnershipType}
                        </td>
                        <td style={{ padding: "14px 20px", color: "#34D399", fontWeight: 800 }}>
                          ₹{Number(c.fundingAmount || 400000).toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            background: c.status === "ACCEPTED" || c.status === "ACTIVE" ? "rgba(52, 211, 153, 0.12)" :
                                        c.status === "OFFERED" ? "rgba(245, 158, 11, 0.12)" :
                                        c.status === "COMPLETED" ? "rgba(168, 224, 99, 0.15)" : "rgba(255, 255, 255, 0.08)",
                            color: c.status === "ACCEPTED" || c.status === "ACTIVE" ? "#34D399" :
                                   c.status === "OFFERED" ? "#F59E0B" :
                                   c.status === "COMPLETED" ? "#A8E063" : "#8F9499",
                            fontSize: "11px",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "6px"
                          }}>
                            {c.status || "OFFERED"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <button
                            onClick={() => setSelectedCase(c)}
                            style={{
                              background: "#1D2023",
                              border: "1px solid rgba(139, 92, 246, 0.3)",
                              color: "#8B5CF6",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              cursor: "pointer"
                            }}
                          >
                            View Impact Audit →
                          </button>
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

      {/* IMPACT CASE STUDY DRAWER */}
      {selectedCase && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", maxWidth: "600px", height: "100%", background: "#111315", borderLeft: "1px solid rgba(139, 92, 246, 0.3)", padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
                <div>
                  <span style={{ background: "rgba(139, 92, 246, 0.12)", color: "#8B5CF6", fontSize: "11px", fontWeight: 850, padding: "3px 8px", borderRadius: "6px" }}>
                    IMPACT CASE AUDIT #{selectedCase.id} • {selectedCase.status || "OFFERED"}
                  </span>
                  <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#F5F5F2", margin: "6px 0 0" }}>
                    {selectedCase.project?.title || "Civic Engineering Solution"}
                  </h2>
                </div>
                <button onClick={() => setSelectedCase(null)} style={{ background: "none", border: "none", color: "#8F9499", fontSize: "20px", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "4px" }}>DEPLOYMENT LOCATION & INSTITUTION</div>
                  <p style={{ fontSize: "13px", color: "#F5F5F2", margin: 0, lineHeight: 1.6 }}>
                    📍 {selectedCase.project?.complaint?.address || selectedCase.challenge?.address || "Supertech Livingston, Crossings Republik, Ghaziabad, Uttar Pradesh"}<br />
                    🏛️ Lead Institution: {selectedCase.project?.university?.name || selectedCase.challenge?.assignedUniversityName || "IIT Bombay Innovation Cell"}<br />
                    💎 Industry Partner: {getSponsorName(selectedCase)}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "4px" }}>SPONSORSHIP DETAILS</div>
                  <p style={{ fontSize: "13px", color: "#F5F5F2", margin: 0, lineHeight: 1.6 }}>
                    {formatProposalDetails(selectedCase)}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "4px" }}>MENTORSHIP & RESOURCES</div>
                  <p style={{ fontSize: "13px", color: "#B7BCC2", margin: 0, lineHeight: 1.6 }}>
                    <strong>Scope:</strong> {selectedCase.mentorshipScope || "Engineering consultation and quality verification"}<br />
                    <strong>Resources:</strong> {selectedCase.technologyResourcesOffered || "Testing equipment and hardware tools"}
                  </p>
                </div>

                <div style={{ background: "#17191C", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#34D399", textTransform: "uppercase" }}>PROJECT DEPLOYMENT VERIFICATION</span>
                  <p style={{ fontSize: "13px", color: "#F5F5F2", margin: "6px 0 0", lineHeight: 1.6 }}>
                    {selectedCase.project?.deploymentNotes || selectedCase.project?.complaint?.resolutionRemarks || "Municipal deployment verified. Cold-mix fast-curing polymer asphalt patch deployed at Supertech Livingston, Crossings Republik, Ghaziabad with zero defect recurrence."}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedCase(null)}
                style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.12)", color: "#F5F5F2", padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 750, cursor: "pointer" }}
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


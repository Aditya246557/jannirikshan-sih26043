import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import industryService from "../../services/industryService";
import projectService from "../../services/projectService";

export default function IndustryDashboard() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [browseProjects, setBrowseProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);

  // Offer modal
  const [offerModalProj, setOfferModalProj] = useState(null);
  const [offerType, setOfferType] = useState("CSR_SPONSORSHIP");
  const [fundingAmount, setFundingAmount] = useState(400000);
  const [mentorship, setMentorship] = useState("");
  const [techResources, setTechResources] = useState("");
  const [grantLoading, setGrantLoading] = useState(false);

  const loadData = async () => {
    try {
      const [prof, comms, prjs] = await Promise.all([
        industryService.getMyProfile(),
        industryService.getMyCommitments(),
        projectService.getAll(0, 50)
      ]);
      setProfile(prof);
      setCommitments(Array.isArray(comms) ? comms : comms?.data || []);
      const pList = Array.isArray(prjs) ? prjs : prjs?.content || prjs?.data || [];
      setBrowseProjects(pList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOfferPartnership = async (e) => {
    e.preventDefault();
    if (!offerModalProj) return;
    setGrantLoading(true);
    try {
      const pId = offerModalProj.id;
      const cId = offerModalProj.complaint?.id || (offerModalProj.complaintId ? offerModalProj.complaintId : null);

      const defaultTech = techResources || (
        offerType === "LAB_EQUIPMENT_GRANT"
          ? "Cloud Infrastructure Credits (AWS/Azure) + Specialized IoT Testing Kits"
          : offerType === "MSME_COMMERCIALIZATION"
          ? "Industrial Prototyping Facility + Pilot Field Trial Access"
          : (offerModalProj.title?.toLowerCase().includes("road") ? "Asphalt Testing Rig + Sensor Calibration Equipment" : "Corporate R&D Testing Lab Access")
      );

      const defaultMentor = mentorship || (
        offerType === "MSME_COMMERCIALIZATION"
          ? "Weekly commercialization scaling & municipal pilot deployment guidance"
          : offerType === "LAB_EQUIPMENT_GRANT"
          ? "Bi-weekly cloud systems & hardware architecture mentoring"
          : "Bi-weekly engineering consultation and quality validation"
      );

      const defaultProposal = offerType === "MSME_COMMERCIALIZATION"
        ? `MSME Commercialization & Pilot Rights agreement committed for ${offerModalProj.title} with ₹${Number(fundingAmount).toLocaleString()} scaling investment by ${profile?.companyName || "Industry Partner"}`
        : offerType === "LAB_EQUIPMENT_GRANT"
        ? `Testing Equipment & Cloud Credits grant allocated for ${offerModalProj.title} (Valuation: ₹${Number(fundingAmount).toLocaleString()}) by ${profile?.companyName || "Industry Partner"}`
        : `Direct CSR Grant of ₹${Number(fundingAmount).toLocaleString()} committed for ${offerModalProj.title} by ${profile?.companyName || "Industry Partner"}`;

      await industryService.expressInterest({
        projectId: pId,
        challengeId: cId,
        partnershipType: offerType || "CSR_SPONSORSHIP",
        fundingAmount: Number(fundingAmount) || 400000,
        mentorshipScope: defaultMentor,
        technologyResourcesOffered: defaultTech,
        proposalDetails: defaultProposal
      });
      alert("Corporate Partnership committed successfully to project ledger!");
      setOfferModalProj(null);
      loadData();
    } catch (err) {
      alert("Offer submission failed: " + (err.response?.data?.message || err.message));
    } finally {
      setGrantLoading(false);
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

  const totalCommitted = commitments.reduce((acc, c) => acc + (c.fundingAmount || 0), 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0D0F", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* LEFT SIDEBAR (Violet/Purple Accent) */}
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
              background: "linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)",
              color: "#fff",
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
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2", letterSpacing: "0.02em" }}>
                JanNirikshan
              </div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#C084FC", letterSpacing: "0.08em" }}>
                SIH26043 • INDUSTRY CSR
              </div>
            </div>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "18px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", padding: "0 10px 8px", letterSpacing: "0.08em" }}>
            CSR COMMAND HUB
          </div>

          <Link
            to="/industry"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 800,
              color: "#C084FC",
              background: "#1D2023",
              border: "1px solid rgba(192, 132, 252, 0.35)"
            }}
          >
            <span>💎</span>
            <span>CSR Funding & Ledger</span>
          </Link>

          <Link
            to="/industry/partnerships"
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
            <span>🤝</span>
            <span>Partnership Hub</span>
          </Link>

          <Link
            to="/industry/impact"
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
            <span>📈</span>
            <span>Impact & Deployment</span>
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
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SECTION 135</span>
              <span style={{ fontSize: "10px", background: "rgba(168, 224, 99, 0.15)", color: "#A8E063", padding: "2px 6px", borderRadius: "999px", fontWeight: 800 }}>
                100% ELIGIBLE ✓
              </span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#F5F5F2" }}>
              Tata CSR Trust
            </div>
            <div style={{ fontSize: "10.5px", color: "#C084FC", marginTop: "2px" }}>
              CIN / CSR ID: #CSR-2026-TATA-IND
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
              Corporate Social Responsibility • SIH26043
            </div>
            <div style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2" }}>
              Industry CSR Sponsorship & Impact Funding Command Center
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
                  border: "1px solid rgba(192, 132, 252, 0.35)",
                  color: "#C084FC",
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
                ⚡ Role: Industry CSR ▼
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
                    { key: "ADMIN", label: "Govt Admin (Director Varma)", desc: "Verify, deduplicate & assign" },
                    { key: "UNIVERSITY", label: "University (IIT Bombay)", desc: "Accept challenge & build project" },
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
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: r.key === "INDUSTRY" ? "rgba(192, 132, 252, 0.12)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "block",
                        marginBottom: "3px"
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: 750, color: r.key === "INDUSTRY" ? "#C084FC" : "#F5F5F2" }}>{r.label}</div>
                      <div style={{ fontSize: "10px", color: "#8F9499" }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Industry User Card */}
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
                background: "#8B5CF6",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 900
              }}>
                💎
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#F5F5F2" }}>{profile?.companyName || "Tata CSR Trust"}</div>
                <div style={{ fontSize: "10px", color: "#C084FC", fontWeight: 750 }}>Industry Partner</div>
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
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#C084FC", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  CORPORATE SOCIAL RESPONSIBILITY (CSR) & MSME HUB
                </span>
                <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(192, 132, 252, 0.15)", color: "#C084FC", padding: "2px 8px", borderRadius: "999px" }}>
                  ✓ Section 135 Compliant
                </span>
              </div>

              <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
                {profile?.companyName || "Tata CSR Innovation Trust"}
              </h1>
              <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
                Directly sponsor high-impact university engineering prototypes addressing water purification, clean energy, and sustainable agriculture.
              </p>
            </div>

            <div style={{ background: "#1D2023", padding: "12px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "right" }}>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>COMMITTED CSR CAPITAL</div>
              <div style={{ fontSize: "20px", fontWeight: 900, color: "#C084FC", marginTop: "2px" }}>
                ₹{(totalCommitted / 100000).toFixed(1)} Lakhs
              </div>
            </div>
          </section>

          {/* 4 KPI CARDS */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>TOTAL COMMITTED</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#C084FC", marginTop: "2px" }}>
                ₹{Number(totalCommitted || 400000).toLocaleString()}
              </div>
              <span style={{ fontSize: "10.5px", color: "#C084FC" }}>Direct Project Grants</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>SPONSORED PROJECTS</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>
                {commitments.length || 1}
              </div>
              <span style={{ fontSize: "10.5px", color: "#38BDF8" }}>University R&D Labs</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>LIVES IMPACTED</span>
              <div style={{ fontSize: "30px", fontWeight: 900, color: "#A8E063", marginTop: "2px" }}>1,850+</div>
              <span style={{ fontSize: "10.5px", color: "#A8E063" }}>On-Ground Beneficiaries</span>
            </div>

            <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>TAX EXEMPTION</span>
              <div style={{ fontSize: "26px", fontWeight: 900, color: "#F5C400", marginTop: "4px" }}>
                100% MCA
              </div>
              <span style={{ fontSize: "10.5px", color: "#F5C400" }}>Sec 135 Verified</span>
            </div>
          </section>

          {/* MAIN GRID: COMMITMENTS LEDGER + BROWSE PROJECTS FOR SPONSORSHIP */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.4fr)", gap: "20px" }}>
            
            {/* Left: CSR Commitments Ledger */}
            <div style={{
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#C084FC", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    FINANCIAL DISBURSEMENT LEDGER
                  </span>
                  <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 850 }}>
                    CSR Grant Pledges ({commitments.length})
                  </h2>
                </div>
              </div>

              {commitments.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#8F9499" }}>
                  No active CSR grants recorded. Explore candidate projects on the right to sponsor a prototype!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {commitments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: "#1D2023",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "14px",
                        padding: "16px 18px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", color: "#C084FC", fontWeight: 800 }}>
                          GRANT #{c.id} • {c.partnershipType || "CSR SPONSORSHIP"}
                        </span>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: c.status === "ACCEPTED" ? "rgba(168, 224, 99, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: c.status === "ACCEPTED" ? "#A8E063" : "#F5C400"
                        }}>
                          {c.status}
                        </span>
                      </div>

                      <div style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2" }}>
                        {c.project?.title || "Arsenic Adsorption IoT Filter"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#8F9499", margin: "2px 0 6px" }}>
                        {c.proposalDetails ? c.proposalDetails.replace(/\?/g, '₹').replace(/Rs\./g, '₹') : "Committed CSR Innovation Grant"}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 900, color: "#C084FC" }}>
                          ₹{Number(c.fundingAmount || 400000).toLocaleString()}
                        </span>
                        <span style={{ fontSize: "10.5px", color: "#A8E063", fontWeight: 750 }}>
                          ✓ Section 135 MCA Compliant
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Browse Projects For Sponsorship */}
            <div style={{
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#C084FC", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    CSR SPONSORSHIP CATALOG
                  </span>
                  <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 850 }}>
                    Active University Projects ({browseProjects.length})
                  </h2>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {browseProjects.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: "#1D2023",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      padding: "16px 18px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <div>
                        <span style={{ fontSize: "9.5px", fontWeight: 800, background: "#17191C", color: "#38BDF8", padding: "2px 6px", borderRadius: "4px" }}>
                          STAGE: {p.stage}
                        </span>
                        <h3 style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2", margin: "4px 0 2px" }}>
                          {p.title}
                        </h3>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#C084FC" }}>
                        Budget: ₹{Number(p.estimatedCost || 400000).toLocaleString()}
                      </span>
                    </div>

                    <p style={{ fontSize: "12px", color: "#8F9499", margin: "0 0 10px", lineHeight: 1.35 }}>
                      {p.solutionDescription || "Embedded IoT water filter and telemetry system."}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
                      <span style={{ fontSize: "11px", color: "#8F9499" }}>
                        🏛️ {p.university?.name || "IIT Bombay"}
                      </span>

                      <button
                        type="button"
                        onClick={() => setOfferModalProj(p)}
                        style={{
                          background: "#8B5CF6",
                          color: "#fff",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: 900,
                          cursor: "pointer",
                          boxShadow: "0 0 14px rgba(139, 92, 246, 0.35)"
                        }}
                      >
                        💎 Pledge CSR Grant →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* PLEDGE CSR GRANT MODAL */}
      {offerModalProj && (
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
            border: "1px solid rgba(139, 92, 246, 0.35)",
            borderRadius: "20px",
            maxWidth: "540px",
            width: "100%",
            padding: "26px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7)"
          }}>
            <h3 style={{ fontSize: "18px", color: "#F5F5F2", margin: "0 0 8px", fontWeight: 900 }}>
              💎 Commit CSR Innovation Grant
            </h3>
            <p style={{ fontSize: "12.5px", color: "#8F9499", margin: "0 0 16px" }}>
              Pledge funding to: <strong>{offerModalProj.title}</strong> (Lead: {offerModalProj.university?.name || "IIT Bombay"})
            </p>

            <form onSubmit={handleOfferPartnership} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  Corporate Partnership Type
                </label>
                <select
                  value={offerType}
                  onChange={(e) => setOfferType(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px" }}
                >
                  <option value="CSR_SPONSORSHIP">💎 Direct CSR Grant (Sec 135 Eligible)</option>
                  <option value="MSME_COMMERCIALIZATION">🏭 MSME Commercialization & Pilot Rights</option>
                  <option value="LAB_EQUIPMENT_GRANT">🔬 Testing Equipment & Cloud Credits</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  {offerType === "MSME_COMMERCIALIZATION" ? "Commercialization & Pilot Commitment (₹ INR)" :
                   offerType === "LAB_EQUIPMENT_GRANT" ? "Equipment & Cloud Credits Valuation (₹ INR)" :
                   "Grant Amount (₹ INR)"}
                </label>
                <input
                  type="number"
                  required
                  min="50000"
                  step="10000"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "13px", fontWeight: 800, boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  {offerType === "MSME_COMMERCIALIZATION" ? "Pilot Deployment & Commercial Rights Scope" :
                   offerType === "LAB_EQUIPMENT_GRANT" ? "Engineering Mentorship & Integration Support" :
                   "Mentorship & QA Scope"}
                </label>
                <input
                  type="text"
                  placeholder={
                    offerType === "MSME_COMMERCIALIZATION" ? "Municipal pilot trial rights and commercial production co-development" :
                    offerType === "LAB_EQUIPMENT_GRANT" ? "Bi-weekly cloud systems & hardware architecture mentoring" :
                    "Bi-weekly engineering consultation and QA testing"
                  }
                  value={mentorship}
                  onChange={(e) => setMentorship(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                  {offerType === "MSME_COMMERCIALIZATION" ? "Manufacturing & Assembly Facilities Offered" :
                   offerType === "LAB_EQUIPMENT_GRANT" ? "Testing Equipment & Cloud Platform Credits" :
                   "Technical & Lab Testing Resources"}
                </label>
                <input
                  type="text"
                  placeholder={
                    offerType === "MSME_COMMERCIALIZATION" ? "Industrial fabrication access and field deployment logistics" :
                    offerType === "LAB_EQUIPMENT_GRANT" ? "AWS/Azure Cloud Credits + Specialized hardware testbench rigs" :
                    "Corporate R&D Testing Lab Access & Calibration Rigs"
                  }
                  value={techResources}
                  onChange={(e) => setTechResources(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setOfferModalProj(null)} style={{ background: "#1D2023", border: "none", color: "#8F9499", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={grantLoading} style={{ background: "#8B5CF6", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: 900, cursor: "pointer", boxShadow: "0 0 16px rgba(139, 92, 246, 0.4)" }}>
                  {grantLoading ? "Committing..." : "✓ Confirm & Commit Partnership"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import industryService from "../../services/industryService";
import projectService from "../../services/projectService";

export default function IndustryPartnerships() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");

  // Partnership Modal State
  const [offerModalProj, setOfferModalProj] = useState(null);
  const [partnershipType, setPartnershipType] = useState("CSR_SPONSORSHIP");
  const [fundingAmount, setFundingAmount] = useState(500000);
  const [mentorshipScope, setMentorshipScope] = useState("Bi-weekly engineering consultation and hardware QA testing.");
  const [techResources, setTechResources] = useState("Access to corporate testing lab + spectrometer calibration kits.");
  const [grantLoading, setGrantLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prof, comms, prjs] = await Promise.all([
        industryService.getMyProfile().catch(() => null),
        industryService.getMyCommitments().catch(() => []),
        projectService.getAll(0, 20).catch(() => [])
      ]);
      setProfile(prof);
      setCommitments(Array.isArray(comms) ? comms : comms?.data || []);
      const pList = Array.isArray(prjs) ? prjs : prjs?.content || prjs?.data || [];
      setProjects(pList);
    } catch (e) {
      console.error("Industry partnerships load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePledgePartnership = async (e) => {
    e.preventDefault();
    if (!offerModalProj) return;
    setGrantLoading(true);
    try {
      const pId = offerModalProj.id;
      const cId = offerModalProj.complaint?.id || (offerModalProj.complaintId ? offerModalProj.complaintId : null);

      const defaultTech = techResources || (
        partnershipType === "LAB_EQUIPMENT_GRANT"
          ? "Cloud Infrastructure Credits (AWS/Azure) + Specialized IoT Testing Kits"
          : partnershipType === "MSME_COMMERCIALIZATION"
          ? "Industrial Prototyping Facility + Pilot Field Trial Access"
          : (offerModalProj.title?.toLowerCase().includes("road") ? "Asphalt Testing Rig + Sensor Calibration Equipment" : "Corporate R&D Testing Lab Access")
      );

      const defaultMentor = mentorshipScope || (
        partnershipType === "MSME_COMMERCIALIZATION"
          ? "Weekly commercialization scaling & municipal pilot deployment guidance"
          : partnershipType === "LAB_EQUIPMENT_GRANT"
          ? "Bi-weekly cloud systems & hardware architecture mentoring"
          : "Bi-weekly engineering consultation and quality validation"
      );

      const defaultProposal = partnershipType === "MSME_COMMERCIALIZATION"
        ? `MSME Commercialization & Pilot Rights agreement committed for ${offerModalProj.title} with ₹${Number(fundingAmount).toLocaleString()} scaling investment by ${profile?.companyName || "Industry Partner"}`
        : partnershipType === "LAB_EQUIPMENT_GRANT"
        ? `Testing Equipment & Cloud Credits grant allocated for ${offerModalProj.title} (Valuation: ₹${Number(fundingAmount).toLocaleString()}) by ${profile?.companyName || "Industry Partner"}`
        : `Direct CSR Grant of ₹${Number(fundingAmount).toLocaleString()} committed for ${offerModalProj.title} by ${profile?.companyName || "Industry Partner"}`;

      await industryService.expressInterest({
        projectId: pId,
        challengeId: cId,
        partnershipType: partnershipType || "CSR_SPONSORSHIP",
        fundingAmount: Number(fundingAmount) || 500000,
        mentorshipScope: defaultMentor,
        technologyResourcesOffered: defaultTech,
        proposalDetails: defaultProposal
      });
      alert("CSR Partnership & Grant committed successfully to project ledger!");
      setOfferModalProj(null);
      loadData();
    } catch (err) {
      alert("Partnership pledge failed: " + (err.response?.data?.message || err.message));
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

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = !search.trim() ||
      (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
      (p.objective && p.objective.toLowerCase().includes(search.toLowerCase())) ||
      (p.university?.name && p.university.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = stageFilter === "ALL" || p.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

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

          <Link to="/industry/partnerships" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#F5F5F2", background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.3)", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>
            <span>🤝</span>
            <span>Partnership Hub</span>
          </Link>

          <Link to="/industry/impact" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
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
            <span style={{ fontSize: "11px", color: "#8B5CF6", fontWeight: 800 }}>Industry Partnership Hub</span>
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
              CORPORATE CIVIC INNOVATION & CSR DISCOVERY
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "0 0 6px" }}>
              Discover & Sponsor High-Impact University Civic Projects
            </h1>
            <p style={{ fontSize: "13px", color: "#8F9499", margin: 0, maxWidth: "720px" }}>
              Pledge strategic CSR funding, provide specialized laboratory equipment, and co-develop municipal prototypes to accelerate verified community outcomes.
            </p>
          </div>

          {/* 4 SUMMARY STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>PROJECTS DISCOVERABLE</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F5F5F2", marginTop: "2px" }}>{projects.length}</div>
              <span style={{ fontSize: "11px", color: "#8B5CF6" }}>Institutional Prototypes</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>COMMITTED CSR CAPITAL</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#34D399", marginTop: "2px" }}>₹{totalCommitted.toLocaleString()}</div>
              <span style={{ fontSize: "11px", color: "#34D399" }}>{commitments.length} Active Grants</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>ACTIVE CO-PILOTS</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>{commitments.filter((c) => c.status === "ACTIVE" || c.status === "OFFERED").length}</div>
              <span style={{ fontSize: "11px", color: "#38BDF8" }}>Field Deployments</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>MUNICIPAL BENEFICIARIES</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F59E0B", marginTop: "2px" }}>15,000+</div>
              <span style={{ fontSize: "11px", color: "#F59E0B" }}>Citizens Impacted</span>
            </div>
          </div>

          {/* SEARCH & FILTERS */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search by project title, domain, or university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: "260px",
                background: "#111315",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#F5F5F2",
                fontSize: "13px"
              }}
            />

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              style={{
                background: "#111315",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#F5F5F2",
                fontSize: "13px"
              }}
            >
              <option value="ALL">All Stages</option>
              <option value="RESEARCH">Research</option>
              <option value="DEVELOPMENT">Development</option>
              <option value="PROTOTYPE">Prototype</option>
              <option value="TESTING">Testing</option>
              <option value="PILOT">Pilot</option>
              <option value="IMPACT">Impact</option>
            </select>
          </div>

          {/* PROJECT CATALOG */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
            {filteredProjects.map((p) => {
              const estCost = p.estimatedCost || 400000;
              const hasPledged = commitments.some((c) => c.project?.id === p.id || c.projectId === p.id);

              return (
                <div key={p.id} style={{
                  background: "#111315",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "18px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px"
                }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ background: "rgba(139, 92, 246, 0.12)", color: "#8B5CF6", fontSize: "11px", fontWeight: 850, padding: "3px 8px", borderRadius: "6px" }}>
                        {p.stage || "PROTOTYPE"}
                      </span>
                      <span style={{ fontSize: "11.5px", color: "#8F9499" }}>Project #{p.id}</span>
                    </div>

                    <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 8px" }}>
                      {p.title}
                    </h3>

                    <div style={{ fontSize: "12px", color: "#8F9499", marginBottom: "12px" }}>
                      🏛️ {p.university?.name || "IIT Bombay Innovation Cell"}
                    </div>

                    <p style={{ fontSize: "13px", color: "#B7BCC2", lineHeight: 1.6, margin: "0 0 16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.objective || p.solutionDescription}
                    </p>

                    <div style={{ background: "#17191C", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <span style={{ fontSize: "10.5px", color: "#8F9499" }}>FUNDING REQUIRED</span>
                        <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#34D399" }}>₹{estCost.toLocaleString()}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "10.5px", color: "#8F9499" }}>PROGRESS TRACK</span>
                        <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#38BDF8" }}>{p.progressPercentage || 75}%</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link
                      to={`/projects/${p.id}`}
                      style={{ color: "#8F9499", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}
                    >
                      Case File ↗
                    </Link>

                    <button
                      onClick={() => {
                        setOfferModalProj(p);
                        setFundingAmount(estCost);
                      }}
                      style={{
                        background: hasPledged ? "#1D2023" : "#8B5CF6",
                        border: hasPledged ? "1px solid #8B5CF6" : "none",
                        color: hasPledged ? "#8B5CF6" : "#0B0D0F",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 850,
                        cursor: "pointer",
                        boxShadow: hasPledged ? "none" : "0 0 16px rgba(139, 92, 246, 0.35)"
                      }}
                    >
                      {hasPledged ? "✓ Grant Pledged" : "Pledge CSR Support →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </main>
      </div>

      {/* PARTNERSHIP PLEDGE MODAL */}
      {offerModalProj && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", background: "#111315", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "20px", padding: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#8B5CF6", textTransform: "uppercase" }}>CSR GRANT & PARTNERSHIP COMMITMENT</span>
                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 0" }}>
                  {offerModalProj.title}
                </h2>
              </div>
              <button onClick={() => setOfferModalProj(null)} style={{ background: "none", border: "none", color: "#8F9499", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handlePledgePartnership} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Partnership Model *
                </label>
                <select
                  value={partnershipType}
                  onChange={(e) => setPartnershipType(e.target.value)}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                >
                  <option value="CSR_SPONSORSHIP">💎 Direct CSR Grant (Sec 135 Eligible)</option>
                  <option value="MSME_COMMERCIALIZATION">🏭 MSME Commercialization & Pilot Rights</option>
                  <option value="LAB_EQUIPMENT_GRANT">🔬 Testing Equipment & Cloud Credits</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Committed Funding Amount (₹) *
                </label>
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  required
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(Number(e.target.value))}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Mentorship Scope & Consultation Hours
                </label>
                <input
                  type="text"
                  value={mentorshipScope}
                  onChange={(e) => setMentorshipScope(e.target.value)}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Technical / Testing Resources Offered
                </label>
                <textarea
                  rows={2}
                  value={techResources}
                  onChange={(e) => setTechResources(e.target.value)}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  type="button"
                  onClick={() => setOfferModalProj(null)}
                  style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.12)", color: "#F5F5F2", padding: "9px 18px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 750, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantLoading}
                  style={{ background: "#8B5CF6", border: "none", color: "#0B0D0F", padding: "9px 20px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 850, cursor: "pointer", boxShadow: "0 0 16px rgba(139, 92, 246, 0.35)" }}
                >
                  {grantLoading ? "Committing..." : "Commit CSR Support →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


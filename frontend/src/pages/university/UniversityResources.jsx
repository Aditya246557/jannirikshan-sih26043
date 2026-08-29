import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import universityService from "../../services/universityService";
import projectService from "../../services/projectService";

export default function UniversityResources() {
  const navigate = useNavigate();
  const { user, logout, switchDemoUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  // Resource Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [requestForm, setRequestForm] = useState({
    projectId: "",
    durationWeeks: 4,
    requiredInstrumentation: "",
    purpose: ""
  });

  const [requests, setRequests] = useState([
    {
      id: 101,
      resourceName: "Water Quality Testing Spectrometer Lab",
      projectName: "IoT Community Water Filtration & Telemetry System",
      status: "ALLOCATED",
      requestedBy: "Student Lead (student@iitb.ac.in)",
      duration: "4 Weeks"
    }
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await universityService.getMyProfile();
      setProfile(p);
      if (p?.id) {
        const prjs = await projectService.getByUniversity(p.id).catch(() => []);
        const pList = Array.isArray(prjs) ? prjs : prjs?.content || prjs?.data || [];
        setProjects(pList);
        if (pList.length > 0) {
          setRequestForm((prev) => ({ ...prev, projectId: pList[0].id }));
        }
      }
    } catch (e) {
      console.error("Resources load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resourcesList = [
    {
      id: 1,
      name: "Water Quality & Environmental Analytics Lab",
      category: "LAB",
      location: "Building C, Room 302",
      capacity: 12,
      utilization: "75%",
      department: "Environmental Engineering",
      capabilities: "Spectrometry, Arsenic/Lead titration, Microplastic filtration benches, Multi-parameter probes",
      domains: ["Water Systems", "Sanitation", "Environmental Safety"],
      available: true
    },
    {
      id: 2,
      name: "Embedded Systems & Edge IoT Prototyping Facility",
      category: "EQUIPMENT",
      location: "R&D Complex Block A",
      capacity: 20,
      utilization: "60%",
      department: "Electrical & Computer Science",
      capabilities: "Oscilloscopes, SMD Soldering Stations, LoRaWAN Gateway mesh, ESP32/STM32 dev kits",
      domains: ["Smart Sensors", "Telemetry", "Clean Tech"],
      available: true
    },
    {
      id: 3,
      name: "Rapid Prototyping & 3D Fabrication Studio",
      category: "FACILITY",
      location: "Makerspace Studio 1",
      capacity: 8,
      utilization: "85%",
      department: "Mechanical Engineering",
      capabilities: "Industrial SLA/FDM 3D Printers, CNC Milling, Laser Cutters, Vacuum Forming",
      domains: ["Hardware Prototypes", "Casings", "Mechanical Fixtures"],
      available: true
    },
    {
      id: 4,
      name: "High-Performance AI/ML Compute Cluster",
      category: "COMPUTE",
      location: "Data Center Tier-2",
      capacity: 32,
      utilization: "45%",
      department: "Center for AI/ML",
      capabilities: "8x NVIDIA A100 GPUs, PyTorch/TensorFlow distributed inference, Satellite GIS datasets",
      domains: ["Computer Vision", "Predictive Analytics", "Duplicate Detection"],
      available: true
    }
  ];

  const filteredResources = activeTab === "ALL"
    ? resourcesList
    : resourcesList.filter((r) => r.category === activeTab);

  const handleOpenRequest = (res) => {
    setSelectedResource(res);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!selectedResource) return;
    const proj = projects.find((p) => String(p.id) === String(requestForm.projectId));
    const newReq = {
      id: Date.now(),
      resourceName: selectedResource.name,
      projectName: proj?.title || "Civic Project #" + requestForm.projectId,
      status: "UNDER_REVIEW",
      requestedBy: user?.name || "Project Lead",
      duration: `${requestForm.durationWeeks} Weeks`
    };
    setRequests([newReq, ...requests]);
    alert("Resource allocation request submitted for Dean review!");
    setShowRequestModal(false);
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0B0D0F", color: "#F5F5F2", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* SIDEBAR */}
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

          <Link to="/university/proposals" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#8F9499", textDecoration: "none", fontSize: "13px", fontWeight: 750 }}>
            <span>📝</span>
            <span>Research Proposals</span>
          </Link>

          <Link to="/university/resources" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "#F5F5F2", background: "rgba(255, 79, 163, 0.12)", border: "1px solid rgba(255, 79, 163, 0.3)", textDecoration: "none", fontSize: "13px", fontWeight: 800 }}>
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
            <span style={{ fontSize: "11px", color: "#FF4FA3", fontWeight: 800 }}>Innovation Labs & Resources</span>
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
              INSTITUTIONAL INFRASTRUCTURE
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "0 0 6px" }}>
              Innovation Labs & Prototyping Infrastructure
            </h1>
            <p style={{ fontSize: "13px", color: "#8F9499", margin: 0, maxWidth: "720px" }}>
              State-of-the-art testing instrumentation, rapid prototyping facilities, and high-performance computing clusters supporting student engineering teams.
            </p>
          </div>

          {/* 4 SUMMARY STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>ACTIVE R&D LABS</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F5F5F2", marginTop: "2px" }}>4</div>
              <span style={{ fontSize: "11px", color: "#FF4FA3" }}>Multi-Disciplinary Centers</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>TOTAL BENCH CAPACITY</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#38BDF8", marginTop: "2px" }}>72</div>
              <span style={{ fontSize: "11px", color: "#38BDF8" }}>Workstations Available</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>RESOURCE UTILIZATION</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#34D399", marginTop: "2px" }}>66%</div>
              <span style={{ fontSize: "11px", color: "#34D399" }}>Optimal Allocation</span>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>ALLOCATION REQUESTS</span>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#F59E0B", marginTop: "2px" }}>{requests.length}</div>
              <span style={{ fontSize: "11px", color: "#F59E0B" }}>Active Requests</span>
            </div>
          </div>

          {/* FILTER TABS */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px" }}>
            {[
              { key: "ALL", label: "All Infrastructure" },
              { key: "LAB", label: "Specialized Labs" },
              { key: "EQUIPMENT", label: "Testing Equipment" },
              { key: "FACILITY", label: "Rapid Prototyping" },
              { key: "COMPUTE", label: "Compute Clusters" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: activeTab === tab.key ? "rgba(255, 79, 163, 0.15)" : "#111315",
                  border: activeTab === tab.key ? "1px solid #FF4FA3" : "1px solid rgba(255, 255, 255, 0.08)",
                  color: activeTab === tab.key ? "#FF4FA3" : "#8F9499",
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

          {/* RESOURCE GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px", marginBottom: "36px" }}>
            {filteredResources.map((res) => (
              <div key={res.id} style={{
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
                    <span style={{ background: "rgba(255, 79, 163, 0.12)", color: "#FF4FA3", fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px" }}>
                      {res.category}
                    </span>
                    <span style={{ fontSize: "11.5px", color: "#34D399", fontWeight: 750 }}>
                      ● {res.available ? "Available" : "In Use"}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#F5F5F2", margin: "0 0 6px" }}>
                    {res.name}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#8F9499", marginBottom: "12px" }}>
                    📍 {res.location} • {res.department}
                  </div>

                  <div style={{ background: "#17191C", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.05)", marginBottom: "12px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>CAPABILITIES & INSTRUMENTATION</span>
                    <p style={{ fontSize: "12px", color: "#F5F5F2", margin: "4px 0 0", lineHeight: 1.5 }}>
                      {res.capabilities}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {res.domains.map((d) => (
                      <span key={d} style={{ background: "rgba(255, 255, 255, 0.05)", color: "#B7BCC2", fontSize: "10.5px", padding: "2px 6px", borderRadius: "4px" }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "11.5px", color: "#8F9499" }}>
                    Capacity: <span style={{ color: "#F5F5F2", fontWeight: 700 }}>{res.capacity}</span> • Util: <span style={{ color: "#FF4FA3", fontWeight: 800 }}>{res.utilization}</span>
                  </div>
                  <button
                    onClick={() => handleOpenRequest(res)}
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
                    Request Access
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ACTIVE RESOURCE ALLOCATION REQUESTS */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: 0 }}>
                Active Resource Allocation Requests ({requests.length})
              </h2>
            </div>

            <div style={{ background: "#111315", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#17191C", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#8F9499", fontSize: "11px", textTransform: "uppercase" }}>
                    <th style={{ padding: "14px 20px" }}>Resource</th>
                    <th style={{ padding: "14px 20px" }}>Project</th>
                    <th style={{ padding: "14px 20px" }}>Requested By</th>
                    <th style={{ padding: "14px 20px" }}>Duration</th>
                    <th style={{ padding: "14px 20px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "14px 20px", fontWeight: 750, color: "#F5F5F2" }}>{req.resourceName}</td>
                      <td style={{ padding: "14px 20px", color: "#38BDF8" }}>{req.projectName}</td>
                      <td style={{ padding: "14px 20px", color: "#8F9499" }}>{req.requestedBy}</td>
                      <td style={{ padding: "14px 20px", color: "#B7BCC2" }}>{req.duration}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          background: req.status === "ALLOCATED" ? "rgba(52, 211, 153, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          color: req.status === "ALLOCATED" ? "#34D399" : "#F59E0B",
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "6px"
                        }}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* RESOURCE REQUEST MODAL */}
      {showRequestModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "600px", background: "#111315", border: "1px solid rgba(255, 79, 163, 0.3)", borderRadius: "20px", padding: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#FF4FA3", textTransform: "uppercase" }}>FACILITY ACCESS REQUEST</span>
                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 0" }}>
                  {selectedResource?.name}
                </h2>
              </div>
              <button onClick={() => setShowRequestModal(false)} style={{ background: "none", border: "none", color: "#8F9499", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleSubmitRequest} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Target Project *
                </label>
                <select
                  required
                  value={requestForm.projectId}
                  onChange={(e) => setRequestForm({ ...requestForm, projectId: e.target.value })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} (Project #{p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Required Instrumentation & Workstation Setup
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spectrometer calibration kit, Multi-channel oscilloscope"
                  value={requestForm.requiredInstrumentation}
                  onChange={(e) => setRequestForm({ ...requestForm, requiredInstrumentation: e.target.value })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Access Duration (Weeks)
                </label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={requestForm.durationWeeks}
                  onChange={(e) => setRequestForm({ ...requestForm, durationWeeks: Number(e.target.value) })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 750, color: "#B7BCC2", marginBottom: "6px" }}>
                  Research Purpose & Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the testing or prototyping experiments planned..."
                  value={requestForm.purpose}
                  onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
                  style={{ width: "100%", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F5F2", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.12)", color: "#F5F5F2", padding: "9px 18px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 750, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#FF4FA3", border: "none", color: "#0B0D0F", padding: "9px 20px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 850, cursor: "pointer", boxShadow: "0 0 16px rgba(255,79,163,0.35)" }}
                >
                  Submit Request →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


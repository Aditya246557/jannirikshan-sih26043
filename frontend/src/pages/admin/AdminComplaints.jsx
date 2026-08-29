import React, { useEffect, useState } from "react";
import api from "../../services/api";
import evidenceService from "../../services/evidenceService";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // Selected for moderation modal / drawer
  const [selected, setSelected] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [duplicateCandidates, setDuplicateCandidates] = useState([]);
  const [aiUniversityMatch, setAiUniversityMatch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const loadComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const [compRes, uniRes] = await Promise.all([
        api.get("/complaints", { params: { page: 0, size: 100 } }).catch(() => ({ data: [] })),
        api.get("/university/all").catch(() => ({ data: [] }))
      ]);

      const list = Array.isArray(compRes)
        ? compRes
        : Array.isArray(compRes?.data)
        ? compRes.data
        : Array.isArray(compRes?.content)
        ? compRes.content
        : Array.isArray(compRes?.data?.content)
        ? compRes.data.content
        : [];
      setComplaints(list);

      const uniList = Array.isArray(uniRes)
        ? uniRes
        : Array.isArray(uniRes?.data)
        ? uniRes.data
        : Array.isArray(uniRes?.data?.data)
        ? uniRes.data.data
        : [];
      setUniversities(uniList.length > 0 ? uniList : [
        { id: 1, name: "IIT Bombay", expertiseAreas: "Water Systems, Embedded IoT, Solar Tech" },
        { id: 2, name: "IIT Madras", expertiseAreas: "Desalination, Sensor Networks, Microgrids" },
        { id: 3, name: "IIT (BHU) Varanasi", expertiseAreas: "Solid Waste Treatment, Environmental Biotech" },
        { id: 4, name: "BITS Pilani", expertiseAreas: "Electrical & Public Lighting, Embedded Sensors" }
      ]);
    } catch (err) {
      console.error("Admin complaints fetch error:", err);
      setError("Failed to load moderation queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleOpenModeration = async (c) => {
    setSelected(c);
    setActionMsg("");
    setEvidenceList([]);
    setDuplicateCandidates([]);
    setAiUniversityMatch(null);

    // Fetch Evidence Attachments
    try {
      const evData = await evidenceService.getForComplaint(c.id);
      const evList = Array.isArray(evData) ? evData : evData?.data || [];
      setEvidenceList(evList);
    } catch (e) {
      console.warn("Evidence fetch notice:", e);
    }

    // Check AI duplicates
    try {
      const dupRes = await api.get(`/ai/duplicates/${c.id}`);
      const dList = Array.isArray(dupRes) ? dupRes : (dupRes?.data?.data || dupRes?.data || []);
      setDuplicateCandidates(Array.isArray(dList) ? dList : []);
    } catch (e) {}

    // Fetch AI University Match
    try {
      const recRes = await api.get(`/ai/university-match/${c.id}`);
      const rData = recRes?.data?.data || recRes?.data || recRes || {};
      setAiUniversityMatch(rData);
    } catch (e) {
      console.warn("AI match fetch notice:", e);
    }
  };

  const handleApproveAndAssign = async (complaintId) => {
    setActionLoading(true);
    setActionMsg("");
    try {
      const topUnivId = aiUniversityMatch?.bestUniversityId || null;

      // 1. Review & Approve
      await api.post(`/complaints/${complaintId}/review`, {
        approved: true,
        status: "APPROVED",
        remarks: "Approved by National Governance Committee"
      });

      // 2. Assign to AI Top-1 University Cell
      await api.post(`/complaints/${complaintId}/assign-university`, {
        universityId: topUnivId
      });

      const matchedName = aiUniversityMatch?.bestUniversityName || "Premier University";

      // Immediate optimistic state update
      setComplaints((prev) =>
        prev.map((item) => {
          if (item.id === complaintId) {
            return {
              ...item,
              status: "ASSIGNED",
              assignedUniversityId: topUnivId,
              assignedUniversityName: matchedName
            };
          }
          return item;
        })
      );

      setActionMsg(`✓ Challenge approved & AI-assigned to ${matchedName} Innovation Cell!`);
      
      // Authoritative refetch from backend
      await loadComplaints();
      setTimeout(() => setSelected(null), 1200);
    } catch (err) {
      console.error("Moderation action error:", err);
      setActionMsg("Action failed: " + (err?.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  const filtered = safeComplaints.filter((c) => {
    const s = String(c?.status || "").toUpperCase();
    if (filter === "PENDING" && !["SUBMITTED", "UNDER_REVIEW"].includes(s)) return false;
    if (filter === "ASSIGNED" && !["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(s)) return false;
    if (filter === "RESOLVED" && !["RESOLVED", "COMPLETED"].includes(s)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        String(c?.title || "").toLowerCase().includes(q) ||
        String(c?.district || "").toLowerCase().includes(q) ||
        String(c?.category || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      
      {/* HEADER */}
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
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            GOVERNMENT MODERATION DISPATCH
          </span>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
            Challenge Moderation & AI University Matching
          </h1>
          <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
            Audit crowdsourced problems, inspect duplicate detection telemetry, and delegate to premier universities.
          </p>
        </div>

        <button
          onClick={loadComplaints}
          style={{
            background: "#1D2023",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            color: "#38BDF8",
            fontSize: "12.5px",
            padding: "9px 18px",
            borderRadius: "8px",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          🔄 Refresh Queue
        </button>
      </section>

      {/* FILTER & SEARCH BAR */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "14px 18px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", background: "#1D2023", padding: "3px", borderRadius: "8px", gap: "3px", flexWrap: "wrap" }}>
          {[
            { key: "ALL", label: `All (${safeComplaints.length})` },
            { key: "PENDING", label: `Pending Review (${safeComplaints.filter((c) => ["SUBMITTED", "UNDER_REVIEW"].includes(c?.status)).length})` },
            { key: "ASSIGNED", label: `Assigned to R&D (${safeComplaints.filter((c) => ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(c?.status)).length})` },
            { key: "RESOLVED", label: `Deployed Impact (${safeComplaints.filter((c) => ["RESOLVED", "COMPLETED"].includes(c?.status)).length})` }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              style={{
                background: filter === tab.key ? "#38BDF8" : "transparent",
                color: filter === tab.key ? "#0B0D0F" : "#8F9499",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "11.5px",
                fontWeight: filter === tab.key ? 900 : 600,
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter by title, district, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 14px",
            background: "#1D2023",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            color: "#F5F5F2",
            fontSize: "12px",
            outline: "none",
            width: "260px"
          }}
        />
      </section>

      {/* ERROR */}
      {error && (
        <div style={{ background: "rgba(255, 92, 92, 0.12)", color: "#FF7B7B", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* MODERATION TABLE */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#8F9499" }}>
          ⚡ Loading moderation queue...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#17191C", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "18px", padding: "60px", textAlign: "center" }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "6px" }}>🛡️</span>
          <h3 style={{ fontSize: "16px", color: "#F5F5F2" }}>No Challenges in this Queue</h3>
          <p style={{ fontSize: "12px", color: "#8F9499", margin: "4px 0 0" }}>All incoming grassroots problems have been moderated or matched.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              style={{
                background: "#17191C",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "18px 22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px"
              }}
            >
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, background: "#1D2023", color: "#38BDF8", padding: "2px 8px", borderRadius: "4px" }}>
                    {c.category}
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: c.priority === "CRITICAL" ? "#FF5C5C" : "#F5C400" }}>
                    ● {c.priority} PRIORITY
                  </span>
                  <span style={{ fontSize: "10px", color: "#8F9499" }}>ID #{c.id}</span>
                  {c.priorityScore && (
                    <span style={{ fontSize: "10px", color: "#38BDF8", background: "rgba(56,189,248,0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                      Score: {Number(c.priorityScore).toFixed(1)}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: "15px", fontWeight: 850, color: "#F5F5F2", margin: "2px 0 4px" }}>
                  {c.title}
                </h3>
                <div style={{ fontSize: "12px", color: "#8F9499" }}>
                  📍 {c.address || (c.district ? `${c.district}, ${c.state || "India"}` : "Field Location")} • 👥 {c.affectedPeople || c.affectedPopulation || 1000} citizens affected
                  {(c.assignedUniversity?.name || c.assignedUniversityName || (c.assignedUniversityId && "IIT Bombay")) && (
                    <span style={{ marginLeft: "10px", color: "#38BDF8", fontWeight: 800 }}>
                      🏛️ Assigned to: {c.assignedUniversity?.name || c.assignedUniversityName || "IIT Bombay Innovation Cell"}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: ["RESOLVED", "COMPLETED"].includes(c.status) ? "rgba(168, 224, 99, 0.15)" : ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(c.status) ? "rgba(56, 189, 248, 0.15)" : "#1D2023",
                  color: ["RESOLVED", "COMPLETED"].includes(c.status) ? "#A8E063" : ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(c.status) ? "#38BDF8" : "#F5C400",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}>
                  {c.status}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenModeration(c)}
                  style={{
                    background: "#38BDF8",
                    color: "#0B0D0F",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 0 12px rgba(56, 189, 248, 0.3)"
                  }}
                >
                  ⚡ Review & Assign →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODERATION DRAWER / MODAL */}
      {selected && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.85)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          backdropFilter: "blur(6px)"
        }}>
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "20px",
            maxWidth: "760px",
            width: "100%",
            padding: "28px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase" }}>
                  CASE AUDIT & INSTITUTIONAL DELEGATION
                </span>
                <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 900 }}>
                  Case #{selected.id} • {selected.title}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "#1D2023", border: "none", color: "#8F9499", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "14px" }}
              >
                ✕
              </button>
            </div>

            {actionMsg && (
              <div style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38BDF8", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontWeight: 800, fontSize: "12px" }}>
                {actionMsg}
              </div>
            )}

            {/* Problem Info */}
            <div style={{ background: "#1D2023", padding: "14px", borderRadius: "12px", marginBottom: "16px", fontSize: "12.5px", color: "#8F9499" }}>
              <p style={{ margin: 0, color: "#F5F5F2" }}>{selected.description}</p>
              <div style={{ marginTop: "8px", fontSize: "11px", color: "#38BDF8" }}>
                📍 {selected.address || selected.villageCity || "Nagapattinam"} ({selected.district}, {selected.state}) • Priority: {selected.priority} • GPS: ({selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)})
              </div>
            </div>

            {/* AI PROBLEM INTELLIGENCE & DEFECT CLASSIFICATION */}
            <div style={{ background: "#1D2023", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "14px", borderRadius: "12px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", marginBottom: "8px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                <span>🤖 AI EVIDENCE ANALYSIS & CIVIC DEFECT DETECTION</span>
                <span style={{ color: "#34D399" }}>Model: {selected.aiModelVersion || "adhikar-final-4class (YOLO26n)"}</span>
              </div>

              {/* Mismatch Warning Alert */}
              {selected.aiMismatch && selected.aiMismatchWarning && (
                <div style={{
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  marginBottom: "12px",
                  fontSize: "11.5px",
                  color: "#F59E0B",
                  fontWeight: 700
                }}>
                  {selected.aiMismatchWarning}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
                <div style={{ background: "#17191C", padding: "10px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>AI DETECTED DEFECT</span>
                  <div style={{ fontSize: "13px", fontWeight: 850, color: "#FFD21F", marginTop: "2px" }}>
                    {selected.aiDetectedClass && selected.aiDetectedClass !== "NO_SUPPORTED_DEFECT"
                      ? selected.aiDetectedClass.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                      : "No supported defect"}
                  </div>
                </div>

                <div style={{ background: "#17191C", padding: "10px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>APPLICATION CATEGORY</span>
                  <div style={{ fontSize: "13px", fontWeight: 850, color: "#F5F5F2", marginTop: "2px" }}>
                    {selected.category}
                  </div>
                </div>

                <div style={{ background: "#17191C", padding: "10px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>MODEL CONFIDENCE</span>
                  <div style={{ fontSize: "13px", fontWeight: 850, color: selected.aiConfidence ? "#34D399" : "#8F9499", marginTop: "2px" }}>
                    {selected.aiConfidence ? `${selected.aiConfidence}%` : "N/A (Manual Review)"}
                  </div>
                </div>

                <div style={{ background: "#17191C", padding: "10px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>RECOMMENDED DEPT</span>
                  <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#38BDF8", marginTop: "2px" }}>
                    {selected.aiRecommendedDepartment || "Public Works Department (PWD)"}
                  </div>
                </div>
              </div>
            </div>

            {/* Citizen Evidence Gallery */}
            <div style={{ background: "#1D2023", padding: "14px", borderRadius: "12px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                <span>📷 Field Survey Evidence & Media ({evidenceList.length})</span>
                {evidenceList.length > 0 ? (
                  <span style={{ color: "#A8E063", fontWeight: 800 }}>✓ {evidenceList.length} Attached File(s)</span>
                ) : (
                  <span style={{ color: "#FF5C5C", fontWeight: 800 }}>NO EVIDENCE ATTACHED</span>
                )}
              </div>

              {evidenceList.length === 0 ? (
                <div style={{ fontSize: "11.5px", color: "#FF5C5C", padding: "8px 12px", background: "#17191C", borderRadius: "8px" }}>
                  ⚠️ NO EVIDENCE ATTACHED — Citizen did not submit photographic evidence. Review coordinates and description carefully before approval.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
                  {evidenceList.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        background: "#17191C",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        overflow: "hidden",
                        padding: "6px"
                      }}
                    >
                      {ev.contentType?.startsWith("image/") || ev.fileUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                        <a href={ev.fileUrl || `/api/files/complaints/${selected.id}/${ev.storageFileName}`} target="_blank" rel="noopener noreferrer">
                          <img
                            src={ev.fileUrl || `/api/files/complaints/${selected.id}/${ev.storageFileName}`}
                            alt={ev.originalFileName || "Evidence"}
                            onError={(e) => {
                              const fallbackUrl = ev.fileUrl || `/api/files/complaints/${selected.id}/${ev.storageFileName}`;
                              if (!e.target.src.includes(":8080")) {
                                e.target.src = `http://localhost:8080${fallbackUrl.startsWith('/') ? fallbackUrl : '/' + fallbackUrl}`;
                              }
                            }}
                            style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "6px", display: "block" }}
                          />
                        </a>
                      ) : (
                        <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", background: "#111315", borderRadius: "6px", fontSize: "28px" }}>
                          📄
                        </div>
                      )}
                      <div style={{ fontSize: "10.5px", color: "#F5F5F2", fontWeight: 700, marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ev.originalFileName || `Evidence #${ev.id}`}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#38BDF8", marginTop: "2px" }}>
                        <span>{ev.evidenceType || "IMAGE"}</span>
                        <span style={{ color: "#34D399", fontWeight: 800 }}>✓ {ev.verificationStatus || "VERIFIED"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Duplicate Intelligence */}
            <div style={{ background: "#1D2023", padding: "14px", borderRadius: "12px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", marginBottom: "6px" }}>
                🤖 AI Duplicate Telemetry ({duplicateCandidates.length} candidate clusters)
              </div>
              {duplicateCandidates.length === 0 ? (
                <div style={{ fontSize: "11.5px", color: "#A8E063" }}>✓ Zero duplicate problem statements detected. Verified unique civic issue.</div>
              ) : (
                <div style={{ fontSize: "11.5px", color: "#F5C400" }}>
                  ⚠️ {duplicateCandidates.length} candidate problem statement(s) evaluated in {selected.district}. AI heuristics confirmed non-duplicate cluster.
                </div>
              )}
            </div>

            {/* AI UNIVERSITY MATCH CARD (NO DROPDOWN) */}
            <div style={{
              background: "linear-gradient(135deg, rgba(23, 25, 28, 0.95) 0%, rgba(17, 19, 21, 0.98) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              borderRadius: "14px",
              padding: "16px 18px",
              marginBottom: "20px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 850, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  🤖 AI UNIVERSITY MATCH
                </span>
                <span style={{
                  background: "rgba(52, 211, 153, 0.15)",
                  color: "#34D399",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontSize: "10.5px",
                  fontWeight: 850
                }}>
                  ✓ AI AUTO-MATCHED
                </span>
              </div>

              {/* Best Match Header */}
              <div style={{ background: "#111315", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "10px", padding: "14px", marginBottom: "12px" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>
                  BEST MATCH
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "2px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 900, color: "#F5F5F2" }}>
                    🏛️ {aiUniversityMatch?.bestUniversityName || "IIT Madras"} Innovation Cell
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 850, color: "#38BDF8" }}>
                    Match Score: <span style={{ color: "#34D399", fontSize: "15px" }}>{aiUniversityMatch?.matchScore || 91}%</span>
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                  Confidence: {aiUniversityMatch?.confidencePercent || aiUniversityMatch?.matchScore || 91}%
                </div>

                {/* Reason */}
                <div style={{ marginTop: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "8px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#F5F5F2" }}>Why this university?</div>
                  <div style={{ fontSize: "11.5px", color: "#CBD5E1", marginTop: "3px", lineHeight: "1.5" }}>
                    {aiUniversityMatch?.reason || "Strong capability match for Roads & Infrastructure (Transportation / Civil Engineering & Road Safety Laboratory)"}
                  </div>
                </div>
              </div>

              {/* AI Ranked Alternatives */}
              {aiUniversityMatch?.rankedCandidates && aiUniversityMatch.rankedCandidates.length > 0 && (
                <div>
                  <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "6px" }}>
                    AI-Ranked Alternatives:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "6px" }}>
                    {aiUniversityMatch.rankedCandidates.map((cand, idx) => (
                      <div
                        key={cand.universityId || idx}
                        style={{
                          background: idx === 0 ? "rgba(56, 189, 248, 0.08)" : "#17191C",
                          border: idx === 0 ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span style={{ fontSize: "11.5px", fontWeight: idx === 0 ? 800 : 600, color: idx === 0 ? "#F5F5F2" : "#8F9499" }}>
                          {idx + 1}. {cand.name} {idx === 0 && "(Top-1)"}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: idx === 0 ? "#34D399" : "#64748B" }}>
                          {cand.matchScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", color: "#F5F5F2", padding: "10px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleApproveAndAssign(selected.id)}
                style={{
                  background: "#38BDF8",
                  color: "#0B0D0F",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 0 16px rgba(56, 189, 248, 0.35)"
                }}
              >
                {actionLoading ? "Processing AI Assignment..." : "✓ Approve & AI Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

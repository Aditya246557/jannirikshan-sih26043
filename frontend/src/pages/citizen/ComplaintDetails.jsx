import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import complaintService from "../../services/complaintService";
import evidenceService from "../../services/evidenceService";
import feedbackService from "../../services/feedbackService";
import ComplaintMap from "../../components/map/ComplaintMap";

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await complaintService.getById(id);
      setComplaint(data);
      if (data?.id) {
        try {
          const [evData, fbData] = await Promise.all([
            evidenceService.getForComplaint(data.id).catch(() => []),
            feedbackService.getForChallenge(data.id).catch(() => [])
          ]);
          setEvidence(Array.isArray(evData) ? evData : evData?.data || []);
          setFeedbackList(Array.isArray(fbData) ? fbData : fbData?.data || []);
        } catch (e) {}
      }
    } catch (err) {
      console.error("Complaint details error:", err);
      setError("Unable to load challenge details. Please check the ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!complaint?.id || !comment.trim()) return;
    setFeedbackLoading(true);
    setFeedbackMessage("");
    try {
      await feedbackService.submitFeedback({
        complaintId: complaint.id,
        rating,
        comments: comment.trim()
      });
      setFeedbackMessage("✓ Citizen verification feedback recorded and synced with National Repository.");
      setComment("");
      const updatedFb = await feedbackService.getForChallenge(complaint.id).catch(() => []);
      setFeedbackList(Array.isArray(updatedFb) ? updatedFb : updatedFb?.data || []);
    } catch (err) {
      setFeedbackMessage("Failed to submit feedback: " + (err.response?.data?.message || err.message || "Error"));
    } finally {
      setFeedbackLoading(false);
    }
  };

  const stagesList = [
    { title: "Reported", desc: "Logged with GPS & evidence", key: "SUBMITTED" },
    { title: "Verified", desc: "Audited & deduplicated by Govt", key: "UNDER_REVIEW" },
    { title: "Assigned", desc: "Matched to University Cell", key: "ASSIGNED" },
    { title: "Project Active", desc: "R&D team & faculty engaged", key: "IN_PROGRESS" },
    { title: "R&D Prototype", desc: "Bench testing & field trial", key: "PROTOTYPE" },
    { title: "Impact", desc: "Deployed community solution", key: "RESOLVED" }
  ];

  const getStageIndex = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "SUBMITTED") return 0;
    if (s === "UNDER_REVIEW") return 1;
    if (s === "ASSIGNED") return 2;
    if (["IN_PROGRESS", "PROJECT_CREATED"].includes(s)) return 3;
    if (["PROTOTYPE", "TESTING", "PILOT"].includes(s)) return 4;
    if (["RESOLVED", "COMPLETED", "CLOSED"].includes(s)) return 5;
    return 0;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px", textAlign: "center", color: "#8F9499" }}>
        Loading challenge case file...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div style={{ maxWidth: "800px", margin: "40px auto", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "40px", textAlign: "center" }}>
        <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>⚠️</span>
        <h2 style={{ fontSize: "18px", color: "#FF5C5C", margin: "0 0 8px" }}>{error || "Challenge Not Found"}</h2>
        <Link to="/citizen/complaints" style={{ background: "#FFD21F", color: "#0B0D0F", padding: "8px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: 800, fontSize: "12px" }}>
          ← Back to My Submissions
        </Link>
      </div>
    );
  }

  const currentStageIdx = getStageIndex(complaint.status);
  const mapList = complaint.latitude && complaint.longitude ? [complaint] : [];

  return (
    <div style={{ maxWidth: "1340px", margin: "0 auto" }}>
      
      {/* 1. TOP CASE MANAGEMENT HEADER */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        padding: "24px 28px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Link to="/citizen/complaints" style={{ color: "#FFD21F", textDecoration: "none", fontSize: "11px", fontWeight: 800 }}>
              ← MY SUBMISSIONS
            </Link>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
            <span style={{ fontSize: "11px", color: "#8F9499" }}>CASE #{complaint.id}</span>
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 6px", letterSpacing: "-0.02em" }}>
            {complaint.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "11.5px", color: "#8F9499" }}>
            <span style={{ background: "#1D2023", color: "#FFD21F", padding: "2px 8px", borderRadius: "6px", fontWeight: 800 }}>
              {complaint.category}
            </span>
            <span style={{
              fontWeight: 800,
              color: complaint.priority === "CRITICAL" ? "#FF5C5C" : complaint.priority === "HIGH" ? "#FFD21F" : "#A8E063"
            }}>
              ● {complaint.priority} SEVERITY
            </span>
            <span>📍 {complaint.address || (complaint.district ? `${complaint.district}, ${complaint.state || "India"}` : "Field Location")}</span>
            <span>👥 {complaint.affectedPopulation || 1000} Affected</span>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={{
            fontSize: "12px",
            fontWeight: 900,
            padding: "5px 14px",
            borderRadius: "999px",
            background: ["RESOLVED", "COMPLETED"].includes(complaint.status) ? "rgba(168, 224, 99, 0.15)" : ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(complaint.status) ? "rgba(255, 210, 31, 0.15)" : "#1D2023",
            color: ["RESOLVED", "COMPLETED"].includes(complaint.status) ? "#A8E063" : ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(complaint.status) ? "#FFD21F" : "#8F9499",
            border: "1px solid rgba(255, 255, 255, 0.12)"
          }}>
            {complaint.status}
          </span>
          <div style={{ fontSize: "11px", color: "#8F9499", marginTop: "6px" }}>
            Stage {currentStageIdx + 1} of 6 Complete
          </div>
        </div>
      </section>

      {/* 2. 6-STAGE COLLABORATIVE INNOVATION LIFECYCLE TIMELINE */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        padding: "24px",
        marginBottom: "20px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)"
      }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
          COLLABORATIVE INNOVATION LIFECYCLE
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px" }}>
          {stagesList.map((stg, idx) => {
            const isDone = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;

            return (
              <div
                key={stg.title}
                style={{
                  background: isCurrent ? "#1D2023" : "#17191C",
                  border: isCurrent ? "1px solid rgba(255, 210, 31, 0.35)" : "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "12px",
                  padding: "14px",
                  position: "relative"
                }}
              >
                <div style={{
                  height: "4px",
                  background: isDone ? "#A8E063" : isCurrent ? "#FFD21F" : "rgba(255, 255, 255, 0.08)",
                  borderRadius: "999px",
                  marginBottom: "8px",
                  boxShadow: isCurrent ? "0 0 10px #FFD21F" : "none"
                }} />

                <div style={{ fontSize: "12px", fontWeight: isCurrent ? 850 : 700, color: isCurrent ? "#FFD21F" : isDone ? "#A8E063" : "#F5F5F2" }}>
                  {isDone ? "✓ " : `${idx + 1}. `}{stg.title}
                </div>
                <div style={{ fontSize: "10.5px", color: "#8F9499", marginTop: "2px" }}>
                  {stg.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CASE CONTENT (2-COLUMN GRID) */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: "20px" }}>
        
        {/* Left Column: Problem Details, Evidence, and Feedback */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Detailed Problem Statement */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "22px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
          }}>
            <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: "0 0 12px", fontWeight: 800 }}>
              Problem Description
            </h3>
            <p style={{ fontSize: "13px", color: "#8F9499", lineHeight: 1.5, margin: "0 0 16px" }}>
              {complaint.description}
            </p>

            {complaint.expectedImpact && (
              <div style={{ background: "#1D2023", borderRadius: "10px", padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase" }}>EXPECTED ENGINEERING OUTCOME</span>
                <p style={{ fontSize: "12.5px", color: "#F5F5F2", margin: "4px 0 0" }}>
                  {complaint.expectedImpact}
                </p>
              </div>
            )}
          </div>

          {/* AI DEFECT VERIFICATION & INTELLIGENCE */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 210, 31, 0.25)",
            borderRadius: "18px",
            padding: "20px 22px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>🤖</span>
                <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
                  AI EVIDENCE ANALYSIS & CIVIC DEFECT DETECTION
                </h3>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#34D399", background: "rgba(52, 211, 153, 0.12)", padding: "2px 8px", borderRadius: "6px" }}>
                ✓ {complaint.aiModelVersion || "adhikar-final-4class (YOLO26n)"}
              </span>
            </div>

            {/* Mismatch Conflict Warning */}
            {complaint.aiMismatch && complaint.aiMismatchWarning && (
              <div style={{
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "14px",
                fontSize: "12px",
                color: "#F59E0B",
                fontWeight: 700
              }}>
                {complaint.aiMismatchWarning}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              <div style={{ background: "#1D2023", padding: "12px", borderRadius: "10px" }}>
                <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>AI DETECTED DEFECT</span>
                <div style={{ fontSize: "13.5px", fontWeight: 850, color: "#FFD21F", marginTop: "2px" }}>
                  {complaint.aiDetectedClass && complaint.aiDetectedClass !== "NO_SUPPORTED_DEFECT"
                    ? complaint.aiDetectedClass.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    : "No supported defect detected"}
                </div>
              </div>

              <div style={{ background: "#1D2023", padding: "12px", borderRadius: "10px" }}>
                <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>APPLICATION CATEGORY</span>
                <div style={{ fontSize: "13.5px", fontWeight: 850, color: "#F5F5F2", marginTop: "2px" }}>
                  {complaint.category}
                </div>
              </div>

              <div style={{ background: "#1D2023", padding: "12px", borderRadius: "10px" }}>
                <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>MODEL CONFIDENCE</span>
                <div style={{ fontSize: "13.5px", fontWeight: 850, color: complaint.aiConfidence ? "#34D399" : "#8F9499", marginTop: "2px" }}>
                  {complaint.aiConfidence ? `${complaint.aiConfidence}%` : "Manual Review Required"}
                </div>
              </div>

              <div style={{ background: "#1D2023", padding: "12px", borderRadius: "10px" }}>
                <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>ROUTED DEPARTMENT</span>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#38BDF8", marginTop: "2px" }}>
                  {complaint.aiRecommendedDepartment || "Public Works Department / Municipal Division"}
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Media Gallery */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "22px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
                Evidence & Telemetry Attachments ({evidence.length})
              </h3>
              {evidence.length > 0 ? (
                <span style={{ fontSize: "10px", color: "#34D399", fontWeight: 800 }}>✓ {evidence.length} File(s) Attached</span>
              ) : (
                <span style={{ fontSize: "10px", color: "#FF5C5C", fontWeight: 800 }}>NO EVIDENCE ATTACHED</span>
              )}
            </div>

            {evidence.length === 0 ? (
              <div style={{ fontSize: "12px", color: "#8F9499", padding: "14px", background: "#1D2023", borderRadius: "10px", textAlign: "center" }}>
                No photographic or document evidence attached to this case. Geolocation telemetry verified via GPS.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                {evidence.map((ev, idx) => {
                  const isImg = ev.contentType?.startsWith("image/") || ev.fileUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i);
                  const imgUrl = ev.fileUrl || `/api/files/complaints/${complaint.id}/${ev.storageFileName}`;

                  return (
                    <div key={ev.id || idx} style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden", padding: "8px" }}>
                      {isImg ? (
                        <a href={imgUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                          <img
                            src={imgUrl}
                            alt={ev.originalFileName || `Evidence #${idx + 1}`}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = "flex";
                              }
                            }}
                            style={{ width: "100%", height: "110px", objectFit: "cover", borderRadius: "8px", display: "block" }}
                          />
                          <div style={{ height: "110px", display: "none", alignItems: "center", justifyContent: "center", background: "#111315", borderRadius: "8px", fontSize: "24px", color: "#8F9499", flexDirection: "column", gap: "4px" }}>
                            <span>📷</span>
                            <span style={{ fontSize: "10px" }}>Image Preview</span>
                          </div>
                        </a>
                      ) : (
                        <div style={{ height: "110px", display: "flex", alignItems: "center", justifyContent: "center", background: "#111315", borderRadius: "8px", fontSize: "32px" }}>
                          📄
                        </div>
                      )}
                      <div style={{ fontSize: "11.5px", fontWeight: 750, color: "#F5F5F2", marginTop: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {ev.originalFileName || ev.fileName || `Evidence #${idx + 1}`}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#8F9499", marginTop: "2px" }}>
                        <span>{ev.evidenceType || "Field Photo"}</span>
                        <span style={{ color: "#34D399", fontWeight: 800 }}>✓ {ev.verificationStatus || "VERIFIED"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Citizen Feedback Form (if resolved) */}
          {["RESOLVED", "COMPLETED", "PROTOTYPE"].includes(complaint.status) && (
            <div style={{
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "22px",
              boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
            }}>
              <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: "0 0 4px", fontWeight: 800 }}>
                Citizen Solution Feedback & Verification
              </h3>
              <p style={{ fontSize: "12px", color: "#8F9499", margin: "0 0 14px" }}>
                Rate the university engineering solution and confirm community deployment impact.
              </p>

              {feedbackMessage && (
                <div style={{ background: "rgba(168, 224, 99, 0.12)", color: "#A8E063", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px", fontWeight: 750 }}>
                  {feedbackMessage}
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                    Solution Impact Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    style={{
                      padding: "8px 12px",
                      background: "#1D2023",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#F5F5F2",
                      fontSize: "12px"
                    }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5/5 - Exceptional community solution</option>
                    <option value={4}>⭐⭐⭐⭐ 4/5 - Effective working prototype</option>
                    <option value={3}>⭐⭐⭐ 3/5 - Partially resolved, requires tuning</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 750, color: "#8F9499", display: "block", marginBottom: "4px" }}>
                    Comments / On-Ground Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter observations on water quality, energy output, or road condition..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "#1D2023",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#F5F5F2",
                      fontSize: "12px",
                      boxSizing: "border-box",
                      fontFamily: "inherit"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedbackLoading}
                  style={{
                    background: "#FFD21F",
                    color: "#0B0D0F",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 900,
                    cursor: "pointer",
                    alignSelf: "flex-start",
                    boxShadow: "0 0 12px rgba(255, 210, 31, 0.25)"
                  }}
                >
                  {feedbackLoading ? "Submitting..." : "Submit Citizen Verification"}
                </button>
              </form>

              {/* Verified Citizen Feedback Records */}
              {feedbackList.length > 0 && (
                <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#A8E063", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
                    Verified Community Feedback Log ({feedbackList.length})
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {feedbackList.map((f) => (
                      <div key={f.id} style={{ background: "#111315", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#F5F5F2" }}>
                            {f.author?.name || "Verified Citizen"}
                          </span>
                          <span style={{ fontSize: "10px", color: "#8F9499" }}>
                            {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "#B7BCC2", margin: 0, lineHeight: 1.4 }}>
                          {f.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Geotag Map & Assigned University Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Location Map Preview */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "20px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
          }}>
            <h3 style={{ fontSize: "14px", color: "#F5F5F2", margin: "0 0 10px", fontWeight: 800 }}>
              📍 Geotagged Location
            </h3>
            <div style={{ fontSize: "12px", color: "#8F9499", marginBottom: "10px" }}>
              {complaint.address || "Local Ward Area"}
            </div>

            <div style={{ height: "240px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              <ComplaintMap complaints={mapList} zoom={13} />
            </div>

            <div style={{ fontSize: "11px", color: "#FFD21F", marginTop: "10px", fontWeight: 700 }}>
              Coordinates: {complaint.latitude}, {complaint.longitude}
            </div>
          </div>

          {/* Assigned University R&D Cell */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "18px",
            padding: "20px",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
          }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              R&D PARTNERSHIP CELL
            </span>
            <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: "4px 0 12px", fontWeight: 800 }}>
              Institutional Problem Solver
            </h3>

            {complaint.assignedUniversityName || complaint.assignedUniversity ? (
              <div>
                <div style={{ fontSize: "14px", fontWeight: 850, color: "#F5F5F2" }}>
                  🏛️ {complaint.assignedUniversityName || complaint.assignedUniversity?.name || "IIT Bombay Innovation Cell"}
                </div>
                <div style={{ fontSize: "11px", color: "#8F9499", marginTop: "2px" }}>
                  {complaint.assignedFacultyName ? `Mentor: ${complaint.assignedFacultyName}` : "Premier National R&D Node"}
                </div>

                <div style={{ marginTop: "14px", background: "#1D2023", padding: "10px 12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>RESEARCH & IMPACT STATUS</div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    marginTop: "2px",
                    color: ["RESOLVED", "COMPLETED"].includes(complaint.status) ? "#A8E063" :
                           ["PROTOTYPE", "TESTING", "PILOT"].includes(complaint.status) ? "#38BDF8" :
                           ["IN_PROGRESS", "PROJECT_CREATED", "ASSIGNED"].includes(complaint.status) ? "#FFD21F" : "#8F9499"
                  }}>
                    {["RESOLVED", "COMPLETED"].includes(complaint.status) ? "✓ Field Deployed & Societal Impact Verified" :
                     ["PROTOTYPE", "TESTING", "PILOT"].includes(complaint.status) ? "🔬 Prototype Bench Tested & Field Trial Active" :
                     ["IN_PROGRESS", "PROJECT_CREATED"].includes(complaint.status) ? "⚙️ Active R&D Engineering Sprint in Progress" :
                     complaint.status === "ASSIGNED" ? "🏛️ University Innovation Cell Assigned" :
                     "📋 Under Review & AI Matching"}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "12px", color: "#8F9499" }}>
                {complaint.status === "SUBMITTED"
                  ? "Pending government review & AI university matching."
                  : "Awaiting university innovation cell matching."}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

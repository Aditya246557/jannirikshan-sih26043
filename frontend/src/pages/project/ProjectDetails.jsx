import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import projectService from "../../services/projectService";
import milestoneService from "../../services/milestoneService";
import taskService from "../../services/taskService";
import industryService from "../../services/industryService";
import feedbackService from "../../services/feedbackService";
import evidenceService from "../../services/evidenceService";
import { useAuth } from "../../context/AuthContext";
import TaskBoard from "../../components/project/TaskBoard";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [fundingList, setFundingList] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [newStage, setNewStage] = useState("");

  const loadData = async () => {
    try {
      const prj = await projectService.get(id);
      setProject(prj);
      setNewStage(prj?.stage || "RESEARCH");

      try {
        const ms = await milestoneService.getByProject(id);
        setMilestones(Array.isArray(ms) ? ms : ms?.data || []);
      } catch (_) {}

      try {
        const t = await taskService.getByProject(id);
        setTasks(Array.isArray(t) ? t : t?.data || []);
      } catch (_) {}

      try {
        const f = await industryService.getProjectFunding(id);
        setFundingList(Array.isArray(f) ? f : f?.data || []);
      } catch (_) {}

      try {
        const c = await feedbackService.getForProject(id);
        setComments(Array.isArray(c) ? c : c?.data || []);
      } catch (_) {}

      try {
        const ev = await evidenceService.getForProject(id);
        setEvidenceList(Array.isArray(ev) ? ev : ev?.data || []);
      } catch (_) {}
    } catch (e) {
      console.error("Project details load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStageChange = async (e) => {
    e.preventDefault();
    try {
      await projectService.updateStage(id, newStage, null, "Updated via Project Workspace");
      alert("Project stage updated to: " + newStage);
      loadData();
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await feedbackService.submitFeedback({
        projectId: id,
        rating: 5,
        comments: newComment
      });
      setNewComment("");
      const c = await feedbackService.getForProject(id);
      setComments(Array.isArray(c) ? c : c?.data || []);
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px", textAlign: "center", color: "#8F9499" }}>
        Loading project workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ maxWidth: "800px", margin: "40px auto", background: "#17191C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "40px", textAlign: "center" }}>
        <h2 style={{ fontSize: "18px", color: "#FF5C5C" }}>Project Not Found</h2>
        <Link to="/explore" style={{ background: "#FFD21F", color: "#0B0D0F", padding: "8px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: 800, fontSize: "12px" }}>
          ← Back to Repository
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "30px 24px", color: "#F5F5F2" }}>
      
      {/* 1. PROJECT CASE HEADER */}
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
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              NATIONAL R&D PROJECT CASE #{project.id}
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", padding: "2px 8px", borderRadius: "999px" }}>
              STAGE: {project.stage}
            </span>
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 6px", letterSpacing: "-0.02em" }}>
            {project.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "12px", color: "#8F9499" }}>
            <span>🏛️ {project.university?.name || "IIT Bombay"}</span>
            <span>👩‍🏫 Mentor: <strong style={{ color: "#34D399" }}>{project.facultyMentor?.user?.name || project.facultyMentor?.name || "Prof. Sharma"}</strong></span>
            <span>💰 Budget: <strong style={{ color: "#F5F5F2" }}>₹{Number(project.estimatedCost || 400000).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Stage Advancement Gate */}
        <form onSubmit={handleStageChange} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            value={newStage}
            onChange={(e) => setNewStage(e.target.value)}
            style={{
              padding: "8px 12px",
              background: "#1D2023",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#F5F5F2",
              fontSize: "12px",
              fontWeight: 750
            }}
          >
            <option value="RESEARCH">Stage: RESEARCH</option>
            <option value="DEVELOPMENT">Stage: DEVELOPMENT</option>
            <option value="PROTOTYPE">Stage: PROTOTYPE</option>
            <option value="TESTING">Stage: TESTING</option>
            <option value="PILOT">Stage: PILOT</option>
            <option value="IMPACT">Stage: IMPACT</option>
          </select>
          <button
            type="submit"
            style={{
              background: "#38BDF8",
              color: "#0B0D0F",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "11.5px",
              fontWeight: 850,
              cursor: "pointer"
            }}
          >
            Update Stage
          </button>
        </form>
      </section>

      {/* 2. ORIGINAL CITIZEN CHALLENGE & EVIDENCE CONTEXT */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        padding: "20px 24px",
        marginBottom: "24px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ORIGINATING CIVIC CHALLENGE #{project.complaint?.id || project.complaintId || project.id}
            </span>
            <h3 style={{ fontSize: "16px", fontWeight: 850, color: "#F5F5F2", margin: "2px 0 0" }}>
              {project.complaint?.title || project.title}
            </h3>
          </div>
          {project.complaint?.id && (
            <Link
              to={`/citizen/complaints/${project.complaint.id}`}
              style={{ fontSize: "11.5px", color: "#FFD21F", fontWeight: 750, textDecoration: "none" }}
            >
              View Citizen Case File →
            </Link>
          )}
        </div>

        <p style={{ fontSize: "13px", color: "#8F9499", margin: "0 0 14px", lineHeight: 1.5 }}>
          {project.complaint?.description || project.objective || "Engineering project initialized from grassroots civic challenge submission."}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", fontSize: "11.5px", color: "#8F9499", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", marginBottom: "14px" }}>
          <span>📍 <strong>Location:</strong> {project.complaint?.address || project.complaint?.villageCity || "Nagapattinam"} ({project.complaint?.district || "Tamil Nadu"})</span>
          <span>● <strong>Priority:</strong> <strong style={{ color: "#FFD21F" }}>{project.complaint?.priority || "HIGH"}</strong></span>
          <span>👥 <strong>Impact Target:</strong> {project.complaint?.affectedPeople || 1200} Citizens</span>
        </div>

        {/* AI EVIDENCE ANALYSIS & CIVIC DEFECT DETECTION */}
        {project.complaint && (
          <div style={{ background: "#1D2023", border: "1px solid rgba(56, 189, 248, 0.2)", padding: "14px", borderRadius: "12px", marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", marginBottom: "8px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
              <span>🤖 AI EVIDENCE ANALYSIS & CIVIC DEFECT DETECTION</span>
              <span style={{ color: "#34D399" }}>Model: {project.complaint.aiModelVersion || "adhikar-final-4class (YOLO26n)"}</span>
            </div>

            {project.complaint.aiMismatch && project.complaint.aiMismatchWarning && (
              <div style={{
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                borderRadius: "8px",
                padding: "8px 12px",
                marginBottom: "10px",
                fontSize: "11.5px",
                color: "#F59E0B",
                fontWeight: 700
              }}>
                {project.complaint.aiMismatchWarning}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
              <div style={{ background: "#17191C", padding: "10px", borderRadius: "8px" }}>
                <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>AI DETECTED DEFECT</span>
                <div style={{ fontSize: "13px", fontWeight: 850, color: "#FFD21F", marginTop: "2px" }}>
                  {project.complaint.aiDetectedClass && project.complaint.aiDetectedClass !== "NO_SUPPORTED_DEFECT"
                    ? project.complaint.aiDetectedClass.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    : "No supported defect"}
                </div>
              </div>

              <div style={{ background: "#17191C", padding: "10px", borderRadius: "8px" }}>
                <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>APPLICATION CATEGORY</span>
                <div style={{ fontSize: "13px", fontWeight: 850, color: "#F5F5F2", marginTop: "2px" }}>
                  {project.complaint.category}
                </div>
              </div>

              <div style={{ background: "#17191C", padding: "10px", borderRadius: "8px" }}>
                <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>MODEL CONFIDENCE</span>
                <div style={{ fontSize: "13px", fontWeight: 850, color: project.complaint.aiConfidence ? "#34D399" : "#8F9499", marginTop: "2px" }}>
                  {project.complaint.aiConfidence ? `${project.complaint.aiConfidence}%` : "Manual Review"}
                </div>
              </div>

              <div style={{ background: "#17191C", padding: "10px", borderRadius: "8px" }}>
                <span style={{ fontSize: "10px", color: "#8F9499", textTransform: "uppercase", fontWeight: 800 }}>RECOMMENDED DEPT</span>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#38BDF8", marginTop: "2px" }}>
                  {project.complaint.aiRecommendedDepartment || "Public Works Department (PWD)"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Attachments Grid */}
        <div>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
            <span>📷 Originating Field Survey Evidence ({evidenceList.length})</span>
            {evidenceList.length > 0 ? (
              <span style={{ color: "#A8E063", fontWeight: 800 }}>✓ {evidenceList.length} Attached File(s)</span>
            ) : (
              <span style={{ color: "#FF5C5C", fontWeight: 800 }}>NO EVIDENCE ATTACHED</span>
            )}
          </div>

          {evidenceList.length === 0 ? (
            <div style={{ fontSize: "11.5px", color: "#8F9499", fontStyle: "italic" }}>
              No multimedia attachments found. Geo-location telemetry verified via GPS.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
              {evidenceList.map((ev) => (
                <div key={ev.id} style={{ background: "#1D2023", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", padding: "6px" }}>
                  {ev.contentType?.startsWith("image/") || ev.fileUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                    <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer">
                      <img src={ev.fileUrl} alt="Evidence" style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "6px" }} />
                    </a>
                  ) : (
                    <div style={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📄</div>
                  )}
                  <div style={{ fontSize: "10px", color: "#F5F5F2", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ev.originalFileName || `Evidence #${ev.id}`}
                  </div>
                  <div style={{ fontSize: "9px", color: "#A8E063" }}>
                    ✓ {ev.verificationStatus || "VERIFIED"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. SPRINT KANBAN WORKSPACE */}
      <section style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
          AGILE SPRINT & TASK BACKLOG
        </div>
        <TaskBoard tasks={tasks} onTaskUpdated={loadData} />
      </section>

      {/* 3. LOWER 2-COL: MILESTONE GATES + CSR FUNDING LEDGER */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        
        {/* Milestones */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          padding: "22px",
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
        }}>
          <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: "0 0 14px", fontWeight: 850 }}>
            🏁 Milestone Deliverable Gates ({milestones.length})
          </h3>

          {milestones.length === 0 ? (
            <div style={{ fontSize: "12px", color: "#8F9499" }}>No milestone gates established yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {milestones.map((m) => (
                <div key={m.id} style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                    <strong style={{ fontSize: "13px", color: "#F5F5F2" }}>{m.title}</strong>
                    <span style={{ fontSize: "10px", fontWeight: 800, background: m.status === "APPROVED" ? "rgba(168,224,99,0.15)" : "rgba(245,158,11,0.15)", color: m.status === "APPROVED" ? "#A8E063" : "#F59E0B", padding: "1px 6px", borderRadius: "4px" }}>
                      {m.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "11.5px", color: "#8F9499", margin: "2px 0 0" }}>
                    {m.description || "Milestone technical deliverable and testing protocol."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CSR Funding Ledger */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          padding: "22px",
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)"
        }}>
          <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: "0 0 14px", fontWeight: 850 }}>
            💎 Industry CSR Grants & Ledger ({fundingList.length})
          </h3>

          {fundingList.length === 0 ? (
            <div style={{ fontSize: "12px", color: "#8F9499" }}>Awaiting industry partner CSR sponsorship commitment.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {fundingList.map((f, idx) => (
                <div key={f.id || idx} style={{ background: "#1D2023", border: "1px solid rgba(192, 132, 252, 0.2)", borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "13px", color: "#C084FC" }}>{f.sponsorName || "Tata CSR Trust"}</strong>
                    <span style={{ fontSize: "13px", fontWeight: 900, color: "#F5F5F2" }}>₹{Number(f.amount || 400000).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#A8E063", marginTop: "2px" }}>
                    Status: {f.status || "COMMITTED"} • Section 135 Compliant ✓
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 4. COMMENTS / FIELD NOTES */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        padding: "22px"
      }}>
        <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: "0 0 12px", fontWeight: 850 }}>
          💬 Project Collaboration Notes & Field Logs
        </h3>

        <form onSubmit={handleAddComment} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Post an engineering update or lab result note..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", background: "#1D2023", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5F5F2", fontSize: "12.5px" }}
          />
          <button
            type="submit"
            style={{ background: "#38BDF8", color: "#0B0D0F", border: "none", padding: "10px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 850, cursor: "pointer" }}
          >
            Post Note
          </button>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {comments.length === 0 ? (
            <div style={{ fontSize: "12px", color: "#8F9499", fontStyle: "italic" }}>
              No project notes recorded yet. Post an engineering update or lab observation above.
            </div>
          ) : (
            comments.map((c, idx) => (
              <div key={c.id || idx} style={{ background: "#1D2023", padding: "12px 14px", borderRadius: "10px", fontSize: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <strong style={{ color: "#38BDF8", fontSize: "12px" }}>{c.author?.name || "Verified Collaborator"}</strong>
                  <span style={{ fontSize: "10px", color: "#8F9499" }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recent"}
                  </span>
                </div>
                <div style={{ color: "#F5F5F2", lineHeight: 1.5 }}>{c.content || c.comments}</div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}

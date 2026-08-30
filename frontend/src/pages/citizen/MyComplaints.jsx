import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import complaintService from "../../services/complaintService";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await complaintService.getMine(0, 500);
      const rawList = Array.isArray(data)
        ? data
        : data?.content
        ? data.content
        : data?.data?.content
        ? data.data.content
        : data?.data
        ? data.data
        : [];
      setComplaints(rawList);
    } catch (err) {
      console.error("Error loading submissions:", err);
      setError("Failed to load your submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const totalSubmissions = complaints.length;
  const pendingVerification = complaints.filter((c) => ["SUBMITTED", "UNDER_REVIEW", "CLARIFICATION_REQUIRED"].includes(c.status)).length;
  const activeRd = complaints.filter((c) => ["APPROVED", "ASSIGNED", "IN_PROGRESS", "PROTOTYPE", "TESTING", "PILOT"].includes(c.status)).length;
  const resolvedDeployed = complaints.filter((c) => ["RESOLVED", "COMPLETED", "CLOSED"].includes(c.status)).length;

  const categoriesList = useMemo(() => {
    const set = new Set();
    complaints.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [complaints]);

  const stagesList = ["Reported", "Verified", "Assigned", "Project Active", "R&D Prototype", "Impact"];

  const getStageIndex = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "SUBMITTED") return 0;
    if (["UNDER_REVIEW", "CLARIFICATION_REQUIRED"].includes(s)) return 1;
    if (["APPROVED", "ASSIGNED"].includes(s)) return 2;
    if (["IN_PROGRESS", "PROJECT_CREATED"].includes(s)) return 3;
    if (["PROTOTYPE", "TESTING", "PILOT"].includes(s)) return 4;
    if (["RESOLVED", "COMPLETED", "CLOSED"].includes(s)) return 5;
    return 0;
  };

  const filtered = useMemo(() => {
    return complaints
      .filter((c) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = (c.title || "").toLowerCase().includes(q);
          const matchDesc = (c.description || "").toLowerCase().includes(q);
          const matchLoc = (c.district || "").toLowerCase().includes(q) || (c.address || "").toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc) return false;
        }

        if (statusFilter !== "ALL") {
          if (statusFilter === "PENDING" && !["SUBMITTED", "UNDER_REVIEW", "CLARIFICATION_REQUIRED"].includes(c.status)) return false;
          if (statusFilter === "ACTIVE" && !["APPROVED", "ASSIGNED", "IN_PROGRESS", "PROTOTYPE", "TESTING", "PILOT"].includes(c.status)) return false;
          if (statusFilter === "RESOLVED" && !["RESOLVED", "COMPLETED", "CLOSED"].includes(c.status)) return false;
        }

        if (priorityFilter !== "ALL" && c.priority !== priorityFilter) return false;
        if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return (
            (new Date(b.createdAt || 0).getTime() || 0) -
            (new Date(a.createdAt || 0).getTime() || 0) ||
            (b.id - a.id)
          );
        }
        if (sortBy === "OLDEST") {
          return (
            (new Date(a.createdAt || 0).getTime() || 0) -
            (new Date(b.createdAt || 0).getTime() || 0) ||
            (a.id - b.id)
          );
        }
        if (sortBy === "PRIORITY") {
          const rank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (rank[b.priority] || 0) - (rank[a.priority] || 0) || (b.id - a.id);
        }
        return (b.id - a.id);
      });
  }, [complaints, search, statusFilter, priorityFilter, categoryFilter, sortBy]);

  return (
    <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
      
      {/* 1. TOP HERO */}
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
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            CIVIC PIPELINE ARCHIVE
          </span>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
            My Civic Submissions
          </h1>
          <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
            Track every reported challenge from submission to verified community impact.
          </p>
        </div>

        <Link
          to="/citizen/report"
          style={{
            background: "#FFD21F",
            color: "#0B0D0F",
            fontSize: "13px",
            padding: "10px 22px",
            borderRadius: "10px",
            fontWeight: 900,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 0 16px rgba(255, 210, 31, 0.3)"
          }}
        >
          + REPORT NEW CHALLENGE
        </Link>
      </section>

      {/* 2. SUMMARY METRICS */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>TOTAL SUBMISSIONS</span>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#F5F5F2", marginTop: "2px" }}>{totalSubmissions}</div>
          <span style={{ fontSize: "10px", color: "#FFD21F" }}>All logged challenges</span>
        </div>

        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>PENDING VERIFICATION</span>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#FFD21F", marginTop: "2px" }}>{pendingVerification}</div>
          <span style={{ fontSize: "10px", color: "#8F9499" }}>Admin review queue</span>
        </div>

        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>IN ACTIVE R&D</span>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#F5F5F2", marginTop: "2px" }}>{activeRd}</div>
          <span style={{ fontSize: "10px", color: "#FFD21F" }}>University lab solving</span>
        </div>

        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "16px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>RESOLVED / DEPLOYED</span>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#A8E063", marginTop: "2px" }}>{resolvedDeployed}</div>
          <span style={{ fontSize: "10px", color: "#A8E063" }}>Community impact verified</span>
        </div>
      </section>

      {/* 3. PREMIUM CONTROL BAR */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        alignItems: "center"
      }}>
        {/* Search */}
        <div style={{ flex: "1 1 240px", position: "relative" }}>
          <input
            type="text"
            placeholder="Search by title, location, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "#1D2023",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#F5F5F2",
              fontSize: "12.5px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "#1D2023",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            color: "#F5F5F2",
            fontSize: "12.5px",
            outline: "none"
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Verification</option>
          <option value="ACTIVE">Active in R&D</option>
          <option value="RESOLVED">Resolved / Deployed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "#1D2023",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            color: "#F5F5F2",
            fontSize: "12.5px",
            outline: "none"
          }}
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "#1D2023",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            color: "#F5F5F2",
            fontSize: "12.5px",
            outline: "none"
          }}
        >
          <option value="ALL">All Categories</option>
          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "#1D2023",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            color: "#F5F5F2",
            fontSize: "12.5px",
            outline: "none"
          }}
        >
          <option value="NEWEST">Newest First</option>
          <option value="OLDEST">Oldest First</option>
          <option value="PRIORITY">Highest Priority</option>
        </select>
      </section>

      {/* 4. COMPLAINT CARDS LIST */}
      {loading ? (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#8F9499" }}>
          Loading submissions archive...
        </div>
      ) : error ? (
        <div style={{ background: "rgba(255, 92, 92, 0.12)", color: "#FF5C5C", padding: "20px", borderRadius: "14px", textAlign: "center" }}>
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: "#17191C",
          border: "1px dashed rgba(255, 255, 255, 0.12)",
          borderRadius: "18px",
          padding: "60px 20px",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "42px", display: "block", marginBottom: "8px" }}>📋</span>
          <h3 style={{ fontSize: "16px", color: "#F5F5F2", margin: "0 0 6px", fontWeight: 800 }}>
            No Matching Submissions Found
          </h3>
          <p style={{ fontSize: "12px", color: "#8F9499", margin: "0 auto 16px", maxWidth: "360px" }}>
            Adjust your search filter or submit a new community problem to start the R&D cycle.
          </p>
          <Link
            to="/citizen/report"
            style={{
              background: "#FFD21F",
              color: "#0B0D0F",
              padding: "10px 22px",
              borderRadius: "8px",
              fontWeight: 800,
              textDecoration: "none",
              fontSize: "12px"
            }}
          >
            + Report New Challenge
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((c) => {
            const currentStageIdx = getStageIndex(c.status);
            const progressPercent = Math.round(((currentStageIdx + 1) / 6) * 100);

            return (
              <div
                key={c.id}
                style={{
                  background: "#17191C",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "18px",
                  padding: "22px 24px",
                  boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)",
                  transition: "all 0.18s ease"
                }}
              >
                {/* Top Meta Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10.5px", fontWeight: 800, background: "#1D2023", color: "#FFD21F", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(255,210,31,0.25)" }}>
                        {c.category}
                      </span>
                      {c.aiDetectedClass && c.aiDetectedClass !== "NO_SUPPORTED_DEFECT" && (
                        <span style={{ fontSize: "10.5px", fontWeight: 800, background: "rgba(56,189,248,0.12)", color: "#38BDF8", padding: "3px 8px", borderRadius: "6px", border: "1px solid rgba(56,189,248,0.3)" }}>
                          🤖 {c.aiDetectedClass.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())} ({c.aiConfidence ? `${c.aiConfidence}%` : "AI Verified"})
                        </span>
                      )}
                      {c.aiMismatch && (
                        <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(245,158,11,0.15)", color: "#F59E0B", padding: "2px 6px", borderRadius: "4px" }}>
                          ⚠️ Conflict Review
                        </span>
                      )}
                      <span style={{
                        fontSize: "10.5px",
                        fontWeight: 800,
                        color: c.priority === "CRITICAL" ? "#FF5C5C" : c.priority === "HIGH" ? "#FFD21F" : "#A8E063"
                      }}>
                        ● {c.priority} PRIORITY
                      </span>
                      <span style={{ fontSize: "10.5px", color: "#8F9499", background: "#1D2023", padding: "3px 8px", borderRadius: "6px" }}>
                        ID #{c.id}
                      </span>
                    </div>

                    <h2 style={{ fontSize: "17px", fontWeight: 850, color: "#F5F5F2", margin: "2px 0 6px" }}>
                      {c.title}
                    </h2>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 850,
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: ["RESOLVED", "COMPLETED"].includes(c.status) ? "rgba(168, 224, 99, 0.15)" : ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(c.status) ? "rgba(255, 210, 31, 0.15)" : "#1D2023",
                      color: ["RESOLVED", "COMPLETED"].includes(c.status) ? "#A8E063" : ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(c.status) ? "#FFD21F" : "#8F9499",
                      border: "1px solid rgba(255, 255, 255, 0.08)"
                    }}>
                      {c.status}
                    </span>
                    <div style={{ fontSize: "10px", color: "#8F9499", marginTop: "4px" }}>
                      Stage {currentStageIdx + 1} of 6 ({progressPercent}%)
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: "12.5px", color: "#8F9499", margin: "0 0 16px", lineHeight: 1.45 }}>
                  {c.description}
                </p>

                {/* 6-Stage Lifecycle Horizontal Stepper */}
                <div style={{
                  background: "#1D2023",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  marginBottom: "16px"
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
                    {stagesList.map((stageName, idx) => {
                      const isDone = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <div key={stageName} style={{ textAlign: "center" }}>
                          <div style={{
                            height: "4px",
                            background: isDone ? "#A8E063" : isCurrent ? "#FFD21F" : "rgba(255, 255, 255, 0.08)",
                            borderRadius: "999px",
                            marginBottom: "4px",
                            boxShadow: isCurrent ? "0 0 10px #FFD21F" : "none"
                          }} />
                          <span style={{
                            fontSize: "9px",
                            fontWeight: isCurrent ? 850 : 600,
                            color: isCurrent ? "#FFD21F" : isDone ? "#A8E063" : "#8F9499",
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {isDone ? "✓ " : ""}{stageName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Metadata & Actions */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  paddingTop: "12px",
                  fontSize: "11.5px",
                  color: "#8F9499"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                    <span>📍 {c.district || (c.address ? c.address.split(",")[0] : "Local Ward")}, {c.state || "India"}</span>
                    <span>👥 {c.affectedPopulation || c.affectedPeople ? `${c.affectedPopulation || c.affectedPeople} Citizens` : "Community"}</span>
                    {(c.assignedUniversityName || c.assignedUniversity?.name) && (
                      <span style={{ color: "#FFD21F", fontWeight: 750 }}>
                        🏛️ {c.assignedUniversityName || c.assignedUniversity?.name}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                      to="/citizen/map"
                      style={{
                        background: "#1D2023",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#F5F5F2",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 750,
                        textDecoration: "none"
                      }}
                    >
                      🗺️ Map Pin
                    </Link>

                    <Link
                      to={`/citizen/complaints/${c.id}`}
                      style={{
                        background: "#FFD21F",
                        color: "#0B0D0F",
                        padding: "6px 16px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 900,
                        textDecoration: "none",
                        boxShadow: "0 0 10px rgba(255, 210, 31, 0.25)"
                      }}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

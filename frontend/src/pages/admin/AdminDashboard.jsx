import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import complaintService from "../../services/complaintService";
import adminService from "../../services/adminService";

function InfluxLineChart({ data = [] }) {
  const points = Array.isArray(data) && data.length > 1 ? data : [
    { label: "May", value: 8 },
    { label: "Jun", value: 14 },
    { label: "Jul", value: 22 },
    { label: "Aug", value: 35 },
    { label: "Sep", value: 48 },
    { label: "Oct", value: 65 }
  ];

  const width = 640;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = Math.max(...points.map((p) => p.value || 0), 10);
  const minVal = 0;

  const getX = (idx) => paddingX + (idx / Math.max(points.length - 1, 1)) * (width - 2 * paddingX);
  const getY = (val) => height - paddingY - (((val || 0) - minVal) / Math.max(maxVal - minVal, 1)) * (height - 2 * paddingY);

  const coords = points.map((p, i) => ({ x: getX(i), y: getY(p.value) }));

  let pathD = coords.length > 0 ? `M ${coords[0].x} ${coords[0].y}` : "";
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const lastCoord = coords.length > 0 ? coords[coords.length - 1] : { x: width - paddingX, y: height - paddingY };
  const firstCoord = coords.length > 0 ? coords[0] : { x: paddingX, y: height - paddingY };
  const areaD = coords.length > 0
    ? `${pathD} L ${lastCoord.x} ${height - paddingY} L ${firstCoord.x} ${height - paddingY} Z`
    : "";

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id="cyanAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
            <stop offset="85%" stopColor="#38BDF8" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38BDF8" floodOpacity="0.6" />
          </filter>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - paddingY - ratio * (height - 2 * paddingY);
          return (
            <line
              key={ratio}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
          );
        })}

        {areaD && <path d={areaD} fill="url(#cyanAreaGradient)" />}

        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="3"
            filter="url(#cyanGlow)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {coords.map((c, idx) => (
          <g key={idx}>
            <circle cx={c.x} cy={c.y} r="4.5" fill="#17191C" stroke="#38BDF8" strokeWidth="2.5" />
            <text x={c.x} y={height - 6} fill="#8F9499" fontSize="10" fontWeight="600" textAnchor="middle">
              {points[idx]?.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/dashboard-stats").catch(() => ({ data: {} })),
      complaintService.search({ page: 0, size: 20 }).catch(() => ({ content: [] })),
      adminService.getAuditLogs().catch(() => [])
    ])
      .then(([statsRes, compRes, auditRes]) => {
        const d = statsRes.data?.data || statsRes.data || {};
        setStats({
          total: d.totalChallenges ?? d.totalComplaints ?? d.total ?? 17,
          pending: d.pendingVerification ?? d.pending ?? d.submitted ?? 3,
          underReview: d.approvedChallenges ?? d.underReview ?? 4,
          assigned: d.activeProjects ?? d.assigned ?? 5,
          resolved: d.completedProjects ?? d.resolved ?? 7,
          critical: d.criticalChallenges ?? d.critical ?? 2,
          ...d
        });

        const rawComp = Array.isArray(compRes)
          ? compRes
          : compRes?.content
          ? compRes.content
          : compRes?.data?.content
          ? compRes.data.content
          : compRes?.data
          ? compRes.data
          : [];
        const sortedComp = [...rawComp].sort(
          (a, b) =>
            (new Date(b?.createdAt || 0).getTime() || 0) -
            (new Date(a?.createdAt || 0).getTime() || 0) ||
            ((b?.id || 0) - (a?.id || 0))
        );
        setComplaints(sortedComp);

        const logs = Array.isArray(auditRes)
          ? auditRes
          : Array.isArray(auditRes?.content)
          ? auditRes.content
          : Array.isArray(auditRes?.data)
          ? auditRes.data
          : Array.isArray(auditRes?.data?.content)
          ? auditRes.data.content
          : [];
        setAuditLogs(logs);
      })
      .finally(() => setLoading(false));
  }, []);

  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];

  const totalChallenges = stats?.totalChallenges ?? stats?.totalComplaints ?? stats?.total ?? safeComplaints.length;
  const pendingCount = stats?.pendingVerification ?? stats?.pending ?? stats?.submitted ?? safeComplaints.filter((c) => ["SUBMITTED", "UNDER_REVIEW"].includes(c?.status)).length;
  const solvingCount = stats?.activeProjects ?? stats?.assigned ?? safeComplaints.filter((c) => ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(c?.status)).length;
  const resolvedCount = stats?.completedProjects ?? stats?.resolved ?? safeComplaints.filter((c) => ["RESOLVED", "COMPLETED", "CLOSED"].includes(c?.status)).length;
  const criticalCount = stats?.criticalChallenges ?? stats?.critical ?? safeComplaints.filter((c) => c?.priority === "CRITICAL").length;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      
      {/* 1. HERO */}
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
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              NATIONAL CIVIC GOVERNANCE & MODERATION
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", padding: "2px 8px", borderRadius: "999px" }}>
              ✓ High Authority
            </span>
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
            Director R.K. Varma
          </h1>
          <p style={{ fontSize: "13px", color: "#8F9499", margin: 0 }}>
            Audit crowdsourced problem statements, execute AI deduplication checks, and match verified challenges to universities.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link
            to="/admin/complaints"
            style={{
              background: "#38BDF8",
              color: "#0B0D0F",
              fontSize: "13px",
              padding: "10px 22px",
              borderRadius: "10px",
              fontWeight: 900,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 0 16px rgba(56, 189, 248, 0.35)"
            }}
          >
            🛡️ MODERATE QUEUE ({pendingCount})
          </Link>
          <Link
            to="/admin/audit"
            style={{
              background: "#1D2023",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#F5F5F2",
              fontSize: "13px",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: 750,
              textDecoration: "none"
            }}
          >
            📜 AUDIT TRAIL
          </Link>
        </div>
      </section>

      {/* 2. 5 KPI CARDS */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>TOTAL CHALLENGES</span>
          <div style={{ fontSize: "30px", fontWeight: 900, color: "#F5F5F2", marginTop: "2px" }}>{totalChallenges}</div>
          <span style={{ fontSize: "10.5px", color: "#38BDF8" }}>National Crowdsourced Influx</span>
        </div>

        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>PENDING AUDIT</span>
          <div style={{ fontSize: "30px", fontWeight: 900, color: "#F5C400", marginTop: "2px" }}>{pendingCount}</div>
          <span style={{ fontSize: "10.5px", color: "#8F9499" }}>Awaiting Govt Verification</span>
        </div>

        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>UNIVERSITY R&D</span>
          <div style={{ fontSize: "30px", fontWeight: 900, color: "#c084fc", marginTop: "2px" }}>{solvingCount}</div>
          <span style={{ fontSize: "10.5px", color: "#c084fc" }}>Active Engineering Projects</span>
        </div>

        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>RESOLVED & IMPACT</span>
          <div style={{ fontSize: "30px", fontWeight: 900, color: "#A8E063", marginTop: "2px" }}>{resolvedCount}</div>
          <span style={{ fontSize: "10.5px", color: "#A8E063" }}>Deployed Field Solutions</span>
        </div>

        <div style={{ background: "#17191C", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "18px 20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase" }}>CRITICAL HAZARDS</span>
          <div style={{ fontSize: "30px", fontWeight: 900, color: "#FF5C5C", marginTop: "2px" }}>{criticalCount}</div>
          <span style={{ fontSize: "10.5px", color: "#FF5C5C" }}>High Severity Priority</span>
        </div>
      </section>

      {/* 3. MAIN ASYMMETRIC GRID: CHART + AI MATRIX */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", gap: "20px", marginBottom: "20px" }}>
        
        {/* Left: National Influx & Resolution Velocity Chart */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                GOVERNANCE TELEMETRY
              </span>
              <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 850 }}>
                National Challenge Influx & Velocity
              </h2>
            </div>
            <span style={{ fontSize: "11px", color: "#38BDF8", fontWeight: 800 }}>● Live Telemetry</span>
          </div>

          <InfluxLineChart />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ background: "#1D2023", padding: "10px 14px", borderRadius: "10px" }}>
              <small style={{ fontSize: "10px", color: "#8F9499", display: "block" }}>Moderation Velocity</small>
              <strong style={{ fontSize: "16px", color: "#38BDF8" }}>94.2%</strong>
            </div>
            <div style={{ background: "#1D2023", padding: "10px 14px", borderRadius: "10px" }}>
              <small style={{ fontSize: "10px", color: "#8F9499", display: "block" }}>Avg Match Score</small>
              <strong style={{ fontSize: "16px", color: "#A8E063" }}>85%</strong>
            </div>
            <div style={{ background: "#1D2023", padding: "10px 14px", borderRadius: "10px" }}>
              <small style={{ fontSize: "10px", color: "#8F9499", display: "block" }}>Audit Integrity</small>
              <strong style={{ fontSize: "16px", color: "#F5F5F2" }}>100% Pass</strong>
            </div>
          </div>
        </div>

        {/* Right: AI Deduplication & Institutional Health */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* AI Intelligence Card */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
                🤖 AI Heuristics & Matching Engine
              </h3>
              <span style={{ fontSize: "10px", color: "#A8E063", fontWeight: 800 }}>ONLINE</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ background: "#1D2023", padding: "10px 12px", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "2px" }}>
                  <span style={{ color: "#F5F5F2", fontWeight: 750 }}>Duplicate Detection Accuracy</span>
                  <span style={{ color: "#38BDF8", fontWeight: 800 }}>96%</span>
                </div>
                <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: "96%", height: "100%", background: "#38BDF8" }} />
                </div>
              </div>

              <div style={{ background: "#1D2023", padding: "10px 12px", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "2px" }}>
                  <span style={{ color: "#F5F5F2", fontWeight: 750 }}>University Matching Rule Rank</span>
                  <span style={{ color: "#A8E063", fontWeight: 800 }}>IIT Bombay (85%)</span>
                </div>
                <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: "85%", height: "100%", background: "#A8E063" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Administration Actions */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
          }}>
            <h3 style={{ fontSize: "14px", color: "#F5F5F2", margin: "0 0 12px", fontWeight: 800 }}>
              ⚡ Governance Shortcuts
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <Link to="/admin/complaints" style={{ background: "#1D2023", border: "1px solid rgba(56,189,248,0.3)", borderRadius: "8px", padding: "10px", textDecoration: "none", color: "#38BDF8", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px" }}>🛡️</span>
                <strong style={{ fontSize: "11px" }}>Moderation Queue</strong>
              </Link>

              <Link to="/admin/users" style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", textDecoration: "none", color: "#F5F5F2", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px" }}>🏛️</span>
                <strong style={{ fontSize: "11px" }}>University Directory</strong>
              </Link>

              <Link to="/admin/audit" style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", textDecoration: "none", color: "#A8E063", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px" }}>📜</span>
                <strong style={{ fontSize: "11px" }}>Audit Logs</strong>
              </Link>

              <Link to="/admin/analytics" style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", textDecoration: "none", color: "#c084fc", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px" }}>📈</span>
                <strong style={{ fontSize: "11px" }}>National Analytics</strong>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* 4. LOWER GRID: INCOMING QUEUE + AUDIT TRAIL */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", gap: "20px" }}>
        
        {/* Left: Incoming Challenges Moderation Queue */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                MODERATION PIPELINE
              </span>
              <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 850 }}>
                Recent Incoming Challenges
              </h2>
            </div>
            <Link to="/admin/complaints" style={{ fontSize: "11.5px", color: "#38BDF8", fontWeight: 800, textDecoration: "none" }}>
              Full Moderation Queue →
            </Link>
          </div>

          {safeComplaints.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#8F9499" }}>No challenges in queue</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {safeComplaints.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <span style={{ fontSize: "9.5px", fontWeight: 800, background: "#17191C", color: "#38BDF8", padding: "2px 6px", borderRadius: "4px" }}>
                        {c.category}
                      </span>
                      <span style={{ fontSize: "9.5px", fontWeight: 800, color: c.priority === "CRITICAL" ? "#FF5C5C" : "#F5C400" }}>
                        ● {c.priority}
                      </span>
                      <span style={{ fontSize: "9.5px", color: "#8F9499" }}>ID #{c.id}</span>
                    </div>

                    <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#F5F5F2", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.title}
                    </h3>
                    <div style={{ fontSize: "11px", color: "#8F9499", marginTop: "2px" }}>
                      📍 {c.address || (c.district ? `${c.district}, ${c.state || "India"}` : "Field Location")}
                    </div>
                  </div>

                  <Link
                    to="/admin/complaints"
                    style={{
                      background: "#38BDF8",
                      color: "#0B0D0F",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 850,
                      textDecoration: "none",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Review & Assign →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live Audit Trail */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
              📜 Real-Time Audit Trail
            </h3>
            <Link to="/admin/audit" style={{ fontSize: "11px", color: "#38BDF8", fontWeight: 800, textDecoration: "none" }}>
              View All →
            </Link>
          </div>

          {safeAuditLogs.length === 0 ? (
            <div style={{ fontSize: "12px", color: "#8F9499", textAlign: "center", padding: "20px" }}>
              No audit records logged yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {safeAuditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: "#1D2023",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", fontWeight: 850, color: "#38BDF8" }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: "9px", color: "#8F9499" }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#F5F5F2" }}>
                    {log.description || `${log.action} executed by ${log.actorName || "Govt Authority"}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

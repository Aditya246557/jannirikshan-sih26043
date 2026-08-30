import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import complaintService from "../../services/complaintService";
import notificationService from "../../services/notificationService";
import impactService from "../../services/impactService";
import ComplaintMap from "../../components/map/ComplaintMap";

// ============================================================
// 1. DOMINANT MAIN ACTIVITY LINE/AREA CHART (PURE SVG)
// ============================================================
function ActivityLineChart({ data = [] }) {
  const points = data.length > 0 ? data : [
    { label: "May", value: 3 },
    { label: "Jun", value: 5 },
    { label: "Jul", value: 8 },
    { label: "Aug", value: 11 },
    { label: "Sep", value: 14 },
    { label: "Oct", value: 18 }
  ];

  const width = 640;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = Math.max(...points.map((p) => p.value), 10);
  const minVal = 0;

  const getX = (idx) => paddingX + (idx / (points.length - 1)) * (width - 2 * paddingX);
  const getY = (val) => height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);

  const coords = points.map((p, i) => ({ x: getX(i), y: getY(p.value) }));

  // Create smooth bezier curve path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id="yellowAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD21F" stopOpacity="0.28" />
            <stop offset="85%" stopColor="#FFD21F" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#FFD21F" stopOpacity="0" />
          </linearGradient>
          <filter id="yellowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FFD21F" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Minimal Grid Lines */}
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

        {/* Area Fill */}
        <path d={areaD} fill="url(#yellowAreaGradient)" />

        {/* Primary Glowing Yellow Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="#FFD21F"
          strokeWidth="3"
          filter="url(#yellowGlow)"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Data Dots & Labels */}
        {coords.map((c, idx) => (
          <g key={idx}>
            <circle cx={c.x} cy={c.y} r="4.5" fill="#17191C" stroke="#FFD21F" strokeWidth="2.5" />
            <text x={c.x} y={height - 6} fill="#8F9499" fontSize="10" fontWeight="600" textAnchor="middle">
              {points[idx].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ============================================================
// 2. SECONDARY BAR CHART: CHALLENGE DOMAINS (PURE SVG)
// ============================================================
function DomainBarChart({ categories = {} }) {
  const entries = Object.entries(categories);
  const items = entries.length > 0 ? entries : [
    ["Water Management", 6],
    ["Agriculture", 4],
    ["Clean Energy", 2],
    ["Public Health", 1]
  ];

  const maxVal = Math.max(...items.map((i) => i[1]), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      {items.slice(0, 4).map(([name, count]) => {
        const pct = Math.round((count / maxVal) * 100);
        return (
          <div key={name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
              <span style={{ color: "#F5F5F2", fontWeight: 700 }}>{name}</span>
              <span style={{ color: "#FFD21F", fontWeight: 800 }}>{count}</span>
            </div>
            <div style={{ height: "7px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "999px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #FFD21F 0%, #F5C400 100%)",
                  borderRadius: "999px",
                  boxShadow: "0 0 10px rgba(255, 210, 31, 0.3)"
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// 3. RESOLUTION STATUS DONUT CHART
// ============================================================
function ResolutionDonut({ data = [], total = 0 }) {
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div style={{ width: size, height: size, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {total === 0 ? (
          <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
        ) : (
          data.map((slice, idx) => {
            const percent = slice.value / total;
            const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
            const strokeDashoffset = -circumference * accumulatedPercent;
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })
        )}
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontSize: "20px", fontWeight: 900, color: "#FFD21F", lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: "8.5px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginTop: "2px" }}>TOTAL</div>
      </div>
    </div>
  );
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      complaintService.getMine(0, 50),
      notificationService.getMyNotifications(0, 6).catch(() => ({ content: [] })),
      impactService.getSummary().catch(() => null)
    ])
      .then(([compRes, notifRes, impactRes]) => {
        if (!isMounted) return;
        const rawList = Array.isArray(compRes)
          ? compRes
          : compRes?.content
          ? compRes.content
          : compRes?.data?.content
          ? compRes.data.content
          : compRes?.data
          ? compRes.data
          : [];
        const sortedList = [...rawList].sort(
          (a, b) =>
            (new Date(b.createdAt || 0).getTime() || 0) -
            (new Date(a.createdAt || 0).getTime() || 0) ||
            (b.id - a.id)
        );
        setComplaints(sortedList);
        setNotifications(notifRes?.content || notifRes?.data || notifRes || []);
        if (impactRes) setImpact(impactRes);
      })
      .catch((err) => console.error("Citizen dashboard fetch error:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute real metrics from loaded complaints
  const totalReported = complaints.length;
  const underReview = complaints.filter((c) => ["SUBMITTED", "UNDER_REVIEW"].includes(c.status)).length;
  const solving = complaints.filter((c) => ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE", "TESTING", "PILOT"].includes(c.status)).length;
  const resolved = complaints.filter((c) => ["RESOLVED", "COMPLETED", "CLOSED"].includes(c.status)).length;

  const resolutionRate = totalReported > 0 ? Math.round((resolved / totalReported) * 100) : 0;

  // Severity metrics
  const criticalCount = complaints.filter((c) => c.priority === "CRITICAL").length;
  const highCount = complaints.filter((c) => c.priority === "HIGH").length;
  const mediumCount = complaints.filter((c) => c.priority === "MEDIUM").length;
  const lowCount = complaints.filter((c) => c.priority === "LOW").length;

  // Category counts
  const categoryCounts = {};
  complaints.forEach((c) => {
    const cat = c.category || "General Civic";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "PENDING") return ["SUBMITTED", "UNDER_REVIEW"].includes(c.status);
    if (activeFilter === "ACTIVE") return ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE", "TESTING", "PILOT"].includes(c.status);
    if (activeFilter === "RESOLVED") return ["RESOLVED", "COMPLETED", "CLOSED"].includes(c.status);
    return true;
  });

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

  const stagesList = ["Reported", "Verified", "Assigned", "Project Active", "Prototype", "Impact"];

  const mapComplaints = complaints.filter((c) => c.latitude && c.longitude);
  const defaultCenter = mapComplaints.length > 0 ? [mapComplaints[0].latitude, mapComplaints[0].longitude] : [25.3176, 82.9739];

  // Donut slices with exact data integrity
  const donutSlices = [
    { label: "Reported", value: complaints.filter((c) => c.status === "SUBMITTED").length, color: "#8F9499" },
    { label: "Under Review", value: underReview, color: "#F5C400" },
    { label: "University Solving", value: solving, color: "#FFD21F" },
    { label: "Resolved & Deployed", value: resolved, color: "#A8E063" }
  ].filter((s) => s.value > 0);

  return (
    <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
      
      {/* ==========================================
          1. COMPACT DARK COMMAND HEADER
         ========================================== */}
      <section style={{
        background: "#17191C",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "18px",
        padding: "22px 28px",
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
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              CITIZEN COMMAND CENTER
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(168, 224, 99, 0.15)", color: "#A8E063", padding: "2px 8px", borderRadius: "999px" }}>
              ✓ Verified Citizen
            </span>
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#F5F5F2", margin: "2px 0 4px", letterSpacing: "-0.02em" }}>
            Good morning, {user?.name || "Rahul Sharma"}
          </h1>
          <p style={{ fontSize: "13px", color: "#8F9499", margin: 0, lineHeight: 1.4 }}>
            Your reports are helping communities identify and solve real-world challenges through university innovation.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
            + REPORT CHALLENGE
          </Link>
          <Link
            to="/citizen/map"
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
            VIEW COMMUNITY MAP
          </Link>
        </div>
      </section>

      {/* ==========================================
          2. FOUR COMPACT DARK KPI CARDS
         ========================================== */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        
        {/* Total Reported */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "18px 20px",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              TOTAL REPORTED
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(255, 210, 31, 0.15)", color: "#FFD21F", padding: "2px 6px", borderRadius: "999px" }}>
              ↑ Active
            </span>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 900, color: "#F5F5F2", lineHeight: 1.1 }}>{totalReported}</div>
          <div style={{ fontSize: "11px", color: "#8F9499", marginTop: "4px" }}>Logged with GPS & evidence</div>
        </div>

        {/* Under Review */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "18px 20px",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              UNDER REVIEW
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(245, 196, 0, 0.15)", color: "#F5C400", padding: "2px 6px", borderRadius: "999px" }}>
              ⏳ In Queue
            </span>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 900, color: "#FFD21F", lineHeight: 1.1 }}>{underReview}</div>
          <div style={{ fontSize: "11px", color: "#8F9499", marginTop: "4px" }}>Field audit & AI matching</div>
        </div>

        {/* University Solving */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "18px 20px",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              UNIVERSITY SOLVING
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(255, 210, 31, 0.15)", color: "#FFD21F", padding: "2px 6px", borderRadius: "999px" }}>
              🔬 Lab R&D
            </span>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 900, color: "#F5F5F2", lineHeight: 1.1 }}>{solving}</div>
          <div style={{ fontSize: "11px", color: "#8F9499", marginTop: "4px" }}>Active engineering at IITs/NITs</div>
        </div>

        {/* Resolved / Deployed */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "18px 20px",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              RESOLVED / DEPLOYED
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(168, 224, 99, 0.15)", color: "#A8E063", padding: "2px 6px", borderRadius: "999px" }}>
              🏆 Deployed
            </span>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 900, color: "#A8E063", lineHeight: 1.1 }}>{resolved}</div>
          <div style={{ fontSize: "11px", color: "#8F9499", marginTop: "4px" }}>Delivered community impact</div>
        </div>

      </section>

      {/* ==========================================
          3. MAIN ASYMMETRIC GRID: DOMINANT CHART + SIDE WIDGETS
         ========================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", gap: "20px", marginBottom: "20px" }}>
        
        {/* Dominant Visualization: Community Challenge Activity Curve */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                CORE TELEMETRY
              </span>
              <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 850 }}>
                Community Challenge Activity
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FFD21F", boxShadow: "0 0 8px #FFD21F" }} />
              <span style={{ fontSize: "11px", color: "#8F9499", fontWeight: 700 }}>Active Trend</span>
            </div>
          </div>

          <ActivityLineChart />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ background: "#1D2023", padding: "10px 14px", borderRadius: "10px" }}>
              <small style={{ fontSize: "10px", color: "#8F9499", display: "block" }}>Resolution Rate</small>
              <strong style={{ fontSize: "16px", color: "#A8E063" }}>{resolutionRate}%</strong>
            </div>
            <div style={{ background: "#1D2023", padding: "10px 14px", borderRadius: "10px" }}>
              <small style={{ fontSize: "10px", color: "#8F9499", display: "block" }}>Avg R&D Velocity</small>
              <strong style={{ fontSize: "16px", color: "#FFD21F" }}>4.2 wks</strong>
            </div>
            <div style={{ background: "#1D2023", padding: "10px 14px", borderRadius: "10px" }}>
              <small style={{ fontSize: "10px", color: "#8F9499", display: "block" }}>Active Labs</small>
              <strong style={{ fontSize: "16px", color: "#F5F5F2" }}>{solving > 0 ? solving : 1} Cells</strong>
            </div>
          </div>
        </div>

        {/* Secondary Stack: Domain Bar Chart + Status & Priority Widgets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Domain Breakdown */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
                Challenge Domains
              </h3>
              <span style={{ fontSize: "10px", color: "#FFD21F", fontWeight: 800 }}>Breakdown</span>
            </div>

            <DomainBarChart categories={categoryCounts} />
          </div>

          {/* Resolution Status Donut + Priority Matrix in 2-Col */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            
            {/* Status Donut */}
            <div style={{
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "16px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "8px" }}>
                Resolution Status
              </div>
              <ResolutionDonut data={donutSlices} total={totalReported} />
            </div>

            {/* Priority Matrix */}
            <div style={{
              background: "#17191C",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "16px"
            }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", marginBottom: "10px" }}>
                Priority Matrix
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", background: "#1D2023", padding: "4px 8px", borderRadius: "6px" }}>
                  <span style={{ color: "#FF5C5C", fontWeight: 800 }}>● Critical</span>
                  <strong style={{ color: "#F5F5F2" }}>{criticalCount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", background: "#1D2023", padding: "4px 8px", borderRadius: "6px" }}>
                  <span style={{ color: "#FFD21F", fontWeight: 800 }}>● High</span>
                  <strong style={{ color: "#F5F5F2" }}>{highCount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", background: "#1D2023", padding: "4px 8px", borderRadius: "6px" }}>
                  <span style={{ color: "#F5C400", fontWeight: 800 }}>● Medium</span>
                  <strong style={{ color: "#F5F5F2" }}>{mediumCount}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", background: "#1D2023", padding: "4px 8px", borderRadius: "6px" }}>
                  <span style={{ color: "#A8E063", fontWeight: 800 }}>● Low</span>
                  <strong style={{ color: "#F5F5F2" }}>{lowCount}</strong>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          4. LOWER ASYMMETRIC GRID: TABLE + MAP & CIVIC PULSE
         ========================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", gap: "20px" }}>
        
        {/* Left: My Reported Challenges Table */}
        <div style={{
          background: "#17191C",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
            <div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                PIPELINE TRACKER
              </span>
              <h2 style={{ fontSize: "18px", color: "#F5F5F2", margin: "2px 0 0", fontWeight: 850 }}>
                My Reported Challenges
              </h2>
            </div>

            {/* Filter Pills */}
            <div style={{ display: "flex", background: "#1D2023", padding: "3px", borderRadius: "8px", gap: "3px" }}>
              {[
                { key: "ALL", label: "All" },
                { key: "PENDING", label: `Pending (${underReview})` },
                { key: "ACTIVE", label: `Active (${solving})` },
                { key: "RESOLVED", label: `Deployed (${resolved})` }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  style={{
                    background: activeFilter === tab.key ? "#FFD21F" : "transparent",
                    color: activeFilter === tab.key ? "#0B0D0F" : "#8F9499",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: activeFilter === tab.key ? 900 : 600,
                    cursor: "pointer"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List or Empty State */}
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#8F9499" }}>Loading reported challenges...</div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", background: "#1D2023", borderRadius: "14px", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "6px" }}>🌱</span>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#F5F5F2" }}>No Challenges in this category</div>
              <p style={{ fontSize: "12px", color: "#8F9499", margin: "4px auto 14px", maxWidth: "340px" }}>
                Report a drinking water, road, or energy challenge to initiate university engineering sprints.
              </p>
              <Link to="/citizen/report" style={{ background: "#FFD21F", color: "#0B0D0F", padding: "8px 18px", borderRadius: "8px", textDecoration: "none", fontSize: "12px", fontWeight: 800 }}>
                + Report Challenge Now
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredComplaints.slice(0, 5).map((c) => {
                const currentStageIdx = getStageIndex(c.status);

                return (
                  <div
                    key={c.id}
                    style={{
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      padding: "16px 18px",
                      background: "#1D2023",
                      transition: "all 0.16s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 800, background: "#17191C", color: "#FFD21F", padding: "2px 8px", borderRadius: "4px", border: "1px solid rgba(255,210,31,0.3)" }}>
                            {c.category}
                          </span>
                          <span style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            color: c.priority === "CRITICAL" ? "#FF5C5C" : c.priority === "HIGH" ? "#FFD21F" : "#A8E063"
                          }}>
                            ● {c.priority} SEVERITY
                          </span>
                        </div>
                        <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: "2px 0 4px", fontWeight: 800 }}>
                          {c.title}
                        </h3>
                      </div>

                      <span style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: "999px",
                        background: ["RESOLVED", "COMPLETED"].includes(c.status) ? "rgba(168, 224, 99, 0.15)" : ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(c.status) ? "rgba(255, 210, 31, 0.15)" : "#17191C",
                        color: ["RESOLVED", "COMPLETED"].includes(c.status) ? "#A8E063" : ["ASSIGNED", "IN_PROGRESS", "PROTOTYPE"].includes(c.status) ? "#FFD21F" : "#8F9499",
                        border: "1px solid rgba(255,255,255,0.08)"
                      }}>
                        {c.status}
                      </span>
                    </div>

                    <p style={{ fontSize: "12px", color: "#8F9499", margin: "0 0 10px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {c.description}
                    </p>

                    {/* 6-Stage Progress Stepper */}
                    <div style={{ background: "#17191C", borderRadius: "8px", padding: "8px 10px", marginBottom: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px" }}>
                        {stagesList.map((stg, idx) => {
                          const isDone = idx <= currentStageIdx;
                          const isCurrent = idx === currentStageIdx;
                          return (
                            <div key={stg} style={{ textAlign: "center" }}>
                              <div style={{
                                height: "3.5px",
                                background: isDone ? (isCurrent ? "#FFD21F" : "#A8E063") : "rgba(255,255,255,0.1)",
                                borderRadius: "999px",
                                marginBottom: "2px",
                                boxShadow: isCurrent ? "0 0 8px #FFD21F" : "none"
                              }} />
                              <span style={{
                                fontSize: "8px",
                                fontWeight: isCurrent ? 800 : 600,
                                color: isCurrent ? "#FFD21F" : isDone ? "#A8E063" : "#8F9499",
                                display: "block",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}>
                                {isDone && !isCurrent ? "✓ " : ""}{stg}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#8F9499", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
                      <div>
                        <span>📍 {c.district || (c.address ? c.address.split(",")[0] : "Local Ward")}, {c.state || "India"}</span>
                        {(c.assignedUniversityName || c.assignedUniversity?.name) && (
                          <span style={{ marginLeft: "10px", color: "#FFD21F", fontWeight: 700 }}>
                            🏛️ {c.assignedUniversityName || c.assignedUniversity?.name}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/citizen/complaints/${c.id}`}
                        style={{
                          background: "#FFD21F",
                          color: "#0B0D0F",
                          fontSize: "11px",
                          padding: "5px 12px",
                          borderRadius: "6px",
                          fontWeight: 800,
                          textDecoration: "none"
                        }}
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Link to="/citizen/complaints" style={{ fontSize: "12px", color: "#FFD21F", fontWeight: 800, textDecoration: "none" }}>
              View All Submissions ({totalReported}) →
            </Link>
          </div>
        </div>

        {/* Right: Community Impact Map + Civic Pulse + Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Community Impact Map */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "15px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
                  Community Impact Map
                </h3>
                <p style={{ fontSize: "11px", color: "#8F9499", margin: "1px 0 0" }}>
                  Geotagged challenges across district
                </p>
              </div>
              <Link to="/citizen/map" style={{ fontSize: "11px", color: "#FFD21F", fontWeight: 800, textDecoration: "none" }}>
                Full Map →
              </Link>
            </div>

            <div style={{ height: "220px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <ComplaintMap complaints={mapComplaints} center={defaultCenter} zoom={11} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "10.5px", color: "#8F9499" }}>
              <span>📍 {mapComplaints.length} Geotagged Pins</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#FF5C5C" }}>● Critical</span>
                <span style={{ color: "#FFD21F" }}>● High</span>
                <span style={{ color: "#A8E063" }}>● Low</span>
              </div>
            </div>
          </div>

          {/* JanNirikshan IMPACT (Civic Pulse) */}
          <div style={{
            background: "#222528",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "20px",
            color: "#F5F5F2",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.35)"
          }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFD21F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              JanNirikshan IMPACT
            </span>
            <h3 style={{ fontSize: "15px", margin: "3px 0 12px", color: "#F5F5F2", fontWeight: 800 }}>
              Civic Mission Pulse
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: "#17191C", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#FFD21F" }}>
                  {impact ? Number(impact.totalPeopleBenefited).toLocaleString() : "1,850+"}
                </div>
                <div style={{ fontSize: "10px", color: "#8F9499", marginTop: "2px" }}>Citizens Benefited</div>
              </div>

              <div style={{ background: "#17191C", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#A8E063" }}>
                  {impact ? (Number(impact.totalCostSavedInr) / 100000).toFixed(1) + "L" : "₹6.5L"}
                </div>
                <div style={{ fontSize: "10px", color: "#8F9499", marginTop: "2px" }}>Money Saved</div>
              </div>

              <div style={{ background: "#17191C", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#FFD21F" }}>
                  {impact?.socialImpactScore || 92}/100
                </div>
                <div style={{ fontSize: "10px", color: "#8F9499", marginTop: "2px" }}>Impact Score</div>
              </div>

              <div style={{ background: "#17191C", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#F5F5F2" }}>
                  {impact?.totalVillagesCovered || 12}
                </div>
                <div style={{ fontSize: "10px", color: "#8F9499", marginTop: "2px" }}>Wards & Clusters</div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div style={{
            background: "#17191C",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "14px", color: "#F5F5F2", margin: 0, fontWeight: 800 }}>
                ⚡ Quick Shortcuts
              </h3>
              <Link to="/citizen/notifications" style={{ fontSize: "11px", color: "#FFD21F", fontWeight: 800, textDecoration: "none" }}>
                Notifications →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <Link to="/citizen/report" style={{ background: "#1D2023", border: "1px solid rgba(255,210,31,0.25)", borderRadius: "8px", padding: "10px", textDecoration: "none", color: "#FFD21F", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px" }}>📢</span>
                <strong style={{ fontSize: "11px" }}>+ Report Challenge</strong>
              </Link>

              <Link to="/citizen/complaints" style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", textDecoration: "none", color: "#F5F5F2", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px" }}>📋</span>
                <strong style={{ fontSize: "11px" }}>My Submissions</strong>
              </Link>

              <Link to="/citizen/map" style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", textDecoration: "none", color: "#A8E063", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px" }}>🗺️</span>
                <strong style={{ fontSize: "11px" }}>Community Map</strong>
              </Link>

              <Link to="/citizen/profile" style={{ background: "#1D2023", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "10px", textDecoration: "none", color: "#8F9499", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px" }}>👤</span>
                <strong style={{ fontSize: "11px" }}>Profile Settings</strong>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

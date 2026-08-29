const fs = require("fs");
const path = require("path");

function write(relPath, content) {
  const full = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + "\n", "utf8");
  console.log("Wrote:", relPath);
}

// 1. Charts.jsx
write("src/components/analytics/Charts.jsx", `
import React from "react";

export function CategoryBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: "20px", color: "#94a3b8", textAlign: "center" }}>No category data available</div>;
  }
  const max = Math.max(...data.map(d => Number(d.count) || 0), 1);
  const colors = ["#0284c7", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#14b8a6"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      {data.map((item, idx) => {
        const pct = Math.round(((Number(item.count) || 0) / max) * 100);
        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, color: "#334155" }}>
              <span>{item.category || "Uncategorized"}</span>
              <span style={{ fontWeight: 800, color: "#0f172a" }}>{item.count} challenges</span>
            </div>
            <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: \`\${pct}%\`,
                background: colors[idx % colors.length],
                borderRadius: "999px",
                transition: "width 0.6s ease"
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TrendLineChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: "20px", color: "#94a3b8", textAlign: "center" }}>No trend data available</div>;
  }
  const maxVal = Math.max(...data.map(d => Math.max(d.submitted || 0, d.resolved || 0)), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "180px", paddingTop: "20px" }}>
      {data.map((item, idx) => {
        const subH = Math.round(((item.submitted || 0) / maxVal) * 140);
        const resH = Math.round(((item.resolved || 0) / maxVal) * 140);
        return (
          <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "140px" }}>
              <div
                title={\`Submitted: \${item.submitted}\`}
                style={{
                  width: "14px",
                  height: \`\${Math.max(subH, 4)}px\`,
                  background: "#38bdf8",
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.4s"
                }}
              />
              <div
                title={\`Resolved: \${item.resolved}\`}
                style={{
                  width: "14px",
                  height: \`\${Math.max(resH, 4)}px\`,
                  background: "#10b981",
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.4s"
                }}
              />
            </div>
            <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 700 }}>{item.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default { CategoryBarChart, TrendLineChart };
`);

// 2. MetricCard.jsx
write("src/components/analytics/MetricCard.jsx", `
import React from "react";

export default function MetricCard({ icon, label, value, subtitle, trend, color = "#0284c7", bg = "#f0f9ff" }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--ss-border)",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </span>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: bg,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px"
        }}>
          {icon}
        </div>
      </div>

      <div>
        <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--ss-navy)", lineHeight: 1.1 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            {trend && <span style={{ color: trend.startsWith("+") ? "#16a34a" : "#dc2626", fontWeight: 800 }}>{trend}</span>}
            <span>{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}
`);

// 3. ComplaintFilters.jsx
write("src/components/complaint/ComplaintFilters.jsx", `
import React from "react";
import { CATEGORIES, DISTRICTS, PRIORITIES } from "../../utils/constants";

export default function ComplaintFilters({ filters, onChange, onClear }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--ss-border)",
      borderRadius: "14px",
      padding: "16px 20px",
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      alignItems: "center",
      marginBottom: "20px"
    }}>
      {/* Search Input */}
      <div style={{ flex: "1 1 220px" }}>
        <input
          type="text"
          name="keyword"
          value={filters.keyword || ""}
          onChange={handleChange}
          placeholder="🔍 Search challenges, title, keywords..."
          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--ss-border)", fontSize: "13px" }}
        />
      </div>

      {/* Category */}
      <div style={{ minWidth: "160px" }}>
        <select
          name="category"
          value={filters.category || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--ss-border)", fontSize: "13px" }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* District */}
      <div style={{ minWidth: "140px" }}>
        <select
          name="district"
          value={filters.district || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--ss-border)", fontSize: "13px" }}
        >
          <option value="">All Districts</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Priority */}
      <div style={{ minWidth: "130px" }}>
        <select
          name="priority"
          value={filters.priority || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--ss-border)", fontSize: "13px" }}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Status */}
      <div style={{ minWidth: "140px" }}>
        <select
          name="status"
          value={filters.status || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--ss-border)", fontSize: "13px" }}
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="ASSIGNED">University Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PROTOTYPE">Prototype</option>
          <option value="TESTING">Testing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <button
        onClick={onClear}
        className="button secondary"
        style={{ fontSize: "12px", padding: "8px 14px" }}
      >
        Clear Filters
      </button>
    </div>
  );
}
`);

// 4. ComplaintTimeline.jsx
write("src/components/complaint/ComplaintTimeline.jsx", `
import React from "react";

const STAGES = [
  { key: "SUBMITTED", label: "Submitted", desc: "Citizen filed challenge" },
  { key: "UNDER_REVIEW", label: "Govt Review", desc: "Evidence verification" },
  { key: "APPROVED", label: "Approved", desc: "Priority & duplicate check" },
  { key: "ASSIGNED", label: "University", desc: "Assigned to engineering institution" },
  { key: "IN_PROGRESS", label: "R&D Active", desc: "Faculty & Student team building" },
  { key: "PROTOTYPE", label: "Prototype", desc: "Working model & testing" },
  { key: "COMPLETED", label: "Deployed", desc: "Pilot impact achieved" }
];

export default function ComplaintTimeline({ currentStatus = "SUBMITTED" }) {
  const getStageIndex = (status) => {
    switch (status) {
      case "SUBMITTED": return 0;
      case "UNDER_REVIEW":
      case "CLARIFICATION_REQUIRED": return 1;
      case "APPROVED": return 2;
      case "ASSIGNED": return 3;
      case "IN_PROGRESS":
      case "SOLUTION_PROPOSED": return 4;
      case "PROTOTYPE":
      case "TESTING":
      case "PILOT": return 5;
      case "DEPLOYED":
      case "RESOLVED":
      case "COMPLETED": return 6;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div style={{ padding: "20px 10px", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        {/* Background track line */}
        <div style={{
          position: "absolute",
          top: "16px",
          left: "24px",
          right: "24px",
          height: "4px",
          background: "#e2e8f0",
          zIndex: 0
        }} />

        {/* Active progress line */}
        <div style={{
          position: "absolute",
          top: "16px",
          left: "24px",
          width: \`\${(currentIndex / (STAGES.length - 1)) * 92}%\`,
          height: "4px",
          background: "#10b981",
          zIndex: 1,
          transition: "width 0.4s ease"
        }} />

        {STAGES.map((st, i) => {
          const isDone = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={st.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, position: "relative", width: "80px", textAlign: "center" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: isDone ? (isCurrent ? "#0284c7" : "#10b981") : "#fff",
                border: \`3px solid \${isDone ? (isCurrent ? "#0284c7" : "#10b981") : "#cbd5e1"}\`,
                color: isDone ? "#fff" : "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 900,
                boxShadow: isCurrent ? "0 0 0 4px rgba(2, 132, 199, 0.25)" : "none"
              }}>
                {isDone && !isCurrent ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "11px", fontWeight: isCurrent ? 800 : 600, color: isCurrent ? "#0f172a" : "#64748b", marginTop: "6px" }}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`);

// 5. FilePreview.jsx
write("src/components/evidence/FilePreview.jsx", `
import React from "react";

export default function FilePreview({ file, onRemove }) {
  const isImage = file.type.startsWith("image/");
  const url = URL.createObjectURL(file);

  return (
    <div style={{
      position: "relative",
      width: "100px",
      height: "100px",
      borderRadius: "10px",
      overflow: "hidden",
      border: "1px solid var(--ss-border)",
      background: "#0f172a"
    }}>
      {isImage ? (
        <img src={url} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "24px" }}>
          🎥
        </div>
      )}
      <button
        onClick={() => onRemove(file)}
        type="button"
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          background: "rgba(220, 38, 38, 0.85)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          fontSize: "11px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        ✕
      </button>
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        fontSize: "9px",
        padding: "2px 4px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}>
        {file.name}
      </div>
    </div>
  );
}
`);

// 6. EvidenceVerificationModal.jsx
write("src/components/evidence/EvidenceVerificationModal.jsx", `
import React, { useState } from "react";
import Modal from "../common/Modal";

export default function EvidenceVerificationModal({ isOpen, onClose, evidence, onVerify }) {
  const [status, setStatus] = useState("VERIFIED");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onVerify(evidence.id, status, note);
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛡️ Verify Evidence Authenticity">
      <form onSubmit={handleSubmit}>
        <p style={{ margin: "0 0 16px", color: "var(--ss-muted)", fontSize: "13px" }}>
          Review media for: <strong>{evidence?.originalFileName}</strong>
        </p>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Verification Decision</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--ss-border)" }}
          >
            <option value="VERIFIED">✅ Verified (Authentic Ground Reality)</option>
            <option value="SUSPICIOUS">⚠️ Flag Suspicious (Metadata / Visual Inconsistency)</option>
            <option value="REJECTED">❌ Rejected (Irrelevant / Tampered)</option>
            <option value="CLARIFICATION_REQUESTED">💬 Request Clarification from Citizen</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Review Notes / Field Assessment</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Document reasons for verification or flags for audit trail..."
            rows={4}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--ss-border)" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button type="button" onClick={onClose} className="button secondary">Cancel</button>
          <button type="submit" disabled={saving} className="button primary">
            {saving ? "Saving..." : "Submit Verification Decision"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
`);

// 7. Sidebar.jsx
write("src/components/layout/Sidebar.jsx", `
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const roleLinks = {
    CITIZEN: [
      { to: "/citizen", icon: "📊", label: "My Dashboard" },
      { to: "/citizen/report", icon: "➕", label: "Submit Challenge" },
      { to: "/citizen/complaints", icon: "📁", label: "My Submissions" },
      { to: "/explore", icon: "🗺️", label: "Explore Problems" }
    ],
    ADMIN: [
      { to: "/admin", icon: "🏛️", label: "Command Center" },
      { to: "/admin/complaints", icon: "🔍", label: "Problem Review" },
      { to: "/admin/analytics", icon: "📈", label: "National Analytics" },
      { to: "/admin/audit", icon: "📜", label: "Audit Trails" },
      { to: "/explore", icon: "🗺️", label: "All Challenges" }
    ],
    UNIVERSITY: [
      { to: "/university", icon: "🎓", label: "Innovation Cell" },
      { to: "/university/assigned-challenges", icon: "📥", label: "Assigned Problems" },
      { to: "/explore", icon: "🗺️", label: "Browse Challenges" }
    ],
    FACULTY: [
      { to: "/faculty", icon: "👨‍🏫", label: "Mentorship Hub" },
      { to: "/explore", icon: "🗺️", label: "Browse Challenges" }
    ],
    STUDENT: [
      { to: "/student", icon: "🚀", label: "Project Workspace" },
      { to: "/explore", icon: "🗺️", label: "Browse Challenges" }
    ],
    INDUSTRY: [
      { to: "/industry", icon: "🏭", label: "CSR & Sponsorship Hub" },
      { to: "/explore", icon: "🗺️", label: "Browse Challenges" }
    ]
  };

  const links = roleLinks[user.role] || roleLinks.CITIZEN;

  return (
    <aside style={{
      width: "240px",
      background: "#fff",
      borderRight: "1px solid var(--ss-border)",
      minHeight: "calc(100vh - 80px)",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    }}>
      <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--ss-muted)", textTransform: "uppercase", padding: "0 12px 10px" }}>
        {user.role} WORKSPACE
      </div>
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 700,
              color: isActive ? "#0284c7" : "#475569",
              background: isActive ? "#f0f9ff" : "transparent",
              transition: "0.15s"
            }}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
`);

// 8. ProjectProgress.jsx
write("src/components/project/ProjectProgress.jsx", `
import React from "react";

const STAGES = [
  "RESEARCH",
  "PROPOSAL",
  "PROTOTYPE",
  "TESTING",
  "PILOT",
  "DEPLOYMENT",
  "COMPLETED"
];

export default function ProjectProgress({ stage = "RESEARCH", progress = 10 }) {
  const currentIndex = STAGES.indexOf(stage);

  return (
    <div style={{ background: "#fff", border: "1px solid var(--ss-border)", borderRadius: "16px", padding: "20px", margin: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--ss-muted)", textTransform: "uppercase" }}>Current Stage</span>
          <h3 style={{ margin: "2px 0 0", fontSize: "18px", color: "var(--ss-navy)" }}>{stage}</h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "24px", fontWeight: 900, color: "var(--ss-blue)" }}>{progress}%</span>
          <div style={{ fontSize: "11px", color: "var(--ss-muted)" }}>Overall Completion</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ height: "100%", width: \`\${progress}%\`, background: "linear-gradient(90deg, #38bdf8, #0284c7)", borderRadius: "999px", transition: "width 0.4s ease" }} />
      </div>

      {/* Stage Pills */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
        {STAGES.map((st, idx) => {
          const isPast = idx < currentIndex;
          const isCur = idx === currentIndex;
          return (
            <div
              key={st}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "6px 8px",
                borderRadius: "8px",
                fontSize: "10px",
                fontWeight: 800,
                background: isCur ? "#0284c7" : isPast ? "#dcfce7" : "#f1f5f9",
                color: isCur ? "#fff" : isPast ? "#166534" : "#64748b",
                whiteSpace: "nowrap"
              }}
            >
              {isPast ? "✓ " : ""}{st}
            </div>
          );
        })}
      </div>
    </div>
  );
}
`);

// 9. MatchCard.jsx & MatchScore.jsx
write("src/components/matching/MatchScore.jsx", `
import React from "react";

export default function MatchScore({ score = 85 }) {
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#0284c7" : "#ca8a04";
  const bg = score >= 80 ? "#dcfce7" : score >= 60 ? "#e0f2fe" : "#fef9c3";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "3px 8px",
      borderRadius: "999px",
      background: bg,
      color: color,
      fontSize: "11px",
      fontWeight: 800
    }}>
      🎯 {score}% Match
    </span>
  );
}
`);

write("src/components/matching/MatchCard.jsx", `
import React from "react";
import MatchScore from "./MatchScore";

export default function MatchCard({ university, onSelect }) {
  return (
    <div style={{
      border: "1px solid var(--ss-border)",
      borderRadius: "14px",
      padding: "16px",
      background: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <strong style={{ fontSize: "14px", color: "var(--ss-navy)" }}>{university.name}</strong>
          <MatchScore score={university.matchScore || 85} />
        </div>
        <div style={{ fontSize: "12px", color: "var(--ss-muted)", marginTop: "4px" }}>
          📍 {university.district}, {university.state} • Capacity: {university.capacity}
        </div>
        <div style={{ fontSize: "11px", color: "#0369a1", marginTop: "4px" }}>
          Specialization: {university.expertiseAreas}
        </div>
      </div>
      {onSelect && (
        <button onClick={() => onSelect(university)} className="button primary" style={{ fontSize: "12px", padding: "6px 14px" }}>
          Assign →
        </button>
      )}
    </div>
  );
}
`);

// 10. Notification components
write("src/components/notification/NotificationBell.jsx", `
import React from "react";

export default function NotificationBell({ count = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "#fff",
        borderRadius: "50%",
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "16px"
      }}
    >
      🔔
      {count > 0 && (
        <span style={{
          position: "absolute",
          top: "-4px",
          right: "-4px",
          background: "#ef4444",
          color: "#fff",
          fontSize: "10px",
          fontWeight: 800,
          borderRadius: "999px",
          padding: "2px 6px"
        }}>
          {count}
        </span>
      )}
    </button>
  );
}
`);

write("src/components/notification/NotificationPanel.jsx", `
import React from "react";

export default function NotificationPanel({ notifications = [], onMarkAllRead }) {
  return (
    <div style={{
      width: "320px",
      background: "#fff",
      borderRadius: "14px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      border: "1px solid var(--ss-border)",
      padding: "16px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <strong style={{ fontSize: "14px" }}>Notifications</strong>
        {onMarkAllRead && (
          <button onClick={onMarkAllRead} style={{ fontSize: "11px", color: "var(--ss-blue)", background: "none", border: "none", cursor: "pointer" }}>
            Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "12px" }}>No notifications</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {notifications.map((n) => (
            <div key={n.id} style={{ padding: "8px", borderRadius: "8px", background: n.read ? "#fff" : "#f0f9ff", border: "1px solid #e2e8f0", fontSize: "12px" }}>
              <div style={{ fontWeight: 700 }}>{n.title}</div>
              <div style={{ color: "#475569", marginTop: "2px" }}>{n.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`);

console.log("All missing frontend components written successfully!");

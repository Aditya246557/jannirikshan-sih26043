import React from "react";
import { Link } from "react-router-dom";

export default function ComplaintCard({ complaint }) {
  if (!complaint) return null;

  const getPriorityClass = (prio) => {
    const p = String(prio || "").toUpperCase();
    if (p === "CRITICAL") return "prio-critical";
    if (p === "HIGH") return "prio-high";
    if (p === "MEDIUM") return "prio-medium";
    return "prio-low";
  };

  const getStatusClass = (status) => {
    const s = String(status || "").toUpperCase();
    if (["RESOLVED", "APPROVED", "COMPLETED"].includes(s)) return "status-resolved";
    if (["IN_PROGRESS", "PROJECT_CREATED"].includes(s)) return "status-in_progress";
    if (["ASSIGNED"].includes(s)) return "status-assigned";
    if (["UNDER_REVIEW"].includes(s)) return "status-under_review";
    if (["REJECTED"].includes(s)) return "status-rejected";
    return "status-submitted";
  };

  return (
    <article style={{
      background: "#111315",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "16px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      gap: "14px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
      transition: "transform 150ms ease, border-color 150ms ease"
    }}>
      <div>
        {/* Top Badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
          <span style={{
            background: "rgba(255, 255, 255, 0.06)",
            color: "#B7BCC2",
            fontSize: "11px",
            fontWeight: 750,
            padding: "3px 8px",
            borderRadius: "6px"
          }}>
            {complaint.category || "Civic Issue"}
          </span>

          <span className={`prio-pill ${getPriorityClass(complaint.priority)}`}>
            ● {complaint.priority || "MEDIUM"}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: "15.5px",
          fontWeight: 800,
          color: "#F5F5F2",
          margin: "0 0 8px",
          lineHeight: 1.35
        }}>
          {complaint.title}
        </h3>

        {/* Description snippet */}
        <p style={{
          fontSize: "12.5px",
          color: "#8F9499",
          margin: "0 0 12px",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {complaint.description}
        </p>
      </div>

      {/* Footer Meta & Action */}
      <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className={`status-badge ${getStatusClass(complaint.status)}`}>
            {complaint.status || "SUBMITTED"}
          </span>
          <span style={{ fontSize: "11.5px", color: "#8F9499" }}>
            📍 {complaint.district ? `${complaint.district}, ${complaint.state || ""}` : `${Number(complaint.latitude || 0).toFixed(2)}, ${Number(complaint.longitude || 0).toFixed(2)}`}
          </span>
        </div>

        <Link
          to={`/complaints/${complaint.id}`}
          style={{
            background: "#1D2023",
            color: "#F5F5F2",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "11.5px",
            fontWeight: 800,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          View Case →
        </Link>
      </div>
    </article>
  );
}
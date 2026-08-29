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
          width: `${(currentIndex / (STAGES.length - 1)) * 92}%`,
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
                border: `3px solid ${isDone ? (isCurrent ? "#0284c7" : "#10b981") : "#cbd5e1"}`,
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

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
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #38bdf8, #0284c7)", borderRadius: "999px", transition: "width 0.4s ease" }} />
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

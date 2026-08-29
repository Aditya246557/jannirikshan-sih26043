import React from "react";

export function CategoryBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: "20px", color: "#8F9499", textAlign: "center" }}>No category telemetry available</div>;
  }
  const max = Math.max(...data.map(d => Number(d.count) || 0), 1);
  const colors = ["#FFD21F", "#38BDF8", "#FF4FA3", "#34D399", "#F59E0B", "#8B5CF6", "#06B6D4", "#EC4899"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>
      {data.map((item, idx) => {
        const pct = Math.round(((Number(item.count) || 0) / max) * 100);
        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#B7BCC2" }}>
              <span>{item.category || "Uncategorized"}</span>
              <span style={{ fontWeight: 800, color: "#F5F5F2" }}>{item.count} challenges</span>
            </div>
            <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: colors[idx % colors.length],
                borderRadius: "999px",
                boxShadow: `0 0 10px ${colors[idx % colors.length]}40`,
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
    return <div style={{ padding: "20px", color: "#8F9499", textAlign: "center" }}>No trend telemetry available</div>;
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
                title={`Submitted: ${item.submitted}`}
                style={{
                  width: "14px",
                  height: `${Math.max(subH, 4)}px`,
                  background: "#38BDF8",
                  borderRadius: "4px 4px 0 0",
                  boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
                  transition: "height 0.4s"
                }}
              />
              <div
                title={`Resolved: ${item.resolved}`}
                style={{
                  width: "14px",
                  height: `${Math.max(resH, 4)}px`,
                  background: "#34D399",
                  borderRadius: "4px 4px 0 0",
                  boxShadow: "0 0 10px rgba(52, 211, 153, 0.3)",
                  transition: "height 0.4s"
                }}
              />
            </div>
            <span style={{ fontSize: "10.5px", color: "#8F9499", fontWeight: 750 }}>{item.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default { CategoryBarChart, TrendLineChart };

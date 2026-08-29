import React from "react";

export default function MetricCard({ icon, label, value, subtitle, trend, color = "#38BDF8", bg = "rgba(56, 189, 248, 0.12)" }) {
  return (
    <div style={{
      background: "#111315",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "18px",
      padding: "20px 22px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
      transition: "transform 150ms ease, border-color 150ms ease"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#8F9499", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
        <div style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: bg,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          border: `1px solid ${color}30`
        }}>
          {icon}
        </div>
      </div>

      <div>
        <div style={{ fontSize: "28px", fontWeight: 900, color: "#F5F5F2", lineHeight: 1.1 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: "11.5px", color: "#8F9499", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            {trend && <span style={{ color: trend.startsWith("+") ? "#34D399" : "#FF5C5C", fontWeight: 800 }}>{trend}</span>}
            <span>{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}

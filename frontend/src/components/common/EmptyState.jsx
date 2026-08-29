import React from "react";

export default function EmptyState({ icon = "📭", title = "No items found", description = "There are no records matching your criteria." }) {
  return (
    <div style={{
      background: "#111315",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "18px",
      padding: "40px 24px",
      textAlign: "center",
      color: "#8F9499"
    }}>
      <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>{icon}</span>
      <h3 style={{ margin: "0 0 6px", color: "#F5F5F2", fontSize: "16px", fontWeight: 800 }}>{title}</h3>
      <p style={{ margin: 0, color: "#8F9499", fontSize: "13px" }}>{description}</p>
    </div>
  );
}
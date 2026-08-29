import React from "react";

export default function Loading({ message = "Loading data..." }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "220px",
      background: "#111315",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "18px",
      padding: "36px"
    }}>
      <div style={{
        width: "36px",
        height: "36px",
        border: "3px solid rgba(255, 255, 255, 0.1)",
        borderTopColor: "#FFD21F",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <p style={{ marginTop: "14px", fontWeight: 700, color: "#8F9499", fontSize: "13px" }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
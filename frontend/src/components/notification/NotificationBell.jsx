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

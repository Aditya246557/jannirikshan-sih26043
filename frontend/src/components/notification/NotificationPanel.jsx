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

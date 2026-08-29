import React from "react";

export default function ErrorMessage({ message = "An error occurred" }) {
  if (!message) return null;
  return (
    <div style={{
      background: "rgba(255, 92, 92, 0.12)",
      border: "1px solid rgba(255, 92, 92, 0.35)",
      borderRadius: "12px",
      padding: "12px 16px",
      color: "#FF5C5C",
      fontSize: "13px",
      fontWeight: 650,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      margin: "14px 0"
    }}>
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}
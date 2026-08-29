import React from "react";

export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div style={{
      background: "#111315",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "20px",
      padding: "24px 28px",
      marginBottom: "24px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)"
    }}>
      {eyebrow && (
        <div style={{
          fontSize: "10.5px",
          fontWeight: 850,
          color: "#FFD21F",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "6px"
        }}>
          {eyebrow}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: "2px 0 6px", fontSize: "24px", fontWeight: 900, color: "#F5F5F2" }}>
            {title}
          </h1>
          {description && (
            <p style={{ margin: 0, maxWidth: "750px", color: "#8F9499", fontSize: "13.5px", lineHeight: 1.55 }}>
              {description}
            </p>
          )}
        </div>
        {children && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
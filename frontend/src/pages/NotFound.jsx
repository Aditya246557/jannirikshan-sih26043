import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#07080A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        background: "#111315",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "24px",
        padding: "48px 36px",
        textAlign: "center",
        maxWidth: "500px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)"
      }}>
        <span style={{ fontSize: "56px", display: "block", marginBottom: "16px" }}>🔍</span>
        <h1 style={{ fontSize: "26px", color: "#F5F5F2", fontWeight: 900, margin: "0 0 10px" }}>404 • Resource Not Found</h1>
        <p style={{ color: "#8F9499", fontSize: "13.5px", margin: "0 auto 24px", lineHeight: 1.6 }}>
          The civic innovation module or challenge record you are looking for does not exist or has been archived.
        </p>
        <Link
          to="/"
          style={{
            background: "#FFD21F",
            color: "#0B0D0F",
            padding: "10px 24px",
            borderRadius: "8px",
            fontWeight: 850,
            textDecoration: "none",
            fontSize: "13px",
            display: "inline-block",
            boxShadow: "0 0 16px rgba(255, 210, 31, 0.35)"
          }}
        >
          Return to Platform Home →
        </Link>
      </div>
    </div>
  );
}
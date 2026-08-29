import React from "react";
import MatchScore from "./MatchScore";

export default function MatchCard({ university, onSelect }) {
  return (
    <div style={{
      border: "1px solid var(--ss-border)",
      borderRadius: "14px",
      padding: "16px",
      background: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <strong style={{ fontSize: "14px", color: "var(--ss-navy)" }}>{university.name}</strong>
          <MatchScore score={university.matchScore || 85} />
        </div>
        <div style={{ fontSize: "12px", color: "var(--ss-muted)", marginTop: "4px" }}>
          📍 {university.district}, {university.state} • Capacity: {university.capacity}
        </div>
        <div style={{ fontSize: "11px", color: "#0369a1", marginTop: "4px" }}>
          Specialization: {university.expertiseAreas}
        </div>
      </div>
      {onSelect && (
        <button onClick={() => onSelect(university)} className="button primary" style={{ fontSize: "12px", padding: "6px 14px" }}>
          Assign →
        </button>
      )}
    </div>
  );
}

import React from "react";

export default function MatchScore({ score = 85 }) {
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#0284c7" : "#ca8a04";
  const bg = score >= 80 ? "#dcfce7" : score >= 60 ? "#e0f2fe" : "#fef9c3";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "3px 8px",
      borderRadius: "999px",
      background: bg,
      color: color,
      fontSize: "11px",
      fontWeight: 800
    }}>
      🎯 {score}% Match
    </span>
  );
}

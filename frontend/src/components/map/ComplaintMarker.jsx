import React from "react";
import { CircleMarker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";

const COLORS = {
  CRITICAL: "#FF5C5C",
  HIGH: "#FFD21F",
  MEDIUM: "#F59E0B",
  LOW: "#34D399"
};

export default function ComplaintMarker({ complaint }) {
  if (!complaint || complaint.latitude == null || complaint.longitude == null) return null;
  const lat = Number(complaint.latitude);
  const lng = Number(complaint.longitude);
  if (isNaN(lat) || isNaN(lng)) return null;

  const color = COLORS[complaint.priority] || COLORS.HIGH;
  const linkPath = complaint.id ? `/complaints/${complaint.id}` : "#";

  return (
    <CircleMarker
      center={[lat, lng]}
      radius={9}
      pathOptions={{
        color: "#FFFFFF",
        fillColor: color,
        fillOpacity: 0.95,
        weight: 2
      }}
    >
      <Popup>
        <div style={{ color: "#F5F5F2", background: "#17191C", padding: "8px", fontSize: "12px", minWidth: "200px" }}>
          <strong style={{ display: "block", fontSize: "13px", marginBottom: "4px", color: "#F5F5F2", fontWeight: 800 }}>
            {complaint.title || "Civic Challenge"}
          </strong>
          <div style={{ color: "#B7BCC2", fontSize: "11px", marginBottom: "3px" }}>
            {complaint.category || "General"} • <span style={{ fontWeight: 800, color: color }}>{complaint.priority || "HIGH"} Priority</span>
          </div>
          <div style={{ color: "#38BDF8", fontWeight: 800, fontSize: "11px", marginBottom: "8px" }}>
            Status: {complaint.status}
          </div>
          {complaint.address && (
            <div style={{ color: "#8F9499", fontSize: "10.5px", marginBottom: "8px" }}>
              📍 {complaint.address}
            </div>
          )}
          {complaint.id && (
            <Link
              to={linkPath}
              style={{
                display: "inline-block",
                background: "#FFD21F",
                color: "#0B0D0F",
                padding: "4px 10px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "11px",
                fontWeight: 850
              }}
            >
              View Case Details →
            </Link>
          )}
        </div>
      </Popup>
    </CircleMarker>
  );
}

import React, { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { createPinIcon, MAP_PRIORITY_COLORS } from "./mapMarkerUtils";

export default function ComplaintMarker({ complaint }) {
  if (!complaint || complaint.latitude == null || complaint.longitude == null) return null;
  const lat = Number(complaint.latitude);
  const lng = Number(complaint.longitude);
  if (isNaN(lat) || isNaN(lng)) return null;

  const color = MAP_PRIORITY_COLORS[complaint.priority] || MAP_PRIORITY_COLORS.HIGH;
  const pinIcon = useMemo(() => createPinIcon(color, 28), [color]);
  const linkPath = complaint.id ? `/citizen/complaints/${complaint.id}` : "#";

  return (
    <Marker position={[lat, lng]} icon={pinIcon}>
      <Popup>
        <div style={{ color: "#F5F5F2", background: "#17191C", padding: "10px", fontSize: "12px", minWidth: "220px", borderRadius: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <span style={{ fontSize: "9px", fontWeight: 800, background: "#1D2023", color: color, padding: "2px 6px", borderRadius: "4px", border: `1px solid ${color}40` }}>
              ● {complaint.priority || "HIGH"} SEVERITY
            </span>
            <span style={{ fontSize: "9.5px", color: "#8F9499" }}>#{complaint.id}</span>
          </div>

          <strong style={{ display: "block", fontSize: "13.5px", margin: "4px 0", color: "#F5F5F2", fontWeight: 850, lineHeight: 1.3 }}>
            {complaint.title || "Civic Challenge"}
          </strong>

          <div style={{ color: "#B7BCC2", fontSize: "11px", marginBottom: "3px" }}>
            {complaint.category || "General"}
          </div>

          <div style={{ color: "#38BDF8", fontWeight: 800, fontSize: "11px", marginBottom: "8px" }}>
            Status: {complaint.status}
          </div>

          {complaint.address && (
            <div style={{ color: "#8F9499", fontSize: "10.5px", marginBottom: "10px", lineHeight: 1.3 }}>
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
                padding: "5px 12px",
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
    </Marker>
  );
}

import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import ComplaintMarker from "./ComplaintMarker";
import "leaflet/dist/leaflet.css";

const DEFAULT_INDIA_CENTER = [20.5937, 78.9629];

function MapAutoUpdater({ items, center, zoom }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size in case map container was rendered inside tabs or resized
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const validItems = (items || []).filter(
      (c) =>
        c &&
        c.latitude != null &&
        c.longitude != null &&
        !isNaN(Number(c.latitude)) &&
        !isNaN(Number(c.longitude))
    );

    if (validItems.length === 1) {
      const lat = Number(validItems[0].latitude);
      const lng = Number(validItems[0].longitude);
      map.setView([lat, lng], zoom || 13, { animate: true });
    } else if (validItems.length > 1) {
      const bounds = L.latLngBounds(
        validItems.map((c) => [Number(c.latitude), Number(c.longitude)])
      );
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
    } else if (center) {
      map.setView(center, zoom || 5);
    }

    return () => clearTimeout(timer);
  }, [items, center, zoom, map]);

  return null;
}

export default function ComplaintMap({
  complaints,
  challenges,
  complaint,
  center,
  zoom = 11,
  height = "100%"
}) {
  const rawList = complaints || challenges || (complaint ? [complaint] : []);
  const list = Array.isArray(rawList)
    ? rawList
    : rawList?.content || rawList?.data || [];

  const validComplaints = list.filter(
    (c) =>
      c &&
      c.latitude != null &&
      c.longitude != null &&
      !isNaN(Number(c.latitude)) &&
      !isNaN(Number(c.longitude))
  );

  const initialCenter =
    validComplaints.length > 0
      ? [Number(validComplaints[0].latitude), Number(validComplaints[0].longitude)]
      : (center || DEFAULT_INDIA_CENTER);

  const initialZoom = validComplaints.length > 0 ? (zoom || 12) : 5;

  return (
    <div style={{ width: "100%", height: height, minHeight: "260px", position: "relative" }}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom={false}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "260px",
          borderRadius: "14px"
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoUpdater items={validComplaints} center={center} zoom={zoom} />

        {validComplaints.map((c) => (
          <ComplaintMarker key={c.id || `${c.latitude}-${c.longitude}`} complaint={c} />
        ))}
      </MapContainer>
    </div>
  );
}

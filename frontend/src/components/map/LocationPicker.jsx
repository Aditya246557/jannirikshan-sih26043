import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from "react-leaflet";
import { createPinIcon } from "./mapMarkerUtils";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20.5937, 78.9629];

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({
        latitude: Number(e.latlng.lat.toFixed(6)),
        longitude: Number(e.latlng.lng.toFixed(6))
      });
    }
  });
  return null;
}

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");

  const hasSelected =
    value?.latitude != null &&
    value?.longitude != null &&
    !isNaN(Number(value.latitude)) &&
    !isNaN(Number(value.longitude));

  const position = hasSelected
    ? [Number(value.latitude), Number(value.longitude)]
    : DEFAULT_CENTER;

  const getLocation = () => {
    if (!navigator.geolocation) {
      setGeoMsg("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { "Accept-Language": "en" }
          });
          if (res.ok) {
            const data = await res.json();
            const addr = data.display_name || `${lat}, ${lng}`;
            const district = data.address?.state_district || data.address?.county || data.address?.city || data.address?.suburb || "District";
            const state = data.address?.state || "State";
            const villageCity = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || district;

            onChange({ latitude: lat, longitude: lng, address: addr, district, state, villageCity });
            setGeoMsg(`✓ GPS Location & Address Acquired (${district}, ${state})`);
          } else {
            onChange({ latitude: lat, longitude: lng });
            setGeoMsg("✓ GPS Coordinates Acquired (Coordinates detected, but address could not be resolved)");
          }
        } catch (e) {
          onChange({ latitude: lat, longitude: lng });
          setGeoMsg("✓ GPS Coordinates Acquired");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setGeoMsg("Location permission denied. Please allow location access or enter manually.");
        } else if (err.code === 2) {
          setGeoMsg("Unable to determine your current location.");
        } else {
          setGeoMsg("Location request timed out. Please click on the map to pin.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      
      {/* Top Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <button
          type="button"
          onClick={getLocation}
          disabled={geoLoading}
          style={{
            background: "#FFD21F",
            color: "#0B0D0F",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 0 12px rgba(255, 210, 31, 0.25)"
          }}
        >
          {geoLoading ? "⏳ Fetching GPS..." : "📍 Use My Current Location"}
        </button>

        {hasSelected && (
          <div style={{
            background: "rgba(168, 224, 99, 0.15)",
            border: "1px solid rgba(168, 224, 99, 0.3)",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "11px",
            fontWeight: 800,
            color: "#A8E063",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>LOCATION SELECTED ✓</span>
            <span style={{ color: "#F5F5F2", fontWeight: 600 }}>({value.latitude}, {value.longitude})</span>
          </div>
        )}
      </div>

      {geoMsg && (
        <div style={{ fontSize: "11px", color: geoMsg.includes("✓") ? "#A8E063" : "#FF5C5C" }}>
          {geoMsg}
        </div>
      )}

      {/* Map Canvas */}
      <div style={{
        height: "320px",
        width: "100%",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        position: "relative"
      }}>
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onSelect={onChange} />
          <Recenter position={hasSelected ? position : null} />

          {hasSelected && (
            <Marker position={position} icon={createPinIcon("#FFD21F", 34, true)}>
              <Popup>
                <div style={{ color: "#F5F5F2", background: "#17191C", padding: "8px 10px", fontSize: "12px", fontWeight: 700, borderRadius: "6px" }}>
                  <div style={{ color: "#FFD21F", marginBottom: "3px" }}>📍 Selected Challenge Location</div>
                  <div style={{ fontSize: "10.5px", color: "#8F9499" }}>
                    Lat: {value.latitude}, Lng: {value.longitude}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Map overlay hint */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          background: "rgba(11, 13, 15, 0.8)",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "10px",
          color: "#8F9499",
          zIndex: 400,
          pointerEvents: "none"
        }}>
          💡 Click anywhere on map to pin problem
        </div>
      </div>

    </div>
  );
}
